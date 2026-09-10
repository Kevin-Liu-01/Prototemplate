# Playwright CLI Skill

Use Playwright as the regression ratchet: codified tests, CI gates, and reproducible traces. Prefer [[agent-browser]] for interactive agent browser work such as browsing, scraping, filling forms, screenshots, visual checks, and localhost QA.

If this skill triggers because the user said "use Playwright" for generic browsing, first check whether they asked for committed test files. If not, use `agent-browser` and explain that Playwright is reserved for durable tests.

## Prerequisite check (required)

Before proposing commands, check whether `npx` is available (the wrapper depends on it):

```bash
command -v npx >/dev/null 2>&1
```

If it is not available, pause and ask the user to install Node.js/npm (which provides `npx`). Provide these steps verbatim:

```bash
# Verify Node/npm are installed
node --version
npm --version

# If missing, install Node.js/npm, then:
npm install -g @playwright/cli@latest
playwright-cli --help
```

Once `npx` is present, proceed with the wrapper script. A global install of `playwright-cli` is optional.

## Skill path (set once)

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
```

User-scoped skills install under `$CODEX_HOME/skills` (default: `~/.codex/skills`).

## Quick start

Use the wrapper script when you are running an existing suite or collecting a reproducible trace:

```bash
"$PWCLI" open https://playwright.dev --headed
"$PWCLI" snapshot
"$PWCLI" click e15
"$PWCLI" type "Playwright"
"$PWCLI" press Enter
"$PWCLI" screenshot
```

If the user prefers a global install, this is also valid:

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

## Core workflow

1. Identify the repo's Playwright config or existing suite.
2. Run the smallest relevant test or reproduce with a trace.
3. If the issue was discovered through agent-browser, convert the behavior into a stable assertion.
4. Keep screenshots/traces only when they are useful review artifacts.

Minimal existing-suite loop:

```bash
npx playwright test --list
npx playwright test path/to/spec.ts --trace on
```

## When to snapshot again

Snapshot again after:

- navigation
- clicking elements that change the UI substantially
- opening/closing modals or menus
- tab switches

Refs can go stale. When a command fails due to a missing ref, snapshot again.

## Recommended patterns

### Convert an agent-browser finding into a test

```bash
npx playwright codegen http://localhost:3000
npx playwright test path/to/new.spec.ts --trace on
```

### Debug a UI flow with traces

```bash
"$PWCLI" open https://example.com --headed
"$PWCLI" tracing-start
# ...interactions...
"$PWCLI" tracing-stop
```

### Multi-tab work

```bash
"$PWCLI" tab-new https://example.com
"$PWCLI" tab-list
"$PWCLI" tab-select 0
"$PWCLI" snapshot
```

## Wrapper script

The wrapper script uses `npx --package @playwright/cli playwright-cli` so the CLI can run without a global install:

```bash
"$PWCLI" --help
```

Prefer the wrapper unless the repository already standardizes on a global install.

## References

Open only what you need:

- CLI command reference: `references/cli.md`
- Practical workflows and troubleshooting: `references/workflows.md`

## Guardrails

- Do not use this skill for ad-hoc browsing, scraping, form fills, screenshots, or local UI QA. Use `agent-browser`.
- Do not add Playwright tests for speculative behavior. Add them when a user-facing behavior should gate every PR.
- Prefer existing repo scripts/config over standalone wrapper commands.
- Use `--headed` or `--trace on` when reproducibility matters.
- When capturing artifacts in this repo, use `output/playwright/` and avoid introducing new top-level artifact folders.
