#!/usr/bin/env python3
"""Remove the retired GT monogram from each published blog cover.

The covers were flat exports with no source files, so each ground is the
published cover (graphics/shots/covers) with only its old mark taken out;
every other pixel stays as published. A light mark's pixels are filled block
by block from the hole's edge inward, each block copied from the same picture
at a shift where the dither repeats (a peak of the picture's autocorrelation):
the shift whose known neighbours and low-pass tone match best. A dark mark on
a plain chip is painted over in the chip's colour. gen-covers.js seats the
globe logo where the mark was.

usage: cover-grounds.py [name ...]
Writes graphics/bg/covers/<name>.png (graphics/bg links to public/graphics/bg).
"""
import pathlib, sys
from PIL import Image
import numpy as np

SP = pathlib.Path(__file__).resolve().parents[1]
ROOT = SP.parent
SRC = SP / 'shots' / 'covers'
OUT = SP / 'bg' / 'covers'

# The old mark in source px: ('light', box) takes the light pixels inside the box, ('dark', box) paints the dark ones
# with the box's own light colour; block is the copy unit in px, reach the largest shift tried.
GROUNDS = {
    'open-source': ('open-source.png', 4, 160, ('light', (200, 228, 330, 312))),
    'fumadocs': ('fumadocs.png', 4, 160, ('light', (342, 429, 416, 476))),
    'fuma-nama-og': ('fuma-nama-og.png', 4, 160, ('light', (348, 399, 417, 442))),
    'cuelume': ('cuelume.webp', 8, 320, ('light', (676, 799, 820, 890))),
    'cuelume-og': ('cuelume-og.png', 8, 320, ('light', (687, 766, 824, 852))),
    'slash': ('slash.jpg', 4, 160, ('light', (622, 221, 764, 315))),
    'spine': ('spine.png', 8, 160, ('dark', (884, 154, 940, 192))),
}
WHITE_MIN, WHITE_SAT, HALO = 150, 34, 2


def blur(a, r):
    """Three box passes along both axes, edges clamped (close to a Gaussian of sigma ~ r)."""
    for _ in range(3):
        for ax in (0, 1):
            a = np.moveaxis(a, ax, 0)
            p = np.concatenate([np.repeat(a[:1], r + 1, 0), a, np.repeat(a[-1:], r, 0)], 0)
            c = np.cumsum(p, 0)
            a = np.moveaxis((c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1), 0, ax)
    return a


def grow(m, r):
    o = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            o[max(dy, 0):m.shape[0] + min(dy, 0), max(dx, 0):m.shape[1] + min(dx, 0)] |= m[max(-dy, 0):m.shape[0] + min(-dy, 0), max(-dx, 0):m.shape[1] + min(-dx, 0)]
    return o


def mark_mask(img, box):
    x0, y0, x1, y1 = box
    m = np.zeros(img.shape[:2], bool); part = img[y0:y1, x0:x1]
    m[y0:y1, x0:x1] = (part.min(2) >= WHITE_MIN) & (part.max(2) - part.min(2) < WHITE_SAT)
    return grow(m, HALO)


def tone(img, valid, r):
    """Low-pass color that ignores the removed pixels, widened until every hole is reached."""
    w = valid.astype(np.float64)[..., None]
    out = np.zeros_like(img); done = np.zeros(valid.shape, bool)
    while not done.all():
        num, den = blur(img * w, r), blur(w, r)
        ok = (den[..., 0] > 0.05) & ~done
        out[ok] = num[ok] / den[ok]; done |= ok; r *= 2
    return out


def shifts(img, valid, reach, keep=160):
    """The shifts at which the picture's fine texture repeats, strongest first."""
    g = img.mean(2); hp = (g - blur(g, 3)) * valid
    f = np.fft.rfft2(hp); ac = np.fft.irfft2(f * np.conj(f), s=hp.shape)
    ys, xs = np.mgrid[-reach:reach + 1, -reach:reach + 1]
    vals = ac[ys % hp.shape[0], xs % hp.shape[1]]
    ok = (xs ** 2 + ys ** 2 <= reach ** 2) & (xs ** 2 + ys ** 2 >= 9)
    order = np.argsort(-vals[ok])[:keep]
    return list(zip(ys[ok][order], xs[ok][order]))


def recover(name):
    file, block, reach, (kind, box) = GROUNDS[name]
    img = np.asarray(Image.open(SRC / file).convert('RGB'), dtype=np.float64)
    h, w, _ = img.shape
    if kind == 'dark':
        x0, y0, x1, y1 = box; part = img[y0:y1, x0:x1]
        part[...] = np.median(part[part.min(2) >= 200], 0)
        return save(name, img, 0.0, 0.0, 0)
    hole = mark_mask(img, box)
    low = tone(img, ~hole, block)
    cand = shifts(img, ~hole, reach)
    hy, hx = np.where(hole); m = reach + 2 * block
    y0, x0 = max(hy.min() - m, 0), max(hx.min() - m, 0)
    y1, x1 = min(hy.max() + m + 1, h), min(hx.max() + m + 1, w)
    bh, bw = -(-(y1 - y0) // block), -(-(x1 - x0) // block)
    H, W = bh * block, bw * block
    pad = lambda a, v: np.pad(a[y0:y1, x0:x1], [(0, H - (y1 - y0)), (0, W - (x1 - x0))] + [(0, 0)] * (a.ndim - 2), constant_values=v)
    I, L, V, todo = pad(img, 0), pad(low, 0), pad(~hole, False), pad(hole, False)
    bsum = lambda a: a.reshape(bh, block, bw, block).sum((1, 3))
    near = lambda a: sum(np.pad(a, 1)[1 + dy:1 + dy + bh, 1 + dx:1 + dx + bw] for dy in (-1, 0, 1) for dx in (-1, 0, 1))
    dL = {}
    for dy, dx in cand:
        d = np.full((H, W), 1e9); sy, sx = slice(max(dy, 0), H + min(dy, 0)), slice(max(dx, 0), W + min(dx, 0))
        ty, tx = slice(max(-dy, 0), H + min(-dy, 0)), slice(max(-dx, 0), W + min(-dx, 0))
        d[ty, tx] = ((L[sy, sx] - L[ty, tx]) ** 2).sum(2); dL[dy, dx] = bsum(d) / block ** 2
    # Fill from the hole's edge inward: each pass takes the blocks beside known pixels, matched on their 3 by 3 block neighbourhood.
    for step in range(60):
        need = bsum(todo.astype(np.int32)) > 0
        if not need.any(): break
        front = need & (near(bsum(V.astype(np.int32))) > 0)
        if not front.any(): front = need
        best = np.full((bh, bw), np.inf); pick = np.zeros((bh, bw, 2), int)
        for dy, dx in cand:
            sy, sx = slice(max(dy, 0), H + min(dy, 0)), slice(max(dx, 0), W + min(dx, 0))
            ty, tx = slice(max(-dy, 0), H + min(-dy, 0)), slice(max(-dx, 0), W + min(-dx, 0))
            srcV = np.zeros_like(V); srcV[ty, tx] = V[sy, sx]
            dI = np.zeros((H, W)); dI[ty, tx] = ((I[sy, sx] - I[ty, tx]) ** 2).sum(2)
            both = V & srcV
            cost = near(bsum(dI * both)) / np.maximum(near(bsum(both.astype(np.int32))), 1) + 4 * dL[dy, dx] + 0.02 * (dy * dy + dx * dx)
            better = front & (bsum((~srcV).astype(np.int32)) == 0) & (cost < best)
            best[better] = cost[better]; pick[better] = (dy, dx)
        by, bx = np.where(front & np.isfinite(best))
        if not len(by): break
        for y, x in zip(by, bx):
            dy, dx = pick[y, x]
            ys, xs = slice(y * block, (y + 1) * block), slice(x * block, (x + 1) * block)
            t = todo[ys, xs].copy()
            I[ys, xs][t] = I[y * block + dy:(y + 1) * block + dy, x * block + dx:(x + 1) * block + dx][t]
            todo[ys, xs] = False; V[ys, xs] = True
    I[todo] = L[todo]
    out = img.copy(); out[y0:y1, x0:x1] = I[:y1 - y0, :x1 - x0]
    save(name, out, hole.mean(), todo.mean(), step + 1)


def save(name, img, removed, toned, passes):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f'{name}.png'
    Image.fromarray(np.clip(img, 0, 255).round().astype(np.uint8), 'RGB').save(path, optimize=True)
    print(f'{path.relative_to(ROOT)} {img.shape[1]}x{img.shape[0]} removed {removed:.2%} left to tone {toned:.2%} in {passes} passes')


for name in (sys.argv[1:] or GROUNDS):
    recover(name)
