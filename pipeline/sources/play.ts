/**
 * Google Play reviews via google-play-scraper. No API key.
 *
 * NEWEST is paginated deep for volume and recency; HELPFULNESS and RATING
 * are swept because Play surfaces the long, detailed, friction-heavy
 * reviews there — exactly the text this pipeline needs.
 */
import gplay from "google-play-scraper";
import { clean, log, sha1, sleep } from "../lib/io.ts";
import type { Doc } from "../types.ts";

export const MYNTRA_PLAY = "com.myntra.android";

// The package ships `sort` as a value whose members its .d.ts does not
// declare, so read them through a narrowed view rather than `any`.
const SORT = gplay.sort as unknown as { NEWEST: number; HELPFULNESS: number; RATING: number };

const SWEEPS = [
  { sort: SORT.NEWEST, pages: 20 },
  { sort: SORT.HELPFULNESS, pages: 12 },
  { sort: SORT.RATING, pages: 8 },
] as const;

const SORT_NAME: Record<number, string> = {
  [SORT.NEWEST]: "newest",
  [SORT.HELPFULNESS]: "helpfulness",
  [SORT.RATING]: "rating",
};

interface PlayReview {
  id: string;
  userName: string | null;
  date: string | null;
  score: number | null;
  url: string;
  title: string | null;
  text: string | null;
  version: string | null;
  thumbsUp: number | null;
}

/**
 * Reusable across apps so competitor storefronts share this implementation.
 * `scale` trims the sweep depth for secondary apps.
 */
export async function fetchPlayReviews(
  appId: string,
  source: Doc["source"] = "play",
  extraMeta: Record<string, unknown> = {},
  scale = 1,
): Promise<Doc[]> {
  const docs = new Map<string, Doc>();

  for (const { sort, pages: basePages } of SWEEPS) {
    const pages = Math.max(1, Math.round(basePages * scale));
    let token: string | undefined;

    for (let page = 0; page < pages; page++) {
      let batch: PlayReview[];
      let nextToken: string | undefined;

      try {
        const res = (await gplay.reviews({
          appId,
          country: "in",
          lang: "en",
          sort,
          num: 150,
          paginate: true,
          nextPaginationToken: token,
        })) as { data: PlayReview[]; nextPaginationToken?: string };
        batch = res.data ?? [];
        nextToken = res.nextPaginationToken;
      } catch (err) {
        log(source, `${appId} ${SORT_NAME[sort]} page ${page} failed: ${String(err)}`);
        break;
      }

      for (const r of batch) {
        const title = clean(r.title ?? "");
        const body = clean(r.text ?? "");
        if (!body) continue;
        const text = title && !body.startsWith(title) ? `${title}. ${body}` : body;
        if (text.length < 15) continue;

        const id = `${source}:${sha1(text)}`;
        if (docs.has(id)) continue;

        docs.set(id, {
          id,
          source,
          url: r.url,
          date: r.date ? new Date(r.date).toISOString() : null,
          rating: r.score && r.score >= 1 && r.score <= 5 ? r.score : null,
          text,
          meta: {
            ...extraMeta,
            store: "play",
            sort: SORT_NAME[sort],
            appVersion: r.version ?? null,
            thumbsUp: r.thumbsUp ?? 0,
            author: r.userName ?? null,
          },
        });
      }

      if (!nextToken || batch.length === 0) break;
      token = nextToken;
      await sleep(400);
    }

    log(source, `${appId} ${SORT_NAME[sort]} swept → ${docs.size} unique so far`);
  }

  return [...docs.values()];
}

export const fetchPlay = () => fetchPlayReviews(MYNTRA_PLAY, "play", { brand: "myntra" });
