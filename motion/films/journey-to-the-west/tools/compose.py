#!/usr/bin/env python3
"""Writes index.html and compositions/s1.html to s8.html (v2 build, SCRIPT-v2.md).

index.html is thin: it loads the faces, the kit's GSAP and its two plugins,
the data (glyphs, plates, contents, and the event times of
sound/tools/timeline.py) and the scene builders, mounts the eight scenes as
sub-compositions between the cuts (each cut on the 60 fps frame grid), and
places the sound exactly as sound/manifest.json gives it: one <audio> per
voice clip at its start, the bed and the effects stem from 0, every clip at
one gain (GAIN), never re-timed; or, with PREMIX (the delivery), the same sum
as one file from tools/premix.py. Each compositions/sN.html holds its scene's
plates as static <img> elements (so the renderer waits for them) and calls
JW.mount; lib/sN.js builds the scene. The 100 s cut's eight beats are in
archive-100s/.

    python3 sound/tools/timeline.py && python3 tools/compose.py
"""
import json
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = ['c-' + k for k in ['p06L', 'p07R', 'p07L', 'p08R', 'p08L', 'p09R', 'p09L', 'p10R', 'p10L', 'p11R', 'p11L']]
EV = json.load(open(os.path.join(ROOT, 'sound', 'events.json')))
E = EV['events']
END = EV['duration']
CUTS = [0.0, E['cut.s2'], E['cut.s3'], E['cut.s4'], E['cut.s5'], E['cut.s6'], E['cut.s7'], E['cut.s8'], END]
# id, title, plates: a list, or {'a': [...], 'b': [...]} for a scene with a hard cut inside it. A plate is its
# data id, or (data id, element key) when one plate is shown in two scenes.
SCENES = [
    ('s1', 'The title column', ['title']),
    ('s2', 'The surname', ['naming']),
    ('s3', "Waley's title card", [('title', 'title-s3')]),
    ('s4', 'Thirty of a hundred', C),
    ('s5', 'The woodcut of chapter 4', ['woodcut']),
    ('s6', '弼馬溫 over 避馬瘟', ['ch4']),
    ('s7', '心猿, then Hu Shih', {'a': ['ch14'], 'b': ['hushih']}),
    ('s8', 'The names that stayed', ['r58', 'r234', 'r250']),
]


def pl(p, ind):
    i, key = (p, p) if isinstance(p, str) else p
    return f'{ind}<div class="plate" id="pl-{key}"><img src="assets/plates/{i}.jpg" alt="" /></div>'


# One gain on every clip keeps the sound lane's balance of voices, bed and
# effects and brings the film to -16 LUFS integrated (tools/premix.py measures
# the sum and reports what it needs). Fix round: +0.12 dB (1.0139), because
# the 7 dB duck and the room tone let more quiet blocks through the loudness
# gate and the sum read -16.12 LUFS at 1.0000.
GAIN = '1.0139'

# The delivery places the whole sound as one file, sound/mix/film-mix.wav
# (tools/premix.py: the same clips, starts and GAIN), because the renderer's
# mix of many clips varied between renders (CRITIQUE-2.md, Determinism). Set
# False to place the clips again for editing in the Studio; re-run
# premix.py after any change to the clips, then this script.
PREMIX = True
SOUND_NOTE = {
    False: '''      <!-- sound (sound/manifest.json): the narrator (track 2) and the Mandarin reader (track 3), one clip per take at
           its manifest start, all at one gain, never re-timed; the bed (track 4), its ducking and fades in the file; the
           effects as the one stem (track 5). -->''',
    True: '''      <!-- sound (sound/manifest.json): one file, sound/mix/film-mix.wav, written by tools/premix.py: the narrator's and
           the Mandarin reader's clips at their manifest starts, never re-timed, the bed with its ducking and fades, and the effects
           stem, under a true-peak ceiling in the master. One file keeps the rendered sound identical between renders. -->''',
}


def fmt(t):
    return f'{t:.4f}'.rstrip('0').rstrip('.')


def down(t):
    """A cut written to 4 decimals, rounded down: a cut on frame k (k / 60 s)
    written rounded up (30.8667 for frame 1852) starts its scene one frame
    late, because the frame's time is then before the written start."""
    k = round(t * 60)  # every cut of sound/tools/timeline.py is on a frame
    return math.floor(k * 10000 / 60) / 10000


def audio():
    m = json.load(open(os.path.join(ROOT, 'sound', 'manifest.json')))
    if PREMIX:
        return f'      <audio id="mix" src="sound/mix/film-mix.wav" data-start="0" data-duration="{fmt(m["duration"])}" data-track-index="2" data-volume="1"></audio>'
    out = []
    for c in m['clips']:
        track = 2 if c['who'] == 'narrator' else 3
        out.append(f'      <audio id="vo-{c["id"]}" src="{c["file"]}" data-start="{c["start"]}" data-duration="{c["duration"]}" data-track-index="{track}" data-volume="{GAIN}"></audio>')
    out.append(f'      <audio id="bed" src="{m["music"]["file"]}" data-start="0" data-duration="{fmt(m["duration"])}" data-track-index="4" data-volume="{GAIN}"></audio>')
    out.append(f'      <audio id="sfx" src="{m["effects"]["stem"]}" data-start="0" data-duration="{fmt(m["duration"])}" data-track-index="5" data-volume="{GAIN}"></audio>')
    return '\n'.join(out)


def main():
    os.makedirs(os.path.join(ROOT, 'compositions'), exist_ok=True)
    hosts = []
    for k, (sid, title, plates) in enumerate(SCENES):
        start, end = down(CUTS[k]), down(CUTS[k + 1])
        dur = round(end - start, 4)
        ind = '        '
        if isinstance(plates, dict):
            body = (f'{ind}<div class="part a">\n' + '\n'.join(pl(p, ind + '  ') for p in plates['a']) + f'\n{ind}</div>\n'
                    f'{ind}<div class="part b" style="opacity: 0">\n' + '\n'.join(pl(p, ind + '  ') for p in plates['b']) + f'\n{ind}</div>')
        else:
            body = '\n'.join(pl(p, ind) for p in plates)
        html = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Journey to the West · scene {sid[1]} · {title}</title>
  </head>
  <body>
    <template>
      <style>
        #{sid}-root {{
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #ffffff;
        }}
      </style>
      <div id="{sid}-root" data-composition-id="{sid}" data-width="1920" data-height="1080" data-layout-allow-overflow>
{body}
      </div>
      <script>
        /* Scene {sid[1]} · {fmt(start)} to {fmt(end)} s · {title}. Built by lib/{sid}.js in film seconds; lib/film.js mounts it. */
        window.JW.mount('{sid}', {fmt(start)}, {fmt(dur)});
      </script>
    </template>
  </body>
</html>
'''
        open(os.path.join(ROOT, 'compositions', sid + '.html'), 'w').write(html)
        hosts.append(f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{fmt(start)}" data-duration="{fmt(dur)}" data-track-index="1" data-width="1920" data-height="1080"></div>')
    scripts = '\n'.join(f'    <script src="{s}"></script>' for s in
                        ['kit/gsap.min.js', 'kit/MorphSVGPlugin.min.js', 'kit/DrawSVGPlugin.min.js', 'data/glyphs.js', 'data/plates.js', 'data/contents.js', 'data/events.js', 'lib/jw.js']
                        + [f'lib/s{i}.js' for i in range(1, 9)] + ['lib/film.js'])
    index = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Journey to the West</title>
    <link rel="stylesheet" href="fonts/fonts.css" />
    <link rel="stylesheet" href="lib/jw.css" />
{scripts}
    <style>
      html,
      body {{
        margin: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        background: #ffffff;
      }}
      #root {{
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #ffffff;
      }}
    </style>
  </head>
  <body>
    <!--
      Journey to the West: Waley, Hu Shih, and the English names of 西遊記. v2 (SCRIPT-v2.md), {fmt(END)} s at 1920 x 1080.
      Written by tools/compose.py. Eight scenes, each a sub-composition between the cuts of sound/tools/timeline.py,
      which places every take by its own word timings; the sound placed from sound/manifest.json.
    -->
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="{fmt(END)}">
{chr(10).join(hosts)}
{SOUND_NOTE[PREMIX]}
{audio()}
    </div>
    <script>
      /* The root timeline is empty: every move lives in its scene's sub-composition. */
      window.__timelines['main'] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
'''
    open(os.path.join(ROOT, 'index.html'), 'w').write(index)
    print('index.html and', len(SCENES), 'compositions written;', fmt(END), 's')


if __name__ == '__main__':
    main()
