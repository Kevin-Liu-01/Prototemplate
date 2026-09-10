# Hermes Operator Stack

## Overview

Use this skill to keep Kevin's persistent Hermes setup coherent across machine,
model, memory, browser, messaging, cron, and wiki writeback layers. Architecture
intent is not deployment state: never call Hermes or an external memory provider
active until the target machine has a version, config, doctor, behavior, and
recovery receipt.

## Required Reads

Read these before making recommendations or edits:

1. `wiki/architecture/hermes-mac-mini-agent-os.md`
2. `wiki/tools/hermes-agent.md`
3. `wiki/architecture/hermes-harness.md`
4. `wiki/tools/hindsight.md`
5. `wiki/tools/honcho.md`
6. `wiki/tools/agent-browser.md`
7. `wiki/tools/agent-client-protocol.md`
8. `wiki/meta/capability-routing-map.md`

## Audit Workflow

Check the stack in this order:

1. **Runtime** - Hermes is the persistent operator; Codex, Claude Code, OpenCode, and local models are workers, not the source of truth.
2. **Memory** - Kevin-Wiki/qmd is active canonical memory. Hindsight is the selected external runtime-memory candidate/default only after the Hindsight admission gate below passes. Honcho is the separate profile/modeling layer via MCP/SDK or a separate profile.
3. **Browser** - agent-browser is the default browser automation surface. Use logged-in Chrome for auth-heavy flows. Use Playwright only for committed regression tests or existing repo test suites.
4. **Interfaces** - Telegram topic threads are the primary ops console; Hermes Desktop over SSH is the rich local console; Discord, WhatsApp, terminal, and ACP are secondary surfaces.
5. **Schedulers** - Use no-agent launchd or Hermes cron for deterministic monitors. Wake Hermes only when summarization, ranking, triage, or drafting requires reasoning.
6. **Intake** - Route feeds, Raindrop, YouTube, X/Last30Days/BirdClaw, LinkedIn, Economist, and FT through summaries first, deletion second, deep engagement selectively.
7. **Writeback** - Durable facts, preferences, failed guesses, decisions, and reusable workflows must land in wiki pages, skills, automations, or logs.

### Web extraction benchmark gate

Hermes/Scrapling launch claims, including the saved “up to 60x” claim, are
candidate evidence rather than a default-route change. Before routing a source
class through Hermes scraping, freeze representative public URLs and compare it
with direct fetch/reader extraction and agent-browser where rendering is
required. Record successful extraction, required fields, citation/locator
fidelity, latency distribution, token and provider cost, retries, blocks,
fallbacks, and terms/data handling. Promote only the measured source class and
configuration. If the benchmark artifact is absent or current releases have an
open performance regression, keep the incumbent browser route.

## Preferred Commands

Use only when Hermes or agent-browser is installed in the target environment:

```bash
hermes config check
hermes plugins
hermes memory setup
hermes acp --check
hermes send --list
agent-browser doctor
agent-browser batch "open https://example.com" "snapshot -i" "close"
```

For repo changes in `kevin-wiki`, close the loop with:

```bash
npm run skill-registry
npm run routing-doctor
npx tsx scripts/build-index.ts
qmd update
qmd embed
```

## Hindsight Admission Gate

Before recommending an install, read the complete current Hindsight source page
and name the runtime job that qmd/wiki and Hermes built-in memory do not satisfy.
Before saying Hindsight is active or healthy:

1. record the pinned Hindsight core and harness-integration versions;
2. verify the actual executable/config paths without downloading a package as a
   side effect merely to run `status`;
3. declare API/database, extraction/reflect model, embeddings, reranker, and all
   provider egress independently;
4. define a worktree-aware per-repository or per-user bank map; use a shared bank
   only with mandatory source/repository tags and strict matching;
5. diff every hook, MCP, skill, or agent configuration mutation and keep an
   uninstall/rollback path;
6. pass readiness plus retain → recall → reflect smoke tests and record the
   recall-versus-reflect latency/cost difference;
7. pass invented cross-bank and cross-tag leakage cases with zero violations;
8. compare no-memory, raw-context, recall-only, and reflect arms under the same
   corpus, answer model, budget, and scorer; and
9. export a representative bank, restore it into an empty target, re-run frozen
   queries, verify provenance/scope, and prove durable corrections still promote
   through Kevin-Wiki owners.

Do not install or configure Hindsight merely because a source review finds it
useful. Installation mutates the machine and agent harnesses; it belongs to the
environment-bootstrap workflow and requires the user's requested target scope.

## Decision Rules

- Prefer Mac Mini M4 Pro 48GB for the always-on local operator box; treat older Apple Silicon as a prototype lane.
- Keep model routing pluggable. Do not bake one model into the architecture without an eval or local availability check.
- Keep Hindsight and Honcho separate unless Hermes explicitly supports a combined provider mode. One active memory provider means one active slot.
- Prefer recall when the acting agent should reason over bounded evidence. Use reflect only for deliberate synthesis with citations, model/cost receipt, and an unavailable/degraded state.
- Treat facts, observations, and mental models as derived runtime memory. Preserve immutable source revisions outside Hindsight and require governed writeback before changing canonical behavior.
- Prefer one bank per user, authority, or repository. A shared bank must stamp provenance, use strict tag matching, and pass leakage tests; never infer isolation from “one local instance.”
- Treat local API transport, local inference, local embeddings/reranking, and local storage as separate claims. A loopback endpoint backed by a cloud model is not fully local.
- Treat export support as a capability, not recovery proof. Require a fresh-target restore and frozen-query replay before provider promotion.
- Keep qmd/Obsidian as the durable knowledge repository. Runtime memory is cache and recall until written back.
- Use `hermes send` or no-agent cron for script output. Use an agentic cron only when the message content requires reasoning.
- Ask before enabling account-mutating browser actions, adding new credentials, or scheduling unattended paid model calls.
- Do not repeat upstream scraping multipliers as local facts without the frozen corpus, comparator, versions, run artifacts, and reproduced distribution.
