"""Pitch read of a Mandarin take with a 70 Hz floor (tones.py floors at 140 Hz,
so a low voice's third tone clips at about -6.5 st and reads like a fourth).

For each printed character in the take's .json alignment, the voiced F0 over
the character's span: start, end, peak and lowest in semitones against the
reference, with the fall (start minus end) and the start and end in Hz.
The reference is --ref (a voice's speech median, the same number a tune spec
uses) or, without it, each take's own median.

   python3 kit/sound/tones/pitch.py [--ref HZ] <take> [<take> ...]
   python3 kit/sound/tones/pitch.py [--ref HZ] --span T0 T1 <take>   (also print the contour from T0 to T1 s)
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


def track(path):
    x = load(path, SR)
    f0, hop = yin(x, fmin=70, fmax=450, th=0.25)
    # drop isolated octave jumps: a frame more than 9 st from both neighbours
    st = 12 * np.log2(f0 / np.nanmedian(f0))
    for i in range(1, len(st) - 1):
        a, b, c = st[i - 1], st[i], st[i + 1]
        if not np.isnan(b) and not np.isnan(a) and not np.isnan(c) and abs(b - a) > 9 and abs(b - c) > 9:
            f0[i] = np.nan
    return x, f0, hop


def chars(path):
    j = json.load(open(path.rsplit('.', 1)[0] + '.json'))
    a = j['alignment']
    out = []
    for c, s, e in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if '一' <= c <= '鿿' or c.isalpha():
            out.append((c, s, e))
    return out


def syll(f0, hop, t0, t1, ref):
    seg = f0[int(t0 / hop): int(t1 / hop) + 1]
    v = seg[~np.isnan(seg)]
    if len(v) < 3:
        return None
    st = 12 * np.log2(v / ref)
    k = max(1, len(st) // 5)
    return {'start': st[:k].mean(), 'end': st[-k:].mean(), 'peak': st.max(), 'low': st.min(), 'n': len(st),
            'hz0': v[:k].mean(), 'hz1': v[-k:].mean()}


def main():
    args = sys.argv[1:]
    span = None
    ref_arg = None
    if '--span' in args:
        i = args.index('--span')
        span = (float(args[i + 1]), float(args[i + 2]))
        del args[i:i + 3]
    if '--ref' in args:
        i = args.index('--ref')
        ref_arg = float(args[i + 1])
        del args[i:i + 2]
    if not args:
        raise SystemExit(__doc__)
    for p in args:
        x, f0, hop = track(p)
        med = np.nanmedian(f0)
        ref = ref_arg or med
        off = 12 * np.log2(med / ref)
        print(f'{p}: {len(x) / SR:.2f} s, median {med:.0f} Hz ({off:+.1f} st against {ref:.0f})')
        try:
            cs = chars(p)
        except FileNotFoundError:
            cs = []
        for c, s, e in cs:
            r = syll(f0, hop, s, e, ref)
            if not r:
                print(f'  {c} {s:5.2f}-{e:5.2f}  unvoiced')
                continue
            print(f"  {c} {s:5.2f}-{e:5.2f}  start {r['start']:+5.1f} end {r['end']:+5.1f} peak {r['peak']:+5.1f} low {r['low']:+5.1f} st"
                  f"  fall {r['start'] - r['end']:+5.1f}  ({r['hz0']:.0f} to {r['hz1']:.0f} Hz)")
        if span:
            for i in range(int(span[0] / hop), min(len(f0), int(span[1] / hop))):
                v = f0[i]
                s = '' if np.isnan(v) else '%+5.1f %4.0f' % (12 * np.log2(v / ref), v)
                bar = '' if np.isnan(v) else ' ' * int(40 + 2 * 12 * np.log2(v / ref)) + '*'
                print('   %5.2f %-11s %s' % (i * hop, s, bar))


if __name__ == '__main__':
    main()
