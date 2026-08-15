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
export default function Dashboard({ analysis }: { analysis: Analysis }) {
  const [selectedId, setSelectedId] = useState<string | null>(analysis.themes[0]?.id ?? null);
  const selected = analysis.themes.find((t) => t.id === selectedId) ?? null;

  const select = (id: string) => setSelectedId((cur) => (cur === id ? cur : id));

  const top = analysis.themes[0];

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
        <OpportunityMatrix themes={analysis.themes} selectedId={selectedId} onSelect={select} />

        <div className="mt-8">
          <ThemeTable themes={analysis.themes} selectedId={selectedId} onSelect={select} />
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Opportunity score = {analysis.formula}. Reach is compressed by a square root so a theme
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
        lede="Lift divides a segment's share within a theme by its share of the whole relevant corpus. 1.00 means exactly as expected; higher means the friction is over-indexed for that segment. This is the table that tells you which segment to recruit for primary research."
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
