# Doctor Enforcement

After a significant edit session, detect which subsystems were touched and run the relevant doctor(s) before reporting completion.

## Trigger Conditions

Run this skill when ANY of the following are true:

- Agent edited 5+ files in a single session
- Agent touched files across multiple packages in a monorepo
- User says "run doctors", "health check", "doctor pass", "check everything"
- Agent is about to claim a task is complete
- Session involved framework migration, dependency updates, or config changes

## Detection Logic

Check `git diff --name-only` (staged + unstaged) to determine which doctors to run:

| Files changed match | Run |
|---------------------|-----|
| `wiki/**`, `skills/**`, `config/**` | `npx tsx scripts/doctor.ts` (wiki-doctor) |
| `*.tsx`, `*.jsx`, `components/**`, `app/**`, `pages/**` | `npx react-doctor@latest` |
| Auth, admin, user input, URL handling, HTML sinks, secrets, API routes, server actions, webhooks, permissions, payments, multi-tenant, or sandbox files | `skills/engineering/security-doctor-chain/SKILL.md` |
| `**/*.test.*`, `**/tests/**`, production code under test | Read `.agents/skills/tests/SKILL.md`, then run smallest honest test layer |
| `package.json`, `tsconfig.*`, monorepo config | `npx @sylphx/doctor` (if monorepo) |
| Any frontend files | `agent-browser vitals <url>` (if dev server running) |
| `*.tf`, `infra/**` | Project-specific infra doctor |

## Test Changes (PR #2119 `/tests` skill)

When the diff touches tests or the code they cover:

1. Read `.agents/skills/tests/SKILL.md`.
2. Name the invariant under test. Prefer `invariant_*` or `design_*` names that could appear in an architecture doc.
3. Choose the smallest honest layer:
   - pure logic -> unit test path
   - interface contract -> integration boundary test
   - user-visible behavior -> integration or e2e
4. Run the narrowest command that can fail for the bug class you care about.
5. For bug fixes, run the new test before the fix when feasible. Report red-before-fix counts.
6. Before claiming done, run the litmus tests from the skill (architecture-doc name, pre-bug catch, refactor stability, no status codes in names).

Example targeted runs:

```bash
cd apps/website && pnpm exec vitest run tests/unit/clerk/user-handlers.test.ts
pnpm test website
pnpm typecheck website
```

## Execution

```bash
# 1. Detect what changed
git diff --name-only HEAD

# 2. Run matching doctors (examples)
npx tsx scripts/doctor.ts                    # wiki edits
npx react-doctor@latest                      # React edits
# security-sensitive edits: read skills/engineering/security-doctor-chain/SKILL.md
pnpm test <project>                          # smallest honest layer after reading tests skill
npx @sylphx/doctor                           # monorepo structure
agent-browser vitals http://localhost:3000    # frontend running

# 3. Report results
# If any doctor returns failures: fix before committing
# If warnings only: report to user, commit is OK
# If all pass: proceed
```

## After Running

1. Report the health score(s) to the user
2. If failures exist, fix them before claiming completion
3. If warnings exist, mention them but don't block
4. If the project doesn't have a relevant doctor, suggest adding one

When tests changed, also report:

- tests added and tests removed
- the invariant each new test covers
- red-before-fix results, if available
- final command output summary

## Rules

- Never skip doctors to save time. The 30 seconds a doctor takes prevents hours of debugging.
- If a doctor check fails, fix the root cause — do not suppress the check.
- If a failure pattern isn't caught by any existing doctor, propose a new check.
- In monorepos, run ALL doctors for changed surfaces, not just the one you think is relevant.
- For security-sensitive changes, run `security-doctor-chain` before final `no-sus-code-doctor`.
- Coverage is a map, not proof. Use it to find missing behavior, then write invariant tests.

## Related

- `.agents/skills/tests/SKILL.md` — invariant naming, smallest honest layer, litmus tests
- `skills/engineering/security-doctor-chain/SKILL.md` — security/pre-ship doctor composition
- `wiki/concepts/doctor-pattern.md` — the pattern definition and registry
- `wiki/concepts/lint-enforced-agent-guardrails.md` — enforcement hierarchy
- `skills/productivity/wiki-doctor/SKILL.md` — wiki-specific doctor
