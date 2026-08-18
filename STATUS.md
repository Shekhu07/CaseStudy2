# Status — resume here

Last updated: 18 Aug 2026, 13:34 IST

## Where things stand

| Stage | State |
|---|---|
| 0 · Ingest | **Done — six sources**, 19,143 unique docs. Reddit added: 1,636 docs over two Apify runs |
| 1 · Relevance | **Done** — 19,143 classified, **3,922 relevant (20.5%)**, **0 unjudged** |
| 2 · Taxonomy | **Done — 12 themes.** Induced, hand-edited three times, then a 12th added 17 Aug. `data/out/taxonomy.json` |
| 3 · Tagging | **Done — 3,922 of 3,922.** Finished 18 Aug 08:02 UTC, zero batch failures, 87 API calls for the last 680 |
| 4 · Scoring | **Unblocked — not started.** This is the next command to run |
| Deployment | Live shell at <https://myntra-wishlist-discovery-engine.vercel.app> — dashboard still shows the placeholder (no scoring output to render), `/api/classify` works in production |

Nothing is running in the background.

Tagging coverage: **2,987 of 3,922 (76.2%) carry ≥1 theme**; 935 (23.8%) carry
none. **3,436 (87.6%) have a verified verbatim quote**; 381 record a workaround.
Mean severity on themed documents is **3.82** of 5.

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

## The taxonomy — 12 themes, full-corpus reach

Reach is now over **all 3,922 tagged documents**. Documents can carry several
themes, so these do not sum to 100%.

| # | Theme | Docs | Reach | Was (80%) |
|---|---|---:|---:|---:|
| 3 | Quality, Authenticity & Seller Trust | 1,000 | **25.5%** | 24.7% |
| 1 | Unreliable Size & Fit Info | 653 | **16.6%** | 18.9% |
| 4 | Cumbersome Return & Exchange Policies | 632 | **16.1%** | 11.5% |
| 2 | Misleading Visual Media | 317 | 8.1% | 7.8% |
| 10 | Missing Product Specifications | 274 | 7.0% | 7.6% |
| 6 | Uncertain Stock & Availability Signals | 180 | 4.6% | 3.6% |
| 7 | Price Volatility & Hidden Checkout Fees | 171 | 4.4% | 3.7% |
| 5 | Pre-Purchase Support Gaps | 139 | 3.5% | 2.6% |
| 9 | Wishlist Interface Friction | 123 | 3.1% | 2.8% |
| 11 | Absent Social Proof | 99 | 2.5% | 2.3% |
| 8 | Uncertain Delivery Timelines | 84 | 2.1% | 1.3% |
| 12 | Passive Wishlist, No Re-engagement | 18 | 0.5% | 0.4% |

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
| Wishlist Interface Friction | 2.3% | 5.6% | 2.2% | 1.8% | 9.0% | 0.0% |

**905 of the 3,922 relevant documents (23%) are AJIO and Nykaa reviews, not
Myntra.** They were ingested deliberately, to catch comparison talk — but they
carry the return-exchange theme at 37.3%. Excluding them:

| Theme | Full corpus | Myntra-only (n=3,017) | Δ |
|---|---:|---:|---:|
| Quality, Authenticity & Seller Trust | 25.5% | **23.3%** | −2.2 |
| Unreliable Size & Fit Info | 16.6% | **19.5%** | +2.9 |
| Cumbersome Return & Exchange Policies | 16.1% | **9.7%** | **−6.4** |
| Missing Product Specifications | 7.0% | 8.7% | +1.7 |
| Uncertain Delivery Timelines | 2.1% | 0.9% | −1.3 |

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

`intent_type` at **81.3% genuine_intent against 1.0% bookmark** is a strong
result for the problem definition: these are people who meant to buy.

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

## Resuming — scoring is next

```bash
# 1. Score. Tagging is complete, so this is now safe to run.
npm run pipeline -- --stage score

# 2. Ship the dashboard.
npm run build && vercel --prod
```

**Then:** hand-audit ~50 tagged documents (`npm run audit -- --stage tag --n 50`)
before trusting the dashboard. Target ≥85% relevance agreement, ≥70% theme
agreement. This is the last unverified link in the chain — every number above
rests on the tagger being right, and it has not yet been checked against a human.

Watch during scoring: `ThemeScore.reach` is `count / relevantTotal` over the
**full** corpus, so the ranking will inherit the competitor-mix issue described
above. Consider whether the opportunity score should be computed Myntra-only, or
reported both ways.

## Still outstanding

- Reddit is ingested (1,636 docs). Social media (X, Instagram, Facebook) stays
  scoped out on feasibility.
- Parts 2–7 of the brief (metric decomposition, 5–6 user interviews, problem
  definition, MVP, success metrics, risks, 10-slide deck) remain yours.
  Deadline **4 September 2026, 3:59 PM IST** — 17 days out. Note the PDF
  contradicts itself and says 5 September on page 1; plan for the 4th.
