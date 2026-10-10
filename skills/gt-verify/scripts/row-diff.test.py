#!/usr/bin/env python3
"""Offline test of row-diff.py: an image against itself gives zero changed rows, a band shifted by a few pixels is one block, an inserted band leaves the rows below it aligned, and the command writes its summary and crops.

Run: python3 skills/gt-verify/scripts/row-diff.test.py (pnpm test:skill-scripts runs it).
It builds its images in a temporary folder and touches no network.
"""
import importlib.util
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, 'row-diff.py')

spec = importlib.util.spec_from_file_location('row_diff', SCRIPT)
row_diff = importlib.util.module_from_spec(spec)
spec.loader.exec_module(row_diff)


def page(height=400, width=320, band_at=None, band_rows=30):
    """A page whose every row is unique (a gradient), with an optional textured band, as text would be."""
    a = np.zeros((height, width, 3), np.uint8)
    a[:, :, 0] = (np.arange(height) % 256)[:, None]
    a[:, :, 1] = (np.arange(height) // 256)[:, None]
    a[:, :, 2] = 230
    if band_at is not None:
        rng = np.random.default_rng(7)
        a[band_at:band_at + band_rows, 40:280] = rng.integers(0, 256, (band_rows, 240, 3), dtype=np.uint8)
    return a


def check(label, ok, detail=''):
    if not ok:
        print(f'FAIL {label} {detail}')
        sys.exit(1)
    print(f'ok   {label}')


before = page(band_at=120)

same = row_diff.compare(before, before.copy())
check('an image against itself has no changed rows', same['changed_px'] == 0 and same['blocks'] == [], same)

shifted = row_diff.compare(before, page(band_at=124))
check('a band shifted by 4 px is one block', len(shifted['blocks']) == 1, shifted['blocks'])
block = shifted['blocks'][0]
check('the block covers the band on both sides', block['a'][0] <= 120 and block['a'][1] >= 154, block)

inserted_rows = np.full((20, 320, 3), 90, np.uint8)
inserted = row_diff.compare(before, np.concatenate([before[:300], inserted_rows, before[300:]]))
check('an inserted band is one insert block', [b['kind'] for b in inserted['blocks']] == ['insert'], inserted['blocks'])
check('the rows below an inserted band stay aligned', inserted['blocks'][0]['b'] == [300, 320], inserted['blocks'][0])

narrow = row_diff.compare(before, before[:, :300])
check('a pair of two widths reports an error', narrow.get('error') == 'width differs', narrow)

with tempfile.TemporaryDirectory() as tmp:
    shots = os.path.join(tmp, 'shots')
    out = os.path.join(tmp, 'out')
    os.makedirs(shots)
    Image.fromarray(before).save(os.path.join(shots, 'before--docs--1440-dark.png'))
    Image.fromarray(before).save(os.path.join(shots, 'before2--docs--1440-dark.png'))
    Image.fromarray(page(band_at=124)).save(os.path.join(shots, 'fix--docs--1440-dark.png'))
    run = subprocess.run([sys.executable, SCRIPT, shots, out], capture_output=True, text=True)
    check('the command exits 0', run.returncode == 0, run.stderr)
    with open(os.path.join(out, 'summary.json')) as f:
        summary = json.load(f)
    entry = summary.get('docs--1440-dark', {})
    check('the noise pair has no changed pixels', entry.get('noise', {}).get('changed_px') == 0, entry)
    check('the fix pair has one block with a crop', len(entry.get('fix', {}).get('blocks', [])) == 1
          and os.path.exists(os.path.join(out, 'crops', 'docs--1440-dark--00.png')), entry)
    check('a key with all three shots is cached', os.path.exists(os.path.join(out, 'keys', 'docs--1440-dark.json')))

print('row-diff.test.py: all pass')
