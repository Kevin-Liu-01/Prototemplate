# The GT docs, measured for drawing

These values were measured on the redesigned GT docs (built on Fumadocs) in September 2026 at 1440 by 900. They are the fixture set for any graphic that must read as the GT docs. Re-measure when the docs change, and keep the rectangles as named objects in `graphics/build/gen-visuals.js` (`$PROTOTEMPLATE`).

## Colours

| Token | Value |
| --- | --- |
| Dark page ground | `#09090b` |
| Graphics stage ground | `#111216` |
| Borders | `#27272a`, and `#3f3f46` for the second border and crop frames |
| Text | `#fafafa`; muted `#a1a1aa`; dim `#71717a` |
| Link and rail thumb blue | `#60a5fa` (hsl 213 94% 68%) |
| Brand accent blue | `#0078FF`; secondary `#457AFF` |
| Removal red in graphics | `#f0524f` |

The graphics stylesheet in `gen-lib.js` (`CSS`) declares the same values as `--bg`, `--border`, `--border2`, `--text`, `--muted`, `--dim`, `--blue`, `--blue2` and `--red`.

## Type

Inter (variable) sets the interface and body, and Geist Mono sets code and measurements. The graphics load both from `graphics/fonts/`. The docs' type roles, as figure D1 shows them:

| Role | Setting |
| --- | --- |
| Page heading | 600 at 32px, tracking -0.04em |
| Summary | 400, muted |
| Meta ("Last updated") | italic 400, muted |
| Aside | italic 400 |
| Group heading | 600, small |
| Body | 400 |

The old docs used one weight and one grey for all of these.

## Shape

| Use | Radius |
| --- | --- |
| Controls | 4px |
| Buttons and fields | 6px |
| Cards | 8px |
| Panels | 12px |

Pills (a radius of 9999px) are not used, and figure E3 strikes them out. Rules are 1px, and the page carries two of them at the top: one under the meta row (y 218) and one above the first h2 (y 324).

## Icons

Icons come in two tiers, made explicit on 2026-09-21 after the review of the blog's icon slide:

- An icon that carries meaning (a card, a feature, a link destination, a package or section mark) is Heroicons solid, `24/solid` sized by class and `16/solid` inline with text.
- A control (search, copy, chevrons, arrows, close, theme, language, the contents header) is Lucide outline.
- Brand marks (framework logos, the GT monogram, social icons) are their own class.

The section switcher's Overview, CLI and Integrations marks moved from Lucide to solid in that review, and the blog's package, RSS and Explore marks followed. Flags are custom matte SVGs and never emoji. The theme toggle is a half-filled circle and appears top right and bottom left.

## Layout at 1440 by 900 (new docs, `N`)

| Region | Rectangle (x, y, w, h) |
| --- | --- |
| Sidebar | 0, 0, 290, 900 |
| Logo | 19, 20, 172, 30 |
| Section switcher | 19, 71, 254, 54 |
| Sidebar rows | 31px tall from x 19, 254 wide; the first, Introduction, at y 168 |
| Group headings | y 145 (Get Started), 277 (Frameworks), 654 (Platform), 817 (Integrations) |
| Footer links | 11, 706, 270, 138 |
| Preferences row | 11, 847, 270, 45, with the theme toggle at 249, 858 |
| Header controls | 1068, 12, 356, 46: five controls in one row (figure B2), with the search icon at 1072, 19, the theme toggle at 1113, 19, the star pill at 1156, 19 and the demo button at 1320, 19 |
| Content column | 746 wide from x 310 |
| Page heading | from 310, 80 |
| Summary | 310, 129, 746, 24 |
| Copy page split button | 909, 169, 147, 32 |
| Cards | 310, 400, 746, 417 |
| Contents rail | from x 1080; the crops use 1090, 74, 330 wide |

The measured gaps at the top of the page are 12px from the heading to the summary, 16px from the summary to the meta row, 25px from the meta rule to the first paragraph and 34px from that paragraph to the h2 rule (figure D4). In the light theme the star pill is 13px narrower, so the header rectangle is 1081, 12, 343, 46 (`R.headerLight`).

The sidebar rail is one SVG path per link group, 12px in per nesting level with a 45 degree bend. The blue thumb marks the current page and a fainter thumb follows the pointer. The scrollbar is a 6px rounded thumb on a transparent track, shared by the sidebar, code blocks and menus (figure E7). The language menu is a 198 by 298 card with eight 36px rows inset 5px and 7px of padding (figure E4).

## The old docs (`O`)

The old docs had 36px sidebar rows, a collapse toggle at 243, 17, a GitHub banner at 3, 64, 286, 40, the switcher under the banner at 19, 117, 254, 58, a search field at 310, 14, 240, 36, and a 1px header rule on row 63 of the capture. Every before and after marks these in red.

## Sizing for the blog column

A drawing of the docs for a post follows the sizes in `SKILL.md` (Sizing for the blog column), with these values as its colours, type and rectangles.

## Sources

- Prototemplate: `.agents/skills/gt-docs-visual-tokens/SKILL.md` (2026-09-18, revised 2026-09-21), absorbed here; `graphics/build/gen-lib.js` (`CSS`); `graphics/build/gen-visuals.js` (`N`, `O`, `R`, figures D1, D4, E2, E3, E4, E7).
- The older skill text gave measurement labels as 25px and the ground as smoothly scaled. `gen-lib.js` sets `.measure` at 28px and the ground pixelated, and this reference follows the code.
