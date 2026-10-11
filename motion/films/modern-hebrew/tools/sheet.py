"""The contact sheet of a render (MOTION.md): one frame a second, six columns,
tiles 480 wide, the time under each tile. Second k is the frame at exactly
k s (picked by index, so no seek rounding).

    python3 tools/sheet.py ../../out/_draft-modern-hebrew.mp4 ../../out/_sheets/_draft-modern-hebrew.png
"""
import os
import subprocess
import sys
import tempfile
from fractions import Fraction

from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]


def probe(*args):
    return subprocess.run(['ffprobe', '-v', 'error', *args, '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip()


fps = float(Fraction(probe('-select_streams', 'v', '-show_entries', 'stream=r_frame_rate')))
dur = float(probe('-show_entries', 'format=duration'))
n = int(dur + 1e-6)
tmp = tempfile.mkdtemp()
sel = '+'.join('eq(n\\,%d)' % round(k * fps) for k in range(n))
subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', "select='%s',scale=480:-1:flags=lanczos" % sel,
                '-vsync', '0', os.path.join(tmp, 'f%03d.png')], check=True)
files = sorted(os.listdir(tmp))
tw, th, cols, cap = 480, 270, 6, 28
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + cap)), (19, 17, 18))
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 17)
for i, f in enumerate(files):
    im = Image.open(os.path.join(tmp, f)).convert('RGB')
    x, y = (i % cols) * tw, (i // cols) * (th + cap)
    sheet.paste(im, (x, y))
    draw.text((x + 8, y + th + 5), '%d s' % i, fill=(219, 207, 186), font=font)
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
sheet.save(out)
print(out, sheet.size, len(files), 'frames')
