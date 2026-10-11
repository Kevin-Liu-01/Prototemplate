"""Prepares the two documents from outside the book that the film isolates.

    python3 tools/docs.py

The Command Paper (Cmd. 1785, p. 8, assets/raw/mandate-n7.jpg) is cut to
Article 22 (scan box 120-2010 x 180-700) and keeps its own cream paper. Its
ghost lowers the ink to about a tenth of its contrast against that paper
(the same rule as tools/plates.py uses for the dictionary's pages), so the
sentence the film quotes can be isolated in the book's own manner. Nothing is
retouched and nothing is flat-fielded. The poster and the photograph are used
as downloaded.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GHOST = 0.06
KNEE = 10.0
BOX = (120, 180, 2010, 700)

im = Image.open(ROOT / 'assets/raw/mandate-n7.jpg').convert('RGB').crop(BOX)
b = np.asarray(im, dtype=np.float32)
lum = b.mean(axis=2)
paper = np.median(b[lum >= np.percentile(lum, 60)], axis=0)
dl = paper.mean() - lum[:, :, None]
f = np.where(dl > KNEE, (KNEE + (dl - KNEE) * GHOST) / np.maximum(dl, 1e-3), 1.0)
ghost = np.clip(paper - (paper - b) * f, 0, 255).astype(np.uint8)
im.save(ROOT / 'assets/plates/mandate-art22.jpg', quality=95, subsampling=0)
Image.fromarray(ghost).save(ROOT / 'assets/plates/mandate-art22-ghost.jpg', quality=95, subsampling=0)
print('mandate-art22', im.size, 'paper', paper.round())
