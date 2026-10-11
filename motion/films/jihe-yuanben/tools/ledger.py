"""Prints the take ledger (markdown) from audio/*.json and audio/*.stt.json:
every take recorded, its text, voice, length, and what `el.mjs hear` returned.
   python3 tools/ledger.py > /tmp/ledger.md"""
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
sys.path.insert(0, ROOT + 'kit/audio')
from voices import voice_id  # noqa: E402  (ids from kit/audio/voices.local.json, never tracked)

VOICES = {voice_id(n): n for n in ('Yun', 'Mr. Chen', 'Siqi Liu', 'Clara')}
rows = []
for j in sorted(glob.glob(ROOT + 'audio/*.json')):
    name = os.path.basename(j)[:-5]
    if name.endswith('.stt') or name in ('cues', 'events', 'mix-levels', 'measure'):
        continue
    d = json.load(open(j))
    stt = j[:-5] + '.stt.json'
    heard = ''
    if os.path.exists(stt):
        s = json.load(open(stt))
        heard = '%s (%s)' % (s.get('text', '').strip(), s.get('language_code', '?'))
    v = VOICES.get(d.get('voice_id', ''), d.get('voice', '')).split(' (')[0]
    if 'spliced_from' in d:
        v = 'Yun, spliced from ' + ' + '.join('%s %.2f-%.2f' % (p[0], p[1], p[2]) for p in d['spliced_from'])
    if 'tuned_from' in d:
        v = 'Yun, tuned (tools/tune.py) from ' + ' + '.join('%s %.2f-%.2f%s' % (p[0], p[1], p[2], ' re-pitched' if p[4] else '') for p in d['tuned_from'])
    rows.append('| `%s` | %s | %s | %.2f | %s |' % (name, d.get('text', '').replace('|', '/'), v, d.get('duration') or 0, heard.replace('|', '/')))
print('| take | text given | voice | length (s) | `el.mjs hear` returned |')
print('| --- | --- | --- | --- | --- |')
print('\n'.join(rows))
