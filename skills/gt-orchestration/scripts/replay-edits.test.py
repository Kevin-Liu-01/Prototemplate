#!/usr/bin/env python3
"""Offline test of replay-edits.py on synthetic transcripts.

It builds a six-line transcript (three edits, one of them failed in its
session, each with its tool result), replays it over a starting copy, checks
the rebuilt file, reverts it back to the starting copy, and checks that the
script never prints a tool input and never writes outside --out.

Usage: python3 skills/gt-orchestration/scripts/replay-edits.test.py
Requires: Python 3.9 or later, standard library only.
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'replay-edits.py')
SENTINEL = 'sentinel-value-' + 'x' * 12
ORIGINAL = 'alpha\nbeta\nbeta\ngamma\n'
EXPECTED = 'alpha\nBETA\nBETA\ngamma\ndelta ' + SENTINEL + '\n'


def tool_use(uid, stamp, name, args):
    return {'type': 'assistant', 'timestamp': stamp,
            'message': {'role': 'assistant', 'content': [{'type': 'tool_use', 'id': uid, 'name': name, 'input': args}]}}


def tool_result(uid, stamp, error=False):
    block = {'type': 'tool_result', 'tool_use_id': uid, 'content': 'error' if error else 'ok'}
    if error:
        block['is_error'] = True
    return {'type': 'user', 'timestamp': stamp, 'message': {'role': 'user', 'content': [block]}}


def write_jsonl(path, records):
    with open(path, 'w', encoding='utf-8') as handle:
        for record in records:
            handle.write(json.dumps(record) + '\n')


def run(*args):
    return subprocess.run([sys.executable, SCRIPT, *args], capture_output=True, text=True)


class ReplayEditsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = self.tmp.name
        self.target = '/work/repo/src/notes.txt'
        self.base = os.path.join(self.root, 'base')
        os.makedirs(os.path.join(self.base, 'src'))
        with open(os.path.join(self.base, 'src', 'notes.txt'), 'w', encoding='utf-8') as handle:
            handle.write(ORIGINAL)
        self.transcript = os.path.join(self.root, 'session.jsonl')
        write_jsonl(self.transcript, [
            tool_use('t1', '2026-10-10T00:00:01Z', 'Edit',
                     {'file_path': self.target, 'old_string': 'beta', 'new_string': 'BETA', 'replace_all': True}),
            tool_result('t1', '2026-10-10T00:00:02Z'),
            tool_use('t2', '2026-10-10T00:00:03Z', 'Edit',
                     {'file_path': self.target, 'old_string': 'gamma\n', 'new_string': 'gamma\ndelta ' + SENTINEL + '\n'}),
            tool_result('t2', '2026-10-10T00:00:04Z'),
            tool_use('t3', '2026-10-10T00:00:05Z', 'Edit',
                     {'file_path': self.target, 'old_string': 'alpha', 'new_string': 'never applied'}),
            tool_result('t3', '2026-10-10T00:00:06Z', error=True),
        ])

    def tearDown(self):
        self.tmp.cleanup()

    def read(self, *parts):
        with open(os.path.join(self.root, *parts), encoding='utf-8') as handle:
            return handle.read()

    def test_replay_rebuilds_the_file_and_skips_failed_calls(self):
        result = run(self.transcript, '--match', '/work/repo/', '--base', self.base, '--out', os.path.join(self.root, 'out'))
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.read('out', 'src', 'notes.txt'), EXPECTED)
        summary = json.loads(result.stdout)
        self.assertEqual(summary['written'], ['src/notes.txt'])
        self.assertEqual(summary['skipped_errors'], 1)
        self.assertNotIn(SENTINEL, result.stdout + result.stderr)

    def test_revert_restores_the_starting_copy(self):
        out = os.path.join(self.root, 'out')
        self.assertEqual(run(self.transcript, '--match', '/work/repo/', '--base', self.base, '--out', out).returncode, 0)
        back = os.path.join(self.root, 'back')
        result = run(self.transcript, '--match', '/work/repo/', '--base', out, '--out', back, '--revert')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.read('back', 'src', 'notes.txt'), ORIGINAL)
        self.assertNotIn(SENTINEL, result.stdout + result.stderr)

    def test_until_stops_at_a_time(self):
        result = run(self.transcript, '--match', '/work/repo/', '--base', self.base,
                     '--out', os.path.join(self.root, 'early'), '--until', '2026-10-10T00:00:02Z')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.read('early', 'src', 'notes.txt'), 'alpha\nBETA\nBETA\ngamma\n')

    def test_write_then_multiedit_without_base(self):
        transcript = os.path.join(self.root, 'write.jsonl')
        write_jsonl(transcript, [
            tool_use('w1', '2026-10-10T00:00:01Z', 'Write', {'file_path': '/s/pad/plan.md', 'content': 'one\ntwo\n'}),
            tool_result('w1', '2026-10-10T00:00:02Z'),
            tool_use('w2', '2026-10-10T00:00:03Z', 'MultiEdit', {'file_path': '/s/pad/plan.md', 'edits': [
                {'old_string': 'one', 'new_string': 'ONE'}, {'old_string': 'two', 'new_string': 'TWO'}]}),
            tool_result('w2', '2026-10-10T00:00:04Z'),
        ])
        result = run(transcript, '--match', '/s/pad/', '--out', os.path.join(self.root, 'w'))
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.read('w', 'plan.md'), 'ONE\nTWO\n')
        reverted = run(transcript, '--match', '/s/pad/', '--base', os.path.join(self.root, 'w'),
                       '--out', os.path.join(self.root, 'w0'), '--revert')
        self.assertEqual(json.loads(reverted.stdout)['created_by_transcript'], ['plan.md'])
        self.assertFalse(os.path.exists(os.path.join(self.root, 'w0', 'plan.md')))

    def test_a_missed_edit_exits_1_and_list_writes_nothing(self):
        result = run(self.transcript, '--match', '/work/repo/', '--out', os.path.join(self.root, 'nobase'))
        self.assertEqual(result.returncode, 1)
        self.assertEqual(json.loads(result.stdout)['misses'][0]['reason'], 'edit before any write and no --base copy')
        listing = run(self.transcript, '--match', '/work/repo/', '--list')
        self.assertEqual(listing.returncode, 0)
        self.assertEqual(json.loads(listing.stdout)['files']['src/notes.txt']['edits'], 2)
        self.assertNotIn(SENTINEL, listing.stdout)

    def test_paths_that_climb_out_of_out_are_refused(self):
        transcript = os.path.join(self.root, 'climb.jsonl')
        write_jsonl(transcript, [
            tool_use('c1', '2026-10-10T00:00:01Z', 'Write', {'file_path': '/m/../../escape.txt', 'content': 'x'}),
            tool_result('c1', '2026-10-10T00:00:02Z'),
        ])
        result = run(transcript, '--match', '/m/', '--out', os.path.join(self.root, 'safe'))
        self.assertEqual(json.loads(result.stdout)['refused_paths'], 1)
        self.assertFalse(os.path.exists(os.path.join(self.root, 'escape.txt')))


if __name__ == '__main__':
    unittest.main(verbosity=1)
