"""A film's sound from a plan file: the voice masters, the placed narration, the
bed's level and duck, and the premix, with every measurement in a report.

   python3 kit/sound/mix.py <plan.json>                 every stage the plan has
   python3 kit/sound/mix.py <plan.json> --only masters  one stage (masters, bed or premix);
                                                        a later stage reads the earlier ones' files
   python3 kit/sound/mix.py <plan.json> --dry-run       the plan with its defaults, and the placement

The plan is JSON in the film folder; every path in it is relative to the plan's
folder. A film supplies its plan instead of editing this file. Keys the plan
leaves out take the defaults in DEFAULTS below (the newest published chain,
tuned to MOTION.md's targets: narrator about -16 LUFS in the film, true peak
at or under -1 dBTP after the AAC encode, fades of 0.3 to 0.8 s). An unknown
key is an error.

  "sr", "duration"   the sample rate and the film's length in seconds
  "voice"            how every take is mastered:
     decode_filters  an ffmpeg chain run while decoding, at the take's own rate
     cut, pre_level  then the take is cut, and optionally levelled first
                     ({"speech_rms_db": dB, "window": s, "range_db": dB}: the mean
                     level of its frames within range_db of its loudest; or
                     {"lufs": LUFS}: its integrated loudness, mono)
     fade, fade_shape  fades in and out (s), "rc" (raised cosine) or "sin2"
     filters         the ffmpeg chain at the working rate (high-pass, compressor)
     level           {"mode": "take", "lufs", "passes", "tolerance"}: every master
                     at one integrated loudness (mono), measured after the limiter
                     and corrected up to `passes` times; or {"mode": "dialogue",
                     ...}: one gain for every take, so the placed dialogue (dual
                     mono) measures `lufs`
     limiter         ffmpeg's lookahead limiter at `rate` (oversampled), with
                     ceiling_db (or a linear `limit`), attack and release (ms), asc,
                     and latency (true: no delay; false delays by the attack)
     post_fade       fades after the limiter (s), or null
     channels        1 (mono) or 2 (dual mono)
     trim            how a take's cut is found when a line gives none: from 0 to
                     `tail` s after its last word, never later than `guard` s before
                     the next line's first word
     out             a master's file, {id} replaced
  "lines"            [{"id", "take", "start" or "at", "cut"?, "first"?, "last"?}]:
                     start is the film time of the take's 0, at the film time of its
                     first word (start = at minus that word's time in the take's
                     .json); cut is [from, to] in take seconds; first and last
                     (film times of the first word and the last word's end) default
                     to the take's .json words
  "bed"              {"file", "gain_db" or "alone_peak_m" or "alone_lufs", "duck", "fade",
                     "fade_start", "limiter", "out"}: the music, cut to the film by the
                     film's own tool, set to a gain (or so that its loudest 400 ms where
                     it plays free, unducked, measures alone_peak_m; or so that the whole
                     unducked bed measures alone_lufs integrated), ducked under the
                     narration, faded and held under a ceiling
     duck            {"db" or "under_lufs", "ramp_in", "ramp_out", "ramp_out_last",
                     "lead", "after", "hold_gap", "gap_lift"}: down over ramp_in to
                     `lead` s before a line's first word, up over ramp_out from
                     `after` s past its last word, held through gaps under hold_gap;
                     under_lufs solves the depth so the bed measures that inside the
                     line windows; gap_lift ({"amount", "min_gap", "delay",
                     "ramp_up", "ramp_down"}) lifts the bed part of the way in the
                     held gaps of min_gap or more
  "stems"            [{"file", "gain_db", "start"}]: other finished stems (effects,
                     room tone, a bed mixed elsewhere), summed as they are
  "premix"           {"lufs" or "gain_db", "passes", "tolerance", "limiter", "out"}:
                     narration, bed and stems summed, set to `lufs` integrated with
                     one gain (or a fixed gain_db), under the limiter's ceiling
  "round_ms"         true places every clip on a whole millisecond, as the
                     renderer's adelay does, so the premix equals its sum of clips
  "report"           the report file: every line's placement, gain, loudness and
                     true peak, the narration, the bed and the premix, and the clips
                     (file, start, duration) for a composition's <audio> elements
"""
import copy
import json
import os
import re
import subprocess
import sys
import unicodedata

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio_util import rms_db, save  # noqa: E402

LIMITER = {'ceiling_db': None, 'limit': None, 'attack': 5, 'release': 60, 'asc': False, 'latency': True, 'rate': 192000}
DEFAULTS = {
    'sr': 48000,
    'duration': None,
    'round_ms': False,
    'voice': {
        'decode_filters': None,
        'pre_level': None,
        'fade': [0.010, 0.060],
        'fade_shape': 'rc',
        'filters': 'highpass=f=70:poles=2,acompressor=threshold=0.063:ratio=2:attack=15:release=180:knee=4:makeup=1',
        'level': {'mode': 'take', 'lufs': -19.0, 'passes': 4, 'tolerance': 0.05},
        'limiter': dict(LIMITER, ceiling_db=-3.5),
        'post_fade': None,
        'channels': 2,
        'trim': {'tail': 0.28, 'guard': 0.06},
        'out': 'masters/{id}.wav',
    },
    'lines': [],
    'bed': {
        'file': None,
        'gain_db': None,
        'alone_peak_m': -20.0,
        'alone_lufs': None,
        'duck': {'db': None, 'under_lufs': -26.0, 'ramp_in': 0.3, 'ramp_out': 0.3, 'ramp_out_last': None, 'lead': 0.0, 'after': 0.0,
                 'hold_gap': 1.2, 'gap_lift': None},
        'fade': [0.3, 0.8],
        'fade_start': 0.0,
        'limiter': dict(LIMITER, ceiling_db=-6.0),
        'out': 'stems/bed.wav',
    },
    'stems': [],
    'premix': {'lufs': -16.0, 'gain_db': None, 'passes': 4, 'tolerance': 0.05, 'limiter': dict(LIMITER, ceiling_db=-2.0), 'out': 'film-premix.wav'},
    'report': 'mix-report.json',
}
GAP_LIFT = {'amount': 0.5, 'min_gap': 0.9, 'delay': 0.1, 'ramp_up': 0.5, 'ramp_down': 0.4}
PRE_LEVEL = {'speech_rms_db': None, 'window': 0.02, 'range_db': 22.0, 'lufs': None}
LEVEL = {'mode': 'take', 'lufs': -19.0, 'passes': 4, 'tolerance': 0.05}
LINE_KEYS = {'id', 'take', 'start', 'at', 'cut', 'first', 'last'}
STEM_KEYS = {'file', 'gain_db', 'start'}


# ---------- signal helpers

def run(cmd, data=None):
    return subprocess.run(cmd, input=data, capture_output=True, check=True)


def decode(path, ch=1, sr=48000, af=None):
    """A file as float64 at sr: (n,) for ch 1, (n, ch) otherwise; af runs while decoding, at the file's own rate."""
    raw = run(['ffmpeg', '-v', 'error', '-i', path] + (['-af', af] if af else []) + ['-ac', str(ch), '-ar', str(sr), '-f', 'f32le', '-']).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x


def ff(x, chain, sr=48000):
    """A buffer through an ffmpeg filter chain at the same rate, returned at its own length."""
    ch = 1 if x.ndim == 1 else x.shape[1]
    out = run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(sr), '-ac', str(ch), '-i', '-', '-af', chain,
               '-f', 'f32le', '-ar', str(sr), '-ac', str(ch), '-'], x.reshape(-1).astype(np.float32).tobytes()).stdout
    y = np.frombuffer(out, np.float32).astype(np.float64)
    y = y.reshape(-1, ch) if ch > 1 else y
    if len(y) < len(x):
        y = np.concatenate([y, np.zeros((len(x) - len(y),) + y.shape[1:])])
    return y[: len(x)]


def meter(x, sr=48000, start=None, end=None):
    """(integrated LUFS, true peak dBTP, loudness range LU) of a buffer or of [start, end] s of it, by ebur128."""
    y = x if start is None else x[int(start * sr): int(end * sr)]
    ch = 1 if y.ndim == 1 else y.shape[1]
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(sr), '-ac', str(ch), '-i', '-',
                        '-af', 'ebur128=peak=true', '-f', 'null', '-'], input=y.reshape(-1).astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    s = r[r.rfind('Summary:'):]

    def num(pattern):
        m = re.search(pattern, s)
        return float(m.group(1)) if m and m.group(1) != '-inf' else float('-inf')

    lra = re.search(r'LRA:\s+(-?[\d.]+)', s)
    return num(r'I:\s+(-?[\d.]+|-inf)'), num(r'Peak:\s+(-?[\d.]+|-inf)'), (float(lra.group(1)) if lra else None)


def momentary(x, sr=48000):
    """ebur128's momentary loudness (400 ms) every 100 ms: (times, LUFS)."""
    ch = 1 if x.ndim == 1 else x.shape[1]
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(sr), '-ac', str(ch), '-i', '-', '-af', 'ebur128',
                        '-f', 'null', '-'], input=x.reshape(-1).astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    ts, ms = [], []
    for m in re.finditer(r't:\s*([\d.]+)\s+TARGET:\S+\s+LUFS\s+M:\s*(-?[\d.]+|-inf)', r):
        ts.append(float(m.group(1)))
        ms.append(float(m.group(2)) if m.group(2) != '-inf' else -120.0)
    return np.array(ts), np.array(ms)


def limiter_chain(cfg, sr=48000):
    """ffmpeg's lookahead limiter at cfg['rate'] (the oversampling catches peaks between samples)."""
    lin = cfg['limit'] if cfg.get('limit') is not None else 10 ** (cfg['ceiling_db'] / 20)
    s = 'aresample=%d,alimiter=limit=%.6f:attack=%s:release=%s:level=disabled:asc=%d' % (cfg['rate'], lin, cfg['attack'], cfg['release'], 1 if cfg['asc'] else 0)
    return s + (':latency=1' if cfg['latency'] else '') + ',aresample=%d' % sr


def limit(x, cfg, sr=48000):
    return ff(x, limiter_chain(cfg, sr), sr)


def ramps(n, shape):
    """(fade in, fade out) gains over n samples."""
    if shape == 'sin2':
        w = np.linspace(0, np.pi / 2, n)
        return np.sin(w) ** 2, np.cos(w) ** 2
    r = 0.5 - 0.5 * np.cos(np.pi * np.arange(n) / max(1, n))
    return r, r[::-1]


def fade(x, a, b, shape='rc'):
    """Fades in over a and out over b samples, in place."""
    if a:
        w = ramps(a, shape)[0]
        x[:a] *= w if x.ndim == 1 else w[:, None]
    if b:
        w = ramps(b, shape)[1]
        x[-b:] *= w if x.ndim == 1 else w[:, None]
    return x


def speech_rms(x, sr, win=0.02, range_db=22.0):
    """The mean level (dB, as a linear RMS) of the frames within range_db of the loudest."""
    d = rms_db(x, sr, win)
    return 10 ** (np.mean(d[d > d.max() - range_db]) / 20)


# ---------- words and placement

def words(take_json):
    """(text, start, end) of each word in a take's character alignment, take seconds.
    A word is a run of non-space characters without its leading and trailing punctuation and symbols."""
    a = take_json.get('alignment') or {}
    out, cur = [], []
    for c, s, e in zip(a.get('characters', []) + [' '], a.get('character_start_times_seconds', []) + [0], a.get('character_end_times_seconds', []) + [0]):
        if c.isspace():
            keep = [k for k in cur]
            while keep and unicodedata.category(keep[0][0])[0] in 'PS':
                keep.pop(0)
            while keep and unicodedata.category(keep[-1][0])[0] in 'PS':
                keep.pop()
            if keep:
                out.append((''.join(k[0] for k in keep), keep[0][1], keep[-1][2]))
            cur = []
        else:
            cur.append((c, s, e))
    return out


def place_lines(plan, base):
    """Each line with its take path, film start, cut, first and last word (film s), resolved from the plan and the takes' .json."""
    sr, V = plan['sr'], plan['voice']
    out = []
    for L in plan['lines']:
        extra = set(L) - LINE_KEYS
        if extra:
            raise SystemExit('line %s: unknown keys %s' % (L.get('id'), sorted(extra)))
        take = path(base, L['take'])
        j = take_record(take)
        w = words(j) if j else []
        if 'start' in L:
            start = L['start']
        elif 'at' in L:
            if not w:
                raise SystemExit('line %s: "at" needs the take\'s .json words' % L['id'])
            start = L['at'] - w[0][1]
        else:
            raise SystemExit('line %s: give "start" or "at"' % L['id'])
        first = L['first'] if 'first' in L else (start + w[0][1] if w else start)
        # the trim reads the last word's end in the take; the duck reads the film time of it
        last_take = w[-1][2] if w else (L['last'] - start if 'last' in L else None)
        last = L['last'] if 'last' in L else (start + last_take if last_take is not None else None)
        out.append({'id': L['id'], 'take': take, 'start': start, 'first': first, 'last_take': last_take, 'last': last, 'cut': L.get('cut')})
    for k, p in enumerate(out):
        if p['cut'] is None:
            if p['last_take'] is None:
                raise SystemExit('line %s: give "cut", or a take .json with words for the trim' % p['id'])
            nxt = out[k + 1]['first'] if k + 1 < len(out) else None
            end = min(p['last_take'] + V['trim']['tail'], (nxt - p['start']) - V['trim']['guard'] if nxt is not None else 1e9, duration_of(p['take'], sr))
            p['cut'] = [0.0, end]
        p['film_start'] = p['start'] + p['cut'][0]
    return out


def take_record(take):
    j = os.path.splitext(take)[0] + '.json'
    return json.load(open(j)) if os.path.exists(j) else None


_durations = {}


def duration_of(f, sr):
    if f not in _durations:
        _durations[f] = len(decode(f, 1, sr)) / sr
    return _durations[f]


def at_sample(t, plan):
    """A film time as a sample index: rounded to the sample, or to the whole millisecond with round_ms."""
    sr = plan['sr']
    return int(round(t * 1000)) * (sr // 1000) if plan['round_ms'] else int(round(t * sr))


def place(stem, x, i0):
    """Adds x into stem from sample i0, cut at the stem's end."""
    if i0 >= len(stem):
        return
    if i0 < 0:
        x, i0 = x[-i0:], 0
    n = min(len(x), len(stem) - i0)
    stem[i0: i0 + n] += x[:n] if stem.ndim == x.ndim else x[:n, None]


# ---------- the stages

def cut_take(p, V, sr):
    x = decode(p['take'], 1, sr, V['decode_filters'])
    a, b = int(round(p['cut'][0] * sr)), int(round(p['cut'][1] * sr))
    y = x[a:b].copy()
    if len(y) < b - a:
        y = np.concatenate([y, np.zeros(b - a - len(y))])
    pl = V['pre_level']
    if pl and pl['speech_rms_db'] is not None:
        y *= 10 ** (pl['speech_rms_db'] / 20) / speech_rms(y, sr, pl['window'], pl['range_db'])
    elif pl and pl['lufs'] is not None:
        y *= 10 ** ((pl['lufs'] - meter(y, sr)[0]) / 20)
    fade(y, int(V['fade'][0] * sr), int(V['fade'][1] * sr), V['fade_shape'])
    if V['filters']:
        y = ff(y, V['filters'], sr)
    return y


def masters(plan, base, placed):
    """Every line's master (mono float64, before the channel layout) and its report row."""
    sr, V, N = plan['sr'], plan['voice'], n_samples(plan)
    lv = V['level']
    if lv['mode'] not in ('take', 'dialogue') or lv['passes'] < 1:
        raise SystemExit('voice.level: mode is "take" or "dialogue", and passes is 1 or more')
    raw = {p['id']: cut_take(p, V, sr) for p in placed}
    g = 1.0
    if lv['mode'] == 'dialogue':
        for _ in range(lv['passes']):
            stem = np.zeros(N)
            for p in placed:
                place(stem, raw[p['id']] * g, at_sample(p['film_start'], plan))
            I = meter(np.stack([stem, stem], -1), sr)[0]
            if lv['tolerance'] and abs(lv['lufs'] - I) < lv['tolerance']:
                break
            g *= 10 ** ((lv['lufs'] - I) / 20)
    out, rows = {}, []
    for p in placed:
        y = raw[p['id']]
        if lv['mode'] == 'take':
            gain = lv['lufs'] - meter(y, sr)[0]
            for _ in range(lv['passes']):
                z = limit(y * 10 ** (gain / 20), V['limiter'], sr)
                used = gain
                I2 = meter(z, sr)[0]
                if abs(I2 - lv['lufs']) < lv['tolerance']:
                    break
                gain += lv['lufs'] - I2
        else:
            z = limit(y * g, V['limiter'], sr)
            used = 20 * np.log10(g)
        if V['post_fade']:
            fade(z, int(V['post_fade'][0] * sr), int(V['post_fade'][1] * sr), V['fade_shape'])
        out[p['id']] = z
        I_m, tp, _ = meter(z, sr)
        rows.append({'id': p['id'], 'take': os.path.relpath(p['take'], base), 'film_start': round(p['film_start'], 4), 'cut': [round(c, 4) for c in p['cut']],
                     'first_word': round(p['first'], 3), 'last_word_end': round(p['last'], 3) if p['last'] is not None else None,
                     'gain_db': round(float(used), 2), 'lufs_mono': round(I_m, 2), 'true_peak_dbtp': round(tp, 2), 'seconds': round(len(z) / sr, 3)})
    return out, rows


def write_masters(plan, base, ms):
    V, sr = plan['voice'], plan['sr']
    files = {}
    for k, z in ms.items():
        f = path(base, V['out'].replace('{id}', str(k)))
        os.makedirs(os.path.dirname(f), exist_ok=True)
        save(f, np.stack([z, z], 1) if V['channels'] == 2 else z, sr)
        files[k] = f
    return files


def held(spans, hold_gap):
    out = []
    for s, e in sorted(spans):
        if out and s - out[-1][1] < hold_gap:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out


def duck_envelope(spans, N, sr, d):
    """1 where the bed is fully ducked, 0 where it is free: raised-cosine ramps around the held windows,
    and a partial release in the held gaps (gap_lift)."""
    t = np.arange(N) / sr
    v = np.zeros(N)
    hs = held(spans, d['hold_gap'])
    for k, (s, e) in enumerate(hs):
        s, e = s - d['lead'], e + d['after']
        ri = d['ramp_in']
        ro = d['ramp_out_last'] if (k == len(hs) - 1 and d['ramp_out_last'] is not None) else d['ramp_out']
        w = np.zeros(N)
        w[(t >= s) & (t <= e)] = 1
        r = (t >= s - ri) & (t < s)
        w[r] = 0.5 - 0.5 * np.cos(np.pi * (t[r] - (s - ri)) / ri)
        f = (t > e) & (t <= e + ro)
        w[f] = 0.5 + 0.5 * np.cos(np.pi * (t[f] - e) / ro)
        v = np.maximum(v, w)
    gl = d['gap_lift']
    if gl:
        gl = dict(GAP_LIFT, **gl)
        sp = sorted(spans)
        for (s0, e0), (s1, e1) in zip(sp[:-1], sp[1:]):
            if s1 - e0 >= d['hold_gap'] or s1 - e0 < gl['min_gap']:
                continue
            a, b = e0 + gl['delay'], s1
            up, dn = min(gl['ramp_up'], (b - a) / 2), min(gl['ramp_down'], (b - a) / 2)
            g = np.zeros(N)
            g[(t >= a) & (t < b)] = 1
            r = (t >= a) & (t < a + up)
            g[r] = 0.5 - 0.5 * np.cos(np.pi * (t[r] - a) / up)
            f = (t >= b - dn) & (t < b)
            g[f] = np.minimum(g[f], 0.5 + 0.5 * np.cos(np.pi * (t[f] - (b - dn)) / dn))
            v = v - gl['amount'] * g
    return v, hs


def windows(x, spans, sr):
    return np.concatenate([x[int(a * sr): int(b * sr)] for a, b in spans], 0)


def bed(plan, base, placed):
    sr, B, N = plan['sr'], plan['bed'], n_samples(plan)
    x = decode(path(base, B['file']), 2, sr)
    x = np.pad(x, ((0, max(0, N - len(x))), (0, 0)))[:N]
    spans = [(p['first'], p['last']) for p in placed if p['last'] is not None]
    d = B['duck']
    v, hs = np.zeros(N), []
    if d and spans:
        v, hs = duck_envelope(spans, N, sr, d)
    free = v < 0.01
    g_alone, how = 0.0, 'unity'
    peak = free_peak(x, free, sr) if B['gain_db'] is None and B['alone_peak_m'] is not None else None
    if B['gain_db'] is not None:
        g_alone, how = B['gain_db'], 'gain_db'
    elif peak is not None:
        g_alone, how = B['alone_peak_m'] - peak, 'alone_peak_m'
    elif B['alone_lufs'] is not None:
        g_alone, how = B['alone_lufs'] - meter(x, sr)[0], 'alone_lufs'
    rep = {'gain_alone_db': round(g_alone, 2), 'alone_set_by': how}
    g_db = np.full(N, g_alone)
    if d and spans:
        depth = d['db'] if d['db'] is not None else d['under_lufs'] - (meter(windows(x, spans, sr), sr)[0] + g_alone)
        if depth > 0:
            # the alone gain already holds the bed under under_lufs in the line windows: no duck, never a lift
            rep['duck_clamped_from_db'] = round(depth, 2)
            depth = 0.0
        g_db = g_db + depth * v
        rep.update({'duck_db': round(depth, 2), 'held_windows': [[round(a, 3), round(b, 3)] for a, b in hs]})
    y = x * (10 ** (g_db / 20))[:, None]
    if B['fade']:
        b0 = int(round(B['fade_start'] * sr))
        nfi, nfo = int(B['fade'][0] * sr), int(B['fade'][1] * sr)
        y[:b0] = 0
        fade(y[b0:], nfi, 0)
        fade(y, 0, nfo)
    if B['limiter']:
        y = limit(y, B['limiter'], sr)
    f = path(base, B['out'])
    os.makedirs(os.path.dirname(f) or '.', exist_ok=True)
    save(f, y, sr)
    I, tp, _ = meter(y, sr)
    rep.update({'out': os.path.relpath(f, base), 'lufs_whole': round(I, 2), 'true_peak_dbtp': round(tp, 2)})
    if spans:
        rep['lufs_under_speech'] = round(meter(windows(y, spans, sr), sr)[0], 2)
    m = free_peak(y, free, sr)
    if m is not None:
        rep['momentary_max_free'] = round(m, 1)
    return y, rep


def free_peak(x, free, sr):
    """The loudest 400 ms (momentary LUFS) of x inside the stretches where the bed plays free
    (the open, released gaps, the card), or None when no 400 ms is free."""
    ts, ms = momentary(x, sr)
    keep = [m for t, m in zip(ts, ms) if t >= 0.4 and free[min(len(free) - 1, int(t * sr))] and free[int((t - 0.4) * sr)]]
    return max(keep) if keep else None


def premix(plan, base, voice, bedx):
    sr, P, N = plan['sr'], plan['premix'], n_samples(plan)
    film = voice.copy()
    if bedx is not None:
        film += bedx[:N]
    for s in plan['stems']:
        extra = set(s) - STEM_KEYS
        if extra:
            raise SystemExit('stem %s: unknown keys %s' % (s.get('file'), sorted(extra)))
        y = decode(path(base, s['file']), 2, sr) * 10 ** (s.get('gain_db', 0.0) / 20)
        place(film, y, at_sample(s.get('start', 0.0), plan))
    if P['gain_db'] is not None:
        gain = P['gain_db']
        out = limit(film * 10 ** (gain / 20), P['limiter'], sr)
    else:
        if P['passes'] < 1:
            raise SystemExit('premix.passes is 1 or more')
        I0 = meter(film, sr)[0]
        gain = P['lufs'] - I0
        for _ in range(P['passes']):
            out = limit(film * 10 ** (gain / 20), P['limiter'], sr)
            used = gain
            I1 = meter(out, sr)[0]
            if abs(I1 - P['lufs']) < P['tolerance']:
                break
            gain += P['lufs'] - I1
        gain = used
    f = path(base, P['out'])
    os.makedirs(os.path.dirname(f) or '.', exist_ok=True)
    save(f, out, sr)
    I, tp, lra = meter(out, sr)
    return out, {'out': os.path.relpath(f, base), 'gain_db': round(float(gain), 3), 'lufs': round(I, 2), 'true_peak_dbtp': round(tp, 2), 'lra': lra,
                 'seconds': round(len(out) / sr, 4)}


# ---------- the plan

def path(base, p):
    return p if os.path.isabs(p) else os.path.normpath(os.path.join(base, p))


def n_samples(plan):
    if not plan['duration']:
        raise SystemExit('the plan needs "duration" (the film\'s length in seconds)')
    return int(round(plan['duration'] * plan['sr']))


def merge(default, given, where):
    if not isinstance(given, dict) or not isinstance(default, dict):
        return given
    extra = set(given) - set(default)
    if extra:
        raise SystemExit('%s: unknown keys %s' % (where, sorted(extra)))
    out = copy.deepcopy(default)
    for k, v in given.items():
        if k == 'limiter' and isinstance(v, dict):
            out[k] = merge(dict(LIMITER, **(default[k] or {})), v, where + '.limiter')
        elif k == 'level' and isinstance(v, dict):
            out[k] = merge(LEVEL, v, where + '.level')
        elif k in ('duck', 'gap_lift', 'trim', 'pre_level') and v is None:
            out[k] = None
        elif k == 'gap_lift':
            out[k] = merge(GAP_LIFT, v, where + '.gap_lift')
        elif k == 'pre_level':
            out[k] = merge(PRE_LEVEL, v, where + '.pre_level')
            if ('speech_rms_db' in v) == ('lufs' in v):
                raise SystemExit(where + '.pre_level: give speech_rms_db or lufs')
        else:
            out[k] = merge(default[k], v, where + '.' + k) if isinstance(default[k], dict) else v
    return out


def load_plan(f):
    given = json.load(open(f))
    plan = merge(DEFAULTS, {k: v for k, v in given.items() if not k.startswith('_')}, 'plan')
    for k in ('bed', 'premix'):
        if k not in given:
            plan[k] = None
    if plan['bed'] is not None:
        if not plan['bed']['file']:
            raise SystemExit('bed: give its "file"')
        named = [k for k in ('gain_db', 'alone_peak_m', 'alone_lufs') if k in given['bed']]
        if len(named) > 1:
            raise SystemExit('bed: give one of gain_db, alone_peak_m and alone_lufs, not %s' % ' and '.join(named))
        if named and named[0] != 'alone_peak_m':
            plan['bed']['alone_peak_m'] = None
    return plan


def main():
    args = sys.argv[1:]
    only = None
    if '--only' in args:
        k = args.index('--only')
        only = args[k + 1]
        del args[k:k + 2]
        if only not in ('masters', 'bed', 'premix'):
            raise SystemExit('--only takes masters, bed or premix')
    dry = '--dry-run' in args
    if dry:
        args.remove('--dry-run')
    if len(args) != 1:
        raise SystemExit(__doc__)
    plan_file = args[0]
    base = os.path.dirname(os.path.abspath(plan_file))
    plan = load_plan(plan_file)
    sr = plan['sr']
    placed = place_lines(plan, base) if plan['lines'] else []
    if dry:
        print(json.dumps({k: v for k, v in plan.items() if k != 'lines'}, indent=1))
        for p in placed:
            print('%s  %s  start %.3f  cut %.3f-%.3f  first %.3f  last %s' % (p['id'], os.path.relpath(p['take'], base), p['start'], p['cut'][0], p['cut'][1],
                                                                          p['first'], '%.3f' % p['last'] if p['last'] is not None else '-'))
        return
    N = n_samples(plan)
    rep = {'plan': os.path.basename(plan_file), 'sr': sr, 'duration': plan['duration']}
    voice = np.zeros((N, 2))
    if placed and only in (None, 'masters', 'premix'):
        if only in (None, 'masters'):
            ms, rows = masters(plan, base, placed)
            files = write_masters(plan, base, ms)
            rep['lines'] = rows
        else:
            files = {p['id']: path(base, plan['voice']['out'].replace('{id}', str(p['id']))) for p in placed}
            ms = {k: decode(f, 2, sr) for k, f in files.items()}
        for p in placed:
            z = ms[p['id']]
            place(voice, z if z.ndim == 2 else np.stack([z, z], 1), at_sample(p['film_start'], plan))
        rep['gaps_s'] = [round(placed[k + 1]['first'] - placed[k]['last'], 3) for k in range(len(placed) - 1) if placed[k]['last'] is not None]
        I, tp, _ = meter(voice, sr)
        rep['narration'] = {'lufs': round(I, 2), 'true_peak_dbtp': round(tp, 2)}
        rep['clips'] = [{'id': p['id'], 'file': os.path.relpath(files[p['id']], base), 'start': round(p['film_start'], 4),
                         'duration': round(ms[p['id']].shape[0] / sr, 4)} for p in placed]
    bedx = None
    if plan['bed']:
        if only in (None, 'bed'):
            bedx, rep['bed'] = bed(plan, base, placed)
        elif only == 'premix':
            bedx = decode(path(base, plan['bed']['out']), 2, sr)
    if plan['premix'] and only in (None, 'premix'):
        _, rep['premix'] = premix(plan, base, voice, bedx)
    if plan['report'] and only is None:
        f = path(base, plan['report'])
        json.dump(rep, open(f, 'w'), indent=1)
    print(json.dumps({k: v for k, v in rep.items() if k not in ('lines', 'clips')}, indent=1))
    for r in rep.get('lines', []):
        print(r)


if __name__ == '__main__':
    main()
