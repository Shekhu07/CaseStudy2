# Status — resume here

Last updated: 17 Aug 2026, 18:05 IST

## Where things stand

| Stage | State |
|---|---|
| 0 · Ingest | **Done for five sources** — 17,511 unique docs. **Reddit implemented, not yet run** — needs `APIFY_TOKEN` |
| 1 · Relevance | **Done** — 17,471 classified, **3,575 relevant (20.5%)**. 40 docs unjudged (schema failures), safely queued |
| 2 · Taxonomy | **Done** — re-induced from the full corpus, then hand-edited to **11 themes**. `data/out/taxonomy.json` |
| 3 · Tagging | **Not started — held on purpose.** See the open question below before running it. 128 tags from the stale taxonomy stay quarantined in `tags.stale-taxonomy.json` |
| 4 · Scoring | Not started, blocked on tagging |
| Deployment | Live shell at <https://myntra-wishlist-discovery-engine.vercel.app> — dashboard still shows the placeholder (no scoring output to render), `/api/classify` works in production |

Nothing is running in the background.

### Relevance funnel by source

| Source | Classified | Relevant | Rate |
|---|---:|---:|---:|
| YouTube | 7,685 | 2,138 | **27.8%** |
| Sitejabber | 153 | 37 | 24.2% |
| Competitor apps | 4,571 | 905 | 19.8% |
| Google Play | 3,871 | 406 | 10.5% |
| Apple App Store | 1,191 | 89 | 7.5% |

YouTube supplies 60% of the relevant corpus and is 3.7× richer than App Store
reviews. Adding it was the highest-leverage decision in the build.

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

## Check after tagging — not a blocker

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

Quotas reset at midnight US Pacific. Relevance and taxonomy are both cached
and complete, so neither re-runs.

```bash
# 1. Reddit — the one source the brief names that the corpus lacks.
#    Set APIFY_TOKEN first. Dry-run the cap before spending the free credit:
APIFY_MAX_ITEMS=20 npm run pipeline -- --stage ingest --only reddit
npm run pipeline -- --stage ingest --only reddit    # full run, maxItems 1200
npm run pipeline -- --stage relevance               # cached; Reddit docs only

# 2. Sample ~40 relevant Reddit docs against the 11 themes before deciding
#    whether re-induction is warranted. Re-inducing discards the hand-edits.

# 3. Then
npm run pipeline -- --stage tag
npm run pipeline -- --stage score
npm run build && vercel --prod
```

**Then:** hand-audit ~50 tagged documents (`npm run audit -- --stage tag --n 50`)
before trusting the dashboard. Target ≥85% relevance agreement, ≥70% theme
agreement.

## Still outstanding

- Reddit is implemented but not yet ingested — needs `APIFY_TOKEN` (see below).
  Social media (X, Instagram, Facebook) stays scoped out on feasibility.
- Parts 2–7 of the brief (metric decomposition, 5–6 user interviews, problem
  definition, MVP, success metrics, risks, 10-slide deck) remain yours.
  Deadline **4 September 2026, 3:59 PM IST** — 18 days out. Note the PDF
  contradicts itself and says 5 September on page 1; plan for the 4th.
