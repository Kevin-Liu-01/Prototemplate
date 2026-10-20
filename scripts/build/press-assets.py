#!/usr/bin/env python3
"""Copy the Katagami web fonts and the country flags the /press pages use.

The press sets Katagami Text for everything but code and figures,
Katagami Mono for those, and Katagami Serif for the word Atlas. Their Latin, Arabic and Devanagari slices are
copied as they are. The CJK companions are 1.5 to 3 MB
each, so each one is cut down to the Han, kana and Hangul characters that
appear in src/app/press, and the cut is written as Katagami<CJK>-press.woff2.
Run it again after adding CJK text to the press. The flags are the
flag-icons set gt-cloud's LocaleFlag draws (4x3 SVGs from node_modules),
copied into public/press/flags for the language picker.

Usage:
  KATAGAMI_SITE=<Katagami-Website checkout> python3 scripts/build/press-assets.py
  python3 scripts/build/press-assets.py <Katagami-Website checkout>

Requires: python3 with fontTools and brotli (pip install fonttools brotli).
Last real run: 2026-10-19, Press session.
"""

import os
import re
import shutil
import sys
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'fonts' / 'katagami'
FLAGS_OUT = ROOT / 'public' / 'press' / 'flags'
FLAGS_IN = ROOT / 'node_modules' / 'flag-icons' / 'flags' / '4x3'
# the language picker's countries: en us, es es, pt br, de de, ar eg, hi in, zh cn, ko kr, ja jp
FLAGS = ['us', 'es', 'br', 'de', 'eg', 'in', 'cn', 'kr', 'jp']
PRESS = ROOT / 'src' / 'app' / 'press'

COPY = [
    'KatagamiText.woff2',
    'KatagamiText-arabic.woff2',
    'KatagamiText-devanagari.woff2',
    'KatagamiSerif.woff2',
    'KatagamiMono.woff2',
]
CJK = ['KatagamiCJKJP.woff2', 'KatagamiCJKSC.woff2', 'KatagamiCJKKR.woff2']

# Han, kana, Hangul, CJK punctuation and fullwidth forms.
CJK_CHARS = re.compile('[　-ヿ㐀-䶿一-鿿가-힯＀-￯]')


def site_fonts() -> Path:
    arg = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('KATAGAMI_SITE')
    if not arg:
        sys.exit('press-fonts: pass the Katagami-Website checkout or set KATAGAMI_SITE')
    fonts = Path(arg).expanduser() / 'fonts'
    if not fonts.is_dir():
        sys.exit(f'press-fonts: no fonts folder in {arg}')
    return fonts


def press_text() -> str:
    chars = set()
    for path in PRESS.rglob('*'):
        if path.suffix in {'.ts', '.tsx', '.mdx'}:
            chars.update(CJK_CHARS.findall(path.read_text(encoding='utf-8')))
    return ''.join(sorted(chars))


def main() -> None:
    fonts = site_fonts()
    OUT.mkdir(parents=True, exist_ok=True)
    for name in COPY:
        shutil.copyfile(fonts / name, OUT / name)
    text = press_text()
    for name in CJK:
        options = subset.Options()
        options.flavor = 'woff2'
        options.layout_features = ['*']
        options.name_IDs = ['*']
        font = subset.load_font(str(fonts / name), options)
        subsetter = subset.Subsetter(options)
        subsetter.populate(text=text + ' ')
        subsetter.subset(font)
        target = OUT / name.replace('.woff2', '-press.woff2')
        subset.save_font(font, str(target), options)
    FLAGS_OUT.mkdir(parents=True, exist_ok=True)
    for code in FLAGS:
        shutil.copyfile(FLAGS_IN / f'{code}.svg', FLAGS_OUT / f'{code}.svg')
    sizes = {p.name: p.stat().st_size for p in sorted(OUT.glob('*.woff2'))}
    for name, size in sizes.items():
        print(f'{size:>9,}  {name}')
    print(f'{len(text)} CJK characters kept, {len(FLAGS)} flags copied')


if __name__ == '__main__':
    main()
