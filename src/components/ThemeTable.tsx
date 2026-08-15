"use client";

import type { ThemeScore } from "@/lib/labels";
import { pct } from "@/lib/labels";

/*
 * The ranked table doubles as the accessible table view for the matrix
 * (required: two light-mode palette slots sit below 3:1 contrast), and as
 * the place the score is shown decomposed. A ranking whose inputs are
 * visible is one a reader can argue with; a bare score is a black box.
 */

interface Props {
  themes: ThemeScore[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Inline proportion bar — a magnitude read at a glance beside its number. */
function Bar({ value, max = 1, colour }: { value: number; max?: number; colour: string }) {
  return (
    <span
      style={{ display: "inline-block", width: 46, height: 6, background: "var(--grid)", borderRadius: 3, verticalAlign: "middle" }}
      aria-hidden
    >
      <span
        style={{
          display: "block",
          width: `${Math.min(100, (value / max) * 100)}%`,
          height: "100%",
          background: colour,
          borderRadius: 3,
        }}
      />
    </span>
  );
}

export default function ThemeTable({ themes, selectedId, onSelect }: Props) {
  const maxScore = Math.max(...themes.map((t) => t.opportunityScore));

  return (
    <div className="scroll-x">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: 860 }}>
        <caption className="sr-only">
          Friction themes ranked by opportunity score, with the reach, severity, metric proximity
          and tractability inputs that produce it
        </caption>
        <thead>
          <tr style={{ borderBottom: `1px solid ${"var(--axis)"}` }}>
            {[
              ["#", "left"],
              ["Friction theme", "left"],
              ["Opportunity", "left"],
              ["Reach", "right"],
              ["95% CI", "right"],
              ["Severity", "right"],
              ["Metric prox.", "right"],
              ["Tractability", "right"],
            ].map(([h, align]) => (
              <th
                key={h}
                scope="col"
                className="px-3 py-2 font-medium"
                style={{ textAlign: align as "left" | "right", color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {themes.map((t, i) => {
            const selected = t.id === selectedId;
            return (
              <tr
                key={t.id}
                onClick={() => onSelect(t.id)}
                tabIndex={0}
                aria-selected={selected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(t.id);
                  }
                }}
                style={{
                  borderBottom: `1px solid var(--grid)`,
                  cursor: "pointer",
                  background: selected ? "var(--grid)" : undefined,
                }}
              >
                <td className="px-3 py-2 tnum" style={{ color: "var(--text-muted)" }}>
                  {i + 1}
                </td>
                <td className="px-3 py-2" style={{ color: "var(--text-primary)", maxWidth: 280 }}>
                  {t.name}
                </td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    <Bar value={t.opportunityScore} max={maxScore} colour="var(--series-1)" />
                    <span className="tnum" style={{ color: "var(--text-secondary)" }}>
                      {t.opportunityScore.toFixed(3)}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2 text-right tnum" style={{ color: "var(--text-secondary)" }}>
                  {pct(t.reach)}
                  <span style={{ color: "var(--text-muted)" }}> ({t.count})</span>
                </td>
                <td className="px-3 py-2 text-right tnum" style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {pct(t.reachCI[0], 1)}–{pct(t.reachCI[1], 1)}
                </td>
                <td className="px-3 py-2 text-right tnum" style={{ color: "var(--text-secondary)" }}>
                  {t.severityMean.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right tnum" style={{ color: "var(--text-secondary)" }}>
                  {t.metricProximity.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right tnum" style={{ color: "var(--text-secondary)" }}>
                  {t.tractability.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
