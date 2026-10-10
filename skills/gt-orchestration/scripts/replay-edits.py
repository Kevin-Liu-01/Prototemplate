#!/usr/bin/env python3
"""Rebuild files from the Write and Edit calls recorded in agent transcripts.

A Claude Code transcript (a session's or a subagent's .jsonl) records every
Write, Edit and MultiEdit call with its full input. When a file was lost (a
scratchpad wiped at a reboot, an uncommitted route overwritten by a later
lane, a worktree removed before its push), replaying those calls in order
rebuilds the file as the agent left it. With --revert the calls are undone
from the newest back, which rebuilds the file as it was before the agent
touched it.

The script prints only a summary: paths, operation counts and misses. It
never prints a tool input, because transcripts can hold pasted keys, and it
writes only under --out.

Usage:
  replay-edits.py <transcript.jsonl> [...] --match <substring> --out <dir>
      [--base <dir>] [--until <ISO time>] [--revert] [--list]

  --match    replay only calls whose file_path contains this substring; the
             output path is the rest of file_path from the folder the match
             ends in (--match /repo/ turns /repo/src/a.ts into src/a.ts)
  --out      folder that receives the rebuilt files (created when missing)
  --base     folder holding the starting copy of each file at the same
             relative path. A replay starts from it when the first call on a
             file is an Edit. --revert requires it: it holds the current files.
  --until    ignore calls recorded after this time (2026-09-14T18:30:00Z)
  --revert   undo the calls newest first (each Edit's new_string becomes its
             old_string again); reverting past a Write means the file did not
             exist before, so it is reported as created and not written
  --list     print the calls per file and write nothing

Calls whose tool result was an error are skipped, since they changed nothing
in the original session. Several transcripts are merged by record time.

Exit code: 0 when every call applied, 1 when an Edit missed (its old_string,
or new_string under --revert, was not found), 2 on a usage error.

Requires: Python 3.9 or later, standard library only.
Test: python3 skills/gt-orchestration/scripts/replay-edits.test.py
Last real run: 2026-10-10, Prototemplate session (system v2 lane L3): rebuilt
the exploration charter of 2026-09-14 from its subagent transcript for
skills/gt-explorations/references/charter.md. Its first form, recover.py,
rebuilt the uncommitted redesign routes in July 2026.
"""

import argparse
import json
import os
import sys

EDIT_TOOLS = ('Edit', 'MultiEdit')


def parse_args(argv):
    parser = argparse.ArgumentParser(
        description='Rebuild files from the Write and Edit calls in agent transcripts.')
    parser.add_argument('transcripts', nargs='+', help='transcript .jsonl files')
    parser.add_argument('--match', required=True, help='substring of file_path to replay')
    parser.add_argument('--out', help='folder for the rebuilt files')
    parser.add_argument('--base', help='folder with the starting copy of each file')
    parser.add_argument('--until', help='ignore calls recorded after this ISO time')
    parser.add_argument('--revert', action='store_true', help='undo the calls newest first')
    parser.add_argument('--list', action='store_true', help='print the calls per file, write nothing')
    args = parser.parse_args(argv)
    if not args.list and not args.out:
        parser.error('--out is required unless --list is given')
    if args.revert and not args.base:
        parser.error('--revert needs --base, the folder that holds the current files')
    if not args.match:
        parser.error('--match must not be empty')
    return args


def relative_path(file_path, match):
    """file_path from the folder the match ends in, or None when it would leave --out."""
    end = file_path.find(match) + len(match)
    rel = file_path[file_path.rfind('/', 0, end) + 1:]
    parts = rel.split('/')
    if os.path.isabs(rel) or '..' in parts or rel == '':
        return None
    return rel


def read_records(paths):
    """Every JSON record of every transcript, with its time and a stable order."""
    records = []
    for index, path in enumerate(paths):
        with open(path, encoding='utf-8') as handle:
            for line_no, line in enumerate(handle):
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if isinstance(record, dict):
                    records.append((record.get('timestamp') or '', index, line_no, record))
    records.sort(key=lambda item: (item[0], item[1], item[2]))
    return records


def blocks(record):
    message = record.get('message')
    content = message.get('content') if isinstance(message, dict) else None
    return [block for block in content if isinstance(block, dict)] if isinstance(content, list) else []


def collect_calls(records, match, until):
    """The matching file calls in record order, minus the ones whose result was an error."""
    failed = set()
    for _, _, _, record in records:
        for block in blocks(record):
            if block.get('type') == 'tool_result' and block.get('is_error'):
                failed.add(block.get('tool_use_id'))
    calls = []
    skipped = 0
    for stamp, _, _, record in records:
        if until and stamp and stamp > until:
            continue
        for block in blocks(record):
            if block.get('type') != 'tool_use' or block.get('name') not in ('Write',) + EDIT_TOOLS:
                continue
            args = block.get('input') or {}
            file_path = args.get('file_path') or ''
            if match not in file_path:
                continue
            if block.get('id') in failed:
                skipped += 1
                continue
            if block.get('name') == 'Write':
                steps = [('write', args.get('content', ''), None, False)]
            elif block.get('name') == 'Edit':
                steps = [('edit', args.get('old_string', ''), args.get('new_string', ''), bool(args.get('replace_all')))]
            else:
                steps = [('edit', e.get('old_string', ''), e.get('new_string', ''), bool(e.get('replace_all')))
                         for e in args.get('edits') or [] if isinstance(e, dict)]
            calls.append({'path': file_path, 'time': stamp, 'tool': block.get('name'), 'steps': steps})
    return calls, skipped


def read_base(base, rel):
    if not base:
        return None
    path = os.path.join(base, rel)
    if not os.path.isfile(path):
        return None
    with open(path, encoding='utf-8') as handle:
        return handle.read()


def substitute(text, find, put, replace_all):
    if find == '' or find not in text:
        return None
    return text.replace(find, put) if replace_all else text.replace(find, put, 1)


def replay(calls, rels, base):
    files, misses, applied = {}, [], 0
    for number, call in enumerate(calls, 1):
        rel = rels[call['path']]
        for kind, first, second, replace_all in call['steps']:
            if kind == 'write':
                files[rel] = first
                applied += 1
                continue
            if rel not in files:
                files[rel] = read_base(base, rel)
            if files[rel] is None:
                misses.append({'call': number, 'path': rel, 'reason': 'edit before any write and no --base copy'})
                continue
            result = substitute(files[rel], first, second, replace_all)
            if result is None:
                misses.append({'call': number, 'path': rel, 'reason': 'old_string not found'})
                continue
            files[rel] = result
            applied += 1
    return files, misses, applied


def revert(calls, rels, base):
    files, created, misses, applied = {}, set(), [], 0
    for number in range(len(calls), 0, -1):
        call = calls[number - 1]
        rel = rels[call['path']]
        if rel in created:
            continue
        if rel not in files:
            files[rel] = read_base(base, rel)
        if files[rel] is None:
            misses.append({'call': number, 'path': rel, 'reason': 'no current copy under --base'})
            created.add(rel)
            continue
        for kind, first, second, replace_all in reversed(call['steps']):
            if kind == 'write':
                created.add(rel)
                applied += 1
                break
            result = substitute(files[rel], second, first, replace_all)
            if result is None:
                misses.append({'call': number, 'path': rel, 'reason': 'new_string not found'})
                continue
            files[rel] = result
            applied += 1
    for rel in created:
        files.pop(rel, None)
    return files, sorted(created), misses, applied


def main(argv):
    args = parse_args(argv)
    calls, skipped = collect_calls(read_records(args.transcripts), args.match, args.until)
    rels, outside = {}, []
    for call in calls:
        rel = relative_path(call['path'], args.match)
        if rel is None:
            outside.append(call['path'])
        rels[call['path']] = rel
    calls = [call for call in calls if rels[call['path']] is not None]

    if args.list:
        per_file = {}
        for call in calls:
            entry = per_file.setdefault(rels[call['path']], {'writes': 0, 'edits': 0, 'first': call['time'], 'last': call['time']})
            entry['writes' if call['tool'] == 'Write' else 'edits'] += 1
            entry['last'] = call['time']
        print(json.dumps({'calls': len(calls), 'skipped_errors': skipped, 'files': per_file,
                          'refused_paths': len(outside)}, indent=2))
        return 0

    if args.revert:
        files, created, misses, applied = revert(calls, rels, args.base)
    else:
        (files, misses, applied), created = replay(calls, rels, args.base), []

    out_root = os.path.realpath(args.out)
    written = []
    for rel, body in sorted(files.items()):
        if body is None:
            continue
        dest = os.path.realpath(os.path.join(out_root, rel))
        if not dest.startswith(out_root + os.sep):
            misses.append({'call': 0, 'path': rel, 'reason': 'refused: resolves outside --out'})
            continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'w', encoding='utf-8') as handle:
            handle.write(body)
        written.append(rel)

    print(json.dumps({
        'mode': 'revert' if args.revert else 'replay',
        'calls': len(calls),
        'steps_applied': applied,
        'skipped_errors': skipped,
        'written': written,
        'created_by_transcript': created,
        'misses': misses,
        'refused_paths': len(outside),
    }, indent=2))
    return 1 if misses else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
