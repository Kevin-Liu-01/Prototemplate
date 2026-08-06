#!/usr/bin/env python3
"""Reconstruct a direction's source from an agent transcript.

The redesign app was never committed, so when a later workflow overwrote a
route there was no git history to fall back on. Agent transcripts record every
Write and Edit verbatim, so replaying them in order rebuilds the exact file
state that agent left behind.

Usage: recover.py <transcript.jsonl> <path-substring> <out-dir>
"""
import json
import os
import sys

transcript, needle, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]

files = {}   # path -> content
ops = []     # (op, path) log

with open(transcript) as fh:
    for line in fh:
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        content = rec.get('message', {}).get('content')
        if not isinstance(content, list):
            continue
        for block in content:
            if not isinstance(block, dict) or block.get('type') != 'tool_use':
                continue
            name = block.get('name')
            args = block.get('input') or {}
            path = args.get('file_path', '')
            if needle not in path:
                continue
            if name == 'Write':
                files[path] = args.get('content', '')
                ops.append(('write', path))
            elif name == 'Edit':
                old, new = args.get('old_string', ''), args.get('new_string', '')
                if path not in files:
                    ops.append(('edit-miss(no base)', path))
                    continue
                if old not in files[path]:
                    ops.append(('edit-miss(no match)', path))
                    continue
                if args.get('replace_all'):
                    files[path] = files[path].replace(old, new)
                else:
                    files[path] = files[path].replace(old, new, 1)
                ops.append(('edit', path))

written = 0
for path, body in files.items():
    idx = path.find(needle)
    rel = path[idx + len(needle):].lstrip('/')
    dest = os.path.join(out_dir, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w') as fh:
        fh.write(body)
    written += 1

misses = [o for o in ops if o[0].startswith('edit-miss')]
print(json.dumps({
    'files_recovered': written,
    'paths': sorted(os.path.relpath(os.path.join(dp, f), out_dir)
                    for dp, _, fs in os.walk(out_dir) for f in fs),
    'total_ops': len(ops),
    'edit_misses': misses,
}, indent=2))
