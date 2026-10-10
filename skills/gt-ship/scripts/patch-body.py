#!/usr/bin/env python3
"""patch-body.py: replaces one marked section of a PR body (the screenshots, by default) and leaves every other byte of the body as it was, the bot summaries included (gt-ship section 4).

The section sits between two HTML comments, <!-- screenshots-begin --> and
<!-- screenshots-end --> by default. When the body already holds both, only
the text between them is replaced. When it holds neither, the marked block
goes in before the first of: a "## Verification" heading, the first bot
block (Devin, Cursor Bugbot, Greptile) or the Claude Code footer line; with
none of those, at the end. The bot blocks below stay byte for byte.

Usage:
  python3 patch-body.py --repo <owner/name> --pr <n> --section <file.md> [--name screenshots] [--dry-run]
  python3 patch-body.py --body-file <body.md> --section <file.md> [--name screenshots]
  python3 patch-body.py --help

With --repo and --pr it reads the body with `gh pr view` and writes it back
with `gh api -X PATCH repos/<owner/name>/pulls/<n>`; --dry-run prints the
new body instead of writing it. With --body-file it reads a saved body and
prints the new one, touching no network. --repo has no default: name the
repository every time. --name picks other markers (<!-- <name>-begin -->).

Requires: Python 3.9 or later; `gh` logged in with write access for a real
patch.
Last real run: 2026-09-29, gt-cloud PR body edits in the session that built
the blog Lottie figure (7 runs from 2026-09-25), as patch-body.py.
Copied into this skill on 2026-10-10.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile

BOT_MARKERS = ('<!-- devin-review-badge-begin -->', '<!-- CURSOR_SUMMARY -->', '<!-- greptile_comment -->')
FOOTER = '\U0001F916 Generated with'
ANCHOR = '## Verification'


def patch(body, section, name='screenshots'):
    """The body with the named section replaced, or inserted when it is absent."""
    begin, end = f'<!-- {name}-begin -->', f'<!-- {name}-end -->'
    block = f'{begin}\n{section.strip()}\n{end}'
    if begin in body and end in body and body.index(begin) < body.index(end):
        head = body[:body.index(begin)]
        tail = body[body.index(end) + len(end):]
        return head + block + tail
    if ANCHOR in body:
        at = body.index(ANCHOR)
    else:
        found = [body.index(m) for m in (*BOT_MARKERS, FOOTER) if m in body]
        at = min(found) if found else len(body)
    head = body[:at]
    if head and not head.endswith('\n\n'):
        head = head.rstrip('\n') + '\n\n'
    tail = body[at:]
    return head + block + ('\n\n' + tail if tail else '\n')


def gh(*args):
    return subprocess.run(['gh', *args], check=True, capture_output=True, text=True).stdout


def main(argv=None):
    ap = argparse.ArgumentParser(description='Replace one marked section of a PR body, keeping the rest byte for byte.')
    ap.add_argument('--repo', help='owner/name of the repository (required with --pr)')
    ap.add_argument('--pr', help='the pull request number')
    ap.add_argument('--body-file', help='a saved body to patch offline; the result goes to stdout')
    ap.add_argument('--section', required=True, help='a file holding the new section text')
    ap.add_argument('--name', default='screenshots', help='marker name: <!-- <name>-begin --> (default screenshots)')
    ap.add_argument('--dry-run', action='store_true', help='print the new body instead of writing it')
    args = ap.parse_args(argv)
    with open(args.section, encoding='utf-8') as fh:
        section = fh.read()

    if args.body_file:
        with open(args.body_file, encoding='utf-8') as fh:
            sys.stdout.write(patch(fh.read(), section, args.name))
        return 0
    if not args.repo or not args.pr or '/' not in args.repo:
        ap.error('pass --repo owner/name and --pr <n>, or --body-file')

    body = gh('pr', 'view', args.pr, '--repo', args.repo, '--json', 'body', '-q', '.body')
    if body.endswith('\n') and not body.endswith('\n\n'):
        body = body[:-1]  # gh -q adds one newline after the value
    new = patch(body, section, args.name)
    if args.dry_run:
        sys.stdout.write(new)
        return 0
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as fh:
        json.dump({'body': new}, fh)
        payload = fh.name
    try:
        gh('api', '-X', 'PATCH', f'repos/{args.repo}/pulls/{args.pr}', '--input', payload, '-q', '.number')
    finally:
        os.unlink(payload)
    print(f'patched {args.repo}#{args.pr}: body {len(body)} -> {len(new)} characters')
    return 0


if __name__ == '__main__':
    sys.exit(main())
