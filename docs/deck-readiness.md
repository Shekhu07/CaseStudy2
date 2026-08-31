# Deck readiness — the wishlist-reconnection-prototype MVP

> Source: `github.com/Shekhu07/wishlist-reconnection-prototype`, reviewed 31 Aug 2026, updated same
> day against HEAD `7846a3b` (branch `app-shell`) after a mobile-first UI redesign and a
> repo-structure reorganisation (screenshots moved `docs/*.png` → `docs/images/*.png`; specs moved
> to `docs/specs/`). Every number below is quoted verbatim from that repo's generated reports —
> `docs/gate-report.md`, `docs/experiment-report.md`, `docs/shadow-report.md`, `docs/panel-sizing.md`
> — not recomputed, and unchanged by the redesign (gate-report and shadow-report were only
> re-timestamped/re-measured within noise: search latency 0.13ms→0.09ms, still ≪120ms budget).
> Regenerate the source reports before quoting a number that has since moved.
>
> **Screenshots are visually stale.** The redesign wraps the whole UI in a mobile app-frame
> container; the checked-in PNGs at `docs/images/*.png` predate that and still show the old
> wide-layout chrome. Same filenames, same content underneath, wrong frame — recapture them before
> they go on a slide.

## 1. Slide-ready numbers

Each row is a candidate slide claim, its exact source, and the caveat that must travel with it —
pulled from the repo's own "what this is not evidence for" sections, not softened.

| Claim | Source | Caveat to carry onto the slide |
|---|---|---|
| Exact-match precision **100.0%** (185/185 rendered), recall 100.0% | `gate-report.md` E1 | Labels are generator-derived, not hand-labelled; the generator derives brand/type the same way the matcher does, so a shared error is invisible to this number. Guards regression; is not Phase-1 exit evidence. |
| Zero silent variant substitutions across a **10,000-run fuzz** (18,236 matches, 2,860 tier-2) | `gate-report.md` E1 | Fuzzes stock/query against the 30 committed wishlist items only — does not vary the wishlist shape itself. |
| Query field accuracy **100.0%** over 1,000 queries | `gate-report.md` E2 | Queries are assembled from catalog values, so well-formed by construction. Real queries carry typos/slang/misspellings this set has none of — treat as an upper bound. |
| Match latency p95 **0.01 ms** (budget 120 ms) | `gate-report.md` E3 | In-process JS on one machine, catalog already warm. Shows matching isn't the bottleneck; does not show a deployed service meets SLO. |
| **Zero** wishlist-field leaks across 66 unauthenticated calls | `gate-report.md` E8 | Covers response payload and shadow topic only — not timing side-channels or a real service's access logs. |
| Pairing: **0 violations** across 1,535 suggestions from 535 seeds; 427 seeds produce a look, averaging **3.59 distinct categories** each | `gate-report.md` Pairing | Coverage bounded by the 30-item shipped wishlist (5 shirts, 2 lifecycle-excluded). No adult womenswear bottomwear or kidswear saved, so whole slot combinations are untested. A pass means no wrong pairing among what this wishlist can produce, not proof over an unseen catalog. |
| Staged-ramp monotonicity: **0 of 13,182** already-exposed users changed arm across the full ramp | `experiment-report.md` §1 | Assignment balance measured on sequential synthetic ids; real ids are less uniform and should be re-checked against a sample. |
| Kill-switch drill: **74.5%** relative search-to-purchase drop detected → exposure cut to **0** automatically | `experiment-report.md` §2 | Guardrail readings come from a simulated population whose damage was injected deliberately. They demonstrate the switch fires; they say nothing about whether the real treatment is harmful. |
| Sequential vs. fixed-horizon peeking cost: fixed-horizon false-positive rate inflates to **33.7%** at 40 peeks (nominal 5%); confidence sequence holds at **2.3%** | `experiment-report.md` §3 | Measured on data with no effect at all, by construction — this is a methodology proof, not a product result. |
| Shadow run (real): **41.9%** opportunity rate over 1,296 evaluations (843 tier-1 / 57 tier-2 candidates) | `shadow-report.md` §1 | Measured over catalog-generated queries, not real search traffic — real traffic is heavier in the head and would move this number. |
| τ sweep (real): precision already **100%** at the lowest threshold tested (0.60) — sweep supports **keeping** current thresholds (text 0.72, voice 0.82, image 0.85), not lowering them | `shadow-report.md` §2 | Frame as a finding ("hard predicates already absorb the false positives in this eval set"), not as "the sweep didn't find anything." |
| Panel sizing: a 300–500-tester panel (the plan's own guess) **cannot** detect the primary 5pp lift (needs **19,390**) and **cannot answer B−A at all** (needs **122,787**) | `panel-sizing.md` Headline/Scenarios | This is a risk/limits finding for Part 7, not a footnote — state it as "the plan's guess is short by more than an order of magnitude for the question the experiment exists to answer" (the report's own words). |
| What a 300–500 panel *can* answer: comprehension of why the module appeared, recovery from an unavailable variant, whether the 10 states read correctly, the swapped-fill check | `panel-sizing.md` "What this means for the decision" | Usability questions with usability sample sizes — legitimate scope for the recruited panel described in `GUARDRAILS.md` rule 3. |

### Candidate screenshots (in the prototype repo's `docs/images/*.png`, moved from `docs/*.png`)

`dc01-module-summary`, `dc02-why-appeared`, `dc03-confidence-panel`, `dc06-colour-selector`,
`state5-variant-unavailable`, `e5-recovery-sold-out`, `compare-priority`, `help-me-decide`,
`added-confirmation`, `cr05-stale-comparison`, `typeahead-saved-first`,
`pdp-complete-the-look`.

**Do not use these files as-is** — they predate the mobile-first redesign (see the note above) and
show the old chrome. Recapture from the live deployment after the redesign lands, save to the same
`docs/images/` path, and only then treat this list as slide-ready.

**Before any of these go on a slide or a linked artefact**, AGENTS.md rule 7 requires verifying
the live deployment (`wishlist-reconnection-prototype.vercel.app`) and each screenshot path are
reachable **logged out**. That check has not been run in this pass — see §3.

## 2. What is NOT deck-ready

- **Every simulated-population figure** — the experiment-report §4 cohort recovery table (Control
  19.3% → Treatment A 24.1%/+4.8pp, Treatment B 21.1%/+1.7pp), the shadow-report §3 metric
  read-out table (Buy-from-Wishlist rate, Compare-options rate, etc. by arm), and the shadow-report
  §4 cohort validation. All three reports say this in their own words: "every arm difference was
  planted by the simulator. They demonstrate that the models detect an effect; they say nothing
  about whether the feature has one." These can appear on a slide only as "the measurement
  pipeline is validated and ready to read real data," never as "treatment X lifted metric Y."
- **E1 precision is sample-size-unstable, not a clean 100%.** The README's own gate-report history
  shows measured precision moving between 98.91% (500 pairs, the number in the currently-shipped
  gate-report.md is actually 100.0%/185 rendered — note the README text describes an *earlier*
  measurement state before the E1 fix; always quote the number from the gate-report.md file as it
  stands at deck-freeze time, not from README prose, since the two can drift).
- **Acknowledged, deliberate gaps** — no real size chart or fit score (`status: "unknown"` is
  permanent for fit on this catalog), no real review-quality signal (count and average only, no
  quality judgment), no seller-trust signal, no image/visual similarity search (Tier 3/4 explicitly
  unbuilt, constraint C-5). These are honest scope statements from the repo and are fine to put on
  a "what we deliberately did not build" slide, but must not be implied as future roadmap without
  saying so.
- **The design-canvas/app divergences** (README "Where the code and the design canvas disagree") —
  wordmark, tab names, category art — are implementation details, not MVP evidence. Leave off the
  deck entirely.

## 3. Deck-blocking punch list (tracked in STATUS.md — not solved here)

| Blocker | State as of this review | Where it's tracked |
|---|---|---|
| `docs/part2-metric-decomposition.md`, `part4-problem-definition.md`, `part6-success-metrics.md` still argue the abandoned "Verdict Card + Intent Capture" MVP, not this reconnection prototype | Rewrite scoped (re-argue B×C at search moment; split term B into scheduled vs. self-initiated re-entry; keep pairing on T6 evidence) but not done | `STATUS.md`, "Direction change — 29 Aug 2026" |
| `docs/part5-solution-mvp.md`, `docs/part7-risks.md` | Do not exist | `STATUS.md` item 5 |
| Interview sessions | **0 of 6** run, against a commitment due the day after this review | `STATUS.md` item 1 — flagged as the single largest project risk |
| Harness has no URL-settable experiment arm | `StateSwitcher.tsx`'s `arm` prop is plain component state — a participant sent a plain link cannot be put into Arm D, the only arm where the pairing task (T6) is reachable | `STATUS.md` item 3 |
| `AGENTS.md` rule 5 / `GUARDRAILS.md` rule 4 ("this corpus does not support a wishlist-UI-centric MVP") | Still unamended; contradicts the shipped MVP | `STATUS.md`, "Rules this departs from" |
| Artefact-accessible-logged-out check (AGENTS.md rule 7) | Not run in this pass | This doc, §1 |

None of these are addressed by this document — they're pre-existing, larger pieces of work with
their own owners in STATUS.md. This doc only establishes what's safe to quote once those are
resolved.

## 4. Slide-count sanity check

Rough mapping of the material above onto the 10-slide cap, so nothing here implies a deck longer
than the brief allows:

| Slide (brief part) | Material from this doc |
|---|---|
| Part 5 — Solution/MVP | 2–3 screenshots (module summary, confidence panel, one recovery state) + one line naming what was deliberately not built (fit score, image similarity) |
| Part 6 — Success metrics | Gate-report headline numbers (E1/E8/pairing) as "the measurement infrastructure is built and passing," not as product results |
| Part 6/7 — Experiment design & risk | Monotonicity + kill-switch + sequential-inference numbers as evidence the experiment harness itself is sound; panel-sizing gap as a named risk with the 19,390 / 122,787 figures |
| Part 7 — Risks | Panel-sizing shortfall, interview-recruitment status, the still-unreconciled part2/4/6 thesis if not resolved by submission |

No more than 4 of the 10 slides need to touch this repo directly — the rest of the deck's budget
stays with Parts 1–4 (discovery, problem definition) as the guardrails intend.
