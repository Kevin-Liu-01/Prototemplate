"""modern-hebrew: voice masters, music and effect stems, the offline mix and manifest.json.

v2 (2026-10-05, SCRIPT-v2.md): the 14 narrator lines in Frederick Surrey's voice,
no reader. Reads sound/plan.json (the layout of the takes, the cues, the music
window, the effects), sound/lines.json (the text of each line) and the takes in
sound/takes/. The layout places every take by its own timings: the first take's
first sound at layout.lead, then each take's first sound layout.gap (or the
line's own gap) after the last sound of the take before. The film's length is
the cut home (layout.closeAt) plus layout.close. A cue is the film time of a
word's start in a take (from the take's own character alignment), or a line's
in.<id> (first sound), end.<id> (last sound) or cut.<id> (in - 0.05: the hard
cut before a line), or close and end. Effects sound at cue + dt. Writes:

  master/<id>.wav      each line's take, mastered (mono, 48 kHz, 24 bit): trimmed to
                       its speech plus 0.05 s before and 0.15 s after, a 70 Hz
                       high-pass, a phrase-level rider (ride()), a gentle compressor, every take at one integrated
                       loudness, one gain for all so the dialogue sums to -16 LUFS,
                       a lookahead limiter at 4x oversampling, 4 ms and 10 ms fades
  sfx/cut/<name>.wav   the effects cut from the generations, levelled
  stems/music.wav      the music window, 100.000 s, stereo: EQ'd, -20 LUFS alone,
                       ducked 8 dB under every line (0.3 s ramps), 0.8 s fade in,
                       fade from 99.2 s
  stems/sfx.wav        every effect at its plan time, 100.000 s, stereo
  stems/dialogue.wav   the voice masters placed (for measuring only)
  mix-offline.wav      dialogue (both channels) + music + sfx: what the renderer
                       should make from the clips in manifest.json
  manifest.json        every clip with file, start, duration, track, word timings,
                       and the word anchors of the picture events
  audio-clips.html     the <audio> elements for the composition, from the manifest
  ../data/cues.js      window.MH_CUES = { DUR, cues }: every cue in film seconds,
                       which lib/beats.js reads, so the picture follows the takes

   python3 sound/tools/mix.py
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from audio_util import load, save, rms_db

S = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SR = 48000

DIALOGUE_LUFS = -16.0
MUSIC_ALONE_LUFS = -20.0
DUCK_DB = -8.0
DUCK_RAMP = 0.3
DUCK_HOLD_GAP = 1.6       # gaps shorter than this stay ducked, so the bed never pumps
VOICE_CEIL = 10 ** (-3.0 / 20)
PRE, POST = 0.05, 0.15    # kept before the first sound and after the last

# effect sources: (file, start, end) in the generation, the loudness target
# (max momentary LUFS, or peak dBFS for the clicks), and a filter
FX = {
    'page1': ('sfx/pages.mp3', 0.62, 1.95, ('M', -28.0), 'highpass=f=80'),
    'page2': ('sfx/pages.mp3', 3.60, 4.82, ('M', -28.0), 'highpass=f=80'),
    'page3': ('sfx/pages.mp3', 6.34, 7.62, ('M', -28.0), 'highpass=f=80'),
    'slide-photo': ('sfx/board.mp3', 0.40, 1.62, ('M', -29.0), 'highpass=f=70'),
    'slide-poster': ('sfx/board.mp3', 6.12, 7.74, ('M', -27.5), 'highpass=f=60'),
    'slide-paper': ('sfx/board.mp3', 0.40, 1.62, ('M', -31.0), 'highpass=f=120,asetrate=%d,aresample=%d' % (int(SR * 1.12), SR)),
    'impression': ('sfx/print2.mp3', 0.035, 0.30, ('P', -20.0), 'lowpass=f=3200,highpass=f=50'),
    'tap': ('sfx/print2.mp3', 1.005, 1.17, ('P', -21.0), 'highpass=f=150'),
    'tick': ('sfx/print2.mp3', 3.205, 3.36, ('P', -27.0), 'highpass=f=400'),
}
PAGE_ORDER = ['page1', 'page2', 'page3']

# the 100 s cut's anchors (no longer read; v2's cues are in plan.json)
ANCHORS_100S = [
    ('n01', 'promising', 'B1 crop marks close on the promise line'),
    ('n02', 'rejected', 'B2 the strike rule crosses ספר מלים'),
    ('n02', 'sefer', 'B2 gloss "sefer milim, book of words"'),
    ('n02', 'German', 'B2 Wörter and buch rise, hairlines draw'),
    ('n03', 'From', 'B2 hard cut to card 2, מִלָּה prints'),
    ('n03', 'made', 'B2 the sum rule'),
    ('n03', 'mee-LONE', 'B2 מִלּוֹן prints'),
    ('n04', 'root', 'B3 the tray cells draw'),
    ('n04', 'pattern', 'B3 the stand-ins ק ט ל sink'),
    ('n05', 'sling', 'B3 ק ל ע print into the tray'),
    ('n05', 'maftéakh', 'B3 the model מַפְתֵּחַ prints'),
    ('n05', 'made', 'B3 the root letters drop'),
    ('n05', 'makléa', 'B3 glosses "makle\'a, cannon" and "today, a machine gun"'),
    ('r01', 'מִלִּים', 'B4 the coinage row prints in, right to left'),
    ('r01', 'יִשְׂרָאֵל', 'B4 rose crop marks close on the printed sign'),
    ('n06', 'sign', 'B5 the sign registers on the printed sign of p. 110'),
    ('n06', 'bicycle', 'B5 the camera has pulled back to the entry'),
    ('n06', 'ofnáyim', 'B5 crop marks close on the headword'),
    ('n07', 'The', 'B5 hard cut to the bicycle card'),
    ('n07', 'oh-FAHN', 'B5 gloss "ofan, wheel"'),
    ('n07', 'ending', 'B5 the ending ־ַיִם and its gloss print'),
    ('n07', 'turned', 'B5 the build: ו lifts, ן turns to נ, the ending docks'),
    ('n07', 'ofnáyim', 'B5 gloss "ofnayim, bicycle"'),
    ('n08', 'hashmál', 'B6 the rule underlines הַחַשְׁמַל'),
    ('n08', 'elektron', 'B6 ἤλεκτρον prints'),
    ('n08', 'followed', 'B6 hard cut to vol. 4, p. 1806, Gordon\'s note isolated'),
    ('n08', 'electricity', 'B6 a cut inside p. 1806 to the electricity sense'),
    ('n09', 'credits', 'B6 the sign comes down and stops short'),
    ('n10', 'agvaniyá', 'B7 gloss "agvaniya, tomato"'),
    ('n11', 'Ben-Yehuda', 'B7 בַּדּוּרָה and its gloss print'),
    ('n11', 'kept', 'B7 rose crop marks close on the empty place'),
    ('n12', 'in', 'B7 בַּדּוּרָה sinks to the ghost tone'),
    ('n13', 'funders', 'B8 crop marks close on Hilfsverein der Deutschen Juden'),
    ('n14', 'German', 'B9 (the photograph holds)'),
    ('n15', 'Hebrew', 'B9 (the poster holds)'),
]
TAP_PITCH = [1.0, 1.19, 1.41]   # three fixed pitches by slot (resampled, so a higher tap is shorter)


def ff_filter(x, filt, ch=1):
    x = np.asarray(x, dtype='<f4')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af', filt,
                          '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-'], check=True, capture_output=True, input=x.tobytes()).stdout
    y = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    return y if ch == 1 else y.reshape(-1, ch)


def ebur(x, ch=2):
    """Integrated loudness, loudness range, true peak and max momentary loudness."""
    x = np.asarray(x, dtype='<f4')
    r = subprocess.run(['ffmpeg', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-af',
                        'ebur128=peak=true:framelog=info', '-f', 'null', '-'], capture_output=True, input=x.tobytes()).stderr.decode()
    tail = r[r.rfind('Summary:'):]
    I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1))
    LRA = float(re.search(r'LRA:\s+(-?[\d.]+) LU', tail).group(1))
    tp = re.search(r'True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS', tail)
    M = [float(v) for v in re.findall(r' M:\s*(-?[\d.]+)', r[: r.rfind('Summary:')])]
    return {'I': I, 'LRA': LRA, 'TP': float(tp.group(1)) if tp else None, 'Mmax': max(M) if M else None}


def fade(x, a, b):
    if a:
        w = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
        x[:a] *= w if x.ndim == 1 else w[:, None]
    if b:
        w = np.cos(np.linspace(0, np.pi / 2, b)) ** 2
        x[-b:] *= w if x.ndim == 1 else w[:, None]
    return x


def speech_level(x):
    d = rms_db(x, SR, 0.02)
    act = d[d > d.max() - 22]
    return 10 ** (np.mean(act) / 20)


def ride(y, up=8.0, down=4.0):
    """A dialogue rider: evens out phrase-level swings inside a take (a softer
    run of words is lifted toward the take's median level, up to `up` dB; a
    louder one is lowered up to `down` dB). The gain follows a 300 ms smoothed
    level of the voiced frames and is held through pauses, so silences are
    never pumped up."""
    hop = int(0.01 * SR)
    m = len(y) // hop
    lv = 20 * np.log10(np.sqrt((y[: m * hop].reshape(m, hop) ** 2).mean(1)) + 1e-9)
    act = lv > lv.max() - 30
    k = 30
    ker = np.hanning(2 * k + 1)
    num = np.convolve(np.where(act, 10 ** (lv / 10), 0), ker, 'same')
    den = np.convolve(act.astype(float), ker, 'same')
    sm = 10 * np.log10(num / np.maximum(den, 1e-9) + 1e-12)
    target = np.median(lv[act])
    gdb = np.clip(target - sm, -down, up)
    # hold the gain through pauses (no lift of the room between words)
    last = 0.0
    for i in range(m):
        if den[i] < 0.5:
            gdb[i] = last
        else:
            last = gdb[i]
    gdb = np.convolve(gdb, np.hanning(21) / np.hanning(21).sum(), 'same')
    g = np.interp(np.arange(len(y)), np.arange(m) * hop + hop / 2, 10 ** (gdb / 20))
    return y * g


def take_file(t):
    w = S + 'takes/%s.wav' % t
    return w if os.path.exists(w) else S + 'takes/%s.mp3' % t


def extent(t, x):
    """First sound and last sound of a take: energy above -55 dB (10 ms), the
    last word's end from its transcript as a floor for a quiet last word. Sound
    more than 0.6 s after the transcript's last word is not speech (n08 ends on
    a 50 ms blip of the voice starting its next text), so it is left out."""
    d = rms_db(x, SR, 0.01)
    on = np.nonzero(d > -55)[0]
    first, last = on[0] * 0.01, (on[-1] + 1) * 0.01
    stt = S + 'takes/%s.stt.json' % t
    if os.path.exists(stt):
        ws = [w for w in json.load(open(stt))['words'] if w['type'] == 'word']
        if ws:
            near = on[on * 0.01 <= ws[-1]['end'] + 0.6]
            last = max((near[-1] + 1) * 0.01, ws[-1]['end'])
    return first, min(last, len(x) / SR)


def words_from_alignment(j, offset):
    """Word timings from a take's character alignment, in film seconds."""
    a = j.get('alignment') or {}
    ch, st, en = a.get('characters', []), a.get('character_start_times_seconds', []), a.get('character_end_times_seconds', [])
    out, cur, s0, e0 = [], '', None, None
    for c, s, e in zip(ch + [' '], st + [None], en + [None]):
        if c.isspace():
            if cur:
                out.append({'text': cur, 'start': round(s0 + offset, 3), 'end': round(e0 + offset, 3)})
            cur, s0 = '', None
            continue
        if s0 is None:
            s0 = s
        cur += c
        e0 = e
    return out


def main():
    plan = json.load(open(S + 'plan.json'))
    lines = {l['id']: l for l in json.load(open(S + 'lines.json'))['lines']}
    lay = plan['layout']
    # the layout: every take placed by its own first and last sound
    t = lay['lead']
    for p in plan['lines']:
        x = load(take_file(p['take']), SR)
        first, last = extent(p['take'], x)
        p['in'] = round(t, 3)
        t += (last - first) + lay['gaps'].get(p['id'], lay['gap'])
    last_end = t - lay['gaps'].get(plan['lines'][-1]['id'], lay['gap'])
    CLOSE = last_end + lay['endHold']
    if lay.get('closeAt') is not None:
        if lay['closeAt'] < last_end + 0.3:
            raise SystemExit('closeAt %.2f is under 0.3 s after the last line (%.2f)' % (lay['closeAt'], last_end))
        CLOSE = lay['closeAt']
    DUR = round((CLOSE + lay['close']) * 20) / 20   # a whole number of frames at 60 fps
    N = int(round(DUR * SR))
    os.makedirs(S + 'master', exist_ok=True)
    os.makedirs(S + 'stems', exist_ok=True)
    os.makedirs(S + 'sfx/cut', exist_ok=True)

    # 1. voice: trim, high-pass, compress, one speech level
    clips = []
    raw = {}
    for p in plan['lines']:
        x = load(take_file(p['take']), SR)
        first, last = extent(p['take'], x)
        a, b = max(0.0, first - PRE), min(len(x) / SR, last + POST)
        y = x[int(a * SR): int(b * SR)].copy()
        y = ff_filter(y, 'highpass=f=70')[: len(y)]
        y = ride(y)
        y = ff_filter(y, 'acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:makeup=1')[: len(y)]
        y *= 10 ** ((-19.0 - ebur(np.stack([y, y], -1))['I']) / 20)   # every take at one loudness before the common gain
        # a take that ends while still sounding (the eleven_v3 reader's take stops on its last
        # consonant) gets a 150 ms release; the others a 30 ms fade in their post-roll silence
        fade(y, int(0.004 * SR), int((0.15 if b >= len(x) / SR - 0.01 else 0.03) * SR))
        raw[p['id']] = y
        start = p['in'] - (first - a)
        clips.append({'id': p['id'], 'take': p['take'], 'in': p['in'], 'first': first, 'last': last, 'cut': [a, b],
                      'start': start, 'speechEnd': p['in'] + (last - first)})

    def place_dialogue(g):
        stem = np.zeros(N)
        for c in clips:
            y = raw[c['id']] * g
            i0 = int(round(c['start'] * SR))
            stem[i0: i0 + len(y)] += y[: max(0, N - i0)]
        return stem

    g = 1.0
    for _ in range(3):
        m = ebur(np.stack([place_dialogue(g)] * 2, -1))
        g *= 10 ** ((DIALOGUE_LUFS - m['I']) / 20)
    masters = {}
    for c in clips:
        y = raw[c['id']] * g
        n = len(y)
        y = ff_filter(y, 'aresample=192000,alimiter=limit=%.4f:attack=1:release=60:level=disabled:asc=1,aresample=48000' % VOICE_CEIL)[:n]
        if len(y) < n:
            y = np.concatenate([y, np.zeros(n - len(y))])
        fade(y, int(0.004 * SR), int(0.01 * SR))
        save(S + 'master/%s.wav' % c['id'], y, SR)
        masters[c['id']] = y
        c['duration'] = n / SR
    dia = np.zeros(N)
    for c in clips:
        i0 = int(round(c['start'] * SR))
        y = masters[c['id']]
        dia[i0: i0 + len(y)] += y[: max(0, N - i0)]
    save(S + 'stems/dialogue.wav', dia, SR)

    # cues: film times of the words the picture and the effects land on
    cue_t = {'close': CLOSE, 'end': DUR}
    for c in clips:
        cue_t['in.' + c['id']] = c['in']
        cue_t['end.' + c['id']] = c['speechEnd']
        cue_t['cut.' + c['id']] = round(c['in'] - 0.05, 3)
    cue_words = {}
    for c in clips:
        j = json.load(open(take_file(c['take']).rsplit('.', 1)[0] + '.json'))
        cue_words[c['id']] = words_from_alignment(j, c['start'] - c['cut'][0])
    cue_rows = []
    for name, lid, word, event in plan['cues']:
        hit = next((w for w in cue_words[lid] if w['text'].strip('.,;:') == word), None)
        if hit is None:
            raise SystemExit('cue word %r not found in %s' % (word, lid))
        cue_t[name] = hit['start']
        cue_rows.append({'cue': name, 'line': lid, 'word': word, 'start': hit['start'], 'end': hit['end'], 'event': event})

    # 2. music: the window, EQ, level, duck, fades
    mus_src = plan['music']
    mus_src['offset'] = round(mus_src['chord'] - CLOSE, 3)
    x = load(S + mus_src['file'], SR, mono=False)
    x = ff_filter(x, 'highpass=f=35,lowshelf=f=110:g=-3,equalizer=f=1100:t=o:w=1.2:g=-2,equalizer=f=2600:t=o:w=1.2:g=-3', ch=2)
    i0 = int(round(mus_src['offset'] * SR))
    mus = x[i0: i0 + N].copy()
    if len(mus) < N:
        mus = np.concatenate([mus, np.zeros((N - len(mus), 2))])
    m = ebur(mus)
    mus *= 10 ** ((MUSIC_ALONE_LUFS - m['I']) / 20)
    t = np.arange(N) / SR
    spans = []
    for c in sorted(clips, key=lambda c: c['in']):
        s, e = c['in'], c['speechEnd']
        if spans and s - spans[-1][1] < DUCK_HOLD_GAP:
            spans[-1][1] = max(spans[-1][1], e)
        else:
            spans.append([s, e])
    env = np.zeros(N)
    for s, e in spans:
        a0, a1, b0, b1 = s - DUCK_RAMP, s, e + 0.15, e + 0.15 + DUCK_RAMP
        k = (t >= a0) & (t < a1)
        env[k] = np.maximum(env[k], np.sin((t[k] - a0) / DUCK_RAMP * np.pi / 2) ** 2)
        k = (t >= a1) & (t < b0)
        env[k] = 1
        k = (t >= b0) & (t < b1)
        env[k] = np.maximum(env[k], np.cos((t[k] - b0) / DUCK_RAMP * np.pi / 2) ** 2)
    # swells: the bed comes up by `db` (less duck) between two cues, 0.25 s ramps
    for a_cue, a_dt, b_cue, b_dt, db, _what in mus_src.get('swells', []):
        a, b = cue_t[a_cue] + a_dt, cue_t[b_cue] + b_dt
        w = np.zeros(N)
        k = (t >= a) & (t <= b)
        w[k] = np.minimum(np.sin(np.clip((t[k] - a) / 0.25, 0, 1) * np.pi / 2) ** 2, np.sin(np.clip((b - t[k]) / 0.25, 0, 1) * np.pi / 2) ** 2)
        env *= 1 - w * (db / -DUCK_DB)
    gmin = 10 ** (DUCK_DB / 20)
    duck = 1 - env * (1 - gmin)
    fin = np.sin(np.clip(t / 0.8, 0, 1) * np.pi / 2) ** 2
    fout = np.sin(np.clip((DUR - t) / 0.8, 0, 1) * np.pi / 2) ** 2
    mus *= (duck * fin * fout)[:, None]

    # 3. effects
    cut = {}
    for name, (f, a, b, (mode, target), filt) in FX.items():
        y = load(S + f, SR, mono=False)[int(a * SR): int(b * SR)].copy()
        y = ff_filter(y, filt, ch=2)
        fade(y, int(0.002 * SR), int(min(0.08, len(y) / SR / 3) * SR))
        if mode == 'P':
            y *= 10 ** (target / 20) / (np.abs(y).max() + 1e-12)
        else:
            pad = np.concatenate([np.zeros((int(0.5 * SR), 2)), y, np.zeros((int(0.5 * SR), 2))])
            y *= 10 ** ((target - ebur(pad)['Mmax']) / 20)
            # paper is crackly (sample peaks 24 dB over its loudness): a lookahead limiter at
            # -12 dBFS takes the crackle's tips off without touching its body
            n0 = len(y)
            y = ff_filter(y, 'aresample=192000,alimiter=limit=%.4f:attack=0.5:release=30:level=disabled:asc=1,aresample=48000' % 10 ** (-12 / 20), ch=2)[:n0]
        save(S + 'sfx/cut/%s.wav' % name, y, SR)
        cut[name] = y
    taps = [cut['tap'] if r == 1.0 else ff_filter(cut['tap'], 'asetrate=%d,aresample=%d' % (int(SR * r), SR), ch=2) for r in TAP_PITCH]
    for k, y in enumerate(taps):
        save(S + 'sfx/cut/tap-%d.wav' % (k + 1), y, SR)

    def onset(y):
        """Where the sound's loudest transient sits (s from the clip start)."""
        w = int(0.005 * SR)
        e = np.abs(y.mean(1))
        m = len(e) // w
        return float(np.argmax(e[: m * w].reshape(m, w).max(1)) * w / SR)

    def first_onset(y):
        e = np.abs(y.mean(1))
        thr = e.max() * 10 ** (-12 / 20)
        return float(np.nonzero(e > thr)[0][0] / SR)

    sfx = np.zeros((N, 2))
    fx_clips = []
    pages = 0
    for e in plan['effects']:
        e['t'] = round(cue_t[e['cue']] + e.get('dt', 0.0), 3)
        k = e['kind']
        if k == 'page':
            name = PAGE_ORDER[pages % 3]
            pages += 1
            y = cut[name]
            lead = onset(y)            # the loudest flip sits on the cut
        elif k == 'tap':
            name = 'tap-%d' % (e['pitch'] + 1)
            y = taps[e['pitch']]
            lead = first_onset(y)
        elif k in ('tick', 'impression'):
            name = k
            y = cut[k]
            lead = first_onset(y)
        else:                          # slides start with the move
            name = k
            y = cut[k]
            lead = 0.0
        st = e['t'] - lead
        i0 = int(round(st * SR))
        n = min(len(y), N - i0)
        sfx[i0: i0 + n] += y[:n]
        fx_clips.append({'kind': k, 'file': 'sfx/cut/%s.wav' % name, 'start': round(st, 3), 'duration': round(len(y) / SR, 3),
                         'mark': e['t'], 'what': e['what']})

    save(S + 'stems/music.wav', mus, SR)
    save(S + 'stems/sfx.wav', sfx, SR)
    mix = mus + sfx + np.stack([dia, dia], -1)
    save(S + 'mix-offline.wav', mix, SR)

    # 4. measure
    md = ebur(np.stack([dia, dia], -1))
    mm_alone = ebur(mus)
    mx = ebur(mix)
    ms = ebur(sfx)
    under = env > 0.99
    gaps = env < 0.01
    lvl = lambda y, k: 10 * np.log10(np.mean(y[k] ** 2) + 1e-12)
    meas = {
        'dialogue': md, 'music_unducked_I': round(MUSIC_ALONE_LUFS, 1), 'music_ducked': mm_alone,
        'music_sample_peak_dbfs': round(20 * np.log10(np.abs(mus).max()), 2), 'sfx_sample_peak_dbfs': round(20 * np.log10(np.abs(sfx).max()), 2), 'sfx': ms, 'mix': mx,
        'music_rms_gaps_db': round(lvl(mus.mean(1), gaps), 1), 'music_rms_under_speech_db': round(lvl(mus.mean(1), under), 1),
        'dialogue_gain_db': round(20 * np.log10(g), 2), 'duck_spans': [[round(a, 2), round(b, 2)] for a, b in spans],
        'mix_sample_peak_dbfs': round(20 * np.log10(np.abs(mix).max()), 2), 'length_s': N / SR,
    }
    print(json.dumps({k: v for k, v in meas.items() if k != 'duck_spans'}, indent=1))

    # 5. the manifest
    out = []
    for c in clips:
        L = lines[c['id']]
        j = json.load(open(take_file(c['take']).rsplit('.', 1)[0] + '.json'))
        off = c['start'] - c['cut'][0]   # film time of the take's 0
        stt = json.load(open(S + 'takes/%s.stt.json' % c['take']))
        out.append({
            'id': c['id'], 'who': 'narrator' if L['who'] == 'N' else 'reader',
            'voice': (j.get('voice') or L.get('voice')) if L['who'] == 'N' else L.get('voice'),
            'model': j.get('model'), 'take': 'takes/%s.%s' % (c['take'], 'wav' if take_file(c['take']).endswith('.wav') else 'mp3'),
            'file': 'master/%s.wav' % c['id'], 'start': round(c['start'], 3), 'duration': round(c['duration'], 3),
            'speech': [round(c['in'], 3), round(c['speechEnd'], 3)], 'track': 2 if L['who'] == 'N' else 3, 'volume': 1,
            'script': L['script'], 'text_sent': j.get('text', L['text']),
            'words': [w for w in words_from_alignment(j, off) if w['end'] > c['start'] - 0.01],
            'heard': [{'text': w['text'], 'start': round(w['start'] + off, 3), 'end': round(w['end'] + off, 3)} for w in stt['words'] if w['type'] == 'word'],
        })
    man = {
        '_': 'modern-hebrew v2 sound: every clip the composition places, in film seconds (%.3f s). Place each voice clip as an <audio> with data-start = start and data-duration = duration (volume 1: levels are in the files), stems/music.wav and stems/sfx.wav at 0 for the whole film. words = the take\'s own character alignment (the text the voice was given, with the respellings), heard = what el.mjs hear returned, both shifted to film time. cues = the film times the picture reads (../data/cues.js). effects lists every effect inside stems/sfx.wav for reference: change plan.json and run python3 sound/tools/mix.py to move one.' % DUR,
        'duration': DUR, 'sampleRate': SR, 'layout': {'lines': [{'id': p['id'], 'take': p['take'], 'in': p['in']} for p in plan['lines']], 'close': CLOSE, 'end': DUR},
        'voices': out,
        'cues': cue_rows, 'cue_times': {k: round(v, 3) for k, v in cue_t.items()},
        'music': {'file': 'stems/music.wav', 'start': 0, 'duration': DUR, 'track': 4, 'volume': 1, 'source': mus_src['file'],
                  'source_offset': mus_src['offset'], 'note': mus_src['_']},
        'sfx': {'file': 'stems/sfx.wav', 'start': 0, 'duration': DUR, 'track': 5, 'volume': 1},
        'effects': fx_clips,
        'mix': {'file': 'mix-offline.wav', 'measured': meas},
    }
    json.dump(man, open(S + 'manifest.json', 'w'), ensure_ascii=False, indent=1)
    js = '// written by sound/tools/mix.py from sound/plan.json and the takes; do not edit\nwindow.MH_CUES = ' + json.dumps({'DUR': DUR, 'cues': {k: round(v, 3) for k, v in cue_t.items()}}, ensure_ascii=False) + ';\n'
    open(os.path.dirname(S.rstrip('/')) + '/data/cues.js', 'w').write(js)
    rows = ['<!-- modern-hebrew sound: written by sound/tools/mix.py from sound/plan.json. Paths are from the film root.',
            '     Track 2 the narrator (Frederick Surrey, kit/audio/voice-series.json), track 4 the music (ducked), track 5 the effects. Levels are in the files. -->']
    for v in out:
        rows.append('<audio id="vo-%s" src="sound/%s" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="1"></audio>'
                    % (v['id'], v['file'], v['start'], v['duration'], v['track']))
    rows.append('<audio id="music" src="sound/stems/music.wav" data-start="0" data-duration="%g" data-track-index="4" data-volume="1"></audio>' % DUR)
    rows.append('<audio id="sfx" src="sound/stems/sfx.wav" data-start="0" data-duration="%g" data-track-index="5" data-volume="1"></audio>' % DUR)
    open(S + 'audio-clips.html', 'w').write('\n'.join(rows) + '\n')
    print('wrote manifest.json with %d voices, %d effects' % (len(out), len(fx_clips)))


if __name__ == '__main__':
    main()
