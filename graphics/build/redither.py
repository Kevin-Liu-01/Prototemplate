#!/usr/bin/env python3
"""Re-screens a published Bayer ground at a finer cell, keeping its field, its dot colours and its backdrop.

Each ground is ordered dots over a smooth backdrop (a flat ink, a glow, or a lower tier of the same ramp). Over each
Bayer tile of the source, a pixel is a dot when it is brighter than the middle of the tile's range, and the tile shows
enough contrast to hold dots. The dot share over the tile is the tone; the mean colour of the dots and of the pixels
between them are the two inks. The window of the source is then sampled on the new cell grid, the tone thresholded
with the 4x4 Bayer screen, each cell takes its dot ink, and the pixels between dots take the smooth backdrop.

usage: redither.py <src> <out> <x0,y0,x1,y1 window in src px> <W>x<H> <cell px> [--src-cell N] [--invert]
                  [--hole x0,y0,x1,y1 ...] [--hole-all x0,y0,x1,y1 ...] [--hole-ring cx,cy,r0,r1 ...]
  --src-cell  the source's cell in px (measured from its runs when left out)
  --invert    dots are darker than the backdrop (a light ground)
  --hole      a box holding type or a mark set over the ground: its light, unsaturated pixels (and --reach px around them, default 3)
              are read from the ground around them instead
  --hole-all  a box read entirely from the ground around it (a mark that is not light)
  --hole-ring cx,cy,r0,r1: an annulus read from the ground around it (a drawn rim)
  --inks      #dot,#back: draw the screen in these two inks instead of the source's (a recoloured ground)
  --mirror    flip the ground left to right
  --clear     cx,cy,rx,ry,feather: fade the tone to nothing inside this ellipse (source px), over feather px at its rim
"""
import argparse
import numpy as np
from PIL import Image

BAYER = (np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) + 0.5) / 16
MIN_CONTRAST = 18


def box(a, r):
    """Mean over a (2r)x(2r) window centred on each pixel, edges clamped."""
    p = np.pad(a, r, mode='edge')
    s = np.pad(p.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    n = 2 * r
    h, w = a.shape
    return (s[n:n + h, n:n + w] - s[:h, n:n + w] - s[n:n + h, :w] + s[:h, :w]) / (n * n)


def extreme(a, r, fn):
    """Max or min over a (2r+1)x(2r+1) window, separable, edges clamped."""
    for ax in (0, 1):
        p = np.pad(a, [(r, r) if i == ax else (0, 0) for i in range(2)], mode='edge')
        n = a.shape[ax]
        out = np.take(p, range(0, n), axis=ax)
        for k in range(1, 2 * r + 1):
            out = fn(out, np.take(p, range(k, k + n), axis=ax))
        a = out
    return a


def sample(img, xs, ys):
    """Bilinear sample of a 2-D array at float pixel-centre coordinates."""
    h, w = img.shape
    x = np.clip(xs - 0.5, 0, w - 1.001)
    y = np.clip(ys - 0.5, 0, h - 1.001)
    x0, y0 = x.astype(int), y.astype(int)
    fx, fy = x - x0, y - y0
    a, b = img[y0, x0], img[y0, x0 + 1]
    c, d = img[y0 + 1, x0], img[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def src_cell(lum):
    """The most common run between brightness steps across the frame: the source cell."""
    runs = {}
    for row in lum[::max(1, lum.shape[0] // 200)]:
        d = np.flatnonzero(np.abs(np.diff(row)) > MIN_CONTRAST)
        for v in np.diff(d):
            if 0 < v < 24:
                runs[int(v)] = runs.get(int(v), 0) + 1
    return max(runs, key=runs.get)


def wmean(v, wt, r):
    """Mean of v weighted by wt around each pixel, widening the window where it holds no weight."""
    w = box(wt, r)
    out = box(v * wt, r) / np.maximum(w, 1e-6)
    rr = r
    while (w < 0.02).any() and rr < max(v.shape):
        rr *= 2
        miss = w < 0.02
        w2 = box(wt, rr)
        out = np.where(miss, box(v * wt, rr) / np.maximum(w2, 1e-6), out)
        w = np.where(miss, w2, w)
    return out


def pull_push(v, wt):
    """Fills where wt is 0 from the values around it, through a weighted image pyramid (smooth, no box seams)."""
    if min(v.shape) <= 2 or wt.min() > 0:
        return v
    h, w = v.shape
    H2, W2 = (h + 1) // 2, (w + 1) // 2
    pv = np.pad(v * wt, ((0, 2 * H2 - h), (0, 2 * W2 - w)))
    pw = np.pad(wt, ((0, 2 * H2 - h), (0, 2 * W2 - w)))
    sv = pv.reshape(H2, 2, W2, 2).sum((1, 3))
    sw = pw.reshape(H2, 2, W2, 2).sum((1, 3))
    coarse = pull_push(np.where(sw > 0, sv / np.maximum(sw, 1e-9), 0), np.minimum(sw, 1))
    ys = (np.arange(h) + 0.5) / 2 + 0.0
    xs = (np.arange(w) + 0.5) / 2 + 0.0
    up = sample(coarse, *np.meshgrid(xs, ys))
    return wt * v + (1 - wt) * up


def harmonic(v, known, iters=400):
    """Fills the unknown pixels of a smooth field: a pyramid guess, then Jacobi steps of Laplace's equation inside them."""
    f = pull_push(np.where(known > 0, v, 0), known)
    u = known == 0
    if not u.any():
        return f
    ys, xs = np.nonzero(u)
    y0, y1, x0, x1 = max(ys.min() - 1, 0), ys.max() + 2, max(xs.min() - 1, 0), xs.max() + 2
    g, m = f[y0:y1, x0:x1].copy(), u[y0:y1, x0:x1]
    for _ in range(iters):
        p = np.pad(g, 1, mode='edge')
        g = np.where(m, (p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 4, g)
    f[y0:y1, x0:x1] = g
    return f


def inks(a, wt, r):
    return np.stack([wmean(a[..., k], wt, r) for k in range(3)], axis=2)


def grow(m, r):
    return box(m.astype(float), r) > 0


def unknown_mask(a, holes, holes_all, rings, reach):
    u = np.zeros(a.shape[:2], bool)
    mx, mn = a.max(2), a.min(2)
    light = (a.mean(2) > 150) & (mx - mn < 60)
    for x0, y0, x1, y1 in holes:
        u[y0:y1, x0:x1] |= light[y0:y1, x0:x1]
    u = grow(u, reach)
    for x0, y0, x1, y1 in holes_all:
        u[y0:y1, x0:x1] = True
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]] + 0.5
    for cx, cy, r0, r1 in rings:
        d = np.hypot(xx - cx, yy - cy)
        u |= (d >= r0) & (d <= r1)
    return u


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('window'); ap.add_argument('size'); ap.add_argument('cell', type=int)
    ap.add_argument('--src-cell', type=int); ap.add_argument('--invert', action='store_true')
    box_arg = lambda v: tuple(map(int, v.split(',')))
    ap.add_argument('--hole', type=box_arg, action='append', default=[]); ap.add_argument('--hole-all', type=box_arg, action='append', default=[])
    ap.add_argument('--hole-ring', type=lambda v: tuple(map(float, v.split(','))), action='append', default=[])
    ap.add_argument('--reach', type=int, default=3)
    ap.add_argument('--inks'); ap.add_argument('--mirror', action='store_true')
    ap.add_argument('--clear', type=lambda v: tuple(map(float, v.split(','))), action='append', default=[])
    o = ap.parse_args()
    x0, y0, x1, y1 = map(float, o.window.split(','))
    W, H = map(int, o.size.split('x'))
    a = np.asarray(Image.open(o.src).convert('RGB')).astype(float)
    lum = a @ [0.299, 0.587, 0.114]
    if o.invert:
        lum = 255 - lum
    known = (~unknown_mask(a, o.hole, o.hole_all, o.hole_ring, o.reach)).astype(float)
    c = o.src_cell or src_cell(np.where(known > 0, lum, 0))
    tile = 4 * c
    hi = extreme(np.where(known > 0, lum, -1e9), tile // 2, np.maximum)
    lo = extreme(np.where(known > 0, lum, 1e9), tile // 2, np.minimum)
    on = ((lum > (hi + lo) / 2) & (hi - lo > MIN_CONTRAST)).astype(float)
    tone = wmean(on, known, tile // 2)
    dot, back = inks(a, on * known, tile // 2), inks(a, (1 - on) * known, tile // 2)
    # The windows reach a tile into a hole; the field there is drawn again from the known ground around it.
    clean = (~grow(known == 0, tile // 2)).astype(float)
    tone = harmonic(tone, clean)
    dot = np.stack([harmonic(dot[..., k], clean) for k in range(3)], axis=2)
    back = np.stack([harmonic(back[..., k], clean) for k in range(3)], axis=2)

    yy, xx = np.mgrid[0:tone.shape[0], 0:tone.shape[1]] + 0.5
    for cx, cy, rx, ry, feather in o.clear:
        # distance outside the ellipse in source px (negative inside), so the fade has the same width all round
        d = (np.hypot((xx - cx) / rx, (yy - cy) / ry) - 1) * min(rx, ry)
        f = np.clip(d / feather, 0, 1)
        f = f * f * (3 - 2 * f)
        # the glow under the dots fades to the darkest backdrop in the frame, so the cleared ground is the oval's own ink
        ink = np.array([np.percentile(back[..., k], 2) for k in range(3)])
        tone = tone * f
        back = ink + (back - ink) * f[..., None]
    cw, ch = W // o.cell, H // o.cell
    assert cw * o.cell == W and ch * o.cell == H, f'{W}x{H} is not a whole number of {o.cell} px cells'
    gx = x0 + (np.arange(cw) + 0.5) * (x1 - x0) / cw
    gy = y0 + (np.arange(ch) + 0.5) * (y1 - y0) / ch
    GX, GY = np.meshgrid(gx, gy)
    lit = sample(tone, GX, GY) > BAYER[np.arange(ch)[:, None] % 4, np.arange(cw)[None, :] % 4]
    dot_cells = np.stack([sample(dot[..., k], GX, GY) for k in range(3)], axis=2)
    px = x0 + (np.arange(W) + 0.5) * (x1 - x0) / W
    py = y0 + (np.arange(H) + 0.5) * (y1 - y0) / H
    PX, PY = np.meshgrid(px, py)
    bd = np.stack([sample(back[..., k], PX, PY) for k in range(3)], axis=2)
    k = np.ones((o.cell, o.cell, 1))
    if o.inks:
        hexrgb = lambda h: np.array([int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)], float)
        dot_ink, back_ink = map(hexrgb, o.inks.split(','))
        dot_cells, bd = np.broadcast_to(dot_ink, dot_cells.shape), np.broadcast_to(back_ink, bd.shape)
    rgb = np.where(np.kron(lit, np.ones((o.cell, o.cell)))[..., None] > 0, np.kron(dot_cells, k), bd)
    if o.mirror:
        rgb = rgb[:, ::-1]
    Image.fromarray(np.clip(np.rint(rgb), 0, 255).astype(np.uint8)).save(o.out, optimize=True)
    print(o.out, f'src cell {c}px', f'{cw}x{ch} cells of {o.cell}px', f'{lit.mean():.3f} lit')


if __name__ == '__main__':
    main()
