"""Prints a take's F0 contour (YIN, 10 ms hop, 70 to 400 Hz) every 20 ms with its
level, in Hz and in semitones against the take's median, for reading tone shapes
by eye. The take's .json alignment characters are marked at their start times.
   python3 sound/tools/f0.py sound/takes/r04.mp3"""
import json, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load
from tones import yin, SR
p = sys.argv[1]
x = load(p, SR)
f0, hop = yin(x, fmin=70, fmax=400)
med = np.nanmedian(f0)
a = json.load(open(p.rsplit('.', 1)[0] + '.json'))['alignment']
marks = {}
for c, t in zip(a['characters'], a['character_start_times_seconds']):
    marks.setdefault(int(round(t / 0.02)), []).append(c)
print(p, 'median', round(med), 'Hz')
n = int(SR * 0.02)
for i in range(0, len(f0), 2):
    v = f0[i:i + 2]
    v = v[~np.isnan(v)]
    seg = x[i * int(SR * hop): i * int(SR * hop) + n]
    db = 20 * np.log10(np.sqrt((seg.astype(float) ** 2).mean()) + 1e-9)
    if len(v) == 0:
        print('%5.2f %5.0fdB %-6s %-4s' % (i * hop, db, '', ''.join(marks.get(i // 2, []))))
        continue
    hz = v.mean()
    s = 12 * np.log2(hz / med)
    print('%5.2f %5.0fdB %4.0fHz %+5.1f %-4s %s' % (i * hop, db, hz, s, ''.join(marks.get(i // 2, [])), ' ' * int(30 + 2 * s) + '*'))
