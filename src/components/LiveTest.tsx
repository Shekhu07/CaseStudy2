"use client";

import { useState } from "react";
import {
  BEHAVIOUR_LABELS,
  INTENT_LABELS,
  NEED_LABELS,
  SEGMENT_LABELS,
  STAGE_LABELS,
  label,
} from "@/lib/labels";

/*
 * The testable surface of the engine: paste any review, comment or post and
 * watch Stage 1 and Stage 3 run against it live, with the same prompts and
 * the same induced taxonomy the batch corpus was scored with.
 */

interface Result {
  relevance: { relevant: boolean; relevance: number; reason: string };
  tag: null | {
    themes: Array<{ id: string; name: string; definition: string }>;
    severity: number;
    journey_stage: string;
    intent_type: string;
    information_needs: string[];
    external_behaviour: string[];
    workaround: string;
    segment_signals: string[];
    evidence_quote: string;
    quote_verified: boolean;
    confidence: number;
  };
  note?: string;
  error?: string;
}

const EXAMPLES = [
  "I have like 60 things in my wishlist but I never actually buy any of them. Every time I open it I still can't tell if the size will fit me, and the model is 5'9\" so the photos tell me nothing. I end up ordering 3 sizes and returning 2, which is such a hassle that mostly I just don't order at all.",
  "Added a jacket to my wishlist last month waiting for the sale. Sale came and the price was basically the same as before, just with a bigger fake discount tag. Now I don't trust the pricing at all so I just leave things saved and check other apps first.",
  "Delivery was late by four days and the courier never called me. Customer support was useless.",
];

export default function LiveTest() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = (await res.json()) as Result;
      if (!res.ok) setError(json.error ?? `Request failed (${res.status})`);
      else setResult(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setText(ex)}
            className="rounded-full px-3 py-1 text-xs"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface-1)" }}
          >
            {i === EXAMPLES.length - 1 ? "Try an irrelevant one" : `Example ${i + 1}`}
          </button>
        ))}
      </div>

      <label className="sr-only" htmlFor="live-input">
        Paste a review, comment or post to classify
      </label>
      <textarea
        id="live-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Paste any app review, Reddit comment or YouTube comment about shopping for fashion online…"
        className="w-full rounded-lg p-3 text-sm"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          resize: "vertical",
        }}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={loading || text.trim().length < 15}
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{
            background: text.trim().length < 15 || loading ? "var(--grid)" : "var(--series-1)",
            color: text.trim().length < 15 || loading ? "var(--text-muted)" : "#ffffff",
            cursor: text.trim().length < 15 || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Running the engine…" : "Run the engine"}
        </button>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Stage 1 relevance filter, then Stage 3 tagging. Usually 5–15 seconds.
        </span>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--critical)" }} role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="card p-4">
          <Row
            k="Stage 1 — relevant?"
            v={
              <span style={{ color: result.relevance.relevant ? "var(--good)" : "var(--text-muted)" }}>
                {result.relevance.relevant ? "Yes" : "No"} · confidence{" "}
                <span className="tnum">{result.relevance.relevance.toFixed(2)}</span>
              </span>
            }
          />
          <Row k="Reason" v={result.relevance.reason} />

          {result.note && (
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              {result.note}
            </p>
          )}

          {result.tag && (
            <div className="mt-4 flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <Row
                k="Friction themes"
                v={
                  result.tag.themes.length > 0 ? (
                    <span className="flex flex-wrap gap-1.5">
                      {result.tag.themes.map((t) => (
                        <span
                          key={t.id}
                          title={t.definition}
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ background: "var(--seq-100)", color: "var(--seq-700)" }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>None in the induced taxonomy</span>
                  )
                }
              />
              <Row k="Severity" v={<span className="tnum">{result.tag.severity} / 5</span>} />
              <Row k="Journey stage" v={label(STAGE_LABELS, result.tag.journey_stage)} />
              <Row k="Intent" v={label(INTENT_LABELS, result.tag.intent_type)} />
              <Row
                k="Information needed"
                v={result.tag.information_needs.map((n) => label(NEED_LABELS, n)).join(", ") || "—"}
              />
              <Row
                k="Went outside the app"
                v={result.tag.external_behaviour.map((b) => label(BEHAVIOUR_LABELS, b)).join(", ") || "—"}
              />
              <Row
                k="Segment signals"
                v={result.tag.segment_signals.map((s) => label(SEGMENT_LABELS, s)).join(", ") || "—"}
              />
              <Row k="Current workaround" v={result.tag.workaround || "—"} />
              <Row
                k="Evidence quote"
                v={
                  result.tag.quote_verified ? (
                    <em>&ldquo;{result.tag.evidence_quote}&rdquo;</em>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>
                      none verified — the model&rsquo;s quote was not a literal substring, so it was discarded
                    </span>
                  )
                }
              />
              <Row k="Confidence" v={<span className="tnum">{result.tag.confidence.toFixed(2)}</span>} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-1 text-sm" style={{ gridTemplateColumns: "minmax(120px, 170px) 1fr" }}>
      <span style={{ color: "var(--text-muted)" }}>{k}</span>
      <span style={{ color: "var(--text-secondary)" }}>{v}</span>
    </div>
  );
}
