"""The film's sound plan (v2 build, SCRIPT-v2.md): every voice clip, where it
comes from, how it is cut, and where it starts on the timeline.
tools/build_vo.py, tools/build_mix.py and tools/manifest.py read this file.

The starts come from tools/timeline.py, which places every narrator take by its
own .json word timings and lets the gaps and holds absorb the difference
between the takes and SCRIPT-v2.md's plan. A narrator clip keeps its take from
0, so the take's .json timings stay valid, and is cut 0.12 s after its last
sound, before any blip of the --next text. No take is sped, slowed or
stretched. The reader's two lines are one clip, r04g cut 1.24 to 2.02 s,
played twice (弼馬溫 and 避馬瘟 are the same sound).

The 100 s cut's plan is archive-100s/sound/tools/plan.py.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from timeline import build, R_SYL, READER  # noqa: E402

SR = 48000
_clips, EVENTS = build()
DURATION = EVENTS['end']

# The scenes (sub-compositions s1 to s8) between the cuts.
_cuts = [0.0, EVENTS['cut.s2'], EVENTS['cut.s3'], EVENTS['cut.s4'], EVENTS['cut.s5'], EVENTS['cut.s6'], EVENTS['cut.s7'], EVENTS['cut.s8'], DURATION]
BEATS = [(i + 1, _cuts[i], _cuts[i + 1]) for i in range(8)]

CLIPS = []
for line in sorted(_clips):
    c = _clips[line]
    if line in (7, 8):
        CLIPS.append(dict(id=c['id'], who='R', at=c['at'], src=READER['src'], cut=READER['cut'], fin=0.01, fout=0.05))
    else:
        CLIPS.append(dict(id=c['id'], who='N', at=c['at'], src=c['take'], cut=(0.0, c['cut'])))

# The reader's syllables, measured from the cut clip (seconds from the clip's
# start) by pitch track and level envelope (sound/NOTES.md, r04g).
R_SYLLABLES = {'r07': R_SYL, 'r08': R_SYL}
# The text each reader clip stands for on screen.
R_TEXT = {'r07': '弼馬溫', 'r08': '避馬瘟'}


def spans(c):
    """The clip's source spans as (take, in, out, gain dB)."""
    s = c['cut'] if isinstance(c['cut'], list) else [c['cut']]
    return [x if len(x) == 4 else (c['src'], x[0], x[1], 0.0) for x in s]


def clip_len(c):
    s = spans(c)
    return sum(b - a for _, a, b, _ in s) - 0.010 * (len(s) - 1)
