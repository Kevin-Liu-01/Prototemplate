# Service CLI Registry

Use this skill when the user asks for work involving a SaaS or infrastructure product and no more specific installed skill already owns the task.

This is the routing layer for `config/capability-harvest-seeds.json` and `wiki/tools/service-cli-coverage.md`. It turns the harvested registry into agent behavior without installing every MCP or bespoke skill.

## First Action

1. Check for a more specific installed skill:
   - `rg --files skills/personal | rg '<service>|<domain>'`
   - `qmd search "<service> skill mcp cli"`
2. If a service-specific skill exists, use it first.
3. If not, use `wiki/tools/service-cli-coverage.md` and `config/capability-harvest-seeds.json` to identify the preferred interface.
4. If the service is missing, search the latest harvest:
   - `npm run promote:capabilities -- --limit 25`
   - `rg -i "<service>" raw/registries/agent-capabilities config/capability-harvest-seeds.json`

## Interface Order

Prefer the lowest-friction interface that can do the job:

| Rank | Interface | Use when |
| --- | --- | --- |
| 1 | Specific installed skill or plugin MCP | The task matches an installed capability and the tool is available. |
| 2 | First-party CLI | The CLI has a stable documented surface and the task is shell-friendly. |
| 3 | Existing PrintingPress CLI | Repeated API/data work benefits from local SQLite sync + search/sql. |
| 4 | Official MCP / Smithery candidate | The agent runtime needs MCP and the server has credible source/auth metadata. |
| 5 | Raw HTTP/API | Last resort after checking docs and credentials. |

Do not install MCPs from the raw harvest just because they exist. Treat MCP candidates as leads that need auth, permission, and owner review.

## Calling a service versus building a project CLI

Do not conflate these jobs:

- **Call a service:** prefer the service-specific skill, official CLI, existing
  PrintingPress CLI, official generated client, MCP, then raw HTTP.
- **Build a project CLI:** keep ordinary TypeScript and the incumbent argument
  parser for a small command surface. Consider pinned Stricli only when nested
  typed routes, isolated/injectable context, lazy command loading, library mode,
  and shell completion are actual requirements.
- **Generate a service client:** prefer the provider's official, versioned
  client. Verify schema provenance, package/license/version, transport and
  runtime dependencies, optional validation path, typed documented versus
  unknown errors, pagination bounds, auth/base URL ownership, rate limits,
  retries/idempotency, and mutation authority. Generated types do not validate
  runtime responses unless the selected entry point actually does so.

## Release-toolchain branch

Compose only the stages the project needs:

1. **Prepare:** freeze source revision, clean-worktree rule, release version,
   changelog inputs, configuration digest, and dry-run/preview. Keep native
   project scripts first.
2. **Publish:** use pinned Craft only when one governed workflow must coordinate
   real multi-target release branches, changelogs, CI artifacts, and registries.
   A prepared release is not approved to publish.
3. **Package:** use pinned Fossilize only when Node SEA is the chosen
   multi-platform distribution. Prove Node/version, OS/architecture/libc,
   bundled assets/native modules, signing/notarization, artifact digests, and
   platform smoke tests.
4. **Update:** use pinned binpatch only after measuring that full-binary update
   bandwidth or latency is a product problem. Require generation and application
   halves, authenticated manifest, exact base/target digests, bounded patch
   resources, ordered-chain and cumulative verification, safe atomic replace,
   full-download fallback, interruption recovery, and rollback.

Before publish or executable replacement, load
`wiki/workflows/workflow-run-contract.md#release-and-self-update-proof-profile`.
Record the exact target account/registry/channel, artifacts and hashes,
SBOM/provenance/signing, the separately approved mutation-plan digest, remote
receipts, post-release checks, and rollback. Never infer update authority from
the existence of an update command or grant five tools authority because they
appeared in one thread. [Source: X `2082947912498024751`,
`2082947914599469127`, `2082947917237928407`, `2082947920056483928`,
`2082947922648281278`; exact-revision Stricli, Sentry API, Craft, Fossilize, and
binpatch exploration receipts, 2026-08-12]

### Coolify branch

For Coolify deployment or infrastructure work, load [[coolify]] before acting.
Use its built-in team-scoped MCP with an expiring `read` token for inventory,
health, deployments, and logs. The current docs call MCP read-only while also
listing lifecycle tools under a `deploy` ability, so a routine MCP connection
must not carry `deploy`, `read:sensitive`, `write`, or `root`. For an approved
mutation, freeze team/project/environment/server/resource UUIDs and current
health/backup/rollback state, then use a separate short-lived `deploy` token for
lifecycle actions or the official `coolify` CLI/API with explicit `write`
authority. Capture deployment ID, health/logs, DNS/TLS, backup/restore when data
is involved, cancel/rollback, and canonical writeback.

### Shopify branch

For Liquid themes, landing or product pages, Admin GraphQL, store data, Theme
Check, or publication, stop and load the more specific `shopify-commerce` skill
plus [[shopify]]. Shopify Dev MCP is the docs/schema/validation surface, not an
authenticated Admin connection. Shopify CLI owns named-store/theme context and
development or unpublished theme previews. Default to read-only context, minimum
Admin scopes, no customer data in prompts or receipts, and no live-theme publish
or store mutation without an exact plan, reversal, and explicit approval.

## Safety Gates

Before any SaaS/infra command:

1. **Identify account/context.** Print the current account, org, subscription, project, region, cluster, namespace, or tenant before using it.
2. **Read first.** Prefer list/show/status/log commands before create/update/delete.
3. **Use previews.** Run `--dry-run`, `plan`, `preview`, `diff`, `validate`, `template`, or equivalent before mutation.
4. **Ask before destructive or expensive changes.** This includes deletes, prod deploys, infra applies, paid resource creation, broad permission changes, email/message sends, and anything involving user/customer data.
5. **Prefer scoped credentials.** Do not ask for global admin tokens when a read-only or project-scoped token works.

## High-Priority Missing Areas Covered

Use this skill to cover recurring gaps that do not need their own local skill yet:

- Developer platforms: GitLab via `glab`; GitHub defaults to `gh`.
- Clouds: AWS via `aws`, Google Cloud via `gcloud`/`bq`; Azure has dedicated personal skills.
- Infra: Docker, Kubernetes, Helm, Terraform, Pulumi, Ansible.
- Observability: Sentry CLI, Datadog CI, New Relic CLI, Grafana CLI.
- Data and warehouses: PostgreSQL, MySQL, MongoDB, ClickHouse, Snowflake, Databricks, BigQuery.
- Product SaaS: Auth0, Okta, Twilio, SendGrid, Contentful, Sanity, Strapi, Algolia.
- Self-hosted PaaS: Coolify through its official MCP, `coolify` CLI, and REST
  API, governed by [[coolify]] and the self-hosted-PaaS capability route.

## Verification

After using a service CLI, capture:

- command(s) run
- account/context observed
- whether the command was read-only, dry-run, or mutating
- artifact/result path if one was generated

For project-CLI and release work, additionally capture:

- selected stage and why simpler project-native code was insufficient
- exact package/repository revision and license
- prepare/changelog/target preview
- artifact platform, bytes, hashes, signing, provenance, and smoke-test results
- publish or executable-replacement approval digest and remote receipt
- fallback, rollback, partial-failure, and recovery proof

For recurring successful patterns, update `wiki/tools/service-cli-coverage.md` or create a service-specific skill.

## Related Skills

- `shopify-commerce` - specific Shopify theme, Admin, CLI, and publication workflow.
- `find-skills` - discover upstream skills before hand-rolling.
- `skill-auditor` - audit external skills before install.
- `wrangler`, `supabase`, `clerk-setup`, `firebase-basics`, `azure-*`, `gws-*` - service-specific owners where already installed.
