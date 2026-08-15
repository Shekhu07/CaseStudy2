import { createHash } from "node:crypto";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/*
 * Both entry points — `npm run pipeline` and `next build`/`next start` — run
 * from the package root, so cwd is the reliable anchor. `import.meta.dirname`
 * is not: the Next bundler leaves it undefined, which broke the API route's
 * build when this module was pulled in through the provider.
 */
export const ROOT = process.cwd();
export const RAW_DIR = join(ROOT, "data", "raw");
export const OUT_DIR = join(ROOT, "data", "out");
export const CACHE_DIR = join(ROOT, "data", "cache");

export function sha1(s: string): string {
  return createHash("sha1").update(s).digest("hex");
}

export function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}

/** Normalise whitespace so hashing/dedupe is stable across sources. */
export function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Run tasks with bounded concurrency, preserving input order. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Deterministic shuffle so taxonomy sampling is reproducible. */
export function seededShuffle<T>(arr: T[], seed = 42): T[] {
  const a = [...arr];
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function log(stage: string, msg: string): void {
  const t = new Date().toISOString().slice(11, 19);
  console.log(`[${t}] ${stage.padEnd(12)} ${msg}`);
}
