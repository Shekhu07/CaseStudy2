/**
 * Reddit via the official OAuth API.
 *
 * Anonymous www.reddit.com/*.json is now blocked for non-browser clients
 * (it returns HTML), so a free "script" app is required:
 *   reddit.com/prefs/apps -> create app -> type "script"
 *   -> REDDIT_CLIENT_ID (under the app name) + REDDIT_CLIENT_SECRET
 *
 * Missing credentials degrade to an empty source rather than failing the run.
 */
import { clean, log, sha1, sleep } from "../lib/io.ts";
import type { Doc } from "../types.ts";

const UA = "node:myntra-wishlist-discovery-engine:1.0 (research)";

const SUBREDDITS = [
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

const QUERIES = [
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
const GLOBAL_QUERIES = [
  "myntra wishlist",
  "myntra saved items",
  "wishlist never buy",
  "myntra sizing inconsistent",
];

const MAX_POSTS_FOR_COMMENTS = 220;

interface Listing {
  data?: { children?: Array<{ kind: string; data: Record<string, unknown> }> };
}

async function getToken(): Promise<string | null> {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    log("reddit", `token request failed: ${res.status} ${await res.text()}`);
    return null;
  }
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

async function api<T>(token: string, path: string): Promise<T | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://oauth.reddit.com${path}`, {
      headers: { Authorization: `bearer ${token}`, "User-Agent": UA },
    });
    if (res.status === 429) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    if (!res.ok) return null;
    return (await res.json()) as T;
  }
  return null;
}

/** Walk a comment tree, collecting bodies down to `maxDepth`. */
function walkComments(
  node: unknown,
  out: Array<Record<string, unknown>>,
  depth = 0,
  maxDepth = 2,
): void {
  if (depth > maxDepth || !node || typeof node !== "object") return;
  const listing = node as Listing;
  for (const child of listing.data?.children ?? []) {
    if (child.kind !== "t1") continue;
    out.push(child.data);
    walkComments(child.data.replies, out, depth + 1, maxDepth);
  }
}

export async function fetchReddit(): Promise<Doc[]> {
  const token = await getToken();
  if (!token) {
    log("reddit", "SKIPPED — set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to enable");
    return [];
  }

  const docs = new Map<string, Doc>();
  const posts = new Map<string, { permalink: string; subreddit: string; comments: number }>();

  const searches: string[] = [
    ...SUBREDDITS.flatMap((sub) =>
      QUERIES.map(
        (q) =>
          `/r/${sub}/search?q=${encodeURIComponent(q)}&restrict_sr=1&limit=100&sort=relevance&t=all`,
      ),
    ),
    ...GLOBAL_QUERIES.map(
      (q) => `/search?q=${encodeURIComponent(q)}&limit=100&sort=relevance&t=all`,
    ),
  ];

  for (const path of searches) {
    const json = await api<Listing>(token, path);
    await sleep(1200); // stay well under 100 QPM

    for (const child of json?.data?.children ?? []) {
      if (child.kind !== "t3") continue;
      const d = child.data;
      const permalink = String(d.permalink ?? "");
      const subreddit = String(d.subreddit ?? "");
      const title = clean(String(d.title ?? ""));
      const selftext = clean(String(d.selftext ?? ""));
      const text = selftext ? `${title}. ${selftext}` : title;

      if (text.length >= 15) {
        const id = `reddit:${sha1(text)}`;
        if (!docs.has(id)) {
          docs.set(id, {
            id,
            source: "reddit",
            url: `https://www.reddit.com${permalink}`,
            date: d.created_utc ? new Date(Number(d.created_utc) * 1000).toISOString() : null,
            rating: null,
            text,
            meta: {
              kind: "post",
              subreddit,
              score: Number(d.score ?? 0),
              numComments: Number(d.num_comments ?? 0),
            },
          });
        }
      }

      const numComments = Number(d.num_comments ?? 0);
      if (numComments > 0 && permalink) {
        posts.set(String(d.id), { permalink, subreddit, comments: numComments });
      }
    }
  }

  log("reddit", `${docs.size} posts; fetching comments from ${posts.size} threads`);

  // Comment-richest threads first — that is where the deliberation lives.
  const ranked = [...posts.entries()]
    .sort((a, b) => b[1].comments - a[1].comments)
    .slice(0, MAX_POSTS_FOR_COMMENTS);

  for (const [postId, info] of ranked) {
    const json = await api<unknown[]>(token, `/comments/${postId}?limit=100&depth=2&sort=top`);
    await sleep(1200);
    if (!Array.isArray(json) || json.length < 2) continue;

    const collected: Array<Record<string, unknown>> = [];
    walkComments(json[1], collected);

    for (const c of collected) {
      const body = clean(String(c.body ?? ""));
      if (body.length < 25 || body === "[deleted]" || body === "[removed]") continue;

      const id = `reddit:${sha1(body)}`;
      if (docs.has(id)) continue;

      docs.set(id, {
        id,
        source: "reddit",
        url: `https://www.reddit.com${info.permalink}`,
        date: c.created_utc ? new Date(Number(c.created_utc) * 1000).toISOString() : null,
        rating: null,
        text: body,
        meta: {
          kind: "comment",
          subreddit: info.subreddit,
          score: Number(c.score ?? 0),
        },
      });
    }
  }

  return [...docs.values()];
}
