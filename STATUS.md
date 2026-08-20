# Status — resume here

> **Read `GUARDRAILS.md` first.** Case Study 1 missed its cutoff by 8.21 points, on
> Creativity of Solution and Data & Metrics Orientation — not on discovery depth.
> Part 1 here is done; Parts 2–7 hold nearly all the remaining marks.

Last updated: 18 Aug 2026, 14:41 IST

## Where things stand

| Stage | State |
|---|---|
| 0 · Ingest | **Done — six sources**, 19,143 unique docs. Reddit added: 1,636 docs over two Apify runs |
| 1 · Relevance | **Done** — 19,143 classified, **3,922 relevant (20.5%)**, **0 unjudged** |
| 2 · Taxonomy | **Done — 12 themes.** Induced, hand-edited three times, then a 12th added 17 Aug. `data/out/taxonomy.json` |
| 3 · Tagging | **Done — 3,922 of 3,922**, and audited. Theme 9 re-tagged after the audit (see below) |
| 4 · Scoring | **Done.** 12 themes ranked, both cohorts, → `data/out/analysis.json` |
| Deployment | **Live** at <https://myntra-wishlist-discovery-engine.vercel.app> — dashboard renders real data with the cohort toggle, `/api/classify` parallelised and no longer times out |

Nothing is running in the background.

**Interviews are no longer the long pole.** Six participants confirmed from the
researcher's own network as of **20 Aug 2026**. Guardrails rule 2 assumed
recruiting would be the slowest thing in the project; it is done. The survey has
been rebuilt accordingly — its interview opt-in and contact field were removed,
so it now collects nothing identifying at all.

Tagging coverage: **2,936 of 3,922 (74.9%) carry ≥1 theme**; 986 (25.1%) carry
none. **3,433 (87.5%) have a verified verbatim quote**. Mean severity on themed
documents is **3.84** of 5. (Coverage fell slightly after the theme 9 re-tag
below — 51 documents correctly lost their only theme.)

### Relevance funnel by source

| Source | Classified | Relevant | Rate |
|---|---:|---:|---:|
| YouTube | 7,705 | 2,144 | **27.8%** |
| Sitejabber | 153 | 37 | 24.2% |
| Reddit | 1,632 | 338 | 20.7% |
| Competitor apps | 4,571 | 905 | 19.8% |
| Google Play | 3,891 | 409 | 10.5% |
| Apple App Store | 1,191 | 89 | 7.5% |
| **Total** | **19,143** | **3,922** | **20.5%** |

YouTube supplies 55% of the relevant corpus and is 3.7× richer than App Store
reviews. Adding it was the highest-leverage decision in the build.

Reddit splits sharply by query set, and the split is the lesson:

| Reddit slice | Relevant / total | Rate |
|---|---:|---:|
| 11 Myntra-anchored core queries | 290 / 1,109 | **26.1%** |
| 10 gap queries (occasion, styling, bookmarking) | 48 / 523 | 9.2% |

Every query that works contains "myntra". The gap set mostly did not, so it
pulled r/AmItheAsshole and r/CrusaderKings. It cost $1.20 for 48 relevant docs.

### Apify budget — effectively spent

$4.40 of $5.00 used. The cycle resets **15 Sep**, after the 4 Sep deadline, so
the remaining $0.60 is the end of it. More Reddit volume, if wanted, should come
from the free OAuth route in `pipeline/sources/reddit.ts` — set
`REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET`, clear `APIFY_TOKEN`, and it dedupes
against what is already held.

## Why almost nothing in here mentions the wishlist

Read any sample of this corpus and you will find post-purchase complaints and
product questions, and no wishlist. That is the corpus working as expected, and
a grader will ask about it in exactly those words.

**61 of 3,922 tagged documents (1.56%)** mention a wishlist, a saved item or
save-for-later. Myntra-side only, that is **26 documents** (play 5, apple 4,
reddit 14, youtube 3); the other 35 are AJIO/Nykaa. In the full 19,143-doc
corpus the rate is 0.41%, so the relevance filter is *enriching* wishlist
content roughly 4×. There simply is not much of it.

At a 1.56% base rate, **a random 30-document sample contains none 62% of the
time.** Seeing zero is the single most likely outcome, not a sampling failure.

**Why the sources cannot supply it.** All six are public writing, and people
write publicly in two situations: something went wrong after they paid (hence
26.5% `post_purchase`), or they want information about something they can see. A
wishlist generates neither — it is not a grievance, and it is not a question
anyone else can answer. Saving also *relieves* the tension rather than resolving
it, so there is no felt problem to report. The behaviour is invisible to
text-mining by the same mechanism that makes it worth fixing.

**This was tested, not assumed.** `GAP_SEARCHES` in `pipeline/sources/reddit-queries.ts`
included "myntra wishlist forgot about it", "wishlist full never buy india
shopping" and "myntra saved items never ordered". That run returned 9.2%
relevance against the core set's 26.1%, at $1.20 for 48 relevant documents. The
content was hunted for directly and is not there at scale.

**What it costs, and what it does not.** The wishlist add is a premise the brief
supplies, not a claim we have to evidence. The chain that needs evidence is what
*stops* conversion — fit 30.6%, fabric/quality 11.4%, trust 9.7% pre-purchase,
Myntra-only — and 2,340 pre-purchase documents carry it. What this corpus cannot describe is the wishlist *surface*:
revisit rates, how anyone triages 40 saved items, whether they recall saving
them. Same hole as the "% who return within 30 days" term that guardrails rule 3
already flags as an assumption, and the reason AGENTS.md rules out a
wishlist-UI-centric MVP.

Closed by the Part 3 wishlist walkthroughs and by `docs/teardown/`, which shows
the surface directly without needing anyone to have written about it. Not by
more scraping.

## The taxonomy — 12 themes, full-corpus reach

Reach is now over **all 3,922 tagged documents**. Documents can carry several
themes, so these do not sum to 100%.

| # | Theme | Docs | Reach | Myntra-only |
|---|---|---:|---:|---:|
| 3 | Quality, Authenticity & Seller Trust | 1,001 | **25.5%** | 23.3% |
| 1 | Unreliable Size & Fit Info | 653 | **16.6%** | **19.5%** |
| 4 | Cumbersome Return & Exchange Policies | 633 | **16.1%** | 9.8% |
| 2 | Misleading Visual Media | 318 | 8.1% | 7.9% |
| 10 | Missing Product Specifications | 273 | 7.0% | 8.6% |
| 6 | Uncertain Stock & Availability Signals | 182 | 4.6% | 2.7% |
| 7 | Price Volatility & Hidden Checkout Fees | 171 | 4.4% | 3.2% |
| 5 | Pre-Purchase Support Gaps | 138 | 3.5% | 2.7% |
| 11 | Absent Social Proof | 100 | 2.5% | 2.1% |
| 8 | Uncertain Delivery Timelines | 85 | 2.2% | 0.9% |
| 9 | Wishlist Interface Friction | 68 | **1.7%** | 0.9% |
| 12 | Passive Wishlist, No Re-engagement | 18 | 0.5% | 0.3% |

Theme 9 is post-correction — it was 123 docs / 3.1% before the audit.

**The gate on scoring was the right call, and there is now evidence for it.**
Returns moved +4.6pp and jumped two places on the last 20% of the corpus; fit
fell 2.3pp. Scoring at 80% would have shipped a materially different ranking.

### Read the next section before putting any of these on a slide

## Theme reach is driven by source mix — the single biggest caveat

Documents were tagged in source order, so the final 800 were 82% competitor
reviews. That is not a measurement artifact — the full-corpus numbers above are
correct as whole-corpus statistics — but it exposed how strongly theme mix
depends on *which venue* a document came from:

| Theme | YouTube | Competitor | Play | Reddit | Apple | Sitejabber |
|---|---:|---:|---:|---:|---:|---:|
| n | 2,144 | 905 | 409 | 338 | 89 | 37 |
| Quality & Seller Trust | 20.8% | 32.8% | 32.8% | 25.4% | 21.3% | 45.9% |
| Size & Fit | **24.3%** | 7.1% | 6.4% | 10.9% | 4.5% | 2.7% |
| Return & Exchange | 6.5% | **37.3%** | 28.1% | 4.4% | 11.2% | 37.8% |
| Misleading Visual Media | 8.1% | 8.7% | 10.3% | 4.1% | 4.5% | 13.5% |
| Wishlist Interface Friction | 0.6% | 4.5% | 1.0% | 1.8% | 5.6% | 0.0% |

**905 of the 3,922 relevant documents (23%) are AJIO and Nykaa reviews, not
Myntra.** They were ingested deliberately, to catch comparison talk — but they
carry the return-exchange theme at 37.3%. Excluding them:

| Theme | Full corpus | Myntra-only (n=3,017) | Δ |
|---|---:|---:|---:|
| Quality, Authenticity & Seller Trust | 25.5% | **23.3%** | −2.2 |
| Unreliable Size & Fit Info | 16.6% | **19.5%** | +2.9 |
| Cumbersome Return & Exchange Policies | 16.1% | **9.8%** | **−6.3** |
| Missing Product Specifications | 7.0% | 8.7% | +1.7 |
| Uncertain Delivery Timelines | 2.1% | 0.9% | −1.3 |

This is not a hypothetical: it swaps ranks 2 and 3 in the final opportunity
ranking (see Scoring below), which is why both cohorts now ship.

Two consequences:

1. **Returns rank #3 corpus-wide but #4 and much smaller on Myntra alone.**
   Presenting 16.1% as a Myntra problem overstates it by 6.4pp. Quote the
   Myntra-only column, or state the mix, whenever the claim is about Myntra.
2. **Returns are largely post-purchase**, and the brief's metric is
   wishlist→purchase. 26.5% of the corpus is `post_purchase` journey stage. A
   return complaint is real, but it is downstream of the conversion the case
   study is about — weigh it accordingly in the MVP argument.

Fit behaves in the opposite direction and is the more defensible headline: it is
strongest in YouTube (24.3%), the source closest to pre-purchase deliberation,
and it *rises* to 19.5% on Myntra-only.

## Corpus-wide facets, over all 3,922

> **These are full-corpus, all-stages figures — including AJIO/Nykaa and including
> post-purchase documents.** They are correct for what they measure and wrong for
> almost any claim in the deck. For anything about Myntra shoppers deciding whether
> to buy, use the Myntra-only pre-purchase slice in
> `docs/part2-metric-decomposition.md`, where fit is 30.6% (not 21.1%),
> genuine_intent is 72.2% (not 81.3%) and return-certainty is 1.9% (not 11.3%).

| information_need | Share | | intent_type | Share |
|---|---:|---|---|---:|
| fit_and_size | **21.1%** | | genuine_intent | **81.3%** |
| seller_or_brand_trust | 15.4% | | unclear | 16.1% |
| fabric_and_quality | 11.4% | | price_watch | 1.6% |
| return_and_exchange_certainty | 11.3% | | bookmark | 1.0% |
| true_colour_and_appearance | 8.0% | | | |
| price_trajectory | 3.5% | | **journey_stage** | |
| delivery_timing | 1.9% | | evaluate | **57.8%** |
| social_validation | 1.9% | | post_purchase | 26.5% |
| styling_and_pairing | 0.6% | | discover | 7.7% |
| real_body_photos | 0.3% | | checkout | 5.9% |
| occasion_appropriateness | 0.2% | | shortlist | 2.2% |

`intent_type` at 81.3% genuine_intent against 1.0% bookmark looks like a strong
result for the problem definition, and the claim behind it holds — these are
people who meant to buy. **But quote 72.2%**, the Myntra-only pre-purchase figure.
The headline number is inflated by post-purchase documents, where the question
does not apply; see the correction below.

Top segment signals: `fit_uncertainty_prone` 24.5%, `new_or_low_trust_user`
24.0%, `price_sensitive` 10.4%. The first two mirror the top two themes.

### Occasion and styling — answered, and the answer is still no

At full corpus, `styling_and_pairing` is 0.6% and `occasion_appropriateness`
0.2%. Both were fully expressible — `INFORMATION_NEEDS` (`pipeline/types.ts`)
has carried them throughout — so near-zero shares are a finding, not a blind
spot. **Indian wishlist hesitation is about trust and fit, not about what to
wear something with.**

### Theme 12 was over-called — confirmed at full corpus

Predicted "plausibly the most important" from a hand read of 40 Reddit
documents. It finished as the rarest theme in the set: **18 documents, 0.5%**.
Two vivid quotes in a small sample were read as a pattern; quantification exists
to catch exactly that. Keep the theme — it is real, on-metric, and `sqrt(reach)`
compresses frequency so it will not be crushed — but it cannot headline a slide.

### `external_behaviour` — investigated, and it is NOT broken

Flagged last checkpoint as "one facet to distrust". It was checked properly and
the facet is behaving correctly:

- Zero documents carry `"none"` because `03-tag.ts:96` deliberately strips it —
  an empty array *is* the "none" signal. Not a defect.
- `.catch([])` is not silently eating out-of-enum values: parsing 19,090 cached
  result objects found **883 external_behaviour arrays and 0 out-of-enum
  values**. Raw cache runs 761 `none` against 33 real behaviours, consistent
  with the tagged output.

Final shares: `checked_other_app` 2.2%, `visited_offline_store` 1.7%,
`watched_video_review` 0.4%, `checked_brand_site` 0.4%, `searched_web` 0.3%,
`asked_friends_or_family` 0.1%.

**So the low numbers are real, but they measure the wrong thing.** The model
faithfully reports what the text evidences, and reviews and YouTube comments
simply do not narrate outside-app research. The honest framing for the brief's
p.3 question ("what information do users seek outside Myntra") is *not
measurable from this corpus* — **not** "only 2.2% check other apps". Let
`information_needs` carry that slide instead; it answers the *what* robustly.

## Scoring — done, and the ranking depends on one corpus decision

`OpportunityScore = √reach × severityNorm × metricProximity × tractability`.
Proximity and tractability are judged once per theme by the model with written
rationales (`data/out/judgements.json`), so the ranking is arguable rather than
a black box. Wilson 95% intervals accompany every reach figure.

**Full corpus (n=3,922)**

| # | Score | Reach (95% CI) | Sev | Prox | Tract | Theme |
|---|---:|---|---:|---:|---:|---|
| 1 | **0.256** | 25.5% [24.2–26.9] | 4.41 | 0.85 | 0.70 | Quality, Authenticity & Seller Trust |
| 2 | **0.199** | 16.1% [15.0–17.3] | 4.67 | 0.90 | 0.60 | Cumbersome Return & Exchange |
| 3 | **0.164** | 16.6% [15.5–17.8] | 3.36 | 0.80 | 0.85 | Unreliable Size & Fit Info |
| 4 | 0.119 | 8.1% [7.3–9.0] | 3.78 | 0.75 | 0.80 | Misleading Visual Media |
| 5 | 0.090 | 4.6% [4.0–5.3] | 4.17 | 0.75 | 0.70 | Uncertain Stock & Availability |
| 6 | 0.086 | 3.5% [3.0–4.1] | 4.28 | 0.70 | 0.80 | Pre-Purchase Support Gaps |
| 7 | 0.065 | 1.7% [1.4–2.2] | 3.75 | 0.80 | **0.90** | Wishlist Interface Friction |
| 8 | 0.065 | 7.0% [6.2–7.8] | 2.93 | 0.60 | 0.85 | Missing Product Specifications |
| 9 | 0.062 | 4.4% [3.8–5.0] | 4.05 | 0.65 | 0.60 | Price Volatility & Hidden Fees |
| 10 | 0.049 | 2.2% [1.8–2.7] | 4.20 | 0.60 | 0.70 | Uncertain Delivery Timelines |
| 11 | 0.036 | 2.5% [2.1–3.1] | 3.05 | 0.55 | 0.80 | Absent Social Proof |
| 12 | 0.014 | 0.5% [0.3–0.7] | 3.00 | **0.50** | 0.85 | Passive Wishlist, No Re-engagement |

**Myntra-only (n=3,017) — ranks 2 and 3 swap**

| # | Score | Reach | Theme | Full-corpus rank |
|---|---:|---:|---|---|
| 1 | 0.234 | 23.3% | Quality, Authenticity & Seller Trust | #1 = |
| 2 | **0.169** | 19.5% | **Unreliable Size & Fit Info** | #3 **+1** |
| 3 | **0.150** | 9.8% | **Cumbersome Return & Exchange** | #2 **−1** |
| 4 | 0.105 | 7.9% | Misleading Visual Media | #4 = |
| 5 | 0.071 | 8.6% | Missing Product Specifications | #8 **+3** |
| 6 | 0.069 | 2.7% | Uncertain Stock & Availability | #5 −1 |
| 7 | 0.069 | 2.7% | Pre-Purchase Support Gaps | #6 −1 |
| 9 | 0.037 | 0.9% | Wishlist Interface Friction | #7 −2 |
| 12 | 0.011 | 0.3% | Passive Wishlist, No Re-engagement | #12 = |

**"What is Myntra's #2 problem?" has two answers, and the difference is a
corpus decision rather than a finding.** Returns win on the full corpus only
because 23% of it is AJIO and Nykaa. Rank #1 is stable in both, which is the
reassuring part. Both rankings now ship: `analysis.themes` and
`analysis.themesExCompetitor`, with a toggle on the dashboard. Proximity and
tractability are reused across cohorts, so only reach and severity move.

The segment lift heatmap is always computed over all sources and does not
follow the toggle — noted in its caption.

### Two things the judged axes revealed

**The judge contradicted the theme 12 hypothesis.** It assigned
`metric_proximity: 0.50`, the **lowest of all twelve**, to the theme that was
added on the reasoning that it "sits closest of all to the 30-day conversion
metric". That is now three independent signals against it: 18 documents, 0.5%
reach, lowest judged proximity. Do not build the MVP on it.

**Wishlist Interface Friction over-performs its size** — rank 7 on 1.7% reach,
because it drew the highest tractability in the set (0.90) and `sqrt(reach)`
compresses frequency. Working as designed, but it rests on 68 documents and
falls to #9 Myntra-only. Its high tractability is the honest argument for it,
not its reach.

Useful for the deck: the top theme's recorded workarounds are vivid — *"just buy
offline than shop from here"*, *"purchase from the brand website directly"*,
*"For that credit we end up buying something else what we do not want."*

## The tag audit — run 18 Aug, and it found two real defects

50 documents, `npm run audit -- --stage tag --n 50 --seed 7`.

| Measure | Result | Target |
|---|---|---|
| Theme agreement | **~83%** (29/35 themed docs) | ≥70% ✅ |
| Relevance agreement | **90%** strict errors / **74%** incl. borderline | ≥85% ⚠️ |

**Caveat on who did the auditing.** This pass was done by the same class of
model that produced the tags. It catches blatant errors and systematic patterns;
it cannot catch a bias the auditor shares with the tagger. A human spot-check of
~30 documents is still worth doing before the deck.

## `genuine_intent` is inflated — measured 19 Aug

Surfaced by the 30-document spot-check sample: post-purchase complaints were
being tagged `intent_type: genuine_intent`, though a document written after
delivery has no save event to have an intent *about*. Checked corpus-wide:

| journey_stage | n | genuine_intent | bookmark | price_watch |
|---|---:|---:|---:|---:|
| discover | 292 | 33.9% | 9.6% | 1.4% |
| shortlist | 95 | 85.3% | 6.3% | 8.4% |
| evaluate | 2,264 | 78.3% | 0.3% | 1.8% |
| checkout | 233 | 92.3% | 0.0% | 3.4% |
| **post_purchase** | **1,038** | **94.5%** | **0.0%** | **0.0%** |

`genuine_intent` peaks exactly where the question is meaningless, with zero
bookmark and zero price_watch — the signature of a field filled in by default
rather than observed. **31.2% of the whole genuine_intent pile sits in
post_purchase.**

| Cohort | Headline (all stages) | Pre-purchase only |
|---|---:|---:|
| Full corpus | 80.3% | 73.6% |
| **Myntra-only** | 77.4% | **72.2%** |

**Quote 72.2%, not 81.3%.** Restricting to discover + shortlist + evaluate, on
the Myntra-only cohort, is the figure that survives the obvious grader question
("how does a delivery complaint tell you what someone meant when they saved?").
It is still a strong number and it is defensible; the headline one is not.

> This contradicts GUARDRAILS rule 3, which leads with 81.3% and calls it "our
> strongest single number". The claim survives — most saves carry real purchase
> intent — but the number backing it has to change. Rule 3 needs editing before
> the deck quotes it.

No re-tagging required: this is a slicing correction, not a labelling one.

## The stability check — run 19 Aug

Playbook QC check #2, and it had never been done.
`npm run audit -- --stage stability --n 30 --seed 7` re-tags a seeded sample
through the production path (`tagBatch`) and diffs against `tags.json`. It
writes nothing.

| Field | Same on re-run |
|---|---|
| themes (exact set) | 19/30 · **63%** |
| journey_stage | 23/30 · 77% |
| intent_type | 23/30 · 77% |
| severity (exact) | 22/30 · 73% |
| severity (within 1) | 26/30 · 87% |
| information_needs (set) | 22/30 · 73% |
| segment_signals (set) | 20/30 · 67% |

Tagging runs at `temperature: 0`, so this is provider non-determinism, and it is
lower than it should be. **Read it as a limit on document-level labels, not on
the shares.** No single document's tag is ground truth. Aggregate reach is far
steadier than 63% suggests, because independent flips partly cancel — but note
the Wilson intervals on the dashboard express *sampling* uncertainty only and do
**not** include this labelling noise. Say that plainly rather than quoting reach
to two decimals.

Do **not** cite the 192-document partial re-tag from 19 Aug as this figure. That
run used a changed prompt, so its 17% theme churn is an upper bound on
instability, not a measurement of it.

## Out-of-market documents — measured 19 Aug, not worth fixing

The stability sample surfaced a German-language Temu review and a Reddit thread
about *Overwatch* character skins. Quantified corpus-wide: **73 tagged documents
(1.86%)** come from YouTube or Reddit, name Temu/Shein/AliExpress, and never name
Myntra, AJIO or Nykaa. 50 carry a theme. This is the r/Steam and r/CrusaderKings
failure again — right behaviour, wrong market — leaking through the *core*
queries this time, mostly via haul-video comment threads.

App-store reviews are excluded from that count on purpose: a Play review that
says "Meesho is cheaper" without naming Myntra is still a Myntra review.

Dropping all 73 moves every theme by **≤0.36pp** and **changes no rank**:

| Theme | Now | Cleaned | Δ |
|---|---:|---:|---:|
| Quality, Authenticity & Seller Trust | 25.52% | 25.67% | +0.15pp |
| Cumbersome Return & Exchange Policies | 16.14% | 16.45% | +0.31pp |
| Missing Product Specifications | 6.96% | 6.60% | −0.36pp |
| Unreliable Size & Fit Info | 16.65% | 16.68% | +0.03pp |

Same class as the severity clamp: real, measured, immaterial. **Skip it**, per
GUARDRAILS rule 1. Footnote if a grader asks how out-of-market noise was handled.

**Relevance is permissive, not wrong.** The clear false positives were
low-information chatter — a joke ("Everyone seeing the outfit — Myntra; me
seeing the price — Meesho 😂"), a Laneige lip-mask recommendation, "I am gonna
so regret this 😶". These land in the no-theme pile, so they dilute the
denominator rather than corrupt themes — which means every reach % above is very
slightly *deflated*. Not worth a re-run.

### Defect 1 — theme 9 was 25% false positives. Fixed and re-tagged.

Of its 123 documents, **31 (25%) were YouTube "send me the link" comments** —
product-discovery requests with nothing to do with a wishlist. The theme's
`definition` was fine; its `excludes` simply never ruled them out, and the id's
"navigation" invited over-extension.

Three excludes were added to `wishlist-ui-navigation-friction` (link/where-to-buy
requests, link-only comments, discovery search questions) plus a clarifying
sentence in the definition, then those 123 documents alone were re-tagged.

| | Before | After |
|---|---:|---:|
| Documents | 123 | **68** |
| Reach | 3.1% | **1.7%** |
| Link-request false positives | 31 | **1** |
| Wishlist-specific / generic UI / link | 46 / 46 / 31 | **42 / 25 / 1** |

51 of the 123 correctly ended with no theme; 13 moved to better-fitting themes.
Survivors read exactly as the definition intends: *"Wish list limit"*, *"My
entire wishlist is vanished"*, *"cart items vanish"*, *"Unable to add items to
cart"*.

The 25 generic app/UI documents (slow app, broken filters) were deliberately
**kept** — folding "Broken Functional Buttons" into this theme was a considered
hand-edit, and reversing it is a scope decision, not a bug fix.

### Defect 2 — theme 5 is majority post-purchase. NOT fixed.

**76 of 138 documents (55%) tagged `Pre-Purchase Support Gaps` carry
`journey_stage: post_purchase`.** The name says pre-purchase; the evidence is
mostly people chasing support *after* delivery. As a pre-purchase claim it is
worth roughly **1.6%, not 3.5%**.

Left alone deliberately — unlike theme 9 this is a scope question (is the theme
mis-named, or mis-applied?), and answering it changes what the theme *means*.
Decide before quoting it as a pre-purchase problem.

### False negatives are modest, and the taxonomy holds up

Of the 986 no-theme documents, only 58 (6%) are 1–2★ and substantial. Sampling
them shows genuinely off-taxonomy complaints — NRI delivery, VISA cards, missing
price filters, in-app ads. Real problems, but outside these 12 themes and
outside the brief. That is a point in the taxonomy's favour.

### The silent-coercion log paid for itself on its first run

The theme 9 re-tag printed:

```
12 field values were coerced to a fallback - these are NOT real absences:
  severity: 12 (e.g. 0)
```

Twelve documents returned `severity: 0` — outside the 1-5 range — and were
silently coerced to the fallback **3**, the middle of the scale, when the model
plainly meant "no friction here". Impact is small (mean severity on themed
documents moved 3.82 → 3.84, and most were themeless), so it is **not fixed**.
The honest fix is a clamp (0 → 1, 7 → 5) rather than a mid-scale fallback, since
`severity` feeds `severityNorm` in the opportunity score. An hour earlier this
would have been invisible.

### What the audit means for the MVP argument

Direct wishlist evidence is **thin**. Corrected theme 9 wishlist-specific
documents (42) plus theme 12 (18) is **60 documents, ~1.5% of the corpus**.
Theme 12 was already confirmed over-called. **This corpus does not support a
wishlist-UI-centric MVP** — it supports fit and trust, which is where the reach
actually is. That is a finding, not a gap: it says the wishlist does not convert
because of doubt about the product, not because the wishlist screen is awkward.

## Fixed this session

Three schema defects, all in the same family: **Zod's `.default()` fires only on
`undefined`, never on `null` or a wrong type.** Every one of these was a
`.default()` doing a job only `.catch()` or a preprocess can do.

- `03-tag.ts` — `workaround` and `evidence_quote` now use an `emptyIfNull`
  preprocess. The 17 Aug fix (`041e183`) had been applied to `TagSchema` in
  `types.ts`, which is the *output* schema; the schema that actually validates
  the LLM response is `ResultSchema` in the tag stage, and it was untouched. A
  null still took its whole ~20-document batch down. `themes` had the identical
  flaw and moved to `.catch([])`.
- `02-taxonomy.ts:36` — `evidence_indices` was `.default([])`, with a comment
  explaining it existed to tolerate models returning strings "about a third of
  the time". It never did: a string still threw and still discarded the batch.
  Now `.catch([])`. Nothing reads the field, so swallowing is intended.
- `types.ts:24` — `meta` was `.default({})`. Latent rather than live (it is
  written by the source adapters and read nowhere), but a null would have cost
  the whole document for a field nothing consumes. Now `.catch({})`.

**Silent-coercion logging added to the tag stage.** All eight `.catch()` sites
are wrapped in a `loud(field, fallback)` helper that counts what it swallowed
and prints a ranked summary with sample inputs at the end of the stage — either
`no fields were silently coerced` or a per-field breakdown. This matters because
`.catch()` on an array discards *the entire array*: one renamed enum value next
to a valid `fit_and_size` empties both, which reads downstream as a real absence.
That is precisely how a facet like `external_behaviour` could look under-detected
without anyone noticing. Deliberately not added to the two unread fields above —
firing on a third of themes would train you to ignore the log.

Counters reset per run, so a resume reports only its own coercions.

## Resuming — deployment is next

The pipeline is **complete and deployed**. Ingest → relevance → taxonomy →
tagging → scoring all done, and the dashboard is live with real data.

```bash
# Redeploy after any change to data/out/analysis.json or the UI.
# --scope is required: without it the CLI returns "Not authorized".
npm run build && vercel --prod --yes --scope shekhu07s-projects
```

### `/api/classify` — timeout fixed, provider limits remain

Two changes, both deployed and verified in production:

- **The two LLM calls now run concurrently.** Stage 1 and Stage 3 do not depend
  on each other, so the endpoint costs `max(a, b)` rather than `a + b`. They run
  under `Promise.allSettled`, not `all`, so a tagging failure cannot fail a
  request whose answer is "filtered out at Stage 1" and never needed the tag.
  The response contract is unchanged — an irrelevant document still returns
  `tag: null` with its note. The trade is one wasted tagging call when a
  document turns out irrelevant, which at live-tester volume is worth the
  latency.
- **`maxDuration` 60 → 120.** A measured warm call took 47s against the old 60s
  ceiling — 22% headroom. Latency here is provider variance, not compute, and
  the function only bills while awaiting.

Measured in production after the change: **cold start 6.2s** (the exact case
that previously returned 504), then 11s, 48s across warm runs. Spread is
entirely LLM provider variance.

**What remains is rate limiting, not timeouts.** Three requests fired
back-to-back produced one `502 Classification failed: all providers failed:
Error: groq 429`. That was self-inflicted by the load test and the next request
succeeded, but the free-tier keys will do this under any rapid succession. It
fails cleanly with a readable message rather than hanging. If this is being
demoed live, do not click the button repeatedly — and expect the daily free
ceiling to be the real constraint, as it was during tagging.

The fourth instance of the `.default()` null defect is also fixed here:
`workaround` and `evidence_quote` now use the same `emptyIfNull` preprocess as
the pipeline, and `themes` moved to `.catch([])`. In the batch pipeline that bug
cost a 20-document batch; here it would have 502'd the live demo on a single
document.

## Still outstanding

**The pipeline is complete and deployed.** Nothing technical is blocking. What
is left is three judgement calls and the written deliverable.

Open decisions, each described in full in its section above:

1. **Theme 5 scoping.** 76 of 138 documents tagged `Pre-Purchase Support Gaps`
   are `journey_stage: post_purchase`. Re-scope it, re-name it, or footnote it —
   as a *pre-purchase* claim it is worth ~1.6%, not 3.5%. Untouched because the
   answer changes what the theme means.
2. **`severity` fallback.** Out-of-range values coerce to mid-scale 3; a clamp
   (0 → 1, 7 → 5) is more faithful. Small effect (themed mean 3.82 → 3.84) but
   `severity` feeds `severityNorm` in the opportunity score.
3. **Human spot-check — the only one still open.** The 50-document audit was
   model-run. ~30 documents read by a person is the cheapest remaining
   credibility win, because a model auditing a model cannot catch a shared bias.
   `npm run audit -- --stage tag --n 30 --seed 7` prints the sample; record the
   agreement % beside the 83%/90% model figures above.

Nice-to-have, not blocking:

- Reddit is ingested (1,636 docs). Social media (X, Instagram, Facebook) stays
  scoped out on feasibility.
- Parts 2–7 of the brief (metric decomposition, 5–6 user interviews, problem
  definition, MVP, success metrics, risks, 10-slide deck) remain yours.
  Deadline **4 September 2026, 3:59 PM IST** — 17 days out. Note the PDF
  contradicts itself and says 5 September on page 1; plan for the 4th.
