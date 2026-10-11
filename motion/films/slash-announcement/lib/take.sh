#!/bin/sh
# One narration take: lib/take.sh <line id> [audio/out.mp3]
# Reads the request texts from audio/lines.json, passes the neighbouring
# lines as --prev and --next, and records with kit/audio/el.mjs (the
# narrator is kit/audio/voice.json, Frederick Surrey). Copied from
# ../slash-partnership/lib/take.sh with this film's five lines (v2).
set -e
id="$1"
out="${2:-audio/vo-$id.mp3}"
order="1 3 6 7 8"
prev=""; next=""; found=0
for k in $order; do
  if [ "$found" = 1 ] && [ -z "$next" ]; then next="$k"; fi
  if [ "$k" = "$id" ]; then found=1; elif [ "$found" = 0 ]; then prev="$k"; fi
done
get() { node -e "const d=require('./audio/lines.json'); process.stdout.write(d[process.argv[1]])" "$1"; }
text="$(get "$id")"
if [ -n "$prev" ] && [ -n "$next" ]; then
  node kit/audio/el.mjs line "$out" "$text" --prev "$(get "$prev")" --next "$(get "$next")"
elif [ -n "$next" ]; then
  node kit/audio/el.mjs line "$out" "$text" --next "$(get "$next")"
else
  node kit/audio/el.mjs line "$out" "$text" --prev "$(get "$prev")"
fi
