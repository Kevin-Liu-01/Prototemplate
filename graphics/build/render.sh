#!/bin/zsh
# usage: render.sh [id ...]  (default: all in manifest)
export AGENT_BROWSER_SESSION=gtdocs
SP="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SP/build"
IDS=("$@"); if [ ${#IDS[@]} -eq 0 ]; then IDS=($(node -e "console.log(require('./manifest.json').map(m=>m.id).join(' '))")); fi
LASTW=0; LASTH=0
for id in $IDS; do
  read W H <<< "$(node -e "const m=require('./manifest.json').find(m=>m.id==='$id'); console.log(m.w, m.h)")"; DPR=$(node -e "console.log((7680/$W).toFixed(2))")
  if [ "$W" != "$LASTW" ] || [ "$H" != "$LASTH" ]; then agent-browser set viewport $W $H $DPR >/dev/null 2>&1; LASTW=$W; LASTH=$H; fi
  agent-browser open "http://127.0.0.1:8765/build/visuals/$id.html" >/dev/null 2>&1
  agent-browser wait --load networkidle >/dev/null 2>&1
  agent-browser wait --fn "document.fonts.status === 'loaded'" >/dev/null 2>&1
  agent-browser wait --fn "window.__centered === true" >/dev/null 2>&1
  echo "$id $(agent-browser eval "JSON.stringify(window.__centerDelta || null)" 2>/dev/null | tail -1)" >> "$SP/build/out/_center.log"
  agent-browser wait 350 >/dev/null 2>&1
  agent-browser screenshot "$SP/build/out/$id.png" 2>&1 | tail -1 | sed "s#$SP/build/out/##"
  python3 -c "from PIL import Image; p='$SP/build/out/$id.png'; im=Image.open(p); im.reduce(2).save(p, optimize=False)" 2>/dev/null || echo "downsample failed for $id"
done
