#!/bin/sh
# Rebuild JiheHan-NotoSerifCJKtc-subset-VF.woff2 from the full variable font.
# Add any new characters to subset-chars.txt first. Needs fontTools + brotli
# (python3 -m pip install fonttools brotli).
set -e
cd "$(dirname "$0")"
python3 -m fontTools.subset NotoSerifCJKtc-VF.otf \
  --text-file=subset-chars.txt \
  --layout-features='*' \
  --name-IDs='*' --name-legacy --name-languages='*' \
  --notdef-outline \
  --flavor=woff2 \
  --output-file=JiheHan-NotoSerifCJKtc-subset-VF.woff2
