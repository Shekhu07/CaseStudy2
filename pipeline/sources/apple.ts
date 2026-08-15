/**
 * Apple App Store reviews via the public RSS customer-reviews feed.
 * No API key. Capped at ~10 pages x 50 entries per (country, sort) tuple,
 * so we widen coverage by sweeping both sorts and two storefronts.
 */
import { clean, log, sha1, sleep } from "../lib/io.ts";
import type { Doc } from "../types.ts";

export const MYNTRA_IOS = "907394059"; // Myntra - Fashion Shopping App
const COUNTRIES = ["in", "us"] as const;
const SORTS = ["mostrecent", "mosthelpful"] as const;
const MAX_PAGE = 10;

interface RssEntry {
  author?: { name?: { label?: string } };
  updated?: { label?: string };
  "im:rating"?: { label?: string };
  "im:version"?: { label?: string };
  id?: { label?: string };
  title?: { label?: string };
  content?: { label?: string };
}

/**
 * Reusable across apps so competitor storefronts share this implementation.
 * `source` and `extraMeta` let the caller label where each doc belongs.
 */
export async function fetchAppleReviews(
  appId: string,
  source: Doc["source"] = "apple",
  extraMeta: Record<string, unknown> = {},
): Promise<Doc[]> {
  const docs = new Map<string, Doc>();

  for (const country of COUNTRIES) {
    for (const sort of SORTS) {
      for (let page = 1; page <= MAX_PAGE; page++) {
        const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${appId}/sortby=${sort}/json`;
        let entries: RssEntry[] = [];
        try {
          const res = await fetch(url);
          if (!res.ok) break;
          const json = await res.json();
          const raw = json?.feed?.entry;
          if (!raw) break;
          // Single-entry feeds come back as an object, not an array.
          entries = Array.isArray(raw) ? raw : [raw];
        } catch (err) {
          log("apple", `page ${page} (${country}/${sort}) failed: ${String(err)}`);
          break;
        }

        // The first entry of page 1 is the app itself, not a review.
        for (const e of entries) {
          const title = clean(e.title?.label ?? "");
          const body = clean(e.content?.label ?? "");
          if (!body) continue;
          const text = title && !body.startsWith(title) ? `${title}. ${body}` : body;
          if (text.length < 15) continue;

          const id = `${source}:${sha1(text)}`;
          if (docs.has(id)) continue;

          const rating = Number(e["im:rating"]?.label);
          docs.set(id, {
            id,
            source,
            url: `https://apps.apple.com/${country}/app/id${appId}?see-all=reviews`,
            date: e.updated?.label ? new Date(e.updated.label).toISOString() : null,
            rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null,
            text,
            meta: {
              ...extraMeta,
              store: "apple",
              country,
              sort,
              appVersion: e["im:version"]?.label ?? null,
              author: e.author?.name?.label ?? null,
            },
          });
        }

        if (entries.length < 2) break;
        await sleep(250); // be polite to Apple's feed
      }
      log(source, `id=${appId} ${country}/${sort} → ${docs.size} unique so far`);
    }
  }

  return [...docs.values()];
}

export const fetchApple = () => fetchAppleReviews(MYNTRA_IOS, "apple", { brand: "myntra" });
