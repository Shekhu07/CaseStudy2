/**
 * Client-safe presentation helpers.
 *
 * Kept separate from `data.ts` on purpose: `data.ts` reads the analysis
 * artifact off disk, so importing it from a client component would drag
 * `node:fs` into the browser bundle.
 */

export type { Analysis, ThemeScore, Taxonomy } from "@/../pipeline/types";

export const SOURCE_LABELS: Record<string, string> = {
  apple: "App Store",
  play: "Google Play",
  reddit: "Reddit",
  youtube: "YouTube",
  sitejabber: "Sitejabber",
  competitor: "Competitor apps",
};

export const SEGMENT_LABELS: Record<string, string> = {
  price_sensitive: "Price sensitive",
  fit_uncertainty_prone: "Fit-uncertain",
  occasion_buyer: "Occasion buyer",
  brand_loyal: "Brand loyal",
  bulk_orderer_returner: "Bulk-order & return",
  premium_buyer: "Premium buyer",
  new_or_low_trust_user: "New / low-trust",
};

export const STAGE_LABELS: Record<string, string> = {
  discover: "Discover",
  shortlist: "Shortlist",
  evaluate: "Evaluate",
  checkout: "Checkout",
  post_purchase: "Post-purchase",
};

export const INTENT_LABELS: Record<string, string> = {
  genuine_intent: "Genuine purchase intent",
  bookmark: "Bookmark / inspiration",
  price_watch: "Price watch",
  unclear: "Unclear",
};

export const NEED_LABELS: Record<string, string> = {
  fit_and_size: "Fit & size",
  fabric_and_quality: "Fabric & quality",
  true_colour_and_appearance: "True colour & appearance",
  real_body_photos: "Real-body photos",
  price_trajectory: "Price trajectory",
  occasion_appropriateness: "Occasion fit",
  social_validation: "Social validation",
  return_and_exchange_certainty: "Return certainty",
  seller_or_brand_trust: "Brand trust",
  styling_and_pairing: "Styling & pairing",
  delivery_timing: "Delivery timing",
};

export const BEHAVIOUR_LABELS: Record<string, string> = {
  searched_web: "Searched the web",
  watched_video_review: "Watched a video review",
  asked_friends_or_family: "Asked friends or family",
  checked_other_app: "Checked another app",
  visited_offline_store: "Visited an offline store",
  checked_brand_site: "Checked the brand's site",
};

export const label = (dict: Record<string, string>, key: string) =>
  dict[key] ?? key.replace(/_/g, " ");

export const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
