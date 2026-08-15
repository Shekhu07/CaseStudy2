"use client";

import BarList from "./BarList";
import type { ThemeScore } from "@/lib/labels";
import {
  BEHAVIOUR_LABELS,
  NEED_LABELS,
  SEGMENT_LABELS,
  SOURCE_LABELS,
  STAGE_LABELS,
  formatDate,
  label,
  pct,
} from "@/lib/labels";

/*
 * Everything behind one theme's score, in one place: the definition, the
 * judgement rationales, the facet breakdowns, the segments it over-indexes
 * on, the workarounds people already use, and — the part that matters for
 * primary research — verbatim quotes that link back to their source.
 *
 * Quotes shown here were verified during tagging: the pipeline discards any
 * "quote" that is not a literal substring of the document it came from.
 */

export default function ThemeDetail({ theme: t }: { theme: ThemeScore }) {
  const scoreParts: Array<[string, string, string]> = [
    ["√reach", Math.sqrt(t.reach).toFixed(3), `reach ${pct(t.reach)} · ${t.count} documents`],
    ["severity", t.severityNorm.toFixed(3), `mean ${t.severityMean.toFixed(2)} of 5, rescaled to 0–1`],
    ["metric proximity", t.metricProximity.toFixed(2), t.metricProximityRationale],
    ["tractability", t.tractability.toFixed(2), t.tractabilityRationale],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {t.name}
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {t.definition}
        </p>
      </div>

      {/* score decomposition */}
      <div>
        <SectionLabel>
          Opportunity score {t.opportunityScore.toFixed(3)} — how it is built
        </SectionLabel>
        <dl className="mt-2 grid gap-3 sm:grid-cols-2">
          {scoreParts.map(([name, value, why]) => (
            <div key={name} className="card p-3">
              <dt className="flex items-baseline justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {name}
                </span>
                <span className="text-sm font-semibold tnum" style={{ color: "var(--text-primary)" }}>
                  {value}
                </span>
              </dt>
              <dd className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                {why}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          Reach 95% confidence interval: {pct(t.reachCI[0])} – {pct(t.reachCI[1])} (Wilson)
        </p>
      </div>

      {/* facets */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <SectionLabel>Information the shopper was missing</SectionLabel>
          <div className="mt-2">
            <BarList
              data={Object.entries(t.informationNeeds).map(([k, v]) => ({
                key: k,
                label: label(NEED_LABELS, k),
                value: v,
              }))}
              colour="var(--series-1)"
              limit={6}
              emptyMessage="No specific information gap recorded."
            />
          </div>
        </div>

        <div>
          <SectionLabel>Where they went instead</SectionLabel>
          <div className="mt-2">
            <BarList
              data={Object.entries(t.externalBehaviours).map(([k, v]) => ({
                key: k,
                label: label(BEHAVIOUR_LABELS, k),
                value: v,
              }))}
              colour="var(--series-2)"
              limit={6}
              emptyMessage="No out-of-app behaviour recorded for this theme."
            />
          </div>
        </div>

        <div>
          <SectionLabel>Journey stage</SectionLabel>
          <div className="mt-2">
            <BarList
              data={Object.entries(t.journeyStages).map(([k, v]) => ({
                key: k,
                label: label(STAGE_LABELS, k),
                value: v,
              }))}
              colour="var(--series-3)"
              limit={5}
            />
          </div>
        </div>

        <div>
          <SectionLabel>Segments this over-indexes on</SectionLabel>
          <ul className="mt-2 flex flex-col gap-2">
            {Object.entries(t.segments)
              .filter(([, s]) => s.count >= 3)
              .sort((a, b) => b[1].lift - a[1].lift)
              .slice(0, 6)
              .map(([seg, s]) => (
                <li key={seg} className="flex items-baseline justify-between text-xs">
                  <span style={{ color: "var(--text-secondary)" }}>{label(SEGMENT_LABELS, seg)}</span>
                  <span className="tnum" style={{ color: s.lift >= 1.15 ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {s.lift.toFixed(2)}× &nbsp;
                    <span style={{ color: "var(--text-muted)" }}>({s.count})</span>
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* workarounds */}
      {t.workarounds.length > 0 && (
        <div>
          <SectionLabel>What shoppers already do to cope</SectionLabel>
          <ul className="mt-2 flex flex-col gap-1.5">
            {t.workarounds.map((w, i) => (
              <li key={i} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                — {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* verbatims */}
      <div>
        <SectionLabel>Verbatim evidence</SectionLabel>
        <ul className="mt-2 flex flex-col gap-3">
          {t.quotes.map((q, i) => (
            <li key={i} className="card p-3">
              <blockquote className="text-sm" style={{ color: "var(--text-primary)" }}>
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <a href={q.url} target="_blank" rel="noopener noreferrer">
                  {label(SOURCE_LABELS, q.source)}
                </a>
                {q.rating != null && <span className="tnum">{q.rating}★</span>}
                <span>{formatDate(q.date)}</span>
                <span>severity {q.severity}/5</span>
              </div>
            </li>
          ))}
          {t.quotes.length === 0 && (
            <li className="text-sm" style={{ color: "var(--text-muted)" }}>
              No quote passed verbatim verification for this theme.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="text-xs font-semibold uppercase"
      style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}
    >
      {children}
    </h4>
  );
}
