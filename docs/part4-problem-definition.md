# Part 4 — Define the problem

> **(c) and (d) are drafted as a ladder with the evidence line marked on it.**
> Levels 1–3 are measured; levels 4–5 are hypotheses, and each names the instrument
> that tests it. That is a different thing from unfinished — the articulation is
> committed to and falsifiable, rather than withheld until the interviews decide it
> for us. What the walkthroughs change is which level survives, not whether we had
> a position.
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

## (c) Root cause — laddered, not stated

**A stated blocker is not a root cause.** "I'm not sure it'll fit" is where probe 4
*starts*; the guide then asks *"and what's behind that?"* three times. The same
discipline applied to the problem statement itself:

| Level | | Status |
|---|---|---|
| 1 · Symptom | Wishlisted items do not get bought | The brief |
| 2 · Stated blocker | *"I'm not sure it'll fit"* | **Measured** — 66.1% name a doubt, 46.2% of those are fit |
| 3 · Mechanism | **The wishlist stores the item and discards the question** | **Measured** — the teardown shows it directly |
| 4 · Why unanswerable | The information that would settle it is never joined to *this* shopper | Hypothesis — survey Q8 |
| 5 · Root cause | **The shopper carries the entire risk of being wrong** | Hypothesis — the walkthroughs |

**Level 3 — the mechanism, and the slide line:**

> At save time the shopper has one specific unresolved doubt — *will this fit my
> shoulders, is this fabric what it claims, can I trust this seller.* Myntra records
> the SKU and throws the question away. On return they face a flat
> reverse-chronological grid with no memory of why anything was saved and no path to
> answering any of it, so they re-enter the same uncertainty they left and the
> cheapest available action is to scroll past. **The wishlist accumulates decisions
> instead of closing them.**

**Level 4 — why the question cannot be answered where it is asked.** The doubt is
personal and every available answer is generic. A size chart describes the garment,
not the shopper. Reviews describe other people's bodies. Myntra already holds what
would settle it — this shopper's order history, what they kept, what they sent back
and why — and never brings any of it to the open question. The information exists;
the join does not.

**Level 5 — the root cause.** The shopper carries the entire risk of being wrong.
Catalogue is seller-supplied and sizing varies brand to brand, so the uncertainty is
structural rather than incidental. Every cost of the error lands on the shopper: the
return pickup, the refund wait, the wasted occasion, the mild embarrassment of a bad
buy in a category where clothes are not a neutral purchase. **The wishlist is where
unabsorbed risk accumulates.** Not-buying is not indecision — at that risk price it
is the rational move, which is why the item can sit there for months without the
shopper ever feeling they made a mistake.

### Why level 5 changes what gets built

Stopping at level 3 permits an MVP that reminds people what they saved and why. That
is a memory feature, and it fails the guardrails' own test: *if the user reads our
output and still doesn't know whether it fits, we built a message.*

Level 5 rules it out, and rules the incumbents' levers out with it. Read the teardown
against it:

| Lever | What it says to a shopper carrying the risk |
|---|---|
| Price-drop alert, discount badge, cashback banner, coupon | *"The risk is still entirely yours — here is ₹200 for carrying it"* |
| A fit verdict with **stated confidence** | *"We will spend what we know about you to shrink it"* |
| An honest **REMOVE** | *"We will tell you when it is not worth taking"* |

A discount does not reduce risk. It prices it, and leaves it exactly where it was.
That is why all three wishlist surfaces in `docs/teardown/` are monetary and all
three leave the item sitting there.

**This is what the brief's hardest constraint is actually for.** *No monetary
incentives* reads as a handicap at level 1 and as an instruction at level 5: solve
the problem where it lives instead of paying the shopper to tolerate it. The
constraint and the root cause point at the same build.

> **Precedent, for the framing not the feature.** Cash on Delivery is the standard
> Indian e-commerce example of this ladder. Framed at level 1 — *"low card
> penetration"* — it buys a payments integration. Framed at the root — *"in a prepaid
> transaction the customer carries all the risk, upfront, with no recourse"* — it buys
> COD, which is not a discount and cost real money in logistics. It **re-allocated who
> bears the risk rather than discounting the price of bearing it**, and it moved the
> category. That is the move available here, with information in place of logistics.

### What is evidenced, and what is not

**Measured (levels 1–3).** That the doubt exists, what it is about, and that the
surface offers no way to resolve it. Corpus n = 3,017 Myntra-only, plus the teardown.

**Not measured, and the corpus structurally cannot (levels 4–5):**

- That the doubt is *still* unresolved at revisit rather than resolved and declined.
  The corpus sees the doubt once, never twice. **Survey Q8 reads this directly** — its
  load-bearing option is *"I tried, and still couldn't find out."*
- That shoppers experience the doubt as **risk they are carrying**, not merely as
  information they lack. These are different problems with different MVPs, and only
  the ladder in probe 4 separates them.
- That the flat grid is causal rather than incidental.

**The guide already reaches level 5 and reads it one level shallow.** Its own worked
ladder ends *"sending it back is a whole thing and I'd rather not own it than deal
with that"*, which the guide calls a returns-friction root cause wearing a fit
costume. True, and that is level 4. What the sentence describes is a shopper who has
priced the cost of being wrong and concluded that not buying is rational — return
friction is only a problem because the shopper eats it. Same sentence, one level down.

**Falsification test — unchanged question, sharpened read.** The 40–45 minute
question stands as written. Tally it as before: if `mostly_waiting` wins, this
articulation is wrong, the problem is timing rather than doubt, and the direction
changes. Say so if it happens.

Then read *within* `mostly_unsure` for the level-5 signal: do they describe **not
knowing**, or **not wanting to be wrong**? Ignorance points at an information feature;
risk points at this one. If six people describe pure ignorance and never mention what
being wrong would cost them, level 5 is not supported — keep level 3, say so plainly,
and drop the risk framing rather than defending it.

## (d) Existing workarounds — the proof of level 5

Not merely "evidence the need is real". **Every workaround is a shopper spending
their own time, money or social capital to buy down risk the platform left with
them** — which is level 5 observed rather than argued. That makes this section the
evidence base for (c) rather than a supporting list, and it is why it is worth the
interview time it costs.

| Workaround | What it costs them | Which risk it buys down |
|---|---|---|
| Screenshot into WhatsApp for a friend's opinion | A favour, and the wait | Outsources the judgement — social validation |
| Hunting reviews for photos of a similar body | Time, often fruitless | Fit, using a stranger as a proxy |
| Ordering two sizes intending to return one | Money up front, a return trip | **Self-insurance** — they pay Myntra's logistics cost to remove fit risk |
| Cross-checking the brand's site, YouTube, Instagram | Time, and leaving the app | Fabric, true colour, seller trust |
| A notes app or Instagram saved folder as the real shortlist | Duplicated effort | The wishlist has already failed as a decision surface |
| Trying it in a store, then ordering online | A trip | Fit, resolved physically |

Read down the middle column: **the platform has externalised the cost of resolving
doubt onto the shopper, and they are paying it.** Ordering two sizes is the sharpest
of these — the shopper is buying insurance from Myntra and Myntra is booking it as a
return.

**Two instruments now, not one.** Earlier drafts said the interviews were the only
one; that predates survey Q8.

| | Gives | Reads |
|---|---|---|
| **Survey Q8** — *"Did you try to find that out? Tick everywhere you looked."* | A **distribution** across all respondents | Which workarounds, how common, and the share who tried and failed |
| **6 walkthroughs**, `workaround_used` / `workaround_resolved` | The **mechanism and the cost** | What it cost them, and whether it actually resolved the question |

The guide's workaround block already asks the level-5 question directly — *"what did
it cost you"* and *"did it actually resolve the question"*. A workaround that did not
work is the strongest evidence in the section: it is a shopper who paid and still
carries the risk.

`external_behaviour` reads 2.2% corpus-wide and STATUS.md already concedes that is an
artefact of scraped text — people narrate outcomes, not process. Do not quote it as a
prevalence.

Target: **6 walkthroughs, 60–100 coded items.** Fixed in advance so it cannot be bent
afterwards: **a workaround named by four of six goes on a slide; one named once is an
anecdote and stays in the appendix.**

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

1. **6 walkthrough interviews** → whether level 5 survives. Probe 4's ladder ×3
   separates *not knowing* from *not wanting to be wrong*; the falsification tally
   decides whether the whole articulation stands.
2. **Survey Q8** → the *"I tried, and still couldn't find out"* share, which is
   level 4 stated as behaviour, plus the workaround distribution for (d).
3. **Survey responses** → whether fit and trust are one population or two.
4. **Teardown screenshots** → the visual for level 3, and the evidence for the
   monetary-lever table in (c). Still uncaptured, and the only item here blocked on
   nobody but us.

**If level 5 does not survive**, keep level 3, delete the risk framing, and say
which read produced that. A dropped level is the same move as dropping theme 12 —
it is what makes the ones that survive worth believing.
