"""The matcher behind pnpm lint:logo --pixels (scripts/lint/logo-pixels.mjs).

Finds each template (the doubled-line monogram's bar and potrace drawings and
LOGO.d, rendered by Chromium into masks) in a picture at any size, in any
colour, on a light or a dark ground, inside a screenshot or alone.

Search: the picture's luminance, its short side brought to 1200 px or less,
is turned into an edge map (gradient magnitude), so ink colour and polarity
drop out. Each template is drawn at nine heights from 10 to 20 px with a
ground margin, turned into an edge map the same way, and correlated with the
picture by normalised cross-correlation (FFT, window sums from integral
images). Halving the picture again and again covers every larger size, so a
mark from 10 px to the whole frame is found with one octave of templates.
Every peak above SEARCH_MIN is a candidate.

Search keeps the best four candidates in every octave, so the text of a busy
page cannot crowd out a large mark. Check: each candidate is fitted again on
the picture itself, brought to at most 32 px tall (finer, a metallic or
dithered fill draws edges of its own inside the mark), at heights from 0.88 to 1.12 of the found one: the edge
correlation there is `score`, the template's
correlation of its intensity (either polarity) is `agree`, and how much the
ground margin around it varies against the mark's contrast is `clutter`.
Text that edges like a G and a T does not also lay its ink where the doubled
lines are; below 12 px a letter fits about as well as the mark, and only the
neighbouring letters in its margin tell it apart. logo-pixels.mjs holds the
thresholds. Raise VERSION when a change here changes what is found: the
cache is keyed by it.

usage: python3 scripts/lint/logo-pixels.py <masks-dir> <jobs.json> <results.jsonl> [workers]
jobs.json is a list of {key, file}; each result is appended to results.jsonl
as one JSON line {key, file, size, found: {template: [candidate, ...]}} the
moment it is done, so an interrupted run resumes where it stopped.
"""
import json
import os
import sys
from functools import lru_cache
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageSequence

VERSION = 6
SHORT_SIDE = 1200
H_MIN = 10
STEP = 1.08
SEARCH_MIN = 0.42
MARGIN = 0.18
CHECK_H = 32
PER_OCTAVE = 4

MASKS = {}


def load_masks(folder):
    for name in sorted(os.listdir(folder)):
        if not name.endswith('.png'):
            continue
        a = np.asarray(Image.open(os.path.join(folder, name)).convert('L')).astype(np.float32) / 255
        ys, xs = np.nonzero(a > 0.02)
        MASKS[name[:-4]] = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def resize(a, h, w, method=Image.BOX):
    img = Image.fromarray(np.ascontiguousarray(a, dtype=np.float32), mode='F')
    return np.asarray(img.resize((max(1, int(w)), max(1, int(h))), method), dtype=np.float32)


def edges(a):
    gx = np.zeros_like(a)
    gy = np.zeros_like(a)
    gx[:, 1:-1] = a[:, 2:] - a[:, :-2]
    gy[1:-1, :] = a[2:, :] - a[:-2, :]
    return np.hypot(gx, gy)


def template(name, h):
    """The mask drawn h px tall, with a ground margin on every side: (ink 0..1, edge map, margin)."""
    return _template(name, round(float(h), 2))


@lru_cache(maxsize=4096)
def _template(name, h):
    m = MASKS[name]
    w = max(1, round(h * m.shape[1] / m.shape[0]))
    t = resize(m, round(h), w, Image.LANCZOS)
    p = max(2, round(MARGIN * h))
    t = np.pad(t, p)
    return t, edges(t), p


def fast_len(n):
    best = 1 << (n - 1).bit_length()
    f5 = 1
    while f5 < best:
        f35 = f5
        while f35 < best:
            f = f35
            while f < n:
                f *= 2
            best = min(best, f)
            f35 *= 3
        f5 *= 5
    return best


class Correlator:
    """Normalised cross-correlation of templates up to (th, tw) against one picture."""

    def __init__(self, image, th, tw):
        image = np.asarray(image, dtype=np.float32)
        self.I = image
        H, W = image.shape
        self.P = (fast_len(H + th), fast_len(W + tw))
        self.F = np.fft.rfft2(image, s=self.P)
        z = np.zeros((1, W + 1))
        i64 = image.astype(np.float64)
        self.S = np.vstack([z, np.hstack([np.zeros((H, 1)), i64.cumsum(0).cumsum(1)])])
        self.S2 = np.vstack([z, np.hstack([np.zeros((H, 1)), (i64 * i64).cumsum(0).cumsum(1)])])
        self.norms = {}

    def norm(self, th, tw):
        """The picture's standard deviation times the window size under every th x tw window (inf where flat)."""
        if (th, tw) not in self.norms:
            S, S2 = self.S, self.S2
            n = th * tw
            s1 = S[th:, tw:] - S[:-th, tw:] - S[th:, :-tw] + S[:-th, :-tw]
            s2 = S2[th:, tw:] - S2[:-th, tw:] - S2[th:, :-tw] + S2[:-th, :-tw]
            var = (s2 - s1 * s1 / n).astype(np.float32)
            self.norms[(th, tw)] = np.where(var < n * 1e-4, np.inf, np.sqrt(np.maximum(var, 0)))
        return self.norms[(th, tw)]

    def map(self, T):
        th, tw = T.shape
        H, W = self.I.shape
        if th > H or tw > W:
            return None
        Tz = T - T.mean()
        tn = np.sqrt((Tz * Tz).sum())
        if tn == 0:
            return None
        G = np.fft.rfft2(np.ascontiguousarray(Tz[::-1, ::-1], dtype=np.float32), s=self.P)
        num = np.fft.irfft2(self.F * G, s=self.P)[th - 1:H, tw - 1:W]
        return num / (tn * self.norm(th, tw))


def peaks(r, thr, k, spread):
    """Up to k local maxima of r at or above thr, at least `spread` apart."""
    out = []
    r = r.copy()
    for _ in range(k):
        i = int(np.argmax(r))
        y, x = divmod(i, r.shape[1])
        v = float(r[y, x])
        if not v >= thr:
            break
        out.append((v, y, x))
        r[max(0, y - spread):y + spread + 1, max(0, x - spread):x + spread + 1] = -1
    return out


def luminance(img):
    """The picture's luminance 0..1; a transparent picture is laid on the ground that sets its ink apart."""
    if img.mode in ('RGBA', 'LA', 'PA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        a = np.asarray(img).astype(np.float32) / 255
        lum = a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722
        alpha = a[..., 3]
        if alpha.min() < 0.98:
            ink = lum[alpha > 0.5]
            ground = 0.0 if ink.size and ink.mean() > 0.5 else 1.0
            return lum * alpha + ground * (1 - alpha)
        return lum
    return np.asarray(img.convert('L')).astype(np.float32) / 255


def frames(path):
    img = Image.open(path)
    n = getattr(img, 'n_frames', 1)
    if n <= 1:
        return [('', luminance(img))]
    out = []
    for i in sorted({0, n - 1}):
        img.seek(i)
        out.append((f'frame {i}', luminance(img.copy())))
    return out


def search(full):
    """Candidates for every template in one picture: [(name, score, x, y, h)] in the picture's pixels."""
    H, W = full.shape
    s0 = max(1.0, min(H, W) / SHORT_SIDE)
    level = resize(full, round(H / s0), round(W / s0)) if s0 > 1 else full
    scale = s0
    heights = []
    h = H_MIN
    while h < 2 * H_MIN - 1e-6:
        heights.append(h)
        h *= STEP
    found = {name: [] for name in MASKS}
    while min(level.shape) >= H_MIN * (1 + 2 * MARGIN) + 2:
        pad = round(H_MIN * 2 * MARGIN) + 2
        img = np.pad(level, pad, mode='edge')
        E = edges(img)
        temps = {name: [(h, *template(name, h)) for h in heights] for name in MASKS}
        th = max(t[2].shape[0] for ts in temps.values() for t in ts)
        tw = max(t[2].shape[1] for ts in temps.values() for t in ts)
        # a template larger than this level is skipped (Correlator.map), the others still run
        if min(t[2].shape[0] for ts in temps.values() for t in ts) <= E.shape[0]:
            C = Correlator(E, min(th, E.shape[0]), min(tw, E.shape[1]))
            for name, ts in temps.items():
                for h, t, te, p in ts:
                    r = C.map(te)
                    if r is None:
                        continue
                    for v, y, x in peaks(r, SEARCH_MIN, 4, max(3, round(h / 2))):
                        found[name].append((v, (x + p - pad) * scale, (y + p - pad) * scale, h * scale, scale))
        level = resize(level, level.shape[0] // 2, level.shape[1] // 2)
        scale *= 2
    out = {}
    for name, cands in found.items():
        cands.sort(key=lambda c: -c[0])
        kept = []
        per = {}
        for c in cands:
            # the best few in every octave: text on a busy page outscores a large mark at its own size
            if per.get(c[4], 0) >= PER_OCTAVE:
                continue
            if all(abs(c[1] - k[1]) > k[3] * 0.5 or abs(c[2] - k[2]) > k[3] * 0.5 or not (0.6 < c[3] / k[3] < 1.66) for k in kept):
                kept.append(c)
                per[c[4]] = per.get(c[4], 0) + 1
        out[name] = [c[:4] for c in kept]
    return out


def check(full, name, x, y, h):
    """Fits the template again around (x, y, h) on the picture: its score, agreement and box."""
    m = MASKS[name]
    ar = m.shape[1] / m.shape[0]
    H, W = full.shape
    v = min(1.0, CHECK_H / h)
    pad = h * 0.35 + 3
    x0, y0 = int(max(0, x - pad)), int(max(0, y - pad))
    x1, y1 = int(min(W, x + h * ar + pad + 1)), int(min(H, y + h + pad + 1))
    crop = full[y0:y1, x0:x1]
    if v < 1:
        crop = resize(crop, round(crop.shape[0] * v), round(crop.shape[1] * v))
    hh0 = h * v
    best = None
    E = edges(np.pad(crop, 3, mode='edge'))
    fits = [template(name, hh0 * f) for f in np.arange(0.88, 1.121, 0.02)]
    C = Correlator(E, max(f[1].shape[0] for f in fits), max(f[1].shape[1] for f in fits))
    for t, te, p in fits:
        r = C.map(te)
        if r is None:
            continue
        i = int(np.argmax(r))
        yy, xx = divmod(i, r.shape[1])
        if best is None or r[yy, xx] > best[0]:
            best = (float(r[yy, xx]), yy - 3, xx - 3, t, p)
    if best is None:
        return None
    score, yy, xx, t, p = best
    th, tw = t.shape
    win = np.pad(crop, ((th, th), (tw, tw)), mode='edge')[yy + th:yy + 2 * th, xx + tw:xx + 2 * tw]
    tb = t > 0.5
    if tb.sum() < 6 or (~tb).sum() < 6:
        return None
    ink_mean, ground_mean = win[tb].mean(), win[~tb].mean()
    wz = win - win.mean()
    tz = t - t.mean()
    den = np.sqrt((wz * wz).sum() * (tz * tz).sum())
    agree = float(abs((wz * tz).sum()) / den) if den > 0 and abs(ink_mean - ground_mean) >= 0.04 else 0.0
    # clutter: how much the ground margin around the mark varies, against the mark's own contrast; a letter
    # inside a word has its neighbours there, a logo stands alone
    ring = np.ones_like(tb)
    ring[p:th - p, p:tw - p] = False
    clutter = float(win[ring].std() / max(abs(ink_mean - ground_mean), 1e-3))
    bx = x0 + (xx + p) / v
    by = y0 + (yy + p) / v
    bh = (th - 2 * p) / v
    return {'score': round(score, 4), 'agree': round(agree, 4), 'box': [round(bx), round(by), round((tw - 2 * p) / v), round(bh)], 'h': round(bh, 1),
            'contrast': round(float(abs(ink_mean - ground_mean)), 3), 'clutter': round(clutter, 3)}


def run(job):
    try:
        out = {'key': job['key'], 'file': job['file'], 'version': VERSION, 'found': {}}
        for label, full in frames(job['file']):
            out['size'] = [full.shape[1], full.shape[0]]
            for name, cands in search(full).items():
                for v, x, y, h in cands:
                    c = check(full, name, x, y, h)
                    if c:
                        c['search'] = round(v, 4)
                        if label:
                            c['frame'] = label
                        out['found'].setdefault(name, []).append(c)
        for name in out['found']:
            out['found'][name].sort(key=lambda c: -(c['score'] * c['agree']))
        return out
    except Exception as error:  # a picture Pillow cannot read is reported, not fatal
        return {'key': job['key'], 'file': job['file'], 'version': VERSION, 'error': f'{type(error).__name__}: {error}'}


def main():
    masks, jobs_path, results_path = sys.argv[1:4]
    workers = int(sys.argv[4]) if len(sys.argv) > 4 else max(1, (os.cpu_count() or 2) // 2)
    jobs = json.load(open(jobs_path))
    with open(results_path, 'a') as sink:
        with Pool(workers, initializer=load_masks, initargs=(masks,)) as pool:
            done = 0
            for result in pool.imap_unordered(run, jobs, chunksize=1):
                sink.write(json.dumps(result) + '\n')
                sink.flush()
                done += 1
                if done % 50 == 0 or done == len(jobs):
                    print(f'logo-pixels: {done}/{len(jobs)}', file=sys.stderr, flush=True)


if __name__ == '__main__':
    main()
