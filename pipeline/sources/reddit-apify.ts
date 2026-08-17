/**
 * Reddit via Apify's `trudax/reddit-scraper-lite`, which reads Reddit's public
 * pages and so needs no Reddit app registration — only APIFY_TOKEN.
 *
 * Billing is per result ($3.40/1,000 against a $5/month free allowance), so
 * `maxItems` is a SPEND CAP, not a scraping preference. The arithmetic that
 * sets the caps below is deliberate:
 *
 *   14 searches x MAX_POSTS_PER_SEARCH posts x (1 + MAX_COMMENTS) ~= MAX_ITEMS
 *
 * Keeping demand near the cap matters because the cap truncates the run in
 * order: ask for far more than the budget allows and the last queries never
 * run at all, quietly narrowing the corpus to whatever the first few returned.
 *
 * Comments are worth more than posts here — a "which size did you get" thread
 * is a hundred shoppers narrating the same hesitation — so the split favours
 * fewer threads read deeply over many threads read shallowly.
 */
import { runActor } from "../lib/apify.ts";
import { clean, log, sha1 } from "../lib/io.ts";
import type { Doc } from "../types.ts";
import { GLOBAL_QUERIES } from "./reddit-queries.ts";

const ACTOR = "trudax/reddit-scraper-lite";

const MAX_ITEMS = Number(process.env.APIFY_MAX_ITEMS ?? 1200);
const MAX_POSTS_PER_SEARCH = 5;
const MAX_COMMENTS = 15;

/*
 * This is a GLOBAL search, so the query set is not the same one the OAuth path
 * uses per-subreddit. Bare terms like "wishlist" or "should i buy" are fine
 * when restricted to r/IndianFashionAddicts and pure noise across all of
 * Reddit, so they are dropped here in favour of brand- and problem-specific
 * phrasing, plus `subreddit:` operators for the two communities where Indian
 * online-fashion deliberation actually concentrates.
 */
const SEARCHES = [
  ...GLOBAL_QUERIES,
  "myntra size chart wrong",
  "myntra fit true to size",
  "myntra return policy hassle",
  "myntra quality worth it",
  "myntra vs ajio quality",
  "waiting for myntra sale to buy",
  "online shopping clothes size confusion india",
  "subreddit:IndianFashionAddicts myntra",
  "subreddit:IndianFashionAddicts sizing",
  "subreddit:OnlineShoppingIndia myntra",
];

/** Only the fields this mapper reads; the actor returns considerably more. */
interface RedditItem {
  dataType?: string;
  url?: string;
  title?: string;
  body?: string;
  communityName?: string;
  parsedCommunityName?: string;
  createdAt?: string;
  upVotes?: number;
  numberOfComments?: number;
}

/**
 * The actor returns a bare name in `parsedCommunityName` but a prefixed
 * "r/name" in `communityName`. The OAuth path yields bare names, so normalise —
 * otherwise the same subreddit splits into two buckets in the segment cross-tab.
 */
function subredditOf(item: RedditItem): string {
  const raw = item.parsedCommunityName ?? item.communityName ?? "";
  return raw.replace(/^\/?r\//, "");
}

function isoOrNull(raw: string | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Exported separately from the fetch so the mapping is testable offline. */
export function docsFromItems(items: RedditItem[]): Doc[] {
  const docs = new Map<string, Doc>();
  let posts = 0;
  let comments = 0;

  for (const item of items) {
    const isPost = item.dataType === "post";
    const body = clean(item.body ?? "");

    /*
     * Thresholds and the deleted-body check are copied from the OAuth path so
     * documents are interchangeable whichever route fetched them — and so the
     * text hash below dedupes across routes for free.
     */
    let text: string;
    if (isPost) {
      const title = clean(item.title ?? "");
      text = body ? `${title}. ${body}` : title;
      if (text.length < 15) continue;
    } else {
      if (body.length < 25 || body === "[deleted]" || body === "[removed]") continue;
      text = body;
    }

    const id = `reddit:${sha1(text)}`;
    if (docs.has(id)) continue;

    docs.set(id, {
      id,
      source: "reddit",
      url: item.url ?? "",
      date: isoOrNull(item.createdAt),
      rating: null,
      text,
      meta: {
        kind: isPost ? "post" : "comment",
        subreddit: subredditOf(item),
        score: Number(item.upVotes ?? 0),
        ...(isPost ? { numComments: Number(item.numberOfComments ?? 0) } : {}),
      },
    });

    if (isPost) posts++;
    else comments++;
  }

  log("reddit", `apify: ${posts} posts + ${comments} comments kept of ${items.length} items`);
  return [...docs.values()];
}

export async function fetchRedditViaApify(): Promise<Doc[]> {
  const items = await runActor<RedditItem>("reddit", ACTOR, {
    searches: SEARCHES,
    searchPosts: true,
    searchComments: false, // comments arrive attached to their posts
    searchCommunities: false,
    searchUsers: false,
    searchMedia: false,
    skipComments: false,
    skipUserPosts: true,
    skipCommunity: true,
    includeMediaLinks: false,
    includeNSFW: false,
    sort: "Relevance",
    maxItems: MAX_ITEMS,
    maxPostCount: MAX_POSTS_PER_SEARCH,
    maxComments: MAX_COMMENTS,
    proxy: { useApifyProxy: true },
  });

  return docsFromItems(items);
}
