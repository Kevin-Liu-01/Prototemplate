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
  updated: 2026-10-10
  origin: prototemplate
  owner: P
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

Each verdict on real work set a rule, and work he rejected restarts from the reference: the rejected version is never the base of the next attempt. The table of verdicts (date, what he rejected, the rule since) opens `references/verdicts.md`, and the full wording and context of each follows it. Read the rows for the kind of surface before building one; sections 3 and 4 and the review checklist carry the rules they set.

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

The spacing numbers of the deck sheet, the deck book head, the dashboard plate and app pages, and the mobile ladder are in `references/measures.md` ("Rhythm across the references"); the live file wins whenever one of them matters. Kevin's ask on 2026-09-28 was "make our spacing a lot better, kerning a lot better". Gaps that look equal must be equal, and the gaps around one heading match on both sides.

### Voids, density and placement

- **No voids.** Remove empty boxes. A column never stretches a row taller than its content, quotes and diagrams fill their box and its width, and related components sit side by side so a set fits one screen. A void is structural: measure the live geometry to find what owns the empty run, then restructure. Kevin, 2026-08-05: "we literally need that black space gone"; again on 2026-08-12 and 2026-08-13.
- **Density.** Interfaces carry no excess padding, and headers and dropdown rows are no taller than they need to be. A product has one content max width. Full-height layouts use `100dvh` correctly (2026-10-05). Air goes under headers, never at the bottom of boxes (2026-08-07, 2026-08-17: "fix space under headers here").
- **Optical placement.** A corner graphic's right inset equals its bottom inset. Logos and controls are optically centered in their band. Short values never wrap, and a text box carries no trailing sidebearing. Nothing touches an edge, a rule or a neighbor: the book head's title keeps `--pt-title-clear` under the sheet's border (2026-10-06). Check a small move against the screenshot before going further.
- **Attached edges.** An element attached to a viewport or container edge sits flush, with square corners on the attached side, and a collapsed panel vanishes completely (2026-07-31).
- **One component across modes.** When the UI changes mode, one component morphs between the states and back, visibly. Two matched components swapping read as two things. Each mode shows one navigation chrome (2026-07-31).

### Marks, icons and copy

- A GT or Locadex mark renders from the brand components, or is seated into a drawing as an alpha mask in the face's plane. A flat logo laid over a drawing and a mark as a gif are both out (gt-ui `no-gif-mark`). `gt-brand` and `gt-diagrams` (`references/isometric.md`) hold the recipes.
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

### Simplify, and keep the page

- Kevin, 2026-10-06, on the caption-card morph: "Beautiful but don't complicate. Always simplify." Reach for the platform feature that removes code before adding code: an auto height animates with a CSS grid row from `0fr` to `1fr`, never with a ResizeObserver and React state measuring the text. Comments stay at one or two lines and PR bodies stay short (`gt-ship`). When a review asks for tests of machinery that need not exist, remove the machinery.
- "Enhance" on an existing page means keep the page and add to it. Its sections, the parts Kevin likes and its copy word for word stay; the change adds to them. On 2026-10-08 a careers rebuild that dropped the hero, the logo band, the glyph rain and the original copy was rejected, and the second pass kept the page and added the team photo band (gt-cloud #5226, open on 2026-10-10). For new work, "enhance fully" still means cover every section with real visuals (`docs/handbook/operating-principles.md`).

### Local review, Kevin's asks and showing the work

`references/process.md` holds the local review recipe (the 3005 server, both themes at 1440 and 390 plus 1527 by 814 for plate pages, the external harness, theme seeding, junction crops at 2x, `pnpm check:pages` and `pnpm lint:lines:shell`), the readings of Kevin's words ("equivalent", "keep its aesthetic", "smaller", "make it look better", "fix this", "redesign", "remove this", "add it to the left of X", "standardize", and his ask for a lint once a rule matters), and how to show the work (before and after crops 420 to 900 CSS px wide in both themes, with plain sentences on what changed).

## 6. The general skills

The wiki's general design skills stay useful, and where they disagree with a verdict in this skill, the verdict wins. Which of their rules apply to GT work, and the five that do not, are in `references/process.md` ("The general skills").

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

`gt-brand` (the tokens, the type system and the marks), `gt-voice` (copy), `gt-deck` (the reference deck), `gt-lints` (the line law, the type lint and gt-ui), `gt-dither` (the field and the pictures), `gt-landing-pages` and `gt-website` (the site), `gt-components` (the shell and shared UI), `gt-diagrams` (drawings, with the isometric family in `references/isometric.md`), `gt-motion`, `gt-ship` (PR screenshots), `gt-verify` (the browser probes GT sessions check a page with) and `prototemplate`. General skills in Kevin's wiki: `design-engineering-polish`, `make-interfaces-feel-better`, `animated-component-libraries`.

## Sources

Dated provenance for every rule is in `references/sources.md`: the Prototemplate and gt-cloud files, the wiki skills, and Kevin's dated directives with the memory notes that recorded them.
