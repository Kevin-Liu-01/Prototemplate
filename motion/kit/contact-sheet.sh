#!/usr/bin/env bash
# GT motion kit: a film's contact sheet, the frame grid Kevin asked to keep
# for every film (2026-10-06): two frames a second, 384 px wide, eight to a
# row, 3 px white gaps, the whole film from its first frame. It writes a PNG
# for the record and a WebP for the web beside it.
#
# Usage: kit/contact-sheet.sh <film.mp4> <out-without-extension> [fps] [cols]
#   kit/contact-sheet.sh out/blog-designing-docs.mp4 out/sheets/blog-designing-docs
set -euo pipefail
in="$1"; out="$2"; fps="${3:-2}"; cols="${4:-8}"
mkdir -p "$(dirname "$out")"
dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$in")
frames=$(python3 -c "import math; print(math.ceil(float('$dur') * $fps))")
rows=$(python3 -c "import math; print(math.ceil($frames / $cols))")
ffmpeg -v error -y -i "$in" -vf "fps=$fps,scale=384:-1:flags=lanczos,tile=${cols}x${rows}:padding=3:color=white" -frames:v 1 "$out.png"
cwebp -quiet -q 88 "$out.png" -o "$out.webp"
echo "$out.png ($frames frames, ${cols}x${rows}) and $out.webp"
