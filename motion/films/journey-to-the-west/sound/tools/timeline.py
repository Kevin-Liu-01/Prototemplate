#!/usr/bin/env python3
"""The v2 film's timeline (SCRIPT-v2.md), computed from the takes.

Every narrator take is placed by its own .json word timings (el.mjs line, the
with-timestamps endpoint) and never sped, slowed or stretched. A clip starts at
the take's first sample. The gaps between lines are SCRIPT-v2.md's planned
gaps, and a cut or a line waits where a picture's reading floor
((words / 3) + 1 s) or one of SCRIPT-v2's holds needs the time, so the gaps and
holds absorb the difference between Frederick Surrey's pace and the plan.

The reader's two lines (SCRIPT-v2 lines 7 and 8) are the same clip, r04g cut
1.24 to 2.02 s (bimawen), played twice: 弼馬溫 and 避馬瘟 are the same sound.

Every visual event the builders (lib/s1.js to lib/s8.js) and the effects cue
sheet (cues.py) use is named here and written once:
    data/events.js      window.JW_EVENTS, read by the builders
    sound/events.json   the same table, read by cues.py and manifest.py

    python3 sound/tools/timeline.py          prints the table and writes both files
"""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from audio_util import load, rms_db  # noqa: E402

S = os.path.dirname(HERE)
FILM = os.path.dirname(S)
SR = 48000

# Narrator takes, by SCRIPT-v2 line. A retake replaces the take name here.
TAKES = {1: 'v01', 2: 'v02', 3: 'v03', 4: 'v04', 5: 'v05', 6: 'v06', 9: 'v09', 10: 'v10', 11: 'v11', 12: 'v12', 13: 'v13', 14: 'v14'}
READER = dict(src='r04g', cut=(1.24, 2.02))
# The reader's syllables in the cut clip (sound/NOTES.md: pitch track and level envelope).
R_SYL = [('弼', 0.03, 0.18), ('馬', 0.18, 0.48), ('溫', 0.48, 0.73)]
R_LEN = READER['cut'][1] - READER['cut'][0]

# Cuts and the end sit on the 60 fps frame grid.
def fr(t):
    return round(round(t * 60) / 60, 4)


# Reading floor: (words / 3) + 1 s.
def floor(words):
    return words / 3 + 1


_cache = {}


def speech(take):
    """(first sound, last sound) of a take in seconds: 10 ms frames above -45 dBFS,
    the last sound ending where the level stays under -50 dBFS for 150 ms after
    the last word starts (so a blip of the --next text after a silence is left out)."""
    if take in _cache:
        return _cache[take]
    x = load(os.path.join(S, 'takes', take + '.mp3'), SR)
    d = rms_db(x, SR, 0.01)
    on = np.nonzero(d > -45)[0]
    first = on[0] * 0.01
    last_word = words(take)[-1][1]
    i = int(last_word / 0.01)
    quiet = 0
    end = None
    while i < len(d):
        if d[i] < -50:
            quiet += 1
            if quiet >= 15:
                end = (i - quiet + 1) * 0.01
                break
        else:
            quiet = 0
        i += 1
    if end is None:
        end = len(d) * 0.01
    _cache[take] = (round(first, 2), round(end, 2))
    return _cache[take]


def words(take):
    """[(word, start, end)] from the take's own alignment, punctuation stripped."""
    a = json.load(open(os.path.join(S, 'takes', take + '.json')))['alignment']
    out, w, ws, we = [], '', None, None
    for c, s0, e0 in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if c == ' ':
            if w:
                out.append((w, ws, we))
            w = ''
            continue
        if not (c.isalnum() or c in "'-"):
            continue
        if not w:
            ws = s0
        w += c
        we = e0
    if w:
        out.append((w, ws, we))
    return [(t, round(s0, 3), round(e0, 3)) for t, s0, e0 in out]


def build():
    clips = {}   # line -> dict(id, take, at, cut_out)
    E = {}

    def place(line, speech_start):
        take = TAKES[line]
        f, l = speech(take)
        at = round(speech_start - f, 3)
        clips[line] = dict(id=take, line=line, take=take, at=at, first=at + f, last=at + l, cut=round(l + 0.12, 3))
        return clips[line]

    def W(line, word, n=1):
        c = clips[line]
        k = 0
        for t, s0, e0 in words(c['take']):
            if t.lower() == word.lower():
                k += 1
                if k == n:
                    return round(c['at'] + s0, 3)
        raise KeyError((line, word, n))

    def Wend(line, word, n=1):
        c = clips[line]
        k = 0
        for t, s0, e0 in words(c['take']):
            if t.lower() == word.lower():
                k += 1
                if k == n:
                    return round(c['at'] + min(e0, c['last'] - c['at']), 3)
        raise KeyError((line, word, n))

    # ---- s1 · the title column (line 1) -----------------------------------
    c1 = place(1, 0.40 + speech(TAKES[1])[0])
    c1['at'] = 0.40  # SCRIPT-v2: the take starts at 0.40
    c1['first'] = 0.40 + speech(TAKES[1])[0]
    c1['last'] = 0.40 + speech(TAKES[1])[1]
    E['s1.box'] = 0.40
    E['s1.type'] = 0.90
    E['s1.lower'] = 1.00
    E['s1.journey'] = W(1, 'novel')                 # "Journey to the West" typed from "novel"
    # ---- s2 · the naming passage and the surname (lines 1 to 3) -------------
    E['cut.s2'] = fr(W(1, 'surname') - 0.05)  # cut on "surname"
    E['s2.boxHu'] = W(1, 'macaque')
    E['s2.boxSun'] = round(W(1, 'macaque') + 0.25, 3)
    E['s2.land'] = round(W(1, 'macaque') + 0.70, 3)
    E['s2.fall'] = round(W(1, 'animal') - 0.10, 3)    # the scan falls on "animal"
    E['s2.travel'] = round(W(1, 'animal') + 0.30, 3)  # 猢猻 travels to the middle (0.9 s)
    E['s2.macaque'] = round(E['s2.travel'] + 0.95, 3)
    c2 = place(2, c1['last'] + 0.35)
    E['s2.lift'] = W(2, 'animal')                     # the animal radical lifts (0.6 s, second 0.06 later)
    E['s2.aside'] = max(W(2, 'second'), round(E['s2.lift'] + 0.70, 3))   # 胡 set aside, 孫 to the centre (0.8 s)
    E['s2.open'] = max(W(2, 'leaves'), round(E['s2.aside'] + 0.82, 3))   # 孫 opens into 子 and 系 (0.8 s)
    E['s2.boy'] = max(W(2, 'boy'), round(E['s2.open'] + 0.60, 3))
    E['s2.infant'] = max(W(2, 'infant'), round(E['s2.boy'] + 0.30, 3))
    E['s2.close'] = max(W(2, 'so'), round(E['s2.infant'] + 0.80, 3))     # 子 and 系 close into 孫 (0.9 s)
    E['s2.leave'] = round(E['s2.close'] + 0.45, 3)    # the set-aside parts leave (0.5 s)
    E['s2.sun'] = W(2, 'soon')                        # "Sun" typed on the word (spoken Soon)
    c3 = place(3, c2['last'] + 0.32)
    E['s2.tag'] = W(3, 'arthur')                      # ARTHUR WALEY, 1942 rises under "Sun"
    E['s2.hair'] = W(3, 'footnote')                   # a hairline draws right from "Sun"
    E['s2.monkey'] = W(3, 'monkey')                   # "Monkey" typed at the hairline's end
    # The label "footnote" under it is typed with "Monkey" (fix round), so both
    # words have their reading floor before the cut back to the title card.
    E['s2.footnote'] = E['s2.monkey']
    # ---- s3 · the title card (line 4) -----------------------------------------
    E['cut.s3'] = fr(max(c3['last'] + 0.54, E['s2.monkey'] + floor(2)))
    c4 = place(4, E['cut.s3'] + 0.10)
    E['s3.lines'] = round(E['cut.s3'] + 0.05, 3)      # "translated by Arthur Waley", "London, 1942" rise
    E['s3.monkey'] = W(4, 'monkey')                   # "Monkey" typed at 210 px
    E['s3.hair'] = round(E['s3.monkey'] + 0.50, 3)    # its hairline runs to the box
    # ---- s4 · the contents (line 5) ---------------------------------------------
    t5 = TAKES[5]
    thirty = [s0 for t, s0, e0 in words(t5) if t == 'thirty'][0]
    f5 = speech(t5)[0]
    cut4 = max(c4['last'] + 0.49 + (thirty - f5), E['cut.s3'] + 0.05 + floor(7), E['s3.monkey'] + floor(1))
    c5 = place(5, cut4 - thirty + f5)
    E['cut.s4'] = fr(cut4)                      # cut on "thirty"
    E['s4.fall'] = round(E['cut.s4'] + 0.05, 3)       # 70 columns, 10 ms apart, 0.3 s each
    E['s4.fallEnd'] = round(E['s4.fall'] + 69 * 0.010 + 0.3, 3)
    # ---- s5 · the woodcut (line 6) -------------------------------------------
    E['cut.s5'] = fr(max(c5['last'] + 1.16, E['cut.s4'] + floor(4), E['s4.fallEnd'] + floor(3)))
    c6 = place(6, E['cut.s5'] + 0.10)
    # ---- s6 · the chapter 4 text (lines 7 to 10) -------------------------------
    E['cut.s6'] = fr(max(c6['last'] + 0.30, E['cut.s5'] + floor(12)))
    r7 = round(E['cut.s6'] + 0.02, 3)
    clips[7] = dict(id='r07', line=7, take=READER['src'], at=r7, first=r7 + R_SYL[0][1], last=r7 + R_SYL[-1][2], cut=READER['cut'])
    E['s6.box'] = round(r7 + R_SYL[0][1], 3)          # the box draws on the reader's 弼
    E['s6.land'] = round(r7 + 0.40, 3)
    E['s6.lower'] = round(r7 + 0.80, 3)
    E['s6.travel'] = round(r7 + 0.85, 3)              # 弼馬溫 to the top row (溫 first, 弼 last; 0.6 s in all)
    E['s6.drop'] = round(r7 + 1.45, 3)                # a copy drops to the bottom row (0.35 s)
    E['s6.swap'] = round(r7 + 1.75, 3)                # the swap (0.5 s in all)
    E['s6.syll'] = round(r7 + 2.00, 3)                # bì mǎ wēn between the rows
    r8 = round(r7 + 2.30, 3)
    clips[8] = dict(id='r08', line=8, take=READER['src'], at=r8, first=r8 + R_SYL[0][1], last=r8 + R_SYL[-1][2], cut=READER['cut'])
    c9 = place(9, r8 + R_LEN + 0.32)
    E['s6.ward'] = W(9, 'ward')                       # "ward off horse plague" typed on the words
    c10 = place(10, c9['last'] + 0.33)
    E['s6.manual'] = round(c9['last'] - 0.05, 3)      # the horse manual's line, and its credit (0.1 s later)
    E['s6.macaque'] = W(10, 'macaque')                # a box round 母猴, "macaque" typed under it
    E['s6.job'] = W(10, 'job')                        # the hairline from that box to the 弼馬溫 row
    # ---- s7 · 心猿 and Hu Shih (lines 11 and 12) --------------------------------
    E['cut.s7'] = fr(max(c10['last'] + 0.68, E['s6.manual'] + 0.1 + floor(9), E['s6.macaque'] + floor(1)))
    c11 = place(11, E['cut.s7'] + 0.10)
    E['s7.box'] = W(11, 'chapter')                    # a box round 心猿 on "chapter titles"
    E['s7.land'] = round(E['s7.box'] + 0.45, 3)
    E['s7.fall'] = round(E['s7.box'] + 0.70, 3)
    E['s7.row'] = round(E['s7.box'] + 0.80, 3)        # 心猿 turns into a row where it stands (0.6 s)
    E['s7.mind'] = round(max(W(11, 'mind-monkey'), E['s7.row'] + 0.5), 3)
    E['cut.s7b'] = fr(c11['last'] + 0.38)       # cut to Hu Shih; 心猿 stays
    c12 = place(12, E['cut.s7b'] + 0.10)
    E['s7.name'] = W(12, 'hu')                        # "胡適 Hu Shih" on his name
    E['s7.intro'] = W(12, 'introduced')               # "introduction to Monkey, New York, 1943"
    # ---- s8 · the close (lines 13 and 14) ---------------------------------------
    E['cut.s8'] = fr(max(c12['last'] + 0.39, E['s7.intro'] + floor(6), E['cut.s7b'] + floor(7)))
    c13 = place(13, E['cut.s8'] + 0.10)
    E['s8.waley'] = round(E['cut.s8'] + 0.10, 3)      # WALEY, 1942 rises on "Waley's"
    E['s8.monkey'] = W(13, 'monkey')
    E['s8.pigsy'] = W(13, 'pigsy')
    E['s8.sandy'] = W(13, 'sandy')
    E['s8.tripitaka'] = W(13, 'tripitaka')
    c14 = place(14, c13['last'] + 0.32)
    E['s8.lovell'] = W(14, 'julia')                   # LOVELL, 2021 and her four names
    E['s8.kept'] = W(14, 'kept')                      # one box round both rows
    E['s8.last'] = W(14, 'monkey')                    # a box round the two "Monkey" entries
    # The close holds 1.2 s while the bed resolves; the end is rounded up to a
    # whole 0.05 s, so the film is a whole number of frames written exactly.
    E['end'] = round(np.ceil(round((c14['last'] + 1.22) * 20, 6)) / 20, 2)
    return clips, E


def main():
    clips, E = build()
    order = sorted(clips.values(), key=lambda c: c['at'])
    print('clips:')
    prev = None
    for c in order:
        gap = '' if prev is None else f'  gap {c["first"] - prev["last"]:5.2f}'
        print(f'  line {c["line"]:2d} {c["id"]:4s} take {c["take"]:5s} at {c["at"]:7.3f}  sound {c["first"]:7.3f} to {c["last"]:7.3f}{gap}')
        prev = c
    print('events:')
    for k, v in sorted(E.items(), key=lambda kv: kv[1]):
        print(f'  {v:8.3f}  {k}')
    words_film = {}
    for c in order:
        if c['line'] in (7, 8):
            words_film[c['id']] = [{'w': t, 's': round(c['at'] + a, 3), 'e': round(c['at'] + b, 3)} for t, a, b in R_SYL]
        else:
            words_film[c['id']] = [{'w': t, 's': round(c['at'] + a, 3), 'e': round(c['at'] + min(b, c['last'] - c['at']), 3)} for t, a, b in words(c['take'])]
    out = {'duration': E['end'], 'events': E, 'clips': order, 'words': words_film}
    json.dump(out, open(os.path.join(S, 'events.json'), 'w'), indent=1, ensure_ascii=False)
    with open(os.path.join(FILM, 'data', 'events.js'), 'w') as fh:
        fh.write('/* Generated by sound/tools/timeline.py from the takes\' own word timings: every visual event of the v2 film, in film seconds. */\n')
        fh.write('window.JW_EVENTS = ')
        json.dump(E, fh, separators=(',', ':'), sort_keys=True)
        fh.write(';\n')
    print('duration', E['end'])


if __name__ == '__main__':
    main()
