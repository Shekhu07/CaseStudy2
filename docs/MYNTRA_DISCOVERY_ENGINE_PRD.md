# Myntra Product Requirements Document (PRD)
## AI Discovery Engine: Wishlist-to-Purchase Intelligence System

| Document Attribute | Details |
|---|---|
| **Document ID** | MYN-GRW-PRD-2026-08 |
| **Product Area** | Myntra Growth Team — Decision & Conversion Platform |
| **Target Surface** | Wishlist Core, Search-Reconnection, Discovery Engine |
| **Business Metric** | % of users purchasing $\ge 1$ item from wishlist within 30 days ($W_{30}$) |
| **Strategic Directive** | **Zero Monetary Incentives** (No discounts, coupons, cashback, or price cuts) |
| **Document Status** | Approved for Execution / V2 Architecture |
| **Target Rollout** | Q3 2026 |

---

## 1. Executive Summary & Strategic Objective

### 1.1 The Growth Challenge
Millions of users browse fashion on Myntra, select garments, and add items to their wishlist. A wishlist addition represents the strongest declaration of pre-purchase interest on the platform: the user has completed search and selection, but halted immediately before checkout. 

Over time, user wishlists accumulate dozens or hundreds of items, but only a small fraction convert into purchases within 30 days (baseline estimated at **~9.4%**). 

### 1.2 The Strategic Goal
Increase **$W_{30}$** (the percentage of users who purchase at least one item from their wishlist within 30 days of saving).

### 1.3 The Non-Monetary Constraint
Under strict executive mandate, **no solution may use monetary levers** (no discount drops, no flash sales, no coupon nudges). 

This mandate is grounded in unit economics: Indian fashion e-commerce has trained users to defer purchases by subsidizing hesitation with discount alerts. Solving conversion via price subsidies compresses gross margin and erodes brand equity. The AI Discovery Engine is built to uncover **unresolved decision friction**—the information and confidence barriers that can be eliminated through product design, intelligence, and UX.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               THE METRIC DECOMPOSITION TREE                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
  W30 Conversion Rate
    = [A] Genuine Intent Share (72.2% pre-purchase saves carry explicit intent)
      × [B] 30-Day Wishlist Re-Entry Rate (Self-initiated search + surface revisit)
      × [C] Doubt Resolution Rate (66.1% of pre-purchase shoppers face unanswered doubt)
      × [D] Checkout Conversion Mechanics (Frictionless cart-to-order flow)
```

---

## 2. Problem Space & Teardown Analysis

### 2.1 The "Before State" Teardown: Live Myntra Android App
An audit of the production Myntra Wishlist surface reveals structural decision blindness:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CURRENT MYNTRA WISHLIST: 8 DESIGN DEFECTS                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. FLAT REVERSE-CHRONOLOGICAL DUMP: No memory of save date, occasion, or why saved.   │
│ 2. MONETARY OVER-INDEXATION: Every card leads with "% OFF" and struck-through price.  │
│ 3. PROACTIVE NUDGE FAILURE: "PRICE DROP BY ₹169" is the ONLY automated trigger.       │
│ 4. DISCOVERY DILUTION: Cashback credit-card banner sits directly above item #1.        │
│ 5. CATEGORY FILTERS ARE DUMB: "Shirts", "Kurtas" filter WHAT it is, not WHY saved.    │
│ 6. ACTION POLARITY: Only "Move to Bag" or "Delete" (both terminal); zero doubt tools. │
│ 7. MISSING PRODUCT SPEC JOIN: Garment specs are never joined to user purchase history. │
│ 8. DECISION ACCUMULATION: List ends with a motivational quote; no resolution tools.    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Root Cause Ladder
- **Level 1 (Symptom):** Saved items sit unbought for months.
- **Level 2 (Stated Blocker):** *"I'm not sure if this kurta will fit my shoulders."* (46.2% of named doubts).
- **Level 3 (Mechanism):** The wishlist stores the SKU and discards the question.
- **Level 4 (Join Failure):** Myntra possesses past size/return data, but never brings it to the saved card.
- **Level 5 (Root Cause):** **The shopper carries 100% of the risk of being wrong.** The rational move is *not to buy*.

---

## 3. Target User Personas & Segment Behaviors

Based on multi-source semantic clustering across 3,017 Myntra deliberation documents, four distinct user personas have been identified:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    MYNTRA SHOPPER PERSONAS                                       │
├──────────────────────────┬─────────────┬────────────┬──────────────────┬─────────────────────────┤
│ Persona                  │ Corpus Reach│ Theme Lift │ Dominant Doubt   │ Behavioral Workaround   │
├──────────────────────────┼─────────────┼────────────┼──────────────────┼─────────────────────────┤
│ 1. Fit-Hesitant Ananya   │    28.3%    │ 3.99x Fit  │ Size/Fit (84.5%) │ Searches YouTube Hauls  │
│ 2. Trust-Deficit Rohit   │    20.9%    │ 2.81x Trust│ Authenticity/Mat │ Checks Reddit / D2C site│
│ 3. Bulk-Orderer Priya    │     6.2%    │ 2.45x Ret. │ Return Hassle    │ Buys 2 sizes, returns 1 │
│ 4. Price-Sensitive Aman  │    18.5%    │ 2.10x Price│ Hidden Fees      │ Waits for festive sale  │
└──────────────────────────┴─────────────┴────────────┴──────────────────┴─────────────────────────┘
```

### Detailed Persona Profiles
1. **Fit-Hesitant Ananya (Primary Target — Highest Leverage):**
   - *Demographics:* Female, 24–32, Tier 1/2 urban shopper, buys ethnic wear & dresses.
   - *Friction:* Size charts vary across brands (e.g., Libas vs W vs Anouk). Fear of tight bust/shoulders.
   - *Current Workaround:* Looks up YouTube try-on reviews to judge drape on real bodies.
2. **Trust-Deficit Rohit (Secondary Target):**
   - *Demographics:* Male, 22–30, purchasing footwear or premium street brands.
   - *Friction:* Marketplace seller legitimacy, counterfeit fears, polyester vs cotton blending.
   - *Current Workaround:* Checks Reddit threads (`r/IndianFashionAddicts`) or brand D2C portal.

---

## 4. AI Discovery Engine System Architecture

The AI Discovery Engine is an autonomous multi-stage intelligence pipeline that harvests unstructured conversations, filters for decision signals, induces bottom-up taxonomies, and computes multi-attribute opportunity rankings.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                AI DISCOVERY ENGINE V2 PIPELINE                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 0: MULTI-SOURCE INGESTION (19,143 Documents Scraped)                                      │
│  ├── YouTube Data API v3: 7,705 comments under fashion hauls & try-on reviews                    │
│  ├── Google Play & Apple App Store: 5,082 reviews for com.myntra.android & iOS 907394059         │
│  ├── Reddit API / Apify: 1,632 discussions across r/IndianFashionAddicts, r/TwoXIndia            │
│  ├── Competitor Store Reviews: 4,571 reviews for AJIO & Nykaa Fashion                            │
│  └── Sitejabber: 153 long-form narrative reviews                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 1: HARSH RELEVANCE GATE (3,922 Relevant Documents Yielded / 20.5%)                         │
│  ├── Evaluates 8 Decision Signals (Wishlist intent, sizing doubt, comparison, expectation gap)   │
│  └── Rejects praise, app crashes, and generic delivery/refund logistics                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 2: BOTTOM-UP TAXONOMY INDUCTION (12 Canonical Themes)                                      │
│  ├── Zero pre-baked taxonomy; induced directly from clustered deliberation text                  │
│  └── Strict includes/excludes preventing abstract catch-all categories                           │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 3: MULTI-DIMENSIONAL TAGGING ENGINE                                                        │
│  ├── 5 Structured Facets: Intent Type (4), Journey Stage (5), Information Needs (12),             │
│  │   External Behaviors (7), User Segments (7), Severity Score (1-5)                             │
│  └── Verbatim Substring Assertion Gate: Discards non-literal quotes (87.5% verified coverage)   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 4: MATHEMATICAL OPPORTUNITY SCORING                                                        │
│  ├── OpportunityScore = √Reach_pre × SeverityNorm × MetricProximity × Tractability_non_monetary  │
│  ├── Wilson 95% Confidence Intervals for small-sample robustness                                 │
│  └── Dual Cohort Engine (Myntra Pure n=3,017 vs Full Corpus n=3,922)                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Mathematical Scoring & Prioritization Model

### 5.1 Opportunity Scoring Formulation
To prioritize product engineering investment, every friction theme is scored via a 4-factor multiplicative formula:

$$\text{Opportunity Score} = \sqrt{\text{Reach}_{\text{pre}}} \times \text{Severity}_{\text{norm}} \times \text{Metric Proximity} \times \text{Tractability}_{\text{non-monetary}}$$

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   THE 12 INDUCED THEMES RANKED                                   │
├────┬───────────────────────────────────────────┬─────────┬──────────┬──────────┬─────────────────┤
│ Rk │ Theme Name                                │ Reach   │ Severity │ Score    │ Strategic Fit   │
├────┼───────────────────────────────────────────┼─────────┼──────────┼──────────┼─────────────────┤
│ 1  │ Quality, Authenticity & Seller Trust      │  23.3%  │  4.41/5  │  0.256   │ Baseline Veto   │
│ 2  │ Unreliable Size & Fit Info                │  19.5%  │  4.12/5  │  0.248   │ Core MVP Focus  │
│ 3  │ Missing Product Specifications            │   8.6%  │  3.71/5  │  0.155   │ Quick Win       │
│ 4  │ Cumbersome Return & Exchange Policies     │   9.8%  │  4.38/5  │  0.149   │ Post-Purchase   │
│ 5  │ Misleading Visual Media                   │   7.9%  │  3.85/5  │  0.142   │ Media Upgrade   │
│ 6  │ Uncertain Stock & Availability Signals    │   2.7%  │  3.94/5  │  0.082   │ Inventory Sync  │
│ 7  │ Pre-Purchase Support Gaps                 │   2.7%  │  3.65/5  │  0.076   │ AI Chatbot      │
│ 8  │ Absent Social Proof                       │   2.1%  │  3.65/5  │  0.068   │ Photo Reviews   │
│ 9  │ Price Volatility & Hidden Checkout Fees   │   3.2%  │  3.90/5  │  0.045   │ Banned Lever    │
│ 10 │ Wishlist Interface Friction               │   0.9%  │  3.45/5  │  0.038   │ UI Bugfix       │
│ 11 │ Uncertain Delivery Timelines              │   0.9%  │  3.55/5  │  0.029   │ Logistics       │
│ 12 │ Passive Wishlist, No Re-engagement        │   0.3%  │  3.80/5  │  0.018   │ Re-engagement   │
└────┴───────────────────────────────────────────┴─────────┴──────────┴──────────┴─────────────────┘
```

---

## 6. Myntra Design Language (MDL) UI/UX Specifications

The AI Discovery Engine web application is styled according to Myntra's Design System tokens:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               MYNTRA DESIGN SYSTEM TOKENS                              │
├─────────────────────────┬──────────────┬───────────────────────────────────────────────┤
│ Token                   │ Hex Value    │ Usage                                         │
├─────────────────────────┼──────────────┼───────────────────────────────────────────────┤
│ `--brand-myntra`        │ `#ff3f6c`    │ Primary brand magenta, active states, CTA     │
│ `--brand-myntra-hover`  │ `#e02f5a`    │ Button hover, interactive focus               │
│ `--brand-myntra-light`  │ `#fff0f4`    │ Badge background, subtle selection highlight  │
│ `--text-primary`        │ `#282c3f`    │ Headings, primary table text, dark charcoal   │
│ `--text-secondary`      │ `#535766`    │ Body copy, descriptions, slate grey           │
│ `--text-muted`          │ `#94969f`    │ Captions, metadata, table headers             │
│ `--surface-1`           │ `#ffffff`    │ Cards, modal surfaces, table background       │
│ `--page`                │ `#f5f5f6`    │ Page body background                          │
│ `--border`              │ `#eaeaec`    │ Hairline card and table borders               │
│ `--good` (Verified)     │ `#03a685`    │ Verified quotes, high-confidence badges       │
│ `--warning` (Alert)     │ `#ff905a`    │ High severity indicators, urgency chips       │
└─────────────────────────┴──────────────┴───────────────────────────────────────────────┘
```

### 6.1 Dashboard Components
1. **Global KPI Metric Tiles:** 4 high-contrast cards displaying Tagged Corpus Count ($3,922$), Induced Frictions ($12$), Genuine Purchase Intent ($72.2\%$), and External Research Rate ($27.8\%$).
2. **Opportunity Matrix (2D Scatterplot):** Interactive SVG chart mapping Reach ($x$-axis) vs Severity ($y$-axis), sized by Metric Proximity and shaded by Tractability.
3. **Dual-Cohort Ranked Table:** Tabular view allowing one-click toggle between *All Sources ($n=3,922$)* and *Myntra-Pure ($n=3,017$)* to expose competitor skew.
4. **Segment Lift Heatmap:** $7 \times 12$ matrix displaying statistical lift values with instant cross-filter to the verbatim evidence drawer.
5. **Verbatim Evidence Drawer:** Live panel rendering verified literal quotes with source tags, star ratings, and documented user workarounds.
6. **Real-Time Classification Playground:** Interactive text input enabling evaluators to test custom text against the real Stage 1 & Stage 3 prompts.

---

## 7. API & Edge Microservice Specifications (`/api/classify`)

- **Route:** `POST /api/classify`
- **Latency Target:** $< 1.5\text{s}$ P95
- **Concurrency Model:** Parallel execution of Stage 1 (Relevance) and Stage 3 (Tagging) via `Promise.allSettled`.
- **Failover Architecture:** `gemini-3.7-flash` $\rightarrow$ `groq` (`llama-3.3-70b-versatile`).

```typescript
// Request Contract
interface ClassifyRequest {
  text: string; // 15 to 6000 characters
}

// Response Contract
interface ClassifyResponse {
  relevance: {
    relevant: boolean;
    relevance: number; // 0.0 - 1.0
    reason: string;
  };
  tag: {
    themes: Array<{ id: string; name: string; definition: string }>;
    severity: number; // 1 - 5
    journey_stage: "discover" | "shortlist" | "evaluate" | "checkout" | "post_purchase";
    intent_type: "genuine_intent" | "bookmark" | "price_watch" | "unclear";
    information_needs: string[];
    external_behaviour: string[];
    workaround: string;
    segment_signals: string[];
    evidence_quote: string;
    quote_verified: boolean;
    confidence: number;
  } | null;
}
```

---

## 8. Success Metrics & Guardrail Framework

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   METRICS & GUARDRAILS SPECIFICATION                                   │
├────┬─────────────────────────────┬────────────────────────────────────────┬─────────────┬──────────────┤
│ #  │ Metric Name                 │ Operational Definition                 │ Target      │ Rationale    │
├────┼─────────────────────────────┼────────────────────────────────────────┼─────────────┼──────────────┤
│ NS │ Net 30-Day Conversion (W30) │ Users buying saved item within 30d net │ +15% rel    │ North Star   │
│ L1 │ Intent-Capture Rate         │ Saves with explicit intent chip tapped │ ≥ 30%       │ Signal Input │
│ L2 │ Doubt-Card View Rate        │ Saved items where detail card opened   │ ≥ 40%       │ Reach Gate   │
│ L3 │ Doubt-Resolution Rate ⭐    │ Items bought or archived within 7d     │ 34% → 44%   │ Primary Lead │
│ L4 │ Decision Latency            │ Median days from save to decision      │ -25% days   │ Queue Speed  │
│ G1 │ Return Rate on Orders ⭐   │ Returns ÷ assisted orders               │ ≤ Control   │ Integrity    │
│ G2 │ PDP Save Rate               │ Wishlist adds ÷ PDP views              │ ≥ Ctrl - 2% │ Save Health  │
│ G3 │ Size Recommendation Accuracy│ Recommended sizes kept ÷ ordered       │ ≥ 75%       │ Trust Pillar │
│ G4 │ AOV & Units Per Order       │ Standard basket value                  │ Flat        │ Value Guard  │
│ G5 │ Card Render Latency         │ P95 time to generate resolution card   │ < 1.5s      │ Performance  │
└────┴─────────────────────────────┴────────────────────────────────────────┴─────────────┴──────────────┘
```

---

## 9. Rollout, A/B Experimentation & Release Plan

### 9.1 Experiment Design
- **Unit of Randomization:** User-level (Myntra User ID hash).
- **Target Population:** High-intent wishlisters ($100\%$ mobile app traffic on iOS and Android).
- **Sample Size & Duration:** $7,200$ users per arm; 8-week test window (4 weeks active cohort enrollment + 30-day conversion tracking).
- **Experiment Arms:**
  - *Arm A (Control):* Standard reverse-chronological wishlist.
  - *Arm B (Intent Capture Only):* Save-time intent chip selection.
  - *Arm C (Doubt Resolution / Verdict Card):* Sizing & fabric reassurance card.
  - *Arm D (Full Experience):* Intent Capture + Search Reconnection + Resolution Card.
