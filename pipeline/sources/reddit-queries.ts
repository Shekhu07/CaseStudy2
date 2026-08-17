/**
 * Search targets for Reddit, shared by both fetch routes.
 *
 * These live apart from either implementation so that `reddit.ts` (which
 * dispatches) and `reddit-apify.ts` (which it dispatches to) can both read them
 * without importing each other — a cycle that resolves to undefined at module
 * init under the CJS transform tsx uses.
 */

/** Where Indian online-fashion deliberation concentrates. */
export const SUBREDDITS = [
  "IndianFashionAddicts",
  "IndianStreetwear",
  "OnlineShoppingIndia",
  "india",
  "IndiaTech",
  "TwoXIndia",
  "IndianTeenagers",
  "developersIndia",
  "bangalore",
  "mumbai",
];

/** Run per-subreddit, so bare terms are safe here. */
export const QUERIES = [
  "myntra wishlist",
  "wishlist",
  "saved items",
  "myntra size",
  "myntra fit",
  "myntra return",
  "myntra quality",
  "online shopping size problem",
  "cart abandon",
  "waiting for sale",
  "myntra vs ajio",
  "should i buy",
];

/** Reddit's global search catches conversations outside the subreddit list. */
export const GLOBAL_QUERIES = [
  "myntra wishlist",
  "myntra saved items",
  "wishlist never buy",
  "myntra sizing inconsistent",
];

/**
 * EMPTY ON PURPOSE — do not repopulate without re-reading this.
 *
 * The actor accepts subreddit URLs as a first-class input, which looked like a
 * clean replacement for search-operator hacks. A dry run showed why it is not:
 * the subreddit lane returns each community's NEWEST posts, and `searchSort`
 * governs only the keyword-search lane. The probe came back with a "Dinner date
 * outfit" photo thread and five joke replies — on-community, on-topic for
 * fashion, and containing nothing whatsoever about deciding whether to buy.
 *
 * Scaled to the full budget that lane would have spent real money filling the
 * corpus with outfit photos for the relevance filter to reject.
 *
 * Keyword search reaches these same communities anyway, because the queries are
 * Myntra-anchored and that is where Indians discuss Myntra: the earlier probe
 * returned 12 of 12 documents from r/IndianFashionAddicts without naming it.
 */
export const SUBREDDIT_URLS: string[] = [];

/**
 * Keyword search runs globally, across all of Reddit, which makes query
 * anchoring load-bearing in a way it is not for the per-subreddit OAuth route.
 *
 * A dry run proved it: "wishlist never buy" returned r/Steam threads about
 * waiting for game sales — structurally the exact behaviour we study, about
 * entirely the wrong product. 10 of the first 13 documents were about video
 * games. So every query here carries a domain anchor ("myntra", or india +
 * clothes), and the bare terms that are safe inside r/IndianFashionAddicts are
 * not reused here.
 */
/**
 * Aimed at three things the corpus is suspected — not known — to be missing.
 *
 * The induced taxonomy names no theme for occasion appropriateness or styling,
 * though the brief asks about both directly (p.4), and `INFORMATION_NEEDS` can
 * already record them. Their absence has two possible explanations: the corpus
 * never contained them, or they genuinely are not what blocks Indian shoppers.
 * Those call for opposite conclusions in the deck and the evidence to date
 * cannot separate them. The third group probes the p.3 question of when a
 * wishlist is real intent versus a bookmark.
 *
 * Run separately from APIFY_SEARCHES via APIFY_QUERY_SET=gap so the budget is
 * not spent re-fetching posts the core queries already returned.
 *
 * RESULT, 17 Aug 2026 — these queries FAILED, and the list is kept only so the
 * failure is not repeated. 523 documents at 9.2% relevance against the core
 * set's 26.1%: r/AmItheAsshole (33 docs, 0%), r/todayilearned (22, 0%),
 * r/CrusaderKings (20, 0%), r/relationship_advice, r/childfree.
 *
 * The cause is weak anchoring. Every query that worked contains "myntra"; most
 * of these do not, so "what to wear indian wedding online shopping unsure"
 * matched wedding-guest drama and general-advice threads. This is the r/Steam
 * failure from the first probe, under-corrected.
 *
 * Note what this does NOT show: occasion and styling were not tested and are
 * not disproven. The question stays open, and the tagging pass answers it
 * better and for free, via the occasion_appropriateness and styling_and_pairing
 * shares over all 3,922 relevant documents. Do not cite this run as evidence
 * that styling does not matter.
 */
export const GAP_SEARCHES = [
  // occasion appropriateness
  "myntra wedding outfit confused",
  "myntra festive outfit not sure",
  "what to wear indian wedding online shopping unsure",
  // styling and pairing
  "myntra how to style this kurta",
  "what to pair with this indian outfit online",
  "styling advice bought online india",
  // wishlist as bookmark vs intent
  "myntra wishlist forgot about it",
  "wishlist full never buy india shopping",
  "myntra saved items never ordered",
  // social validation before buying
  "should i buy this dress opinions india",
];

export const APIFY_SEARCHES = [
  "myntra wishlist",
  "myntra saved items",
  "myntra sizing inconsistent",
  "myntra size chart wrong",
  "myntra fit true to size",
  "myntra return policy hassle",
  "myntra quality worth it",
  "myntra vs ajio quality",
  "waiting for myntra sale to buy",
  "myntra haul disappointed",
  "online shopping clothes size confusion india",
];
