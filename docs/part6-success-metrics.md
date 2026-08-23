# Part 6 — Define success

> Working draft. Every metric here hangs off a named term of the Part 2 tree; nothing
> is invented for the slide. Myntra-only, pre-purchase cohort (n = 2,340) wherever a
> corpus figure appears.
>
> **Scope this measures.** The MVP is the Verdict Card (fit verdict with stated
> confidence, extractive review evidence, worth-it) plus save-time Intent Capture.
> Metrics for modules we are not shipping are not listed — see §6.8.

## 6.1 North star — W30, gross and net

Inherited verbatim from Part 2 §2.1, so the two documents cannot drift:

**W30** = users who purchased ≥1 previously-wishlisted item, where the purchase fell
within 30 days of *that item's* save event ÷ users who wishlisted ≥1 item in the period.

| | Definition | Baseline | Target | Rationale |
|---|---|---|---|---|
| **North star** | W30 as above, reported **gross and net of returns** | Read from internal data, day 1. Modelled at **9.4%** from `0.722 × 0.45 × 0.34 × 0.85` | **+15% relative in 8 weeks** (9.4% → 10.8%) | It is the brief's metric, it is user-level, and it is the only number that requires the whole chain to work |

**Gross and net are one metric reported twice, not two metrics.** A fit tool that
produces confident *wrong-size* orders raises gross W30 while destroying the value it
claims to create. Reporting only gross would let the feature pass its own test while
failing the business. Net W30 is the honest number; gross is the diagnostic that tells
you *why* net moved.

**Why +15% and not the +29% the model implies.** Part 2 §2.5 shows a ten-point gain on
doubt resolution (34% → 44%) yields +29% relative on W30. We target **+15%** because
that is what ~7,200 users per arm can actually detect at 95%/80% (§6.7), and because a
term whose absolute value is still unmeasured should not carry a precise promise. The
powered floor corresponds to doubt resolution reaching **~39%**; 44% is the modelled
ambition. **State the +15% as the commitment and the +29% as the headroom** — the
reverse reads as overclaiming.

## 6.2 The metric chain

Every leading indicator below sits on a term of the decomposition. That is the whole
argument for the set: if a metric cannot be placed on the tree, it does not belong on
the slide.

```
W30  =  A. quality of save  ×  B. revisit  ×  C. doubt resolution  ×  D. mechanics
         ↑                      ↑              ↑                       ↑
    Intent-capture rate    Revisit rate   Card view rate          (unchanged —
                                          Doubt-resolution rate    hold flat)
                                          Decision latency
```

## 6.3 Leading indicators — definitions as formulas

The brief grades definitions explicitly, so each is written as a numerator over a
denominator rather than described.

| # | Metric | Definition | Term | Baseline | Target | Rationale |
|---|---|---|---|---|---|---|
| L1 | **Intent-capture rate** | saves where the user taps an intent chip ÷ all saves in treatment | A | 0 — the surface does not exist | **≥ 30%** | Powers everything downstream. Below ~30% the personalisation starves and the Verdict Card degrades to a generic size chart. This is a **floor, not a goal** — see the save-rate guardrail G2 |
| L2 | **Verdict Card view rate** | unique cards opened ÷ wishlist items viewed | C | 0 | **≥ 40%** | Answers "is the doubt-resolution layer consumed at all?" separately from "does it work?". Without it, a flat L3 is unreadable — you cannot tell a bad answer from an unseen one |
| L3 | **Doubt-resolution rate** ⭐ | items reaching a **terminal state — add-to-cart, or explicit remove/archive — within 7 days of card view** ÷ items viewed | **C** | Unknown. **66.1%** of pre-purchase documents carry a doubt the product never answers; modelled at **34%** | **34% → 44%** | **The primary leading indicator.** It is term C stated as an event, and it moves in days while W30 takes 30 days per user to close. Note the denominator is *viewed*, not *saved*: this measures the answer's quality, and L2 measures its reach |
| L4 | **Decision latency** | median days from save → terminal state | C | Unknown | Falls, directionally | A wishlist is a queue of open decisions. Resolution that arrives in 3 days rather than 30 is worth more even at identical L3, because it lands inside the W30 window |
| L5 | Wishlist revisit rate (30d) | wishlisters who return to the wishlist surface ÷ wishlisters | B | Unknown; survey Q3 gives direction | **Monitor, no target** | **Necessary but not sufficient, and deliberately not our headline.** Term B is already owned by notifications and price-drop alerts. Reminders raise this number without resolving anything — it is precisely the metric that would let us declare victory for shipping CS1's mistake |

**L3 counts a removal as a success.** That is not a rounding convenience, it is the
thesis — see §6.5.

**Why L3 and not "add-to-cart rate".** ATC-only would score the feature on whether it
sells, which is what a discount does. L3 scores it on whether it *decides*, which is
what the constraint leaves us and what the corpus says is missing.

## 6.4 Guardrails — what must not break

| # | Guardrail | Definition | Threshold | Rationale |
|---|---|---|---|---|
| **G1** | **Return rate on Verdict-influenced orders** ⭐ | returns ÷ orders where a Verdict Card was viewed before add-to-cart | **≤ control, no tolerance band** | The one that proves the judgement. See below |
| **G2** | **Save rate (PDP → wishlist)** | saves ÷ PDP views, treatment vs control | **≥ control − 2%** relative | The likeliest regression in the whole design, and the direct cost of Intent Capture: we are adding a tap at the moment of delight. If saving falls, W30's denominator shrinks and the metric improves for the wrong reason |
| **G3** | **Size-recommendation kept-rate** | recommended sizes kept (not returned *for size*) ÷ orders following a size recommendation | **≥ 75%; below that, pull the module** | Distinct from G1: G1 catches damage to the business, G3 catches damage to credibility. A card that is wrong a quarter of the time is worse than no card, because the next correct one is not believed |
| **G4** | **AOV and units per order** | standard, treatment vs control | Flat | Guards against the cheap win: resolving doubt by steering shoppers to low-risk, low-value items. A W30 lift bought by shrinking basket value is not a lift |
| **G5** | **p95 Verdict Card render latency** | 95th percentile time to rendered card | **< 1.5s** | Per-item LLM generation at wishlist scale is the real engineering constraint. A doubt-resolution layer nobody waits for resolves nothing |

**G1 is the guardrail that proves the judgement, and it should be said out loud.**
A fit tool that drives confident wrong-size purchases raises gross W30 and destroys net
value. It would look like a win on the primary metric for the entire duration of the
test. **If net W30 does not move with gross, the feature has failed regardless of what
the primary metric says** — and the decision rule is pre-committed here so that it is
not renegotiated once the numbers are in.

**G2 has a pre-declared de-scope.** If save rate regresses past its threshold, Intent
Capture ships behind its own A/B or is dropped for behavioural inference; the Verdict
Card does not depend on it, only degrades without it. Naming the fallback now is what
makes the threshold real rather than decorative.

## 6.5 The counter-metric, named before anyone asks

**Remove / archive rate will go UP, and that is a success.**

| Counter-metric | Definition | Expected movement |
|---|---|---|
| Remove/archive rate | items explicitly removed or archived ÷ items viewed | **Rises** in treatment |

Closing a decision negatively is still closing it. Three consequences, and they are the
reason this belongs on the slide rather than in a footnote:

1. It raises the signal density of everything left in the wishlist, which makes every
   downstream recommendation better.
2. It is why the *positive* verdicts are believed. An engine that never says "don't buy
   this" is a salesperson, and gets read as one.
3. It is the metric that most obviously looks like failure to someone reading quickly.
   Declaring the expected direction **in advance** converts it from an awkward question
   into evidence that the design was reasoned about.

The business objection — honest REMOVE verdicts cost short-term GMV — is real and is
answered in Part 7, measured as 60/90-day repeat purchase rate in the treatment cell.

## 6.6 Reading the results — decision rules, set in advance

| Outcome | Read |
|---|---|
| W30 gross ↑, net ↑, G1 flat | Ship |
| W30 gross ↑, **net flat**, G1 ↑ | **Fail.** The lift is wrong-size purchases. Do not ship on the gross number |
| W30 flat, L2 low | Distribution problem, not an answer problem. Fix placement before touching the model |
| W30 flat, L2 high, **L3 flat** | The answer does not resolve doubt. This is the real falsification — it means we built a message |
| L1 < 30%, G2 flat | Intent Capture is ignored but harmless. Infer intent behaviourally; keep the card |
| L1 healthy, **G2 down** | De-scope Intent Capture per §6.4 |

The fourth row is the test that matters. Per GUARDRAILS rule 4: *if the user reads our
output and still doesn't know whether it fits, we built a message.* **L3 is that
sentence written as a number**, which is why it is the primary leading indicator and
why its denominator is items *viewed*.

## 6.7 Experiment design

Restated from Part 2 §2.6 so this section stands alone.

- **Unit: users, not sessions.** W30 is user-level; session randomisation would let one
  person land in both arms and contaminate the metric.
- **Control:** today's wishlist, unchanged. **Treatment:** wishlist with Verdict Card and
  Intent Capture.
- **One pre-registered primary metric — W30.** Everything in §6.3 and §6.4 is secondary.
  With five leading indicators and five guardrails, something will read significant by
  chance; pre-registration is what stops that from being reported as the result.
- **Power.** At a 9.4% modelled baseline, 95% confidence, 80% power:

| MDE (relative) | Per arm | Total |
|---|---:|---:|
| +10% → 10.3% | 15,801 | 31,602 |
| **+15% → 10.8%** | **7,169** | **14,338** |
| +20% → 11.3% | 4,114 | 8,228 |

- **Duration ≈ 7–8 weeks**, and it is set by the metric's own window rather than by
  traffic: 2 weeks enrolment + a 30-day observation window per user + 1 week to read out.
- **Read weeks 3–4, not week 1.** A new module on a familiar surface draws inflated
  engagement from novelty alone; L2 in particular will decay.
- **Segment cuts declared in advance:** wishlist size decile, category mix, new vs
  returning, and the two corpus segments (`fit_uncertainty_prone`, `new_or_low_trust_user`).
- **Holdout cell** to read the long-run effect on save behaviour, which G2 only catches
  in-test.

## 6.8 What we are choosing not to measure

Naming this is what shows the set was chosen rather than accumulated:

- **No occasion or styling metrics.** They were fully expressible in the taxonomy
  throughout and finished at **2.1%** (styling) and **0.2%** (occasion) of named
  pre-purchase doubts. That is a finding, not a blind spot — Indian wishlist hesitation
  is about trust and fit, not about what to wear something with. Metrics for a
  deadline-urgency or outfit-pairing module would measure a problem we found evidence
  *against*.
- **No wishlist-UI engagement metrics** (sort, filter, folder usage). Direct wishlist-UI
  evidence is ~1.5% of the corpus. The wishlist does not convert because the screen is
  awkward; it does not convert because the doubt about the product is unresolved.
- **No notification metrics.** Term B is not our lever, and optimising it is the CS1
  failure mode.
- **Term D held flat, not targeted.** Its dominant friction is price at 24.8% of
  checkout-stage need, which the brief bans.

## 6.9 Two open reads the interviews settle

Neither blocks this section; both would sharpen it. Recorded here with the coding field
that answers each, so the answer is collected rather than argued about later.

1. **Does anything currently bring shoppers back to the wishlist?** Part 2's case for
   attacking term C rests partly on B being "already served" by notifications and
   price-drop alerts — an assumption, not a measurement. The walkthrough probe 6 codes
   it as `revisit_trigger` / `revisit_trigger_converted`. If revisit turns out to be
   driven by something the product does *not* do, L5's framing as an owned term changes.
   The case for C survives on headroom and the monetary constraint either way.
2. **Are fit-uncertain and low-trust shoppers one population or two?** The tagger
   assigned at most one segment signal per document, so the near-zero overlap in Part 4
   (a) is a labelling artefact and cannot be read as evidence of distinct populations.
   If they are one population, the §6.7 segment cuts collapse to one and the guardrails
   need no segment split; if two, G3 should be read separately per segment, because a
   low-trust shopper and a fit-uncertain one will not forgive a wrong verdict equally.

## 6.10 Limits — stated once, then commit

Only term A has a corpus proxy (**72.2%**). The absolute baselines for B, C and D come
from one day of internal instrumentation, and every target above is expressed as a
**relative** movement for exactly that reason — a relative target survives a baseline
that lands somewhere other than the model expects. The corpus fixes the *composition* of
doubt inside term C, not its level, and document-level tag stability is 63% on themes, so
the shares behind these targets are directional at the point and firm in their ranking.

None of that changes which term is unowned, which metric is primary, or what G1 does when
gross and net disagree.
