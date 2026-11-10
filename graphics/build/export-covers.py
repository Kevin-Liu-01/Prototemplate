#!/usr/bin/env python3
"""Export the cover pages (gen-covers.js, area P) to the names the posts use.

Each file is the published cover at its own size with only the area around the old mark taken from the render,
so every other pixel stays as published.
usage: export-covers.py [--dest DIR ...] [id ...]
Writes each file into public/static/blogs and every --dest (a landing checkout's public/static/blogs).
"""
import argparse, json, pathlib
from PIL import Image

SP = pathlib.Path(__file__).resolve().parents[1]
OUT = SP / 'build' / 'out'
# id: (published path under static/blogs, source under shots/covers)
COVERS = {
    'P1-open-source': ('supporting-open-source-software.png', 'open-source.png'),
    'P2-fumadocs': ('fumadocs.png', 'fumadocs.png'),
    'P3-fuma-nama-og': ('fuma-nama-og.png', 'fuma-nama-og.png'),
    'P4-cuelume': ('daniel-white/cover.webp', 'cuelume.webp'),
    'P4-cuelume-og': ('daniel-white/og.png', 'cuelume-og.png'),
    'P5-slash': ('supporting-slash-companies.jpg', 'slash.jpg'),
    'P6-rewriting-docs-spine': ('rewriting-docs-spine.png', 'spine.png'),
}
PAD = 8  # source px around the mark's box, enough for the removed mark's anti-aliased edge
manifest = {m['id']: m for m in json.loads((SP / 'build' / 'manifest.json').read_text())}
ap = argparse.ArgumentParser(); ap.add_argument('--dest', type=pathlib.Path, action='append', default=[]); ap.add_argument('ids', nargs='*'); a = ap.parse_args()
dests = [SP.parent / 'public' / 'static' / 'blogs', *a.dest]
for i in (a.ids or COVERS):
    name, src = COVERS[i]
    im = Image.open(SP / 'shots' / 'covers' / src).convert('RGB')
    x0, y0, x1, y1 = manifest[i]['src']['mark']
    box = (x0 - PAD, y0 - PAD, x1 + 1 + PAD, y1 + 1 + PAD)
    im.paste(Image.open(OUT / f'{i}.png').convert('RGB').resize(im.size, Image.BOX).crop(box), box[:2])
    for d in dests:
        p = d / name; p.parent.mkdir(parents=True, exist_ok=True)
        if p.suffix == '.webp': im.save(p, 'WEBP', quality=95, method=6)
        elif p.suffix == '.jpg': im.save(p, 'JPEG', quality=92, optimize=True, progressive=True)
        else: im.save(p, 'PNG', optimize=True)
        print(f'{p} {im.width}x{im.height} {p.stat().st_size // 1024} KB')
