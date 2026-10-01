# GT motion: the brief

Kevin (founder), in his own words: "check everything about our brand and visual design and our blogs and make incredible motion design videos showing off your talents as a graphic designer to make videos for them".

This folder makes the General Translation films: a brand film, a mark sting, one trailer per blog post, a Lottie translation film and a release board, then a showreel cut from all of them. Every film is a HyperFrames composition (HTML whose timeline is seekable and renders frame by frame). This file is the brief every film follows. Read it whole before you write a frame.

The canon this brief applies: `../BRAND.md` (the name, the idea, the character, the voice, the mark, color, type, language as material, the avoid list) and `../DESIGN.md` (the four-color system, the line law, the doubled line, the isometric family, the 1-bit Bayer language, the moving type law, motion discipline). Read both. The brand deck (`../deck/`, rendered previews in `../deck/preview/sNN-dark.jpg`) is the visual reference: open slides 1, 3, 6, 9, 14, 17 to 23, 26, 30, 34, 37, 54 and 64 before you design.

## The standard

These films show what a graphic designer who knows motion can do with this brand. The bar is a studio reel, not a slideshow with fades. Concretely:

- Every move explains structure: things assemble, reveal, connect or translate. Nothing moves to fill time.
- Timing is designed: a beat grid, arrivals that land on beats, holds long enough to read, and one idea per beat.
- Craft at the pixel: type set as carefully as print (kerning, line length, no widows, optical alignment of the mark), lines drawn exactly once, dither cells crisp and square.
- Restraint: one accent per film, used on one thing at a time.

## Where things live

```
motion/
  MOTION.md            this brief
  kit/                 shared, read only for films (ask the lead to change it)
    tokens.css         colors, Inter @font-face, the type ladder
    dither.js          window.GTDither: the seekable Bayer engine
    sheet.js           window.GTSheet: the series frame (rails, crosses, mark, counter)
    gsap.min.js        GSAP 3.15, plus DrawSVGPlugin, MorphSVGPlugin, SplitText, Flip, MotionPathPlugin, CustomEase (.min.js)
    lottie.min.js      lottie-web 5.13 (full build), fflate.min.js (unzips .lottie)
    fonts/             InterVariable.woff2, InterVariable-Italic.woff2
    marks/             the speed marks: bar-monogram, bar-monogram-lockup, bar-monogram-dithered, bar-monogram-ascii(.svg/.txt), plate-inverted, double-cut, livery-stack, two-way, globe-g (+ construction)
    brand/gt-mark.svg  the doubled-line GT monogram (vector, currentColor)
    sources/           full-resolution picture sources (continuous tone): earth, rosetta, calligraphy, tablet, dictionary (OED 1897 page), johnson (1755 grammar, leaf 51), gloss (MS Gen 1671, only 384 x 350), oed-volumes
    two-tone/          the deck's dithered mood and opener files, 1600 x 900, lit cells white on black (mood-*.jpg) with -light twins
    tone/              the sign-in plate's tone grids (composed for the right half of a frame; prefer sources/ or two-tone/ for full frames)
    blog/              every image the blog posts ship (designing-docs-*, rewriting-docs-*, fumadocs-*, supporting-open-source-software.png, covers and og images)
    lottie/            the Ramp demo's translated animations: ramp-card-expenses, ramp-procure-to-pay, ramp-stack-questions, each en/de/es/ja/zh .lottie + manifest.json
  films/<slug>/        one HyperFrames project per film
  out/                 renders: <slug>.mp4, <slug>.png (poster), _sheets/<slug>.png (contact sheet)
```

Make your project with `cd motion/films && npx -y hyperframes@0.8.106 init <slug> --example blank --non-interactive`, then inside it `ln -sfn ../../kit kit` and load everything through `kit/...` (relative). Load scripts from the kit, never from a CDN: renders must not touch the network. Pin the CLI at 0.8.106 in every command. `films/_smoke/index.html` is a working example of the kit (a dither field mixing two pictures, Inter type, the bar monogram) that rendered clean; read it first.

## HyperFrames, briefly

Load the `hyperframes-core` skill before you write composition HTML, and `hyperframes-animation` and `hyperframes-keyframes` for motion. The rules that bite:

- One paused GSAP timeline per composition, built synchronously, registered on `window.__timelines["<composition-id>"]` (initialise `window.__timelines = window.__timelines || {}` first). The root carries `data-composition-id`, `data-start="0"`, `data-width`, `data-height`, `data-duration`.
- Every frame is a pure function of time. No `Date.now`, no `performance.now`, no unseeded `Math.random` (use `GTDither.rng(seed)`), no `requestAnimationFrame`, no timers, no `repeat: -1`.
- Canvas drawing happens in a tween's or the timeline's `onUpdate`, reading only tween-driven proxy values. Images used by a canvas live in the DOM as `<img>` (hidden) so the renderer waits for them.
- Never pair a CSS `transform` with a GSAP tween on the same element: set initial state inside `fromTo`.
- Animate only transforms, opacity and colors. A transformed element must be block level and sized.
- Scenes as sub-compositions (`data-composition-src`, `<template>` roots, ids prefixed with the composition id) keep the timeline readable; a monolithic file is acceptable for short films. `npx -y hyperframes@0.8.106 check .` must end with "Check passed" and 0 errors. Warnings you keep must be intentional (full-bleed canvas art carries `data-layout-allow-overflow`).
- Draft renders: `npx -y hyperframes@0.8.106 render . -o ../../out/_draft-<slug>.mp4 --quality draft --fps 30 --workers 3 --quiet`. The final: `--quality delivery --fps 60 --workers 3 -o ../../out/<slug>.mp4`. Eight films render on one machine at once: keep `--workers 3`.

## The brand in motion: the rules

### Color

- Films are dark first: the ground is ink `#070707`, the second surface raised ink `#101010`, type in `#f2f2f0` (the deck's ink on dark), captions in titanium `#8a8f98`, hairlines `rgba(242,242,240,0.11)`, soft hairlines `0.06`. A paper (white `#ffffff`, ink type) scene is allowed as a deliberate contrast beat, as the deck's light slides are.
- Exactly one accent per film: `#86a8ff` on ink, `#2f5ce0` on paper. The accent is an edge: one pulse on a thread, one active row, one lit word, the dither ink of one picture. Never a wash, never a gradient, never two accented things at once.
- No shadows, no glows, no blur filters on the frame, no glass, no gradients except dither density, no rounded corners (radius 0), no iridescent anything.

### Type

- Inter is the only typeface, self-hosted by `kit/tokens.css`. Weights 400 and 500 only; display text never above 500. The deck ladder at 1920 is in tokens.css (`.t-display` 106, `.t-h1` 88, `.t-h2` 53, `.t-lead` 31, `.t-body` 26, `.t-cap` 18). Nothing on screen under 18 px.
- Headings in sentence case with a capital first letter and proper nouns capitalised (General Translation, Fumadocs, Lottie, GitHub); no trailing period on a heading; Title Case only for a button label. Product tokens in their exact form (`gt`, `gt-next`, `npx gt translate`), never as a sentence's first word.
- Numbers tabular (`font-variant-numeric: tabular-nums`).
- Monospace is an instrument voice: only inside code artifacts (a terminal, a code panel on raised ink `#101010`, a file path, a command). Never for headlines, captions or labels.
- Non-Latin scripts: each sentence is one text node with `lang` and `dir` (Arabic right to left, Devanagari with its matras intact). Never split a non-Latin sentence into per-character spans. Fallback families that exist on this machine: Japanese 'Hiragino Sans', Chinese 'PingFang SC', Korean 'Apple SD Gothic Neo', Arabic 'Geeza Pro', Hindi 'Kohinoor Devanagari'. Weight 500 maps to their medium (W5, Medium) where the face has one.

### Copy

- Plain declarative English, the voice of a good spec: short sentences, facts over claims, no marketing adjectives, no exclamation marks, no rhetorical questions, no "X, not Y" contrast pairs, no metaphors.
- No em dashes anywhere on screen (use a period or a comma). No eyebrows: never a small label stacked above a heading that says the same thing. A functional tag (a locale code, a date, a version) is fine.
- Every sentence on screen must be true and checkable from the post or from BRAND.md. Quote the post or paraphrase it faithfully. Titles, names and dates exactly as published.
- Say: "One pipeline. Every language ships with the deploy." Not: "Supercharge your global growth with cutting-edge AI!"

### Texture: the 1-bit Bayer language

- The only texture is ordered dither through `kit/dither.js` (8 by 8 Bayer, nested tiers, cells as square pixels). At 1920 x 1080 the cell is 2 or 3 css px; pick one per film and never resize cells inside a transition.
- A dithered field changes state only by mixing tone on one cell grid with one anchored tile on one smoothstep (`GTDither.mix`), so cells switch in Bayer order. Alpha fades, wipes and moving masks are refused for dithered fields (the craft page's rules). A field enters by raising its tone from 0 and leaves by lowering it to 0.
- Pictures are dithered from tone: `GTDither.toneFromImage(img, grid, { fit, focusX, focusY, gamma, invert })` on `kit/sources/*.jpg`, or on a deck two-tone file with `{ blur: 1.2, lift: 1.6 }` to recover tone. Hold a dithered picture's mean tone near the deck's (lit share 10 to 35 percent) so it reads as a picture, not noise.
- Subtle life on a still field is allowed (a slow drift of the sampling window, under 3 percent over a beat, re-sampled per frame), never shimmer noise.

### Line

- Hairlines are 1 px and drawn exactly once: a row draws its seam, a cell never redraws it. Where two hairlines cross, a small registration cross.
- The connector is the doubled line: one path stroked twice, a full stroke in ink under a narrower core in the ground color, carving two parallel threads (at video scale: gauge 3 px, core 1.5 px gap, or the 1.5/3 tokens doubled). A pulse is a third copy in the accent between threads and core, moved as real geometry (a sub-path rewritten per frame), never a dash offset.
- Draw-on animation of a line goes from one owner outward (a rail draws out of its cross), with `expo.out` or `power3.out`.

### The marks

- The hero mark is the bar monogram (`kit/marks/bar-monogram.svg`): thirteen parallelograms under a 12 degree skew; the G's stem combed into three speed bars of different lengths that lead into the letter; one 8 unit horizontal cut through both letters at mid height. Its sub-paths are separate `M...Z` runs in one `d`; split them into one `<path>` each to animate them. The lockup (`bar-monogram-lockup.svg`) sets "General Translation" letter spaced to the monogram's width; the livery stack, double cut, plate inverted, dithered and ASCII monograms are the rest of the speed set.
- The doubled-line GT monogram (`kit/brand/gt-mark.svg`) is the product mark at small size: the series frame's lower left corner, an end card's small mark.
- One ink: paper on ink or ink on paper. Never a third color on the mark, never a gradient, never a shadow. The sanctioned flourish is a Bayer dithered specular band sweeping across the mark by pure horizontal translate.
- Speed register: the speed bars may arrive on a fast horizontal streak with a short dithered trail (a Bayer ramp behind the bar whose density falls off with distance and retracts as the bar stops). That trail is the brand's motion blur; never use a blur filter.

### Motion

- Easing: `expo.out` or `power3.out` for arrivals (fast in, long settle); `power2.inOut` for a move from one place to another; `none` for processes (a scan, a pulse, a counter). No bounce, no elastic, no back overshoot.
- A beat grid: 0.5 s at 30/60 fps. Arrivals land on beats; scene changes happen on beats.
- Reading: a sentence holds at least (words ÷ 3) + 1 s after it has fully arrived. Nothing important changes while the eye is still reading it.
- Staggers are short (40 to 90 ms) and ordered by reading direction (left to right, top to bottom; right to left for Arabic).
- A camera drift (scale 1.00 to 1.04 over a scene, or a slow pan) is allowed on a plate image or a dither field, never on type.
- Scene transitions, from this list only: (a) a tone mix from one dither field to the next; (b) a hard cut on a beat; (c) a hairline that draws a seam the next scene then sits on; (d) the moving type: a sentence that dissolves into glyph cells and reassembles as the next. Never a whole-frame cross dissolve, push, slide, zoom blur, spin, glitch or light leak.
- Safe area: no text closer than 120 px to a frame edge at 1920 x 1080 (title safe 160 px), except the series frame's margin furniture.

### The series frame

The deck's sheet is the films' common frame: `GTSheet.mount(el, { inset: 67 })` draws two rails and two rules 67 px in from the edges, a registration cross at each meeting, the doubled-line GT mark in the lower left margin, and a counter in the lower right margin (use it for the film's section, "01 / 05", in tabular figures, or for the film's title in titanium). Draw the rails out of their crosses at the film's start (0.6 s, `expo.out`). Full-bleed dither scenes may run under the rails, as the deck's mood slides do. A film may drop the frame for a full-frame beat, but it opens and closes on it.

### Credits

Every picture on screen carries its credit, in the caption plate's credit line (titanium, 18 px), exactly as the deck prints it:

| picture | title | credit |
| --- | --- | --- |
| earth | The Blue Marble | Image: NASA, Reto Stöckli, 2007, public domain |
| rosetta | The Rosetta Stone | Photograph: Hans Hillewaert, CC BY-SA 4.0 |
| tablet | A proto-cuneiform tablet | Photograph: The Metropolitan Museum of Art, Open Access, public domain |
| calligraphy | Karahisari's calligraphy | Calligraphy: Ahmed Karahisari, 16th century, public domain |
| johnson | Johnson's Dictionary | Image: Samuel Johnson, 1755, scanned by the Wellcome Collection, public domain |
| dictionary | The Oxford English Dictionary | Image: Oxford University Press, 1897, scanned by the Internet Archive, public domain |
| gloss | A marginal gloss | Image: MS Gen 1671, University of Glasgow Library, Archives and Special Collections |
| devanagari | A Devanagari manuscript | Photograph: Ms Sarah Welch, CC BY-SA 4.0 |
| cable | The Eastern Telegraph cable chart | Map: Eastern Telegraph Company, 1901, public domain |
| wave | The Great Wave off Kanagawa | Print: Katsushika Hokusai, about 1831, public domain |
| compass | Bowen's compass rose | Engraving: Emanuel Bowen, 1748, public domain |
| lighthouse | Louisbourg lighthouse | Photograph: Ken Heaton, CC BY-SA 4.0 |

Blog images and the Ramp Lottie animations are General Translation's own material; credit a post's authors on its title card.

### Sound

The films are silent. Design them to read without sound (no beat depends on audio). Sound design is a later decision for Kevin.

## The facts the films may state

- General Translation: "Every product in every language." The positioning, the values and the voice are in BRAND.md sections 2 and 3. The site is generaltranslation.com; posts live at generaltranslation.com/blog/<slug>.
- The open-source libraries are `gt`, `gt-next`, `gt-react`, `gt-vue`, `gt-node`, `gt-python`; Locadex is the agent; `npx gt translate` translates a project; `gt login` signs the CLI in.
- Do not state numbers about the company (customers, revenue, funding, team) or a launch date. Customers BRAND.md names may appear only as BRAND.md states them.
- The blog posts (read each one in full before you design its film; they are MDX under `/Users/kevinliu/gt/gt-cloud-wt-icons/apps/landing/content/blog/en-US/`):

| slug | title | authors | date |
| --- | --- | --- | --- |
| designing-docs-for-humans | Designing docs for humans | Kevin Liu and Taylor Fang | September 17, 2026 |
| rewriting-our-docs | Rewriting docs for humans and agents | Taylor Fang | September 14, 2026 |
| fuma-nama | Fuma Nama: The philosophy of an open-sourcerer | Taylor Fang | September 3, 2026 |
| supporting-open-source-software | Supporting open-source software | Archie McKenzie | August 17, 2026 |

- The release log (devlog) entries are MDX under `/Users/kevinliu/gt/gt-cloud-wt-icons/apps/landing/content/devlog/en-US/`; they are served on the blog too.

## The films

Each film's brief is the direction; you design the beats, the timing and every frame. Write `films/<slug>/STORYBOARD.md` first (beats with start and end times on the 0.5 s grid, the on-screen copy word for word, the visual, the motion and easing, the transition out), then build to it, then render.

### brand-film: Every product in every language (45 to 50 s)

The company in one breath. An arc that a viewer could describe afterwards: a horizon, the mark, the sentence in many languages, the long history of writing, the product, the name.

1. A horizon. From black, the event horizon arc (`GTDither.fields.horizon`, the brand opener's material, `kit/two-tone/opener-brand.jpg` for reference) rises in tone. The series frame draws.
2. The mark. The bar monogram assembles: the three speed bars streak in with dithered trails, the letters land, the cut opens across both letters. Hold.
3. The sentence. "Every product in every language" set at display size, then it dissolves into glyph cells and reassembles as the same sentence in Japanese, Arabic, Hindi, Spanish, Chinese, Korean, German and back to English, matter conserved (sample each sentence's rendered pixels into cell positions with a deterministic seed; a cell travels from its place in one sentence to its place in the next on a seeded path; the shaped text node of the arriving sentence replaces the cells when they settle). A small locale code (`ja`, `ar`, ...) states the language. Use these translations exactly: ja すべての製品を、すべての言語で; ar كل منتج بكل لغة; hi हर उत्पाद, हर भाषा में; es Cada producto en cada idioma; zh 每个产品，每种语言; ko 모든 제품을 모든 언어로; de Jedes Produkt in jeder Sprache.
4. Language as material. Pictures of writing in the order of history, full frame, each dithered and each mixing into the next by tone: the proto-cuneiform tablet (about 3100 BC), the Rosetta Stone (196 BC), a marginal gloss (about 1500), Karahisari's calligraphy (16th century), Johnson's Dictionary (1755), the Oxford English Dictionary (1897), the Eastern Telegraph cable chart (1901), the Blue Marble (2007). A caption plate names each with its date and credit; the date may count forward between pictures in tabular figures. One sentence across the sequence: "Writing began as a record of trade." and, on the Blue Marble, "Language is our material."
5. The product. On raised ink, a code panel with one source string and the command `npx gt translate`; doubled-line threads branch from the panel to rows of locales (locale code plus the translated string in its own script), drawing once, an accent pulse travelling each thread; "One pipeline. Every language ships with the deploy."
6. The name. The lockup (bar monogram over "General Translation"), "generaltranslation.com" under it in titanium, the horizon returning low in the frame by tone. Hold two seconds.

### mark-sting: the bar monogram sting (6 s)

A logo sting for the start and end of any video. Black; the speed bars streak in with dithered trails; the G and T land; the cut opens; a dithered specular band sweeps once across the mark (nested Bayer tiers in a 60 degree window, pure horizontal translate); "General Translation" draws under it at the lockup's spacing; hold clean for the last second so it can be used as an end card. Deliver three renders: `mark-sting.mp4` (1920 x 1080), `mark-sting-square.mp4` (1080 x 1080, recomposed, not cropped), and `mark-sting-alpha.mov` (1920 x 1080, transparent ground, `--format mov`) for editors to lay over footage.

### blog-designing-docs: Designing docs for humans (20 to 24 s)

The post takes a docs page apart (zones, layers, the reading path, the redline pass, type, alignment, icons, the hit list). The film does the same in motion. Rebuild the post's central diagrams in HTML/SVG where motion explains them (the exploded layers in the isometric family of DESIGN.md section 6, the reading path as a doubled line through the page, the redline marks landing), and use the post's images (`kit/blog/designing-docs-*.webp`, the cover `designing-docs-H0-cover-final.webp`) as plates where a rebuild adds nothing. Structure: a cold open on the page coming apart (2 to 4 s); the title card (title, "Kevin Liu and Taylor Fang", "September 17, 2026"); three beats of the post's ideas, one sentence each, faithful to the post; the end card (title small, generaltranslation.com/blog/designing-docs-for-humans, the GT mark).

### blog-rewriting-docs: Rewriting docs for humans and agents (20 to 24 s)

Two readers of one page. The frame splits along a seam (the seam device of DESIGN.md section 10: a hairline handle with two-tone threads) into the page a person reads (the rendered docs, an eye path through it) and the same page as an agent reads it (its Markdown twin, the llms.txt index, in a code panel: mono is allowed there). Beats from the post's sections (the dual reader, user journeys, simple language, designing for agents to read), each one sentence from or faithful to the post. Use `kit/blog/rewriting-docs-*.png` and `rewriting-our-docs*.png`. Title card with "Taylor Fang" and "September 14, 2026"; end card with generaltranslation.com/blog/rewriting-our-docs.

### blog-fuma-nama: Fuma Nama, the philosophy of an open-sourcerer (20 to 24 s)

A portrait of Fumadocs' creator and his credo. Read the post and the Fumadocs architecture component the post embeds (`FumadocsArchitecture`, find it under `/Users/kevinliu/gt/gt-cloud-wt-icons/apps/landing/src`), then build the architecture as layers assembling with doubled-line connectors, and set two short quotes from the post exactly as printed, each held to be read. The post's section titles are its ideas ("Less abstraction, less opinionated software", "A black box and a compiler", "The Fumadocs design credo"). He is General Translation's first open-source grantee; say so plainly. Images: `kit/blog/fumadocs*.png`, `fuma-nama-og.png`. Title card: "Fuma Nama: The philosophy of an open-sourcerer", "Taylor Fang", "September 3, 2026"; end card with generaltranslation.com/blog/fuma-nama.

### blog-open-source: Supporting open-source software (14 to 18 s)

The grants announcement. The post's facts: $15,000 in no-strings-attached funds across fifteen developers; each receives a $1,000 cash grant and $5,000 in credits for General Translation's platform; projects must meet the Open Source Definition, be actively developed or maintained (commits within the past year), and be able to receive funding through GitHub Sponsors; apply or nominate a project in the replies to the announcement; Fumadocs' creator is the first grantee. Build it as fifteen cells (one per grant) filling one by one with dither, the figures counting in tabular type, the three conditions as ruled rows, and the call to apply. Title card "Supporting open-source software", "Archie McKenzie", "August 17, 2026"; end card generaltranslation.com/blog/supporting-open-source-software.

### lottie-translation: Translated Lottie animations (18 to 22 s)

For the upcoming post about translating Lottie animations (the blog figure is built on gt-cloud branch k/blog-lottie-translation; read `/Users/kevinliu/gt/gt-cloud-wt-lottie/apps/landing/src/components/blog/LottieTranslation*.tsx` and its CSS for the figure's design: one large animation, the languages as plain rows on the right, a 2 px ink bar on the active row, the source marked). In the film, one Ramp animation plays large while the language changes mid-motion: en, es, de, ja, zh, the frame number never jumping, so the viewer sees the same motion carry a new language. Use the HyperFrames lottie adapter (read `hyperframes-animation` adapters/lottie.md); a `.lottie` file is a zip: unzip it at build time into `assets/<animation>/<locale>.json` with its images inlined as data URIs (`kit/fflate.min.js` or a Node script; the figure's `dotlottie.ts` shows the inlining). Every locale's player is seeked to the same frame; only the shown one is visible. One sentence: "`gt translate` translates the text inside Lottie animations." State nothing about the post's date. End card: generaltranslation.com and the GT mark. Credit: "Animation: Ramp" only if the files' metadata or the figure credits Ramp; otherwise no credit line.

### release-board: The release board (14 to 18 s)

The changelog as a split-flap departure board (a reference the brand names). Rows for the latest releases, newest first, read from the devlog MDX (package and version as the title states it, the date): gt@2.23.0 (September 29, 2026), gt-rrweb@0.2.0, gt-vue@0.1.0, gt-sanity@4.0.0, gt-react@11.1.2, gt-next@11.1.3, gt-tanstack-start@11.1.0, gt-react-native@10.20.0 (check each date in its file). Each character is a flap that flips through a deterministic sequence before it lands; columns resolve left to right; the newest row takes the accent and its one-line summary from the devlog appears under the board. Set the board in Inter 500 with tabular figures (it is a board, not a terminal). End card: generaltranslation.com/blog and the GT mark.

### showreel (assembled last)

After every film is final, a 40 to 50 s showreel cut from them: the mark sting opens, the strongest four to six seconds of each film follow on hard cuts on the beat grid, the sting's end card closes. It is a HyperFrames composition that places the rendered MP4s as `<video>` clips (read `hyperframes-core` references/variables-and-media.md for trims), with the series frame over it.

## What each film delivers

- `films/<slug>/STORYBOARD.md`, the composition, `NOTES.md` (what the film is, duration, the sources it uses, credits, anything a later editor needs).
- `npx -y hyperframes@0.8.106 check .` passing with 0 errors.
- `out/<slug>.mp4` at 1920 x 1080, 60 fps, delivery quality (plus the mark sting's square and alpha renders).
- `out/<slug>.png`: the poster, the strongest frame at full resolution (`npx -y hyperframes@0.8.106 snapshot` or `ffmpeg -ss`).
- `out/_sheets/<slug>.png`: a contact sheet of the final render, one frame per second, six columns, each tile 480 wide, with its time under it.

## How a film is judged

A critic watches the final render frame by frame against this brief: the rules above (color, type, copy, texture, line, marks, motion, frame, credits), the facts (every title, name, date and sentence checked against its source), the craft (timing, holds, easing, choreography, typographic quality, legibility at 1280 x 720), and the technical (no blank or black frames, no flicker, no jitter, no clipped text, no element past the safe area, no dropped frames at scene joins). Expect every defect to be reported with its time and fixed.
