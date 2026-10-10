#!/usr/bin/env python3
"""Offline test of patch-body.py: the marked section is replaced or inserted and every other byte of the body, the bot blocks included, stays as it was.

Run: python3 skills/gt-ship/scripts/patch-body.test.py (pnpm test:skill-scripts runs it). It calls no gh and touches no network.
"""
import importlib.util
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('patch_body', os.path.join(HERE, 'patch-body.py'))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

BOTS = (
    '<!-- devin-review-badge-begin -->\nDevin badge\n<!-- devin-review-badge-end -->\n'
    '<!-- CURSOR_SUMMARY -->\n> Medium risk\n<!-- /CURSOR_SUMMARY -->\n'
    '<!-- greptile_comment -->\nConfidence Score: 5/5\n<!-- /greptile_comment -->'
)
failures = []


def check(cond, what):
    if not cond:
        failures.append(what)


# 1. markers present: only the text between them changes
body = 'Summary line.\n\n<!-- screenshots-begin -->\nold crops\n<!-- screenshots-end -->\n\n## Checks\n13 pass\n\n' + BOTS
new = mod.patch(body, 'new crops\n')
check('new crops' in new and 'old crops' not in new, 'the section text is replaced')
check(new.endswith('\n\n## Checks\n13 pass\n\n' + BOTS), 'everything after the end marker stays byte for byte')
check(new.startswith('Summary line.\n\n<!-- screenshots-begin -->\nnew crops\n<!-- screenshots-end -->'), 'everything before the begin marker stays')
check(mod.patch(new, 'new crops\n') == new, 'patching twice with the same section changes nothing')

# 2. no markers, a Verification heading: the block goes above it
body = 'Summary.\n\n## Verification\nran it\n\n' + BOTS
new = mod.patch(body, 'crops')
check(new.index('<!-- screenshots-begin -->') < new.index('## Verification'), 'the block lands above ## Verification')
check(new.endswith('## Verification\nran it\n\n' + BOTS), 'the tail stays byte for byte')

# 3. no markers, no heading: the block goes above the first bot block
body = 'Summary.\n\n' + BOTS
new = mod.patch(body, 'crops')
check(new.index('<!-- screenshots-end -->') < new.index('<!-- devin-review-badge-begin -->'), 'the block lands above the first bot block')
check(new.endswith(BOTS), 'the bot blocks stay byte for byte')

# 4. a plain body: the block goes at the end; another marker name works
new = mod.patch('Summary.', 'rows', name='parity')
check(new == 'Summary.\n\n<!-- parity-begin -->\nrows\n<!-- parity-end -->\n', f'a plain body ends with the block: {new!r}')

# 5. the command line offline mode prints the patched body
with tempfile.TemporaryDirectory() as tmp:
    body_file, section_file = os.path.join(tmp, 'body.md'), os.path.join(tmp, 'section.md')
    with open(body_file, 'w') as fh:
        fh.write('Summary.\n\n' + BOTS)
    with open(section_file, 'w') as fh:
        fh.write('crops')
    run = subprocess.run([sys.executable, os.path.join(HERE, 'patch-body.py'), '--body-file', body_file, '--section', section_file],
                         capture_output=True, text=True)
    check(run.returncode == 0 and run.stdout == mod.patch('Summary.\n\n' + BOTS, 'crops'), f'--body-file prints the patch: {run.stderr}')
    run = subprocess.run([sys.executable, os.path.join(HERE, 'patch-body.py'), '--pr', '5', '--section', section_file],
                         capture_output=True, text=True)
    check(run.returncode == 2, 'a real patch without --repo is a usage error')

if failures:
    for f in failures:
        print('FAIL', f)
    sys.exit(1)
print('patch-body: all checks pass')
