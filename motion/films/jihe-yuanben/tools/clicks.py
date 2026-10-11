"""Looks for clicks in a mix: a sample whose second difference stands far
above the local level of the second difference (a step or a spike the
music, voices and paper do not make), reported with its time.
   python3 tools/clicks.py <file> [threshold]"""
import sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load
SR = 48000
x = load(sys.argv[1], SR, mono=False)
th = float(sys.argv[2]) if len(sys.argv) > 2 else 12.0
hits = []
for c in range(2):
    d2 = np.abs(np.diff(x[:, c].astype(np.float64), 2))
    w = 480
    n = len(d2) // w
    blk = d2[: n * w].reshape(n, w)
    med = np.median(blk, 1) + 1e-5
    loc = np.repeat(med, w)
    r = d2[: n * w] / loc
    idx = np.nonzero((r > th) & (d2[: n * w] > 0.01))[0]
    last = -1e9
    for i in idx:
        if i - last > SR * 0.05:
            hits.append((i / SR, c, float(r[i]), float(d2[i])))
        last = i
hits.sort()
print('%d candidate clicks' % len(hits))
for h in hits[:40]:
    print('  %.3f s ch%d ratio %.0f jump %.3f' % h)
