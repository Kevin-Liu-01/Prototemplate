---
name: gt-verify
description: >-
  How to prove General Translation work is done before saying so: measure
  what renders at the spot Kevin flagged, run the real gesture and the real
  flow, walk the stress matrix for scroll stories and animated sections,
  cover the viewports, themes, browsers, accessibility and edge counts that
  check:pages misses, re-check what was already right, verify the live
  deployment, sweep the whole class of a defect, find the root cause and
  guard it, compare a whole page set before and after an upgrade, and report
  how each item was verified. Use before reporting any fix or feature as
  done, when Kevin says something is still broken, and when closing a round.
metadata:
  title: Proving work is done
  areas: workflow, lints, website, aesthetic, motion
  updated: 2026-10-10
  origin: prototemplate
  owner: P
---

# Proving work is done

Kevin checks General Translation (GT) work in the running app, and he finds what an agent did not look at. On 2026-09-02 he asked "did you actualy test this?" about a fix that had been reported with screenshots and never tried with a mouse. This skill defines when an item is done, which cases to walk for each kind of change, and what the report says about each item.

Capture tooling lives in `gt-aesthetic` (section 5, "Local review") and `gt-website` ("Looking at pages"), and the gates live in `gt-lints`. This skill adds the definition of done, the cases those tools miss, two headless scripts (`scripts/probe.mjs` measures one spot of a page and `scripts/stress.mjs` walks a scroll story through the stress matrix) and three parity scripts (`scripts/compare-signatures.py` fetches the same routes from two servers and diffs each page's structure, read through `scripts/page-signature.py`; `scripts/row-diff.py` diffs screenshots row by row). Commands and code for every check are in [references/recipes.md](references/recipes.md), the cases in detail in [references/cases.md](references/cases.md) and the parity method in [references/parity-review.md](references/parity-review.md).

`$GT_CLOUD` is a checkout of gt-cloud, GT's monorepo (the site at generaltranslation.com is its `apps/landing`, and the dashboard is `apps/dashboard`). `$PROTOTEMPLATE` is a checkout of Prototemplate, the design hub behind prototemplate.com. Run both scripts from `$PROTOTEMPLATE`, because its `node_modules` holds `playwright-core`. On a new machine, `pnpm exec playwright-core install chromium webkit` there downloads the browsers they launch. Pass a scratch folder as `--out`.

## The definition of done

An item is done when all seven hold:

1. The rendered result was measured at the exact spot Kevin flagged (section 1).
2. The real gesture and the real user flow work in the running app (section 2).
3. The stress, viewport and edge cases that apply were walked (sections 3 to 5).
4. Items that were right before the change are still right (section 6).
5. When the work shipped, the live deployment serves it (section 7).
6. Every member of the defect's class was found, fixed and checked (section 8).
7. The report says how each item was verified and names what was not (section 12).

A typecheck, a clean lint and a passing structural audit are gates (`gt-lints`). They and the agent's own claim say nothing about what renders or what a user can do, so an item that passed only gates is reported as unverified.

## 1. Measure what renders

- **Quote the selected element before editing.** When Kevin selects or circles an element, read its computed box model first: margin, border, padding and content per side, the parent's gap, and the space to each neighbour. On 2026-08-05 padding was trimmed in three sections while the gap came from a margin, and Kevin had all of it undone: "i actually think its a margin, not padding so undo both".

  ```sh
  node skills/gt-verify/scripts/probe.mjs http://localhost:3005/brand --sel ".pt-book-title h1" --theme dark --out <scratch>/probe
  ```

  The probe prints the box model per side, the type and paint values, the parent's gap and the space to each sibling, and saves a crop plus 24px (references/cases.md).
- **Computed values are the evidence.** Source and class names say what was intended. `getComputedStyle` on the live element (the probe, or the Browser pane's JavaScript) says what rendered.
- **Crop seams at 2x or 4x.** Corners, junctions and seams are judged on crops (`--dsf 4` for 4x). One 1px line is 2 device px at 2x, and a full-page capture hides it. The line auditor reads computed CSS and cannot see SVG strokes, so figures are judged on crops (`gt-lints`).
- **Probe what paints at a point.** `--point x,y` lists the elements under a viewport point from the top (`elementsFromPoint`), with each one's borders, background, opacity, shadow and outline, and the composite pixel there. It shows which owner draws a line, what covers a control and which layer leaks a fill.
- **Read composite pixels across a seam.** `--scan x,y,down,24` (or `right`) groups the device pixels along a segment into runs of one grey and marks the runs that are lines. A reading near the two-stroke grey is a double line or a stroke over a brighter backing (the arithmetic and the expected greys: [references/cases.md](references/cases.md), "Reading a seam").
- **Check every state of a moving element.** `--frames 12 --every 120` takes the box reading and a crop twelve times, since a footprint changes with an animation's state (the 2026-08-01 orbit gaps are in references/cases.md).
- **Measure layout shift.** `pnpm check:pages` reads the layout shift score in every cell (over 0.1 fails, over 0.05 is a note; `--cls-trace` samples the boxes behind a shift), and `stress.mjs` records the entries in every phase. Around one gesture, read the entries directly (recipes, "Layout shift around one interaction"). Every entry over 0.001 is a defect, reported with its sources. Kevin, 2026-08-05: "either trannsition and animate them properly or dont let them layout shift around".
- **Switch tools when one reads badly.** A blank or wrong capture is a tool problem to solve, and Kevin is never asked to check what an agent can measure (references/cases.md).
- **Look at every capture.** The agent finds a backwards part, a clipped letter, a doubled rule or a banner over the copy before Kevin sees it. Kevin, 2026-08-01: "be better at identifying these things".

## 2. The real gesture and the real flow

- **Drive the interaction a user performs.** A text selection is a mouse drag read back with `getSelection()`. A hover state is hovered, then clicked. A sign-in change is proven by signing in: "hmm but i cant sign in. full flow is technically not working" (Kevin, 2026-07-21). Recipes has the drag.
- **Name every shortcut, then remove it.** A programmatic selection, `click({ force: true })`, a script that sets state or a harness route proves nothing about the gesture. Report the shortcut, run the gesture, then report the gesture; a harness route stays out of the PR (`gt-ship` section 3; the 2026-09-02 label case is in references/cases.md).
- **The runtime proves the value.** When a settings panel, a stats readout or a log line shows the corrected value, it still does not show that the runtime uses it. Exercise the behaviour the value controls and measure that.
- **Test every category.** When a change covers several kinds of item (every page type, every file format, every plan state, every provider), run one of each against the real system and read its logs.
- **Dashboard UI passes Kevin's manual gate.** Walk every line of gt-cloud's gt-dashboard "UI Verification Checklist" with evidence, then ask him to confirm with that evidence attached; a sign-in wall is no reason to leave a screen unverified (references/cases.md).
- **A prompt for coding agents is proven on a fresh agent.** It is handed unchanged to a fresh agent on a fresh app until a real translation renders, and a separate verifier grades it (Kevin, 2026-10-01; references/cases.md, "Agent prompts").

## 3. The stress matrix

Scroll stories, pinned stages and animated sections are verified through the whole matrix before they are called fixed. On 2026-08-08 Kevin found three failures in one evening: "if i reload i briefly see 3 layers stacked on top of each other", a story that did not lock "in the same place" when scrolled up and down, and text rewriting that looked "so off" under 10x CPU throttling.

| Case | What must hold |
| --- | --- |
| Every beat, the last ones included | Each beat, the finale included, locks at its read line |
| Slow, fast and reverse scrolling | The same position shows the same state from either direction; nothing stale is visible after a fast jump |
| Reload mid-page and a restored scroll position | The first painted frame is already right: no stacked layers, no hidden copy |
| A deep link into the story | The linked beat shows lit, with no extra scroll needed |
| Zoom fully out and back in | The story at the same position reads as it did before |
| Show and hide the mobile URL bar | The document does not jump (DESIGN.md section 13) |
| CPU throttled 10x | Settled states equal the unthrottled run; only the frame rate drops |
| 1440 by 900, 1920 by 1080, intermediate widths, a phone | Each width shows one composition (section 4) |

```sh
node skills/gt-verify/scripts/stress.mjs http://localhost:3001/en-US \
  --copy ".v0-stack-beat" --story "#platform" --hash platform --theme dark \
  --out <scratch>/stress
```

- `stress.mjs` walks every phase at five viewports, fails when copy in the read band is not visible, records shifts, errors and frame cadence, and writes `REPORT.md` and a capture sheet (`--phases`, `--viewports`, `--steps` narrow a run).
- The first-frame captures are judged by eye; the first interaction after a load behaves like every later one; a throttled run whose settled states and event timing match the unthrottled run is frame-starved, and one that differs is wrong; an overlay outside the change is reported, then hidden with `--hide`; the URL bar is checked on a phone. The rules with the incidents behind them are in [references/cases.md](references/cases.md) ("The stress matrix").
- `gt-motion` holds the motion rules (one clock, paused loops, reduced motion). `gt-landing-pages` and DESIGN.md sections 13 and 14 hold the story's layout (the 55 and 80 percent read lines, the svh and dvh law).

## 4. Viewports, themes, browsers and accessibility

- **Start with the standing checks.** `pnpm check:pages --preset quick --pages <ids>` (devices from 320 wide to the 3440 ultrawide, layout shift per cell, the declared interactions; `gt-lints`). Another site takes `--base <url> --pages-module <file>`; the presets are in references/cases.md.
- **Add what those miss:** phone landscape, 900, 1100 and 1279 wide, short heights, 150% browser zoom and emulated width changes across each breakpoint (sizes and the 150% incident in [references/cases.md](references/cases.md), "Viewports check:pages misses").
- **One composition per width.** Intermediate widths and zoomed windows fall to the mobile composition, with no hybrid of desktop logic and mobile layout.
- **Mobile reaches everything desktop reaches.** Open the mobile menu and every drawer and check each entry; header destinations live in both `items` and `columns` (`gt-website` section 2).
- **Safari as well as Chrome.** Run the checks with `--browser webkit` on both scripts. On 2026-08-18 the blog index's lead card broke only in Safari (references/cases.md, "Mobile menus and WebKit").
- **The iOS Simulator** checks iPhone spacing and lag (recipes). It runs at the host's CPU speed, so CPU tiers come from the throttle. Drop it when it blocks the round, and say it was dropped.
- **Both themes, every time.** Seed the theme before load (`--theme`), and confirm it took: the probe prints `data-theme` and the `dark` class.
- **Accessibility.**

  ```sh
  node skills/gt-verify/scripts/probe.mjs http://localhost:3001/en-US/docs --viewport 390x844 --a11y --strict --out <scratch>/a11y
  ```

  It lists controls with no accessible name, the name and state every icon-only control announces, `user-select: none` text and the live regions. Read each name against what the control does, tab through the changed controls, and check reduced motion (references/cases.md, "Accessibility reading").

## 5. Edge counts and languages

- **Counts.** Render every list and grid at 0, 1, 2, a typical count, its cap, the cap plus one and a large count. Rows keep their height with few items, nothing overflows with many, and past the cap the layout switches (a denser grid, a pager). Fixtures or the dashboard's `/dev/states` gallery (`gt-local-dev` section 4) supply the states.
- **The longest translation.** Measure every locale's string after fonts load and reserve its lines: "make the text larger and take up 2 lines so all language lengths fit. test at longest translation" (Kevin, 2026-08-07). The landing's locales are generated at deploy, so read them on production (recipes).
- **Scripts.** CJK full-width punctuation takes a full em and must not push its neighbours. RTL runs are isolated (`dir` on the node, `unicode-bidi: isolate`), and Arabic stays joined, which needs one shaped text node with no per-character spans (DESIGN.md section 8). Devanagari keeps its matras. Every layout is checked in CJK, RTL and Indic text as well as Latin (BRAND.md section 6).

## 6. Regression baselines

- **Re-verify what was right.** A change that touches every member of a set (a shared helper, a global offset, a token) is checked on the members that were correct before it. On 2026-08-17 a global offset fixed the item in front of the agent and moved items that were already right.
- **Re-check every flagged item.** Before a page is called done, re-check each item Kevin flagged on it earlier in the round, with the same probe as the first time.
- **Start from Kevin's known-good commit.** When he names one, diff against it (`git log` and `git diff <good> <bad> -- <paths>`) or bisect in a scratch worktree before changing code (recipes).
- **Rule out caches first.** Before diagnosing a deployed regression, load the page in a clean profile. Each headless context is one. Kevin, 2026-09-29: "i opened in an incognito tab and it was fine. i think cached stuff is causing weirdness". Locally, `rm -rf .next` clears a stale dev build (`gt-website` section 2).
- **Compare the whole page set across an upgrade.** A framework bump, a layout rewrite or a routing change is checked route by route against the reference build with `compare-signatures.py`, and every difference gets a verdict and evidence ([references/parity-review.md](references/parity-review.md)).
- **Record the load with every timing.** Parallel agents share the machine, and a timing check reads red under their load. Put the `uptime` load average beside every timing and rerun at low load before calling a timing defect real (`gt-performance` section 2, which also holds budgets and frame-time work).

## 7. The live deployment

Work that shipped is done when production serves it. Kevin, 2026-10-01: "why does your deploys keep regressing?"

- **Every lane's commits are on main.** For each commit, `git merge-base --is-ancestor <sha> origin/main` succeeds; a lane's work lost in a rebase counts as unshipped.
- **Production runs the merged commit.** The newest Ready production deployment's `githubCommitSha` contains it (recipes, "The live deployment").
- **The live page carries that deployment's stamp,** its longest `dpl_` id. Prototemplate's check is `gt-ship` section 8.
- **The full-feature build is the one serving.** Spot-check one feature from each lane or build in production, in a fresh headless context.
- **Cards.** OG and Twitter tags are read live after the deploy, the image answers `200 image/png`, and the card is opened and looked at (recipes; `gt-graphics` for the design).
- **Failed builds** leave the last good deployment serving, so a merged PR stays invisible (`gt-website` section 8, `gt-ship` section 8).

## 8. Fix the class

When Kevin flags one instance, find every instance: "in everything, make sure our footers are properly logo and text side by side" (Kevin, 2026-08-03); "look for ANYWHERE ELSE icons nneed to be synced" (Kevin, 2026-09-28).

1. Enumerate the class programmatically: a grep (`git grep -n "select-none" -- 'packages/ui/src' 'apps/*/src'`), a registry (Prototemplate's `scripts/lib/site-pages.mjs`, the header's `items` and `columns`), a lint (gt-ui rules), or a measurable heuristic such as symmetry (left and right padding equal) or attachment (a logo and its wordmark on one baseline) read with the probe on every member (`--nth`).
2. Fix every member, preferring the shared source.
3. Verify each member and report the count.
4. When a lint could have caught the defect and did not, extend it until it catches the class, then sweep every page (`gt-lints` section 4). Cross-app UI changes go through `packages/ui` (`gt-components`, "Standardization").

## 9. Root cause and guard

- **Diagnose before editing.** Reproduce the defect, read the full log and the computed values, and compare with the deployed environment. "right but why is the fetch failing" (Kevin, 2026-08-18).
- **Fix the cause, then guard it.** Add the regression test or the lint in the same change, so the class cannot return.
- **Chase intermittent symptoms.** A defect that vanishes on reload is reproduced on purpose: late fonts under a network throttle, a cold cache, a fast jump, a restored scroll. Sample the moving property on a timer and count wrong readings.
- **A pasted runtime error overlay** gets the root fix and then a console-error probe that scrolls through every affected route (recipes, "Console errors across routes").
- **A phone screen recording** is read frame by frame and attributed to a build before saying whether it is fixed (recipes; the 2026-08-08 case is in references/cases.md).

## 10. Tests and checks that prove something

- **Tests from real output.** Expected values come from captured output of the real system: a CLI run, a DOM reading, a recorded response. A value computed the way the code computes it passes by construction (gt-cloud `gt-testing`, "Tautological").
- **Mutation-verify.** Break the fix, see the new test fail on the behaviour, restore the fix, see it pass (recipes, "Mutation verification in a shared tree").
- **Gates assert content.** A gate checks what it produced (the route in the build manifest, the rows in `REPORT.md`, the text in the response) as well as the exit code. Gate hygiene (chained with `&&`, unpiped, real exit codes) is `gt-lints` section 5.
- **One behaviour, one test.** `gt-ship` section 3 and `gt-testing` hold the size rules.
- **Audit the checks.** Ask of each check whether it is needed, correct and fast: "make sure the checks are even needed or are even CORRECT" (Kevin, 2026-09-28). Show failed or incomplete checks with picture evidence so Kevin can judge whether each is real.
- **A gate that blocks a requested change goes to Kevin.** He may approve a narrow exception (an `ALLOW` entry or a baseline row with its reason) that keeps the failure visible. A gate is never skipped silently.
- **Tests support fixes.** "why are you spending so long on tests we need to start doing the actual fixes" (Kevin, 2026-09-12). Fix first, then pin the fix.

## 11. Test discreetly

- **Headless only.** Both scripts, check:pages and the harnesses run headless. Never launch a headed browser or open a URL in Kevin's browser to test, and put "headless only, no visible windows" in every brief that has an agent drive a browser (the 2026-09-25 incident is in references/cases.md).
- **Size the run to the change.** One page and two viewports while iterating (`--pages`, `--viewports`, `--phases`); the full matrix before a release. Run browser gates one at a time.
- **Leave Kevin's sessions alone.** A funnel that signs out runs on the seeded dev session, a CLI login under test keeps its state in the scratchpad, and a server Kevin started is never stopped (references/cases.md).
- **Simulators stay headless.** `xcrun simctl boot` opens no window; the simulator panel opens only when Kevin wants to watch.
- **Clean up.** Close contexts, shut down booted simulators and remove scratch worktrees when the check is done.

## 12. Report the method

Every reported item says how it was verified and names anything left unverified, with the reason. `gt-reporting` holds the report format; `gt-aesthetic` and `gt-ship` hold the crop format.

- The method: a crop (with the file), a probe reading (the numbers), a gesture (what was done and what it returned), a stress run (the report path and its verdict), a live check (deployment id and commit), a test (its name, and that it failed without the fix).
- Unverified items stay in the report, each with its reason.
- A shortcut is named with the item it touched.
- The reason is something the agent could not do in the session. A check the agent could have run (a signed-in screen, a production read, a second browser) is run before the report.

A worked report to this standard, for the 2026-09-02 label fix, is in [references/cases.md](references/cases.md) ("A report to this standard").

## Review checklist

- [ ] 1. The flagged spot was measured: computed box model quoted before editing, 2x or 4x crops of its seams, every animation state read, layout shift measured.
- [ ] 2. The real gesture and the real flow ran in the running app; every shortcut is named, and dashboard UI passed the gt-dashboard checklist with evidence.
- [ ] 3. Scroll stories and animated sections passed `stress.mjs` in every phase, and the first-frame captures were looked at.
- [ ] 4. check:pages passed, plus landscape, 900, 1100, 1279, short heights, 150% zoom, emulated width changes, WebKit, both themes, mobile menus and drawers, and `probe.mjs --a11y --strict`.
- [ ] 5. Lists held at their minimum and maximum counts, and the longest translation, CJK punctuation and RTL fit.
- [ ] 6. Items that were right before are still right, known-good commits were compared, caches were ruled out, and timings carry the load average.
- [ ] 7. Shipped work is on main, production's commit contains it, the live `dpl_` stamp matches, each feature was spot-checked live, and the cards were read live.
- [ ] 8. The class was enumerated programmatically, every member fixed and verified, and the count reported.
- [ ] 9. The cause was fixed and guarded by a test or a lint; intermittent symptoms, error overlays and recordings were traced to a cause and a build.
- [ ] 10. New tests come from real output and were seen failing without the fix; failed checks were shown with pictures.
- [ ] 11. Every browser run was headless, Kevin's sessions and servers were left alone, and scratch state was cleaned up.
- [ ] 12. The report states the method for each item and names what was not verified, each for a reason the agent could not remove in the session.

## Related skills

Prototemplate: `gt-aesthetic` (the review standard and local review tooling), `gt-website` (the site, its deploys and "Looking at pages"), `gt-lints` (every gate, gate hygiene and new lints), `gt-ship` (PR crops, Prototemplate's deploy stamp), `gt-motion` (motion rules and verifying motion), `gt-landing-pages` (scroll story layout), `gt-components` (cross-app standardization), `gt-graphics` (social cards), `gt-reporting` (the report format), `gt-local-dev` (dev environments and review servers), `gt-performance` (frame budgets and Lighthouse), `prototemplate` (check:pages against another site). gt-cloud: `gt-dashboard` (the UI Verification Checklist), `gt-testing`. Kevin's wiki: `agent-browser`, `webapp-testing`, `dogfood`, `accessibility`, `og-metadata-audit`, `agent-iteration-loop`.

## Sources

Dated provenance for every rule, script and number in this skill is in [references/sources.md](references/sources.md).
