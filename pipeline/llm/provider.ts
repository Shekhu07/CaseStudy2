/**
 * One LLM interface over two free tiers.
 *
 * Design notes:
 * - JSON shape is described in the prompt and validated with zod rather
 *   than pushed through Gemini's `responseSchema`. Provider-native schema
 *   dialects differ; a prompt-described shape plus a validate-and-repair
 *   loop behaves identically on Gemini and Groq, which is what makes
 *   fallback actually work.
 * - Every response is cached on disk keyed by model+prompt, so re-runs and
 *   crashes cost zero quota.
 * - Gemini's free tier rate-limits aggressively; on 429/5xx we back off,
 *   then fall through to Groq rather than stalling the run.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import { CACHE_DIR, log, sha1, sleep } from "../lib/io.ts";

/*
 * Two tiers, because the stages have genuinely different needs.
 *
 * "bulk"    — Stages 1 and 3 run thousands of near-identical classifications.
 *             A lite model is faster, has looser free-tier limits, and loses
 *             nothing on a well-specified labelling task.
 * "quality" — Stages 2 and 4 run a handful of calls that define the taxonomy
 *             and the scoring judgements. Everything downstream inherits
 *             those, so they get the stronger model.
 */
const GEMINI_QUALITY = process.env.GEMINI_MODEL ?? "gemini-3.7-flash";
const GEMINI_BULK = process.env.GEMINI_MODEL_BULK ?? "gemini-3.1-flash-lite";
const GROQ_QUALITY = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
const GROQ_BULK = process.env.GROQ_MODEL_BULK ?? "llama-3.3-70b-versatile";

export type Tier = "bulk" | "quality";

export const MODELS_USED = new Set<string>();

const geminiModel = (t: Tier) => (t === "bulk" ? GEMINI_BULK : GEMINI_QUALITY);
const groqModel = (t: Tier) => (t === "bulk" ? GROQ_BULK : GROQ_QUALITY);

export interface CallOptions {
  system: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Which model tier to use. Defaults to "quality". */
  tier?: Tier;
  /** Bypass cache — used by the live API route. */
  noCache?: boolean;
}

class RateLimited extends Error {}

/* ------------------------------------------------------------------ *
 * Providers
 * ------------------------------------------------------------------ */

async function callGemini(o: CallOptions): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no GEMINI_API_KEY");

  const tier = o.tier ?? "quality";
  const model = geminiModel(tier);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: o.system }] },
        contents: [{ role: "user", parts: [{ text: o.prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: o.temperature ?? 0.1,
          maxOutputTokens: o.maxOutputTokens ?? 8192,
          // These are reasoning models. Labelling against an explicit rubric
          // does not need deliberation, and unbounded thinking eats the
          // output budget on large batches.
          ...(tier === "bulk" ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
        },
      }),
    },
  );

  if (res.status === 429 || res.status >= 500) {
    throw new RateLimited(`gemini ${res.status}`);
  }
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) {
    const reason = json?.candidates?.[0]?.finishReason ?? "unknown";
    throw new Error(`gemini empty response (finishReason=${reason})`);
  }
  MODELS_USED.add(model);
  return text;
}

async function callGroq(o: CallOptions): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("no GROQ_API_KEY");
  const model = groqModel(o.tier ?? "quality");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${o.system}\n\nRespond with JSON only.` },
        { role: "user", content: o.prompt },
      ],
      response_format: { type: "json_object" },
      temperature: o.temperature ?? 0.1,
      max_tokens: o.maxOutputTokens ?? 8192,
    }),
  });

  if (res.status === 429 || res.status >= 500) {
    throw new RateLimited(`groq ${res.status}`);
  }
  if (!res.ok) throw new Error(`groq ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error("groq empty response");
  MODELS_USED.add(model);
  return text;
}

/* ------------------------------------------------------------------ *
 * Cache
 * ------------------------------------------------------------------ */

function cacheKey(o: CallOptions): string {
  const tier = o.tier ?? "quality";
  return sha1(
    `${geminiModel(tier)}|${groqModel(tier)}|${o.system}|${o.prompt}|${o.temperature ?? 0.1}`,
  );
}

let cacheHits = 0;
let apiCalls = 0;
export const stats = () => ({ cacheHits, apiCalls });

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/** Raw text completion with cache, backoff, and provider fallback. */
export async function complete(o: CallOptions): Promise<string> {
  const path = join(CACHE_DIR, `${cacheKey(o)}.txt`);
  if (!o.noCache && existsSync(path)) {
    cacheHits++;
    return readFileSync(path, "utf8");
  }

  const providers: Array<[string, (o: CallOptions) => Promise<string>]> = [];
  if (process.env.GEMINI_API_KEY) providers.push(["gemini", callGemini]);
  if (process.env.GROQ_API_KEY) providers.push(["groq", callGroq]);
  if (providers.length === 0) {
    throw new Error("No LLM key configured. Set GEMINI_API_KEY and/or GROQ_API_KEY.");
  }

  let lastErr: unknown;

  /*
   * Two full sweeps over the providers. On free tiers both can be limited at
   * the same moment, and giving up there costs real data — the caller has no
   * good way to recover a document it was told is simply "not relevant".
   * The second sweep waits out a longer window before conceding.
   */
  for (let sweep = 0; sweep < 2; sweep++) {
    for (const [name, fn] of providers) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          apiCalls++;
          const text = await fn(o);
          if (!o.noCache) {
            mkdirSync(CACHE_DIR, { recursive: true });
            writeFileSync(path, text);
          }
          return text;
        } catch (err) {
          lastErr = err;
          if (err instanceof RateLimited) {
            // Jittered so concurrent workers do not retry in lockstep and
            // re-trigger the same limit together.
            const wait = 2000 * 2 ** attempt * (1 + Math.random());
            log("llm", `${name} rate-limited, retry in ${Math.round(wait)}ms`);
            await sleep(wait);
            continue;
          }
          // Non-retryable for this provider — try the next one.
          log("llm", `${name} error: ${String(err).slice(0, 200)}`);
          break;
        }
      }
    }

    if (sweep === 0) {
      log("llm", "all providers limited — cooling off for 60s before a final sweep");
      await sleep(60_000);
    }
  }

  throw new Error(`all providers failed: ${String(lastErr)}`);
}

/** Tolerate models that wrap JSON in prose or code fences. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.search(/[[{]/);
  if (start === -1) return text.trim();
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  const end = text.lastIndexOf(close);
  return end > start ? text.slice(start, end + 1) : text.slice(start);
}

/**
 * Completion validated against a zod schema, with one repair round-trip
 * that shows the model its own output and the validation error.
 */
export async function completeJson<T>(
  o: CallOptions,
  schema: z.ZodType<T>,
): Promise<T> {
  const text = await complete(o);

  const attempt = (raw: string) => schema.safeParse(JSON.parse(extractJson(raw)));

  try {
    const parsed = attempt(text);
    if (parsed.success) return parsed.data;
    throw new Error(JSON.stringify(parsed.error.issues.slice(0, 6)));
  } catch (err) {
    const repaired = await complete({
      ...o,
      noCache: true,
      temperature: 0,
      prompt: [
        o.prompt,
        "",
        "--- Your previous answer was rejected. ---",
        "Previous answer:",
        text.slice(0, 4000),
        "",
        "Validation error:",
        String(err).slice(0, 1200),
        "",
        "Return corrected JSON only. No prose, no code fences.",
      ].join("\n"),
    });
    const parsed = attempt(repaired);
    if (parsed.success) return parsed.data;
    throw new Error(
      `schema validation failed after repair: ${JSON.stringify(parsed.error.issues.slice(0, 6))}`,
    );
  }
}

export const modelNames = () => ({
  geminiQuality: GEMINI_QUALITY,
  geminiBulk: GEMINI_BULK,
  groqQuality: GROQ_QUALITY,
  groqBulk: GROQ_BULK,
});
