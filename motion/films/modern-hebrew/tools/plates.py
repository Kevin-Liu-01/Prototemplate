"""Bakes the film's page plates from the raw scans (copied from the dictionary
treatment lane, motion/concepts/modern-hebrew/dictionary/tools/plates.py, with
the leaves this film does not use removed).

Each scan is flat-fielded so its paper reads as one even tone, then printed
onto the film's paper colour. The paper estimate is the page with its type
removed (a max filter on a 1/8 copy, which is wider than any stroke), blurred
and scaled back up; dividing by it removes the scanner's light fall-off and
the gutter shadow and leaves the ink, the stamps and the paper's own fibres as
they were scanned. Nothing is retouched: no stamp, mark or blemish is removed.

    python3 tools/plates.py            every plate
    python3 tools/plates.py v1-n131    one plate

Writes assets/plates/<name>.jpg (JPEG quality 95, no chroma subsampling) at
the scan's own resolution (or a stated scale) and prints the size, so lib/data.js can use scan pixels as coordinates.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'assets' / 'raw'
OUT = ROOT / 'assets' / 'plates'

# The film's paper, sampled from vol. 1, p. 110 (median of the brightest 40 %).
PAPER = np.array([219, 207, 186], dtype=np.float32)
GHOST = 0.06
KNEE = 10.0

# name: (raw file, scale, flat-field). Scale 1 keeps scan pixels as the
# coordinate system. Photographs are not flat-fielded.
PLATES = {
    'v1-n12': ('v1-n12.jpg', 1.0, True),    # vol. 1, Hebrew title page
    'v1-n16': ('v1-n16.jpg', 1.0, True),    # vol. 1, note and key of signs
    'v1-n19': ('v1-n19.jpg', 1.0, True),    # vol. 1, abbreviations end, funders and committee
    'v1-n131': ('v1-n131.jpg', 1.0, True),  # vol. 1, p. 110
    'v4-n408': ('v4-n408.jpg', 1.0, True),  # vol. 4, p. 1806
}


def flat_field(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    small = (max(1, w // 8), max(1, h // 8))
    out = np.empty_like(rgb, dtype=np.float32)
    for c in range(3):
        ch = Image.fromarray(rgb[:, :, c].astype(np.uint8))
        bg = ch.resize(small, Image.BOX).filter(ImageFilter.MaxFilter(9))
        bg = bg.filter(ImageFilter.GaussianBlur(10)).resize((w, h), Image.BICUBIC)
        bgf = np.maximum(np.asarray(bg, dtype=np.float32), 40.0)
        out[:, :, c] = rgb[:, :, c] / bgf
    return out


def bake(name: str) -> None:
    src, scale, ff = PLATES[name]
    im = Image.open(RAW / src).convert('RGB')
    if scale != 1.0:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    rgb = np.asarray(im, dtype=np.float32)
    if ff:
        norm = flat_field(rgb)
        # The flat field divides by the page's brightest paper, so the paper's
        # median sits a few levels under 1. Rescale each channel so the median
        # of the paper (every pixel above the 30th luminance percentile, which
        # leaves out the ink) is exactly 1: the plate's paper then prints at
        # the film's paper colour, and the body window shows no seam where the
        # page meets the margins.
        lum = norm.mean(axis=2)
        paper = lum > np.percentile(lum, 30)
        norm = norm / np.median(norm[paper], axis=0)
        baked = np.clip(np.round(norm * PAPER), 0, 255).astype(np.uint8)
    else:
        baked = rgb.astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(baked).save(OUT / f'{name}.jpg', quality=95, subsampling=0)
    if ff:
        # The ghost: the same scan with its ink lowered to about a tenth of its
        # contrast (6 % past the knee), so a passage can be isolated by showing the ghost round
        # it. The paper's own fibres (deviations under KNEE levels) are kept
        # as scanned, so the paper reads the same inside and outside.
        b = baked.astype(np.float32)
        dl = PAPER.mean() - b.mean(axis=2, keepdims=True)
        f = np.where(dl > KNEE, (KNEE + (dl - KNEE) * GHOST) / np.maximum(dl, 1e-3), 1.0)
        ghost = np.clip(PAPER - (PAPER - b) * f, 0, 255).astype(np.uint8)
        Image.fromarray(ghost).save(OUT / f'{name}-ghost.jpg', quality=95, subsampling=0)
    print(f'{name}: {im.width} x {im.height}')


if __name__ == '__main__':
    names = sys.argv[1:] or list(PLATES)
    for n in names:
        bake(n)
