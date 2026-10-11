"""Joins two narrator takes of one line at a silence, with a 15 ms equal-power
crossfade, and writes the joined take's .wav and .json (character timings
taken from each part, the second part shifted to its new place).

   python3 tools/splice.py <out-id> <takeA> <cutA_s> <prefixA_text> <takeB> <cutB_s> <rest_text_in_B>

The output's text is prefixA_text + rest_text_in_B. Cut points must sit in silence.
"""
import json
import sys
import os
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from audio_util import load, save

SR = 48000
out, A, ca, pa, B, cb, rb = sys.argv[1:8]
ca, cb = float(ca), float(cb)
xa, xb = load('takes/%s.mp3' % A, SR), load('takes/%s.mp3' % B, SR)
n = int(0.015 * SR)
ia, ib = int(ca * SR), int(cb * SR)
a = xa[: ia + n].copy()
b = xb[ib:].copy()
w = np.linspace(0, np.pi / 2, n)
a[-n:] *= np.cos(w)
b[:n] *= np.sin(w)
y = np.concatenate([a[:-n], a[-n:] + b[:n], b[n:]])
save('takes/%s.wav' % out, y, SR)
ja, jb = json.load(open('takes/%s.json' % A)), json.load(open('takes/%s.json' % B))
aa, ab = ja['alignment'], jb['alignment']
ta, tb = ''.join(aa['characters']), ''.join(ab['characters'])
assert ta.startswith(pa), (ta, pa)
k = tb.find(rb)
assert k >= 0, (tb, rb)
shift = ca - cb
chars = list(pa) + list(tb[k:])
st = aa['character_start_times_seconds'][: len(pa)] + [t + shift for t in ab['character_start_times_seconds'][k:]]
en = aa['character_end_times_seconds'][: len(pa)] + [t + shift for t in ab['character_end_times_seconds'][k:]]
json.dump({'text': pa + rb, 'voice': ja.get('voice'), 'voice_id': ja.get('voice_id'), 'model': ja.get('model'), 'speed': ja.get('speed', 1),
           'duration': len(y) / SR, 'firstSound': st[0], 'spliced': {'a': A, 'cut_a': ca, 'b': B, 'cut_b': cb, 'crossfade_s': 0.015},
           'alignment': {'characters': chars, 'character_start_times_seconds': st, 'character_end_times_seconds': en}},
          open('takes/%s.json' % out, 'w'), ensure_ascii=False, indent=1)
print('takes/%s.wav %.2f s' % (out, len(y) / SR))
