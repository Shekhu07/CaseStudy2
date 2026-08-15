import "server-only";

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Analysis, Taxonomy } from "@/../pipeline/types";

/**
 * Server-only access to the committed analysis artifacts.
 * Presentation helpers live in `labels.ts` so client components can import
 * them without pulling `node:fs` into the browser bundle.
 */

const OUT = join(process.cwd(), "data", "out");

export function loadAnalysis(): Analysis | null {
  const path = join(OUT, "analysis.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as Analysis;
}

export function loadTaxonomy(): Taxonomy | null {
  const path = join(OUT, "taxonomy.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as Taxonomy;
}
