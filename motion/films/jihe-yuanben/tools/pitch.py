"""Pitch read of a Mandarin take, floor 70 Hz (tones.py floors at 140 Hz, so
its low tones clip at about -6.5 st and a third tone reads like a fourth).

For each printed character in the take's .json alignment, the voiced F0 over
the character's span: start, peak, end and lowest, in semitones against REF
(Yun's speech median, 217 Hz) and against the take's own median, with the
fall (start minus end) and the range.
   python3 tools/pitch.py audio/zh4e.mp3 [audio/zh4.mp3 ...]
   python3 tools/pitch.py --span 0.0 0.7 audio/x.mp3   (print the contour too)
"""
import json
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load
from tones import yin, SR

REF = 217.0


def track(path):
    x = load(path, SR)
    f0, hop = yin(x, fmin=70, fmax=450, th=0.25)
    # drop isolated octave jumps: a frame more than 9 st from both neighbours
    st = 12 * np.log2(f0 / REF)
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


def syll(f0, hop, t0, t1):
    seg = f0[int(t0 / hop): int(t1 / hop) + 1]
    v = seg[~np.isnan(seg)]
    if len(v) < 3:
        return None
    st = 12 * np.log2(v / REF)
    k = max(1, len(st) // 5)
    return {'start': st[:k].mean(), 'end': st[-k:].mean(), 'peak': st.max(), 'low': st.min(), 'n': len(st),
            'hz0': v[:k].mean(), 'hz1': v[-k:].mean()}


def main():
    args = sys.argv[1:]
    span = None
    if args and args[0] == '--span':
        span = (float(args[1]), float(args[2]))
        args = args[3:]
    for p in args:
        x, f0, hop = track(p)
        med = np.nanmedian(f0)
        off = 12 * np.log2(med / REF)
        print(f'{p}: {len(x) / SR:.2f} s, median {med:.0f} Hz ({off:+.1f} st against {REF:.0f})')
        try:
            cs = chars(p)
        except FileNotFoundError:
            cs = []
        for c, s, e in cs:
            r = syll(f0, hop, s, e)
            if not r:
                print(f'  {c} {s:5.2f}-{e:5.2f}  unvoiced')
                continue
            print(f"  {c} {s:5.2f}-{e:5.2f}  start {r['start']:+5.1f} end {r['end']:+5.1f} peak {r['peak']:+5.1f} low {r['low']:+5.1f} st"
                  f"  fall {r['start'] - r['end']:+5.1f}  ({r['hz0']:.0f} to {r['hz1']:.0f} Hz)")
        if span:
            for i in range(int(span[0] / hop), min(len(f0), int(span[1] / hop))):
                v = f0[i]
                s = '' if np.isnan(v) else '%+5.1f %4.0f' % (12 * np.log2(v / REF), v)
                bar = '' if np.isnan(v) else ' ' * int(40 + 2 * 12 * np.log2(v / REF)) + '*'
                print('   %5.2f %-11s %s' % (i * hop, s, bar))


if __name__ == '__main__':
    main()
