# Status — resume here

Last updated: 17 Aug 2026, 17:25 IST

## Where things stand

| Stage | State |
|---|---|
| 0 · Ingest | **Done — six sources**, 19,143 unique docs. Reddit added: 1,636 docs over two Apify runs |
| 1 · Relevance | **Done** — 19,143 classified, **3,922 relevant (20.5%)**, **0 unjudged**. The 40 old schema failures cleared, adding 9 |
| 2 · Taxonomy | **Done** — re-induced from the full corpus, then hand-edited to **11 themes**. `data/out/taxonomy.json` |
| 3 · Tagging | **Not started.** Nothing blocks it now — read the 12th-theme question below first. 128 tags from the stale taxonomy stay quarantined in `tags.stale-taxonomy.json` |
| 4 · Scoring | Not started, blocked on tagging |
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

## The taxonomy, as it now stands

Induced 17 Aug 04:12 UTC (`gemini-3.7-flash`, sample of 320), hand-edited
08:07 UTC. Pre-edit version preserved at `data/out/taxonomy.pre-edit.json`.

1. Unreliable Size & Fit Info
2. Misleading Visual Media
3. Quality, Authenticity & Seller Trust
4. Cumbersome Return & Exchange Policies
5. Pre-Purchase Support Gaps
6. Uncertain Stock & Availability Signals
7. Price Volatility & Hidden Checkout Fees
8. Uncertain Delivery Timelines
9. Wishlist Interface Friction
10. Missing Product Specifications
11. Absent Social Proof

Three edits induction could not make for itself: split "Missing Specs &
Customer Reviews" into 10 and 11 (a content gap a merchandiser closes is not
the same problem as needing other buyers, and the brief names social proof
explicitly); merged "Perceived Platform Fraud" into 3 (same underlying doubt —
split, the evidence divides across two rows and depresses both); merged
"Broken Functional Buttons" into 9 (a dead button is mechanical effort, the
same class of blocker as a wishlist that loses your place).

## Reddit coverage check — the 11 themes hold, but one is missing

40 relevant Reddit documents, sampled with `random.seed(42)`, read by hand
against the 11 definitions. Reddit is evidence the taxonomy was never induced
from, so this was the last cheap check before tagging commits quota.

- **~21 of 40 fit a theme cleanly.** Seller trust and authenticity is the
  workhorse (fake ASICS from an offline store's mouth, grey-market perfume,
  Bhima gold billing, "unknown brands don't spend on QC"). Returns, sizing and
  wishlist-interface friction all show up in the shopper's own words.
- **~10 more fit partially**, usually because the document is off-platform.
- **~6 are off-domain noise** that passed the relevance filter — r/criterion,
  r/JunoMains, a bike sprocket in r/TalesFromRetail. Structurally similar
  hesitation, wrong product entirely. About 15% of the Reddit slice; worth
  knowing when quoting Reddit as evidence.

**Do not re-induce the taxonomy.** The 11 themes survive contact with Reddit.

**But a 12th theme is missing, and it may be the most important one.**
Repeatedly, shoppers describe the wishlist as *passive* — it stores an item and
then does nothing:

> "Every wishlist I've used is mark-and-forget. You save something and then
> nothing ever happens — you either check manually forever, or you give up and
> pay full price. The saving was never the hard part. Knowing when is."

> "I always save stuff thinking I'll check back when there's a sale and then
> completely forget about it."

No current theme covers this. Theme 9 is *mechanical* friction — items vanish,
scroll position lost, the 1,000-item cap. Theme 7 is price movement and theme 6
is stock. This is different: the wishlist works exactly as built, and that is
the problem. Nothing brings the shopper back.

It is also the most metric-proximate friction in the set — the business metric
is literally purchase-within-30-days-of-saving, and this names why the 30 days
elapse. A theme that is both highly tractable without discounts (notify on price
drop, low stock, back-in-size) and directly on-metric would likely top the
opportunity ranking, which is exactly the kind of finding the ranking exists to
surface.

Suggested: **"Passive Wishlist — No Re-engagement Signal"**. Add it to
`data/out/taxonomy.json` by hand before tagging, the same way the last three
edits were made, and record it in `editNote`.

## Also check after tagging — not a blocker

Yesterday's watch-item was whether re-induction would surface **price
uncertainty, occasion appropriateness and styling**. Their absence was the
clearest symptom of app-store bias.

Price came through cleanly (theme 7). **No theme names occasion or styling.**
But the tagging facets do: `INFORMATION_NEEDS` (`pipeline/types.ts:83`)
already contains `occasion_appropriateness`, `styling_and_pairing`,
`social_validation` and `price_trajectory` — all seven factors the brief names
on p.4 are capturable at tag time. So the signal is recordable, tagging is not
blocked, and this becomes a post-tagging measurement rather than a decision.

After tagging, read `overall.informationNeeds` in `data/out/analysis.json`. If
`occasion_appropriateness` or `styling_and_pairing` carry a substantial share
while no theme names them, that is evidence the taxonomy under-covers them and
grounds for adding a theme. If their share is small, the taxonomy is right and
the brief's question is answered from the facet distribution instead.

## Fixed since last checkpoint

All three blockers from the 16 Aug entry are closed in `882cd21`:

- Taxonomy consolidation is chunked (merge in groups, then merge the merges),
  and 413 is treated as "reduce and retry" rather than fatal.
- `completeJson` wraps a bare `[…]` into `{"results": […]}` before validating.
- `scripts/resume-run.sh` compares artifact mtime before and after a stage and
  aborts loudly if the file did not change (`scripts/resume-run.sh:122`).

## Resuming

LLM quotas reset at midnight US Pacific. Ingest, relevance and taxonomy are all
complete and cached, so none of them re-run. The next decision is the 12th theme
above — a hand edit to `data/out/taxonomy.json`, not a re-induction.

```bash
# 1. Optional but recommended: add the passive-wishlist theme by hand,
#    then note the edit in the file's editNote field.

# 2. Tag, then score. This is where the remaining LLM quota goes.
npm run pipeline -- --stage tag
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
