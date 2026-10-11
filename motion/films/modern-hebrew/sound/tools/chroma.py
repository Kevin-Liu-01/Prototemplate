"""Pitch-class profile and tempo check of a music take (numpy only).

   python3 tools/chroma.py music/music.take1.mp3 [start end]

Prints the twelve pitch classes by share of energy (40 Hz to 2 kHz), the best
matching major and minor keys (Krumhansl profiles), and the strongest onset
period between 0.4 and 2.5 s (the beat).
"""
import sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from audio_util import load

SR = 22050
path = sys.argv[1]
x = load(path, SR)
if len(sys.argv) > 3:
    x = x[int(float(sys.argv[2]) * SR): int(float(sys.argv[3]) * SR)]
n = 8192
hop = 2048
win = np.hanning(n)
f = np.fft.rfftfreq(n, 1 / SR)
band = (f > 40) & (f < 2000)
pc = np.round(12 * np.log2(f[band] / 440.0)).astype(int) % 12  # 0 = A
chroma = np.zeros(12)
flux = []
prev = None
for i in range(0, len(x) - n, hop):
    s = np.abs(np.fft.rfft(x[i:i + n] * win))
    p = s[band] ** 2
    np.add.at(chroma, pc, p)
    if prev is not None:
        flux.append(np.maximum(s - prev, 0).sum())
    prev = s
names = ['A', 'B♭', 'B', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭']
share = chroma / chroma.sum()
order = np.argsort(-share)
print('pitch classes:', ' '.join('%s %.1f%%' % (names[i], 100 * share[i]) for i in order))
major = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
minor = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
res = []
for k in range(12):
    # profile index 0 = tonic; our index 0 = A
    rot = np.roll(share, -k)
    res.append((np.corrcoef(rot, major)[0, 1], names[k] + ' major'))
    res.append((np.corrcoef(rot, minor)[0, 1], names[k] + ' minor'))
res.sort(reverse=True)
print('keys:', ', '.join('%s %.2f' % (b, a) for a, b in res[:4]))
fl = np.array(flux)
fl = (fl - fl.mean()) / (fl.std() + 1e-9)
ac = np.correlate(fl, fl, 'full')[len(fl) - 1:]
dt = hop / SR
lags = np.arange(len(ac)) * dt
m = (lags > 0.4) & (lags < 2.5)
best = lags[m][np.argmax(ac[m])]
print('strongest onset period %.3f s (%.1f bpm)' % (best, 60 / best))
