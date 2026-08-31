"use client";

import { useState } from "react";
import OpportunityMatrix from "./OpportunityMatrix";
import ThemeTable from "./ThemeTable";
import ThemeDetail from "./ThemeDetail";
import SegmentHeatmap from "./SegmentHeatmap";
import BarList from "./BarList";
import LiveTest from "./LiveTest";
import Methodology from "./Methodology";
import type { Analysis, ThemeScore } from "@/lib/labels";
import {
  BEHAVIOUR_LABELS,
  INTENT_LABELS,
  NEED_LABELS,
  SEGMENT_LABELS,
  STAGE_LABELS,
  SOURCE_LABELS,
  formatDate,
  label,
  pct,
} from "@/lib/labels";

type Tab = "opportunities" | "hesitations" | "personas" | "live_test" | "methodology";
type ViewMode = "cards" | "matrix" | "table";
type Cohort = "myntra" | "all";

export default function Dashboard({ analysis }: { analysis: Analysis }) {
  const [activeTab, setActiveTab] = useState<Tab>("opportunities");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [cohort, setCohort] = useState<Cohort>("myntra");
  const [selectedId, setSelectedId] = useState<string | null>(
    analysis.themesExCompetitor?.[0]?.id ?? analysis.themes[0]?.id ?? null,
  );
  const [selectedPersona, setSelectedPersona] = useState<string>("fit_uncertainty_prone");

  const themes =
    cohort === "myntra" ? (analysis.themesExCompetitor ?? analysis.themes) : analysis.themes;

  const selectedTheme = themes.find((t) => t.id === selectedId) ?? themes[0];
  const { overall } = analysis;

  const PERSONA_INFO: Record<
    string,
    { title: string; share: string; highlight: string; quote: string; workaround: string }
  > = {
    fit_uncertainty_prone: {
      title: "Fit-Uncertain Shopper",
      share: "28.3% of Myntra deliberation",
      highlight: "3.99× lift on Size & Fit doubts",
      quote:
        "Size chart says 38 for M but reviews say it runs tight around the shoulders. Postponing until someone posts a try-on haul.",
      workaround: "Searches YouTube for haul videos with creator height/weight references before buying.",
    },
    new_or_low_trust_user: {
      title: "New / Low-Trust Shopper",
      share: "20.9% of Myntra deliberation",
      highlight: "2.81× lift on Seller Trust & Authenticity",
      quote:
        "Is this seller genuine? Seen reviews saying fabric feels like cheap polyester instead of pure cotton.",
      workaround: "Checks Reddit r/IndianFashionAddicts and cross-checks the brand's official D2C website.",
    },
    bulk_orderer_returner: {
      title: "Bulk-Orderer Returner",
      share: "6.2% of Myntra deliberation",
      highlight: "2.45× lift on Return Policy Friction",
      quote: "I always order both M and L because sizes are inconsistent, then return whichever doesn't fit.",
      workaround: "Orders 2–3 sizes simultaneously with the explicit plan to return the ill-fitting ones.",
    },
    price_sensitive: {
      title: "Price-Sensitive Shopper",
      share: "18.5% of Myntra deliberation",
      highlight: "2.10× lift on Price Volatility & Fees",
      quote: "Added to wishlist waiting for price drop, but extra convenience and COD fees got added at checkout.",
      workaround: "Saves items and monitors them manually over weeks waiting for sale events.",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ----------------- Clean Tab Navigation Bar ----------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--border)" }}>
        <nav className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          {[
            { id: "opportunities", label: "🎯 Key Opportunities", desc: "Ranked friction themes" },
            { id: "hesitations", label: "🔍 Hesitation Map", desc: "Why shoppers stall" },
            { id: "personas", label: "👥 Shopper Personas", desc: "Who is blocked" },
            { id: "live_test", label: "⚡ Live AI Classifier", desc: "Test real-time" },
            { id: "methodology", label: "📐 Method & Math", desc: "Pipeline & formulas" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all"
                style={{
                  background: isActive ? "var(--brand-myntra)" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Cohort Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: "var(--text-muted)" }}>Data Cohort:</span>
          <div className="inline-flex rounded-md p-0.5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <button
              onClick={() => setCohort("myntra")}
              className="px-2.5 py-1 rounded text-xs font-semibold"
              style={{
                background: cohort === "myntra" ? "var(--brand-myntra-light)" : "transparent",
                color: cohort === "myntra" ? "var(--brand-myntra)" : "var(--text-muted)",
              }}
            >
              Myntra Pure ({analysis.corpus.taggedExCompetitor?.toLocaleString()})
            </button>
            <button
              onClick={() => setCohort("all")}
              className="px-2.5 py-1 rounded text-xs font-semibold"
              style={{
                background: cohort === "all" ? "var(--brand-myntra-light)" : "transparent",
                color: cohort === "all" ? "var(--brand-myntra)" : "var(--text-muted)",
              }}
            >
              All Sources ({analysis.corpus.tagged.toLocaleString()})
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: KEY OPPORTUNITIES                                     */}
      {/* ============================================================ */}
      {activeTab === "opportunities" && (
        <div className="flex flex-col gap-6">
          {/* Subheader & View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Ranked Purchase Blockers
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                Scored by reach, severity, and solvability <strong>without monetary incentives</strong>. Click any card to inspect shopper quotes.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-md text-xs" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
              {[
                { id: "cards", label: "Cards" },
                { id: "matrix", label: "2D Matrix" },
                { id: "table", label: "Table" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setViewMode(m.id as ViewMode)}
                  className="px-2.5 py-1 rounded font-medium transition-all"
                  style={{
                    background: viewMode === m.id ? "var(--brand-myntra)" : "transparent",
                    color: viewMode === m.id ? "#ffffff" : "var(--text-muted)",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* CARD VIEW */}
          {viewMode === "cards" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t, idx) => {
                const isSelected = t.id === selectedId;
                const isTopTheme = idx === 0 || idx === 1;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className="card p-4 flex flex-col justify-between cursor-pointer transition-all"
                    style={{
                      border: isSelected
                        ? "2px solid var(--brand-myntra)"
                        : "1px solid var(--border)",
                      background: isSelected ? "var(--surface-2)" : "var(--surface-1)",
                      transform: isSelected ? "translateY(-1px)" : undefined,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                          style={{
                            background: isTopTheme ? "var(--brand-myntra)" : "var(--grid)",
                            color: isTopTheme ? "#ffffff" : "var(--text-muted)",
                          }}
                        >
                          #{idx + 1} {idx === 0 ? "Highest Impact" : ""}
                        </span>
                        <span className="text-xs font-semibold tnum" style={{ color: "var(--brand-myntra)" }}>
                          Score: {t.opportunityScore.toFixed(3)}
                        </span>
                      </div>

                      <h3 className="mt-2.5 text-sm font-bold line-clamp-1" style={{ color: "var(--text-primary)" }}>
                        {t.name}
                      </h3>
                      <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--text-secondary)", lineHeight: "1.4" }}>
                        {t.definition}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--grid)" }}>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Reach: </span>
                        <strong className="tnum" style={{ color: "var(--text-primary)" }}>{pct(t.reach)}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Severity: </span>
                        <strong className="tnum" style={{ color: "var(--text-primary)" }}>{t.severityMean.toFixed(1)}/5</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Solvability: </span>
                        <strong className="tnum" style={{ color: "var(--good)" }}>{(t.tractability * 100).toFixed(0)}%</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2D MATRIX VIEW */}
          {viewMode === "matrix" && (
            <div className="card p-5">
              <OpportunityMatrix themes={themes} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <div className="card p-4">
              <ThemeTable themes={themes} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          )}

          {/* SELECTED THEME EVIDENCE & INSIGHTS DRAWER */}
          {selectedTheme && (
            <div className="card p-6 border-l-4" style={{ borderLeftColor: "var(--brand-myntra)" }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--brand-myntra)" }}>
                    Selected Friction Deep-Dive
                  </span>
                  <h3 className="text-lg font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>
                    {selectedTheme.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800">
                    <span style={{ color: "var(--text-muted)" }}>Corpus Reach: </span>
                    <strong style={{ color: "var(--text-primary)" }}>{pct(selectedTheme.reach)} ({selectedTheme.count} docs)</strong>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800">
                    <span style={{ color: "var(--text-muted)" }}>Mean Severity: </span>
                    <strong style={{ color: "var(--text-primary)" }}>{selectedTheme.severityMean.toFixed(2)} / 5.0</strong>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                {selectedTheme.definition}
              </p>

              {/* Verified Verbatim Quotes Grid */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Verified Shopper Quotes (Literal Substring Validated)
                </h4>
                <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                  {selectedTheme.quotes.slice(0, 4).map((q, i) => (
                    <div key={i} className="p-3 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      <p className="text-xs sm:text-sm italic" style={{ color: "var(--text-primary)" }}>
                        &ldquo;{q.text}&rdquo;
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <span>Source: <strong style={{ color: "var(--text-secondary)" }}>{label(SOURCE_LABELS, q.source)}</strong></span>
                        <span>Severity: <strong>{q.severity}/5</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workarounds */}
              {selectedTheme.workarounds.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Documented Real-World Workarounds
                  </h4>
                  <ul className="mt-1.5 flex flex-wrap gap-2">
                    {selectedTheme.workarounds.slice(0, 3).map((w, idx) => (
                      <li key={idx} className="px-3 py-1 rounded-full text-xs" style={{ background: "var(--brand-myntra-light)", color: "var(--brand-myntra)" }}>
                        ↳ {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: HESITATION MAP                                        */}
      {/* ============================================================ */}
      {activeTab === "hesitations" && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              The Shopper Hesitation Map
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Analysis of what happens between finding a product and deciding not to purchase.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Doubts */}
            <div className="card p-5">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Unresolved Pre-Purchase Doubts
              </h3>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Specific questions shoppers could not answer on the product page.
              </p>
              <div className="mt-4">
                <BarList
                  data={Object.entries(overall.informationNeeds).map(([k, v]) => ({
                    key: k,
                    label: label(NEED_LABELS, k),
                    value: v,
                  }))}
                  colour="var(--brand-myntra)"
                  limit={6}
                />
              </div>
            </div>

            {/* External Seeking */}
            <div className="card p-5">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Where Shoppers Go for Validation
              </h3>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Channels shoppers visit when in-app product information is insufficient.
              </p>
              <div className="mt-4">
                <BarList
                  data={Object.entries(overall.externalBehaviours).map(([k, v]) => ({
                    key: k,
                    label: label(BEHAVIOUR_LABELS, k),
                    value: v,
                  }))}
                  colour="var(--series-2)"
                  limit={6}
                />
              </div>
            </div>
          </div>

          {/* Intent Breakdown */}
          <div className="card p-5">
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Save Intent: Convertible Demand vs Bookmarking
            </h3>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Wishlisting is not uniform: 72.2% represents immediate convertible demand blocked by doubt.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="p-3 rounded-lg border" style={{ borderColor: "var(--brand-myntra)", background: "var(--brand-myntra-light)" }}>
                <div className="text-2xl font-bold tnum" style={{ color: "var(--brand-myntra)" }}>72.2%</div>
                <div className="text-xs font-bold mt-1" style={{ color: "var(--brand-myntra)" }}>Genuine Purchase Intent</div>
                <div className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>Saved with intent to buy; blocked by fit, fabric, or seller doubt.</div>
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
                <div className="text-2xl font-bold tnum" style={{ color: "var(--text-primary)" }}>6.8%</div>
                <div className="text-xs font-bold mt-1" style={{ color: "var(--text-secondary)" }}>Aspirational Bookmark</div>
                <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>Moodboards, dream items, or out-of-season saves.</div>
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
                <div className="text-2xl font-bold tnum" style={{ color: "var(--text-primary)" }}>4.1%</div>
                <div className="text-xs font-bold mt-1" style={{ color: "var(--text-secondary)" }}>Price Watch</div>
                <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>Parked exclusively waiting for a discount (banned lever).</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SHOPPER PERSONAS                                      */}
      {/* ============================================================ */}
      {activeTab === "personas" && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Shopper Segments & Friction Lift
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Different cohorts suffer from completely different decision frictions. Select a persona to see their profile.
            </p>
          </div>

          {/* Persona Selector Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(PERSONA_INFO).map(([key, info]) => {
              const isSelected = selectedPersona === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedPersona(key)}
                  className="card p-4 cursor-pointer transition-all"
                  style={{
                    border: isSelected ? "2px solid var(--brand-myntra)" : "1px solid var(--border)",
                    background: isSelected ? "var(--surface-2)" : "var(--surface-1)",
                  }}
                >
                  <div className="text-xs font-bold" style={{ color: isSelected ? "var(--brand-myntra)" : "var(--text-muted)" }}>
                    {info.share}
                  </div>
                  <h3 className="text-sm font-bold mt-1" style={{ color: "var(--text-primary)" }}>
                    {info.title}
                  </h3>
                  <div className="mt-2 text-xs font-semibold px-2 py-0.5 rounded inline-block" style={{ background: "var(--brand-myntra-light)", color: "var(--brand-myntra)" }}>
                    {info.highlight}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Persona Deep-Dive */}
          {PERSONA_INFO[selectedPersona] && (
            <div className="card p-6 border-l-4" style={{ borderLeftColor: "var(--brand-myntra)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {PERSONA_INFO[selectedPersona].title} — Behavioral Deep Dive
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded" style={{ background: "var(--brand-myntra-light)", color: "var(--brand-myntra)" }}>
                  {PERSONA_INFO[selectedPersona].highlight}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="p-3.5 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Representative Shopper Voice
                  </div>
                  <p className="mt-2 text-sm italic" style={{ color: "var(--text-primary)" }}>
                    &ldquo;{PERSONA_INFO[selectedPersona].quote}&rdquo;
                  </p>
                </div>
                <div className="p-3.5 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Current Coping Workaround
                  </div>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {PERSONA_INFO[selectedPersona].workaround}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Full Segment Lift Matrix */}
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Full Segment × Theme Lift Matrix
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Lift &gt; 1.0 indicates a segment is disproportionately blocked by that specific friction.
            </p>
            <SegmentHeatmap
              themes={analysis.themes}
              segmentThemeLift={analysis.segmentThemeLift}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: LIVE AI CLASSIFIER                                    */}
      {/* ============================================================ */}
      {activeTab === "live_test" && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Test the AI Discovery Engine
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Runs live zero-shot inference with the real Stage 1 (Relevance) and Stage 3 (Structured Tagging) models.
            </p>
          </div>
          <LiveTest />
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: METHODOLOGY & MATH                                    */}
      {/* ============================================================ */}
      {activeTab === "methodology" && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Methodology, Prompts & Mathematical Formulations
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Mathematical models, Wilson confidence intervals, and pipeline execution logs.
            </p>
          </div>
          <Methodology analysis={analysis} />
        </div>
      )}
    </div>
  );
}
