# Prototype usability survey — combined results (n = 11, two rounds)

Raw data: `raw/prototype-survey-responses-v1.csv` (n = 5, 1–2 Sep 2026) and
`raw/prototype-survey-responses-v2.csv` (n = 6, 3–4 Sep 2026). All eleven consented.
Collection closed 4 Sep.

**Counts, not percentages.** At n = 11 one respondent is nine points. Every figure
below is a count for that reason.

## What pools and what does not

The v1 live form's wording had drifted from its script, so the two runs are **not**
interchangeable everywhere. The distinction matters and is applied throughout:

| Poolable | Why |
|---|---|
| Found the item while searching | Same construct, same options |
| Understood why it appeared | Same construct, same options |
| Enough to decide | Same construct (v2 adds a third, weaker option) |
| Main blocker | Same open/choice construct |
| Revisit trigger | **Verified identical option lists, identical order** |
| Pairing suggestion useful | Same construct |
| Compare/reorder helped | Same construct |

| Not poolable | Why |
|---|---|
| Confidence scale | v1 asked whether scrolling the details *influenced the buying decision*; v2 asks how sure the respondent felt. Different questions. |
| "Answered my doubt" scale | v1 "this screen cleared up what I was unsure about" vs v2 "I had a doubt, and this answered it" — close, but reported per round, not averaged. |
| Overall usefulness | v1 rates the screen *on its own*; v2 rates usefulness *when I shop*. Reported per round. |

**Sample.** Round one: Bangalore 4, Pune 1. Round two: Pune 2, Bangalore 2, Raipur 1,
unstated 1. Ages 25–32 (8), 18–24 (2), 33–40 (1). A metro convenience panel, not a
representative sample of Myntra shoppers.

---

## 1. The core mechanic is not in doubt

| | |
|---|---|
| Found a wishlisted item while searching | **11 of 11** — 10 right away, 1 after looking |
| Could say why it appeared | **6 of 11** clearly; **5 of 11** only "sort of"; none said no |
| Enough to decide without leaving | **4 of 11**; 6 would still check elsewhere; 1 would mostly look elsewhere |

Everyone found their item across both rounds. Comprehension improved between rounds
(2 of 5 → 4 of 6 clear), which is consistent with round two's form carrying the
"before you start" notes describing each feature — but the panel is far too small to
attribute the gain to that change.

**Deciding in place got worse, not better:** 3 of 5 in round one, 1 of 6 in round two.
The module is being found and used. It is not yet being **believed**.

## 2. The alert reversal — the most important finding in this run

Same question. Same four options. Same order. Opposite answers:

| | Round one (n=5) | Round two (n=6) | Combined |
|---|---|---|---|
| A notification or price-drop alert | **0** | **5** | 5 of 11 |
| I go looking on my own | 2 | 2 | 4 of 11 |
| I mostly don't go back | 3 | 1 | 4 of 11 |
| Someone else mentions it | 1 | 0 | 1 of 11 |

This is not an instrument artefact — both scripts were checked and the option text and
ordering are identical. It is a genuine split between two small panels, and it means
**the answer is unstable at this sample size.** The live A/B decides it, not the panel.

**It does not change the direction.** A price-drop alert is a promotional lever, ruled
out by the margin mandate, and reminders are already built. What shoppers are asking
for is the one thing this project may not give them — which is precisely why the
non-promotional path (re-entry through search) is the one worth serving. The earlier
deck line "none of five picked alerts" was true of round one and is now retired.

## 3. Blockers the corpus has no word for

**4 of 11** named a blocker absent from the 19,143-comment taxonomy:

- "Too many similar options, can't tell them apart" — comparison paralysis
- "Could get out of style if it was in wishlist for too long" — staleness
- "How it will pair with others" / "I don't know what it goes with" — pairing

The remaining seven: price (4), quality/genuineness (1), fit (1), nothing (1).
Price is the single most-named blocker overall, and it is the one lever ruled out.

## 4. What held up

- **9 of 11** would actually wear the pairing the module suggested.
- **All 9 who compared** said reordering by what mattered helped them decide (2 never
  compared).
- Recovery when the size or item was gone: 5 clear, 1 "sort of", 2 confusing,
  3 never hit the case.

## 5. Defects and gaps

- **The removed-item defect (round one, still open):** an item removed from the
  wishlist came back in search, still labelled saved.
- **A discovery gap (round two):** one respondent answered "I didn't see one" to the
  pairing question — the feature exists but was never found.
- One round-two respondent answered "I don't remember that list", "this didn't happen
  to me" and "I don't remember" across three questions — low attention, counted as
  given rather than dropped.

## 6. What this does and does not support

Supports: reconnection at the search moment works mechanically; comparison-reordering
helps; pairing suggestions land; the doubt taxonomy is incomplete.

Does not support: any claim that shoppers buy more. Deciding-in-place fell between
rounds, the doubt scale sits mid-range in both, and n = 11 cannot carry a conversion
claim. The eight-week live A/B is what settles it.
