# Wishlist survey — results

Raw data: `docs/research/raw/wishlist-survey-responses-final.csv` (13 rows, the
form as documented in `wishlist-survey.md`) and
`wishlist-survey-responses-predraft.csv` (3 rows, an earlier draft — see
caveat below). Analysis below treats them as one 16-row set unless noted.

## The version caveat, stated once

The 3-row file answers **"How often do you shop"** and still carries a
consent/contact-email pair from before that was cut (see `wishlist-survey.md`,
"There is no interview opt-in"). The 13-row file answers **"How often do you
buy"** and has neither field. The wording difference only affects Q2; every
other question (Q3–Q12) uses identical option text in both files, so all
rows are pooled everywhere except the Q2 table below, which is annotated.
None of the 3 pre-draft respondents supplied contact info that was used —
the six interview participants were recruited from the researcher's network,
per STATUS.md, not through this form.

## Sample

| | n |
|---|---|
| Total responses | 16 |
| Screened out ("Never — I don't shop on Myntra") | 1 |
| Valid shoppers | 15 |
| — of whom, empty wishlist ("I don't have a wishlist") | 1 |
| **Item-level responses (Q6–Q12 answered)** | **14** |

All percentages below are of **n = 14** unless stated otherwise. This is a
convenience sample, not the 3,922-document corpus — one hard limitation,
stated once: at n=14 a single respondent moves any share by ~7 points, so
treat these as directional confirmations of corpus-scale findings, not
independent proof at the same precision.

## Q2 — shopping frequency (n = 15 valid shoppers, both wordings pooled)

| Answer | n | % |
|---|---|---|
| A few times a year | 9 | 60% |
| Every month or two | 4 | 27% |
| A few times a month | 2 | 13% |

Nobody in the valid sample shops weekly or more. Skews toward infrequent
shoppers — the segment `AGENTS.md` already names (`fit_uncertainty_prone`,
`new_or_low_trust_user`) as the corpus's dominant, and the one the interview
guide targets.

## Q4 — bought anything from the wishlist in the last 30 days? (n = 14)

| Answer | n | % |
|---|---|---|
| No | 11 | 79% |
| Yes, more than one | 2 | 14% |
| I don't remember | 1 | 7% |

**14% is a measured 30-day wishlist→purchase baseline.** Feeds Part 2's
north-star term directly — previously this number existed nowhere in the
project (STATUS.md: the corpus "structurally cannot" measure it).

## Q7 — single biggest blocker on the one item they had in mind (n = 14)

| Answer | n | % |
|---|---|---|
| I'm waiting for a sale | 5 | 36% |
| Costs more than I want to spend right now | 2 | 14% |
| Not sure it'll fit / which size to order | 1 | 7% |
| I don't trust the seller or brand | 1 | 7% |
| I'd forgotten about it until now | 1 | 7% |
| Can't decide between this and something else | 1 | 7% |
| Not sure about the fabric or quality | 1 | 7% |
| Not sure it'll suit me or my body type | 1 | 7% |
| Returning it would be a hassle if it's wrong | 1 | 7% |

Price/sale-related answers dominate the **single named blocker**: 7/14
(50%). Fit + trust + fabric combined on this single-select question: 4/14
(29%). This is the one place this survey does **not** confirm a fit-first
headline at face value — see Q12 below for why that's not the full picture.

## Q8 — did they try to resolve the doubt, and where? (n = 14)

| Answer | n | % |
|---|---|---|
| I tried, and still couldn't find out | 3 | 21% |
| I didn't try | 3 | 21% |
| Tried specific channels (size chart / reviews / ratings-fit / YouTube-IG / order-two-sizes / brand site), doubt not stated as unresolved | 8 | 57% |

**21% ("tried, and still couldn't find out") is the measured doubt-unresolved
rate** — the number Part 4(c) needed and previously only asserted from the
corpus's structural blind spot ("sees the doubt once, never twice").

## Q11 — what happens with close alternatives? (n = 14)

| Answer | n | % |
|---|---|---|
| I pick one fairly quickly | 4 | 29% |
| I go looking for more options instead of choosing | 3 | 21% |
| I go back and forth for a while, then buy one | 3 | 21% |
| I go back and forth and end up buying none of them | 2 | 14% |
| This doesn't really happen to me | 2 | 14% |

"Buy none of them" + "look for more options" = 5/14 (36%) show the
comparison-shaped failure mode. "Buy none of them" alone (14%) is the direct
number for choice-paralysis-as-lost-sale.

## Q12 — which doubts are true of *at least one item* in the whole wishlist? (n = 14, multi-select)

| Doubt | n | % |
|---|---|---|
| Not sure about the fabric or quality | 8 | 57% |
| Waiting for the price to drop | 6 | 43% |
| Don't fully trust the seller or brand | 5 | 36% |
| Not sure it'll look like the photos | 5 | 36% |
| Not sure it'll suit me or my body type | 4 | 29% |
| Not sure it'll fit me | 3 | 21% |
| Saving it for an occasion | 3 | 21% |

Read alongside Q7: the single-select forces one answer per respondent and
price wins by salience/recency, but the multi-select shows **fit-adjacent
doubts (fabric, photos, suit-body, fit) touch 8/14 (57%) of respondents' lists
in some form** — wider than Q7 alone suggests, consistent with the corpus's
fit-as-defensible-headline finding once you look past the single forced
choice.

### Fit × trust overlap (Part 4(a)'s open question)

Part 4(a) asks whether `fit_uncertainty_prone` and low-trust are one
population mislabelled, or two. Tagging "fit me" / "suit me" as fit and
"don't fully trust the seller or brand" as trust, on this sample:

| | n |
|---|---|
| Both fit and trust doubts present | 1 |
| Fit only | 4 |
| Trust only | 4 |
| Neither | 5 |

Only 1/14 shows both. At this n that's not strong evidence either way, but it
**does not support "one population, mislabelled"** — the overlap is smaller
than that hypothesis would predict, not larger.

## Verbatims — Q9, "what would you need to know to decide today?"

Grouped by the blocker each respondent named in Q7:

- **Fit/suit:** *"Whether the shoulders will be too wide on me. The photos
  tell me nothing. If someone my height had posted a picture, or if it just
  told me how it fitted people who ordered my usual size."*
- **Trust:** *"Whether this brand is actually any good or it's just a random
  seller. The reviews contradict each other and half look fake. If I knew
  someone real had bought it and it wasn't rubbish, I'd order."*
- **Price ×4:** *"Tell me when it drops and I'll buy it."* / *"Price"* /
  *"When is the sale"* / *"if i get a notification of price drop"*
- **Fit (suit-body):** *"How it would look on me."*
- **Fabric/quality:** *"The quality of the product from the real customers."*

The fit/trust verbatims are the two most specific asks in the set — both
describe a **missing comparison point** (someone my size/height, a real
buyer), not missing information in the abstract. The price verbatims ask for
a **notification**, which AGENTS.md rule 1's ban and rule 5's "we built a
message" trap both already rule out as the MVP.

## What this changes

| Finding | Resolves |
|---|---|
| 14% 30-day wishlist→purchase baseline (Q4) | Part 2 north-star term had no measured baseline; now it does |
| 21% "tried, still couldn't find out" (Q8) | Part 4(c)'s doubt-unresolved claim was asserted from a corpus blind spot; now measured directly |
| Fit×trust overlap is 1/14, not the majority (Q12) | Part 4(a)'s "one population, mislabelled" hypothesis is not supported by this sample — treat fit and trust as two doubts |
| 36% show comparison-shaped failure (Q11) | Gives Part 6 a leading-indicator candidate: "resolved a comparison without abandoning the category" |
| Price/sale is the dominant *named* blocker (Q7), but fit-adjacent doubts touch 57% of lists (Q12) | Confirms fit is real but a single-select survey question undercounts it relative to the corpus's own theme share — worth a footnote if Part 2/4 cite Q7 alone |
