"""Pitch-class profile of a music bed per section (numpy STFT, 55 Hz to 2 kHz),
to check the harmony (and that no section leans on a five-note pentatonic set).
   python3 tools/chroma.py audio/music.take1.mp3 [section seconds]"""
import sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load
SR = 22050
x = load(sys.argv[1], SR)
sec = float(sys.argv[2]) if len(sys.argv) > 2 else 8
N = 8192
H = 2048
win = np.hanning(N)
freqs = np.fft.rfftfreq(N, 1 / SR)
band = (freqs > 55) & (freqs < 2000)
pc = (np.round(12 * np.log2(freqs[band] / 440.0)) % 12).astype(int)  # 0 = A
names = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
total = np.zeros(12)
for s0 in np.arange(0, len(x) / SR, sec):
    a, b = int(s0 * SR), int(min(len(x), (s0 + sec) * SR))
    prof = np.zeros(12)
    for i in range(a, b - N, H):
        m = np.abs(np.fft.rfft(x[i:i + N] * win))[band] ** 2
        np.add.at(prof, pc, m)
    total += prof
    p = prof / (prof.sum() + 1e-12)
    top = np.argsort(p)[::-1][:6]
    print('%5.1f-%5.1f  ' % (s0, s0 + sec) + ' '.join('%s%.0f' % (names[k], 100 * p[k]) for k in top))
p = total / total.sum()
print('whole: ' + ' '.join('%s%.0f' % (names[k], 100 * p[k]) for k in np.argsort(p)[::-1]))
