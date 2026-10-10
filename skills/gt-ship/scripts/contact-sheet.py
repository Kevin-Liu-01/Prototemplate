#!/usr/bin/env python3
"""contact-sheet.py: lays labelled screenshots out on one PNG grid, for a review page or a PR comment that has to show many states at once (gt-ship section 4).

Each cell is one screenshot scaled to the cell width (aspect kept) under
its label. Rows take the height of the tallest cell; the ground is light
grey (235) with 16 px gutters.

Usage:
  python3 contact-sheet.py <out.png> <columns> <cell width> <label=file>... [--font <file.ttf>] [--size 22]
  python3 contact-sheet.py --help

Example:
  python3 contact-sheet.py <scratch>/sheet.png 3 480 "sign-in dark=a.png" "sign-in light=b.png" "consent=c.png"

--font names a TrueType file for the labels; without it Pillow's built-in
font is used at --size, so the script runs the same on any machine. It
prints the output path and the sheet's size.

Requires: Python 3.9 or later and Pillow 10.1 or later (requirements.txt).
Last real run: 2026-10-10, review sheets in the New Onboarding and Dashboard
session, as sheet.py (46 runs there and in the blog Lottie figure session
from 2026-09-25). Copied into
this skill on 2026-10-10.
"""
import argparse
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # the message names the fix instead of a traceback
    Image = None

GUTTER = 16
LABEL_BAND = 34
GROUND = (235, 235, 235)
INK = (20, 20, 20)


def load_font(path, size):
    if path:
        return ImageFont.truetype(path, size)
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow before 10.1 has one fixed-size bitmap font
        return ImageFont.load_default()


def build(items, cols, cell_width, font):
    """The sheet for [(label, path)], as a Pillow image."""
    cells = []
    for label, path in items:
        im = Image.open(path).convert('RGB')
        height = max(1, round(im.height * cell_width / im.width))
        cells.append((label, im.resize((cell_width, height), Image.LANCZOS)))
    cell_height = max(im.height for _, im in cells) + LABEL_BAND + 6
    rows = (len(cells) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (cell_width + GUTTER) + GUTTER, rows * (cell_height + GUTTER) + GUTTER), GROUND)
    draw = ImageDraw.Draw(sheet)
    for i, (label, im) in enumerate(cells):
        x = GUTTER + (i % cols) * (cell_width + GUTTER)
        y = GUTTER + (i // cols) * (cell_height + GUTTER)
        draw.text((x, y), label, fill=INK, font=font)
        sheet.paste(im, (x, y + LABEL_BAND))
    return sheet


def main(argv=None):
    ap = argparse.ArgumentParser(description='Lay labelled screenshots out on one PNG grid.')
    ap.add_argument('out', help='the PNG to write')
    ap.add_argument('cols', type=int, help='columns')
    ap.add_argument('cell_width', type=int, help='cell width in pixels')
    ap.add_argument('items', nargs='+', help='label=file, one per cell, in reading order')
    ap.add_argument('--font', help='a TrueType file for the labels (default: Pillow built-in)')
    ap.add_argument('--size', type=int, default=22, help='label size in pixels (default 22)')
    args = ap.parse_args(argv)
    if Image is None:
        print('contact-sheet: Pillow is missing; pip install -r requirements.txt', file=sys.stderr)
        return 2
    items = []
    for raw in args.items:
        label, sep, path = raw.partition('=')
        if not sep or not path:
            ap.error(f'expected label=file, got {raw!r}')
        items.append((label, path))
    if args.cols < 1 or args.cell_width < 1:
        ap.error('columns and cell width must be positive')
    sheet = build(items, args.cols, args.cell_width, load_font(args.font, args.size))
    sheet.save(args.out, optimize=True)
    print(args.out, sheet.size)
    return 0


if __name__ == '__main__':
    sys.exit(main())
