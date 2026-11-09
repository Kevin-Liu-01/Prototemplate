#!/usr/bin/env python3
"""Export the rendered cover pages (gen-covers.js, area P) to the names the posts use.

usage: export-covers.py [--dest DIR ...] [id ...]
Writes each file into public/static/blogs and every --dest (a landing checkout's public/static/blogs).
"""
import argparse, pathlib
from PIL import Image

SP = pathlib.Path(__file__).resolve().parents[1]
OUT = SP / 'build' / 'out'
# id: (published path under static/blogs, width, height)
COVERS = {
    'P1-open-source': ('supporting-open-source-software.png', 1920, 1080),
    'P2-fumadocs': ('fumadocs.png', 1920, 1080),
    'P3-fuma-nama-og': ('fuma-nama-og.png', 1920, 1008),
    'P4-cuelume': ('daniel-white/cover.webp', 1920, 1080),
    'P4-cuelume-og': ('daniel-white/og.png', 1920, 1008),
    'P5-slash': ('supporting-slash-companies.jpg', 1920, 1008),
    'P6-rewriting-docs-spine': ('rewriting-docs-spine.png', 1920, 1080),
}
ap = argparse.ArgumentParser(); ap.add_argument('--dest', type=pathlib.Path, action='append', default=[]); ap.add_argument('ids', nargs='*'); a = ap.parse_args()
dests = [SP.parent / 'public' / 'static' / 'blogs', *a.dest]
for i in (a.ids or COVERS):
    name, w, h = COVERS[i]
    im = Image.open(OUT / f'{i}.png').convert('RGB').resize((w, h), Image.LANCZOS)
    for d in dests:
        p = d / name; p.parent.mkdir(parents=True, exist_ok=True)
        if p.suffix == '.webp': im.save(p, 'WEBP', quality=95, method=6)
        elif p.suffix == '.jpg': im.save(p, 'JPEG', quality=92, optimize=True, progressive=True)
        else: im.save(p, 'PNG', optimize=True)
        print(f'{p} {w}x{h} {p.stat().st_size // 1024} KB')
