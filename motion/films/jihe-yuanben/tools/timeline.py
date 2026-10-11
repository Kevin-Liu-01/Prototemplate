"""The film's timeline, from the takes (v2, SCRIPT-v2.md).

Each spoken line is placed by its speech start (S, film seconds); a take's
clip starts S minus the take's own lead-in, so the words land where the plan
says. Everything the picture keys to a word or a character (cuts, rings,
reading circles, subtitles) is read from the takes' alignments here and
written to lib/cues.js (window.JYCUES) for the composition and to
audio/cues.json for the mix. Beat 5's schedule (Liu Hui's figure) is also
written into tools/beat6/plan.json for tools/beat6/embed.py.

   python3 tools/timeline.py           the plan
   python3 tools/timeline.py --subs    the subtitle table as JSON, for tools/subwidth.mjs

SCRIPT-v2's gaps: 0.3 s between lines in a shot, 0.2 s from a line's end to
a cut and from a cut to the next line (0.4 s around a cut), a 0.6 s lamp rise,
the holds it names (the two credit rings, the finished strip, the closing
title), and no take is ever slowed, sped or stretched.
"""
import json
import re
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from audio_util import load, rms_db

ROOT = __file__.rsplit('/', 2)[0] + '/'
FPS = 60

GAP = 0.3         # between two lines in one shot
CUT = 0.2         # a line's end to a cut, and a cut to the next line
LAMP = 0.6        # the lamp's rise from black before the first line
HOLD_RINGS = 0.5  # the two credit rings side by side (SCRIPT-v2 line 6; floor 0.2)
HOLD_STRIP = 0.95 # the finished strip (line 9). SCRIPT-v2 says 0.4 (floor 0.2); the
                  # v2 critic found the measures complete for only 0.4 s, so the
                  # fix round holds them 0.95 s (round 8: 1.25; 0.95 keeps the gap
                  # from line 9 to line 10 under 1.6 s) and takes the time back
                  # from the closing hold (NOTES.md, v2 fix round)
HOLD_END = 0.4    # after the closing stop (line 17): SCRIPT-v2's floor (it says 0.75)
STEMS_GAP = 0.35  # line 12 to the Stems
CREDIT_GAP = 0.45 # the gap in which the read light moves to Xu's column

# Beat 5 (Liu Hui's figure), round 8's design on line 9's words. The
# demonstration (0.95 s), the rest (0.25 s), the measures (0.25 s) and the
# colours' 0.4 s are round 8's; the print-in keeps round 8's 0.12 s steps
# (SCRIPT-v2 allows 0.10; NOTES.md, v2 build). v2 fix round: the colours come
# one to a phrase of the line's subject, 朱 on "commentary", 青 on "sixty-three"
# (263), 黃 on "justified", so the shot no longer lies still from its cut to
# "justified" (2.9 s in the first v2 build); with them the camera makes a slow
# push from the cut onto round 8's end framing, landing on "cutting".
B6 = {'colour': 0.4, 'demoLead': 0.08, 'demo': 0.95, 'rest': 0.25, 'gap': 0.12, 'reveal': 0.10, 'measure': 0.25}
COLOUR_WORDS = ['commentary', 'sixty-three', 'justified']

LINES = {l['id']: l for l in json.load(open(ROOT + 'tools/lines.json'))['lines']}
TAKE = {k: l.get('take', k) for k, l in LINES.items()}
# The take used for a line when it is not the first take (NOTES.md, the ledger).
TAKE.update({})


def take_file(t):
    w = ROOT + 'audio/%s.wav' % t
    try:
        open(w).close()
        return w
    except OSError:
        return ROOT + 'audio/%s.mp3' % t


def measure(t):
    """Speech start and end inside the take (s0, s1), and the clip length to
    use (trimmed of the end-of-take blips some takes carry)."""
    x = load(take_file(t), 48000)
    d = rms_db(x, 48000, 0.005)
    on = np.nonzero(d > -48)[0]
    segs = []
    s = p = on[0]
    for i in on[1:]:
        if (i - p) * 0.005 > 0.06:
            segs.append([s * 0.005, (p + 1) * 0.005])
            s = i
        p = i
    segs.append([s * 0.005, (p + 1) * 0.005])
    L = len(x) / 48000
    if len(segs) > 1 and segs[-1][1] - segs[-1][0] < 0.12 and L - segs[-1][1] < 0.03:
        segs = segs[:-1]
    s0, s1 = segs[0][0], segs[-1][1]
    clip = min(L, s1 + 0.12)
    return s0, s1, clip


def words_of(t, text=''):
    """English: each word's start and end in the take, from the take's own
    character alignment."""
    j = json.load(open(ROOT + 'audio/%s.json' % t))
    a = j['alignment']
    ch = a['characters']
    st = a['character_start_times_seconds']
    en = a['character_end_times_seconds']
    s = ''.join(ch)
    out = []
    for m in re.finditer(r"[A-Za-z0-9'’\-]+", s):
        out.append((m.group(0), st[m.start()], en[m.end() - 1]))
    return out


def chars_of(t):
    j = json.load(open(ROOT + 'audio/%s.json' % t))
    a = j['alignment']
    return [(c, s) for c, s in zip(a['characters'], a['character_start_times_seconds']) if '一' <= c <= '鿿']


def floor(text):
    """SCRIPT-v2's reading floor: (words / 3) + 1 s. The printed Chinese set
    before the English translation of a Mandarin line is not counted."""
    t = re.sub(r'<span class="zh"[^>]*>[^<]*</span>&ensp;', ' ', text)
    t = re.sub(r'&[a-z]+;', ' ', re.sub(r'<[^>]+>', ' ', t))
    n = len(re.findall(r"[A-Za-z0-9'’]+|[一-鿿]+", t))
    return n / 3 + 1


ZH = '<span class="zh" lang="zh-Hant">%s</span>&ensp;'
# The subtitle lines (SCRIPT-v2, the spoken column), in the order they are heard.
SUB = {
    'en01': 'This title begins with the Chinese word for geometry.',
    'en02': 'It is often said to copy the sound of <i>geo</i>.',
    'en03': 'In 1606 two men in Beijing began to translate Euclid’s geometry.',
    'en04': 'Only one of them could read Latin.',
    'zh2': ZH % '泰西利瑪竇口譯' + 'Matteo Ricci translated by mouth.',
    'zh3': ZH % '吳淞徐光啓筆受' + 'Xu Guangqi wrote it down with the brush.',
    'en07': 'Chinese mathematics was written as questions, such as how large a field 15 paces by 16 is.',
    'en08': 'That question ends with the title’s first two characters.',
    # two rows set by hand, so the break falls between the clauses' phrases
    # (text-wrap: balance broke it inside "those / methods")
    'en09': 'A commentary written in 263 CE justified those methods<br>by cutting figures apart and reassembling them.',
    'en10': 'Euclid never asks a question, and he defines every object first.',
    'en11': 'Chinese had no word for definition, so Ricci and Xu made one meaning “an account of boundaries.”',
    'en12': 'A, B and C were only sounds, so they used a series every literate reader could recite.',
    # v2 fix round: five words (floor 2.67 s), so the gloss clears on the cut
    # to the Nine Chapters page and never stands over "Those two characters"
    'zh6': ZH % '甲 乙 丙 丁' + 'These are four Heavenly Stems.',
    'en14': 'Those two characters were the ordinary word for “how much.”',
    'en15': 'Ricci and Xu used them to mean quantity.',
    'en16': 'For 250 years Chinese readers had only six of Euclid’s books, all on plane geometry.',
    'en17': 'So the word for “how much” came to mean geometry.',
}
# Rows of the two-row bar each line takes, measured in the bar's own type by
# tools/subwidth.mjs (1480 px line).
ROWS = json.load(open(ROOT + 'tools/subrows.json')) if __import__('os').path.exists(ROOT + 'tools/subrows.json') else {}
LEAD = 0.1  # a narrator's subtitle appears this long before the voice


def main():
    if '--subs' in sys.argv:
        print(json.dumps(SUB, ensure_ascii=False))
        return
    plan = []
    beats = []

    def line(i, S):
        t = TAKE[i]
        s0, s1, clip = measure(t)
        e = {'id': i, 'take': t, 'who': LINES[i]['who'], 'S': round(S, 3), 'E': round(S + s1 - s0, 3),
             'clipStart': round(S - s0, 3), 'clipDur': round(clip, 3), 'text': LINES[i]['text']}
        if LINES[i]['who'] == 'N':
            e['words'] = [[w, round(e['clipStart'] + a, 3), round(e['clipStart'] + b, 3)] for w, a, b in words_of(t)]
        else:
            e['chars'] = [[c, round(e['clipStart'] + a, 3)] for c, a in chars_of(t)]
        plan.append(e)
        return e

    def after(e, gap=GAP):
        return e['E'] + gap

    def W(e, w, n=0):
        return [x for x in e['words'] if x[0].lower() == w.lower()][n]

    def sub_start(e):
        return e['S'] - (LEAD if e['who'] == 'N' else 0.0)

    def settle(b, e, most=0.5):
        """A line whose reading floor runs only a little past its shot's cut
        (under most s) holds the shot to its floor instead of carrying into
        the next shot for a moment."""
        over = sub_start(e) + floor(SUB[e['id']]) - b['end']
        if 0 < over < most:
            b['end'] += over

    def beat(n, start):
        b = {'n': n, 'start': start}
        beats.append(b)
        return b

    # 1. The title column (from black: the lamp rises in 0.6 s)
    b = beat(1, 0.0)
    a = line('en01', LAMP)
    a = line('en02', after(a))
    b['end'] = a['E'] + CUT
    settle(b, a)
    # 2. The Kircher plate: both men, then the lamp finds Ricci on "one"
    b = beat(2, b['end'])
    a = line('en03', b['start'] + CUT)
    a = line('en04', after(a))
    b['end'] = a['E'] + CUT
    settle(b, a)
    # 3. The credit columns: 泰西利瑪竇口譯 and 吳淞徐光啓筆受, then the two rings held
    b = beat(3, b['end'])
    z2 = line('zh2', b['start'] + CUT)
    z3 = line('zh3', after(z2, CREDIT_GAP))
    ringX = z3['chars'][5][1] + 0.72  # 筆受's ring, drawn from 筆 in 0.72 s
    b['end'] = max(z3['E'] + CUT, ringX + HOLD_RINGS)
    # 4. The Nine Chapters page
    b = beat(4, b['end'])
    a = line('en07', b['start'] + CUT)
    a = line('en08', after(a))
    # line 9's subtitle takes both rows, so this line has to have had its
    # reading floor by the cut: the ring on 幾何 holds for it
    b['end'] = max(a['E'] + CUT, sub_start(a) + floor(SUB['en08']))
    # 5. Liu Hui's figure (round 8's design on line 9's words)
    b = beat(5, b['end'])
    a9 = line('en09', b['start'] + CUT)
    tCut = W(a9, 'cutting')[1]
    d0 = tCut + B6['demoLead']
    land = d0 + B6['demo']
    p0 = land + B6['rest']
    m0 = p0 + 10 * B6['gap'] + B6['reveal']
    m1 = m0 + B6['measure']
    b['end'] = max(a9['E'] + CUT, m1 + HOLD_STRIP)
    b6 = {'colours': [round(W(a9, w)[1], 4) for w in COLOUR_WORDS], 'colourDur': B6['colour'], 'cut': round(tCut, 4), 'demo': round(d0, 4),
          'land': round(land, 4), 'print': round(p0, 4), 'gap': B6['gap'], 'measure': round(m0, 4), 'measureDur': B6['measure'], 'hold': round(b['end'] - m1, 3)}
    # 6. Clavius's DEFINITIONES
    b = beat(6, b['end'])
    a = line('en10', b['start'] + CUT)
    b['end'] = a['E'] + CUT
    settle(b, a)
    # 7. The 界說 slip
    b = beat(7, b['end'])
    a = line('en11', b['start'] + CUT)
    b['end'] = a['E'] + CUT
    settle(b, a)
    # 8. A, B, C hand off to 甲乙丙丁 (two shots, the cut on "so")
    b = beat(8, b['end'])
    a = line('en12', b['start'] + CUT)
    z6 = line('zh6', after(a, STEMS_GAP))
    tSink = z6['chars'][3][1] + 0.35  # after 丁's ring (0.3 s) and its letter's sink (0.25 s)
    b['end'] = max(z6['E'] + CUT, tSink + 0.5 + 0.2)
    # the gloss clears on the cut: the four rings hold for it (the same rule
    # as settle(), so it never carries for a moment over the next shot)
    settle(b, z6)
    b['sink'] = round(tSink, 4)
    # 9. 幾何 on both books
    b = beat(9, b['end'])
    a = line('en14', b['start'] + CUT)
    a = line('en15', after(a))
    a = line('en16', after(a))
    b['end'] = a['E'] + CUT
    settle(b, a)
    # 10. The closing title: line 17, its subtitle to its floor, the stop, the hold
    b = beat(10, b['end'])
    a17 = line('en17', b['start'] + CUT)
    sub17 = sub_start(a17) + floor(SUB['en17'])
    tStop = sub17
    b['stop'] = round(tStop, 4)
    b['end'] = tStop + 0.3 + HOLD_END
    b['lineEnd'] = a17['E']

    # Cuts on the 60 fps frame grid.
    for bb in beats:
        bb['start'] = round(round(bb['start'] * FPS) / FPS, 4)
        bb['end'] = round(round(bb['end'] * FPS) / FPS, 4)
    # the film ends on a 0.05 s step (a whole number of frames at 60 fps, and of 20 ms)
    beats[-1]['end'] = round(np.ceil(beats[-1]['end'] * 20 - 1e-6) / 20, 4)
    DUR = beats[-1]['end']

    # The subtitle plan: lines roll up through a two-row bar. A line leaves at
    # its beat's cut, unless its reading floor runs past the cut: then it
    # carries over into the next shot (SCRIPT-v2 line 6) until its floor, and
    # rolls up as the next line comes in. A line also leaves when a newer one
    # needs its row. The last line holds to its floor and clears for the stop.
    byid = {e['id']: e for e in plan}
    beat_of = {}
    for bb, ids in zip(beats, [['en01', 'en02'], ['en03', 'en04'], ['zh2', 'zh3'], ['en07', 'en08'], ['en09'], ['en10'], ['en11'],
                               ['en12', 'zh6'], ['en14', 'en15', 'en16'], ['en17']]):
        for i in ids:
            beat_of[i] = bb
    subs = []
    for sid in SUB:
        e = byid[sid]
        bb = beat_of[sid]
        t0 = max(bb['start'], sub_start(e))
        fl = floor(SUB[sid])
        end = max(bb['end'], t0 + fl) if sid != 'en17' else round(sub17, 3)
        subs.append({'id': sid, 'beat': bb['n'], 't0': round(t0, 3), 't1': round(end, 3), 'rows': ROWS.get(sid, {}).get('rows', 1),
                     'html': SUB[sid], 'floor': round(fl, 2)})
    # a newer line that needs a row pushes the oldest out
    for i, s_ in enumerate(subs):
        live = [x for x in subs[:i] if x['t1'] > s_['t0'] + 1e-6]
        while live and sum(x['rows'] for x in live) + s_['rows'] > 2:
            old = live.pop(0)
            old['t1'] = s_['t0']
    short = [(x['id'], round(x['t1'] - x['t0'], 2), x['floor']) for x in subs if x['t1'] - x['t0'] < x['floor'] - 0.005]

    out = {'fps': FPS, 'duration': DUR, 'beats': beats, 'lines': plan, 'subs': subs, 'liuhui': b6}
    json.dump(out, open(ROOT + 'audio/cues.json', 'w'), ensure_ascii=False, indent=1)
    open(ROOT + 'lib/cues.js', 'w').write(
        '/* Generated by tools/timeline.py from the takes: do not edit by hand. */\nwindow.JYCUES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
    # Beat 5's schedule into the planner's plan, for tools/beat6/embed.py.
    pp = ROOT + 'tools/beat6/plan.json'
    P = json.load(open(pp))
    P['demo']['t0'] = b6['demo']
    P['demo']['dur'] = B6['demo']
    P['print']['t0'] = b6['print']
    P['print']['gap'] = B6['gap']
    P['print']['dur'] = B6['reveal']
    P['measure'] = {'t0': b6['measure'], 'dur': B6['measure']}
    P['tCamEnd'] = beats[4]['start']
    json.dump(P, open(pp, 'w'), indent=1)
    for bb in beats:
        print('beat %2d  %6.2f to %6.2f  (%.2f s)' % (bb['n'], bb['start'], bb['end'], bb['end'] - bb['start']))
    for e in plan:
        print('  %-6s %-6s S %6.2f  E %6.2f  clip %6.2f + %.2f' % (e['id'], e['take'], e['S'], e['E'], e['clipStart'], e['clipDur']))
    print('beat 5:', b6)
    print('duration %.3f' % DUR)
    for x in subs:
        print('  sub %-5s %6.2f-%6.2f hold %5.2f floor %5.2f rows %d' % (x['id'], x['t0'], x['t1'], x['t1'] - x['t0'], x['floor'], x['rows']))
    print('below the floor:', short or 'none')
    gaps = []
    sp = sorted((e['S'], e['E'], e['id']) for e in plan)
    for (s1, e1, i1), (s2, e2, i2) in zip(sp, sp[1:]):
        gaps.append((round(s2 - e1, 2), i1, i2))
    print('largest gaps between lines:', sorted(gaps, reverse=True)[:5], 'tail after the last line %.2f' % (DUR - sp[-1][1]))


if __name__ == '__main__':
    main()
