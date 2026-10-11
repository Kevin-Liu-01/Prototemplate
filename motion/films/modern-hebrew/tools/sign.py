"""(Copied from the dictionary treatment lane, motion/concepts/modern-hebrew/
dictionary/tools/sign.py; only the key's sign is kept.)

Lifts the coinage sign out of the key of signs (vol. 1, leaf n16) as a
large alpha mask, so the film can enlarge the printed sign without blurring
it. The crop is the sign as printed: it is upscaled 20 times, softened by less
than one scan pixel and thresholded with a smooth ramp, which keeps every
irregularity of the impression and only removes the JPEG and paper noise.
No drawing is added. The same is done for the p. 110 sign (for checking the
registration) and for the post-Talmudic sign on p. 1806.

    python3 tools/sign.py
Writes assets/derived/sign-*.png (white with alpha) and prints the size and the
scan box each one came from, which lib/data.js records.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'assets' / 'raw'
OUT = ROOT / 'assets' / 'derived'
UP = 20

SIGNS = {
    # name: (raw file, box with 4 px of paper round the ink)
    'sign-key': ('v1-n16.jpg', (2277, 2183, 2327, 2209)),
}


def lift(name: str) -> None:
    src, box = SIGNS[name]
    g = Image.open(RAW / src).convert('L').crop(box)
    w, h = g.size
    big = g.resize((w * UP, h * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(UP * 0.3))
    a = 255.0 - np.asarray(big, dtype=np.float32)
    # ink is dark: the ramp sits halfway between this crop's paper and ink
    paper, ink = np.percentile(a, 25), np.percentile(a, 98)
    mid, half = (paper + ink) / 2, (ink - paper) * 0.1
    lo, hi = mid - half, mid + half
    t = np.clip((a - lo) / (hi - lo), 0, 1)
    alpha = (t * t * (3 - 2 * t) * 255).astype(np.uint8)
    rgba = np.zeros((alpha.shape[0], alpha.shape[1], 4), dtype=np.uint8)
    rgba[:, :, :3] = 255
    rgba[:, :, 3] = alpha
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba).save(OUT / f'{name}.png', optimize=True)
    print(f'{name}: {w * UP} x {h * UP} from {src} box {box}')


if __name__ == '__main__':
    for n in SIGNS:
        lift(n)
