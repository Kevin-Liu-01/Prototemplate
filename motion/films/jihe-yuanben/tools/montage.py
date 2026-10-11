"""Tiles frames into one sheet with their times under them.
   python3 tools/montage.py <dir> <out.png> [cols] [tile width]"""
import sys, os, re
from PIL import Image, ImageDraw, ImageFont
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 640
files = sorted(f for f in os.listdir(d) if f.endswith('.png'))
th = int(tw * 1080 / 1920)
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 26)), (20, 18, 16))
try:
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 18)
except Exception:
    font = None
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(os.path.join(d, f)).convert('RGB').resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * (th + 26)
    sheet.paste(im, (x, y))
    m = re.search(r'(\d+\.\d+)', f)
    dr.text((x + 6, y + th + 3), (m.group(1) if m else f) + ' s', fill=(220, 210, 190), font=font)
sheet.save(out)
print(out, sheet.size)
