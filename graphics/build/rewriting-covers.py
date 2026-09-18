#!/usr/bin/env python3
"""Both theme covers of the "Rewriting our docs" post, from one ground.

The published cover was the light docs Introduction page floating on a blue
dither ground, captured at about 1505 CSS px. This keeps that ground and
framing pixel for pixel and lays a fresh capture of the page into the frame:
graphics/shots/hi/intro-light.webp for the light cover and intro.webp for the
dark one. Both captures are 1440 CSS px wide and share one layout, and both
get the same scale, crop and corner radius, so a theme switch swaps the page
without anything moving.

usage: rewriting-covers.py [--ground graphics/shots/rewriting-cover-ground.png] [--dest DIR ...]
Writes rewriting-our-docs.png (light) and rewriting-our-docs-dark.png (dark)
into public/static/blogs and every --dest.
"""
import argparse, pathlib
from PIL import Image, ImageDraw
import numpy as np

SP = pathlib.Path(__file__).resolve().parents[1]
ap = argparse.ArgumentParser()
ap.add_argument('--ground', type=pathlib.Path, default=SP / 'shots/rewriting-cover-ground.png')
ap.add_argument('--dest', type=pathlib.Path, action='append', default=[], help='extra folders that serve /static/blogs (a landing checkout)')
a = ap.parse_args()
dests = [SP.parent / 'public/static/blogs', *a.dest]

ground = Image.open(a.ground).convert('RGBA')
px = np.asarray(ground)
# the page card is the one large near-white region of the ground; its bounding box is the frame to fill
white = (px[..., 0] > 235) & (px[..., 1] > 235) & (px[..., 2] > 235)
rows = np.where(white.mean(axis=1) > 0.5)[0]; cols = np.where(white.mean(axis=0) > 0.5)[0]
x0, x1, y0, y1 = int(cols.min()), int(cols.max()) + 1, int(rows.min()), int(rows.max()) + 1
w, h = x1 - x0, y1 - y0
scale = w / 1440
print(f'page frame in the ground: x {x0}..{x1}, y {y0}..{y1} ({w}x{h}); 1440 CSS px across it = {scale:.4f} px per CSS px')

# rounded corners, the radius the light card carries (about 8 CSS px)
radius = max(4, round(8 * scale))
hole = Image.new('L', ground.size, 0); ImageDraw.Draw(hole).rounded_rectangle((x0, y0, x1 - 1, y1 - 1), radius=radius, fill=255)
hole_px = np.asarray(hole) > 0
# the ground with the card cleared to the dark tone just outside it, so neither page's edge bleeds the other's colour
edge = np.median(px[y0:y1, max(0, x0 - 12):x0].reshape(-1, 4), axis=0).astype(np.uint8)
cleared = px.copy(); cleared[hole_px] = edge
base = Image.fromarray(cleared, 'RGBA')

def page_from(shot_path):
    shot = Image.open(shot_path).convert('RGBA')
    # the capture's 1440 CSS px span the frame's width; the frame's height cuts the page
    page = shot.resize((w, round(shot.height * w / shot.width)), Image.LANCZOS).crop((0, 0, w, h))
    mask = Image.new('L', (w, h), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255)
    page.putalpha(mask); return page

for name, shot, hairline in (('rewriting-our-docs.png', 'hi/intro-light.webp', None), ('rewriting-our-docs-dark.png', 'hi/intro.webp', (250, 250, 250, 64))):
    out = base.copy(); out.alpha_composite(page_from(SP / 'shots' / shot), (x0, y0))
    if hairline:  # the dark page needs an edge to separate from the dark ground; the light page is its own edge
        ImageDraw.Draw(out).rounded_rectangle((x0, y0, x1 - 1, y1 - 1), radius=radius, outline=hairline, width=1)
    for d in dests:
        p = d / name; out.save(p, 'PNG', optimize=True); print(f'wrote {p} {out.size} {p.stat().st_size // 1024} KB')
