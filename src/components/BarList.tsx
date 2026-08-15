/*
 * Horizontal bars for a single-series distribution.
 *
 * A single series needs no legend — the title names it — and every bar
 * carries a direct value label, so the encoding never rests on colour.
 * Rounded 4px data-ends anchored to the baseline, per the mark spec.
 */

import { pct } from "@/lib/labels";

interface Props {
  data: Array<{ key: string; label: string; value: number }>;
  /** value formatter; defaults to percentage */
  format?: (v: number) => string;
  colour?: string;
  max?: number;
  limit?: number;
  emptyMessage?: string;
}

export default function BarList({
  data,
  format = (v) => pct(v),
  colour = "var(--series-1)",
  max,
  limit = 8,
  emptyMessage = "No data.",
}: Props) {
  const rows = data.filter((d) => d.value > 0).slice(0, limit);
  if (rows.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {emptyMessage}
      </p>
    );
  }

  const ceiling = max ?? Math.max(...rows.map((r) => r.value));

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.key} className="grid items-center gap-3" style={{ gridTemplateColumns: "minmax(96px, 40%) 1fr auto" }}>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {r.label}
          </span>
          <span style={{ display: "block", height: 10, background: "var(--grid)", borderRadius: 3 }}>
            <span
              style={{
                display: "block",
                width: `${Math.max(1.5, (r.value / ceiling) * 100)}%`,
                height: "100%",
                background: colour,
                borderRadius: "3px 4px 4px 3px",
              }}
            />
          </span>
          <span className="text-xs tnum" style={{ color: "var(--text-secondary)", minWidth: 44, textAlign: "right" }}>
            {format(r.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}
