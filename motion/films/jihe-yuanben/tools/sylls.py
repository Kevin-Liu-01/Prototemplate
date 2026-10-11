"""Compact tone read: for each character the STT heard, the voiced F0 between
its start and the next character's start, as first / middle / last
semitones against the take's median, with the overall move.
   python3 tools/sylls.py audio/zh1.mp3"""
import json, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load
from tones import yin, SR
p = sys.argv[1]
x = load(p, SR)
f0, hop = yin(x)
med = np.nanmedian(f0)
w = [v for v in json.load(open(p.rsplit('.', 1)[0] + '.stt.json'))['words'] if v['type'] == 'word' and v['text'] not in '，。、']
out = []
for i, v in enumerate(w):
    t0 = v['start']
    t1 = w[i + 1]['start'] if i + 1 < len(w) else len(x) / SR
    seg = f0[int(t0 / hop): int(t1 / hop)]
    seg = seg[~np.isnan(seg)]
    if len(seg) < 3:
        out.append(f"{v['text']}(-)")
        continue
    st = 12 * np.log2(seg / med)
    n = len(st)
    a, b, c = st[: max(1, n // 4)].mean(), st[n // 3: 2 * n // 3 + 1].mean(), st[-max(1, n // 4):].mean()
    out.append(f"{v['text']}({a:+.0f}/{b:+.0f}/{c:+.0f})")
print(p, ' '.join(out))
