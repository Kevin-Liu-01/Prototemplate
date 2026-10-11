#!/usr/bin/env python3
"""Prints the take ledger for NOTES.md: every take in takes/, the text it was
given, voice and model, its length, what `el.mjs hear` returned alone, and
behind the Mandarin carrier (tools/hearctx.sh) where that was run.
    python3 sound/tools/ledger.py
"""
import glob, json, os, re, sys
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(S), 'kit', 'audio'))
from voices import voice_id  # noqa: E402  (ids from kit/audio/voices.local.json, never tracked)
CLARA = voice_id('Clara')
def key(p):
    b = os.path.basename(p)[:-4]
    return (b[0], int(re.findall(r'\d+', b)[0]), b)
rows = []
for p in sorted(glob.glob(os.path.join(S, 'takes', '*.mp3')), key=key):
    b = os.path.basename(p)[:-4]
    j = json.load(open(p[:-4] + '.json'))
    st = p[:-4] + '.stt.json'
    heard = ''
    if os.path.exists(st):
        h = json.load(open(st))
        heard = f"{h.get('text', '').strip()} ({h.get('language_code', '?')})"
    ctx = os.path.join(S, '_ctx', b + '.stt.json')
    c = ''
    if os.path.exists(ctx):
        c = json.load(open(ctx)).get('text', '').strip()
    voice = 'Clara' if j['voice_id'] == CLARA else 'Yun'
    rows.append(f"| `{b}` | {j['text']} | {voice}, {j['model']} | {j['duration']:.2f} | {heard} | {c} |")
print('| take | text given | voice, model | length (s) | `el.mjs hear` alone | behind the carrier (the carrier 泰西利瑪竇口譯 first) |')
print('| --- | --- | --- | --- | --- | --- |')
print('\n'.join(rows))
