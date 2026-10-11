#!/usr/bin/env bash
# Transcribes short takes behind a carrier phrase, so the speech-to-text pass
# settles on the take's language before it reaches a word of one to six
# syllables. The carrier is a take of the same voice and language that
# transcribes exactly on its own; in each transcript, the words after the
# carrier's are the take's.
#
#   kit/sound/tones/hearctx.sh [--ctx <dir>] [--dry-run] <carrier.mp3> <take.mp3> ...
#
# Each take is joined after the carrier and 0.45 s of silence (44.1 kHz mono)
# into <ctx>/<take>.wav (default ctx: a _ctx folder beside the take) and heard
# with kit/audio/el.mjs, which alone reads the ElevenLabs key and writes
# <ctx>/<take>.stt.json (ledger.py's "behind the carrier"). The transcript is
# printed after the take's name. --dry-run builds the joined files and prints
# the el.mjs command instead of running it.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
EL="$HERE/../../audio/el.mjs"
ctx=""
dry=0
while [ $# -gt 0 ]; do
  case "$1" in
    --ctx) ctx="$2"; shift 2 ;;
    --dry-run) dry=1; shift ;;
    *) break ;;
  esac
done
if [ $# -lt 2 ]; then
  sed -n '2,15p' "$0"
  exit 2
fi
carrier="$1"
shift
for take in "$@"; do
  id="$(basename "${take%.*}")"
  dir="${ctx:-$(dirname "$take")/_ctx}"
  mkdir -p "$dir"
  ffmpeg -v error -y -i "$carrier" -f lavfi -t 0.45 -i anullsrc=r=44100:cl=mono -i "$take" \
    -filter_complex "[0:a]aresample=44100,aformat=channel_layouts=mono[a];[2:a]aresample=44100,aformat=channel_layouts=mono[c];[a][1:a][c]concat=n=3:v=0:a=1" "$dir/$id.wav"
  if [ "$dry" = 1 ]; then
    echo "$id: node $EL hear $dir/$id.wav"
    continue
  fi
  node "$EL" hear "$dir/$id.wav" | sed -n 2p | sed "s/^/$id: /"
done
