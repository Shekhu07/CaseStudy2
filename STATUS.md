# Status — resume here

Last updated: 18 Aug 2026, 00:25 IST

## Where things stand

| Stage | State |
|---|---|
| 0 · Ingest | **Done — six sources**, 19,143 unique docs. Reddit added: 1,636 docs over two Apify runs |
| 1 · Relevance | **Done** — 19,143 classified, **3,922 relevant (20.5%)**, **0 unjudged**. The 40 old schema failures cleared, adding 9 |
| 2 · Taxonomy | **Done — 12 themes.** Induced, hand-edited three times, then a 12th added 17 Aug. `data/out/taxonomy.json` |
| 3 · Tagging | **80% done — 3,122 of 3,922.** Stopped on daily free-tier quota, not on an error. Resumes from cache; see below |
| 4 · Scoring | Not started. Wait for tagging to complete — scoring a partial tag set would bake 80% coverage into the ranking |
| Deployment | Live shell at <https://myntra-wishlist-discovery-engine.vercel.app> — dashboard still shows the placeholder (no scoring output to render), `/api/classify` works in production |

Nothing is running in the background.

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
pulled r/AmItheAsshole and r/CrusaderKings. It cost $1.20 for 48 relevant docs
and did **not** test the occasion/styling hypothesis — see below.

### Apify budget — effectively spent

$4.40 of $5.00 used. The cycle resets **15 Sep**, after the 4 Sep deadline, so
the remaining $0.60 is the end of it. More Reddit volume, if wanted, should come
from the free OAuth route in `pipeline/sources/reddit.ts` — set
`REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET`, clear `APIFY_TOKEN`, and it dedupes
against what is already held.

## The taxonomy — 12 themes, with measured reach

Induced 17 Aug 04:12 UTC (`gemini-3.7-flash`, sample of 320), hand-edited
08:07 UTC, 12th theme added 17 Aug 17:26 UTC. Pre-edit version preserved at
`data/out/taxonomy.pre-edit.json`.

Reach is over the **3,122 documents tagged so far**, not the full 3,922.
Documents can carry several themes, so these do not sum to 100%.

| # | Theme | Docs | Reach |
|---|---|---:|---:|
| 3 | Quality, Authenticity & Seller Trust | 770 | **24.7%** |
| 1 | Unreliable Size & Fit Info | 589 | **18.9%** |
| 4 | Cumbersome Return & Exchange Policies | 360 | 11.5% |
| 2 | Misleading Visual Media | 244 | 7.8% |
| 10 | Missing Product Specifications | 236 | 7.6% |
| 7 | Price Volatility & Hidden Checkout Fees | 117 | 3.7% |
| 6 | Uncertain Stock & Availability Signals | 113 | 3.6% |
| 9 | Wishlist Interface Friction | 88 | 2.8% |
| 5 | Pre-Purchase Support Gaps | 81 | 2.6% |
| 11 | Absent Social Proof | 73 | 2.3% |
| 8 | Uncertain Delivery Timelines | 40 | 1.3% |
| 12 | Passive Wishlist, No Re-engagement | 13 | 0.4% |

789 tagged documents (25%) carry no theme. Mean severity on themed documents
is 3.69 of 5.

Three edits induction could not make for itself: split "Missing Specs &
Customer Reviews" into 10 and 11 (a content gap a merchandiser closes is not
the same problem as needing other buyers, and the brief names social proof
explicitly); merged "Perceived Platform Fraud" into 3 (same underlying doubt —
split, the evidence divides across two rows and depresses both); merged
"Broken Functional Buttons" into 9 (a dead button is mechanical effort, the
same class of blocker as a wishlist that loses your place).

### Theme 12 was over-called — read this before citing it

A hand read of 40 relevant Reddit documents found shoppers describing the
wishlist as *passive* — "mark-and-forget", nothing bringing them back — which
no existing theme covered. It was added as a 12th theme and predicted here to
be "plausibly the most important", on the reasoning that the metric is literally
purchase-within-30-days-of-saving and this names why the 30 days elapse.

**Tagging disagreed. It is the rarest theme in the set: 13 documents, 0.4%, and
4 of those 13 are the single r/Gifts thread that prompted the idea.**

Two vivid quotes in a 40-document sample were read as a pattern. Quantification
exists to catch exactly that, and it did. Keep the theme — it is real, on-metric,
and `sqrt(reach)` compresses frequency so it will not be crushed in the ranking —
but it cannot headline a slide, and the MVP should not be built on it without
stronger evidence.

The corpus-wide facet counts are the honest place to look for wishlist
behaviour: `intent_type` is **79.1% genuine_intent** against **1.2% bookmark**,
which is a strong result for the problem definition. These are people who meant
to buy.

## Occasion and styling — answered, and the answer is no

The long-running watch-item was whether the taxonomy under-covered **occasion
appropriateness and styling**. It does not. Over 3,122 tagged documents:

| information_need | Share |
|---|---:|
| fit_and_size | **23.7%** |
| seller_or_brand_trust | **15.4%** |
| fabric_and_quality | 11.1% |
| return_and_exchange_certainty | 8.6% |
| true_colour_and_appearance | 8.0% |
| price_trajectory | 3.4% |
| social_validation | 1.6% |
| delivery_timing | 1.2% |
| styling_and_pairing | 0.7% |
| real_body_photos | 0.4% |
| occasion_appropriateness | 0.3% |

Both were fully expressible — `INFORMATION_NEEDS` (`pipeline/types.ts`) has
carried `occasion_appropriateness` and `styling_and_pairing` throughout — so
near-zero shares are a finding, not a blind spot. **Indian wishlist hesitation
is about trust and fit, not about what to wear something with.** That is a
defensible slide, and it closes the question the failed gap queries could not.

### One facet to distrust

`external_behaviour` looks under-detected: 2.4% checked another app, 1.9%
visited an offline store, 0.1% asked friends or family. Implausibly low for a
market where offline try-on is routine — and it is the facet answering the
brief's p.3 question, "what information do users seek outside Myntra before
purchasing". Inspect the tagging prompt before putting these numbers on a slide.

## Fixed since last checkpoint

All three blockers from the 16 Aug entry are closed in `882cd21`:

- Taxonomy consolidation is chunked (merge in groups, then merge the merges),
  and 413 is treated as "reduce and retry" rather than fatal.
- `completeJson` wraps a bare `[…]` into `{"results": […]}` before validating.
- `scripts/resume-run.sh` compares artifact mtime before and after a stage and
  aborts loudly if the file did not change (`scripts/resume-run.sh:122`).

And in `041e183`, the tagging run's own schema failures (~120 documents lost):

- `workaround` and `evidence_quote` now coerce `null` to `""`. Both mean
  "nothing to report"; rejecting null took the surrounding ~20-doc batch down.
- The bare-array re-wrap in `completeJson` was reporting the *unwrapped* error
  ("expected object, received array") when an element was also bad — naming
  nothing, and steering the repair round-trip at a problem that did not exist.
  It now prefers the wrapped error, which names `results.0.workaround`.

## Resuming

**Blocked on LLM quota until midnight US Pacific** (~12:30 PM IST). Tagging
stopped 80% through because every model on both tiers hit its daily free
ceiling — 63 of the 98 failed batches were quota, only 6 were the schema bug
now fixed. Ingest, relevance and taxonomy are complete and cached; tags are
cached per document, so the resume below picks up the remaining ~800 rather
than redoing the 3,122.

```bash
# 1. Finish tagging. Resumes from cache; expect ~800 documents.
npm run pipeline -- --stage tag

# 2. Only once tagging reports 3,922 — scoring a partial set would bake
#    80% coverage into the opportunity ranking.
npm run pipeline -- --stage score
npm run build && vercel --prod
```

**Then:** hand-audit ~50 tagged documents (`npm run audit -- --stage tag --n 50`)
before trusting the dashboard. Target ≥85% relevance agreement, ≥70% theme
agreement.

## Still outstanding

- Reddit is ingested (1,636 docs). Social media (X, Instagram, Facebook) stays
  scoped out on feasibility.
- Parts 2–7 of the brief (metric decomposition, 5–6 user interviews, problem
  definition, MVP, success metrics, risks, 10-slide deck) remain yours.
  Deadline **4 September 2026, 3:59 PM IST** — 18 days out. Note the PDF
  contradicts itself and says 5 September on page 1; plan for the 4th.
