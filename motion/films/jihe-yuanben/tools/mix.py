"""The film's sound: voice masters, the bed, and the mix block of index.html.

Reads audio/cues.json (tools/timeline.py: where each take is placed) and
audio/events.json (tools/events.mjs: every brush mark and paper move the
picture makes, with its film time). Writes:

  audio/master/<line>.wav   each take, mastered (mono, 48 kHz, 24 bit): a 70 Hz
                            high-pass, a gentle compressor, one level for every
                            take, 8 ms fades, ffmpeg's lookahead limiter at 4x
  audio/bed.wav             music, room tone and effects as one stereo stem,
                            the film's length (v2: 74.85 s since the fix round). The music is the
                            100 s cut's composition re-cut to the film (music()
                            below), then ridden level: a slow
                            gain that keeps its short-term loudness at or under
                            -19.5 LUFS and its momentary at or under -17.5, so
                            the composition's own swells (the 齟齬 hold, the
                            Stems) do not rise to the dialogue's level. Then it
                            is ducked 10 dB under every line with 0.35 s and
                            0.6 s raised-cosine ramps (held down through gaps
                            under 1.4 s, so it never pumps), and further under
                            any line whose speech-to-music ratio is still below
                            its floor (15 dB for the narrator, 17 dB for the
                            Mandarin reader, whose short passages a stranger
                            has to pick out of the bed).
  audio/mix-offline.wav     the sum the renderer should make (dialogue in both
                            channels plus the bed), for measuring and hearing
  index.html                the block between <!-- mix: --> and <!-- /mix -->

   python3 tools/mix.py
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from audio_util import load, save, rms_db

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SR = 48000
DUR = json.load(open(ROOT + 'audio/cues.json'))['duration']  # v2: the film's length, from tools/timeline.py
N = int(round(DUR * SR))
PAGE = ROOT + '../../concepts/jihe-yuanben/page/sound/'

# Levels (decided by measurement, see NOTES.md)
DIALOGUE_LUFS = -16.1      # the dialogue alone, both channels
MUSIC_ALONE_LUFS = -19.5   # the music bed, unducked
DUCK_DB = -10.0
ROOM_LUFS = -50.0
LAST_NOTE = 104.80         # music time of the composition's last piano note; it lands on the closing title's cut
# v2 re-cut (NOTES.md, v2 build): the film opens on the section that starts
# after the composition's one full rest (music 34.0 to 34.95, near silence),
# whose first chord is struck at 35.02, and one stretch of a quiet sustained
# chord (music 63.1 to 64.3, -35 to -37 dBFS) is shortened by the amount the
# cut to the closing title needs, crossfaded (equal power, 0.2 s) where the
# two sides match (the 63.10 / 63.95 pair: spectral similarity 0.90, levels
# -35.1 and -36.1 dBFS). In the film that join falls 0.07 s before the cut to
# Liu Hui's figure, under the ducked bed and the cut's paper settle. Since the
# v2 fix round (the film 0.4 s longer before the closing cut) the sustain loses
# only about 0.08 s: music 63.10 joins its own chord a moment later, at the lag
# that lines the two sides up best, with an equal-gain crossfade.
MUSIC_START = 35.00        # music time at film 0
SPLICE_AT = 63.10          # music time where the shortened sustain is joined
SPLICE_XF = 0.20
RIDE_S = -19.5             # the music alone: short-term (3 s) ceiling, LUFS
RIDE_M = -17.5             # and momentary (0.4 s) ceiling
SMR_FLOOR = {'N': 15.0, 'R': 17.0}  # speech-to-music ratio under a line, dB (RMS over its voiced frames)
EXTRA_MAX = 10.0


def ff(args, inp=None):
    return subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args, check=True, capture_output=True, input=inp).stdout


def ffload(path, filt, ch=1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-af', filt, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'],
                         check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    return x if ch == 1 else x.reshape(-1, ch)


def ffproc(x, filt, ch=1):
    """Run a numpy signal through an ffmpeg filter chain (same rate)."""
    x = np.asarray(x, dtype='<f4')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', filt,
                          '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-'], check=True, capture_output=True, input=x.tobytes()).stdout
    y = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    return y if ch == 1 else y.reshape(-1, ch)


def loudness(x, ch=2):
    """Integrated loudness (LUFS) and true peak (dBTP) of a signal by ebur128."""
    x = np.asarray(x, dtype='<f4')
    r = subprocess.run(['ffmpeg', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', 'ebur128=peak=true',
                        '-f', 'null', '-'], capture_output=True, input=x.tobytes()).stderr.decode()
    tail = r[r.rfind('Summary:'):]
    I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1))
    tp = re.search(r'True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS', tail)
    return I, float(tp.group(1)) if tp else None


def fade(x, a, b):
    """Raised-cosine fade in over a samples and out over b samples (in place)."""
    if a:
        x[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if b:
        x[-b:] *= np.cos(np.linspace(0, np.pi / 2, b)) ** 2
    return x


def speech_rms(x):
    d = rms_db(x, SR, 0.02)
    act = d[d > d.max() - 22]
    return 10 ** (np.mean(act) / 20)


def take_path(t):
    w = ROOT + 'audio/%s.wav' % t
    return w if os.path.exists(w) else ROOT + 'audio/%s.mp3' % t


def masters(cues):
    os.makedirs(ROOT + 'audio/master', exist_ok=True)
    raw = {}
    for e in cues['lines']:
        x = ffload(take_path(e['take']), 'highpass=f=70,acompressor=threshold=-24dB:ratio=2.2:attack=8:release=120:makeup=1')
        n = int(round(e['clipDur'] * SR))
        x = x[:n].copy()
        if len(x) < n:
            x = np.concatenate([x, np.zeros(n - len(x))])
        x *= 0.1 / speech_rms(x)  # every take to the same speech level
        fade(x, int(0.008 * SR), int(0.03 * SR))
        raw[e['id']] = x
    # one gain for all takes, so the dialogue sums to its target
    g = 1.0
    for _ in range(3):
        stem = place_dialogue(cues, raw, g)
        I, _ = loudness(np.stack([stem, stem], -1))
        g *= 10 ** ((DIALOGUE_LUFS - I) / 20)
    out = {}
    for k, x in raw.items():
        y = x * g
        # true-peak ceiling: lookahead limiter at 4x
        y = ffproc(y, 'aresample=192000,alimiter=limit=0.66:attack=1:release=60:level=disabled:asc=1,aresample=48000')
        y = y[: len(x)]
        if len(y) < len(x):
            y = np.concatenate([y, np.zeros(len(x) - len(y))])
        fade(y, int(0.004 * SR), int(0.01 * SR))
        save(ROOT + 'audio/master/%s.wav' % k, y, SR)
        out[k] = y
    return out


def place_dialogue(cues, takes, g=1.0):
    stem = np.zeros(N)
    for e in cues['lines']:
        x = takes[e['id']] * g
        i0 = int(round(e['clipStart'] * SR))
        stem[i0: i0 + len(x)] += x[: max(0, N - i0)]
    return stem


LAST_UP = 0.3    # v2 fix round: after the film's last line the duck lets go from its speech end over 0.3 s


def duck_envelope(cues):
    """1 in the gaps, DUCK_DB under speech; 0.35 s down before a line, 0.6 s up
    0.15 s after it; held down through gaps too short for the bed to come back.
    After the last line (v2 fix round) it comes up from the speech end in
    LAST_UP, so the decay of the composition's last note, which falls on the
    cut to the closing title, rises into the closing hold under the stop."""
    down, up, after = 0.35, 0.6, 0.15
    spans = sorted((e['S'], e['E']) for e in cues['lines'])
    merged = []
    for s, e in spans:
        if merged and s - merged[-1][1] < 1.4:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    t = np.arange(N) / SR
    env = np.zeros(N)  # 0 = full, 1 = ducked
    for i, (s, e) in enumerate(merged):
        a0, a1 = s - down, s
        b0, b1 = (e, e + LAST_UP) if i == len(merged) - 1 else (e + after, e + after + up)
        m = (t >= a0) & (t < a1)
        env[m] = np.maximum(env[m], np.sin((t[m] - a0) / down * np.pi / 2) ** 2)
        m = (t >= a1) & (t < b0)
        env[m] = 1
        m = (t >= b0) & (t < b1)
        env[m] = np.maximum(env[m], np.cos((t[m] - b0) / up * np.pi / 2) ** 2)
    gmin = 10 ** (DUCK_DB / 20)
    return 1 - env * (1 - gmin), merged


def kweighted(x):
    """An approximation of BS.1770's K weighting (a 60 Hz high-pass and a 4 dB
    shelf from 1.5 kHz), enough to ride a music bed by its loudness."""
    return ffproc(x, 'highpass=f=60:poles=2,highshelf=f=1500:g=4', ch=2)


def loudness_track(x, win, hop=0.05):
    """Sliding loudness (LUFS-like) every hop seconds over win-second windows."""
    k = kweighted(x)
    ms = (k ** 2).sum(1)
    c = np.concatenate([[0.0], np.cumsum(ms)])
    w = int(win * SR / 2)
    cent = np.arange(0, len(ms), int(hop * SR))
    a = np.clip(cent - w, 0, len(ms))
    b = np.clip(cent + w, 0, len(ms))
    v = (c[b] - c[a]) / np.maximum(1, b - a)
    return cent / SR, -0.691 + 10 * np.log10(v + 1e-12)


def ride(y):
    """A slow gain (dB, per sample) that holds the music's short-term loudness
    to RIDE_S and its momentary to RIDE_M: the over-ceiling amount, spread
    0.8 s either side (so the gain is down before a swell arrives) and
    smoothed over 1.2 s."""
    t, S = loudness_track(y, 3.0)
    _, M = loudness_track(y, 0.4)
    need = np.minimum(0.0, np.minimum(RIDE_S - S, RIDE_M - M))
    hop = t[1] - t[0]
    r = int(round(0.8 / hop))
    spread = np.array([need[max(0, i - r): i + r + 1].min() for i in range(len(need))])
    h = np.hanning(int(round(1.2 / hop)) | 1)
    h /= h.sum()
    sm = np.convolve(np.pad(spread, len(h), mode='edge'), h, mode='same')[len(h): -len(h)]
    return np.interp(np.arange(N) / SR, t, sm)


def voiced_frames(stem, e, win=0.02):
    """Indices (20 ms frames) where a line is sounding: within its speech span
    and within 25 dB of its loudest frame."""
    a, b = int(e['S'] / win), int(e['E'] / win) + 1
    d = rms_db(stem, SR, win)[a:b]
    return a + np.nonzero(d > d.max() - 25)[0]


def frame_rms(x, idx, win=0.02):
    n = int(win * SR)
    f = x[: (len(x) // n) * n].reshape(-1, n)
    return np.sqrt((f[idx] ** 2).mean())


def line_window(e, down=0.35, up=0.6, after=0.15, last=False):
    if last:
        up, after = LAST_UP, 0.0
    t = np.arange(N) / SR
    w = np.zeros(N)
    a0, a1, b0, b1 = e['S'] - down, e['S'], e['E'] + after, e['E'] + after + up
    m = (t >= a0) & (t < a1)
    w[m] = np.sin((t[m] - a0) / down * np.pi / 2) ** 2
    w[(t >= a1) & (t < b0)] = 1
    m = (t >= b0) & (t < b1)
    w[m] = np.cos((t[m] - b0) / up * np.pi / 2) ** 2
    return w


def smr_table(cues, dia, mus):
    mono = mus.mean(1)
    out = []
    for e in cues['lines']:
        idx = voiced_frames(dia, e)
        out.append((e, 20 * np.log10(frame_rms(dia, idx) / (frame_rms(mono, idx) + 1e-12))))
    return out


def music(cues, dia):
    x = ffload(ROOT + 'audio/music.take1.mp3',
               'highpass=f=35,lowshelf=f=110:g=-3,equalizer=f=1100:t=o:w=1.2:g=-2,equalizer=f=2600:t=o:w=1.2:g=-3', ch=2)
    cut = cues['beats'][-1]['start']  # the cut to the closing title
    jump = LAST_NOTE - MUSIC_START - cut  # how much of the sustain goes
    assert 0.04 < jump < 1.1, ('the re-cut only fits the quiet sustain at music 63.1 to 64.3', jump)
    ts = SPLICE_AT - MUSIC_START  # film time of the join
    xf = int(round(SPLICE_XF * SR))
    i0 = int(round(MUSIC_START * SR))
    ia = int(round(SPLICE_AT * SR)) - xf // 2
    corr = None
    if jump < 0.4:
        # v2 fix round: a short jump joins the sustain to itself a fraction of
        # a second later, so the two sides are the same chord and correlated:
        # take the lag within 15 ms of the jump where they line up best, and
        # join with an equal-gain crossfade (equal power would swell by up to
        # 3 dB where they are in phase). The last note then lands within
        # 15 ms of the cut.
        mono = x.mean(1)
        a = mono[ia: ia + xf]
        best = None
        for d in range(int(round((jump - 0.015) * SR)), int(round((jump + 0.015) * SR)) + 1):
            b = mono[ia + d: ia + d + xf]
            c = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-12))
            if best is None or c > best[1]:
                best = (d, c)
        jump, corr = best[0] / SR, best[1]
    ib = ia + int(round(jump * SR))
    head = x[i0: ia + xf].copy()
    tail = x[ib: ib + (N - (ia - i0)) + xf].copy()
    w = np.linspace(0, np.pi / 2, xf)
    if corr is not None and corr > 0.5:
        head[-xf:] *= (np.cos(w) ** 2)[:, None]
        tail[:xf] *= (np.sin(w) ** 2)[:, None]
    else:
        head[-xf:] *= (np.cos(w) ** 2)[:, None] ** 0.5
        tail[:xf] *= (np.sin(w) ** 2)[:, None] ** 0.5
    y = np.zeros((N + 2 * xf, 2))
    y[: len(head)] += head
    y[ia - i0: ia - i0 + len(tail)] += tail[: len(y) - (ia - i0)]
    y = y[:N].copy()
    print('music: film 0 = music %.2f; join at film %.2f (music %.2f to %.3f, correlation %s); the last note (music %.2f) lands at film %.3f, the cut %.3f'
          % (MUSIC_START, ts, SPLICE_AT, SPLICE_AT + jump, 'n/a' if corr is None else '%.3f' % corr, LAST_NOTE, LAST_NOTE - MUSIC_START - jump, cut))
    I, _ = loudness(y)
    y *= 10 ** ((MUSIC_ALONE_LUFS - I) / 20)
    t = np.arange(N) / SR
    # the film opens on the section's first chord: only a 50 ms fade-in
    fin = np.sin(np.clip(t / 0.05, 0, 1) * np.pi / 2) ** 2
    fout = np.sin(np.clip((DUR - t) / 0.8, 0, 1) * np.pi / 2) ** 2
    y *= (fin * fout)[:, None]
    rdb = ride(y)
    y *= (10 ** (rdb / 20))[:, None]
    env, merged = duck_envelope(cues)
    # Lines still under their floor go further down, each by its own shortfall.
    extra = np.zeros(N)
    for _ in range(3):
        g = env * 10 ** (-extra / 20)
        tab = smr_table(cues, dia, y * g[:, None])
        add = np.zeros(N)
        last = max(cues['lines'], key=lambda q: q['E'])
        for e, smr in tab:
            short = SMR_FLOOR[e['who']] + 0.3 - smr
            if short > 0:
                add = np.maximum(add, short * line_window(e, last=e is last))
        if not add.any():
            break
        extra = np.minimum(EXTRA_MAX, extra + add)
    g = env * 10 ** (-extra / 20)
    return y * g[:, None], env, merged, rdb, extra


def room():
    x = ffload(PAGE + 'sfx-room.mp3', 'highpass=f=40,lowpass=f=9000', ch=2)
    L = len(x)
    xf = int(1.5 * SR)
    out = np.zeros((N + L, 2))
    pos = 0
    k = 0
    offs = [0.0, 3.1, 6.3, 1.7, 4.9, 2.4, 7.2, 0.8, 5.6, 3.8, 6.9, 1.2]
    while pos < N:
        o = int(offs[k % len(offs)] * SR)
        seg = np.concatenate([x[o:], x[:o]]).copy()
        seg[:xf] *= (np.sin(np.linspace(0, np.pi / 2, xf)) ** 2)[:, None]
        seg[-xf:] *= (np.cos(np.linspace(0, np.pi / 2, xf)) ** 2)[:, None]
        out[pos: pos + L] += seg
        pos += L - xf
        k += 1
    y = out[:N]
    I, _ = loudness(y)
    y *= 10 ** ((ROOM_LUFS - I) / 20)
    t = np.arange(N) / SR
    y *= (np.sin(np.clip(t / 1.5, 0, 1) * np.pi / 2) ** 2)[:, None]
    y *= (np.sin(np.clip((DUR - t) / 0.8, 0, 1) * np.pi / 2) ** 2)[:, None]
    return y


def cut(path, a, b, ch=2, fi=0.004, fo=0.03):
    x = ffload(path, 'anull', ch=ch)
    y = x[int(a * SR): int(b * SR)].copy()
    n1, n2 = int(fi * SR), int(fo * SR)
    y[:n1] *= (np.sin(np.linspace(0, np.pi / 2, n1)) ** 2)[:, None]
    y[-n2:] *= (np.cos(np.linspace(0, np.pi / 2, n2)) ** 2)[:, None]
    return y


def peak_to(x, db):
    return x * (10 ** (db / 20) / (np.abs(x).max() + 1e-12))


def effects(events):
    S = {}
    S['dab'] = peak_to(cut(PAGE + 'mix/dab.wav', 0, 0.19), -27)
    S['stroke'] = peak_to(cut(PAGE + 'mix/stroke.wav', 0, 0.28), -25)
    S['settle'] = peak_to(cut(ROOT + 'audio/sfx/paper-handling.mp3', 2.10, 2.85, fo=0.12), -27)
    S['lift'] = peak_to(cut(ROOT + 'audio/sfx/paper-handling.mp3', 0.16, 1.40, fo=0.15), -26)
    S['peel'] = peak_to(cut(ROOT + 'audio/sfx/paper-handling.mp3', 5.30, 7.60, fo=0.2), -28)
    S['cut'] = peak_to(cut(ROOT + 'audio/sfx/paper-cues.mp3', 0.30, 0.95, fo=0.12), -24)
    S['slide'] = peak_to(cut(ROOT + 'audio/sfx/paper-cues.mp3', 2.60, 3.50, fo=0.2), -28)
    tap = peak_to(cut(ROOT + 'audio/sfx/paper-cues.mp3', 4.955, 5.11, fi=0.002, fo=0.05), -31)
    # three pitches of one tap, by resampling (no time-stretch: a higher tap is shorter)
    S['tap'] = [tap, ffproc(tap, 'asetrate=%d,aresample=%d' % (int(SR * 1.19), SR), ch=2), ffproc(tap, 'asetrate=%d,aresample=%d' % (int(SR * 1.41), SR), ch=2)]
    out = np.zeros((N, 2))
    levels = [0.85, 1.0, 1.15]
    k = 0
    log = []
    for e in events:
        kind = e['kind']
        g = e.get('gain', 1.0)
        if kind == 'mark':
            m = e.get('mark')
            if m == 'seg':
                continue
            if m == 'dot':
                x = S['dab']
            else:
                x = S['stroke']
            if 'lvl' in e:
                # a level of its own, outside the rotation, so the marks after
                # it keep theirs (beat 6's diameter)
                g *= e['lvl']
            else:
                g *= levels[k % 3]
                k += 1
            if m in ('ring', 'wave', 'line') and e.get('dur', 0) >= 0.85:
                place(out, x * 0.7 * g, e['t'] + e['dur'] * 0.5)
        elif kind == 'tap':
            x = S['tap'][e.get('pitch', 0) % 3]
            if 'lvl' in e:
                # a level of its own, outside the rotation (beat 6's landings)
                g *= e['lvl']
            else:
                g *= levels[(k + e.get('pitch', 0)) % 3]
                k += 1
        else:
            x = S[kind]
        place(out, x * g, e['t'])
        log.append((round(e['t'], 3), kind, e.get('mark', '')))
    return out, log


def place(out, x, t):
    i0 = int(round(t * SR))
    if i0 >= N:
        return
    n = min(len(x), N - i0)
    out[i0: i0 + n] += x[:n]


def write_block(cues):
    rows = []
    for e in cues['lines']:
        d = len(load(ROOT + 'audio/master/%s.wav' % e['id'], SR)) / SR
        rows.append('      <audio id="vo-%s" src="audio/master/%s.wav" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="1"></audio>'
                    % (e['id'], e['id'], e['clipStart'], d, 2 if e['who'] == 'N' else 3))
    rows.append('      <audio id="bed" src="audio/bed.wav" data-start="0" data-duration="%s" data-track-index="4" data-volume="1"></audio>' % DUR)
    block = ('<!-- mix: written by tools/mix.py. The narrator (track 2) and the Mandarin reader (track 3), one clip per take at\n'
             '           its .json timing; the bed (music ducked under every line, room tone, brush and paper) as one stem. -->\n'
             + '\n'.join(rows) + '\n      <!-- /mix -->')
    p = ROOT + 'index.html'
    s = open(p).read()
    s = re.sub(r'<!-- mix:.*?<!-- /mix -->', block, s, flags=re.S)
    open(p, 'w').write(s)


def main():
    cues = json.load(open(ROOT + 'audio/cues.json'))
    events = json.load(open(ROOT + 'audio/events.json'))
    vo = masters(cues)
    dia = place_dialogue(cues, vo)
    mus, env, merged, rdb, extra = music(cues, dia)
    rm = room()
    fx, log = effects(events)
    bed = mus + rm + fx
    bed = ffproc(bed, 'aresample=192000,alimiter=limit=0.4:attack=1:release=80:level=disabled:asc=1,aresample=48000', ch=2)[:N]
    t = np.arange(N) / SR
    bed[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))[:, None]
    save(ROOT + 'audio/bed.wav', bed, SR)
    save(ROOT + 'audio/music-stem.wav', mus, SR)
    mix = bed + np.stack([dia, dia], -1)
    save(ROOT + 'audio/mix-offline.wav', mix, SR)
    write_block(cues)
    Id, TPd = loudness(np.stack([dia, dia], -1))
    Im, TPm = loudness(mus)
    Ib, TPb = loudness(bed)
    I, TP = loudness(mix)
    sp = env < 0.99
    def lev(x, m):
        return 10 * np.log10(np.mean(x[m] ** 2) + 1e-12)
    print('dialogue %.1f LUFS, TP %.1f dBTP' % (Id, TPd))
    print('music    %.1f LUFS (whole, ridden and ducked), bed %.1f LUFS, TP %.1f' % (Im, Ib, TPb))
    print('music RMS in the gaps %.1f dB, under speech %.1f dB' % (lev(mus.mean(1), ~sp), lev(mus.mean(1), sp)))
    print('ride: min %.1f dB; extra duck: max %.1f dB' % (rdb.min(), extra.max()))
    _, S = loudness_track(mus, 3.0)
    _, M = loudness_track(mus, 0.4)
    print('music alone: short-term max %.1f, momentary max %.1f LUFS (approx. K)' % (S.max(), M.max()))
    print('MIX      %.1f LUFS integrated, true peak %.1f dBTP' % (I, TP))
    rows = []
    for e, smr in smr_table(cues, dia, mus):
        rows.append({'id': e['id'], 'who': e['who'], 'S': e['S'], 'smr_db': round(float(smr), 1)})
    print('speech-to-music ratio per line (dB):', ' '.join('%s %.1f' % (r['id'], r['smr_db']) for r in rows))
    print('lowest: %s %.1f' % min(((r['id'], r['smr_db']) for r in rows), key=lambda z: z[1]))
    json.dump({'smr': rows, 'ride_min_db': round(float(rdb.min()), 2), 'extra_max_db': round(float(extra.max()), 2),
               'music_short_term_max': round(float(S.max()), 2), 'music_momentary_max': round(float(M.max()), 2)},
              open(ROOT + 'audio/mix-levels.json', 'w'), indent=1)


if __name__ == '__main__':
    main()
