#!/bin/zsh
#
# Unattended completion of the discovery-engine pipeline.
#
# Sleeps until the free-tier quotas reset (midnight US Pacific, plus a
# buffer), then drives every remaining stage to completion and redeploys.
#
# Written to survive this terminal closing: launch it with nohup and it keeps
# going on its own. Everything it does is resumable, so if quota runs out
# again mid-way it stops cleanly with partial results and the next run picks
# up from the on-disk cache at no cost.
#
#   nohup ./scripts/resume-run.sh > /dev/null 2>&1 &
#
set -u
cd "$(dirname "$0")/.."

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
LOG="data/resume-run.log"
mkdir -p data

say() { print -r -- "[$(date '+%Y-%m-%d %H:%M:%S %Z')] $*" >> "$LOG"; }

tagged_count() { node -e 'try{console.log(require("./data/out/tags.json").length)}catch(e){console.log(0)}'; }
classified_count() { node -e 'try{console.log(require("./data/out/relevance.json").length)}catch(e){console.log(0)}'; }
corpus_count() { node -e 'try{console.log(require("./data/out/corpus.json").docs.length)}catch(e){console.log(0)}'; }
relevant_count() {
  node -e 'try{const r=require("./data/out/relevance.json");console.log(r.filter(x=>x.relevant&&x.relevance>=0.6).length)}catch(e){console.log(0)}'
}

# ---------------------------------------------------------------- wait

# Probe first: quotas may already have reset. Sleeping blindly until the next
# boundary once cost most of a day when the window was in fact already open.
say "=== resume-run started ==="

probe_quota() {
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_BULK:-gemini-3.1-flash-lite}:generateContent" \
    -H "x-goog-api-key: ${GEMINI_API_KEY}" -H 'content-type: application/json' \
    -d '{"contents":[{"role":"user","parts":[{"text":"ok"}]}]}')
  [[ "$code" == "200" ]]
}

set -a; source .env.local 2>/dev/null; set +a

if probe_quota; then
  say "quota already available — starting immediately"
else
  WAIT=$(TZ=America/Los_Angeles python3 -c "
import datetime
now = datetime.datetime.now()
target = datetime.datetime.combine(now.date() + datetime.timedelta(days=1), datetime.time(0, 10))
print(int((target - now).total_seconds()))
")
  say "quota exhausted — sleeping ${WAIT}s until reset (00:10 US Pacific)"
  sleep "$WAIT"
  say "quota window open — starting"
fi

# ------------------------------------------------------- run a stage
#
# Each stage is retried in passes. A pass that adds nothing means the quota
# is gone again, so two barren passes in a row ends that stage rather than
# spinning. Progress is measured by artifact growth, not by exit code —
# stages exit 0 even when individual batches were rate-limited.

run_passes() {
  local stage=$1 counter=$2 target=$3 max_passes=$4
  local before after barren=0

  for pass in {1..$max_passes}; do
    before=$($counter)
    npm run pipeline -- --stage "$stage" >> "$LOG" 2>&1
    after=$($counter)
    say "$stage pass $pass: $before -> $after (target $target)"

    if [[ $after -ge $target ]]; then
      say "$stage complete"
      return 0
    fi
    if [[ $after -le $before ]]; then
      barren=$((barren + 1))
      if [[ $barren -ge 2 ]]; then
        say "$stage stalled at $after/$target — quota exhausted, stopping this stage"
        return 1
      fi
      sleep 120
    else
      barren=0
      sleep 20
    fi
  done
  say "$stage hit the pass limit at $after/$target"
  return 1
}

# ------------------------------------------------------------ stage 1

CORPUS=$(corpus_count)
say "corpus: $CORPUS documents; $(classified_count) already classified"
run_passes relevance classified_count "$CORPUS" 40

RELEVANT=$(relevant_count)
say "relevant documents: $RELEVANT"

# ------------------------------------------------------------ stage 2
#
# Re-induced from scratch: the previous taxonomy was derived from an
# app-store-heavy subset and visibly lacked price, occasion and styling
# themes. The YouTube half of the corpus should surface them.

say "re-inducing taxonomy over the full relevant corpus"
npm run pipeline -- --stage taxonomy --force >> "$LOG" 2>&1
say "taxonomy: $(node -e 'try{console.log(require("./data/out/taxonomy.json").themes.length)}catch(e){console.log(0)}') themes"

# Tags are keyed to theme ids, so a new taxonomy invalidates every old tag.
if [[ -f data/out/tags.json ]]; then
  mv data/out/tags.json data/out/tags.superseded.json
  say "cleared tags from the previous taxonomy"
fi
rm -f data/out/judgements.json

# ------------------------------------------------------------ stage 3

run_passes tag tagged_count "$RELEVANT" 60

# ------------------------------------------------------------ stage 4

say "scoring"
if npm run pipeline -- --stage score >> "$LOG" 2>&1; then
  say "scoring complete"
else
  say "SCORING FAILED — stopping before deploy"
  exit 1
fi

# ----------------------------------------------------------- deploy

if [[ ! -f data/out/analysis.json ]]; then
  say "no analysis.json — nothing to deploy"
  exit 1
fi

say "building"
if ! npm run build >> "$LOG" 2>&1; then
  say "BUILD FAILED — not deploying"
  exit 1
fi

say "deploying to production"
vercel --prod --yes >> "$LOG" 2>&1 && say "deployed" || say "DEPLOY FAILED"

say "=== finished ==="
say "themes: $(node -e 'try{console.log(require("./data/out/analysis.json").themes.length)}catch(e){console.log(0)}') | tagged: $(tagged_count) | relevant: $(relevant_count) | corpus: $(corpus_count)"
