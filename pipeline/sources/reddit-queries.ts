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
 * The Apify route searches globally in one billed pass, which makes query
 * anchoring load-bearing in a way it is not for the per-subreddit OAuth route.
 *
 * A dry run proved it: "wishlist never buy" returned r/Steam threads about
 * waiting for game sales — structurally the exact behaviour we study, about
 * entirely the wrong product. So every query here carries a domain anchor
 * ("myntra", or india + clothes), and the bare terms that are safe inside
 * r/IndianFashionAddicts are not reused.
 *
 * ORDER MATTERS. maxItems truncates a run in sequence, so the community-scoped
 * searches come first: if the budget runs out, it should run out on the
 * long-tail global queries, not on the threads most likely to be on-topic.
 */
export const APIFY_SEARCHES = [
  "subreddit:IndianFashionAddicts myntra",
  "subreddit:IndianFashionAddicts sizing",
  "subreddit:IndianFashionAddicts wishlist",
  "subreddit:OnlineShoppingIndia myntra",
  "subreddit:IndianStreetwear myntra sizing",
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
