"use client";

import { useState } from "react";
import OpportunityMatrix from "./OpportunityMatrix";
import ThemeTable from "./ThemeTable";
import ThemeDetail from "./ThemeDetail";
import SegmentHeatmap from "./SegmentHeatmap";
import Section from "./Section";
import type { Analysis } from "@/lib/labels";

/**
 * Holds the one piece of shared interactive state — which theme is selected —
 * so the matrix, the ranked table and the evidence panel stay in sync.
 */
type Cohort = "all" | "myntra";

export default function Dashboard({ analysis }: { analysis: Analysis }) {
  const [selectedId, setSelectedId] = useState<string | null>(analysis.themes[0]?.id ?? null);
  /**
   * 23% of the corpus is AJIO/Nykaa, and they carry return-exchange friction at
   * roughly four times the Myntra rate — enough to swap ranks 2 and 3. Which
   * problem looks second-biggest should be a visible choice, not a silent one.
   */
  const [cohort, setCohort] = useState<Cohort>("all");

  const themes =
    cohort === "myntra" ? (analysis.themesExCompetitor ?? analysis.themes) : analysis.themes;

  // The same 12 theme ids exist in both cohorts, so a selection survives the switch.
  const selected = themes.find((t) => t.id === selectedId) ?? null;

  const select = (id: string) => setSelectedId((cur) => (cur === id ? cur : id));

  const top = themes[0];
  const n = cohort === "myntra" ? analysis.corpus.taggedExCompetitor : analysis.corpus.tagged;

  return (
    <>
      <Section
        id="opportunities"
        title={
          top
            ? `"${top.name}" is the highest-potential opportunity, on reach, severity and solvability without discounts`
            : "Opportunity areas, ranked"
        }
        lede="Frequency alone ranks the loudest complaint, not the most valuable one. Each friction is scored on four axes and combined, so themes can be compared rather than merely counted. Click any theme for its evidence."
      >
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg p-1" style={{ background: "var(--grid)" }}>
            {(
              [
                ["all", `All sources (${analysis.corpus.tagged.toLocaleString()})`],
                [
                  "myntra",
                  `Myntra only (${(analysis.corpus.taggedExCompetitor ?? 0).toLocaleString()})`,
                ],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCohort(key)}
                className="rounded-md px-3 py-1.5 text-sm font-medium"
                style={{
                  background: cohort === key ? "var(--series-1)" : "transparent",
                  color: cohort === key ? "#ffffff" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {cohort === "all"
              ? "Includes AJIO and Nykaa reviews (23% of the corpus), ingested to capture comparison talk."
              : "AJIO and Nykaa reviews excluded. They carry return-exchange friction at ~4x the Myntra rate, which is enough to reorder the ranking."}
          </p>
        </div>

        <OpportunityMatrix themes={themes} selectedId={selectedId} onSelect={select} />

        <div className="mt-8">
          <ThemeTable themes={themes} selectedId={selectedId} onSelect={select} />
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Opportunity score = {analysis.formula}, over {n.toLocaleString()} tagged documents.
            Metric proximity and tractability are judged once per theme and reused across both
            cohorts, so only reach and severity move when you switch. Reach is compressed by a square root so a theme
            twice as common is not treated as twice as valuable. Tractability encodes the brief&rsquo;s
            constraint: a friction only solvable by cutting prices scores low no matter how loud it is.
          </p>
        </div>
      </Section>

      {selected && (
        <Section
          id="evidence"
          title={`What shoppers actually say about "${selected.name}"`}
          lede="Every quote below was verified during tagging — the pipeline discards any quote that is not a literal substring of its source document, so nothing here is paraphrased or invented."
        >
          <ThemeDetail theme={selected} />
        </Section>
      )}

      <Section
        id="segments"
        title="Different segments are blocked by different frictions — which is how you choose who to interview"
        lede="Lift divides a segment's share within a theme by its share of the whole relevant corpus. 1.00 means exactly as expected; higher means the friction is over-indexed for that segment. This is the table that tells you which segment to recruit for primary research. Always computed over all sources, so it does not follow the toggle above."
      >
        <SegmentHeatmap
          themes={analysis.themes}
          segmentThemeLift={analysis.segmentThemeLift}
          onSelect={select}
        />
      </Section>
    </>
  );
}
