/**
 * All prompts live here, versioned in git, so the deck can cite exactly
 * what the engine asked the model.
 */
import {
  EXTERNAL_BEHAVIOURS,
  INFORMATION_NEEDS,
  INTENT_TYPES,
  JOURNEY_STAGES,
  SEGMENT_SIGNALS,
  type Doc,
  type FrictionTheme,
} from "../types.ts";

export const BUSINESS_CONTEXT = `
You are analysing public conversations about Myntra, an Indian online fashion
retailer, on behalf of its Growth product team.

The team's business metric is:
  "the percentage of users who purchase at least one item from their WISHLIST
   within 30 days of adding it."

A wishlist add is a strong signal: the user has explicitly expressed interest in
an item but stopped short of buying. The team wants to understand what stands
between "I saved this" and "I bought this".

Hard constraint on any eventual solution: NO monetary incentives (no coupons,
discounts, cashback or price cuts). So friction that can only be resolved by
lowering the price is LESS actionable than friction resolvable through
information, confidence, tooling or experience design.
`.trim();

/* ---------------------------- Stage 1 ---------------------------- */

export const relevanceSystem = `
${BUSINESS_CONTEXT}

Your job is a RELEVANCE FILTER, and you must be HARSH. The default answer is
false. Most documents in this corpus are irrelevant and should be rejected.

A document is relevant ONLY if it contains a DECISION SIGNAL: evidence about
why a shopper did, did not, or has not yet bought something they were
interested in. Naming a topic is not a decision signal. The document must
show one of:

1. Saving / wishlisting / carting behaviour, or items sitting unbought.
2. Hesitation, doubt, deliberation, or an explicitly postponed purchase.
3. Uncertainty BEFORE buying about fit, size, fabric, colour, quality,
   styling or occasion — expressed as something they could not determine.
4. Comparing products, brands, sellers or apps in order to decide.
5. Waiting on a price or a sale before buying.
6. Seeking reassurance — reviews, photos, opinions, offline try-on — before
   committing.
7. A stated reason for abandoning or refusing a purchase.
8. A repeated bad experience explicitly changing how they shop or decide now
   (e.g. "sizes are never right so now I order three and return two", or
   "after that I check reviews first"). The behaviour change is the signal.
9. An EXPECTATION GAP: a specific, concrete mismatch between what the listing
   promised and what actually arrived — the size chart was wrong, the colour
   was nothing like the photo, the fabric was not what was described, the
   images looked AI-generated or staged, the item was not as pictured.
   These are relevant even when written after the purchase, because they name
   precisely the thing a shopper cannot verify before buying.

   Point 9 requires a FAILURE, and applies only when both hold:
     (i)  the listing and the reality DIVERGED, and
     (ii) the divergence is specific and about product information.

   "Colour was navy in the photo and black in real life" — accept.
   "The size chart said 40 but it fits like a 38" — accept.
   "Quality was bad" — too vague, reject.
   "True to size", "exactly as shown in the picture", "fits perfectly",
   "quality as described" — these are expectations being MET. They are praise.
   REJECT them. A confirmation that nothing went wrong is not a friction and
   tells a product manager nothing about why anyone hesitates.

Mark relevant = FALSE, with no exceptions, when the document is only:
- Praise, however detailed, with no hesitation or decision described.
  "Great collection, easy to order, products exactly as shown, fast delivery"
  is PRAISE. It is not a decision signal. Reject it.
- Abuse or a complaint with no bearing on a future buying decision.
- Post-purchase commentary that reports satisfaction, or dissatisfaction in
  vague terms, without naming a specific information gap per point 9.
- Delivery, courier, packaging, refund, wallet, payment or support issues.
- App crashes, login problems, performance.
- Ratings-bait or one-liners ("best app", "worst app", "good", "nice").
- Anything unrelated to buying fashion.

Two tests before you answer true:
  (a) Could you name the specific thing that made this shopper pause, doubt,
      compare, wait, or walk away? If not, it is false.
  (b) Would a product manager working on wishlist-to-purchase conversion
      learn anything actionable from this sentence? If not, it is false.

The "relevance" number is your confidence that a decision signal is genuinely
present. Use below 0.6 when you are unsure — those are discarded downstream.
`.trim();

export function relevancePrompt(docs: Doc[]): string {
  const body = docs
    .map((d, i) => `[${i}] (${d.source}${d.rating ? `, ${d.rating}★` : ""}) ${d.text.slice(0, 900)}`)
    .join("\n\n");

  return `Classify each document.

${body}

Return JSON exactly of the form:
{"results":[{"index":0,"relevant":true,"relevance":0.0-1.0,"reason":"<=15 words"}]}

Include one object for every index from 0 to ${docs.length - 1}, in order.
"relevance" is your confidence that this document informs the wishlist-to-purchase question.`;
}

/* ---------------------------- Stage 2 ---------------------------- */

export const taxonomySystem = `
${BUSINESS_CONTEXT}

Your job is TAXONOMY INDUCTION. You will read real shopper conversations and
induce, bottom-up, the distinct FRICTIONS that stop a saved/liked fashion item
from being purchased.

Rules:
- Derive themes from what the text actually says. Do not impose a generic
  e-commerce checklist.
- Each theme must name a specific blocker to purchasing something the shopper
  already likes — not a general complaint about the retailer.
- Themes must be mutually distinguishable. If two candidates overlap, merge them.
- Prefer the shopper's own framing over corporate vocabulary.
- Exclude post-purchase and logistics issues unless they demonstrably cause
  hesitation BEFORE buying (e.g. "I don't buy because returns are a hassle" is
  in scope; "my parcel was late" is not).
`.trim();

export function taxonomyProposePrompt(texts: string[]): string {
  return `Here are ${texts.length} real shopper conversations.

${texts.map((t, i) => `[${i}] ${t.slice(0, 500)}`).join("\n\n")}

Induce the distinct frictions that prevent a liked/saved fashion item from being
purchased. Return JSON:
{"themes":[{"name":"...","definition":"one or two sentences","evidence_indices":[0,3]}]}

Propose between 6 and 14 themes for this batch. Ground every theme in at least
two documents from this batch.`;
}

export function taxonomyMergePrompt(candidates: string, target = "12 to 16"): string {
  return `Below are candidate friction themes independently induced from different
batches of the same corpus. They overlap and use inconsistent wording.

${candidates}

Consolidate them into a single clean taxonomy of ${target} themes that covers the
candidates without redundancy.

PRESERVE SPECIFICITY. This is the hardest requirement and the one most often
failed. Merging must combine overlapping themes WITHOUT abstracting away the
concrete mechanism the shoppers actually described.

  BAD  — "Product Info & Visual Gaps: missing or unclear images, specs or
         details prevent shoppers from evaluating the item."
  GOOD — "Studio Photography Misleads on Colour and Fabric: edited lighting,
         AI-rendered models and single-angle shots leave shoppers unable to
         judge true colour, fabric weight or drape, so they defer the buy."

The bad version could have been written about any shopping site by someone who
never read the corpus. The good version names the mechanism. If a definition
you produce would be equally true of an electronics retailer, it is too
abstract — put the specific detail back.

Keep the vocabulary the shoppers used. Named specifics — size charts differing
between brands, doorstep return QC, AI-looking model images, non-returnable
tags discovered late, waiting for a sale that never lowers the price — are the
value of this taxonomy. Do not sand them off.

ALSO: drop candidates that are not pre-purchase frictions. App crashes, payment
failures, slow support and delivery logistics belong in the taxonomy ONLY where
the candidate says they make shoppers hesitate BEFORE buying. A generic
"Customer Support Friction" or "Platform Performance" theme is out of scope.

Return JSON:
{"themes":[{
  "id":"kebab-case-slug",
  "name":"Short human-readable name (max 6 words)",
  "definition":"Two sentences naming the SPECIFIC mechanism, and why it blocks purchase.",
  "includes":["3-5 concrete signals that mean a document belongs here"],
  "excludes":["2-4 nearby signals that do NOT belong here"]
}]}

The taxonomy must be exhaustive enough that most documents fit at least one theme,
and precise enough that a careful human would tag documents the same way twice.`;
}

/* ---------------------------- Stage 3 ---------------------------- */

export function taggingSystem(themes: FrictionTheme[]): string {
  const list = themes
    .map(
      (t) =>
        `- ${t.id} — ${t.name}: ${t.definition}\n    includes: ${t.includes.join("; ")}\n    excludes: ${t.excludes.join("; ")}`,
    )
    .join("\n");

  return `
${BUSINESS_CONTEXT}

Your job is STRUCTURED TAGGING against a fixed taxonomy.

FRICTION THEMES (use these ids exactly; assign only those genuinely evidenced):
${list}

Field definitions:
- severity 1-5: how strongly this friction blocks the purchase for this shopper.
  1 = passing remark, 3 = real hesitation, 5 = explicitly abandoned or refuses to buy.
- journey_stage: where in the journey this sits — one of ${JOURNEY_STAGES.join(", ")}.
- intent_type: ${INTENT_TYPES.join(", ")}.
    genuine_intent = saved meaning to buy; bookmark = saved as inspiration or
    "someday"; price_watch = saved explicitly waiting on price; unclear otherwise.
- information_needs: what the shopper lacked. Options: ${INFORMATION_NEEDS.join(", ")}.
- external_behaviour: whether they went outside the app. Options: ${EXTERNAL_BEHAVIOURS.join(", ")}.
- workaround: what this shopper does TODAY to cope, in their own terms.
    Empty string if none is described. Do not invent one.
- segment_signals: shopper characteristics evidenced in the text.
    Options: ${SEGMENT_SIGNALS.join(", ")}.
- evidence_quote: a VERBATIM span copied from the document, max 240 characters,
    that best supports your tagging. Never paraphrase.
- confidence 0-1: how confident you are in this tagging overall.

If a document evidences no theme in the taxonomy, return an empty themes array.
Never invent theme ids. Never invent quotes.
`.trim();
}

export function taggingPrompt(docs: Doc[]): string {
  const body = docs
    .map((d, i) => `[${i}] (${d.source}${d.rating ? `, ${d.rating}★` : ""}) ${d.text.slice(0, 1400)}`)
    .join("\n\n");

  return `Tag each document.

${body}

Return JSON:
{"results":[{
  "index":0,
  "themes":["theme-id"],
  "severity":3,
  "journey_stage":"evaluate",
  "intent_type":"genuine_intent",
  "information_needs":["fit_and_size"],
  "external_behaviour":["none"],
  "workaround":"",
  "segment_signals":["fit_uncertainty_prone"],
  "evidence_quote":"verbatim span from the document",
  "confidence":0.8
}]}

One object per index from 0 to ${docs.length - 1}, in order.`;
}

/* ---------------------------- Stage 4 ---------------------------- */

export function judgementSystem(): string {
  return `
${BUSINESS_CONTEXT}

Your job is to judge each friction theme on two independent axes. You are
advising a product team on where to invest, so be discriminating: if every
theme scores highly the judgement is useless.

metric_proximity (0-1): if this friction were fully resolved, how directly and
  how quickly would it raise the share of users who buy a wishlisted item within
  30 days of saving it? 1.0 = resolving it converts hesitating savers almost
  immediately. 0.2 = real problem, but mostly affects satisfaction, retention or
  acquisition rather than this specific 30-day conversion.

tractability (0-1): how solvable is this in-product, WITHOUT monetary incentives
  (no coupons, discounts, cashback, price cuts)? 1.0 = addressable through
  information, tooling, UX or AI that the team controls. 0.1 = essentially
  requires discounting, supply-chain change, or third-party behaviour change.

Score the set relative to each other. Use the full range.
`.trim();
}

export function judgementPrompt(
  themes: Array<FrictionTheme & { count: number; reach: number; severityMean: number }>,
): string {
  const body = themes
    .map(
      (t) =>
        `- id: ${t.id}\n  name: ${t.name}\n  definition: ${t.definition}\n  observed in ${t.count} documents (${(t.reach * 100).toFixed(1)}% of relevant corpus), mean severity ${t.severityMean.toFixed(2)}/5`,
    )
    .join("\n");

  return `Judge these ${themes.length} friction themes.

${body}

Return JSON:
{"judgements":[{
  "id":"theme-id",
  "metric_proximity":0.0-1.0,
  "metric_proximity_rationale":"one sentence, max 30 words",
  "tractability":0.0-1.0,
  "tractability_rationale":"one sentence, max 30 words"
}]}

One judgement per theme id above.`;
}
