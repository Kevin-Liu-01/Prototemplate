#!/usr/bin/env python3
"""sfx/grain.wav: one long, quiet paper grain for the fall of the contents'
70 columns in beat 1 (CONCEPT.md, The sound). Seeded noise (numpy
default_rng(1592)), band-passed to 1.8 to 7 kHz, with a slow seeded friction
envelope and sparse soft ticks of fibre, 2.2 s, raised-cosine fades of 0.3 s
in and 0.7 s out. Deterministic: the same file on every run.
    python3 sound/tools/make_grain.py
"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio_util import save
SR = 48000
D = 2.2
rng = np.random.default_rng(1592)
n = int(SR * D)
x = rng.standard_normal(n)
X = np.fft.rfft(x)
f = np.fft.rfftfreq(n, 1 / SR)
X *= ((f > 1800) & (f < 7000)) * (1 - 0.5 * (f > 4500))
x = np.fft.irfft(X, n)
# friction: a slow random envelope (about 9 Hz), always between 0.45 and 1
k = rng.standard_normal(int(D * 9) + 2)
env = np.interp(np.linspace(0, len(k) - 1, n), np.arange(len(k)), k)
env = 0.725 + 0.275 * np.tanh(env)
x *= env
# fibre: sparse soft clicks
for t in np.sort(rng.uniform(0.15, D - 0.3, 22)):
    i = int(t * SR); m = int(0.004 * SR)
    x[i:i + m] += rng.standard_normal(m) * np.hanning(m) * 2.5
fi, fo = int(0.3 * SR), int(0.7 * SR)
x[:fi] *= np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
x[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
x *= 10 ** (-48 / 20) / np.sqrt((x ** 2).mean())   # RMS -48 dBFS
dest = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sfx', 'grain.wav')
save(dest, x, SR, bits=24)
print(f'{dest}: {D} s, RMS -48 dBFS, peak {20*np.log10(np.abs(x).max()):.1f} dBFS')
