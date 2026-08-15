import Dashboard from "@/components/Dashboard";
import BarList from "@/components/BarList";
import Section from "@/components/Section";
import Methodology from "@/components/Methodology";
import LiveTest from "@/components/LiveTest";
import { loadAnalysis } from "@/lib/data";
import {
  BEHAVIOUR_LABELS,
  INTENT_LABELS,
  NEED_LABELS,
  SEGMENT_LABELS,
  STAGE_LABELS,
  label,
  pct,
} from "@/lib/labels";

export default function Home() {
  const analysis = loadAnalysis();

  if (!analysis) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-2xl font-semibold">Discovery engine — not yet run</h1>
        <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          No analysis artifact found at <code>data/out/analysis.json</code>. Copy{" "}
          <code>.env.local.example</code> to <code>.env.local</code>, add a Gemini or Groq key, then run:
        </p>
        <pre
          className="mt-4 overflow-x-auto rounded-lg p-4 text-sm"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
        >
          npm run pipeline -- --stage all
        </pre>
      </main>
    );
  }

  const { overall, corpus } = analysis;
  const intentGenuine = overall.intentTypes.genuine_intent ?? 0;
  const topNeed = Object.entries(overall.informationNeeds)[0];
  const topBehaviour = Object.entries(overall.externalBehaviours)[0];

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
      {/* ---------------------------------------------------------- header */}
      <header>
        <p className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
          Myntra · Growth · Wishlist-to-purchase conversion
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl" style={{ maxWidth: "22ch" }}>
          What stands between &ldquo;I saved this&rdquo; and &ldquo;I bought this&rdquo;
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--text-secondary)", maxWidth: "70ch" }}>
          An AI discovery engine over{" "}
          <strong style={{ color: "var(--text-primary)" }}>{corpus.afterDedupe.toLocaleString("en-IN")}</strong>{" "}
          public conversations from five sources. It induces the frictions blocking wishlist purchases
          bottom-up, quantifies each one, and ranks them by how much they could move the metric —
          under the constraint that no solution may use discounts or cashback.
        </p>

        <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {[
            ["opportunities", "Opportunities"],
            ["evidence", "Evidence"],
            ["segments", "Segments"],
            ["behaviour", "Behaviour"],
            ["method", "Method"],
            ["test", "Test the engine"],
          ].map(([id, name]) => (
            <a key={id} href={`#${id}`}>
              {name}
            </a>
          ))}
        </nav>
      </header>

      {/* ------------------------------------------------------ stat tiles */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          value={corpus.tagged.toLocaleString("en-IN")}
          label="documents tagged"
          note={`of ${corpus.afterDedupe.toLocaleString("en-IN")} scraped, after the relevance filter`}
        />
        <Tile
          value={String(analysis.themes.length)}
          label="frictions induced"
          note="derived bottom-up from the corpus, not from a pre-set list"
        />
        <Tile
          value={pct(intentGenuine, 0)}
          label="show genuine purchase intent"
          note="the rest save as inspiration, price-watch, or are unclear"
        />
        <Tile
          value={pct(Object.values(overall.externalBehaviours).reduce((a, b) => a + b, 0), 0)}
          label="leave the app to decide"
          note="they go looking for reassurance somewhere else"
        />
      </div>

      <div className="mt-12 flex flex-col gap-12">
        {/* interactive: matrix + table + evidence + segments */}
        <Dashboard analysis={analysis} />

        {/* ------------------------------------------------ behaviour */}
        <Section
          id="behaviour"
          title={
            topNeed
              ? `${label(NEED_LABELS, topNeed[0])} is the information gap shoppers hit most before deciding`
              : "How shoppers behave before deciding"
          }
          lede="Across the whole relevant corpus, not per theme. This is the shape of the deliberation the wishlist sits inside."
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <Panel
              title="Information shoppers were missing"
              note="Share of tagged documents naming each gap. Documents can name more than one."
            >
              <BarList
                data={Object.entries(overall.informationNeeds).map(([k, v]) => ({
                  key: k,
                  label: label(NEED_LABELS, k),
                  value: v,
                }))}
                colour="var(--series-1)"
                limit={8}
              />
            </Panel>

            <Panel
              title="Where they went for reassurance instead"
              note={
                topBehaviour
                  ? `Most common: ${label(BEHAVIOUR_LABELS, topBehaviour[0]).toLowerCase()}. Every one of these is demand leaving the app mid-decision.`
                  : undefined
              }
            >
              <BarList
                data={Object.entries(overall.externalBehaviours).map(([k, v]) => ({
                  key: k,
                  label: label(BEHAVIOUR_LABELS, k),
                  value: v,
                }))}
                colour="var(--series-2)"
                limit={6}
              />
            </Panel>

            <Panel
              title="Why the item was saved"
              note="A wishlist add is not one behaviour. Only the genuine-intent share is truly addressable by this metric."
            >
              <BarList
                data={Object.entries(overall.intentTypes).map(([k, v]) => ({
                  key: k,
                  label: label(INTENT_LABELS, k),
                  value: v,
                }))}
                colour="var(--series-3)"
                limit={4}
              />
            </Panel>

            <Panel
              title="Where in the journey the friction sits"
              note="Concentration here tells you which surface a solution has to live on."
            >
              <BarList
                data={Object.entries(overall.journeyStages).map(([k, v]) => ({
                  key: k,
                  label: label(STAGE_LABELS, k),
                  value: v,
                }))}
                colour="var(--series-4)"
                limit={5}
              />
            </Panel>

            <Panel
              title="Segment signals across the corpus"
              note="Inferred from text. Used as the denominator for the lift figures above."
            >
              <BarList
                data={Object.entries(overall.segments).map(([k, v]) => ({
                  key: k,
                  label: label(SEGMENT_LABELS, k),
                  value: v,
                }))}
                colour="var(--series-1)"
                limit={7}
              />
            </Panel>

            <Panel
              title="How blocking the friction was"
              note="Severity 1 is a passing remark; 5 means the shopper explicitly refused or abandoned the purchase."
            >
              <BarList
                data={Object.entries(overall.severityHistogram)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([k, v]) => ({
                    key: k,
                    label: `Severity ${k}`,
                    value: v / corpus.tagged,
                  }))}
                colour="var(--series-2)"
                limit={5}
              />
            </Panel>
          </div>
        </Section>

        {/* -------------------------------------------------- methodology */}
        <Section
          id="method"
          title="Six stages, an honest denominator, and every judgement exposed rather than hidden"
          lede="The engine is reproducible: prompts are versioned, the corpus is committed, and each stage checkpoints so results can be regenerated or argued with."
        >
          <Methodology analysis={analysis} />
        </Section>

        {/* ------------------------------------------------------- live */}
        <Section
          id="test"
          title="Test the engine on any text you like"
          lede="This runs the real Stage 1 and Stage 3 prompts against the same induced taxonomy — not a canned response. Paste a review, a Reddit comment, or something deliberately off-topic to watch the relevance filter reject it."
        >
          <LiveTest />
        </Section>
      </div>

      <footer className="mt-16 border-t pt-6 text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        Built for a product-management case study on wishlist-to-purchase conversion. All source
        material is public. Not affiliated with Myntra, AJIO or Nykaa Fashion.
      </footer>
    </main>
  );
}

function Tile({ value, label: text, note }: { value: string; label: string; note: string }) {
  return (
    <div className="card p-4">
      <div className="text-3xl font-semibold tnum" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      <div className="mt-0.5 text-sm" style={{ color: "var(--text-primary)" }}>
        {text}
      </div>
      <div className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        {note}
      </div>
    </div>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      {note && (
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          {note}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}
