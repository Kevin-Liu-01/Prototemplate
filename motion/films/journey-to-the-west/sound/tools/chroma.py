"""Pitch-class profile of a music file (numpy FFT, 2048-sample frames at 22.05 kHz,
55 Hz to 2 kHz folded into 12 classes), to check that a bed is not built on a
five-note (pentatonic) set. Prints each class's share, strongest first.
   python3 sound/tools/chroma.py sound/music/bed.take2.mp3"""
import sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load
SR = 22050
x = load(sys.argv[1], SR)
N = 4096
f = np.fft.rfftfreq(N, 1 / SR)
m = (f > 55) & (f < 2000)
pc = np.round(12 * np.log2(f[m] / 440.0)).astype(int) % 12   # 0 = A
acc = np.zeros(12)
w = np.hanning(N)
for i in range(0, len(x) - N, N // 2):
    S = np.abs(np.fft.rfft(x[i:i + N] * w))[m] ** 2
    if S.sum() < 1e-6:
        continue
    acc += np.bincount(pc, weights=S / S.sum(), minlength=12)
names = ['A', 'B♭', 'B', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭']
share = acc / acc.sum()
order = np.argsort(-share)
print(' '.join(f'{names[k]} {100 * share[k]:.1f}%' for k in order))
top7 = sorted(order[:7])
print('seven strongest:', ' '.join(names[k] for k in top7))
