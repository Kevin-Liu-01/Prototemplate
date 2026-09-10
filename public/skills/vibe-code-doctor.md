# Vibe-Code Doctor

> Vibe-coded projects don't fail because the demo doesn't work — they fail because **nobody can make sense of the code, it breaks at integration points, the architecture was never decided, and ops/security were skipped**. This doctor scores those failure modes 0-100 and drives them to green. [Source: r/Anthropic "why vibe coded projects fail," 2026; doctor-pattern]

Follows the **doctor-pattern**: score on unique failing rules (a rule broken 200× costs the same as once → fix systemically), errors weigh 2× warnings, then a fix loop re-scores until 100. See `wiki/concepts/doctor-pattern.md`. This doctor is the **umbrella audit** — it delegates layer-specific work to `react-doctor` (React), `deepsec` (vulns), `og-metadata-audit` (OG), and the project's own `doctor.ts` where they exist, and adds the lens those miss.

## Score

```
score = 100 − 1.5 × (unique error rules failed) − 0.75 × (unique warn rules failed)   # clamp ≥ 0
```

Run all six categories; report a per-category and overall score, then fix loop.

## The six failure-mode categories

### 1. Comprehension & maintainability (the core failure)
*"What defines vibe coding is not being able to make sense of the code."* If the author can't explain a module, it's unmaintainable.
- **error**: god files (>500 lines doing many jobs), large copy-paste duplication, no `AGENTS.md`/README explaining structure, dead/unreachable code, inconsistent patterns for the same job.
- **warn**: missing/》narrative-only comments on non-obvious logic, no module boundaries, magic numbers/strings.

### 2. Integration (where it actually breaks)
*"Each module looks solid in isolation, breaks at integration points."*
- **error**: no end-to-end test of the primary user flow; module contracts assumed not verified (untyped boundaries between front/back, optimistic API shapes); happy-path-only handling of external calls (no failure path on fetch/DB/3rd-party).
- **warn**: no contract/integration tests; no schema validation at trust boundaries (zod/pydantic).

### 3. Verification
- **error**: no tests at all; no typecheck (`tsc`/mypy) in the pipeline; no lint; no CI gate before merge.
- **warn**: tests assert the happy path only; no test for the bug that was just fixed.

### 4. Security (delegate deep scan to deepsec / react-doctor)
- **error**: secrets hardcoded or client-exposed (`NEXT_PUBLIC_*` secret, `.env` shipped to client); auth missing on a mutating route / server action; SQL built by string concat; `dangerouslySetInnerHTML` on user input; unvalidated input reaching a sink.
- **warn**: no rate limiting on public endpoints; permissive CORS; no Stripe-webhook signature check (→ `stripe-webhook-hardening`).

### 5. Data & ops
- **error**: schema changes without migrations / direct prod DB mutation; no error handling/logging on critical paths; no reproducible env ("works on my machine" — no lockfile/Docker/`.nvmrc`); unpinned or supply-chain-risky deps.
- **warn**: no observability (no structured logs/metrics on the hot path); no backup/restore story; N+1 queries / unoptimized images.

### 6. Architecture (the decisions that got skipped)
*"There are a lot of architectural decisions you have to make."*
- **error**: no clear state model (state scattered/duplicated); no separation of concerns (UI doing data + business logic); premature microservices OR a monolith with no internal boundaries.
- **warn**: no ADR/decision record for load-bearing choices; abstraction with a single consumer (speculative) or none where there should be one.

## Workflow

1. **Detect the stack** (Next/React, Python, etc.) and which sibling doctors apply.
2. **Run delegated doctors first**: `npx react-doctor@latest` (+ React Security Doctor), `deepsec`, project `doctor.ts`. Fold their findings into categories 3–5.
3. **Run the six-category audit** above; record each failing rule once (unique-rule scoring).
4. **Score** overall + per category; **lead with the squint test**: "if a senior engineer inherited this tomorrow, what breaks first?"
5. **Fix loop** (doctor-pattern): fix **errors serially** (re-typecheck/test after each, revert on failure), **warnings batched** (validate once, fall back to serial to isolate), then re-scan to confirm the score rose. Ratchet a `--min-score` gate upward.
6. **Output** (below).

## Output format

```markdown
## Vibe-Code Doctor — <project>

**Overall: XX / 100**  ·  Comprehension X / Integration X / Verification X / Security X / Data&Ops X / Architecture X

### Will-break-first (squint test)
- [the 1-3 things that fail when this leaves the demo]

### Fix (by severity)
1. **[rule]** — ⚠️ Critical / ⚡ Important / 💡 Polish · Current → Why it fails in prod → Concrete fix
### Quick wins (if you have 30 min)
- [ ] highest-impact fixes
```

## Anti-patterns for this doctor itself
- Don't re-flag what `react-doctor`/`deepsec` already own — cite and delegate.
- Don't conflate "small" with "broken": a small, well-understood project can score 100. The disease is *incomprehension + skipped decisions*, not size.
- Score on unique rules, never raw occurrence counts.
