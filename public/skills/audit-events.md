# Audit Events

Use this skill when deciding whether product code should create an audit event, and how to write that call correctly.

This skill is for adding or reviewing audit event log calls in product code. Do not redesign the audit system unless the product event you are wiring requires a narrowly scoped helper or enum change.

## Current System

- Event types: `packages/node/src/database/audit/auditEventTypes.ts`
- Payload builders: `packages/node/src/database/audit/auditEventBuilders.ts`
- Write helpers (the only two callers may use; both live in `recordAuditEvent.ts` and take the same `AuditEventInfo`):
  - `recordAuditEvent()` — fail-closed; throws if the event cannot be written.
  - `tryRecordAuditEvent()` — fail-open; identical except failures are logged and swallowed.
  - Both resolve scope through `resolveAuditScope()` (project → org, org → enterprise backfill) unless `scope: 'user-level'`.
  - The actor type is part of the info: `actor: { type: AuditActorType.USER, ...user }` (or `GT_ADMIN` / `API_KEY` / `SYSTEM`).
  - Both accept an optional `Prisma.TransactionClient` second argument — pass the `tx` to write the event atomically with the mutation it records (all-or-nothing).
- Request context: `buildAuditRequestContext(headers)`

## Common Imports

```ts
import { AuditActorType, AuditEventResult } from '@generaltranslation/db/client.js';
import { AuditEventType } from '@generaltranslation/node/database/audit/auditEventTypes.js';
import { buildAuditRequestContext } from '@generaltranslation/node/database/audit/requestContext.js';
import { recordAuditEvent, tryRecordAuditEvent } from '@generaltranslation/node/database/audit/recordAuditEvent.js';
```

## What To Read

- For deciding whether an action needs an event: read `references/coverage.md`.
- For choosing fail-closed/fail-open behavior and call placement: read `references/failure-and-placement.md`.
- For constructing the event payload safely: read `references/payloads.md`.
- For checks to run after adding/changing audit calls: read `references/verification.md`.

## Quick Rules

- Audit security-relevant mutations, auth/account-control events, membership/permission changes, SSO/SCIM changes, API key changes, super-user access, and explicitly sensitive data access.
- Do not audit ordinary page views, normal dashboard reads, background internal reads, or high-volume routine operations unless explicitly requested.
- Use past-tense `event_type` values: `user.created`, `project.updated`, `enterprise.deleted`, `sso.provider.updated`.
- Keep `AuditEventType` limited to events that are actually wired to product code.
- Fail closed for security-critical mutations; record before mutation when all required fields are known.
- Never log secrets, private keys, tokens, certificates, SAML XML, signing secrets, API keys, or file contents.

## When Reviewing

- Check for missing audit events near sensitive mutations, auth/account-control flows, membership/permission changes, SSO/SCIM changes, API key changes, super-user access, and sensitive data access.
- Check that the call site uses the right helper for the actor and surface: customer user, GT admin, API key, system, fail-open, or fail-closed.
- Check metadata and changes for secrets, raw config, file contents, SAML XML, certificates, signing secrets, tokens, and other unsafe values.
- Check that new `AuditEventType` entries are wired to real product code and are not stale or speculative.
- Check placement and failure behavior: fail-closed events should block the mutation on audit failure; fail-open events should use `tryRecordAuditEvent()` and should not hide primary operation failures.
