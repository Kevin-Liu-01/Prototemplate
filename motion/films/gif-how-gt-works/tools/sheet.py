"""The checking contact sheet of a render (MOTION.md: one frame a second, six
columns, tiles 480 wide, each with its time under it). After
journey-to-the-west's tools/sheet.py. Frames are picked by index, so second k
is the frame at exactly k s. Works on the MP4 or the GIF.
   python3 tools/sheet.py ../../out/gif-how-gt-works.gif ../../out/_sheets/gif-how-gt-works.png"""
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
probe = lambda *a: subprocess.run(['ffprobe', '-v', 'error', *a, src], capture_output=True, text=True).stdout.strip()
fps = float(eval(probe('-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0')))
dur = float(probe('-show_entries', 'format=duration', '-of', 'csv=p=0'))
n = int(round(dur))
tmp = tempfile.mkdtemp()
sel = '+'.join('eq(n\\,%d)' % round(k * fps) for k in range(n))
subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', "select='%s',scale=480:-1:flags=lanczos" % sel, '-vsync', '0',
                os.path.join(tmp, 'f%03d.png')], check=True)
files = sorted(os.listdir(tmp))
tw, th, cols, gap, cap = 480, 270, 6, 4, 26
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw + (cols - 1) * gap, rows * (th + cap)), (214, 212, 206))
dr = ImageDraw.Draw(sheet)
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 17)
for i, f in enumerate(files):
    im = Image.open(os.path.join(tmp, f)).convert('RGB')
    x, y = (i % cols) * (tw + gap), (i // cols) * (th + cap)
    sheet.paste(im, (x, y))
    dr.text((x + 8, y + th + 4), '%d s' % i, fill=(32, 32, 32), font=font)
os.makedirs(os.path.dirname(out), exist_ok=True)
sheet.save(out)
shutil.rmtree(tmp)
print(out, sheet.size, len(files), 'frames')
