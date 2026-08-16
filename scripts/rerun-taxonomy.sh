#!/bin/zsh
#
# Re-induce the friction taxonomy as soon as free-tier quota returns.
#
# Taxonomy only — tagging is deliberately NOT run, because the themes need a
# human read before 3,575 documents are tagged against them.
#
#   nohup ./scripts/rerun-taxonomy.sh > /dev/null 2>&1 &
#
# Progress: data/taxonomy-rerun.log
#
set -u
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

LOG="data/taxonomy-rerun.log"
say() { print -r -- "[$(date '+%Y-%m-%d %H:%M:%S %Z')] $*" >> "$LOG"; }

set -a; source .env.local 2>/dev/null; set +a

# Poll rather than sleep to a computed deadline. Sleeping blindly assumes the
# reset boundary is where you think it is; polling just asks. It also recovers
# automatically if the window opens early or the machine was asleep.
probe() {
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
    "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL:-gemini-3.7-flash}:generateContent" \
    -H "x-goog-api-key: ${GEMINI_API_KEY}" -H 'content-type: application/json' \
    -d '{"contents":[{"role":"user","parts":[{"text":"ok"}]}]}' 2>/dev/null)
  [[ "$code" == "200" ]]
}

say "=== taxonomy rerun armed ==="

# 13 hours of 10-minute polls comfortably covers the wait to midnight Pacific.
for attempt in {1..78}; do
  if probe; then
    say "quality-tier quota available (poll $attempt) — starting"
    break
  fi
  [[ $attempt -eq 1 ]] && say "quota still exhausted; polling every 10 minutes"
  [[ $((attempt % 6)) -eq 0 ]] && say "still waiting (poll $attempt)"
  sleep 600
done

if ! probe; then
  say "ABORT: quota never became available within the polling window"
  exit 1
fi

BEFORE=$(stat -f %m data/out/taxonomy.json 2>/dev/null || echo 0)

say "re-inducing taxonomy"
npm run pipeline -- --stage taxonomy --force >> "$LOG" 2>&1

AFTER=$(stat -f %m data/out/taxonomy.json 2>/dev/null || echo 0)

# Verify the artifact, not the exit code — a stage that fails and leaves the
# previous file in place looks identical to one that succeeded.
if [[ "$BEFORE" == "$AFTER" ]]; then
  say "FAILED: no new taxonomy written. The old file is untouched."
  exit 1
fi

COUNT=$(node -e 'try{console.log(require("./data/out/taxonomy.json").themes.length)}catch(e){console.log(0)}')
if [[ "$COUNT" -lt 8 ]]; then
  say "FAILED: only $COUNT themes — induction looks broken"
  exit 1
fi

say "=== SUCCESS: $COUNT themes ==="
node -e '
const t = require("./data/out/taxonomy.json");
for (const x of t.themes) {
  console.log("- " + x.name);
  console.log("    " + x.definition.replace(/\s+/g, " "));
}
' >> "$LOG" 2>&1

say "tagging deliberately NOT run — review the themes first"
