/**
 * Reddit via Apify's `harshmaur/reddit-scraper`, which reads Reddit's public
 * pages and so needs no Reddit app registration — only APIFY_TOKEN.
 *
 * Billing is $0.002 per saved result plus $0.02 per run, against a $5/month
 * free allowance — roughly 2,450 documents.
 *
 * THIS ACTOR HAS NO `maxItems`. There is no single knob that stops a run once
 * it has cost enough, so the cap has to be computed here and enforced through
 * the per-lane limits. `budget()` below is the only thing standing between a
 * typo and the month's entire allowance, which is why it is arithmetic in code
 * rather than three constants and a hopeful comment.
 *
 * A "lane" is one search term or one subreddit crawl. Each lane yields up to
 * `postsPerLane` posts, and each post drags in up to COMMENTS_PER_POST
 * comments, so total results ~= lanes x postsPerLane x (1 + COMMENTS_PER_POST).
 *
 * Comments are worth more than posts here — a "which size did you get" thread
 * is a hundred shoppers narrating the same hesitation — so the split favours
 * fewer threads read deeply over many threads read shallowly.
 */
import { runActor } from "../lib/apify.ts";
import { clean, log, sha1 } from "../lib/io.ts";
import type { Doc } from "../types.ts";
import { APIFY_SEARCHES, SUBREDDIT_URLS } from "./reddit-queries.ts";

const ACTOR = "harshmaur/reddit-scraper";

/** Target result count. ~$2 per 1,000, so 1800 is ~$3.60 of the $5. */
const TARGET_ITEMS = Number(process.env.APIFY_MAX_ITEMS ?? 1800);
const COMMENTS_PER_POST = 11;

/**
 * Fit the lanes to the budget. When the target is too small to give every lane
 * a post — which is the case for a dry run — drop lanes rather than silently
 * overshooting the spend, and report what was trimmed.
 */
function budget(): { searches: string[]; subreddits: string[]; postsPerLane: number } {
  const perPost = 1 + COMMENTS_PER_POST;
  const affordablePosts = Math.max(1, Math.floor(TARGET_ITEMS / perPost));
  const allLanes = APIFY_SEARCHES.length + SUBREDDIT_URLS.length;

  if (affordablePosts < allLanes) {
    // Subreddit crawls are the higher-yield lane, so they survive the trim.
    const lanes = Math.max(1, affordablePosts);
    const subreddits = SUBREDDIT_URLS.slice(0, lanes);
    return {
      subreddits,
      searches: APIFY_SEARCHES.slice(0, lanes - subreddits.length),
      postsPerLane: 1,
    };
  }

  return {
    searches: [...APIFY_SEARCHES],
    subreddits: [...SUBREDDIT_URLS],
    postsPerLane: Math.floor(affordablePosts / allLanes),
  };
}

/**
 * Only the fields this mapper reads; the actor returns 75 per post and 41 per
 * comment. Posts and comments do NOT share names for the same concepts — a post
 * has `postUrl`/`createdAt`/`communityName`, a comment has
 * `url`/`commentCreatedAt`/`subredditName` — so both spellings are declared and
 * the accessors below coalesce them. Reading only the post spelling would not
 * crash; it would emit comments with empty URLs and null dates, which pass
 * schema validation and surface much later as broken citations.
 */
interface RedditItem {
  dataType?: string;
  // post
  postUrl?: string;
  title?: string;
  communityName?: string;
  createdAt?: string;
  upVotes?: number;
  commentsCount?: number;
  // comment
  url?: string;
  subredditName?: string;
  commentCreatedAt?: string;
  commentUpVotes?: number;
  // both
  body?: string;
  score?: number;
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
  const raw = item.communityName ?? item.subredditName ?? "";
  return raw.replace(/^\/?r\//, "");
}

const urlOf = (item: RedditItem) => item.postUrl ?? item.url ?? "";
const createdAtOf = (item: RedditItem) => item.createdAt ?? item.commentCreatedAt;
const scoreOf = (item: RedditItem) => Number(item.upVotes ?? item.commentUpVotes ?? item.score ?? 0);

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
      url: urlOf(item),
      date: isoOrNull(createdAtOf(item)),
      rating: null,
      text,
      meta: {
        kind: isPost ? "post" : "comment",
        subreddit: subredditOf(item),
        score: scoreOf(item),
        ...(isPost ? { numComments: Number(item.commentsCount ?? 0) } : {}),
      },
    });

    if (isPost) posts++;
    else comments++;
  }

  log("reddit", `apify: ${posts} posts + ${comments} comments kept of ${items.length} items`);
  return [...docs.values()];
}

export async function fetchRedditViaApify(): Promise<Doc[]> {
  const { searches, subreddits, postsPerLane } = budget();
  const lanes = searches.length + subreddits.length;
  const ceiling = lanes * postsPerLane * (1 + COMMENTS_PER_POST);

  log(
    "reddit",
    `budget: ${lanes} lanes x ${postsPerLane} posts x ${1 + COMMENTS_PER_POST} ` +
      `≈ ${ceiling} results (~$${((ceiling * 0.002 + 0.02) as number).toFixed(2)})`,
  );

  const items = await runActor<RedditItem>("reddit", ACTOR, {
    searchTerms: searches,
    subredditUrls: subreddits,
    searchPosts: true,
    searchComments: false, // comments arrive attached to their posts
    searchCommunities: false,
    // Defaults to FALSE on this actor — without it the run returns posts only
    // and loses the comment threads that carry the deliberation.
    crawlCommentsPerPost: true,
    includeNSFW: false,
    searchSort: "relevance",
    searchTime: "all",
    maxPostsCount: postsPerLane,
    maxCommentsPerPost: COMMENTS_PER_POST,
    // Backstop: a global comment ceiling in case per-post limits are exceeded.
    maxCommentsCount: ceiling,
    // Costs extra per result for sentiment/intent scoring we already do better
    // through our own taxonomy and prompts.
    aiAnalysis: false,
    proxy: { useApifyProxy: true },
  });

  return docsFromItems(items);
}
