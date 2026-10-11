#!/usr/bin/env python3
"""The bed master, the effects stem and the draft mix (v2 build, SCRIPT-v2.md).

Bed (music/bed.wav, stereo, the film's length): Music API take 2
(music/bed.take2.mp3), the film's existing bed, re-cut to the v2 story on its
own bar lines; no new music was generated. The take is 84 bpm in 4/4 (a bar is
2.857 s): a four-bar opening of soft single notes (bars 0 to 3, D B F D),
seven statements of one four-bar phrase (bars 4 to 31, C B E D, the full
texture), and a held A that decays from bar 32 (91.43 s) to silence at
95.5 s. SECTIONS places it like this (the cut times come from
sound/tools/timeline.py):
  - from the title to the cut to the chapter 4 text: the opening bars and the
    first two statements, take 0 to 34.28 s unbroken, placed so the take's
    bar line at 34.29 s is the cut to the chapter 4 text; the second
    statement's downbeat falls on the cut back to Waley's title card;
  - the chapter 4 text (the reader's two readings, lines 9 and 10): no music,
    so bimawen is heard in open air, as in the 100 s cut;
  - from the cut to 心猿: the opening figure again from its second note, then,
    by the take's own succession of chords (bar 3 D into bar 28 C, a 70 ms
    equal-power crossfade ending 10 ms before the downbeat), the take's own
    last statement, whose downbeat is the film's last cut (the close), and
    its held A, which resolves into the film's last frame.
Every join is the take's own succession of chords or a start from silence. A
40 Hz high-pass and two small dips (-1.5 dB at 1.1 kHz, -2.5 dB at 2.6 kHz)
leave the voice its band. The take's gain is the sound lane's -3.7 dB
(BED_GAIN_DB). Ducked 7 dB under every voice clip by one gain curve (10 dB
until the fix round, which left the bed about 16 LU under the voice and
close to inaudible on laptop speakers): down
over 0.3 s ending at the clip's first sound, up over 0.3 s starting 0.1 s
after its last sound, held down through gaps shorter than 1.4 s so it never
pumps between lines; a section that starts just before a line starts already
ducked. A 0.8 s fade out to the last frame. Lookahead limiter at -8 dBFS.

Effects (mix/effects.wav): the cue sheet of tools/cues.py, and a room tone
under the chapter 4 frame (fix round). Where the bed rests (from its fade
out on the cut to the chapter 4 text to its entry after the cut to 心猿) the
sound fell to digital zero in the gaps, for 1.15 s across the cut to 心猿,
which sounds like a fault on headphones. The room tone is seeded noise
(numpy default_rng(1626)), two independent channels, shaped to 1/f between
60 Hz and 8 kHz, at -60 dBFS RMS, faded in over 0.5 s from the start of the
bed's fade out and out over 0.5 s from the bed's entry, so the music hands
over to it and back.

Draft mix (mix/draft-mix.wav): dialogue (vo/*.wav at their plan times) +
bed + effects, 48 kHz stereo, the film's length, measured with ebur128 (true
peak). It is the reference for tools/premix.py and for `el.mjs hear`.
The 100 s cut's file is archive-100s/sound/tools/build_mix.py.

    python3 sound/tools/build_mix.py
"""
import json
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from audio_util import load, save, rms_db, lufs  # noqa: E402
from plan import CLIPS, DURATION, SR, EVENTS  # noqa: E402
from cues import cues  # noqa: E402

S = os.path.dirname(HERE)
BED_SRC = os.path.join(S, 'music', 'bed.take2.mp3')
BAR = 4 * 60 / 84
# (film time of the section's first sample, take in, take out, fade in s, fade out s); see the docstring.
# Take in and out sit 10 ms before a downbeat; the join of the last two is an
# equal-power crossfade of XF that ends 10 ms before the downbeat's attack.
XF = 0.07
_A = EVENTS['cut.s6'] - 12 * BAR          # film time of the take's first sample in the first section
_C = EVENTS['cut.s8'] - 4 * BAR           # film time of take 0 in the opening bars of the last section
C_IN = 0.37                               # the opening figure's second note sounds at 0.397 s in the take
SECTIONS = [
    (_A, 0.0, 12 * BAR - 0.01, 0.03, 0.35),
    (_C + C_IN, C_IN, 4 * BAR - 0.01, 0.02, XF),
    (_C + 4 * BAR - 0.01 - XF, 28 * BAR - 0.01 - XF, 100.0, XF, 0.0),
]
BED_AT = SECTIONS[0][0]
BED_ALONE_LUFS = -20.0  # the take played straight, at BED_GAIN_DB
BED_GAIN_DB = -3.7
DUCK_DB = -7.0
RAMP = 0.3
HOLD_GAP = 1.4
FADE_OUT_AT = round(DURATION - 0.8, 4)
N = int(DURATION * SR)


def voice_extents():
    """(first sound, last sound) of every clip on the timeline, at -45 dBFS in 10 ms frames."""
    ext = []
    for c in CLIPS:
        y = load(os.path.join(S, 'vo', c['id'] + '.wav'), SR)
        d = rms_db(y, SR, 0.01)
        on = np.nonzero(d > -45)[0]
        ext.append((c['id'], c['at'] + on[0] * 0.01, c['at'] + (on[-1] + 1) * 0.01))
    return ext


def duck_curve(ext):
    # A section that starts within HOLD_GAP of a line is ducked from its first sample.
    ext = sorted(list(ext) + [('entry', S0, S0) for S0, *_ in SECTIONS], key=lambda e: e[1])
    spans = []
    for _, a, b in ext:
        a0, b0 = a - RAMP, b + 0.1
        if spans and a0 - spans[-1][1] < HOLD_GAP:
            spans[-1][1] = max(spans[-1][1], b0)
        else:
            spans.append([a0, b0])
    t = np.arange(N) / SR
    g = np.zeros(N)
    for a, b in spans:
        up = np.clip((t - a) / RAMP, 0, 1)
        down = np.clip((b + RAMP - t) / RAMP, 0, 1)
        g = np.maximum(g, np.minimum(up, down))
    g = 0.5 - 0.5 * np.cos(np.pi * g)          # raised-cosine ramps
    return 10 ** (DUCK_DB * g / 20), spans


def ff(src, dest, af, ch=2):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ac', str(ch), '-ar', str(SR), '-c:a', 'pcm_f32le', dest], check=True)


def build_bed(gain_curve):
    tmp = os.path.join(S, 'mix', '_bed_eq.wav')
    ff(BED_SRC, tmp, 'highpass=f=40:poles=2,equalizer=f=1100:t=o:w=1:g=-1.5,equalizer=f=2600:t=o:w=1:g=-2.5')
    m = load(tmp, SR, mono=False).astype(np.float64)
    os.remove(tmp)
    bed = np.zeros((N, 2))
    for at, a, b, fi, fo in SECTIONS:
        seg = m[int(round(a * SR)):min(len(m), int(round(b * SR)))].copy()
        i0 = int(round(at * SR))
        k = min(len(seg), N - i0)
        seg = seg[:k]
        n_in, n_out = int(fi * SR), int(fo * SR)
        # Fades from and to silence are raised-cosine; the crossfade is equal-power.
        if n_in:
            r = np.sin(np.linspace(0, np.pi / 2, n_in))
            seg[:n_in] *= (r if fi == XF else r ** 2)[:, None]
        if n_out and k == int(round(b * SR)) - int(round(a * SR)):
            r = np.cos(np.linspace(0, np.pi / 2, n_out))
            seg[-n_out:] *= (r if fo == XF else r ** 2)[:, None]
        bed[i0:i0 + k] += seg
    fo0, fo1 = int(FADE_OUT_AT * SR), N
    bed[fo0:fo1] *= (np.cos(np.linspace(0, np.pi / 2, fo1 - fo0)) ** 2)[:, None]
    g = BED_GAIN_DB
    bed *= 10 ** (g / 20)
    alone = os.path.join(S, 'mix', 'bed-alone.wav')
    save(alone, bed, SR, bits=24)
    bed *= gain_curve[:, None]
    raw = os.path.join(S, 'mix', '_bed_raw.wav')
    save(raw, bed, SR, bits=24)
    dest = os.path.join(S, 'music', 'bed.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
                    'aresample=192000,alimiter=limit=0.398:attack=5:release=80:level=false,aresample=48000',
                    '-c:a', 'pcm_s24le', dest], check=True)
    os.remove(raw)
    return g


ROOM_DB = -60.0
ROOM_FADE = 0.5
ROOM_AT = round(SECTIONS[0][0] + SECTIONS[0][2] - SECTIONS[0][1] - SECTIONS[0][4], 4)  # the bed's fade out starts
ROOM_TO = round(SECTIONS[1][0] + ROOM_FADE, 4)                                         # 0.5 s after the bed's entry


def room_tone():
    """(start sample, stereo array): the room tone where the bed rests. Deterministic."""
    i0, i1 = int(round(ROOM_AT * SR)), int(round(ROOM_TO * SR))
    n = i1 - i0
    rng = np.random.default_rng(1626)
    f = np.fft.rfftfreq(n, 1 / SR)
    shape = np.where((f >= 60) & (f <= 8000), 1 / np.sqrt(np.maximum(f, 1)), 0.0)
    out = np.zeros((n, 2))
    for ch in range(2):
        X = np.fft.rfft(rng.standard_normal(n)) * shape
        x = np.fft.irfft(X, n)
        out[:, ch] = x * 10 ** (ROOM_DB / 20) / np.sqrt((x ** 2).mean())
    k = int(ROOM_FADE * SR)
    r = np.sin(np.linspace(0, np.pi / 2, k)) ** 2
    out[:k] *= r[:, None]
    out[-k:] *= r[::-1, None]
    return i0, out


def build_effects():
    fx = np.zeros((N, 2))
    i0, room = room_tone()
    fx[i0:i0 + len(room)] += room
    cache = {}
    for t, f, gdb in cues():
        if f not in cache:
            cache[f] = load(os.path.join(S, 'sfx', f + '.wav'), SR).astype(np.float64)
        y = cache[f] * 10 ** (gdb / 20)
        i = int(round(t * SR))
        k = min(len(y), N - i)
        fx[i:i + k] += y[:k, None]
    dest = os.path.join(S, 'mix', 'effects.wav')
    save(dest, fx, SR, bits=24)
    return fx


def main():
    ext = voice_extents()
    curve, spans = duck_curve(ext)
    g = build_bed(curve)
    fx = build_effects()
    dia = load(os.path.join(S, 'mix', 'dialogue.wav'), SR, mono=False).astype(np.float64)
    bed = load(os.path.join(S, 'music', 'bed.wav'), SR, mono=False).astype(np.float64)
    mix = dia[:N] + bed[:N] + fx[:N]
    dest = os.path.join(S, 'mix', 'draft-mix.wav')
    save(dest, mix, SR, bits=24)
    out = {}
    for name, p in [('dialogue', 'mix/dialogue.wav'), ('bed alone (unducked)', 'mix/bed-alone.wav'), ('bed (ducked)', 'music/bed.wav'),
                    ('effects', 'mix/effects.wav'), ('draft mix', 'mix/draft-mix.wav')]:
        I, tp = lufs(os.path.join(S, p))
        out[name] = (I, tp)
        print(f'{name:22s} I {I:6.1f} LUFS   true peak {tp:6.1f} dBFS')
    # the bed under speech and in the open gaps
    bm = bed[:, 0]
    under = np.zeros(N, bool)
    for a, b in spans:
        under[int((a + RAMP) * SR):int(b * SR)] = True
    live = np.zeros(N, bool)
    for at, a, b, *_ in SECTIONS:
        live[int((at + 0.5) * SR):int(min(FADE_OUT_AT, at + b - a - 0.4) * SR)] = True
    def lv(mask):
        return 10 * np.log10((bm[mask] ** 2).mean())
    print(f'bed RMS under speech {lv(under & live):.1f} dBFS, in the open gaps {lv(~under & live):.1f} dBFS')
    print(f'bed gain {g:+.1f} dB; duck spans (s): ' + ', '.join(f'{a:.2f}-{b + RAMP:.2f}' for a, b in spans))
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dest], capture_output=True, text=True).stdout)
    print(f'draft mix length {dur:.4f} s')
    json.dump({'voice_extents': ext, 'duck_spans': [[round(a, 3), round(b + RAMP, 3)] for a, b in spans], 'bed_gain_db': round(g, 2),
               'loudness': {k: {'I_LUFS': v[0], 'true_peak_dBFS': v[1]} for k, v in out.items()}},
              open(os.path.join(S, 'mix', 'measure.json'), 'w'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()
