<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:casestudy2-rules -->

# This is a graded PM case study, not an engineering project

Read **`GUARDRAILS.md`** before doing any work here, and **`STATUS.md`** for current state.

Case Study 1 (the Blinkit project, `~/Blinkit_PRD`) **missed its cutoff**: 200.36/300 against
208.57. It did not fail on research depth — it failed on **Creativity of Solution** (56.86/100 vs a
67.83 peer median) and **Data & Metrics Orientation** (20.63/40 vs 31.27). Either one lifted to the
median would have passed. The cause was effort allocation: a research/engineering artifact was
submitted into a product-management evaluation.

The brief here (`Case_Study2.pdf`) has turned both weak competencies into mandatory graded sections:
**Part 2** is a business-metric decomposition, **Part 6** demands leading indicators, guardrail
metrics, and the definition + rationale of each.

## Hard rules

1. **Part 1 is DONE. Do not build more pipeline.** Discovery earns ~2 slides out of 10. Further
   polish is negative ROI. The three open items in STATUS.md are time-boxed to one day total:
   do the human spot-check, *footnote* theme 5 rather than re-scope it, skip the severity clamp
   (3.82 → 3.84 is noise).
2. **Parts 2–7 hold nearly all remaining marks.** Metric decomposition, primary research, problem
   definition, MVP, success metrics, risks, deck. Push work there by default.
3. ~~**Interviews are the schedule long pole** — recruit before anything else.~~ **Amended
   2 Sep 2026:** the interview track was retired on privacy grounds (see
   `docs/research/interview-guide.md`). Primary research is the two surveys —
   `wishlist-survey.md` (16 responses, real wishlists, no screen-share) and
   `prototype-usability-survey.md` (in field, on the prototype). Segment is still
   determined by the corpus: `fit_uncertainty_prone` (24.5%) and `new_or_low_trust_user` (24.0%).
4. **Do arithmetic, not citation.** CS1 quoted the company's public numbers as context and never
   multiplied them. Every metric claim needs a baseline, a target, and an experiment design
   (control, MDE, duration). CS1's deck contained zero occurrences of "north star", "success
   metric", "A/B", "target", "uplift", "cohort".
5. **The MVP must resolve the uncertainty, not announce it.** CS1 shipped a push notification with
   better copy and lost 43 points off max on Creativity. The lazy answer here is "remind users about
   their wishlist" — the same mistake. The brief bans monetary incentives, closing the other lazy
   door. Test before building: *if the user reads our output and still doesn't know whether it fits,
   we built a message.*
6. **State limits once, plainly, then commit.** CS1 hedged so consistently ("plan only", "proposed,
   not yet measured", "honest scope limit") that rigour read as low conviction, costing Clarity.
7. **Deck rules are strict**: 10 slides max, **font size 14**, no fellow name anywhere, slide titles
   state the key message, colour-blind-safe, every linked artefact verified accessible logged-out.
   Presentation was CS1's only at-par competency — hold it, don't over-invest in it again.

## Claims about this corpus

- Quote the **Myntra-only** column for any Myntra claim. 23% of the corpus is AJIO/Nykaa, which
  inflates the returns theme by 6.3pp.
- **This corpus does not support a wishlist-UI-centric MVP** — direct wishlist evidence is ~60 docs
  (~1.5%). It supports **fit and trust**.
  **Amended 2 Sep 2026 — the prohibition is lifted; the positive half stands.** The shipped MVP
  is wishlist-centric, so this rule and the deliverable had to be reconciled rather than left
  contradicting each other. The reasoning, recorded rather than quietly dropped: the corpus is
  structurally blind to the wishlist re-entry moment. Reviews are written after delivery and
  about the product — nobody writes a review about an item they saved and never returned to.
  A 1.5% share therefore measures how often people *write about* wishlists, not how often
  wishlists fail. The engine ranked complaint volume, and could not rank a conversion blocker it
  cannot observe. Fit and trust remain the *content* of the doubt the MVP answers, so that half
  of the rule still governs. Fit is the defensible headline: it rises to 19.5%
  Myntra-only and is strongest in YouTube (24.3%), the source closest to pre-purchase deliberation.
- Theme 12 was over-called and is confirmed rarest (18 docs, 0.5%, lowest judged proximity). Do not
  build the MVP on it.

## Deadline

**5 September 2026, 3:59:00 PM IST.** Confirmed 3 Sep 2026 against the NextLeap project dashboard, which is the system of record and states "Submission deadline: Sep 5, 3:59:00 PM (Asia/Calcutta)". The brief PDF's page 8 still says 4 September; it is stale and the dashboard overrides it. Late submissions are rejected "even if it is by a few seconds", so finish on the 4th and submit with a day in hand.

Nothing ships on the deadline day; freeze and self-check 24h before.

<!-- END:casestudy2-rules -->
