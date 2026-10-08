# Quality bar

Kevin Liu reviews General Translation (GT) design and site work. Work is ready to show him or to ship when it clears the bars below for its kind of artifact. Each bar names the skill that owns it, and that skill holds the procedure for meeting the bar. When this page and a skill disagree, the skill wins, and the change that finds the difference corrects this page. A bar that no skill holds yet lives on this page, and its Owner column says so.

## The overall bar

- GT's own finished work is the reference. The brand deck governs product surfaces, and the shipped site, generaltranslation.com, governs landing and marketing pages ([gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 1). The deck is built from `deck/` and served at `/deck`, and the site is built from `apps/landing` on gt-cloud origin/main. From 2026-08-06 the Dossier (`/d/singularity-dossier`) governed the site (Kevin, 2026-08-06: "dossier is indeed our completed version and treat it as such"). On 2026-10-07 Kevin ruled "fix the dossier references", and the Dossier stays in the gallery as the direction the site grew from. Before the deck and the Dossier existed, the July rounds measured against generaltranslation.com and resend.com (Kevin, 2026-07-30).
- Clearing every row on this page is the minimum. The work must also hold up beside its reference at the same geometry, and the convergence loop below checks that.
- When tweaks will not reach the bar, restart from the reference. A version Kevin rejected is never the base of the next attempt ([gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 2). On 2026-08-11 he had the diagrams of the new site pages restarted outright.
- Every page gets a second pass against its reference before it is shown ([gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), verdict of 2026-08-17).
- A bar is met on the rendered result. A gate is a typecheck or a lint. A structural check confirms that a page loads with the right hierarchy and dimensions, and reports also call it a proxy check. A measured check reads computed values or pixels on the render, and a visual check is a person or a fresh critic comparing a crop with its reference. An item that passed only gates and structural checks is reported as unverified ([gt-verify](../../skills/gt-verify/SKILL.md), The definition of done). Every report says which kind of check passed ([gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4; [gt-reporting](../../skills/gt-reporting/SKILL.md), section 1).

## Reading the tables

Owner is the skill or document that holds the bar, with the section to read. Read is the day the owner was read for this page. Where the owner is this page, Read gives the day Kevin set the bar. Paths are relative to the Prototemplate root, and the [glossary](glossary.md) defines terms such as plate, rail and the Dossier.

## Pages

The rows apply to product surfaces, the site, Prototemplate's own pages and docs pages.

| Bar | Owner | Read |
| --- | --- | --- |
| The page matches its reference measure for measure, and every value the reference lacks has a stated reason. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 1 | 2026-10-05 |
| Content comes from production or the prototype spec, and nothing is invented. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), review checklist | 2026-10-05 |
| A display head holds two lines at most at every width. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 4 | 2026-10-05 |
| A lead reads in two or three lines at 60 to 70 characters, and prose stays under 75. `node skills/gt-aesthetic/scripts/measure-type.mjs <url> --strict` passes, or each flag has a reason. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), sections 1 and 4 | 2026-10-05 |
| Nothing overflows its column or the viewport, and no text is clipped. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), review checklist; [gt-lints](../../skills/gt-lints/SKILL.md), check:pages | 2026-10-05 |
| Nothing shifts after first paint, and client-mounted rows reserve their height. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), review checklist; [gt-lints](../../skills/gt-lints/SKILL.md), check:pages | 2026-10-05 |
| Tap targets on a phone are 44px. `check:pages` fails a target under 40px and notes one of 40 to 43px. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 3 (Rhythm); [gt-lints](../../skills/gt-lints/SKILL.md), check:pages | 2026-10-05 |
| Text a reader needs clears 4.5:1 in both themes. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 3 (Hierarchy and contrast) | 2026-10-05 |
| Every line is drawn once by one owner, rules run edge to edge, and junctions pass at 2x crops. In Prototemplate's chrome each line takes the `hair`, `hair-soft` or `edge` role and `pnpm lint:lines:shell` is clean. Any other page passes `pnpm lint:lines <url>` in both themes. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 3; [DESIGN.md](../../DESIGN.md), section 2; [gt-lints](../../skills/gt-lints/SKILL.md), lint:lines | 2026-10-05 |
| The surface carries one dithered material, at the landing hero's strength or under it. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 3 (Material); [gt-dither](../../skills/gt-dither/SKILL.md) | 2026-10-05 |
| The page uses one accent, GT blue, and semantic color sits only on icons. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 3 | 2026-10-05 |
| Each width shows one composition. Intermediate widths and zoomed windows fall to the mobile composition, with no hybrid of desktop logic and mobile layout. | [gt-verify](../../skills/gt-verify/SKILL.md), section 4 | 2026-10-05 |
| The longest translation of every string fits its reserved lines, and the layout holds in CJK, RTL and Indic text as well as Latin. | [gt-verify](../../skills/gt-verify/SKILL.md), section 5; [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 4 | 2026-10-05 |
| Both themes are shot at 1440 and 390 (plate pages also at 1527 by 814), and `pnpm check:pages --preset quick --pages <id>` shows zero defects on every touched page. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), section 5 (Local review); [gt-lints](../../skills/gt-lints/SKILL.md), section 2 | 2026-10-05 |
| A Prototemplate page with a book head follows the book page standard (nothing drawn above the title, the panel with Updated first, one band ruled on both edges), and its corners follow the radius law. `pnpm lint:heads` and `pnpm lint:radius` pass, live modes included. | [prototemplate](../../skills/prototemplate/SKILL.md), sections 3 and 5; [DESIGN.md](../../DESIGN.md), sections 2 and 4 | 2026-10-06 |
| The lints pass: `pnpm lint:all` in Prototemplate and `pnpm lint` in gt-cloud. | [gt-lints](../../skills/gt-lints/SKILL.md), review checklist | 2026-10-05 |

A landing or marketing page also clears the [gt-landing-pages](../../skills/gt-landing-pages/SKILL.md) checklist (one rail, hatch spacers, heads, the shared `Cta`), checked at 390, 768, 1024, 1440 and 1920 in both themes.

## Motion

| Bar | Owner | Read |
| --- | --- | --- |
| Dither loops draw at their 30 fps budget by design. Every other animation meets the 60 fps bar in the Performance table. | [gt-motion](../../skills/gt-motion/SKILL.md), section 2 (Durations) | 2026-10-05 |
| A language morph lasts longer than 0.5 s, so the glyphs visibly regroup. It finishes inside the time its locale holds the screen, such as one stop of the hero's locale belt. Kevin, 2026-08-05: "the morphings are still way too fast theyre like <0.5 sec". Later that day he called a slower morph "a lil too long". | This page | 2026-08-05 |
| A morph dissolves through glyphs at every width and never collapses into a fade. | [gt-motion](../../skills/gt-motion/SKILL.md), section 5 | 2026-10-05 |
| A scroll story runs on one scrubbed dial. Each beat owns a scroll range with dwell, and scrolling back plays the story backward. | [gt-motion](../../skills/gt-motion/SKILL.md), section 6 (Scroll stories); [gt-landing-pages](../../skills/gt-landing-pages/SKILL.md), Scroll stories | 2026-10-05 |
| Product pages have no entrance animation. | [gt-motion](../../skills/gt-motion/SKILL.md), section 1 | 2026-10-05 |
| Reduced motion renders a designed still, and the resting markup reads without JavaScript. | [gt-motion](../../skills/gt-motion/SKILL.md), section 1 | 2026-10-05 |
| Scrolling is native (`gt-ui/no-smooth-scroll`). | [gt-motion](../../skills/gt-motion/SKILL.md), section 1 | 2026-10-05 |
| Motion is verified with real pixels from an external browser, in both themes, under reduced motion, at 1440 and 390. | [gt-motion](../../skills/gt-motion/SKILL.md), Verifying motion | 2026-10-05 |

## Graphics and diagrams

| Bar | Owner | Read |
| --- | --- | --- |
| Every crop comes from a registered capture of the real product. An illustrative mock in a set is described as a mock. | [gt-graphics](../../skills/gt-graphics/SKILL.md), What a visual is | 2026-10-05 |
| Text in a blog visual measures 26px or more after the fit, and `pnpm graphics:audit` passes. | [gt-graphics](../../skills/gt-graphics/SKILL.md), Sizing for the blog column | 2026-10-05 |
| Renders are supersampled (shot 7680 wide and halved to 3840). Every visual with lines or small type is read at 1:1 as well as on the contact sheet. | [gt-graphics](../../skills/gt-graphics/SKILL.md), What a visual is and Procedure | 2026-10-05 |
| A diagram shows a relationship the text alone does not, drawn from the real artifact as one connected composition. | [gt-diagrams](../../skills/gt-diagrams/SKILL.md), section 1 | 2026-10-05 |
| Numbers printed in a diagram match what the eye sees. Kevin, 2026-08-05: "yeah it just doesn tlook like +63%". | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), review checklist | 2026-10-05 |
| Junctions are read at 2x crops in both themes, because the line auditor skips SVG. | [gt-diagrams](../../skills/gt-diagrams/SKILL.md), section 9 | 2026-10-05 |
| An OpenGraph card has a composition of its own, apart from the header cover, set in the house type with the house lines and centered on its canvas. It is rendered and looked at after every change, and its size and themes follow [gt-graphics](../../skills/gt-graphics/SKILL.md) (Sizing for the blog column). Kevin, 2026-09-17: "the tweet/blog header cover is the angled one and the opengraph is the exploded components". | This page | 2026-09-17 |

## Copy

| Bar | Owner | Read |
| --- | --- | --- |
| The hard rules hold: no em dashes, metaphors, contrast pairs, fragment rhythm, exclamation marks, rhetorical questions, signposts, eyebrows, marketing vocabulary or emojis. | [gt-voice](../../skills/gt-voice/SKILL.md), Hard rules | 2026-10-05 |
| Every line passes the copy test: it states a number or a mechanism, and a line a competitor could use unchanged is cut. | [gt-voice](../../skills/gt-voice/SKILL.md), Facts and public surfaces | 2026-10-05 |
| The humanizer pass scores 35 of 50 or higher across directness, rhythm, trust, authenticity and density. | [gt-voice](../../skills/gt-voice/SKILL.md), The humanizer pass | 2026-10-05 |
| Heads are plain nouns in sentence case with no trailing period, and Title Case is kept for buttons. | [gt-voice](../../skills/gt-voice/SKILL.md), Headings and casing | 2026-10-05 |
| Every sentence has a subject and a verb, the subject is short, and no aside interrupts a clause. | [gt-voice](../../skills/gt-voice/SKILL.md), Sentence shape | 2026-10-05 |
| Public writing stands alone for a developer who has never heard of Kevin or GT. It defines the product once, and each section opens with the point a stranger can reuse. | [gt-voice](../../skills/gt-voice/SKILL.md), Writing for strangers | 2026-10-05 |
| Nothing sensitive appears on a public surface: funding, revenue, headcount, customer counts or unannounced launches. | [gt-voice](../../skills/gt-voice/SKILL.md), Facts and public surfaces | 2026-10-05 |

## Pull requests

| Bar | Owner | Read |
| --- | --- | --- |
| On a gt-cloud PR, Greptile reads 5/5 on the head commit. Kevin, 2026-09-13, after a merge at 4/5: "bruh u merged without addressingthis". | [gt-ship](../../skills/gt-ship/SKILL.md), section 5 | 2026-10-05 |
| Every bot thread has a reply naming the fixing commit and is then resolved. | [gt-ship](../../skills/gt-ship/SKILL.md), section 5 | 2026-10-05 |
| The three required checks on gt-cloud main are present and green, and `node skills/gt-ship/scripts/pr-bots.mjs <n>` exits 0. | [gt-ship](../../skills/gt-ship/SKILL.md), section 5 | 2026-10-05 |
| `node skills/gt-ship/scripts/pr-size.mjs` was read and every large group is justified in the body. The diff holds no recorded fixtures, harnesses, review galleries or planning Markdown. | [gt-ship](../../skills/gt-ship/SKILL.md), section 3 | 2026-10-05 |
| The PR carries one concern under a conventional title, and a `feat` PR links a Linear issue. | [gt-ship](../../skills/gt-ship/SKILL.md), section 3 | 2026-10-05 |
| The body is a two-sentence summary and What to look at, with before and after crops refreshed after every visible change. It is written in Kevin's own register (lowercase, first person), and the crops carry most of the explanation (Kevin, 2026-10-05). | [gt-ship](../../skills/gt-ship/SKILL.md), section 4; [gt-voice](../../skills/gt-voice/SKILL.md), Two registers | 2026-10-05 |
| Kevin merges the PR or says to merge it. | [gt-ship](../../skills/gt-ship/SKILL.md), section 5 | 2026-10-05 |

## Convergence loops

A convergence loop iterates on quality until a bar holds: a page against its reference, a set of graphics against its best accepted item, a film cut against its brief. Kevin, 2026-07-30: "remember the bar is generaltranslation.com and resend.com. literally rereview and continuously score yourself until it look sright".

| Bar | Owner | Read |
| --- | --- | --- |
| The brief names the reference and the bar before the first round. For a set, the bar is the best item Kevin has accepted. | [gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4 | 2026-10-05 |
| The work and the reference are captured at the same geometry (viewport, theme, camera, crop) and placed side by side. | [gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4 | 2026-10-05 |
| A fresh critic that did not build the work scores each view blind against the reference. It is told to be harsh, and it names what the reference does that the work does not. | [gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4 | 2026-10-05 |
| Each view has a numeric bar wherever it can be scored, stated in the brief. The bar ends the loop; a cap on rounds is a budget stop, and the report lists the gaps still open. | [gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4 | 2026-10-05 |
| One strong view never averages away a weak one, and the builder never scores its own work. | [gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4 | 2026-10-05 |
| Refiners fix only the gaps the critic named. | [gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4 | 2026-10-05 |
| Kevin's note outranks a critic's pass. An item he called wrong stays open until he says otherwise. | [gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4 | 2026-10-05 |
| When scores stop rising, the method changes: measure the reference and rebuild, or change the idea. | [gt-orchestration](../../skills/gt-orchestration/SKILL.md), section 4; [gt-films](../../skills/gt-films/SKILL.md), section 3 | 2026-10-05 |

## Performance

| Bar | Owner | Read |
| --- | --- | --- |
| Performance work leaves the look unchanged. An audit whose fix would change the design (contrast, tap target size, a dropped effect, a lower resolution) goes to Kevin with its measured gain. Kevin, 2026-08-05: "fix the lighthouse without changing anything aesthetically". | [gt-performance](../../skills/gt-performance/SKILL.md), section 1 | 2026-10-05 |
| Animation and interaction run at 60 fps at full resolution. Loops start complete, and the first interaction never stalls. | [gt-performance](../../skills/gt-performance/SKILL.md), section 1 | 2026-10-05 |
| Frame time is measured before and after the change (`node skills/gt-performance/scripts/frame-probe.mjs <url>`) and reported in a table. | [gt-performance](../../skills/gt-performance/SKILL.md), section 2 | 2026-10-05 |
| Every timing carries the machine's load average, and before and after runs go back to back under similar load, because parallel agents distort the numbers. | [gt-performance](../../skills/gt-performance/SKILL.md), section 2 | 2026-10-05 |
| An engine with quality tiers picks its tier from measured frame cost. | [gt-performance](../../skills/gt-performance/SKILL.md), section 3; [gt-motion](../../skills/gt-motion/SKILL.md), section 6 | 2026-10-05 |
| Lighthouse is read from a production build in a clean profile, or from production after the merge, and the PR carries the real report. | [gt-performance](../../skills/gt-performance/SKILL.md), section 6 | 2026-10-05 |
| A budget lives in the probe that measures it and fails like a lint, and a red budget blocks the change. | [gt-performance](../../skills/gt-performance/SKILL.md), section 8 | 2026-10-05 |

## Films

| Bar | Owner | Read |
| --- | --- | --- |
| Kevin reads the scripts before the build, which waits for his answer. He picks a new narrator from auditions. | [gt-films](../../skills/gt-films/SKILL.md), sections 3 and 7 | 2026-10-05 |
| A critic watches each draft frame by frame (every 0.5 s, and every 0.25 s around each cut and major move) and reports every defect with its time and a fix. | [gt-films](../../skills/gt-films/SKILL.md), section 9 | 2026-10-05 |
| `node skills/gt-films/scripts/measure-render.mjs` passes on the render (-17 to -15 LUFS, true peak under -1 dBTP, 1920 by 1080 at 60 fps), and `hyperframes check` ends with 0 errors. | [gt-films](../../skills/gt-films/SKILL.md), review checklist | 2026-10-05 |
| A non-English take has a native listener's sign-off. | [gt-films](../../skills/gt-films/SKILL.md), section 7 | 2026-10-05 |

## Charts

Kevin set these bars for benchmark charts on 2026-07-30 and 2026-09-30. The wiki's `dataviz` skill holds the general method for form, color and marks.

| Bar | Owner | Read |
| --- | --- | --- |
| The win is obvious at a glance. | This page | 2026-07-30 |
| Compared series are stacked or overlaid so the margin reads exactly, and the bars in one set share one style. | This page | 2026-07-30 |
| The method is stated beside the chart: what was measured, how, and on what. | This page | 2026-07-30 |
| A metric that shows cost savings is prominent. | This page | 2026-07-30 |
| Benchmarks are run fresh for the chart that ships. | This page | 2026-09-30 |
| The chart leads with the most impressive true metric. Kevin, 2026-09-30: "why just tokens? show our speed diagram too thats more impressive". | This page | 2026-09-30 |
| Marks match their values, and every number agrees with each other place it appears. | [gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), review checklist | 2026-10-05 |

## Repositories

Kevin set these bars for a repository's own documents between 2026-08-02 and 2026-09-30.

| Bar | Owner | Read |
| --- | --- | --- |
| The README holds the shipped product's instructions and stats in a concise form, with the OpenGraph image and a demo GIF at the top and screenshots of what it does. Kevin, 2026-09-30: "youre treating the readme as like a log of work instead of a concise summary". | This page | 2026-09-30 |
| The repository's description and topics are set. | This page | 2026-08-04 |
| A `LICENSE` file states the terms. Prototemplate's license reserves all rights to General Translation, Inc., and third-party fonts, icons and adapted skills keep their own licenses. | [prototemplate](../../skills/prototemplate/SKILL.md), section 10; [LICENSE](../../LICENSE) | 2026-10-05 |
| `AGENTS.md` explains the repository's layout and philosophy, `SKILL.md` explains how to use the tool and everything it does, and both match the code. | This page | 2026-08-02 |
| Prose that has drifted from the code is corrected in the change that finds it. | [prototemplate](../../skills/prototemplate/SKILL.md), section 1 | 2026-10-05 |

## Done

Work is ready to show when its artifact's table holds on localhost or in a file Kevin can open, and the report carries before and after crops of each changed region in both themes ([gt-aesthetic](../../skills/gt-aesthetic/SKILL.md), Showing the work). It is ready to ship when the pull request table holds as well. It is done when the rows below hold.

| Bar | Owner | Read |
| --- | --- | --- |
| A visual fix is measured on the render at the spot Kevin flagged (computed values, 2x or 4x crops, pixel probes), in every state of a moving element. | [gt-verify](../../skills/gt-verify/SKILL.md), section 1 | 2026-10-05 |
| The real gesture and the real flow work in the running app, for every category of item the change covers. Any shortcut is named and then replaced by the real gesture. | [gt-verify](../../skills/gt-verify/SKILL.md), section 2 | 2026-10-05 |
| The stress matrix, viewports, themes, browsers and edge counts that apply were walked. | [gt-verify](../../skills/gt-verify/SKILL.md), sections 3 to 5 | 2026-10-05 |
| Items that were right before the change are still right. | [gt-verify](../../skills/gt-verify/SKILL.md), section 6 | 2026-10-05 |
| Every member of the defect's class was found, fixed and checked. | [gt-verify](../../skills/gt-verify/SKILL.md), section 8 | 2026-10-05 |
| Shipped work is live: every lane's commits are on main, production's commit contains them, the live page carries that deployment's stamp, and the OG card is read live. For Prototemplate, the `dpl` stamp on www equals the team deployment. | [gt-verify](../../skills/gt-verify/SKILL.md), section 7; [gt-ship](../../skills/gt-ship/SKILL.md), section 8 | 2026-10-05 |
| The report says how each item was verified and names what was not, with the reason. | [gt-verify](../../skills/gt-verify/SKILL.md), section 12 | 2026-10-05 |

## Sources

- Skills read on 2026-10-05: `skills/gt-aesthetic/SKILL.md` and `references/verdicts.md`, `skills/gt-verify/SKILL.md`, `skills/gt-orchestration/SKILL.md`, `skills/gt-performance/SKILL.md`, `skills/gt-landing-pages/SKILL.md`, `skills/gt-lints/SKILL.md`, `skills/gt-motion/SKILL.md`, `skills/gt-graphics/SKILL.md`, `skills/gt-diagrams/SKILL.md`, `skills/gt-voice/SKILL.md`, `skills/gt-ship/SKILL.md`, `skills/gt-films/SKILL.md`, `skills/gt-dither/SKILL.md`, `skills/gt-reporting/SKILL.md`, `skills/prototemplate/SKILL.md`.
- Canon: `DESIGN.md` section 2, `deck/DECK-GRAMMAR.md`, `docs/SHIP-LOOP.md` section 2, `scripts/pagecheck/README.md`, `LICENSE`.
- Kevin's rulings, checked against his messages to Claude Code and Codex: 2026-07-30 (the reference sites, side-by-side scoring, chart margins, method and cost metric), 2026-08-01 and 2026-08-02 (the OpenGraph card's type and lines), 2026-08-02 (`AGENTS.md` and `SKILL.md`), 2026-08-04 (two-line heads, repository topics), 2026-08-05 (morph length, numbers in diagrams, Lighthouse with no visual change), 2026-08-06 (the Dossier), 2026-08-11 (the diagram restart), 2026-08-17 (the second pass), 2026-09-13 (Greptile 5/5), 2026-09-17 (the OpenGraph card's own composition), 2026-09-30 (chart metric, README), 2026-10-05 (the page heads, PR bodies that let the crops explain), 2026-10-07 (the shipped site as the site's reference).
