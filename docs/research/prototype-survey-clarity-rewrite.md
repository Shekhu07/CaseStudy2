# Prototype usability survey — clarity rewrite (v2 instrument)

Drafted 2 Sep 2026 against the live form "Five minutes on the prototype"
(5 responses at time of writing). **Not applied.** See "When to use this" at the end.

## The one problem that runs through the whole form

The form speaks as though the respondent saved the items themselves — "something
you'd saved earlier", "your saved size". They didn't. They are using a seeded
30-item demo wishlist that was already there when they arrived. Every respondent
has to silently translate "you saved" into "the demo had", and some will answer the
question they think you meant rather than the one you asked.

Fixing this one framing accounts for about half the rewrites below.

---

## Page 2 — Finding what you'd saved

**Q2 — task success**

- Now: *"Did you find something you'd saved earlier while searching?"*
- Rewrite: **"When you searched, did the app show you an item that was already in the
  demo wishlist?"**
- Options: "Yes — I spotted it straight away" / "Yes — but I had to look for it" /
  "No — I didn't notice anything from the wishlist" / "No — nothing in the wishlist
  matched what I searched for"
- Why: removes the false premise that they saved anything. The option wording also
  separates *didn't notice* from *nothing matched*, which are different failures —
  one is a UI problem, the other is a catalog problem.

**Q3 — comprehension**

- Now: *"Did you understand why it appeared?"*
- Rewrite: **"The app grouped those wishlist items together and labelled them. Was it
  clear to you why those particular items were shown?"**
- Options: "Yes — clear" / "Partly" / "No — I couldn't tell why those items"
- Why: "it" has no antecedent a respondent can resolve. They may read it as the app,
  the group, or one product tile — three different questions.

**Q4 — what was confusing**

- Now: *"What, if anything, was confusing about it?"*
- Rewrite: **"If anything about that group of wishlist items was unclear or
  unexpected, what was it?"** (help text: "Only if something was off. One line is
  plenty.")
- Why: same dangling "it"; the help text currently says to skip only if you answered
  "Yes, clearly", which reads as an instruction to justify a non-perfect answer.

---

## Page 3 — Deciding on that item

**Add a routing option to this whole page.** Every question here assumes the
respondent opened an item. Q2 lets them say they never found one, and there is no
branching. Each question below needs an explicit **"I didn't open an item"** choice,
and the two scale questions need to become optional. This is the single most
important change on the form — see `prototype-usability-survey.md`, "Before you tally
anything", rule 1.

**Q5 — confidence**

- Now: *"How confident did that screen make you feel about buying it or not?"*
- Rewrite: **"After looking at that item's details, how sure did you feel about
  whether to buy it?"** (1 = not sure at all, 5 = completely sure)
- Why: "or not" makes it read as two questions. "That screen" is unanchored. The
  rewrite also makes clear that deciding *not* to buy counts as being sure — which is
  the point of the metric.

**Q6 — sufficiency**

- Now: *"Was that enough to decide, or would you still check elsewhere?"*
- Rewrite: **"Could you have made your decision from what this app showed you, or
  would you have gone looking somewhere else first?"**
- Options: "I could have decided right there" / "It helped, but I'd still check
  elsewhere" / "I'd mostly have to look elsewhere"
- Why: "that" is unanchored, and "not really useful" (the current third option) is
  about the app's quality rather than about where they'd go next, so it doesn't
  belong on the same scale as the other two.

**Q7 — doubt resolution**

- Now: *"This screen cleared up what I was unsure about."*
- Rewrite: **"I came in unsure about something, and this screen answered it."**
  (1 = strongly disagree, 5 = strongly agree) — plus a separate option: **"I wasn't
  unsure about anything to begin with."**
- Why: as written, someone with no doubt has no honest answer and will pick the middle
  of the scale, which then reads as lukewarm agreement rather than "not applicable".
  That silently drags the mean toward 3.

**Q8 — versus the description**

- Now: *"Compared to what page 1 described, was this screen..."*
- Rewrite: **"At the start, we listed what this prototype is supposed to do. Compared
  with that list, what you actually saw was:"**
- Options: "About what was described" / "Better than described" / "Less than
  described" / "I don't really remember that list"
- Why: **"page 1" is the biggest comprehension failure on the form.** Respondents do
  not number the pages; on a phone the list scrolled past several minutes earlier. The
  sentence also trails off mid-clause. Naming what the list *was* is the fix.

**Q9 — remaining gap**

- Now: *"What would you still need to know before you'd buy it or delete it?"* — and
  it is **required**
- Rewrite: **"What would you still want to know before you'd either buy this item or
  remove it from the wishlist?"** — and make it **optional**, with help text: "If the
  screen told you everything you needed, leave this blank."
- Why: "delete it" is developer language for what a shopper calls removing something.
  More importantly, a required free-text field nine questions in is the classic
  abandonment point, and it forces people with nothing to say to type "na" — which
  lands in the exact field you most want clean.

**Q10 — the blocker**

- Now: *"What's the main thing still holding you back on this item?"*
- Rewrite: **"Thinking about that item — what's the main reason you wouldn't buy it
  right now?"**
- Options unchanged except: "Nothing — I'd be comfortable buying it" (replacing
  "Nothing - I've already decided", which is ambiguous between *decided to buy* and
  *decided not to*).
- Why: the current phrasing presupposes something is holding them back. The option fix
  matters more than the stem — as written, "I've already decided" is uncountable
  because it points both ways.

---

## Page 4 — If something wasn't available

**Q11 — recovery**

- Now: *"If your size or item wasn't available, was it clear what to do next?"*
- Rewrite: **"If a size or an item turned out to be unavailable, did the app make it
  clear what you could do instead?"**
- Why: minor. Drops "your", which again implies ownership, and "what to do next"
  becomes "what you could do instead", which is what recovery actually means.

**Q12 — the add moment**

- Now: *"What happened when you tapped to buy or save it?"*
- Rewrite: **"When you tapped to add the item to your bag, what did the app do?"**
- Options: "Gave me some choices about what to do next" / "Showed a short confirmation
  and nothing more" / "I don't remember" / "I didn't try to add anything"
- Why: "buy or save" is two actions, and "save" is impossible — the item is already in
  the wishlist. The fourth option is new and necessary: at present someone who never
  tapped has to guess.
- **Note the deeper problem this does not fix:** the opening feature list already tells
  respondents the app "gives you real next moves — not just a confirmation message that
  disappears", which is both of this question's main options in order. No rewording
  recovers that. Either cut that bullet from the opening list, or keep treating Q12 as
  descriptive only.

**Q13 — which action first**

- Now: *"'Buy from Wishlist' or 'Compare options' - which did you notice or tap first,
  and why?"*
- Rewrite: split into two. **"Which did you notice first — 'Buy from Wishlist' or
  'Compare options'?"** (closed choice: Buy / Compare / Noticed both at once / Didn't
  reach this screen) followed by **"Why do you think that one caught your eye?"**
  (optional free text).
- Why: this is the self-report half of the swapped-fill check, and it currently asks
  two things in one optional text box — so the part you can actually tally against the
  click log is buried in prose, in the question least likely to be answered. Splitting
  it gives you a countable answer and keeps the interesting "why" as a bonus.

---

## Page 5 — Comparing and pairing

**Q14 — comparison sorting**

- Now: *"If you compared two items, did sorting them by what mattered to you actually
  help?"*
- Rewrite: **"On the comparison screen you could tap what matters most to you — fit,
  delivery, reviews and so on — to reorder the rows. Did that help you decide?"**
- Options: "Yes — it helped me decide" / "It reordered things but didn't help" / "I
  didn't notice any difference" / "I didn't use the comparison screen"
- Why: "sorting them by what mattered to you" describes the mechanic in the
  researcher's words. Naming the actual tabs is what makes a respondent recall whether
  they used them.

**Q15 — pairing**

- Leave the wording. **The problem here is not phrasing.** Traced against the code, a
  respondent following the task list cannot reach a pairing suggestion by any route
  (`STATUS.md` item 3). Rewording a question about a screen nobody can see changes
  nothing. The fix is either initialising `lookCompletion` to `true` or adding a task
  step that opens an ordinary catalog product — and then this question works as
  written.

---

## Page 6 — Overall

**Q16 — standalone usefulness**

- Now: *"Overall, this was useful to me on its own."*
- Rewrite: **"Overall, this would be useful to me when I shop."** (1 = strongly
  disagree, 5 = strongly agree)
- Why: "on its own" is the researcher's blind-testing frame leaking into the
  respondent's view — it invites "on its own compared to *what*?", which is precisely
  the comparison the blind design is trying not to plant.

**Q17 — open ask** — no change. It works.

**Q18 — real revisit trigger** — **no change. This is the best-built question on the
form.** It is off the demo, closed-choice, tick-all-that-apply, and anchored with
"think about the last few times, not in general". Leave it exactly as it is.

**Q19 — age.** Remove the "Under 18" option, or add a screen-out. A tickbox is not
adequate consent from a minor, and collecting it serves no analytical purpose here.

**Q20 — city** — no change.

---

## When to use this

**Do not patch the live form before the deadline.** Five responses already exist under
the current wording. Changing stems mid-collection means every number is pooled across
two instruments, and `update-form-runbook.md` is explicit that Forms patching is the
most fragile operation in this project. The cost of a split sample at n≈10 is worse
than the cost of imperfect wording, and the wording problems are all reportable as
limitations.

Two changes are worth considering even so, because they cost nothing analytically:

1. **Making Q9 optional.** It cannot corrupt existing responses — it can only stop
   future ones from being padded with "na", and may reduce mid-form abandonment.
2. **Removing "Under 18" from Q19.** An ethics fix, not a data fix.

Everything else belongs to a v2 run after submission.
