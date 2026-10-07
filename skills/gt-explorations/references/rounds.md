# The rounds, July to October 2026

Each entry names the surface, the ask, what was built, what Kevin picked or rejected, and the rule it set. Numbers are the ones Kevin used at the time. `SKILL.md` states the rules; these entries are the record behind them. Paths are relative to `$PROTOTEMPLATE` unless they name gt-cloud.

## 2026-07-28: twenty samples

- Surface: the GT site, in a standalone redesign app in gt-cloud (`apps/redesign` on the branch `redesign/diagram-standard`), later exported to Prototemplate.
- Ask: "literally 20 samples" after reading the wiki and the X bookmarks, built by agents under a harsh critic, ready to review when Kevin came back.
- Built: numbered samples from 00, and the research now in `docs/research/` (`DESIGN_BRIEF.md`, `inspo.md`, `STORYBOARD.md`, `x-bookmarks.json`).
- The same night Kevin asked for "one place to switch between all of these", and a switcher dock went over every sample.
- Rules: build the number asked for; one place to switch.

## 2026-07-29: keepers, picks and new versions

- Kevin kept 02, 06, 07, 08 (for its story component), 09, 15, 19 and 20 and asked for them as routes of a Next app.
- His notes then used switcher positions: version 1 for the layout, 6 for the wheel, 5 for the story section, the bentos and the diagrams. Version 9 was a fork of 1 in the old site's style. Version 10 was a minimalist evolution of the old site in the manner of oxc.rs and viteplus.dev, and it became Toolchain. Version 0 was the state before 1, and version 11 an earlier state of 1 from Kevin's screenshot.
- `docs/research/ITERATION_SPEC.md` mapped each position to its slug and set global rules from the same notes: no gradients, green dots, eyebrows or decorative badges, and every section a header with a subheader or with content.
- Rules: the number is the one Kevin sees; an overwritten version returns under its own number; a design can take parts from several numbers.

## 2026-07-29: five minimalist directions, text first

- Ask: five minimalist examples in the frame of viteplus.dev and oxc.rs that show the product working, planned as pages of text with a text description of each diagram, and reviewed module by module (hero, story, product bentos, banners, Locadex, footer, context groups, dashboard, integrations, pricing).
- Built: `docs/research/teardown-measured.md`, `teardown-oxc.md` and `teardown-viteplus.md` (the reference sites measured), `feature-inventory.md`, and `MODULES_PLAN.md` (five directions, each with one signature technique, written module by module).
- Rules: measure the reference first; write the page as text before building it.

## 2026-07-30: the presenter and the standard

- Built: `/present`, a full-screen presenter with opening slides, then every prototype live with a note and a rating, then a closing gallery of every version.
- Kevin named generaltranslation.com and resend.com as the bar and asked for side-by-side comparison against the sites he likes. `docs/research/DESIGN_STANDARD.md` was derived from those composites, with a 0 to 10 rubric and 8.5 as the bar.
- Rule: a separate harsh critic scores composites against a written rubric.

## 2026-07-31: the renumber

- Kevin removed 00 to 09 and 11 from review, kept twelve, and renumbered them with Toolchain as 01. The slugs did not change, and the retired pages kept their routes until the archive of 2026-09-08.
- Toolchain became the single source of truth: the other eleven are forks that import its sections and rescope its CSS under their own root class.
- Rules: renumber in one pass when Kevin asks; keep slugs; never edit the source of truth during fork work.

## 2026-08-02 to 08-06: full sites

- Singularity (13) was followed by five full site pairs, each a Toolchain-based home with its own `/enterprise` page. Kevin cut two on 2026-08-06, leaving Dossier (14), Orbit (15) and Signal (16).
- Kevin, 2026-08-06: "dossier is indeed our completed version and treat it as such". Orbit and Signal stay as showcases of the sections the Dossier retired.
- Rule: a completed direction becomes the reference for later work (`gt-aesthetic` section 1).

## 2026-08-04: the rebuild from the Figma plan

- The first full build from the plan's mock images kept the copy and drifted from the layouts. Kevin kept one element, the Locadex isometric, and sent the mock images as the layout specification.
- The same day he sent the plan for the terminal-hero version of the landing and expected the other version to be started without a separate ask.
- Rules: one exemplar first; mock images are literal layout specs; the praised element is the base of the rebuild; start the implied siblings.

## 2026-08-05: the shader survey and the Bayer family

- Ask: a control on the hero to switch between ten shaders, then five dither and five light-based variations. Kevin picked 01, the Bayer dither, and asked for options based on it.
- Built: `BAYER_PRESETS` in `src/lib/studio-field.ts`, ten Bayer materials. Slot 01 is the pick, byte for byte, and the other nine vary matrix order, cell scale, the tone field, motion and palette balance. 02 bayer-8x8 later became the shared default (`BAYER_DEFAULT_ID`).
- The same day: a hover-effect menu at the bottom right of the Singularity heroes (`src/components/shared/FieldEffectsMenu.tsx`), extended that evening to the enterprise pages of the full sites.
- Rules: effect variants get an in-page menu; variants of a winner move along real axes of its engine; the pick becomes the documented default.

## 2026-08-11 and 08-12: the restart of the new pages

- Kevin rejected the redrawn diagrams on the new pages and asked for a restart, approached the way Toolchain and the Dossier had been built.
- On pricing he kept most of the earlier page and named the parts he had screenshotted as the most important to keep.
- Rules: restart from the reference; carry forward everything praised or screenshotted.

## 2026-08-12: the variants program

- Ask: five versions of each of seven pages (blog home, blog post, enterprise, pricing, supported locales, careers, sign-in), each presenting everything differently, with copy no worse than the live site's, and a way to switch between them.
- Built in gt-cloud `apps/landing`: `?v=1..5` with a per-page cookie, a thin dispatcher per page, slot 1 as the committed page, a development-only dock with chips and keys 1 to 5, and a plan and a trace document.
- The same day Kevin chose slot 1 everywhere and asked for the variation system to go. The flatten (gt-cloud `1db410568`) removed about 16k lines, and the sign-in route was checked byte-identical. The other variants stay in git history.
- Rules: slot 1 is the current page; keep the dispatcher thin; remove the system after the pick.

## 2026-08-13: twenty blues

- Ask: a navy option, and a switcher of twenty blues to compare palettes in place.
- Rule: palette searches use the same in-page switcher as effects.

## 2026-09-04: ten frames

- Kevin asked for ten frames of a background shader in motion, to pick one for a graphic. Nine of the ten that went out looked the same.
- Rule: check that a set differs before sending it (`scripts/distinct-set.mjs`).

## 2026-09-07: dock layouts as whole pages

- The options for the docs dock at midsize widths were shown as whole-page screenshots at Kevin's request. The next day he picked the version without a card border.
- Rule: layout options are shown as whole pages.

## 2026-09-08: the archive

- The retired direction routes left the tree (commit c064945), and each became an entry in `src/lib/archive.ts` with a first-fold capture, a full-page capture and the last commit that held its code.
- Rule: archive a version with its captures and its last commit before deleting it.

## 2026-09-09 to 09-29: the marks

- Bilingual, counterform and reflection marks were added as explorations on 2026-09-09, and Kevin chose the speed set on 2026-09-29. `/marks` shows the seven speed marks, two survivors of the earlier round for comparison, and the current mark as `REFERENCE_MARK`, which is never a candidate (`src/lib/marks.ts`).
- Rule: survivors of an earlier round stay beside the new set, and the current design is the reference.

## 2026-09-14: the deco rounds

Kevin asked for two directions, real Art Deco and a dither-led Art Deco, with five approaches each. Five rounds followed on Prototemplate that day.

1. Ten directions, five of each kind (commit fee151f), pushed straight to main. Kevin asked for GT's design elements and complete, considered pages, and stopped the push: the round belonged on localhost. Main was reset, and the work continued on the branch `deco-round`.
2. The ten rebuilt as complete forks of one earlier direction, dither-field (1d3bd12). Kevin: they followed the old ones closely and had to be completely new.
3. A from-scratch round in machine-age Metropolis deco, stopped mid-build. Kevin meant the revival of Egyptian, Mayan and Assyrian forms, in geometry only, started from scratch while saying the same things about GT. The Metropolis rounds were retired (db06905).
4. Ten new directions in the revival lineage, each a distinct form, written against a charter (156ca85) and complete at rest (e80aea8). Kevin reviewed them on localhost and shortlisted seven, and three were cut (b6a7eba). He then said to put the round on the live site ("commit and push oriignn main", 2026-09-15), and b6a7eba went to main.
5. The seven deepened within their own forms, with three new forms beside them (2d6f32b), on the branch. The seven kept labels 18, 19, 21, 23, 24, 25 and 26, and the new ones took 27, 28 and 29.

Rules: directions differ in silhouette, material and action; "completely new" means from scratch with GT's elements kept; a named lineage is researched before drawing; each direction is complete at rest; rounds stay local until Kevin lands them; survivors keep their numbers.

## 2026-09-12, 09-30 and 10-01: methods from Kevin's own projects

- Before cloning a product, Kevin asked for research into everything it offers, where its controls and import paths sit, and how it solves its hardest problem (2026-09-12 and 2026-10-01).
- He returned redesigns that kept the earlier shape as not done and asked again for complete redesigns (2026-09-30).
- Rules: research the product and write it down first; a redesign is visibly new.

## 2026-10-03 and 10-05: film rounds

- Kevin asked to bring back an earlier element of the docs film beside the current cut (2026-10-03), which the archived finals made possible (`gt-films`, "Renders").
- Voice takes went on a listening page so he could compare them by number (2026-10-05).
- Rules: archive each published cut before overwriting it; audio options go on a page with a player per take.
