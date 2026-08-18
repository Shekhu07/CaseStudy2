/**
 * Stages 4 & 5 — aggregation, opportunity scoring, segment cross-tab.
 *
 * This is the stage that turns tagging into COMPARISON, which is what the
 * brief actually asks for. Frequency alone ranks loud problems, not valuable
 * ones, so each theme is scored on four axes and combined:
 *
 *   OpportunityScore = sqrt(reach) x severityNorm x metricProximity x tractability
 *
 * - sqrt(reach) deliberately compresses frequency. A theme twice as common is
 *   not twice as valuable, and without compression reach dominates everything.
 * - severityNorm rescales mean severity from 1..5 onto 0..1.
 * - metricProximity encodes "would fixing this actually move THIS metric" —
 *   judged once per theme, with a written rationale, so it is arguable.
 * - tractability encodes the brief's hard constraint: no monetary incentives.
 *   A price-driven friction scores low here even when it is the loudest theme.
 *
 * Wilson intervals accompany every reach figure so a theme seen 4 times cannot
 * masquerade as a finding.
 */
import { join } from "node:path";
import { z } from "zod";
import { MODELS_USED, completeJson, modelNames } from "../llm/provider.ts";
import { judgementPrompt, judgementSystem } from "../prompts/index.ts";
import { OUT_DIR, log, readJson, writeJson } from "../lib/io.ts";
import {
  ThemeJudgementSchema,
  type Analysis,
  type Doc,
  type Tag,
  type Taxonomy,
  type ThemeScore,
} from "../types.ts";
import type { Corpus } from "./00-ingest.ts";

export const ANALYSIS_PATH = join(OUT_DIR, "analysis.json");
const JUDGEMENTS_PATH = join(OUT_DIR, "judgements.json");

export const FORMULA = "√reach × severityNorm × metricProximity × tractability";

const JudgementResponse = z.object({ judgements: z.array(ThemeJudgementSchema) });

/**
 * Wilson score interval — the honest confidence band for a proportion.
 * Unlike the normal approximation it stays inside [0,1] and behaves at
 * small n, which is exactly the regime that matters for rare themes.
 */
export function wilson(successes: number, n: number, z = 1.96): [number, number] {
  if (n === 0) return [0, 0];
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return [Math.max(0, centre - margin), Math.min(1, centre + margin)];
}

export function opportunityScore(
  reach: number,
  severityNorm: number,
  metricProximity: number,
  tractability: number,
): number {
  return Math.sqrt(reach) * severityNorm * metricProximity * tractability;
}

/** share of each value in a list, as value -> proportion of `total` */
function distribution(values: string[], total: number): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(counts)) out[k] = total > 0 ? v / total : 0;
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]));
}

type ThemeBase = Taxonomy["themes"][number] & {
  members: Tag[];
  count: number;
  reach: number;
  severityMean: number;
};

/** Group a cohort of tags per theme, with its reach and mean severity. */
function aggregate(cohort: Tag[], taxonomy: Taxonomy): ThemeBase[] {
  const total = cohort.length;
  const byTheme = new Map<string, Tag[]>();
  for (const t of cohort) {
    for (const id of t.themes) {
      if (!byTheme.has(id)) byTheme.set(id, []);
      byTheme.get(id)!.push(t);
    }
  }
  return (
    taxonomy.themes
      .map((theme) => {
        const members = byTheme.get(theme.id) ?? [];
        const count = members.length;
        const severityMean =
          count > 0 ? members.reduce((a, t) => a + t.severity, 0) / count : 0;
        return { ...theme, members, count, reach: total > 0 ? count / total : 0, severityMean };
      })
      // A theme with almost no evidence is noise, not a finding.
      .filter((t) => t.count >= 5)
  );
}

/**
 * Score one cohort. `judgeById` is passed in rather than derived, because
 * metric proximity and tractability are properties of the theme itself — they
 * do not change with which documents you count, and reusing them is what keeps
 * two cohorts comparable. Only reach and severity move.
 */
function scoreFrom(
  base: ThemeBase[],
  cohort: Tag[],
  judgeById: Map<string, z.infer<typeof ThemeJudgementSchema>>,
  docById: Map<string, Doc>,
): ThemeScore[] {
  const total = cohort.length;

  // corpus-wide segment baseline (denominator for lift)
  const segmentTotals: Record<string, number> = {};
  for (const t of cohort) {
    for (const s of t.segment_signals) segmentTotals[s] = (segmentTotals[s] ?? 0) + 1;
  }

  // Share of each month's documents in this cohort, for the trend line.
  const monthTotals: Record<string, number> = {};
  for (const m of cohort) {
    const date = docById.get(m.id)?.date;
    if (!date) continue;
    const mo = date.slice(0, 7);
    monthTotals[mo] = (monthTotals[mo] ?? 0) + 1;
  }

  const themes: ThemeScore[] = base.map((t) => {
    const j = judgeById.get(t.id);
    const metricProximity = j?.metric_proximity ?? 0.5;
    const tractability = j?.tractability ?? 0.5;
    const severityNorm = (t.severityMean - 1) / 4;

    // Segment lift: how over-represented a segment is inside this theme
    // relative to its share of the whole cohort.
    const segCounts: Record<string, number> = {};
    for (const m of t.members) {
      for (const s of m.segment_signals) segCounts[s] = (segCounts[s] ?? 0) + 1;
    }
    const segments: ThemeScore["segments"] = {};
    for (const [seg, c] of Object.entries(segCounts)) {
      const share = c / t.count;
      const baseline = (segmentTotals[seg] ?? 0) / total;
      segments[seg] = { count: c, share, lift: baseline > 0 ? share / baseline : 0 };
    }

    // Best evidence first: high severity, then a genuinely verified quote.
    const quotes = t.members
      .filter((m) => m.evidence_quote.length > 30)
      .sort((a, b) => b.severity - a.severity || b.confidence - a.confidence)
      .slice(0, 8)
      .map((m) => {
        const d = docById.get(m.id)!;
        return {
          text: m.evidence_quote,
          source: d.source,
          url: d.url,
          date: d.date,
          rating: d.rating,
          severity: m.severity,
        };
      });

    const monthHits: Record<string, number> = {};
    for (const m of t.members) {
      const date = docById.get(m.id)?.date;
      if (!date) continue;
      const mo = date.slice(0, 7);
      monthHits[mo] = (monthHits[mo] ?? 0) + 1;
    }
    const trend = Object.keys(monthTotals)
      .sort()
      .filter((mo) => monthTotals[mo] >= 10) // thin months are not a trend
      .map((mo) => ({
        month: mo,
        share: (monthHits[mo] ?? 0) / monthTotals[mo],
        n: monthTotals[mo],
      }));

    return {
      id: t.id,
      name: t.name,
      definition: t.definition,
      count: t.count,
      reach: t.reach,
      reachCI: wilson(t.count, total),
      severityMean: t.severityMean,
      severityNorm,
      metricProximity,
      metricProximityRationale: j?.metric_proximity_rationale ?? "",
      tractability,
      tractabilityRationale: j?.tractability_rationale ?? "",
      opportunityScore: opportunityScore(t.reach, severityNorm, metricProximity, tractability),
      journeyStages: distribution(t.members.map((m) => m.journey_stage), t.count),
      intentTypes: distribution(t.members.map((m) => m.intent_type), t.count),
      informationNeeds: distribution(t.members.flatMap((m) => m.information_needs), t.count),
      externalBehaviours: distribution(t.members.flatMap((m) => m.external_behaviour), t.count),
      segments,
      quotes,
      workarounds: [
        ...new Set(t.members.map((m) => m.workaround).filter((w) => w.length > 15)),
      ].slice(0, 8),
      trend,
    };
  });

  themes.sort((a, b) => b.opportunityScore - a.opportunityScore);
  return themes;
}

export async function runScoring(
  corpus: Corpus,
  relevantIds: Set<string>,
  taxonomy: Taxonomy,
  tags: Tag[],
): Promise<Analysis> {
  const docById = new Map(corpus.docs.map((d) => [d.id, d]));
  const tagged = tags.filter((t) => relevantIds.has(t.id));
  const total = tagged.length;
  if (total === 0) throw new Error("no tagged relevant documents to score");

  /* ------------------------- per-theme aggregation ---------------------- */

  const base = aggregate(tagged, taxonomy);
  log("score", `${base.length}/${taxonomy.themes.length} themes cleared the n>=5 floor`);

  /* --------------------- LLM judgement of the two axes ------------------ */

  let judgements = readJson<z.infer<typeof ThemeJudgementSchema>[]>(JUDGEMENTS_PATH);
  const haveAll =
    judgements && base.every((t) => judgements!.some((j) => j.id === t.id));

  if (!haveAll) {
    log("score", "judging metric proximity and tractability");
    const res = await completeJson(
      {
        system: judgementSystem(),
        prompt: judgementPrompt(base),
        temperature: 0.1,
      },
      JudgementResponse,
    );
    judgements = res.judgements;
    writeJson(JUDGEMENTS_PATH, judgements);
  }

  const judgeById = new Map(judgements!.map((j) => [j.id, j]));

  /* ---------------------------- theme scores ---------------------------- */

  const themes = scoreFrom(base, tagged, judgeById, docById);

  /*
   * The same themes, re-scored with AJIO and Nykaa reviews excluded. 23% of the
   * relevant corpus is competitor reviews, and they carry return-exchange
   * friction at roughly four times the Myntra rate — enough to swap ranks 2 and
   * 3. Reporting both makes the mix visible instead of letting one choice of
   * denominator silently decide which problem looks second-biggest.
   */
  const exCompetitor = tagged.filter((t) => docById.get(t.id)?.source !== "competitor");
  const themesExCompetitor = scoreFrom(
    aggregate(exCompetitor, taxonomy),
    exCompetitor,
    judgeById,
    docById,
  );

  // Segment baseline over the full cohort, for the corpus-level lift table.
  const segmentTotals: Record<string, number> = {};
  for (const t of tagged) {
    for (const s of t.segment_signals) segmentTotals[s] = (segmentTotals[s] ?? 0) + 1;
  }

  /* ------------------------------- overall ------------------------------ */

  const severityHistogram: Record<string, number> = {};
  for (const t of tagged) {
    const k = String(Math.round(t.severity));
    severityHistogram[k] = (severityHistogram[k] ?? 0) + 1;
  }

  const bySource: Analysis["corpus"]["bySource"] = {};
  for (const [source, raw] of Object.entries(corpus.bySource)) {
    bySource[source] = {
      raw,
      relevant: corpus.docs.filter((d) => d.source === source && relevantIds.has(d.id)).length,
    };
  }

  const segmentThemeLift: Record<string, Record<string, number>> = {};
  for (const seg of Object.keys(segmentTotals)) {
    segmentThemeLift[seg] = {};
    for (const t of themes) segmentThemeLift[seg][t.id] = t.segments[seg]?.lift ?? 0;
  }

  const analysis: Analysis = {
    generatedAt: new Date().toISOString(),
    models: MODELS_USED.size > 0 ? [...MODELS_USED] : Object.values(modelNames()),
    formula: FORMULA,
    corpus: {
      raw: corpus.raw,
      afterDedupe: corpus.afterDedupe,
      relevant: relevantIds.size,
      tagged: total,
      taggedExCompetitor: exCompetitor.length,
      bySource,
      dateRange: corpus.dateRange,
    },
    themes,
    themesExCompetitor,
    overall: {
      journeyStages: distribution(tagged.map((t) => t.journey_stage), total),
      intentTypes: distribution(tagged.map((t) => t.intent_type), total),
      informationNeeds: distribution(tagged.flatMap((t) => t.information_needs), total),
      externalBehaviours: distribution(tagged.flatMap((t) => t.external_behaviour), total),
      segments: distribution(tagged.flatMap((t) => t.segment_signals), total),
      severityHistogram,
    },
    segmentThemeLift,
  };

  writeJson(ANALYSIS_PATH, analysis);
  log("score", `ranked ${themes.length} themes → data/out/analysis.json`);
  themes.slice(0, 5).forEach((t, i) =>
    log("score", `  ${i + 1}. ${t.name} — score ${t.opportunityScore.toFixed(3)} (reach ${(t.reach * 100).toFixed(1)}%)`),
  );
  log("score", `Myntra-only (n=${exCompetitor.length}, competitor reviews excluded):`);
  themesExCompetitor.slice(0, 5).forEach((t, i) =>
    log("score", `  ${i + 1}. ${t.name} — score ${t.opportunityScore.toFixed(3)} (reach ${(t.reach * 100).toFixed(1)}%)`),
  );

  return analysis;
}
