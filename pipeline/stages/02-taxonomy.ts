/**
 * Stage 2 — bottom-up taxonomy induction.
 *
 * The brief withholds the user problem on purpose, so this stage must not
 * start from a pre-baked list of e-commerce frictions. Instead: sample the
 * relevant corpus, induce themes independently per batch, then consolidate.
 * Independent batches then merging is what stops one loud batch from
 * defining the whole taxonomy.
 *
 * The output is hand-editable — review data/out/taxonomy.json before Stage 3
 * locks it in, since every downstream number inherits these definitions.
 */
import { join } from "node:path";
import { z } from "zod";
import { completeJson, modelNames } from "../llm/provider.ts";
import { taxonomyMergePrompt, taxonomyProposePrompt, taxonomySystem } from "../prompts/index.ts";
import { OUT_DIR, chunk, log, mapLimit, readJson, seededShuffle, writeJson } from "../lib/io.ts";
import { FrictionThemeSchema, type Doc, type Taxonomy } from "../types.ts";

export const TAXONOMY_PATH = join(OUT_DIR, "taxonomy.json");

const SAMPLE_SIZE = 320;
// 18 docs x ~500 chars ~= 2.6k input tokens, which leaves room for the
// response inside Groq's 8k tokens-per-minute window. Sized for the
// tightest provider, not the roomiest.
const BATCH = 18;

const ProposeSchema = z.object({
  themes: z.array(
    z.object({
      name: z.string(),
      definition: z.string(),
      // Never read downstream — it exists only to make the model ground its
      // proposals in real documents. Models return these as strings about a
      // third of the time, which was discarding otherwise perfect batches.
      // `.default()` never fixed that: it fires only on `undefined`, so a
      // string or a null still threw and still took the batch with it.
      // `.catch()` is what tolerates a wrong type, and since nothing reads
      // this field, swallowing one silently is the intended behaviour.
      evidence_indices: z.array(z.unknown()).catch([]),
    }),
  ),
});

const MergeSchema = z.object({ themes: z.array(FrictionThemeSchema).min(8).max(20) });

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function runTaxonomy(relevantDocs: Doc[], force = false): Promise<Taxonomy> {
  const existing = readJson<Taxonomy>(TAXONOMY_PATH);
  if (existing && !force) {
    log("taxonomy", `reusing ${existing.themes.length} themes from data/out/taxonomy.json`);
    return existing;
  }

  // Longer documents carry more articulated reasoning; bias the sample toward
  // them, then shuffle deterministically so the run is reproducible.
  const pool = seededShuffle(
    [...relevantDocs].sort((a, b) => b.text.length - a.text.length).slice(0, SAMPLE_SIZE * 3),
  ).slice(0, SAMPLE_SIZE);

  log("taxonomy", `inducing from ${pool.length} documents in ${Math.ceil(pool.length / BATCH)} batches`);

  const batches = chunk(pool, BATCH);
  const proposals = await mapLimit(batches, 1, async (batch, i) => {
    try {
      const res = await completeJson(
        {
          system: taxonomySystem,
          prompt: taxonomyProposePrompt(batch.map((d) => d.text)),
          temperature: 0.4, // a little variety across batches widens coverage
        },
        ProposeSchema,
      );
      log("taxonomy", `batch ${i + 1}: ${res.themes.length} candidate themes`);
      return res.themes;
    } catch (err) {
      log("taxonomy", `batch ${i + 1} failed: ${String(err).slice(0, 160)}`);
      return [];
    }
  });

  const candidates = proposals.flat();
  if (candidates.length === 0) throw new Error("taxonomy induction produced no candidates");

  /*
   * Consolidation runs in at most two steps, and the tension between them is
   * the whole design problem here.
   *
   * Feeding every candidate into one call put the prompt over the 8,000
   * token-per-minute ceiling and returned 413 — a size error retrying cannot
   * fix. But splitting into many successive merge rounds solved that at the
   * cost of the output: each round abstracts, and seven of them turned
   * corpus-specific frictions into generic e-commerce categories.
   *
   * So: one grouped reduction pass at most, then a single final
   * consolidation, with the merge prompt explicitly instructed to preserve
   * concrete detail.
   */
  const render = (list: Array<{ name: string; definition: string }>) =>
    list.map((c, i) => `${i + 1}. ${c.name} — ${c.definition}`).join("\n");

  const mergeGroup = async (
    list: Array<{ name: string; definition: string }>,
    target: string,
    pinTier = false,
  ) => {
    const res = await completeJson(
      {
        system: taxonomySystem,
        prompt: taxonomyMergePrompt(render(list), target),
        temperature: 0.1,
        pinTier,
      },
      MergeSchema,
    );
    return res.themes;
  };

  /*
   * At most ONE reduction pass before the final consolidation.
   *
   * An earlier version looped until the pool fell below 24, which took seven
   * rounds — and every round is another abstraction step. The result was a
   * taxonomy of generic e-commerce categories: "AI-rendered model photos make
   * colour unjudgeable" had been sanded down to "Product Info & Visual Gaps".
   * Specificity is the whole value here, so the pipeline now abstracts once
   * at most. Groups are large because a rendered candidate is only ~120
   * characters; 50 of them is well inside the token window.
   */
  const MERGE_GROUP = 50;
  const FINAL_INPUT_MAX = 60;

  let candidatePool: Array<{ name: string; definition: string; id?: string; includes?: string[]; excludes?: string[] }> =
    candidates;

  if (candidatePool.length > FINAL_INPUT_MAX) {
    const groups = chunk(candidatePool, MERGE_GROUP);
    log("taxonomy", `single reduction pass: ${candidatePool.length} candidates in ${groups.length} groups`);
    const merged = await mapLimit(groups, 1, async (g) => {
      try {
        return await mergeGroup(g, "10 to 14");
      } catch (err) {
        // A failed group must not sink the taxonomy; carry it forward as-is.
        log("taxonomy", `merge group failed, carrying forward: ${String(err).slice(0, 120)}`);
        return g;
      }
    });
    const next = merged.flat();
    if (next.length > 0 && next.length < candidatePool.length) candidatePool = next;
    log("taxonomy", `reduced to ${candidatePool.length} candidates`);
  }

  log("taxonomy", `final consolidation of ${candidatePool.length} candidates`);
  let finalThemes: Awaited<ReturnType<typeof mergeGroup>> | null = null;
  for (let attempt = 0; attempt < 3 && !finalThemes; attempt++) {
    try {
      // Pinned: a weaker model here silently degrades every downstream number.
      finalThemes = await mergeGroup(candidatePool, "12 to 16", true);
    } catch (err) {
      log("taxonomy", `final consolidation attempt ${attempt + 1} failed: ${String(err).slice(0, 140)}`);
      await new Promise((r) => setTimeout(r, 30_000));
    }
  }
  if (!finalThemes) throw new Error("final taxonomy consolidation failed after 3 attempts");
  const merged = { themes: finalThemes };

  // Guarantee unique, well-formed ids regardless of what the model returned.
  const seen = new Set<string>();
  const themes = merged.themes.map((t) => {
    let id = slug(t.id || t.name);
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);
    return { ...t, id };
  });

  const taxonomy: Taxonomy = {
    generatedAt: new Date().toISOString(),
    model: modelNames().geminiQuality,
    sampleSize: pool.length, // documents read, not candidate themes merged
    themes,
  };

  writeJson(TAXONOMY_PATH, taxonomy);
  log("taxonomy", `${themes.length} themes → data/out/taxonomy.json`);
  for (const t of themes) log("taxonomy", `  ${t.id} — ${t.name}`);

  return taxonomy;
}
