# Cases and readings in detail

Detail moved out of `SKILL.md` to keep it under its size budget (2026-10-10). Every rule here still holds; the section of the skill that points to each part is named under its heading.

## Reading a seam

From section 1. The probe's `--scan` reading in full.

- **Read composite pixels across a seam.** `--scan x,y,down,24` (or `right`) groups the device pixels along a segment into runs of one grey, prints each run's width in device pixels and marks the runs that are lines. Compositing gives `a*L + (1-a)*G` for a stroke of alpha `a` and color `L` over ground `G`, and two stacked strokes composite at alpha `1-(1-a)^2`. Expected greys in Prototemplate's shell, from `src/components/viewer/tokens.css` on 2026-10-05:

  | Line | One stroke | Two strokes |
  | --- | --- | --- |
  | Shell `--pt-hair`, dark (242 at 0.22 over 7) | 59 | 99 |
  | Shell `--pt-hair`, light (7 at 0.18 over 255) | 210 | 174 |

  A reading near the two-stroke value is a double line or one stroke over a brighter backing such as a shader glow. A glow raises the neighbouring pixels as well, and a double line leaves them at the ground. On 2026-10-05 a scan read 59 across the toolbar's bottom rule on the brand page in dark (58 in WebKit), which is one stroke. The landing's main hairline `--tc-hair` is opaque (rgb 39, 39, 42 in dark and 228, 228, 231 in light on 2026-10-05), so its grey stays the same when two rules touch. There a double line shows as a run twice as wide: 4 device pixels at 2x for two 1px rules.

## The stress matrix

From section 3: what `stress.mjs` does and the rules for reading its run.

- The script walks the phases first, slow, fast, reverse, reload, deeplink, zoom and throttle at 1440x900, 1920x1080, 1100x800, 868x525 and 390x844. At every settled step it fails when copy sits in the viewport band and none of it is visible (hidden, transparent or under a fixed layer). It records layout shifts, console and page errors, failed responses and the frame cadence per phase, and compares the throttled walk's settled states with the normal walk's. It writes `REPORT.md` and `index.html`, a sheet of every capture. `--phases`, `--viewports` and `--steps` narrow a run; `--each` requires every element in the band to be visible.
- **First frames are judged by eye.** Look at the captures taken 0, 150, 400, 1000 and 2500 ms after the first load, the reload captures, and the capture 100 ms after each fast jump. They show what the checks cannot read: stacked layers, a gap that heals as the animation runs, layers that flash, stale animation after a jump. Each of those is a defect.
- **The first interaction is right.** The first scroll, hover or click after a load behaves like every later one. On 2026-08-08 the stack story at 390x844 kept all four beats transparent after a deep link or a restored scroll position, until the reader scrolled again.
- **Frame-starved or wrong.** Under throttle the frame rate falls and in-between states stay on screen longer. When the settled states and the timing of the story's events match the unthrottled run, the run was frame-starved; when they differ, the logic is wrong. On 2026-08-08 the headline rewrite followed each locale-belt crossing by 2.46 s at 1x and by 2.43 to 2.50 s at 10x, while frames fell to 4 to 6 per second. The rewrite was correct and frame-starved (recipes, "CPU and network throttling").
- **Overlays outside the change.** The script counts copy under a fixed layer as not visible. On 2026-10-05 at 390x844 the consent banner covered the lit beat of the landing's stack story at every step on a first visit. Report such a layer, then pass `--hide "<css>"` to read the story under it.
- **The URL bar** exists only on a phone. Use the iOS Simulator (recipes); headless Chromium has no browser chrome to collapse.

## Viewports check:pages misses

From section 4.

- **Start with the standing checks.** `pnpm check:pages --preset quick --pages <ids>` reads phones from 320 wide, a tablet, laptops, desktops and the 3440 ultrawide (the full preset: 25 devices, tablets and landscape phones as touch devices), the layout shift in every cell and the declared interactions (docs/SHIP-LOOP.md section 2, `gt-lints`). For a site outside Prototemplate, pass `--base <url> --pages-module <file>` (`prototemplate` section 10). `gt-aesthetic` adds shots at 1440 and 390 in both themes and plate pages at 1527 by 814.
- **Add what those miss.**
  - Phone landscape: 844x390 and 932x430.
  - 900, 1100 and 1279 wide (1279 sits one pixel under check:pages' 1280 devices).
  - Short heights: 1280x600 and 1440x700.
  - 150% browser zoom, about 868 by 525 CSS px in the window Kevin used: "no im on the tab at 150%, it should just show the mobile version at this smallness" (Kevin, 2026-08-07). At that size the stack band was one column but shorter than the stage's 640px height floor, so the desktop scroll logic drove a one-column layout.
  - DevTools device emulation: change the width in steps across each breakpoint. Sizing must recompute on every width change; a size read once at mount fails here.

## Mobile menus and WebKit

From section 4.

- **Mobile reaches everything desktop reaches.** Open the mobile menu and every drawer and check each entry. On 2026-08-16 the old light and dark toggle survived in the mobile dropdown after the desktop header changed. Header destinations live in both `items` and `columns` (`gt-website` section 2).
- **Safari as well as Chrome.** Run the checks with `--browser webkit` on both scripts. On 2026-08-18 the blog index's lead card broke only in Safari: WebKit resolved the cover's `height: 100%` against the whole two-row subgrid. The fix was verified with one invariant in Chromium and WebKit at desktop and tablet widths.

## Accessibility reading

From section 4: what `probe.mjs --a11y` lists and how to read it.

It lists controls with no accessible name, the name every icon-only control announces with its `aria-expanded` or `aria-pressed` state, text set to `user-select: none`, and the count of live regions. Read each announced name against what the control does. On 2026-09-02 the docs drawer trigger had no name, the drawer's close button announced "Open Sidebar", and dashboard labels were `select-none`. State changes are announced (`aria-expanded` and `aria-pressed` on toggles, a live region for an async result). Tab through the changed controls and see the focus ring. Reduced motion renders the designed still (`gt-motion`).

## Agent prompts

From section 2.

- **A prompt for coding agents is proven on a fresh agent.** The Setup for Agents prompt is handed unchanged to a fresh agent on a fresh app until a real translation renders, and a separate verifier grades the result and the wording. Kevin, 2026-10-01: "havce you actualy tried the prompt? do it and validate results." `gt init` and `gt configure` wait forever on an unanswered interactive question, so every step runs with `--no-interactive` and a flag for each answer. Record whether the run used an existing CLI login, which skips steps a new user meets. `gt-website` section 6 and its `references/pages.md` hold the verified command.

## A report to this standard

From section 12.

The 2026-09-02 report on the label fix asked Kevin to sign in and drag across a label himself. To this standard the agent runs that drag on a signed-in screen through the seeded session, and the report reads: "Labels above inputs select again (#4633). Verified: on a signed-in dashboard form, a mouse drag selects 'Project name' after the fix and selects nothing with `select-none` restored; the shared Label primitive computes `user-select: auto`. Not verified: Safari on an iPhone. The simulator device still needs Kevin's one-time grant, and WebKit at 390x844 passed."

## Measure what renders in detail

From section 1.

The probe prints the rect, each side of margin, border and padding, the content box, layout, type and paint values, the effective opacity, the parent's display and gap, and the distance to the previous and next siblings with the margins that make it up. It saves a crop of the element plus 24px at the device scale.

- **Switch tools when one reads badly.** `gt-aesthetic` section 5 and `gt-website` cover the external playwright-core harness, theme seeding, the scroll-through before a full-page capture, and the in-app pane that pauses `requestAnimationFrame` and blanks canvases. A blank or wrong capture is a tool problem to solve. Kevin is never asked to check what an agent can measure.

- **Check every state of a moving element.** `--frames 12 --every 120` takes the box reading and a crop twelve times. On 2026-08-01 an agent equalized the gaps between the locale words on a hero orbit and judged them from a capture at rest. Kevin then found a wider gap on the orbit's flank, where one word had rolled over and its neighbour had not yet, because each word's footprint changed with its roll state.

## The real gesture and the real flow in detail

From section 2.

- **Dashboard UI passes Kevin's manual gate.** Before a dashboard commit or PR, gt-cloud's `.agents/skills/gt-dashboard` "UI Verification Checklist" has Kevin confirm that nothing shifts on refresh or resize, small screens work, nothing flickers or refetches, loading and empty states hold still, focus and hover states show, transitions have no white flash and no text clips. Walk every line first with evidence (captures, `stress.mjs` shifts, the probe), then ask him to confirm with that evidence attached. Authenticated pages run on the per-worktree dev environment with its seeded session (`gt-local-dev` section 4), so a sign-in wall is no reason to leave a screen unverified. The `/dev/states` gallery mounts every auth-adjacent state; it lives on a branch outside main, and `gt-local-dev` section 4 says how to use it.
- **Name every shortcut, then remove it.** Shortcuts include a programmatic selection, `click({ force: true })`, a script that sets state, and a harness route in place of the real screen. On 2026-09-02 the label fix in gt-cloud #4633 was first shown with a Range API selection on a harness route. After Kevin's question, a real drag selected "Project name" on the fixed label and selected nothing with `select-none` put back. Report the shortcut, run the gesture, then report the gesture. A harness route stays out of the PR (`gt-ship` section 3); that session deleted it before committing.

## The live deployment in detail

From section 7.

- **Production runs the merged commit.** Read the newest Ready production deployment's `githubCommitSha` and aliases with `vercel api /v13/deployments/<url>`, and check that it contains your merged commit (recipes, "The live deployment"). A newer deployment still building serves nothing yet.
- **The live page carries that deployment's stamp.** The page's HTML names the serving deployment as its longest `dpl_` id. On 2026-10-05 that id matched the newest Ready production deployment, built from origin/main's e17fce499. Prototemplate's check is `gt-ship` section 8.
- **The full-feature build is the one serving.** When several lanes or builds shipped, spot-check one feature from each in production with the probe or the stress script pointed at the production URL. Read in a fresh headless context; a page whose `dpl_` id is older than the deployment is a stale copy.
- **Failed builds.** While production builds fail, the site keeps serving the last good deployment, so a merged PR stays invisible (2026-10-02, `gt-reporting` section 2). `gt-website` section 8 reads the landing's Vercel logs; `gt-ship` section 8 reads Prototemplate's.

## Fix the class in detail

From section 8.

2. Fix every member, preferring the shared source. The 2026-09-02 label fix (#4633, open on 2026-10-10) removes `select-none` from the shared Label primitive in `packages/ui`, which every label above every dashboard input renders.
3. Verify each member and report the count. The 2026-09-02 report counted 26 label consumers in the dashboard. All of them import the shared primitive, and the dashboard's local Label copy had no importers, so the PR deletes it.

## Root cause and guard in detail

From section 9.

- **A phone screen recording** is read frame by frame. Attribute it to a build before saying whether it is fixed (recipes). On 2026-08-08 the frames matched production's build from before the fix, and gt-cloud #4240 carried the fix.

## Test discreetly in detail

From section 11.

- **Headless only.** Both scripts, check:pages and the harnesses run headless. Never launch a headed browser or open a URL in Kevin's browser to test. Put "headless only, no visible windows" in every brief that has an agent drive a browser. On 2026-09-25 agents measuring frame times opened headed windows over his work: "stop opening testing instances so much that go into the top layer of my screen".
- **Leave Kevin's sessions alone.** A funnel that signs out runs against the seeded dev-environment session, and seeding again restores it afterwards (`gt-local-dev` section 4). A CLI login under test runs with `XDG_STATE_HOME=<scratch>`. The `gt` CLI keeps its sign-in state under that folder, so his stored login stays untouched (`gt-local-dev` section 5). A server Kevin started is never stopped (`gt-local-dev` section 6).
