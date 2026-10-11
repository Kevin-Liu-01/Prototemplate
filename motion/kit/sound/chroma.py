"""Pitch-class profile of a music take, with the best matching keys and its beat.

   python3 kit/sound/chroma.py <music file> [--window START END] [--sections SECONDS]
                               [--band LOW HIGH] [--frame N] [--hop H] [--per-frame]

Folds the spectrum between --band (default 55 to 2000 Hz) into the twelve
pitch classes (0 = A) over Hann frames of --frame samples (default 8192) every
--hop (default 2048) at 22.05 kHz, and prints:

  pitch classes    each class's share of the energy, strongest first
  seven strongest  the seven strongest classes in pitch order, to check that a
                   bed is not built on a five-note (pentatonic) set
  keys             the four best matching major and minor keys (Krumhansl profiles)
  onset period     the strongest spectral-flux period between 0.4 and 2.5 s

--window measures only START to END seconds of the file. --sections also prints
the six strongest classes of every SECONDS-long section; the whole-file
profile is then the sum of the sections. --per-frame weighs every frame alike
(each frame's band energy normalized to 1, frames under 1e-6 skipped) instead
of by its energy, so a quiet passage counts as much as a loud one.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio_util import load  # noqa: E402

SR = 22050
NAMES = ['A', 'B♭', 'B', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭']
MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def options(args):
    o = {'window': None, 'sections': None, 'band': (55.0, 2000.0), 'frame': 8192, 'hop': 2048, 'per_frame': False}
    rest = []
    i = 0
    while i < len(args):
        a = args[i]
        if a == '--window':
            o['window'] = (float(args[i + 1]), float(args[i + 2]))
            i += 3
        elif a == '--sections':
            o['sections'] = float(args[i + 1])
            i += 2
        elif a == '--band':
            o['band'] = (float(args[i + 1]), float(args[i + 2]))
            i += 3
        elif a in ('--frame', '--hop'):
            o[a[2:]] = int(args[i + 1])
            i += 2
        elif a == '--per-frame':
            o['per_frame'] = True
            i += 1
        else:
            rest.append(a)
            i += 1
    if len(rest) != 1:
        raise SystemExit(__doc__)
    return rest[0], o


def accumulate(prof, x, a, b, n, hop, win, band, pc, per_frame, flux=None):
    """Adds the frames starting from a up to b - n to prof; appends spectral flux when asked."""
    prev = None
    for i in range(a, b - n, hop):
        s = np.abs(np.fft.rfft(x[i:i + n] * win))
        p = s[band] ** 2
        if per_frame:
            if p.sum() < 1e-6:
                continue
            p = p / p.sum()
        np.add.at(prof, pc, p)
        if flux is not None:
            if prev is not None:
                flux.append(np.maximum(s - prev, 0).sum())
            prev = s


def line(share, order, fmt):
    return ' '.join(fmt % (NAMES[k], 100 * share[k]) for k in order)


def main():
    path, o = options(sys.argv[1:])
    x = load(path, SR)
    if o['window']:
        x = x[int(o['window'][0] * SR): int(o['window'][1] * SR)]
    n, hop = o['frame'], o['hop']
    win = np.hanning(n)
    f = np.fft.rfftfreq(n, 1 / SR)
    band = (f > o['band'][0]) & (f < o['band'][1])
    pc = np.round(12 * np.log2(f[band] / 440.0)).astype(int) % 12
    total = np.zeros(12)
    flux = []
    if o['sections']:
        sec = o['sections']
        rows = []
        for s0 in np.arange(0, len(x) / SR, sec):
            a, b = int(s0 * SR), int(min(len(x), (s0 + sec) * SR))
            prof = np.zeros(12)
            accumulate(prof, x, a, b, n, hop, win, band, pc, o['per_frame'])
            total += prof
            p = prof / (prof.sum() + 1e-12)
            rows.append('%5.1f-%5.1f  ' % (s0, s0 + sec) + line(p, np.argsort(p)[::-1][:6], '%s%.0f'))
        accumulate(np.zeros(12), x, 0, len(x), n, hop, win, band, pc, o['per_frame'], flux)
    else:
        accumulate(total, x, 0, len(x), n, hop, win, band, pc, o['per_frame'], flux)
    share = total / total.sum()
    order = np.argsort(-share)
    print('%s: %g to %g Hz, %d-sample frames every %d at %d Hz%s' % (
        path, o['band'][0], o['band'][1], n, hop, SR, ', every frame weighed alike' if o['per_frame'] else ''))
    print('pitch classes: ' + line(share, order, '%s %.1f%%'))
    print('seven strongest: ' + ' '.join(NAMES[k] for k in sorted(order[:7])))
    res = []
    for k in range(12):
        rot = np.roll(share, -k)  # profile index 0 is the tonic; index 0 here is A
        res.append((np.corrcoef(rot, MAJOR)[0, 1], NAMES[k] + ' major'))
        res.append((np.corrcoef(rot, MINOR)[0, 1], NAMES[k] + ' minor'))
    res.sort(reverse=True)
    print('keys: ' + ', '.join('%s %.2f' % (b, a) for a, b in res[:4]))
    if len(flux) > 2:
        fl = np.array(flux)
        fl = (fl - fl.mean()) / (fl.std() + 1e-9)
        ac = np.correlate(fl, fl, 'full')[len(fl) - 1:]
        lags = np.arange(len(ac)) * hop / SR
        m = (lags > 0.4) & (lags < 2.5)
        if m.any():
            best = lags[m][np.argmax(ac[m])]
            print('strongest onset period %.3f s (%.1f bpm)' % (best, 60 / best))
    if o['sections']:
        print('sections of %g s (six strongest, percent):' % o['sections'])
        for r in rows:
            print('  ' + r)
        print('whole: ' + line(share, np.argsort(share)[::-1], '%s%.0f'))


if __name__ == '__main__':
    main()
