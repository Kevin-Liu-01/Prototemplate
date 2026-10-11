"""Derived images the composition needs, cut losslessly from the scans.

  lib/derived/clav74-fig-ink.png        Clavius 1574 fol. 21v, Prop. I.1: the figure's
                                         circles and lines as one indigo ink sheet
  lib/derived/clav74-fig-A.png ... -D   its four letters, each on its own sheet (same box)
  lib/derived/clav74-fig-bare.png       the page under the figure with the ink taken off
  lib/derived/p008-note-bare.png        the 1607 page under the 界說 note column, ink off
  lib/derived/clav74-fig.json           the box and each letter's bounding box

The ink sheets: alpha from darkness (paper 0, ink 1), one flat indigo. Letters are
the connected components of the ink nearest each lettered point. The bare paper:
each ink pixel is replaced by the paper around it (normalised convolution of the
non-ink pixels), then given back the grain of a clean patch of the same page.

   python3 tools/derive.py
"""
import json

import numpy as np
from PIL import Image

ROOT = __file__.rsplit('/', 2)[0] + '/'
INDIGO = (42, 52, 102)


def box_blur(a, r):
    """Separable box blur of radius r (edge-replicated), float64."""
    k = 2 * r + 1
    p = np.pad(a, ((r, r), (r, r)), mode='edge')
    c = np.cumsum(np.pad(p, ((1, 0), (0, 0))), axis=0)
    p = (c[k:] - c[:-k]) / k
    c = np.cumsum(np.pad(p, ((0, 0), (1, 0))), axis=1)
    return (c[:, k:] - c[:, :-k]) / k


def smooth(a, r, n=3):
    for _ in range(n):
        a = box_blur(a, r)
    return a


def bare(rgb, inkmask, grain_src, r=9):
    """Paper with the ink removed: normalised convolution over the non-ink pixels."""
    out = np.empty_like(rgb, dtype=np.float64)
    keep = (~inkmask).astype(np.float64)
    for c in range(3):
        num = smooth(rgb[..., c] * keep, r)
        den = smooth(keep, r)
        fill = num / np.maximum(den, 1e-6)
        # a second, wider pass where the first had nothing to average
        num2 = smooth(rgb[..., c] * keep, r * 4)
        den2 = smooth(keep, r * 4)
        fill2 = num2 / np.maximum(den2, 1e-6)
        fill = np.where(den > 0.05, fill, fill2)
        out[..., c] = np.where(inkmask, fill, rgb[..., c])
    # grain: seeded noise at the amplitude of the clean paper patch given
    g = grain_src.astype(np.float64)
    gl = g.mean(-1) if g.ndim == 3 else g
    amp = float((gl - smooth(gl, 6)).std())
    H, W = rgb.shape[:2]
    rng = np.random.default_rng(1574)
    nz = smooth(rng.standard_normal((H, W)), 1, 1)
    nz = nz / nz.std() * min(amp, 3.0) * 0.6
    soft = smooth(inkmask.astype(np.float64), 2, 2)
    out = out + (nz * np.clip(soft * 1.4, 0, 1))[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


def components(mask):
    """4-connected components of a boolean mask: label image and count."""
    H, W = mask.shape
    lab = np.zeros((H, W), np.int32)
    n = 0
    for y in range(H):
        for x in range(W):
            if mask[y, x] and not lab[y, x]:
                n += 1
                stack = [(y, x)]
                lab[y, x] = n
                while stack:
                    cy, cx = stack.pop()
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
                        yy, xx = cy + dy, cx + dx
                        if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not lab[yy, xx]:
                            lab[yy, xx] = n
                            stack.append((yy, xx))
    return lab, n


def clavius():
    x0, y0, x1, y1 = 940, 1946, 1288, 2230
    im = Image.open(ROOT + 'assets/west/clavius1574-leaf125-fol21v-prop1.png').convert('RGB')
    rgb = np.asarray(im.crop((x0, y0, x1, y1))).astype(np.float64)
    L = rgb.mean(-1)
    paper, ink = 190.0, 70.0
    a = np.clip((paper - L) / (paper - ink), 0, 1) ** 0.9
    solid = a > 0.35
    # the figure's own ink: its solid strokes and their soft edges; the faint
    # show-through of the verso stays on the page and off the sheet
    figmask = smooth(solid.astype(np.float64), 2, 1) > 0.03
    a = a * figmask
    lab, n = components(solid)
    # the four letters: glyph centres read off the page (native pixels)
    letters = {'A': (1035, 2086), 'B': (1203, 2091), 'C': (1135, 1977), 'D': (1118, 2203)}
    info = {'box': [x0, y0, x1, y1], 'letters': {}}
    used = np.zeros_like(solid)
    for k, (px, py) in letters.items():
        cx, cy = px - x0, py - y0
        best, bd = 0, 1e9
        for i in range(1, n + 1):
            ys, xs = np.nonzero(lab == i)
            if len(ys) < 30 or len(ys) > 2000:
                continue
            d = np.hypot(xs.mean() - cx, ys.mean() - cy)
            if d < bd:
                bd, best = d, i
        m = lab == best
        ys, xs = np.nonzero(m)
        bb = [int(xs.min()) - 3, int(ys.min()) - 3, int(xs.max()) + 4, int(ys.max()) + 4]
        # the glyph's sheet: every ink pixel inside the glyph's box that belongs to the glyph
        # (or to small specks touching it), so serifs and soft edges come with it
        region = np.zeros_like(solid)
        region[bb[1]:bb[3], bb[0]:bb[2]] = True
        grow = smooth(m.astype(np.float64), 2, 1) > 0.02
        gm = region & grow
        used |= gm
        o = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
        o[..., 0], o[..., 1], o[..., 2] = INDIGO
        o[..., 3] = (a * gm * 255).astype(np.uint8)
        Image.fromarray(o, 'RGBA').save(ROOT + 'lib/derived/clav74-fig-%s.png' % k, optimize=True)
        info['letters'][k] = {'bbox': [bb[0] + x0, bb[1] + y0, bb[2] + x0, bb[3] + y0], 'pixels': int(m.sum()), 'dist': round(float(bd), 1)}
    o = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    o[..., 0], o[..., 1], o[..., 2] = INDIGO
    o[..., 3] = (a * (~used) * 255).astype(np.uint8)
    Image.fromarray(o, 'RGBA').save(ROOT + 'lib/derived/clav74-fig-ink.png', optimize=True)
    inkmask = smooth(figmask.astype(np.float64), 1, 1) > 0.02
    full = np.asarray(im).astype(np.float64)
    grain = full[1500:1700, 150:420]  # the blank outer margin of the same page
    b = bare(rgb, inkmask, grain, r=6)
    Image.fromarray(b).save(ROOT + 'lib/derived/clav74-fig-bare.png', optimize=True)
    json.dump(info, open(ROOT + 'lib/derived/clav74-fig.json', 'w'), indent=1)
    print('clavius', info)


def note():
    """The note column is dense (a third of it is ink), so the paper is rebuilt
    row by row from its brightest pixels, then given the grain of blank paper
    below the column."""
    x0, y0, x1, y1 = 932, 492, 1063, 2628
    im = Image.open(ROOT + 'assets/zh/pages/loc-wdl17216-v1-p008-full.jpg').convert('RGB')
    full = np.asarray(im).astype(np.float64)
    rgb = full[y0:y1, x0:x1]
    H, W = rgb.shape[:2]
    L = rgb.mean(-1)
    paper = np.zeros((H, 3))
    side = np.concatenate([full[y0:y1, 872:924], full[y0:y1, 1070:1118]], axis=1)
    sideL = side.mean(-1)
    for y in range(H):
        a, b = max(0, y - 40), min(H, y + 41)
        blk = side[a:b].reshape(-1, 3)
        lum = sideL[a:b].reshape(-1)
        sel = (lum >= np.percentile(lum, 40)) & (lum <= np.percentile(lum, 85))
        paper[y] = blk[sel].mean(0)
    for c in range(3):
        k = 31
        pad = np.pad(paper[:, c], (k, k), mode='edge')
        cs = np.cumsum(np.insert(pad, 0, 0))
        paper[:, c] = ((cs[2 * k + 1:] - cs[:-(2 * k + 1)]) / (2 * k + 1))[:H]
    # a slight left-to-right shading, measured on the bright pixels of each column
    colb = np.array([np.percentile(L[:, x], 75) for x in range(W)])
    shade = colb / colb.mean()
    base = paper[:, None, :] * shade[None, :, None]
    # paper grain: seeded noise at the amplitude of blank paper on this page
    blank = full[2700:2840, 960:1040].mean(-1)
    amp = float((blank - smooth(blank, 6)).std())
    rng = np.random.default_rng(17216)
    nz = smooth(rng.standard_normal((H, W)), 1, 1)
    nz = nz / nz.std() * amp * 0.55
    tile = nz[..., None] * np.array([1.0, 0.97, 0.9])[None, None, :]
    out = np.clip(base + tile, 0, 255).astype(np.uint8)
    Image.fromarray(out).save(ROOT + 'lib/derived/p008-note-bare.png', optimize=True)
    print('note bare', out.shape)


if __name__ == '__main__':
    clavius()
    note()
