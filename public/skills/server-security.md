# Server Action Security

Server actions are public HTTP endpoints. Any authenticated user can call any action with any arguments — the component that renders the form is **not** a security boundary. Every action authenticates, authorizes, and validates its own parameters, independently.

## Take only the parameters you need

Every parameter is attack surface. Accept the **minimum** set of params the action needs, and **derive everything else server-side** from them. To delete a project from an org, take `projectId` and look up its `org_id` from the session/DB — do **not** also accept `orgId` as a parameter. A value you never accept can't be forged, and there's nothing to cross-check. This eliminates most of the binding bugs below before they can exist.

Only accept a param when the action genuinely needs it and it cannot be derived from a param you already hold. When two params are both unavoidable, bind them (next).

## Bind the params you must take

**Bind every remaining parameter to the authorized entity.** Authorizing one parameter does not make the others safe. For `inviteUserAction(orgId, email, roleId)`, checking permission on `orgId` is useless unless you also verify `roleId` belongs to `orgId` — otherwise a caller injects another org's (or a higher-privileged) role. This is the most common vulnerability class here: cross-tenant IDOR and privilege escalation.

A secondary param is safe only when **one** of these holds — trace it end to end:
- The downstream query scopes it: a Prisma `WHERE` containing both the resource id **and** the authorized entity id (`where: { id: roleId, org_id: orgId }`), or
- The action verifies ownership before use (`if (project.org_id !== orgId) return notAuthorized`).

`checkAuthorization(entityId, …)` followed by an unscoped `findUnique(resourceId)` is a hole.

## Every action, in order

1. **Authenticate:** `const session = await getSession(); if (!session?.user) return { success: false, error: 'Not authenticated' };`
2. **Authorize** the entity the mutation actually scopes to: `checkAuthorization(entityId, permission, session)`. An org-scoped write checked against an enterprise permission (or vice-versa) is a bug.
3. **Minimize, then bind:** derive parent params from the resource instead of accepting them; bind any secondary param you must take to that entity (see above).
4. **Validate values:** names via `isValidOrgOrProjectName`, locales via `validateLocale`, plans/tiers/prices against a server-side whitelist, webhook URLs against the allowlist. Never trust client-supplied privileged values (role, plan, price, provider/customer ids) — resolve them server-side or verify ownership.
5. **Mutate, then check the result.** If the DB helper returns `false`/`null` on a rejected or scoped-out write, surface it — don't report success blindly.

## Factor the gate into one helper per action

Don't repeat the auth + scoping dance inline in every action. Write a **non-exported** helper in the same file that runs the full gate and returns the resolved context or an error; each action calls it once. This keeps the boundary consistent, reviewable in one place, and hard to forget.

```ts
type AuthResult<T> = { ok: true; ctx: T } | { ok: false; error: string };

// Not exported — internal to this action file.
async function authorizeProjectWrite(
  projectId: string
): Promise<AuthResult<{ user: AuthorizedUser; project: AuthorizedProject }>> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };
  const user = session.user as AuthorizedUser;

  if (!checkAuthorization(projectId, 'project:write', session))
    return { ok: false, error: 'Not authorized' };

  // Derive the org from the project — never accept orgId as a parameter.
  const project = user.projects.find((p) => p.id === projectId);
  if (!project) return { ok: false, error: 'Not authorized' };

  return { ok: true, ctx: { user, project } }; // project.org_id available downstream
}

// Takes only projectId; the org is derived from the project, not passed in.
export async function deleteProjectAction(projectId: string) {
  const auth = await authorizeProjectWrite(projectId);
  if (!auth.ok) return { success: false, error: auth.error };
  // ...delete uses auth.ctx.project (and auth.ctx.project.org_id if needed)
}
```

## Recurring traps

- **OR-authorization without binding.** `canWriteOrg(orgId) || canWriteProject(projectId)` lets a user with permission on *their* org act on a project in *another* org. After the OR, still verify `project.org_id === orgId`.
- **Shared parent resources.** An org inside an enterprise shares the enterprise's billing/config. Org-scoped permission must not act on the enterprise resource — reject when `org.enterprise_id` is set (or authorize the enterprise instead).
- **Decoupled scope params.** When an action takes both a child param and a parent param (`projectId` + `orgId`), one is authorized while the other silently drives billing/features/credentials. Prefer dropping the parent param and deriving it from the child; if both are genuinely required, verify they belong together.
- **Ignored mutation results.** A helper that returns `false`/`null` on a scoped-out write makes the action lie about success unless the return is checked.

## Where to put the fix

- **Shared downstream function** when a resource must *always* be entity-scoped for every caller (e.g. a role must always belong to its org) — this also protects admin/API/SSO callers. Verify the change builds: `cd packages/node && pnpm build`.
- **The action** when the binding is specific to that flow.

When reviewing, for each parameter ask: *what stops a user from passing another tenant's param here?* If the answer isn't a scoped query or an explicit ownership check, it's a finding.
