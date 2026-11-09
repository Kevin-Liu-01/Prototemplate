#!/usr/bin/env python3
"""Print the cover grounds through the 8x8 Bayer screen.

Each ground is a textless material render (a deck opener or a glyphfield
export) read as luminance, cut to the stage's aspect and printed in a few
tones of one palette at one cell per pixel. The page draws the file at the
stage size with image-rendering: pixelated, so a cell is CELL CSS px.

usage: cover-grounds.py [name ...]
Writes graphics/bg/covers/<name>.png (graphics/bg links to public/graphics/bg), and
graphics/shots/logos/cuelume-mark.png: the white shape of Cuelume's app icon
(logos/cuelume.png on generaltranslation.com) on alpha, for the dark covers.
"""
import pathlib, sys
from PIL import Image, ImageFilter
import numpy as np

SP = pathlib.Path(__file__).resolve().parents[1]
ROOT = SP.parent
OUT = SP / 'bg' / 'covers'
CELL = 3  # CSS px per cell on a 1600 by 900 stage

# source, blur radius in source px (a dithered source is blurred back to tone first), tone curve gamma, palette from dark to light, flip
GROUNDS = {
    'open-source-blue': (ROOT / 'deck/shots/opener-blog.jpg', 0, 1.0, ['#2f5ce0', '#4870ea', '#7095f4', '#a9c2ff'], False),
    'fire': (ROOT / 'deck/shots/opener-developer-experience.jpg', 0, 1.15, ['#070707', '#7a2508', '#fe5b16', '#ffb37a'], False),
    'green': (SP / 'bg/user/u54.webp', 5, 1.1, ['#050d08', '#0e4d2c', '#1f7a4a', '#46a877'], False),
    'gold': (SP / 'bg/user/u27.webp', 5, 1.1, ['#0d0b05', '#5c5124', '#b4a157', '#e9dd9c'], False),
}

def bayer8():
    m = np.array([[0]])
    for _ in range(3):
        m = np.block([[4 * m, 4 * m + 2], [4 * m + 3, 4 * m + 1]])
    return m

def hexrgb(h):
    h = h.lstrip('#'); return [int(h[i:i + 2], 16) for i in (0, 2, 4)]

def ground(name, w=1600, h=900):
    src, blur, gamma, palette, flip = GROUNDS[name]
    im = Image.open(src).convert('L')
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    sw, sh = im.size; target = w / h
    if sw / sh > target:
        cw = round(sh * target); im = im.crop(((sw - cw) // 2, 0, (sw - cw) // 2 + cw, sh))
    else:
        ch = round(sw / target); im = im.crop((0, (sh - ch) // 2, sw, (sh - ch) // 2 + ch))
    gw, gh = w // CELL, h // CELL
    t = np.asarray(im.resize((gw, gh), Image.LANCZOS), dtype=np.float64) / 255.0
    lo, hi = np.percentile(t, 0.5), np.percentile(t, 99.5)
    t = np.clip((t - lo) / max(hi - lo, 1e-6), 0, 1) ** gamma
    if flip: t = 1 - t
    n = len(palette) - 1
    v = t * n; base = np.floor(v).clip(0, n - 1); frac = v - base
    m = bayer8(); thr = (m[np.arange(gh)[:, None] % 8, np.arange(gw)[None, :] % 8] + 0.5) / 64
    idx = (base + (frac > thr)).astype(int).clip(0, n)
    pal = np.array([hexrgb(c) for c in palette], dtype=np.uint8)
    out = Image.fromarray(pal[idx], 'RGB')
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f'{name}.png'; out.save(path, optimize=True)
    print(f'{path.relative_to(ROOT)} {gw}x{gh} cells of {CELL} CSS px, {len(palette)} tones')

def cuelume_mark():
    icon = np.asarray(Image.open(SP / 'shots/logos/cuelume.png').convert('RGB'), dtype=np.float64)
    lum = icon.mean(axis=2)
    alpha = np.clip((lum - 200) / 40, 0, 1)  # the shape is #fbfaf9 on a #2a2a28 tile; the ramp keeps its anti-aliased edge
    ys, xs = np.where(alpha > 0.02)
    a = (alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1] * 255).astype(np.uint8)
    out = Image.new('RGBA', (a.shape[1], a.shape[0]), (255, 255, 255, 0)); out.putalpha(Image.fromarray(a, 'L'))
    path = SP / 'shots/logos/cuelume-mark.png'; out.save(path, optimize=True); print(f'{path.relative_to(ROOT)} {out.size}')

for name in (sys.argv[1:] or [*GROUNDS, 'cuelume-mark']):
    cuelume_mark() if name == 'cuelume-mark' else ground(name)
