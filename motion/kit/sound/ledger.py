"""Prints the take ledger for a film's NOTES.md (Markdown): every take in a folder,
the text it was given, its voice and model, its length, what `el.mjs hear`
returned, and, where kit/sound/tones/hearctx.sh was run, what it heard behind
the carrier. With a request log (el-calls.tsv, written by kit/sound/record.mjs)
it also lists every ElevenLabs request, including the failed and the replaced.

   python3 kit/sound/ledger.py <takes folder> [--ctx <folder>] [--calls <el-calls.tsv>] [--voices <voice.json> ...]

A take is any <name>.json in the folder that holds a "text" and an "alignment"
or a "voice_id" (el.mjs line writes one beside each take; splice.py and
tune.py write one for the takes they build). Takes are listed in natural order
(n2 before n10). The voice is named by the take's own record; when that record
holds only a voice id, the name comes from the voice files: the kit's
kit/audio/voice*.json, plus any --voices file. A take that splice.py or tune.py
built says what it was built from. --ctx defaults to <takes folder>/_ctx and
--calls to <takes folder>/el-calls.tsv; the carrier column and the request
table appear only when those exist.
"""
import glob
import json
import os
import re
import sys

KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def natural(name):
    return [int(p) if p.isdigit() else p for p in re.split(r'(\d+)', name)]


def cell(s):
    return str(s).replace('|', '/').replace('\n', ' ').strip()


def voice_names(extra):
    names = {}
    for p in sorted(glob.glob(os.path.join(KIT, 'audio', 'voice*.json'))) + extra:
        try:
            v = json.load(open(p))
        except (OSError, ValueError):
            continue
        if v.get('voice_id') and v.get('name'):
            names.setdefault(v['voice_id'], v['name'])
        for name, vid in (v.get('voices') or {}).items():
            if vid:
                names.setdefault(vid, name)  # kit/audio/voices.local.json: the ids tracked files never hold
    return names


def voice_of(d, names):
    v = d.get('voice') or ''
    vid = d.get('voice_id') or ''
    if not v or v == vid:
        v = names.get(vid, vid or '?')
    v = v.split(' (')[0]
    if 'spliced_from' in d:
        v += ', spliced from ' + ' + '.join('%s %.2f-%.2f' % (p[0], p[1], p[2]) for p in d['spliced_from'])
    if 'spliced' in d:
        s = d['spliced']
        v += ', joined from %s to %.2f and %s from %.2f' % (s['a'], s['cut_a'], s['b'], s['cut_b'])
    if 'tuned_from' in d:
        v += ', tuned from ' + ' + '.join('%s %.2f-%.2f%s' % (p[0], p[1], p[2], ' re-pitched' if p[4] else '') for p in d['tuned_from'])
    return v + (', ' + d['model'] if d.get('model') else '')


def main():
    args = sys.argv[1:]
    opt = {'--ctx': None, '--calls': None}
    voices = []
    i = 0
    rest = []
    while i < len(args):
        if args[i] in opt:
            opt[args[i]] = args[i + 1]
            i += 2
        elif args[i] == '--voices':
            voices.append(args[i + 1])
            i += 2
        else:
            rest.append(args[i])
            i += 1
    if len(rest) != 1:
        raise SystemExit(__doc__)
    takes = rest[0]
    ctx = opt['--ctx'] or os.path.join(takes, '_ctx')
    calls = opt['--calls'] or os.path.join(takes, 'el-calls.tsv')
    names = voice_names(voices)
    rows = []
    for j in sorted(glob.glob(os.path.join(takes, '*.json')), key=lambda p: natural(os.path.basename(p))):
        name = os.path.basename(j)[:-5]
        if name.endswith('.stt'):
            continue
        try:
            d = json.load(open(j))
        except ValueError:
            continue
        if not isinstance(d, dict) or not isinstance(d.get('text'), str) or not ('alignment' in d or 'voice_id' in d):
            continue
        heard = ''
        stt = j[:-5] + '.stt.json'
        if os.path.exists(stt):
            s = json.load(open(stt))
            heard = '%s (%s)' % (s.get('text', '').strip(), s.get('language_code', '?'))
        c = os.path.join(ctx, name + '.stt.json')
        behind = json.load(open(c)).get('text', '').strip() if os.path.exists(c) else ''
        rows.append([name, d['text'], voice_of(d, names), '%.2f' % (d.get('duration') or 0), heard, behind])
    has_ctx = os.path.isdir(ctx)
    head = ['take', 'text given', 'voice, model', 'length (s)', '`el.mjs hear` returned'] + (['behind the carrier'] if has_ctx else [])
    print('| ' + ' | '.join(head) + ' |')
    print('|' + ' --- |' * len(head))
    for r in rows:
        r = ['`%s`' % r[0]] + [cell(x) for x in r[1:len(head)]]
        print('| ' + ' | '.join(r) + ' |')
    if os.path.exists(calls):
        lines = [x.rstrip('\n').split('\t') for x in open(calls, encoding='utf8') if x.strip()]
        if lines:
            head, body = lines[0], lines[1:]
            failed = sum(1 for x in body if x[-1].startswith('FAILED'))
            print()
            print('%d requests in %s (%d failed):' % (len(body), os.path.basename(calls), failed))
            print()
            print('| ' + ' | '.join(head) + ' |')
            print('|' + ' --- |' * len(head))
            for x in body:
                print('| ' + ' | '.join(cell(v) for v in x) + ' |')


if __name__ == '__main__':
    main()
