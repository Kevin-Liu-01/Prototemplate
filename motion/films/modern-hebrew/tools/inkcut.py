"""modern-hebrew v2: the title page's first word, מלון, as ink alone.

The open prints the word in on bare paper before the ghost page prints in
round it (SCRIPT-v2, line 1). A hole cut from the plate would carry the plate's
paper with it, and its rectangle would show on the flat paper while the ghost
is still printing in. This cuts the word's ink out of the plate instead: alpha
is how much darker than the paper a pixel is, and the colour is the plate's
own colour with the paper taken out (un-premultiplied), so the ink keeps the
scan's irregularities and lies over any paper without an edge.

Fix round (2026-10-05): only the word is kept. The box also holds specks of
scan dirt, which the open drew in full ink beside the word while the page
round it was ghost. The ink is split into connected parts (alpha over 0.1,
8-connected); a part is kept when its area is at least 60 px and it does not
touch the box's edge. That keeps the four letters and the three points of
מִלּוֹן (the holam over the vav, the dagesh in the lamed, the hiriq under the
mem) and drops three specks (areas of 7, 10 and 90 px; the last is cut by
the box's lower edge). Alpha outside the kept parts, grown by 2 px for their
anti-aliased edges, is set to 0.

    python3 tools/inkcut.py   (writes assets/derived/title-milon-ink.png)
"""
from collections import deque

import numpy as np
from PIL import Image

PAPER = np.array([0xdb, 0xcf, 0xba], float)
BOX = (1795 - 16, 378 - 16, 2126 + 16, 562 + 16)   # lib/data.js title.milon, padded
im = np.asarray(Image.open('assets/plates/v1-n12.jpg').convert('RGB'), float)[BOX[1]:BOX[3], BOX[0]:BOX[2]]
lum = lambda c: c[..., 0] * 0.299 + c[..., 1] * 0.587 + c[..., 2] * 0.114
pl = lum(PAPER[None, None, :])
ink = 40.0                                           # about the darkest ink of the page (#332617)
a = np.clip((pl - lum(im) - 8.0) / (pl - ink - 8.0), 0, 1)
a = a ** 0.9


def parts(m):
    """8-connected parts of a boolean mask: a label image and the count."""
    h, w = m.shape
    lab = np.zeros((h, w), int)
    n = 0
    for y0 in range(h):
        for x0 in range(w):
            if m[y0, x0] and not lab[y0, x0]:
                n += 1
                lab[y0, x0] = n
                q = deque([(y0, x0)])
                while q:
                    y, x = q.popleft()
                    for yy in (y - 1, y, y + 1):
                        for xx in (x - 1, x, x + 1):
                            if 0 <= yy < h and 0 <= xx < w and m[yy, xx] and not lab[yy, xx]:
                                lab[yy, xx] = n
                                q.append((yy, xx))
    return lab, n


lab, n = parts(a > 0.1)
keep = np.zeros(a.shape, bool)
kept, dropped = [], []
for i in range(1, n + 1):
    ys, xs = np.nonzero(lab == i)
    edge = ys.min() == 0 or xs.min() == 0 or ys.max() == a.shape[0] - 1 or xs.max() == a.shape[1] - 1
    (dropped if len(ys) < 60 or edge else kept).append((len(ys), int(xs.mean()), int(ys.mean())))
    if len(ys) >= 60 and not edge:
        keep |= lab == i
grow = keep.copy()
for _ in range(2):
    g = grow.copy()
    g[1:] |= grow[:-1]; g[:-1] |= grow[1:]; g[:, 1:] |= grow[:, :-1]; g[:, :-1] |= grow[:, 1:]
    grow = g
a = np.where(grow, a, 0.0)
print('kept', kept)
print('dropped', dropped)
safe = np.maximum(a, 1e-3)[..., None]
rgb = np.clip((im - (1 - a[..., None]) * PAPER) / safe, 0, 255)
rgb[a < 0.02] = [0x33, 0x26, 0x17]
out = np.dstack([rgb, a * 255]).round().astype(np.uint8)
Image.fromarray(out, 'RGBA').save('assets/derived/title-milon-ink.png')
print('assets/derived/title-milon-ink.png', out.shape, 'box', BOX)
