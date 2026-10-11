#!/bin/sh
# Rebuild JWHan-NotoSerifCJKtc-subset-VF.woff2 from the full Noto Serif CJK TC
# variable font that the jihe-yuanben film ships (read only; OFL 1.1). The
# subset holds every CJK character in BRIEF.md, SCRIPT.md and CONCEPT.md plus
# the film's own strings (subset-chars.txt). Needs fontTools + brotli.
set -e
cd "$(dirname "$0")"
python3 -m fontTools.subset ../../jihe-yuanben/fonts/NotoSerifCJKtc-VF.otf \
  --text-file=subset-chars.txt \
  --layout-features='*' \
  --name-IDs='*' --name-legacy --name-languages='*' \
  --notdef-outline \
  --flavor=woff2 \
  --output-file=JWHan-NotoSerifCJKtc-subset-VF.woff2
