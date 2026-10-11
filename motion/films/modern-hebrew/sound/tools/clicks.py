"""Finds clicks: 1 ms windows of the 3 kHz high-passed signal that jump more than
`db` above the median of the 60 ms around them, and says which clip edge (if any)
sits within 15 ms.   python3 sound/tools/clicks.py [mix-offline.wav] [db=24]"""
import json, os, sys, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from audio_util import load
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SR = 48000
path = sys.argv[1] if len(sys.argv) > 1 else S + 'mix-offline.wav'
db = float(sys.argv[2]) if len(sys.argv) > 2 else 24
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-af', 'highpass=f=3000:poles=2,highpass=f=3000:poles=2', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], check=True, capture_output=True).stdout
x = np.frombuffer(raw, dtype='<f4').astype(np.float64)
w = SR // 1000
m = len(x) // w
e = 10 * np.log10((x[: m * w].reshape(m, w) ** 2).mean(1) + 1e-14)
med = np.array([np.median(e[max(0, i - 30): i + 30]) for i in range(m)])
hits = [i for i in range(m) if e[i] - med[i] > db and e[i] > -70]
man = json.load(open(S + 'manifest.json'))
edges = []
for v in man['voices']:
    edges += [(v['start'], v['id'] + ' start'), (v['start'] + v['duration'], v['id'] + ' end')]
for f in man['effects']:
    edges += [(f['start'], f['kind'] + ' start'), (f['start'] + f['duration'], f['kind'] + ' end')]
last = -1
for i in hits:
    if i - last < 20:
        last = i
        continue
    last = i
    t = i / 1000
    near = [n for (te, n) in edges if abs(te - t) < 0.015]
    print('%.3f s  +%.0f dB  %s' % (t, e[i] - med[i], ', '.join(near) or 'inside a sound'))
print('%d windows over %g dB' % (len(hits), db))
