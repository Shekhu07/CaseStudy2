"use client";

import { useMemo, useState } from "react";
import type { ThemeScore } from "@/lib/labels";
import { pct } from "@/lib/labels";

/*
 * Reach x severity, with bubble area carrying metric proximity and a
 * sequential blue ramp carrying tractability.
 *
 * Colour is sequential (one hue, light->dark), not categorical: tractability
 * is a magnitude, so a categorical palette would be the wrong job entirely.
 * Bubble encodes area, not radius — radius would exaggerate the top end.
 */

const W = 760;
const H = 460;
const PAD = { top: 28, right: 32, bottom: 56, left: 64 };

const RAMP = ["var(--seq-100)", "var(--seq-250)", "var(--seq-400)", "var(--seq-550)", "var(--seq-700)"];

function tractabilityColour(t: number): string {
  return RAMP[Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))];
}

interface Props {
  themes: ThemeScore[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function OpportunityMatrix({ themes, selectedId, onSelect }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const { points, xMax } = useMemo(() => {
    const xMax = Math.max(0.12, Math.max(...themes.map((t) => t.reach)) * 1.15);
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const points = themes.map((t) => ({
      t,
      x: PAD.left + (t.reach / xMax) * plotW,
      // severity axis is fixed 1..5 so the chart is comparable across runs
      y: PAD.top + plotH - ((t.severityMean - 1) / 4) * plotH,
      // area ∝ metricProximity
      r: 7 + Math.sqrt(t.metricProximity) * 16,
    }));

    return { points, xMax };
  }, [themes]);

  // Label only the leading themes; a number on every mark is noise.
  const labelled = new Set(
    [...themes].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 5).map((t) => t.id),
  );

  const active = hover ?? selectedId;
  const activePoint = points.find((p) => p.t.id === active);

  const xTicks = Array.from({ length: 5 }, (_, i) => (xMax / 4) * i);
  const yTicks = [1, 2, 3, 4, 5];

  return (
    <div>
      <div className="scroll-x">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ minWidth: 620, display: "block" }}
          role="img"
          aria-label="Opportunity matrix: reach against severity, sized by metric proximity and shaded by tractability"
        >
          {/* gridlines — recessive hairlines */}
          {xTicks.map((v, i) => {
            const x = PAD.left + (v / xMax) * (W - PAD.left - PAD.right);
            return (
              <g key={`x${i}`}>
                <line x1={x} x2={x} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--grid)" strokeWidth={1} />
                <text x={x} y={H - PAD.bottom + 20} textAnchor="middle" fontSize={12} fill="var(--text-muted)" className="tnum">
                  {pct(v, 0)}
                </text>
              </g>
            );
          })}
          {yTicks.map((v) => {
            const y = PAD.top + (H - PAD.top - PAD.bottom) - ((v - 1) / 4) * (H - PAD.top - PAD.bottom);
            return (
              <g key={`y${v}`}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="var(--grid)" strokeWidth={1} />
                <text x={PAD.left - 12} y={y + 4} textAnchor="end" fontSize={12} fill="var(--text-muted)" className="tnum">
                  {v}
                </text>
              </g>
            );
          })}

          {/* axes */}
          <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="var(--axis)" strokeWidth={1} />
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--axis)" strokeWidth={1} />

          <text x={PAD.left + (W - PAD.left - PAD.right) / 2} y={H - 12} textAnchor="middle" fontSize={13} fill="var(--text-secondary)">
            Reach — share of relevant documents raising this friction
          </text>
          <text
            transform={`translate(16, ${PAD.top + (H - PAD.top - PAD.bottom) / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize={13}
            fill="var(--text-secondary)"
          >
            Mean severity (1–5)
          </text>

          {/* marks — larger bubbles first so small ones stay clickable */}
          {[...points]
            .sort((a, b) => b.r - a.r)
            .map(({ t, x, y, r }) => {
              const isActive = active === t.id;
              return (
                <g key={t.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={tractabilityColour(t.tractability)}
                    fillOpacity={active && !isActive ? 0.35 : 0.85}
                    stroke="var(--surface-1)"
                    strokeWidth={2}
                  />
                  {isActive && (
                    <circle cx={x} cy={y} r={r + 4} fill="none" stroke="var(--text-primary)" strokeWidth={2} />
                  )}
                  {/* hit target is deliberately larger than the mark */}
                  <circle
                    cx={x}
                    cy={y}
                    r={Math.max(r, 18)}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${t.name}: reach ${pct(t.reach)}, severity ${t.severityMean.toFixed(1)}, opportunity score ${t.opportunityScore.toFixed(3)}`}
                    onMouseEnter={() => setHover(t.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(t.id)}
                    onBlur={() => setHover(null)}
                    onClick={() => onSelect(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(t.id);
                      }
                    }}
                  />
                </g>
              );
            })}

          {/* direct labels for the leaders only */}
          {points
            .filter((p) => labelled.has(p.t.id) && p.t.id !== active)
            .map(({ t, x, y, r }) => {
              const right = x < W / 2;
              return (
                <text
                  key={`l${t.id}`}
                  x={right ? x + r + 7 : x - r - 7}
                  y={y + 4}
                  textAnchor={right ? "start" : "end"}
                  fontSize={12}
                  fill="var(--text-secondary)"
                  style={{ pointerEvents: "none" }}
                >
                  {t.name.length > 30 ? `${t.name.slice(0, 29)}…` : t.name}
                </text>
              );
            })}

          {/* tooltip */}
          {activePoint && (
            <TooltipCard
              x={activePoint.x}
              y={activePoint.y}
              r={activePoint.r}
              theme={activePoint.t}
            />
          )}
        </svg>
      </div>

      <Legend />
    </div>
  );
}

function TooltipCard({ x, y, r, theme: t }: { x: number; y: number; r: number; theme: ThemeScore }) {
  const w = 250;
  const h = 104;
  const left = x + r + 12 + w > W ? x - r - 12 - w : x + r + 12;
  const top = Math.min(Math.max(y - h / 2, PAD.top), H - PAD.bottom - h);

  const rows: Array<[string, string]> = [
    ["Reach", `${pct(t.reach)} (${t.count} docs)`],
    ["Severity", `${t.severityMean.toFixed(2)} / 5`],
    ["Metric proximity", t.metricProximity.toFixed(2)],
    ["Tractability", t.tractability.toFixed(2)],
  ];

  return (
    <g style={{ pointerEvents: "none" }}>
      <rect x={left} y={top} width={w} height={h} rx={8} fill="var(--surface-1)" stroke="var(--border)" strokeWidth={1} />
      <text x={left + 12} y={top + 20} fontSize={12} fontWeight={600} fill="var(--text-primary)">
        {t.name.length > 32 ? `${t.name.slice(0, 31)}…` : t.name}
      </text>
      {rows.map(([k, v], i) => (
        <g key={k}>
          <text x={left + 12} y={top + 40 + i * 15} fontSize={11} fill="var(--text-muted)">
            {k}
          </text>
          <text x={left + w - 12} y={top + 40 + i * 15} fontSize={11} textAnchor="end" fill="var(--text-secondary)" className="tnum">
            {v}
          </text>
        </g>
      ))}
    </g>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" style={{ color: "var(--text-secondary)" }}>
      <span className="flex items-center gap-2">
        <span>Tractability without discounts</span>
        <span className="flex items-center gap-1">
          <span style={{ color: "var(--text-muted)" }}>low</span>
          {RAMP.map((c) => (
            <span key={c} style={{ background: c, width: 18, height: 10, borderRadius: 2, display: "inline-block" }} />
          ))}
          <span style={{ color: "var(--text-muted)" }}>high</span>
        </span>
      </span>
      <span className="flex items-center gap-2">
        <span>Bubble area</span>
        <svg width={46} height={20} aria-hidden>
          <circle cx={8} cy={12} r={5} fill="var(--seq-400)" fillOpacity={0.85} />
          <circle cx={30} cy={11} r={9} fill="var(--seq-400)" fillOpacity={0.85} />
        </svg>
        <span>metric proximity</span>
      </span>
      <span style={{ color: "var(--text-muted)" }}>Click a bubble for evidence</span>
    </div>
  );
}
