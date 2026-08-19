/**
 * Quality audit helper.
 *
 * The dashboard is only as good as the tags underneath it, so before trusting
 * a run you read a random sample and check the machine against your own
 * judgement. This prints that sample in a readable form.
 *
 *   npm run audit -- --stage relevance --n 40
 *   npm run audit -- --stage tag --n 30
 *   npm run audit -- --stage tag --theme fit-uncertainty
 *   npm run audit -- --stage stability --n 30
 *
 * `--seed` makes the sample reproducible so two people can review the same
 * documents.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"], quiet: true });

import { CORPUS_PATH, type Corpus } from "./stages/00-ingest.ts";
import { RELEVANCE_PATH, RELEVANCE_THRESHOLD } from "./stages/01-relevance.ts";
import { TAXONOMY_PATH } from "./stages/02-taxonomy.ts";
import { BATCH, TAGS_PATH, tagBatch } from "./stages/03-tag.ts";
import { taggingSystem } from "./prompts/index.ts";
import { chunk, mapLimit, readJson, seededShuffle } from "./lib/io.ts";
import type { Relevance, Tag, Taxonomy } from "./types.ts";

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : fallback;
}

const RULE = "─".repeat(78);

async function main() {
  const stage = arg("stage", "relevance")!;
  const n = Number(arg("n", "30"));
  const seed = Number(arg("seed", "7"));
  const themeFilter = arg("theme");

  const corpus = readJson<Corpus>(CORPUS_PATH);
  if (!corpus) throw new Error("No corpus — run --stage ingest first.");
  const byId = new Map(corpus.docs.map((d) => [d.id, d]));

  if (stage === "relevance") {
    const rel = readJson<Relevance[]>(RELEVANCE_PATH) ?? [];
    if (rel.length === 0) throw new Error("No relevance output yet.");

    const kept = rel.filter((r) => r.relevant && r.relevance >= RELEVANCE_THRESHOLD);
    const dropped = rel.filter((r) => !(r.relevant && r.relevance >= RELEVANCE_THRESHOLD));

    console.log(
      `\n${rel.length} classified · ${kept.length} kept (${((kept.length / rel.length) * 100).toFixed(1)}%) · threshold ${RELEVANCE_THRESHOLD}\n`,
    );

    // Both sides matter: precision comes from the kept pile, recall from the
    // dropped one. Reviewing only what survived hides false negatives.
    for (const [title, pool] of [
      ["KEPT — check for false positives", kept],
      ["DROPPED — check for false negatives", dropped],
    ] as const) {
      console.log(`${RULE}\n${title}\n${RULE}`);
      for (const r of seededShuffle(pool, seed).slice(0, Math.ceil(n / 2))) {
        const d = byId.get(r.id);
        if (!d) continue;
        console.log(`\n[${d.source}${d.rating ? ` ${d.rating}★` : ""}] ${d.text.slice(0, 320)}`);
        console.log(`  → ${r.relevance.toFixed(2)} · ${r.reason}`);
      }
      console.log();
    }
    return;
  }

  if (stage === "tag") {
    const tags = readJson<Tag[]>(TAGS_PATH) ?? [];
    const taxonomy = readJson<Taxonomy>(TAXONOMY_PATH);
    if (tags.length === 0) throw new Error("No tag output yet.");
    const themeName = new Map(taxonomy?.themes.map((t) => [t.id, t.name]) ?? []);

    const pool = themeFilter ? tags.filter((t) => t.themes.includes(themeFilter)) : tags;
    console.log(
      `\n${tags.length} tagged · ${pool.length} in scope${themeFilter ? ` for "${themeFilter}"` : ""}\n`,
    );

    for (const t of seededShuffle(pool, seed).slice(0, n)) {
      const d = byId.get(t.id);
      if (!d) continue;
      console.log(RULE);
      console.log(`[${d.source}${d.rating ? ` ${d.rating}★` : ""}] ${d.text.slice(0, 420)}`);
      console.log(`  themes     ${t.themes.map((id) => themeName.get(id) ?? id).join(" · ") || "—"}`);
      console.log(`  severity   ${t.severity}/5   stage ${t.journey_stage}   intent ${t.intent_type}`);
      console.log(`  needs      ${t.information_needs.join(", ") || "—"}`);
      console.log(`  outside    ${t.external_behaviour.join(", ") || "—"}`);
      console.log(`  segments   ${t.segment_signals.join(", ") || "—"}`);
      if (t.workaround) console.log(`  workaround ${t.workaround}`);
      console.log(`  quote      ${t.evidence_quote ? `"${t.evidence_quote}"` : "(none verified)"}`);
    }
    console.log();
    return;
  }

  /*
   * Stability: does the same input produce the same label twice?
   *
   * Tagging runs at temperature 0, so in principle this should be 100%. It is
   * not, and the honest thing is to measure how far off it is rather than to
   * assume the first pass was canonical. Re-tags a seeded sample through the
   * exact production path (`tagBatch`) and diffs against what is on disk.
   *
   * Writes nothing. `tags.json` is read-only here by construction.
   */
  if (stage === "stability") {
    const tags = readJson<Tag[]>(TAGS_PATH) ?? [];
    const taxonomy = readJson<Taxonomy>(TAXONOMY_PATH);
    if (tags.length === 0) throw new Error("No tag output yet.");
    if (!taxonomy) throw new Error("No taxonomy — run --stage taxonomy first.");

    const sample = seededShuffle(tags, seed).slice(0, n);
    const docs = sample.map((t) => byId.get(t.id)).filter((d): d is NonNullable<typeof d> => !!d);
    const before = new Map(sample.map((t) => [t.id, t]));

    console.log(`\nRe-tagging ${docs.length} documents (seed ${seed}) through the production path.`);
    console.log("Temperature is 0, so anything below 100% is provider non-determinism.\n");

    const system = taggingSystem(taxonomy.themes);
    const validThemes = new Set(taxonomy.themes.map((t) => t.id));
    const redone = (
      await mapLimit(chunk(docs, BATCH), 2, (b) => tagBatch(b, system, validThemes))
    ).flat();

    if (redone.length === 0) throw new Error("Re-tag returned nothing — check quota and API keys.");

    const same = { themes: 0, severity: 0, sev1: 0, journey_stage: 0, intent_type: 0, needs: 0, segments: 0 };
    const eqSet = (a: string[], b: string[]) =>
      a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

    for (const after of redone) {
      const b = before.get(after.id);
      if (!b) continue;
      if (eqSet(b.themes, after.themes)) same.themes++;
      if (b.severity === after.severity) same.severity++;
      if (Math.abs(b.severity - after.severity) <= 1) same.sev1++;
      if (b.journey_stage === after.journey_stage) same.journey_stage++;
      if (b.intent_type === after.intent_type) same.intent_type++;
      if (eqSet(b.information_needs, after.information_needs)) same.needs++;
      if (eqSet(b.segment_signals, after.segment_signals)) same.segments++;
    }

    const d = redone.length;
    const row = (k: string, v: number) =>
      console.log(`  ${k.padEnd(26)} ${String(v).padStart(3)}/${d}   ${((v / d) * 100).toFixed(0)}%`);

    console.log(`${RULE}\nStability over ${d} re-tagged documents\n${RULE}`);
    row("themes (exact set)", same.themes);
    row("journey_stage", same.journey_stage);
    row("intent_type", same.intent_type);
    row("severity (exact)", same.severity);
    row("severity (within 1)", same.sev1);
    row("information_needs (set)", same.needs);
    row("segment_signals (set)", same.segments);

    console.log(`\n${RULE}\nDocuments whose themes moved\n${RULE}`);
    let shown = 0;
    for (const after of redone) {
      const b = before.get(after.id);
      if (!b || eqSet(b.themes, after.themes)) continue;
      const doc = byId.get(after.id);
      console.log(`\n[${doc?.source ?? "?"}] ${doc?.text.slice(0, 200) ?? ""}`);
      console.log(`  was  ${b.themes.join(" · ") || "—"}`);
      console.log(`  now  ${after.themes.join(" · ") || "—"}`);
      shown++;
    }
    if (shown === 0) console.log("\n  (none)");
    console.log();
    return;
  }

  throw new Error("--stage must be relevance, tag or stability");
}

main().catch((err) => {
  console.error("\nAUDIT FAILED:", err);
  process.exit(1);
});
