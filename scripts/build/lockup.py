#!/usr/bin/env python3
"""Draw the General Translation logo lockup, the logo beside "General" over "Translation", from Katagami Text 400 as outlines.

Kevin, 2026-11-08: "remember the word mark of general translation text uses katagami text!" The name in the
lockup is Katagami Text at wght 400, tracked LOCKUP.tracking em (-0.049645 em, 101.67 units after each advance),
with the font's GPOS kerning at that instance (only T-r applies), every glyph as a path, so no page loads the face.
The numbers are measured on Kevin's wordmark file of 2026-11-12 and read from LOCKUP in src/lib/logo.ts; the
tracking is the least-squares fit of every glyph's position on both lines (shared pen origin, kerning at 400),
within 0.13 px of each glyph at the file's 295 px size. The construction, in the font's units (2048 per em) at the
name's size, with CAP the T's flat top:

  the name     "General" over "Translation", both lines from one pen origin (so the T's ink stands left of the
               G's), with R of white between the first baseline and the second cap line: RHYTHM CAP, about the cap
               height less the x-height
  the logo     LOGO (src/lib/logo.ts) by its drawn box, MARK CAP tall, centred on the name's ink box (the G's top
               to the foot of the a and the o)
  the gap      GAP CAP of white from the logo's ink to the name's leftmost ink, the T's

Writes, each from the same layout:
  public/brand/gt-globe-lockup.svg         the lockup in currentColor, cropped to its ink, for masks and inline use
  public/brand/gt-globe-lockup-light.svg   #070707 ink, and -dark.svg in #ffffff, for img tags
  public/brand/gt-globe-lockup.json        the numbers (cap, R, the boxes, the kerning applied); LOCKUP in
                                           src/lib/logo.ts and the globe rows read the same numbers, and
                                           pnpm test:marks holds them together
  public/marks/graticule/rows/name.svg     the name alone, its box from the logo's top to the name's ink foot and
                                           as wide as the name's ink, for the globe rows on /marks/graticule
  deck/parts/head.html                     the #gt-lockup symbol (run pnpm build:deck after it)

Usage:
  KATAGAMI_REPO=<Katagami checkout> python3 scripts/build/lockup.py     (pnpm build:lockup)

The font is Katagami Text, fonts/text/KatagamiText[wght].ttf in a Katagami checkout
(github.com/Kevin-Liu-01/Katagami, SIL Open Font License 1.1), instanced at wght 400. The written outlines are
committed, so the site builds without the checkout. GSUB is not applied: no default-feature lookup (rvrn, ccmp,
locl, rlig, liga, clig, calt, rclt) substitutes in these two words, which the build checks and refuses otherwise.

Requires: python3 with fontTools (pip install fonttools).
Last real run: 2026-11-12, Prototemplate session (the refined lockup: 400, -0.049645 em, pen origin).
"""
import json
import os
import re
import sys
from pathlib import Path

# --help prints the docstring before fontTools is needed
if {'--help', '-h'} & set(sys.argv[1:]):
    print(__doc__)
    sys.exit(0)

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[2]
NAME = ('General', 'Translation')
WGHT = 400


def lockup_number(field):
    """One number of LOCKUP in src/lib/logo.ts (pure data), so the build and the site read one value."""
    block = re.search(r'export const LOCKUP = \{(.*?)\n\} as const;', (ROOT / 'src/lib/logo.ts').read_text(), re.S).group(1)
    return float(re.search(rf'\n  {field}: (-?[0-9.]+),', block).group(1))


TRACK_EM = lockup_number('tracking')  # letter-spacing after each advance in em (fitted on Kevin's wordmark, 2026-11-12)
RHYTHM = lockup_number('rhythm')  # caps of white between the first baseline and the second cap line (Kevin's wordmark: 265 px pitch at a 205.981 px cap); within 0.3 units of the cap height less the x-height
MARK = lockup_number('mark')  # the logo's height in caps, centred on the name's ink box (Kevin's wordmark: 487 / 205.981)
GAP = lockup_number('gap')  # caps of white from the logo's ink to the name's leftmost ink (Kevin's wordmark: 120 / 205.981)
DEFAULT_GSUB = ('rvrn', 'ccmp', 'locl', 'rlig', 'liga', 'clig', 'calt', 'rclt')


def num(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def r4(v):
    return round(float(v), 4)


def logo():
    """LOGO's path and drawn box, read from src/lib/logo.ts (pure data, one quoted string each)."""
    text = (ROOT / 'src/lib/logo.ts').read_text()
    d = re.search(r"\n  d: '([^']+)'", text).group(1)
    box = [float(v) for v in re.search(r"\n  viewBox: '([^']+)'", text).group(1).split()]
    fill_rule = re.search(r"\n  fillRule: '([^']+)'", text).group(1)
    return d, box, fill_rule


def font_path():
    repo = os.environ.get('KATAGAMI_REPO') or (sys.argv[1] if len(sys.argv) > 1 else '')
    if not repo:
        sys.exit('lockup: set KATAGAMI_REPO to a Katagami checkout (its fonts/text/KatagamiText[wght].ttf is read)')
    path = Path(repo).expanduser() / 'fonts' / 'text' / 'KatagamiText[wght].ttf'
    if not path.exists():
        sys.exit(f'lockup: {path} is missing')
    return path


def lookups(table, features):
    recs = {r.ScriptTag: r.Script for r in table.ScriptList.ScriptRecord}
    script = recs.get('latn') or recs.get('DFLT')
    out = set()
    for fi in script.DefaultLangSys.FeatureIndex:
        rec = table.FeatureList.FeatureRecord[fi]
        if rec.FeatureTag in features:
            out.update(rec.Feature.LookupListIndex)
    return sorted(out)


def subtables(lookup, ext_type):
    for st in lookup.SubTable:
        if lookup.LookupType == ext_type:
            yield st.ExtensionLookupType, st.ExtSubTable
        else:
            yield lookup.LookupType, st


def gsub_hits(font, glyphs):
    """Single, multiple, alternate and ligature lookups of the default features that would substitute here. Context
    lookups are reported when their first coverage holds a glyph, so a font update that adds one stops the build."""
    gsub = font['GSUB'].table
    hits = []
    for li in lookups(gsub, DEFAULT_GSUB):
        for t, st in subtables(gsub.LookupList.Lookup[li], 7):
            for i, g in enumerate(glyphs):
                if t in (1, 2, 3):
                    cov = getattr(st, 'mapping', None) or getattr(st, 'alternates', {})
                    if g in cov:
                        hits.append((li, t, g))
                elif t == 4:
                    for lig in st.ligatures.get(g, []):
                        if glyphs[i + 1:i + 1 + len(lig.Component)] == list(lig.Component):
                            hits.append((li, t, g))
                elif t in (5, 6):
                    first = (st.InputCoverage[0] if t == 6 else st.Coverage[0]) if st.Format == 3 else st.Coverage
                    if g in first.glyphs and st.Format != 3:
                        hits.append((li, t, g))
                    elif st.Format == 3:
                        inp = [set(c.glyphs) for c in (st.InputCoverage if t == 6 else st.Coverage)]
                        ok = i + len(inp) <= len(glyphs) and all(glyphs[i + k] in inp[k] for k in range(len(inp)))
                        if t == 6 and ok:
                            back = [set(c.glyphs) for c in st.BacktrackCoverage]
                            ahead = [set(c.glyphs) for c in st.LookAheadCoverage]
                            ok = all(i - 1 - k >= 0 and glyphs[i - 1 - k] in back[k] for k in range(len(back)))
                            j = i + len(inp)
                            ok = ok and j + len(ahead) <= len(glyphs) and all(glyphs[j + k] in ahead[k] for k in range(len(ahead)))
                        if ok:
                            hits.append((li, t, g))
    return hits


def kerning(font, glyphs):
    """The XAdvance after each glyph from GPOS kern pair lookups (PairPos 1 and 2, through extensions), applied in
    lookup order the way HarfBuzz applies them, and the pairs that moved."""
    gpos = font['GPOS'].table
    adv = [0] * len(glyphs)
    place = [0] * len(glyphs)
    applied = []
    for li in lookups(gpos, ('kern',)):
        lk = gpos.LookupList.Lookup[li]
        i = 0
        while i < len(glyphs) - 1:
            a, b = glyphs[i], glyphs[i + 1]
            hit = None
            for t, st in subtables(lk, 9):
                if t != 2 or a not in st.Coverage.glyphs:
                    continue
                if st.Format == 1:
                    ps = st.PairSet[st.Coverage.glyphs.index(a)]
                    rec = next((r for r in ps.PairValueRecord if r.SecondGlyph == b), None)
                    if rec is None:
                        continue
                    hit = (rec.Value1, rec.Value2, st.ValueFormat2)
                else:
                    r = st.Class1Record[st.ClassDef1.classDefs.get(a, 0)].Class2Record[st.ClassDef2.classDefs.get(b, 0)]
                    hit = (r.Value1, r.Value2, st.ValueFormat2)
                break
            if not hit:
                i += 1
                continue
            v1, v2, vf2 = hit
            dx = (getattr(v1, 'XAdvance', 0) or 0) if v1 is not None else 0
            adv[i] += dx
            place[i] += (getattr(v1, 'XPlacement', 0) or 0) if v1 is not None else 0
            if v2 is not None:
                adv[i + 1] += getattr(v2, 'XAdvance', 0) or 0
                place[i + 1] += getattr(v2, 'XPlacement', 0) or 0
            if dx:
                applied.append({'left': a, 'right': b, 'units': dx})
            i += 2 if vf2 else 1
    return adv, place, applied


class Type:
    def __init__(self, path):
        full = TTFont(str(path))
        cmap = full.getBestCmap()
        for word in NAME:
            hits = gsub_hits(full, [cmap[ord(c)] for c in word])
            if hits:
                sys.exit(f'lockup: a default GSUB lookup substitutes in "{word}": {hits}; shape it before drawing')
        self.font = instancer.instantiateVariableFont(full, {'wght': WGHT})
        self.version = self.font['name'].getDebugName(5)
        self.cmap = self.font.getBestCmap()
        self.gs = self.font.getGlyphSet()
        self.hmtx = self.font['hmtx']
        self.upm = self.font['head'].unitsPerEm
        self.track = TRACK_EM * self.upm
        self.cap = self.bounds('T')[3]
        self.xheight = self.bounds('x')[3]
        # the white between the first baseline and the second cap line, about the cap height less the x-height
        self.rhythm = RHYTHM * self.cap

    def bounds(self, g):
        pen = BoundsPen(self.gs)
        self.gs[g].draw(pen)
        return pen.bounds

    def d(self, g, ox, oy):
        pen = SVGPathPen(self.gs, ntos=num)
        self.gs[g].draw(TransformPen(pen, (1, 0, 0, -1, ox, oy)))
        return pen.getCommands()


class Line:
    """One word on one baseline (SVG y down) from a pen origin, kerned and tracked."""

    def __init__(self, T, text, base, origin):
        self.T, self.base = T, base
        glyphs = [T.cmap[ord(c)] for c in text]
        adv, place, self.kerns = kerning(T.font, glyphs)
        self.items, x = [], 0
        for g, a, p in zip(glyphs, adv, place):
            self.items.append((g, origin + x + p))
            x += T.hmtx[g][0] + a + T.track

    def box(self):
        xs, ys = [], []
        for g, x in self.items:
            b = self.T.bounds(g)
            xs += [x + b[0], x + b[2]]
            ys += [self.base - b[3], self.base - b[1]]
        return min(xs), min(ys), max(xs), max(ys)

    def d(self, dx, dy):
        return ''.join(self.T.d(g, x + dx, self.base + dy) for g, x in self.items)


def layout(T, logo_box):
    """Every part in one system: "General"'s baseline at y 0, the logo's left ink at x 0, both lines from one pen
    origin."""
    cap, r = T.cap, T.rhythm
    h = MARK * cap
    k = h / logo_box[3]
    width = logo_box[2] * k
    # the pen origin: the name's leftmost ink (the first letter of either line) GAP CAP right of the logo's ink
    first = min(T.bounds(T.cmap[ord(word[0])])[0] for word in NAME)
    origin = width + GAP * cap - first
    l1, l2 = Line(T, NAME[0], 0.0, origin), Line(T, NAME[1], cap + r, origin)
    b1, b2 = l1.box(), l2.box()
    mid = (min(b1[1], b2[1]) + max(b1[3], b2[3])) / 2
    top = mid - h / 2
    globe = {'box': (0.0, top, width, top + h), 'k': k, 'tx': -logo_box[0] * k, 'ty': top - logo_box[1] * k}
    return globe, l1, l2


def svg(view, body, fill, label='General Translation'):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(num(v) for v in view)}" fill="{fill}" '
            f'role="img" aria-label="{label}">{body}</svg>\n')


def main():
    T = Type(font_path())
    d, logo_box, fill_rule = logo()
    globe, l1, l2 = layout(T, logo_box)
    b1, b2 = l1.box(), l2.box()
    name = (min(b1[0], b2[0]), min(b1[1], b2[1]), max(b1[2], b2[2]), max(b1[3], b2[3]))
    g = globe['box']
    ink = (g[0], min(g[1], name[1]), name[2], max(g[3], name[3]))
    dx, dy = -ink[0], -ink[1]
    globe_path = (f'<path transform="translate({num(globe["tx"] + dx)} {num(globe["ty"] + dy)}) scale({globe["k"]:.6f})" '
                  f'fill-rule="{fill_rule}" d="{d}"/>')
    name_path = f'<path d="{l1.d(dx, dy)}{l2.d(dx, dy)}"/>'
    view = (0, 0, ink[2] - ink[0], ink[3] - ink[1])
    brand = ROOT / 'public' / 'brand'
    for file, fill in (('gt-globe-lockup.svg', 'currentColor'), ('gt-globe-lockup-light.svg', '#070707'),
                       ('gt-globe-lockup-dark.svg', '#ffffff')):
        (brand / file).write_text(svg(view, globe_path + name_path, fill))
        print(f'lockup: public/brand/{file}')

    # the globe rows' name: its box starts at the logo's top, so it sits level with the rings beside it
    ndx, ndy = -name[0], -g[1]
    rows_view = (0, 0, name[2] - name[0], name[3] - g[1])
    (ROOT / 'public/marks/graticule/rows/name.svg').write_text(
        svg(rows_view, f'<path d="{l1.d(ndx, ndy)}{l2.d(ndx, ndy)}"/>', 'currentColor'))
    print('lockup: public/marks/graticule/rows/name.svg')

    # the deck's symbol, beside #gt-mark
    head_file = ROOT / 'deck/parts/head.html'
    head = head_file.read_text()
    symbol = f'<symbol id="gt-lockup" viewBox="{" ".join(num(v) for v in view)}">{globe_path}{name_path}</symbol>'
    pattern = re.compile(r'<symbol id="gt-lockup" viewBox="[^"]*">.*?</symbol>', re.S)
    if pattern.search(head):
        head = pattern.sub(lambda _: symbol, head)
    else:
        anchor = re.search(r'<symbol id="gt-mark" viewBox="[^"]*"><path[^>]*/></symbol>', head)
        if not anchor:
            sys.exit('lockup: deck/parts/head.html has no #gt-mark symbol to write beside')
        head = head[:anchor.end()] + symbol + head[anchor.end():]
    head_file.write_text(head)
    print('lockup: deck/parts/head.html #gt-lockup')

    cap, r = T.cap, T.rhythm
    span = 2 * cap + r

    def box(b, ox=dx, oy=dy):
        return {'x': r4(b[0] + ox), 'y': r4(b[1] + oy), 'w': r4(b[2] - b[0]), 'h': r4(b[3] - b[1])}

    metrics = {
        'font': f'Katagami Text {T.version}, wght {WGHT}, letter-spacing {TRACK_EM} em, GPOS kerning, as outlines',
        'units': "Katagami Text font units (2048 per em) at the name's size",
        'cap': r4(cap),
        'xHeight': r4(T.xheight),
        'rhythm': r4(r),
        'rhythmInCaps': r4(r / cap),
        'spanInCaps': r4(span / cap),
        'markInCaps': MARK,
        'gapInCaps': GAP,
        'trackingEm': TRACK_EM,
        'align': 'pen',
        'penOrigin': r4(l1.items[0][1] + dx),
        'viewBox': [r4(v) for v in view],
        'capLine': r4(-cap + dy),
        'baselines': [r4(l1.base + dy), r4(l2.base + dy)],
        'mark': box(g),
        'name': box(name),
        'letters': {w: [[gl, r4(x + dx)] for gl, x in L.items] for w, L in zip(NAME, (l1, l2))},
        'kerns': {w: L.kerns for w, L in zip(NAME, (l1, l2))},
        'rows': {'viewBox': [r4(v) for v in rows_view], 'nameWidthInGlobes': r4((name[2] - name[0]) / (g[3] - g[1])),
                 'nameAspect': r4((name[2] - name[0]) / (name[3] - g[1]))},
    }
    (brand / 'gt-globe-lockup.json').write_text(json.dumps(metrics, indent=1) + '\n')
    print('lockup: public/brand/gt-globe-lockup.json')
    print('cap %.2f R %.2f (%.4f cap) span %.4f cap, mark %.4f cap, gap %.4f cap, rows name %.4f globes, aspect %.4f' % (
        cap, r, r / cap, span / cap, MARK, GAP, metrics['rows']['nameWidthInGlobes'], metrics['rows']['nameAspect']))


if __name__ == '__main__':
    main()
