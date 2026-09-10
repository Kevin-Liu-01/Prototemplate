# Ensure Repo License

Kevin's personal public repos default to **MIT** with copyright **Kevin B. Liu**.

## When to run

1. **New public repo** — add `LICENSE` in the first commit (or before flipping `isPrivate: false`).
2. **Open-sourcing an existing repo** — audit, add MIT, confirm GitHub shows MIT in repo sidebar.
3. **Weekly automation** — `oss-license-audit` automation (see `automations/oss-license-audit.md`).
4. **Agent-docs doctor** — warns when `LICENSE` is missing on any enrolled repo.

Skip for **private company repos** (Dedalus org, etc.) unless Kevin explicitly open-sources them.

## Commands

From kevin-wiki:

```bash
# Audit all public repos under Kevin-Liu-01
npx tsx scripts/ensure-mit-license.ts audit --owner Kevin-Liu-01

# Dry-run bulk apply
npx tsx scripts/ensure-mit-license.ts apply --owner Kevin-Liu-01 --dry-run

# Apply to all missing
npx tsx scripts/ensure-mit-license.ts apply --owner Kevin-Liu-01

# Single repo (GitHub API — no clone needed)
npx tsx scripts/ensure-mit-license.ts apply --repo Kevin-Liu-01/my-project

# Local clone
npx tsx scripts/ensure-mit-license.ts apply --local ~/Documents/GitHub/my-project
```

After adding locally, commit and push:

```bash
git add LICENSE && git commit -m "Add MIT license" && git push
```

## New repo checklist

When Kevin (or an agent) creates a new **public** repo:

1. Copy MIT text from `scripts/lib/mit-license.ts` → root `LICENSE`
2. Add `"license": "MIT"` to `package.json` if present
3. Optional README badge: `[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)`
4. On GitHub: Settings → General → set license to MIT (auto-detected once `LICENSE` is on default branch)

## Enforcement layers

| Layer | Mechanism |
| --- | --- |
| **Doctor** | `agent-docs doctor` warns on missing/non-MIT `LICENSE` |
| **Automation** | `oss-license-audit` weekly — audit + apply gaps |
| **Tooling doc** | `wiki/meta/required-project-tooling.md` § Layer 0 |
| **This skill** | Agent procedure for one-off fixes |

## Related

- `scripts/ensure-mit-license.ts` — audit/apply CLI
- `scripts/lib/mit-license.ts` — canonical MIT template
- `automations/oss-license-audit.md` — recurring audit
- `wiki/meta/required-project-tooling.md` — stack checklist
