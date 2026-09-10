# Sites Hosting

Use this skill for local preparation of deployable Sites source and build artifacts. Use the Sites
connector and tool descriptions as the source of truth for site creation, environment variables,
source credentials, versions, deployments, and access control.

Do not finish deployable site work with only a local build unless the user explicitly asks to
keep the work local. Complete the hosting workflow described by the connector, or
report the concrete blocker and ask for the action needed to continue.

## Plan Continuity

When `update_plan` is available, continue the plan created by `sites-building`
through source preparation, version saving, deployment, and verification. Do
not replace the plan when transitioning from building to hosting.

For a standalone multi-step hosting request without an existing plan, call
`update_plan` before source preparation. Make its concise milestones describe
the publishing work in plain language, such as preparing the site, confirming
access, publishing it, and verifying the live link. Group source preparation,
credentials, commits, artifacts, version saving, deployment calls, and status
polling beneath those phases instead of exposing them as plan steps. Keep
exactly one step `in_progress`, preserve the original wording unless scope
changes, update the plan whenever the active step changes, and use the tool
itself instead of a prose checklist. Skip plan creation for a single read-only
hosting lookup.

## Configuration Contract

Store hosting metadata in `.openai/hosting.json`.

- `project_id`: the persisted identifier returned by `create_site`. Omit it until the site is created.
- `d1`: optional logical Cloudflare D1 binding name.
- `r2`: optional logical Cloudflare R2 binding name.

Runtime environment values are managed through the Sites connector, not in
`.openai/hosting.json`. Keep local `.env` and `.env.example` keys aligned with the runtime keys
needed for local development.

## Compatible Projects

Prepare sites that can build deployment artifacts for Cloudflare Workers.

- Prefer this plugin's bundled vinext starters for new sites.
- For existing Next.js sites, use a Cloudflare Workers-compatible build path such as OpenNext
  when needed.
- For other frameworks, use the site's Cloudflare-compatible build path when one exists.
  Refer to Cloudflare's web application framework guides:
  https://developers.cloudflare.com/workers/framework-guides/web-apps/
- Do not use frameworks that cannot produce Cloudflare Worker deployment artifacts.

## Preview and Browser Gate

- Ensure the visible `open_in_codex` preview handoff from `sites-building` has been attempted before
  validation, packaging, or deployment. If it has not, perform that exact handoff now. A browser
  handoff failure does not block deployment: report it, do not claim the preview is open, and
  continue. Server, build, artifact, and deployment failures still follow their normal gates.
- Run browser UI testing or visual QA only when the user explicitly requests it. Otherwise omit it
  from the plan and perform no browser inspection or interaction, even when there is a good reason.
- Unless the user explicitly requests a Sites deployment thumbnail, do not launch, connect to,
  resize, inspect, or control a browser to produce one. A missing screenshot is valid and must not
  block validation, version saving, or deployment.

## Local Validation

Before preparing a version artifact:

1. If the D1 schema changed, generate and inspect the local migration output.
2. Run the site's deployment build command, usually `npm run build`. If `package.json` defines a
   Cloudflare-specific deployment build, use that instead.
3. Fix validation failures before continuing.

## Source Preparation

Sites versions record a Git commit SHA. Prepare and push the exact source state used for the
deployment build before saving a version through the connector.

- Reuse the source credential returned by `create_site` or
  `create_source_repository_write_credential` until it expires, supplying it through a
  per-command HTTP authorization header.
- Do not add the credential to a Git remote URL or Git configuration.
- Use the pushed branch-head commit SHA as the version's `commit_sha`.

## Artifact Preparation

Prepare the uploaded artifact from the exact source state represented by `commit_sha`.

Treat `public/screenshot.jpeg` as an optional deployment thumbnail. During normal hosting, do not
create, refresh, or delete it; preserve an existing file unchanged. Only create or refresh it when
the user explicitly requests a Sites deployment thumbnail. A generic screenshot request does not
imply a deployment-thumbnail update.

For an explicitly requested Sites deployment thumbnail, use a representative state of the final
working implementation, not a source mock. Capture the visible browser viewport once at `1200x750`
(`16:10`), reset any temporary viewport override, and keep the canonical filename and location.
Do not inspect, compare, or iterate on the result unless the user also requested UI QA. If capture
is unavailable or fails, report it truthfully and continue deployment.

1. Stage the current build output in a temporary directory with `dist/` as the archive root.
2. If `.openai/hosting.json` is not already packaged by the build, copy it to
   `dist/.openai/hosting.json`.
3. If `drizzle/` exists and is not already copied, copy it to `dist/.openai/drizzle/`.
4. Verify the staged artifact contains:
   - `dist/server/index.js`
   - `dist/client/**` or `dist/server/public/**` when static assets exist
   - `dist/.openai/hosting.json`
   - `dist/.openai/drizzle/**` when migrations exist
5. Create a tar archive from the staged directory, for example:
   `tar -C "$staged_root" -czf "$archive_path" dist`.

Use the connector's parameter descriptions for the complete archive validation contract and the
save and deployment flow.

## Deployment Selection

After saving a site version, deploy it unless the user explicitly asked to keep the work local.

1. If `deploy_private_site_version` is available in the current tool catalog, call it first for the
   normal Sites flow. It verifies owner-only access server-side and deploys only when the current
   caller is the sole explicitly allowed viewer and no groups are allowed.
2. If `deploy_private_site_version` is unavailable, or private deployment fails because the site is
   shared, public, or cannot be verified as owner-only, do not call `deploy_site_version`
   automatically. Ask the user to approve deploying the site to its configured audience.
3. Use `deploy_site_version` only after the user explicitly requests or approves deploying the
   shared, public, or access-unverified site.
4. For either deployment tool, poll `get_deployment_status` until the deployment reaches a terminal
   state before reporting completion.

## User-Facing Handoff

Treat the deployed Sites URL as the user-facing deliverable. Do not attach or link the local site
source, build output, upload archive, or individual code files in chat unless the user explicitly
asks to receive those files. Keep temporary packaging artifacts out of user-facing output folders.
After a successful deployment, return the deployed URL and a concise summary of the result.
