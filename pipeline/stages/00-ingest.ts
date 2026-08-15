/**
 * Stage 0 — ingest every source, normalise, dedupe, write the corpus.
 *
 * Each source writes its own raw file, so one blocked or unconfigured
 * source never invalidates the others. Re-running a single source with
 * `--only <source>` reuses the existing raw files for the rest.
 */
import { join } from "node:path";
import { fetchApple } from "../sources/apple.ts";
import { fetchPlay } from "../sources/play.ts";
import { fetchReddit } from "../sources/reddit.ts";
import { fetchYouTube } from "../sources/youtube.ts";
import { fetchSitejabber } from "../sources/sitejabber.ts";
import { fetchCompetitors } from "../sources/competitor.ts";
import { OUT_DIR, RAW_DIR, log, readJson, writeJson } from "../lib/io.ts";
import { SOURCES, type Doc, type Source } from "../types.ts";

const FETCHERS: Record<Source, () => Promise<Doc[]>> = {
  apple: fetchApple,
  play: fetchPlay,
  reddit: fetchReddit,
  youtube: fetchYouTube,
  sitejabber: fetchSitejabber,
  competitor: fetchCompetitors,
};

const rawPath = (s: Source) => join(RAW_DIR, `${s}.json`);
export const CORPUS_PATH = join(OUT_DIR, "corpus.json");

export interface Corpus {
  generatedAt: string;
  raw: number;
  afterDedupe: number;
  bySource: Record<string, number>;
  nonLatinCount: number;
  dateRange: { from: string | null; to: string | null };
  docs: Doc[];
}

/** Rough script check: share of alphabetic characters that are Latin. */
function latinShare(text: string): number {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return 1;
  const latin = text.match(/\p{Script=Latin}/gu) ?? [];
  return latin.length / letters.length;
}

export async function ingest(only?: Source[]): Promise<Corpus> {
  const targets = only?.length ? only : [...SOURCES];

  for (const source of targets) {
    log("ingest", `fetching ${source}…`);
    try {
      const docs = await FETCHERS[source]();
      writeJson(rawPath(source), docs);
      log("ingest", `${source}: ${docs.length} docs → data/raw/${source}.json`);
    } catch (err) {
      log("ingest", `${source} FAILED: ${String(err)} — keeping any existing raw file`);
    }
  }

  // Merge whatever raw files exist, including ones from earlier runs.
  const merged = new Map<string, Doc>();
  const bySource: Record<string, number> = {};
  let raw = 0;

  for (const source of SOURCES) {
    const docs = readJson<Doc[]>(rawPath(source)) ?? [];
    raw += docs.length;
    bySource[source] = docs.length;
    for (const d of docs) merged.set(d.id, d);
  }

  // Cross-source dedupe: the same text scraped twice is one observation.
  const seenText = new Set<string>();
  const docs: Doc[] = [];
  let nonLatinCount = 0;

  for (const d of merged.values()) {
    const key = d.text.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 220);
    if (key.length > 20 && seenText.has(key)) continue;
    seenText.add(key);

    // Non-Latin text is kept — Gemini is multilingual and Hindi/Tamil
    // reviews carry real signal — but counted so the methodology panel
    // can disclose the mix.
    if (latinShare(d.text) < 0.5) nonLatinCount++;
    docs.push(d);
  }

  const dates = docs.map((d) => d.date).filter((d): d is string => !!d).sort();

  const corpus: Corpus = {
    generatedAt: new Date().toISOString(),
    raw,
    afterDedupe: docs.length,
    bySource,
    nonLatinCount,
    dateRange: { from: dates[0] ?? null, to: dates.at(-1) ?? null },
    docs,
  };

  writeJson(CORPUS_PATH, corpus);
  log(
    "ingest",
    `corpus: ${raw} raw → ${docs.length} deduped (${Object.entries(bySource)
      .map(([k, v]) => `${k} ${v}`)
      .join(", ")}), ${dates[0]?.slice(0, 10)} … ${dates.at(-1)?.slice(0, 10)}`,
  );

  return corpus;
}
