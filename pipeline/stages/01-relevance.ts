/**
 * Stage 1 — relevance filter.
 *
 * Keeps the corpus pointed at the wishlist-to-purchase question instead of
 * generic Myntra complaints. The raw -> relevant funnel is itself an output:
 * it is the honest denominator every later percentage is computed against.
 */
import { join } from "node:path";
import { z } from "zod";
import { completeJson } from "../llm/provider.ts";
import { relevancePrompt, relevanceSystem } from "../prompts/index.ts";
import { OUT_DIR, chunk, log, mapLimit, readJson, writeJson } from "../lib/io.ts";
import type { Doc, Relevance } from "../types.ts";

export const RELEVANCE_PATH = join(OUT_DIR, "relevance.json");

const BATCH = 20;
const CONCURRENCY = 3;

/**
 * A document must be both flagged relevant AND confidently so. The prompt
 * instructs the model to score below this when unsure, so the threshold is
 * the second half of that contract rather than an arbitrary cutoff.
 */
export const RELEVANCE_THRESHOLD = 0.6;

const ResponseSchema = z.object({
  results: z.array(
    z.object({
      index: z.number().int(),
      relevant: z.boolean(),
      relevance: z.number().min(0).max(1),
      reason: z.string(),
    }),
  ),
});

export async function runRelevance(docs: Doc[]): Promise<Relevance[]> {
  const existing = readJson<Relevance[]>(RELEVANCE_PATH) ?? [];
  const done = new Map(existing.map((r) => [r.id, r]));
  const todo = docs.filter((d) => !done.has(d.id));

  log("relevance", `${done.size} cached, ${todo.length} to classify`);

  const batches = chunk(todo, BATCH);
  let completed = 0;

  let failedDocs = 0;

  const results = await mapLimit(batches, CONCURRENCY, async (batch) => {
    let out: Relevance[];
    try {
      const res = await completeJson(
        { system: relevanceSystem, prompt: relevancePrompt(batch), temperature: 0, tier: "bulk" },
        ResponseSchema,
      );
      const byIndex = new Map(res.results.map((r) => [r.index, r]));

      // A document the model omitted was not judged. Leaving it out of the
      // output keeps it in the queue for the next run; writing a verdict for
      // it would bake a non-answer into the corpus.
      out = batch.flatMap<Relevance>((d, i) => {
        const r = byIndex.get(i);
        if (!r) {
          failedDocs++;
          return [];
        }
        return [{ id: d.id, relevant: r.relevant, relevance: r.relevance, reason: r.reason }];
      });
    } catch (err) {
      // Never persist a failure as "irrelevant". Doing so silently deletes
      // documents from the corpus: the resume logic treats anything present
      // in relevance.json as already decided, so a rate-limit blip would
      // permanently drop real evidence. Emit nothing and let it be retried.
      log("relevance", `batch failed, will retry on next run: ${String(err).slice(0, 140)}`);
      failedDocs += batch.length;
      out = [];
    }

    completed += batch.length;
    if (completed % 200 < BATCH) log("relevance", `${completed}/${todo.length}`);
    return out;
  });

  const all = [...done.values(), ...results.flat()];
  writeJson(RELEVANCE_PATH, all);

  const flagged = all.filter((r) => r.relevant).length;
  const kept = all.filter((r) => r.relevant && r.relevance >= RELEVANCE_THRESHOLD).length;
  log(
    "relevance",
    `${flagged}/${all.length} flagged, ${kept} above the ${RELEVANCE_THRESHOLD} confidence threshold (${((kept / all.length) * 100).toFixed(1)}%)`,
  );
  if (failedDocs > 0) {
    log(
      "relevance",
      `${failedDocs} documents unclassified after retries — re-run this stage to pick them up`,
    );
  }
  return all;
}
