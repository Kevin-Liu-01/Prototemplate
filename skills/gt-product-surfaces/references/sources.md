# Sources

Where every sentence of `SKILL.md` comes from, in the order the sentences appear. The skill was created on 2026-10-10 in lane L4 of Prototemplate system v2 (plan row N-20). The New Onboarding and Dashboard session (owner O) answered K6 yes that day: a pointer map with no copied rules, which it loads and whose diffs it reviews.

## The opening

- GT ships its product from `apps/dashboard`, the sign-in, auth, onboarding and dashboard pages: gt-cloud `.agents/skills/gt-dashboard/SKILL.md` on main, read 2026-10-10; inventory `skills.json` row "missing skill: dashboard and product surfaces".
- The map holds no rules of its own and the owning skill wins: the O session's K6 reply, 2026-10-10 (`system-v2/replies.md`); inventory `critique-completeness.json` item F1 ("Surface map plus pointers only").
- `gt-dashboard` is the source of truth for `apps/dashboard`: its own description, read on gt-cloud main 2026-10-10.

## Section 1, the map

- The sign-in plate and the auth pages, and onboarding in four steps on the plate frame, shipped in gt-cloud #5063 (`k/onboarding-release`, merged 2026-10-02, read with `gh pr view 5063` on 2026-10-10); memory notes `signin-field-transition` and `dashboard-deck-grammar`.
- The `gt-dashboard` references named (`auth.md`, `style-guide.md`, `onboarding.md`, `conventions.md`, `navigation.md`) and its note that billing has no reference document: gt-cloud `.agents/skills/gt-dashboard/SKILL.md`, "Reference Selection", read 2026-10-10.
- The brand deck as the reference for product surfaces, and the verdicts: `skills/gt-aesthetic/SKILL.md` section 1 and `references/verdicts.md` (Kevin, 2026-09-25 to 2026-09-30); memory note `dashboard-deck-grammar`.
- The field and the pictures: `skills/gt-dither/SKILL.md` sections 3 and 5; memory note `signin-field-transition` (the per-step pictures, 2026-09-29).
- The plate kit in packages/ui and how product UI behaves: `skills/gt-components/SKILL.md` and `references/behavior.md`; memory note `partner-plate-pages` (#5216 moved the kit into packages/ui).
- The redesigned shell #4977 and the icon sweep #5029, both open: `gh pr view` on 2026-10-10; memory note `dashboard-icon-sweep`; inventory `onboarding.json` row 21.
- Plan facts on a public surface come only from the pricing page: plan row N-21 and `docs/handbook/gt-product-map.md` (lane L5); the memory note `plan-states-and-card` stays private (inventory `memories.json`, plan section 3.3).
- The partner credit pages on the plate under `/enterprise/contact/`, #5216 merged 2026-10-08: `gh pr view 5216` on 2026-10-10; memory note `partner-plate-pages`; plan row N-19 (`gt-website/references/pages.md`, lane L2).
- Screenshots in the pull request body: `skills/gt-ship/SKILL.md` (the screenshot section) and `references/pr-body.md`; memory note `pr-screenshots-and-gallery` (Kevin, 2026-09-25).
- Running the dashboard locally: `skills/gt-local-dev/SKILL.md`; memory note `dashboard-local-dev` (2026-09-25).

## Section 2, reviewing a flow's states

- Kevin reviews from the pull request and the running app, and asked for a console in the bottom right to press through states: memory note `pr-screenshots-and-gallery` (Kevin, 2026-09-25: "i should just be able to press through a console in bottom right to look thru").
- The gallery renders every state of the sign-in, onboarding and CLI login journeys in order, and the console's Previous, Next and arrow keys walk the main path: memory notes `onboarding-funnel-testing` (Kevin, 2026-09-28: "include the full onboarding and what happens before and after, and give a way to see the gt cli login too") and `dashboard-deck-grammar` (the gallery path, "make previous and next do the proper path"); `devPath` and the picker in Prototemplate `src/components/plate/gallery/devStates.ts` and `DevStateConsole.tsx`.
- gt-cloud main does not carry the gallery, the release removed it on 2026-10-01, and it survives on `k/dashboard-dev-gallery`: gt-cloud commit dec1e1854 on `k/onboarding-release` ("The gallery survives on branch k/dashboard-dev-gallery (ebb900124) and its port lives in Prototemplate's Shipped section"), and `git ls-tree` of gt-cloud main and that branch on 2026-10-10. The route is development-only: memory note `onboarding-funnel-testing`.
- The port's five routes, the draggable console and the deep links read on the server: memory note `prototemplate-plate-port` (Kevin, 2026-10-01: "with the little console we can drag around to control"; landed on Prototemplate main as b56e64c); `src/lib/surfaces.ts` (the Shipped pages). The recorded fork: `scripts/lint/copies.json` (the `src/components/plate` entry).
- Method step 1, the sizes and themes: `skills/gt-aesthetic/references/process.md`, "Local review".
- Method steps 2 and 3, walking the path and taking screenshots from the gallery: memory note `onboarding-funnel-testing` ("screenshot from /dev/states"); crops in the pull request: `skills/gt-ship` and memory note `pr-screenshots-and-gallery` (the 2026-09-28 crops).
- Method step 4, a new state goes into the gallery with the flow: memory note `pr-screenshots-and-gallery` ("add every new state to devStates.ts when adding a state to a flow").
- Method step 5, the sweep and Kevin's words: memory note `pr-screenshots-and-gallery` (Kevin, 2026-09-25, on the bare "Check your email" page).
- Method step 6, what an onboarding or auth change must preserve: gt-cloud `gt-dashboard` ("Onboarding changes must preserve the documented step flow, shared package contracts, and Slack notification behavior") and memory note `onboarding-parity-rule` (Kevin, 2026-10-02).

## Left out on purpose

The funnel runner, the CLI login driver, the payment stand-in, the session cookie setup, the dev environment's internals, plan constants and partner codes stay in gt-cloud and in the owning session's private tool folder (plan section 3.3, "Stays out").
