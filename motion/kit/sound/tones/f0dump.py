"""Prints a take's F0 contour every 20 ms in semitones against its median, with
each character marked at its start, for reading tone shapes by eye.

   python3 kit/sound/tones/f0dump.py <take> [--marks json|stt] [--fmin HZ] [--fmax HZ] [--level]

--marks json marks the characters of the take's .json alignment (the default
when the take has one); --marks stt marks the words `el.mjs hear` returned
(<take>.stt.json). The tracker is tones.py's YIN at a 10 ms hop between --fmin
and --fmax (default 140 to 480 Hz; 70 to 400 suits a low voice). --level adds
each step's level in dB and its F0 in Hz.
"""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(1, os.path.dirname(HERE))
from audio_util import load  # noqa: E402
from tones import SR, yin  # noqa: E402


def main():
    args = sys.argv[1:]
    o = {'--marks': None, '--fmin': '140', '--fmax': '480'}
    level = '--level' in args
    if level:
        args.remove('--level')
    for k in list(o):
        if k in args:
            i = args.index(k)
            o[k] = args[i + 1]
            del args[i:i + 2]
    if len(args) != 1:
        raise SystemExit(__doc__)
    p = args[0]
    stem = p.rsplit('.', 1)[0]
    mode = o['--marks'] or ('json' if os.path.exists(stem + '.json') else 'stt')
    x = load(p, SR)
    f0, hop = yin(x, fmin=float(o['--fmin']), fmax=float(o['--fmax']))
    med = np.nanmedian(f0)
    marks = {}
    if mode == 'json':
        a = json.load(open(stem + '.json'))['alignment']
        for c, t in zip(a['characters'], a['character_start_times_seconds']):
            marks.setdefault(int(round(t / 0.02)), []).append(c)
    else:
        for w in json.load(open(stem + '.stt.json'))['words']:
            if w['type'] == 'word':
                marks.setdefault(int(round(w['start'] / 0.02)), []).append(w['text'])
    print(p, 'median', round(med), 'Hz')
    n = int(SR * 0.02)
    for i in range(0, len(f0), 2):
        v = f0[i:i + 2]
        v = v[~np.isnan(v)]
        m = ''.join(marks.get(i // 2, []))
        if level:
            seg = x[i * int(SR * hop): i * int(SR * hop) + n]
            db = 20 * np.log10(np.sqrt((seg.astype(float) ** 2).mean()) + 1e-9)
            if len(v) == 0:
                print('%5.2f %5.0fdB %-6s %-4s' % (i * hop, db, '', m))
                continue
            hz = v.mean()
            s = 12 * np.log2(hz / med)
            print('%5.2f %5.0fdB %4.0fHz %+5.1f %-4s %s' % (i * hop, db, hz, s, m, ' ' * int(30 + 2 * s) + '*'))
        else:
            s = '' if len(v) == 0 else '%+5.1f' % (12 * np.log2(v.mean() / med))
            bar = '' if not s else ' ' * int(30 + 2 * float(s)) + '*'
            print('%5.2f %-6s %-4s %s' % (i * hop, s, m, bar))


if __name__ == '__main__':
    main()
