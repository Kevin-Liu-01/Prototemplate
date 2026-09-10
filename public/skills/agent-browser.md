# Browser Automation with agent-browser

CLI browser automation via Chrome/Chromium CDP. This is the default for agent-driven browser work: browsing, scraping, screenshots, form fills, logged-in Chrome flows, local UI QA, React/perf checks, and quick visual proof. Install: `npm i -g agent-browser`. Run `agent-browser install` to download Chrome.

## Routing Contract

- Use agent-browser first for interactive browser automation.
- Use a Chrome profile, `--auto-connect`, or state files for logged-in flows.
- Use Playwright only when creating or running committed regression tests, or when an existing repo test suite already owns the surface.
- Use Puppeteer only for legacy repos or vendor browser-rendering substrates that require it.
- Use browser-harness only for screenshot-first self-healing real-Chrome flows that agent-browser cannot handle.

## Core Workflow

1. **Navigate**: `agent-browser open <url>`
2. **Snapshot**: `agent-browser snapshot -i` (get element refs like `@e1`, `@e2`)
3. **Interact**: Use refs to click, fill, select
4. **Re-snapshot**: After navigation or DOM changes, get fresh refs

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait 2000
agent-browser snapshot -i
```

## Batch Execution

ALWAYS use `batch` for 2+ sequential commands:

```bash
agent-browser batch "open https://example.com" "snapshot -i"
agent-browser batch "click @e1" "wait 1000" "screenshot"
agent-browser batch "open https://example.com" "snapshot -i" "screenshot"
```

Only run a single command when you need to read output before deciding the next step.

## Essential Commands

```bash
# Navigation
agent-browser open <url>
agent-browser close
agent-browser close --all

# Snapshot (get interactive element refs)
agent-browser snapshot -i
agent-browser snapshot -i --urls         # Include href URLs for links
agent-browser snapshot -s "#selector"    # Scope to CSS selector

# Interaction (use @refs from snapshot)
agent-browser click @e1
agent-browser fill @e2 "text"
agent-browser select @e1 "option"
agent-browser press Enter
agent-browser scroll down 500

# Get information
agent-browser get text @e1
agent-browser get url
agent-browser get title

# Wait
agent-browser wait @e1                  # Wait for element
agent-browser wait 2000                 # Wait milliseconds
agent-browser wait --text "Welcome"     # Wait for text
agent-browser wait --url "**/page"      # Wait for URL pattern

# Capture
agent-browser screenshot
agent-browser screenshot --full         # Full page
agent-browser screenshot --annotate     # With numbered element labels
agent-browser pdf output.pdf

# Diff (verify changes)
agent-browser diff snapshot             # Compare current vs last snapshot
agent-browser diff screenshot --baseline before.png

# Tab management
agent-browser tab list
agent-browser tab new https://example.com
agent-browser tab 2
agent-browser tab close

# Sessions
agent-browser --session site1 open https://site-a.com
agent-browser session list
```

## Authentication

```bash
# Auth vault (recommended)
echo "$PASSWORD" | agent-browser auth save github --url https://github.com/login --username user --password-stdin
agent-browser auth login github

# Session persistence (auto-save/restore)
agent-browser --session-name myapp open https://app.example.com/login

# State file
agent-browser state save ./auth.json
agent-browser state load ./auth.json

# Connect to existing Chrome
agent-browser --auto-connect open https://example.com
```

## Efficiency Patterns

- Use `--urls` with snapshot to get all href URLs upfront — visit directly instead of clicking and navigating back
- Snapshot once, act many times — never re-snapshot the same page
- Multi-page: get URLs in one snapshot, then batch each target site separately

## Ref Lifecycle

Refs (`@e1`, `@e2`) are invalidated when the page changes. Always re-snapshot after clicks that navigate, form submissions, or dynamic content loading.

## Security

```bash
# Content boundaries (recommended for AI agents)
export AGENT_BROWSER_CONTENT_BOUNDARIES=1

# Domain allowlist
export AGENT_BROWSER_ALLOWED_DOMAINS="example.com,*.example.com"

# Output limits
export AGENT_BROWSER_MAX_OUTPUT=50000
```

## JavaScript Evaluation

```bash
# Simple expressions
agent-browser eval 'document.title'

# Complex JS: use --stdin with heredoc
agent-browser eval --stdin <<'EVALEOF'
JSON.stringify(Array.from(document.querySelectorAll("a")).map(a => a.href))
EVALEOF
```

## Related Skills

- `playwright` — committed regression tests and existing Playwright suites
- `seo-audit` — SEO auditing (uses browser for schema detection)
- `web-design-guidelines` — UI compliance checking
