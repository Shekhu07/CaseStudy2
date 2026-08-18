import { NextResponse } from "next/server";
import { z } from "zod";
import { completeJson } from "@/../pipeline/llm/provider";
import {
  relevancePrompt,
  relevanceSystem,
  taggingPrompt,
  taggingSystem,
} from "@/../pipeline/prompts";
import { loadTaxonomy } from "@/lib/data";
import {
  EXTERNAL_BEHAVIOURS,
  INFORMATION_NEEDS,
  INTENT_TYPES,
  JOURNEY_STAGES,
  SEGMENT_SIGNALS,
  type Doc,
} from "@/../pipeline/types";

/**
 * Runs the real Stage 1 and Stage 3 prompts against one pasted document.
 *
 * Same prompts, same taxonomy, same validation as the batch pipeline — this
 * is the engine, not a demo of it. Caching is disabled: the serverless
 * filesystem is read-only, and a live tester wants a live answer.
 */

export const runtime = "nodejs";
/**
 * Latency here is LLM provider variance, not compute: a measured call ran 47s
 * against the old 60s ceiling, leaving 22% headroom, and a cold sequential pair
 * had already returned 504 to a first-time visitor. Parallelising the two calls
 * halved the exposure; this removes what was left. The function only bills
 * while it is actually awaiting, so a wider ceiling costs nothing on the fast
 * path and simply stops a slow provider from becoming a 504.
 */
export const maxDuration = 120;

const RequestSchema = z.object({ text: z.string().min(15).max(6000) });

const RelevanceResponse = z.object({
  results: z
    .array(
      z.object({
        index: z.number().int(),
        relevant: z.boolean(),
        relevance: z.number().min(0).max(1),
        reason: z.string(),
      }),
    )
    .min(1),
});

/**
 * Models express "nothing to report" as `null` for the two free-text fields,
 * and `.default()` fires only on `undefined`. In the batch pipeline that cost a
 * whole ~20-document batch; here it would 502 the live tester on a single
 * document. Mirrors the coercion in pipeline/types.ts.
 */
const emptyIfNull = z.preprocess((v) => v ?? "", z.string());

const TagResponse = z.object({
  results: z
    .array(
      z.object({
        index: z.number().int(),
        themes: z.array(z.string()).catch([]),
        severity: z.coerce.number().min(1).max(5).catch(3),
        journey_stage: z.enum(JOURNEY_STAGES).catch("evaluate"),
        intent_type: z.enum(INTENT_TYPES).catch("unclear"),
        information_needs: z.array(z.enum(INFORMATION_NEEDS)).catch([]),
        external_behaviour: z.array(z.enum(EXTERNAL_BEHAVIOURS)).catch([]),
        workaround: emptyIfNull,
        segment_signals: z.array(z.enum(SEGMENT_SIGNALS)).catch([]),
        evidence_quote: emptyIfNull,
        confidence: z.coerce.number().min(0).max(1).catch(0.5),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "No LLM key configured on the server." },
      { status: 503 },
    );
  }

  const taxonomy = loadTaxonomy();
  if (!taxonomy) {
    return NextResponse.json(
      { error: "Taxonomy not found. Run the pipeline first." },
      { status: 503 },
    );
  }

  let text: string;
  try {
    text = RequestSchema.parse(await request.json()).text;
  } catch {
    return NextResponse.json(
      { error: "Provide `text` between 15 and 6000 characters." },
      { status: 400 },
    );
  }

  const doc: Doc = {
    id: "live",
    source: "apple",
    url: "",
    date: null,
    rating: null,
    text,
    meta: {},
  };

  try {
    /*
     * Stage 1 and Stage 3 do not depend on each other — stage 3 only needs the
     * document — so they run concurrently and the endpoint costs max(a, b)
     * rather than a + b. That matters: two sequential calls exceeded
     * `maxDuration` on a cold start and returned 504 to the first visitor.
     *
     * The trade is one wasted tagging call when a document turns out to be
     * irrelevant. At live-tester volume that is worth ~25 seconds of latency,
     * and the response contract below is unchanged — an irrelevant document
     * still reports `tag: null`.
     *
     * allSettled, not all: a tagging failure must not fail a request whose
     * answer is "filtered out at Stage 1" and never needed the tag.
     */
    const [relSettled, tagSettled] = await Promise.allSettled([
      completeJson(
        {
          system: relevanceSystem,
          prompt: relevancePrompt([doc]),
          temperature: 0,
          noCache: true,
        },
        RelevanceResponse,
      ),
      completeJson(
        {
          system: taggingSystem(taxonomy.themes),
          prompt: taggingPrompt([doc]),
          temperature: 0,
          noCache: true,
        },
        TagResponse,
      ),
    ]);

    if (relSettled.status === "rejected") throw relSettled.reason;
    const relevance = relSettled.value.results[0];

    if (!relevance.relevant) {
      return NextResponse.json({
        relevance,
        tag: null,
        note: "Filtered out at Stage 1 — the batch pipeline would not tag this document.",
      });
    }

    if (tagSettled.status === "rejected") throw tagSettled.reason;
    const r = tagSettled.value.results[0];

    const validIds = new Set(taxonomy.themes.map((t) => t.id));
    const themes = [...new Set(r.themes.map((s) => s.trim()))]
      .filter((id) => validIds.has(id))
      .map((id) => {
        const t = taxonomy.themes.find((x) => x.id === id)!;
        return { id, name: t.name, definition: t.definition };
      });

    // Same verbatim check the batch stage applies.
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    const quoteVerified = !!r.evidence_quote && norm(text).includes(norm(r.evidence_quote));

    return NextResponse.json({
      relevance,
      tag: {
        themes,
        severity: r.severity,
        journey_stage: r.journey_stage,
        intent_type: r.intent_type,
        information_needs: r.information_needs.filter((n) => n !== "none"),
        external_behaviour: r.external_behaviour.filter((b) => b !== "none"),
        workaround: r.workaround,
        segment_signals: r.segment_signals,
        evidence_quote: quoteVerified ? r.evidence_quote : "",
        quote_verified: quoteVerified,
        confidence: r.confidence,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Classification failed: ${String(err).slice(0, 300)}` },
      { status: 502 },
    );
  }
}
