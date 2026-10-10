# Type: the correct Inter in detail

This file backs section 4 of `gt-brand`. It records the font file and how to verify it, the bindings on each surface, the tokens, the measurements behind the rules, the type lint and the gotchas. The measurements come from the type audit of 2026-10-05 on the Prototemplate dev server (Chrome for Testing through playwright-core, dark theme, 1440 and 390 wide, after `document.fonts.ready`). Paths are relative to `$PROTOTEMPLATE` unless they name `$GT_CLOUD`.

## The file

| file | sha1 | contents |
| --- | --- | --- |
| `public/fonts/InterVariable.woff2` | `f55b18fdf5a4fbca23e23010fbe89df27d70d1ff` | roman, 352,240 bytes |
| `public/fonts/InterVariable-Italic.woff2` | `a5f0513ed76cdf4a4e1a924949b6a85a6e9333ca` | italic, 387,976 bytes |

- The family name inside both files is "Inter Variable" (the italic's subfamily is Italic, full name "Inter Variable Italic"), version string `Version 4.001;git-9221beed3`, the rsms.me 4.1 release.
- Axes: `opsz` 14 to 32 (default 14) and `wght` 100 to 900 (default 400).
- Features include `calt`, `case`, `cv01` to `cv14`, `ss01` to `ss08`, `tnum`, `zero`, `frac`, `sups` and `subs`.
- Cap height is 1490 of 2048 units, 0.728em.
- `$GT_CLOUD/apps/landing/public/fonts/` holds the same two files byte for byte, and `deck/fonts/deck-fonts.css` inlines the same roman as a data URI.

Verify a checkout or a copy:

```sh
shasum public/fonts/InterVariable*.woff2
node -e "const f=require('fontkit').openSync('public/fonts/InterVariable.woff2'); console.log(f.familyName, f.version, f.variationAxes)"
# the deck's inlined roman decodes to the same bytes
sed -E 's/.*base64,([A-Za-z0-9+/=]+).*/\1/' deck/fonts/deck-fonts.css | base64 -d | shasum
```

In a page, `getComputedStyle(document.body).getPropertyValue('--font-inter')` starts with `"ptInter"` on Prototemplate. Through the Chrome DevTools Protocol, `CSS.getPlatformFontsForNode` names the instance Chrome rasterised: `InterVariable_opsz200000_wght1F40000` is opsz 32 at weight 500, because both values are 16.16 fixed point (0x200000 / 0x10000 = 32, 0x1F40000 / 0x10000 = 500). A run that reports any other family is a defect unless the exceptions below name it.

## The bindings on each surface

| surface | file | binding | notes |
| --- | --- | --- | --- |
| Prototemplate site and shell | `src/lib/fonts.ts` | `ptInter`, the roman's latin subset only, on `--font-inter`; the other subsets and the italic are `@font-face` rules with a `unicode-range` in the `ptInter` family in `src/app/inter-subsets.css` (`scripts/build/subset-inter.py`), so no route preloads them | `fontVariables` is the class on `<html>` in `src/app/layout.tsx` |
| Prototemplate nameplate | `src/lib/brand-fonts.ts` | `fraunces` (600) and `grotesk` (500) on `--font-fraunces`, `--font-grotesk` | the one place chrome steps outside Inter (DESIGN.md section 15) |
| The brand deck | `deck/fonts/deck-fonts.css`, inlined by `scripts/build/deck.mjs` in place of `<!--FONTS-->` | `@font-face { font-family: 'Inter' }`, roman only | a data URI cannot fail, so it always hides an installed Inter; no italic is inlined, so an italic in the deck would be synthesised |
| gt-cloud landing | `$GT_CLOUD/apps/landing/src/lib/fonts.ts` | `inter`, roman only, on `--font-sans`; `mono` is Geist Mono on `--font-mono` | the base module stays roman so the 388 KB italic is not preloaded on every route |
| gt-cloud docs and blog | `$GT_CLOUD/apps/landing/src/lib/fonts-prose.ts` | `interProse`, roman and italic, on `--font-sans` | next/font preloads every face a module declares on every page that imports the module, so faces are grouped by the routes that pay for them |

**The identifier is the family name.** next/font under Turbopack names the family after the JavaScript identifier: the binding `inter` produces `font-family: inter` and `--font-inter: "inter", "inter Fallback"` (the landing's built CSS reads `--font-sans:"inter", "inter Fallback"`). CSS family names are case-insensitive, so `inter` is the same name as an installed "Inter". The audit measured both cases with an injected `@font-face` named after an installed family:

- while the web font loads, it hides the installed family at every weight;
- when its URL fails, the installed family takes the name back, and the metric-matched `inter Fallback` never engages.

On a designer's machine with desktop Inter 3 installed, a failed woff2 therefore renders Inter 3, with no opsz axis and different metrics. Bind the files to an identifier no installed font carries (`ptInter`). The same collision happens among the `/d/` directions: eight of them declare `const display = localFont(...)`, and Turbopack gives every one the family `display`, so a client-side navigation can swap one direction's face for another's.

## The tokens (Prototemplate shell)

`src/components/viewer/tokens.css`, the first `:root` block (the two face tokens sit on `.pt-faces`, because the nameplate's next/font classes sit on the elements that use them and a custom property resolves where it is declared):

| token | value | use |
| --- | --- | --- |
| `--pt-text` | `var(--font-inter), system-ui, sans-serif` | every element |
| `--pt-display` | `var(--pt-text)` | h1, h2 and display sentences |
| `--pt-mono` | `ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | code, numbers and tokens only |
| `--pt-text-hant`, `--pt-text-hans`, `--pt-text-ja`, `--pt-text-he` | the Inter variable, then that script's faces | Traditional and Simplified Chinese, Japanese, Hebrew |
| `--pt-face-serif`, `--pt-face-grot` | Fraunces and Space Grotesk stacks | the nameplate and the gallery's grotesk labels only |
| `--pt-ff-text` | `'liga' 1, 'calt' 1` | every element |
| `--pt-ff-display` | `'liga' 1, 'calt' 1, 'cv11' 1, 'ss01' 1` | h1, h2 and display sentences |
| `--pt-w-text`, `--pt-w-label`, `--pt-w-display`, `--pt-w-strong` | 400, 500, 500, 500 | weights |
| `--pt-d1`, `--pt-d2`, `--pt-d3` | 44px/1.04/-0.025em, 32px/1.05/-0.025em, 24px/1.25/-0.02em | page title, section title, h2 in prose |
| `--pt-t-title`, `--pt-t-lead`, `--pt-t-body`, `--pt-t-small`, `--pt-t-meta`, `--pt-t-group` | 18/1.35, 17/1.55, 16/1.6, 14/1.55, 13/1.5, 12.5 | the text ladder |
| `--pt-track-label`, `--pt-track-group` | -0.01em, -0.005em | weight 500 at 13 to 18px, and at 12 to 12.5px |
| `--pt-measure`, `--pt-measure-lead` | 32em, 30em | body and lead measure |

Under 900px the display steps drop to d1 32px, d2 26px at 1.15 and d3 21px. The base rules in the same file set the family, the text features, `font-optical-sizing: auto` and weight 400 on the shell's roots (`.pt-viewer`, `.pt-search`, `.pt-panel`, `.pt-help`, `.pt-preview`, `.pt-corner`, `.pt-toast`, `.pt-root`, `.blog-root`), the display features, weight 500 and balanced wrap on `h1` and `h2`, weight 500 and balanced wrap on `h3` and `h4`, weight 500 on `b` and `strong`, and the mono stack on `code`, `pre` and `samp`. `kbd` stays Inter, because the search key chip and the help card's keys are labels. The base sits on the shell's roots and never on `html`, so the `/d/` directions keep their own type.

gt-cloud's tokens: `--font-sans` and `--font-mono` from the landing's `fonts.ts`; on the dashboard's plate pages, `$GT_CLOUD/apps/dashboard/src/app/brand-tokens.css` caps `h1` to `h4`, `b`, `strong`, `.font-semibold` and `.font-bold` at 500 and sets the ladder classes (`.typo-page-heading` 30px/1.08 at -0.025em with `cv11` and `ss01`; `.typo-lede` 15px/1.55 in ink-2; `.typo-key` 13px/1.45 at weight 500 in titanium; `.typo-caption` 13px/1.45 at +0.01em).

## Optical size

`font-optical-sizing: auto` computes on every element by default, and the browser sets opsz to the font size in CSS px, clamped to the axis. The audit found the rendered opsz equal to `clamp(font-size, 14, 32)` for every run.

Width of "General Translation Motion brand" at weight 500, in px:

| size | auto | opsz pinned 14 | opsz pinned 32 |
| --- | --- | --- | --- |
| 14px | 223.03 | 223.03 | 205.67 |
| 24px | 365.80 | 382.34 | 352.56 |
| 32px | 470.09 | 509.80 | 470.09 |
| 44px | 646.38 | 700.97 | 646.38 |

- From 32px the Display design is in effect. At 21 to 27px the axis gives the intermediate instances, which is how it is built.
- The axis narrows glyphs and spacing together: about -0.004em a character at 16px, -0.022em at 24px and -0.039em from 32px.
- rsms.me no longer serves the Inter 3 Dynamic Metrics page (`tracking = -0.0223 + 0.185 * e^(-0.1745 * z)`); the URL answers "This page used to exist, but is no longer". In Inter 4 the opsz axis carries size-dependent spacing, and the Display design at 32px is already tighter than that formula's -0.0216em.
- Never write `font-variation-settings`. It pins opsz and wght for the element and everything it inherits to, and the auto mapping stops. Never write `font-optical-sizing: none`.

## Features

- `cv11` is the single-storey a and `ss01` the open digits. They go on display sizes only, as the deck sets them on `h1, h2, .big` (`deck/parts/head.html:62`). Labels, numerals, h3 and contents links take the text list. A current sidebar row and its neighbours must draw the same a, so a state change alters weight or color and never letterforms.
- **Chrome drops `calt` under letter-spacing.** Measured at 44px weight 500 on `a -> b => c 10:30 A-B`: untracked 399.94px; untracked with `calt` off 421.64px; tracked -0.025em 398.55px; tracked with `calt` off 398.55px (identical, so tracking already turned it off); tracked with `'calt' 1, 'liga' 1` 380.81px. Without the explicit list a tracked heading loses the `->` arrow, the colon centred between digits, the hyphen raised between capitals and parentheses fitted to capitals. rsms.me's own CSS writes `font-feature-settings: 'liga' 1, 'calt' 1; /* fix for Chrome */`.
- `font-feature-settings` is one property, and a rule that sets it replaces the inherited list. Every element therefore reads one of the two tokens, and a rule that needs figures adds `font-variant-numeric: tabular-nums`, which composes with the tokens.
- The deck still writes `'cv11', 'ss01'` without `liga` and `calt` on its headings (`head.html:62`), so its tracked headings lose `calt`, and its stacks still name `'Inter', 'Helvetica Neue', Arial`. `head.html` is edited only on instruction (`deck/DECK-GRAMMAR.md`), so both fixes wait for the deck's owner; the type audit of 2026-10-05 names the missing `calt` as the deck's only type defect.

## Tracking, in full

| role | size and weight | deck | Prototemplate shell | gt-cloud |
| --- | --- | --- | --- | --- |
| slide h1, `.big`, h2 | 88, 72, 44px at 500 | -0.025em | | |
| page title | 44px at 500 (32 under 900px) | `.book-head h1` -0.025em | `--pt-d1-track` -0.025em | `.typo-page-heading` 30px -0.025em |
| section title | 32px at 500 | `.book-sec h2` -0.025em | `--pt-d2-track` -0.025em | |
| specimen and figures | 58px, 24px at 500 | `.spec .w`, `.page .pn b` -0.02em | `--pt-d3-track` -0.02em (24px heads) | credit figure 44px -0.022em |
| display quotes and ladder rows | 27 to 34px at 500 | `.say .q`, slide 12's `.ex .q`, `.ladder` -0.015em | | section headings -0.016em in Kevin's 2026-09-25 dashboard round; not on origin/main on 2026-10-05 |
| row keys, display lists, diagram labels, contents links, deck title | 13.5 to 34px at 500 | `.rows b` 20px, `.plain` 24px, `.lang` 34px, `svg .lab` 26px, `.book-toc a` 14px, `.sb-head b` 13.5px, all -0.01em | `--pt-track-label` -0.01em | |
| buttons and form labels | 13.5 to 14px | | | `[data-slot=button]`, `[data-slot=label]` -0.006em |
| group labels | 12 to 12.5px at 500 | `.sec-label` -0.005em | `--pt-track-group` -0.005em | |
| running text | any size at 400 | 0 | 0 | 0 |
| keys in a key/value list | 13px at 500 | | | `.typo-key` 0 |
| captions | 13px | | 0 | `.typo-caption` +0.01em |
| counters | 13px | `.counter` +0.02em | 0 | |

Kevin's dashboard verdict of 2026-09-25 ("kerning needs to be adjusted") was traced to one flat -0.028em tracking at every size. Tracking follows the role and the size, from this table.

## Ladders

- **The deck sheet** (`deck/parts/head.html:62-69`, `deck/DECK-GRAMMAR.md`): h1 88/1.02, `.big` 72/1.06, h2 44/1.1, lead 26/1.45, p 22/1.5, `.rows` 20, caption 15/1.45 in titanium. SVG labels are 20px in ink-2 or 26px in ink, and never under 18px. Text under 15px on the 1600 by 900 sheet is a defect.
- **The deck's book view** (`head.html:279-293`): head h1 44/1.04, head lead 15.5/1.5, section h2 32/1.05, contents links 14 at 500, page numerals 24 at 500, gutter notes 12.5/1.5 in titanium.
- **The site ladder** (deck slide 29, DESIGN.md section 12): hero 3.7rem on desktop and 2.5rem under 720px, heading 2.25rem/1.18, subheading 1.375rem/1.3, title 1.125rem/1.35, lead 17px/1.55, body 16px/1.6, small 14px/1.55, label 13px. On the landing every consumer reads `var(--tcm-X, <px fallback>)` with the slot's value as the fallback.
- **The Prototemplate shell**: the token table above.

## Measure

- Kevin's measure is 60 to 70 characters a line. Inter averages about 0.45em a character in prose, so 30em gives about 66 characters of a 17px lead. The body's 32em (512px at 16px) measured 61 to 71 characters a line in the `/brand` prose on 2026-10-05.
- `ch` is the width of the zero, which is about 0.63em in Inter. The old book head's `max-width: 62ch` came to 662px at 17px, 83 to 86 characters a line. Set measures in em.
- A head's lead reads in two or three lines. On 2026-10-05 the `/motion` lead ran seven lines at 1440 and fourteen at 390 before its meta table, which is the case Kevin flagged.

## Scripts

- Inter covers Latin, Greek and Cyrillic. Other scripts need a face of their own:
  - the deck: `--cjk` (Hiragino Sans, Noto Sans CJK JP, PingFang SC, Apple SD Gothic Neo, Noto Sans KR), `--arabic` (Noto Naskh Arabic, Geeza Pro, Noto Sans Arabic) and `--indic` (Noto Sans Devanagari, Kohinoor Devanagari, Devanagari Sangam MN), applied by class with no Inter in front (`.lang .ja`, `.lang .ar`, `.lang .hi`);
  - the shell: `--pt-text-hant`, `--pt-text-hans`, `--pt-text-ja` and `--pt-text-he`, applied by `:lang()` (`src/app/motion/motion.css`).
- **The Arial fallback catches Hebrew and Arabic.** next/font's fallback face for the binding (`ptInter Fallback` in Prototemplate, `inter Fallback` on the landing) is `local("Arial")` with `size-adjust: 107.89%`. Arial has Hebrew and Arabic, so in any stack that starts with the Inter variable those scripts render in Arial, and a script face listed later never sees them. On `/motion`, Hebrew renders in Arial by design, and `motion.css` says so. CJK and Devanagari are absent from Arial and reach the listed faces.
- Check every layout with CJK, Arabic and Devanagari samples (deck slide 28 sets the thesis in eight languages).

## The type lint

`scripts/lint/type.mjs` holds this file's rules in Prototemplate. `gt-lints` owns its full rule table (T1 to T9, ratchets R1 to R3), its usage, its exit codes and its wiring status; the header comment of the script is the authority over both skills. Its static mode reads `src/**/*.{css,ts,tsx}` minus a named allowlist and fails on: a family outside the type tokens; a bare Inter, InterVariable, Inter var, Inter Display or Lausanne family; a next/font binding other than `ptInter` in `src/lib/fonts.ts`; a `localFont` call outside `src/lib/fonts.ts` and `src/lib/brand-fonts.ts` without `preload: false`; a feature list outside `--pt-ff-text` and `--pt-ff-display`; any `font-variation-settings` or `font-optical-sizing: none`; a weight above 500 outside the nameplate and the specimens; an h1 or h2 rule that sets its metrics without the `--pt-d*` tokens or sets its family or features; positive tracking on Inter; and mono on a selector whose text is not code, a number, a path, a hex value or a locale code. The escape hatch is `/* lint-type: allow <reason> */` on the declaration's line or the line above it, and an empty reason fails.

Its `--live` mode (`pnpm lint:type:live`) drives Chrome over CDP on the dev server, reads every visible text group at 1440 and 390, and fails on a Latin run rendered in another face (L1), features that do not match the element's role (L2), positive tracking or a display size off the ladder (L3), an optical size that does not follow the size (L4), a weight above 500 (L5), an unbalanced heading (L6) and tracking without `calt` (L7). It warns when a head's lead runs past three lines or 75 characters a line (L8). `pnpm build` runs the static mode and `pnpm lint:all` runs both modes and `pnpm test:type`. `scripts/lint/type.baseline.json` holds the ratchet's per-file counts; a file may only lower its count. For a single element, `CSS.getPlatformFontsForNode` still names the face Chrome drew (section "The file").

In gt-cloud the gt-ui oxlint plugin holds the type rules (`$GT_CLOUD/tooling/oxlint-plugins/gt-ui.ts`, configured in `$GT_CLOUD/.oxlintrc.json`): `inter-only` (next/font/google faces other than Geist Mono, `localFont` files other than the Inter builds, font classes and inline families outside the site type), `mono-is-not-voice` (a heading or paragraph in mono), `no-thin-font` (`font-light`, `font-thin` and inline `fontWeight` values under 400) and `typed-text-var`. Prototemplate's `pnpm lint:code` runs a copy of the plugin taken on 2026-09-28 (`scripts/lint/oxlint-plugins/gt-ui.ts`, a few lines behind gt-cloud's), with thirteen rules switched on in `.oxlintrc.json`; `no-thin-font` is not among them, so the type lint covers weights there.

## Exceptions

| exception | where | why |
| --- | --- | --- |
| Fraunces 600 and Space Grotesk 500 | the nameplate `span.pt-brand-word` (`.pt-face-serif`, `.pt-face-grot`), loaded by `src/lib/brand-fonts.ts` | Kevin asked for the old nameplate back (DESIGN.md section 15); they set `font-feature-settings: normal` so the Inter features never reach them |
| Space Grotesk labels and mono numerals on `/` | `.pt-line.is-h i`, `.pt-src-spec`, `.pt-funnel-t`, `.aw-chip`, `.sl-cap-name`, `.sl-fig-label`, `.sl-fig-word`; `.pt-row-label`, `.sl-law-n`, `.pt-funnel-n` | DESIGN.md section 4: the Prototemplate chrome, which BRAND.md section 6 keeps apart from the product brand |
| mono tokens | hex values (`.ptb-swatch span`), locale codes (`.ptb-pill`), code names, paths | they are code artifacts |
| the `/d/` directions | `src/app/d/**` | self-contained explorations with their own faces |
| specimens | deck slide 27 and `.ptb-display` on `/brand` | they show the weights 300 to 800 on purpose |
| the presenter | `src/app/present/**`, with `src/app/present/fonts.ts` loading Sora and Instrument Sans for the intro lockup | its type beats set other faces beside the right Inter on purpose; the lint skips the folder |
| speed mark faces | `public/fonts/google/` (Michroma, Orbitron, Anybody) | converted to outlines at build time; no page loads them |

A new exception goes into DESIGN.md section 15 or the lint allowlist with its reason, in the same change.

## Gotchas

- A bare `'Inter'` in a stack is a second binding that only works while the web font loads. Remove it.
- `'Helvetica Neue', Arial` after the Inter variable never render; next/font's fallback face is already Arial with adjusted metrics.
- `b` and `strong` compute 700 through the browser's `bolder` unless a rule sets 500. The brand book's section numerals rendered at wght 700 for that reason.
- A weight-600 heading slips in through ports of older pages (the blog port's `.blog-root h1` and its card and body headings ran at 600 in the 2026-10-05 audit). Port the content and use the system's tokens.
- A feature list on a label makes it draw a different a from the row beside it. Labels take the text list.
- `text-wrap: balance` belongs on h1 to h3; without it a two-line heading leaves one word on the second line.
- Positive tracking on 11px uppercase labels is the eyebrow pattern Kevin rejected. Delete the label.
- The deck's italic is synthesised, because only the roman is inlined. Use no italic in the deck.
- A subset without glyph names (pyftsubset's default, a format 3 `post` table) rasterises a shade differently in Chrome on macOS, at every weight. `scripts/build/subset-inter.py` keeps the names (`glyph_names`), and its subsets match the full file pixel for pixel.

## The rules of SKILL.md section 4 in full

These blocks stood in `SKILL.md` section 4 until 2026-10-10 and moved here unchanged to keep the body under its budget; `SKILL.md` keeps a one-line summary of each.

**The binding.**

- Prototemplate binds the roman's latin subset as `ptInter` in `src/lib/fonts.ts`, on `--font-inter`, and declares the other subsets and the italic as plain `@font-face` rules with a `unicode-range` in the same `ptInter` family in `src/app/inter-subsets.css`, which `scripts/build/subset-inter.py` writes. So every route preloads the roman latin subset, and a browser fetches any other subset only where the page draws a code point in its range.
- next/font names the family after the JavaScript identifier, and CSS family names are case-insensitive. A binding named `inter` therefore shares its name with an installed Inter. If the woff2 fails to load, that installed Inter renders (desktop Inter 3, for example, which has no opsz axis), and the metric-matched fallback never engages.
- gt-cloud's landing still binds `inter` on `--font-sans`, and its built CSS reads `"inter", "inter Fallback"`, so it carries the same exposure.

**The stack** is `var(--font-inter), system-ui, sans-serif` (the shell's `--pt-text`). next/font's fallback face is already a metric-matched local Arial, so `'Helvetica Neue', Arial` after the variable add nothing.

**Tracking.** Tracking tightens with size and weight, and weight 400 text is never tracked.

| role | tracking | where it is set |
| --- | --- | --- |
| page titles, section titles and slide headings, 32px and up, weight 500 | -0.025em | deck `head.html:62`; shell `--pt-d1-track`, `--pt-d2-track`; dashboard `.typo-page-heading` (30px) |
| figures and 24px headings | -0.02em | deck `.page .pn b`, `.spec .w`; shell `--pt-d3-track` |
| display quotes at 27 to 34px, weight 500 | -0.015em | deck `.say .q` (34px), slide 12's `.ex .q` (27px), the `.ladder` specimen rows |
| labels at weight 500, 13 to 20px | -0.01em | deck `.rows b`, `.book-toc a`; shell `--pt-track-label` |
| group labels at weight 500, 12 to 12.5px | -0.005em | deck `.sec-label`; shell `--pt-track-group` |
| running text at weight 400 | 0 | everywhere |
| 13px captions | +0.01em in gt-cloud (`.typo-caption`); 0 in the Prototemplate shell | |
| 13px counters | +0.02em in the deck (`.counter`); 0 in the Prototemplate shell | |

The Prototemplate shell tracks nothing positive, and its type lint fails any positive value on Inter. rsms.me no longer serves Inter 3's Dynamic Metrics page (rsms.me/inter/dynmetrics answers "This page used to exist, but is no longer"). In Inter 4 the opsz axis narrows spacing with size by itself, about -0.039em a character from 32px as measured on 2026-10-05. The deck's -0.025em on display sizes is a house choice on top of the Display design, and nothing goes tighter.

**The ladders.**

- The Prototemplate shell: d1 44/1.04 (page title), d2 32/1.05 (section title), d3 24/1.25 (h2 in prose), title 18/1.35, lead 17/1.55, body 16/1.6, small 14/1.55, meta 13/1.5, group 12.5. Under 900px d1 is 32, d2 26/1.15 and d3 21.
- The deck sheet (1600 by 900): h1 88, `.big` 72, h2 44, lead 26, p 22 at 1.5, `.rows` 20, caption 15. Text under 15px on the sheet is a defect.
- The landing's phone ladder is DESIGN.md section 12 (`--tcm-*`).

**Monospace** is an instrument voice. It sets code, tokens, terminals, file paths, hex values and locale codes, and nothing else: no headline, body or marketing line is ever set in mono. Prototemplate uses the system mono stack (`--pt-mono`) and gt-cloud uses Geist Mono (`--font-mono`).

**Scripts.**

- Inter covers Latin, Greek and Cyrillic. CJK, Arabic, Hebrew and Indic text falls back to a face for that script: the deck's `--cjk`, `--arabic` and `--indic`, and the shell's `--pt-text-hant`, `--pt-text-hans`, `--pt-text-ja` and `--pt-text-he`.
- Every layout is checked in CJK, RTL and Indic text as well as Latin (deck slide 28).
- next/font's Arial fallback has Hebrew and Arabic glyphs, so in an Inter stack those scripts render in Arial and never reach a script face listed after it. For a real Arabic or Hebrew face, set that script's stack on its own rule (a `:lang()` selector or a class) with no Inter variable in front, the way the deck's `.lang .ar` does.

**Exceptions.** Each is named here so no sweep removes it:

- The Prototemplate nameplate: Fraunces 600 for `proto` and Space Grotesk 500 for `template`, loaded by `src/lib/brand-fonts.ts` (DESIGN.md section 15).
- The gallery's grotesk labels and mono numerals on `/` (DESIGN.md section 4). They belong to the Prototemplate chrome and appear on no GT surface.
- The `/d/` direction routes, which are self-contained explorations with their own type.
- The presenter (`/present`), whose intro lockup sets Sora and Instrument Sans (`src/app/present/fonts.ts`) and whose type beats show other faces beside Inter on purpose.
- Specimens that show the weights 300 to 800: deck slide 27 and `.ptb-display` on `/brand`.
- The speed marks' faces (Michroma, Orbitron, Anybody), which exist only as outlines inside the mark files.

**Enforcement.**

- Prototemplate: `node scripts/lint/type.mjs` fails a literal family, a bare Inter, a feature list outside the tokens, any `font-variation-settings`, a weight above 500, heading metrics outside the display tokens, positive tracking and mono on a non-code selector, and ratchets literal sizes, tracking and line heights per file. An exception is written `/* lint-type: allow <reason> */`, and an empty reason fails. `pnpm build` runs its static mode first, `pnpm lint:type:live` reads the faces, features, tracking, optical size and weights Chrome renders on the dev server's pages at 1440 and 390, and `pnpm test:type` runs its tests. `gt-lints` owns the rule table and the wiring.
- gt-cloud: the gt-ui oxlint rules `inter-only`, `mono-is-not-voice`, `no-thin-font` and `typed-text-var` in `$GT_CLOUD/tooling/oxlint-plugins/gt-ui.ts`. Prototemplate's `pnpm lint:code` runs a copy of that plugin taken on 2026-09-28 (`scripts/lint/oxlint-plugins/gt-ui.ts`), with thirteen of its rules switched on in `.oxlintrc.json`; `no-thin-font` is not among them.
