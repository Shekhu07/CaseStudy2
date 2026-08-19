import type { Analysis } from "@/lib/labels";
import { SOURCE_LABELS, formatDate, label, pct } from "@/lib/labels";

/*
 * The panel that separates this from "I pasted reviews into a chatbot":
 * where the corpus came from, how much survived each filter, what the model
 * was asked to do at each stage, and what the score actually computes.
 *
 * Built to be screenshot straight into the deck's required
 * "1-slider explaining how the discovery engine works".
 */

const STAGES = [
  {
    n: "0",
    name: "Ingest",
    what: "Six public sources scraped into one normalised schema, deduped by content hash across sources. The sources are deliberately structurally different — app-store reviews, long-form written reviews, forum threads and video comments — so no single channel's bias sets the agenda.",
  },
  {
    n: "1",
    name: "Relevance filter",
    what: "Every document classified: does it say anything about the decision to buy? Delivery, refund and crash complaints are dropped, so later percentages have an honest denominator.",
  },
  {
    n: "2",
    name: "Taxonomy induction",
    what: "Friction themes induced bottom-up from a sample, in independent batches, then consolidated. No pre-baked list of e-commerce problems — the brief withholds the problem on purpose.",
  },
  {
    n: "3",
    name: "Structured tagging",
    what: "Each relevant document tagged with themes, severity, journey stage, intent type, information gaps, out-of-app behaviour, workaround, segment signals and a verbatim quote that is verified as a literal substring.",
  },
  {
    n: "4",
    name: "Scoring",
    what: "Themes aggregated into reach (with Wilson intervals), severity, metric proximity and tractability, then combined into a comparable opportunity score.",
  },
  {
    n: "5",
    name: "Segmentation",
    what: "Theme × segment lift, to establish which frictions are concentrated in which shoppers.",
  },
];

export default function Methodology({ analysis }: { analysis: Analysis }) {
  const { corpus } = analysis;
  const sources = Object.entries(corpus.bySource).filter(([, v]) => v.raw > 0);

  return (
    <div className="flex flex-col gap-8">
      {/* funnel */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Corpus funnel
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {[
            ["Scraped", corpus.raw, "documents pulled from six public sources"],
            ["After dedupe", corpus.afterDedupe, "unique documents"],
            ["Relevant", corpus.relevant, "survived the Stage 1 filter"],
            ["Tagged", corpus.tagged, "carry full structured tags"],
          ].map(([k, v, why]) => (
            <div key={k as string} className="card p-3">
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {k as string}
              </div>
              <div className="mt-0.5 text-2xl font-semibold tnum" style={{ color: "var(--text-primary)" }}>
                {(v as number).toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                {why as string}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
          {pct(corpus.relevant / corpus.afterDedupe, 0)} of the deduped corpus passed the relevance
          filter. Every percentage on this page is computed against the {corpus.tagged.toLocaleString("en-IN")}{" "}
          tagged documents, never against the raw scrape.
        </p>
      </div>

      {/* sources */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Where the corpus came from
        </h3>
        <div className="mt-3 scroll-x">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--axis)" }}>
                {["Source", "Scraped", "Relevant", "Pass rate"].map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-3 py-2 font-medium"
                    style={{ textAlign: i === 0 ? "left" : "right", color: "var(--text-muted)", fontSize: 12 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map(([s, v]) => (
                <tr key={s} style={{ borderBottom: "1px solid var(--grid)" }}>
                  <td className="px-3 py-2" style={{ color: "var(--text-secondary)" }}>
                    {label(SOURCE_LABELS, s)}
                  </td>
                  <td className="px-3 py-2 text-right tnum" style={{ color: "var(--text-secondary)" }}>
                    {v.raw.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2 text-right tnum" style={{ color: "var(--text-secondary)" }}>
                    {v.relevant.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2 text-right tnum" style={{ color: "var(--text-muted)" }}>
                    {v.raw > 0 ? pct(v.relevant / v.raw, 0) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          Date range {formatDate(corpus.dateRange.from)} – {formatDate(corpus.dateRange.to)}. Competitor
          documents (AJIO, Nykaa Fashion) are held in their own source so comparison behaviour can be
          studied without contaminating Myntra-specific figures.
        </p>
      </div>

      {/* pipeline */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          What runs, in order
        </h3>
        <ol className="mt-3 flex flex-col gap-2">
          {STAGES.map((s) => (
            <li key={s.n} className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tnum"
                style={{ background: "var(--seq-100)", color: "var(--seq-700)" }}
              >
                {s.n}
              </span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{s.name}.</strong>{" "}
                {s.what}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* limits */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          What this cannot tell you
        </h3>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm" style={{ color: "var(--text-secondary)", maxWidth: "72ch" }}>
          <li>
            — Public reviews over-represent the frustrated. Reach here means share of people who wrote
            something, not share of Myntra&rsquo;s users.
          </li>
          <li>
            — Segments are inferred from text, not from account data, so they are behavioural signals
            rather than a validated user taxonomy.
          </li>
          <li>
            — Metric proximity and tractability are model judgements with written rationales. They are
            arguable inputs, deliberately exposed rather than hidden inside the score.
          </li>
          <li>
            — X and Quora are absent. X&rsquo;s API is paid-only and Meta&rsquo;s platforms are closed to
            this access pattern, so no free compliant route existed. Myntra&rsquo;s own product-page
            reviews are also absent; the pre-purchase fear they encode is instead captured by the
            relevance filter&rsquo;s expectation-gap rule.
          </li>
          <li>
            — Comparison sets and occasion-bound saves are not separated out as intent types; both sit
            inside genuine intent. This corpus can say how many shoppers meant to buy, not how many were
            weighing one saved item against another. Interviews resolve that split.
          </li>
          <li>
            — This is discovery, not proof. It ranks where to look; primary research is what confirms
            the problem.
          </li>
        </ul>
      </div>

      {/* provenance */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Data provenance
        </h3>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)", maxWidth: "72ch" }}>
          Every document is publicly posted content, collected through official APIs or published
          endpoints, aggregated and de-identified. No account data, no private messages and no personal
          data are stored: the corpus keeps only the text, its source, its date and a content hash.
          Usernames are not retained, and quotes are shown verbatim but unattributed.
        </p>
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Models: {analysis.models.join(", ")} · generated {formatDate(analysis.generatedAt)}
      </p>
    </div>
  );
}
