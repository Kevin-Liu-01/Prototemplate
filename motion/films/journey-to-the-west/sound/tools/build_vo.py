#!/usr/bin/env python3
"""Voice masters and the dialogue stem.

For every clip in tools/plan.py: cut the chosen take (joining r03's spans with
10 ms crossfades in its own pauses), high-pass at 70 Hz, set every clip to one
active speech level, apply the clip's fades, and write vo/<id>.wav (48 kHz mono,
24 bit). Then place the clips on the 100.0 s timeline as mix/dialogue.wav and
measure it with ebur128. One gain for all clips brings the dialogue alone to
-16 LUFS integrated; the masters are written with that gain applied, so the
composition plays each <audio> clip at volume 1. A lookahead limiter
(ffmpeg alimiter, 4x oversampled) holds each master at or under -3 dBFS.

Plosives: the 70 Hz high-pass left the low thump of a p or b (the P of
"Pigsy" reached -24 dBFS below 60 Hz). The narrator's clips therefore also take
a 4th-order 90 Hz high-pass (Clara's pitch stays above about 140 Hz, 5th
percentile, apart from a little creak near 80 Hz at some phrase ends, which the
filter lowers by about 6 dB at its fundamental and not at its harmonics), and depop() then finds every 20 ms window whose energy below
60 Hz still passes DEPOP_DB at the master's level and, there only (with 40 ms
either side and 25 ms ramps), blends in an 8th-order 120 Hz high-pass: the b
of the reader's 弼 and what is left of the narrator's p. All three filters are
zero phase, so the blend never shifts the voice. Nothing below 60 Hz then
passes -45 dBFS in any master.

v2 build (2026-10-05): the narrator is Frederick Surrey, a baritone whose
pitch runs down to about 80 Hz (1st percentile, median 101 Hz), so Clara's
filters would thin his voice: the 70 Hz and 90 Hz high-passes would take 2 to
5 dB off his fundamental. His clips take a 2-pole 40 Hz high-pass and a
zero-phase 4th-order 50 Hz high-pass (-0.1 dB at 80 Hz), and depop() looks at
the band below 45 Hz (FILTERS) and blends in an 8th-order 75 Hz high-pass
there only (-1.3 dB at 80 Hz, -44 dB at 40 Hz), round his plosives. The
reader's clip keeps the sound lane's filters. The 100 s cut's file is
archive-100s/sound/tools/build_vo.py.

    python3 sound/tools/build_vo.py
"""
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from audio_util import load, save, rms_db, lufs  # noqa: E402
from plan import CLIPS, DURATION, SR, spans  # noqa: E402

S = os.path.dirname(HERE)
TARGET_ACTIVE = -24.0   # dBFS active speech level per clip before the global gain
TARGET_LUFS = -16.0
XF = 0.010
DEPOP_DB = -50.0
# The narrator's filters (v2: Frederick Surrey): ffmpeg high-pass, zero-phase
# high-pass (fc, order), depop band (fc of the 8th-order low-pass measured),
# depop threshold and the high-pass blended in (fc, order).
FILTERS = {
    'N': dict(hp=40, zp=(50, 4), band=45, depop_db=-48.0, blend=(75, 8)),
    'R': dict(hp=70, zp=None, band=60, depop_db=-50.0, blend=(120, 8)),
}


def active_level(x):
    d = rms_db(x, SR, 0.01)
    keep = d > d.max() - 25
    p = (10 ** (d[keep] / 10)).mean()
    return 10 * np.log10(p)


def cut(c):
    parts = []
    for src, a, b, gdb in spans(c):
        x = load(os.path.join(S, 'takes', src + '.mp3'), SR)
        parts.append(x[int(round(a * SR)):int(round(b * SR))].astype(np.float64) * 10 ** (gdb / 20))
    y = parts[0]
    n = int(XF * SR)
    for p in parts[1:]:
        r = np.linspace(0, 1, n)
        y = np.concatenate([y[:-n], y[-n:] * (1 - r) + p[:n] * r, p[n:]])
    return y


def highpass(y, f=70):
    tmp = os.path.join(S, 'mix', '_hp_in.wav')
    out = os.path.join(S, 'mix', '_hp_out.wav')
    save(tmp, y, SR, bits=24)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'highpass=f={f}:poles=2', '-c:a', 'pcm_f32le', out], check=True)
    z = load(out, SR)
    os.remove(tmp)
    os.remove(out)
    return z.astype(np.float64)


def fades(y, fin, fout):
    y = y.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a:
        y[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if b:
        y[-b:] *= np.cos(np.linspace(0, np.pi / 2, b)) ** 2
    return y


def zero_phase(y, fc, order, kind):
    """Butterworth magnitude response applied with no phase shift (FFT, padded)."""
    pad = int(0.25 * SR)
    z = np.concatenate([np.zeros(pad), y, np.zeros(pad)])
    f = np.fft.rfftfreq(len(z), 1 / SR)
    f[0] = 1e-6
    r = (f / fc) if kind == 'low' else (fc / f)
    H = 1 / np.sqrt(1 + r ** (2 * order))
    return np.fft.irfft(np.fft.rfft(z) * H, len(z))[pad:pad + len(y)]


def low_db(y, win=0.02, hop=0.01, band=60):
    """20 ms RMS of the band below `band` Hz, every 10 ms, in dBFS."""
    lo = zero_phase(y, band, 8, 'low')
    w, h = int(win * SR), int(hop * SR)
    n = max(1, (len(lo) - w) // h + 1)
    return np.array([20 * np.log10(np.sqrt((lo[i * h:i * h + w] ** 2).mean()) + 1e-12) for i in range(n)])


def depop(y, F):
    d = low_db(y, band=F['band'])
    hot = np.nonzero(d > F['depop_db'])[0]
    if len(hot) == 0:
        return y, 0
    m = np.zeros(len(y))
    h, w, edge = int(0.01 * SR), int(0.02 * SR), int(0.04 * SR)
    for i in hot:
        m[max(0, i * h - edge):min(len(y), i * h + w + edge)] = 1.0
    ramp = np.hanning(2 * int(0.025 * SR) + 1)
    m = np.clip(np.convolve(m, ramp / ramp.sum(), 'same'), 0, 1)
    hp = zero_phase(y, F['blend'][0], F['blend'][1], 'high')
    return y + m * (hp - y), len(hot)


def limit(path_in, path_out):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path_in, '-af',
                    'aresample=192000,alimiter=limit=0.708:attack=5:release=60:level=false,aresample=48000',
                    '-c:a', 'pcm_s24le', path_out], check=True)


def main():
    os.makedirs(os.path.join(S, 'vo'), exist_ok=True)
    os.makedirs(os.path.join(S, 'mix'), exist_ok=True)
    clips = {}
    for c in CLIPS:
        F = FILTERS[c['who']]
        y = highpass(cut(c), F['hp'])
        if F['zp']:
            y = zero_phase(y, F['zp'][0], F['zp'][1], 'high')
        lv = active_level(y)
        y = y * 10 ** ((TARGET_ACTIVE - lv) / 20)
        y = fades(y, c.get('fin', 0.008), c.get('fout', 0.03))
        clips[c['id']] = (c, y, lv)

    def stem(gain_db):
        t = np.zeros(int(DURATION * SR))
        for c, y, _ in clips.values():
            i = int(round(c['at'] * SR))
            t[i:i + len(y)] += y * 10 ** (gain_db / 20)
        return t

    probe = os.path.join(S, 'mix', '_dialogue_probe.wav')
    save(probe, np.stack([stem(0)] * 2, 1), SR, bits=24)
    i0, _ = lufs(probe)
    os.remove(probe)
    g = TARGET_LUFS - i0
    popped = {}
    for cid, (c, y, lv) in clips.items():
        raw = os.path.join(S, 'mix', f'_{cid}.wav')
        z, popped[cid] = depop(y * 10 ** (g / 20), FILTERS[c['who']])
        save(raw, z, SR, bits=24)
        limit(raw, os.path.join(S, 'vo', cid + '.wav'))
        os.remove(raw)
    # the stem from the written masters, so it measures what the film plays
    t = np.zeros(int(DURATION * SR))
    for c in CLIPS:
        y = load(os.path.join(S, 'vo', c['id'] + '.wav'), SR).astype(np.float64)
        i = int(round(c['at'] * SR))
        t[i:i + len(y)] += y
    dest = os.path.join(S, 'mix', 'dialogue.wav')
    save(dest, np.stack([t, t], 1), SR, bits=24)
    I, tp = lufs(dest)
    print(f'clips at {TARGET_ACTIVE} dBFS active, then {g:+.2f} dB for all: dialogue stem {I:.1f} LUFS, true peak {tp:.1f} dBFS')
    for c in CLIPS:
        _, y, lv = clips[c['id']]
        z = load(os.path.join(S, 'vo', c['id'] + '.wav'), SR).astype(np.float64)
        lo, lo40 = low_db(z).max(), low_db(z, band=40).max()
        print(f"  {c['id']}  src {c['src']:5s}  active {lv:6.1f} dBFS -> gain {TARGET_ACTIVE - lv + g:+6.1f} dB  len {len(y) / SR:5.2f} s  at {c['at']:6.2f}"
              f"  de-popped {popped[c['id']] * 10:4d} ms  below 60 Hz max {lo:6.1f}, below 40 Hz max {lo40:6.1f} dBFS")
    print(f'dialogue stem below 60 Hz: max {low_db(t).max():.1f} dBFS; below 40 Hz: max {low_db(t, band=40).max():.1f} dBFS')


if __name__ == '__main__':
    main()
