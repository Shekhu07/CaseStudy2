> ## ⚠ RETIRED — 2 Sep 2026. Both sheets stay empty by decision.
>
> The six walkthroughs this sheet was built to code were cancelled on privacy
> grounds — see `interview-guide.md`. No sessions were run, so
> `coding-sheet-items.csv` and `coding-sheet-participants.csv` hold header rows and
> nothing else, permanently. That is a decision, not an outstanding task. The
> replacement instrument is `prototype-usability-survey.md`, whose closed-choice
> questions tally directly and need no coding sheet.

# Coding sheet — turning six calls into countable evidence

Two tables. **Table 1 is one row per discussed item** (target 60–100 rows across
6 participants) — it is the primary artefact and the thing almost no submission
has. **Table 2 is one row per participant**, for the things that are properties of
a person rather than of an item.

Import `coding-sheet-items.csv` and `coding-sheet-participants.csv` into Sheets.

**Fill Table 1 live during the call**, one row per item as you finish its probes.
Clean it up the same day against the recording. Coding from memory two weeks
later is how call 1 stops being comparable with call 6.

---

## Why the labels are borrowed, not invented

`stated_blocker`, `intent_type` and `segment_signal` reuse the exact enums the
Part 1 pipeline tagged 3,922 documents with (`pipeline/types.ts`), and
`theme_id` reuses the 12 taxonomy ids. That is deliberate and it buys the single
best moment available in Part 3:

> corpus says fit is 46.2% of named doubts · interviews say **N%** of coded items

That comparison only exists if the labels match. **Where they disagree, explain
the disagreement rather than averaging it** — an honest explanation of *why* AI
discovery and six real people diverge is a standout deck moment, and a
disagreement you can explain is worth more than an agreement you can't.

Add emergent codes freely as new things appear — but add them as **new values**,
never by redefining an existing one, and back-fill earlier rows when you do.
Log every addition in "Emergent codes" at the bottom of this file.

---

## Table 1 — coded items · `coding-sheet-items.csv`

| Column | What goes in it | Values |
|---|---|---|
| `participant` | | `P1`–`P6` |
| `item_no` | order discussed | 1, 2, 3… |
| `item` | short description, their words | free text |
| `category` | | topwear / bottomwear / dress / ethnic / footwear / accessory / other |
| `price_band` | | `<799` / `799–1499` / `1500–2999` / `3000+` / unknown |
| `days_since_save` | estimate is fine; note if guessed | integer, or `unknown` |
| `selected_by` | who chose to discuss it — self-selected items carry tidier stories | `participant` / `moderator` |
| `intent_type` | why it was saved | `genuine_intent` · `bookmark` · `price_watch` · `unclear` |
| `still_wants_0_10` | probe 3 | 0–10 |
| `stated_blocker` | the **surface** answer, before laddering | `fit_and_size` · `fabric_and_quality` · `true_colour_and_appearance` · `real_body_photos` · `price_trajectory` · `occasion_appropriateness` · `social_validation` · `return_and_exchange_certainty` · `seller_or_brand_trust` · `styling_and_pairing` · `delivery_timing` · `none` |
| `laddered_root_cause` | **after "and what's behind that?" ×3** — free text, then a second pass to assign a code once patterns appear | free text → code |
| `ladder_depth` | how many levels you actually got | 0–3 |
| `theme_id` | maps the item onto the Part 1 taxonomy, for triangulation | `size-fit-info-unreliable` · `misleading-visual-media` · `quality-authenticity-doubts` · `return-exchange-policy-friction` · `prepurchase-support-gaps` · `stock-availability-uncertainty` · `price-volatile-hidden-fees` · `delivery-timeline-uncertainty` · `wishlist-ui-navigation-friction` · `missing-product-specs` · `absent-social-proof` · `passive-wishlist-no-reengagement` · `none` |
| `workaround_used` | what they actually did about it | `searched_web` · `watched_video_review` · `asked_friends_or_family` · `checked_other_app` · `visited_offline_store` · `checked_brand_site` · `screenshot_to_chat` · `ordered_two_sizes` · `saved_elsewhere` · `none` |
| `workaround_resolved` | did it actually answer the question | `yes` / `partly` / `no` / `n/a` |
| `compared_against` | probe 7 — what this item is being weighed against, their words. Prefix `x:` if the rival is on **another app** | free text, `x:` prefix |
| `comparison_method` | probe 7 — how they'd actually pick. **Observed where possible**, not asked | `open_both_tabs` · `from_memory` · `screenshot_compare` · `asked_someone` · `opened_other_app` · `no_method_freezes` · `n/a` |
| `what_would_unblock` | probe 5, verbatim — **the highest-value column in the sheet** | free text |
| `decide_now` | forced 60-second call | `buy` / `delete` / `still_stuck` |
| `evidence_quote` | verbatim, their words, not your paraphrase | free text |
| `coder_confidence` | flag rows you were unsure about so they can be re-read | `high` / `med` / `low` |

**`compared_against` and `comparison_method` close a hole that predates them.**
Probe 7 has always asked "is there another item you're weighing this against?" and
the answer had no column to go in — asked, then discarded. The brief requires *how
users compare multiple shortlisted products*, and no other instrument reaches it:
`information_needs` has no comparison facet, and survey Q11 measures only how a
comparison **ends** (pick quickly / dither and buy / dither and buy none), never
how it is conducted. `no_method_freezes` is the value to watch — a comparison with
no method is choice overload observed rather than inferred.

`screenshot_to_chat`, `ordered_two_sizes` and `saved_elsewhere` extend the
pipeline's `EXTERNAL_BEHAVIOURS` enum. They are the three workarounds the
playbook predicts and scraped text structurally cannot see, so they are named up
front rather than left to emerge.

**`stated_blocker` and `laddered_root_cause` are separate columns on purpose.**
Collapsing them is the mistake the whole method exists to prevent — "I wasn't sure
about the size" three levels down often turns out to be return friction, and Part
4 (c) needs the bottom of the ladder, not the top. Counting the *gap* between the
two columns is itself a finding.

## Table 2 — participants · `coding-sheet-participants.csv`

| Column | What goes in it |
|---|---|
| `participant` | `P1`–`P6` |
| `age_band`, `city_tier` | from the survey; `tier_1` / `tier_2` / `tier_3` |
| `wishlist_size` | actual count observed on screen — not their estimate |
| `oldest_item_age` | roughly, from the scroll |
| `opens_last_30d` | self-reported |
| `bought_from_it_30d` | `yes` / `no` |
| `revisit_trigger` | `price_drop_alert` · `other_notification` · `deliberate_visit` · `browsing_landed_there` · `doesnt_remember` — from probe 6. This is the only evidence in the project for Part 2 §2.4's claim that term B is already served |
| `revisit_trigger_converted` | `yes` / `no` — did that return end in a purchase? "Came back on a price alert and still didn't buy" is the sentence §2.4 needs |
| `affordances_used` | Observed, not asked. Any of `category_chips` · `price_drop_badge` · `promo_banner` · `share` · `move_to_bag` · `photo_zoom` — semicolon-separated. `photo_zoom` is a fit-inspection tell, log it even though it is not a feature |
| `affordances_never_used` | From probe 7, their own words. Blank if they named none |
| `other_apps` | shopping apps they name unprompted, semicolon-separated. Blank if none | 
| `parallel_wishlist` | is anything saved in the app they use most? `yes_active` (added to recently) / `yes_stale` / `no` / `no_other_app` |
| `parallel_wishlist_size` | count observed on screen, not their estimate. `unknown` if they would not open it |
| `buys_saved_from` | given the same item saved in both — `myntra` / `other` / `depends`, plus which app and the verbatim reason |
| `myntra_chosen_because` | free text first, coded on a second pass once patterns appear — same treatment as `laddered_root_cause`. **Do not pre-invent the enum**; six people will not populate a list written before the first call |
| `segment_signal` | `fit_uncertainty_prone` · `new_or_low_trust_user` · `price_sensitive` · `occasion_buyer` · `brand_loyal` · `bulk_orderer_returner` · `premium_buyer` — **allow more than one.** Part 4 (a) flags that the corpus tagger assigned at most one per document, which is why we cannot claim the segments are distinct populations. Six people who can carry two labels is how that question gets answered |
| `first_reaction_quote` | verbatim, from the unprompted scroll |
| `falsification_answer` | **`mostly_unsure` / `mostly_waiting` / `mixed`** — plus the verbatim |
| `items_coded` | rows contributed to Table 1 |
| `recording` | link or file, so a quote can be checked |

---

**The five other-app columns answer an evaluator pointer** — *competitor analysis,
from the wishlist point of view* — that no other instrument in the project can
reach. The corpus holds 344 documents mentioning Myntra alongside a competitor and
90 with an explicit preference, but only **10 that also mention a wishlist**, of
which two or three are usable. `docs/teardown/` covers the *product* half, three
wishlist surfaces side by side. These columns are the *user* half.

**Read `buys_saved_from` against the teardown, not on its own.** The teardown's
finding is that all three apps treat the wishlist as a discount-delivery channel.
If participants say they buy the saved item wherever it is cheapest, that is the
teardown's claim confirmed from the demand side — and it strengthens the
no-monetary-incentives framing rather than undermining it.

## The three counts this has to produce

1. **Blocker frequency across all coded items** → the Part 3 frequency table, and the direct comparison against the corpus's 46.2% fit share.
2. **Workarounds by participant count, not item count.** The rule is fixed in advance so it can't be bent after the fact: **named by 4 of 6 → it goes on a slide. Named once → it is an anecdote and it stays in the appendix.**
3. **`falsification_answer` tallied across all six.** If `mostly_waiting` wins, Part 4 (c) is wrong and the direction changes. Write that number down before you decide what it means.

**Not a fourth count.** `comparison_method` and the other-app columns are reported
as *"4 of 6 kept a parallel list in another app"* — participant counts, never
shares. n=6 answers **how**, not **how many**; the evaluator asked how.

Also worth pulling: the `still_wants_0_10` distribution (high wanting + high
stuck is the exact population the MVP is for), and 3–4 verbatim quotes. Quotes
carry a deck.

## Limits to state once, then move on

n = 6, self-selected from Reddit, self-reported recall on `days_since_save`. These
are **directional counts, not population estimates**, and they are quoted as
"14 of 62 coded items", never as a percentage carrying a decimal place. State it
once on the method slide and then commit — hedging in every caption is what cost
CS1 on Clarity.

## Emergent codes

Log anything added mid-study here, with the call it first appeared in and which
earlier rows were back-filled.

| Code | Column | First seen | Back-filled? |
|---|---|---|---|
| | | | |
