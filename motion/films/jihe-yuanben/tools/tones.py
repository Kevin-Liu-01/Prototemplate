"""Tone check for a Mandarin take: the pitch contour of each syllable.

For every Han character in the take's .json alignment, track F0 (a YIN-style
difference function in numpy, 10 ms hop) over the character's span and print
its contour in semitones against the take's median F0, with a reading of its
shape: H level (tone 1), R rising (tone 2), L low or dipping (tone 3),
F falling (tone 4). It is a measurement aid for the ledger, not a native
listener.
   python3 tools/tones.py audio/zh3.mp3 [expected tones, e.g. 2 1 2 1 3 3 4]
"""
import json
import sys
import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load

SR = 16000


def yin(x, sr=SR, fmin=140, fmax=480, hop=0.01, win=0.03, th=0.3):
    n = int(win * sr)
    h = int(hop * sr)
    tmin, tmax = int(sr / fmax), int(sr / fmin)
    out = []
    for i in range(0, len(x) - n - tmax, h):
        f = x[i : i + n + tmax].astype(np.float64)
        e = np.sqrt((x[i : i + n] ** 2).mean())
        d = np.array([((f[:n] - f[t : t + n]) ** 2).sum() for t in range(tmax + 1)])
        c = np.cumsum(d[1:])
        dn = np.ones_like(d)
        dn[1:] = d[1:] * np.arange(1, tmax + 1) / np.maximum(c, 1e-12)
        cand = np.nonzero(dn[tmin:] < th)[0]
        if e < 0.001 or len(cand) == 0:
            out.append(np.nan)
            continue
        t = cand[0] + tmin
        while t + 1 <= tmax and dn[t + 1] < dn[t]:
            t += 1
        # parabolic refinement
        if 1 <= t < tmax:
            a, b, c2 = dn[t - 1], dn[t], dn[t + 1]
            den = a - 2 * b + c2
            t = t + (0.5 * (a - c2) / den if den != 0 else 0)
        out.append(sr / t)
    return np.array(out), hop


def main():
    path = sys.argv[1]
    exp = sys.argv[2:]
    x = load(path, SR)
    f0, hop = yin(x)
    med = np.nanmedian(f0)
    j = json.load(open(path.rsplit('.', 1)[0] + '.json'))
    a = j['alignment']
    chars = a['characters']
    s = a['character_start_times_seconds']
    e = a['character_end_times_seconds']
    k = 0
    print(f'{path}: median F0 {med:.0f} Hz')
    for c, t0, t1 in zip(chars, s, e):
        if not ('一' <= c <= '鿿'):
            continue
        i0, i1 = int(t0 / hop), int(t1 / hop) + 1
        seg = f0[i0:i1]
        v = seg[~np.isnan(seg)]
        if len(v) < 3:
            print(f'  {c} {t0:5.2f}-{t1:5.2f}  (unvoiced or too short)')
            k += 1
            continue
        st = 12 * np.log2(v / med)
        n = len(st)
        a3 = [st[: max(1, n // 3)].mean(), st[n // 3 : max(n // 3 + 1, 2 * n // 3)].mean(), st[2 * n // 3 :].mean()]
        rng = st.max() - st.min()
        slope = a3[2] - a3[0]
        mid_dip = a3[1] < min(a3[0], a3[2]) - 0.8
        if mid_dip or (np.mean(st) < -2.0 and abs(slope) < 2.5):
            shape = 'L'
        elif slope > 1.5:
            shape = 'R'
        elif slope < -2.0:
            shape = 'F'
        else:
            shape = 'H' if np.mean(st) > -1.0 else 'L'
        want = exp[k] if k < len(exp) else ''
        print(f'  {c} {t0:5.2f}-{t1:5.2f}  st {a3[0]:+5.1f} {a3[1]:+5.1f} {a3[2]:+5.1f}  range {rng:4.1f}  -> {shape}' + (f'   (expected tone {want})' if want else ''))
        k += 1


if __name__ == '__main__':
    main()
