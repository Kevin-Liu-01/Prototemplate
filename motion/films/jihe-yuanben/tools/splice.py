"""Builds a Mandarin take from phrases of several takes of the same voice.

Each phrase is cut inside a pause (where the take is silent), so no cut falls
inside a syllable; the pieces are levelled to the same speech RMS and joined
with 8 ms equal-power fades, with extra silence where a pause needs to match
the first take's rhythm. Writes audio/<out>.mp3 (192 kb/s, for `el.mjs hear`),
audio/<out>.wav (lossless, what the mix uses) and audio/<out>.json, whose
alignment lists each printed character with its start time: the source take's
alignment start for that character (or its first pinyin letter), shifted by
the piece's offset.

   python3 tools/splice.py   (builds every take in SPECS)
"""
import json
import subprocess
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load, save, rms_db

SR = 44100
ROOT = __file__.rsplit('/', 2)[0] + '/'
sys.path.insert(0, ROOT + 'kit/audio')
from voices import voice_id  # noqa: E402  (ids from kit/audio/voices.local.json, never tracked)

# out: [(source, cut_from, cut_to, silence_before, [(printed char, index in source alignment)])]
SPECS = {
    'zh3s': {
        'text': '吳淞，徐光啓，筆受。',
        'pieces': [
            ('zh3g', 0.00, 0.61, 0.00, [('吳', 0), ('淞', 2)]),
            ('zh3', 0.62, 1.53, 0.06, [('徐', 3), ('光', 4), ('啓', 5)]),
            ('zh3c', 1.74, 2.45, 0.00, [('筆', 7), ('受', 8)]),
        ],
    },
    'zh5s': {
        'text': '凡造論，先當分別解說論中所用名目，故曰界說。',
        'pieces': [
            ('zh5e', 0.00, 4.10, 0.00, [('凡', 0), ('造', 1), ('論', 2), ('先', 6), ('當', 7), ('分', 8), ('別', 9), ('解', 10), ('說', 11),
                                       ('論', 12), ('中', 15), ('所', 16), ('用', 17), ('名', 18), ('目', 19)]),
            ('zh5f', 0.00, 1.25, 0.08, [('故', 0), ('曰', 1), ('界', 2), ('說', 3)]),
        ],
    },
    'zh1s': {
        'text': '言象之粗，而齟齬若是。',
        'pieces': [
            ('zh1g', 0.00, 1.00, 0.00, [('言', 0), ('象', 1), ('之', 2), ('粗', 3)]),
            ('zh1c', 1.05, 2.46, 0.04, [('而', 5), ('齟', 6), ('齬', 7), ('若', 8), ('是', 9)]),
        ],
    },
}


def speech_rms(x):
    d = rms_db(x, SR, 0.02)
    on = d[d > d.max() - 25]
    return 10 ** (np.mean(on) / 20)


def build(name, spec):
    pieces = []
    for src, t0, t1, pad, chars in spec['pieces']:
        x = load(ROOT + 'audio/%s.mp3' % src, SR)
        j = json.load(open(ROOT + 'audio/%s.json' % src))
        starts = j['alignment']['character_start_times_seconds']
        seg = x[int(t0 * SR): int(t1 * SR)].astype(np.float64)
        pieces.append((seg, pad, t0, [(c, starts[i]) for c, i in chars], src))
    ref = np.mean([speech_rms(p[0]) for p in pieces])
    out = np.zeros(0)
    marks = []
    f = int(0.008 * SR)
    ramp = np.sin(np.linspace(0, np.pi / 2, f)) ** 2
    for seg, pad, t0, chars, src in pieces:
        seg = seg * (ref / speech_rms(seg))
        seg[:f] *= ramp
        seg[-f:] *= ramp[::-1]
        out = np.concatenate([out, np.zeros(int(pad * SR))])
        off = len(out) / SR
        for c, s in chars:
            marks.append((c, round(off + s - t0, 3), src))
        out = np.concatenate([out, seg])
    save(ROOT + 'audio/%s.wav' % name, out, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ROOT + 'audio/%s.wav' % name, '-b:a', '192k', ROOT + 'audio/%s.mp3' % name], check=True)
    dur = len(out) / SR
    al = {'characters': [m[0] for m in marks], 'character_start_times_seconds': [m[1] for m in marks],
          'character_end_times_seconds': [marks[i + 1][1] if i + 1 < len(marks) else dur for i in range(len(marks))]}
    json.dump({'text': spec['text'], 'voice': 'Yun', 'voice_id': voice_id('Yun'), 'model': 'eleven_multilingual_v2',
               'speed': 1, 'duration': dur, 'spliced_from': [[p[0], p[1], p[2]] for p in spec['pieces']],
               'sources_by_char': [[m[0], m[2]] for m in marks], 'alignment': al},
              open(ROOT + 'audio/%s.json' % name, 'w'), ensure_ascii=False, indent=1)
    print(name, '%.2f s' % dur, ' '.join('%s%.2f' % (m[0], m[1]) for m in marks))


if __name__ == '__main__':
    for k in (sys.argv[1:] or SPECS):
        build(k, SPECS[k])
