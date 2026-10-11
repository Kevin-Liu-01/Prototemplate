#!/usr/bin/env python3
"""
slash-announcement v4: prepares the opener from Kevin's photo of Slash's card
(assets/reference/slash-card-kevin.png, 1080 x 360, Slash's image).

    python3 lib/card-prep.py

Writes:
  assets/opener/card.png   the card cut out of its ground (RGBA, straight alpha),
                           at 16/9 of the photo, the scale at which the photo's
                           width fills the frame
  assets/opener/ground.png the photo's ground without the card, smoothed and
                           extended to 1920 x 1080, dithered to 8 bits
  lib/card.js              window.CARDPHOTO: where the card's image sits in the
                           frame, its corners, its centre and its long side

The cut follows the card's own edges. Each side is a straight line fitted to
the half step between the card and the ground, found on 85 profiles across
the side (the outer edge of the left side's bright rim, of the bottom's dark
side). Each corner is a round fillet whose radius is measured along the
corner's bisector. Where the photo's blur mixes the card's edge with the
ground, the ground (inpainted under the card) is taken back out before the
card is resampled (Lanczos) and lightly sharpened, and the mask is drawn at
8 x 8 supersampling, so no ground rides along the card's edge.

Deterministic: no clock, the dither noise is seeded.
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.dirname(HERE)
SRC = os.path.join(FILM, 'assets/reference/slash-card-kevin.png')
OUTDIR = os.path.join(FILM, 'assets/opener')
K = 16 / 9  # photo px to frame px: the photo's 1080 px width fills the frame's 1920
OY = 220.0  # the photo's top edge in the frame (its 360 px height spans y 220 to 860)
FW, FH = 1920, 1080
LUMA = np.array([0.2126, 0.7152, 0.0722])

im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float64)
H, W, _ = im.shape


def samp(x, y):
    """bilinear samples of the photo at float coordinates"""
    x = np.clip(x, 0, W - 1.001)
    y = np.clip(y, 0, H - 1.001)
    x0 = np.floor(x).astype(int)
    y0 = np.floor(y).astype(int)
    fx = (x - x0)[..., None]
    fy = (y - y0)[..., None]
    a, b, c, d = im[y0, x0], im[y0, x0 + 1], im[y0 + 1, x0], im[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def gblur(a, sig):
    """separable Gaussian blur, edges extended"""
    r = int(3 * sig) + 1
    x = np.arange(-r, r + 1)
    k = np.exp(-x * x / (2 * sig * sig))
    k /= k.sum()
    out = np.pad(a, ((r, r), (r, r)) + ((0, 0),) * (a.ndim - 2), mode='edge')
    for ax in (0, 1):
        # the kernel's taps as shifted sums along one axis (exact, and fast for numpy)
        n = out.shape[ax] - 2 * r
        acc = np.zeros(out.shape[:ax] + (n,) + out.shape[ax + 1:])
        for j in range(2 * r + 1):
            acc += k[j] * np.take(out, np.arange(j, j + n), axis=ax)
        out = acc
    return out


def pushpull(img, w):
    """fills img where the weight w is 0 from where it is 1 (multi-resolution push-pull)"""
    if min(img.shape[:2]) <= 2:
        s = (img * w[..., None]).sum((0, 1)) / max(w.sum(), 1e-9)
        return np.broadcast_to(s, img.shape).copy()
    h, wd = img.shape[:2]
    h2, w2 = (h + 1) // 2, (wd + 1) // 2
    pi = np.pad(img, ((0, h2 * 2 - h), (0, w2 * 2 - wd), (0, 0)), mode='edge')
    pw = np.pad(w, ((0, h2 * 2 - h), (0, w2 * 2 - wd)), mode='edge')
    sw = pw.reshape(h2, 2, w2, 2).sum((1, 3))
    si = (pi * pw[..., None]).reshape(h2, 2, w2, 2, 3).sum((1, 3))
    low = np.where(sw[..., None] > 0, si / np.maximum(sw, 1e-9)[..., None], 0)
    lowf = pushpull(low, (sw > 0).astype(float))
    up = gblur(np.repeat(np.repeat(lowf, 2, 0), 2, 1)[:h, :wd], 1.0)
    return w[..., None] * img + (1 - w[..., None]) * up


def fit_line(pts):
    """total least squares with outliers dropped (3 MAD, floor 0.35 px)"""
    keep = np.ones(len(pts), bool)
    for _ in range(5):
        m = pts[keep].mean(0)
        d = np.linalg.svd(pts[keep] - m)[2][0]
        n = np.array([-d[1], d[0]])
        r = (pts - m) @ n
        keep = np.abs(r) < max(0.35, 3 * 1.4826 * np.median(np.abs(r[keep])))
    m = pts[keep].mean(0)
    d = np.linalg.svd(pts[keep] - m)[2][0]
    n = np.array([-d[1], d[0]])
    return (m, d), float(np.sqrt(np.mean(((pts[keep] - m) @ n) ** 2))), int(keep.sum())


def meet(L1, L2):
    (p, d), (q, e) = L1, L2
    t = np.linalg.solve(np.array([d, -e]).T, q - p)
    return p + t[0] * d


def side_points(a, b, cen, rule):
    """edge points along the side a-b, on profiles along its outward normal"""
    d = (b - a) / np.linalg.norm(b - a)
    n = np.array([d[1], -d[0]])
    if np.dot(n, (a + b) / 2 - cen) < 0:
        n = -n
    pts = []
    for u in np.linspace(0.08, 0.92, 85):
        p = a + (b - a) * u
        s = np.arange(-6, 12.01, 0.125)
        pr = samp(p[0] + s * n[0], p[1] + s * n[1])
        se = rule(s, pr)
        if se is not None:
            pts.append(p + se * n)
    return np.array(pts)


def rule_ground(s, pr):
    """pass 1: the outermost half crossing of the colour distance from the ground (fitted at 8 to 11 px out)"""
    g = (s >= 8) & (s <= 11)
    A = np.vstack([s[g], np.ones(g.sum())]).T
    coef = np.linalg.lstsq(A, pr[g], rcond=None)[0]
    dist = np.linalg.norm(pr - (np.outer(s, coef[0]) + coef[1]), axis=1)
    win = (s >= -5) & (s <= 6)
    mx = dist[win].max()
    if mx < 18:
        return None
    k = np.where(win & (dist >= mx / 2))[0].max()
    return s[k] + (dist[k] - mx / 2) / (dist[k] - dist[k + 1]) * (s[k + 1] - s[k])


def rule_extremum(s, pr):
    """pass 2: the outermost rim or dark side, then the half step from it to the ground (luma)"""
    pr = pr @ LUMA
    g = pr[(s >= 3.5) & (s <= 6)].mean()
    w = (s >= -3) & (s <= 2.0)
    dev = np.abs(pr - g)
    if dev[w].max() < 14:
        return None
    k = np.where(w & (dev >= 0.6 * dev[w].max()))[0].max()
    while k + 1 < len(s) and dev[k + 1] >= dev[k] and s[k + 1] <= 2.5:
        k += 1
    half = (pr[k] + g) / 2
    j = k
    while j + 1 < len(s) and (pr[j + 1] - half) * (pr[k] - half) > 0:
        j += 1
    if j + 1 >= len(s):
        return None
    return s[j] + (pr[j] - half) / (pr[j] - pr[j + 1]) * (s[j + 1] - s[j])


def fit_card():
    # corners placed by hand on an 8x view (top left, top right, bottom right, bottom left)
    C = np.array([(367.5, 138.0), (632.0, 45.5), (717.0, 212.0), (452.0, 319.0)])
    report = {}
    for rule in (rule_ground, rule_ground, rule_extremum):
        cen = C.mean(0)
        lines = []
        for i in range(4):
            L, rms, kept = fit_line(side_points(C[i], C[(i + 1) % 4], cen, rule))
            lines.append(L)
            report[f'side {i}'] = {'rms': round(rms, 3), 'kept': kept}
        C = np.array([meet(lines[(i - 1) % 4], lines[i]) for i in range(4)])
    # each corner's radius, from where its bisector meets the card (half step from the ground outside)
    R = []
    for i in range(4):
        c, p, q = C[i], C[(i - 1) % 4], C[(i + 1) % 4]
        u = (p - c) / np.linalg.norm(p - c)
        v = (q - c) / np.linalg.norm(q - c)
        th = np.arccos(np.dot(u, v))
        bis = (u + v) / np.linalg.norm(u + v)
        perp = np.array([-bis[1], bis[0]])
        s = np.arange(-3, 14, 0.125)
        hits = []
        for off in np.linspace(-1, 1, 5):
            pr = samp(c[0] + s * bis[0] + off * perp[0], c[1] + s * bis[1] + off * perp[1]) @ LUMA
            dev = np.abs(pr - pr[s <= -1.5].mean())
            hits.append(s[np.argmax(dev >= 0.5 * dev[(s > 0) & (s < 12)].max())])
        R.append(float(np.median(hits)) / (1 / np.sin(th / 2) - 1))
    return C, R, report


def outline(C, R, n=64):
    """the card's outline: its four sides and a round fillet of radius R[i] at each corner"""
    out = []
    for i in range(4):
        c, p, q = C[i], C[(i - 1) % 4], C[(i + 1) % 4]
        u = (p - c) / np.linalg.norm(p - c)
        v = (q - c) / np.linalg.norm(q - c)
        th = np.arccos(np.clip(np.dot(u, v), -1, 1))
        o = c + (u + v) / np.linalg.norm(u + v) * (R[i] / np.sin(th / 2))
        a, b = c + u * R[i] / np.tan(th / 2), c + v * R[i] / np.tan(th / 2)
        a0 = np.arctan2(*(a - o)[::-1])
        da = (np.arctan2(*(b - o)[::-1]) - a0 + np.pi) % (2 * np.pi) - np.pi
        for k in range(n + 1):
            t = a0 + da * k / n
            out.append(o + R[i] * np.array([np.cos(t), np.sin(t)]))
    return np.array(out)


def coverage(poly, w, h, scale, ox, oy, ss=8):
    """the outline's area coverage on a w x h grid: pixel (i, j) is source (ox + i, oy + j) / scale"""
    big = Image.new('L', (w * ss, h * ss), 0)
    ImageDraw.Draw(big).polygon([((p[0] * scale - ox) * ss, (p[1] * scale - oy) * ss) for p in poly], fill=255)
    return np.asarray(big.resize((w, h), Image.BOX)).astype(np.float64) / 255


def resize3(arr, size, box):
    return np.stack([np.asarray(Image.fromarray(arr[..., c].astype(np.float32), mode='F').resize(size, Image.LANCZOS, box=box)) for c in range(3)], -1).astype(np.float64)


def dist_from(mask):
    """approximate distance (px) from a boolean mask, by repeated 3 x 3 dilation"""
    d = np.where(mask, 0.0, np.inf)
    cur = mask.copy()
    for r in range(1, 41):
        nb = cur.copy()
        nb[1:] |= cur[:-1]
        nb[:-1] |= cur[1:]
        nb[:, 1:] |= cur[:, :-1]
        nb[:, :-1] |= cur[:, 1:]
        d[nb & ~cur] = r
        cur = nb
    return d


def main():
    os.makedirs(OUTDIR, exist_ok=True)
    C, R, report = fit_card()
    poly = outline(C, R)
    A1 = coverage(poly, W, H, 1.0, 0, 0)
    dist = dist_from(A1 > 0.001)

    # the ground beside the edge (for unmixing the edge) and the film's ground
    G_edge = pushpull(im, (dist > 3).astype(float))
    G_far = pushpull(im, (dist > 28).astype(float))  # the edge glints' flare streaks go with the card

    # the film's ground: smoothed, extended 140 px above and below from its own rows, mapped at 16/9
    PAD = 140
    Gp = np.pad(gblur(G_far, 10.0), ((PAD, PAD), (0, 0), (0, 0)), mode='edge')
    Gs = gblur(Gp, 10.0)
    Gh = gblur(Gp, 45.0)
    yy = np.arange(Gp.shape[0]) - PAD
    out_of = np.clip(np.maximum(-yy, yy - (H - 1)) / 60.0, 0, 1)[:, None, None]
    Gp = Gs * (1 - out_of) + Gh * out_of
    box = (0, (0 - OY) / K + PAD, W, (FH - OY) / K + PAD)
    ground = resize3(Gp, (FW, FH), box)
    rng = np.random.default_rng(20261008)
    tpdf = rng.random(ground.shape) - rng.random(ground.shape)  # triangular dither, +-1 level
    ground8 = np.clip(np.round(ground + tpdf), 0, 255).astype(np.uint8)
    Image.fromarray(ground8, 'RGB').save(os.path.join(OUTDIR, 'ground.png'), optimize=True)

    # the card: unmix its edge from the ground (alpha with the photo's blur), extend it outward,
    # resample at 16/9 (Lanczos), sharpen lightly, then cut it with the crisp mask
    As = gblur(A1, 0.7)
    F = im.copy()
    mid = (As > 0.15) & (As < 0.995)
    F[mid] = (im[mid] - (1 - As[mid])[:, None] * G_edge[mid]) / As[mid][:, None]
    F = np.clip(F, 0, 255)
    inside = (As >= 0.5)
    F = np.where(inside[..., None], F, pushpull(F * inside[..., None], inside.astype(float)))
    xs = poly[:, 0] * K
    ys = OY + poly[:, 1] * K
    M = 10
    X0, X1 = int(np.floor(xs.min())) - M, int(np.ceil(xs.max())) + M
    Y0, Y1 = int(np.floor(ys.min())) - M, int(np.ceil(ys.max())) + M
    w, h = X1 - X0, Y1 - Y0
    U = resize3(F, (w, h), (X0 / K, (Y0 - OY) / K, X1 / K, (Y1 - OY) / K))
    U = U + 0.45 * (U - gblur(U, 1.0))
    Aout = coverage(poly, w, h, K, X0, Y0 - OY)
    rgba = np.dstack([np.clip(U, 0, 255), Aout * 255]).round().astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUTDIR, 'card.png'), optimize=True)

    Cf = np.array([[c[0] * K, OY + c[1] * K] for c in C])
    cen = Cf.mean(0)
    long_side = Cf[1] - Cf[0]
    info = {
        'scale': K,
        'photoTop': OY,
        'box': {'x': X0, 'y': Y0, 'w': w, 'h': h},
        'corners': [[round(v, 2) for v in c] for c in Cf],
        'centre': [round(v, 2) for v in cen],
        'longAngle': round(float(np.degrees(np.arctan2(long_side[1], long_side[0]))), 3),
        'radiiPhotoPx': [round(r, 2) for r in R],
        'fit': report,
    }
    js = '/* generated by lib/card-prep.py from assets/reference/slash-card-kevin.png; do not edit by hand */\nwindow.CARDPHOTO = ' + json.dumps(info) + ';\n'
    with open(os.path.join(HERE, 'card.js'), 'w') as f:
        f.write(js)
    print(json.dumps(info, indent=1))
    print('photo corners', [[round(v, 2) for v in c] for c in C])


if __name__ == '__main__':
    main()
