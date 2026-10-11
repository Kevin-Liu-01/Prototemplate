"""Measures a render: stream durations and frame count (ffprobe), integrated
loudness, loudness range and true peak (ebur128 with peak), and how close the
render's audio is to the offline sum (audio/mix-offline.wav), which shows
whether the renderer changed the mix.
   python3 tools/measure.py ../../out/jihe-yuanben.mp4"""
import json
import re
import subprocess
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load

src = sys.argv[1]
ROOT = __file__.rsplit('/', 2)[0] + '/'
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                                'stream=codec_type,codec_name,duration,nb_frames,r_frame_rate,width,height,sample_rate,channels,bit_rate:format=duration',
                                '-of', 'json', src], capture_output=True, text=True).stdout)
out = {}
for s in pr['streams']:
    out[s['codec_type']] = s
out['format'] = pr['format']
r = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
tail = r[r.rfind('Summary:'):]
out['I'] = float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1))
out['LRA'] = float(re.search(r'LRA:\s+(-?[\d.]+) LU', tail).group(1))
out['TP'] = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', tail).group(1))
a = load(src, 48000, mono=False)
b = load(ROOT + 'audio/mix-offline.wav', 48000, mono=False)
n = min(len(a), len(b))
# best alignment within +-20 ms
best = None
for lag in range(-960, 961, 16):
    if lag >= 0:
        x, y = a[lag:n], b[: n - lag]
    else:
        x, y = a[: n + lag], b[-lag:n]
    m = min(len(x), len(y))
    d = x[:m] - y[:m]
    e = 10 * np.log10(np.mean(d ** 2) / np.mean(y[:m] ** 2) + 1e-12)
    if best is None or e < best[1]:
        best = (lag, e)
ga = 10 * np.log10(np.mean(a[:n] ** 2) / np.mean(b[:n] ** 2))
out['vs_offline'] = {'lag_samples': int(best[0]), 'residual_db': round(float(best[1]), 1), 'level_diff_db': round(float(ga), 2)}
v, au = out['video'], out['audio']
print('video  %s %sx%s %s fps, %s frames, %.3f s' % (v['codec_name'], v['width'], v['height'], v['r_frame_rate'], v.get('nb_frames'), float(v['duration'])))
print('audio  %s %s Hz %s ch, %s b/s, %.3f s' % (au['codec_name'], au['sample_rate'], au['channels'], au.get('bit_rate'), float(au['duration'])))
print('ebur128  I %.1f LUFS, LRA %.1f LU, true peak %.1f dBTP' % (out['I'], out['LRA'], out['TP']))
print('against the offline mix: lag %d samples, residual %.1f dB, level %+.2f dB' % (best[0], best[1], ga))
json.dump(out, open(ROOT + 'audio/measure.json', 'w'), indent=1)
