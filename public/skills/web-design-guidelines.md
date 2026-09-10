# Web Interface Guidelines

Review files for compliance with Vercel's Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all rules and output format instructions.

Source snapshot checked 2026-07-06: `vercel-labs/agent-skills` `main` at `f8a72b9603728bb92a217a879b7e62e43ad76c81`. Do not import a duplicate upstream skill unless this local owner stops matching the canonical guideline workflow.

## Usage

When a user provides a file or pattern argument:

1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

## When to Apply

- After writing or editing React/TSX components
- During UI code review
- When checking accessibility compliance
- When auditing design system implementation
- Before submitting PRs that touch UI code

## Related Skills

- `vercel-react-best-practices` — Performance optimization rules
- `frontend-design` — Distinctive frontend aesthetics
- `seo-audit` — SEO compliance checking

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `claude-web-design-guidelines` | [`references/skills/claude-web-design-guidelines/SKILL.md`](references/skills/claude-web-design-guidelines/SKILL.md) | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices". |
<!-- folded-skills:auto:end -->
