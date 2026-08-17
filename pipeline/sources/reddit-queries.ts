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
