"""Prints a take's F0 contour (20 ms steps, semitones against its median) under
the STT's per-character start times, for reading tone shapes by eye.
   python3 tools/f0dump.py audio/zh3.mp3"""
import json, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load
from tones import yin, SR
p = sys.argv[1]
x = load(p, SR)
f0, hop = yin(x)
med = np.nanmedian(f0)
stt = json.load(open(p.rsplit('.', 1)[0] + '.stt.json'))
marks = {}
for w in stt['words']:
    if w['type'] == 'word':
        marks.setdefault(int(round(w['start'] / 0.02)), []).append(w['text'])
print(p, 'median', round(med), 'Hz')
for i in range(0, len(f0), 2):
    v = f0[i:i + 2]
    v = v[~np.isnan(v)]
    s = '' if len(v) == 0 else '%+5.1f' % (12 * np.log2(v.mean() / med))
    bar = '' if not s else ' ' * int(30 + 2 * float(s)) + '*'
    print('%5.2f %-6s %-4s %s' % (i * hop, s, ''.join(marks.get(i // 2, [])), bar))
