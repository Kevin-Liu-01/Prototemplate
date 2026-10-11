# The look of the blog, brand and announcement films

This file is the detail behind section 4 of `../SKILL.md`. These rules bind the blog and brand films; an announcement film keeps the same rules in its partner's palette; the translation series films choose their own look (their directors choose the material, the faces, the structure, the captions and the sound) inside the skill's section 2. Paths are relative to `$PROTOTEMPLATE`, and paths that start with `films/`, `kit/` or `out/` sit inside `motion/`.

## The canon

MOTION.md applies `BRAND.md` (the name, the idea, the voice, the mark, color, type, language as material, the avoid list), `DESIGN.md` (the four colors, the line law, the doubled line, the isometric family, the 1-bit Bayer language, moving type, motion discipline) and the brand deck (`deck/`, rendered as `deck/preview/sNN-dark.jpg`). Open slides 1, 3, 6, 9, 14, 17 to 23, 26, 30, 34, 37, 54 and 64 before designing.

## Material and color

- A film's palette is its gem smoke material and the Bayer dither in that material's tones (Kevin, 2026-10-01: "the color we can use is the color and dither and shaders we used (gem smoke from glyphfield)"):
  - blue: ground `#2f5ce0`, smoke `#ffffff` and `#86a8ff` (Designing docs for humans);
  - fire: ground `#000000`, smoke `#fe5b16`, `#f7ff61` and `#ffffff`, with ember `#7a2a08` in prints (Fuma Nama);
  - ink `#070707` stays the ground between material scenes.
- Refused in every blog film: gradients other than the material, CSS glows and shadows, blur filters, glass UI chrome, rounded corners, any color from outside the film's material.
- **Dither in the background.** Kevin, 2026-10-02: "im sad to see the dither disappear from background". Both blog films print their free gem smoke through the Bayer screen as a field behind every scene, kept clear of the type and the objects by zones drawn from their own ink, changing only by tone mix (Fuma Nama holds it 44 px off a heading's ink and 18 px off an object's).
- The product GIF (gif-how-gt-works) is black and white on a plain black ground with one blue accent and no dither or smoke. An announcement film takes its palette from the partner's material: the Slash films' olive, gold and straw were measured from Kevin's guidance image, and their light is printed through the 3 px screen.

## Type and headings

- Inter only, weights 400 and 500, through `var(--font)`; display text never above 500. Nothing on screen under 18 px. Numbers tabular. Monospace only inside code artifacts.
- **Headings** are at most two lines, set at 100 to 150 px (the line length decides), sentence case, proper nouns capitalised, no trailing period. Seat each line's first glyph ink on x 160 from the loaded face's side bearing (Fuma Nama's cap tops sit at y 172; the docs film sets its heading box at top 146). A sentence that cannot fit two lines at 100 px is shortened to the source's own shorter wording.
- A film has 4 to 6 headings, each made of the words spoken at that moment (the skill's section 2). This replaced round 7's rules that a heading shares no content word with its line and that two thirds of a blog film's words are verbatim from the post.
- **No captions and no subheaders** (Kevin, 2026-10-01: "no need for captions/subheaders"): no bylines, dates, quote attributions, labels, tags, counters or URLs. No eyebrows: never a small label stacked above a heading that says the same thing. One heading or one quote per beat, plus the picture. The one URL a film shows is the link on its end card.
- Non-Latin sentences are one text node with `lang` and `dir`; never split them into per-character spans.

## Logos, marks and the frame

- Logos appear where they say more than words and where the source supports them. A logo keeps its drawing and proportions; a one-color mark is recolored only to the film's ink, paper or material tones, and on a colored photographic ground such as Slash's gold a logo is white (Kevin, 2026-10-09). Fuma Nama's adopters beat shows true marks with GitHub star counts, using Turborepo's mark for "Vercel Turborepo" so one repository's stars are never credited to a whole organization.
- The hero mark is the bar monogram (`kit/marks/bar-monogram.svg`); the doubled-line GT monogram (`kit/brand/gt-mark.svg`) is the small product mark. One ink, never a third color, gradient or shadow.
- **No series frame** on the blog films (Kevin, 2026-10-04: "remove the frame that seems to be overlaid on top of everything"). The end card's frame is off by default.
- **Safe areas.** No text closer than 120 px to an edge at 1920 x 1080, and 160 px for titles and the heading axis.

## Pictures and credits

- Every photograph or scan on screen carries its credit, from MOTION.md's credits table or the film's `CREDITS.txt`. The blog films show no photographs or scans, so they print no credit line.
- A partner's own photograph (Slash's card) is shown as it is, cut out along its own edges, never redrawn and never printed through the screen (Kevin, 2026-10-08).
- Pictures of writing that carry readable plain text are retired (Kevin, 2026-10-05: "never distract with text on the artifacts. this disqualifies the dictionary and oxford"). `gt-dither` owns the Blue Marble tone standard for dithered artifact pictures.

## Facts in detail

- A blog film states only what its post states (`$PROTOTEMPLATE/content/blog/<post>.mdx`, or the post's MDX in gt-cloud's landing app); a series film only what its `BRIEF.md` states. Titles, names and dates appear exactly as published.
- Hedges stay. Fuma's "I think" and "probably" are spoken. A BRIEF's contested items stay hedged on screen and in the narration (jihe-yuanben dates the book as translated in 1606 and 1607 and printed in 1607), and captions follow its image notes ("early 17th-century printing", "Qing edition").
- Star counts are read from the GitHub API on the day and rounded as GitHub rounds them (one decimal under 100,000, whole thousands above).
- An announcement states only what the partner's post and the GT site state ("Introduced in 2026" stayed off screen in the Slash film: no source said it). Kevin dropped the "subject to approval" legal line from the Slash end card (2026-10-08).
