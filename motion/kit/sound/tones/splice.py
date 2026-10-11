"""Builds a take from pieces of other takes of the same voice, or joins two takes of one line.

   python3 kit/sound/tones/splice.py <spec.json> [name ...]
   python3 kit/sound/tones/splice.py join [--takes <dir>] <out> <takeA> <cutA> <prefixA> <takeB> <cutB> <restB>

Pieces (the spec's "splice" section; tune.py builds its "tune" section the same
way): each piece is cut inside a pause, so no cut falls inside a syllable; the
pieces are levelled to one speech RMS (the mean level of the 20 ms frames
within 25 dB of each piece's loudest), faded over 8 ms (sin squared) and joined
with the given silence before each. Writes <out>/<name>.wav (what a mix uses),
<name>.mp3 (192 kb/s, for `el.mjs hear`) and <name>.json, whose alignment lists
each printed character at its onset in the source take (shifted to its place),
each ending where the next starts. The spec (paths relative to it):

  {"sr": 44100, "takes": "<folder of the source takes>", "out": "<folder>",
   "voice": {"voice", "voice_id", "model"},          optional; else the first source's
   "ref_hz": <the voice's speech median>, "contours": {...},   for tune.py
   "splice": {"<name>": {"text": "<the take's text>", "pieces": [
       {"src": "<take>", "from": s, "to": s, "silence": s,
        "chars": [["<char>", <onset s in the source> or {"index": <k>}], ...]}]}}}

An onset {"index": k} is the start time of character k of the source take's
alignment. A source name without an extension is <name>.mp3.

join: joins two takes of one line at a silence with a 15 ms equal-power
crossfade: takeA up to cutA (whose text starts with prefixA), then takeB from
cutB (from the start of restB in its text). Writes <takes>/<out>.wav and .json
with the characters of both parts, the second part shifted to its place.
Both cuts must sit in silence.
"""
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from audio_util import load, rms_db, save  # noqa: E402


def speech_rms(x, sr):
    d = rms_db(x, sr, 0.02)
    on = d[d > d.max() - 25]
    return 10 ** (np.mean(on) / 20)


def source(cfg, src):
    p = os.path.join(cfg['takes'], src if os.path.splitext(src)[1] else src + '.mp3')
    return p, os.path.splitext(p)[0] + '.json'


def onset(c, rec):
    if isinstance(c, dict):
        return rec['alignment']['character_start_times_seconds'][c['index']]
    return c


def build_take(name, entry, cfg, retune=None):
    """One take from its pieces. retune(x, a, b, contour, stretch) -> (y, shift), for pieces with "retune"."""
    sr = cfg['sr']
    parts = []
    for p in entry['pieces']:
        audio, record = source(cfg, p['src'])
        rec = json.load(open(record))
        x = load(audio, sr).astype(np.float64)
        maps = []
        for a, b, contour, stretch in p.get('retune', []):
            # the times of a later retune are in the original take: map them through the earlier ones
            for m in maps:
                a, b = m(a), m(b)
            x, sh = retune(x, a, b, contour, stretch)
            maps.append(sh)

        def T(t):
            for m in maps:
                t = m(t)
            return t

        seg = x[int(T(p['from']) * sr): int(T(p['to']) * sr)]
        marks = [(c, T(onset(s, rec)) - T(p['from'])) for c, s in p['chars']]
        parts.append((seg, p['silence'], marks, p['src'], rec))
    ref = np.mean([speech_rms(q[0], sr) for q in parts])
    out = np.zeros(0)
    al = []
    f = int(0.008 * sr)
    ramp = np.sin(np.linspace(0, np.pi / 2, f)) ** 2
    for seg, pad, marks, src, _ in parts:
        seg = seg * (ref / speech_rms(seg, sr))
        seg[:f] *= ramp
        seg[-f:] *= ramp[::-1]
        out = np.concatenate([out, np.zeros(int(round(pad * sr)))])
        off = len(out) / sr
        for c, s in marks:
            al.append((c, round(off + max(0.0, s), 3), src))
        out = np.concatenate([out, seg])
    os.makedirs(cfg['out'], exist_ok=True)
    wav = os.path.join(cfg['out'], name + '.wav')
    save(wav, out, sr)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-b:a', '192k', os.path.join(cfg['out'], name + '.mp3')], check=True)
    dur = len(out) / sr
    first = parts[0][4]
    who = cfg.get('voice') or first
    rec = {'text': entry['text'], 'voice': who.get('voice'), 'voice_id': who.get('voice_id'), 'model': who.get('model'),
           'speed': first.get('speed', 1), 'duration': dur}
    if any(p.get('retune') for p in entry['pieces']):
        rec['tuned_from'] = [[p['src'], p['from'], p['to'], p['silence'], [[r[0], r[1], r[2], r[3]] for r in p.get('retune', [])]] for p in entry['pieces']]
    else:
        rec['spliced_from'] = [[p['src'], p['from'], p['to']] for p in entry['pieces']]
    rec['sources_by_char'] = [[m[0], m[2]] for m in al]
    rec['alignment'] = {'characters': [m[0] for m in al], 'character_start_times_seconds': [m[1] for m in al],
                        'character_end_times_seconds': [al[i + 1][1] if i + 1 < len(al) else dur for i in range(len(al))]}
    json.dump(rec, open(os.path.join(cfg['out'], name + '.json'), 'w'), ensure_ascii=False, indent=1)
    print(name, '%.2f s' % dur, ' '.join('%s%.2f' % (m[0], m[1]) for m in al))


def load_spec(path, section):
    spec = json.load(open(path))
    base = os.path.dirname(os.path.abspath(path))
    cfg = {'sr': spec.get('sr', 44100), 'takes': os.path.join(base, spec.get('takes', '.')), 'out': os.path.join(base, spec.get('out', '.')),
           'voice': spec.get('voice'), 'ref_hz': spec.get('ref_hz'), 'contours': spec.get('contours', {})}
    return spec.get(section, {}), cfg


def join(args):
    takes = 'takes'
    if args and args[0] == '--takes':
        takes, args = args[1], args[2:]
    if len(args) != 7:
        raise SystemExit(__doc__)
    out, A, ca, pa, B, cb, rb = args
    ca, cb = float(ca), float(cb)
    sr = 48000
    xa = load(os.path.join(takes, A + '.mp3'), sr, dtype=np.float64)
    xb = load(os.path.join(takes, B + '.mp3'), sr, dtype=np.float64)
    n = int(0.015 * sr)
    ia, ib = int(ca * sr), int(cb * sr)
    a = xa[: ia + n].copy()
    b = xb[ib:].copy()
    w = np.linspace(0, np.pi / 2, n)
    a[-n:] *= np.cos(w)
    b[:n] *= np.sin(w)
    y = np.concatenate([a[:-n], a[-n:] + b[:n], b[n:]])
    save(os.path.join(takes, out + '.wav'), y, sr)
    ja, jb = json.load(open(os.path.join(takes, A + '.json'))), json.load(open(os.path.join(takes, B + '.json')))
    aa, ab = ja['alignment'], jb['alignment']
    ta, tb = ''.join(aa['characters']), ''.join(ab['characters'])
    if not ta.startswith(pa):
        raise SystemExit('%s does not start with %r' % (A, pa))
    k = tb.find(rb)
    if k < 0:
        raise SystemExit('%s does not hold %r' % (B, rb))
    shift = ca - cb
    chars = list(pa) + list(tb[k:])
    st = aa['character_start_times_seconds'][: len(pa)] + [t + shift for t in ab['character_start_times_seconds'][k:]]
    en = aa['character_end_times_seconds'][: len(pa)] + [t + shift for t in ab['character_end_times_seconds'][k:]]
    json.dump({'text': pa + rb, 'voice': ja.get('voice'), 'voice_id': ja.get('voice_id'), 'model': ja.get('model'), 'speed': ja.get('speed', 1),
               'duration': len(y) / sr, 'firstSound': st[0], 'spliced': {'a': A, 'cut_a': ca, 'b': B, 'cut_b': cb, 'crossfade_s': 0.015},
               'alignment': {'characters': chars, 'character_start_times_seconds': st, 'character_end_times_seconds': en}},
              open(os.path.join(takes, out + '.json'), 'w'), ensure_ascii=False, indent=1)
    print('%s.wav %.2f s' % (os.path.join(takes, out), len(y) / sr))


def main():
    args = sys.argv[1:]
    if args and args[0] == 'join':
        return join(args[1:])
    if not args:
        raise SystemExit(__doc__)
    takes, cfg = load_spec(args[0], 'splice')
    for k in (args[1:] or takes):
        build_take(k, takes[k], cfg)


if __name__ == '__main__':
    main()
