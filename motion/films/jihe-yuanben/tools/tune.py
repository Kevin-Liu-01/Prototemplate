"""Builds the tone-corrected Mandarin takes from Yun's own takes.

Yun (and every other library voice tried) reads 界 low in every take, so
界說 is heard as 解說 (jiěshuō, "explanation"); 丁 and 何 fall at the end of a
phrase, and 甲 breaks into two pitches. tools/psola.py re-pitches only those
syllables, on her own glottal periods, to the contour their tone needs; the
rest of each take is kept sample for sample. The contours are in semitones
against 217 Hz (her speech median) and follow her own clean tones elsewhere
in the takes: a fourth tone such as 故 starts near 310 Hz and falls to about
150, a first tone such as 說 sits level near 250.

Each take is a list of pieces cut inside pauses (as tools/splice.py does),
levelled to one speech RMS, joined with 8 ms fades and the given silences.
Writes audio/<out>.wav, .mp3 (for `el.mjs hear`) and .json, whose alignment
lists each printed character at its acoustic onset (the first sound of its
consonant), shifted by the piece's offset.

   python3 tools/tune.py            (builds every take in SPECS)
   python3 tools/pitch.py audio/zh4t.wav ...   (the check)
"""
import json
import subprocess
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load, save, rms_db
from psola import retune

SR = 44100
ROOT = __file__.rsplit('/', 2)[0] + '/'
sys.path.insert(0, ROOT + 'kit/audio')
from voices import voice_id  # noqa: E402  (ids from kit/audio/voices.local.json, never tracked)

# Tone contours: [(u, st)], u over the syllable's voiced span.
JIE4 = [(0, 6.6), (0.15, 7.0), (0.5, 2.5), (1.0, -7.0)]      # 界 jiè: a high fall
JIA3 = [(0, -1.5), (0.4, -6.5), (0.75, -8.5), (1.0, -6.0)]   # 甲 jiǎ: one low dip
DING1 = [(0, 4.6), (0.5, 4.3), (1.0, 3.2)]                    # 丁 dīng: high level (1.4 st of drift)
JI3 = [(0, -4.3), (0.6, -8.2), (1.0, -8.8)]                              # 幾 jǐ before a second tone: low, falling
HE2 = [(0, -6.5), (0.3, -6.8), (1.0, 3.5)]                 # 何 hé: a rise from mid to high

# The 界說 word, cut from 世界說 (zh4g: 世 removed in the closure before 界's j).
JIESHUO = ('zh4g', 0.200, 0.700, [('界', 0.215), ('說', 0.370)], [(0.22, 0.37, JIE4, 1.35)])

# out: text, pieces [(source, cut_from, cut_to, silence_before, [(char, onset in source)], [(t0, t1, contour, stretch)])]
SPECS = {
    'zh4t': {'text': '界說', 'pieces': [JIESHUO[:2] + (JIESHUO[2], 0.0) + JIESHUO[3:]]},
    'zh5t': {
        'text': '凡造論，先當分別解說論中所用名目，故曰界說。',
        'pieces': [
            ('zh5e', 0.00, 4.10, 0.00, [('凡', 0.0), ('造', None), ('論', None), ('先', None), ('當', None), ('分', None), ('別', None),
                                       ('解', None), ('說', None), ('論', None), ('中', None), ('所', None), ('用', None), ('名', None), ('目', None)], []),
            ('zh5f', 0.00, 0.44, 0.08, [('故', 0.06), ('曰', 0.29)], []),
            JIESHUO[:2] + (JIESHUO[2], 0.04) + JIESHUO[3:],
        ],
    },
    'zh6t': {
        'text': '甲、乙、丙、丁。',
        'pieces': [
            ('zh6c', 0.00, 0.42, 0.00, [('甲', 0.05)], [(0.11, 0.37, JIA3, 1.0)]),
            ('zh6c', 0.44, 0.68, 0.07, [('乙', 0.47)], []),
            ('zh6c', 0.68, 0.915, 0.25, [('丙', 0.69)], []),
            ('zh6c', 0.915, 1.22, 0.22, [('丁', 0.93)], [(0.94, 1.19, DING1, 1.0)]),
        ],
    },
    'zh7t': {
        'text': '幾何',
        'pieces': [('zh7f', 0.00, 0.46, 0.00, [('幾', 0.06), ('何', 0.25)], [(0.10, 0.245, JI3, 1.0), (0.31, 0.455, HE2, 1.3)])],
    },
}
# tools/splice.py's zh5e alignment indices, for the note's first piece (onsets from the take's own alignment)
ZH5E_IDX = [0, 1, 2, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19]


def speech_rms(x):
    d = rms_db(x, SR, 0.02)
    on = d[d > d.max() - 25]
    return 10 ** (np.mean(on) / 20)


def piece(src, t0, t1, chars, retunes):
    x = load(ROOT + 'audio/%s.mp3' % src, SR).astype(np.float64)
    maps = []
    for a, b, contour, stretch in retunes:
        # times of later retunes are in the original take: map them through earlier ones
        for m in maps:
            a, b = m(a), m(b)
        x, sh, _ = retune(x, SR, a, b, contour, stretch)
        maps.append(sh)

    def T(t):
        for m in maps:
            t = m(t)
        return t

    seg = x[int(T(t0) * SR): int(T(t1) * SR)]
    if src == 'zh5e':
        st = json.load(open(ROOT + 'audio/zh5e.json'))['alignment']['character_start_times_seconds']
        chars = [(c, st[ZH5E_IDX[i]]) for i, (c, _) in enumerate(chars)]
    return seg, [(c, T(s) - T(t0)) for c, s in chars]


def build(name, spec):
    parts = []
    for src, t0, t1, pad, chars, retunes in spec['pieces']:
        seg, marks = piece(src, t0, t1, chars, retunes)
        parts.append((seg, pad, marks, src))
    ref = np.mean([speech_rms(p[0]) for p in parts])
    out = np.zeros(0)
    al = []
    f = int(0.008 * SR)
    ramp = np.sin(np.linspace(0, np.pi / 2, f)) ** 2
    for seg, pad, marks, src in parts:
        seg = seg * (ref / speech_rms(seg))
        seg[:f] *= ramp
        seg[-f:] *= ramp[::-1]
        out = np.concatenate([out, np.zeros(int(round(pad * SR)))])
        off = len(out) / SR
        for c, s in marks:
            al.append((c, round(off + max(0.0, s), 3), src))
        out = np.concatenate([out, seg])
    save(ROOT + 'audio/%s.wav' % name, out, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ROOT + 'audio/%s.wav' % name, '-b:a', '192k', ROOT + 'audio/%s.mp3' % name], check=True)
    dur = len(out) / SR
    a = {'characters': [m[0] for m in al], 'character_start_times_seconds': [m[1] for m in al],
         'character_end_times_seconds': [al[i + 1][1] if i + 1 < len(al) else dur for i in range(len(al))]}
    json.dump({'text': spec['text'], 'voice': 'Yun', 'voice_id': voice_id('Yun'), 'model': 'eleven_multilingual_v2', 'speed': 1,
               'duration': dur, 'tuned_from': [[p[0], p[1], p[2], p[3], [[r[0], r[1], r[2], r[3]] for r in p[5]]] for p in spec['pieces']],
               'sources_by_char': [[m[0], m[2]] for m in al], 'alignment': a},
              open(ROOT + 'audio/%s.json' % name, 'w'), ensure_ascii=False, indent=1)
    print(name, '%.2f s' % dur, ' '.join('%s%.2f' % (m[0], m[1]) for m in al))


if __name__ == '__main__':
    for k in (sys.argv[1:] or SPECS):
        build(k, SPECS[k])
