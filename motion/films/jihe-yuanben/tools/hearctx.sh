#!/bin/zsh
# Transcribes a short Mandarin take behind a carrier phrase (the zh2 take,
# 泰西利瑪竇口譯, which transcribes exactly on its own), so the speech-to-text
# pass locks onto Mandarin before it reaches a two- or four-syllable word.
# The words after 口译 in the transcript are the take's.
#   tools/hearctx.sh zh7b
cd "${0:A:h}/.."
for id in "$@"; do
  ffmpeg -v error -y -i audio/zh2.mp3 -f lavfi -t 0.45 -i anullsrc=r=44100:cl=mono -i audio/$id.mp3 \
    -filter_complex "[0:a]aresample=44100,aformat=channel_layouts=mono[a];[2:a]aresample=44100,aformat=channel_layouts=mono[c];[a][1:a][c]concat=n=3:v=0:a=1" audio/_ctx/$id.wav
  node kit/audio/el.mjs hear audio/_ctx/$id.wav | sed -n 2p | sed "s/^/$id: /"
done
