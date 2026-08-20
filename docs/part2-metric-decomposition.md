# Part 2 — Breaking down the business metric

> Working draft. Every number is sourced; assumptions are labelled as such.
> Myntra-only cohort throughout (n = 3,017), per AGENTS.md.

## 2.1 The metric, stated precisely

**W30** = users who purchased ≥1 previously-wishlisted item, where the purchase
fell within 30 days of *that item's* save event ÷ users who wishlisted ≥1 item in
the period.

Four definitional choices a real PM has to make, and our answers:

| Choice | Decision | Why |
|---|---|---|
| User-level or item-level? | **User-level**, per the brief | One conversion per user suffices, so helping a heavy wishlister close *one* item beats nudging a light user repeatedly |
| Does a different colour of the same item count? | **Yes** — match at SKU-family | The decision the user made was "this garment"; punishing a colour switch would understate real conversions |
| Window | **Rolling 30 days per item**, not per calendar month | A save on the 29th otherwise gets 1 day to convert |
| Returns | Report **gross and net** | A fit tool that drives confident *wrong-size* purchases inflates gross W30 while destroying value. Net W30 is the honest number |

## 2.2 The decomposition

```
W30  =  A. quality of save
      × B. return to the wishlist
      × C. doubt resolution
      × D. conversion mechanics
```

| | Term | What it asks | Our reading |
|---|---|---|---|
| **A** | Quality of save | Was this ever convertible? | **72.2%** carry genuine purchase intent |
| **B** | Revisit | Do they come back inside 30 days? | **Not measurable from the corpus** — survey Q4 reads it |
| **C** | Doubt resolution | Does the blocking question get answered? | **66.1%** name a doubt the product does not answer |
| **D** | Mechanics | Does resolution become an order? | Checkout-stage friction is **24.8% price**, banned by the constraint |

### What the corpus can and cannot say

It measures **documents, not saves**. Nobody in it was observed adding to a
wishlist — only 1.56% of tagged documents mention a wishlist at all. So:

- The corpus **does** establish the *composition* of unresolved doubt — the mix
  inside term C — and that deliberation concentrates at evaluation (**67.9%** of
  Myntra-only documents, against 3.9% at checkout).
- The corpus **does not** give the absolute value of any term. Those come from
  internal instrumentation on day 1, with the survey giving a directional read on
  B and A.

Stating this once is what makes the rest of the numbers trustworthy.

## 2.3 Inside term C — where the doubt actually is

Pre-purchase, Myntra-only, of the 1,547 documents naming a specific unresolved
need (66.1% of 2,340):

| Blocking question | Share of named doubts |
|---|---|
| **Will it fit me?** | **46.2%** |
| Is the fabric/quality what it claims? | 17.3% |
| Can I trust this seller or brand? | 14.7% |
| Will it look like the photos? | 13.3% |
| Will the price drop? | 3.6% |
| Will returning it be a hassle? | 2.9% |
| What will people think? | 2.7% |
| Does it suit the occasion / how do I style it? | 2.1% |

**Nearly half of everything shoppers say they could not determine before buying is
fit.** No other question is within 28 points of it.

Two corrections this table forces, both against numbers we were carrying:

- **Fit is 30.6% of pre-purchase documents, not the 21.1% in the guardrails.**
  That figure was full-corpus and all-stages; restricted to Myntra, pre-purchase,
  it is materially stronger.
- **Return anxiety is 1.9% pre-purchase, not 11.3%.** Returns are overwhelmingly a
  *post-purchase* complaint. It is a real theme (9.8% Myntra reach) but it is not
  what blocks the save from converting, and the deck should not claim it is.

## 2.4 Which term to attack — and the argument that survives scrutiny

The tempting claim is "C has the most leverage." **That is arithmetically false**,
and a sharp evaluator will catch it. In a multiplicative model, equal *relative*
improvements in any term produce identical relative movement in W30:

| Lift | Resulting W30 | Relative |
|---|---|---|
| C +25% | 11.7% | **+25%** |
| B +25% | 11.7% | **+25%** |
| D +25% | 11.7% | **+25%** |

The real case for C is **headroom and ownership**, not leverage:

1. **C has the most room.** Two-thirds of pre-purchase deliberation names a doubt
   the product never answers. A 10-point gain on a term sitting near 34% is a far
   easier engineering problem than 10 points on a checkout already near 85%.
2. **C is unowned.** B is already served by notifications and price-drop alerts.[^b]
   D is a mature, well-optimised checkout. **Nothing in the product exists to
   resolve doubt** — the wishlist teardown shows every conversion lever on the
   surface is monetary.
3. **The constraint closes the alternatives.** The largest checkout-stage need is
   price (24.8%), and the brief bans monetary incentives. C is not merely the best
   option; it is close to the only permitted one.

That third point converts the hardest constraint in the brief into the reason the
choice is defensible.

[^b]: **This leg was an assumption until 20 Aug and is now under test.** Nothing in
the corpus or the survey shows *what* brings a shopper back to the wishlist. The
walkthrough's surface block (probe 6) asks it directly and codes it as
`revisit_trigger` / `revisit_trigger_converted`. The sentence to look for is
"came back on a price alert and still didn't buy" — it would make this leg
evidenced rather than asserted. If revisit turns out to be driven by something the
product does *not* do today, reword this point; the case for C still stands on
headroom and the constraint, but this leg would not.

## 2.5 The arithmetic

Illustrative, with A measured and B, C, D assumed pending instrumentation:

```
W30 = 0.722  ×  0.45  ×  0.34  ×  0.85  =  9.4%
       (A)      (B)      (C)      (D)
      measured  assumed  assumed  assumed
```

Lifting doubt-resolution from 34% to 44% — ten points, on the term nothing
currently addresses:

```
W30 = 0.722 × 0.45 × 0.44 × 0.85 = 12.2%     +2.8pp, +29% relative
```

**The absolute values will move once instrumented. The ranking of the terms will
not**, because it follows from 66.1% and 24.8%, which are measured.

## 2.6 Baseline, target, experiment

| | Metric | Baseline | Target | How |
|---|---|---|---|---|
| **North star** | W30, gross and net | Read from internal data, day 1 | **+15% relative** in 8 weeks | A/B, below |
| Term A | % saves with genuine intent | 72.2% *(corpus proxy)* | Not a target — a segmentation input | Survey **Q6**; save-time intent capture once built |
| Term B | 30-day wishlist revisit rate | Unknown | Not our lever | Survey Q4 for direction; instrument day 1 |
| **Term C** | **Doubt-resolution rate** | **Unknown; 66.1% carry an unresolved doubt** | **34% → 44%** | The MVP |
| Term D | Wishlist → order completion | Unknown | Hold flat | Existing funnel telemetry |

**Reading term A off the survey.** Q6 asks why the item was saved rather than
bought. Every option counts as genuine intent except *"I just liked it — I wasn't
really planning to buy it"*; *"I honestly don't remember"* is reported separately
rather than folded either way. Fix that coding rule now, before the responses land
and it becomes a choice.

**Q5 is not W30, and the deck must not imply it is.** §2.1 defines W30 on a rolling
30 days from each item's *save event*; Q5 asks about the last 30 *calendar* days
regardless of when the item was saved. An item saved six months ago and bought last
week counts in Q5 and not in W30. Q5 is a directional read on the same behaviour,
and the only pre-instrumentation read available.

**Experiment design.** Randomise wishlisters, not sessions — W30 is user-level.
Control sees today's wishlist; treatment sees doubt resolution on saved items.

At an assumed 9.4% baseline, 95% confidence and 80% power:

| MDE (relative) | Per arm | Total |
|---|---:|---:|
| +10% → 10.3% | 15,801 | 31,602 |
| **+15% → 10.8%** | **7,169** | **14,338** |
| +20% → 11.3% | 4,114 | 8,228 |

**~7,200 per arm for a +15% relative MDE.** Duration is set by the metric's own
window, not by traffic: 2 weeks enrolment + a 30-day observation window per user +
1 week to read out ≈ **7–8 weeks**.

**Guardrail, and it is the one that proves the judgement:** *return rate on
assisted purchases must not rise.* A fit tool that produces confident wrong-size
orders raises gross W30 and destroys net value. If net W30 does not move with
gross, the feature has failed regardless of what the primary metric says.

## 2.7 What we are choosing not to do

Naming this is what shows the choice was made rather than defaulted into:

- **Not attacking B.** Reminders raise revisits, not resolution. It is also what
  CS1 shipped, and it lost 43 points off max on creativity.
- **Not attacking D.** Its dominant friction is price, which the brief forbids.
- **Not attacking A yet.** Intent capture makes everything downstream sharper, but
  it changes no number on its own.

## 2.8 Limits — state once, then commit

The corpus fixes the *mix* inside term C, not the level of any term; absolute
baselines need one day of internal instrumentation. Term B is assumed pending the
survey. Document-level tag stability is 63% on themes, so these shares are
directional at the point, firm in their ranking. None of that changes which term
is unowned.
