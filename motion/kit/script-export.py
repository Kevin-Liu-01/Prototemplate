#!/usr/bin/env python3
"""GT motion kit: a film's script as built, for the record and the web.

Kevin asked (2026-10-06) to keep every film's script beside its contact sheet.
This writes one Markdown file per film: the title, the length, the voices, the
story in one sentence, and a table of every line with the time it is spoken in
the final, who speaks it, the words, and what is on screen.

The words and the on-screen notes come from a JSON file (the reviewed script):
  {"title": ..., "story": ..., "lines": [{"n", "who": "N" | "R" | "X", "said",
   "sub" (optional subtitle), "screen", "at" (optional start in film seconds,
   from the film's own record, which wins over the transcript)}]}
The times come from the final itself: the film's audio transcribed with word
timings (kit/audio/el.mjs hear --out <stt.json>), aligned to the script's words
in order. A line the transcript cannot place (a reader's Mandarin, a silent
card) takes the gap between its placed neighbours.

Usage:
  kit/script-export.py <script.json> <stt.json> <film.mp4> <out.md> \
      [--voices "Narrator: Frederick Surrey"] [--version "v2"] [--video <url or path>]
"""
import argparse, difflib, json, re, subprocess, unicodedata

def tokens(text):
    text = unicodedata.normalize('NFKC', text).lower().replace('’', "'")
    out = []
    for w in re.findall(r"[a-z0-9']+|[㐀-鿿]", text):
        w = w.strip("'")
        if w:
            out.append(w)
    return out

def fmt(t):
    return f'{int(t // 60)}:{t % 60:05.2f}'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('script'); ap.add_argument('stt'); ap.add_argument('film'); ap.add_argument('out')
    ap.add_argument('--voices', default=''); ap.add_argument('--version', default=''); ap.add_argument('--video', default='')
    a = ap.parse_args()
    sc = json.load(open(a.script))
    stt = json.load(open(a.stt))
    words = [w for w in stt.get('words', []) if w.get('type') == 'word']
    heard = []  # (token, start, end)
    for w in words:
        for t in tokens(w['text']):
            heard.append((t, w['start'], w['end']))
    script_toks, owner = [], []
    for i, l in enumerate(sc['lines']):
        if l.get('who') == 'X':
            continue
        for t in tokens(l['said']):
            script_toks.append(t); owner.append(i)
    sm = difflib.SequenceMatcher(None, script_toks, [h[0] for h in heard], autojunk=False)
    times = {}
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            i = owner[blk.a + k]; h = heard[blk.b + k]
            s, e = times.get(i, (h[1], h[2]))
            times[i] = (min(s, h[1]), max(e, h[2]))
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', a.film]).decode())
    n = len(sc['lines'])
    # Lines the transcript could not place share the gap between their placed
    # neighbours evenly, in order; a closing card runs to the film's end.
    for i, l in enumerate(sc['lines']):
        if 'at' in l:  # a start the film's own record gives (a reader clip, a card)
            times[i] = (float(l['at']), float(l['at']) + 0.5)
    placed = [times.get(i) for i in range(n)]
    i = 0
    while i < n:
        if placed[i] is not None:
            i += 1; continue
        j = i
        while j < n and placed[j] is None:
            j += 1
        lo = placed[i - 1][1] + 0.2 if i > 0 else 0.0
        hi = placed[j][0] - 0.2 if j < n else dur
        step = max(hi - lo, 0.0) / (j - i)
        for k in range(i, j):
            placed[k] = (lo + step * (k - i), lo + step * (k - i + 1))
        i = j
    who = {'N': 'Narrator', 'R': 'Reader', 'X': 'No voice'}
    rows = []
    for l, (s, e) in zip(sc['lines'], placed):
        said = l['said'].replace('|', '\\|')
        if l.get('sub'):
            said += f" <br>*Subtitle:* {l['sub']}"
        rows.append(f"| {fmt(s)} | {who.get(l.get('who', 'N'), l.get('who'))} | {said} | {l.get('screen', '').replace('|', '\\|')} |")
    head = [f"# {sc['title']}", '']
    meta = [f'{dur:.1f} s']
    if a.version: meta.append(a.version)
    if a.voices: meta.append(a.voices)
    head += [' · '.join(meta), '']
    if a.video: head += [f'Film: {a.video}', '']
    if sc.get('story'): head += [sc['story'], '']
    head += ['| Time | Voice | Line | On screen |', '| --- | --- | --- | --- |']
    open(a.out, 'w').write('\n'.join(head + rows) + '\n\nTimes are where each line starts in the final, read from the film\'s own audio.\n')
    missing = [str(sc['lines'][i].get('n')) for i in range(n) if i not in times and sc['lines'][i].get('who') != 'X']
    print(f"{a.out}: {n} lines, {len(times)} placed from the audio" + (f", interpolated: {', '.join(missing)}" if missing else ''))

if __name__ == '__main__':
    main()
