#!/usr/bin/env python3
"""
blog-designing-docs, the v4 cut (DESIGN-v4.md, 2026-10-06) and its fix round: the sound. Round 7d's mix, pointed at the
ten v3 takes (Frederick Surrey) as recorded, placed on the fix round's longer gaps.

  python3 audio/make-bed.py   the bed at the film's length (audio/bed-edit.wav), from the round 5 generation
  python3 audio/mix.py        masters, the mixed bed, the premix, the report, and the composition's <audio> attributes

Picture and sound share one clock: the cue table `const O = [...]` in
index.html, where O[n] is the film time of line n's first word, and the
scene clock `const B = {...}` (the card's cut and the film's end).

Narrator (audio/vo-N.master.wav, 48 kHz, dual mono). Each ElevenLabs take
(Frederick Surrey, kit/audio/voice.json, speed 1.0, one take per line; line 6 retaken once) is trimmed to
30 ms before its first sound (or 0.05 s before its first word, whichever is
earlier; scribe_v1 word times in audio/vo-N.stt.json can start after a soft
onset) and at least 0.30 s after its last word (and 80 ms past its last
sound), with a 10 ms raised-cosine fade in and a 60 ms fade out. Nothing is
cut inside a line and nothing is time-stretched. Then a 60 Hz high-pass, a
gentle 2:1 compressor, a gain to VO_TARGET_MONO LUFS (about -16 LUFS as the
stereo film reads dual mono), and ffmpeg's lookahead limiter at 4x
oversampling with a VO_CEIL_DB ceiling, so the true peak is held here: the
renderer turns the whole AAC track down past -1 dBTP and its limiter
worklet has no lookahead. Each master is placed so its first word lands on
O[n].

Bed (audio/music.master.wav, 48 kHz stereo): audio/bed-edit.wav, the round 5
generation built to the film's length by make-bed.py (its tone and stereo
treatment are round 5's; no EQ here). Under the narration it ducks and takes
a dip shaped by the voice, both on one envelope of the narration:
  - the envelope holds through every gap under HOLD_GAP, so the bed is never
    let go between lines: it ramps down over RAMP_IN onto the first word of a
    held run and back up over RAMP_OUT after its last word, and in each gap
    of GAP_MIN or more inside a run it comes up GAP_LIFT of the way (up over
    GAP_RAMP from GAP_DELAY after the last word, down over GAP_DOWN onto the
    next first word); in the v4 fix round gaps 2 to 9 (1.30 to 2.18 s) lift,
    so the music fills the pauses the pictures hold in, and gap 1 (0.80 s)
    stays down (the bed's second join, 29.53, is under gap 6's lift);
  - a gap longer than HOLD_GAP would let the bed come up alone (round 7d's
    bridge); the fix round has none (its longest gap is 2.18 s);
  - under speech the bed sits at BED_SPEECH LUFS before the dip; the dip then
    holds the bed DIP_MARGIN_DB under the voice's median in every third of an
    octave from 150 Hz to 12 kHz where it would come closer (at most
    DIP_MAX_DB), and in the narrator's vowel band (DIP_VOWEL) DIP_VOWEL_MARGIN_DB
    further, by up to DIP_VOWEL_MAX_DB more. This bed has most of its body in
    160 to 800 Hz, so the level under speech comes from its low end and its
    top while his vowels keep their room (about -28.5 LUFS under speech);
  - alone, at the open, in the bridge and on the card, its largest 400 ms
    loudness is BED_ALONE_M LUFS.
A FADE_IN fade at the open, a FADE_OUT fade at the end, and a -5 dBFS
lookahead ceiling on the bed.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
P = lambda *a: os.path.join(HERE, *a)

LINES = [
    'Most docs readers are now AI agents.',
    'Humans still read docs to evaluate a product.',
    'General Translation redesigned its docs from scratch so people would read its writing.',
    'Interfaces keep getting more cluttered, which creates mental clutter.',
    'The redesign started by deleting extra lines, links, and buttons.',
    'The sidebar is now one accordion, which is rare among docs sites.',
    'The writing now has more open space around it.',
    'Translated pages keep the same spacing and alignment.',
    'Each page guides its reader toward the action they want.',
    'Docs design is an open problem, and the team keeps working on it.',
]
VO_TARGET_MONO = -17.9
VO_CEIL_DB = -3.5
BED_SPEECH = -14.5
BED_ALONE_M = -20.0
DIP_MARGIN_DB = 6.0
DIP_MAX_DB = 12.0
# The narrator's vowels (his first formants) sit in this band, where this bed has most of its body; there the dip keeps
# the bed further under him: DIP_VOWEL_MARGIN_DB more margin, and up to DIP_VOWEL_MAX_DB more depth.
# Frederick Surrey's first formants reach down to about 300 Hz (Clara's sat in 400 to 800 Hz), so the band starts at 300.
DIP_VOWEL = (300.0, 800.0)
DIP_VOWEL_MARGIN_DB = 4.0
DIP_VOWEL_MAX_DB = 8.0
HOLD_GAP = 2.4
RAMP_IN = 0.2
RAMP_OUT = 0.8
# In each held gap between lines the bed comes up part of the way (GAP_LIFT of the duck and the dip), on GAP_RAMP
# ramps that start just after the last word and end on the next first word, so the music is heard between lines
# without being let go. Fix round: 0.5 (v4: 0.7). The card's move to 49.5 starts the bed 3 s earlier in its source,
# where the open is quieter, so the alone gain rose 4.2 dB and at 0.7 the gaps read -20 to -22 LUFS in 400 ms
# windows; at 0.5 they read -21.6 to -24.8, as v4's did (-23.2 to -26.8).
GAP_LIFT = 0.5
GAP_DELAY = 0.10
# Fix round: gentler ramps (were 0.35 and 0.30), so the lift in each pause does not pump.
GAP_RAMP = 0.5
GAP_DOWN = 0.4
# v4 fix round: the gaps are 0.80 to 2.18 s (all held: HOLD_GAP is over the longest). Gaps of GAP_MIN or more lift
# (to about -24 LUFS in a 400 ms window), so the music fills the pauses; the 0.80 s gap after line 1 is too short to
# lift without pumping. The bed's second join (audio/bed-edit.json) falls in gap 6 under the lift: held down until
# the join had passed, that gap rose twice (-30, -23, -27, -21 LUFS in 400 ms windows); lifted as the others, it is one
# smooth rise to -20 with no step at the join.
GAP_MIN = 0.9
FADE_IN = 0.25
FADE_OUT = 0.8


def decode(path, ch=1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x


def ff(x, chain, ch=1):
    """Runs a float buffer through an ffmpeg filter chain (48 kHz in and out)."""
    data = (x if ch == 1 else x.reshape(-1)).astype(np.float32).tobytes()
    out = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', chain, '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-'], input=data, capture_output=True, check=True).stdout
    y = np.frombuffer(out, np.float32).astype(np.float64)
    return y.reshape(-1, ch) if ch > 1 else y


def write(path, x, ch=1):
    """16-bit WAV with TPDF dither (seeded, so the file is the same every run)."""
    rng = np.random.default_rng(7)
    y = x if ch == 1 else x.reshape(-1)
    d = rng.random(y.shape) - rng.random(y.shape)
    q = np.clip(np.round(y * 32767 + d), -32768, 32767).astype('<i2')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-c:a', 'pcm_s16le', path], input=q.tobytes(), check=True)


def meter(x, ch=1, start=None, end=None):
    """Integrated loudness (LUFS) and true peak (dBTP) of a buffer or a window of it."""
    y = x if start is None else x[int(start * SR):int(end * SR)]
    data = (y if ch == 1 else y.reshape(-1)).astype(np.float32).tobytes()
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', 'ebur128=peak=true', '-f', 'null', '-'], input=data, capture_output=True).stderr.decode()
    s = r[r.rfind('Summary:'):]
    mi = re.search(r'I:\s+(-?[\d.]+)', s)
    mp = re.search(r'Peak:\s+(-?[\d.]+|-inf)', s)
    return (float(mi.group(1)) if mi else float('-inf')), (float(mp.group(1)) if mp and mp.group(1) != '-inf' else float('-inf'))


def concat_windows(x, wins, ch=1):
    parts = [x[int(a * SR):int(b * SR)] for a, b in wins]
    return np.concatenate(parts, axis=0)


def rc_fade(n):
    return 0.5 - 0.5 * np.cos(np.pi * np.arange(n) / max(1, n))


def clocks():
    html = open(os.path.join(ROOT, 'index.html')).read()
    m = re.search(r'const O = \[([^\]]+)\];', html)
    O = [float(v) for v in m.group(1).split(',')]
    m = re.search(r'const B = \{([^}]+)\}', html)
    B = dict((k.strip(), float(v)) for k, v in (p.split(':') for p in m.group(1).split(',')))
    return O, B


def words(n):
    j = json.load(open(P(f'vo-{n}.stt.json')))
    return [w for w in j['words'] if w['type'] == 'word']


def limit(x, ceil_db, ch=1):
    """Lookahead limiter at 4x oversampling (ffmpeg alimiter), so inter-sample peaks are held."""
    lin = 10 ** (ceil_db / 20)
    chain = f'aresample=192000,alimiter=limit={lin:.6f}:attack=5:release=60:level=disabled:asc=0,aresample={SR}'
    data = (x if ch == 1 else x.reshape(-1)).astype(np.float32).tobytes()
    out = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', chain, '-f', 'f32le', '-ac', str(ch), '-'], input=data, capture_output=True, check=True).stdout
    y = np.frombuffer(out, np.float32).astype(np.float64)
    y = y.reshape(-1, ch) if ch > 1 else y
    return y[: len(x)]


def master_voice(n):
    x = decode(P(f'vo-{n}.mp3'))
    ws = words(n)
    fs, le = ws[0]['start'], ws[-1]['end']
    report = {'first_word': fs, 'last_end': le}
    # The take's own sound edges (5 ms frames over -60 dBFS): scribe's word times can start after a soft onset
    # and end before a falling fricative, so the trim follows the energy.
    fr = int(0.005 * SR)
    lv = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + fr] ** 2)) + 1e-12) for i in range(0, len(x) - fr, fr)])
    on = int(np.argmax(lv > -60)) * 0.005
    off = (len(lv) - 1 - int(np.argmax(lv[::-1] > -60))) * 0.005 + 0.005
    t0 = max(0.0, min(fs - 0.05, on - 0.03))
    t1 = min(len(x) / SR, max(le + 0.30, off + 0.08))
    a = int(round(t0 * SR))
    b = int(round(t1 * SR))
    report.update({'sound_on': round(on, 3), 'sound_off': round(off, 3), 'trim': [round(t0, 3), round(t1, 3)], 'lead': round(fs - t0, 3)})
    y = x[a:b].copy()
    nfi, nfo = int(0.010 * SR), int(0.060 * SR)
    y[:nfi] *= rc_fade(nfi)
    y[-nfo:] *= rc_fade(nfo)[::-1]
    y = ff(y, 'highpass=f=60:poles=2,acompressor=threshold=0.063:ratio=2:attack=15:release=180:knee=4:makeup=1')
    I, _ = meter(y)
    y = y * 10 ** ((VO_TARGET_MONO - I) / 20)
    y = limit(y, VO_CEIL_DB)
    I2, tp = meter(y)
    st = np.stack([y, y], axis=1)
    Is, tps = meter(st, 2)
    write(P(f'vo-{n}.master.wav'), st, 2)
    report.update({'master_seconds': round(len(y) / SR, 3), 'lufs_mono': round(I2, 2), 'lufs_stereo': round(Is, 2), 'true_peak_dbtp': round(tps, 2), 'speech_seconds': round(le - fs, 3)})
    return st, report


def held(spans):
    """The narration's spans with every gap under HOLD_GAP bridged, so the bed stays down between lines."""
    out = [list(spans[0])]
    for s0, e0 in spans[1:]:
        if s0 - out[-1][1] < HOLD_GAP:
            out[-1][1] = e0
        else:
            out.append([s0, e0])
    return [tuple(x) for x in out]


def voice_envelope(spans, N):
    """Narration presence on the film clock: 1 inside each held span, raised-cosine ramps around it, and a partial
    release (GAP_LIFT) in each gap of GAP_MIN or more that the held span bridges: up over GAP_RAMP from GAP_DELAY after
    the last word, down over GAP_DOWN onto the next first word."""
    t = np.arange(N) / SR
    v = np.zeros(N)
    for s, e in held(spans):
        w = np.zeros(N)
        w[(t >= s) & (t <= e)] = 1
        r = (t >= s - RAMP_IN) & (t < s)
        w[r] = 0.5 - 0.5 * np.cos(np.pi * (t[r] - (s - RAMP_IN)) / RAMP_IN)
        f = (t > e) & (t <= e + RAMP_OUT)
        w[f] = 0.5 + 0.5 * np.cos(np.pi * (t[f] - e) / RAMP_OUT)
        v = np.maximum(v, w)
    for (s0, e0), (s1, e1) in zip(spans[:-1], spans[1:]):
        if s1 - e0 >= HOLD_GAP or s1 - e0 < GAP_MIN:
            continue
        a, b = e0 + GAP_DELAY, s1
        up = min(GAP_RAMP, (b - a) / 2)
        dn = min(GAP_DOWN, (b - a) / 2)
        g = np.zeros(N)
        m = (t >= a) & (t < b)
        g[m] = 1
        r = (t >= a) & (t < a + up)
        g[r] = 0.5 - 0.5 * np.cos(np.pi * (t[r] - a) / up)
        f = (t >= b - dn) & (t < b)
        g[f] = np.minimum(g[f], 0.5 + 0.5 * np.cos(np.pi * (t[f] - (b - dn)) / dn))
        v = v - GAP_LIFT * g
    return v


def bed_joins():
    """The bed's joins on the film clock as crossfade windows, from audio/bed-edit.json (written by make-bed.py)."""
    try:
        j = json.load(open(P('bed-edit.json')))
    except FileNotFoundError:
        return []
    return [(J - j['xf'] / 2, J + j['xf'] / 2) for J in j['joins']]


def stft_apply(m, gain_fn, n=2048, hop=512):
    """Zero-phase STFT gain: gain_fn(centre_sample, f) returns a gain per bin (one array, or one per channel)."""
    win = np.sqrt(np.hanning(n + 1)[:n])
    pad = n
    out = np.zeros((m.shape[0] + 2 * pad, m.shape[1]))
    norm = np.zeros(m.shape[0] + 2 * pad)
    mp = np.pad(m, ((pad, pad), (0, 0)))
    f = np.fft.rfftfreq(n, 1 / SR)
    for i in range(0, mp.shape[0] - n, hop):
        g = gain_fn(i + n // 2 - pad, f)
        for ch in range(m.shape[1]):
            gc = g[ch] if isinstance(g, (list, tuple)) else g
            S = np.fft.rfft(mp[i:i + n, ch] * win)
            out[i:i + n, ch] += np.fft.irfft(S * gc, n) * win
        norm[i:i + n] += win ** 2
    out /= np.maximum(norm, 1e-9)[:, None]
    return out[pad:pad + m.shape[0]]


def dip_curve(voice, bed, spans):
    """The dip under speech, per bin (dB). Over the frames where the narrator is sounding (46 ms frames over -40 dBFS),
    each third of an octave from 150 Hz to 12 kHz compares the bed's median level with the voice's; wherever the bed
    comes within DIP_MARGIN_DB of the voice it is taken down to that margin, by at most DIP_MAX_DB."""
    n = 2048
    f = np.fft.rfftfreq(n, 1 / SR)
    w = np.hanning(n)
    centres = 150 * 2 ** (np.arange(0, 32) / 3)
    centres = centres[centres <= 12000]
    idx = [(f >= c * 2 ** (-1 / 6)) & (f < c * 2 ** (1 / 6)) for c in centres]
    vm, bm = voice.mean(1), bed.mean(1)
    Vd, Bd = [], []
    for a, b in spans:
        for i in range(int(a * SR), int(b * SR) - n, n // 2):
            v = vm[i:i + n]
            if 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-12) < -40:
                continue
            V = np.abs(np.fft.rfft(v * w)) ** 2
            Bb = np.abs(np.fft.rfft(bm[i:i + n] * w)) ** 2
            Vd.append([10 * np.log10(V[s].sum() + 1e-20) for s in idx])
            Bd.append([10 * np.log10(Bb[s].sum() + 1e-20) for s in idx])
    lo, hi = np.log2(DIP_VOWEL[0]), np.log2(DIP_VOWEL[1])
    lc = np.log2(centres)
    vowel = np.clip(np.minimum(lc - (lo - 1 / 3), (hi + 1 / 3) - lc) / (1 / 3), 0, 1)  # 1 inside the band, a third-octave shoulder
    Dc = np.clip(np.median(np.array(Bd), 0) - np.median(np.array(Vd), 0) + DIP_MARGIN_DB + DIP_VOWEL_MARGIN_DB * vowel, 0, DIP_MAX_DB + DIP_VOWEL_MAX_DB * vowel)
    fl = np.fft.rfftfreq(2048, 1 / SR)
    D = np.interp(np.log2(np.maximum(fl, 1)), np.log2(centres), Dc, left=0, right=0)
    D[(fl < 120) | (fl > 13000)] = 0
    pick = [125, 250, 400, 500, 630, 800, 1000, 2000, 4000, 8000]
    return D, {'f_hz': pick, 'dip_db': [round(float(np.interp(np.log2(x), np.log2(centres), Dc, left=0, right=0)), 1) for x in pick]}


def carve(m, v, D):
    """The dip D (dB per bin), scaled by the narration envelope v (zero phase)."""
    return stft_apply(m, lambda c, f: 10 ** (-(D * v[min(max(c, 0), len(v) - 1)]) / 20))


def momentary(x, t0, t1, step=0.05):
    """The largest 400 ms loudness (LUFS) of a stereo buffer with windows starting from t0 to t1."""
    best = -99.0
    t = t0
    while t <= t1 + 1e-9:
        I, _ = meter(x, 2, t, t + 0.4)
        best = max(best, I)
        t += step
    return best


def momentary_track(x, t0, t1, step=0.1):
    return [(round(float(t), 2), meter(x, 2, t, t + 0.4)[0]) for t in np.arange(t0, t1, step)]


def build_bed(spans, voice, FILM, CARD):
    bed = decode(P('bed-edit.wav'), 2)
    N = int(round(FILM * SR))
    bed = np.pad(bed, ((0, max(0, N - len(bed))), (0, 0)))[:N]
    v = voice_envelope(spans, N)
    hs = held(spans)
    # The level under speech is set before the dip (about -26 LUFS), then the dip takes the bed under the voice band by band.
    Is0, _ = meter(concat_windows(bed, spans, 2), 2)
    a_speech = BED_SPEECH - Is0
    D, dip = dip_curve(voice, bed * 10 ** (a_speech / 20), spans)
    bed = carve(bed, v, D)
    t = np.arange(N) / SR
    # Alone: the open (before the first held run), the bridge (between held runs) and the card (after the last).
    alone = []
    alone.append(('open', FADE_IN, hs[0][0] - RAMP_IN))
    for (s0, e0), (s1, e1) in zip(hs[:-1], hs[1:]):
        alone.append(('bridge', e0 + RAMP_OUT, s1 - RAMP_IN))
    alone.append(('card', CARD, CARD + 1.0))
    gains = {}
    for name, a, b in alone:
        if b - a < 0.4:
            # v3: the first word comes 0.30 s in, so there is no open to set alone; the bed opens at its ducked level.
            gains[name] = a_speech
            continue
        gains[name] = BED_ALONE_M - momentary(bed, a, max(a, b - 0.4))
    # The alone gain per region: the open's before the first run, the card's after the last, the bridge's between.
    a_alone = np.full(N, gains['open'])
    for (s0, e0), (s1, e1) in zip(hs[:-1], hs[1:]):
        a_alone[(t > e0) & (t < s1)] = gains['bridge']
    a_alone[t > hs[-1][1]] = gains['card']
    g_db = a_alone + (a_speech - a_alone) * v
    bed = bed * (10 ** (g_db / 20))[:, None]
    nfi, nfo = int(FADE_IN * SR), int(FADE_OUT * SR)
    bed[:nfi] *= rc_fade(nfi)[:, None]
    bed[-nfo:] *= rc_fade(nfo)[::-1][:, None]
    pre_peak = 20 * np.log10(np.max(np.abs(bed)) + 1e-12)
    bed = limit(bed, -5.0, 2)
    write(P('music.master.wav'), bed, 2)
    edit = {'dip': dip, 'gain_speech_db': round(a_speech, 2), 'gain_alone_db': {k: round(g, 2) for k, g in gains.items()}, 'alone_windows': [[n, round(a, 3), round(b, 3)] for n, a, b in alone], 'sample_peak_before_ceiling_dbfs': round(pre_peak, 2), 'held_spans': [[round(a, 3), round(b, 3)] for a, b in hs]}
    return bed, v, edit


def main():
    O, Bc = clocks()
    FILM, CARD = Bc['end'], Bc['card']
    masters, rep, spans, clips = {}, {'lines': {}}, [], []
    for n in range(1, len(LINES) + 1):
        st, r = master_voice(n)
        masters[n] = st
        s0 = O[n] - r['lead']
        spans.append((O[n], O[n] + r['speech_seconds']))
        clips.append((n, round(s0, 3), r['master_seconds']))
        r['film_start'] = round(s0, 3)
        r['first_word_film'] = O[n]
        r['last_end_film'] = round(O[n] + r['speech_seconds'], 3)
        rep['lines'][n] = r
    rep['gaps_between_lines_s'] = [round(spans[i + 1][0] - spans[i][1], 3) for i in range(len(spans) - 1)]
    N = int(round(FILM * SR))
    voice = np.zeros((N, 2))
    for n, s0, dur in clips:
        i = int(round(s0 * SR))
        x = masters[n]
        voice[i:i + len(x)] += x[: N - i]
    bed, v, edit = build_bed(spans, voice, FILM, CARD)
    rep['bed'] = edit
    film = voice + bed
    write(P('film-premix.wav'), film, 2)
    Iv, tpv = meter(voice, 2)
    Ib, tpb = meter(bed, 2)
    Ibs, _ = meter(concat_windows(bed, spans, 2), 2)
    If, tpf = meter(film, 2)
    hs = held(spans)
    gap_tracks = {f'{e0:.2f}-{s1:.2f}': momentary_track(bed, e0 - 0.2, s1 + 0.2, 0.1) for (s0, e0), (s1, e1) in zip(spans[:-1], spans[1:])}
    # The bed in each held gap (from 0.1 s after the last word to just before the next), integrated.
    gap_lufs = {f'{e0:.2f}-{s1:.2f}': round(meter(bed, 2, e0 + 0.1, max(e0 + 0.5, s1 - 0.05))[0], 1) for (s0, e0), (s1, e1) in zip(spans[:-1], spans[1:]) if s1 - e0 < HOLD_GAP}
    # Voice over bed on speech frames, per band (median over 46 ms frames where the voice is present).
    def snr(lo, hi):
        n = 2048
        f = np.fft.rfftfreq(n, 1 / SR)
        sel = (f >= lo) & (f < hi)
        out = []
        for a, b in spans:
            for i in range(int(a * SR), int(b * SR) - n, n):
                V = (np.abs(np.fft.rfft(voice[i:i + n, 0] * np.hanning(n))) ** 2)[sel].sum()
                Bm = (np.abs(np.fft.rfft(bed[i:i + n].mean(1) * np.hanning(n))) ** 2)[sel].sum()
                if V > 1e-7:
                    out.append(10 * np.log10(V / (Bm + 1e-20)))
        out = np.array(out)
        return {'median_db': round(float(np.median(out)), 1), 'bed_louder_share': round(float(np.mean(out < 0)), 3)}
    rep.update({
        'film_seconds': FILM, 'card': CARD,
        'narrator_lufs': round(Iv, 2), 'narrator_true_peak': round(tpv, 2),
        'bed_lufs_whole': round(Ib, 2), 'bed_true_peak': round(tpb, 2),
        'bed_lufs_under_speech': round(Ibs, 2),
        'bed_lufs_open_0_to_first_word': round(meter(bed, 2, 0.0, spans[0][0])[0], 2),
        'bed_lufs_bridge_alone': round(meter(bed, 2, hs[0][1] + RAMP_OUT, hs[1][0] - RAMP_IN)[0], 2) if len(hs) > 1 else None,
        'bed_lufs_card': round(meter(bed, 2, CARD, FILM)[0], 2), 'bed_lufs_card_first_2s': round(meter(bed, 2, CARD, CARD + 2.0)[0], 2),
        'bed_momentary_max_open': round(momentary(bed, 0.0, max(0.0, spans[0][0] - 0.4)), 2),
        'bed_momentary_max_card_first_s': round(momentary(bed, CARD, CARD + 1.0), 2),
        'bed_momentary_in_gaps': gap_tracks,
        'bed_lufs_in_held_gaps': gap_lufs,
        'voice_over_bed_300_500Hz': snr(300, 500), 'voice_over_bed_500_700Hz': snr(500, 700), 'voice_over_bed_1_4kHz': snr(1000, 4000),
        'film_lufs': round(If, 2), 'film_true_peak': round(tpf, 2), 'bed_joins_xf': [[round(a, 3), round(b, 3)] for a, b in bed_joins()],
        'dip_margin_db': DIP_MARGIN_DB, 'dip_max_db': DIP_MAX_DB, 'dip_vowel_band_hz': list(DIP_VOWEL), 'dip_vowel_margin_db': DIP_VOWEL_MARGIN_DB, 'dip_vowel_max_db': DIP_VOWEL_MAX_DB, 'gap_lift': GAP_LIFT, 'gap_min_s': GAP_MIN, 'gap_ramp_s': GAP_RAMP, 'gap_down_s': GAP_DOWN, 'gap_delay_s': GAP_DELAY, 'bed_speech_before_dip_lufs': BED_SPEECH, 'hold_gap_s': HOLD_GAP, 'ramp_in_s': RAMP_IN, 'ramp_out_s': RAMP_OUT,
    })
    json.dump(rep, open(P('mix-report.json'), 'w'), indent=1)
    # Rewrite the <audio> attributes from the cue table.
    p = os.path.join(ROOT, 'index.html')
    html = open(p).read()
    for n, s0, dur in clips:
        html, k = re.subn(rf'(<audio id="vo-{n}" [^>]*?data-start=")[^"]*(" data-duration=")[^"]*(")', rf'\g<1>{s0}\g<2>{dur}\g<3>', html)
        assert k == 1, n
    html, k = re.subn(r'(<audio id="music" [^>]*?data-start=")[^"]*(" data-duration=")[^"]*(")', rf'\g<1>0\g<2>{FILM:g}\g<3>', html)
    assert k == 1
    open(p, 'w').write(html)
    print(json.dumps({k: v for k, v in rep.items() if k not in ('lines', 'bed_momentary_in_gaps')}, indent=1))
    for n, r in rep['lines'].items():
        print(n, r)


if __name__ == '__main__':
    main()
