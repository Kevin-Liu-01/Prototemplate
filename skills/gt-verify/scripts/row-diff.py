#!/usr/bin/env python3
"""row-diff.py: compares before and after screenshots of the same pages row by row and writes a side-by-side crop of every changed block (gt-verify references/parity-review.md).

Rows are aligned first (difflib.SequenceMatcher over a hash of each pixel
row), so a band inserted or removed in one shot does not mark everything
below it as changed. Inside aligned blocks of equal height, a pixel counts
as changed when any channel differs by more than 16. Changed rows closer
than 24 px join one block, and blocks of an aligned diff closer than 40 px
merge. Every changed block of the before and fix pair gets a side-by-side
crop (before on the left, fix on the right, a red divider between them).

The shots folder holds one PNG per side and key:
  before--<key>.png    the reference build
  fix--<key>.png       the change under review
  before2--<key>.png   optional: a second capture of the reference, the
                       noise pair, which shows what capture timing alone
                       changes
Both images of a pair must have the same width; a pair whose widths differ
is reported with an error and no blocks.

Usage:
  python3 row-diff.py <shotsdir> <outdir> [filter]
  python3 row-diff.py --help

filter keeps the keys that contain it. It prints one line per key with the
changed pixels, the block count and both heights for the noise and fix
pairs, and writes <outdir>/summary.json (summary-<filter>.json with a
filter) and <outdir>/crops/<key>--NN.png, at most 60 per key. A key with
all three shots is cached in <outdir>/keys/<key>.json and read back on the
next run unless FORCE=1 is set. In the JSON, a block's a and b are its row
ranges in each image, x its column range, and px its changed pixels (-1 for
rows that one side inserted or removed).

Requires: Python 3.9 or later, numpy and Pillow (requirements.txt).
Last real run: 2026-10-09, the docs parity audit that became gt-cloud
#5258 (New Onboarding and Dashboard session), 120 page and viewport keys
with a noise pair each, as diff.py. Copied into this skill on 2026-10-10.
"""
import difflib
import glob
import hashlib
import json
import os
import sys

import numpy as np
from PIL import Image

THRESHOLD = 16
ROW_GAP = 24
MERGE_GAP = 40
MAX_CROPS = 60


def load(path):
    return np.asarray(Image.open(path).convert('RGB'))


def row_hashes(a):
    return [hashlib.md5(a[y].tobytes()).digest() for y in range(a.shape[0])]


def changed_mask(a, b):
    d = np.abs(a.astype(np.int16) - b.astype(np.int16)).max(axis=2)
    return d > THRESHOLD


def bands_from_rows(rows, gap=ROW_GAP):
    """Runs of changed rows as [start, end) pairs; runs closer than gap join."""
    ys = np.where(rows)[0]
    if len(ys) == 0:
        return []
    out = []
    s = p = ys[0]
    for y in ys[1:]:
        if y - p > gap:
            out.append((s, p + 1))
            s = y
        p = y
    out.append((s, p + 1))
    return out


def compare(a, b):
    """The changed blocks between two images of one width, or a dict with an error."""
    if a.shape[1] != b.shape[1]:
        return {'error': 'width differs', 'wa': a.shape[1], 'wb': b.shape[1]}
    res = {'ha': a.shape[0], 'hb': b.shape[0], 'blocks': [], 'changed_px': 0}
    if a.shape == b.shape:
        m = changed_mask(a, b)
        res['changed_px'] = int(m.sum())
        for y0, y1 in bands_from_rows(m.any(axis=1)):
            cols = np.where(m[y0:y1].any(axis=0))[0]
            res['blocks'].append({'kind': 'replace', 'a': [int(y0), int(y1)], 'b': [int(y0), int(y1)],
                                  'x': [int(cols[0]), int(cols[-1]) + 1], 'px': int(m[y0:y1].sum())})
        return res
    ha, hb = row_hashes(a), row_hashes(b)
    sm = difflib.SequenceMatcher(None, ha, hb, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            continue
        if tag == 'replace' and (i2 - i1) == (j2 - j1):
            m = changed_mask(a[i1:i2], b[j1:j2])
            if not m.any():
                continue
            for y0, y1 in bands_from_rows(m.any(axis=1)):
                cols = np.where(m[y0:y1].any(axis=0))[0]
                px = int(m[y0:y1].sum())
                res['changed_px'] += px
                res['blocks'].append({'kind': 'replace', 'a': [i1 + int(y0), i1 + int(y1)], 'b': [j1 + int(y0), j1 + int(y1)],
                                      'x': [int(cols[0]), int(cols[-1]) + 1], 'px': px})
        else:
            res['changed_px'] += max(i2 - i1, j2 - j1) * a.shape[1]
            res['blocks'].append({'kind': tag, 'a': [i1, i2], 'b': [j1, j2], 'x': [0, a.shape[1]], 'px': -1})
    merged = []
    for bl in sorted(res['blocks'], key=lambda b: b['a'][0]):
        if merged and bl['a'][0] - merged[-1]['a'][1] < MERGE_GAP and bl['b'][0] - merged[-1]['b'][1] < MERGE_GAP:
            m = merged[-1]
            m['a'][1] = max(m['a'][1], bl['a'][1])
            m['b'][1] = max(m['b'][1], bl['b'][1])
            m['x'] = [min(m['x'][0], bl['x'][0]), max(m['x'][1], bl['x'][1])]
            m['kind'] = m['kind'] if m['kind'] == bl['kind'] else 'mixed'
            m['px'] = -1 if (m['px'] < 0 or bl['px'] < 0) else m['px'] + bl['px']
        else:
            merged.append(dict(bl, a=list(bl['a']), b=list(bl['b'])))
    res['blocks'] = merged
    return res


def crop_pair(a, b, bl, path, margin=40):
    """Saves one block as before and fix side by side, doubled when small, at most 2400 rows tall."""
    w_full = a.shape[1]
    x0 = max(0, bl['x'][0] - margin)
    x1 = min(w_full, bl['x'][1] + margin)
    ay0 = max(0, bl['a'][0] - margin)
    ay1 = min(a.shape[0], bl['a'][1] + margin)
    by0 = max(0, bl['b'][0] - margin)
    by1 = min(b.shape[0], bl['b'][1] + margin)
    cap = 2400
    ca = a[ay0:ay1, x0:x1][:cap]
    cb = b[by0:by1, x0:x1][:cap]
    h = max(ca.shape[0], cb.shape[0])
    w = x1 - x0
    canvas = np.full((h, w * 2 + 12, 3), 255, np.uint8)
    canvas[:, w:w + 12] = [255, 0, 0]
    canvas[:ca.shape[0], :w] = ca
    canvas[:cb.shape[0], w + 12:] = cb
    img = Image.fromarray(canvas)
    if img.width < 1400 and img.height < 1200:
        img = img.resize((img.width * 2, img.height * 2), Image.NEAREST)
    img.save(path)


def main(argv):
    if len(argv) < 2 or argv[0] in ('-h', '--help'):
        print(__doc__)
        return 0 if argv and argv[0] in ('-h', '--help') else 2
    shots, out = argv[0], argv[1]
    flt = argv[2] if len(argv) > 2 else ''
    os.makedirs(os.path.join(out, 'crops'), exist_ok=True)
    summary = {}
    for fa in sorted(glob.glob(os.path.join(shots, 'before--*.png'))):
        key = os.path.basename(fa)[len('before--'):-4]
        if flt and flt not in key:
            continue
        ff = os.path.join(shots, f'fix--{key}.png')
        fb2 = os.path.join(shots, f'before2--{key}.png')
        kf = os.path.join(out, 'keys', f'{key}.json')
        if os.path.exists(kf) and not os.environ.get('FORCE'):
            with open(kf) as f:
                summary[key] = json.load(f)
            continue
        entry = {}
        for label, other in (('noise', fb2), ('fix', ff)):
            if not os.path.exists(other):
                continue
            a, b = load(fa), load(other)
            res = compare(a, b)
            if 'error' not in res and label == 'fix':
                for i, bl in enumerate(res['blocks'][:MAX_CROPS]):
                    p = os.path.join(out, 'crops', f'{key}--{i:02d}.png')
                    crop_pair(a, b, bl, p)
                    bl['crop'] = p
            entry[label] = res
        summary[key] = entry
        if os.path.exists(ff) and os.path.exists(fb2):
            os.makedirs(os.path.join(out, 'keys'), exist_ok=True)
            with open(kf, 'w') as f:
                json.dump(entry, f)
        n = entry.get('noise', {})
        x = entry.get('fix', {})
        print(f"{key:80s} noise={n.get('changed_px', '-'):>8} ({len(n.get('blocks', []))} bl, h {n.get('ha')}/{n.get('hb')})"
              f"  fix={x.get('changed_px', '-'):>8} ({len(x.get('blocks', []))} bl, h {x.get('ha')}/{x.get('hb')})", flush=True)
    name = f'summary-{flt}.json' if flt else 'summary.json'
    with open(os.path.join(out, name), 'w') as f:
        json.dump(summary, f, indent=1)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
