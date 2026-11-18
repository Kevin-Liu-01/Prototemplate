"""Lifts an opaque mark off a near-flat ground: alpha from the distance to the ground's colour, colour un-premultiplied.
usage: matte.py <src> <out.png> x0,y0,x1,y1"""
import sys, numpy as np
from PIL import Image
src, out, box = sys.argv[1], sys.argv[2], tuple(map(int, sys.argv[3].split(',')))
a = np.asarray(Image.open(src).convert('RGB').crop(box)).astype(float)
edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
bg = np.median(edge, axis=0)
d = np.abs(a - bg).max(axis=2)
alpha = np.clip(d / 70, 0, 1)
col = bg + (a - bg) / np.maximum(alpha, 1e-3)[..., None]
rgba = np.dstack([np.clip(col, 0, 255), alpha * 255]).round().astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(out)
print(out, 'ground', bg.round())
