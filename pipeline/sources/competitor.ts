/**
 * Reviews for AJIO and Nykaa Fashion, from both app stores.
 *
 * This is not padding for volume. Two of the questions the brief asks the
 * discovery engine to answer are "how do users compare multiple shortlisted
 * products" and "what information do users seek outside Myntra before
 * purchasing" — neither is answerable from Myntra's own reviews alone,
 * because the comparison happens elsewhere. Shoppers narrate the trade-off
 * ("I check Myntra then buy on AJIO because…") on the competitor's page.
 *
 * Kept as a separate source so every dashboard figure can be recomputed with
 * competitor documents excluded.
 */
import { fetchAppleReviews } from "./apple.ts";
import { fetchPlayReviews } from "./play.ts";
import { log } from "../lib/io.ts";
import type { Doc } from "../types.ts";

const APPS = [
  { brand: "ajio", play: "com.ril.ajio", ios: "1113425372" },
  { brand: "nykaa_fashion", play: "com.fsn.nds", ios: "1439872423" },
] as const;

export async function fetchCompetitors(): Promise<Doc[]> {
  const docs = new Map<string, Doc>();

  for (const app of APPS) {
    for (const [label, fetcher] of [
      ["play", () => fetchPlayReviews(app.play, "competitor", { brand: app.brand }, 0.5)],
      ["apple", () => fetchAppleReviews(app.ios, "competitor", { brand: app.brand })],
    ] as const) {
      try {
        for (const d of await fetcher()) docs.set(d.id, d);
      } catch (err) {
        log("competitor", `${app.brand}/${label} failed: ${String(err).slice(0, 140)}`);
      }
    }
    log("competitor", `${app.brand} done → ${docs.size} total`);
  }

  return [...docs.values()];
}
