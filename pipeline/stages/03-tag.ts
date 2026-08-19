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

export const BATCH = 8; // small: tagging output is far larger per document than Stage 1
const CONCURRENCY = 2;
// Deliberately frequent. Free-tier throughput means a full pass takes over an
// hour, and a coarse interval both hides progress and risks losing a long
// stretch of work to one interruption. Writing every few batches is cheap.
const CHECKPOINT_EVERY = 4; // batches per worker between checkpoints

/**
 * `null` is how models routinely express "nothing to report" for the two free
 * -text fields, but `.default()` only fires on `undefined`, so a null took the
 * whole ~20-document batch down with it. The sibling coercion in types.ts
 * guards `TagSchema` (our output); this guards the LLM response, which is what
 * actually gets validated here.
 */
const emptyIfNull = z.preprocess((v) => v ?? "", z.string());

/**
 * `.catch()` stops one malformed field from taking a whole ~20-document batch
 * down with it, but it does so silently: rename an enum value in the taxonomy
 * and every affected array quietly becomes empty instead of erroring, which
 * reads downstream as "shoppers never did this" rather than "we stopped being
 * able to see it". Count what gets swallowed and report it at the end of the
 * stage, so a systematic coercion is visible rather than inferred later from a
 * suspiciously low facet share.
 */
const coercions = new Map<string, { count: number; samples: Set<string> }>();

function noteCoercion(field: string, input: unknown): void {
  let entry = coercions.get(field);
  if (!entry) coercions.set(field, (entry = { count: 0, samples: new Set() }));
  entry.count++;
  // A handful of examples is enough to tell a renamed enum from a stray null.
  if (entry.samples.size < 5) entry.samples.add(JSON.stringify(input)?.slice(0, 80) ?? String(input));
}

/** Fallback for `.catch()` that records what it replaced before returning it. */
const loud =
  <T,>(field: string, fallback: T) =>
  (ctx: { input: unknown }): T => {
    noteCoercion(field, ctx.input);
    return fallback;
  };

function reportCoercions(): void {
  if (coercions.size === 0) {
    log("tag", "no fields were silently coerced");
    return;
  }
  const total = [...coercions.values()].reduce((n, e) => n + e.count, 0);
  log("tag", `${total} field values were coerced to a fallback - these are NOT real absences:`);
  for (const [field, e] of [...coercions.entries()].sort((a, b) => b[1].count - a[1].count)) {
    log("tag", `  ${field}: ${e.count} (e.g. ${[...e.samples].join(", ")})`);
  }
}

/** Lenient at the edges, strict about the parts that drive the numbers. */
const ResultSchema = z.object({
  index: z.number().int(),
  themes: z.array(z.string()).catch(loud("themes", [] as string[])),
  severity: z.coerce.number().min(1).max(5).catch(loud("severity", 3)),
  journey_stage: z.enum(JOURNEY_STAGES).catch(loud("journey_stage", "evaluate" as const)),
  intent_type: z.enum(INTENT_TYPES).catch(loud("intent_type", "unclear" as const)),
  information_needs: z.array(z.enum(INFORMATION_NEEDS)).catch(loud("information_needs", [])),
  external_behaviour: z.array(z.enum(EXTERNAL_BEHAVIOURS)).catch(loud("external_behaviour", [])),
  workaround: emptyIfNull,
  segment_signals: z.array(z.enum(SEGMENT_SIGNALS)).catch(loud("segment_signals", [])),
  evidence_quote: emptyIfNull,
  confidence: z.coerce.number().min(0).max(1).catch(loud("confidence", 0.5)),
});

const ResponseSchema = z.object({ results: z.array(ResultSchema) });

/**
 * One batch of documents to their tags.
 *
 * Extracted from `runTagging` so the stability audit can re-tag a sample
 * through the identical prompt, schema and post-processing without going
 * anywhere near `tags.json`. A stability number measured through a
 * reimplementation of this path would measure the reimplementation.
 */
export async function tagBatch(
  batch: Doc[],
  system: string,
  validThemes: Set<string>,
): Promise<Tag[]> {
  const res = await completeJson(
    { system, prompt: taggingPrompt(batch), temperature: 0, maxOutputTokens: 8192, tier: "bulk" },
    ResponseSchema,
  );
  const byIndex = new Map(res.results.map((r) => [r.index, r]));

  return batch.flatMap<Tag>((d, i) => {
    const r = byIndex.get(i);
    if (!r) return [];

    // Drop hallucinated theme ids rather than letting them pollute counts.
    const themes = [...new Set(r.themes.map((t) => t.trim()))].filter((t) => validThemes.has(t));

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
}

export async function runTagging(docs: Doc[], taxonomy: Taxonomy): Promise<Tag[]> {
  const validThemes = new Set(taxonomy.themes.map((t) => t.id));
  const system = taggingSystem(taxonomy.themes);

  coercions.clear();

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
        return await tagBatch(batch, system, validThemes);
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
  reportCoercions();
  return all;
}
