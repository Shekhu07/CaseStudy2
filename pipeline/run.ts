/**
 * Pipeline orchestrator.
 *
 *   npm run pipeline -- --stage ingest --only apple,play
 *   npm run pipeline -- --stage relevance --limit 100
 *   npm run pipeline -- --stage all
 *   npm run pipeline -- --stage taxonomy --force     # re-induce the taxonomy
 *
 * Every stage checkpoints to data/out, so re-running resumes rather than
 * restarting. Stages are individually addressable because the LLM ones cost
 * free-tier quota and you want to inspect output before spending more.
 */
// Next reads .env.local automatically; the standalone pipeline does not, and
// dotenv's default entry point only loads plain `.env`.
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"], quiet: true });

import { CORPUS_PATH, ingest, type Corpus } from "./stages/00-ingest.ts";
import { RELEVANCE_PATH, RELEVANCE_THRESHOLD, runRelevance } from "./stages/01-relevance.ts";
import { runTaxonomy } from "./stages/02-taxonomy.ts";
import { TAGS_PATH, runTagging } from "./stages/03-tag.ts";
import { runScoring } from "./stages/04-score.ts";
import { log, readJson } from "./lib/io.ts";
import { stats } from "./llm/provider.ts";
import { SOURCES, type Relevance, type Source, type Tag } from "./types.ts";

const STAGES = ["ingest", "relevance", "taxonomy", "tag", "score", "all"] as const;
type Stage = (typeof STAGES)[number];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

function loadCorpus(): Corpus {
  const corpus = readJson<Corpus>(CORPUS_PATH);
  if (!corpus) throw new Error("No corpus. Run: npm run pipeline -- --stage ingest");
  return corpus;
}

async function main() {
  const stage = (arg("stage") ?? "all") as Stage;
  if (!STAGES.includes(stage)) {
    throw new Error(`--stage must be one of ${STAGES.join(", ")}`);
  }

  const limit = arg("limit") ? Number(arg("limit")) : undefined;
  const only = arg("only")?.split(",").map((s) => s.trim()) as Source[] | undefined;
  if (only?.some((s) => !SOURCES.includes(s))) {
    throw new Error(`--only must be a comma-separated subset of ${SOURCES.join(",")}`);
  }

  const run = (s: Stage) => stage === "all" || stage === s;
  const started = Date.now();

  /* -------------------------------- ingest ------------------------------ */

  if (run("ingest")) await ingest(only);

  const needsCorpus = ["relevance", "taxonomy", "tag", "score", "all"].includes(stage);
  if (!needsCorpus) return;

  const corpus = loadCorpus();

  // --limit samples the corpus for cheap end-to-end rehearsals before the
  // full run. Always validate prompt changes this way first.
  const docs = limit ? corpus.docs.slice(0, limit) : corpus.docs;
  if (limit) log("run", `LIMIT ${limit} — sampling ${docs.length} of ${corpus.docs.length} docs`);

  /* ------------------------------ relevance ----------------------------- */

  if (run("relevance")) await runRelevance(docs);

  const relevance = readJson<Relevance[]>(RELEVANCE_PATH) ?? [];
  const relevantIds = new Set(
    relevance
      .filter((r) => r.relevant && r.relevance >= RELEVANCE_THRESHOLD)
      .map((r) => r.id),
  );
  const relevantDocs = docs.filter((d) => relevantIds.has(d.id));

  if (stage === "relevance") {
    log("run", `done in ${((Date.now() - started) / 1000).toFixed(0)}s — ${JSON.stringify(stats())}`);
    return;
  }
  if (relevantDocs.length === 0) {
    throw new Error("No relevant documents. Run the relevance stage first.");
  }

  /* ------------------------------- taxonomy ----------------------------- */

  const taxonomy = await runTaxonomy(relevantDocs, flag("force"));
  if (stage === "taxonomy") {
    log("run", "review data/out/taxonomy.json before running --stage tag");
    return;
  }

  /* --------------------------------- tag -------------------------------- */

  if (run("tag")) await runTagging(relevantDocs, taxonomy);
  const tags = readJson<Tag[]>(TAGS_PATH) ?? [];
  if (stage === "tag") {
    log("run", `done in ${((Date.now() - started) / 1000).toFixed(0)}s — ${JSON.stringify(stats())}`);
    return;
  }

  /* -------------------------------- score ------------------------------- */

  if (run("score")) await runScoring(corpus, relevantIds, taxonomy, tags);

  log("run", `done in ${((Date.now() - started) / 1000).toFixed(0)}s — ${JSON.stringify(stats())}`);
}

main().catch((err) => {
  console.error("\nPIPELINE FAILED:", err);
  process.exit(1);
});
