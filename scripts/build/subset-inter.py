#!/usr/bin/env python3
"""Split the rsms InterVariable roman and italic into unicode-range subsets (pnpm build:inter; needs fonttools and brotli)."""
import pathlib, re

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / 'public' / 'fonts'
OUT = FONTS / 'inter'
CSS = ROOT / 'src' / 'app' / 'inter-subsets.css'
FONTS_TS = ROOT / 'src' / 'lib' / 'fonts.ts'

# The two source files and the font-style each serves.
SOURCES = [('InterVariable', 'normal'), ('InterVariable-Italic', 'italic')]

# Google Fonts' ranges for Inter, made disjoint: a code point goes to the
# first subset that names it, and each face's unicode-range lists exactly the
# code points its file maps, so together they cover the full font's cmap.
# Every subset keeps all OpenType features and both axes (opsz, wght). latin
# also carries the symbols the shell and the docs draw beside latin text (the
# arrows, the search pill's command key, check, play, star, bullet, approx,
# less and greater or equal), so those pages need no symbols file. symbols
# takes every other code point the font maps.
SUBSETS = [
    ('latin', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, '
              'U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, '
              'U+2190-2199, U+2248, U+2264-2265, U+2318, U+25B6, U+25CF, U+2605, U+2713'),
    # Latin Extended-A out of latin-ext: the letters of the European locale
    # names the pages list (ł, ś, ğ, ő) in about a fifth of latin-ext's bytes
    ('latin-ext-a', 'U+0100-017F'),
    ('latin-ext','U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, '
                  'U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF'),
    ('vietnamese', 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, '
                   'U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB'),
    ('greek', 'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF'),
    ('greek-ext', 'U+1F00-1FFF'),
    ('cyrillic', 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116'),
    ('cyrillic-ext', 'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F'),
    # Inter maps alternates to the private use area; no text on the site uses them
    ('private-use', 'U+E000-F8FF'),
    ('symbols', None),
]

LINT_HATCH = '/* lint-type: allow a subset face of the family src/lib/fonts.ts declares */'


def parse(ranges):
    out = set()
    for part in ranges.split(','):
        lo, _, hi = part.strip()[2:].partition('-')
        out.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return out


def unicode_range(points):
    runs, start, prev = [], None, None
    for c in sorted(points):
        if prev is not None and c == prev + 1:
            prev = c
            continue
        if start is not None:
            runs.append((start, prev))
        start = prev = c
    runs.append((start, prev))
    return ', '.join(f'U+{a:04X}' if a == b else f'U+{a:04X}-{b:04X}' for a, b in runs)


def split(cmap):
    """The code points of each subset, in SUBSETS order, each set disjoint from the ones before it."""
    taken, out = set(), []
    for name, ranges in SUBSETS:
        points = (parse(ranges) & cmap if ranges else set(cmap)) - taken
        taken |= points
        if points:
            out.append((name, points))
    return out


def write_subset(src, dest, points):
    opts = subset.Options()
    opts.layout_features = ['*']
    opts.flavor = 'woff2'
    opts.notdef_outline = True
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.name_legacy = True
    # without glyph names (a format 3 post table) Chrome on macOS rasterizes
    # every glyph a shade differently from the full file
    opts.glyph_names = True
    font = subset.load_font(str(src), opts)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=points)
    sub.subset(font)
    subset.save_font(font, str(dest), opts)


def main():
    OUT.mkdir(exist_ok=True)
    for old in OUT.glob('*.woff2'):
        old.unlink()
    faces, latin_range = [], None
    for stem, style in SOURCES:
        src = FONTS / f'{stem}.woff2'
        for name, points in split(set(TTFont(src).getBestCmap())):
            dest = OUT / f'{stem}-{name}.woff2'
            write_subset(src, dest, points)
            print(f'{dest.relative_to(ROOT)}: {len(points)} code points, {dest.stat().st_size} bytes')
            if style == 'normal' and name == 'latin':
                latin_range = unicode_range(points)
                continue
            faces.append(
                '@font-face {\n'
                f'  font-family: ptInter; {LINT_HATCH}\n'
                f"  src: url('../../public/fonts/inter/{dest.name}') format('woff2');\n"
                '  font-weight: 100 900;\n'
                f'  font-style: {style};\n'
                '  font-display: swap;\n'
                f'  unicode-range: {unicode_range(points)};\n'
                '}\n'
            )
    CSS.write_text(
        '/* Generated by scripts/subset-inter.py (pnpm build:inter); do not edit.\n'
        '   The ptInter faces beside the roman latin subset that src/lib/fonts.ts\n'
        '   binds and preloads. A browser fetches a face only when the page draws\n'
        '   a code point in its unicode-range. */\n\n' + '\n'.join(faces)
    )
    # next/font reads only literals, so the latin range is written into the call
    source = FONTS_TS.read_text()
    updated, n = re.subn(r"(prop: 'unicode-range', value: ')[^']*(')", rf'\g<1>{latin_range}\g<2>', source)
    if n != 1:
        raise SystemExit(f"{FONTS_TS.relative_to(ROOT)}: expected one unicode-range declaration, found {n}")
    FONTS_TS.write_text(updated)
    print(f'{CSS.relative_to(ROOT)}: {len(faces)} faces; {FONTS_TS.relative_to(ROOT)}: the latin range')


if __name__ == '__main__':
    main()
