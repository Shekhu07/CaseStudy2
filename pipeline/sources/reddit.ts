/**
 * Reddit, by whichever route is configured.
 *
 * Two paths, because they fail in different ways and neither is strictly better:
 *
 * - APIFY_TOKEN -> `reddit-apify.ts`. Reads Reddit's public pages through a
 *   hosted scraper. No Reddit app registration, but pay-per-result, so the
 *   corpus size is capped by the credit allowance rather than by rate limits.
 * - REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET -> the OAuth implementation below.
 *   The sanctioned route and free at this volume; needs a free "script" app at
 *   reddit.com/prefs/apps. Anonymous www.reddit.com/*.json is blocked for
 *   non-browser clients (it returns HTML), so credentials are not optional.
 *
 * Apify wins when both are set: it is the route the corpus was actually built
 * with, and mixing the two in one run would double-bill for documents that
 * dedupe to the same text hash anyway.
 *
 * Neither configured degrades to an empty source rather than failing the run.
 */
import { apifyToken } from "../lib/apify.ts";
import { clean, log, sha1, sleep } from "../lib/io.ts";
import type { Doc } from "../types.ts";
import { fetchRedditViaApify } from "./reddit-apify.ts";
import { GLOBAL_QUERIES, QUERIES, SUBREDDITS } from "./reddit-queries.ts";

const UA = "node:myntra-wishlist-discovery-engine:1.0 (research)";

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
  if (apifyToken()) return fetchRedditViaApify();

  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    log("reddit", "SKIPPED — set APIFY_TOKEN, or REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET");
    return [];
  }
  return fetchRedditViaOAuth();
}

export async function fetchRedditViaOAuth(): Promise<Doc[]> {
  const token = await getToken();
  if (!token) return [];

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
