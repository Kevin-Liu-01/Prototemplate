# How GT works: the GIF design

OpenAI for Startups asked General Translation for a GIF of how the product works. Kevin: "lets make a gif showign exactly that in the redesigning docs video style except black and whtie and no dither in background. blue can be used as an accent color".

The loop follows one app through GT's own four steps. A developer wraps the app's text in `<T>`, `npx gt translate` writes a translation file for each language, the team reviews and edits a translation in the Dashboard, and the same app switches between English, Spanish, French and Japanese. The app page stays on the right of the frame for the whole loop. On the left, a fixed tool panel changes at each step: the code, the terminal, the Dashboard and the language selector. The page goes isometric while its language versions exist as files, then flattens back into one page that changes language.

- Seamless loop of 16.0 s. The GIF is 1280 x 720 at 20 fps (320 frames, 5 cs per frame). The MP4 is the same loop at 1920 x 1080 and 60 fps (960 frames), H.264 with faststart. There is no audio and no narration.
- The seam sits inside a still: 15.8 to 16.0 s and 0.0 to 0.4 s show the same frame (frame 0).

## 1. The flow and its sources

Every step, name, command and string comes from GT's own explanations. Paths for gt-cloud main are read with `git show origin/main:<path>` (main at 64581b1af, 2026-10-06). The docs are the English MDX pages of General Translation's docs at content commit d04bb8d, and the table names each page by its path inside the docs.

| # | Step on screen | What the source says | Source |
| --- | --- | --- | --- |
| 0 | The whole loop | "General Translation connects your application code, content sources, translation infrastructure, and review workflows in one platform." The Slash post says: "We've built the full stack for localization: connecting code, content, translations, and review workflows into one platform." | `overview/get-started.mdx`; `motion/films/slash-partnership/BRIEF.md` line 48 |
| 1 | Wrap the text in `<T>` from `gt-next` | Step 6, "Mark content for translation": "wrap any text you want translated with the `<T>` component", with `import { T } from 'gt-next';` added and "Everything inside it ... gets translated as a unit". The home page says: "Tag user interfaces and they're ready to ship in 120+ locales". | `react/nextjs-quickstart.mdx` step 6; `apps/landing/src/components/landing/sections/fullstack/FullStack.tsx` (Code beat) |
| 2 | `npx gt translate` writes `public/_gt/es.json`, `fr.json` and `ja.json` | CLI quickstart step 4, "Translate your project": "translate every file configured in `gt.config.json`, along with any inline `<T>` components ... Translations are saved to your codebase". The config uses `"locales": ["es", "fr", "ja"]` and `"output": "public/_gt/[locale].json"`, and the guide's example path is `public/_gt/es.json`. The translate reference says the command "scans your `src` globs for inline content", including `<T>`. | `cli/quickstart.mdx`; `react/nextjs-quickstart.mdx` step 3; `cli/reference/commands/translate.mdx` "How it works" |
| 3 | The Dashboard's Translations page, where a cell is edited and saved | "Go to the **Translations** page. Choose **Files** or **Components**." "Click a translation cell to edit it. Edits are drafts until you click **Save**." "Review and edit translations with your team." The home page's review surface: "Review and approve with your team, over web, API, or CLI", with the column labels "Source" and "Translation". | `platform/dashboard/guides/reviewing-translations.mdx`; `overview/get-started.mdx` (IntroFeature); `apps/landing/src/components/landing/sections/context/ContextSec.tsx` and `ReviewWorkspace.tsx` |
| 4 | The app switches language through `<LocaleSelector />` | Step 7: "`LocaleSelector` renders a dropdown populated with the languages from your `gt.config.json`". Step 9: "use the language dropdown to switch languages". Step 11 closes with "your app is now multilingual". The dropdown's option label is the locale's native name with its first letter capitalized, so the four options read English, Español, Français and 日本語. | `react/nextjs-quickstart.mdx` steps 7, 9 and 11; `InternalLocaleSelector`, the helper component in the react-core package of the open-source gt repository (`capitalizeName(getLocaleProperties(locale).nativeNameWithRegionCode)`) |

Left out on purpose: Locadex, the agent that runs this flow through pull requests ("Just merge a pull request", `overview/get-started.mdx`), plus Context Groups and glossaries. They don't fit a 16 s loop alongside the four steps. See the open questions.

## 2. The strings on screen

The app's two strings and their translations are GT's own. They come from the home page demo's shipped table (`apps/landing/src/components/landing/home/sections/TranslateWindow.tsx`, `PREVIEWS`), whose header comment says that "every one of them is a complete, correct screen". I checked each one again:

| | en (source) | es | fr | ja |
| --- | --- | --- | --- | --- |
| Heading | Welcome back | Hola de nuevo | Bon retour | おかえりなさい |
| Button | Get started | Comenzar ahora, edited in the Dashboard to Comenzar | Commencer | 始める |
| Selector | English | Español | Français | 日本語 |

- "Hola de nuevo" is the common Spanish UI greeting for a returning user. "Comenzar" and "Comenzar ahora" both mean "Get started" ("Start", and "Start now"). The edit shortens the label to the same length as the French "Commencer". It is a normal reviewer's edit and fixes no error.
- "Bon retour" is the usual short French "welcome back". "Commencer" means "to start".
- "おかえりなさい" is the standard "welcome back". "始める" ("start") is a standard Japanese button label. "日本語" is the language's own name.
- Other on-screen text is product UI: the code lines, `npx gt translate`, `public/_gt/`, `es.json`, `fr.json`, `ja.json`, `<LocaleSelector />`, "Translations", "Source", "Translation", "Save" and the locale tags es, fr and ja.

## 3. The frame

All coordinates and sizes in this document are design px in a 1280 x 720 frame, the GIF's own pixel. The MP4 shows the same stage scaled by 1.5 (section 10), so every number times 1.5 gives its 1920 value.

```
 x 80                                                        x 1200
 y 56   Heading, one line, 72 px
 y 131  -----------------------------------------------------------
 y 160                      (connector lane above the page, B4 only)
 y 184  +------------------------+           +--------------------+
        | tool panel             |  lane     | the app page       |
        | x 80-600, 520 x 480    |  x 600-712| x 712-1200,        |
        | raised ink, hairline   |  doubled  | 488 x 480          |
        | frame, corner crosses  |  lines    | hairline frame     |
 y 664  +------------------------+           +--------------------+
```

- **Safe area:** 80 px at the sides, which is MOTION.md's 120 px at 1920. No element goes past x 1200.
- **The tool panel** is a fixed box for the whole loop: x 80 to 600, y 184 to 664. It has a fill of `#101010`, a 1 px `#5c6068` frame and four 9 px titanium corner crosses. A beat change is a hard cut of the panel's contents only. The frame never redraws. Content sits at x 112 (32 px inset). Code rows are 40 px apart, starting at L1 = y 216 (L2 256, L3 296, L4 336, L5 376, L6 416, L7 456), and each row's centre is its top + 20.
- **The app page** is the customer's app, drawn in the vector page grammar of the reference film. Its box is x 712 to 1200, y 184 to 664, with a 1 px `#5c6068` frame and 9 px titanium corner crosses. Its parts are below.
  - Top bar, y 184 to 240, with a 1 px rule at y 240. A 20 x 20 titanium logo square (no brand) sits at (736, 202). Three titanium nav bars, 6 px tall, sit at y 209 (x 776 w 48, x 840 w 56, x 912 w 44).
  - The language selector, right-anchored at x 1176, y 194 to 230. It has a 1 px `#5c6068` box, a 24 px label 16 px in from its left edge and a 16 px Heroicons solid `chevron-down` in titanium at x 1148. The box's left edge tracks its label's width.
  - Heading, 40 px Inter 500, white, at x 744 with a line box from y 272 to 320.
  - Two titanium summary bars, 8 px tall: (744, 336, w 280) and (744, 356, w 200).
  - Three stat cards, 128 x 88, with 1 px `#5c6068` frames, at x 744, 888 and 1032, y 392 to 480. Each holds two titanium bars.
  - The button: a white fill 48 px tall at (744, 528), with its 24 px Inter 500 label in ink `#070707` 20 px in from each side. Its width tracks its label.
- **Clearances:** headings keep at least 28 px clear of every drawing. The top plate in the isometric view reaches y 212 and the B4 connector lane runs at y 160. Both are clear of the heading's line box, which ends at y 131.

## 4. The palette and contrast

The ground is plain ink `#070707`, the kit's `--ink` and the brand's black. It has no smoke, dither, grain or texture. Seven colors carry the whole loop:

| Role | Color | Where |
| --- | --- | --- |
| Ground | `#070707` | everything behind |
| Raised ink | `#101010` | the tool panel's fill, the plates' side faces |
| White | `#ffffff` | headings, primary strings, connector-end crosses, the rims of lifted plates, the app's button fill, focus and marked boxes, carets |
| Titanium | `#8a8f98` | secondary text (code punctuation, `import`/`from`, `$`, `public/_gt/`, column headers, inactive options), doubled-line threads, the page's bars, corner crosses, drop lines |
| Hairline | `#5c6068` | panel and page frames, row rules, card frames, the base plate's rim |
| Accent | `#86a8ff` | what moves or matters, one thing at a time: the `T` and `<T>`/`</T>` tokens (B1), the pulses (B2, B3), the selector thumb (B4) |
| Accent fill | `#2f5ce0` | the Save button's draft state only, with white type on it |

Contrast was computed from WCAG relative luminance:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| White on `#070707` | 20.1 : 1 | text, AAA |
| White on `#101010` | 19.0 : 1 | text, AAA |
| `#86a8ff` on `#070707` | 8.7 : 1 | text and lines, AAA |
| `#86a8ff` on `#101010` | 8.2 : 1 | code tokens, AAA |
| `#2f5ce0` on `#070707` | 3.6 : 1 | fails as text (needs 4.5), passes the 3 : 1 non-text bar, so it is used only as a fill |
| White on `#2f5ce0` | 5.6 : 1 | the Save label, AA |
| Titanium `#8a8f98` on `#070707` | 6.2 : 1 | secondary text, AA |
| Titanium on `#101010` | 5.9 : 1 | secondary text in panels, AA |
| Hairline `#5c6068` on `#070707` | 3.2 : 1 | non-text structure, passes 3 : 1 |
| Hairline on `#101010` | 3.0 : 1 | non-text structure, passes 3 : 1 |
| Ink `#070707` on white | 20.1 : 1 | the app's button label |

`#86a8ff` is the accent because it reads on black. `#2f5ce0` stays under white type, as the brand uses it on paper.

## 5. The drawing grammar

### Kept from the Designing docs film

These come from `films/blog-designing-docs/lib/film.js`, its `index.html` and its STORYBOARD.md, and from frames watched every 0.5 s.

- **The vector interface drawing.** A UI is a page model: a 1 px frame, rules, bars for incidental copy and boxes for cards and controls. Readable text appears only where it carries the story (`page()` in film.js). Here that means the app's heading, button and selector.
- **Built panel by panel.** Rules draw out of their left end. Boxes draw out of their top-left corner, with the top and left edges first and then the right and bottom (power3.out). Rows enter in reading order.
- **The doubled line** (`doubled()` in film.js): one path stroked twice, the full gauge in titanium under a narrower core in the ground color, which carves two threads. At 1280 the gauge is 4 and the core 2, so each thread is 1 px, on integer coordinates. The MP4 gets 6 and 3. Routes are orthogonal: a horizontal stub, one vertical run and a horizontal run into the target. A connector draws out of its owner, the tool panel, with power3.out, and a white 9 px registration cross lands where it meets its target.
- **The pulse and the thumb** are a third copy of the path in the accent. It is drawn between the threads and the core, so it colors the threads along its length, and it is rewritten as a sub-path each frame (`poly().sub()`), never by a dash offset. Pulses run at one constant speed, like the reader's path.
- **The isometric exploded view and its flatten** (`matrixZ` in index.html). It uses the same 30 degree axonometric map: a 45 degree turn, a tan 30 squash and a √1.5 scale. One monotone progress curve with zero speed at both ends takes the page from flat to iso. Plates lift by Z times k, have side faces and drop lines to the base, and come down in order before the page turns flat and lands pixel for pixel on its flat rect.
- **The accordion diagram** becomes the `<LocaleSelector />` options drawn large in the tool panel, joined to the page's selector by a doubled line. A doubled-line rail runs down the options with a thumb that slides to the active row, like the reference's sidebar diagram.
- **Headings** are Inter 500 through `var(--font)`, tracking -0.035 em, line height 1.04, white and one line. Each rises 17 px with opacity (0.6 s, expo.out) and drops 12 px up with opacity (0.2 s, power2.in). Each holds at least (words / 3) + 1 s after it arrives.
- **Moving type.** Each localized string is one shaped text node with its own `lang`. The only layout property that animates is its container's width, as one tween per change (DESIGN.md section 8). Code lines move as whole lines when `<T>` is inserted.
- **Hard cuts.** Hard cuts change only the tool panel's contents. The app page never cuts.
- The film keeps the reference's own exclusions. There is no series frame, overlay, caption, byline, counter, URL or end card.

### Changed for this GIF

| Designing docs film | This GIF |
| --- | --- |
| Navy `#071124` page with blue gem smoke through a Bayer screen | Plain `#070707` with no texture |
| Inks of `#2f5ce0`, `#86a8ff`, white and smoke | White, titanium, hairline grey and raised ink, with `#86a8ff` as the one accent and `#2f5ce0` only under white type |
| Pieces enter, change and leave by tone, on a 3 px Bayer cell grid | Pieces draw out of their owner (lines and boxes), rise 6 px with opacity in 0.25 s (rows and labels), or type (code). No Bayer anywhere |
| Plate side faces dithered `#2f5ce0`, rims `#86a8ff`, dashed drop lines `#86a8ff` | Side faces flat `#101010`, rims 1 px (white when lifted, `#5c6068` at the base), drop lines titanium dashed 2 on 3 off |
| Doubled lines with `#86a8ff` threads on a navy core, white thumb and pulse | Titanium threads on an ink core, `#86a8ff` thumb and pulse |
| Moving type as a dissolve into 3 px cells | Moving type as a width tween with a crossfade, inside one text node per string |
| 112 to 144 px headings at 1920, two lines | 72 px at 1280 (108 at 1920), one line, so the product picture keeps the room it needs at GIF size |
| Narration, music bed, end card | None. The picture and four headings tell the story, and the loop closes on itself |

## 6. The type at 1280 x 720

Nothing on screen is under 24 px, so the 22 px floor is met everywhere. Inter is used only through `var(--font)` with the kit's `cv11`. Monospace, through `var(--mono)`, appears only inside the code, terminal and `<LocaleSelector />` artifacts.

| Element | Face, weight | Size at 1280 | At 1920 | Color |
| --- | --- | --- | --- | --- |
| Headings | Inter 500, tracking -0.035 em, optical size auto | 72 px | 108 px | white |
| App heading | Inter 500 | 40 px | 60 px | white |
| App button label | Inter 500 | 24 px | 36 px | `#070707` on white |
| Selector label | Inter 400 | 24 px | 36 px | white |
| Code, terminal, file tree, `<LocaleSelector />` | `var(--mono)` 400, 40 px rows | 24 px | 36 px | white, titanium, `#86a8ff` |
| Dashboard title, cells, Save | Inter 500 (title, Save), 400 (cells) | 24 px | 36 px | white |
| Dashboard column headers | Inter 400 | 24 px | 36 px | titanium |
| Locale tags es, fr, ja | Inter 500 | 24 px | 36 px | white |
| Selector options | Inter 400 | 28 px | 42 px | white when active, titanium otherwise |

Measured widths from InterVariable at weight 500, optical size 32, tracking -0.035 em:

- "You wrap your text in <T>" is 772 px.
- "One command translates your app" is 1026 px.
- "Your team reviews translations" is 912 px.
- "Your app is now multilingual" is 826 px.

From x 80, every heading ends by x 1106, inside the 1200 safe edge. In the app, "Welcome back" is 284 px at 40 px, おかえりなさい about 280 and "Hola de nuevo" 275, all inside the page's 424 px measure. At 24 px mono (0.6 em, 14.4 px a character), `  <button>Get started</button>` is 432 px, inside the panel's 456 px measure.

Japanese strings carry `lang="ja"` and render through `var(--font)`'s `system-ui` fallback, which is Hiragino Sans on this machine. No literal family name is written.

## 7. The storyboard

Times are in seconds. Every cue lands on a whole GIF frame (0.05 s). The eases are expo.out for heading rises, power2.in for drops, power3.out for draws and lifts, power2.inOut for slides and the selector's width, and linear for pulses.

### B1. 0.0 to 3.5: "You wrap your text in <T>"

- **Picture.** The tool panel holds the app's code. At frame 0, L1 is `<h1>Welcome back</h1>` and L2 is `<button>Get started</button>`, with no indent. The app page on the right is flat and in English: "Welcome back", "Get started" and "English".
- 0.0 to 0.4: Hold. This is the seam, and the heading has been standing since 15.8.
- 0.4 to 0.8: The two lines slide down to L4 and L5 and indent by two characters (29 px), power3.out. The insertion moves them as whole lines.
- 0.5 to 1.2: L1 types `import { T } from 'gt-next';` at 25 ms a character. `import` and `from` are titanium, `T` is `#86a8ff` and `'gt-next'` is white.
- 1.2 to 1.4: `<T>` types at L3 and `</T>` at L6, in `#86a8ff`. This is the beat's one accent. Brackets and slashes elsewhere are titanium, and tag names and text are white.
- 1.6 to 2.2: A doubled line draws from the `<h1>` row: (600, 356), (672, 356), (672, 296), (732, 296).
- 1.75 to 2.35: A second doubled line draws from the `<button>` row: (600, 396), (656, 396), (656, 552), (732, 552).
- As each connector arrives (2.2 and 2.35), its white cross lands. A 1 px white marked box then draws out of its top-left corner in 0.3 s around the target: the heading text, padded 8 px, and the button, padded 6 px.
- 2.65 to 3.3: Hold. 3.3 to 3.5: The heading drops.
- 3.5: Hard cut. The code, both connectors and the marked boxes go.

### B2. 3.5 to 7.5: "One command translates your app"

- **Picture.** The panel is a terminal. The app page turns isometric, and three language plates lift out of it as the CLI writes one file for each language.
- 3.5 to 4.1: The heading rises. At 3.5, L1 shows a titanium `$` and a white caret.
- 3.7 to 4.1: `npx gt translate` types at 25 ms a character.
- 4.2 to 4.5: A 1 px rule draws across the panel at y 312 out of its left end. At 4.3, `public/_gt/` rises in at L4 in titanium. This is the project's file tree, not CLI output.
- 4.3 to 4.45: On the page, the heading and button label crossfade into bars of their measured width. The heading becomes a white bar 12 px tall, and the button keeps its white fill with a 6 px ink bar inside. The page's corner crosses fade out.
- 4.3 to 5.2: The turn. One curve with zero speed at both ends takes the page from flat (k 1, centred at (956, 424)) to the iso map at k 0.55, centred at (956, 510). The base plate's diamond spans x 726 to 1186 and y 377 to 643. Its left vertex is the page's bottom-left corner, at (726, 510).
- The three plates, each 0.4 s after the last:

| Plate | Lift (Z × k) | Row rises (L5 to L7) | Plate lifts | Connector draws | Cross and tag land | `#86a8ff` pulse |
| --- | --- | --- | --- | --- | --- | --- |
| es | 165 | 5.2 | 5.2 to 5.7 | 5.4 to 5.75 | 5.75 | 5.75 to 6.05 |
| fr | 110 | 5.6 | 5.6 to 6.1 | 5.8 to 6.15 | 6.15 | 6.15 to 6.45 |
| ja | 55 | 6.0 | 6.0 to 6.5 | 6.2 to 6.55 | 6.55 | 6.55 to 6.85 |

- Each row is `  es.json`, `  fr.json` or `  ja.json`, in white. Each plate is a copy of the page model and lifts with power3.out. Its rim is white and its titanium dashed drop lines draw down to the base. Plates are painted base first, then ja, fr and es.
- Connector routes, all with orthogonal runs:
  - es: (600, 396), (640, 396), (640, 345), (726, 345).
  - fr: (600, 436), (656, 436), (656, 400), (726, 400).
  - ja: (600, 476), (672, 476), (672, 455), (726, 455).
- The routes never cross. Each tag sits 8 px above its final run at x 690.
- Each plate's heading bar and button bar take the width of that language's string. The pulses run one at a time, so only one accent is ever lit.
- 6.85 to 7.3: Hold. 7.3 to 7.5: The heading drops.
- 7.5: Hard cut. The terminal and its three connectors go. The plates and their tags stay.

### B3. 7.5 to 11.0: "Your team reviews translations"

- **Picture.** The panel is the Dashboard's Translations page.
  - Top bar, y 184 to 240: the white doubled-line GT mark (`kit/brand/gt-mark.svg`, 22 px tall) at x 112, "Translations" at x 160, and a locale tag `es` in a 1 px box at the right.
  - Header row, y 240 to 288: "Source" at x 112 and "Translation" at x 352, both in titanium.
  - Row 1, y 288 to 344: "Welcome back" and "Hola de nuevo".
  - Row 2, y 344 to 400: "Get started" and "Comenzar ahora".
  - Row rules at y 288, 344 and 400. A "Save" button with a 1 px white outline, 88 x 44, at the panel's bottom right, (488, 600).
- 7.5 to 8.1: The heading rises.
- 7.55 to 7.95: The header row and both rows rise in reading order (6 px, 0.25 s, 70 ms apart). Each row's rule draws out of its left end.
- 8.3 to 8.6: A 1 px white focus box draws out of the top-left corner of the "Comenzar ahora" cell. At 8.6 a white 2 px caret appears after "ahora".
- 8.8 to 9.1: " ahora" deletes one character a frame (50 ms), leaving "Comenzar". It is one text node, and its cell keeps its width.
- 9.3: Save fills `#2f5ce0` and its label stays white. This is the draft state ("Edits are drafts until you click Save").
- 9.7 to 9.8: Save is pressed. The fill steps to `#86a8ff` for two frames, then returns to the outline at 9.8. The caret goes and the focus box draws back into its corner (9.8 to 10.0).
- 9.9 to 10.25: A doubled line draws from row 2 to the es plate: (600, 372), (624, 372), (624, 345), (726, 345).
- 10.25: The cross lands. 10.25 to 10.55: The pulse runs.
- 10.55 to 10.8: The es plate's button bar shortens to the width of "Comenzar", power2.inOut.
- 10.8 to 11.0: The heading drops.
- 11.0: Hard cut. The Dashboard and its connector go.

### B4. 11.0 to 16.0: "Your app is now multilingual"

- **Picture.** The panel shows `<LocaleSelector />` drawn large.
  - L1 is the code `<LocaleSelector />`, with the name in white and the brackets in titanium, over a rule at y 264.
  - The four options are English, Español, Français and 日本語, at 28 px, with row tops at y 288, 352, 416 and 480 and labels at x 152.
  - A doubled-line rail runs down at x 128 from y 288 to 524, and a `#86a8ff` thumb, a 40 px sub-path, marks the active option.
  - The page flattens and changes language with the thumb.
- 11.0 to 11.6: The heading rises.
- The flatten, from 11.0 to 11.9:
  - The tags fade out (0.15 s) as their plates start down.
  - es comes down from 11.0 to 11.4, fr from 11.1 to 11.5 and ja from 11.2 to 11.6, power2.inOut, while the drop lines draw back.
  - The page turns flat from 11.4 to 11.9 (zero speed at both ends) and lands pixel for pixel on its flat rect.
  - 11.9 to 12.05: The bars crossfade back into "Welcome back" and "Get started", and the corner crosses land.
- 11.1 to 11.6: The options rise in reading order (0.25 s, 80 ms apart). The rail draws down from 11.2 to 11.6. At 11.6 the thumb lands on English.
- 11.7 to 12.1: A doubled line draws from the `<LocaleSelector />` row along the lane above the page: (600, 236), (640, 236), (640, 160), (1150, 160), (1150, 194). Its cross lands at 12.1 on the selector's fixed right side.
- The cycle. Each thumb move is power2.inOut. On each arrival the page changes language: the heading, the button and the selector label each crossfade (the old string fades out over 0.12 s, the new one fades in and rises 4 px) while their boxes tween to the new width (0.3 s, power2.inOut). The active option turns white and the others turn titanium.

| Thumb move | Page changes | Heading | Button | Selector |
| --- | --- | --- | --- | --- |
| 12.2 to 12.55, to Español | 12.55 to 12.85 | Hola de nuevo | Comenzar, the edited string from B3 | Español |
| 12.95 to 13.3, to Français | 13.3 to 13.6 | Bon retour | Commencer | Français |
| 13.7 to 14.05, to 日本語 | 14.05 to 14.35 | おかえりなさい | 始める | 日本語 |
| 14.6 to 15.0, up three rows to English | 15.0 to 15.3 | Welcome back | Get started | English |

- 15.0 to 15.2: The heading drops. It has held 3.4 s against a 2.67 s floor.
- 15.2: Hard cut. The panel returns to the frame 0 code (L1 `<h1>Welcome back</h1>` and L2 `<button>Get started</button>`, no `<T>`), and the list and its connector go.
- 15.2 to 15.8: Heading 1 rises.
- 15.8 to 16.0: Hold, identical to frame 0.

### Heading holds

Each heading's hold, measured from its arrival, against its floor of (words / 3) + 1 s:

| Heading | Hold | Floor |
| --- | --- | --- |
| 1, "You wrap your text in <T>" | 3.5 s (15.8 to 3.3) | 3.0 s |
| 2, "One command translates your app" | 3.2 s | 2.67 s |
| 3, "Your team reviews translations" | 2.7 s | 2.33 s |
| 4, "Your app is now multilingual" | 3.4 s | 2.67 s |

### The loop point

- Frame 0 (t 0.0) and the last frame (t 15.95, GIF frame 319) are the same picture. That picture is heading 1 standing, the panel showing the two unwrapped code lines, and the page flat in English with the selector on English. There are no connectors, plates or tags.
- Everything is at rest from 15.8. The page's last change finishes at 15.3, the cut is at 15.2 and heading 1 arrives at 15.8. Nothing moves until 0.4. So the seam falls inside a 0.6 s still, and both encodes repeat with no visible jump.

### Accent check

Only one accented thing is lit at any time:

| Beat | Accent | When |
| --- | --- | --- |
| B1 | `T`, `<T>` and `</T>` | from 0.5 |
| B2 | pulses, in sequence | 5.75 to 6.85 |
| B3 | Save | 9.3 to 9.8 |
| B3 | pulse | 10.25 to 10.55 |
| B4 | thumb | 11.6 to 15.2 |

Frame 0 has no accent. The B1 tokens leave at the 3.5 cut, before any pulse. The B4 thumb leaves at the 15.2 cut.

## 8. Build notes for the composer

- Write two thin root files that build one scene module, `lib/scene.js`, on a 1280 x 720 `#stage`:
  - `index.html`: 1920 x 1080 at 60 fps. `#stage` has `transform: scale(1.5)` with its origin at 0 0.
  - `gif.html`: 1280 x 720 at 20 fps, at scale 1.
- Both files use `data-duration` 16. Render the GIF frames at their native size, so 1 px hairlines, 1 px doubled-line threads and 24 px text rasterize at the GIF's own pixel. HyperFrames' `--resolution` can't do this, because it only takes integer scales.
- All drawing is SVG and HTML on one paused GSAP timeline, written from the timeline's onUpdate with film time. There is no canvas, wall clock or randomness. The iso map, sub-path pulses and crosses can follow film.js (`doubled`, `poly`, `cross`) and the `matrixZ` and `camera` functions in the reference's index.html. The dither code is not used.
- Fonts come from `kit/tokens.css`: `var(--font)` and `var(--mono)`. Each translated string has its own `lang`, and `ja` for Japanese. Strings are measured from a hidden probe in their own language for the width tweens.
- `npx -y hyperframes@0.8.106 check .` must pass with 0 errors.

## 9. The encoding plan

### The GIF (1280 x 720, 20 fps, under 8 MB)

```
npx -y hyperframes@0.8.106 render . -c gif.html --format png-sequence --fps 20 --workers 3 -o renders/gif-frames
ffmpeg -y -framerate 20 -i renders/gif-frames/<pattern> \
  -vf "palettegen=max_colors=64:stats_mode=full:reserve_transparent=0" renders/palette.png
ffmpeg -y -framerate 20 -i renders/gif-frames/<pattern> -i renders/palette.png \
  -lavfi "[0:v][1:v]paletteuse=dither=none:diff_mode=rectangle" -loop 0 ../../out/gif-how-gt-works.gif
```

- **20 fps.** It is the only rate from 15 to 20 that GIF stores exactly (5 cs a frame). 15 fps would alternate 6 and 7 cs delays and jitter the constant-speed pulses. 16 s at 20 fps is 320 frames, from t 0.00 to 15.95.
- **No dither.** The art is flat fills on one ground. Its in-between colors are antialias edges against `#070707` and uniform-opacity fades (headings, rows, crossfades), and each of those quantizes cleanly to a palette ramp. Bayer would put back a screen texture on exactly the edges and fades Kevin asked to keep plain, and its patterns defeat LZW, so the file would be larger. Fall back to `dither=bayer:bayer_scale=5` only if a heading fade bands visibly.
- **Palette.** Seven inks plus their antialias ramps, so 64 colors at most and usually fewer. After the first encode, check that the seven base colors come through within ΔE 2. If palettegen moves them, build the palette by script instead: the seven inks plus ramps from the ground to white, titanium, hairline, `#86a8ff` and `#2f5ce0`, white over `#2f5ce0`, and ink over white.
- **Size.** `diff_mode=rectangle` and ffmpeg's default transparent-difference frames make every still frame almost free. The large redraws are the iso turn and the flatten (about 18 frames each, inside 520 x 480), the four cuts and the heading changes. The estimate is 3 to 5 MB. If the file is over 8 MB, first set `max_colors=32`, then `stats_mode=diff`. The frame size and fps stay fixed.

### The MP4 (1920 x 1080, 60 fps, H.264, faststart, silent)

```
npx -y hyperframes@0.8.106 render . --quality delivery --fps 60 --workers 3 -o renders/master.mp4
ffmpeg -y -i renders/master.mp4 -map 0:v:0 -c copy -an -movflags +faststart ../../out/gif-how-gt-works.mp4
```

### Checks before delivery

- The GIF has 320 frames, loop 0, under 8,000,000 bytes, and 1280 x 720.
- The MP4 has 960 frames, 1920 x 1080, 60 fps, yuv420p H.264, no audio stream, and its moov atom before mdat.
- `ffmpeg -lavfi psnr` between rendered frame 0 and frame 319 (GIF) and frame 959 (MP4) shows identical frames, so the seam has no jump.
- Contact sheets every 0.5 s at 1280 confirm the following:
  - No text is under 24 px and every string is legible.
  - Japanese renders in a real Japanese face, not as tofu.
  - Headings are at least 28 px clear of the drawings.
  - Only one accent is lit at a time.
  - Text is not clipped by the selector or button width tweens.

## 10. Open questions for Kevin

1. GT's name appears only as the GT mark in the Dashboard (B3) and in `gt-next` and `npx gt translate`. Should a 2 s "General Translation" lockup be added? If so, it could sit just before the seam as a still, which would take the loop to about 18 s.
2. Locadex is left out. GT's intro says it "internationalizes your code and translates your content continuously. Just merge a pull request." A fifth beat showing it would push the loop past 18 s, unless it replaced the review beat.
3. Frame 0 shows the code before `<T>` is added, so a still preview of the GIF shows the unwrapped code. Should frame 0 be the wrapped state instead? The insertion would then move to the end of the loop, and the last second would get busier.
4. The ground is the brand's ink `#070707` rather than `#000000`. The two can't be told apart on screen. Should it be pure black anyway?
5. The review edit shortens GT's own Spanish "Comenzar ahora" to "Comenzar". Is that the right edit to show, or would a different one be better?
6. OpenAI for Startups gave no specs. Do they have a width, file size or fps limit? Some listing pages cap GIFs at 5 MB or 800 px wide.
