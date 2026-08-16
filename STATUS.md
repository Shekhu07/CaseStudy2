# Status — resume here

Last updated: 16 Aug 2026, 19:15 IST

## Where things stand

| Stage | State |
|---|---|
| 0 · Ingest | **Done** — 17,511 unique docs, five sources |
| 1 · Relevance | **Done** — 17,471 classified, **3,575 relevant (20.5%)**. 40 docs unjudged (schema failures), safely queued |
| 2 · Taxonomy | **FAILED — must be re-run.** `data/out/taxonomy.json` is the stale 13-theme version induced from an app-store-heavy subset |
| 3 · Tagging | **Not started.** 128 tags built against the stale taxonomy are quarantined in `tags.stale-taxonomy.json` |
| 4 · Scoring | Not started |
| Deployment | Live shell at <https://myntra-wishlist-discovery-engine.vercel.app> — dashboard shows the placeholder, `/api/classify` works in production |

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

## Three bugs to fix before resuming

**1. Taxonomy consolidation exceeds the token ceiling.**
`taxonomyMergePrompt` feeds all ~68 candidate themes into one call: 9,071
tokens against Groq's 8,000 TPM limit, so it returns 413. This is a size
problem, not a rate problem — retrying cannot help. Chunk the consolidation
(merge in groups, then merge the merges), and treat 413 as "reduce and retry"
rather than fatal.
→ `pipeline/prompts/index.ts`, `pipeline/stages/02-taxonomy.ts`

**2. Bare arrays fail schema validation.**
The model sometimes returns `[{…},{…}]` where the schema expects
`{"results": [{…}]}`. 16 tagging batches were discarded this way. In
`completeJson`, wrap a bare array into the expected object shape before
validating.
→ `pipeline/llm/provider.ts`

**3. The resume script reports success when a stage fails.**
It logged `taxonomy: 13 themes` after induction had failed, because it read
the pre-existing file, then proceeded to tag against the stale taxonomy.
Verify the artifact actually changed (mtime + content) and abort loudly if
not. Checking that a command exited is not verification.
→ `scripts/resume-run.sh`

## Resuming

Quotas reset at midnight US Pacific. Relevance is cached and complete, so it
will not re-run.

```bash
# after the three fixes above
npm run pipeline -- --stage taxonomy --force   # REVIEW data/out/taxonomy.json
npm run pipeline -- --stage tag
npm run pipeline -- --stage score
npm run build && vercel --prod
```

Or `nohup ./scripts/resume-run.sh > /dev/null 2>&1 &` once it verifies
artifacts properly. Progress log: `data/resume-run.log`.

**Watch for:** whether the re-induced taxonomy surfaces **price uncertainty,
occasion appropriateness and styling**. Their absence from the first attempt
was the clearest symptom of app-store bias; the corpus is now 60% YouTube, so
they should appear. If they still do not, the tagging schema's
`information_needs` and `intent_type` options need revisiting.

**Then:** hand-audit ~50 tagged documents (`npm run audit -- --stage tag --n 50`)
before trusting the dashboard. Target ≥85% relevance agreement, ≥70% theme
agreement.

## Still outstanding

- Reddit and social media are scoped out and documented as such.
- Parts 2–7 of the brief (metric decomposition, 5–6 user interviews, problem
  definition, MVP, success metrics, risks, 10-slide deck) remain yours.
  Deadline **4 September 2026, 3:59 PM IST** — note the PDF contradicts itself
  and says 5 September on page 1; plan for the 4th.
