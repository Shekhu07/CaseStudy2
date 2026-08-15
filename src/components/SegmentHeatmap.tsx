"use client";

import { useState } from "react";
import type { ThemeScore } from "@/lib/labels";
import { SEGMENT_LABELS, label } from "@/lib/labels";

/*
 * Segment x theme LIFT.
 *
 * Lift, not raw share: a segment that is 40% of the corpus will be 40% of
 * every theme, which tells you nothing. Lift divides the segment's share
 * within a theme by its share of the whole relevant corpus, so 1.0 means
 * "exactly as expected" and 1.6 means "this friction is 60% over-indexed
 * for this segment".
 *
 * Because 1.0 is a true neutral point, the encoding is DIVERGING (two hues
 * about a gray midpoint), not sequential. Every cell is also numerically
 * labelled, so colour is never the only channel.
 */

interface Props {
  themes: ThemeScore[];
  segmentThemeLift: Record<string, Record<string, number>>;
  onSelect: (id: string) => void;
}

function cellColour(lift: number): { bg: string; fg: string } {
  if (lift === 0) return { bg: "transparent", fg: "var(--text-muted)" };
  const d = lift - 1;
  // Saturate at +/-0.75 so a couple of extreme cells don't flatten the rest.
  const mag = Math.min(1, Math.abs(d) / 0.75);
  const strong = mag > 0.55;
  return {
    bg: d >= 0
      ? `color-mix(in oklab, var(--div-pos) ${mag * 78}%, var(--div-mid))`
      : `color-mix(in oklab, var(--div-neg) ${mag * 78}%, var(--div-mid))`,
    fg: strong ? "#ffffff" : "var(--text-primary)",
  };
}

export default function SegmentHeatmap({ themes, segmentThemeLift, onSelect }: Props) {
  const [hover, setHover] = useState<{ seg: string; theme: string } | null>(null);

  // Only segments with real presence; ordered by how sharply they differentiate.
  const segments = Object.keys(segmentThemeLift)
    .filter((s) => themes.some((t) => (t.segments[s]?.count ?? 0) >= 4))
    .sort((a, b) => {
      const spread = (s: string) => {
        const vals = themes.map((t) => segmentThemeLift[s][t.id] ?? 0).filter((v) => v > 0);
        return vals.length ? Math.max(...vals) - Math.min(...vals) : 0;
      };
      return spread(b) - spread(a);
    });

  const shown = themes.slice(0, 12);

  return (
    <div>
      <div className="scroll-x">
        <table className="text-sm" style={{ borderCollapse: "separate", borderSpacing: 2, minWidth: 700 }}>
          <caption className="sr-only">
            Lift of each shopper segment within each friction theme. 1.00 means the segment appears
            exactly as often as its corpus-wide share predicts.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="px-2 py-1 text-left" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                Friction theme
              </th>
              {segments.map((s) => (
                <th
                  key={s}
                  scope="col"
                  className="px-1 py-1"
                  style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, width: 78, verticalAlign: "bottom" }}
                >
                  {label(SEGMENT_LABELS, s)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((t) => (
              <tr key={t.id}>
                <th
                  scope="row"
                  className="px-2 py-1 text-left font-normal"
                  style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 230, cursor: "pointer" }}
                  onClick={() => onSelect(t.id)}
                >
                  {t.name}
                </th>
                {segments.map((s) => {
                  const lift = segmentThemeLift[s]?.[t.id] ?? 0;
                  const n = t.segments[s]?.count ?? 0;
                  const { bg, fg } = cellColour(lift);
                  const isHover = hover?.seg === s && hover?.theme === t.id;
                  return (
                    <td
                      key={s}
                      onMouseEnter={() => setHover({ seg: s, theme: t.id })}
                      onMouseLeave={() => setHover(null)}
                      title={`${label(SEGMENT_LABELS, s)} × ${t.name}: lift ${lift.toFixed(2)} (${n} documents)`}
                      className="tnum"
                      style={{
                        background: bg,
                        color: fg,
                        textAlign: "center",
                        fontSize: 12,
                        padding: "6px 4px",
                        borderRadius: 4,
                        outline: isHover ? "2px solid var(--text-primary)" : "none",
                      }}
                    >
                      {lift > 0 ? lift.toFixed(2) : "–"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
        <span className="flex items-center gap-1">
          <span style={{ color: "var(--text-muted)" }}>under-indexed</span>
          {[-0.75, -0.375, 0, 0.375, 0.75].map((d) => (
            <span
              key={d}
              style={{ background: cellColour(1 + d).bg, width: 22, height: 10, borderRadius: 2, display: "inline-block" }}
            />
          ))}
          <span style={{ color: "var(--text-muted)" }}>over-indexed</span>
        </span>
        <span style={{ color: "var(--text-muted)" }}>1.00 = exactly the segment&rsquo;s corpus-wide share</span>
      </div>
    </div>
  );
}
