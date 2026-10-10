# Kevin's verdicts

This is the record of Kevin's design verdicts on General Translation work, oldest first. Each entry gives the date, the surface, his words, what was wrong, and the rule that has held since. Quotes keep his wording and lowercase, and a few obvious typos are corrected ("abck" reads "back"). The rules in `SKILL.md` come from these entries. Dates are Kevin's local dates (Pacific time) from his session transcripts and the memory notes that recorded them.


## The verdicts in one table

Each row is a verdict on real work and the rule it set; the dated entries below give the full wording and context.

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

## 2026-08-04: the first Figma v0 build of the redesign

- Kevin: "the only thing i really like u made is the locadex animation, which should have the locadex logo on it. lets rebuild following this structure, here are the literal images of the plans."
- What was wrong: the sections carried the right copy and drifted from the mocks' layouts and visual identities.
- The rule since: a mock image is a layout spec. Reproduce its composition (what sits left and right, the bento heads, which visual sits where) and treat its notes as change orders. The Locadex isometric (repo plate, agent slab, PR chip) is the quality bar for drawings. It carries the Locadex mark, mask-rendered in the surface ink. Locadex is never a gif.

## 2026-08-04: round two of the same build

- Kevin: the sections "broke all of our rules regarding borders and no double borders and did 3 line headers".
- What was wrong: new section CSS where the shell primitives fit, floating bordered cards, headers floating in whitespace, three-line display heads, and new drawings where existing diagram components fit.
- The rule since: compose with the shell primitives, where the row owns every seam and cells draw no borders. Every structural rule runs fully left to right and top to bottom. Heads sit inside ruled bands. Display heads hold two lines at most. Mount the existing diagram components before drawing new ones.
- The process rule from the same day: rebuild one section, get his sign-off on the grammar, then replicate. Never fan out on an unconfirmed reading, and never iterate on a version he rejected.

## 2026-08-04: the hero heading

- Kevin, on the two hero lines: "TASTEFULLY two lines again".
- The rule since: a display heading is set on two balanced lines at most.

## 2026-08-06: the Dossier

- Kevin: "btw dossier is indeed our completed version and treat it as such".
- The rule since: the Dossier (`/d/singularity-dossier`, with `/enterprise`) is the finished statement of the brand in application (BRAND.md section 8).

## 2026-08-11: the landing pages' diagrams

- Kevin: "these diagrams are so bad. i literally want you to restart these".
- What was wrong: the diagrams were redrawn without the crafted-engine process that built the toolchain and the Dossier, and logos were laid flat over isometric drawings.
- The rule since: rebuild drawings with the house engines. A mark is seated into a face as an alpha mask filled with a token (see `gt-diagrams`, `references/isometric.md`). Straight connectors survive a `preserveAspectRatio="none"` stretch and curves warp. Seated text at chip scale is illegible, so a stage label names it instead.

## 2026-08-11: round two of the landing pages

- Kevin: "blog has to be redesigned, its terrible and uses these ugly ai gradients and terribel sapcing. the signin page looks exact same. enterprise has better diagrams but teh new layout and content is terrible. pricing has nice new isometric diagrams, otherwise nothing redeeeming here."
- What was wrong: AI gradients, bad spacing, an unchanged sign-in, invented enterprise content, and new layouts that dropped the production content.
- The rule since: content comes from the current generaltranslation.com page components, layout grammar from the toolchain and the Dossier, and only the diagrams he praised survive. Never invent product vignettes.

## 2026-08-11: round three of the landing pages

- Kevin: "we literally give example copy and formatting and writing and diagrams in toolchain enterprise and pricing pages. so build those".
- The rule since: the prototype pages `/d/toolchain/enterprise` and `/d/toolchain/pricing` are the spec, copy included, word for word.

## 2026-08-11: the final avoid list for basement

- The list: monospace as the brand voice, smooth scrolling and scroll hijacking, robot and sparkle AI icons, flag soup, the AI gradient and glass look, eyebrows unless they are useful, and em dashes in rendered prose. On eyebrows Kevin's reason was "3 lines of text stacked to say the same thing".
- The rule since: most items are gt-ui lint rules, on in gt-cloud and in Prototemplate's `pnpm lint:code` (`no-em-dash`, `no-eyebrow`, `mono-is-not-voice`, `no-smooth-scroll`, `no-raw-locale-flags`, `icon-tiers`). Robot and sparkle icons and the gradient and glass look have no rule and are checked by eye (`gt-lints`). Prototemplate's presenter still scrolls on Lenis and is exempt from `no-smooth-scroll` in `.oxlintrc.json`.

## 2026-08-12: the variants program

- Kevin picked the first variant for all seven pages and had the variation system removed (about 16,000 lines).
- The rule since: once he picks, the alternatives leave the code. Git history keeps them.

## 2026-08-17: the second pass

- Kevin: "no monospace" and "find any pages were worked on without a second pass (like /contact page its really bad and needs to be redone)".
- The rule since: every page gets a second pass against the reference before it is shown.

## 2026-08-26: the docs redesign

- Kevin: "descrease the text size, no mono, use diagrams and actual icons, completely change and upgrade the layout, align with my shell style and our grid line aesthetic, more text spacing and spacing between lines".
- The rule since: documentation pages follow the shell's grid lines, set smaller text with more leading, and explain with diagrams and real icons.

## 2026-09-04: a blog graphic

- Kevin: "make the shadow less obvious and more meshed with the dither instead of clearly being an oval", then, fifty minutes later, "make it look a lot better, use a gemsmoke in back slightly dithered with this pattern, i dont like the shadow in back".
- The rule since: no drawn shadows. Depth comes from lines and the dither.

## 2026-09-08: the brand deck

- Kevin's brief: "very minimal black and white with nothing but the edge the edge grid lines, images and simple aestehtic diagrams, no eyebrow text, carefully chosen text to not overwhelm the readers".
- On the copy and the face, in one message: "i dont think we need periods everywhere, no need for switzer just all inter rsms". Headings carry no trailing period, and the deck is set in the rsms Inter alone. Later the same day, titles became plain nouns ("brand personality and writing style") with the claim moved into the body.
- On the viewer: "i really love our deck's navigation and basic interface. we should honestly update and redesign how we do things across prototemplate to use this novel and beautiful system." The deck viewer became the Prototemplate shell.

## 2026-09-08 and 2026-09-09: the Prototemplate shell's lines

- Kevin, round four: "make border colors proper and correct, verify no double borders, document and create a lint for this, this is key to our identity".
- Kevin, round six: "make these headers look so much better and make the borders around these areas the proper border colors".
- What was wrong: large surfaces (the sheet, cards, panels, heads) drew the frame weight that belongs to pictures, so they read as boxed images.
- The rule since: three line roles whose weights mean something (DESIGN.md section 2, "Line law for chrome"), held by `pnpm lint:lines:shell`.

## 2026-09-09: the deck's sparse slides and pictures

- Kevin: "use more colorful stuff like green check marks or other icons across tables and other kind of sparse, just text slides".
- The rule since: semantic color appears only on icons (green done, amber open, red rejected, GT blue for GT). Text and lines stay monochrome.
- Kevin: "I meant stuff like artistic visuals or photography of objects or people that conveys our ideas. you know vibes are so important to brand perception."
- The rule since: full-bleed mood pictures carry the mood, each with a plate that says why it is in the deck.

## 2026-09-14: the deco exploration rounds

- What was wrong: round one was a costume and incomplete, round two was ten skins of one page, and round three used the wrong lineage. The rounds were then pushed to main before he saw them. Kevin: "wait what they're on main? they shouldn't be pushed, I should be reviewing them locally."
- The rule since: the directions in a round differ in silhouette, material and action, and a palette or an arrangement alone does not make a new direction. Rounds stay on a branch or uncommitted until he reviews them on localhost and says to land them.

## 2026-09-18: the second face

- Kevin, on the landing site: "change switzer to inter everywhere. dont need switzer and remove those files."
- The rule since: Inter is the only typeface on GT surfaces, as it already was in the deck (2026-09-08). gt-cloud PR #4887 removed Switzer from the landing. `gt-brand` holds the face and its named exceptions.

## 2026-09-25: the first dashboard, onboarding and auth pass

- Kevin: "this is bad, it does not feel like our style and is too busy, not intuitive, kerning needs to be adjusted, no ugly border lines, it needs to follow the principles of contrast better, and finally we should use shaders that have our dither applied. check this out: prototemplate.vercel.app/deck"
- What read as wrong: boxed tiles and cells, titanium hairlines on every edge, uppercase mono eyebrow labels, registration crosses floating in the app, flat -0.028em tracking at every size, ink-4 text, two stacked scope switchers in the sidebar head, and collapsible groups with chevrons.
- The rule since: the deck's grammar for every product surface. Ruled rows, one rule per seam, three text steps, the tracking curve, no eyebrows, crosses only where real lines cross, and a group shows its children while it holds the current page.

## 2026-09-25: the dashboard's material

- Kevin: "eh make these much ebter. they should be as tasteful as our dither shader in hero of landing".
- What was wrong: a horizon ring drawn at page scale was too heavy.
- The rule since: the landing hero's field sets the strength of any dither material on a product surface, and a surface carries one material. The ring engine was deleted. From the round of 2026-09-29 the plate pages on gt-cloud main draw the sign-in globe alone or one artifact picture per onboarding step, both at or under that strength (`references/measures.md`).

## 2026-09-28: the dashboard's ladder, rhythm and chrome

- Kevin: "make our spacing a lot better, kerning a lot better".
- The rule since: tracking on the deck's curve, and a rhythm of 48px column padding, 16px under a heading, 40px before a form, 28px between fields and 10px under a label. On 2026-09-30 the heading's gap became the `--plate-heading-gap` token (26px, 16px on short viewports); `references/measures.md` has the current values.
- Kevin, on a DevTools capture of the onboarding column with a background: "why do these containers still have color? no background for this lol fix".
- The rule since: layout containers carry no fill. Fills belong to inputs, primary buttons, the code panel and objects such as the credits card.
- Kevin: "using wrong theme icon. lock in", then "I meant the theme icon should be the circle versions we use in landing and docs. fix and lint for this".
- The rule since: the theme control draws the circle glyphs ◐ and ◑, as the shared `ThemeToggle` in gt-cloud's `packages/ui/src/components/frame/ThemeToggle.tsx` does, swapped by CSS. The gt-ui rule `no-theme-icons` that refuses Sun and Moon imports lives on the dashboard shell branch (`k/dashboard-shell-ia`) and has not reached main.
- Kevin, on 13px card facts: "this text should be a lot smaller right". They moved to 12px.
- Kevin: "i dont think we need the animations of it fading in moving in from bottom". Product pages have no entrance animation. A row revealed by the reader's own answer may fade in over 180ms (`.plate-row-in`, the survey round of 2026-09-30).
- Kevin: "the left side of onboarding should just be black fully up and down and the dither should perfectly transition into that". The plate is invisible against a solid ground and the field ramps in beside it.
- Kevin, on a compact flag-and-code language control: "it should still be the same kind of dropdown we use in landing with that specific icon". Reuse the shipped component before making a variant.

## 2026-09-29: pictures, the card and layout shift

- Kevin: "only keep the rosetta stone and blue marble, the others have to actually apply to the theme better. the great wave for example does not really make sense here", then "i want to convey the human cultural language global related concepts".
- The rule since: a picture shows writing, language or the earth, and earns the page it sits on.
- Kevin: "for all right screen artifacts, make them less distracting. make the dither a lot less strong so the images are more high fidelity".
- The rule since: pictures print at 1 CSS px cells at reduced opacity (0.62 dark, 0.7 light).
- Kevin, on the credits card: "dont make the gt and $10.00 feel like cutouts. make the arcs fully extend. just make them less opacity and give a proper shine. and the chip should not be see through".
- The rule since: on a dark object, type reads through faint texture and full-white letters. The texture runs across the whole face and is never cut away around the type.
- Kevin: "why when i switch around does it make the localization switcher theme icon and sign out reload? no layout shifts please".
- The rule since: the foot's geometry is the same on every plate page, a variable-width item never sits left of a fixed one, and a client-mounted row reserves its height in the server markup.

## 2026-09-30: the plates and the artifact's place

- Kevin: "make each info card only have 2 lines max of explanation, but dont write the corny stuff about gt relating".
- The rule since: a picture's plate has a title, one factual sentence about the artifact in two lines at most, and a credit. It says nothing about the company.
- Kevin: "in the add a payment section the credit card should be on left and there should just be an artifact on right".
- The rule since: the column is the step and the right side is a picture. An artifact is never moved to another region without his say.

## 2026-09-30: equal gaps

- Kevin, after the onboarding heading's two gaps were evened at 10px on his 814px-tall laptop viewport: "bring back the greater space both above and below". gt-cloud commits c801060f5 and 3b2c65a18 set both gaps from one token, 16px there and 26px at 900 tall.
- The rule since: when he asks for two measures to match, both take the larger one.

## 2026-10-05: text in pictures

- Kevin: "never distract with text on the artifacts ... this disqualifies the dictionary and oxford", then "just not english i mean ... the dictionaries are plain english and distracting instead of artistic or design meaningful".
- The rule since: no picture is a page of readable English. The dictionary, Johnson, OED volume and Oxford pictures are retired, and the picture lint rejects them (`docs/ARTIFACT-PICTURES.md`).

## 2026-10-05: Prototemplate's page heads

- Kevin, on the book heads of `/motion` and `/brand`: "make our pages look a lot better and more aesthetic, and esepcially encorce the CORRECT RASMUS INTER".
- What was wrong: a seven-line lead beside the meta table, a subtitle floating between the title and the lead, and the face set differently from element to element.
- The rule since: a lead reads in two or three lines at 60 to 70 characters and the rest moves into the body, the meta table aligns to the head, and every element resolves to the one Inter through the tokens (`gt-brand`).

## 2026-10-05: head titles, the head's panel and corners

- Kevin, on the redesigned book heads: "dont make it "the brand" "prototemplate docs" it should be Brand and Documentation and make the right side of those headers better, show last update, use icons, put more relevant info there. also check my image - i want to enforce and keep this amount of border rounding instead of forcing Boxes. boxes only for ui shells". His image was the toolbar's search pill, its key chip and the segmented control.
- What was wrong: titles that were phrases, a plain meta table on the right of each head, and square corners forced onto controls.
- The rule since: a head's title is the page's plain name (`src/lib/page-names.ts`); the right side is a panel with the last update and the page's facts, each with a Heroicons 20 solid glyph; controls and fields round at 6px, chips at 4px, cards at 6px, and only shells are square (DESIGN.md section 2, Corners; `pnpm lint:radius`).

## 2026-10-06: one book page

- Kevin, on `/brand`: "it still says The Brand and headers need to look a lot better. see how the brand is touching the up line and the spacer is missing a border above it? standardize our presentation more".
- What was wrong: a guide line ran through the title, the hatch band had no rule along its top edge, and each page's head differed in structure.
- The rule since: every page with a book head renders one structure (DESIGN.md section 4, The book page): the title keeps `--pt-title-clear` under the sheet's border with nothing drawn in it, one band sits between the front matter and the first section with its own rule on both edges, and the mast, the panel and the section dividers are the same on every page. `pnpm lint:heads` holds it.

## 2026-10-06: the Brand head's reference

- Kevin: "why is the dossier the reference for Brand? its evolved so much more since then", then "just give it a reading time like the other pages."
- What was wrong: the Brand head's panel named the Dossier as the brand's reference, and the lead called it the completed reference application.
- The rule since: the Brand panel shows a reading time like the other pages, and no page presents the Dossier as the current reference for the brand. BRAND.md section 8 ("The completed reference") waits for Kevin's decision.

## 2026-10-07: the Dossier references

- Kevin: "fix the dossier references."
- What was wrong: after the 2026-10-06 verdict, `gt-aesthetic` section 1 still named the Dossier as the reference for the site, and BRAND.md section 8, the other GT skills and the handbook still presented it as the completed reference.
- The rule since: the shipped site is the reference for landing and marketing pages. It is generaltranslation.com, built from `apps/landing` on gt-cloud origin/main. gt-cloud #4213 built the production landing from the Dossier's direction, and that landing became canonical for the redesign stack on 2026-08-11. The identity now covers more than the Dossier shows: product surfaces follow the brand deck (2026-09-25), and the identity includes the speed marks (2026-09-29), the films on `/motion` and the cycling title badges. BRAND.md section 8 names where the identity ships. The Dossier (`/d/singularity-dossier`) stays in the gallery as the direction the site grew from, which settles the decision the 2026-10-06 entry left open.

## What he approved

These are the pieces Kevin praised, and they set the bar for new work of the same kind.

- The Locadex isometric animation (2026-08-04).
- The pricing page's isometric diagrams, and the enterprise page's diagrams, which he called better than the rest of that round (2026-08-11).
- The Dossier as the completed direction (2026-08-06). Since 2026-10-07 it is the direction the site grew from, and the shipped site is the reference.
- The brand deck's viewer and interface (2026-09-08), now the Prototemplate shell.
- The landing hero's dither field (2026-09-25).
- The Blue Marble on the onboarding field as the picture standard (2026-10-05).
