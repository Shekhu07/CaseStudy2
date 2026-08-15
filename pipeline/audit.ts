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
 *
 * `--seed` makes the sample reproducible so two people can review the same
 * documents.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"], quiet: true });

import { CORPUS_PATH, type Corpus } from "./stages/00-ingest.ts";
import { RELEVANCE_PATH, RELEVANCE_THRESHOLD } from "./stages/01-relevance.ts";
import { TAXONOMY_PATH } from "./stages/02-taxonomy.ts";
import { TAGS_PATH } from "./stages/03-tag.ts";
import { readJson, seededShuffle } from "./lib/io.ts";
import type { Relevance, Tag, Taxonomy } from "./types.ts";

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : fallback;
}

const RULE = "─".repeat(78);

function main() {
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

  throw new Error("--stage must be relevance or tag");
}

main();
