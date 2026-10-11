#!/usr/bin/env python3
"""
slash-announcement: the sound (v3, the faster cut). Run from the film folder after lib/cues.mjs:

  python3 lib/mix.py

Writes audio/vo-<id>.master.wav (each take mastered), audio/bed.master.wav
(the Music API bed, re-cut on its own bar lines to the film's length and
ducked), and audio/film-premix.wav (the film's whole soundtrack, which
index.html plays as its one <audio> clip), plus audio/mix-report.json with
every measurement. Copied from ../slash-partnership/lib/mix.py (the voice
masters, the meters and the limiter are unchanged); the bed edit and the
duck are this film's.

Narrator (Frederick Surrey, kit/audio/voice.json). Each take is used as
ElevenLabs made it: never slowed, sped or time-stretched, and placed so its
.json timings land on audio/placement.json's film times. It is trimmed after
its last word (TAIL, never past GUARD before the next line), given a 10 ms
raised-cosine fade in and a 60 ms fade out, high-passed at 70 Hz, lightly
compressed (2:1), brought to VO_TARGET_MONO LUFS, and held by ffmpeg's
lookahead limiter at 4x oversampling with a VO_CEIL_DB ceiling, so the peak
control is in the master.

Bed (audio/bed.mp3, Music API, 75 s requested, 80.05 BPM, E flat major: beats
at 0.05 + 0.7495k, bar lines every 4 beats; the intro bars 0 to 3, section A
bars 4 to 11, B (A flat and C minor) bars 12 to 15, A' bars 16 to 19, the held
E flat chord on the bar line at 60.01, ringing to silence by about 70 s). v3
re-cuts it on its own bar lines (audio/beats.json's splice): the film starts
BED_OFF (placement.json, 0.277) into the source, so its beats fall on the grid
lib/cues.mjs solved; it plays the intro to the bar line at 9.044 (the end of
bar 2) and jumps forward to the bar line at 36.026 (the start of B), so B, A'
and the held chord follow and the chord lands on the card. The splice is an
80 ms equal-power crossfade that ends on the bar line. splice_measure() reads
how well the two sides match (the bar and the beat before each point, chroma
and log-band spectra) into the report.

Mix: a FADE_IN from frame 0; the duck (solved so the bed sits at BED_UNDER
under the speech, ramping RAMP_IN onto each first word, released over
RAMP_OUT in gaps of HOLD_GAP or more and coming back down RAMP_IN before the
next word, held through shorter gaps). In v3 every gap between lines is under
HOLD_GAP, so the duck holds from the first word to the last and the only
released gap is the one before the card; the bed's alone gain is solved so
that gap peaks at GAP_PEAK (momentary, 400 ms) at the final's gain. A trim
shelf over the TRIM_RAMP before the chord is solved the same way, so the
chord's momentary peak over its first 2 s is CARD_PEAK. A FADE_OUT ends on
the film's last frame, under a lookahead ceiling of BED_CEIL_DB. The premix
is voice + bed, set to FILM_LUFS integrated with one gain, and held under
PREMIX_CEIL_DB true peak by the same lookahead limiter.
"""
import json
import os
import re
import subprocess

import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
A = lambda *p: os.path.join(ROOT, 'audio', *p)

VO_TARGET_MONO = -19.0
VO_CEIL_DB = -3.5
TAIL = 0.28
GUARD = 0.06
BED_UNDER = -26.0  # LUFS of the bed under the narration (the duck depth is solved for it)
GAP_PEAK = -20.3  # the bed's momentary peak in a gap between lines (at most; the opening plays at about -20)
CARD_PEAK = -19.0  # the held chord's momentary peak over its first 2 s under the card
RAMP_IN = 0.2
RAMP_OUT = 0.3
HOLD_GAP = 1.0
FADE_IN = 0.3
FADE_OUT = 0.8
BED_CEIL_DB = -6.0
FILM_LUFS = -16.0
PREMIX_CEIL_DB = -2.0
BEATS = json.load(open(os.path.join(ROOT, 'audio', 'beats.json')))
SPLICE_AT = BEATS['splice']['at']  # source bar line the bed leaves (v3: 9.044, the end of intro bar 2)
SPLICE_TO = BEATS['splice']['to']  # source bar line it resumes on (36.026, the start of bar 12, section B)
SOURCE_HELD = BEATS['sourceHeld']  # the held chord in the source (60.01)
PERIOD = BEATS['period']
XFADE = 0.08
# the card trim's shelf ramps in over this long before the chord's bar line.
# v2 ramped it over 1.0 s inside a 1.23 s gap; v3's gap before the card is
# 0.77 s, and a 1.0 s shelf would cover all of it, so the gap's level and the
# chord's could not be solved apart (the solve ran the alone gain to +2 dB and
# the trim to -11 dB). Over its last 0.12 s the bed is already on the chord's bar.
TRIM_RAMP = 0.12


def decode(path, ch=1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x


def ff(x, chain, ch=1):
    data = (x if ch == 1 else x.reshape(-1)).astype(np.float32).tobytes()
    out = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', chain, '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-'], input=data, capture_output=True, check=True).stdout
    y = np.frombuffer(out, np.float32).astype(np.float64)
    y = y.reshape(-1, ch) if ch > 1 else y
    return y[: len(x)]


def write(path, x, ch=1):
    """24-bit WAV."""
    y = x if ch == 1 else x.reshape(-1)
    data = np.clip(y, -1, 1).astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-c:a', 'pcm_s24le', path], input=data, check=True)


def meter(x, ch=1, start=None, end=None):
    y = x if start is None else x[int(start * SR):int(end * SR)]
    data = (y if ch == 1 else y.reshape(-1)).astype(np.float32).tobytes()
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', 'ebur128=peak=true', '-f', 'null', '-'], input=data, capture_output=True).stderr.decode()
    s = r[r.rfind('Summary:'):]
    mi = re.search(r'I:\s+(-?[\d.]+)', s)
    mp = re.search(r'Peak:\s+(-?[\d.]+|-inf)', s)
    lra = re.search(r'LRA:\s+(-?[\d.]+)', s)
    return (float(mi.group(1)) if mi else float('-inf')), (float(mp.group(1)) if mp and mp.group(1) != '-inf' else float('-inf')), (float(lra.group(1)) if lra else None)


def momentary(x, ch=1):
    """ebur128's momentary loudness (400 ms) every 100 ms: (times, LUFS)."""
    data = (x if ch == 1 else x.reshape(-1)).astype(np.float32).tobytes()
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=data, capture_output=True).stderr.decode()
    ts, ms = [], []
    for m in re.finditer(r't:\s*([\d.]+)\s+TARGET:\S+\s+LUFS\s+M:\s*(-?[\d.]+|-inf)', r):
        ts.append(float(m.group(1)))
        ms.append(float(m.group(2)) if m.group(2) != '-inf' else -120.0)
    return np.array(ts), np.array(ms)


def limit(x, ceil_db, ch=1):
    lin = 10 ** (ceil_db / 20)
    chain = f'aresample=192000,alimiter=limit={lin:.6f}:attack=5:release=60:level=disabled:asc=0,aresample={SR}'
    return ff(x, chain, ch)


def rc(n):
    return 0.5 - 0.5 * np.cos(np.pi * np.arange(n) / max(1, n))


def master_voice(line, next_first):
    x = decode(A(f"vo-{line['id']}.mp3"))
    end = min(line['takeLast'] + TAIL, (next_first - line['start']) - GUARD if next_first else 1e9, len(x) / SR)
    y = x[: int(round(end * SR))].copy()
    nfi, nfo = int(0.010 * SR), int(0.060 * SR)
    y[:nfi] *= rc(nfi)
    y[-nfo:] *= rc(nfo)[::-1]
    y = ff(y, 'highpass=f=70:poles=2,acompressor=threshold=0.063:ratio=2:attack=15:release=180:knee=4:makeup=1')
    I, _, _ = meter(y)
    gain = VO_TARGET_MONO - I
    for _ in range(4):
        z = limit(y * 10 ** (gain / 20), VO_CEIL_DB)
        I2, tp, _ = meter(z)
        if abs(I2 - VO_TARGET_MONO) < 0.05:
            break
        gain += VO_TARGET_MONO - I2
    st = np.stack([z, z], axis=1)
    write(A(f"vo-{line['id']}.master.wav"), st, 2)
    Is, tps, _ = meter(st, 2)
    return st, {'id': line['id'], 'film_start': line['start'], 'kept_s': round(len(z) / SR, 3), 'gain_db': round(gain, 2), 'lufs_mono': round(I2, 2), 'lufs_stereo': round(Is, 2), 'true_peak_dbtp': round(tps, 2)}


def bed_edit(END, OFF):
    src = decode(A('bed.mp3'), 2)
    a = int(round(SPLICE_AT * SR))
    b = int(round(SPLICE_TO * SR))
    n = int(round(XFADE * SR))
    # part 1: source 0 .. SPLICE_AT; part 2: source SPLICE_TO .. end, starting
    # XFADE early so it fades in under part 1's last 80 ms and reaches
    # SPLICE_TO on SPLICE_AT
    p1 = src[:a].copy()
    p2 = src[b - n:].copy()
    w = np.sqrt(rc(n))[:, None]
    ext = np.concatenate([p1[:-n], p1[-n:] * w[::-1] + p2[:n] * w, p2[n:]], axis=0)
    o = int(round(OFF * SR))
    # a positive offset starts the film OFF into the source (v3: 0.277); a
    # negative one would start the bed -OFF after frame 0 (v2's fix round)
    out = ext[o:] if o >= 0 else np.concatenate([np.zeros((-o, ext.shape[1])), ext], axis=0)
    N = int(round(END * SR))
    if len(out) < N:
        out = np.pad(out, ((0, N - len(out)), (0, 0)))
    return out[:N], src


def splice_measure(src):
    """How well the two sides of the splice match: the bar and the beat before
    and after each point, as chroma (12 pitch classes) and as log-band spectra
    (48 bands, 60 Hz to 8 kHz), cosine similarity; and the beats' RMS levels."""
    x = src.mean(axis=1)

    def spec(t0, t1):
        seg = x[int(t0 * SR):int(t1 * SR)]
        n = 1 << int(np.ceil(np.log2(len(seg))))
        return np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n)), np.fft.rfftfreq(n, 1 / SR)

    def bands(t0, t1):
        s, f = spec(t0, t1)
        e = np.geomspace(60, 8000, 49)
        return np.log1p(np.array([s[(f >= e[i]) & (f < e[i + 1])].mean() for i in range(48)]) * 100)

    def chroma(t0, t1):
        s, f = spec(t0, t1)
        m = (f >= 55) & (f <= 4000)
        pc = np.round(12 * np.log2(f[m] / 261.6256)).astype(int) % 12
        c = np.zeros(12)
        np.add.at(c, pc, s[m] ** 2)
        return c

    def cos(a, b):
        return float(a @ b / np.linalg.norm(a) / np.linalg.norm(b))

    def rms(t0, t1):
        seg = x[int(t0 * SR):int(t1 * SR)]
        return float(20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-12))

    a, b, bar = SPLICE_AT, SPLICE_TO, 4 * PERIOD
    return {
        'chroma_bar_before': round(cos(chroma(a - bar, a), chroma(b - bar, b)), 3),
        'chroma_bar_after': round(cos(chroma(a, a + bar), chroma(b, b + bar)), 3),
        'bands_beat_before': round(cos(bands(a - PERIOD, a), bands(b - PERIOD, b)), 3),
        'bands_beat_after': round(cos(bands(a, a + PERIOD), bands(b, b + PERIOD)), 3),
        'rms_beat_before_db': [round(rms(a - PERIOD, a), 1), round(rms(b - PERIOD, b), 1)],
    }


def main():
    pl = json.load(open(A('placement.json')))
    END, CARD, OFF = pl['end'], pl['card'], pl['bedOff']
    lines = pl['lines']
    N = int(round(END * SR))
    voice = np.zeros((N, 2))
    rep = {'lines': []}
    spans = []
    for k, line in enumerate(lines):
        nxt = lines[k + 1]['first'] if k + 1 < len(lines) else None
        st, r = master_voice(line, nxt)
        i = int(round(line['start'] * SR))
        voice[i:i + len(st)] += st[: N - i]
        spans.append((line['first'], line['last']))
        r['first_word'] = line['first']
        r['last_word_end'] = line['last']
        rep['lines'].append(r)
    rep['gaps_s'] = [round(spans[k + 1][0] - spans[k][1], 3) for k in range(len(spans) - 1)]

    bed0, src = bed_edit(END, OFF)
    rep['splice_measure'] = splice_measure(src)
    print('splice', SPLICE_AT, '->', SPLICE_TO, rep['splice_measure'])
    held_f = SOURCE_HELD + (SPLICE_AT - SPLICE_TO) - OFF
    t = np.arange(N) / SR
    # the duck envelope (1 = ducked): held through gaps under HOLD_GAP
    held = [list(spans[0])]
    for s0, e0 in spans[1:]:
        if s0 - held[-1][1] < HOLD_GAP:
            held[-1][1] = e0
        else:
            held.append([s0, e0])
    v0 = np.zeros(N)
    for s, e in held:
        w = np.zeros(N)
        w[(t >= s) & (t <= e)] = 1
        r = (t >= s - RAMP_IN) & (t < s)
        w[r] = 0.5 - 0.5 * np.cos(np.pi * (t[r] - (s - RAMP_IN)) / RAMP_IN)
        f = (t > e) & (t <= e + RAMP_OUT)
        w[f] = 0.5 + 0.5 * np.cos(np.pi * (t[f] - e) / RAMP_OUT)
        v0 = np.maximum(v0, w)
    # the released gaps: between two held windows, and from the last word to the card
    gaps = [(held[k][1], held[k + 1][0]) for k in range(len(held) - 1)] + [(held[-1][1], CARD)]
    gaps0 = gaps
    # the alone gain from the first released gap (v3: the one before the
    # card), the duck depth from the speech windows, measured on the edited
    # bed at unity
    I_open, _, _ = meter(bed0, 2, gaps0[0][0], gaps0[0][1])
    g_alone = GAP_PEAK - 1.5 - I_open
    I_sp = meter(np.concatenate([bed0[int(a * SR):int(b * SR)] for a, b in spans], 0), 2)[0]
    DUCK_DB = BED_UNDER - (I_sp + g_alone)
    I_card, _, _ = meter(bed0, 2, CARD, CARD + 2.0)
    trim = np.zeros(N)
    r = (t >= CARD - TRIM_RAMP) & (t < CARD)
    trim[r] = 0.5 - 0.5 * np.cos(np.pi * (t[r] - (CARD - TRIM_RAMP)) / TRIM_RAMP)
    trim[t >= CARD] = 1.0
    nfi, nfo = int(FADE_IN * SR), int(FADE_OUT * SR)
    b0 = max(0, int(round(-OFF * SR)))  # where the bed starts in the film (its fade in starts there)

    def build(floors, TRIM, g_alone):
        # the duck depth keeps the bed at BED_UNDER under the speech whatever the alone gain
        DUCK_DB = BED_UNDER - (I_sp + g_alone)
        v = v0.copy()
        for (a, b), fl in zip(gaps, floors):
            m = (t >= a) & (t <= b)
            v[m] = np.maximum(v[m], fl)
        g_db = g_alone + DUCK_DB * v + TRIM * trim
        bed = bed0 * (10 ** (g_db / 20))[:, None]
        bed[b0:b0 + nfi] *= rc(nfi)[:, None]
        bed[-nfo:] *= rc(nfo)[::-1][:, None]
        return limit(bed, BED_CEIL_DB, 2)

    def premix(bed):
        film = voice + bed
        I0, _, _ = meter(film, 2)
        gain = FILM_LUFS - I0
        for _ in range(4):
            out = limit(film * 10 ** (gain / 20), PREMIX_CEIL_DB, 2)
            I1, tp1, lra1 = meter(out, 2)
            if abs(I1 - FILM_LUFS) < 0.05:
                break
            gain += FILM_LUFS - I1
        return out, gain, I1, tp1, lra1

    def peaks(bed, gain):
        ts, ms = momentary(bed * 10 ** (gain / 20), 2)
        gp = [float(ms[(ts >= a + 0.1) & (ts <= b)].max()) for a, b in gaps]
        cp = float(ms[(ts >= CARD + 0.1) & (ts <= CARD + 2.0)].max())
        return gp, cp

    # solve the alone gain (the first released gap's momentary peak at
    # GAP_PEAK), each later gap's floor and the card trim by measurement, at
    # the final's gain
    floors = [0.0] * len(gaps)
    TRIM = min(0.0, CARD_PEAK - 2.5 - (I_card + g_alone))
    for it in range(8):
        DUCK_DB = BED_UNDER - (I_sp + g_alone)
        bed = build(floors, TRIM, g_alone)
        out, gain, I1, tp1, lra1 = premix(bed)
        gp, cp = peaks(bed, gain)
        print(f'solve {it}: gap peaks', [round(x, 1) for x in gp], 'card peak', round(cp, 1), 'alone', round(g_alone, 2), 'floors', [round(x, 2) for x in floors], 'trim', round(TRIM, 2))
        done = abs(gp[0] - GAP_PEAK) < 0.15 and all(x <= GAP_PEAK + 0.05 and (x >= GAP_PEAK - 0.6 or f <= 0) for x, f in zip(gp[1:], floors[1:])) and abs(cp - CARD_PEAK) < 0.15
        if done:
            break
        floors = [0.0] + [float(np.clip(f + (x - GAP_PEAK + 0.1) / -DUCK_DB, 0, 1)) for x, f in zip(gp[1:], floors[1:])]
        TRIM = min(0.0, TRIM - (cp - CARD_PEAK))
        g_alone += GAP_PEAK - gp[0]
    write(A('bed.master.wav'), bed, 2)
    write(A('film-premix.wav'), out, 2)

    g = 10 ** (gain / 20)
    Iv, tpv, _ = meter(voice * g, 2)
    def win_lufs(x, wins):
        parts = [x[int(a * SR):int(b * SR)] for a, b in wins if b - a >= 0.4]
        return meter(np.concatenate(parts, 0), 2)[0] if parts else None
    bedg = bed * g
    rel = [(spans[k][1] + RAMP_OUT, spans[k + 1][0] - RAMP_IN) for k in range(len(spans) - 1) if spans[k + 1][0] - spans[k][1] >= HOLD_GAP]
    rep.update({
        'gaps_film_s': [[round(a, 3), round(b, 3)] for a, b in gaps],
        'gap_floor_of_duck': [round(x, 3) for x in floors],
        'bed_momentary_peak_gaps': [round(x, 1) for x in gp],
        'bed_momentary_peak_card_first_2s': round(cp, 1),
        'end_s': END, 'card_s': CARD, 'bed_offset_s': OFF,
        'splice_source_s': [SPLICE_AT, SPLICE_TO], 'splice_film_s': round(SPLICE_AT - OFF, 3),
        'held_chord_film_s': round(held_f, 3),
        'bed_alone_gain_db': round(g_alone, 2), 'duck_db': round(DUCK_DB, 2), 'card_trim_db': round(TRIM, 2),
        'bed_lufs_under_speech': round(win_lufs(bedg, spans), 2),
        'bed_lufs_released_gaps': round(win_lufs(bedg, rel), 2) if rel else None,
        'bed_lufs_card': round(meter(bedg, 2, CARD, END)[0], 2),
        'bed_lufs_card_first_2s': round(meter(bedg, 2, CARD, CARD + 2)[0], 2),
        'bed_true_peak': round(meter(bedg, 2)[1], 2),
        'narrator_lufs': round(Iv, 2), 'narrator_true_peak': round(tpv, 2),
        'premix_gain_db': round(gain, 2), 'premix_lufs': round(I1, 2), 'premix_true_peak': round(tp1, 2), 'premix_lra': lra1,
        'premix_seconds': round(len(out) / SR, 4),
    })
    json.dump(rep, open(A('mix-report.json'), 'w'), indent=1)
    print(json.dumps({k: v for k, v in rep.items() if k != 'lines'}, indent=1))
    for r in rep['lines']:
        print(r)


if __name__ == '__main__':
    main()
