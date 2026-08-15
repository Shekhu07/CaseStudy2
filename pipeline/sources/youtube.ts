/**
 * YouTube comments via Data API v3. Free quota is 10,000 units/day.
 *   search.list        = 100 units  (expensive — kept to a fixed query list)
 *   commentThreads.list =  1 unit   (cheap — paginated freely)
 *
 * Haul and "is it worth it" videos are where people narrate the exact
 * deliberation that precedes — or replaces — a purchase.
 *
 * Missing YOUTUBE_API_KEY degrades to an empty source.
 */
import { clean, log, sha1, sleep } from "../lib/io.ts";
import type { Doc } from "../types.ts";

/*
 * Queries are chosen for the COMMENT sections they attract, not the videos.
 * Haul, "worth it", and disappointment videos draw viewers narrating their own
 * deliberation — "I've had this saved for weeks but…" — which is exactly the
 * pre-purchase reasoning that app-store reviews almost never contain.
 */
const SEARCH_QUERIES = [
  // hauls and try-ons: the comment threads fill with sizing negotiation
  "myntra haul honest review",
  "myntra try on haul size guide",
  "myntra kurta haul size fit",
  "myntra big fashion festival haul",
  "myntra western wear try on haul",
  // explicit deliberation
  "myntra quality worth it or not",
  "is myntra worth buying honest opinion",
  "myntra vs ajio vs nykaa which is better",
  "should i buy from myntra",
  // failure and regret, where the information gap gets named
  "myntra disappointing haul fail",
  "online shopping fashion india regret expectation vs reality",
  "myntra return exchange experience",
  "myntra fake product quality issue",
  // the workaround content itself — proof of the unmet need
  "how to choose correct size online shopping clothes",
  "how to shop online clothes without trying",
  "online shopping tips india clothes size",
  "myntra wishlist tips tricks",
  "how to check fabric quality online shopping",
];

const VIDEOS_PER_QUERY = 10;
const COMMENT_PAGES_PER_VIDEO = 4; // 100 comments per page

async function yt<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const key = process.env.YOUTUBE_API_KEY!;
  const qs = new URLSearchParams({ ...params, key }).toString();
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${qs}`);
  if (!res.ok) {
    log("youtube", `${path} failed: ${res.status} ${(await res.text()).slice(0, 160)}`);
    return null;
  }
  return (await res.json()) as T;
}

interface SearchRes {
  items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string } }>;
}
interface ThreadsRes {
  nextPageToken?: string;
  items?: Array<{
    snippet?: {
      topLevelComment?: {
        snippet?: {
          textOriginal?: string;
          publishedAt?: string;
          likeCount?: number;
          authorDisplayName?: string;
        };
      };
    };
  }>;
}

export async function fetchYouTube(): Promise<Doc[]> {
  if (!process.env.YOUTUBE_API_KEY) {
    log("youtube", "SKIPPED — set YOUTUBE_API_KEY to enable");
    return [];
  }

  const docs = new Map<string, Doc>();
  const videos = new Map<string, string>(); // videoId -> title

  for (const q of SEARCH_QUERIES) {
    const res = await yt<SearchRes>("search", {
      part: "snippet",
      q,
      type: "video",
      relevanceLanguage: "en",
      regionCode: "IN",
      maxResults: String(VIDEOS_PER_QUERY),
    });
    for (const item of res?.items ?? []) {
      const id = item.id?.videoId;
      if (id) videos.set(id, item.snippet?.title ?? "");
    }
    await sleep(300);
  }

  log("youtube", `${videos.size} videos found; fetching comments`);

  for (const [videoId, title] of videos) {
    let pageToken: string | undefined;

    for (let page = 0; page < COMMENT_PAGES_PER_VIDEO; page++) {
      const res = await yt<ThreadsRes>("commentThreads", {
        part: "snippet",
        videoId,
        maxResults: "100",
        order: "relevance",
        textFormat: "plainText",
        ...(pageToken ? { pageToken } : {}),
      });
      // Comments disabled, or quota exhausted — move on.
      if (!res) break;

      for (const item of res.items ?? []) {
        const s = item.snippet?.topLevelComment?.snippet;
        const text = clean(s?.textOriginal ?? "");
        if (text.length < 25) continue;

        const id = `youtube:${sha1(text)}`;
        if (docs.has(id)) continue;

        docs.set(id, {
          id,
          source: "youtube",
          url: `https://www.youtube.com/watch?v=${videoId}`,
          date: s?.publishedAt ? new Date(s.publishedAt).toISOString() : null,
          rating: null,
          text,
          meta: {
            videoId,
            videoTitle: title,
            likes: s?.likeCount ?? 0,
            author: s?.authorDisplayName ?? null,
          },
        });
      }

      pageToken = res.nextPageToken;
      if (!pageToken) break;
      await sleep(200);
    }
  }

  return [...docs.values()];
}
