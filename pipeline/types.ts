import { z } from "zod";

/* ------------------------------------------------------------------ *
 * Stage 0 — normalised corpus
 * ------------------------------------------------------------------ */

export const SOURCES = [
  "apple", // Myntra iOS App Store reviews
  "play", // Myntra Google Play reviews
  "reddit", // posts + comment trees across Indian fashion/shopping subreddits
  "youtube", // comments on haul / "is it worth it" videos
  "sitejabber", // long-form written reviews of myntra.com
  "competitor", // AJIO + Nykaa Fashion store reviews — where comparison talk lives
] as const;
export type Source = (typeof SOURCES)[number];

export const DocumentSchema = z.object({
  id: z.string(), // stable: `${source}:${contentHash}`
  source: z.enum(SOURCES),
  url: z.string(),
  date: z.string().nullable(), // ISO 8601
  rating: z.number().min(1).max(5).nullable(),
  text: z.string(),
  meta: z.record(z.string(), z.unknown()).default({}),
});
export type Doc = z.infer<typeof DocumentSchema>;

/* ------------------------------------------------------------------ *
 * Stage 1 — relevance filter
 * ------------------------------------------------------------------ */

export const RelevanceSchema = z.object({
  id: z.string(),
  relevant: z.boolean(),
  relevance: z.number().min(0).max(1),
  reason: z.string(),
});
export type Relevance = z.infer<typeof RelevanceSchema>;

/* ------------------------------------------------------------------ *
 * Stage 2 — induced friction taxonomy
 *
 * Deliberately NOT hardcoded. Stage 2 induces these from the corpus;
 * this schema only constrains their shape.
 * ------------------------------------------------------------------ */

export const FrictionThemeSchema = z.object({
  id: z.string(), // kebab-case slug
  name: z.string(),
  definition: z.string(),
  includes: z.array(z.string()),
  excludes: z.array(z.string()),
});
export type FrictionTheme = z.infer<typeof FrictionThemeSchema>;

export const TaxonomySchema = z.object({
  generatedAt: z.string(),
  model: z.string(),
  sampleSize: z.number(),
  themes: z.array(FrictionThemeSchema),
});
export type Taxonomy = z.infer<typeof TaxonomySchema>;

/* ------------------------------------------------------------------ *
 * Stage 3 — per-document tagging
 * ------------------------------------------------------------------ */

export const JOURNEY_STAGES = [
  "discover",
  "shortlist",
  "evaluate",
  "checkout",
  "post_purchase",
] as const;

export const INTENT_TYPES = [
  "genuine_intent", // saved because they mean to buy
  "bookmark", // saved as inspiration / later / aspirational
  "price_watch", // saved explicitly waiting on price
  "unclear",
] as const;

export const INFORMATION_NEEDS = [
  "fit_and_size",
  "fabric_and_quality",
  "true_colour_and_appearance",
  "real_body_photos",
  "price_trajectory",
  "occasion_appropriateness",
  "social_validation",
  "return_and_exchange_certainty",
  "seller_or_brand_trust",
  "styling_and_pairing",
  "delivery_timing",
  "none",
] as const;

export const EXTERNAL_BEHAVIOURS = [
  "searched_web",
  "watched_video_review",
  "asked_friends_or_family",
  "checked_other_app",
  "visited_offline_store",
  "checked_brand_site",
  "none",
] as const;

export const SEGMENT_SIGNALS = [
  "price_sensitive",
  "fit_uncertainty_prone",
  "occasion_buyer",
  "brand_loyal",
  "bulk_orderer_returner", // orders many sizes intending to return
  "premium_buyer",
  "new_or_low_trust_user",
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];
export type IntentType = (typeof INTENT_TYPES)[number];
export type InformationNeed = (typeof INFORMATION_NEEDS)[number];
export type ExternalBehaviour = (typeof EXTERNAL_BEHAVIOURS)[number];
export type SegmentSignal = (typeof SEGMENT_SIGNALS)[number];

export const TagSchema = z.object({
  id: z.string(),
  themes: z.array(z.string()), // FrictionTheme ids
  severity: z.number().min(1).max(5),
  journey_stage: z.enum(JOURNEY_STAGES),
  intent_type: z.enum(INTENT_TYPES),
  information_needs: z.array(z.enum(INFORMATION_NEEDS)),
  external_behaviour: z.array(z.enum(EXTERNAL_BEHAVIOURS)),
  workaround: z.string(),
  segment_signals: z.array(z.enum(SEGMENT_SIGNALS)),
  evidence_quote: z.string(),
  confidence: z.number().min(0).max(1),
});
export type Tag = z.infer<typeof TagSchema>;

/* ------------------------------------------------------------------ *
 * Stage 4 — opportunity scoring
 * ------------------------------------------------------------------ */

/**
 * Judged once per theme by the model, with a written rationale, so the
 * ranking is arguable rather than a black box.
 */
export const ThemeJudgementSchema = z.object({
  id: z.string(),
  metric_proximity: z.number().min(0).max(1),
  metric_proximity_rationale: z.string(),
  tractability: z.number().min(0).max(1),
  tractability_rationale: z.string(),
});
export type ThemeJudgement = z.infer<typeof ThemeJudgementSchema>;

export interface ThemeScore {
  id: string;
  name: string;
  definition: string;
  /** documents carrying this theme */
  count: number;
  /** count / relevantTotal */
  reach: number;
  /** Wilson 95% interval on reach */
  reachCI: [number, number];
  /** mean severity, 1-5 */
  severityMean: number;
  /** (severityMean - 1) / 4 */
  severityNorm: number;
  metricProximity: number;
  metricProximityRationale: string;
  tractability: number;
  tractabilityRationale: string;
  /** sqrt(reach) * severityNorm * metricProximity * tractability */
  opportunityScore: number;
  /** share of this theme's docs, by facet */
  journeyStages: Record<string, number>;
  intentTypes: Record<string, number>;
  informationNeeds: Record<string, number>;
  externalBehaviours: Record<string, number>;
  /** segment id -> { share, lift, count } */
  segments: Record<string, { share: number; lift: number; count: number }>;
  /** representative verbatims */
  quotes: Array<{
    text: string;
    source: Source;
    url: string;
    date: string | null;
    rating: number | null;
    severity: number;
  }>;
  workarounds: string[];
  /** ISO month -> share of that month's relevant docs */
  trend: Array<{ month: string; share: number; n: number }>;
}

export interface Analysis {
  generatedAt: string;
  models: string[];
  formula: string;
  corpus: {
    raw: number;
    afterDedupe: number;
    relevant: number;
    tagged: number;
    bySource: Record<string, { raw: number; relevant: number }>;
    dateRange: { from: string | null; to: string | null };
  };
  themes: ThemeScore[];
  /** corpus-wide facet distributions, over relevant docs */
  overall: {
    journeyStages: Record<string, number>;
    intentTypes: Record<string, number>;
    informationNeeds: Record<string, number>;
    externalBehaviours: Record<string, number>;
    segments: Record<string, number>;
    severityHistogram: Record<string, number>;
  };
  /** segment id -> theme id -> lift */
  segmentThemeLift: Record<string, Record<string, number>>;
}
