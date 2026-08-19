# Wishlist survey — build spec for Google Forms

Copy each question below into <https://forms.google.com>. Question type is given
in brackets. **Bold** = required.

## Why this form exists

It is not a smaller version of the interview. It measures the four things the
3,922-document corpus **structurally cannot** (see STATUS.md, "Why almost nothing
in here mentions the wishlist"), and it recruits for the walkthroughs.

| Gap in Part 1 | Closed by |
|---|---|
| Intent split — comparison sets and occasion saves sit inside `genuine_intent` | Q9, Q10, Q11 |
| "% who revisit the wishlist within 30 days" — the unmeasurable term in the Part 2 tree | Q5 |
| The metric itself — wishlist→purchase in 30 days | Q6 |
| `external_behaviour` reads 2.2%, almost certainly an artefact of scraped text | Q15 |

Q12 deliberately reuses the Part 1 blocker taxonomy in plain language, so the
frequency table it produces can be laid directly against the theme shares. Where
the two methods **disagree** is a stronger deck moment than where they agree.

## Settings

- Collect email: **off**. Ask for it only at Q20, only from interview opt-ins.
- Progress bar: on. Shuffle: off.
- One response per person: off (needs sign-in, suppresses completion).
- Target length **5–6 minutes**. Every question below earns its place; do not add.

---

## Intro text

> **What's sitting in your wishlist?**
>
> I'm a product management fellow researching why clothes people genuinely want
> end up sitting in a wishlist unbought. Takes about 5 minutes.
>
> There are no right answers, and I'm not selling anything. Responses are
> anonymous, used only for a student case study, and reported as aggregate
> numbers — no names, no individual responses shared.
>
> **You'll need your phone.** A few questions ask you to open your wishlist and
> look at it, because nobody remembers this stuff accurately from memory.

**Q1. Do you shop for clothes on any of these? [Checkboxes, required]**
Myntra · AJIO · Nykaa Fashion · Amazon/Flipkart Fashion · None of these
→ *Branch: "None of these" → submit and thank. Everyone else continues.*

**Q2. I'm happy for my anonymous answers to be used in a student case study. [Checkbox, required]**
Yes

---

## Section 2 — Your wishlist, right now

> Please actually open your Myntra wishlist before answering this section.

**Q3. How many items are in it right now? [Multiple choice, required]**
0 · 1–5 · 6–15 · 16–30 · 31–50 · More than 50 · I don't have a wishlist
→ *Branch: 0 or no wishlist → jump to Section 5.*

**Q4. Roughly how long has the oldest item been sitting there? [Multiple choice, required]**
Less than a week · 1–4 weeks · 1–3 months · 3–6 months · More than 6 months · No idea

**Q5. In the last 30 days, how many times did you open your wishlist? [Multiple choice, required]**
Not once · Once · 2–3 times · 4–10 times · More than 10 times

**Q6. In the last 30 days, did you buy anything *from* your wishlist? [Multiple choice, required]**
Yes, one item · Yes, more than one · No · I don't remember

**Q7. In the last 30 days, did you remove anything without buying it? [Multiple choice, required]**
Yes · No · I don't remember

---

## Section 3 — One specific item

> Now look at the item you saved **most recently** and haven't bought. Answer the
> rest about that one item.

**Q8. What is it? [Short answer, required]**
*Helper: just the category — "black kurta", "running shoes".*

**Q9. When you saved it, which of these was closest to what was going through your head? [Multiple choice, required]**
- I wanted it, but wasn't sure about something (size, fabric, whether it'd suit me)
- I was saving it for a specific occasion coming up
- I was collecting a few similar options to choose between later
- I was waiting for the price to drop, or for a sale
- I just liked it — I wasn't really planning to buy it
- I was worried it would go out of stock
- I wanted to show someone before deciding
- I honestly don't remember

**Q10. Is there a specific occasion or date you'd wear it for? [Multiple choice, required]**
Yes · No · Not sure
→ *Follow-up, short answer, optional: "What, and roughly when?"*

**Q11. Do you have other similar items saved that you'd pick between? [Multiple choice, required]**
Yes, 2–3 similar ones · Yes, 4 or more · No, it's the only one of its kind

**Q12. What's the single biggest thing stopping you from buying it? [Multiple choice, required]**
- I'm not sure it'll fit / which size to order
- I'm not sure about the fabric or quality
- I'm not sure it'll look like the photos
- I'm not sure it'll suit me or my body type
- I don't trust the seller or the brand
- Returning it would be a hassle if it's wrong
- It costs more than I want to spend right now
- I'm waiting for a sale
- I already own something similar
- I can't decide between this and something else
- I don't need it yet
- I'd forgotten about it until now
- Other *(short answer)*

**Q13. How sure are you that you still want it? [Linear scale 0–10, required]**
*0 = not at all, 10 = certain*

**Q14. What's the one thing you'd need to know to decide today — buy it or delete it? [Paragraph, required]**
*Helper: whatever would actually settle it for you.*

---

## Section 4 — What you do when you're unsure

**Q15. In the last 3 months, which have you actually done for an item you were unsure about? [Checkboxes, required]**
- Screenshotted it and sent it to someone
- Searched YouTube or Google for reviews of it
- Checked the price on another app
- Went to a shop to see or try something similar
- Ordered two sizes meaning to return one
- Asked in a comment section or group chat
- Looked for photos from real buyers rather than the model shots
- None of these

**Q16. Think of the last time you were unsure about something and bought it anyway. What tipped it? [Paragraph, optional]**

---

## Section 5 — About you

**Q17. Age [Multiple choice, required]** — Under 18 · 18–24 · 25–32 · 33–40 · Over 40
**Q18. Which city do you shop from? [Short answer, required]**
**Q19. How often do you buy clothes online? [Multiple choice, required]**
Weekly · A few times a month · About once a month · Every few months · Rarely

---

## Section 6 — Interview

> **One more thing.** I'm running a few 30-minute video calls where people walk me
> through their wishlist item by item. It's genuinely useful and pretty fun. No
> payment, no sales pitch — I'll share what I find if you're curious.

**Q20. Happy to be contacted for that? [Multiple choice, required]**
Yes · No
→ *If yes: short answer for email or WhatsApp number, plus "roughly when suits you".*

---

## When responses land

Compute these four, in this order:

1. **Q9 distribution** — the intent split Part 1 could not produce. Report
   "deferred decision" and "comparison set" separately; both currently hide inside
   `genuine_intent` 72.2%. If "I don't remember" scores high, that *is* the finding:
   the wishlist keeps no record of why anything is in it.
2. **Q5 → Q6** — the two middle terms of the Part 2 tree, measured rather than
   assumed. Revisit rate × purchase rate.
3. **Q12 against the Part 1 theme shares.** Same taxonomy, two methods. Explain any
   disagreement rather than smoothing it — e.g. if price ranks higher here than in
   scraped text, or fit lower.
4. **Q11 and Q10** — how much of the wishlist is an unclosed comparison set, and
   how much is occasion-parked. Neither is in the corpus at all.

Read Q14 verbatim before coding anything. It is the sharpest test of the MVP:
**if a user's answer is something our output would not tell them, we are building
a message, not a mechanism.**

## Limits — state once in the deck, then move on

Convenience sample, self-reported, small n, recruited through my own network and
Reddit. It is directional evidence and a recruiting instrument, not a
representative survey, and Q6 in particular is self-reported behaviour rather than
observed conversion. Say that plainly and stop hedging after.

## Do not add

- **Any "would you use this feature?" question.** People lie about the future.
  Every question above asks about the past or the present. Concepts get tested in
  the interview, against a stimulus, where you can watch the face.
- Anything proposing a discount, coupon or price alert — the brief bans monetary
  incentives, and asking about them invites the answer you can't act on.
