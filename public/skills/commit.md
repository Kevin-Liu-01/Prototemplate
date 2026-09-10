# commit

## Context

- Status: !`git status -sb`
- Diff: !`git diff HEAD --stat`
- Branch: !`git branch --show-current`
- Author: !`git config --get user.name && git config --get user.email`
- Recent commits: !`git log --oneline -10`

## Rules

Commits are terse one-liner conventional commits: `type(scope): description`.

- type: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- scope: affected area (module, package, or feature)
- description: imperative mood, lowercase, no period, under 72 characters
- Never use "and" in a commit message. Two changes = two commits.
- Branches for Kevin-authored work use the `kevin/` prefix. Do not create new `codex/`
  branches for Kevin's work.
- Commits must be authored as Kevin Liu using the active personal email in local
  Git config. Never use a former-employer email. If the configured author is not
  Kevin Liu or uses a former-employer domain, stop and fix Git config first.
- Do not add agent attribution, AI attribution, `Co-authored-by`, or generated-by
  trailers. The agent is operating on Kevin's behalf, not claiming authorship.

Stage files by name (never `git add -A` or `git add .`). Group changes by intent.

## Task

Based on the context above, stage the relevant files and create the commit.
Do not use any other tools. Do not send any text besides the tool calls.
