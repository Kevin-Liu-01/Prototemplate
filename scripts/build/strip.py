#!/usr/bin/env python3
"""Draw the four-globe lockup: three graticule globes, the logo, then "General" over "Translation".

The strip reads left to right as the logo's construction: a whole graticule, the graticule with its meridian
opened where the G will open, the graticule without its polar arcs, then the logo itself. Every globe is drawn
from the logo's own geometry on the catalog's 256 unit square, centred on 128,128, in one 13.6 line weight with
butt ends:

  the ring       the circle of radius 96.9, whose outer edge is the logo's drawn box (24.3 to 231.7)
  the meridian   the ellipse rx 51.46, ry 96.9, the logo's meridian oval
  the latitude   the ellipse rx 96.9, ry 51.46, the logo's latitude oval
  the axis       the vertical line x 128 from pole to pole
  the equator    the horizontal line y 128 from the meridian's left side (x 76.54) to the ring on the right; its
                 left segment, inside the latitude's left end, is gone in every globe, where the G's mouth is
  the polar arcs two arcs of radius 90.1, the ring's inner edge, each touching the latitude oval's middle line
                 at its pole side: the north arc, centred 90.1 above the oval's top (128, -13.56), runs ring to
                 ring; the south arc, centred 90.1 below the oval's foot (128, 269.56), runs from the axis to
                 the ring on the right only

  globe 1  ring, meridian, latitude, axis, equator and both polar arcs
  globe 2  globe 1 with the meridian's right arc gone between its two crossings with the latitude oval
  globe 3  globe 2 without the polar arcs
  globe 4  LOGO (src/lib/logo.ts), unchanged

Each stroke is written as its outline (offset curves as cubic Beziers, circles as arcs) in one path with the
nonzero rule, like LOGO, so the files need no stroke and mask cleanly.

The name and the logo are laid out by lockup.py's own layout (the logo 1.1 times the name's span, centred on it,
and 0.8 cap height of white from the logo's ink to the G), so the strip's last globe and name are the stacked
lockup exactly. The three graticule globes stand to its left at the logo's size, BETWEEN globe diameters apart.

Writes:
  public/marks/graticule/strip/stage-1.svg .. stage-3.svg   globes 1 to 3 alone, currentColor, 256 square
  public/brand/gt-globe-strip.svg                           the four-globe lockup in currentColor, cropped to its ink
  public/brand/gt-globe-strip-light.svg, -dark.svg          #070707 ink and #ffffff
  public/brand/gt-globe-strip-accent.svg, -accent-lift.svg  the accent #2f5ce0 for paper, its lift #86a8ff for ink
  public/brand/gt-globe-strip.json                          the numbers; STRIP in src/lib/logo.ts reads them and
                                                            pnpm test:marks holds the two together

Usage:
  KATAGAMI_REPO=<Katagami checkout> python3 scripts/build/strip.py     (pnpm build:strip)

Requires: python3 with fontTools (pip install fonttools), as lockup.py does.
Last real run: 2026-11-10, Prototemplate session (the first strip).
"""
import json
import math
import sys
from pathlib import Path

if {'--help', '-h'} & set(sys.argv[1:]):
    print(__doc__)
    sys.exit(0)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lockup import GAP, NAME, ROOT, SPAN_SCALE, WGHT, Type, font_path, layout, logo, num, r4  # noqa: E402

BETWEEN = 0.22  # globe diameters of white between neighbouring globes, measured 0.223 on the reference strip
W = 13.6  # the logo's line weight
C = 128.0  # the centre of the 256 square
R = 96.9  # the ring's radius, to the middle of its line
M = 51.46  # the short radius of the meridian and latitude ovals
H = W / 2
P = R - H  # the polar arcs' radius: the ring's inner edge, 90.1
STEPS = 48  # cubic segments per whole ellipse offset
FILLS = (('', 'currentColor'), ('-light', '#070707'), ('-dark', '#ffffff'), ('-accent', '#2f5ce0'),
         ('-accent-lift', '#86a8ff'))


def f3(v):
    s = ('%.3f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


# A subpath is (start, [segments]) where a segment is ('L', end), ('C', c1, c2, end) or ('A', r, large, sweep, end).

def reverse(sub):
    start, segs = sub
    pts = [start] + [s[-1] for s in segs]
    out = []
    for i in range(len(segs) - 1, -1, -1):
        s, to = segs[i], pts[i]
        if s[0] == 'L':
            out.append(('L', to))
        elif s[0] == 'C':
            out.append(('C', s[2], s[1], to))
        else:
            out.append(('A', s[1], s[2], 1 - s[3], to))
    return (pts[-1], out)


def area(sub, n=16):
    """Signed area by sampling each segment, positive when the subpath turns clockwise on screen (y down)."""
    start, segs = sub
    pts, p = [start], start
    for s in segs:
        if s[0] == 'L':
            pts.append(s[1])
        elif s[0] == 'C':
            for i in range(1, n + 1):
                t = i / n
                pts.append(tuple((1 - t) ** 3 * p[k] + 3 * (1 - t) ** 2 * t * s[1][k] + 3 * (1 - t) * t * t * s[2][k] + t ** 3 * s[3][k]
                                 for k in range(2)))
        else:
            pts.append(s[4])  # arcs count by their ends only; circles and circle arcs are built clockwise
        p = s[-1]
    return sum(pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1] for i in range(len(pts) - 1)) / 2


def orient(sub, positive=True):
    return sub if (area(sub) > 0) == positive else reverse(sub)


def ellipse_point(rx, ry, t, d):
    """The point at parameter t on the ellipse rx, ry about the centre, offset d along its outward normal."""
    x, y = rx * math.cos(t), ry * math.sin(t)
    nx, ny = ry * math.cos(t), rx * math.sin(t)
    n = math.hypot(nx, ny)
    return (C + x + d * nx / n, C + y + d * ny / n)


def offset_curve(rx, ry, d, t0, t1):
    """The offset of an ellipse arc from t0 to t1 as Hermite cubics, STEPS to a whole turn."""
    count = max(2, math.ceil(abs(t1 - t0) / (2 * math.pi) * STEPS))
    segs, h = [], 1e-6
    ts = [t0 + (t1 - t0) * i / count for i in range(count + 1)]

    def deriv(t):
        a, b = ellipse_point(rx, ry, t - h, d), ellipse_point(rx, ry, t + h, d)
        return ((b[0] - a[0]) / (2 * h), (b[1] - a[1]) / (2 * h))

    for a, b in zip(ts, ts[1:]):
        pa, pb, da, db, k = ellipse_point(rx, ry, a, d), ellipse_point(rx, ry, b, d), deriv(a), deriv(b), (b - a) / 3
        segs.append(('C', (pa[0] + da[0] * k, pa[1] + da[1] * k), (pb[0] - db[0] * k, pb[1] - db[1] * k), pb))
    return ellipse_point(rx, ry, t0, d), segs


def closed_ellipse(rx, ry):
    """A whole ellipse stroke: the outer offset one way, the inner the other, so its middle stays open."""
    outer = offset_curve(rx, ry, H, 0, 2 * math.pi)
    inner = offset_curve(rx, ry, -H, 0, 2 * math.pi)
    return [orient(outer, True), orient(inner, False)]


def open_ellipse(rx, ry, t0, t1):
    """An ellipse arc from t0 to t1 with butt ends: outer offset forward, inner offset back."""
    start, outer = offset_curve(rx, ry, H, t0, t1)
    inner_start, inner = reverse(offset_curve(rx, ry, -H, t0, t1))
    segs = outer + [('L', inner_start)] + inner + [('L', start)]
    return [orient((start, segs), True)]


def circle(cx, cy, r):
    """A whole circle as two arcs, clockwise on screen."""
    return ((cx, cy - r), [('A', r, 0, 1, (cx, cy + r)), ('A', r, 0, 1, (cx, cy - r))])


def ring():
    return [circle(C, C, R + H), reverse(circle(C, C, R - H))]


def rect(x0, y0, x1, y1):
    return [((x0, y0), [('L', (x1, y0)), ('L', (x1, y1)), ('L', (x0, y1)), ('L', (x0, y0))])]


def circle_arc(cx, cy, r, a0, a1):
    """A stroke along the circle about cx, cy from angle a0 to a1 (radians, y down, a1 > a0), butt ends."""
    pt = lambda rad, a: (cx + rad * math.cos(a), cy + rad * math.sin(a))  # noqa: E731
    large = 1 if a1 - a0 > math.pi else 0
    o0, o1, i0, i1 = pt(r + H, a0), pt(r + H, a1), pt(r - H, a0), pt(r - H, a1)
    # with y down an increasing angle runs clockwise on screen, SVG's sweep 1
    segs = [('A', r + H, large, 1, o1), ('L', i1), ('A', r - H, large, 0, i0), ('L', o0)]
    return [(o0, segs)]


def ring_meet(cy, r):
    """Where the circle of radius r about (C, cy) crosses the ring's middle circle: y, and x to the right of C."""
    y = (R * R - r * r) / (2 * (cy - C)) + (C + cy) / 2
    return y, math.sqrt(R * R - (y - C) ** 2)


NORTH = C - M - P  # the north polar arc's centre: P above the latitude oval's top
SOUTH = C + M + P  # the south polar arc's centre: P below the latitude oval's foot


def polar_arcs():
    y, x = ring_meet(NORTH, P)
    left, right = math.atan2(y - NORTH, -x), math.atan2(y - NORTH, x)
    north = circle_arc(C, NORTH, P, right, left)  # the lower arc of the north circle, right to left through the bottom
    y, x = ring_meet(SOUTH, P)
    south = circle_arc(C, SOUTH, P, -math.pi / 2, math.atan2(y - SOUTH, x))  # from the axis to the ring on the right
    return north + south


def crossing():
    """The parameter where the meridian crosses the latitude oval, on its lower right."""
    k = 1 / math.sqrt(1 / M ** 2 + 1 / R ** 2)
    return math.atan2(k / R, k / M)


def stage(n):
    """Globe n of the strip (1 to 3) as subpaths."""
    t = crossing()
    meridian = closed_ellipse(M, R) if n == 1 else open_ellipse(M, R, t, 2 * math.pi - t)
    lines = rect(C - H, C - R, C + H, C + R) + rect(C - M, C - H, C + R, C + H)
    return ring() + meridian + closed_ellipse(R, M) + lines + (polar_arcs() if n < 3 else [])


def d_of(subs):
    out = []
    for start, segs in subs:
        out.append(f'M{f3(start[0])} {f3(start[1])}')
        for s in segs:
            if s[0] == 'L':
                out.append(f'L{f3(s[1][0])} {f3(s[1][1])}')
            elif s[0] == 'C':
                out.append('C' + ' '.join(f'{f3(p[0])} {f3(p[1])}' for p in s[1:]))
            else:
                out.append(f'A{f3(s[1])} {f3(s[1])} 0 {s[2]} {s[3]} {f3(s[4][0])} {f3(s[4][1])}')
        out.append('Z')
    return ''.join(out)


def svg(view, body, fill, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(num(v) for v in view)}" fill="{fill}" '
            f'role="img" aria-label="{label}">{body}</svg>\n')


def main():
    stages = [d_of(stage(n)) for n in (1, 2, 3)]
    out = ROOT / 'public/marks/graticule/strip'
    out.mkdir(parents=True, exist_ok=True)
    for n, d in enumerate(stages, 1):
        (out / f'stage-{n}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">'
            f'<path fill="currentColor" fill-rule="nonzero" d="{d}"/></svg>\n')
        print(f'strip: public/marks/graticule/strip/stage-{n}.svg')

    T = Type(font_path())
    logo_d, logo_box, fill_rule = logo()
    globe, l1, l2 = layout(T, logo_box)
    b1, b2 = l1.box(), l2.box()
    name = (min(b1[0], b2[0]), min(b1[1], b2[1]), max(b1[2], b2[2]), max(b1[3], b2[3]))
    g = globe['box']
    size = g[2] - g[0]
    pitch = size * (1 + BETWEEN)
    lefts = [g[0] - (3 - i) * pitch for i in range(4)]
    ink = (lefts[0], min(g[1], name[1]), name[2], max(g[3], name[3]))
    dx, dy = -ink[0], -ink[1]
    k = globe['k']
    parts = []
    for i, left in enumerate(lefts):
        tx = left + globe['tx'] - g[0] + dx
        d = stages[i] if i < 3 else logo_d
        rule = 'nonzero' if i < 3 else fill_rule
        parts.append(f'<path transform="translate({num(tx)} {num(globe["ty"] + dy)}) scale({k:.6f})" fill-rule="{rule}" d="{d}"/>')
    parts.append(f'<path d="{l1.d(dx, dy)}{l2.d(dx, dy)}"/>')
    view = (0, 0, ink[2] - ink[0], ink[3] - ink[1])
    label = 'General Translation'
    brand = ROOT / 'public' / 'brand'
    for suffix, fill in FILLS:
        (brand / f'gt-globe-strip{suffix}.svg').write_text(svg(view, ''.join(parts), fill, label))
        print(f'strip: public/brand/gt-globe-strip{suffix}.svg')

    cap = T.cap

    def box(b):
        return {'x': r4(b[0] + dx), 'y': r4(b[1] + dy), 'w': r4(b[2] - b[0]), 'h': r4(b[3] - b[1])}

    metrics = {
        'font': f'Katagami Text {T.version}, wght {WGHT}, letter-spacing 0, GPOS kerning, as outlines',
        'units': "Katagami Text font units (2048 per em) at the name's size",
        'cap': r4(cap),
        'markInCaps': r4(SPAN_SCALE * (2 * cap + T.rhythm) / cap),
        'gapInCaps': GAP,
        'betweenInGlobes': BETWEEN,
        'betweenInCaps': r4(BETWEEN * size / cap),
        'viewBox': [r4(v) for v in view],
        'marks': [box((left, g[1], left + size, g[3])) for left in lefts],
        'name': box(name),
        'stages': [f'/marks/graticule/strip/stage-{n}.svg' for n in (1, 2, 3)],
        'geometry': {'weight': W, 'ring': R, 'ovalShort': M, 'polarArcCentres': [r4(NORTH), r4(SOUTH)],
                     'polarArcRadius': r4(P), 'meridianOpensAt': r4(math.degrees(crossing()))},
        'lines': list(NAME),
    }
    (brand / 'gt-globe-strip.json').write_text(json.dumps(metrics, indent=1) + '\n')
    print('strip: public/brand/gt-globe-strip.json')
    print('globe %.4f cap, between %.2f globes (%.4f cap), gap %.2f cap, width %.4f cap' % (
        metrics['markInCaps'], BETWEEN, metrics['betweenInCaps'], GAP, view[2] / cap))


if __name__ == '__main__':
    main()
