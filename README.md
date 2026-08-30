# Wishlist Discovery Engine — Myntra

An AI discovery engine for the question: **what stands between "I saved this" and "I bought this"?**

Built for **Part 1** of a product-management case study whose business metric is *the percentage of
users who purchase at least one item from their wishlist within 30 days of adding it*, under a hard
constraint that no solution may use monetary incentives.

> **This repo is Part 1 (research/discovery) only.** The case study's submitted MVP — the Wishlist
> Search-Reconnection prototype — lives in a separate repo (`~/MVP_OPUS`, live at
> <https://wishlist-reconnection-prototype.vercel.app>) and is not built on top of this codebase.
> See `STATUS.md`'s "Direction change" section for why, and for the open items (interviews not yet
> run, Parts 5–7 not yet written) still blocking submission.

The engine mines public conversations, **induces** the frictions blocking wishlist purchases
bottom-up (no pre-baked list of e-commerce problems), quantifies each one, and ranks them so
opportunity areas can be **compared** rather than merely counted.

---

## Architecture

```
pipeline (runs locally, once)          artifacts               app (deployed)
─────────────────────────────          ─────────               ──────────────
sources → normalise → relevance   →  data/raw/*.json      →   dashboard (static read)
  → taxonomy induction → tagging  →  data/out/            →   /api/classify (live, 1 doc)
  → scoring → segmentation             analysis.json
                                       taxonomy.json
```

Free LLM tiers and serverless timeouts cannot survive analysing thousands of documents during a
live demo, so the expensive work runs **once, locally**, and commits its results. The deployed site
is a fast dashboard over that artifact **plus** a live endpoint that runs the real Stage 1 and
Stage 3 prompts against anything you paste — so the workflow is genuinely testable.

## Sources

| Source | Access | Notes |
|---|---|---|
| Google Play | no key | `com.myntra.android`, swept by newest / helpfulness / rating |
| Apple App Store | no key | app id `907394059`, IN + US storefronts, both sorts |
| Sitejabber | no key | long-form written reviews of myntra.com, read from its JSON-LD |
| Competitor apps | no key | AJIO + Nykaa Fashion, both stores — where comparison talk lives |
| YouTube | `YOUTUBE_API_KEY` | comments on haul, "is it worth it" and sizing-advice videos |
| Reddit | `APIFY_TOKEN` | Indian fashion/shopping communities, posts with their comment threads |

Sources with missing credentials are skipped with a warning rather than failing the run, and new
sources merge into the existing corpus on a re-run without reprocessing what is already done.

Store reviews supply volume; YouTube and Reddit supply depth. App-store text is dominated by
one-line ratings-bait, so only a few percent survives the relevance filter, whereas comment threads
under haul videos are where shoppers actually narrate deliberation at length.

**On Reddit specifically.** Two routes are implemented and either fills the same `reddit` source,
because they fail in different ways:

- **Apify** (`pipeline/sources/reddit-apify.ts`, used when `APIFY_TOKEN` is set) runs
  `trudax/reddit-scraper-lite` over Reddit's public pages. No Reddit account, but it bills per
  result — $3.40/1,000 against a $5/month free allowance — so `maxItems` is a spend cap and the
  Reddit slice of the corpus is budget-bounded, not exhaustive. Queries are global with
  `subreddit:` operators rather than per-community, since a global pass costs one billed run.
- **The official API** (`pipeline/sources/reddit.ts`) is the sanctioned route and free at this
  volume; it needs a free *script* app for `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET`. It searches
  10 named subreddits across 12 queries and walks the comment trees of the 220 comment-richest
  threads, so it reaches deeper than the budgeted Apify run when credentials exist.

Documents are hashed on their text, so the two routes dedupe against each other and switching
between them never double-counts.

**Deliberately excluded, and why:**

- **Social media (X, Instagram, Facebook)** — no free, terms-compliant public read exists. X's API
  is paid-only; Instagram and Facebook are closed to this access pattern. Excluded on feasibility,
  not oversight.
- **Trustpilot** — returns 403 to non-browser clients.
- **MouthShut** — no stable public listing id for Myntra.
- **Myntra's own product reviews and Q&A** — the endpoint requires authentication (401).

## Setup

```bash
npm install
cp .env.local.example .env.local   # then add at least one LLM key
```

| Key | Where to get it (all free, no card) |
|---|---|
| `GEMINI_API_KEY` | <https://aistudio.google.com/apikey> — primary analysis model |
| `GROQ_API_KEY` | <https://console.groq.com/keys> — fallback when Gemini rate-limits |
| `YOUTUBE_API_KEY` | Google Cloud Console → enable *YouTube Data API v3* |
| `APIFY_TOKEN` | <https://console.apify.com/settings/integrations> — Reddit; $5/month free, no card |
| `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | <https://www.reddit.com/prefs/apps> → create app → type **script**; alternative Reddit route, used only when `APIFY_TOKEN` is unset |

## Running the pipeline

```bash
npm run pipeline -- --stage ingest              # scrape everything (no LLM keys needed)
npm run pipeline -- --stage relevance --limit 200   # cheap rehearsal before spending quota
npm run pipeline -- --stage taxonomy            # induce themes, then REVIEW data/out/taxonomy.json
npm run pipeline -- --stage tag
npm run pipeline -- --stage score
npm run pipeline -- --stage all                 # everything, resuming from checkpoints
```

Useful flags: `--only apple,play` (restrict ingest to some sources), `--limit N` (sample the
corpus), `--force` (re-induce the taxonomy).

Every stage checkpoints to `data/out`, and every LLM response is cached on disk keyed by
model + prompt, so re-runs and crashes cost no quota. On a 429 the provider backs off, then falls
through from Gemini to Groq rather than stalling.

**Review `data/out/taxonomy.json` before running `--stage tag`.** Every downstream number inherits
those theme definitions, and the file is meant to be hand-edited.

## The score

```
OpportunityScore = √reach × severityNorm × metricProximity × tractability
```

- **reach** — share of relevant documents raising the theme, reported with a Wilson 95% interval so
  a theme seen four times cannot masquerade as a finding. Square-rooted: a theme twice as common is
  not twice as valuable, and without compression frequency dominates everything.
- **severityNorm** — mean severity (1–5) rescaled to 0–1.
- **metricProximity** — would resolving this actually move *this* metric within 30 days? Judged
  once per theme, with a written rationale.
- **tractability** — solvable in-product **without** monetary incentives. This is where the brief's
  hard constraint is encoded rather than hand-waved: a friction only fixable by discounting scores
  low no matter how loud it is.

Both judgements and their rationales are shown in the UI. A ranking you can argue with beats a
black box.

## Running the app

```bash
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Deploying

Push to a Git remote and import the repo on Vercel, or `npx vercel --prod`. Set `GEMINI_API_KEY`
and `GROQ_API_KEY` in the project's environment variables — the dashboard is static, but
`/api/classify` needs a key to run live.

`data/out/*.json` is committed on purpose: it is the reproducible artifact the deployed dashboard
reads, and it means the site builds without needing to re-run the analysis.

## Notes on rigour

- Prompts live in `pipeline/prompts/index.ts`, versioned in git.
- The tagger discards any "verbatim quote" that is not a literal substring of its source document,
  and any theme id outside the induced taxonomy.
- Themes with fewer than 5 supporting documents are excluded from the ranking.
- Percentages are computed against tagged relevant documents, never the raw scrape.
- Public reviews over-represent the frustrated; segments are inferred from text, not account data.
  Both limits are stated in the dashboard's methodology panel.
