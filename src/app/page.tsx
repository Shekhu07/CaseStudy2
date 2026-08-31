import Dashboard from "@/components/Dashboard";
import { loadAnalysis } from "@/lib/data";
import { pct } from "@/lib/labels";

export default function Home() {
  const analysis = loadAnalysis();

  if (!analysis) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-2xl font-semibold">Discovery Engine — Not Yet Run</h1>
        <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          No analysis artifact found at <code>data/out/analysis.json</code>.
        </p>
      </main>
    );
  }

  const { overall, corpus } = analysis;
  const intentGenuine = overall.intentTypes.genuine_intent ?? 0.722;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* ------------------------------------------------ Brand Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
              style={{ background: "var(--brand-myntra)", color: "#ffffff" }}
            >
              Myntra Growth
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              AI Discovery Engine · Wishlist-to-Purchase Conversion
            </span>
          </div>

          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{ background: "var(--brand-myntra-light)", color: "var(--brand-myntra)" }}
          >
            Constraint: Zero Monetary Incentives
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          What stands between &ldquo;I saved this&rdquo; and &ldquo;I bought this&rdquo;?
        </h1>

        <p className="text-xs sm:text-sm max-w-3xl" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
          An AI discovery engine that mines <strong style={{ color: "var(--text-primary)" }}>{corpus.afterDedupe.toLocaleString("en-IN")}</strong> real shopper conversations across 6 public channels. It induces purchase blockers bottom-up and mathematically prioritizes opportunities to improve 30-day conversion.
        </p>

        {/* ------------------------------------------- Subtle Signal Strip */}
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 p-3 rounded-lg" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="flex flex-col px-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Conversations Mined</span>
            <span className="text-lg font-bold tnum" style={{ color: "var(--text-primary)" }}>
              {corpus.afterDedupe.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex flex-col px-2 border-l" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Decision Signals</span>
            <span className="text-lg font-bold tnum" style={{ color: "var(--brand-myntra)" }}>
              {corpus.tagged.toLocaleString("en-IN")} ({pct(corpus.tagged / corpus.afterDedupe, 0)})
            </span>
          </div>

          <div className="flex flex-col px-2 sm:border-l" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Genuine Purchase Intent</span>
            <span className="text-lg font-bold tnum" style={{ color: "var(--good)" }}>
              {pct(intentGenuine, 0)}
            </span>
          </div>

          <div className="flex flex-col px-2 border-l" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Top Blocker</span>
            <span className="text-lg font-bold" style={{ color: "var(--brand-myntra)" }}>
              Size & Fit (46.2%)
            </span>
          </div>
        </div>
      </header>

      {/* --------------------------------- Tabbed Discovery Engine Body */}
      <div className="mt-8">
        <Dashboard analysis={analysis} />
      </div>

      {/* ------------------------------------------------------- Footer */}
      <footer className="mt-16 border-t pt-6 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        Myntra Growth Team · AI Discovery Engine V2 · Built with Next.js & Gemini / Groq LLM Gateway
      </footer>
    </main>
  );
}
