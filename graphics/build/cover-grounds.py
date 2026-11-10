#!/usr/bin/env python3
"""Take the old GT mark and the words beside it out of each published blog cover.

The covers were flat exports with no source files. Each one keeps its art; the
group of the old mark and its words (graphics/shots/covers) is lifted off so
gen-covers.js can set the globe logo with the same words, centred where the
group was. A light group's pixels are filled block by block from the hole's
edge inward, each block copied from the same picture at a shift where the
dither repeats (a peak of the picture's autocorrelation, or a step along a
straight edge the hole crosses): the shift whose known neighbours and low-pass
tone match best. The words come back as an alpha matte of the published pixels
over that fill. A dark group on a plain chip is painted over in the chip's colour.

usage: cover-grounds.py [name ...]
Writes graphics/bg/covers/<name>.png (the ground), <name>-words.png (the words) and <name>.json (their boxes),
where graphics/bg links to public/graphics/bg.
"""
import json, pathlib, sys
from PIL import Image
import numpy as np

SP = pathlib.Path(__file__).resolve().parents[1]
ROOT = SP.parent
SRC = SP / 'shots' / 'covers'
OUT = SP / 'bg' / 'covers'

# The group in source px: kind, box around the old mark and its words, and the mark's side of the group
# ('left' before the words, 'right' after them); block is the copy unit in px, reach the largest shift tried.
GROUNDS = {
    'open-source': ('open-source.png', 4, 160, 'light', (198, 226, 774, 322), 'left'),
    'fumadocs': ('fumadocs.png', 4, 160, 'light', (341, 428, 631, 480), 'left'),
    'fuma-nama-og': ('fuma-nama-og.png', 4, 160, 'light', (347, 398, 639, 452), 'left'),
    'cuelume': ('cuelume.webp', 8, 320, 'light', (674, 797, 1306, 899), 'left'),
    'cuelume-og': ('cuelume-og.png', 8, 320, 'light', (685, 764, 1278, 860), 'left'),
    'slash': ('slash.jpg', 4, 160, 'light', (258, 222, 762, 314), 'right', (140, 60)),
    'spine': ('spine.png', 8, 160, 'dark', (884, 154, 1040, 194), 'left'),
}
WHITE_MIN, WHITE_SAT, HALO = 150, 34, 2  # a recipe's last item can override the light test (a JPEG tints thin strokes)


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


def runs(cols, gap):
    """Runs of True in a 1-d array, split where at least gap False values separate them."""
    gap = max(gap, 1)
    idx = np.where(cols)[0]; out = [[idx[0], idx[0]]]
    for c in idx[1:]:
        if c - out[-1][1] > gap: out.append([c, c])
        else: out[-1][1] = c
    return out


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
    return [(int(y), int(x)) for y, x in zip(ys[ok][order], xs[ok][order])]


def edge(low, hole):
    """The direction along the tone's edges around a hole (radians) and how strongly one direction dominates (0 to 1)."""
    g = low.mean(2); gy, gx = np.gradient(g)
    ring = grow(hole, 12) & ~hole
    jxx, jyy, jxy = (gx * gx)[ring].sum(), (gy * gy)[ring].sum(), (gx * gy)[ring].sum()
    return 0.5 * np.arctan2(2 * jxy, jxx - jyy) + np.pi / 2, np.hypot(jxx - jyy, 2 * jxy) / max(jxx + jyy, 1e-9)


def along(low, hole, theta, reach):
    """Tone inside the hole carried along the edge direction from the nearest known pixel on each side."""
    h, w = hole.shape; ys, xs = np.where(hole)
    acc = np.zeros((len(ys), 3)); wsum = np.zeros(len(ys))
    for sign in (1, -1):
        found = np.zeros(len(ys), bool)
        for t in range(1, reach + 1):
            y = np.clip(np.round(ys + sign * t * np.sin(theta)).astype(int), 0, h - 1)
            x = np.clip(np.round(xs + sign * t * np.cos(theta)).astype(int), 0, w - 1)
            hit = ~found & ~hole[y, x]
            acc[hit] += low[y[hit], x[hit]] / t; wsum[hit] += 1 / t; found |= hit
            if found.all(): break
    out = low.copy(); ok = wsum > 0
    out[ys[ok], xs[ok]] = acc[ok] / wsum[ok, None]
    return out


def fill(img, hole, block, reach):
    h, w, _ = img.shape
    low = tone(img, ~hole, block)
    cand = shifts(img, ~hole, reach)
    theta, coherence = edge(low, hole)
    if coherence >= 0.9:  # one straight edge crosses the hole: carry the tone along it and also try steps along it
        low = along(low, hole, theta, reach)
        cand += [c for c in sorted({(int(round(t * np.sin(theta))), int(round(t * np.cos(theta)))) for t in range(-reach, reach + 1) if abs(t) >= 3}) if c not in cand]
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
    return out


def recover(name):
    file, block, reach, kind, (x0, y0, x1, y1), side, *test = GROUNDS[name]
    lo, sat = test[0] if test else (WHITE_MIN, WHITE_SAT)
    img = np.asarray(Image.open(SRC / file).convert('RGB'), dtype=np.float64)
    part = img[y0:y1, x0:x1]
    ink = (part.min(2) >= lo) & (part.max(2) - part.min(2) < sat) if kind == 'light' else part.max(2) < 250
    det = np.zeros(img.shape[:2], bool); det[y0:y1, x0:x1] = ink
    parts = runs(det.any(0), 6 * block // 4)
    mx0, mx1 = parts[0] if side == 'left' else parts[-1]
    mark_rows = np.where(det[:, mx0:mx1 + 1].any(1))[0]
    words = det.copy(); words[:, mx0:mx1 + 1] = False
    if kind == 'light':
        ground = fill(img, grow(det, HALO), block, reach)
        a = ((img - ground) / np.maximum(255 - ground, 1)).mean(2)
        color = np.array([255.0, 255.0, 255.0])
    else:
        ground = img.copy(); g = ground[y0:y1, x0:x1]
        paper = np.median(g[g.min(2) >= 250], 0); g[...] = paper
        color = np.median(img[det & (img.max(2) < 60)], 0)
        a = ((ground - img) / np.maximum(ground - color, 1)).mean(2)
    a = np.clip(a, 0, 1) * grow(words, HALO)
    ys, xs = np.where(a > 0.004); wy0, wy1, wx0, wx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    sprite = np.dstack([np.broadcast_to(color, (wy1 - wy0, wx1 - wx0, 3)), a[wy0:wy1, wx0:wx1] * 255])
    first = runs((a[wy0:wy1, wx0:wx1] > 0.5).any(0), 1)[0]
    glyph = np.where((a[wy0:wy1, wx0 + first[0]:wx0 + first[1] + 1] > 0.5).any(1))[0]
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.clip(ground, 0, 255).round().astype(np.uint8), 'RGB').save(OUT / f'{name}.png', optimize=True)
    Image.fromarray(np.clip(sprite, 0, 255).round().astype(np.uint8), 'RGBA').save(OUT / f'{name}-words.png', optimize=True)
    info = {'w': img.shape[1], 'h': img.shape[0], 'group': [x0, y0, x1, y1], 'side': side,
            'mark': [int(mx0), int(mark_rows.min()), int(mx1), int(mark_rows.max())],
            'words': [int(wx0), int(wy0), int(wx1 - wx0), int(wy1 - wy0)],
            'cap': [int(wy0 + glyph.min()), int(wy0 + glyph.max())],
            'color': '#%02x%02x%02x' % tuple(int(round(c)) for c in color)}
    (OUT / f'{name}.json').write_text(json.dumps(info) + '\n')
    print(name, info)


for name in (sys.argv[1:] or GROUNDS):
    recover(name)
