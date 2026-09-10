# Pull Request

Create a reviewable PR that looks native to the target project. Repository-local
instructions outrank personal or employer-specific conventions.

## Context

- Current branch: !`git branch --show-current`
- Status: !`git status -sb | head -1`
- Remotes: !`git remote -v`

## Template Resolution

Resolve the PR format in this order:

1. Read the target repository's `AGENTS.md`, `CONTRIBUTING.md`, and equivalent
   contribution instructions when present.
2. Use the repository's configured PR template:
   `.github/PULL_REQUEST_TEMPLATE.md`, `.github/pull_request_template.md`,
   `docs/PULL_REQUEST_TEMPLATE.md`, or the relevant file under
   `.github/PULL_REQUEST_TEMPLATE/`.
3. If no template exists, inspect 3–5 recent merged PRs from the same repository.
   Reuse stable section names and level of detail, but do not copy bot-injected
   badges, reviewer comments, or change-specific boilerplate.
4. If the repository has no clear convention, use
   [`references/default-pr-template.md`](references/default-pr-template.md).

Never import a template from a different company or repository merely because it
is available in the agent's global instructions. In particular, do not add a
Linear section, reviewer roster, changelog block, line-count gate, or screenshot
section unless the target project requests it or the change genuinely needs it.

## Repository-Specific Decisions

- Detect the default base branch from the target repository. Use an explicit
  user-supplied base when provided; otherwise use the repository default, not a
  hard-coded `main` or `dev`.
- Follow the project's observed title style. Use Conventional Commits only when
  repository instructions or recent PRs establish that convention.
- Resolve owners from the target repository's CODEOWNERS and history only when
  reviewers must be suggested or requested. Do not paste a private handle map
  into public OSS PR bodies.
- Preserve issue-closing syntax used by the project (`Fixes`, `Closes`, or a plain
  link). Do not invent a tracker requirement. Linear is required only when the
  target repository explicitly requires Linear.
- Classify draft vs ready from the actual verification state and the project's
  convention. Do not mark a PR ready when required CI-only proof is still pending.
- For UI changes, follow the repository's screenshot or showcase convention. If
  none exists, include visual proof when it materially helps review; do not add an
  empty screenshot section to non-visual work.

## Body Quality

The body should explain the reviewer-relevant delta, not narrate agent process.

- State the problem or motivation.
- Describe the implementation or changes at the right level for the diff.
- List exact verification performed and any proof that still depends on CI or a
  platform unavailable locally.
- Call out risks, migrations, compatibility constraints, or follow-ups only when
  they exist.
- Link the issue when applicable.
- Keep the body proportional to the change. A small documentation fix should not
  receive an enterprise release checklist.

## Workflow

1. Determine target repository, source branch, and default base branch.
2. Read local contribution instructions and resolve the PR template using the
   hierarchy above.
3. Inspect `git status`, commits, diff, and changed files against the base.
4. Confirm the branch contains only the intended change and is pushed.
5. Draft a project-native title and body with no unresolved placeholders.
6. Create or edit the PR with `gh pr create` / `gh pr edit`.
7. Re-read the rendered PR and verify the base, head, draft state, issue links,
   and body formatting.

## Guardrails

- Do not overwrite an existing PR body without preserving useful human-authored
  context, checklists, reviewer feedback, and every existing media block. Keep
  image/video URLs, Markdown or HTML wrappers, captions, ordering, and source
  markup byte-for-byte unless the user explicitly asks to replace that media.
  A generated refresh may rewrite prose around media but must not silently drop
  screenshots, recordings, or comparison artifacts.
- Do not copy bot-added sections such as Stage badges from another PR; integrations
  will add their own metadata.
- Do not claim tests, screenshots, or platform verification that did not happen.
- Do not request reviewers or apply labels unless authorized and supported by the
  target project's normal workflow.
