---
name: gt-product-surfaces
description: >-
  A map of General Translation's product surfaces (the sign-in plate and the
  auth pages, the four-step onboarding, the dashboard shell, plans and
  billing, the partner credit pages on the plate) to the skills that own
  their rules, and the state gallery method for reviewing a flow: every
  state reachable from one console, screenshots taken from it, and each new
  state added with the flow. It holds no rules of its own. Use when starting
  work on a GT product surface, to find which skill holds its rules, and
  before showing Kevin the states of a sign-in, onboarding or CLI login
  flow.
metadata:
  title: Product surfaces
  areas: components, aesthetic, workflow
  updated: 2026-10-10
  origin: prototemplate
  owner: O
---

# Product surfaces

General Translation (GT) ships its product from `apps/dashboard` in gt-cloud, its private monorepo: the sign-in and auth pages, onboarding and the dashboard itself. This skill maps each of those surfaces to the skills that hold its rules, and gives the method for reviewing a flow's states. It holds no rules of its own. Where a pointer here and the owning skill disagree, the owning skill wins, and the fix goes into this map.

Skills named without a repository are in this set. `gt-dashboard` is gt-cloud's skill for `apps/dashboard` (`.agents/skills/gt-dashboard`), and it is the source of truth for that app's rules. Sources for every sentence are in `references/sources.md`.

## 1. The map

| Surface | Where it ships | Rules live in |
| --- | --- | --- |
| The sign-in plate and the auth pages: sign-in, check your email, auth error, OAuth consent, device code, the CLI wizard and the CLI's local callback page | `apps/dashboard`, on gt-cloud main since #5063 (merged 2026-10-02) | `gt-dashboard` (`references/auth.md`, `references/style-guide.md`); `gt-aesthetic` (the brand deck as the reference, and the verdicts on these pages); `gt-dither` (the field and the artifact pictures); `gt-components` (the shared plate kit in packages/ui, and how product UI behaves) |
| Onboarding, four steps on the plate frame | `apps/dashboard`, the same release | `gt-dashboard` (`references/onboarding.md`: the step flow and what a change must preserve); `gt-aesthetic`; `gt-dither` section 5 (the picture on each step) |
| The dashboard shell and its pages | `apps/dashboard`; the redesigned shell is #4977 and the icon sweep #5029, both open on 2026-10-10 | `gt-dashboard` (`references/conventions.md`, `references/navigation.md`, `references/style-guide.md`); `gt-components` (`references/icons.md`); `gt-lints` (the gt-ui rules) |
| Plans, billing and credits | `apps/dashboard`'s billing code | `gt-dashboard`, which names the billing files to read before a change; plan facts on a public surface come only from generaltranslation.com/pricing (`docs/handbook/gt-product-map.md`) |
| Partner credit pages on the plate | `apps/landing`, under `/enterprise/contact/`, since #5216 (merged 2026-10-08) | `gt-website` (`references/pages.md`); `gt-components` (the plate kit, which #5216 moved into packages/ui) |
| Screenshots of these surfaces in a pull request | the pull request body | `gt-ship` (the PR body and its screenshot section) |
| Running the dashboard locally | a gt-cloud worktree | `gt-local-dev`; `gt-dashboard` |

## 2. Reviewing a flow's states

Kevin reviews from the pull request and from the running app, and asked for a console in the bottom right to press through the states, so that a review never means driving the wizard by hand (2026-09-25).

### The gallery

- The state gallery renders every state of the sign-in, onboarding and CLI login journeys in the order a user meets them, with one console: Previous, Next and the arrow keys walk the journey's main path, and its picker reaches the variants off that path.
- gt-cloud main does not carry it. The release (#5063) removed the development gallery on 2026-10-01, and it survives on the branch `k/dashboard-dev-gallery`, where `/dev/states?state=<id>` runs in the dashboard's development build only.
- Prototemplate's plate port shows the same states at `/d/production/signin`, `/d/production/onboarding`, `/d/production/consent`, `/d/production/device` and `/d/production/cli`, with the console as a panel that can be dragged. Each route reads `?state=<id>` on the server, so a deep link paints its state first. The port lives in `src/components/plate/` and is a recorded fork of the dashboard source (`scripts/lint/copies.json`), so it can trail gt-cloud.

### The method

1. Open each changed state in the gallery at the sizes and themes in `gt-aesthetic` (`references/process.md`, "Local review").
2. Walk the main path with the console, then each variant of the changed steps.
3. Take the screenshots from the gallery, and put before and after crops in the pull request the way `gt-ship` describes.
4. When a flow gains a state, add it to the gallery's state list (`devStates.ts`, and its main path when the state is on it) in the same change.
5. Before calling a pass done, sweep every page a user can land on around sign-in for one still on the old style. Kevin's verdict on a bare "Check your email" page on 2026-09-25 was "this looks rlly bad".
6. For an onboarding or auth change, check what the change must preserve in `gt-dashboard` (`references/onboarding.md`) before review.

## Related skills

`gt-aesthetic` (the standard Kevin applies), `gt-components`, `gt-dither`, `gt-lints`, `gt-website`, `gt-ship`, `gt-local-dev`, `gt-verify` (browser checks of the running app), and gt-cloud's `gt-dashboard` and `gt-ui`.

## Sources

Every sentence above is listed with its source and date in `references/sources.md`.
