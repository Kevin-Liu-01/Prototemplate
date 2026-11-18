"""Writes the composed PNG in the published file's format: webp at quality 95, JPEG at 95 without chroma subsampling, or PNG."""
import sys, pathlib
from PIL import Image
src, out = sys.argv[1], pathlib.Path(sys.argv[2])
im = Image.open(src).convert('RGB')
out.parent.mkdir(parents=True, exist_ok=True)
if out.suffix == '.webp': im.save(out, 'WEBP', quality=95, method=6)
elif out.suffix == '.jpg': im.save(out, 'JPEG', quality=95, subsampling=0, optimize=True, progressive=True)
else: im.save(out, 'PNG', optimize=True)
print(out, im.size, out.stat().st_size // 1024, 'KB')
