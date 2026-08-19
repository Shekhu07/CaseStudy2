# Part 4 — Define the problem *(skeleton)*

> **(c) and (d) are deliberately unfinished.** Both firm up materially once six
> people have walked you through their own wishlists; drafting them now would mean
> inventing the answer and then defending it. Everything else is drafted.
>
> Myntra-only cohort (n = 3,017) throughout.

---

## (a) Target user segment — DRAFTED

**Primary: fit-uncertain shoppers.** 28.3% of Myntra-only documents, and the
sharpest concentration in the corpus — a **3.99× lift** on Unreliable Size & Fit
Info, the strongest segment-theme association we found.

Pre-purchase, this segment names one thing:

| Their unresolved need | Share |
|---|---|
| **fit_and_size** | **84.5%** |
| fabric_and_quality | 7.4% |
| true_colour_and_appearance | 6.1% |

**Secondary: new / low-trust shoppers.** 20.9%, 2.81× lift on Quality,
Authenticity & Seller Trust. Blocked on something else entirely — 55.7%
`seller_or_brand_trust`.

**Sizing logic.** These are shares of *documents*, not of users, and reach here
means "share of people who wrote something", not share of Myntra's base. Absolute
segment size needs internal data; what the corpus establishes is **relative
concentration**, and fit-uncertainty is the densest cluster in it.

> **Honest caveat, and check this before any slide claims otherwise.** The two
> segments overlap on exactly 1 document out of 1,485 — but that is a *labelling
> artefact*: the tagger assigned at most one segment signal per document (1,955
> docs carry exactly one, 1 carries two). **We cannot claim these are distinct
> populations.** A real shopper is quite plausibly both fit-uncertain and
> low-trust. The interviews and survey settle it; the corpus cannot.

**Recommendation:** lead with fit. It is the larger signal, the higher lift, and
46.2% of every doubt shoppers name. Trust is the natural second wave.

## (b) Product outcome to influence — DRAFTED

**Term C in the Part 2 tree: doubt-resolution rate** — the share of saved items
where the blocking question actually gets answered.

Specifically **fit confidence**, which is 46.2% of all named doubts.

Not term B (revisit — already served by notifications and price-drop alerts), not
term D (mechanics — its dominant friction is price at 24.8%, which the brief bans).
Term C is the one nothing in the product addresses.

## (c) Root cause — SKELETON, blocked on interviews

**Current best articulation, to be tested not assumed:**

> The wishlist stores the item and discards the question. At save time the shopper
> has one specific unresolved doubt — *will this fit my shoulders, is this fabric
> what it claims, can I trust this seller*. Myntra records the SKU and throws the
> question away. On return they face a flat reverse-chronological grid with no
> memory of why anything was saved and no path to answering any of it, so they
> re-enter the same uncertainty they left and the cheapest available action is to
> scroll past. **The wishlist accumulates decisions instead of closing them.**

**What the corpus supports today:** that the doubt exists and what it is about
(66.1% name one; 46.2% are fit).

**What it cannot support, and the interview must:**
- That the doubt is *still* unresolved at revisit, rather than resolved and
  declined. The corpus sees the doubt once, never twice.
- That the flat grid is causal rather than incidental.
- The laddered root cause beneath "I'm not sure about the size" — the playbook's
  "and what's behind that?" ×3. Surface answers are not root causes.

**Falsification test.** If walkthroughs show people know exactly why each item is
saved and are simply waiting for money or an occasion, this articulation is wrong
and the direction changes. Say so if it happens.

## (d) Existing workarounds — BLOCKED on interviews

The evidence that the need is real, and **our thinnest section.**

`external_behaviour` reads 2.2% corpus-wide — `checked_other_app` 2.2%,
`visited_offline_store` 1.7%, everything else under 0.5%. STATUS.md already
concedes this is an artefact of scraped text: people narrate outcomes, not
process. Survey Q15 was cut in the shortening, so **the interviews are now the
only instrument that will evidence this.**

To fill from the walkthroughs — the playbook's workaround block, §3.3:

- [ ] Screenshotting into WhatsApp for a friend's opinion
- [ ] Hunting reviews for photos from someone with a similar body
- [ ] Ordering two sizes intending to return one
- [ ] Cross-checking the brand's own site, YouTube hauls, Instagram
- [ ] A notes app or Instagram "saved" folder as the *real* shortlist
- [ ] Trying it in a store, then ordering online

Target: **6 walkthroughs, 60–100 coded items.** A workaround named by four of six
users is worth a slide; one named once is an anecdote.

## (e) Why it creates user value — DRAFTED

Removes the specific doubt rather than the reminder. Concretely: less decision
fatigue on a list that currently only grows, less anxiety about a wrong purchase
in a category where the wrong purchase is embarrassing rather than merely
wasteful, and fewer returns to deal with.

The strongest framing is that **closing a decision is the value, in either
direction.** Deleting an item is a good outcome — a shorter wishlist is a
higher-signal wishlist, and a list that can be finished is one people will open.

## (f) Why it makes business sense — DRAFTED

- **The demand is already on-platform.** These are people who found the product
  and expressed intent; 72.2% of pre-purchase deliberation carries genuine
  purchase intent. This is the cheapest incremental GMV available — no acquisition
  cost, no discount cost.
- **It protects contribution margin**, because it spends information rather than
  money. Every incumbent lever on the wishlist surface is monetary — discount
  badges, price-drop alerts, a cashback banner, a coupon above the first saved
  item. A non-monetary lever is margin-accretive by construction.
- **Returns.** Resolving fit *before* purchase should reduce the wrong-size orders
  that drive apparel returns. State this as the mechanism and then measure it —
  it is also the guardrail, because a fit tool that drives confident wrong-size
  purchases is a loss wearing a win's clothes.
- **It puts a low-value surface to work.** The wishlist tab today is a grid that
  ends in a motivational quote.

> Do not quote public financials as colour. CS1 did exactly that and scored
> 20.63/40. If a number appears here, multiply it by something.

## The evolution slide — DRAFTED, two blanks

```
BUSINESS METRIC  →  PRODUCT OUTCOME   →  AI DISCOVERY      →  PRIMARY RESEARCH   →  PROBLEM
W30 conversion      Decomposed to 4      19,143 docs →         [6 walkthroughs,      "The wishlist
                    terms; C (doubt      3,922 coded;          NN items coded]       stores the item
                    resolution) is       66.1% name an         [what changed]        but not the
                    unowned              unanswered doubt                            decision"
                                         46.2% of them fit
```

**Falsifiability line — two candidates, both real:**

1. *"Return anxiety looked like a top-three blocker at 11.3%. Restricted to
   pre-purchase it is 1.9% — returns are what people complain about after, not
   what stops them buying. We dropped it."*
2. *"We expected the corpus to describe wishlist behaviour. 1.56% of it mentions a
   wishlist at all. That is why Part 3 exists, and why it is a walkthrough rather
   than a survey."*

Use (1) on the slide — it is a direction change caused by our own arithmetic.
Keep (2) for the methodology answer, where it doubles as the reason the research
design is what it is.

---

## Before this is finishable

1. 6 walkthrough interviews → (c) and (d)
2. Survey responses → whether fit and trust are one population or two
3. Teardown screenshots → the visual for (c)
