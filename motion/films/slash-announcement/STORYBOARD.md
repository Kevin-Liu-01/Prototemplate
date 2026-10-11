# slash-announcement: the storyboard

## v8 (2026-10-09): the card slides behind the globe, stronger routes

Kevin on v7, 2026-10-09:

> for the slash video, its a bit hard to see the lines, and also make the transition less "weird" (this is the feedback rn). so maybe dont make the credit card merge into world, but make it slide right behind the globe or smthg

v8 replaces v7's morph with a slide behind the globe, draws the globe's routes stronger, and takes two of the critics' findings on v7: plate 1's light clears with its outline (a), and the first plate starts within 0.5 s of the credits bar landing (b). Everything else is v7: the white wordmark, the takes, the bed and the mix, the clock, the lockup, the surfaces' rows and labels, line 8 and the end card. The film stays 36.283 s (2,177 frames).

**Backed up first:** `films/slash-announcement/archive-v7-build/` (the v7 build: composition, docs and outputs), `archive-v7-fix-partial/` (the folder as the interrupted v7 fix round left it) and `motion/out/v17/` (v7's mp4, md5 b4d38a49a1790ae34f2daba4c6bdc9a4, poster, credits, contact sheet, script page, and from this round v7's checking sheet, script source and transcript).

### 1. The opener and the slide, 0.000 to 4.640

| time | word | event |
| --- | --- | --- |
| 0.000 to 2.632 | "Slash is building the financial command center" | v7: the card floats in, the white wordmark rises on "Slash" and holds, the highlight crosses the card. |
| 2.632 to 2.812 | "for" | The wordmark fades and drops 16 px, as in v7. |
| 2.632 to 3.032 | "for" | **The globe grows at its seat** (centre 1300, 600, radius 380) from a point to full size, in front of the card (0.4 s, power3.out: seven eighths of its radius by 2.832). It is an opaque olive disc under the globe's 3 px cells, so nothing of the card shows between them. On "for" the card's right corner already stands 102 px from the globe's centre, inside its seat, so the globe covers the card's right side as it grows. |
| 2.632 to 3.072 | "for businesses" | **The card slides right behind the globe** (power2.inOut over 0.8 s, toward the globe's centre), shrinking toward 0.8 of its opener size, so it reads as moving back. The globe's edge hides it from its right side; it is wholly behind the globe from 3.072, while still moving, and is not drawn after that. It stays a sharp photo throughout. |
| 2.771 to 3.271 | "businesses", the bar line | v7's ground leaves by tone into the olive light; the light's clearance follows the globe's disc. |
| 3.271 | | The opener stands down; the globe at its seat is the film's own (sceneGlobe), unchanged. |
| 3.300 to 4.640 | the pause, "They" | The globe stands, as in v7 (1.63 s by the critic's measure; v7 1.57 s). The origin cross prints by tone over 3.900 to 3.990. |
| 4.640 on | "sending" | The routes, drawn stronger (below). |

Prototyped against three other entries for the globe: a softer growth that overlapped the whole slide (it read as the globe swelling over the card), the globe sweeping in from off frame left in front of the card (it passed over the card, whose slide was hardly seen), and the globe rolling in from off frame right (two objects moving toward each other). A fade or a print by tone at the seat was not built, because the card already stands partly inside the seat on "for" and would show through a partly transparent globe. `NOTES.md` (v8) has the measurements.

### 2. The routes, 4.640 to 9.416

Same 24 routes, paths, order, clock and white. Each line is 2.5 px (v7 1 px), each endpoint cross 13 px with 2 px arms (v7 7 px, 1 px), the origin cross 25 px with 2 px arms (v7 17 px, 1 px), the pulse on "countries" 3 px screen gold (v7 2 px). Under every line and cross is a keyline of the film's olive, 1 px each side, at 60 percent, which keeps the white lines apart from the bright land's white cells. No glow. At 640 x 360 a route now changes the picture by 24 levels or more on 99.7 percent of its points over the bright land (v7 19.6 percent).

### 3. The offer, 19.957 to 20.811

| time | word | event |
| --- | --- | --- |
| 19.607 to 19.957 | "credits" | The bar raises, as in v7. |
| 19.957 to 20.258 | "to" | Hold, 0.30 s (v7 0.45 s). |
| 20.258 to 20.636 | "to" | The stems drop, 42 ms apart, each in 0.21 s (v7 from "localize", 20.408). |
| 20.433 to 20.811 | "localize" | Each plate's outline draws with its drawing, 0.175 s after its stem, as in v7. The first starts 0.476 s after the bar lands (v7 0.626 s). Each plate's light clears evenly over its outline's 0.21 s draw (v7: at full weight on its first frame, which cut the lower-left gold shaft in one frame). |
| 20.811 to 21.698 | "any product" | Hold: the five plates with their drawings (0.98 s by the white measure; v7 0.83 s). |
| 21.698 on | "surface" | v7: the English rows, then the languages on line 7's words. |

### Departures, for Kevin to confirm

1. **The globe grows from a point** at its seat rather than fading or sliding in; its growth covers the card's right side in the first 0.2 s, and then the card slides behind a still globe.
2. **The card shrinks only a little** (to 0.88 of its opener size by the time it is hidden).
3. **The crosses are larger** (13 and 25 px) so that their 2 px arms still read as crosses.
4. **The stems drop 0.15 s before "localize"**, on "to", so the first plate draws within 0.5 s of the bar.

### As built (2026-10-09)

As designed above. NOTES.md (v8) has the measurements.

- **The final**: md5 17d9afa94c95230f8b13a65b4ecb017a, 2,177 frames, -16.0 LUFS integrated at -2.0 dBTP, faststart, the audio byte-identical to v7's. The check found 0 errors (contrast 18 of 18), and the four renders are byte-identical. `el.mjs hear` heard all 78 words as written, at v7's times. The poster is byte-identical.
- **Against v7**, frame by frame, only the move (frames 160 to 201), the routes (396 to 542) and the plates (1229 to 1245) differ by more than 0.6 levels, apart from encoder noise at 10.67 to 10.92 and 15.50 to 15.85 s, where the lossless frames are identical.

## v7 (2026-10-09): the card becomes the globe, a white wordmark, the plates on "localize", "every language"

Kevin on v6, 2026-10-09:

> when the card went small and went into the globe it looked a little weird. make the card transition and become the globe
>
> make the bar that appears under up to $2000 translation credits not wait there as long for the boxes under it to appear
>
> at the front the slash logo should be white instead of the dark gray
>
> "more than one" -> "every" at end

v7 changes four things, one per note, and keeps everything else as v6: the takes of lines 1, 3, 6 and 7, the clock up to line 8's "product", the bed, the routes, the lockup, the surfaces' labels and rows, the app page and the end card. The film stays 36.283 s (2,177 frames).

**Backed up first:** `films/slash-announcement/archive-v6/` (the composition, the docs and `render.log`) and `motion/out/v16/` (`slash-announcement.mp4`, md5 1b8a841225396695d97e81c1cbcdda69, `.png`, `.credits.txt`, `sheets/`, `scripts/slash-announcement.md`, and from this round `_sheets/` and `scripts/source/slash-announcement.stt.json`).

### 1. The opener and the morph, 0.000 to 3.990

| time | word | event |
| --- | --- | --- |
| 0.000 to 1.100 | "Slash is building" | v6's float-in of the card. |
| 0.240 to 0.740 | "Slash" | The wordmark rises out of its mask, as in v6, now in the file's own white (no outline, no shadow). Against the gold behind it: 2.94:1 on average, 2.70:1 at the brightest. |
| 0.900 to 2.750 | "building" to "businesses" | v6's highlight across the card; the wordmark holds. |
| 2.632 to 2.812 | "for" | The wordmark fades and drops 16 px, as in v6. |
| 2.632 to 3.432 | "for businesses" | **The card becomes the globe** in one move (0.8 s, power2.inOut). Its centre runs to the globe's (1300, 600) and its half extents grow from 216 x 149 to 380 x 380, so it grows the whole time. It turns level (from -21.45 degrees), its corner radius grows from about 21 px to a full circle, and the photo's perspective flattens to face the viewer. For its first 0.12 s it reads the opener's own drawing of the card, so there is no step at "for". |
| 2.712 to 3.032 | | (0.1 to 0.5 of the move) The gold face takes the globe's light, shading and land in smooth tone. The photo is never printed through the screen. |
| 2.771 to 3.271 | "businesses", the bar line | v6's ground leaves by tone into the olive light; the light's clearance comes up around the shape as the globe does. |
| 2.992 to 3.312 | | (0.45 to 0.85 of the move) Inside the same outline the photo cross-dissolves into the globe's 3 px drawing. The globe is mapped into the shape, so its limb is the shape's edge. |
| 3.432 | | The shape lands as the globe, whole (v6 printed its globe crown first and completed it at 3.630). |
| 3.900 to 3.990 | "They" | The origin cross prints by tone over 0.09 s on the formed globe and is whole on "They", as in v6. From here the film is v6's. |

Treatments, prototyped on lossless frames every 1/30 s across the move: A, a plain cross-dissolve inside the morphing shape (read as a double exposure: continents on a still rectangular card); B1, the sphere's light on the gold, then the dissolve (the continents popped in); B2, the globe's own tone with its land on the gold, then the screen (built: at the dissolve only the texture changes).

### 2. The offer, 19.607 to 23.282 (line 6's "credits" to line 7's "app")

| time | word | event |
| --- | --- | --- |
| 19.607 to 19.957 | "credits" | The credits bar raises a lit stretch of the light (0.35 s), as in v6. |
| 19.957 to 20.408 | "to" | Hold, 0.45 s (v6 1.53 s, to "surface"). |
| 20.408 to 20.961 | "localize" | **The stems drop** out of their crosses on the bar's lower edge, 42 ms apart (expo.out 0.21), and each plate's 2 px straw outline draws out of its top-left corner from +0.175 (power3.out 0.21) while its drawing prints on the 3 px grid. This is v6's draw-on, moved from "surface" to "localize". |
| 20.961 to 21.698 | "any product" | Hold, 0.74 s: the five plates with their drawings. |
| 21.698 to 22.076 | "surface" | Each plate's English string steps in by tone along its foot (+0.21 to +0.42 after "surface", 42 ms apart), at v6's times: Sign in, Pricing, Quickstart, Sales deck, Hero banner. |
| 22.076 to 23.282 | "That covers your" | Hold, 1.20 s, as in v6. From "app" on, as v6. |

Two treatments were prototyped on lossless frames every 1/30 s from 19.402 to 23.002: the strings stepping in with the plates on "localize" (the plates then stood unchanged 2.28 s before "app", over the 2 s limit), and the strings on "surface" (built). The count, the lockup's seat and the heading do not move; the plates stand under the bar as before.

### 3. Line 8, 29.463 to 32.751

The new take (t3 of four): "Your product should exist in every language." Words in film seconds: Your 29.463, product 29.753, should 30.113, exist 30.322, in 30.763, every 30.961, language 31.309 (ends 31.855).

| time | word | event |
| --- | --- | --- |
| 29.753 | "product" | Hard cut to the app page in English, as in v6. |
| 30.322 | "exist" | Spanish. Done 30.672. |
| 30.961 | "every" | French (v6: on "more"). Done 31.311; whole from 31.171. |
| 31.309 | "language" | Japanese. Done 31.659. |
| 31.659 to 32.751 | | Hold, 1.09 s (v6 0.93), to the held chord's bar line. |
| 32.751 to 36.283 | | v6's end card, unchanged (3.532 s). |

Line 8 is 0.127 s shorter than v6's, less than a bar line (2.998 s), so the card stays on its bar line and the film stays 36.283 s. The gap from the last word to the card is 0.896 s (v6 0.769); `lib/mix.py` solves the bed's level in it as before.

### Departures, for Kevin to confirm

1. **The dissolve's middle.** From about 3.10 to 3.17 the card's engraving (its wordmark, chip and curves) shows faintly over the globe's land inside the shape, about 0.1 s, before the screen takes over.
2. **The strings on "surface".** The plates arrive on "localize", 0.45 s after the bar lands, but their English strings still print on "surface", 0.74 s later, so the plates do not stand unchanged for 2.3 s before "app".
3. **French is brief.** "every" and "language" are 0.35 s apart in the take, so French stands whole for 0.14 s before Japanese replaces it.

### As built (2026-10-09)

As designed above. NOTES.md (v7) has the measurements.

- **The final**: md5 b4d38a49a1790ae34f2daba4c6bdc9a4, 2,177 frames, -16.0 LUFS integrated at -2.0 dBTP, faststart. The check found 0 errors (contrast 18 of 18), and the two renders are byte-identical. `el.mjs hear` heard all 78 words as written.
- **Against v6**, frame by frame, only the opener and the morph (frames 17 to 210), the stems and plates (1235 to 1310) and line 8's three steps differ by more than 0.6 levels. The poster is byte-identical.
- **Stills**: the globe stands 1.58 s by the critic's measure (v6 1.53 s); in the offer the longest still by the white measure is 1.22 s, and the bar now stands 0.65 s (v6 1.73 s).

## v6 (2026-10-09): Slash's wordmark in the opener

Kevin on v5, 2026-10-09:

> i meant the slash logo should be there in the beginning

This clarifies his note on v4, "keep the slash in beggining", which v5 read as keeping the card. On v3 he had asked for no dithered wordmark: "dont start with slash dithered. use / animate the card ... rather than dither." So v6 puts Slash's wordmark in the opener with the card, drawn true from its file and never printed through the screen. Everything from the card's arrival at the routes' origin (3.630) on is v5 after its fix round: the five takes, the clock (`lib/cues.js`), the bed and the mix (`audio/film-premix.wav`), the resolve into the cross, the routes, the lockup, the offer, the surfaces, the app page and the end card. The film stays 36.283 s (2,177 frames).

**Backed up first:** `films/slash-announcement/archive-v5/` (the composition, the docs and v5's outputs under `out/`) and `motion/out/v15/` (`slash-announcement.mp4`, md5 3e6e6d26b1d596734024970b9a0b4c2a, `.png`, `.credits.txt`, `sheets/slash-announcement.png` and `.webp`, `scripts/slash-announcement.md`, `scripts/source/`, `_sheets/`). Only `lib/film.js` and `index.html` change (and the docs).

### 1. The composition

The wordmark stands centred over the card, and the two are centred in the frame as one group. Measured on a lossless frame at 2.0 s:

| | v5 | v6 |
| --- | --- | --- |
| Slash wordmark | none | ink x 756 to 1164, y 229 to 365 (409 x 137 px), olive #3b382b |
| card | x 647 to 1268, y 287 to 777 (622 x 491 px), centre (960, 525) | x 697 to 1219, y 426 to 838 (523 x 413 px), centre (960, 626): 0.84 of its v5 size, 101 px lower |
| space | | 60 px from the wordmark's foot to the card's top corner; 229 px above the group, 241 px below it |

- **The size.** The wordmark's ink is 409 px wide, the width of the Slash wordmark in Kevin's lockup on "partner" (x 498 to 907), so Slash's mark has the same size each time it appears full size. At a phone's 390 px width it is 83 x 28 px.
- **The card** is drawn at 0.84 inside its own canvas with high-quality smoothing, resampled from the photo (1.49x the photo, under its crisp limit of 1.78x), so it stays as sharp as before. Its float-in, turn and highlight are v5's, about its new centre.
- **The colour.** Both inks were tested on lossless frames of this composition. Against the gold behind the wordmark (relative luminance 0.25 to 0.34), white measures 3.00:1 on average and 2.69:1 at the brightest, and the film's olive 3.93:1 and 3.34:1. The olive is the film's own darkest colour (the globe setting's ground, the app page's button text) and keeps Slash's shape: the file is drawn as a vector at its size and filled with the olive, nothing else changes. Two other places were tried and set aside: the wordmark left of the card (where the gold runs from dark brown to mid gold, so neither ink holds even contrast across it, and the card's move to the origin shrinks to about 120 px), and under the card in the bright gold (olive 8.1:1, but a caption under the card rather than the brand over it).

### 2. The opener, 0.000 to 2.812

| time | word | event |
| --- | --- | --- |
| 0.000 to 1.100 | "Slash is building" | v5's float-in of the card, about its new centre (from 90 px lower, tilted back, turned and rolled, at 0.90 of its size, power3.out), solid by its fifth frame. |
| 0.240 to 0.740 | "Slash" | **The wordmark rises into place** out of a mask at its own foot, as the film's other text rises (the lockup's x, the end card's lines): 0.5 s, expo.out, so most of the 145 px rise happens in the first 0.2 s, and the wordmark stands still from 0.65 s. It is drawn on whole pixels throughout. It is never printed through the screen and never fades in. |
| 0.900 to 2.750 | "building" to "businesses" | v5's highlight sweeps across the card. The wordmark holds through "is building the financial command center" while the card turns and the highlight moves, so the frame is never still. |
| 2.632 to 2.812 | "for" | **The wordmark leaves** as the card sets off: in 0.18 s it fades out (power2.out) while dropping 16 px. At the bar line on "businesses" (2.771), where the ground starts to leave by tone, it is at 5 percent, and it is gone 0.04 s later. |
| 2.632 to 3.630 | "for businesses" | **v5's move**, from the card's new place: its centre runs straight to the route origin (about 280 px, against v5's 220) while its scale falls geometrically from 0.84 (v5: 1) to v5's 0.08 and it turns level. The ground's tone mix (2.771 to 3.271) and the globe's print are v5's. |
| 3.630 on | the pause, "They" | v5: the resolve into the gold plus and the cross, the routes, and the rest of the film. |

### Departures, for Kevin to confirm

1. **The wordmark is olive, not white.** White is Slash's own colour for it and the lockup keeps it, but on the photo's gold it reads at only about 3:1.
2. **The card is 0.84 of its v5 size and 101 px lower**, so the wordmark and the card sit as one centred group. The card's move to the globe therefore starts lower and travels about 280 px instead of 220, over the same time.
3. **The wordmark fades rather than travelling.** Only the card goes into the globe; the wordmark fades in 0.18 s as the card sets off.

### As built (2026-10-09)

As designed above. NOTES.md has the measurements.

- **Prototyped** on lossless snapshots of a scratch copy: five placements and both inks at 2.0 s, then the chosen opener every 1/30 s from 0 to 3.0 s, twice (the rise first eased power3.out, then expo.out to match the film's other mask rises; the drop first eased power2.in, which moved the wordmark only once it was nearly gone, then power2.out).
- **Identical to v5** on lossless frames from "They" (3.969 to 4.102 every 1/30 s, and 25 times from 4.202 to 36.252). From 3.635 to 3.935 only the 41 px card at the origin differs, by its resample (at most 52 levels, and at most 6 from 3.802); its place, size and clip are v5's.
- **The final**: md5 1b8a841225396695d97e81c1cbcdda69, 2,177 frames, -16.1 LUFS integrated at -2.0 dBTP, faststart, the audio byte-identical to v5's. The check found 0 errors (contrast 18 of 18), and the two renders are byte-identical. Against v5 frame by frame, only frames 1 to 196 (to 3.267) differ by more than 0.6 levels. By the critic's measure the opener's one still is 0.70 s (v5 0.58 s); the rest are v5's.

## v5 (2026-10-08): the card becomes the routes' origin; no greetings

Kevin on v4, 2026-10-08:

> make the intro transition much better into the 2nd shot
>
> keep the slash in beggining and get rid of the "hello" section

"Keep the slash in beginning" is read as: the card opener stays as v4 has it (the float-in and the highlight sweep, the card large enough to read "Slash"), and the transition begins only after the card has had its moment. v5 changes two things and keeps everything else as v4 after its fix round: the five takes, the clock (`lib/cues.js`), the bed and the mix (`audio/film-premix.wav`), the opener up to "for", and everything from "They" on apart from the Slash x GT shot (the routes, the count, the pulse, the glyph turn, the lockup's arrival and its glide, the offer, the surfaces, the app page, the card). The film stays 36.283 s (2,177 frames).

**Backed up first:** `films/slash-announcement/archive-v4/` and `motion/out/v14/` hold v4 (md5 84cb6190a264506e7bfae5b87b673cb2); the composition in the film folder was checked byte for byte against `archive-v4/` before any edit. Only `lib/film.js` and `index.html` change.

### 1. The move, 2.632 to 3.990 ("for businesses. They")

The hard cut on "businesses" is gone. The card becomes the origin of the payment routes in one continuous move.

| time | word | event |
| --- | --- | --- |
| 0.000 to 2.632 | "Slash is building the financial command center" | v4's opener, frame for frame: the float-in, the highlight sweep (0.900 to 2.750) and the slow turn. |
| 2.632 to 3.630 | "for businesses" | **The move** (power2.inOut, 0.998 s; the build ran it to 3.790). The card's centre runs straight from its place at (960, 522) to the route origin on the turning globe (about 1155, 420 at 3.630; the origin is at 1150, 420 on "They"), about 220 px up and to the right. Its scale falls geometrically from 1 to 0.08 (its long side from 509 to 41 px) and it turns 20.5 degrees clockwise, so its long side ends level, while the last 3.3 degrees of the opener's perspective turn ease out. It is resampled from the photo at its size on every frame (drawn small in its own canvas with high-quality smoothing), so it only gets smaller and stays sharp. The halo's tail of the highlight is still on the card's right edge for the move's first 0.12 s. |
| 2.771 to 3.271 | "businesses", the bar line where v4 cut | **The ground** leaves by tone through the 3 px screen in 0.5 s, in the Bayer order of the film's other tone mixes, uncovering the globe setting (olive, the broad gold shaft) and the globe. The photo's warm gold turns into the film's olive light as the card leaves it. |
| 2.771 to 3.630 | "businesses" | **The globe** prints from 0 in Bayer order, crown first, as in v4 but slower: each row over 0.43 s, crown to foot over 0.43 s (each half the time from the bar line to the card's arrival), so it is complete as the card arrives (v4: 0.42 s in all, from 0.12 s before the cut; the build: 0.5 and 0.5, complete at 3.771). |
| 3.630 to 3.780 | the pause after "businesses" | **The resolve, first part** (0.15 s). The card has arrived (41 x 29 px, level, on the globe's lit land). Its 3 px cells leave in Bayer order, except the cells under the origin cross's arms, so it ends as a small gold plus of itself. |
| 3.780 to 3.900 | the pause | **The plus** stands whole for 8 frames (frames 227 to 234, 3.783 to 3.900): a gold plus about 18 px across with 3 px arms, the card's photo showing through it, following the origin as the globe turns. The build gave it no time of its own (whole for about 3 frames). |
| 3.900 to 3.990 | "They" | **The resolve, second part** (0.09 s). The plus tones into the origin cross: each cell under the arms switches at its threshold from the card to the cross's 1 px white pixels. On "They" the cross is whole: v4's 17 px cross. |
| 3.990 on | "They support sending ..." | v4, frame for frame: the routes draw out of the cross from "sending", the count, the pulse on "countries", the glyph turn. |

One main motion at a time: the card's move is the motion, and the ground's tone mix and the globe's print are its setting. The card is never printed through the screen; the ground and the globe are, on the 3 px grid. Over the move the card's centre also follows the origin as the globe turns (the origin drifts from 1169 to 1150 px in x between "for" and "They").

### 2. The Slash x GT shot without the greetings, 10.601 to 16.781 (line 3, line 6's first words)

| time | word | event |
| --- | --- | --- |
| 10.601 to 11.126 | "partner" | As v4: the glyph globe and its figure leave by tone, Kevin's light arrives, the lockup prints in reading order. |
| 11.126 to 15.381 | "with Slash to help ambitious companies reach customers in every language" | **A slow push in** on the lockup about its ink centre (956.5, 539.5), from 1.00 to 1.09 of its size at a constant rate (4.255 s): its ink grows from 915 to 997 px wide, each edge moving about 9.6 px a second (the build: 1.05, sine.inOut, 915 to 961 px). The lockup is drawn from its files at each size, so it stays sharp. Kevin's light keeps drifting under it (12 px a second, v4's), uncleared. |
| 15.381 to 16.781 | "So if you bank with Slash" | v4's glide into the corner seat at 0.50 (1.4 s, power2.inOut), now starting from the pushed lockup; the offer's ground comes in under it by tone (0.5 s), as in v4. |

Removed: the seven greetings (Hello, Hola, Bonjour, こんにちは, 안녕하세요, नमस्ते, مرحبًا), their row, their dark band with its clearance in the light, and their 0.21 s leave on "So".

### Departures, for Kevin to confirm

1. **The move starts on "for"** (2.632), 0.14 s before the bar line, so it runs across "for businesses" as asked; the ground and the globe change from the bar line (2.771). The highlight's halo is still on the card's right edge for the move's first 0.12 s. Keeping it means the opener before the move is v4's frame for frame.
2. **The card ends at 0.08 of its size** (41 px long), larger than the 17 px cross, so it still reads as a card on the globe. The resolve then turns it into a plus of itself and into the cross.
3. **The cross is v4's 1 px cross.** On the white land it is faint, as in v4. The route width is still open, and changing it would also strengthen the origin.

### As built (2026-10-08, the build)

As designed above, except for the timings the fix round changed (below). NOTES.md has the measurements.

- **Prototyped** on lossless snapshots every 1/30 s from 1.8 to 4.6, twice. The first try (the move from "businesses", the card ending at 0.07, a plain cell dissolve) dissolved the card into nothing, because the 1 px cross is nearly invisible on the white land, and its dissolve began while the card was still 12 px short of the origin. The second, as built, starts on "for", lets the card arrive at 3.790, and leaves the plus before the cross.
- **Identical to v4** on lossless frames: before "for" (every 1/30 s from 1.8 to 2.6), from "They" (every 1/30 s from 4.0 to 4.6, and 18 times from 5.0 to 34.5), the lockup's arrival (10.6 to 11.1) and from 16.87 on.
- **The final**: 2,177 frames, -16.1 LUFS integrated at -2.0 dBTP, faststart, the audio byte-identical to v4's. The check found 0 errors (contrast 18 of 18), and the two renders are byte-identical (md5 ef0f136d463cecadcbc72dc97ce39809). The largest frame change in the move is 6.6 levels (v4's cut was 69.0 by the same script). By the critic's measure the globe before the routes now stands 1.35 s (v4 1.90). The Slash x GT shot stands 3.98 s by that measure, because the 5 percent push moves each edge about 0.1 px a frame; Kevin to judge whether it reads.

### Fix round (2026-10-08, on the critic's findings), as built

The critic passed the build (md5 ef0f136d463cecadcbc72dc97ce39809) with two minors and no major. Both are fixed; only `lib/film.js` changed. The build is backed up in `archive-v5-build/` (the composition, the docs and its outputs under `out/`).

| finding | the build | the fix |
| --- | --- | --- |
| The card's turn into the cross is too fast to see: the gold plus is whole for about 3 frames, while the card stands almost still at the origin for about 0.1 s before the resolve. | The move to 3.790, the resolve 0.2 s (the plus at 0.6 of it, an instant). The globe complete at 3.771. | The move ends at 3.630 (power2.inOut, 0.998 s) and the resolve takes 0.36 s: the card leaves all but its plus by 0.42 of it (3.780), the plus stands whole to 0.75 (3.900; frames 227 to 234, 8 frames) and then tones into the cross by "They". The globe's print is timed to the new arrival (each row and the crown-to-foot spread each half of 2.771 to 3.630, 0.43 s), so it is still complete as the card arrives. |
| The push on line 3 is too slight to see (5 percent, each edge 24 px over 4.26 s). | `PUSH` 0.05, sine.inOut: 915 to 961 px, nearly still for its first and last half second. | `PUSH` 0.09 at a constant rate: 915 to 997 px, each edge 41 px over 4.255 s (9.6 px a second, 0.16 px a frame), moving the same amount every second from the lockup's arrival to "So". |

The critic offered power1.inOut as a flatter ease for the push. It was not used: power1.inOut peaks at twice the mean speed and sine.inOut at 1.57 times, so it would bunch the push in the middle more, not less. The push runs at a constant rate instead (gsap's "none"). It starts as the lockup's print ends and stops as the glide starts from rest (power2.inOut), and at 0.16 px a frame neither join can be seen.

Nothing else changed. On lossless frames the opener before "for" and everything from "They" (4.0 to 34.5) is identical to v4, apart from the push and the glide that starts from it (11.126 to 16.781).

- **The final**: md5 3e6e6d26b1d596734024970b9a0b4c2a, 2,177 frames, -16.1 LUFS integrated at -2.0 dBTP, faststart, the audio byte-identical to v4's. The check found 0 errors (contrast 18 of 18), and the two renders are byte-identical. On the encoded film the gold plus is whole on frames 227 to 234, and the lockup's ink grows steadily from 914 px at 11.1 to 996 px at 15.3. By the critic's measure the globe before the routes stands 1.45 s (the build 1.35), and the Slash x GT shot still stands 3.98 s: the push changes 0.21 to 0.28 percent of the frame on every frame, under the measure's 0.5. Kevin to judge whether the 9 percent push reads.

## v4 (2026-10-08): the card opener, the thin routes, the smaller seat, "Sales deck"

Kevin on v3, 2026-10-08, with an image (`assets/reference/slash-card-kevin.png`, 1080 x 360: Slash's brushed-gold Visa card floating at an angle on a warm gold ground, lit from the upper left):

> dont start with slash dithered. use / animate the card in this attached image in opening animation rather than dither. make the lines look like how they used to for the globe (but keep the less amount of lines). make the gt x slash when showing the 2k credits smaller. when showing the different surfaces, instead of q3 review, it should say sales deck.

v4 changes five things and keeps everything else as v3 (the carry-over): the five takes, their placement, the clock (`lib/cues.js` and `audio/placement.json`), the bed and the mix (`audio/film-premix.wav`), Hello in seven languages, the carry-over on "So", the offer count on "up", the app page and the end card without the legal line. The film stays 36.283 s (2,177 frames).

**Backed up first** (2026-10-08, before any edit; copies checked byte for byte): `films/slash-announcement/archive-v3-carry/` (`index.html`, `lib/`, `audio/`, `NOTES.md`, `STORYBOARD.md`, `BRIEF.md`, `CREDITS.txt`, `render.log`, the json files; under `out/` the mp4 md5 0479d5a286997868eb93c16b39ac014d, poster, credits, `.sheet.png`, `.sheet.webp`, `.checking-sheet.png`, `.script.md`, `.script-source.json`, `.stt.json`) and `motion/out/v13/` (`slash-announcement.mp4`, `.png`, `.credits.txt`, `sheets/slash-announcement.png` and `.webp`, `scripts/slash-announcement.md`, `scripts/source/`, `_sheets/`).

### 1. The opener: Slash's card, 0.000 to 2.771

The dithered Slash wordmark on Kevin's light is gone. The opener is Kevin's photo of the card, animated in 2.5D on the photo's own ground. Nothing in it is printed through the screen.

**The photo, prepared once** (`lib/card-prep.py`, from `assets/reference/slash-card-kevin.png`):

- **Scale.** The photo is mapped at 16/9 (1.778), so its 1080 px width fills the frame's 1920 and its 360 px height covers frame y 220 to 860. The card stands where the photo has it, centred on about (960, 536), about 640 x 500 px. That is under the 2x ceiling the photo can hold.
- **The card.** The cut follows the card's own edges: four straight sides fitted to the edge in the photo, each at the half step between the card and the ground (the outer edge of the bright rim on the left side, of the dark side on the bottom), and a round corner at each of the four corners with the radius measured on that corner. The card is resampled with Lanczos at 16/9 and given a light unsharp mask (sigma 1.0 px, amount 0.45). Where the photo blends the card's edge with the ground, the ground is taken back out (the edge pixels are unmixed against the inpainted ground), and the mask is drawn at 8 x 8 supersampling. The result is `assets/opener/card.png`, straight alpha.
- **The ground.** The card is removed from the photo, its hole and a margin around it (the edge glints and their flare streaks) are filled from the surrounding ground, and the result is smoothed into a gradient. Above and below the photo the ground continues from its own top and bottom rows, more heavily smoothed. It is quantized to 8 bits with a light noise dither so the gradient does not band. The result is `assets/opener/ground.png`, 1920 x 1080. It does not move.

**The motion.** The card is a canvas over the ground, turned in 3D with a CSS perspective transform (perspective 1600 px about the card's centre), set from film time on every frame. One main motion at a time:

| time | word | event |
| --- | --- | --- |
| 0.000 to 1.100 | "Slash is building" | The card floats in to its place in the photo: from 90 px lower, tilted back (rotateX 16 degrees), turned left (rotateY -14) and rolled -2 degrees at 0.90 of its size, to the photo's own pose (power3.out). It is solid by its fifth frame (0.08 s; the build faded it in over 0.24 s, a translucent ghost for its first frames). |
| 0.900 to 2.750 | "building" to "businesses" | A soft highlight sweeps across the brushed gold along the card's long side, from its left edge to its right, as a band across the brushing, at a constant rate (screen blend, clipped to the card). Measured on the final, it changes the card from 1.233 ("building") to 2.417 ("center"), and its broad halo leaves by 2.75. The build ran it 0.800 to 1.850 (power2.inOut), on the card for only about 0.4 s. |
| 0.000 to 2.771 | the whole opener | Under both, the card keeps turning slowly (rotateY +3.5 degrees over the opener) and rising (14 px), so it never stands still. After the sweep's core leaves, only this turn and the halo's tail move, for 0.35 s before the cut (2.417 to 2.767). |
| 2.771 | "businesses" | Hard cut to the globe on the bar line, as in v3. The globe's crown-first rise (0.42 s) starts 0.12 s before the cut (`GLOBE_LEAD`), so the cut's first frame shows the crown already printing. In the build the first 5 frames after the cut were an empty dark disc. |

No still: the card is moving on every frame of the opener. By the critic's measure the build had two stretches where only the slow turn moved, 0.58 s and 1.27 s. The fix round's figures are in the fix round section below.

### 2. The globe routes, 4.640 to 9.486

The routes are drawn as the approved 19.5 s cut (`../slash-partnership/lib/film.js`) and v2 draw them, copied from that file: 1 px white great-circle arcs from the origin, drawn at a constant rate along their parameter, the origin a 17 px cross with 1 px arms on "They", each endpoint a 7 px cross with 1 px arms when its route lands, the crosses leaving cell by cell with the switch. The pulse on "countries" is its original 2 px screen-gold stretch over each route. v3's 4 px white lines on 6 px olive keylines, its 16 px gap at the origin and its keyed crosses are gone.

Kept from v3: the 24 routes (seed 314 and its bearing rule), their start every 0.126 s from "sending" with the 24th landing on "eighty", their 0.24 s draw, the count 1 to 180 from the first landing, the "+" and the pulse on "countries" (0.35 s, 0.25 tail), the retract (0.28 s) and the turn into glyphs.

### 3. The lockup's seat during the offer, 15.381 to 29.963

The seat the lockup moves into on "So" is Kevin's lockup at 0.50 (v3: 0.70), right edge on x 1760 and top on y 160: the Slash wordmark at x 1302 to 1506, the "x" at Inter 500 52 px with its baseline at 213, the GT mark at x 1644 to 1760 (y 160 to 234). Measured on the ink (a lossless frame at 20.5 s: x 1303 to 1759, y 160 to 232), it clears "Up to $2,000" (ink x 160 to 956) by 347 px and stands 82 px above "in translation credits" (ink top y 314); the layout boxes give 346 and 80. It leaves by tone on the cut to the app page, as in v3.

The move into the seat on "So" is one 1.4 s glide (power2.inOut) across "So if you bank with Slash", landing at 16.781, at the end of "Slash". The offer's ground still comes in under it by tone in 0.5 s (`SO_LIGHT`), and the greetings still leave in 0.21 s. In the build the move was 0.5 s, which left the half-size lockup standing alone in an empty frame for 1.87 s.

The end card's lockup goes back to its pre-v3 seat at 0.80: Slash x 1024 to 1352 (top 165), the "x" at 83.2 px with its left at 1440 and its baseline at 244, GT x 1573 to 1760 (top 160). The card prints it there by tone as before.

### 4. The Slides plate: "Sales deck"

Plate 4 reads **Sales deck** and steps on "slides" to **세일즈 덱** (Korean). A Korean product team calls a sales presentation a 세일즈 덱, in the same loanword pattern as 피치 덱 and IR 덱. The alternative 영업 자료 means "sales material" in general (brochures, price sheets, documents) and does not name a deck. The other four plates stay: Sign in / ログイン, Pricing / الأسعار, Quickstart / त्वरित शुरुआत, Hero banner / 首页横幅.

### 5. Unchanged

Everything after the opener is v3's frame for frame except the routes, the seat, the card's lockup and the Slides strings. The clock and the mix are not re-cut, because the opener keeps v3's cut on "businesses" at 2.771.

### Departures, for Kevin to confirm

1. **The card is shown at 1.78x**, the scale at which the photo's width fills the frame, not at 2x.
2. **The ground is the photo's own, smoothed**, without the flare streaks the card's edge glints throw onto it, because those would stay behind while the card moves.
3. **No shadow under the card**: the photo shows none, and the card floats in light as it does there.

### As built (2026-10-08)

As designed above, with these values and corrections:

- **The cut** (`lib/card-prep.py`): corner radii 14.4, 18.2, 13.7 and 9.3 photo px, measured on each corner's bisector. The card image is 643 x 511 at (639, 286), and the card's centre is (959.8, 535.6). The card's largest extent on screen is 622 x 492 px. The ground drops a 28 px margin around the card, which takes the flare streaks with it.
- **The highlight** is two raised-cosine bands on one centre line, a broad one (0.30 of the card's span, 0.22 alpha) and a core (0.09, 0.50 alpha), warm white, added in screen. A single band read as a wash; the halo and core reads as a sheen on brushed metal.
- **The seat** measured on a lossless frame: ink x 1303 to 1759, y 160 to 232.
- **The Slides strings**: "Sales deck" is 192 px of ink and 세일즈 덱 143 px, in the 248 px row.
- **Stills** (the critic's measure, on the build's final): the opener 0.58 s (the card settling before the sweep reaches it) and 1.27 s (the end of the sweep and the slow turn). The rest are v3's. The fix round's figures are below.
- **The final**: -16.1 LUFS integrated at -2.0 dBTP, faststart. The check found 0 errors (contrast 18 of 18), and the two renders are byte-identical (md5 ccd3558d66113f297b5c30a7a9bbe77a). NOTES.md has the measurements.

### Fix round (2026-10-08, on the critic's findings), as built

The critic passed v4 with six minors. This round changes timing only, in `lib/film.js`; the card image, the ground, the routes' stroke, the seat, the strings, the clock and the mix are the build's. The v4 build is archived in `archive-v4-build/` (with its outputs under `out/`) and in `motion/out/v13/v4-build/`.

| finding | change | measured on the final (the critic's measure: luma pixels changing more than 8 levels a frame, still under 0.5 percent of the frame) |
| --- | --- | --- |
| The opener's tail stood almost still for 1.27 s after a 0.4 s sweep | The highlight runs at a constant rate from 0.900 for 1.85 s (`SHEEN_T0`, `SHEEN_D`), so it crosses the card under "building the financial command center" | The opener's stills are 0.633 to 1.233 (0.60 s, the card settling), 1.533 to 1.750 (0.22 s, the band crossing the card's middle) and 2.417 to 2.767 (0.35 s, the halo's tail). The 1.483 to 2.767 still is gone. |
| The cut landed on an empty dark disc for 5 frames | The globe's crown-first rise starts 0.12 s before the cut (`GLOBE_LEAD`); the cut stays on "businesses" (2.771, frame 167) | Frame 167 shows the crown printing. Mean luma across the cut: 141.7 then 79.9, rising 1.5 levels a frame (the build: 141.7 then 76.5 for 5 frames). |
| The 0.5 s move on "So" left the half-size lockup alone for 1.87 s | The glide is 1.4 s (power2.inOut) across "So if you bank with Slash"; the ground's tone mix stays 0.5 s (`SO_LIGHT`) | The lockup reaches its seat (ink x 1303 to 1759) at about 16.78, and stands 0.98 s to "up". The critic's measure gives 16.483 to 17.750 (1.27 s), because the lockup's last 0.3 s at about 4 px a frame stays under its threshold. Largest frame change in the glide: 6.5 levels. |
| The card was a translucent ghost for 0.15 s | It is solid by its fifth frame (`OP_FADE` 0.08) | Frames 1 to 4 build up; frame 5 (0.083) is solid. Frame 0 is the ground. |
| Routes nearly vanish at phone width | Not changed: Kevin asked for the lines "how they used to", and 1 px is the approved stroke | `motion/out/_sheets/slash-announcement-routes.png` shows 1, 1.5 and 2 px at 390 px wide (6.5 and 7.75 s) and at 1:1, for Kevin to choose. |
| The storyboard contradicted itself on the still and the seat | Sections 1 and 3 above now give the measured figures | |

One more fix, found while making the poster: `render()` called `sceneOpen` only before the card, so a seek straight past 32.751 (a snapshot at 36.25 taken alone) left the opener's ground showing behind the end card. `sceneOpen` now runs on every frame and hides the opener after the cut. Rendered in order the frames were never affected: the renders before and after this fix are byte-identical.

**Stills before the card, by the critic's measure, against the build:** the opener's longest is now 0.60 s (was 1.28 by the same script; the build's notes give 1.27); the seated hold 1.27 s (was 1.87); the globe after its rise 2.967 to 4.917 (1.95 s, was 1.83 from 3.083), because the rise now completes 0.12 s sooner. That stretch has the globe's spin, the origin cross on "They" (3.990) and the first route from 4.640, all too small or too thin for the measure. The others are v3's, at v3's times.

**The final**: md5 84cb6190a264506e7bfae5b87b673cb2, -16.1 LUFS integrated at -2.0 dBTP, faststart, the audio byte-identical to the build's. The check found 0 errors (contrast 18 of 18), and four renders (two before the `render()` fix, two after) are byte-identical. NOTES.md has the measurements.

## v3 carry-over (2026-10-08): the Slash x GT shot ends on "So"

Kevin, 2026-10-08: "make its pacing a lil faster, we hang around on many shots for too long (like Slash x GT) ... slash x gt page - some kind of better visual if possible or if not better timing". In the fix round the Slash x GT shot ran from "partner" (10.601) to the hard cut on line 6's "up" (17.761). The greetings row was complete at 14.787, and the frame then held about 3 s under "So if you bank with Slash, we're giving you", with only a gold pulse on the Slash wordmark.

This round takes the critic's stronger option. The shot ends on line 6's first word, "So" (15.381). On "So" the lockup moves into the end card's corner seat and the offer's ground comes in under it, so the offer plays with the lockup already seated. The shot is now 4.78 s (10.601 to 15.381), down from 7.16 s.

Nothing else changes. The clock (`lib/cues.js` and `audio/placement.json`), the five takes, the bed, the mix (`audio/film-premix.wav`) and every other shot stay as they were. The beat on "up" (17.761, a bar line) is still where the offer's figure rises and its count starts, but it is no longer a cut: the offer's ground has been up since "So".

**Backed up first** (2026-10-08, before any edit; copies checked byte for byte): `films/slash-announcement/archive-v3-fix/` (`index.html`, `lib/`, `audio/`, `NOTES.md`, `STORYBOARD.md`, `BRIEF.md`, `CREDITS.txt`, `render.log`, the json files; under `out/` the mp4 md5 ab46dba3528e3d10081bfe2856971157, poster, credits, `.sheet.png` and `.sheet.webp`, `.checking-sheet.png`, `.script.md`, `.script-source.json`, `.stt.json`) and `motion/out/v12/v3-fix/` (the same outputs in `out/`'s own layout: `slash-announcement.mp4`, `.png`, `.credits.txt`, `sheets/`, `_sheets/`, `scripts/` and `scripts/source/`).

### 14.787 to 17.761, as built

| time | word | event |
| --- | --- | --- |
| 14.787 to 15.381 | "language", line 3's end | Hold, 0.59 s. The lockup and the seven greetings stand together. |
| 15.381 to 15.591 | "So" | The greetings leave by tone (0.21 s), and their dark band falls back into the light with them. |
| 15.381 to 15.881 | "So if you bank" | The lockup moves and scales into the card's corner seat in one move (0.5 s, power2.inOut). Each mark's ink box runs straight from its place in Kevin's lockup to its place in the seat, so the three marks travel as one. Under it, Kevin's light gives way to the offer's ground (the diagram setting: olive, two narrow gold shafts) by tone over the same 0.5 s, in the cells' Bayer order. The move lands as "bank" begins (15.869). |
| 15.881 to 17.761 | "with Slash, we're giving you" | Hold, 1.88 s. The lockup stands alone in its corner. Only the offer's light moves. |
| 17.761 | "up" | No cut. "Up to $10 / in translation credits" rises at the top left as in v3 (expo.out 0.35, 40 ms apart) and counts to $2,000 by "thousand" (18.249). The lockup stays in its seat. |
| 17.761 to 29.753 | lines 6 and 7 | The offer, the credits bar, the stems, the plates, their strings and the pulse on "more" run as in v3, with the lockup seated. |
| 29.753 to 29.963 | "product" | Hard cut to the app page (as in v3). The lockup leaves its seat by tone over 0.21 s. The page's top edge is at y 290, 27 px under the seat, which is too close to hold through line 8. |
| 32.751 | the held chord | The card as in v3. Its lockup prints again in the same seat, so the card closes on the corner the offer used. |

**The seat.** It is Kevin's lockup at 0.70, with its right edge on x 1760 and its top on y 160: the Slash wordmark at x 1118 to 1404 (y 164 to 259), the "x" with its ink at x 1481 and its baseline at 234 (Inter 500, 72.8 px), and the GT mark at x 1597 to 1760 (y 160 to 263). v3's card seat was 0.80 (x 1024 to 1760, y 160 to 278). It was tried first, with the offer heading moved 12 px down to clear "in translation credits" by 48 px. It stood 68 px from "Up to $2,000", less than the lockup's own 87 px gaps, so the top line read "Up to $2,000 Slash x GT", including at 640 px wide. Seats at 0.70, 0.65 and 0.60 were also compared on the offer at 20.5 s, the plates at 28.0 s and the card at 36.25 s. At 0.70 the lockup reads as its own group in the corner, and on the card it is 642 px wide. The offer's heading and the credits bar keep v3's places: "Up to $2,000" (x 160 to 956) clears the Slash wordmark by 162 px, and "in translation credits" (ink top y 314) clears the seat's foot (y 263) by 51 px. The credits bar (y 480) is 217 px below the seat. The card uses the same seat.

**Removed:** the Slash wordmark's screen-gold pulse on "Slash" (`slashGold`, `makeTint`, `SLASH_T`). On "Slash" the lockup is already in its corner.

**Stills.** As planned: the row standing before "So" 0.59 s, and the lockup seated before "up" 1.88 s. As measured on the final (NOTES.md has the method): 0.65 s (14.733 to 15.383) and 1.90 s (15.883 to 17.783). The 1.90 s hold is the longest still before the card, under "with Slash, we're giving you". The fix round's 1.60 s and 0.90 s holds in the shot are gone.

**As built** (2026-10-08): as planned above, with the seat at 0.70. Only `lib/film.js` changed. The final is -16.1 LUFS integrated at -2.0 dBTP, faststart. The check found 0 errors (contrast 18 of 18), and the two renders are byte-identical (md5 0479d5a286997868eb93c16b39ac014d).

## v3 (the faster cut, 2026-10-08): the plan, and as built

Kevin on v2, 2026-10-08:

> i loved the content of the 40 second a lot more. make its pacing a lil faster, we hang around on many shots for too long (LIke Slash x GT), animations could be faster
>
> get rid of the "subject to approval on last line"
> slash x gt page - some kind of better visual if possible or if not better timing
> not so many lines for the countries coming out for the globe with lines on top of it, and make the lines more visible.
>
> instead of "every product" under all the things can the text be different for each

v3 keeps v2's five lines, its five takes (nothing is recorded again, and no take is slowed, sped or stretched), their order and v2's pictures. It changes five things, one per note:

1. **Pace.** The gaps between lines are 0.310 to 0.389 s, except the glyph bridge's 0.923 s after line 1. Every animation runs at 0.7 of its v2 duration. The bridge holds 0.40 s after each of its pieces. No shot stands still for longer than 1.75 s before the end card (the credits bar before the stems; the opener's 2.11 s until the fix round), and the lockup no longer holds 6.75 s.
2. **Slash x GT.** The lockup assembles on "partner" in 0.525 s. On "help" one dark band rises under the lockup, and from "help" to "language" the word Hello prints into it in seven languages, one per spoken word. The row stands to the hard cut on "up", and on line 6's "Slash" the Slash wordmark pulses in screen gold (fix round). (Carry-over: the row leaves on "So", the lockup moves into the card's corner seat and the pulse is gone; see the section above.)
3. **The globe.** 24 routes replace the 180. Each route is a 4 px white line over a 6 px olive keyline. A route starts every 0.126 s from "sending", and each one lands as a 21 px cross. The count still runs to 180, and the "+" and the pulse still land on "countries"; the pulse widens each route it passes with screen gold under the white (fix round). The approved globe, its pulse and its turn into glyphs are unchanged apart from their durations.
4. **The surfaces.** Each plate carries its own interface string, in English first and then in its language: Sign in, Pricing, Quickstart, Q3 review and Hero banner.
5. **The end card.** The legal line is gone. The lockup, "Up to $2,000 / in translation credits" and generaltranslation.com/slash stay.

The film is 36.283 s (2,177 frames at 60 fps), 3.70 s shorter than v2. Speech fills 29.74 s of it.

**v2 is backed up** (2026-10-08, before this section was written; copies checked byte for byte):

- `motion/out/v12/`: `slash-announcement.mp4` (md5 2148a9dc1640007aa03c4b03f62821cd, v2's final), `slash-announcement.png`, `slash-announcement.credits.txt`, `sheets/slash-announcement.png` and `.webp`, `scripts/slash-announcement.md`, `scripts/source/slash-announcement.json` and `.stt.json`, and `_sheets/slash-announcement.png`.
- `films/slash-announcement/archive-v2/`: `index.html`, `lib/`, `audio/`, `NOTES.md`, `STORYBOARD.md` (v2's text without this section), `BRIEF.md`, `CREDITS.txt`, `render.log`, `hyperframes.json`, `meta.json` and `package.json`. `diff -rq` against the film folder found no differences.

### The clock

Each take is placed by its first word. The opener's "Slash" is at 0.240. The bed's beats fall at 0.5225 + 0.7495k and its bar lines on every fourth beat (2.771 + 2.998m), so the three hard cuts and the card each land on a bar line. The "partner" tone mix lands on its word, between two beats (see Departures, 5).

| line | take at | first word | last word ends | gap after | transition into the line's picture |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.240 | 0.240 | 8.738 | 0.923 (the glyph bridge) | frame 0, then a hard cut on "businesses" 2.771 (beat 3, a bar line) |
| 3 | 9.661 | 9.661 | 15.071 | 0.310 | a tone mix on "partner" 10.601 |
| 6 | 15.381 | 15.381 | 22.057 | 0.389 | a hard cut on "up" 17.761 (beat 23, a bar line) |
| 7 | 22.446 | 22.446 | 29.075 | 0.389 | none (the plates continue) |
| 8 | 29.463 | 29.463 | 31.982 | 0.769 to the card | a hard cut on "product" 29.753 (beat 39, a bar line) |
| card | | | | | a tone mix on the held chord 32.751 (beat 43, a bar line), end 36.283 |

The words, in film seconds:

| line | words |
| --- | --- |
| 1 | Slash 0.24, is 0.73, building 0.91, the 1.28, financial 1.40, command 1.91, center 2.32, for 2.63, businesses 2.77, They 3.99, support 4.20, sending 4.64, and 5.09, receiving 5.22, global 5.79, payments 6.21, to 6.72, over 6.89, a 7.14, hundred 7.24, and 7.62, eighty 7.78, countries 8.16 |
| 3 | We're 9.66, excited 9.93, to 10.47, partner 10.60, with 10.94, Slash 11.10, to 11.62, help 11.80, ambitious 12.02, companies 12.53, reach 13.03, customers 13.32, in 13.91, every 14.18, language 14.54 |
| 6 | So 15.38, if 15.61, you 15.71, bank 15.87, with 16.14, Slash 16.33, we're 17.17, giving 17.37, you 17.61, up 17.76, to 17.91, two 18.03, thousand 18.25, dollars 18.61, in 18.89, translation 19.00, credits 19.61, to 20.21, localize 20.41, any 20.91, product 21.13, surface 21.49 |
| 7 | That 22.45, covers 22.74, your 23.06, app 23.28, website 24.07, documentation 24.96, slides 26.30, design 27.31, files 27.76, and 28.52, more 28.75 |
| 8 | Your 29.46, product 29.75, should 30.07, exist 30.26, in 30.75, more 30.93, than 31.11, one 31.29, language 31.47 |

### Durations, v2 to v3

| piece | v2 | v3 |
| --- | --- | --- |
| a route's draw | 0.34 s, linear | 0.24 s, power3.out |
| the globe raising its tone, crown first | 0.6 | 0.42 |
| the pulse on "countries" (head, then a 0.25 tail) | 0.5, clear at 0.625 | 0.35, clear at 0.4375 |
| the glyph switch / the routes retracting | 0.7 / 0.4 | 0.49 / 0.28 |
| the glyph step | 0.45 | 0.315 |
| the bridge's three holds | 1.017 each | 0.40 each |
| the "partner" mix: the globe leaving / the light arriving | 0.3 / 0.5 | 0.21 / 0.35 |
| the lockup printing: each mark, the x's start, GT's start, complete | 0.5, +0.2, +0.25, +0.75 | 0.35, +0.14, +0.175, +0.525 |
| a greeting printing by tone / the greetings leaving | (new) | 0.25 / 0.21 |
| a figure line rising (lines apart) | 0.5 expo.out (60 ms) | 0.35 expo.out (40 ms) |
| the offer's count, $10 to $2,000 | "up" to "dollars", 0.85 | "up" to "thousand", 0.49 |
| the credits bar raising | 0.5 | 0.35 |
| the stems (apart) / a plate's outline | 0.3 (60 ms) / 0.3 from +0.25 | 0.21 (42 ms) / 0.21 from +0.175 |
| a plate's English row stepping in | +0.3 to +0.6 | +0.21 to +0.42 |
| a plate lighting / its label rising / its row stepping to its language | 0.4 / 0.5 from +0.05 / +0.35 to +0.7 | 0.28 / 0.35 from +0.035 / +0.245 to +0.49 |
| the pulse down the stems on "more" | (v1's, 0.5) | 0.35 |
| a language switch on the app page: box width / old string out / new string in | 0.4 / 0.12 / 0.2 from +0.1 | 0.28 / 0.084 / 0.14 from +0.07 |
| the card: light mix / page leaving / lockup printing (apart) / lines rising, all landed by | 0.5 / 0.3 / 0.5 (60 ms) from 0.10 / 0.76 | 0.35 / 0.21 / 0.35 (40 ms) from 0.07 / 0.53 |
| the card's settled hold | 3.0 | 3.0 |

### 0.000 to 2.771: the opener (line 1, first sentence)

| time | word | event |
| --- | --- | --- |
| 0.000 | | Kevin's composition at its fitted phase, drifting 12 px a second along the shafts' normal. The Slash wordmark stands centred (x 755 to 1165, y 472 to 608) at 40 percent tone through the 3 px screen. |
| 0.240 to 1.238 | "Slash is building" | The wordmark raises its tone to full in Bayer order (smoothstep) across "Slash is building", complete as "building" ends (fix round; v3's build printed it over "Slash" alone, to 0.658). |
| 1.238 to 2.771 | "the financial command center for" | Hold, 1.53 s. Only the light moves. |

### 2.771 to 10.601: the payment globe, its 24 routes and the glyph bridge (line 1)

The approved globe (centre 1300, 600, radius 380, tilt 0.15, spin 0.05 rad a second, the approved inks and land), drawn on the 3 px grid. Its clock reads the approved still's T = 40 at the cut.

| time | word | event |
| --- | --- | --- |
| 2.771 | "businesses" | Hard cut to the globe setting (olive, one broad gold shaft at the approved phase). The globe raises its tone from 0 in Bayer order, crown first, in gold, straw and white (0.42 s, to 3.191). |
| 3.990 | "They" | The origin lands on the globe's lit upper left (1150, 420): a 29 px registration cross, 3 px white arms over 5 px olive arms, printed by tone (0.14 s). "They" is Slash, so the origin lands on the word that names it. |
| 4.640 to 7.775 | "sending" to "eighty" | 24 routes draw out of the origin, one after another. Route k starts at 4.640 + 0.1259k and draws its great-circle arc (lifted 4 percent, re-projected each frame) in 0.24 s, power3.out, so two routes are drawing at most moments. Each route is a 4 px white stroke over a 6 px olive stroke, a 1 px keyline on each side, so it reads over the globe's white land as well as its dark side. Each route starts 16 px out from the origin, so the 24 lines do not merge into one white mass at the cross. The routes draw in order of their bearing from the origin, clockwise, so the fan sweeps once across the disc. Each endpoint lands as its route arrives: a 21 px cross, 3 px white arms over 5 px olive arms. The 24th route lands on "eighty". |
| 4.880 | "sending" | "1 / countries" (Inter 500, 140 px, tabular figures, first ink x 160, cap tops y 172) rises as the first route lands (expo.out 0.35, the lines 40 ms apart). The figure counts 1 to 180 (ease none) and reaches 180 as the 24th route lands at 7.775. The count is the number; the routes illustrate it. |
| 8.158 to 8.596 | "countries" | The approved pulse. The "+" is set, and a screen-gold stretch runs out of the origin along every route (0.35 s, ease none). Its 0.25 tail clears at 8.596. Along the stretch the route widens: an 8 px screen-gold line under its 4 px white, in a 10 px olive keyline, so the pulse adds light (fix round; v3's build drew a 4 px gold stretch in place of the white, which read as a shadow on the bold routes). |
| 8.596 to 8.996 | | Hold, 0.40 s. |
| 8.996 to 9.486 | | The switch. The routes retract into their endpoints (power3.out 0.28), the crosses leave by tone (from +0.14 to +0.42), and each 24 px block of the disc switches to one glyph from twenty writing systems, in Bayer order over 0.49 s, over the globe's tone as a smooth ground (the approved rules for the glyphs' sizes and inks). |
| 9.486 to 9.886 | "We're" 9.661 | Hold, 0.40 s. Line 3 begins over the glyph globe. |
| 9.886 to 10.201 | "excited" 9.928 | Every glyph steps once to its next writing system, in Bayer order (0.315 s). |
| 10.201 to 10.601 | "to" | Hold, 0.40 s. |

The 24 endpoints are seeded. Each lies within 60 degrees of the globe's centre at its landing, at least 14 degrees from the origin and at least 90 px from every other endpoint, so that every cross reads on its own.

### 10.601 to 17.761: Slash x GT, and Hello in seven languages (line 3, line 6's first words)

| time | word | event |
| --- | --- | --- |
| 10.601 | "partner" | A tone mix. The glyph globe and "180+ / countries" leave by tone (0.21 s, the figure's leave box running to its "+"). Kevin's light arrives in the same Bayer order (0.35 s), phased so the fit lands as the lockup completes. The lockup prints in reading order: the Slash wordmark raises its tone (x 498 to 907, smoothstep 0.35 s); the white "x" (Inter 500, about 104 px, ink x 1016 to 1065, baseline 571) rises out of its mask from +0.14 (expo.out 0.35); the GT mark (x 1182 to 1415, y 466 to 613) raises its tone from +0.175 (0.35 s). It is complete at 11.126, on Kevin's image. |
| 11.126 to 11.797 | "with Slash to" | Hold, 0.67 s. The lockup stands on the light uncleared. |
| 11.797 | "help" | One dark band rises under the lockup (0.25 s): the figure clearance around the complete row's box, raised as one shape, so its edge is clean from its first frame. **Hello** (en) prints by tone into it at the row's left end (0.25 s). |
| 12.529 | "companies" | **Hola** (es). |
| 13.027 | "reach" | **Bonjour** (fr). |
| 13.318 | "customers" | **こんにちは** (ja). |
| 13.910 | "in" | **안녕하세요** (ko). |
| 14.177 | "every" | **नमस्ते** (hi). |
| 14.537 | "language" | **مرحبًا** (ar, right to left), at the row's right end. The row is complete at 14.787. |
| 14.787 to 16.333 | "So if you bank with" | (Carry-over: from "So" this shot is replaced; see the section above.) Hold, 1.55 s. The seven greetings and the lockup stand together. Line 3 ends at 15.071, and line 6 begins 0.310 s later. |
| 16.333 to 16.844 | "Slash" | The Slash wordmark pulses in screen gold across the spoken word: its cells step from white to screen gold in Bayer order and back (down to 40 percent white at 16.589), so "if you bank with Slash" lands on the Slash mark. The greetings stay. |
| 16.844 to 17.761 | "we're giving you" | Hold, 0.92 s, the lockup and the row together, to the hard cut on "up". |

The row is the lockup's line of languages. It is one plain greeting, Hello, set in seven languages and five scripts. Each greeting is one text node with its `lang` and `dir` (Arabic `dir="rtl"`), Inter 500 at 56 px in white through var(--font), with the machine's fallback faces at their medium weights for the other scripts. The greetings sit on one baseline at y 780, 56 px apart, as one row centred on the lockup's centre line (x 956.5). Measured in headless Chrome at 56 px, the widths are Hello 126.2, Hola 115.7, Bonjour 192.5, こんにちは 280.0, 안녕하세요 242.2, नमस्ते 117.9 and مرحبًا 105.6 px, so the row spans about x 198 to 1715, inside the 160 px title safe area. Each greeting prints by tone through the film's cell grid (`cellPath`, as the plate rows do), left to right in reading order. The light keeps the figure clearance around each greeting (it falls to olive within 40 px and returns over the next 60 px), raised with the greeting in the same Bayer order, so every greeting reads as white on olive and passes the contrast check. The lockup itself stays on the light uncleared, as in Kevin's image. Every greeting is the standard greeting in its language; none of them is a word-for-word gloss.

Line 1 shows Slash's payment routes reaching 180 countries, and line 3 says the partnership reaches "customers in every language". The row lands one language per spoken word under the two marks, so the claim is shown as it is said. It uses only the film's own grammar (white Inter on Kevin's light, tone steps on the 3 px grid, figure clearance). There are no sparkles, handshakes or confetti, and no new mark.

### 17.761 to 29.753: the offer and the surfaces (lines 6 and 7)

| time | word | event |
| --- | --- | --- |
| 17.761 | "up" | Hard cut to the diagram setting (olive, two narrow gold shafts; carry-over: no cut, the setting arrives by tone on "So" and reaches this phase on "up"). "Up to $10 / in translation credits" (Inter 500, 140 px, tabular figures) rises (expo.out 0.35, the lines 40 ms apart). The figure counts $10 to $2,000 in steps of $10 (ease none). |
| 18.249 | "thousand" | The count lands on $2,000 as "two thousand" is said. |
| 18.249 to 19.607 | "dollars in translation" | Hold, 1.36 s. |
| 19.607 | "credits" | The credits bar (x 160 to 1760, y 480 to 528) raises a lit stretch of Kevin's light in Bayer order (0.35 s). |
| 19.957 to 21.488 | "to localize any product" | Hold, 1.53 s. |
| 21.488 | "surface" | Five doubled-line stems draw down out of their crosses on the bar's lower edge (x 304, 632, 960, 1288, 1616), 42 ms apart (expo.out 0.21). Each plate's 2 px straw outline (288 x 320, y 600 to 920) draws out of its top-left corner from +0.175 (power3.out 0.21), and its drawing prints on the 3 px grid in the band y 676 to 826. Its English string steps in by tone along the plate's foot from +0.21 to +0.42 (Inter 500, 40 px, baseline 884, x0 + 20). The five strings sit on one baseline: Sign in, Pricing, Quickstart, Q3 review and Hero banner. Complete at 22.078. |
| 22.078 to 23.282 | "That covers your" | Hold, 1.20 s. |
| 23.282, 24.071, 24.965, 26.301, 27.311 | "app", "website", "documentation", "slides", "design" | On its word each plate lights (straw under a white checker, 0.28 s). Its label rises at its top left from +0.035 (App, Website, Docs, Slides, Design files; Inter 500, 44 px, baseline 650, expo.out 0.35). Its row steps by tone to its language from +0.245 to +0.49 (table below). The last is complete at 27.80. |
| 27.80 to 28.750 | "files, and" | Hold, 0.95 s. |
| 28.750 | "more" | A screen-gold pulse runs from the bar down each stem, a third copy between its threads (0.35 s, ease none), the stems 42 ms apart from the left; as it reaches its plate (+0.131), the plate's 2 px outline draws again in white out of its top-left corner (power3.out 0.21). The last outline is done at 29.259, the last pulse tail at 29.268 (fix round; v3's build ran the pulse alone, a 3 px core the critic could not see at phone size). |
| 29.268 to 29.753 | "Your" 29.463 | Hold, 0.49 s, the five plates in white outlines. "Your" is heard over the plates. |

**The five strings.** Each is a real interface string from its surface, short enough for the plate's 248 px row at 40 px (widths measured in headless Chrome with Inter and the fallback faces). Each plate keeps v2's language, so the five plates still show five languages and five scripts.

| plate | label | English row | width | translation | language | width | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 (x 160) | App | Sign in | 120.0 | ログイン | Japanese | 156.4 | the standard Japanese label for a sign-in button |
| 2 (x 488) | Website | Pricing | 122.4 | الأسعار | Arabic, right to left, right edge x1 − 20 | 95.8 | "the prices", the usual pricing page label |
| 3 (x 816) | Docs | Quickstart | 186.7 | त्वरित शुरुआत | Hindi | 211.5 | "quick start" |
| 4 (x 1144) | Slides | Q3 review | 179.8 | 3분기 리뷰 | Korean | 172.2 | "third quarter review", a deck's title slide |
| 5 (x 1472) | Design files | Hero banner | 221.6 | 首页横幅 | Chinese (Simplified) | 161.1 | "home page banner", the name of the selected artboard in the drawing |

As in v2, each row is one text node with its `lang` and `dir`. The English and the translated rows stand in the same place, and the row steps from one to the other by tone.

### 29.753 to 32.751: the app page (line 8)

| time | word | event |
| --- | --- | --- |
| 29.753 | "product" | Hard cut to the diagram setting. The GIF's app page, centred (x 160 to 1760, y 290 to 790), in English: "English", "Welcome back", "Get started". |
| 30.264 | "exist" | Spanish: "Español", "Hola de nuevo", "Comenzar". Each box's width tweens (power2.inOut 0.28 s) while its strings crossfade (the old out over 0.084 s, the new in over 0.14 s from +0.07, rising 4 px). Done 30.614. |
| 30.926 | "more" | French: "Français", "Bon retour", "Commencer". Done 31.276. |
| 31.472 | "language" | Japanese: "日本語", "おかえりなさい", "始める". Done 31.822. |
| 31.822 to 32.751 | | Hold, 0.93 s, to the held chord's bar line. |

### 32.751 to 36.283: the end card (silent, 3.532 s)

Card seconds.

| t | event |
| --- | --- |
| 0.00 to 0.35 | A tone mix on the bed's held chord. The app page and its strings leave by tone (0.21 s) while the light changes to the card's setting in the same Bayer order (0.35 s): Kevin's light above the diagonal from (560, 0) to (1920, 760), olive below. |
| 0.07 to 0.50 | The lockup prints in the mark corner at 0.80 of its size (Slash x 1024 to 1352; "x" baseline 244; GT x 1573 to 1760), in reading order, 0.04 s apart, 0.35 s each. (Carry-over: at 0.70, Slash x 1118 to 1404, "x" baseline 234, GT x 1597 to 1760, the seat the lockup held through the offer.) |
| 0.21 to 0.53 | "Up to $2,000" and "in translation credits" rise out of their masks (Inter 500, 120 px, first ink x 160, baselines 676 and 798, expo.out, 28 ms apart). |
| 0.29 to 0.53 | "generaltranslation.com/slash" rises (Inter 400, 48 px, white, x 160 to 753, baseline 920). |
| 0.53 to 3.532 | A 3.0 s settled hold, the title's reading floor (6 words). The light's drift slows to rest (power2.out), so the last frame, the poster, is still. |

The legal line ("Translation credits are subject to General Translation's review and approval.") is removed: its node (`#cardG`), its seat in `layoutCard` and its rise. Nothing takes its place, and the right half of the card's foot is open light.

### Holds and stills

Every hold over 0.6 s stands under spoken words that fix its length (as planned, then since the fix round): 0.658 to 2.771 (2.11 s, the opener; now 1.238 to 2.771, 1.53), 11.126 to 11.797 (0.67), 14.787 to 16.333 (1.55), 16.543 to 17.761 (1.22; now 16.844 to 17.761 after the Slash pulse, 0.92), 18.249 to 19.607 (1.36), 19.957 to 21.488 (1.53), 22.078 to 23.282 (1.20), docs to slides (0.85), 27.80 to 28.750 (0.95), 29.100 to 29.753 (0.65; now 29.268 to 29.753, 0.49) and 31.822 to 32.751 (0.93). No still before the card is over 1.75 s as measured on the final (NOTES.md, the fix round). In v2 the longest still was the lockup's 6.75 s, and the opener's 3.75 s was the second longest.

### Sound

**The bed.** The bed is the film's composed bed (`audio/bed.mp3`, 80.05 BPM, beats at 0.05 + 0.7495k in the source, bar lines every four beats, the held E flat chord on the bar line at 60.01), re-cut on its own bar lines to the new length:

- It starts at frame 0 from source 0.277 s, with a 0.3 s fade in from frame 0. The film's beats then fall at 0.5225 + 0.7495k and its bar lines at 2.771 + 2.998m, the grid the clock above was solved on.
- There is one splice. The bed leaves source bar line 3 (9.044, the end of intro bar 2) for bar line 12 (36.026, the start of B) with an 80 ms equal-power crossfade ending on the bar line, at film 8.767. That is the bar line after "countries" ends, in the bridge's held duck. Measured in this planning pass, the bar before the splice point and the bar before the target match at 0.997 chroma similarity, and the beats before them match at 0.982 on log-band spectra. It is the same intro-to-B join that v2 took one bar later (4 to 12), so B's A flat arrives as the globe turns into glyphs. Other nine-bar candidates measured were 2 to 11 (chroma 0.949), 1 to 10 (0.988) and 8 to 17 (0.918, which drops B). The build should confirm the choice with `lib/mix.py`'s own measure before mixing.
- Film map: film = source − 0.277 to 8.767 (intro bars 0 to 2), then film = source − 27.259. B (bars 12 to 15) plays from 8.767 to 20.759, under the glyph turn, the lockup and the offer's count. A' (bars 16 to 19) plays from 20.759 to 32.751, under the surfaces and the app page. The held chord lands on the card's mix at 32.751, and an 0.8 s fade out ends on the last frame at 36.283. 10.93 bars stand before the chord.

**The mix** keeps v2's chain. Each take is mastered to −19 LUFS mono with a lookahead ceiling of −3.5 dBFS, trimmed 0.28 s after its last word and never past 0.06 s before the next line. The bed is ducked to about −26 LUFS under speech. Every gap is now under `HOLD_GAP` (1.0 s), so the duck holds through the whole narration. The bed releases after line 8's last word (31.982) into the chord. Its alone gain is solved on the gap before the card, and the chord is trimmed to −19.0 LUFS momentary over its first 2 s. One premix at −16 LUFS integrated and −2.0 dBTP is the composition's one `<audio>` clip. The delivery checks are −16 LUFS integrated within 0.5 and a true peak at or below −1.0 dBTP.

### Departures (from v2 and from the brief's examples), for Kevin to confirm

1. **"Q3 review" in place of the example "Quarterly review."** At the row's 40 px, "Quarterly review" is 293.3 px, and a plate's row holds 248 px. The 36 px phone floor rules out a smaller size.
2. **"Hello" in place of "Welcome."** The app page in line 8 already says "Welcome back" in four languages. Spanish "Welcome" also takes a gender (Bienvenido or Bienvenida). "Hello" has one plain, standard form in each of the seven languages.
3. **The cut to the globe moves from "They" to "businesses"** (2.771, a bar line). On "They" the opener would stand 3.3 s. The origin cross lands on "They" instead.
4. **The cut to the app page moves from "Your" to "product"** (29.753, a bar line). With both gaps around line 7 between 0.30 and 0.45 s, no beat falls on "Your"; on "product" a bar line falls with gaps of 0.389 s. "Your" is heard over the plates.
5. **The "partner" mix is not on a beat** (0.335 s after beat 13). "Partner" and "up" both on beats would force a 0.645 s gap between lines 3 and 6, and "up" is a hard cut, which must land on a beat. A tone mix carries over and needs only its word.
6. **The pulse on "more" returns** (v1's, at 0.35 s), and since the fix round each plate's outline redraws in white as the pulse reaches it. Without it, the five finished plates would stand 1.95 s.
7. **The bridge's gap after line 1 is 0.923 s**, over the 0.45 s target. The pulse's tail, a 0.40 s hold and the glyph switch run in it, and the step plays under "We're excited". Dropping the approved step would bring the gap to 0.30 s, but the step is part of the approved globe.
8. **The figure "N / countries" rises at 4.880**, 3.3 s before "countries" is said (2.0 s in v2), because the 24 routes draw from "sending" to give each line time to read.
9. (Carry-over: replaced; the greetings leave on "So" and the lockup takes the card's seat.) **The greetings stand to the cut on "up"** (fix round; v3's build took them off on line 6's "Slash" and left the lockup alone 1.22 s, v2's bare frame), and the Slash wordmark pulses in screen gold on "Slash", so the row's 2.97 s on screen after it completes is split 1.55 and 0.92 s.
10. **The opener prints across "Slash is building"** (fix round), not across "Slash" alone, so the still before the cut on "businesses" is 1.53 s, not 2.11 s.

### Build notes (values for `lib/cues.mjs`, `lib/film.js` and `index.html`; this plan contains no code)

- `lib/cues.mjs`:
  - The opener's "Slash" floor is 0.24.
  - The first cut is "businesses" on a beat.
  - The bridge holds 0.40 each: `PULSE_D` 0.35, `PULSE_DONE` 0.4375, `SW_D` 0.49, `STEP_D` 0.315.
  - "partner" is placed on its word with no beat snap. "up" goes on the first beat that keeps the gap from line 3 at 0.30 s or more.
  - Lines 7 and 8 share the slack evenly so that "product" lands on a beat, with both gaps between 0.30 and 0.45.
  - `SURF_DONE` 0.59, `PLATE_DONE` 0.49, `LANG_DONE` 0.35.
  - The card goes on the first beat 0.40 s after the Japanese step is done.
  - `CARD_D` is 3.532, and `END` sits on a frame (36.283). The 40 s `MAX_END` logic and `BED_LATE` are no longer needed: the bed offset is +0.277, and the splice is 9.044 to 36.026.
  - The output `CUTS` are {c1 2.771, mix3 10.601, c6 17.761, c8 29.753}, with `CARD` 32.751.
- `lib/film.js`:
  - Routes: `ROUTE_N` 24 with a new seed and the spacing rule above, ordered by bearing. `ROUTE_D` 0.24 with power3.out. `ROUTE_T0` = L1.sending, and the step is solved so that the 24th route lands on "eighty". Each route is a 6 px olive stroke under a 4 px white one, starting 16 px from the origin.
  - Crosses: endpoints 21 px and the origin 29 px, both with 3 px white arms over 5 px olive arms. `ORIGIN_T` = L1.they, printed by tone over 0.14 s.
  - Count: continuous from 1 at the first landing to 180 at the last. The pulse is a 4 px screen-gold stroke (fix round: an 8 px screen-gold stroke under the 4 px white, in a 10 px olive keyline).
  - Opener: `sceneOpen` raises the wordmark from L1.slash to L1.slash$ (fix round: to L1.building$).
  - Lockup: `MIX3_OUT` 0.21, `MIX3_LIGHT` 0.35, `LOCK_DONE` = MIX3 + 0.525. `sceneLock3` uses 0.35 s prints, the x from +0.14 and GT from +0.175.
  - The greeting row: seven new `.tx` nodes, seated as above, with `showText` arriving on their words and leaving on L6.slash over 0.21 s, plus their zones (fix round: one zone, `ROWBOX`, raised on L3.help; no leave, the row stands to `T.c6`; the wordmark's screen-gold pulse on L6.slash prints `slashGold`, a `makeTint` copy of `slashOpen`, through the cells whose threshold is at or over q).
  - Offer and plates: `COUNT_END` = L6.thousand. The bar raises over 0.35 s. The stem, plate and row timings follow the durations table. The pulse on L7.more runs down the stems' cores (fix round: the stems 42 ms apart, then each plate's outline in white, `MORE_LINE` 0.21; `MORE_PULSE` in `lib/cues.mjs` is 0.52).
  - App page: `T.c8` = L8.product. In `langAt` and `slotW` the steps scale to 0.084, 0.14 from +0.07, and 0.28.
  - Card: `CARD_MIX` 0.35, `CARD_OUT` 0.21, `CARD_LOCK` 0.07. The lockup prints over 0.35 s each, 0.04 apart. `CARD_LAND` is 0.53; remove the 0.74 floor, because at 3.532 s the old floor would cut the title's hold to 2.79 s. The rises start at 0.21 (T1), 0.238 (T2) and 0.29 (the link). `cardG` goes.
- `index.html`:
  - The `pe0` to `pe4` rows read Sign in, Pricing, Quickstart, Q3 review and Hero banner (`lang="en"`).
  - The `pt0` to `pt4` rows read ログイン (ja), الأسعار (ar, rtl), त्वरित शुरुआत (hi), 3분기 리뷰 (ko) and 首页横幅 (zh).
  - Seven greeting nodes: Hello (en), Hola (es), Bonjour (fr), こんにちは (ja), 안녕하세요 (ko), नमस्ते (hi), مرحبًا (ar, rtl).
  - The `#cardG` node goes, and `data-duration` becomes 36.283 on the root and on the mix.

### Records

- **`CREDITS.txt`** (copied to `out/slash-announcement.credits.txt`):
  - The header says v3, 36.283 s.
  - The globe paragraph says 24 routes.
  - "PICTURES" replaces the "every product" rows with the five strings and their translations. They were written for v3 as plain interface strings, not quotes from the post. The section also lists the seven greetings.
  - "MUSIC" describes the v3 re-cut (source 0.277, bar line 3 to 12, the chord on the card).
  - "THE OFFER" drops the legal line's sentence and keeps the URL and the offer.
  - Nothing else changes.
- **`out/scripts/source/slash-announcement.json`**:
  - The story drops ", subject to General Translation's review and approval".
  - Line 1's screen note (fix round): "The white Slash wordmark alone over slanted shafts of gold and straw light printed through a fine 3 px halftone screen, filling in through the screen across \"Slash is building\". On \"businesses\" the picture cuts to a dithered gold globe that prints from the top down. A white cross lands on its lit upper left on \"They\", and from \"sending\" 24 bold white routes draw out of it one after another, each ending in a white cross, while \"N / countries\" counts up to 180 on \"eighty\". On \"countries\" the \"+\" is set and a gold pulse runs out along every route, widening each line with gold as it passes. The routes pull back and every square of the globe turns into a letter from one of twenty writing systems, then every letter changes once to another script."
  - Line 3's (fix round): "Over the globe of scripts for the first words. On \"partner\" the globe and the figure fade out through the screen while the gold light returns and the Slash x GT lockup prints in reading order: the Slash wordmark, a white x, the GT mark. On \"help\" a dark band rises under the lockup, and from \"help\" to \"language\" the word Hello prints into it in seven languages, one per word: Hello, Hola, Bonjour, こんにちは, 안녕하세요, नमस्ते, مرحبًا."
  - Line 6's (fix round): "The lockup and the seven greetings stay up; on \"Slash\" the Slash wordmark pulses through the screen in gold and back. On \"up\" the picture cuts to the figure \"Up to $2,000 / in translation credits\", which rises and counts from $10 to $2,000 by \"thousand\". A bar of the gold light rises on \"credits\", and on \"surface\" five lines drop from it to five outlined plates, each with a small drawing of its surface and its own interface string along its foot: Sign in, Pricing, Quickstart, Q3 review, Hero banner."
  - Line 7's (fix round): "Each plate lights on its word, takes its label (App, Website, Docs, Slides, Design files) and turns its string into its language: ログイン (Japanese), الأسعار (Arabic), त्वरित शुरुआत (Hindi), 3분기 리뷰 (Korean), 首页横幅 (Chinese). On \"more\" a gold pulse runs down the five lines from left to right, and each plate's outline redraws in white as the pulse reaches it."
  - Line 8's: "On \"product\" the picture cuts to an app page with a language selector, \"Welcome back\", three cards and a \"Get started\" button, in English. It switches to Spanish on \"exist\", French on \"more\" and Japanese on \"language\"."
  - The card: "at" 32.751, and "On the music's held chord the app page fades out through the screen as the light changes, and the end card prints: the Slash x GT lockup in the top right corner on the light, then \"Up to $2,000 / in translation credits\" and generaltranslation.com/slash."
  - Export: `kit/script-export.py ... --voices "Narrator: Frederick Surrey" --version "v3"` with the title "Supporting Slash companies".
- **`NOTES.md`** gets a v3 section with the build as made (measurements, the two renders compared, the frame checks), and v2's notes stay below it.

### Delivery

1. Back up v2. Done; see above.
2. Run `node lib/cues.mjs` and `python3 lib/mix.py`. Then run `npx -y hyperframes@0.8.106 check .` and get 0 errors, including contrast on the greetings and the new rows.
3. Render with `npx -y hyperframes@0.8.106 render . -o <scratch>/slash-announcement.mp4 --quality delivery --fps 60 --workers 3`, detached in its own session as v2 was. The render log must have no fonts.googleapis or fonts.gstatic line. Render a second time and compare the two (byte-identical, or every second matched against lossless snapshots), because renders under load have dropped raster.
4. Check the render with `ffmpeg -af ebur128=peak=true`: −16 LUFS integrated within 0.5, true peak at or below −1.0 dBTP. Check faststart (moov before mdat).
5. Copy to `out/slash-announcement.mp4`. Write the poster `out/slash-announcement.png` with a lossless `snapshot --at 36.25`, then `kit/contact-sheet.sh` to `out/sheets/slash-announcement`, and `kit/script-export.py` to `out/scripts/slash-announcement.md` (title "Supporting Slash companies", `--version "v3"`, from the updated source JSON). Copy the credits to `out/slash-announcement.credits.txt`. Finish with NOTES.md and this storyboard's "as built" corrections.
6. No git commands that change state.


### As built (2026-10-08)

The clock, the words, the durations and every scene above are as built: `node lib/cues.mjs` returned the clock to the millisecond (cuts 2.771, 10.601, 17.761, 29.753; card 32.751; end 36.283, 2,177 frames). The corrections:

- **The routes' endpoints** keep one more rule: every route stands at least 5 degrees of bearing (seen from the origin) from every other, so no two routes share their first stretch. With the plan's three rules alone the closest pair was 1 to 2 degrees apart. The seed is 314 (of the 52 seeds in 1 to 400 that place all 24 under the four rules, the one whose shortest route is longest, 109 px). The fan starts after its widest bearing gap and sweeps clockwise from the top.
- **The keylines have butt caps.** Round caps joined into a half ring 16 px around the origin.
- **Each endpoint cross prints by tone over 0.08 s** as its route lands (the plan left it unspecified); the origin cross is drawn over the routes' roots.
- **The card trim's shelf is 0.12 s, not 1.0 s** (`lib/mix.py` `TRIM_RAMP`): the gap before the card is 0.769 s, and a 1.0 s shelf over all of it kept the gap's level and the chord's from being solved apart. Solved: alone gain -4.1 dB, duck -6.0 dB, trim -4.9 dB; the gap peaks at -20.3 LUFS momentary, the chord at -18.9 over its first 2 s.
- **The splice is confirmed** by `lib/mix.py`'s own measure (`splice_measure`, now in the mix report): 0.997 chroma on the bar before each point, 0.980 log-band on the beat before.
- **The greetings carry `data-layout-allow-occlusion`**, as the plate rows do, for their print through the cell clip.
- **The stills, measured on the final** (NOTES.md has the method): the opener 2.13 s, the greetings 1.55 s, the bar before the stems 1.70 s, the count landed 1.45 s, the plates before "app" 1.42 s, the lockup alone 1.23 s, the app page before the card 1.00 s, the card's settled hold 3.02 s. The longest still before the card is the opener's 2.13 s.
- **The final**: -16.1 LUFS integrated, -2.0 dBTP, faststart, check 0 errors with contrast 18 of 18; two renders byte-identical.

## v2 (the 40 s cut, 39.98 s), as built

General Translation's announcement film for the Slash partnership, on Kevin's script (`BRIEF.md`), cut to 40 s on his notes of 2026-10-08:

> 1. we liked the previous globe animation, this new one doesnt look as good
> 2. we use 3 px dither, currently all dithers are a lil TOO dithered
> 3. no need to say "we bank with slash"
> 4. cap it at 40 seconds.

Five narrated lines by Frederick Surrey, then a silent end card. 39.98 s at 1920 x 1080 and 60 fps (2,399 frames). v1 (74.3 s, eight lines) and its storyboard are in `archive-v1/`; the build lane's v2 before the fix round (39.969 s) is in `archive-v2-build/`.

The fix round (2026-10-08, on the critic's findings): the approved globe's screen-gold pulse on "countries" is back, with its "+" on "countries", and the bridge keeps 1.0 s holds after it (1.017 s each); the end card is 3.76 s, everything on it landing by 0.76 s so the title still holds 3.0 s; the "180+" figure leaves by tone with its "+" (its leave box was measured on the digits alone, so the "+" was clipped to a dash for 0.3 s); the plate rows are 40 px on one baseline along the plates' feet and the labels 44 px; the app page's selector and button labels are 44 px; the card's link is 48 px.

What changed from v1, by note:

1. **The globe** is the approved 19.5 s cut's (`../slash-partnership/lib/film.js`), drawn as it draws it: Kevin's dithered gold globe (centre 1300, 600, radius 380, spin 0.05 rad a second), 180 one-pixel white routes drawing out of one origin while "N / countries" counts them, the "+" and the screen-gold pulse along every route on "countries", then the globe turning into glyphs from twenty writing systems and stepping once to the next. v1's Blue Marble globe with routes out of the United States is gone.
2. **The screen** is 3 px everywhere: the kit's 8 by 8 Bayer tile on a 3 px cell grid anchored at the frame's top left, for the light, the globe and its glyph ground, the marks printing, the plate drawings and every tone step of DOM text. v1's 6 px screen is retired.
3. **Line 3** is "We're excited to partner with Slash to help ambitious companies reach customers in every language."
4. **40 s.** Lines 2, 4 and 5 and line 8's second sentence are cut (the orchestrator's cut, whole sentences in Kevin's order). The gaps sit near their floors and the bed is re-cut to twelve bars before its held chord.

### The script and the takes

| line | words (as recorded; the request text says "a hundred and eighty" and "two thousand dollars") | take |
| --- | --- | --- |
| 1 | Slash is building the financial command center for businesses. They support sending and receiving global payments to over 180 countries. | new (next: line 3) |
| 3 | We're excited to partner with Slash to help ambitious companies reach customers in every language. | new (prev: 1, next: 6) |
| 6 | So if you bank with Slash, we're giving you up to two thousand dollars in translation credits to localize any product surface. | new (prev: 3, next: 7) |
| 7 | That covers your app, website, documentation, slides, design files, and more. | v1's take (its words are exactly the line's) |
| 8 | Your product should exist in more than one language. | new, the first sentence alone (prev: 7, a falling close) |

### The clock

`lib/cues.mjs` places each line as early as its floors allow (each set piece complete plus 1.0 s of stillness, at least 0.5 s between two lines' words), then moves it later until its cut word lands on a beat of the bed (80.05 BPM, period 0.7495 s; the film's beats fall at 0.243 + 0.7495k). The phase is the one that lands the held chord earliest; it starts the bed 0.193 s after frame 0 from the source's own beginning (its first downbeat lands on "Slash" at 0.243), and the chord falls on the card's mix at 36.219. The film ends at 39.98 s, so its 2,399 frames and its AAC stay inside the 40 s cap; the card is 3.76 s.

| line | first word | last word ends | gap after | transition |
| --- | --- | --- | --- | --- |
| 1 | 0.24 | 8.74 | 3.31 s (the pulse and the glyph bridge) | (frame 0), then a hard cut on "They" 3.990 |
| 3 | 12.04 | 17.45 | 0.64 s | a tone mix on "partner" 12.984 |
| 6 | 18.10 | 24.78 | 0.50 s | a hard cut on "up" 20.479 |
| 7 | 25.28 | 31.90 | 0.57 s | none (the plates continue) |
| 8 | 32.47 | 34.99 | 1.23 s to the card | a hard cut on "Your" 32.471 |
| card | | | | a tone mix on the held chord 36.219, end 39.98 |

Every hard cut and the "partner" mix land on a beat. Pace rules: one main motion at a time; each set piece completes and stands still, apart from the slow light, at least 1.0 s before the next starts; a list said word by word (the five surfaces, the three language steps) is one set piece built on its words, each step landing before the next starts.

### 0.00 to 3.99: the opener (line 1, first sentence)

| time | word | event |
| --- | --- | --- |
| 0.00 | | Kevin's composition at its fitted phase, drifting 12 px a second along the shafts' normal. The Slash wordmark stands centred (x 755 to 1165, y 472 to 608, the lockup's size and baseline) at 40 percent tone through the 3 px screen. |
| 0.00 to 0.24 | "Slash" 0.24 | The wordmark raises its tone to full in Bayer order (smoothstep), complete on the word. |
| 0.24 to 3.99 | "is building ... businesses" | Hold, 3.75 s. Only the light moves. |

### 3.99 to 12.984: the payment globe and its glyph bridge (line 1, second sentence)

The approved 19.5 s cut's scene, retimed to this line's words and drawn on the 3 px grid.

| time | word | event |
| --- | --- | --- |
| 3.99 | "They" | Hard cut to the globe setting (olive, one broad gold shaft behind the globe, the approved cut's phase). Kevin's dithered globe (centre 1300, 600, radius 380) raises its tone from 0 in Bayer order, crown first, in gold, straw and white over olive (0.6 s); it turns at 0.05 rad a second. |
| 4.24 | | A white registration cross (17 px, 1 px arms), the origin, lands on the globe's lit upper left (1150, 420). |
| 5.79 to 7.775 | "global" to "eighty" | 180 routes draw out of the origin, one starting every 9.2 ms, each a 0.34 s great-circle arc lifted 4 percent, 1 px white, re-projected each frame; each endpoint lands as a 7 px white cross. |
| 6.13 | "payments" | "1 / countries" (Inter 500, 140 px, tabular figures, first ink x 160, cap tops y 172) rises as the first route lands (expo.out 0.5, the lines 60 ms apart), so it never reads "0 countries"; the figure counts the routes as they land. |
| 7.775 | "eighty" | The 180th route lands; the figure reads 180. |
| 8.158 to 8.783 | "countries" | The approved cut's pulse: the "+" is set, and a 2 px screen-gold stretch runs out of the origin along every route to its endpoint (0.5 s, ease none), its 0.25 tail clearing at 8.783. |
| 8.783 to 9.80 | | Hold, 1.017 s. |
| 9.80 to 10.50 | | The routes retract into their endpoints (power3.out 0.4) and the crosses leave by tone. Each 24 px block of the disc switches to one glyph from twenty writing systems, in Bayer order over 0.7 s. A switched block keeps the globe's tone as a smooth ground (olive toward gold by 0.76 of its value); its glyph is sized and inked by the block's light (lit glyphs white and up to 1.15 of the block, the land's larger, the dark side's smaller in straw and gold). |
| 10.50 to 11.517 | | Hold, 1.017 s. |
| 11.517 to 11.967 | | Every glyph steps once to its next writing system, in Bayer order (0.45 s). |
| 11.967 to 12.984 | "We're excited to" | Hold, 1.017 s. Line 3's first words play over the glyph globe. |

### 12.984 to 20.479: the lockup (line 3, line 6's first words)

| time | word | event |
| --- | --- | --- |
| 12.984 | "partner" | A tone mix. The glyph globe and "180+ / countries" leave by tone (their cells switch off in Bayer order, 0.3 s; the figure's leave box runs to the "+", so it dissolves with its digits) while the light mixes from the globe setting to Kevin's composition (0.5 s, the same Bayer order), its phase set so the fit lands as the lockup completes. Kevin's lockup prints in reading order, as the approved film's opener prints it: the Slash wordmark raises its tone (x 498 to 907, smoothstep 0.5 s), the white "x" (Inter 500, about 104 px, ink x 1016 to 1065, baseline 571) rises out of its mask from +0.2 s (expo.out 0.5), and the GT mark (x 1182 to 1415, y 466 to 613) raises its tone from +0.25 s (0.5 s). Complete at 13.734, on Kevin's image. |
| 13.734 to 20.479 | "with Slash ... in every language", "So if you bank with Slash, we're giving you" | Hold, 6.75 s. The lockup stands on the light uncleared, as in his image; only the light moves. "If you bank with Slash" is said over it. |

### 20.479 to 32.471: the offer and the surfaces (lines 6 and 7)

| time | word | event |
| --- | --- | --- |
| 20.479 | "up" | Hard cut to the diagram setting (olive, two narrow gold shafts at the upper right and lower left corners). "Up to $10 / in translation credits" (Inter 500, 140 px, tabular figures) rises, the lines 60 ms apart (expo.out 0.5), and the figure counts $10 to $2,000 in steps of $10 (ease none), its digits growing to the right. |
| 21.327 | "dollars" | The count lands on $2,000. |
| 22.325 | "credits" | The credits bar (x 160 to 1760, y 480 to 528) raises a lit stretch of Kevin's full light in Bayer order (0.5 s). |
| 24.206 to 25.046 | "surface" | Five doubled-line stems draw down out of crosses on the bar's lower edge (x 304, 632, 960, 1288, 1616), 60 ms apart. Each plate's 2 px straw outline (288 x 320, y 600 to 920) draws out of its top-left corner as its stem lands; its drawing (a phone, a web page, a docs page, a 16:9 slide, a design file with its artboards) prints on the 3 px grid as a screen-gold checker in the band y 676 to 826, 20 px in from the plate's edges; its row steps in by tone along the plate's foot, "Every product" (Inter 500, 40 px, baseline 884, x0 + 20), the five rows on one baseline. |
| 25.046 to 26.111 | | Hold, 1.065 s. |
| 26.111, 26.90, 27.794, 29.13, 30.14 | "app", "website", "documentation", "slides", "design" | On its word each plate lights (straw under a white checker), its label rises at its top left (App, Website, Docs, Slides, Design files; Inter 500, 44 px, baseline 650) and its row steps by tone to its script: すべての製品 (ja), كل منتج (ar, right to left, right edge x1 - 20), हर उत्पाद (hi), 모든 제품 (ko), 每个产品 (zh). Each row is one text node with its `lang` and `dir`. The last is complete at 30.84. |
| 30.84 to 32.471 | "files, and more" | Hold, 1.63 s. |

### 32.471 to 36.219: the app page (line 8)

| time | word | event |
| --- | --- | --- |
| 32.471 | "Your" | Hard cut to the diagram setting. The GIF's app page at frame width in the film's inks, centred (x 160 to 1760, y 290 to 790): a top bar (rule at y 386) with a straw logo square and three nav bars, the language selector right-anchored at x 1720 (2 px straw box 70 px tall, Inter 400 44 px label, Heroicons chevron at 2.2x), "Welcome back" (Inter 500, 72 px), two summary bars, three stat cards and the "Get started" button (white fill 68 px tall, Inter 500 44 px olive label). English. |
| 33.272 | "exist" | Spanish: "Español", "Hola de nuevo", "Comenzar". Each box's width tweens (power2.inOut 0.4 s) while its strings crossfade, as in the GIF. |
| 33.934 | "more" | French: "Français", "Bon retour", "Commencer". |
| 34.48 | "language" | Japanese: "日本語", "おかえりなさい", "始める". Complete about 34.98. |
| 34.98 to 36.219 | | Hold, 1.24 s. |

### 36.219 to 39.98: the end card (silent, 3.76 s)

Film-local, in the shared card's grammar (v1's card). Card seconds.

| t | event |
| --- | --- |
| 0.00 to 0.50 | A tone mix on the bed's held chord. The app page and its strings leave by tone (their cells switch off in Bayer order, 0.3 s) while the light changes from the diagram setting to the card's (0.5 s, the same Bayer order): Kevin's light above the diagonal from (560, 0) to (1920, 760), olive below. The leaving page keeps its clearance in proportion to what is left of it, so no text stands on arriving light. |
| 0.10 to 0.72 | The lockup prints in Bayer order in the mark corner at 0.80 of its size (Slash x 1024 to 1352; "x" baseline 244; GT x 1573 to 1760), in reading order (0.06 s apart, 0.5 s each). The mark corner is clear of the leaving page. |
| 0.30 to 0.76 | Once the page is gone, "Up to $2,000" and "in translation credits" rise out of their masks (Inter 500, 120 px, first ink x 160, baselines 676 and 798; expo.out, 40 ms apart). Line 6's words, so the last frame states the offer. |
| 0.42 to 0.76 | "generaltranslation.com/slash" rises (Inter 400, 48 px, white, x 160 to 753, baseline 920). The film's only URL. |
| 0.46 to 0.76 | "Translation credits are subject to General Translation’s review and approval." rises (Inter 400, 28 px, straw, x 826 to 1760, baseline 920), the post's sentence verbatim. |
| 0.76 to 3.76 | A 3.0 s settled hold (the title's reading floor, 6 words). The light's drift slows to rest (power2.out), so the last frame, the poster, is still. |

### Sound

The bed is the film's composed Music API bed (`audio/bed.mp3`), re-cut on its own bar lines by `lib/mix.py`: its 4-bar intro (source 0 to the bar line at 12.042), then from the bar line at 36.026 (the B section, A flat and C minor) through A' to the held E flat chord on the bar line at 60.01. Twelve bars stand before the chord. The beat before each splice point measures 0.985 spectral similarity (bar 3's last beat against bar 11's, so the splice plays the source's own A to B transition), the best of the twelve-bar candidates; the splice is an 80 ms equal-power crossfade ending on the bar line, at film 12.235, under line 3's "We're excited". The bed starts 0.193 s after frame 0 from the source's own beginning (its first downbeat on "Slash"), which lands the chord on the card's mix (36.219) and the film's beats on the grid the placement solved. No new music.

Mix: the narrator at -19 LUFS mono a take (lookahead ceiling -3.5 dBFS); the bed ducked under speech to about -26 LUFS, released in the gaps of 1.0 s or more (after line 1, before the card) and capped there at -20.3 LUFS momentary, the chord trimmed to -19.0 LUFS momentary over its first 2 s, a 0.3 s fade in where the bed starts and a 0.8 s fade out; one premix at -16 LUFS and -2.0 dBTP is the composition's one `<audio>` clip.

### Departures from Kevin's suggestions and from the approved globe

1. **No heading on line 8.** v1 set "Your product should exist / in more than one language"; its 9 words need 4.0 s on screen, which does not fit 40 s with the approved globe's bridge. The app page switching languages on the line's words says it in picture.
2. **The bridge's holds are 1.017 s** (the approved cut's were 0.25 and 0.84 s, and its switch started 0.45 s after "countries", while the pulse's tail still ran), for the 1.0 s rule: the pulse completes, the routes stand 1.0 s, then the switch. The pulse itself, its "+" on "countries" and everything else in the globe are the approved cut's.
3. **The end card is 3.76 s** (the build's was 4.5 s; the approved cut's 3.5 s). Restoring the pulse with a 1.0 s hold after it moved "partner" and every later line 0.75 s (one beat), and the 40 s cap takes that beat from the card. Everything on the card lands by 0.76 s, so the title still holds its 3.0 s reading floor.
4. **The lockup prints on "partner" by a tone mix from the glyph globe** (the approved film's opener lockup), instead of v1's slide from the centred wordmark after a cut on "We": the cut on "We're" would have left the centred wordmark 0.94 s before "partner", under the 1.0 s rule.
5. **No pulse on "more"** (v1's): the last plate is complete 0.74 s before "more".
6. **The app page stands centred** (y 290 to 790), since it has no heading above it.
7. **The plates' rows sit on one baseline along the plates' feet** (v1 set each row inside its drawing, at 28 px). At 40 px, legible on a phone, "Every product" is 249 px wide, which no drawing inside a 288 px plate can hold, so each drawing stands in the band above its row.

### The fix round (2026-10-08, on the critic's findings)

The tables above are corrected in place; each change is marked "fix round". In short:

- **Slash x GT.** The greetings stand to the hard cut on "up". On line 6's "Slash" the Slash wordmark pulses in screen gold across the spoken word (16.333 to 16.844): its cells step to screen gold in Bayer order and back, down to 40 percent white at 16.589. The bare lockup frame (v2's, and v3's last 1.22 s) is gone.
- **The band.** The greetings' clearance is one shape, the complete row's box, raised on "help" with Hello.
- **The opener.** The wordmark prints across "Slash is building" (to 1.238).
- **"More".** The stems' pulses run 42 ms apart from the left, and each plate's outline draws again in white as its pulse arrives (done 29.259; the last tail clears at 29.268).
- **The globe pulse.** Along its stretch each route widens to an 8 px screen-gold line under its 4 px white, in a 10 px olive keyline.
- The clock, the takes, the bed and the mix are unchanged. Measured on the final (NOTES.md): the opener's still 1.58 s, the row 1.60 s, after the Slash pulse 0.90 s, the longest still before the card 1.75 s (the credits bar before the stems), the card's settled hold 3.02 s; -16.1 LUFS, -2.0 dBTP; two renders byte-identical (md5 ab46dba3528e3d10081bfe2856971157).
