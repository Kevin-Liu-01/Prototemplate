---
name: gt-aesthetic
description: >-
  Kevin's taste for General Translation work and the review he applies to it.
  The brand deck (deck/parts/head.html and DECK-GRAMMAR.md) is the reference
  for product surfaces and the shipped generaltranslation.com is the
  reference for the site. Covers contrast and hierarchy, the rhythm numbers,
  single lines whose weight carries meaning, one material per surface, type
  polish for heads and leads, the dated record of what Kevin rejected and
  why, and the review loop of one exemplar, a local review, then landing,
  with a script that measures a page's heads and leads. Use when designing
  or polishing any GT surface, when Kevin says something looks bad, busy or
  ugly, and before showing him design work.
metadata:
  title: Taste and the review standard
  areas: aesthetic, website, landing, components
  updated: 2026-10-07
  origin: prototemplate
---

# Taste and the review standard

General Translation (GT) builds open-source i18n libraries and a translation platform. Kevin Liu reviews its design work, and he judges every GT surface against two finished references: the brand deck for product surfaces and the shipped generaltranslation.com for the site. This skill records what those references measure, the verdicts he has given with their dates, and the loop in which he reviews work. Read it before designing a GT surface and again before showing him the result.

Paths are relative to a checkout: `$PROTOTEMPLATE` is Prototemplate (Kevin's design lab, served at prototemplate.com) and `$GT_CLOUD` is gt-cloud (the monorepo of the GT site, docs and dashboard). Read gt-cloud facts from `origin/main` or a fresh worktree, because a long-lived checkout can sit on an old branch. `references/verdicts.md` holds every dated verdict in Kevin's words, `references/measures.md` holds the numbers of each reference, and `scripts/measure-type.mjs` reads the heads and leads of any page.

## 1. The reference

Every surface has one governing reference, and its values are measured before any new value is invented.

| Surface | Reference | Where it lives |
| --- | --- | --- |
| Product surfaces: the dashboard, onboarding and the auth plate, the Prototemplate shell and its pages, the deck itself | The brand deck | `$PROTOTEMPLATE/deck/parts/head.html` (tokens and CSS), `deck/DECK-GRAMMAR.md` (rules), `/deck` on the dev server |
| The site: generaltranslation.com, landing and marketing pages | The shipped site | `$GT_CLOUD/apps/landing` on `origin/main`, served at generaltranslation.com; Prototemplate's page-for-page copy at `/d/production`; BRAND.md section 8 |
| Enterprise and pricing pages | The toolchain prototypes | `/d/toolchain/enterprise` and `/d/toolchain/pricing`, copy included, word for word |
| Page content | Production | the current generaltranslation.com page components on gt-cloud `origin/main` |
| Material on a product surface | The landing hero's field | the studio's bayer-8x8 preset through `createStudioField` in `$GT_CLOUD/apps/landing/src/lib/studio-field.ts`, mounted by `HeroField.tsx` (`references/measures.md`) |
| Dithered pictures | The Blue Marble | `$PROTOTEMPLATE/docs/ARTIFACT-PICTURES.md` |

Kevin named the deck as a reference: "i really love our deck's navigation and basic interface" (2026-09-08), and on 2026-09-25 he answered the first dashboard pass with the deck's URL. From 2026-08-06 the site's reference was the Dossier (`/d/singularity-dossier`): "dossier is indeed our completed version and treat it as such". On 2026-10-06 he asked "why is the dossier the reference for Brand? its evolved so much more since then", and on 2026-10-07 he ruled "fix the dossier references". The shipped site grew from the Dossier's direction: gt-cloud #4213 built the production landing from it, and that landing became canonical for the redesign stack on 2026-08-11. Since then the identity has added the deck as the reference for product surfaces (2026-09-25), the speed marks (2026-09-29), the films on `/motion` and the cycling title badges. BRAND.md section 8 now names where the identity ships, and the Dossier stays in the gallery as the direction the site grew from.

### Measuring the reference

- Open the reference and the new surface at the same width and theme, and read the computed values of the matching element: size, line height, weight, tracking, color token, padding and gap. Copy them. A value the reference does not have needs a reason, and the reason goes in the commit or the PR.
- Read tokens and never retype a value. The deck's tokens live in `head.html`, the shell mirrors them as `--pt-*` in `$PROTOTEMPLATE/src/components/viewer/tokens.css`, and the dashboard plate uses the deck's own names in `$GT_CLOUD/apps/dashboard/src/app/brand-tokens.css`.
- For heads and leads, run the script on the reference and on the new page with the same flags and compare the rows. Run it from a Prototemplate checkout, which has `playwright-core`; from an installed copy of this skill, run that folder's `scripts/measure-type.mjs` with the working directory in such a checkout.

  ```bash
  node skills/gt-aesthetic/scripts/measure-type.mjs http://localhost:3005/brand-deck.html --storage gt-deck-mode=book --sel ".book-head h1, .book-head p"
  node skills/gt-aesthetic/scripts/measure-type.mjs http://localhost:3005/motion --strict
  ```

  It reads 1440 and 390 in both themes and flags a heading above weight 500, a display head on more than two lines, a lead on more than three (five on a phone), prose wider than 75 characters, an unbalanced heading, a display head without `cv11` and `ss01`, tracking above +0.02em or below -0.03em, a face other than Inter, a short last line, and text under the WCAG contrast floor. `/deck` serves `/brand-deck.html` itself, so either address measures the deck; `--storage gt-deck-mode=book` opens its book view. A page that does not load within `--timeout` (120000 ms by default) prints "could not load", which happens on the shared dev server when the machine is loaded, so raise it there. `--widths` and `--themes` narrow the run.
- When Kevin names a reference (a URL, slide numbers, a production page or a screenshot), open it and measure it before changing anything.

## 2. What Kevin rejected

Each row is a verdict on real work and the rule it set. The full wording and context of each is in `references/verdicts.md`. Work that he rejected restarts from the reference, and the rejected version is never the base of the next attempt.

| Date | What he rejected | The rule since |
| --- | --- | --- |
| 2026-08-04 | Sections that kept the copy and drifted from the Figma mock layouts | A mock image is a layout spec: the composition, what sits left and right, which visual sits where |
| 2026-08-04 | Three-line headers, headers floating in whitespace, floating bordered cards, broken border grammar and double borders | Display heads hold two lines at most, rules run edge to edge, heads sit in ruled bands, one line per seam |
| 2026-08-04 | The Locadex isometric without its mark | Marks are seated into the drawing; Locadex is never a gif |
| 2026-08-11 | Redrawn diagrams ("these diagrams are so bad"), "ugly ai gradients", bad spacing, invented enterprise content, a sign-in that "looks exact same" | Content from production, layout from the toolchain and the Dossier, only the praised diagrams kept, no invented product vignettes |
| 2026-08-11 | The same diagrams, which laid flat logos over isometric drawings; the restart that followed seated them | A mark is an alpha mask in the face's plane, filled with a token |
| 2026-08-11 | The avoid list: mono as the brand voice, smooth scrolling, robot and sparkle AI icons, flag soup, AI gradients and glass, eyebrows, em dashes | Most items are gt-ui lint rules in gt-cloud and in Prototemplate's `pnpm lint:code` (`no-smooth-scroll`, `no-eyebrow`, `mono-is-not-voice`, `no-em-dash`, `no-raw-locale-flags`, `icon-tiers`); AI icons, gradients and glass have no rule and are checked by eye (`gt-lints`) |
| 2026-08-12 | Keeping the variant system after he picked one variant per page | The alternatives leave the code and stay in git history |
| 2026-08-17 | Pages that never had a second pass, and monospace in page copy | Every page gets a second pass against the reference |
| 2026-08-26 | The docs draft | Smaller text with more leading, no mono, diagrams and real icons, the shell's grid lines |
| 2026-09-04 | An oval shadow behind a blog graphic's subject | No drawn shadows; depth comes from lines and the dither |
| 2026-09-14 | Exploration rounds that were a costume, ten skins of one page, or the wrong lineage, pushed to main unseen | Directions differ in silhouette, material and action, and rounds stay local until he lands them |
| 2026-09-18 | Switzer beside Inter | Inter is the only face |
| 2026-09-25 | The first dashboard: boxed tiles and cells, titanium hairlines on every edge, uppercase mono eyebrows, registration crosses floating in the app, flat -0.028em tracking at every size, ink-4 text, two stacked scope switchers, chevron groups | The deck's grammar on every product surface (section 3) |
| 2026-09-25 | A heavy horizon ring as the app's material | The landing hero's field sets the strength of any material, and a surface carries one |
| 2026-09-28 | Sun and moon theme icons; 13px card facts; fade-and-rise entrances; a top header over onboarding; fills on layout containers | The ◐ and ◑ glyphs; the 12px rung; no entrance animation; the mark in the plate's head; no container fills |
| 2026-09-29 | Pictures that do not fit the page ("the great wave for example does not really make sense here"); texture cut away around type; layout shift between states | A picture shows writing, language or the earth; faint texture across the whole face; reserved heights and a fixed foot |
| 2026-09-30 | Picture plates over two lines and copy tying a picture to GT ("the corny stuff") | A title, one factual sentence about the artifact, a credit |
| 2026-09-30 | Two gaps evened at the smaller 10px | Matching measures both take the larger one |
| 2026-10-05 | Pictures of plain English prose ("never distract with text on the artifacts") | The dictionary pictures are retired and the picture lint rejects them |
| 2026-10-05 | Book heads with a seven-line lead and a floating subtitle | A lead of two or three lines at 60 to 70 characters, the rest in the body |
| 2026-10-07 | The Dossier named as the reference for the brand and the site, after the brand had moved past it | The shipped site is the reference for landing and marketing pages, and the Dossier stays in the gallery as the direction the site grew from |

## 3. What reads as GT

A page reads as General Translation through its structure, its contrast and its single material. Kevin's brief for the deck asked for minimal black and white with only the edge grid lines, images and simple diagrams, and no eyebrow text (2026-09-08).

### Structure and lines

- On the deck and on product surfaces, lists and tables are ruled rows: a rule above the first row and under each row, a key column (240px in the deck's `.rows`), and two lines per value at most. Bullets, boxed tiles and floating cards are out.
- Every line is drawn once by one owner. In the Prototemplate chrome each line takes one of three roles whose weights mean something: `hair` (ink at 18%) for large surfaces and the lines that divide a page, `hair-soft` (ink at 9%) for list rows, and `edge` (ink at 62%) for the frame of a picture or a capture only. A large surface drawn in the frame weight reads as a boxed image. DESIGN.md section 2 ("Line law for chrome") has the ownership table and `pnpm lint:lines:shell` enforces it. On deck slides `.rows` rules draw `--hair` and `.plain` rows draw `--hair-soft` (`references/measures.md`).
- Structural rules run the full width and height of their section. A page column has one rail on each side, drawn once (DESIGN.md section 3).
- Lines are drawn only at seams. A hairline on every edge reads as busy (2026-09-25).
- A registration cross sits only where two real lines cross: the deck's sheet frame and DESIGN.md's border crosses. A cross floating in app UI is ornament.
- Rounded controls, square shells. Kevin, 2026-10-05: "keep this amount of border rounding instead of forcing Boxes. boxes only for ui shells". In Prototemplate the shells (the frame, the sidebar, the toolbar bar, the sheet, the book head, rules and bands) are square; controls and fields round at 6px with a part flush inside them at 5px, chips and key caps at 4px, and cards, tiles, thumbnails and popovers at 6px. The radius tokens are in DESIGN.md section 2 (Corners), and `pnpm lint:radius` holds them. The deck's sheet stays square. gt-cloud uses `rounded-md` for UI surfaces and `rounded-full` for round and pill shapes (gt-ui `consistent-radius`).
- No shadows, glass or gradients. Depth comes from lines and the dither (BRAND.md section 3).
- Layout containers carry no fill. Fills belong to inputs, primary buttons, the `#101010` code panel, the one plate surface (ink at 3.5%) under diagrams and captures, and objects such as the dashboard's credits card.
- In navigation, a group shows its children while it holds the current page. In the dashboard one scope switcher sits in the sidebar head, and a chevron on every group read as busy (2026-09-25). The Prototemplate sidebar's runs, folds and current marks follow DESIGN.md section 16.

### Hierarchy and contrast

- Text has three steps: ink for content, ink-2 for secondary text and leads, titanium for captions, counters and keys. There is no fourth step.
- Size and weight set rank, with every weight capped at 500, `b` and `strong` included. State shows in ink: the active row, the pressed button and the focused field draw in ink.
- Ink on paper is 20.1:1 and ink-2 is 10.9:1 in light, and both stay above 10:1 in dark. Titanium (`#8a8f98`) is 3.25:1 on white, under the 4.5:1 floor for text below 24px, so the dashboard plate darkens light titanium to `#6e737c` (4.77:1) for its 13px captions and keys. The deck's 15px captions and the Prototemplate shell's meta text still use `#8a8f98` in light. On a new light surface, text a reader needs is set in ink-2 or in the darker titanium.
- A page uses one accent, GT blue `#2f5ce0` (dark lift `#86a8ff`), and a drawing gives it to one element. The deck uses no accent on text, lines or fills; semantic color appears only on icons (green `#12a37a` done, amber `#f0a020` open, red `#e5484d` rejected, blue for GT).
- Dark mode is a token remap. Light is one white surface and dark is one ink surface.

### Material

- A surface carries one dithered material, drawn by the house engines: the landing hero's studio field, the sign-in globe alone, or one artifact picture per step. Two materials on one surface split the reader's attention.
- The hero's composite is the measure of strength: the canvas at opacity 0.55 under a horizontal mask, and an inverted filter in the light theme (`references/measures.md`). A new field stays at that strength or under it. Artifact pictures print at 0.62 opacity in dark and 0.7 in light.
- Texture is ordered dither. Alpha veils, gradients and glows are out.
- A picture shows writing, language or the earth, and its subject fits the page it sits on. It carries no readable English prose. Its plate holds a title, one factual sentence about the artifact in two lines at most, and a credit, and says nothing about GT.
- `gt-dither` owns the engines, the presets and the picture standard.

### Rhythm

These numbers come from the references, and the live file wins whenever one of them matters to the work.

| Where | Measure |
| --- | --- |
| Deck sheet | 72px top and bottom and 80px side padding; 56px between head and body; 72px between columns; 18px under an `h2` and between paragraphs; rows 16px block padding with a 32px column gap |
| Deck book head | title 44/1.04; lead 14px below at 15.5/1.5 in ink-2; 26px to the head's rule; 36px between blocks |
| Dashboard | Plate pages (sign-in and onboarding): 48px column padding; 40px from the mark to the heading; 26px between a heading and its lede; 40px before a form; 28px between fields; 10px under a label; 44px inputs and primary buttons. Under 880px tall the column padding is 32 and 24, the mark gap 30, the heading gap 16 and the form gap 24. App pages: 40px section padding, 40px sidebar rows, 14px ledger cells |
| Mobile | the `--tcm-*` ladder under 720px (DESIGN.md section 12); no copy within 20px of a hairline; 44px tap targets |

Kevin's ask on 2026-09-28 was "make our spacing a lot better, kerning a lot better". Gaps that look equal must be equal, and the gaps around one heading match on both sides.

### Voids, density and placement

- **No voids.** Remove empty boxes. A column never stretches a row taller than its content, quotes and diagrams fill their box and its width, and related components sit side by side so a set fits one screen. A void is structural: measure the live geometry to find what owns the empty run, then restructure. Kevin, 2026-08-05: "we literally need that black space gone"; again on 2026-08-12 and 2026-08-13.
- **Density.** Interfaces carry no excess padding, and headers and dropdown rows are no taller than they need to be. A product has one content max width. Full-height layouts use `100dvh` correctly (2026-10-05). Air goes under headers, never at the bottom of boxes (2026-08-07, 2026-08-17: "fix space under headers here").
- **Optical placement.** A corner graphic's right inset equals its bottom inset. Logos and controls are optically centered in their band. Short values never wrap, and a text box carries no trailing sidebearing. Nothing touches an edge, a rule or a neighbor: the book head's title keeps `--pt-title-clear` under the sheet's border (2026-10-06). Check a small move against the screenshot before going further.
- **Attached edges.** An element attached to a viewport or container edge sits flush, with square corners on the attached side, and a collapsed panel vanishes completely (2026-07-31).
- **One component across modes.** When the UI changes mode, one component morphs between the states and back, visibly. Two matched components swapping read as two things. Each mode shows one navigation chrome (2026-07-31).

### Marks, icons and copy

- A GT or Locadex mark renders from the brand components, or is seated into a drawing as an alpha mask in the face's plane. A flat logo laid over a drawing and a mark as a gif are both out (gt-ui `no-gif-mark`). `gt-brand` and `gt-isometric` hold the recipes.
- Icons in gt-cloud follow the two tiers of gt-ui `icon-tiers`: Heroicons solid for meaning and Lucide for controls. The deck and the Prototemplate shell use Heroicons 20 solid, and in the deck an icon sits only in a key cell or at the start of a row.
- Flags appear only as functional locale chips through the locale components.
- The theme control draws ◐ and ◑.
- Copy is part of the look. Heads are plain nouns in sentence case with no trailing period, there are no eyebrows, Title Case is for buttons only, and captions are full sentences. `gt-voice` has the rules.

## 4. Type polish

`gt-brand` owns the face, the tokens, the feature lists, the full tracking table, the measure tokens, the named exceptions (the Prototemplate nameplate, the `/d/` directions, the presenter) and the type lint. Read its section 4 first. This section covers what to check once those are right.

- The face is the self-hosted rsms InterVariable 4.1 with `font-optical-sizing: auto`, display text at weight 500 with `cv11` and `ss01`, and running text at 400.
- Tracking tightens with size and weight, from `gt-brand`'s table. One tracking value at every size was the 2026-09-25 defect ("kerning needs to be adjusted"). Weight 400 text is never tracked, and nothing is tracked positive except the deck's 13px counter (+0.02em), the deck slides' picture credits and gt-cloud's 13px captions (+0.01em).
- Heads balance (`text-wrap: balance`). A display head holds two lines at most at every width (2026-08-04). Kevin's words on the hero were "TASTEFULLY two lines again" (2026-08-04).
- A lead reads in two or three lines at 60 to 70 characters, and the rest of the paragraph moves into the body. Set the measure in em (`--pt-measure-lead`), because `62ch` comes to 83 to 86 Inter characters. The deck's own book-head lead (`max-width: 62ch`) measured 84 characters a line and four lines at 1440 on 2026-10-05, so copy the deck's sizes and gaps and take the measure from this rule.
- Body text takes `text-wrap: pretty`, and no paragraph ends on one short word.
- Browsers compute `b` and `strong` inside a weight 500 element as 700. A base rule sets them to 500.
- Figures that change or sit in columns take `font-variant-numeric: tabular-nums`.
- Monospace sets code, ids, tokens and file paths, and nothing else.
- Mobile has its own type ladder and its own layout decisions. On the landing, heading and paragraph metrics live in the engine CSS, where they outrank utilities (DESIGN.md section 12).
- A layout is checked in CJK, RTL and Indic text as well as Latin (BRAND.md section 6).

## 5. Process

### The loop

1. Read the governing reference and the verdicts on the same kind of surface.
2. Build one exemplar: one section, one page or one state.
3. Review it yourself against the checklist below, measure it against the reference, run the lints, and shoot it.
4. Show Kevin on localhost, with crops of what changed.
5. After his sign-off on the grammar, replicate it across the set. After a rejection, restart from the reference.
6. Land the work only when he says to.

### Rules of the loop

- One exemplar comes first. A full set built on a reading he had not confirmed cost whole rounds (2026-08-04).
- Mock images and prototype pages are literal specs, and their notes are change orders.
- A round of explorations gives directions that differ in silhouette, material and action. A palette, a title or an arrangement alone does not make a new direction (the deco rounds, 2026-09-14).
- Explorations stay on a branch or uncommitted until Kevin reviews them on localhost. Prototemplate main deploys the public preview, so only a committed HEAD he approved is pushed (2026-09-14).
- After he picks, the alternatives leave the code and stay in git history (2026-08-12).
- Prototemplate's checkout is shared by several sessions. Stage explicit paths and never `git add -A`.
- A step's artifact, a flow's steps and a page's sections keep their places unless Kevin moves them (2026-09-30).

### Local review

- Prototemplate runs on `http://localhost:3005` (`pnpm dev`, launch config `prototemplate-dev`). Reuse the running server: Next 16 refuses a second `next dev` for the same checkout.
- gt-cloud apps run on their own dev servers (gt-cloud `.agents/skills/gt-landing` and `gt-dashboard`).
- Shoot both themes at 1440 and 390. Plate pages are also shot at 1527 by 814, Kevin's laptop viewport. When he sends a screenshot, reproduce its state and size and fix the defect at that size.
- Shoot with an external harness (playwright-core with Chrome for Testing). The in-app browser pane reports `document.hidden` and pauses `requestAnimationFrame`, so canvases come out blank there.
- Seed the theme before load: `localStorage['gt-theme']` for Prototemplate and the deck, the `theme` key or the `dark` class on `<html>` for gt-cloud.
- Scroll through a page before a full-page capture, because plates mount on IntersectionObserver.
- Crop every junction at `deviceScaleFactor: 2`. The line auditor reads computed CSS and cannot see SVG strokes.
- `pnpm check:pages --preset quick --pages <id>` reads phones, a tablet, laptops, desktops and the ultrawide for overflow, clipping, tap targets and layout shift, and walks the presenter's slides on each. `pnpm lint:lines:shell` audits the chrome's lines. `node shoot-slide.mjs 8 15`, run in `deck/`, renders slides in both themes and reports overflow.

### Reading Kevin's asks

- "Equivalent" or "equal" means both measures take the larger value (2026-09-30).
- "Keep its aesthetic" means the geometry and the material stay and only the named thing changes.
- "Smaller" or "larger" means the next rung of the existing ladder. The 13px card facts went to the 12px rung (2026-09-28).
- "Make it look better" with a reference attached means measure the reference and match it. Without one, the reference is the deck for a product surface and the shipped site for a landing or marketing page.
- "Fix this" on one instance means the whole class: find every member, fix it and report the count (`docs/handbook/operating-principles.md` rule 5).
- "Redesign" means visibly new. A change that keeps the old shape comes back as not done (`gt-explorations` section 2).
- "Remove this" takes the smallest reading, then re-checks the neighbors.
- "Add it to the left of X" applies to X alone, and the rest of X's column stays as it is (2026-08-13: "incorrect. i only want you to add it to left of ...").
- "Standardize" means one structure on every page of the kind, with only content differing, and a lint or the page check that catches a page that drifts (the book page, 2026-10-06).
- Kevin asks for a lint once a rule matters to him ("document and create a lint for this", 2026-09-08; "fix and lint for this", 2026-09-28). A new rule ships with its lint or names the lint that should hold it (`gt-lints`).

### Showing the work

- Show crops of the changed region, 420 to 900 CSS px wide, before and after, in both themes. Full-page captures in a two-column table read as strips (2026-09-28). `gt-ship` has the PR format.
- Say in plain sentences what changed and what to look at.

## 6. The general skills

The wiki's general design skills stay useful, and where they disagree with a verdict in this skill, the verdict wins.

- `design-engineering-polish` gives the animation decision framework, easing and duration choices, the Before, After and Why table for reviews, and signature-first exploration for a round of new directions. Its rule to reject disguised duplicates matches the deco verdict. In GT work, product pages have no entrance animation, motion moves transform and opacity only at the shell's 120 to 220ms durations, and reduced motion renders a designed still (`gt-motion`).
- `make-interfaces-feel-better` applies as written for tabular numbers, balanced heads and pretty body text, antialiased smoothing, 44px touch and 40px desktop hit areas, the state matrix, exact transition properties and sparing `will-change`. Five of its rules do not apply to GT work. GT draws no shadows for elevation and never replaces a border between sections with a shadow, because lines carry the structure. Its concentric radii apply to the controls: a part flush inside a 6px control takes 5px (`--pt-radius-inner`). Product pages have no staggered entrances. The shell shows a press as the ink border of `.is-on`, with no scale and no blurred icon swap. A picture's frame is a 1px border in the `edge` role (ink at 62%), which is heavier than the low-opacity outline that skill suggests.
- `taste`, `frontend-design`, `frontend-design-taste` and `web-design-guidelines` are general references. Kevin's GT taste is the deck, the shipped site and the verdicts here.
- `animated-component-libraries` finds sources for components. Anything sourced is restyled to the tokens and passes this review.

## Review checklist

Built from the deck's defect list (DECK-GRAMMAR.md, "What a defect is") and Kevin's verdicts.

- [ ] The surface matches its reference measure for measure, and every new value has a stated reason.
- [ ] Nothing overflows its sheet, column or viewport, and no text is clipped.
- [ ] No text sits under its ladder's smallest rung, and nothing on a deck slide is under 15px.
- [ ] No label crosses a line, diagram labels keep 12px from lines, and mobile copy keeps 20px from a hairline.
- [ ] Columns align, gaps in a pair are equal, and no box, column or half of a layout holds a void; quotes and diagrams fill their box.
- [ ] Padding is no larger than the content needs, air sits under headers, and nothing touches an edge, a rule or a neighbor.
- [ ] Every line is drawn once in its role, rules run edge to edge, `pnpm lint:lines:shell` is clean, and junctions pass at 2x.
- [ ] There are no boxed tiles, floating cards, shadows, gradients, glass or container fills.
- [ ] Text uses three steps, contrast holds in both themes, and titanium text a reader needs clears 4.5:1.
- [ ] The page uses one accent, and semantic color sits only on icons.
- [ ] Headings are weight 500, balanced, tracked for their size, in sentence case with no trailing period, and display heads hold two lines at every width.
- [ ] Leads read in two or three lines at 60 to 70 characters, prose stays under 75, and no paragraph ends on one short word.
- [ ] There are no eyebrows, no mono outside code, no em dashes and no exclamation marks.
- [ ] The surface carries one material at the hero's strength or under it, and its pictures follow the standard and hold no English prose.
- [ ] Marks come from the brand components or are seated as alpha masks, and none is a flat overlay or a gif.
- [ ] Content comes from production or the prototype spec, and nothing is invented.
- [ ] Numbers agree with every other place they appear, and chart marks match their values.
- [ ] Nothing shifts after first paint, and client-mounted rows reserve their height.
- [ ] Product pages have no entrance animation, and reduced motion renders a still.
- [ ] Both themes at 1440 and 390 are shot and looked at, with plate pages also at 1527 by 814.
- [ ] `measure-type.mjs --strict` passes on the changed pages, or each flag has a stated reason.

## Related skills

`gt-brand` (the tokens, the type system and the marks), `gt-voice` (copy), `gt-deck` (the reference deck), `gt-lints` (the line law, the type lint and gt-ui), `gt-dither` (the field and the pictures), `gt-landing-pages` and `gt-website` (the site), `gt-components` (the shell and shared UI), `gt-isometric` and `gt-diagrams` (drawings), `gt-motion`, `gt-ship` (PR screenshots) and `prototemplate`. General skills in Kevin's wiki: `design-engineering-polish`, `make-interfaces-feel-better`, `animated-component-libraries`, `agent-browser`.

## Sources

- Prototemplate: `deck/parts/head.html` (tokens, type, rows, book view, viewer chrome); `deck/DECK-GRAMMAR.md` (type, color, layout classes, "What a defect is"); DESIGN.md sections 1, 2, 3, 12, 15 and 16; BRAND.md sections 3, 5, 6 and 8; `docs/ARTIFACT-PICTURES.md`; `docs/SHIP-LOOP.md`; `src/components/viewer/tokens.css`; `scripts/lint/lines.mjs`; `scripts/check/pagecheck/`.
- gt-cloud, origin/main: `apps/dashboard/src/app/brand-tokens.css` (the plate's tokens, ladder and frame); `apps/dashboard/src/components/brand/FieldStack.tsx`; `tooling/oxlint-plugins/gt-ui.ts` (`consistent-radius`, `icon-tiers`, `no-gif-mark`, `no-eyebrow`, `mono-is-not-voice`); `apps/landing/src/lib/studio-field.ts`, `components/landing/shared/HeroField.tsx`, `home/sections/hero-terminal.css` and `home/v0-pages.css` (the hero's field); `packages/ui/src/components/frame/ThemeToggle.tsx`. The branch `k/dashboard-shell-ia` holds `packages/ui/src/lib/studio-field.ts` and the `no-theme-icons` rule.
- Prototemplate's `.oxlintrc.json` (the gt-ui rules `pnpm lint:code` runs) and `package.json`.
- Kevin's wiki, whose skills load from `~/.claude/skills`: `skills/engineering/design-engineering-polish/SKILL.md` and `references/signature-first-exploration.md`; `skills/engineering/make-interfaces-feel-better/SKILL.md`.
- Kevin's taste rules on voids, density, optical placement, attached edges and one component across modes: 2026-07-31, 2026-08-05, 2026-08-07, 2026-08-12, 2026-08-13, 2026-08-17 and 2026-10-05, from his messages to Claude Code and Codex; the radius law and the book page standard (2026-10-05 and 2026-10-06, `references/verdicts.md`).
- Kevin's dated directives (2026-08-04, 08-06, 08-11, 08-12, 08-17, 08-26, 09-04, 09-08, 09-09, 09-14, 09-18, 09-25, 09-28, 09-29, 09-30, 10-05), quoted in `references/verdicts.md`, checked against his Claude Code session transcripts on 2026-10-05, and recorded in his gt-cloud memory notes `dashboard-deck-grammar`, `redesign-v0-verdict`, `k-pages-restart-round`, `brand-questionnaire-directives`, `variants-program-state`, `deco-exploration-round`, `explorations-stay-local`, `signin-field-transition`, `prototemplate-interface-system`, `artifact-picture-standard`, `plain-technical-english`, `landing-inter-only`, `mobile-type-ladder`, `page-check-system`, `redesign-screenshot-harness` and `pr-screenshots-and-gallery`.
- Kevin, 2026-10-07: "fix the dossier references" (`references/verdicts.md`). gt-cloud #4213 built the production landing from the Dossier, and the redesign stack took that landing as canonical on 2026-08-11 (`docs/handbook/decisions.md`).
