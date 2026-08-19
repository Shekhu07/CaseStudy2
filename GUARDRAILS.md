# Guardrails — do not repeat Case Study 1

Written 19 Aug 2026, after CS1 scored **200.36/300 against a 208.57 cutoff** (missed by 8.21).
Read this before every work session. It exists to stop one specific failure from happening twice.

## What actually cost us last time

| Competency | CS1 score | Peer median | Gap |
|---|---|---|---|
| Presentation & Communication | 46.35/60 | 46.05 | **+0.30** |
| Clarity and Depth of Thought | 76.50/100 | 81.36 | −4.86 |
| **Creativity of Solution** | 56.86/100 | 67.83 | **−10.97** |
| **Data & Metrics Orientation** | 20.63/40 | 31.27 | **−10.64** |

Either of the bottom two, lifted to the *median*, clears the cutoff alone. Neither needed better research.

**Root cause: a research/engineering artifact was submitted into a product-management evaluation.**
Effort went where the points weren't — `docs/` held 25+ deck-iteration prompt files and exactly one
measurement slide. In the shipped CS1 deck: `north star` 0 occurrences, `success metric` 0, `A/B` 0,
`target` 0, `uplift` 0, `cohort` 0. Eternal's public numbers were quoted as *context* and never
converted into *arithmetic*.

## The repeat risk, in our own words

`STATUS.md` currently ends with:

> *"Parts 2–7 of the brief (metric decomposition, 5–6 user interviews, problem definition, MVP,
> success metrics, risks, 10-slide deck) remain yours."*

Part 1 is **done to an extraordinary depth** — 19,143 docs, six sources, 12 themes, Wilson intervals,
a judged opportunity score, a 50-doc audit that found and fixed two real defects, a deployed dashboard.

Part 1 is **one of seven parts**, and it maps mostly onto competencies we already pass. Parts 2–7 hold
essentially all of the Creativity and Data & Metrics points. With 16 days left, that is the CS1 effort
distribution, unchanged.

**This brief has turned both of our weak competencies into mandatory graded sections.** Part 2 is a
metric decomposition. Part 6 demands leading indicators, guardrail metrics, *and the definition and
rationale for each*. We scored 51.6% on exactly this last time.

## Rule 1 — Part 1 is finished. Stop building it.

Time-box the three open items in STATUS.md to **one day, total**:

- **Human spot-check (~30 docs) — DO IT.** Cheapest credibility win available, and the one thing a
  model-run audit cannot substitute for. It is also a slide-able line: "a human read 30, agreement X%".
- **Theme 5 scoping — footnote it, don't re-scope.** It is rank 6 and does not touch the headline.
  One honest sentence: "55% of its evidence is post-purchase; as a pre-purchase claim it is ~1.6%."
- **Severity clamp — SKIP.** Mean moved 3.82 → 3.84. That is noise. Note it as known and move on.

Anything else in the pipeline is polish on the part that gets **two slides out of ten**.

## Rule 2 — Interviews start today. They are the long pole.

Part 3 needs **5–6 interviews**, and recruiting is the slowest thing in the project. CS1 finished with
3 real interviews landing late.

The corpus already names the segment, so there is nothing to decide first:
`fit_uncertainty_prone` **24.5%** and `new_or_low_trust_user` **24.0%** — the two segment signals that
mirror the top two themes. Recruit against those.

Start the recruiting message today, in parallel with everything else.

## Rule 3 — Part 2 is the antidote to 20.63/40. Do it on paper, first, with our numbers.

The brief says to use the decomposition *to choose* the opportunity — so it comes before more analysis,
not after. Decompose the 30-day wishlist→purchase conversion multiplicatively and populate it from our
own corpus:

```
30-day conversion
  = % of adds carrying genuine purchase intent          → 72.2% (Myntra-only, pre-purchase)
  × % who return to the wishlist within 30 days         → not measurable from our corpus; survey Q4 reads it
  × % whose blocking uncertainty gets resolved          → THE LEAK. 66.1% of pre-purchase documents name
                                                          a doubt the product never answers
  × % who then complete checkout                        → dominant checkout need is price, 24.8% — banned
```

**These figures were corrected on 19 Aug. The originals were full-corpus and all-stages; every number
here is Myntra-only and restricted to the stage the metric is actually about.** The full working is in
`docs/part2-metric-decomposition.md`; do not re-derive them from `analysis.json` head-line shares,
which are neither.

| Was | Now | Why it moved |
|---|---|---|
| genuine intent 81.3% | **72.2%** | 94.5% of post-purchase docs were tagged `genuine_intent` — a review written after delivery has no save event to have an intent about. Pre-purchase only |
| fit 21.1% | **30.6%** of pre-purchase docs, **46.2%** of named doubts | full-corpus all-stages → Myntra-only pre-purchase |
| trust 15.4% | 9.7% | same |
| return-certainty 11.3% | **1.9%** | returns are overwhelmingly *post*-purchase. Real theme, 9.8% Myntra reach — but **not** what blocks a save from converting. Do not claim it is |
| evaluate 57.8% | **67.9%** | Myntra-only |

`journey_stage` closes the argument quantitatively: **evaluate 67.9%** against checkout 3.9%. The leak
is at evaluation, and the largest single unresolved need is fit — **46.2% of every doubt shoppers name**,
with nothing within 28 points of it. That is the "arithmetic, not context" move missing from CS1.

72.2% is still the number to lead with: these are people who meant to buy, which is what makes the
problem worth solving. It is lower than 81.3% and it is the one that survives the obvious question
— *how does a delivery complaint tell you what someone meant when they saved?* Quote the defensible
figure, not the flattering one.

**One argument to avoid.** "Doubt-resolution has the most leverage" is arithmetically false: in a
multiplicative model, equal *relative* lifts on any term move the north star identically (+25% each).
The case for attacking it is **headroom** (nothing addresses it today), **ownership** (revisit is
already served by notifications, checkout is mature), and the fact that the monetary-incentive ban
rules out the checkout term's dominant friction.

## Rule 4 — Do not ship a notification again.

CS1's MVP was a push notification with better copy. Graders score the *intervention*, not the pipeline,
and messaging-about-a-problem reads as the least creative option available.

The lazy CS2 answer is "remind users about their wishlist." **That is the same mistake.** Note the brief
bans monetary incentives, which deliberately rules out the other lazy answer (a discount nudge).

Our own audit already ruled out the other trap:

> *"This corpus does not support a wishlist-UI-centric MVP — it supports fit and trust."*

So build the thing that **resolves the uncertainty**, not the thing that mentions it. For fit, that means
actually answering "will this fit me" — from the user's own purchase and return history, garment
measurements, and mined review signal — surfaced on the saved item at the moment of hesitation. A
mechanism, not a message.

Sanity test before committing to a build: *if the user reads our output and still doesn't know the
answer, we built a message.*

## Rule 5 — Part 6 gets a real table, with numbers.

CS1 named a metric and gave no baseline, no target, no experiment design. Do not repeat this. The deck
needs a table with a row per metric:

| | Definition | Baseline (or how we'd baseline) | Target | Rationale |
|---|---|---|---|---|
| North star | 30-day wishlist→purchase conversion | | | |
| Leading | uncertainty-resolution engagement; time-to-decision; wishlist revisit rate | | | |
| **Guardrail** | **return rate on assisted purchases must not rise** | | | |
| Guardrail | complaint/CSAT, opt-out rate, latency | | | |

The return-rate guardrail is the one that proves product judgement: a fit tool that drives confident
*wrong-size* purchases is a loss disguised as a win. Say that out loud.

Also state the experiment: control definition, sample size / MDE, duration. CS1 had none of it.

## Rule 6 — Slide budget, fixed in advance

Deliverables list eight required content areas, plus the how-it-works 1-slider, inside a hard 10.

1. Title — key message, not a label
2. **Metric decomposition** (Part 2)
3. Discovery engine — how it works (the required 1-slider)
4. Discovery findings — the ranking
5. Primary research — what it confirmed **and** challenged
6. Problem definition (Part 4)
7. Solution rationale + MVP, with the live link
8. **Success metrics** (Part 6) — the full table
9. **Risks & mitigation** (Part 7)
10. Close — the thread, what's live, honest limits

CS1 gave discovery ~3 slides and crammed impact + metrics + next steps into one. Here discovery gets
**two**, and metrics and risks get **one each of their own**. Months of pipeline work earns two slides;
that is the real ROI and the reason for Rule 1.

Hard deck rules from the brief: **font size 14, strictly**. 10 max. No fellow name anywhere. Titles state
the key message. Colour-blind-safe palette, readable contrast. Hyperlink supporting artefacts and
**verify the reader actually has access**.

Presentation was our only at-par competency. Hold it — do not over-invest in it again.

## Rule 7 — Protect the live demo

CS1's demo survived only by luck: the deck's links point at a HuggingFace username that no longer exists
and worked purely on rename redirects, and both Spaces served a retired model from 16 Aug until 18 Aug.

Verified for CS2 on 19 Aug: `/api/classify` returns a correct 200 in production.
Two live risks remain:

- **Rate limits.** Three rapid requests produced `502 ... groq 429`. A grader who double-clicks sees a
  failure. Debounce the button, add backoff, and pre-cache 2–3 worked examples so the demo can never
  hard-fail in front of an evaluator.
- **Latency.** The verified call took **36.6s**. That is a long silent wait. Ship a real progress state
  that says what is happening, or the demo reads as broken.
- **Model retirement.** `pipeline/llm/provider.ts` still defaults `GROQ_MODEL_BULK` to
  `llama-3.3-70b-versatile`, which Groq **retired on 16 Aug 2026**. Prod overrides it and is fine, but
  the fallback default is a dead model. Change the default so a missing env var cannot silently kill it.

## Pre-submission self-check — run this 24h before, not on the day

Score the deck yourself against the four graded competencies before submitting:

- **Data & Metrics** — can I point at a baseline, a target, a guardrail, and an experiment design?
  Did I do arithmetic on real numbers, or only quote them?
- **Creativity** — does the MVP remove the uncertainty, or announce it? Would a PM call this obvious?
- **Clarity & Depth** — is the product argument on the slides, or is it methodology? Count caveats:
  CS1 hedged so consistently it read as low conviction. State limits **once**, plainly, then commit.
- **Presentation** — font 14, ≤10 slides, no name, key-message titles, links verified from a logged-out browser.

## Schedule — 16 days (19 Aug → 4 Sep, 3:59 PM IST)

The PDF says 5 Sep on page 1 and 4 Sep on page 8. **Plan for the 4th.**

| Dates | Work |
|---|---|
| 19–20 Aug | Part 2 decomposition on paper. Lock segment + opportunity. **Send interview recruiting today.** Close the 3 Part-1 items. |
| 20–27 Aug | Interviews (5–6). Runs in parallel with everything below. |
| 21–25 Aug | Build the MVP. |
| 25–28 Aug | Deploy + harden it (Rule 7). |
| 28–31 Aug | Write Parts 4, 6, 7. |
| 1–3 Sep | Build the deck. |
| 3 Sep | Freeze, self-check, verify every link logged-out. |

Nothing ships on 4 Sep. The deadline rejects late submissions "even if it is by a few seconds".
