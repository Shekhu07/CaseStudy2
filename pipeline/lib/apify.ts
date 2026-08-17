/**
 * Minimal Apify actor runner.
 *
 * Deliberately async (start -> poll -> read dataset) rather than the one-shot
 * `run-sync-get-dataset-items` endpoint, which returns 408 once a run passes
 * 300 seconds. A Reddit crawl of ~1,200 results passes it comfortably.
 *
 * Nothing here throws. A failed run returns an empty array, which stage 0 turns
 * into "keep the existing raw file" — the same contract every other source has.
 */
import { log, sleep } from "./io.ts";

const API = "https://api.apify.com/v2";

/** Apify paths address actors with a tilde, not the slash used in the store. */
const actorPath = (actor: string) => actor.replace("/", "~");

const POLL_INTERVAL_MS = 5000;
/*
 * Sized from a measured rate, not a guess: a 44-result probe took ~42s, so a
 * full ~1,700-result run lands near 25 minutes. Giving up early would not save
 * any money — the run keeps going and keeps billing on Apify's side — it would
 * only mean reading a dataset that is still being written.
 */
const POLL_TIMEOUT_MS = 45 * 60 * 1000;
const PAGE_SIZE = 500;

/** Terminal statuses other than SUCCEEDED — no point polling further. */
const TERMINAL = new Set(["FAILED", "ABORTED", "TIMED-OUT", "ABORTING"]);

interface RunInfo {
  data?: { id?: string; status?: string; defaultDatasetId?: string };
}

export function apifyToken(): string | undefined {
  return process.env.APIFY_TOKEN || undefined;
}

async function startRun(
  tag: string,
  actor: string,
  input: unknown,
  token: string,
): Promise<{ runId: string; datasetId: string } | null> {
  const res = await fetch(`${API}/acts/${actorPath(actor)}/runs?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    log(tag, `run start failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const json = (await res.json()) as RunInfo;
  const runId = json.data?.id;
  const datasetId = json.data?.defaultDatasetId;
  if (!runId || !datasetId) {
    log(tag, "run started but returned no id — aborting");
    return null;
  }
  return { runId, datasetId };
}

/** Poll until the run leaves a running state. Returns the final status. */
async function awaitRun(tag: string, runId: string, token: string): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let last = "";

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const res = await fetch(`${API}/actor-runs/${runId}?token=${token}`);
    // A transient poll failure is not a run failure — keep waiting.
    if (!res.ok) continue;

    const status = (await res.json() as RunInfo).data?.status ?? "";
    if (status && status !== last) {
      log(tag, `run ${runId} → ${status}`);
      last = status;
    }
    if (status === "SUCCEEDED" || TERMINAL.has(status)) return status;
  }

  log(tag, `run ${runId} still running after ${POLL_TIMEOUT_MS / 60000}m — giving up on it`);
  return "TIMED-OUT";
}

async function readDataset<T>(tag: string, datasetId: string, token: string): Promise<T[]> {
  const items: T[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const qs = `token=${token}&clean=true&format=json&limit=${PAGE_SIZE}&offset=${offset}`;
    const res = await fetch(`${API}/datasets/${datasetId}/items?${qs}`);
    if (!res.ok) {
      log(tag, `dataset read failed at offset ${offset}: ${res.status}`);
      break;
    }

    const page = (await res.json()) as T[];
    items.push(...page);

    const total = Number(res.headers.get("X-Apify-Pagination-Total") ?? 0);
    if (page.length < PAGE_SIZE || items.length >= total) break;
  }

  return items;
}

/**
 * Run an actor to completion and return its default dataset.
 * `tag` is only used for log prefixes, so callers read as one source.
 */
export async function runActor<T>(tag: string, actor: string, input: unknown): Promise<T[]> {
  const token = apifyToken();
  if (!token) {
    log(tag, "SKIPPED — set APIFY_TOKEN to enable");
    return [];
  }

  const started = await startRun(tag, actor, input, token);
  if (!started) return [];

  const status = await awaitRun(tag, started.runId, token);
  if (status !== "SUCCEEDED") {
    log(tag, `run ${started.runId} ended ${status} — reading whatever it produced`);
  }

  // A failed or aborted run still bills for, and keeps, the items it collected.
  const items = await readDataset<T>(tag, started.datasetId, token);
  log(tag, `${items.length} dataset items from run ${started.runId}`);
  return items;
}
