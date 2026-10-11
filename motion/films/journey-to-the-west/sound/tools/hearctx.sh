#!/bin/zsh
# Transcribes a short Mandarin take behind a carrier phrase, so the speech-to-text
# pass locks onto Mandarin before it reaches a one- to six-syllable word.
# The carrier is Yun's 泰西，利瑪竇，口譯 from jihe-yuanben (read only; it
# transcribes exactly on its own). The words after 口译 in the transcript are the take's.
# After jihe-yuanben's tools/hearctx.sh.
#   sound/tools/hearctx.sh r01 r02
cd "${0:A:h}/.."
CARRIER=../../jihe-yuanben/audio/zh2.mp3
for id in "$@"; do
  ffmpeg -v error -y -i $CARRIER -f lavfi -t 0.45 -i anullsrc=r=44100:cl=mono -i takes/$id.mp3 \
    -filter_complex "[0:a]aresample=44100,aformat=channel_layouts=mono[a];[2:a]aresample=44100,aformat=channel_layouts=mono[c];[a][1:a][c]concat=n=3:v=0:a=1" _ctx/$id.wav
  node ../kit/audio/el.mjs hear _ctx/$id.wav | sed -n 2p | sed "s/^/$id: /"
done
