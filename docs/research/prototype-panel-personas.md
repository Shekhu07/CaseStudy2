# Three panel personas for the prototype usability survey

Not discovery personas — `persona.md` already has those, and this file
doesn't re-argue them. These are **panel-respondent archetypes**: written so
that, reading back the 300–500 responses to `create-prototype-usability-form.gs`,
a cluster of answers can be recognised as "this is what an Aditi-shaped
respondent's session looks like" and matched to the metric it's supposed to
move.

**There is no recruitment screen for these three.** Unlike `wishlist-survey.md`
(Q2/Q5/Q7 select for Aditi before the form even opens), the prototype survey
runs every respondent through the same fixed demo catalog with no branching
— that's a deliberate design choice, documented in
`prototype-usability-survey.md`. So these personas aren't who gets recruited;
they're who gets **identified after the fact**, mainly through Q10's
closed-choice doubt taxonomy and Q6/Q14's comparison-behaviour questions. A
panel with a healthy mix of all three answering patterns is what makes the
metric table interpretable instead of a single flat average.

---

## 1. Aditi-shaped — the fit-uncertain searcher

*Same segment as `persona.md`'s Aditi: 24.5% of the corpus, fit as the
unresolved need in 84.5% of it.*

**Her 5 minutes on the prototype.** She searches `kurta` — one of the four
suggested terms — and the demo surfaces a saved item. She opens it, reads the
confidence panel, and specifically checks whether it says anything about fit
on her body, not just the size chart. If a size is unavailable in her seeded
demo item, she checks whether "see available sizes" reads as a real next
step or a dead end.

**The answers she produces:**

| Q | Her likely answer | What it moves |
|---|---|---|
| Q3 | "Yes, clearly" or "Sort of" — depends on whether the fit signal is legible, not just present | Comprehension rate (target ≥80%) |
| Q5 / Q7 | Mid-to-high if the screen names a fit-specific signal; low if it's generic | Confidence, doubt-resolution means |
| Q9 | Free text naming *exactly* what Aditi's real-corpus verbatims name — "someone my height," "how it fits people who ordered my usual size" | Gap diagnosis — a UI miss vs. a genuine gap |
| Q10 | "Not sure it will fit me" | The corpus-taxonomy contradiction check — fit should dominate this pick if the segment is real |
| Q11 | Tests the sold-out-size recovery path directly | Recovery clarity rate |

**Why she matters to this panel specifically:** she's the respondent whose
Q10 pick should land on "fit" close to the corpus's 46.2% named-doubt share.
If it doesn't — if fit-shaped respondents disproportionately pick something
else — that's a real finding for Part 7, not noise.

---

## 2. Rohan-shaped — the low-trust first-timer

*Same segment as `persona.md`'s Rohan: 20.9%–24.0% depending on cut, 55.7%
blocked on seller/brand trust.*

**His 5 minutes on the prototype.** He searches `handbag` and finds a saved
item from a brand he doesn't recognise. He reads the confidence panel
specifically hunting for anything that resembles authenticity or seller
reputation — and because he's the segment "What this prototype offers" is
now shown to before he starts, he's also the respondent most likely to
notice if the "why it's a good match" promise on page 1 doesn't cash out on
the actual screen.

**The answers he produces:**

| Q | His likely answer | What it moves |
|---|---|---|
| Q7 | Low, unless the screen says something about the seller/brand specifically — a fit-only signal doesn't touch his doubt at all | Doubt-resolution mean — his low score, averaged in, is the signal that the module is fit-only and trust-blind |
| Q8 | "Less than I expected" if page 1's promise ("shows why it's a good match... not just a plain product card") doesn't include anything trust-shaped | Tests whether the reveal over-promised |
| Q9 | Names something close to his real-corpus complaints — "reviews contradict each other," "half look fake" | Same UI-miss-vs-genuine-gap test as Aditi, different axis |
| Q10 | "Not sure it's good quality or genuine" | Contradiction check — his share here should track the corpus's 9.7% trust figure, not fit's |
| Q12 | Notices whether the tap-to-buy decision point offers anything reassuring, or just next steps | Decision-point mechanic, trust-flavoured read |

**Why he matters to this panel specifically:** he's the person whose answers
tell you whether the module is a *fit* tool that happens to also carry a
trust label, or actually resolves trust. Given Part 4(a)'s still-unresolved
question of whether fit and trust are one population or two — and the
wishlist survey's own finding that only 1/14 respondents showed both doubts
— a Rohan-shaped respondent scoring low on Q7 while an Aditi-shaped one
scores high is direct evidence they're separate populations, at panel scale.

---

## 3. The comparer who buys none — new, not in `persona.md`

Grounded in `wishlist-survey-results.md`'s own measured finding, not
illustrative: of 14 item-level respondents to the real-wishlist survey,
**"buy none of them" (14%) + "look for more options" (21%) = 36%** showed a
comparison-shaped failure — the one behaviour none of the corpus's named
personas were built to test, because Aditi and Rohan are both single-item
stories.

**Her 5 minutes on the prototype.** She searches `shirt`, finds two or three
saved items she considers close alternatives, and deliberately uses the
compare screen rather than deciding on the first one she opened. She's not
blocked by fit or trust doubt specifically — her blocker is that she has
too many acceptable options and no way to tell them apart that she trusts.

**The answers she produces:**

| Q | Her likely answer | What it moves |
|---|---|---|
| Q2 | "Yes, but I had to look for it" — she's actively cross-referencing, not just glancing | Reconnection success rate |
| Q6 | "Helped, but I'd still check somewhere else" — a partial L2-style failure even if Q5 scored fine | The sharpest question in the set for exactly her behaviour |
| Q10 | "Nothing — I've already decided" or Other: "too many similar options" | The one respondent type whose answer here doesn't fit the corpus's named-doubt taxonomy at all — worth a manual read, not just a tally |
| Q14 | "Yes, it helped me decide" vs. "No, it just moved things around" — the Compare screen's whole thesis lives or dies on her answer specifically | Compare-screen usefulness |
| Q15 | Tests whether a pairing suggestion resolves the *comparison* rather than just adding a fourth option to compare | Pairing usefulness, read against her indecision rather than in isolation |
| Q16 | Low if she still couldn't pick; high if sorting-by-priority genuinely closed the loop | Overall standalone usefulness — the CS1 test |

**Why she matters to this panel specifically:** without a respondent who
behaves like her, Q14 and Q15 get answered by people who never actually
needed to compare, and the numbers read falsely clean. She's the stress test
for the one screen (Compare, sorted-by-priority) that the other two personas
never touch by design — Aditi and Rohan both resolve or fail to resolve a
*single* item's doubt, never a choice between several acceptable ones.

---

## Reading the panel, not just the average

A response can't be labelled with one of these three from a single
question — it's the *pattern* across Q10 (which doubt), Q6/Q14 (comparison
behaviour), and Q7/Q8 (doubt-resolution and reveal-match) that identifies
which persona a real respondent's session looks like. Practically:

- **Segment by Q10** first — it's the closest thing to a screen this survey
  has, even though it isn't one. Fit-picks, trust-picks, and "already
  decided"/Other-picks split the panel into something close to these three
  groups after the fact.
- **Report Q7 and Q16 means split by that Q10 segment**, not pooled. A
  pooled mean that looks acceptable can hide a module that works for Aditi
  and fails Rohan entirely — which is a real Part 7 finding, not something
  to average away.
- **Priya and Meera (persona.md's out-of-scope and anti-persona) are
  deliberately absent from this list.** Neither has a doubt this module can
  resolve — Priya's is price, Meera has none — so their presence in the
  panel dilutes every mean here toward the middle rather than testing
  anything. If Q10's "Other" fills with price-shaped answers, that's Priya
  showing up in the panel uninvited, the same contamination risk
  `persona.md` already flags for the wishlist survey.
