/**
 * Reddit via Apify's `trudax/reddit-scraper-lite`, which reads Reddit's public
 * pages and so needs no Reddit app registration — only APIFY_TOKEN.
 *
 * Billing is per result ($3.40/1,000 against a $5/month free allowance), so
 * `maxItems` is a SPEND CAP, not a scraping preference. The arithmetic that
 * sets the caps below is deliberate:
 *
 *   16 searches x MAX_POSTS_PER_SEARCH posts x (1 + MAX_COMMENTS) ~= MAX_ITEMS
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
import { APIFY_SEARCHES } from "./reddit-queries.ts";

const ACTOR = "trudax/reddit-scraper-lite";

const MAX_ITEMS = Number(process.env.APIFY_MAX_ITEMS ?? 1200);
const MAX_POSTS_PER_SEARCH = 4;
const MAX_COMMENTS = 15;

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
 * The actor returns HTML-escaped text — `&quot;`, `&#39;`, `&#32;` — because it
 * reads rendered pages rather than the API's raw markdown. Left alone, the
 * escapes reach the model and, worse, get copied into `evidence_quote`, which
 * is supposed to be a verbatim span a human can check against the source.
 *
 * Deliberately NOT folded into `clean()` in lib/io.ts: that function's output
 * feeds the document hash, so changing it would re-key all 17,511 existing docs
 * and force the whole corpus through relevance again. No other source produces
 * entities — verified across the corpus — so the fix belongs here.
 */
const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED[name.toLowerCase()] ?? m);
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

/**
 * Reddit-specific noise the OAuth route never sees enough of to matter, but
 * which a budgeted global crawl returns in quantity: AutoModerator boilerplate
 * and comments whose whole body is a link.
 *
 * The relevance filter would reject both anyway — it is deliberately harsh —
 * but each one still costs an LLM call out of a quota that is the tighter
 * constraint of the two.
 */
const BOT_MARKERS = /\bi am a bot\b|performed automatically|^&#x200B;$/i;
const LINK_ONLY = /^https?:\/\/\S+$/;

function isNoise(body: string): boolean {
  return BOT_MARKERS.test(body) || LINK_ONLY.test(body);
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
    const body = clean(decodeEntities(item.body ?? ""));

    /*
     * Thresholds and the deleted-body check are copied from the OAuth path so
     * documents are interchangeable whichever route fetched them — and so the
     * text hash below dedupes across routes for free.
     */
    let text: string;
    if (isPost) {
      const title = clean(decodeEntities(item.title ?? ""));
      text = body ? `${title}. ${body}` : title;
      if (text.length < 15) continue;
    } else {
      if (body.length < 25 || body === "[deleted]" || body === "[removed]") continue;
      if (isNoise(body)) continue;
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
    searches: APIFY_SEARCHES,
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
    // Lowercase. The actor accepts "", relevance, hot, top, new, rising and
    // rejects the capitalised forms the store page documents.
    sort: "relevance",
    maxItems: MAX_ITEMS,
    maxPostCount: MAX_POSTS_PER_SEARCH,
    maxComments: MAX_COMMENTS,
    proxy: { useApifyProxy: true },
  });

  return docsFromItems(items);
}
