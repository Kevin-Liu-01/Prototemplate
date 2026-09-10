# Site Building

Use this skill to create or modify sites.

## Fit Check

- Use this skill's bundled vinext starter for an unconstrained project.
- When `.openai/hosting.json` is present, use Sites and preserve the existing
  project structure.

## Visible Progress

For every site creation or multi-step site modification, when `update_plan` is
available:

1. Inspect the request and existing project enough to understand the real
   build phases, required capabilities, and likely validation path. Do not
   guess a plan immediately when read-only inspection can make it more
   accurate. Once the scope is grounded, call `update_plan` before the first
   product-source edit or long-running action.
2. Create 6–8 concise milestones that explain how Codex will build and deliver
   the site. Treat the plan as a plain-language build progress tracker, not as
   a walkthrough of how someone will use the finished product:
   - Describe concrete build phases such as setting up the project, adding
     data or storage when needed, building the main experience, adding
     interactions, refining the design, testing, and publishing. Include only
     phases the request needs and group lower-level work beneath them.
   - Start every step with an action verb. Use one build outcome per step,
     3–8 words, and at most 55 characters.
   - Prefer direct, literal, everyday language over vague, creative, or
     marketing language.
   - Make each phase specific enough to explain what is being built.
   - Describe Codex's build work, not instructions for using the finished site.
   - For new sites, begin with project setup when needed. For existing sites,
     begin with the first requested change. Put the first accurate, coherent
     working version as early as the build permits, usually within the first
     two or three milestones. Do not rush it ahead of required inspection or
     setup, and do not label a step as a preview, version, or handoff.
   - Cover the requested build, refinement, verification, and publishing when
     applicable. Keep milestones reasonably similar in scope without padding
     the plan.
   - Balance milestones by meaningful work, not exact clock time. Split a
     phase likely to contain most of the implementation and merge tiny
     bookkeeping phases. Verification or publishing may naturally be shorter.
     Do not front-load most work into the first milestone and then use later
     milestones as labels for work already completed.
   - Technical build phases are useful, but do not expose low-level tools or
     workflow details such as workspaces, starters, package managers, HMR,
     artifacts, source commits, hosting metadata, credentials, or deployment
     polling.
3. Keep the original step wording unless the requested scope or discovered
   implementation facts materially change. If a pending milestone becomes
   inaccurate or disproportionately large, revise the pending milestones
   before continuing; preserve completed milestone wording.
4. Keep exactly one step `in_progress` until the work is complete. Call
   `update_plan` whenever the active step changes. Advance the plan when the
   active milestone's outcome actually finishes. Do not perform several
   sequential milestones under one active step and batch-complete them later.
5. Before the final response, mark finished steps `completed` and leave any
   genuinely unfinished steps `pending` with the blocker explained.

Use the tool itself instead of merely writing an equivalent checklist in chat.
Skip plan creation only for a trivial, single-action request.

## Latency-Sensitive Fast Path

Open a First Meaningful Preview as early as it can accurately represent the
product while continuing the complete implementation. Correctness takes
priority over the earliest possible handoff.

1. Perform the bounded read-only inspection needed to select the site,
   persistence, storage, and authentication capabilities and make the first
   slice accurate. Defer only exploration that cannot change that slice.
2. For a new site, copy `templates/vinext-starter` into the project
   and preserve its structure. For an existing site, preserve its structure.
   Read an existing starter file before applying a context-dependent patch to
   it. Keep first-slice page and style edits independent from optional metadata
   edits so uninspected metadata context cannot reject the product patch.
3. For a new site copied from the bundled starter, start `npm ci` as a yielded
   background process and retain its session ID. For an existing site, inspect
   its documented package manager, lockfiles, scripts, and dependency state
   before installing. Start the project's established locked install as a
   yielded process only when dependencies are required and not already usable;
   use `npm ci` only when `package-lock.json` or `npm-shrinkwrap.json` is present
   and npm is the established package manager. Skip installation for buildless
   or dependency-ready projects. Never create or update a lockfile, switch
   package managers, or replace the established install flow merely to enter
   this fast path. While any required install runs, or immediately when none is
   needed, choose the smallest coherent vertical slice defined below. If that
   slice needs product changes before the handoff, make the first product
   implementation patch intentionally bounded to it across only the minimum
   necessary files.
4. As soon as the current slice is ready or the bounded patch applies, poll a
   retained install session if one exists; otherwise proceed directly to the
   development server. Treat this as a hard sequencing gate: after the bounded
   patch applies, make no further planned product-source edits before the
   handoff. Poll any retained installation, start the development server, and
   open the preview next; only compilation fixes or security-sensitive
   prerequisites may intervene. Do not draft or apply the comprehensive final
   implementation before starting the server. Wait for installation only when
   the server needs dependencies from a required install. If the project's
   established install fails, surface the failure, fix its cause, and retry it.
   Do not silently switch package managers or mutate the lockfile without a
   concrete dependency reason.
5. Start the development server as a yielded process and address only
   compilation blockers or security-sensitive prerequisites before the
   handoff. As soon as the bounded slice compiles and the exact local URL
   printed by the server is healthy, call `open_in_codex` without `threadId`
   with
   `target: { type: "browser", url: previewUrl }`.
6. Keep the server and browser open. Finish the complete requested experience
   through HMR, including all features, content, interactions, responsive
   behavior, requested auth or storage, and accessibility.
7. Run the normal non-browser validation, then continue to the unchanged
   `sites-hosting` flow unless the user explicitly asks to keep the work local.

### First Meaningful Preview

Make the pre-preview deliverable the smallest coherent vertical slice that lets
a reasonable person recognize the requested product and its intended visual
direction. Require all of the following:

- the primary product surface or layout;
- representative, product-specific real content instead of a generic skeleton;
- the visible primary affordance or control when the product is
  interaction-led; and
- a successfully compiling route.

The slice must be accurate for what it shows. Do not hand off a knowingly
incorrect, misleading, or structurally disposable implementation merely to
optimize preview latency. Take the bounded inspection or setup time required to
make the slice trustworthy.

The slice may be static or partially inert. Do not use fixed product-category
checklists to expand it. Until after the handoff, defer anything not required
for recognition or safe compilation, including secondary surfaces or routes,
comprehensive interaction logic, complete data models, exhaustive components or
icons, responsive refinements, animation and polish, and advanced capabilities.
Security-sensitive or compile-critical prerequisites are exceptions.

For an existing site, use the current coherent experience as this slice when it
compiles and still represents the requested product. If the request changes the
product's primary direction, apply only the smallest representative part first.
Hand off before implementing every part of a non-trivial multi-part update.

This is sequencing, never deletion. Preserve every requested feature and finish
all deferred content, interactions, responsive behavior, accessibility,
authentication, storage, and other advanced capabilities after the handoff
through HMR. For a non-trivial request, if essentially no material requested
product work remains after the handoff, the preview happened too late. For a
genuinely trivial request, do not manufacture pointless post-preview edits.

Never hand off an untouched starter, blank or loading-only page, generic
skeleton, compilation error, or empty browser tab. Treat the preview as an early
milestone, never as completion.

## Build Contract

Sites hosts Cloudflare Worker-compatible sites.

- Build deployable Worker output as ES modules (`ESM`), not CommonJS (`CJS`).
- Prefer vinext and this skill's bundled templates unless the user explicitly
  wants a different starting point.
- Preserve the selected starter's layout instead of inventing a new shell.
- Keep site code within the chosen site surface.
- Keep logical storage declarations in `.openai/hosting.json`.
- Use the starter's `sites()` Vite plugin to generate Sites-compatible build
  outputs.
- Keep local `.env` and `.env.example` files aligned with runtime environment
  keys needed during development; hosted runtime values are managed by Sites
  instead of repo metadata.
- Let Sites own real Cloudflare resource creation and deployment wiring.

Use another Cloudflare Worker-compatible site layout only when the user explicitly
wants a different stack or the existing project already uses one. Refer to
Cloudflare's web application framework guides:
https://developers.cloudflare.com/workers/framework-guides/web-apps/

## Build Composition

Choose only the flows the requested site needs.

- Static or content-led site: use project setup, site shaping, and local validation.
- Durable product state: add structured persistence with D1.
- Device-local UI preferences only: browser storage is acceptable.
- Upload, media, or document site: add file storage with R2.
- Site with uploaded files plus searchable or relational metadata: use D1 and R2
  together.
- Internal workspace site that only needs current-user identity: use the
  forwarded authenticated-user headers.
- Public or externally authenticated site: confirm the current platform auth
  path before adding an app-owned auth stack.
- Any page or browser route that must not be visible to unauthenticated users:
  use the dispatch-owned SIWC helper in
  `templates/vinext-starter/app/chatgpt-auth.ts`.

Each flow may also be used independently for an existing site, such as adding D1,
adding authentication, or validating a current build without rebuilding the
whole project.

## Starting a Project

When creating a new site:

1. Choose the starter before making structural changes.
2. Use `templates/vinext-starter` for sites, including sites that need
   route-level ChatGPT sign-in via dispatch-owned SIWC.
3. Preserve the starter's file layout and extend it instead of
   replacing it with a new shell.

When modifying an existing site, preserve its current structure unless the user
explicitly asks for a larger rework.

## Shaping the Site

For new sites, default to a static or server-rendered vinext site unless the
product needs persistent state, file storage, authentication, or the user
explicitly wants a different stack.

- Use React and vinext simply. Avoid unnecessary client state.
- Build the first viewport around the product itself, not generic dashboard
  chrome or placeholder cards.
- Keep copy concrete and product-specific.
- Add full-stack features for the requested workflow, not speculative future use.
- Keep server boundaries narrow and product-driven.

## Conditional Capability References

- For durable state, uploads, records, or other persistence, read
  [Persistence and storage](references/persistence-and-storage.md) before
  implementing that capability.
- For sign-in-gated or identity-aware behavior, read
  [Authentication](references/authentication.md) before implementing that
  capability.

## Preview and Browser Gate

Treat these as hard requirements. Represent the work needed for the First
Meaningful Preview as an early build milestone without naming the preview in
the visible plan. These rules override generic Browser visibility and tab
guidance.

- **Open only the meaningful preview.** Call only `open_in_codex` with the exact
  healthy local URL printed by the server. Do not first open a blank browser,
  untouched starter, or empty tab. Never substitute `browser.tabs.new()`, an
  agent or background tab, `visibility.set(true)`, a screenshot, or other
  Browser automation. Omit `threadId` so the target defaults to the calling
  thread; never retarget the preview to another conversation.
- **Verify and retry the handoff once.** Treat the handoff as successful when
  `open_in_codex` reports `status: "opened"` or `status: "existing"`. If it
  fails, confirm the server is healthy and retry the same call once without
  adding `threadId`. If the handoff alone still fails, report it, do not claim
  the preview opened, and continue creation, non-browser validation, and
  hosting. Treat dependency, server, build, artifact, and deployment failures
  as real failures to fix.
- **Perform no unrequested UI QA.** Unless the user explicitly requests browser
  UI testing or visual QA, omit it from the plan and perform no browser
  inspection, DOM checks, screenshots, resizing, clicking, typing, responsive
  checks, control testing, measurements, comparisons, or visual judgment. If UI
  QA starts accidentally, stop it and do not use its findings.

Keep the server open after the handoff and finish the complete implementation
through HMR before required non-browser validation and hosting.

## Local Validation

Before calling the site work complete:

1. Run the site's normal build command, usually `npm run build`.
2. If the D1 schema changed, generate and inspect the local migration output.
3. Fix validation failures before continuing.

## Handoff to Hosting

After creating or modifying a site, finish local validation and use the
`sites-hosting` skill for local publication preparation, unless the user explicitly
asks to keep the work local. Follow the Sites connector descriptions for site
creation, versions, deployments, environment variables, and access control.

Use `sites-hosting` for requests to save without deploying, deploy a saved
version, inspect versions, or manage production access.
