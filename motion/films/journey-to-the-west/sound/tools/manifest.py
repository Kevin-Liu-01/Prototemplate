#!/usr/bin/env python3
"""Writes sound/manifest.json: every clip's file, its start on the film's
timeline, its duration, its source take and its word timings (from the take's
own .json alignment for the narrator; measured syllables for the reader),
plus the bed, the effects cue sheet, the scenes and the measured loudness.
v2 build (SCRIPT-v2.md): the starts come from tools/timeline.py; the 100 s
cut's manifest is archive-100s/sound/manifest.json.

    python3 sound/tools/manifest.py
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from plan import BEATS, CLIPS, DURATION, R_SYLLABLES, R_TEXT, SR, spans  # noqa: E402
from cues import cues, CUTS  # noqa: E402
from build_mix import BAR, SECTIONS, FADE_OUT_AT, DUCK_DB, RAMP, HOLD_GAP, ROOM_AT, ROOM_TO, ROOM_DB, ROOM_FADE  # noqa: E402

S = os.path.dirname(HERE)
FILM = os.path.dirname(S)


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p],
                                capture_output=True, text=True).stdout)


def words_of(take, upto):
    j = json.load(open(os.path.join(S, 'takes', take + '.json')))
    a = j['alignment']
    out, w, ws, we = [], '', None, None
    for c, a0, a1 in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if c == ' ':
            if w:
                out.append((w, ws, we))
            w = ''
            continue
        if not (c.isalnum() or c in "'-"):
            continue
        if not w:
            ws = a0
        w += c
        we = a1
    if w:
        out.append((w, ws, we))
    return j, [(t.strip('.,"'), s, min(e, upto)) for t, s, e in out if s < upto]


def main():
    lines = {L['id']: L for L in json.load(open(os.path.join(S, 'lines.json')))['lines']}
    measure = json.load(open(os.path.join(S, 'mix', 'measure.json')))
    ext = {i: (a, b) for i, a, b in measure['voice_extents']}
    clips = []
    for c in CLIPS:
        f = os.path.join(S, 'vo', c['id'] + '.wav')
        d = round(dur(f), 4)
        L = lines[c['id']]
        item = {
            'id': c['id'],
            'who': 'narrator' if c['who'] == 'N' else 'reader',
            'file': 'sound/vo/' + c['id'] + '.wav',
            'start': c['at'],
            'duration': d,
            'end': round(c['at'] + d, 4),
            'first_sound': round(ext[c['id']][0], 2),
            'last_sound': round(ext[c['id']][1], 2),
            'text': L['sub'],
            'source': [{'take': 'sound/takes/' + src + '.mp3', 'in': a, 'out': b, 'gain_db': g} for src, a, b, g in spans(c)],
        }
        if c['who'] == 'N':
            j, ws = words_of(c['src'], c['cut'][1])
            item['voice'] = j['voice'] + ' ' + j['voice_id']
            item['model'] = j['model']
            item['spoken_as'] = j['text']
            item['words'] = [{'word': t, 'start': round(s, 3), 'end': round(e, 3),
                              'film_start': round(c['at'] + s, 3), 'film_end': round(c['at'] + e, 3)} for t, s, e in ws]
            item['timing_source'] = 'the take\'s own .json alignment (el.mjs line, with-timestamps endpoint)'
        else:
            srcs = sorted({s for s, *_ in spans(c)})
            j = json.load(open(os.path.join(S, 'takes', srcs[0] + '.json')))
            item['voice'] = 'Yun ' + j['voice_id']
            item['model'] = j['model']
            item['spoken_as'] = ' + '.join(json.load(open(os.path.join(S, 'takes', s + '.json')))['text'] for s in srcs)
            item['text'] = R_TEXT[c['id']]
            item['words'] = [{'word': t, 'start': s, 'end': e, 'film_start': round(c['at'] + s, 3), 'film_end': round(c['at'] + e, 3)}
                             for t, s, e in R_SYLLABLES[c['id']] if t != '、']
            item['timing_source'] = 'measured from the cut clip (pitch track and level envelope); the alignment of a Mandarin take is not used'
            item['native_listener'] = 'must approve before the final (NOTES.md)'
        clips.append(item)
    bed = os.path.join(S, 'music', 'bed.wav')
    out = {
        'film': 'journey-to-the-west',
        'duration': DURATION,
        'sample_rate': SR,
        'how_to_play': ('Every file below is mastered for the film: place each voice clip as an <audio> clip at its start, '
                        'volume 1; the bed at 0, volume 1 (its ducking and fades are already in the file); the effects '
                        'either as the one stem sound/mix/effects.wav at 0, volume 1, or cue by cue at the gains given. '
                        'Do not change any clip\'s speed. sound/mix/draft-mix.wav is the offline sum of the three, for reference.'),
        'script': 'SCRIPT-v2.md',
        'scenes': [{'scene': b, 'start': a, 'end': e} for b, a, e in BEATS],
        'cuts': CUTS,
        'clips': clips,
        'music': {
            'file': 'sound/music/bed.wav', 'start': 0.0, 'duration': round(dur(bed), 4),
            'source': 'sound/music/bed.take2.mp3 (ElevenLabs Music API, music_v1, 100 s asked, 100.02 s returned; prompt in bed.take2.prompt.txt); re-cut for v2, no new music generated',
            'sections': [{'film_start': round(at, 4), 'take_in': round(a, 4), 'take_out': round(b, 4), 'fade_in': fi, 'fade_out': fo}
                         for at, a, b, fi, fo in SECTIONS],
            'bar_s': round(BAR, 6),
            'note': ('the take cut to the v2 story on its own bar lines (tools/build_mix.py): the opening bars and two statements from the title '
                     'to the cut to the chapter 4 text (the take\'s bar line on that cut), no music under the reader\'s two readings and lines 9 and 10, '
                     'then from the cut to the mind-monkey the opening figure again and the take\'s own last statement (its downbeat on the cut to the close) '
                     'and held A, which resolves into the last frame'),
            'level': 'the take at -3.7 dB (-20 LUFS alone played straight), ducked %d dB under speech' % abs(DUCK_DB),
            'duck': {'depth_db': DUCK_DB, 'ramp_s': RAMP, 'held_through_gaps_under_s': HOLD_GAP, 'spans': measure['duck_spans']},
            'fade_out': {'at': FADE_OUT_AT, 'length': round(DURATION - FADE_OUT_AT, 2)},
        },
        'effects': {
            'stem': 'sound/mix/effects.wav',
            'files': {k: 'sound/sfx/' + k + '.wav' for k in ['tap', 'slide', 'grain', 'tick-a', 'tick-b', 'tick-c']},
            'note': 'placed from the composition\'s own event times (sound/events.json, written by tools/timeline.py with data/events.js)',
            'cues': [{'t': t, 'file': f, 'gain_db': g} for t, f, g in cues()],
            'room_tone': {'start': ROOM_AT, 'end': ROOM_TO, 'rms_dbfs': ROOM_DB, 'fade_s': ROOM_FADE,
                          'note': 'seeded 1/f noise, 60 Hz to 8 kHz, two channels, written into the stem by tools/build_mix.py where the bed rests, so the sound never falls to digital zero'},
        },
        'reference_mix': {'file': 'sound/mix/draft-mix.wav', 'loudness': measure['loudness']},
    }
    dest = os.path.join(S, 'manifest.json')
    json.dump(out, open(dest, 'w'), indent=1, ensure_ascii=False)
    print(f'{dest}: {len(clips)} clips, {len(out["effects"]["cues"])} effect cues')


if __name__ == '__main__':
    main()
