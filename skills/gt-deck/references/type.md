# Type and copy on the sheet

`SKILL.md` section 3 points here. Moved from it on 2026-10-10, unchanged.

## Type

- Inter is the only typeface (Kevin, 2026-09-09: "replace all switzer with inter, dont really need switzer anymore"). `--display` and `--text` both resolve to `'Inter'`, which `deck/fonts/deck-fonts.css` registers as the rsms InterVariable roman, the same file as `public/fonts/InterVariable.woff2`, at weights 100 to 900. `body` sets `font-optical-sizing: auto`, so large headings take the display optical size from the font's opsz axis.
- No italic face is inlined. Do not set italic or `<em>` on the sheet; the browser would slant the roman.
- `h1`, `h2` and `.big` share one rule in `head.html`: weight 500, `letter-spacing: -0.025em`, `text-wrap: balance`, `font-feature-settings: 'cv11', 'ss01'`. Slide CSS does not restate the features or the tracking. No other rule sets `font-feature-settings`; the counter, the swatch values and the viewer's numbers take tabular figures through `font-variant-numeric: tabular-nums`.
- Weight 500 is the ceiling for display text and for `<b>`, and running text is 400 (BRAND.md section 6). The one exception is the specimen on the Typography slide (`27-type.html`), which shows Inter from 300 to 800 as samples.

| Element | Size | Line height | Notes |
| --- | --- | --- | --- |
| `h1` | 88 px | 1.02 | title slides |
| `h2` | 44 px | 1.1 | the slide heading, 18 px below it |
| `.big` | 72 px | 1.06 | opener titles and single statements |
| `p` | 22 px | 1.5 | 18 px between paragraphs |
| `.lead` | 26 px | 1.45 | an opening paragraph |
| `.cap` | 15 px | 1.45 | captions and credits, titanium |
| `.rows > div` | 20 px | 1.45 | keys in `<b>` at 500 and -0.01em |
| `.plain` | 24 px | 1.4 | display list at 500 and -0.01em |
| `.pair figcaption` | 16 px | 1.45 | ink-2 |
| `.scale` labels | 18 px | | ink-2 |
| `svg.dia text` | 20 px | | ink-2 |
| `svg.dia .lab` | 26 px | | ink, 500, -0.01em |
| `svg.dia .sm` | 18 px | | the SVG floor |
| `.panel` | 17 px | 1.7 | monospace on the code panel |

- Text under 15 px on the sheet is a defect, and SVG text is never under 18 px. Apart from the viewer's own counter at 13 px, the only sheet text `head.html` sets under 15 px is the `small` notes in `.lang` (Scripts) and `.ladder` (Type scale) at 14 px; do not copy them.
- Measures: `.max` is 32ch and `.max-p` 56ch. `.muted` sets ink-2.

Copy on the sheet follows the deck's register, and gt-voice holds the full writing rules:

- Headings are plain nouns or plain statements in sentence case with no trailing period. Proper nouns keep their capitals (General Translation, Prototemplate, Glyphfield, Locadex), and product tokens keep their exact form (gt-next, gt, npx, CLI, API) and never start a heading. A heading names the thing; a domain such as prototemplate.com goes in the body. Title Case appears only on buttons.
- Body copy is full sentences with periods, captions included. No metaphors, no "X, not Y" pairs, no fragment rhythm, no headings with a comma tail, no em dashes, no exclamation marks, no eyebrow labels above headings.
- Every standalone GT in rendered copy is the mark (Kevin, 2026-09-09: "replace any mention of GT in text with logo"): `<span class="gt-word"><svg aria-hidden="true"><use href="#gt-mark"/></svg><span class="sr">GT</span></span>`. Package names, code, URLs, attributes and document titles keep the letters.
- The `#gt-mark` symbol carries its own viewBox (`-8 214 1213 771`). Reference it from an `<svg>` that has a width and height in the mark's aspect (about 1.573, for example 132 by 84) and no viewBox. Copying the symbol's viewBox onto the outer svg renders the mark 214 units too high and cuts off its top.
