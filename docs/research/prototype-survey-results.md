# Prototype usability survey — results (v1 instrument, n = 5)

Raw data: `docs/research/raw/prototype-survey-responses-v1.csv`. Five responses,
1–2 Sep 2026, collection stopped. All five consented and all five completed every
required question.

**Counts, not percentages.** At n = 5 one respondent is 20 points. Every figure below
is written as a count for that reason, and nothing here is quoted against a target
expressed as a percentage.

**These are v1 answers.** The live form's wording had already drifted from
`create-prototype-usability-form.gs` — most notably the confidence question, which
asks whether scrolling the item's details *influenced the buying decision* rather
than how confident the respondent felt. Answers are reported under the wording
respondents actually saw. They cannot be pooled with any v2 run.

**Sample.** Ages 25–32 (3), 18–24 (1), 33–40 (1). Bangalore (4), Pune (1). A metro
convenience panel, not a representative sample of Myntra shoppers.

---

## 1. The core mechanic works

| | |
|---|---|
| Found a wishlisted item while searching | **5 of 5** — 4 easily, 1 after looking |
| Understood why it appeared | **2 of 5** clearly; **3 of 5** only "sort of"; none said no |
| Was that enough to decide | **3 of 5** could decide; **2 of 5** would still check elsewhere |

Reconnection itself is not in doubt at this sample size — everyone found their item.
**Comprehension is the weak point, and the free text says exactly why:**

> "It said 'good match' but didn't say why, or whether it'd actually fit someone my
> height."

That is the confidence layer's whole promise — every signal names its source —
failing to land for at least one respondent. It is consistent with the two scale
readings, both of which sit mid-range rather than high:

- *Did that feature influence your buying decision* — four 4s and one 3
- *This screen cleared up what I was unsure about* — three 3s and two 4s

The module is being found and used. It is not yet being **believed**.

## 2. A defect worth fixing before anyone else sees it

> "The removed item from wishlist still appeared in the search as wishlisted item."

An item removed from the wishlist still surfaces in search, still labelled as
wishlisted. That is a correctness bug in the reconnection path, not a UI preference,
and it is the kind that erodes trust in the whole module — the false-positive failure
mode the deck's own risk slide names as unrecoverable. One respondent found it in five
minutes.

A second, softer complaint about the same surface:

> "Old items saved long back was also shown. I would love to see newly added items in
> the beginning than the old ones."

Recency is not currently a ranking input. Worth noting as a finding, not a bug.

## 3. The blocker taxonomy does not match the corpus — the most interesting result

Part 2 rests on the corpus's named-doubt split: fit 46.2%, trust 9.7%. The panel was
asked the same question in closed form. What came back:

| What's holding you back | n |
|---|---|
| Still thinking about the price | 1 |
| Not sure it will fit me | 1 |
| *Other* — "too many similar options, can't tell them apart" | 1 |
| *Other* — "could get out of style if it was in wishlist for too long" | 1 |
| *Other* — "how it will pair with others" | 1 |

**Three of five named a blocker that is not in the corpus taxonomy at all** — and all
three are the same kind of thing. Not missing information: an unresolved *decision*.
Which of these is better. Is this still current. What does it go with.

This is a stronger result for the case than the corpus split was. The deck's problem
statement is that the wishlist accumulates decisions and never closes one. The corpus
could only see complaints people wrote down after delivery, so it surfaced fit and
trust. Asked at the moment of hesitation, people describe decision paralysis, staleness
and pairing — exactly what an accumulating pile of unclosed decisions produces.

The free text says the same thing independently:

> "Just which of the two I saved is actually better — right now I can't tell."
> "…if there is new collection added to the inventory which may be better looking than
> my wishlisted one."
> "I would love to see the complete the look option with my saved items as well."

## 4. The contradiction check — Q18, and it points the right way

What actually brings you back to a saved item, on your own real wishlists (tick all):

| | n |
|---|---|
| A notification or price-drop alert | **0** |
| I go looking on my own, without any reminder | 2 |
| Someone else mentions it or sends me something similar | 1 |
| I mostly don't go back to things I've saved | 3 |

**Nobody picked notifications.** Part 2 §2.4 justifies not building for revisit-intent
on the assumption that it is "already served by notifications and price-drop alerts".
Five people is not enough to overturn an assumption, but it is enough to say the
assumption found no support here, and that the self-initiated route the MVP is built
for was named twice.

The three who said they mostly don't go back are not a counter-result. They are the
population the feature exists for: the wishlist is where their decisions went to be
forgotten.

## 5. Mechanics

| | |
|---|---|
| Out-of-stock recovery clear | 2 of 5 clear, 1 confusing, 2 never hit it |
| What happened on add to bag | 4 of 5 "opened next steps or choices", 1 didn't remember |
| Comparison reordering helped | 3 of 5 helped; 2 didn't compare |
| Pairing suggestion useful | 4 of 5 "I'd actually pair it with that"; 1 saw one but found it irrelevant |
| Overall useful when shopping | two 4s, two 3s, one 5 |

**Read the add-to-bag result as descriptive only.** The v1 opening text told
respondents the app "gives you real next moves - not just a confirmation message that
disappears", which is that question's two main options in order, with the first named
as correct. It cannot be evidence that the design works.

**The pairing result contradicts a prediction made from the code.** Tracing `App.tsx`
on 2 Sep concluded that a respondent following v1's task list could not reach a pairing
suggestion by any route, and that this question would therefore be structurally void.
**All five saw one.** One of those two things is wrong: either the code trace missed a
route, or respondents reached an ordinary product page on their own, or they are
describing a different surface as pairing. One respondent's free text hints at the
third — asking for "complete the look… with my saved items as well" suggests what they
saw was not drawn from their wishlist. **Resolve this against the live app before
quoting the pairing number anywhere.**

## 6. Two feature requests worth keeping

> "Let me save my 'winner' after comparing so I don't have to redo it next time."

The comparison produces a judgement and then discards it — the same failure the
wishlist makes with the original save, one level up. This is the sharpest product
observation in the set.

> "Show me people my height who kept this size."

Fit, grounded in body shape rather than garment measurements. Squarely the thing the
prototype declares it deliberately did not build (`status: "unknown"` is permanent for
fit on this catalog). Worth citing as demand for the thing that was scoped out, not as
a gap to close before submission.

---

## What can and cannot be said from this

**Can be said.** Everyone found their wishlisted item when searching. Most understood
why it appeared, but only two of five without reservation. Three of five could reach a
decision. Nobody named notifications as what brings them back. Three of five named a
blocker outside the corpus's taxonomy, all of them decision-shaped.

**Cannot be said.** Anything as a percentage. Anything about the add-to-bag design,
which was primed. Anything about whether the feature lifts purchases — this is five
people in one session on a seeded demo, not a cohort. And nothing about the feature's
core premise, which is that saving and returning are separated by time: nobody in a
six-minute test has forgotten anything.
