#!/usr/bin/env python3
"""Contact sheets of build/out/*.png: sheet.py [ids...] -> out/_sheet0.png, _sheet1.png"""
import glob, os, sys
from PIL import Image, ImageDraw
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
ids = sys.argv[1:]
files = [os.path.join(OUT, i + '.png') for i in ids] if ids else sorted(f for f in glob.glob(OUT + '/*.png') if not os.path.basename(f).startswith('_'))
W, H, cols = 640, 360, 4
for part in range((len(files) + 15) // 16):
    chunk = files[part * 16:(part + 1) * 16]; rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * W, rows * (H + 24)), (20, 20, 24)); d = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        im = Image.open(f).convert('RGB'); im.thumbnail((W, H), Image.LANCZOS)
        x, y = (i % cols) * W, (i // cols) * (H + 24)
        sheet.paste(im, (x + (W - im.width) // 2, y + 24)); d.text((x + 6, y + 5), os.path.basename(f)[:-4], fill=(255, 255, 255))
    sheet.save(f'{OUT}/_sheet{part}.png'); print('sheet', part, sheet.size, len(chunk))
