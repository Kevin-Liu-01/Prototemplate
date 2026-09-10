# Shopify Commerce

Use this as the single operating route for Shopify theme and store work. Load
[[shopify]] for capability boundaries and [[shopify-hydrogen]] only when the job
is a headless React storefront rather than a Liquid theme.

## Route The Job

| Job | First interface | Boundary |
| --- | --- | --- |
| Theme, section, block, snippet, or page | Shopify CLI + current theme source | Work on a development or unpublished theme; do not publish by default. |
| Liquid or schema authoring | Official Shopify AI Toolkit docs/schema validation when available | The Dev MCP validates and explains; it is not authenticated store Admin access. |
| Store data read | Shopify CLI store execution or a project-owned Admin API client | Use the minimum read scopes and exclude customer/order data unless the task requires and authorizes it. |
| Store mutation | Validated Admin GraphQL through an explicitly approved store context | Freeze the store and resource IDs, preview the exact mutation, require approval, and preserve a reversal plan. |
| Headless React storefront | [[shopify-hydrogen]] | Pin project versions and use preview deployments before production. |
| Customer-facing catalog/cart agent | Storefront MCP | Do not confuse the customer commerce surface with Admin or theme mutation. |

## 1. Freeze Context And Authority

Before running a command, record:

- repository, branch, Shopify store domain, and environment;
- theme ID and whether it is development, unpublished, or live;
- page/template/section or Admin resources in scope;
- read-only, local-write, remote-theme-write, Admin-write, and publish authority;
- customer, order, payment, identity, analytics, and other sensitive-data boundaries;
- current source revision, preview path, backup, rollback target, and approver.

Run read-only context commands first. Use `shopify theme info` for theme context
and inspect the repository and its installed CLI/toolkit versions. Never infer a
store or theme from the current directory alone.

## 2. Build The Evidence Packet

Read the existing theme, brand facts, product facts, design system, analytics or
experiment baseline, and authorized visual references before prompting an agent.
Vague “make a beautiful landing page” prompts are insufficient. Turn evidence
into a section inventory with content, behavior, merchant-editability, commerce,
accessibility, responsive, performance, and acceptance requirements.

External pages are references, not permission to copy protected creative work.
Extract layout and interaction principles, then implement an original result.
Build and review one section at a time when the page is complex.

## 3. Choose Current Authority

Use current Shopify documentation and the official Shopify AI Toolkit for docs,
API schemas, and code validation. The toolkit is optional, not ambient authority:

- inspect its exact version and license before installation;
- disclose that upstream telemetry is on by default and may include the invoking
  prompt, search material, validation input/result, session, and tool-use IDs;
- do not enable its scripts or hooks until the user accepts that egress or sets
  `OPT_OUT_INSTRUMENTATION=true`;
- prefer a project-local, pinned installation over an unreviewed global install.

The official Dev MCP is local and needs no store authentication for docs, schemas,
and validation. It must not receive store credentials or be described as an Admin
data connection. Keep third-party Liquid skills as reference evidence unless
their exact revision, license, permissions, dependencies, and network behavior
pass the external-skill audit.

## 4. Implement Theme Work

Start from a clean source snapshot and a development or unpublished theme. Use
JSON templates to compose sections; use sections and blocks for merchant-editable
content; use snippets for reusable rendering. Preserve:

- valid `{% schema %}` JSON, presets, and theme-editor affordances;
- `block.shopify_attributes` and nestable theme blocks where applicable;
- translations for user-facing text instead of hard-coded strings;
- responsive images, stable dimensions, and bounded JavaScript;
- semantic HTML, keyboard interaction, visible focus, labels, alternative text,
  reduced motion, and adequate contrast;
- variants, price, availability, quantity, cart, selling-plan, localization, and
  error/loading states required by the page.

Do not hard-code merchant content into a monolithic Liquid file, overwrite the
live theme, expose a Theme Access password, or treat a rendered screenshot as
proof that commerce behavior works.

## 5. Handle Store Data Deliberately

For store-scoped reads, authenticate the exact store with the narrowest validated
scope set. Keep GraphQL selections small and redact sensitive fields in receipts.
For mutations, validate the operation first, show the exact store, variables,
resource IDs, effects, and reversal, then wait for explicit approval. Mutation
execution must be visibly distinct from read-only inspection and must use the
CLI's explicit mutation allowance where required.

Never put an Admin token, Theme Access password, customer export, or secrets in
the repository, prompt, screenshot, capture manifest, or wiki.

## 6. Prove Before Publish

Run the strongest available validation for the changed surface:

1. Shopify AI Toolkit schema/code validation when admitted and configured.
2. `shopify theme check` and project tests on the exact changed theme.
3. `shopify theme dev` or an unpublished-theme preview against the named store.
4. Desktop and mobile visual comparison at representative viewports.
5. Keyboard, focus, screen-reader name, contrast, reduced-motion, and zoom checks.
6. Product/variant, availability, price, quantity, cart, error, localization, and
   checkout-handoff checks using non-production fixtures where possible.
7. Performance and network inspection for image, script, font, layout-shift, and
   third-party regressions.
8. Clean diff, theme ID, preview URL, validation output, screenshots, known gaps,
   backup, rollback, and approver receipt.

Publishing a theme, changing production data, or shipping a CRO variant remains
a separate human-approved step. Treat conversion claims as hypotheses until a
defined experiment with a baseline, primary metric, guardrails, sample, and
decision rule supports them.

## Closeout

Write back the store/theme context without secrets, source and toolkit revisions,
commands and scopes used, files changed, validation receipts, preview URL,
approval, deployment result, and rollback state. If this procedure repeatedly
needs a missing branch, update this skill rather than creating a one-off runbook.
