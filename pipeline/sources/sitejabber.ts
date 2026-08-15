/**
 * Sitejabber reviews for myntra.com.
 *
 * Small in volume (a few hundred) but disproportionately useful: these are
 * long-form written reviews rather than app-store one-liners, so they carry
 * far more articulated reasoning about why a purchase did or did not happen.
 *
 * Sitejabber embeds its reviews as schema.org JSON-LD, so there is no HTML
 * parsing to break — we read the structured data the page publishes for
 * search engines.
 *
 * Trustpilot was evaluated and rejected: it returns 403 to non-browser
 * clients. MouthShut was rejected: no stable public listing id.
 */
import { clean, log, sha1, sleep } from "../lib/io.ts";
import type { Doc } from "../types.ts";

const BASE = "https://www.sitejabber.com/reviews/myntra.com";
const MAX_PAGES = 15;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface LdReview {
  reviewBody?: string;
  headline?: string;
  datePublished?: string;
  url?: string;
  reviewRating?: { ratingValue?: string | number };
  author?: { name?: string };
}

function extractReviews(html: string): LdReview[] {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, raw] of blocks) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.review) && parsed.review.length > 0) {
        return parsed.review as LdReview[];
      }
    } catch {
      // Not every ld+json block is well-formed or relevant; skip it.
    }
  }
  return [];
}

export async function fetchSitejabber(): Promise<Doc[]> {
  const docs = new Map<string, Doc>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? BASE : `${BASE}?page=${page}`;
    let reviews: LdReview[] = [];

    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) {
        log("sitejabber", `page ${page}: HTTP ${res.status}, stopping`);
        break;
      }
      reviews = extractReviews(await res.text());
    } catch (err) {
      log("sitejabber", `page ${page} failed: ${String(err).slice(0, 120)}`);
      break;
    }

    if (reviews.length === 0) break;

    let added = 0;
    for (const r of reviews) {
      const headline = clean(r.headline ?? "");
      const body = clean(r.reviewBody ?? "");
      if (!body) continue;
      const text = headline && !body.startsWith(headline) ? `${headline}. ${body}` : body;
      if (text.length < 40) continue;

      const id = `sitejabber:${sha1(text)}`;
      if (docs.has(id)) continue;

      const rating = Number(r.reviewRating?.ratingValue);
      docs.set(id, {
        id,
        source: "sitejabber",
        url: r.url ?? url,
        date: r.datePublished ? new Date(r.datePublished).toISOString() : null,
        rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? Math.round(rating) : null,
        text,
        meta: { brand: "myntra", author: r.author?.name ?? null, page },
      });
      added++;
    }

    log("sitejabber", `page ${page}: +${added} (${docs.size} total)`);
    if (added === 0) break; // pagination has looped back to seen content
    await sleep(800);
  }

  return [...docs.values()];
}
