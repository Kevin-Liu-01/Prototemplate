# GT motion: the brief

Kevin (founder), in his own words: "check everything about our brand and visual design and our blogs and make incredible motion design videos showing off your talents as a graphic designer to make videos for them".

This folder makes the General Translation films: a brand film, a mark sting, one trailer per blog post, a Lottie translation film and a release board, then a showreel cut from all of them. Every film is a HyperFrames composition (HTML whose timeline is seekable and renders frame by frame). This file is the brief every film follows. Read it whole before you write a frame.

The canon this brief applies: `../BRAND.md` (the name, the idea, the character, the voice, the mark, color, type, language as material, the avoid list) and `../DESIGN.md` (the four-color system, the line law, the doubled line, the isometric family, the 1-bit Bayer language, the moving type law, motion discipline). Read both. The brand deck (`../deck/`, rendered previews in `../deck/preview/sNN-dark.jpg`) is the visual reference: open slides 1, 3, 6, 9, 14, 17 to 23, 26, 30, 34, 37, 54 and 64 before you design.

## Dithered artifact pictures (2026-10-05)

Relayed from Kevin through the "New Onboarding and Dashboard" session: the Blue Marble is the standard for every dithered artifact picture. The tone grid uses no blur, gamma 1.2, autocontrast at 0.5 percent a tail, with black and white points solved to the earth's mean 0.361 and standard deviation 0.342. The screen is the 8x8 Bayer at 1 CSS px cells, white at 0.62 over #070707 in dark and #070707 at 0.7 over white in light. The canonical files are Prototemplate's scripts/media/mood-tone/standard.json and docs/ARTIFACT-PICTURES.md once they land on main; read them before dithering an artifact picture. Pictures of writing that carry readable plain text (the dictionaries) are retired; the medieval gloss, the Devanagari page, the cable chart and the Rosetta Stone stay.

## Round 7 direction (overrides the sections below where they conflict)

Kevin, 2026-10-02: "the new scripts and visuals and stuff have to be done from scratch ... it needs to be coherent and tell a clear simple story taking excerpts from the blogs"; "for the designing docs and fuma we want to add links at end, and we want to make a consistent end card after videos that also adds link"; "for fuma, mention the teams that fumadocs is used by with their logos and stars"; "make the voice more australian and make the voice less shaky".

- Each film's words are in `films/<slug>/SCRIPT.md` and its pictures in `CONCEPT.md`, written from scratch: one simple story told mostly in verbatim excerpts from the post.
- Every film ends on the shared series end card in `kit/endcard/`: the same layout, timing and motion in every film, with the film's gem smoke palette, the post's title in two lines and the post's link (`generaltranslation.com/blog/<slug>`). The link is the one URL a film shows; it sits on the end card only.
- Star counts and logos may appear where a script names who uses a project (Fuma Nama's adopters beat), read from the GitHub API on the day and rounded as GitHub rounds them.
- The narrator is the one `kit/audio/voice.json` names: Clara since 2026-10-02 (Kevin picked her from the friendly female auditions: "a much more friendly australian voice", "like 2 but more female", "lets use clara"; stability 0.65, style 0.2, speed 1.0), after the Australian Baritone. Never slow a take below speed 1.0; calm comes from the gaps between lines.
- Music for the blog films is the peaceful sound generation bed of round 5, edited to the film's length (Kevin: "for the blogs i liked the peaceful music from before"; `films/blog-fuma-nama/lib/make-bed.mjs` is one such edit). Other films take their music from the Music API (`el.mjs music`) at the film's exact length.
- Kevin, on the round 7 films: "im sad to see the dither disappear from background". The material's Bayer print belongs in the background again (blog-fuma-nama prints its gem smoke as a field behind every scene, cleared around the type and the objects by tone mix).

## Round 4 direction (overrides the rules below where they conflict)

Kevin, after watching the first cuts: "lets improve these. the color we can use is the color and dither and shaders we used (gem smoke from glyphfield). make headers no more than 2 lines large. feel free to use logos. no need for captions/subheaders".

1. **Color and material.** A film's palette is its material: the gem smoke shader from Glyphfield (`kit/gemsmoke.js`, below) in the deck's two renders, and the Bayer dither in that material's own colors.
   - Blue: white and `#86a8ff` smoke on brand blue `#2f5ce0` (the Blog opener, the GT Open Source cover, the docs covers). The docs film is blue.
   - Fire: `#fe5b16`, `#f7ff61` and white smoke on black (the Developer experience opener, the Fumadocs and Fuma Nama covers). The Fuma Nama film is fire, matching its own cover.
   - Gem smoke may fill the frame in full color, wrap a logo as a glass shape (`image: 'kit/gem-shapes/<name>.png'`), or be printed through the 8 by 8 Bayer screen in two or three of its own tones (`gem.dither(grid, { tones })`, the look of the covers). Dither fields and type may take the material's colors, not only white. Ink `#070707` stays the ground between material scenes.
   - The one-accent rule and the four-color limit give way to this palette. Still refused: gradients other than the material itself, CSS glows and shadows, glass UI chrome, rounded corners, colors from outside the film's material.
2. **Headers.** Every heading or quote is at most two lines, and large: set it at 100 to 150 px (the line length decides), never a third line. If a sentence cannot fit two lines at 100 px inside the safe area, shorten it to the post's own shorter wording or choose another sentence from the post.
3. **Logos.** Use real marks where they say more than words: the GT bar monogram and the doubled-line GT mark (`kit/marks`, `kit/brand/gt-mark.svg`), and in `kit/logos/`: fumadocs.png (the Fumadocs moon), mdx.svg, nextjs-logo.svg, nextjs-wordmark.svg, react-logo-dark.svg, react-wordmark-dark.svg, tanstack-logo.svg, mintlify.dark.svg, mintlify-simple.svg. A logo keeps its own drawing and proportions; recolor a one-color mark only to the film's ink or paper. Use a logo only where the post supports it.
4. **No captions and no subheaders.** No bylines, dates, quote attributions, package names under labels, small descriptive lines, counters, tags or URLs. One heading or one quote per beat, plus the picture. The end card is the mark and the post's title, nothing else. The series frame may keep its rails and crosses but drops its counter.

The rest of this brief still holds: Inter only at 400 and 500, no em dashes, no exclamation marks, plain declarative copy faithful to the post, the motion rules (eases, beats, holds, the allowed transitions), the 120 px safe area, determinism, credits for photographs (these two films use none).

### Gem smoke in a composition

```html
<script type="module" src="kit/gemsmoke.js"></script>  <!-- defines window.GTGem, then fires 'gtgem-ready' -->
<div id="gem"></div>  <!-- a block element; the module sizes it -->
<script>
  const gems = {};
  function draw(t) { if (gems.bg) gems.bg.at(t); }            // seconds of film time
  const tl = gsap.timeline({ paused: true, onUpdate: () => draw(tl.time()) });
  window.__timelines['main'] = tl;                                // built synchronously as usual
  function boot() {
    GTGem.mount(document.getElementById('gem'), { palette: 'fire', width: 1920, height: 1080, offset: 6 })
      .then((g) => { gems.bg = g; draw(tl.time()); });
  }
  if (window.GTGem) boot(); else window.addEventListener('gtgem-ready', boot, { once: true });
</script>
```

- `palette` 'blue' | 'fire' | 'ink'; `params` takes Paper's Gem Smoke props (shape metaballs/diamond/circle..., scale, size, angle, offset, innerGlow, outerGlow, innerDistortion, outerDistortion, colors, colorBack, colorInner, offsetX, offsetY, rotation); `image` a processed shape PNG (`kit/gem-shapes/gt-bar-monogram.png`, `gt-mark.png`, `fumadocs-moon.png`; make more with `node kit/gem-shapes/make.mjs` after adding a row to its SHAPES list); `offset` seconds to choose a phase; `rate` a time multiplier; `pixelRatio` below 1 renders smaller and faster (use 0.5 when the frame is dithered).
- `gem.at(t)` draws the frame for film time t. `gem.set(params)` changes uniforms (animate a param by calling it from onUpdate). `gem.dither(grid, { tones: ['#000000', '#7a2a08', '#fe5b16'], gain, gamma, amount })` prints the frame through the Bayer screen into a `GTDither.grid` canvas; hide the gem's own canvas (`visibility: hidden` on its host) when you show only the dithered print.
- `films/_gem/index.html` is a working example (blue, fire, the GT mark as a glass shape, a dithered fire field); two renders of it match pixel for pixel. Gem smoke renders on the GPU through the renderer's hardware path; keep at most two full-frame gem mounts live at once.
- Never write a literal `font-family: 'Inter'` (or any family) in a composition: the compiler then fetches that family from Google Fonts over the kit's self-hosted face. Use `var(--font)`.

## Sound: music and an Australian narrator (Kevin: "add music and an australian voice from elevenlabs")

This section is for the sound pass (round 5), which runs after round 4's verdict. Round 4 lanes leave the films silent and do not report missing sound as a defect.

- Every film now carries a music bed and an Australian narrator, both from ElevenLabs through `kit/audio/el.mjs` (read its header). The key stays in the ElevenLabs config file that `el.mjs` reads; never print it, copy it, or pass it on a command line.
- Voice IDs, request IDs and plan names never enter tracked files. Name a voice by its name: `el.mjs` and the kit read its id from `kit/audio/voices.local.json`, which git ignores (`voices.example.json` lists the names).
- Narration: one short line per beat, in the brand's voice (measured, declarative, no hype, no exclamation, no rhetorical questions), true to the post. The narrator may say the beat's heading, or a plain sentence that leads into it; a quote is said as a quote ("I learned to code from files," he says). The first line names the post. The last line is the title or "On the General Translation blog." About 2.2 to 2.6 words a second; the whole script about 45 to 60 words for 24 s. Generate each line separately (`el.mjs line`, passing --prev and --next so the read flows) and place each clip at its beat with its `.json` timings, so a heading lands with its words. Where a line runs longer than its beat, lengthen the hold; never speed up audio.
- Music: one bed per film from a prompt that fits its material (fire: warm, dark, slow pulse; blue: airy, glassy, precise), instrumental only, no vocals, no drops, no risers, no genre clichés. It enters with the film, sits under the narrator (duck it about 10 dB while a line plays), and resolves on the end card with a fade.
- Mix (load the `hyperframes-audio` skill; read `hyperframes-core` references/variables-and-media.md for `<audio>` clips): narrator integrated loudness about -16 LUFS for the film, music bed about -26 LUFS under speech and -20 LUFS alone, true peak under -1 dBTP, no clipping, fades of 0.3 to 0.8 s, nothing starts or stops on a click. Measure the final MP4 with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.
- The final render must carry the audio (AAC in the MP4). Check that the audio length equals the video length.

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
    gemsmoke.js        window.GTGem: the gem smoke shader, seekable, optionally dithered (ES module)
    paper-shaders/     Paper Shaders 0.0.78 ES module build (Apache-2.0), used by gemsmoke.js
    gem-shapes/        processed logo shapes for gem smoke (gt-bar-monogram, gt-mark, fumadocs-moon) and make.mjs
    logos/             fumadocs, mdx, nextjs, react, tanstack, mintlify marks
    dither.js          window.GTDither: the seekable Bayer engine
    sheet.js           window.GTSheet: the series frame (rails, crosses, mark, counter)
    gsap.min.js        GSAP 3.15, plus DrawSVGPlugin, MorphSVGPlugin, SplitText, Flip, MotionPathPlugin, CustomEase (.min.js)
    lottie.min.js      lottie-web 5.13 (full build), fflate.min.js (unzips .lottie)
    fonts/             InterVariable.woff2, InterVariable-Italic.woff2
    marks/             the speed marks: bar-monogram, bar-monogram-lockup, bar-monogram-dithered, bar-monogram-ascii(.svg/.txt), plate-inverted, double-cut, livery-stack, two-way, globe-g (+ construction)
    brand/gt-mark.svg  the doubled-line GT monogram (vector, currentColor)
    sources/           full-resolution picture sources (continuous tone): earth, rosetta, calligraphy, tablet, gloss (MS Gen 1671, only 384 x 350). The dictionary pictures (dictionary, johnson, oed-volumes and their tone/ and two-tone/ copies) were retired on 2026-10-05 and moved to kit/_retired/: Kevin, "never distract with text on the artifacts. this disqualifies the dictionary and oxford" and "the dictionaries are plain english and distracting instead of artistic or design meaningful". Never use them.
    two-tone/          the deck's dithered mood and opener files, 1600 x 900, lit cells white on black (mood-*.jpg) with -light twins
    tone/              the sign-in plate's tone grids (composed for the right half of a frame; prefer sources/ or two-tone/ for full frames)
    blog/              every image the blog posts ship (designing-docs-*, rewriting-docs-*, fumadocs-*, supporting-open-source-software.png, covers and og images)
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
| gloss | A marginal gloss | Image: MS Gen 1671, University of Glasgow Library, Archives and Special Collections |
| devanagari | A Devanagari manuscript | Photograph: Ms Sarah Welch, CC BY-SA 4.0 |
| cable | The Eastern Telegraph cable chart | Map: Eastern Telegraph Company, 1901, public domain |
| wave | The Great Wave off Kanagawa | Print: Katsushika Hokusai, about 1831, public domain |
| compass | Bowen's compass rose | Engraving: Emanuel Bowen, 1748, public domain |
| lighthouse | Louisbourg lighthouse | Photograph: Ken Heaton, CC BY-SA 4.0 |

Blog images are General Translation's own material; credit a post's authors on its title card.

### Sound

See "Sound: music and an Australian narrator" at the top. The picture must still read with the sound off: no beat depends on audio alone.

## The facts the films may state

- General Translation: "Every product in every language." The positioning, the values and the voice are in BRAND.md sections 2 and 3. The site is generaltranslation.com; posts live at generaltranslation.com/blog/<slug>.
- The open-source libraries are `gt`, `gt-next`, `gt-react`, `gt-vue`, `gt-node`, `gt-python`; Locadex is the agent; `npx gt translate` translates a project; `gt login` signs the CLI in.
- Do not state numbers about the company (customers, revenue, funding, team) or a launch date. Customers BRAND.md names may appear only as BRAND.md states them.
- The blog posts (read each one in full before you design its film):

| slug | title | authors | date |
| --- | --- | --- | --- |
| designing-docs-for-humans | Designing docs for humans | Kevin Liu and Taylor Fang | September 17, 2026 |
| rewriting-our-docs | Rewriting docs for humans and agents | Taylor Fang | September 14, 2026 |
| fuma-nama | Fuma Nama: The philosophy of an open-sourcerer | Taylor Fang | September 3, 2026 |
| supporting-open-source-software | Supporting open-source software | Archie McKenzie | August 17, 2026 |

- The release log (devlog) entries are MDX; they are served on the blog too.

## The films

Each film's brief is the direction; you design the beats, the timing and every frame. Write `films/<slug>/STORYBOARD.md` first (beats with start and end times on the 0.5 s grid, the on-screen copy word for word, the visual, the motion and easing, the transition out), then build to it, then render. A film the site has not published keeps here only the title, length and summary that /motion shows; its full brief is in `MOTION.local.md` beside this file, which git ignores.

### brand-film: Every product in every language (45 to 50 s)

The company in one breath.

### mark-sting: the bar monogram sting (6 s)

A logo sting for the start and end of any video.

### blog-designing-docs: Designing docs for humans (50 to 55 s)

The post takes a docs page apart (zones, layers, the reading path, the redline pass, type, alignment, icons, the hit list). The film does the same in motion. Rebuild the post's central diagrams in HTML/SVG where motion explains them (the exploded layers in the isometric family of DESIGN.md section 6, the reading path as a doubled line through the page, the redline marks landing), and use the post's images (`kit/blog/designing-docs-*.webp`, the cover `designing-docs-H0-cover-final.webp`) as plates where a rebuild adds nothing. Structure: a cold open on the page coming apart (2 to 4 s); the title card (title, "Kevin Liu and Taylor Fang", "September 17, 2026"); three beats of the post's ideas, one sentence each, faithful to the post; the end card (title small, generaltranslation.com/blog/designing-docs-for-humans, the GT mark).

### blog-rewriting-docs: Rewriting docs for humans and agents (20 to 24 s)

Two readers of one page.

### blog-fuma-nama: Fuma Nama, the philosophy of an open-sourcerer (55 to 60 s)

A portrait of Fumadocs' creator and his credo. Read the post and the Fumadocs architecture component the post embeds (`FumadocsArchitecture`), then build the architecture as layers assembling with doubled-line connectors, and set two short quotes from the post exactly as printed, each held to be read. The post's section titles are its ideas ("Less abstraction, less opinionated software", "A black box and a compiler", "The Fumadocs design credo"). He is General Translation's first open-source grantee; say so plainly. Images: `kit/blog/fumadocs*.png`, `fuma-nama-og.png`. Title card: "Fuma Nama: The philosophy of an open-sourcerer", "Taylor Fang", "September 3, 2026"; end card with generaltranslation.com/blog/fuma-nama.

### blog-open-source: Supporting open-source software (14 to 18 s)

The grants announcement.

### lottie-translation: Translated Lottie animations (18 to 22 s)

For the upcoming post about translating Lottie animations.

### release-board: The release board (14 to 18 s)

The changelog as a split-flap departure board (a reference the brand names).

### jihe-yuanben: Ricci, Xu Guangqi, and the Chinese vocabulary of Euclid (60 to 100 s)

Added 2026-10-02. Kevin: "let's add a new video to the roster, where you have more creative freedom to explore making this video, you dont have to strongly align with this, you can just take whatever creative liberties you need to make the most awesome motion designed video that also tells this story." The story and every fact come from `films/jihe-yuanben/BRIEF.md` (Kevin's research: an 85 s animation script, the long-form post, a vocabulary table, sources with rights, and a fact-check list). Beijing, 1606 to 1607: Matteo Ricci and Xu Guangqi translate Euclid into a language with no words for definition, axiom or proof; Ricci speaks, Xu writes; they coin 界說 for definition, label points with the Heavenly Stems 甲乙丙, and use 幾何 ("how much") for magnitude, which later narrowed to mean geometry. This film is free of the Round 4 and Round 7 palette and layout rules and of the brief's own beat plan: its directors choose the material, the type (a CJK serif for the Chinese is needed), the structure, captions and the sound. What still binds: the facts and hedges of BRIEF.md sections 2 to 5 (the contested items stay hedged, the image captions follow its image notes), the user's writing rules for any narration or text the film writes itself, public-domain or properly credited sources, deterministic HyperFrames rendering, and the standard of a studio piece.

### journey-to-the-west: Waley, Hu Shih, and the English names of Journey to the West (60 to 100 s)

Added 2026-10-02. Kevin: "add more artifcats to prototemplate / journey to the west, translated to english / creation of hebrew, / and inspired off of this", the "this" being the jihe-yuanben research. The story and every fact come from `films/journey-to-the-west/BRIEF.md`, a research package in the jihe-yuanben format compiled and fact-checked for this film (an 85 s animation script, the long-form post, a 28-row vocabulary table, sources with rights, and a 25-item fact-check list). It is the next installment of the same Chinese series. London, 1942: Arthur Waley publishes *Monkey*, 30 of the 100 chapters of the Ming novel 西遊記 and few of its roughly 750 poems, and his names (Monkey, Pigsy, Sandy, Tripitaka) are still the English names in 2021. The story is what each translator did with the names and the allegory:
- the anonymous 1592 Shidetang edition, and Hu Shih's 1923 case for Wu Cheng'en, which is an attribution and stays hedged;
- the surname 孫 made by taking the animal radical off 猻;
- the 悟 the three disciples share, which Richard (1913) and Jenner (from 1982) keep and Waley drops;
- the stable title 弼馬溫 and its 避馬瘟 pun, which no English version keeps;
- the 心猿, 金公 and 木母 allegory, which Waley leaves out and Anthony Yu's complete translation (1977 to 1983) renders with all the poems.

Waley's 1942 book, its Duncan Grant title page and jacket, his preface and Hu Shih's 1943 introduction are in copyright: name the book on a typographic card and show only the public-domain pages the brief lists. The freedoms and the binding rules are the same as jihe-yuanben's (a CJK serif for the Chinese is needed).

### modern-hebrew: Ben-Yehuda, Pines, and the vocabulary of Modern Hebrew (60 to 100 s)

Added 2026-10-02, from the same message ("creation of hebrew"), read as the making of Modern Hebrew as a spoken language. The story and every fact come from `films/modern-hebrew/BRIEF.md`, a research package in the jihe-yuanben format compiled and fact-checked for this film (an 88 s animation script, the long-form post, a 29-row vocabulary table, sources with rights, and a 25-item fact-check list). It opens a Hebrew series, anchored on the first volume of Ben-Yehuda's dictionary (Jerusalem and Berlin, 1908). From Jaffa, 1881, to the Academy of the Hebrew Language, 1953: Eliezer Ben-Yehuda's 1880 column coins מִלּוֹן (dictionary) from מִלָּה (word). New words are made the way Ricci and Xu compressed common characters into technical terms:
- a root set into a pattern: the instrument pattern of מַפְתֵּחַ (key) gives מַקְלֵעַ;
- the dual ending for pairs turns אוֹפָן (wheel) into the bicycle;
- old words get new senses: חַשְׁמַל from Ezekiel becomes electricity, after the Greek *elektron*.

His dictionary marks his accepted coinages with a sign of their own. Many words were made by others: the tomato is Pines's עַגְבָנִיָּה, and Ben-Yehuda's בַּדּוּרָה fell out of use. The 1913 language dispute at the Haifa Technikum and the 1922 Mandate close the story. Hedged and listed in the brief:
- Ben-Yehuda's individual role, against the schools of the First and Second Aliyah;
- "first native speaker";
- several popular coinage attributions.

The freedoms and the binding rules are the same as jihe-yuanben's. A Hebrew face that sets pointing (niqqud) correctly is needed, and right-to-left lines must render correctly in the browser. Vols. 9 to 16 of the dictionary are in copyright; the brief lists the public-domain scans.

### slash-partnership (off the site)

`offSite` in `public/motion/published.json` keeps this film off the site; the site's build needs its slug on this roster.

### slash-announcement: Supporting Slash companies (35 to 40 s)

The announcement of General Translation's partnership with Slash. Slash supports global payments to more than 180 countries, General Translation is partnering with Slash to help companies reach customers in every language, and Slash customers can get up to $2,000 in translation credits for their app, website, documentation, slides and design files. It closes on the Slash and General Translation lockup with generaltranslation.com/slash.

Built from Kevin's own script (`films/slash-announcement/BRIEF.md`), read by Frederick Surrey: five of his lines in order (1, 3 without "We bank with Slash", 6, 7 and the first sentence of 8, which Kevin changed on 2026-10-09 to "Your product should exist in every language."). v3 to v8 (2026-10-08 and 2026-10-09) follow his notes: animations about 30 percent quicker with holds of about half a second; the film opens on Slash's white wordmark over Slash's own gold card photo (Kevin's image, cut out and floated in with a highlight across the brushed gold, never dithered); on "for" the globe appears in front and the card slides right behind it while the photo's ground hands over to the dithered light; the approved globe with 24 routes in their original style, drawn at 2.5 px with a dark keyline so they read at phone size, while the count rises to 180+; the lockup pushes in slowly through line 3, then glides into a small corner seat on "So" and stays through the offer; the five surfaces drop in on "localize", just after the credits bar, then Sign in, Pricing, Quickstart, Sales deck and Hero banner each step to their own language; the end card without the legal line. The 3 px screen is used for every dithered piece. The cut is 36.3 s. v7 is in `out/v17/`, v6 in `out/v16/`, v5 in `out/v15/`, v4 in `out/v14/`, v3 in `out/v13/`, v2 in `out/v12/` and v1 in `out/v11/`.

### gif-how-gt-works: How General Translation works (15 to 18 s)

A looping product GIF of how General Translation localizes an app, made for OpenAI for Startups: the app's text is wrapped in the T component, one command (npx gt translate) writes the translation files, a reviewer edits a translation in the Dashboard, and the app switches between English, Spanish, French and Japanese.

It uses the drawing grammar of the Designing docs film (vector interface panels, doubled-line connectors, the isometric lift of the translated pages) in black and white on a plain black ground, with one blue accent and no dither or smoke. It has no narration: four short headings carry it, and it closes on a General Translation card. The loop is 17.3 s and seamless; it ships as a 1280 x 720 GIF (1.26 MB) and a 1920 x 1080 MP4. The flow and its sources are in `films/gif-how-gt-works/DESIGN.md` and `NOTES.md`.

### showreel (assembled last)

After every film is final, a 40 to 50 s showreel cut from them: the mark sting opens, the strongest four to six seconds of each film follow on hard cuts on the beat grid, the sting's end card closes.

## What each film delivers

- `films/<slug>/STORYBOARD.md`, the composition, `NOTES.md` (what the film is, duration, the sources it uses, credits, anything a later editor needs).
- `npx -y hyperframes@0.8.106 check .` passing with 0 errors.
- `out/<slug>.mp4` at 1920 x 1080, 60 fps, delivery quality.
- `out/<slug>.png`: the poster, the strongest frame at full resolution (`npx -y hyperframes@0.8.106 snapshot` or `ffmpeg -ss`).
- `out/_sheets/<slug>.png`: a contact sheet of the final render, one frame per second, six columns, each tile 480 wide, with its time under it.

## Contact sheets and scripts (Kevin, 2026-10-06: "save these kind of sheets to prototemplate as well as the scripts")

Every finished film ships two records beside its render, and the Prototemplate site publishes them:

- **The contact sheet:** `out/sheets/<slug>.png` and `.webp`, made by `kit/contact-sheet.sh out/<slug>.mp4 out/sheets/<slug>`: two frames a second from the first frame, 384 px wide, eight to a row, 3 px white gaps. This is the grid Kevin asked to keep. (`out/_sheets/` stays the lanes' own checking sheets.)
- **The script as built:** `out/scripts/<slug>.md`, made by `kit/script-export.py` from `out/scripts/source/<slug>.json` (the reviewed lines, who speaks them and what is on screen) and the final's own audio transcribed with word timings (`kit/audio/el.mjs hear --out out/scripts/source/<slug>.stt.json`). A line the transcript cannot place, such as a reader's Mandarin, takes an `at` time from the film's own record.

Regenerate both whenever a final is re-rendered, and tell the Prototemplate session.

Two header rules the site's build reads (scripts/build/motion.mjs, 2026-10-07): a film belongs to the translation series only when its `BRIEF.md` opens with `# Brief: <slug>` (the five-section research package); a production brief opens with `# <slug>: the brief` and is listed as an ordinary roster film. In a script page, a row whose Voice is "No voice" may leave its Line empty; every other row needs both cells.

## How a film is judged

A critic watches the final render frame by frame against this brief: the rules above (color, type, copy, texture, line, marks, motion, frame, credits), the facts (every title, name, date and sentence checked against its source), the craft (timing, holds, easing, choreography, typographic quality, legibility at 1280 x 720), and the technical (no blank or black frames, no flicker, no jitter, no clipped text, no element past the safe area, no dropped frames at scene joins). Expect every defect to be reported with its time and fixed.
