#!/usr/bin/env python3
"""Both theme covers and the social card of the "Rewriting our docs" post, from their published grounds.

The published cover was the light docs Introduction page floating on a blue dither ground, captured at about 1505 CSS
px, and the social card the same page on its own crop of that ground. Each keeps its framing: the page card is found in
the published ground, the ground around it is re-screened at 2 stage px a cell by redither.py (5 px in the 3840 cover,
4 px in the 2400 card), and a fresh capture of the page is laid into the frame: graphics/shots/hi/intro-light.webp for
the light cover and the card, intro.webp for the dark cover. Both captures are 1440 CSS px wide and share one layout,
and both get the same scale, crop and corner radius, so a theme switch swaps the page without anything moving.

usage: rewriting-covers.py [--dest DIR ...]
Writes rewriting-our-docs.png (light), rewriting-our-docs-dark.png (dark) and rewriting-our-docs-og.png into
public/static/blogs and every --dest.
"""
import argparse, pathlib, subprocess, sys, tempfile
from PIL import Image, ImageDraw
import numpy as np

SP = pathlib.Path(__file__).resolve().parents[1]
ap = argparse.ArgumentParser()
ap.add_argument('--dest', type=pathlib.Path, action='append', default=[], help='extra folders that serve /static/blogs (a landing checkout)')
a = ap.parse_args()
dests = [SP.parent / 'public/static/blogs', *a.dest]
HAIRLINE = (250, 250, 250, 64)  # the dark page needs an edge to separate it from the dark ground; the light page is its own edge
# ground, output size, cell px, the pages laid into it as (file name, capture, hairline)
SETS = [
    ('rewriting-cover-ground.png', (3840, 2160), 5, [('rewriting-our-docs.png', 'hi/intro-light.webp', None), ('rewriting-our-docs-dark.png', 'hi/intro.webp', HAIRLINE)]),
    ('rewriting-og-ground.png', (2400, 1260), 4, [('rewriting-our-docs-og.png', 'hi/intro-light.webp', None)]),
]


def frame_of(px):
    """The page card: the one large near-white region of the published ground."""
    white = (px[..., 0] > 235) & (px[..., 1] > 235) & (px[..., 2] > 235)
    rows = np.where(white.mean(axis=1) > 0.5)[0]; cols = np.where(white.mean(axis=0) > 0.5)[0]
    return int(cols.min()), int(rows.min()), int(cols.max()) + 1, int(rows.max()) + 1


for ground_name, (W, H), cell, pages in SETS:
    src = SP / 'shots' / ground_name
    px = np.asarray(Image.open(src).convert('RGB'))
    fx0, fy0, fx1, fy1 = frame_of(px)
    k = W / px.shape[1]
    with tempfile.TemporaryDirectory() as tmp:
        fine = pathlib.Path(tmp) / 'ground.png'
        hole = f'{fx0 - 6},{fy0 - 6},{fx1 + 6},{fy1 + 6}'  # the old card and its anti-aliased edge are read from the ground around them
        subprocess.run([sys.executable, str(SP / 'build/redither.py'), str(src), str(fine), f'0,0,{px.shape[1]},{px.shape[0]}', f'{W}x{H}', str(cell), '--src-cell', '4', '--hole-all', hole], check=True)
        base = Image.open(fine).convert('RGBA')
    x0, y0, x1, y1 = (round(v * k) for v in (fx0, fy0, fx1, fy1))
    w, h = x1 - x0, y1 - y0
    scale = w / 1440
    print(f'{ground_name}: page frame x {x0}..{x1}, y {y0}..{y1} ({w}x{h}); {scale:.4f} px per CSS px')
    radius = max(4, round(8 * scale))  # the radius the light card carries, about 8 CSS px

    def page_from(shot_path):
        shot = Image.open(shot_path).convert('RGBA')
        page = shot.resize((w, round(shot.height * w / shot.width)), Image.LANCZOS).crop((0, 0, w, h))
        mask = Image.new('L', (w, h), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255)
        page.putalpha(mask); return page

    for name, shot, hairline in pages:
        out = base.copy(); out.alpha_composite(page_from(SP / 'shots' / shot), (x0, y0))
        if hairline:
            line = Image.new('RGBA', out.size, (0, 0, 0, 0))
            ImageDraw.Draw(line).rounded_rectangle((x0, y0, x1 - 1, y1 - 1), radius=radius, outline=hairline, width=max(1, round(scale)))
            out.alpha_composite(line)
        out = out.convert('RGB')
        for d in dests:
            p = d / name; out.save(p, 'PNG', optimize=True); print(f'wrote {p} {out.size} {p.stat().st_size // 1024} KB')
