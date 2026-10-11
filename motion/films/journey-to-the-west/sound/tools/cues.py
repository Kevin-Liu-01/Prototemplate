"""The effects cue sheet (v2 build), from the composition's own event times:
sound/tools/timeline.py names every visual event once and writes it both to
data/events.js (the builders, lib/s1.js to s8.js) and to sound/events.json
(this file), so each sound starts on the frame its move starts. Each cue is
(film time, file in sfx/, gain dB).

CONCEPT.md, The sound, Effects:
- a soft tap when type lands on print;
- a paper slide when a component lifts, a character opens or closes, type
  travels to its row, or a plate arrives;
- one long, quiet paper grain under the contents fall;
- one dry tick per typed letter, in three pitches, only for renderings and
  names typed against Chinese ("Sun" under 孫, Waley's "Monkey" for it, the
  syllables bì mǎ wēn, the two rows of names). Glosses, credits, tags, the
  title card and the horse manual's line are typed silently. A row typed
  together gets one stream of ticks at the typing rate (26 letters a second),
  not one stream per name, so it does not chatter under the narrator;
- nothing plays on a cut.

The 100 s cut's cue sheet is archive-100s/sound/tools/cues.py.
"""
import json
import os

RATE = 26.0
HERO_RATE = 14.0
TICKS = ['tick-a', 'tick-b', 'tick-c']
_EV = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'events.json')))
E = _EV['events']
CUTS = sorted(v for k, v in E.items() if k.startswith('cut.')) + [E['end']]


def stream(t0, t1, rate=RATE, gain=-24.0, seed=0):
    out = []
    n = int(round((t1 - t0) * rate))
    for i in range(n):
        t = t0 + i / rate
        out.append((round(t, 4), TICKS[(i * 7 + seed) % 3], gain))
    return out


def word(t0, text, rate=RATE, gain=-24.0, seed=0):
    out = []
    k = 0
    for i, ch in enumerate(text):
        if ch.strip():
            out.append((round(t0 + i / rate, 4), TICKS[(k * 7 + seed + len(text)) % 3], gain))
            k += 1
    return out


def column(t0, rows, stagger=0.09, rate=RATE, gain=-24.0, seed=0):
    end = max(t0 + j * stagger + len(r) / rate for j, r in enumerate(rows))
    return stream(t0, end, rate, gain, seed)


def cues():
    c = []
    tap = lambda t, g=-15.0: c.append((round(t, 4), 'tap', g))
    slide = lambda t, g=-16.0: c.append((round(t, 4), 'slide', g))
    # Scene 1: 西遊記 lands on the title column.
    tap(E['s1.type'])
    # Scene 2: 猢 and 猻 land; the word travels; the radical lifts; 胡 aside; 孫 opens; 孫 closes.
    tap(E['s2.land'])
    slide(E['s2.travel'], -19.0)
    slide(E['s2.lift'], -14.0)
    slide(E['s2.aside'], -17.0)
    slide(E['s2.open'], -16.0)
    slide(E['s2.close'], -15.0)
    c += word(E['s2.sun'], 'Sun', HERO_RATE, seed=1)          # "Sun" under 孫
    c += word(E['s2.monkey'], 'Monkey', HERO_RATE, seed=2)    # Waley's footnote, "Monkey" for Sun
    # Scene 4: the paper grain under the fall of the 70 columns.
    c.append((round(E['s4.fall'], 4), 'grain', 0.0))
    # Scene 6: 弼馬溫 lands; travels to the top row; the copy drops; the swap; bì mǎ wēn.
    tap(E['s6.land'])
    slide(E['s6.travel'], -19.0)
    slide(E['s6.drop'], -19.0)
    slide(E['s6.swap'], -14.0)
    c += column(E['s6.syll'], ['bì', 'mǎ', 'wēn'], stagger=0.0, seed=1)
    # Scene 7: 心猿 lands and turns into its row.
    tap(E['s7.land'])
    slide(E['s7.row'], -19.0)
    # Scene 8: the plates arrive; Waley's names on the words; Lovell's row as a block.
    slide(E['s8.pigsy'], -19.0)
    slide(E['s8.sandy'], -19.0)
    c += word(E['s8.monkey'], 'Monkey', seed=1)
    c += word(E['s8.pigsy'], 'Pigsy', seed=2)
    c += word(E['s8.sandy'], 'Sandy', seed=0)
    c += word(E['s8.tripitaka'], 'Tripitaka', seed=1)
    c += column(E['s8.lovell'], ['Monkey', 'Pigsy', 'Sandy', 'Tripitaka'], stagger=0.03, seed=2)
    c.sort()
    for t, _, _ in c:
        assert all(abs(t - k) > 0.02 for k in CUTS), f'effect on a cut at {t}'
    return c


if __name__ == '__main__':
    for t, f, g in cues():
        print(f'{t:7.3f}  {f:7s} {g:+.0f} dB')
