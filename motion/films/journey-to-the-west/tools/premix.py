#!/usr/bin/env python3
"""Writes sound/mix/film-mix.wav: the film's whole sound as one file.

The renderer mixes several <audio> clips with one ffmpeg amix whose inputs are
demuxed in parallel, and its decoded output varied between renders of the same
composition (CRITIQUE-2.md, Determinism: a residual of -45 to -55 dBFS from
8.7 s on). One file has nothing to interleave, so the delivery's sound is the
same in every render.

This is the same sum the renderer makes of the clips index.html would place
with PREMIX off: every clip of sound/manifest.json at its start (rounded to
the millisecond, as the renderer's adelay rounds it), trimmed to its duration,
the mono takes on both channels, the bed and the effects stem from 0, all at
compose.py's GAIN. 48 kHz stereo, 24-bit, the film's length (v2: SCRIPT-v2.md;
14 voice clips, the reader's one clip placed twice). A lookahead limiter at
-2 dBFS on a 4x oversampled signal (ffmpeg alimiter, as build_vo.py uses) is
the ceiling: the renderer turns the whole AAC track down to -1.5 dBTP when the
true peak passes -1 dBTP, and the voice and the bed can peak together (58.5 s).

    python3 tools/premix.py && python3 tools/compose.py
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'sound', 'tools'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio_util import load, save  # noqa: E402
from compose import GAIN  # noqa: E402

SR = 48000
OUT = os.path.join(ROOT, 'sound', 'mix', 'film-mix.wav')


def main():
    m = json.load(open(os.path.join(ROOT, 'sound', 'manifest.json')))
    n = int(round(m['duration'] * SR))
    g = float(GAIN)
    mix = np.zeros((n, 2), dtype=np.float64)
    for c in m['clips']:
        x = load(os.path.join(ROOT, c['file']), SR).astype(np.float64)
        x = x[:int(round(c['duration'] * SR))]
        at = int(round(c['start'] * 1000)) * (SR // 1000)
        end = min(n, at + len(x))
        mix[at:end] += g * x[:end - at, None]
    for f in (m['music']['file'], m['effects']['stem']):
        y = load(os.path.join(ROOT, f), SR, mono=False).astype(np.float64)[:n]
        mix[:len(y)] += g * y
    raw = OUT.replace('.wav', '._raw.wav')
    save(raw, mix, SR, bits=24)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
                    'aresample=192000,alimiter=limit=0.794:attack=5:release=60:level=false,aresample=48000',
                    '-c:a', 'pcm_s24le', OUT], check=True)
    os.remove(raw)
    peak = 20 * np.log10(np.max(np.abs(mix)))
    print(f'{os.path.relpath(OUT, ROOT)}: {len(m["clips"])} clips + bed + effects at gain {GAIN}, {n / SR:.3f} s, sample peak before the ceiling {peak:.2f} dBFS')


if __name__ == '__main__':
    main()
