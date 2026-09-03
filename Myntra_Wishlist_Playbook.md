# Myntra Growth — Wishlist → Purchase Conversion

## A complete execution playbook for the Graduation Project (Parts 1–7)

**Product chosen:** Myntra
**Strategic goal:** Increase the % of users who purchase at least one item from their wishlist within 30 days of adding it.
**Hard constraint:** No monetary incentives (no discounts, coupons, cashback, price drops as the mechanic).
**Timeline note:** Confirmed 3 Sep 2026 — the NextLeap project dashboard, the system of record, states **Sep 5, 3:59:00 PM (Asia/Calcutta)**. The brief PDF's page 8 still says 4 September and is stale. Deadline is the 5th; finish on the 4th anyway.

---

# 0. The one idea that should run through your whole submission

> **A wishlist is not a list of products. It is a queue of unfinished decisions.**

Every other framing ("users forget", "users wait for a discount") leads to a boring, discount-shaped solution — which the brief has explicitly banned. The interesting framing is:

- The user has already done the hard part: **they found something they want.**
- What is missing is not _desire_ and not _money_. It is **confidence** — resolution of a specific, nameable doubt.
- Myntra's wishlist UI does nothing to help resolve that doubt. It's a flat, reverse-chronological grid with no memory of _why_ the item was saved.

Your entire deck should read as: business metric → decomposition → discovery → research → **"the blocker is unresolved decision-state, not price"** → an MVP that closes decisions.

Evaluators reward a submission where Parts 1–4 make Part 5 feel _inevitable_. Build backwards from that.

---

# 0.5 — Why do people add items to a wishlist in the first place?

_(A hypothesis framework, not a finding. Use it two ways: as the seed for your Part 1 codebook's `intent_type` axis, and as the probe structure for the item-by-item walkthrough in Part 3. Your data decides which of these actually dominate for Myntra.)_

## The core mechanism

> **Saving is not a step toward buying. Saving is a way to avoid deciding.**

This is the reframe the whole project rests on. The heart icon looks like a commitment signal, but functionally it is the opposite: it is the escape hatch that lets a user feel they have made progress without incurring the cost of a real decision. It relieves the tension of _"I like this but I'm not sure"_ without resolving it. The item is parked, the discomfort goes away, and — crucially — **nothing about the original uncertainty has changed.**

That is why wishlists rot. The save _feels_ productive, so the user never notices they have deferred the same question forty times.

## Seven distinct motivations behind one database row

These are genuinely different behaviours that all produce an identical `save` event — which is exactly why wishlists are so hard to reason about, and exactly why Intent Capture is module ① of the MVP.

| #   | Motivation                            | What's really happening                                                                                                                                                                         | Convertible without money?                                                                      |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | **Deferred decision** _(the big one)_ | Real interest, one unresolved doubt — size, fabric, "will this suit me". Saving buys time to resolve it. The doubt never gets resolved, because nothing in the product helps resolve it.        | ✅ **Yes — this is the target.** Needs doubt resolution                                         |
| 2   | **Occasion parking**                  | "Perfect for the November wedding." Genuine intent, time-shifted. A timing problem, not a persuasion problem.                                                                                   | ✅ Yes — needs the Occasion Clock                                                               |
| 3   | **Building a comparison set**         | Six similar kurtas isn't six intentions, it's _one_ intention expressed six times. The wishlist is being used as a shortlist workspace. More saves here can mean _less_ likelihood of purchase. | ✅ Yes — needs forced collapse (the Duel)                                                       |
| 4   | **Price watching**                    | Save now, buy in the sale. Learned behaviour — Indian fashion e-comm has trained users into it with near-permanent discounting.                                                                 | ❌ **Off-limits under the constraint.** Exclude explicitly                                      |
| 5   | **Pure bookmarking / aspiration**     | No purchase intent at all. A mood board, a "someday" list, a taste inventory. Often expensive items the person never intends to buy.                                                            | ❌ Structurally unconvertible — **move it out of the wishlist** so it stops diluting the signal |
| 6   | **Fear of losing it**                 | "It'll go out of stock." Anxiety-driven, not desire-driven. Scarcity creates the save; it doesn't create the purchase.                                                                          | ⚠️ Partially — needs reassurance + stock truth                                                  |
| 7   | **Social pending**                    | Saved specifically to show a partner, friend or parent before deciding. The decision is genuinely outsourced and waiting on a third party.                                                      | ✅ Yes — needs structured Second Opinion (see the Appendix, runner-up 1)                        |

## The psychology driving it

Well-established mechanisms, worth naming in the deck because they lift the analysis above anecdote:

- **Choice overload** — Iyengar & Lepper's jam study is the canonical reference. More options reduce the likelihood of choosing _at all_, and increase post-choice regret. A wishlist is a machine for manufacturing choice overload out of your own past enthusiasm.
- **Loss aversion / anticipated regret** — the pain of buying the wrong thing exceeds the pleasure of buying the right thing, so the default action becomes _don't act_. Amplified in fashion, where a wrong purchase is embarrassing, not merely wasteful.
- **The Zeigarnik effect, inverted** — unfinished tasks normally nag at us. Saving **closes the loop psychologically while leaving it open functionally**: you get the relief of completion without the completion.
- **Endowment-in-advance** — saving creates a small sense of ownership, which partly satisfies the very desire that would otherwise drive the purchase.
- **Ambiguity aversion** — people reliably prefer a known outcome to an unknown one, even at a cost. "Don't buy" is the known outcome.

## Two implications that should shape the deck

**1. Your denominator is wrong until you segment by intent type.**
If a meaningful share of saves are inspiration-only or comparison-set duplicates, the theoretical ceiling on wishlist→purchase conversion sits far below 100%. Reporting that honestly is a **strength**, not a weakness — it shows you understand what the metric can and cannot do, and it tells you which saves are even worth targeting. Put the intent-type distribution on slide 4.

**2. The right intervention differs completely by motivation.**
Deferred-decision saves need doubt resolution. Occasion saves need timing. Comparison sets need forced collapse. Price-watchers are out of scope by constraint. Inspiration saves should be moved _out_ of the wishlist entirely. **A single generic nudge treats all seven as the same thing — which is precisely why generic nudges don't work here, and precisely why "we send a reminder" is the wrong answer.**

This is the argument for Intent Capture being module ① of Verdict: without knowing _why_ something was saved, every downstream intervention is a guess.

> **Caution to carry into research:** everything above is a hypothesis framework. Parts 1 and 3 exist to tell you which of these seven actually dominate for Myntra, and in what proportion. If your data says something different from this list, trust the data and say so explicitly in the deck — a visible mind-change is worth more marks than a tidy confirmation.

---

# 0.6 — The 'before' state: what the wishlist actually looks like today

_(Real captures from the Android apps, Aug 2026. Annotated versions: `myntra_wishlist_before_state.png`, `ajio_wishlist_before_state.png`, `nykaa_wishlist_before_state.png`, plus the summary matrix `wishlist_platform_comparison.png`. Use one of these as the visual on the problem slide — a teardown of the live product is far more persuasive than a description of it.)_

## Myntra wishlist — teardown

| #   | Observation                                                                     | Why it matters                                                                                               |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | Two identical Crocs, saved separately                                           | An unresolved comparison set the product can't see                                                           |
| 2   | Every card leads with **% OFF** and a struck-through price                      | Price is the only frame offered — nothing on fit, fabric, styling or wardrobe value                          |
| 3   | **"PRICE DROP BY ₹169"** is the only proactive nudge on the page                | Myntra's entire wishlist re-engagement strategy is a discount alert — precisely the lever this brief forbids |
| 4   | A cashback credit-card banner sits _above_ the first product                    | Prime real estate on a high-intent surface spent on a monetary offer                                         |
| 5   | Category chips (Shirts, Track Pants, Tshirts…) are filters, not decision states | They re-sort by _what_ the item is, never by _why_ it was saved or what's blocking it                        |
| 6   | Three actions per card: delete · move to bag · share                            | Two terminal, one an escape hatch. None resolve the doubt that caused the save                               |
| 7   | No save date, no reason, no occasion, no size guidance                          | The grid is reverse-chronological and mute; the user reconstructs their own intent from a photograph         |
| 8   | The list ends with a motivational quote                                         | Once you reach the bottom the page has nothing left to offer. The decision queue simply stops                |

## AJIO wishlist — teardown

The same failure, one layer barer.

| #   | Observation                                                                      | Why it matters                                                                                             |
| --- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Two near-identical black track pants, saved separately                           | Same unresolved comparison set as Myntra. Different platform, identical failure                            |
| 2   | Exactly **two** actions exist: delete, or add to bag                             | Both terminal. There is no state between "gone" and "bought" — which is precisely the state the user is in |
| 3   | ADD TO BAG is a heavy filled black button, the loudest element on screen         | The UI shouts _buy now_ at a user who has, by definition, already declined to buy now                      |
| 4   | Discount badges on almost every card (5% / 50% / 78% off)                        | Price is the only argument either platform knows how to make                                               |
| 5   | No filters, no collections, no sort, not even an item count                      | Barer than Myntra. The user gets a grid and does all the reasoning themselves                              |
| 6   | A ₹19,995 watch, sneakers, track pants and a tee share one undifferentiated grid | Four completely different decision types, treated identically                                              |
| 7   | No size, no fit note, no save date, no stock signal                              | Nothing that would resolve the doubt that stopped the purchase the first time                              |
| 8   | The grid ends mid-row, in whitespace                                             | No summary, no next step, no prompt to resolve anything. The list runs out                                 |

## Nykaa Fashion wishlist — teardown

The third platform, and the most explicitly monetary of the three.

| #   | Observation                                                                                           | Why it matters                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Three training tops in a four-item wishlist — green Puma tee, black adidas tee, black Nike sleeveless | A comparison set again. Third platform in a row. Whatever the category, users save variations of one decision and never close it                             |
| 2   | **Two full promotional banners** sit above the first saved item                                       | Roughly a third of the opening screen is merchandising before a single saved product appears                                                                 |
| 3   | The very first content on the page is a coupon code: _"FLAT 10% OFF… Use Code NFREV10"_               | The platform's entire theory of wishlist conversion, stated in one line, above everything the user actually saved                                            |
| 4   | No item count, no filters, no sort, no collections                                                    | Same as AJIO. A grid, and the user does all the reasoning alone                                                                                              |
| 5   | "Move to Bag" is the only forward action — and it's a soft outlined button                            | The one path forward is the quietest element on the card                                                                                                     |
| 6   | The **X** sits on the product photo, top-right, in a filled circle                                    | Removal is the most visually prominent per-item control. The clearest affordance is the one that destroys intent                                             |
| 7   | Discount badges on nearly every card (55% / 45% / 53% off)                                            | Third platform, same single argument                                                                                                                         |
| 8   | The list ends with a cheerful _"No more products!"_                                                   | Myntra ends on a quote, AJIO on whitespace, Nykaa on an exclamation mark. All three treat the end of the wishlist as a dead end rather than a decision point |

## The cross-platform verdict

_(See `wishlist_platform_comparison.png` — a slide-ready matrix.)_

| Capability                                 | Myntra | AJIO | Nykaa |    Verdict (proposed)    |
| ------------------------------------------ | :----: | :--: | :---: | :----------------------: |
| Captures **why** an item was saved         |   —    |  —   |   —   |            ✓             |
| Organises the list by decision state       |   —    |  —   |   —   |            ✓             |
| Resolves fit / size doubt for this user    |   —    |  —   |   —   |            ✓             |
| Collapses duplicate comparison sets        |   —    |  —   |   —   |            ✓             |
| Connects the item to what you already own  |   —    |  —   |   —   |            ✓             |
| Distils reviews to your specific doubt     |   —    |  —   |   —   |            ✓             |
| Gives a non-monetary reason to act now     |   —    |  —   |   —   |            ✓             |
| _Discount / price-drop messaging_          |   ✓    |  ✓   |   ✓   | _excluded by constraint_ |
| _Promo banners above the first saved item_ |   ✓    |  —   |   ✓   |        _excluded_        |
| _An unresolved comparison set on screen 1_ |   ✓    |  ✓   |   ✓   | _this is what it fixes_  |

**Three platforms. Three different visual languages. One identical failure.** Every column on the top half is empty. Every column on the bottom half is price.

## The conclusion to write on the slide

> **Across all three platforms, every conversion lever on the wishlist surface is monetary** — discount badges on every card, a price-drop alert, a cashback banner, a coupon code placed above the first saved item. All three treat the wishlist as a **discount-delivery channel** rather than a decision surface. Which means the constraint in this brief — _no monetary incentives_ — is not an artificial handicap: **it forces you into the only design space none of the incumbents has entered.**

That reframe is worth stating explicitly on the slide. It converts the hardest constraint in the brief into the reason your solution is differentiated.

## The strongest evidence you have

**All three wishlists contain an unresolved comparison set, visible without scrolling, in lists of only 4–9 items.**

- **Myntra:** two Crocs Bayaband Clogs, same model, same ₹4,197, saved separately
- **AJIO:** two black mid-rise track pants — BEWAKOOF ₹1,099 and NEONOMAD ₹330
- **Nykaa Fashion:** three training tops — Puma green, adidas black, Nike black sleeveless

This is `CHOICE_OVERLOAD` / `COMPARISON_SET` caught in the wild, three times out of three, without needing a single scraped review to find it. It is not a rare edge case — it is what a wishlist _is_. Put one annotated screenshot on the problem slide; it proves the thesis faster than any chart.

Note the implication: each platform records these as independent saves and will happily nudge on all of them. None has any concept that they are **one decision expressed several times** — which is precisely what the Duel module exists to collapse.

## Practical notes

- **Redact before submitting.** The Myntra wishlist header shows the delivery name and address; the annotated version blurs it. Check every screenshot for PII before it goes near the deck.
- **Use the app, not the web.** The mobile app is where the behaviour happens and where your MVP lives. A desktop capture has a filter rail and sidebar that would misrepresent the "before".
- **Small wishlists already prove the point** — but a heavier list (25+ items) makes the _"this is unfinishable"_ feeling more visceral. Worth capturing a second person's list if you can.

---

# PART 1 — Build an AI-Powered Discovery Engine

## 1.1 What "beyond sentiment analysis" actually means

The trap: 90% of submissions will dump 500 Play Store reviews into ChatGPT and ask "summarise the pain points." That is a summariser, not a discovery engine.

A real discovery engine has **five stages**, and you must be able to show each one:

| Stage         | What it does                                                                                 | Why it matters to the grader                  |
| ------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1. Ingest     | Pulls raw text from multiple, _structurally different_ sources                               | Shows you didn't rely on one biased channel   |
| 2. Normalise  | One row = one utterance, with metadata (source, date, rating, app version, inferred segment) | Enables slicing, which enables quantification |
| 3. Classify   | An LLM labels each row against **your codebook**, not free-form                              | Consistent, countable, auditable              |
| 4. Quantify   | Counts, cross-tabs, frequency × severity, segment splits                                     | This is the "quantify where possible" ask     |
| 5. Synthesise | Ranked opportunity areas with evidence quotes attached                                       | This is the deliverable, not a word cloud     |

## 1.2 Architecture (recommended, low-code)

```
SOURCES                    INGEST              STORE            CLASSIFY           OUTPUT
─────────────────────────────────────────────────────────────────────────────────────────
Play Store reviews  ──┐
App Store reviews   ──┤
Reddit (r/IndianFashionAddicts,
  r/india, r/OnlineShoppingIndia,
  r/DesiFashion)    ──┤   Apify /            Google Sheets     n8n loop →        Streamlit or
YouTube comments    ──┼──▶ AppFollow /   ──▶  or Airtable  ──▶  Claude API   ──▶  Lovable
Quora / Twitter(X)  ──┤   PRAW / YT API        (one row =       with a strict     dashboard
Myntra PDP reviews  ──┤   → CSV                 utterance)      JSON schema       (public URL)
Fashion blogs / FB  ──┘
                                                                       │
                                                                       ▼
                                                          Pivot tables → opportunity matrix
```

**Why this stack:** every piece has a free tier, and the whole thing produces a **public URL you can hand to the grader** — which the deliverable explicitly requires ("Link where the workflow can be tested").

## 1.3 Step-by-step build

### Step 1 — Collect (target: 800–1,500 utterances minimum)

Aim for a deliberate mix, not whatever is easiest:

| Source                                             | Target volume    | Tool                                                                                                                                                   | What it's good for                                      |
| -------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Play Store reviews (Myntra + AJIO + Nykaa Fashion) | 400–600          | [Apify Google Play Scraper](https://apify.com/epctex/google-play-scraper), [AppFollow](https://appfollow.io/), or `google-play-scraper` npm/python lib | Complaints, feature requests, rage                      |
| App Store reviews                                  | 100–200          | [Apify App Store Scraper](https://apify.com/epctex/appstore-scraper)                                                                                   | Skews affluent/iOS segment                              |
| Reddit threads                                     | 150–300 comments | [PRAW](https://praw.readthedocs.io/) or [Apify Reddit Scraper](https://apify.com/trudax/reddit-scraper)                                                | The _honest_ stuff — "why I never buy from my wishlist" |
| YouTube comments                                   | 150–300          | [YouTube Data API v3](https://developers.google.com/youtube/v3) on Myntra haul / "Myntra size guide" / "Myntra return experience" videos               | Fit + quality expectations                              |
| Myntra PDP reviews + Q&A                           | 100–200          | Manual or Apify                                                                                                                                        | Post-purchase regret reasons = pre-purchase fears       |
| Twitter/X + Quora                                  | 50–100           | [Apify Twitter Scraper](https://apify.com/apidojo/tweet-scraper), Quora search                                                                         | Public complaints, comparison questions                 |

**Search terms that actually surface wishlist behaviour** (use these on Reddit/YouTube/Quora):
`"myntra wishlist"`, `"saved for later"`, `"added to cart but didn't buy"`, `"myntra size confusion"`, `"myntra return experience"`, `"which size should I order myntra"`, `"myntra vs ajio quality"`, `"is myntra worth it"`, `"myntra haul disappointment"`, `"online shopping fit problem india"`, `"kurta size online"`.

> ⚠️ Ethics/compliance note for the deck: state that you used **publicly available** content, aggregated and de-identified, and that no personal data was stored. One line. Graders notice.

### Step 2 — Normalise into a single sheet

One row per utterance. Columns:

`id | source | source_detail | date | rating(if any) | raw_text | word_count | app_version | inferred_gender | inferred_city_tier | inferred_price_segment`

Keep `raw_text` verbatim — you'll need quotes for the deck.

### Step 3 — Build a **codebook** (this is the highest-leverage step)

Do NOT let the LLM invent categories per row — you'll get 200 near-duplicate labels that can't be counted. Instead: run an open-coding pass on ~100 rows, collapse into a fixed taxonomy, then classify all rows against that fixed taxonomy.

**Starter codebook — Blocker taxonomy (the "why didn't it convert" axis):**

| Code                     | Definition                                                            |
| ------------------------ | --------------------------------------------------------------------- |
| `FIT_UNCERTAINTY`        | Doesn't know which size / brand sizing inconsistent / body-type doubt |
| `QUALITY_DOUBT`          | Fabric, stitching, colour-vs-photo, "will it look cheap"              |
| `STYLE_SELF_DOUBT`       | "Will it suit _me_" / "will it look good on my body"                  |
| `OCCASION_MISMATCH`      | Saved for a future event, not needed yet                              |
| `CHOICE_OVERLOAD`        | Saved 5 similar things, can't pick                                    |
| `WARDROBE_REDUNDANCY`    | "I already own something like this"                                   |
| `PRICE_WORTH`            | Not "too expensive" — "not worth _this_ price for _this_ quality"     |
| `PRICE_WAIT`             | Explicitly waiting for a sale                                         |
| `RETURN_FRICTION_FEAR`   | Fear of the return/exchange hassle if it goes wrong                   |
| `SOCIAL_VALIDATION_NEED` | Wants a friend/partner's opinion first                                |
| `TRUST_SELLER`           | Brand/seller authenticity doubts                                      |
| `BOOKMARK_ONLY`          | Pure inspiration, never had purchase intent                           |
| `FORGOT`                 | Genuine decay / no reminder                                           |
| `DELIVERY_TIMING`        | Won't arrive in time / won't be home                                  |

**Second axis — Wishlist _intent type_** (directly answers the brief's "genuine intent vs bookmarking" question):
`ACTIVE_INTENT` · `DEFERRED_INTENT (occasion-bound)` · `COMPARISON_SET` · `PRICE_WATCH` · `INSPIRATION_ONLY`

**Third axis — Segment:** gender · age band · metro/tier-2 · price tier · frequency (if inferable).

**Fourth axis — Severity (1–5)** and **Fifth — Confidence (0–1)** so you can filter out weak labels.

### Step 4 — Classify at scale

Run every row through an LLM with a **strict JSON output schema**. Sample prompt you can lift:

```
You are a research analyst coding user feedback about online fashion shopping in India.

TASK: Classify the utterance below against the fixed codebook. Do not invent new codes.

CODEBOOK — blocker_codes: [FIT_UNCERTAINTY, QUALITY_DOUBT, STYLE_SELF_DOUBT,
OCCASION_MISMATCH, CHOICE_OVERLOAD, WARDROBE_REDUNDANCY, PRICE_WORTH, PRICE_WAIT,
RETURN_FRICTION_FEAR, SOCIAL_VALIDATION_NEED, TRUST_SELLER, BOOKMARK_ONLY, FORGOT,
DELIVERY_TIMING, NONE]

CODEBOOK — intent_type: [ACTIVE_INTENT, DEFERRED_INTENT, COMPARISON_SET, PRICE_WATCH,
INSPIRATION_ONLY, UNKNOWN]

RULES:
- Assign at most 2 blocker_codes, ranked.
- severity: 1 (mild annoyance) to 5 (deal-breaker / churn language).
- confidence: 0.0–1.0. If below 0.6, set blocker_codes to ["NONE"].
- evidence_span must be a VERBATIM substring of the input. Never paraphrase.
- If the utterance is not about the decision to buy, mark relevant=false.

OUTPUT (JSON only):
{"relevant": bool, "blocker_codes": [str], "intent_type": str, "severity": int,
 "confidence": float, "evidence_span": str, "segment_gender": str,
 "segment_city_tier": str, "unmet_need_1liner": str}

UTTERANCE: """{{text}}"""
```

**Quality control you should mention in the deck (this is what separates a PM from a prompt-jockey):**

- Hand-label 50 rows yourself, run the model on the same 50, report **agreement %**. Anything above ~80% is defensible. Report it honestly.
- Run 30 rows twice to check **stability** (same input → same label).
- Report a **coverage rate** (% marked relevant) so the grader knows your denominator.

### Step 5 — Quantify & build the opportunity matrix

Pivot the labelled sheet into:

1. **Frequency table** — blocker code × count × % of relevant utterances
2. **Severity-weighted score** — `Opportunity Score = Frequency % × Mean Severity`
3. **Segment cross-tab** — blocker × gender, blocker × city tier, blocker × price tier
4. **Intent-type distribution** — how much of the wishlist is even convertible? (If 35% is `INSPIRATION_ONLY`, your realistic ceiling just got redefined — and _saying that out loud_ is a strong PM move)
5. **Opportunity matrix** — plot Frequency (x) vs Severity (y), bubble size = how _addressable_ it is without money. Top-right + addressable = your target.

### Step 6 — Ship it as a testable link

The deliverable says: _"Link where the workflow can be tested."_ Options, easiest first:

- **[Lovable](https://lovable.dev/)** or **[Bolt.new](https://bolt.new/)** — describe the dashboard, connect to your Google Sheet, publish. Public URL in minutes.
- **[Streamlit Community Cloud](https://streamlit.io/cloud)** — free, GitHub-connected, ideal if you write a little Python.
- **[n8n](https://n8n.io/)** with a Form Trigger + public webhook — the grader pastes a review, it returns the coded JSON live. Very persuasive as a "workflow you can _test_."
- **Claude Project / Custom GPT** — the lightest option: a shared Project with the codebook + a slice of your dataset in its knowledge base. Weakest of the four, but acceptable if time-boxed.

**Best-in-class move:** ship _both_ — an n8n/Claude endpoint where they can paste any review and see live classification, **plus** a dashboard showing your 1,200-row results. That's what "beyond summarisation" looks like.

### 1.4 Tools & links for Part 1

**Scraping / data**

- Apify — https://apify.com (Play Store, App Store, Reddit, Twitter, YouTube actors)
- AppFollow — https://appfollow.io (app review analytics, free tier)
- Sensor Tower / data.ai — https://sensortower.com (app benchmarks)
- google-play-scraper (Python) — https://pypi.org/project/google-play-scraper/
- PRAW (Reddit API) — https://praw.readthedocs.io
- YouTube Data API v3 — https://developers.google.com/youtube/v3
- Pushshift/Reddit search alternatives — https://www.reddit.com/search

**Orchestration / AI**

- n8n — https://n8n.io · templates: https://n8n.io/workflows
- Zapier — https://zapier.com
- Make — https://www.make.com
- Claude — https://claude.ai · Projects docs: https://docs.claude.com
- Perplexity (secondary research + source-hunting) — https://www.perplexity.ai
- OpenAI Assistants/GPTs — https://platform.openai.com/docs

**Output**

- Lovable — https://lovable.dev · Bolt — https://bolt.new · Replit — https://replit.com
- Streamlit — https://streamlit.io · Vercel — https://vercel.com
- Airtable — https://airtable.com · Google Sheets + Apps Script

**Secondary market context (cite in deck for credibility)**

- Fashion e-commerce return-rate benchmarks — https://aisthetix.com/blog/fashion-ecommerce-return-rate
- Return rate benchmarks by category — https://www.richpanel.com/learn/ecommerce-return-rates
- Reducing returns via fit — https://www.yoursizer.com/blog/how-to-reduce-returns-in-fashion-ecommerce
- Fashion CRO guide — https://www.shopify.com/in/enterprise/blog/fashion-conversion-rate-optimization
- Myntra's own AI direction (Maya, MyFashionGPT) — https://blog.myntra.com · https://www.microsoft.com/en-in/aifirstmovers/myntra
- Baymard Institute (UX research on cart/save-for-later) — https://baymard.com/research

---

# PART 2 — Break Down the Business Metric

## 2.1 Define the metric precisely first

Sloppy definition = weak deck. Write it as an equation with an explicit window:

> **W30 = (# users who purchased ≥1 item that they had wishlisted, where purchase occurred within 30 days of that item's save event) ÷ (# users who wishlisted ≥1 item in the period)**

Immediately note the definitional choices a real PM would flag:

- **Item-level vs user-level?** The goal is stated _user-level_ ("% of users who purchase at least one item"). So one conversion per user is enough — which means **helping heavy wishlisters convert one item beats nudging light users repeatedly.**
- **Attribution:** does buying the same SKU in a different colour count? Recommend: yes, count SKU-family matches, and say why.
- **Rolling 30-day window per item**, not per calendar month.
- **Exclude** returned/cancelled orders from the numerator in a secondary "net" version. Show both.

## 2.2 The decomposition tree

```
W30: % of wishlisters purchasing ≥1 wishlisted item in 30 days
│
├── A. QUALITY OF SAVE  (is the item even convertible?)
│   ├── A1. % of saves with genuine purchase intent (vs inspiration)
│   ├── A2. Item availability at decision time (size in stock on return visit)
│   └── A3. Save-time context captured (occasion, size doubt, comparison)  ← today: ZERO
│
├── B. RETURN TO THE WISHLIST  (do they ever come back?)
│   ├── B1. Wishlist revisit rate within 30 days
│   ├── B2. Sessions per wishlister
│   └── B3. Entry points into wishlist (nudge CTR, tab discovery)
│
├── C. DECISION THROUGHPUT  (do they resolve the item once they see it?)
│   ├── C1. Items viewed per wishlist session
│   ├── C2. Wishlist → PDP click-through rate
│   ├── C3. **Doubt-resolution rate** — % of items where the blocking question gets answered
│   │       ├── C3a. Fit confidence
│   │       ├── C3b. Quality/fabric confidence
│   │       ├── C3c. Style-on-me confidence
│   │       ├── C3d. Worth-it (value, not price) confidence
│   │       └── C3e. Social validation obtained
│   ├── C4. Shortlist collapse rate — % of duplicate clusters reduced to one pick
│   └── C5. Decision latency — median days from save → resolved (bought OR removed)
│
├── D. CONVERSION MECHANICS  (does resolution turn into an order?)
│   ├── D1. Wishlist → ATC rate
│   ├── D2. ATC → checkout start
│   ├── D3. Checkout → order placed
│   └── D4. Size/variant availability at ATC
│
└── E. LEAKAGE  (where does intent die?)
    ├── E1. Saves that go stale (>30d untouched) — the graveyard
    ├── E2. Out-of-stock at revisit
    ├── E3. Bought the same/similar item elsewhere (off-platform leakage)
    └── E4. Return-anxiety abandonment
```

## 2.3 How to use the tree in the deck (Slide 2)

Don't just show the tree — **shade the branch you're attacking** and put a number next to it. Something like:

> "Discovery indicates ~62% of non-converting saves are blocked at **C3 (doubt-resolution)**, not at B (revisit) or D (mechanics). Myntra already solves B with notifications and D with a strong checkout. **C3 is unowned.**"

This single visual is often what makes a deck feel senior. It shows you _chose_, and shows what you _chose not to do_.

## 2.4 Frame the levers as a formula

`W30 ≈ Revisit Rate × Doubt-Resolution Rate × ATC-on-Resolved Rate × Checkout Completion`

Then: "Revisit is already ~X. Checkout is already strong. The multiplicand closest to zero is Doubt-Resolution. **That's where the leverage is.**" Bottleneck reasoning wins decks.

---

# PART 3 — Validate Through User Research (5–6 interviews)

## 3.1 Pick your segment _before_ recruiting

Choose one segment from your discovery output and justify it on **Reach × Severity × Addressability-without-money**. A strong, defensible choice:

> **Women, 22–32, metro + tier-2, 15+ items wishlisted, 0–1 purchases from wishlist in the last 60 days, shop ethnic + workwear across multiple brands.**

Why this segment is good for the project: high save volume (big denominator), high fit variance (ethnic/fusion sizing is notoriously inconsistent), high occasion-driven demand (weddings, festivals), and **their blocker is confidence, not money** — which fits the no-incentive constraint perfectly.

## 3.2 Recruiting (fast, 3–4 days)

- Your own network → WhatsApp/Instagram broadcast with a 5-question screener ([Google Forms](https://forms.google.com) / [Typeform](https://www.typeform.com))
- Reddit: r/IndianFashionAddicts, r/TwoXIndia, r/india — post a genuine research request (read subreddit rules first)
- Instagram Stories with a poll sticker → DM the yes-responders
- LinkedIn post
- Paid, if you have budget: [Userlytics](https://www.userlytics.com), [Respondent.io](https://www.respondent.io), [UserInterviews](https://www.userinterviews.com)

**Screener questions:** How many items in your Myntra/AJIO wishlist right now? · When did you last buy something _from_ your wishlist? · Roughly how often do you shop fashion online? · Age/city.

Screen **out** people with tiny wishlists and people who convert immediately — you want the stuck ones.

## 3.3 The interview method — do a _wishlist walkthrough_, not a Q&A

This is the single biggest upgrade available to you. Instead of asking abstract questions, **ask them to screen-share their actual Myntra wishlist and narrate it item by item.**

- People are terrible at recalling why they saved something in general, and excellent at explaining a specific item in front of them.
- You get an artefact: a coded table of ~60–100 real saved items across 6 users. That's quantifiable primary data — very rare in these submissions.

**Structure (40–45 min):**

| Time  | Section                                                    | Purpose                                                            |
| ----- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| 0–5   | Warm-up: last thing you bought online, and how you decided | Establishes decision style                                         |
| 5–10  | "Open your wishlist. React out loud as you scroll."        | Unprompted emotional read — often "oh god, why do I have all this" |
| 10–30 | **Item-by-item walkthrough (5–8 items)**                   | The core                                                           |
| 30–38 | Workarounds & outside-the-app behaviour                    | Reveals the real jobs                                              |
| 38–45 | Reaction to 2–3 concept stimuli                            | Directional signal for MVP                                         |

**Per-item probe script (repeat for each item):**

1. Take me back — where were you and what were you doing when you saved this?
2. What was going through your head? What was it _for_?
3. Do you still want it? (0–10) → _Why not 10?_ / _Why not lower?_
4. What exactly is stopping you right now? **Then: "and what's behind that?" ×3** (laddering — this is where the real root cause lives)
5. If you had to decide in the next 60 seconds, buy or delete? What would you need to know to be sure?
6. Did you look at anything outside Myntra about this? What, where, why?
7. Is there another item you're weighing this against? Show me.
8. Last time you were unsure like this and _did_ buy — what tipped you?

**Workaround questions (goldmine for Part 4):**

- Do you screenshot items? Send to friends? Which app?
- Do you check reviews elsewhere / YouTube / the brand's own site?
- Ever ordered 2 sizes deliberately?
- Ever bought it from a store after seeing it here — or vice versa?
- Anything you do to "remember" an item outside the wishlist?

**Rules:** never ask "would you use this feature" (people lie). Ask about the past, not the future. Silence for 5 seconds after an answer — the second sentence is the true one. Record with consent.

## 3.4 Synthesis

Build a **coded item table**, one row per discussed item:
`user_id | item | category | price band | days since save | intent_type | stated blocker | laddered root cause | workaround used | still wants? (0-10) | what would unblock`

Then:

- Count blockers across ~60 items → your primary-research frequency table
- **Triangulate** against Part 1: where do AI discovery and interviews _agree_? Where do they _disagree_? Explaining a disagreement honestly ("Reddit over-indexes on price complaints; interviews showed price was a socially acceptable cover for fit anxiety") is a standout deck moment.
- Pull 3–4 verbatim quotes. Quotes carry a deck.

**Tools:** [Otter.ai](https://otter.ai) or [Fireflies](https://fireflies.ai) for transcripts · [Dovetail](https://dovetailapp.com) or [Notion](https://notion.so) for tagging · Zoom/Meet for recording.

---

# PART 4 — Define the Problem

## 4.1 Structure it exactly as the brief asks

**a) Target user segment** — with size logic: "High-intent wishlist hoarders: women 22–32, ≥15 saved items, <2 wishlist purchases in 60 days. Estimated X% of MAU based on [your reasoning]."

**b) Product outcome to influence** — name the _specific node_ on your tree: "Doubt-resolution rate (C3), specifically fit + style-on-me + worth-it confidence."

**c) Root cause** — the laddered one, not the surface one. A strong articulation:

> **The wishlist stores the item but not the decision.** At save time, the user has a specific unresolved question ("is this the right size for _my_ shoulders", "do I have anything to wear this with", "is this worth ₹2,400"). Myntra records the SKU and discards the question. On return, the user faces a flat grid of 40 items with **no memory of why any of them were saved and no path to answering any of the original questions** — so they re-enter the same uncertainty they left, and the cheapest action is to scroll past. The wishlist accumulates decisions instead of closing them.

**d) Existing workarounds** — evidence that the need is real:

- Screenshotting items into WhatsApp groups for friend validation
- Reading reviews sorted for photos, hunting for someone with a similar body type
- Buying two sizes with the intent to return one
- Cross-checking the brand's own site / YouTube hauls / Instagram
- Keeping a separate notes app or Instagram "saved" folder as the _real_ shortlist
- Visiting an offline store to try the exact item, then ordering online

**e) Why it creates user value** — reduces decision fatigue and the anxiety of a wrong purchase; fewer returns; wardrobe that actually works together.

**f) Why it makes business sense** — high-intent demand already on-platform (cheapest possible incremental GMV); higher AOV via confident purchases; **lower return rate** (apparel returns are a major margin drain in Indian fashion e-comm); no discount cost, protecting contribution margin; increases wishlist tab engagement, a currently low-value surface.

## 4.2 The evolution slide

Make this a visual chain, one line each:

```
BUSINESS METRIC   →   PRODUCT OUTCOMES   →   AI DISCOVERY   →   PRIMARY RESEARCH   →   PROBLEM
W30 conversion        Decomposed to 5       1,240 utterances    6 wishlist walk-      "The wishlist
                      branches; C3          coded; C3-type      throughs, 68 items;   stores the item
                      (doubt-resolution)    blockers = 62%      price was a proxy     but not the
                      is the bottleneck     of blocked saves    for fit anxiety       decision"
```

Then one line of **falsifiability**: "We expected price-wait to dominate. It didn't. That changed our direction." Graders love a visible mind-change.

---

# PART 5 — The MVP

## 🏆 THE CONCEPT: **"VERDICT" — Myntra's Wishlist Decision Engine**

> **"Your wishlist isn't 40 products. It's 40 unfinished decisions. Verdict closes them."**

Verdict replaces the passive wishlist grid with a **decision workflow**. Every saved item is treated as an open case with a specific blocking question, and the system's job is to _close the case_ — buy it or bin it. Deleting an item counts as a win, because a shorter wishlist is a higher-signal wishlist.

### Why this is genuinely different from what everyone else will submit

| Everyone else will build     | Why it's weak                                                                    | What Verdict does instead                                                       |
| ---------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| A price-drop alert           | Banned (monetary) and already exists                                             | Creates urgency from the user's _own calendar_, not a discount timer            |
| A generic AI stylist chatbot | Myntra already has Maya/MyFashionGPT; you'd be rebuilding a shipped feature      | Attacks the _decision_, not the _discovery_                                     |
| A virtual try-on             | Capital-intensive, well-trodden, and doesn't fix "is it worth it / do I need it" | Uses the user's **own return history** as fit truth — cheaper and more accurate |
| A reminder notification      | "Users forget" is the lazy hypothesis; reminders raise revisits, not resolution  | Optimises the C3 node the tree says is the bottleneck                           |
| A social sharing feature     | Solves one blocker only                                                          | Social validation is one of five modules, not the whole product                 |

### The five modules

---

**① INTENT CAPTURE — one tap at save time**

When the user taps the heart, a non-blocking chip row slides up:

`For an occasion 📅 · Not sure of size 📏 · Comparing a few 🔀 · Just love it 💭 · Skip`

- Optional, one tap, dismissible. Zero friction cost.
- If "For an occasion" → a second micro-tap: _Wedding · Office · Travel · Festival · Date · Everyday_, plus optional date.
- **This is the unlock.** It costs the user 0.4 seconds and gives the system the one thing it has never had: _why_. Everything downstream is powered by it.
- For users who skip, the system **infers** intent from behaviour (dwell time, size-chart opens, number of similar saves, category).

**② AUTO-TRIAGE — the wishlist reorganises itself by decision state**

The flat grid is replaced with buckets:

- 🟢 **Ready to decide** (3) — nothing blocking; one tap from checkout
- 📏 **Waiting on fit** (7) — needs a size verdict
- 🔀 **Pick one** (2 clusters, 9 items) — near-duplicates you never chose between
- 📅 **For an occasion** (4) — with days-remaining countdowns
- 💭 **Just inspiration** (12) — _"Move these to a Style Board?"_

Moving 12 items out of the decision queue is itself a feature: **it makes the remaining list feel finishable.** A 40-item wishlist is paralysing. A 3-item "Ready to decide" list is not.

**③ THE VERDICT CARD — one screen that kills the specific doubt**

Tap any item → a full-screen dossier with four verdicts. This is the demo centrepiece.

- **📏 FIT VERDICT** — _"Order size M."_
  Built on Myntra's genuinely unfair data advantage: **the user's own order + return + exchange history.** e.g. _"You've kept 4 of 5 size-M tops. You returned a Libas kurta in M for 'tight at shoulders' — this brand runs 0.5 size small there, so we recommend L. 81% of buyers with a purchase pattern like yours kept L."_ Confidence bar: **High / Medium / Low** — and when it's Low, say so and say _why_. Honest uncertainty builds more trust than false precision.

- **👗 WARDROBE VERDICT** — _"Pairs with 6 things you already own."_
  Built from the user's Myntra purchase history. Shows the actual thumbnails of the owned items it works with, plus a redundancy warning: _"You already own 3 black round-neck tees."_ Turns "do I want this" into "does this earn a place in my wardrobe" — a question people can actually answer.

- **💬 WHAT PEOPLE LIKE YOU SAID** — RAG over reviews, filtered to the doubt.
  Not "4.2 ★ (1,238 reviews)." Instead: _"Of 47 reviewers who mentioned shoulders, 41 said the fit was true to size. Fabric was the top complaint in reviews under 3★ (mentioned 22 times) — mostly about transparency in the white colourway."_ Answers the question the user actually has, in the language they used to ask it.

- **⚖️ WORTH-IT VERDICT** — value framing, **zero discounting**.
  _"₹2,399 · you'd realistically wear this ~20 times over the next year (you have 2 weddings and 4 festive events coming) → about ₹120 per wear. Your average kurta cost-per-wear is ₹180."_ This is persuasion by _information_, not by price cut — which is exactly the constraint the brief set, and the clearest proof you respected it.

**④ THE DUEL — collapse the comparison sets**

When the system detects 3+ near-duplicates (same category, similar price/colour/silhouette), it offers: _"You've saved 5 white shirts. Settle it?"_

A rapid head-to-head: two items at a time, tap the one you prefer, ~4 taps to a winner. Then Verdict explains the outcome — _"You picked the mandarin-collar one every time. Here's why it also wins on fit and pairs with more of your wardrobe."_ — and offers to archive the rest.

This directly attacks `CHOICE_OVERLOAD`, which is one of the most under-served blockers in fashion e-comm, and it is genuinely _fun_, which is how you earn repeat opens with no money on the table.

**⑤ THE OCCASION CLOCK — non-monetary urgency**

For occasion-tagged items:

> _"Riya's wedding — 21 days away. To have time for a size exchange if needed, order by **12 Sept**."_

This is the sharpest idea in the MVP. Discount countdowns create urgency by manufacturing scarcity. The Occasion Clock creates urgency from the **user's own real deadline** — which is more honest, more effective, and completely compliant with the no-incentive constraint. It also converts Myntra's exchange-window policy from a cost centre into a _reason to order sooner_.

### Optional layer: the **Wishlist Health Score**

A number at the top: _"Wishlist Health: 62 — 12 items have gone stale. Close 3 decisions to reach 80."_ Gives the user a non-monetary reason to open the tab, and gives you a beautiful north-star-adjacent engagement metric. Keep this as a secondary flourish; don't let it overshadow the Verdict Card.

### Non-goals (put this on the slide — it signals maturity)

- Not a stylist chatbot (Maya exists)
- No discounts, coupons, or price alerts (constraint)
- Not a virtual try-on (out of scope for MVP)
- Not a social feed

---

## 5.2 How to actually build & deploy it (Figma prototype + live AI workflow)

You chose **Figma prototype + deployed AI workflow** — the right call, because it lets you show the _in-app feel_ while still shipping something publicly testable.

### Deliverable A — Figma clickable prototype (the in-app feature)

**Screens to build (8–10, no more):**

1. PDP with heart tap → Intent Capture chips animating up
2. Occasion sub-picker with date
3. Wishlist "before" — the flat 40-item grid (for contrast; use this in the deck too)
4. Wishlist "after" — triaged buckets with counts
5. Verdict Card — Fit verdict expanded
6. Verdict Card — scrolled to Wardrobe + Worth-It
7. The Duel — head-to-head screen
8. Duel result + archive prompt
9. Occasion Clock notification + the item card with countdown
10. Confirmation state: _"3 decisions closed this week"_

**How to build fast:**

- Start from a Myntra-accurate UI kit so it looks real: [Figma Community](https://www.figma.com/community) → search "Myntra UI kit" / "e-commerce app UI kit" / "Indian ecommerce app"
- Real product images: screenshot actual Myntra PDPs (fine for a fellowship prototype; note it in the deck)
- Use **Figma Make** or [Uizard](https://uizard.io) / [Galileo AI](https://www.usegalileo.ai) to generate first-pass screens, then refine
- Prototype interactions: Smart Animate between states, overlays for the Verdict Card
- Share with **"Anyone with the link → can view"** — a locked link is an instant deliverable failure
- Record a 60–90s walkthrough with [Loom](https://loom.com) and embed it in the deck

### Deliverable B — The deployed, publicly testable AI agent (this is what the brief grades)

Build **"Verdict Agent"** — a public web app where anyone (including the grader) can experience the intelligence, not just the pixels.

**Flow:**

1. Landing page: _"Paste any Myntra product link, or pick from a demo wishlist."_
2. Pick a demo persona (pre-seeded: _Ananya, 26, Bangalore — 34 saved items, past orders and 3 returns on record_). Personas make the personalisation legible without needing real user data.
3. Agent produces a live **Verdict Card**: fit verdict + confidence, wardrobe pairing, distilled review evidence, cost-per-wear.
4. A **"Run the Duel"** button on the multi-item demo wishlist.
5. Grader can also paste their _own_ product link → real product data in, real verdict out. Enormously more convincing than a canned demo.

**Stack (pick one):**

| Approach         | Stack                                                                                             | Effort   | Notes                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| Fastest          | [Lovable](https://lovable.dev) or [Bolt.new](https://bolt.new) + LLM API, deploy to their hosting | ~1 day   | Prompt it with your Verdict Card spec; iterate in chat |
| Most control     | Next.js + [Vercel](https://vercel.com) + Claude/OpenAI API                                        | 2–3 days | Cleanest, most "real product" feel                     |
| Python-native    | [Streamlit](https://streamlit.io/cloud) or [Gradio](https://gradio.app) on Hugging Face Spaces    | 1 day    | Free, fine if you're comfortable in Python             |
| No-code workflow | [n8n](https://n8n.io) form trigger → scrape → LLM → formatted response                            | ~1 day   | Doubles as your Part 1 engine — reuse the infra        |

**Faking the data honestly (and how to say so):** you obviously don't have Myntra's order database. Seed a JSON file of 3 personas with plausible purchase history, returns with reasons, and owned-wardrobe items. In the deck, write one line: _"Personas are synthetic; in production these fields map to existing Myntra order, return-reason, and catalogue-attribute data."_ Naming the production data dependency is a **senior** move — it shows you know what it would take to actually ship.

**Prompt skeleton for the Verdict Agent:**

```
You are Verdict, Myntra's wishlist decision engine. Your job is to close an open
purchase decision by resolving the user's specific doubt. You never offer discounts,
coupons, or price incentives.

INPUTS
- product: {title, brand, category, price, size_chart, attributes, reviews[]}
- user: {past_orders[], returns[{item, size, reason}], owned_wardrobe[],
         body_notes, upcoming_occasions[]}
- save_context: {intent_type, occasion, occasion_date}

PRODUCE exactly four verdicts:
1. FIT — a specific size recommendation, the reasoning chain (cite the user's own
   kept/returned items), and confidence High/Medium/Low. If evidence is thin, SAY the
   confidence is Low and state what would raise it. Never fabricate a statistic.
2. WARDROBE — items in owned_wardrobe this pairs with (name them), plus a redundancy
   flag if they already own ≥2 close matches.
3. REVIEW EVIDENCE — extract only review content relevant to the user's stated doubt.
   Report counts ("31 of 47 who mentioned sleeves said..."). Include the top negative
   theme. No overall star ratings.
4. WORTH-IT — estimated wears over 12 months given their occasions and category
   habits, then cost-per-wear vs their category average. Never mention sales or price drops.

Then output RECOMMENDATION: BUY | BUY_DIFFERENT_SIZE | WAIT (with the specific
trigger that would change the answer) | REMOVE — with one sentence of reasoning.

Tone: a well-informed friend, not a salesperson. If the honest answer is "don't buy
this", say it. Trust is the product.
```

> That last instruction — _"if the honest answer is don't buy this, say it"_ — is worth a line in your deck. A decision engine that sometimes says "remove it" is the reason users will trust the times it says "buy". It also makes REMOVE-rate a legitimate success metric, which almost nobody will think to do.

### Build sequence (working backwards from 4 Sept — a day before the 5 Sept cutoff)

| Days          | Work                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------- |
| 19–21 Aug     | Part 1: scrape + normalise. Get to 1,000+ rows in a sheet. Launch interview screener in parallel. |
| 22–24 Aug     | Codebook, classify, quantify, opportunity matrix. Deploy discovery-engine link.                   |
| 24–28 Aug     | 6 interviews (wishlist walkthroughs). Code the item table.                                        |
| 28–29 Aug     | Part 2 + Part 4: lock the metric tree and the problem statement. **Do not build before this.**    |
| 29 Aug–1 Sep  | Build Verdict Agent + deploy. Build Figma prototype in parallel.                                  |
| 1–2 Sep       | Parts 6 & 7. Deck v1 (10 slides).                                                                 |
| 3 Sep         | Ruthless edit, colour-blind + font-14 check, verify **every link opens in incognito**.            |
| 4 Sep morning | Submit. Do not submit at 3:55 PM.                                                                 |

---

# PART 6 — Define Success

Structure the slide as a table: `Metric | Definition | Why this metric | Target`. Definitions are explicitly graded, so write them as formulas.

### North Star (the business metric)

**W30** — % of users who wishlist ≥1 item and purchase ≥1 wishlisted item within 30 days of that item's save.
_Target: +X pp relative lift in the treatment cell._ State a relative target (e.g. +12–15% relative) rather than an invented absolute — and say it's a hypothesis to be calibrated on baseline.

### Leading indicators (move in days, not months)

| Metric                      | Definition                                                                                    | Rationale                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Intent-capture rate         | % of saves where the user taps an intent chip (not "Skip")                                    | Powers everything downstream; if this is <30%, the whole system starves |
| Verdict Card view rate      | Unique Verdict Cards opened ÷ wishlist items viewed                                           | Is the doubt-resolution layer actually being consumed?                  |
| **Doubt-resolution rate**   | % of viewed items that reach a terminal state (ATC, or explicit remove/archive) within 7 days | **The core outcome metric.** Directly maps to node C3 on your tree      |
| Decision latency            | Median days from save → terminal state                                                        | Speed of the queue; should fall                                         |
| Duel completion rate        | % of offered duels completed                                                                  | Validates the choice-overload thesis                                    |
| Occasion Clock CTR → order  | Order rate on items with an active occasion deadline vs matched control                       | Validates non-monetary urgency                                          |
| Wishlist revisit rate (30d) | % of wishlisters returning to the wishlist surface                                            | Necessary but not sufficient — don't let this be your headline          |

### Guardrails (what must NOT break)

| Guardrail                                | Definition                                                            | Threshold                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Return rate on Verdict-influenced orders | Returns ÷ orders where a Verdict Card was viewed pre-ATC              | Must be **≤** control. A fit engine that raises returns has failed, even if conversion rose |
| Save rate (PDP → wishlist)               | Saves ÷ PDP views                                                     | Intent Capture must not suppress saving. Watch closely — this is the likeliest regression   |
| Overall AOV & units/order                | Standard                                                              | Verdict must not just shift purchases to cheaper "safe" items                               |
| Notification opt-out / mute rate         | Users disabling wishlist notifications                                | Occasion Clock must not become spam                                                         |
| Session-level app conversion             | Guard against cannibalising browse/discovery conversion               | Verdict shouldn't win by stealing from Search                                               |
| Verdict accuracy / trust                 | % of Verdict-recommended sizes that were kept (not returned for size) | If this drops below ~75%, pull the feature. Your credibility is the asset                   |
| Latency                                  | p95 Verdict Card render time                                          | Under ~1.5s or nobody uses it                                                               |

### Counter-metric worth naming explicitly

**Archive/remove rate.** It will go _up_, and that is a **success**, not a failure. Say this on the slide before someone asks: closing a decision negatively is still closing it, and it raises the signal density of everything left. Include it as an intentional, expected movement.

### Measurement design

- A/B at the **user** level (not session), 50/50, minimum 4 weeks so the 30-day window can actually close.
- Pre-register the primary metric (W30) — one primary, everything else secondary. Avoid the multiple-comparisons trap.
- Holdout cell to measure the long-run effect on save behaviour.
- Segment cuts pre-declared: wishlist size decile, category mix, new vs returning.
- Note the **novelty-effect risk**: read week 3–4, not week 1.

---

# PART 7 — Risks & Mitigation

Make these _specific to Verdict_. Generic risks ("users may not adopt") get no marks.

| #   | Risk                                                                                                               | Why it's real                                                                                          | Mitigation                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Cold-start / thin data** — new users have no order or return history, so the Fit Verdict has nothing to stand on | Most personalisation features die here                                                                 | Degrade gracefully: fall back to cohort-level fit data ("buyers of this brand in your usual size"). **Show Low confidence honestly** rather than a confident guess. Bootstrap with a 3-question fit profile at first use                   |
| 2   | **Wrong size recommendation → return**                                                                             | Directly damages the guardrail the feature exists to improve, and destroys trust in one bad experience | Only surface a verdict above a confidence threshold; monitor kept-rate weekly; auto-suppress the module for brand/category pairs where accuracy drops below target; make the reasoning visible so the user can override                    |
| 3   | **Intent Capture suppresses saving** — an extra tap at the moment of delight reduces save rate                     | The riskiest interaction in the design                                                                 | Non-blocking, dismissible, appears _after_ the heart animation completes; hide after N skips; ship this as its own A/B before the full feature; infer intent behaviourally for skippers                                                    |
| 4   | **It feels like nagging** — Occasion Clock plus triage prompts read as pressure                                    | Fashion shopping is emotional; pressure kills the vibe                                                 | Hard cap on notifications (≤2/week); user-controlled occasion dates; the "just inspiration" bucket is explicitly a **no-pressure zone** with zero nudges                                                                                   |
| 5   | **AI hallucination in review synthesis** — invented statistics                                                     | A single fabricated "83% said..." is a brand and legal risk                                            | Strict extractive RAG with citation back to real review IDs; a numeric guard that recomputes counts in code rather than trusting the model; every claim tappable to see the source reviews; suppress the module below a review-count floor |
| 6   | **Honest "REMOVE" verdicts reduce short-term GMV**                                                                 | The business may resist a feature that tells users not to buy                                          | Frame and measure it as a **trust investment**: track 60/90-day repeat purchase rate and return rate in the treatment cell. Argue the payback explicitly rather than hoping nobody notices                                                 |
| 7   | **Wardrobe Verdict is only as good as on-platform purchase data** — users buy offline and elsewhere                | Pairing suggestions could be embarrassingly wrong                                                      | Let users add owned items manually (or via a photo); phrase suggestions as "pairs with items you bought on Myntra" so the scope is honest                                                                                                  |
| 8   | **Only helps heavy wishlisters** — the long tail with 2 saved items sees nothing                                   | Limits reach, and W30 is a user-level metric                                                           | Accept it and _say so_: this is a deliberately segment-targeted bet. Size the addressable segment in the deck and show that even a modest lift there moves the aggregate                                                                   |
| 9   | **Cost / latency at Myntra scale** — per-item LLM generation across millions of wishlists                          | Real engineering constraint                                                                            | Precompute verdicts asynchronously on save and on price/stock change; cache aggressively; use a small model for triage and reserve the large model for the Verdict Card; generate only for items the user actually opens                   |
| 10  | **Privacy perception** — "you know what's in my wardrobe?"                                                         | Personalisation can tip into creepy                                                                    | Use only first-party data the user already gave Myntra; make the reasoning visible ("because you returned X"), which reframes it as _transparent_ rather than surveillant; one-tap opt-out                                                 |

---

# The 10-Slide Deck

Hard rules from the brief: **no name anywhere · 10 slides max · font size 14 (strict) · slide titles state the key message, not the section label · readable contrast · colour-blind safe · all links must actually open.**

| #   | Slide title (write it as a _claim_, like these)                                              | Contents                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | _Wishlist conversion is blocked by unresolved doubt, not by price_                           | The thesis up front. Metric definition + the one-line answer. Executives read slide 1 and skim the rest — put your conclusion here |
| 2   | _Of five levers on wishlist conversion, only doubt-resolution is unowned_                    | The decomposition tree, with your branch shaded and quantified                                                                     |
| 3   | _An AI engine coded 1,240 public conversations against a fixed blocker taxonomy_             | Discovery engine architecture (the required 1-slider) + link + your accuracy/agreement number                                      |
| 4   | _62% of stalled saves trace to fit, style-fit and worth-it doubt — not to discounts_         | The quantified findings: frequency × severity chart, segment cross-tab, 2 verbatim quotes                                          |
| 5   | _6 wishlist walkthroughs revealed price was a socially acceptable cover for fit anxiety_     | Method, segment, coded item table, and the triangulation (where AI and interviews disagreed)                                       |
| 6   | _Myntra's wishlist stores the item but discards the decision_                                | The problem statement: segment, outcome, root cause, workarounds, user value, business value                                       |
| 7   | _Verdict turns a passive wishlist into a decision queue_                                     | The solution: five modules, one hero screenshot of the Verdict Card, and the non-goals                                             |
| 8   | _Live MVP: paste any product, get a fit, wardrobe, evidence and worth-it verdict_            | Prototype + agent links, 2–3 screens, one line on the production data dependency                                                   |
| 9   | _Success = decisions closed, not just items bought — with return rate as the hard guardrail_ | Metrics table: north star, leading, guardrails, and the counter-metric                                                             |
| 10  | _The two risks that could kill this: cold-start fit data and save-rate suppression_          | Top 4–5 risks with concrete mitigations, plus the experiment design                                                                |

**Deck build tips:** Google Slides or Figma Slides (easy sharing) · font 14 throughout, _including_ chart labels and footnotes — this is the most commonly failed rule · check contrast at [WebAIM](https://webaim.org/resources/contrastchecker/) · simulate colour blindness at [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/) · use a colour-blind-safe palette from [ColorBrewer](https://colorbrewer2.org) · avoid red/green as your only distinction · **open every link in an incognito window before submitting.**

---

# Master link list

**Scraping & data:** [Apify](https://apify.com) · [AppFollow](https://appfollow.io) · [google-play-scraper](https://pypi.org/project/google-play-scraper/) · [PRAW](https://praw.readthedocs.io) · [YouTube Data API](https://developers.google.com/youtube/v3) · [Sensor Tower](https://sensortower.com)

**AI & orchestration:** [Claude](https://claude.ai) · [n8n](https://n8n.io) ([templates](https://n8n.io/workflows)) · [Zapier](https://zapier.com) · [Make](https://www.make.com) · [Perplexity](https://www.perplexity.ai) · [OpenAI Platform](https://platform.openai.com/docs)

**Build & deploy:** [Lovable](https://lovable.dev) · [Bolt.new](https://bolt.new) · [Replit](https://replit.com) · [Vercel](https://vercel.com) · [Streamlit Cloud](https://streamlit.io/cloud) · [Gradio](https://gradio.app) · [Hugging Face Spaces](https://huggingface.co/spaces)

**Design:** [Figma](https://figma.com) · [Figma Community UI kits](https://www.figma.com/community) · [Uizard](https://uizard.io) · [Galileo AI](https://www.usegalileo.ai) · [Loom](https://loom.com)

**Research ops:** [Google Forms](https://forms.google.com) · [Typeform](https://www.typeform.com) · [Otter.ai](https://otter.ai) · [Fireflies](https://fireflies.ai) · [Dovetail](https://dovetailapp.com) · [UserInterviews](https://www.userinterviews.com) · [Respondent](https://respondent.io)

**PM craft & benchmarks:** [Baymard Institute](https://baymard.com/research) · [Reforge](https://www.reforge.com/blog) · [Lenny's Newsletter](https://www.lennysnewsletter.com) · [Amplitude North Star Playbook](https://amplitude.com/north-star) · [Fashion return-rate benchmarks](https://aisthetix.com/blog/fashion-ecommerce-return-rate) · [Return rate by category](https://www.richpanel.com/learn/ecommerce-return-rates) · [Fit and returns](https://www.yoursizer.com/blog/how-to-reduce-returns-in-fashion-ecommerce) · [Fashion CRO guide](https://www.shopify.com/in/enterprise/blog/fashion-conversion-rate-optimization) · [Myntra blog](https://blog.myntra.com) · [Myntra × Microsoft AI case study](https://www.microsoft.com/en-in/aifirstmovers/myntra)

**Accessibility:** [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/) · [Coblis simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/) · [ColorBrewer](https://colorbrewer2.org)

---

# The five things that will actually decide your grade

1. **Did the AI engine produce numbers, or paragraphs?** A fixed codebook + frequency × severity table + a stated accuracy check is the difference between "used AI" and "built a discovery engine."
2. **Does the metric tree show a _choice_?** Shade one branch. Say what you're not doing and why.
3. **Did primary research change your mind about something?** Show the disagreement between AI findings and interviews. A submission where everything neatly confirms the first hypothesis reads as unfalsifiable.
4. **Is the MVP obviously derived from the research, and obviously not a discount?** Every Verdict module should trace to a blocker code from Part 1.
5. **Do the links work, and is the font 14?** An extraordinary amount of otherwise-good work loses marks on a locked Figma link or a 12pt footnote. Check in incognito.

---

# APPENDIX — Choosing the MVP form factor (and why Verdict wins)

The brief allows four forms. They are not equally scoreable:

| Form                                             | What it looks like                          | Ceiling                                                                                                       | Risk                             |
| ------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| A feature inside Myntra                          | Figma prototype of a new wishlist surface   | High realism, but a prototype alone is **not "deployed to production"** — it fails the deliverable on its own | Grader can't _test_ intelligence |
| An AI-powered workflow                           | n8n/Zapier chain that produces an output    | Easy to deploy, but reads as internal tooling, not a user experience                                          | Feels like Part 1 again          |
| An AI agent                                      | Conversational or task agent                | Deployable and impressive — but a bare chatbot competes with Myntra's shipped Maya/MyFashionGPT               | "Why isn't this just a chatbot?" |
| A standalone experience connected to the journey | A web app the user opens alongside shopping | Deployable, testable, distinctive                                                                             | Must justify why it isn't in-app |

**The winning combination is a feature _and_ an agent, presented as one product:**
Verdict is designed as an in-app wishlist surface (shown in Figma, so it reads as a real Myntra feature with a credible path to production), powered by an agent you actually deploy (so the grader can paste a product link and watch the intelligence work). That satisfies "deploy to production so it can be interacted with and tested" while avoiding the two failure modes — a pretty prototype with no substance, or a working demo with no product vision.

## The three runner-up concepts (use these as your "alternatives considered" slide)

Showing what you rejected, and why, is worth real marks. Rejected concepts should each map to a real blocker code, so it's clear you chose on evidence, not taste.

**Runner-up 1 — "Second Opinion": one-tap social validation.**
Share a wishlist item to a WhatsApp group and collect structured votes ("Yes / No / Different colour") that come back _into_ the app as a decision card. Attacks `SOCIAL_VALIDATION_NEED`, and it formalises the screenshot-to-friends workaround that shows up constantly in research.
_Why it's second:_ it's viral and cheap to build, but it only resolves one blocker, and it depends on the user's friends responding — a dependency you don't control. It works better as **module ⑥ of Verdict** than as the whole MVP. Mention it as a fast follow.

**Runner-up 2 — "Fit Passport": a portable, learned fit profile.**
Your body + fit preferences learned from your own return reasons, applied across every brand, with brand-level sizing offsets. Attacks `FIT_UNCERTAINTY` — probably the single largest blocker in Indian fashion e-comm.
_Why it's second:_ it's the strongest _single_ idea, and it may well be the highest-ROI thing Myntra could actually ship. But as a project MVP it's narrow — it doesn't touch choice overload, wardrobe redundancy, or worth-it doubt, so the deck ends up with a decomposition tree that's much wider than the solution. It lives inside Verdict as the Fit Verdict module. If your research comes back overwhelmingly fit-dominated, **promote it to the headline and demote the rest** — let the data decide.

**Runner-up 3 — "Wishlist Wrapped / Closet Report": a periodic AI report on your saved items.**
A monthly digest that analyses your wishlist and tells you what it says about you, what's stale, what's redundant, and what to close.
_Why it's third:_ delightful and shareable, but it's a _reporting_ layer, not a _decision_ layer. It raises revisits (node B) without raising resolution (node C3) — the exact mistake your metric tree warns against. Useful as a re-engagement wrapper around Verdict.

## The decision rule to state in the deck

> "We evaluated four concepts against three criteria: **(1)** does it attack node C3 (doubt-resolution), the branch our decomposition identified as the bottleneck; **(2)** does it work without any monetary incentive; **(3)** does it use a data asset Myntra has and competitors don't. Only Verdict scores on all three — and criterion 3 is the moat: the user's own return-reason history is data no third-party fit tool, and no competitor, can replicate."

That last sentence is your strongest single line in the entire deck. Return-reason data is genuinely proprietary, genuinely predictive of fit, and currently used only for logistics and refunds — not for pre-purchase confidence. **Reframing a cost-centre dataset as a conversion asset is exactly the kind of insight a Growth PM is hired for.** Say it explicitly.
