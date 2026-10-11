#!/usr/bin/env python3
"""blog-designing-docs, round 7d (jump count added for v4): the music bed as the film plays it.

Kevin, after round 7: "for the blogs i liked the peaceful music from before".
That is the round 5 bed: one ElevenLabs sound generation (audio/bed.mp3, a
byte copy of audio/archive-r6a/bed.mp3, 28 s), airy and glassy, soft pad
chords under a quiet celesta arpeggio. This script builds it to the film's
length, deterministically (same input, same bytes out):

  python3 audio/make-bed.py          write audio/bed-edit.wav (and audio/bed-edit.json: the joins on the film clock)
  python3 audio/make-bed.py --report also print each join's pad correlation

The generation, measured (round 6 and round 7d):
  - an eighth-note pulse every 0.37514 s (80 BPM) from 0.24 s, bars of eight
    eighths (3.001 s); pad chords in G with E minor, C and D colours that
    change slowly, with no downbeat accent strong enough to name a bar line;
  - its own swell from silence over 0 to 2.0 s, a steady body after it, and
    its own resolution from 24.35 s, which decays to silence by 28.0 s.

The film needs the body to run until the end card's cut (CARD, read from
`const B` in index.html) and the resolution to ring out under the silent
card. So the bed is one passage with whole jumps back of six bars each (48
eighths, 18.007 s), at the phrase point where the music on both sides of
the jump is most alike: source 22.373 s returns to source 4.366 s (chroma
cosine 0.94 over the 1.5 s on each side, levels within 1.1 dB). The film
starts at the source time that puts the resolution (24.35 s) exactly on
CARD, so the pulse, the bar and the chords keep their places across every
join and the resolution begins on the card's cut. The number of jumps is
the smallest that starts the film at or past the generation's swell
(source 2.0 s): one for the 37.5 s card of v3, two for the 46.5 s card of
v4 (DESIGN-v4.md, section 9). Each join is a 0.75 s equal-power crossfade
(two eighths, the two sides are different notes of the same chords),
pinned within 25 ms to where the pads (under 400 Hz) of the two sides
correlate best, so it does not comb; the same source segments meet at
every join, so the pin is the same at each and the returns add up.

Then the round 5 tone: no EQ, and round 5's stereo treatment (its
audio/master.sh, revision 5b), a mid/side matrix that keeps the mid and
0.35 of the side, left = 0.675 L + 0.325 R, right = 0.325 L + 0.675 R,
because the generation's notes land hard left or hard right against the
centred narrator. The coefficients sum to 1, so no sample passes the
source's peak. Level, duck, carve and fades belong to audio/mix.py.
"""
import os
import re
import subprocess
import sys

import numpy as np

SR = 48000
EIGHTH = 0.37514
LAG = 48 * EIGHTH  # six bars
JOIN_SRC = 22.373  # the source time the jump leaves from (the crossfade's centre)
RES = 24.35  # the generation's own resolution
SWELL = 2.0  # the generation's own swell from silence ends here
XF = 2 * EIGHTH  # 0.75 s
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'bed-edit.wav')


def film_clock():
    html = open(os.path.join(ROOT, 'index.html')).read()
    m = re.search(r'const B = \{([^}]+)\}', html)
    B = dict((k.strip(), float(v)) for k, v in (p.split(':') for p in m.group(1).split(',')))
    return B['card'], B['end']


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def lowpass(x, fc):
    """Zero-phase FFT low-pass with a raised-cosine edge (for scoring the join only)."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.clip((fc * 1.25 - f) / (fc * 0.5), 0, 1)
    g = 0.5 - 0.5 * np.cos(np.pi * g)
    return np.fft.irfft(X * g, n)


def main():
    report = '--report' in sys.argv
    card, film = film_clock()
    src = decode(os.path.join(HERE, 'bed.mp3'))
    mono = src.mean(1)
    # The film starts where the resolution lands on the card after n jumps: start + card - n * LAG = RES, with the
    # smallest n that starts the film at or past the swell.
    n = 1
    while n * LAG - (card - RES) < SWELL:
        n += 1
    start = n * LAG - (card - RES)
    # Pin the return within 25 ms of the six-bar lag, on the pads' correlation across the crossfade.
    a0 = int((JOIN_SRC - XF) * SR)
    a1 = int((JOIN_SRC + XF) * SR)
    seg_a = lowpass(mono[a0 - SR:a1 + SR], 400)[SR:SR + (a1 - a0)]
    best = (-2.0, 0)
    for d in range(-int(0.025 * SR), int(0.025 * SR) + 1, 4):
        b0 = int((JOIN_SRC - LAG - XF) * SR) + d
        seg_b = lowpass(mono[b0 - SR:b0 + (a1 - a0) + SR], 400)[SR:SR + (a1 - a0)]
        c = float(np.dot(seg_a, seg_b) / (np.linalg.norm(seg_a) * np.linalg.norm(seg_b) + 1e-12))
        if c > best[0]:
            best = (c, d)
    pin = best[1] / SR
    # Passage j plays source = film + offs[j]; it hands over to passage j + 1 where it reaches JOIN_SRC.
    offs = [start - j * LAG + j * pin for j in range(n + 1)]
    joins = [JOIN_SRC - offs[j] for j in range(n)]
    N = int(round(film * SR))
    t = np.arange(N) / SR

    def take(off):
        idx = np.round((t + off) * SR).astype(np.int64)
        ok = (idx >= 0) & (idx < len(src))
        out = np.zeros((N, 2))
        out[ok] = src[idx[ok]]
        return out

    out = np.zeros((N, 2))
    for j in range(n + 1):
        w = np.ones(N)
        if j > 0:
            u = np.clip((t - (joins[j - 1] - XF / 2)) / XF, 0, 1)
            w *= np.sin(0.5 * np.pi * u)
        if j < n:
            u = np.clip((t - (joins[j] - XF / 2)) / XF, 0, 1)
            w *= np.cos(0.5 * np.pi * u)
        out += take(offs[j]) * w[:, None]
    L, R = out[:, 0].copy(), out[:, 1].copy()
    out[:, 0] = 0.675 * L + 0.325 * R
    out[:, 1] = 0.325 * L + 0.675 * R
    fi, fo = int(0.005 * SR), int(0.02 * SR)
    out[:fi] *= (np.arange(fi) / fi)[:, None]
    out[-fo:] *= (np.arange(fo)[::-1] / fo)[:, None]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', OUT], input=out.astype(np.float32).tobytes(), check=True)
    peak = 20 * np.log10(np.abs(out).max() + 1e-12)
    # The joins on the film clock, for audio/mix.py (it holds the bed's gap lift until a join's crossfade has passed).
    import json
    json.dump({'joins': [round(J, 4) for J in joins], 'xf': XF, 'film_start_source': round(offs[0], 4), 'resolution_film': round(RES - offs[n], 4), 'pin_s': pin, 'pad_correlation': round(best[0], 4)}, open(os.path.join(HERE, 'bed-edit.json'), 'w'), indent=1)
    print(f'{os.path.relpath(OUT, ROOT)}: {film:g} s; {n} jump(s) of {LAG:.3f} s; film 0 = source {offs[0]:.3f} s; '
          f'resolution at film {RES - offs[n]:.3f} s (card {card:g}); peak {peak:.1f} dBFS')
    for j, J in enumerate(joins):
        print(f'  join {j + 1} at film {J:.3f} s (source {JOIN_SRC} to {JOIN_SRC - LAG + pin:.4f}, pin {pin * 1000:+.1f} ms'
              + (f', pad correlation {best[0]:.3f})' if report else ')'))


if __name__ == '__main__':
    main()
