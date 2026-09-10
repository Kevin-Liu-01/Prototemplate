# Security Doctor Chain

Use this skill as the selector and runbook for security-sensitive pre-ship work.
It does not replace the underlying doctors; it decides which ones to run, in
which order, and what evidence is required before saying the repo is safer.

## Hard Rules

- Read each selected underlying `SKILL.md` before running that doctor.
- Never run a full deepsec `process` without Kevin approving the projected cost.
  A `--limit 50` calibration is allowed and expected.
- Run broad, subsystem-specific scanners before final PR review. Use
  `no-sus-code-doctor` as the last gate, not as a substitute for deep scanning.
- If a selected tool is unavailable, record the failure, run the closest manual
  fallback, and leave a clear residual-risk note.

## Intake

Before choosing the chain:

1. Identify the repo root, package manager, app/package root, and changed paths.
2. Classify the risk surface:
   - React UI: components, routes, forms, auth/session UI, admin UI, HTML sinks.
   - Backend/service: APIs, server actions, auth, permissions, data access,
     secrets, webhooks, queues, multi-tenant boundaries, payments.
   - Inherited/AI-generated codebase: unclear ownership, broad generated code,
     user says "vibe-coded" or "production-ready".
   - Security-critical subsystem: sandboxing, signing, crypto, isolation,
     policy, permissions, arbitrary user input, file/network access.
   - PR closeout: user asks for "no sus", "score to 100", or merge readiness.
3. Name what would be unacceptable to miss: XSS, auth bypass, data leak, RCE,
   SSRF, privilege escalation, secret exposure, supply-chain drift, or broken
   rollback path.

## Chain Selection

| Surface or request | Run first | Then | Final gate |
| --- | --- | --- | --- |
| React, Next.js, Vite, or React Native UI | `react-doctor` with React Security Doctor mode | repo tests and browser proof for changed behavior | `no-sus-code-doctor` |
| Auth/session UI, admin UI, user input, URL handling, `dangerouslySetInnerHTML`, client secrets | `react-doctor` security mode | `security-best-practices` for the framework | `no-sus-code-doctor` |
| Backend API, service, webhook, data layer, secrets, permissions, or multi-tenant code | `security-threat-model` if boundaries are unclear | `deepsec` scan + `process --limit 50`, then approve before full process | `no-sus-code-doctor` |
| AI-generated, inherited, or vibe-coded repo | `vibe-code-doctor` | follow delegated `react-doctor` / `deepsec` / test findings | `no-sus-code-doctor` |
| Day-0, adversarial, CTF-style, sandbox, or exploit-prone subsystem | `security-threat-model` | `deepsec`, then `bugs` on the highest-risk files | `no-sus-code-doctor` |
| Skill/tool import, plugin install, or untrusted agent capability | `skill-auditor` | inspect source, install count, provenance, and lockfile changes | `no-sus-code-doctor` if code/config changed |

## Version Checks

For serious runs, verify current package versions:

```bash
npm view react-doctor version dist-tags --json
npm view deepsec version dist-tags --json
```

Record the versions in the output. If the version differs from the wiki tool
page, update the page in the same closeout.

## Execution Pattern

1. State the selected chain and skipped doctors with reasons.
2. Run deterministic local checks first when they are cheap: typecheck, lint,
   unit tests, or existing repo doctor.
3. Run subsystem doctors:
   - React/UI risk -> `react-doctor`.
   - Repo-wide security risk -> `deepsec scan`, then `process --limit 50`.
   - Architecture/trust-boundary uncertainty -> `security-threat-model`.
   - Language/framework secure defaults -> `security-best-practices`.
   - Exploit hunting -> `bugs`, focused on files surfaced by the prior passes.
4. Fix or report critical findings before continuing. Do not bury blockers in
   a summary.
5. Run `no-sus-code-doctor` after fixes as the final reviewer-facing quality
   gate.

## Output

Return:

- selected chain and why
- versions checked
- commands run and exit status
- doctor scores or finding counts
- findings fixed, findings deferred, and residual risk
- proof commands after fixes
- any wiki/tool/skill updates made because routing or versioning changed
