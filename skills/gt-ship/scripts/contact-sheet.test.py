#!/usr/bin/env python3
"""Offline test of contact-sheet.py: three generated images make a two-column sheet of the expected size with each image in its cell.

Run: python3 skills/gt-ship/scripts/contact-sheet.test.py (pnpm test:skill-scripts runs it). It needs Pillow (requirements.txt).
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
failures = []


def check(cond, what):
    if not cond:
        failures.append(what)


with tempfile.TemporaryDirectory() as tmp:
    colors = {'red': (220, 30, 30), 'green': (30, 200, 60), 'blue': (30, 60, 220)}
    paths = {}
    for name, rgb in colors.items():
        paths[name] = os.path.join(tmp, f'{name}.png')
        Image.new('RGB', (400, 200 if name != 'blue' else 400), rgb).save(paths[name])
    out = os.path.join(tmp, 'sheet.png')
    run = subprocess.run([sys.executable, os.path.join(HERE, 'contact-sheet.py'), out, '2', '200',
                          *(f'{name} state={paths[name]}' for name in colors)], capture_output=True, text=True)
    check(run.returncode == 0, f'exit 0: {run.stderr}')
    sheet = Image.open(out).convert('RGB')
    # 2 columns of 200 plus 3 gutters of 16; the tallest cell is 200 + 40, two rows plus 3 gutters
    check(sheet.size == (2 * 216 + 16, 2 * (240 + 16) + 16), f'sheet size: {sheet.size}')
    check(sheet.getpixel((16 + 100, 16 + 34 + 50)) == colors['red'], 'the first cell holds the first image')
    check(sheet.getpixel((16 + 216 + 100, 16 + 34 + 50)) == colors['green'], 'the second cell holds the second image')
    check(sheet.getpixel((16 + 100, 16 + 256 + 34 + 150)) == colors['blue'], 'the third cell starts the second row, scaled with its aspect')
    check(sheet.getpixel((8, 8)) == (235, 235, 235), 'the gutter is the light ground')
    bad = subprocess.run([sys.executable, os.path.join(HERE, 'contact-sheet.py'), out, '2', '200', 'no-equals-sign'],
                         capture_output=True, text=True)
    check(bad.returncode == 2, 'an item without label=file is a usage error')

if failures:
    for f in failures:
        print('FAIL', f)
    sys.exit(1)
print('contact-sheet: all checks pass')
