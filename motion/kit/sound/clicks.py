"""Looks for clicks in a take, a stem or a mix, and prints each candidate with its time.

   python3 kit/sound/clicks.py <file> [threshold] [--edges <clips.json>]
   python3 kit/sound/clicks.py --hf <file> [db] [--edges <clips.json>]

The default detector works on each channel at full band: a sample whose second
difference stands more than `threshold` times (default 12) above the median
second difference of its 10 ms block, and more than 0.01 in absolute terms (a
step or a spike that voices and music do not make). Candidates closer than
50 ms to the one before are merged; the first 40 are printed.

--hf works on the mono fold-down high-passed at 3 kHz (4 poles): a 1 ms window
whose energy stands more than `db` (default 24) above the median of the 60 ms
around it, and above -70 dB. Windows closer than 20 ms are merged; every hit is
printed.

--edges names the clip edges within 15 ms of a hit: every object inside any
list of the JSON file that has numeric "start" and "duration" (a film's
manifest of voice clips and effects), named by its "id", "kind" or "name".
A hit near no edge is "inside a sound".
"""
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio_util import load  # noqa: E402

SR = 48000


def clip_edges(path):
    """(time, label) for the start and end of every clip-like object in the file's lists."""
    edges = []

    def visit(v, in_list):
        if isinstance(v, dict):
            if in_list and isinstance(v.get('start'), (int, float)) and isinstance(v.get('duration'), (int, float)):
                name = v.get('id', v.get('kind', v.get('name', '?')))
                edges.append((v['start'], '%s start' % name))
                edges.append((v['start'] + v['duration'], '%s end' % name))
            for x in v.values():
                visit(x, False)
        elif isinstance(v, list):
            for x in v:
                visit(x, True)

    visit(json.load(open(path)), False)
    return edges


def near(edges, t):
    return ', '.join(n for te, n in edges if abs(te - t) < 0.015) or 'inside a sound'


def second_difference(path, th, edges):
    x = load(path, SR, mono=False)
    hits = []
    for c in range(2):
        d2 = np.abs(np.diff(x[:, c].astype(np.float64), 2))
        w = 480
        n = len(d2) // w
        blk = d2[: n * w].reshape(n, w)
        med = np.median(blk, 1) + 1e-5
        loc = np.repeat(med, w)
        r = d2[: n * w] / loc
        idx = np.nonzero((r > th) & (d2[: n * w] > 0.01))[0]
        last = -1e9
        for i in idx:
            if i - last > SR * 0.05:
                hits.append((i / SR, c, float(r[i]), float(d2[i])))
            last = i
    hits.sort()
    print('%d candidate clicks' % len(hits))
    for h in hits[:40]:
        line = '  %.3f s ch%d ratio %.0f jump %.3f' % h
        print(line + ('  %s' % near(edges, h[0]) if edges is not None else ''))


def high_band(path, db, edges):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-af', 'highpass=f=3000:poles=2,highpass=f=3000:poles=2',
                          '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    w = SR // 1000
    m = len(x) // w
    e = 10 * np.log10((x[: m * w].reshape(m, w) ** 2).mean(1) + 1e-14)
    med = np.array([np.median(e[max(0, i - 30): i + 30]) for i in range(m)])
    hits = [i for i in range(m) if e[i] - med[i] > db and e[i] > -70]
    last = -1
    for i in hits:
        if i - last < 20:
            continue
        last = i
        t = i / 1000
        print('%.3f s  +%.0f dB  %s' % (t, e[i] - med[i], near(edges or [], t)))
    print('%d windows over %g dB' % (len(hits), db))


def main():
    args = sys.argv[1:]
    edges = None
    if '--edges' in args:
        k = args.index('--edges')
        edges = clip_edges(args[k + 1])
        del args[k:k + 2]
    hf = '--hf' in args
    if hf:
        args.remove('--hf')
    if not args:
        raise SystemExit(__doc__)
    if hf:
        high_band(args[0], float(args[1]) if len(args) > 1 else 24.0, edges)
    else:
        second_difference(args[0], float(args[1]) if len(args) > 1 else 12.0, edges)


if __name__ == '__main__':
    main()
