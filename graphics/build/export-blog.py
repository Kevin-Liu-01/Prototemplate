#!/usr/bin/env python3
"""Export the rendered visuals for the gt-cloud blog post.

usage: export-blog.py [--width 3840] [--quality 95] [--covers] [--dest DIR] [id ...]
Writes designing-docs-<id>.webp for every non-cover visual (or the given ids)
into public/static/blogs (or --dest) and copies the GIF clips.
"""
import argparse, pathlib, shutil, sys
from PIL import Image

SP = pathlib.Path(__file__).resolve().parents[1]
OUT = SP / 'build' / 'out'
DEFAULT_DST = SP.parent / 'public' / 'static' / 'blogs'  # Prototemplate hosts the exports; pass --dest for a landing checkout
VIDEOS = {'E1-hover-mask': 'designing-docs-toc-slide', 'E6-sidebar-mask': 'designing-docs-sidebar-mask'}

ap = argparse.ArgumentParser(); ap.add_argument('--width', type=int, default=3840); ap.add_argument('--quality', type=int, default=95); ap.add_argument('--covers', action='store_true', help='also export the header cover (3840 webp) and OG image (2400x1260 png)'); ap.add_argument('--dest', type=pathlib.Path, default=DEFAULT_DST, help='folder that serves /static/blogs (default: this repo\'s public/static/blogs)'); ap.add_argument('ids', nargs='*')
a = ap.parse_args()
DST = a.dest; DST.mkdir(parents=True, exist_ok=True)
SKIP = {'F1-hit-list'}  # the hit list renders as text in the article; the poster was retired
POST_COVERS = {'H0-cover-final'}  # cover renders the post embeds as ordinary figures, exported with the set
ids = a.ids or sorted(p.stem for p in OUT.glob('*.png') if not p.stem.startswith('_') and (not p.stem.startswith('H') or p.stem in POST_COVERS) and p.stem not in SKIP)
total = 0
for i in ids:
    im = Image.open(OUT / f'{i}.png').convert('RGB')
    if im.width != a.width:
        im = im.resize((a.width, round(im.height * a.width / im.width)), Image.LANCZOS)
    out = DST / f'designing-docs-{i}.webp'
    im.save(out, 'WEBP', quality=a.quality, method=6)
    kb = out.stat().st_size // 1024; total += kb
    print(f'{out.name:48s} {im.width}x{im.height} {kb:5d} KB')
for i, name in VIDEOS.items():
    if a.ids and i not in a.ids: continue
    for ext in ('gif',):  # the post embeds the clips as GIFs; mp4s stay in build/out only
        src = OUT / f'{i}.{ext}'
        if src.exists():
            shutil.copy(src, DST / f'{name}.{ext}'); print(f'{name}.{ext:4s} {src.stat().st_size // 1024:5d} KB')
print(f'total webp {total/1024:.1f} MB over {len(ids)} images')
if a.covers:
    cov = Image.open(OUT / 'H1-cover-exploded.png').convert('RGB')
    out = DST / 'designing-docs.webp'; cov.save(out, 'WEBP', quality=95, method=6); print(f'{out.name:48s} {cov.width}x{cov.height} {out.stat().st_size // 1024:5d} KB')
    og = Image.open(OUT / 'H1-cover-exploded-og.png').convert('RGB').resize((2400, 1260), Image.LANCZOS)
    out = DST / 'designing-docs-og.png'; og.save(out, 'PNG', optimize=True); print(f'{out.name:48s} {og.width}x{og.height} {out.stat().st_size // 1024:5d} KB')
    light = Image.open(OUT / 'H1-cover-exploded-light.png').convert('RGB')
    out = DST / 'designing-docs-light.webp'; light.save(out, 'WEBP', quality=95, method=6); print(f'{out.name:48s} {light.width}x{light.height} {out.stat().st_size // 1024:5d} KB')
    ogl = Image.open(OUT / 'H1-cover-exploded-og-light.png').convert('RGB').resize((2400, 1260), Image.LANCZOS)
    out = DST / 'designing-docs-og-light.png'; ogl.save(out, 'PNG', optimize=True); print(f'{out.name:48s} {ogl.width}x{ogl.height} {out.stat().st_size // 1024:5d} KB')
    stale = DST / 'designing-docs.png'
    if stale.exists(): stale.unlink(); print('removed stale designing-docs.png')
