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
