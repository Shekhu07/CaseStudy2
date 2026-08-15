/**
 * Stage 3 — per-document structured tagging against the induced taxonomy.
 *
 * The bulk of the LLM spend. Checkpoints after every batch group so an
 * interrupted or rate-limited run resumes instead of restarting.
 */
import { join } from "node:path";
import { z } from "zod";
import { completeJson } from "../llm/provider.ts";
import { taggingPrompt, taggingSystem } from "../prompts/index.ts";
import { OUT_DIR, chunk, log, mapLimit, readJson, writeJson } from "../lib/io.ts";
import {
  EXTERNAL_BEHAVIOURS,
  INFORMATION_NEEDS,
  INTENT_TYPES,
  JOURNEY_STAGES,
  SEGMENT_SIGNALS,
  type Doc,
  type Tag,
  type Taxonomy,
} from "../types.ts";

export const TAGS_PATH = join(OUT_DIR, "tags.json");

const BATCH = 8; // small: tagging output is far larger per document than Stage 1
const CONCURRENCY = 2;
// Deliberately frequent. Free-tier throughput means a full pass takes over an
// hour, and a coarse interval both hides progress and risks losing a long
// stretch of work to one interruption. Writing every few batches is cheap.
const CHECKPOINT_EVERY = 4; // batches per worker between checkpoints

/** Lenient at the edges, strict about the parts that drive the numbers. */
const ResultSchema = z.object({
  index: z.number().int(),
  themes: z.array(z.string()).default([]),
  severity: z.coerce.number().min(1).max(5).catch(3),
  journey_stage: z.enum(JOURNEY_STAGES).catch("evaluate"),
  intent_type: z.enum(INTENT_TYPES).catch("unclear"),
  information_needs: z.array(z.enum(INFORMATION_NEEDS)).catch([]),
  external_behaviour: z.array(z.enum(EXTERNAL_BEHAVIOURS)).catch([]),
  workaround: z.string().default(""),
  segment_signals: z.array(z.enum(SEGMENT_SIGNALS)).catch([]),
  evidence_quote: z.string().default(""),
  confidence: z.coerce.number().min(0).max(1).catch(0.5),
});

const ResponseSchema = z.object({ results: z.array(ResultSchema) });

export async function runTagging(docs: Doc[], taxonomy: Taxonomy): Promise<Tag[]> {
  const validThemes = new Set(taxonomy.themes.map((t) => t.id));
  const system = taggingSystem(taxonomy.themes);

  const existing = readJson<Tag[]>(TAGS_PATH) ?? [];
  const done = new Map(existing.map((t) => [t.id, t]));
  const todo = docs.filter((d) => !done.has(d.id));

  log("tag", `${done.size} cached, ${todo.length} to tag`);

  const batches = chunk(todo, BATCH);
  const collected: Tag[] = [];
  let completed = 0;

  const groups = chunk(batches, CHECKPOINT_EVERY * CONCURRENCY);

  for (const group of groups) {
    const groupTags = await mapLimit(group, CONCURRENCY, async (batch) => {
      try {
        const res = await completeJson(
          { system, prompt: taggingPrompt(batch), temperature: 0, maxOutputTokens: 8192, tier: "bulk" },
          ResponseSchema,
        );
        const byIndex = new Map(res.results.map((r) => [r.index, r]));

        return batch.flatMap<Tag>((d, i) => {
          const r = byIndex.get(i);
          if (!r) return [];

          // Drop hallucinated theme ids rather than letting them pollute counts.
          const themes = [...new Set(r.themes.map((t) => t.trim()))].filter((t) =>
            validThemes.has(t),
          );

          // A quote the model did not actually copy is worthless as evidence.
          const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
          const quote = normalise(d.text).includes(normalise(r.evidence_quote))
            ? r.evidence_quote.slice(0, 240)
            : "";

          return [
            {
              id: d.id,
              themes,
              severity: r.severity,
              journey_stage: r.journey_stage,
              intent_type: r.intent_type,
              information_needs: [...new Set(r.information_needs)].filter((n) => n !== "none"),
              external_behaviour: [...new Set(r.external_behaviour)].filter((b) => b !== "none"),
              workaround: r.workaround.slice(0, 300),
              segment_signals: [...new Set(r.segment_signals)],
              evidence_quote: quote,
              confidence: r.confidence,
            },
          ];
        });
      } catch (err) {
        log("tag", `batch failed, skipping: ${String(err).slice(0, 160)}`);
        return [];
      } finally {
        completed += batch.length;
        if (completed % 120 < BATCH) log("tag", `${completed}/${todo.length}`);
      }
    });

    collected.push(...groupTags.flat());
    writeJson(TAGS_PATH, [...done.values(), ...collected]); // checkpoint
  }

  const all = [...done.values(), ...collected];
  writeJson(TAGS_PATH, all);

  const withTheme = all.filter((t) => t.themes.length > 0).length;
  const withQuote = all.filter((t) => t.evidence_quote).length;
  log(
    "tag",
    `${all.length} tagged; ${withTheme} carry >=1 theme; ${withQuote} have a verified verbatim quote`,
  );
  return all;
}
