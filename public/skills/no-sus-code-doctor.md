# No-Sus Code Doctor

This skill is a scored shipping gate for code that must survive skeptical
Dedalus review. It assumes the diff is wrong until the implementation proves
the invariant, the interface, the error model, and the user-visible behavior.

The goal is not "passes lint." The goal is "a reviewer cannot find hidden
fallback behavior, unclear ownership, loose types, vague errors, async/sync
mismatch, fake proof, frontend shortcuts, or PR hygiene problems."

Use this before asking a human or second model to review high-risk code. It
complements `gstack-review` and `autoreview`: this skill is the deterministic
self-audit and fix loop that brings the diff to a real 100.


## Progressive Disclosure

This `SKILL.md` is the routing layer. Detailed recipes, examples, integration notes, and troubleshooting guidance live in `references/details.md` so they are loaded only when the task needs them.

Before producing concrete output, making a design recommendation, or debugging an implementation, load the relevant reference section below. Do not rely on memory for branch-specific APIs, examples, or caveats.

| Task branch | Read first |
| --- | --- |
| Source Order | `references/details.md#source-order` |
| Score | `references/details.md#score` |
| Audit Loop | `references/details.md#audit-loop` |
| Smell Scans | `references/details.md#smell-scans` |
| Audit Matrix | `references/details.md#audit-matrix` |
| Function and Interface Rules | `references/details.md#function-and-interface-rules` |
| Comment and Preamble Rules | `references/details.md#comment-and-preamble-rules` |
| Error Rules | `references/details.md#error-rules` |
| Verification Requirements | `references/details.md#verification-requirements` |
| Output | `references/details.md#output` |
| No-Sus Code Doctor | `references/details.md#no-sus-code-doctor` |

## Related Skills

- `gstack-review` - staff-level code review after this self-audit.
- `autoreview` - structured pre-merge closeout once the local score is clean.
- `vibe-code-doctor` - broader project health for inherited/AI-generated apps.
- `tests` - invariant-first test design and smallest honest verification.
- `fail-closed-case-matching` - product logic that must reject ambiguous states.
- `rtfm` - verify external API behavior before coding against it.
- `codebase-design` - deep modules, small interfaces, and deletion tests.
- `generate-interface` - define the public surface before implementation.
- `comment` - docstrings and comments that earn their keep.
