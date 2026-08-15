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
const BATCH = 40;

const ProposeSchema = z.object({
  themes: z.array(
    z.object({
      name: z.string(),
      definition: z.string(),
      evidence_indices: z.array(z.number()).default([]),
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
  const proposals = await mapLimit(batches, 3, async (batch, i) => {
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

  const rendered = candidates.map((c, i) => `${i + 1}. ${c.name} — ${c.definition}`).join("\n");
  log("taxonomy", `consolidating ${candidates.length} candidates`);

  const merged = await completeJson(
    { system: taxonomySystem, prompt: taxonomyMergePrompt(rendered), temperature: 0.1 },
    MergeSchema,
  );

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
    sampleSize: pool.length,
    themes,
  };

  writeJson(TAXONOMY_PATH, taxonomy);
  log("taxonomy", `${themes.length} themes → data/out/taxonomy.json`);
  for (const t of themes) log("taxonomy", `  ${t.id} — ${t.name}`);

  return taxonomy;
}
