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
export type Tier = "bulk" | "quality";

export const MODELS_USED = new Set<string>();

/*
 * Read lazily, never into module-level consts.
 *
 * ES module imports are all evaluated before the importing module's own body
 * runs, so this file is initialised BEFORE run.ts calls dotenv. Capturing
 * process.env at module load silently ignored every model override in
 * .env.local and quietly fell back to the defaults. API keys were unaffected
 * only because they happen to be read inside the request functions.
 */
const geminiModel = (t: Tier) =>
  t === "bulk"
    ? (process.env.GEMINI_MODEL_BULK ?? "gemini-3.1-flash-lite")
    : (process.env.GEMINI_MODEL ?? "gemini-3.7-flash");

const groqModel = (t: Tier) =>
  t === "bulk"
    ? (process.env.GROQ_MODEL_BULK ?? "llama-3.3-70b-versatile")
    : (process.env.GROQ_MODEL ?? "openai/gpt-oss-120b");

export interface CallOptions {
  system: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Which model tier to use. Defaults to "quality". */
  tier?: Tier;
  /**
   * Refuse to fall back to the other tier. For steps where a weaker model
   * silently producing a worse answer is more damaging than no answer —
   * the final taxonomy consolidation being the clear case, since every
   * downstream number inherits its definitions.
   */
  pinTier?: boolean;
  /** Bypass cache — used by the live API route. */
  noCache?: boolean;
}

class RateLimited extends Error {}

/**
 * A per-minute limit is worth waiting out; a per-DAY quota is not. Once a
 * provider's daily free quota is gone it stays gone until Pacific midnight,
 * and every subsequent retry cycle burns ~60s of wall clock before falling
 * through. Providers that report daily exhaustion are parked for the rest
 * of the process.
 */
/**
 * Keyed by `provider:model`, never by provider alone. Free-tier quotas are
 * per-model: burning llama-3.3-70b's daily tokens says nothing about
 * gpt-oss-120b, and parking the whole provider on one dead model needlessly
 * throws away working capacity.
 */
const exhausted = new Set<string>();

/**
 * Must be narrow. An earlier version matched the substring "per day" and so
 * parked Groq — whose binding constraint is tokens per MINUTE — as though it
 * were out for the day. Only explicit per-day wording counts; a TPM limit is
 * a pause, not an outage.
 */
function isDailyQuota(body: string): boolean {
  return (
    /GenerateRequestsPerDay|GenerateContentInputTokensPerModelPerDay/i.test(body) ||
    /per day \((RPD|TPD)\)/i.test(body)
  );
}

/** Providers tell us exactly how long to wait; obey them instead of guessing. */
function retryAfterMs(body: string, headers: Headers): number | null {
  const header = headers.get("retry-after");
  if (header && Number.isFinite(Number(header))) return Number(header) * 1000;

  // Groq: "Please try again in 17.085s"  |  Gemini: "retryDelay": "34s"
  const m = body.match(/try again in ([\d.]+)s/i) ?? body.match(/"retryDelay":\s*"([\d.]+)s"/i);
  return m ? Math.ceil(Number(m[1]) * 1000) : null;
}

/** Carries a provider-specified wait so the retry loop does not guess. */
class RetryAfter extends RateLimited {
  constructor(public waitMs: number, message: string) {
    super(message);
  }
}

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

  if (res.status === 429) {
    const body = await res.text();
    if (isDailyQuota(body)) {
      exhausted.add(`gemini:${model}`);
      throw new Error(`gemini daily free quota exhausted for ${model}`);
    }
    const wait = retryAfterMs(body, res.headers);
    throw wait ? new RetryAfter(wait, "gemini 429") : new RateLimited("gemini 429");
  }
  if (res.status >= 500) throw new RateLimited(`gemini ${res.status}`);
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

  const system = `${o.system}\n\nRespond with JSON only.`;

  /*
   * Groq bills `max_tokens` against the tokens-per-minute budget UP FRONT,
   * as reserved capacity — the error reads "Requested 9071" for a request
   * whose input is under 1k. With the old default of 8192 every single Groq
   * call exceeded the 8,000 TPM ceiling before it sent a byte of input, so
   * no Groq request could ever have succeeded.
   *
   * Reserve only what is left after the input, with headroom for the
   * provider's own tokenisation differing from this estimate.
   */
  const tpm = Number(process.env.GROQ_TPM ?? 8000);
  const estimatedInput = Math.ceil((system.length + o.prompt.length) / 3.5);
  const headroom = 400;
  const available = tpm - estimatedInput - headroom;

  if (available < 400) {
    // Not a rate problem: this prompt cannot fit the window at any speed.
    throw new Error(
      `groq prompt too large: ~${estimatedInput} input tokens leaves ${available} of a ${tpm} TPM budget. Reduce the batch size.`,
    );
  }

  const maxTokens = Math.max(400, Math.min(o.maxOutputTokens ?? 4096, available));

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: o.prompt },
      ],
      response_format: { type: "json_object" },
      temperature: o.temperature ?? 0.1,
      max_tokens: maxTokens,
    }),
  });

  if (res.status === 429) {
    const body = await res.text();
    if (isDailyQuota(body)) {
      exhausted.add(`groq:${model}`);
      throw new Error(`groq daily free quota exhausted for ${model}`);
    }
    const wait = retryAfterMs(body, res.headers);
    throw wait ? new RetryAfter(wait, "groq 429") : new RateLimited("groq 429");
  }
  if (res.status >= 500) throw new RateLimited(`groq ${res.status}`);
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

  const all: Array<[string, (o: CallOptions) => Promise<string>]> = [];
  if (process.env.GEMINI_API_KEY) all.push(["gemini", callGemini]);
  if (process.env.GROQ_API_KEY) all.push(["groq", callGroq]);
  if (all.length === 0) {
    throw new Error("No LLM key configured. Set GEMINI_API_KEY and/or GROQ_API_KEY.");
  }

  const requested = o.tier ?? "quality";
  const available = (t: Tier) => {
    const modelFor: Record<string, string> = { gemini: geminiModel(t), groq: groqModel(t) };
    return all.filter(([name]) => !exhausted.has(`${name}:${modelFor[name]}`));
  };

  /*
   * Fall back across tiers, not just across providers. The tiers exist to
   * spend the better models where quality matters, but a slightly weaker
   * model that answers beats a preferred one that is out of quota — and the
   * tiers draw on separate per-model daily allowances, so the other tier is
   * often still live when this one is spent.
   */
  let tier = requested;
  let providers = available(tier);

  if (providers.length === 0 && o.pinTier) {
    throw new Error(
      `the "${requested}" tier is exhausted and this call is pinned to it — refusing to ` +
        "answer with a weaker model. Re-run after the quota resets at midnight US Pacific.",
    );
  }

  if (providers.length === 0) {
    const other: Tier = requested === "quality" ? "bulk" : "quality";
    const fallback = available(other);
    if (fallback.length > 0) {
      log("llm", `"${requested}" tier exhausted — falling back to the "${other}" tier`);
      tier = other;
      providers = fallback;
    }
  }

  if (providers.length === 0) {
    throw new Error(
      `every model on both tiers has exhausted its daily free quota ` +
        `(${[...exhausted].join(", ")}). Quotas reset at midnight US Pacific; re-run then ` +
        "and the on-disk cache will resume exactly where this stopped.",
    );
  }

  o = { ...o, tier };

  let lastErr: unknown;

  /*
   * One sweep, then give up quickly.
   *
   * An earlier version waited 60s and swept again. That was a hangover from
   * misreading a per-minute limit as a daily outage, and it made throughput
   * collapse: every contended call burned minutes before returning. Now that
   * a failure is never persisted as a verdict, failing fast is strictly
   * better — the stage finishes, checkpoints what it got, and the next run
   * picks up the remainder for free from the cache.
   */
  for (const [name, fn] of providers) {
    for (let attempt = 0; attempt < 3; attempt++) {
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
          // Prefer the provider's own retry-after; jitter keeps concurrent
          // workers from retrying in lockstep and re-triggering the limit.
          const wait =
            err instanceof RetryAfter
              ? Math.min(err.waitMs * (1 + Math.random() * 0.3) + 500, 45_000)
              : 1500 * 2 ** attempt * (1 + Math.random());
          await sleep(wait);
          continue;
        }
        break; // non-retryable for this provider; try the next
      }
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

  /*
   * Models frequently return the bare payload — `[{…},{…}]` — where the
   * schema asks for `{"results": [{…}]}`. The content is right; only the
   * envelope is missing. Re-wrapping costs nothing and recovers batches that
   * were previously discarded outright (16 of them in one tagging run).
   */
  const attempt = (raw: string) => {
    const value = JSON.parse(extractJson(raw));
    const first = schema.safeParse(value);
    if (first.success || !Array.isArray(value)) return first;

    /*
     * On failure, prefer the WRAPPED error over the bare one. If the envelope
     * was the only thing missing, `{results: [...]}` gets much further before
     * failing, and its error names the offending field — "results[0].workaround
     * expected string" — where the unwrapped error only ever says "expected
     * object, received array". That difference is not cosmetic: this error is
     * what the repair round-trip below shows the model, so the useless version
     * guaranteed the retry failed too, and the batch was discarded twice over.
     */
    let best = first;
    for (const key of ["results", "themes", "judgements"]) {
      const wrapped = schema.safeParse({ [key]: value });
      if (wrapped.success) return wrapped;
      if (best === first) best = wrapped;
    }
    return best;
  };

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
  geminiQuality: geminiModel("quality"),
  geminiBulk: geminiModel("bulk"),
  groqQuality: groqModel("quality"),
  groqBulk: groqModel("bulk"),
});
