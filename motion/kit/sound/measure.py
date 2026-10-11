"""Measures a render (or any audio file): its streams, its loudness, and how far
its sound is from the offline mix it should carry.

   python3 kit/sound/measure.py <render.mp4> [--ref <offline mix.wav>] [--out <measure.json>]

Prints the video and audio streams (ffprobe), the audio length minus the video
length (MOTION.md asks for 0), the integrated loudness, loudness range and true
peak (ebur128 with peak), and, with --ref, the best alignment of the render's
audio against the offline mix within 20 ms (16-sample steps), the residual of
the difference against the mix in dB, and the level difference. A residual
near the codec's noise says the renderer kept the mix; a uniform level
difference says it changed the gain (the AAC true-peak correction). --out
writes every number as JSON.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio_util import load  # noqa: E402


def number(pattern, text):
    m = re.search(pattern, text)
    return float(m.group(1)) if m else None


def main():
    args = sys.argv[1:]
    opt = {}
    for k in ('--ref', '--out'):
        if k in args:
            i = args.index(k)
            opt[k] = args[i + 1]
            del args[i:i + 2]
    if len(args) != 1:
        raise SystemExit(__doc__)
    src = args[0]
    pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                                    'stream=codec_type,codec_name,duration,nb_frames,r_frame_rate,width,height,sample_rate,channels,bit_rate:format=duration',
                                    '-of', 'json', src], capture_output=True, text=True).stdout)
    out = {}
    for s in pr['streams']:
        out.setdefault(s['codec_type'], s)
    out['format'] = pr['format']
    r = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    tail = r[r.rfind('Summary:'):]
    out['I'] = number(r'I:\s+(-?[\d.]+) LUFS', tail)
    out['LRA'] = number(r'LRA:\s+(-?[\d.]+) LU', tail)
    out['TP'] = number(r'Peak:\s+(-?[\d.]+|-inf) dBFS', tail)
    v, au = out.get('video'), out.get('audio')
    if v:
        print('video  %s %sx%s %s fps, %s frames, %.3f s' % (v['codec_name'], v['width'], v['height'], v['r_frame_rate'], v.get('nb_frames'), float(v['duration'])))
    if au:
        print('audio  %s %s Hz %s ch, %s b/s, %.3f s' % (au['codec_name'], au['sample_rate'], au['channels'], au.get('bit_rate'), float(au['duration'])))
    if v and au:
        out['audio_minus_video_s'] = round(float(au['duration']) - float(v['duration']), 4)
        print('length audio minus video %+.3f s' % out['audio_minus_video_s'])
    print('ebur128  I %.1f LUFS, LRA %.1f LU, true peak %.1f dBTP' % (out['I'], out['LRA'], out['TP']))
    if '--ref' in opt:
        a = load(src, 48000, mono=False)
        b = load(opt['--ref'], 48000, mono=False)
        n = min(len(a), len(b))
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
        out['vs_offline'] = {'ref': os.path.basename(opt['--ref']), 'lag_samples': int(best[0]), 'residual_db': round(float(best[1]), 1),
                             'level_diff_db': round(float(ga), 2)}
        print('against the offline mix: lag %d samples, residual %.1f dB, level %+.2f dB' % (best[0], best[1], ga))
    if '--out' in opt:
        json.dump(out, open(opt['--out'], 'w'), indent=1)


if __name__ == '__main__':
    main()
