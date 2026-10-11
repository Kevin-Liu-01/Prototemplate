# How GT works: the GIF (notes)

OpenAI for Startups asked General Translation for a GIF of how the product works. Kevin: "lets make a gif showign exactly that in the redesigning docs video style except black and whtie and no dither in background. blue can be used as an accent color".

This is a 17.3 s seamless loop. It shows four steps, each in GT's own words and names, then a General Translation card:

1. Wrap the app's text in `<T>` from `gt-next`.
2. Run `npx gt translate`, which writes `public/_gt/es.json`, `fr.json` and `ja.json`. es.json shows its two translated strings.
3. Edit the translation on the Dashboard's Translations page and save it.
4. Switch the app between English, Español, Français and 日本語 with `<LocaleSelector />`.

The design, the sources for every string and the first storyboard are in `DESIGN.md`. DESIGN.md is unchanged. Where this build now differs from its section 7, the revised timeline below is the one the build follows.

## Deliverables (measured 2026-10-06, after fix round 1)

| File | Measured |
| --- | --- |
| `motion/out/gif-how-gt-works.gif` | 1280 x 720, 346 frames, every delay 50 ms (20 fps), loop 0 (infinite), 17.30 s, 1,256,499 bytes. 64-color palette, no dither. |
| `motion/out/gif-how-gt-works.mp4` | 1920 x 1080, H.264 High, yuv420p, 60 fps, 1038 frames, 17.30 s, no audio stream, 3,213,972 bytes. The moov box starts at byte 32 and mdat at byte 5090 (faststart). |
| `motion/out/gif-how-gt-works.png` | Poster, 1920 x 1080: MP4 frame 0 (story 2.70 s), the same picture as the GIF's first frame. |
| `motion/out/_sheets/gif-how-gt-works.png` | The checking sheet: one frame a second from the GIF in film order, six columns, 480 px tiles, time under each (`tools/sheet.py`). 2900 x 888. |
| `motion/out/sheets/gif-how-gt-works.png` and `.webp` | The record sheet MOTION.md asks for: two frames a second from the MP4 (`kit/contact-sheet.sh`), 8 x 5. |

Checks:

- `npx -y hyperframes@0.8.106 check .` and `check gif` both pass: lint 0 errors 0 warnings, runtime 0, layout 0 issues across 9 samples, motion 0, contrast 45 of 45 text checks pass WCAG AA.
- Neither render log has a Google Fonts line (no "Google Fonts", googleapis or gstatic). The only "Google" line in each log is the GPU probe's WebGL vendor string, "Google Inc. (Apple)".
- **The loop seam.** The GIF's frame 0 and frame 345, decoded by both ffmpeg and Pillow, differ by 0 pixels. GIF frames 345 and 0 to 12 are pixel-identical, a 0.70 s still (story 2.65 to 3.30). The source PNGs 1 and 346 are identical too. In the MP4, frames 1035 to 1037 are identical to each other. Frame 0 against frame 1037 is 48.2 dB, and the gap comes only from the encoder: frame 0 is an I-frame and 1037 a P-frame. Frames 0 and 1, both of the same still, differ by about as much (50.8 dB). Lossless 1920 snapshots of the composition at film times 0 and 17.2833 differ by 0 pixels.
- **GIF fidelity against its source frames.** The average PSNR is 61.0 dB and the worst frame is 56.1 dB (GIF frame 15, story 3.45 s, heading 1's drop). All six inks are exact palette entries: #070707, #101010, #ffffff, #8a8f98, #5c6068 and #86a8ff. No #2f5ce0 pixel appears in any frame.
- **Accent, one thing at a time,** measured on the GIF's own frames by finding pixels within 24 of #86a8ff (story times):
  - the `T` tokens from 0.75 to 3.45
  - three separate pulses at 5.80 to 6.05, 6.20 to 6.55 and 6.70 to 7.00, with a gap of at least 0.15 s between them
  - the draft Save from 9.30 to 9.65
  - one pulse from 10.30 to 10.45
  - the selector thumb from 11.65 to 14.75
  - none anywhere else, so none on the card (14.80 to 16.70), the frame-0 code or B1's first 0.7 s
- **Plate depth order.** Computed every 1/240 s from 5.0 to 12.0 s, the plate heights stay in paint order (es >= fr >= ja) at every step: 0 violations. All three are on the base at 11.4, when the turn to flat starts. At 11.25 es is 82.5, fr 24.4 and ja 3.1 px up.
- **No clipped labels.** Computed every 1/240 s through each B4 change from the measured widths, a button label that shows at all (alpha over 0.01) keeps at least 13.7 px of its box's 20 px right padding, and 18.0 px once its alpha passes 0.25. The selector label stays at least 13.3 px clear of the chevron. I checked GIF frames at 12.50 to 12.75, 13.30 to 13.55 and 14.05 to 14.30 by eye.
- **Type.** No text is under 24 px at 1280. Sizes are 24 (code, file tree, labels, tags, cells), 28 (options), 40 (app heading) and 72 (headings and the card's name). Japanese renders in Hiragino Sans through `var(--font)`'s `system-ui` fallback, with no tofu.
- **The turn stays inside the page box** (unchanged): x 712 to 1200 and y 184 to 664.

## The revised timeline (story seconds)

The render starts 2.70 s into the story (`OFF` in `lib/scene.js`). GIF frame k shows story time (0.05 k + 2.70) mod 17.3. GIF frame 0 and MP4 frame 0 are story 2.70.

| Story time | What happens |
| --- | --- |
| 0.0 to 3.5 | B1, as DESIGN.md: the insertion types from 0.4, the connectors and marked boxes land, and the still runs 2.65 to 3.30 (the seam). Heading 1 drops 3.3 to 3.5. |
| 3.5 to 7.5 | B2. The file tree is `public/_gt/` (L4, 4.3), `es.json` (L5, 5.2), `"Hola de nuevo"` (L6, 5.3), `"Comenzar ahora"` (L7, 5.37), `fr.json` (L8, 5.6) and `ja.json` (L9, 6.0). The connectors draw at 5.4 (es), 5.8 (fr) and 6.3 (ja). |
| 7.5 to 11.0 | B3. There is one component row, y 288 to 392. Source is "Welcome back" over "Get started", and Translation is "Hola de nuevo" over "Comenzar ahora", with line centres at 322 and 358. The focus box takes the whole Translation cell (344, 296, 224 x 88). Save is a #86a8ff fill with an ink label from 9.3 to 9.7, then a white fill with an ink label for two frames. The connector to the es plate runs straight at y 345. |
| 11.0 to 14.8 | B4. The plates come down lowest first: ja 11.0 to 11.3, fr 11.05 to 11.35, es 11.1 to 11.4. The page turns flat 11.4 to 11.9. The cycle runs English, Español (12.55), Français (13.3) and 日本語 (14.05), and ends on 日本語. Heading 4 drops 14.6 to 14.8. |
| 14.8 to 16.7 | B5, the card, a hard cut of the whole frame to the plain ground. It shows the white doubled-line GT mark, 176 px wide, top right at (1024, 80), and "General Translation" as the fifth heading, bottom left (baseline y 640). The name rises at 14.8 and drops 16.5 to 16.7. |
| 16.7 to 17.3 | A hard cut to the frame-0 code and the English page. Heading 1 rises. B1 holds until 0.4. |

Heading holds against the (words / 3) + 1 s floor: heading 1 3.9 s (floor 3.0), heading 2 3.8 s (2.67), heading 3 3.3 s (2.33), heading 4 3.6 s (2.67), the card's name 1.7 s (1.67).

## Files

- `index.html`: the MP4 root, 1920 x 1080, `data-duration` 17.3, with `#stage` at `scale(1.5)`.
- `gif/index.html`: the GIF root, 1280 x 720 at scale 1, `data-duration` 17.3. It is a sub-project with its own `hyperframes.json` and `meta.json`, and its `kit` and `lib` links point at `../kit` and `../lib`. See deviation 1.
- `lib/scene.js`: the whole scene, `GTScene.mount(stage)`. `render(time)` maps film time to story time (`storyAt`) and is a pure function of it. It is called from the paused timeline's onUpdate and writes every visible element on every call. `ready` resolves once the kit's font faces have loaded and every string is measured from its own text node in its own `lang`. `langAt` and `slotW` are returned too, for the clearance check.
- `lib/film.js`: drawing helpers copied from `films/blog-designing-docs/lib/film.js` (`el`, `cross`, `poly().sub`, the GT mark path, `markAt`, the eases) with the dither code left out. The original is untouched.
- `lib/scene.css`: the stage, the SVG text faces through `var(--font)` and `var(--mono)`, the headings, and `.hd.lock` for the card's name.
- `tools/sheet.py`: the checking sheet, after `journey-to-the-west/tools/sheet.py`.
- `renders/`: `gif-frames/` (the 346 PNGs), `palette.png`, `master.mp4`, the render and check logs, and `psnr-gif.txt` (the GIF's seam, PSNR, palette and accent measurements).

## Rebuild

```
cd motion/films/gif-how-gt-works
npx -y hyperframes@0.8.106 check .
npx -y hyperframes@0.8.106 check gif
rm -rf renders/gif-frames
npx -y hyperframes@0.8.106 render gif --format png-sequence --fps 20 --workers 3 -o renders/gif-frames
ffmpeg -y -framerate 20 -i renders/gif-frames/frame_%06d.png -vf "palettegen=max_colors=64:stats_mode=full:reserve_transparent=0" renders/palette.png
ffmpeg -y -framerate 20 -i renders/gif-frames/frame_%06d.png -i renders/palette.png -lavfi "[0:v][1:v]paletteuse=dither=none:diff_mode=rectangle" -loop 0 ../../out/gif-how-gt-works.gif
npx -y hyperframes@0.8.106 render . --quality delivery --fps 60 --workers 3 -o renders/master.mp4
ffmpeg -y -i renders/master.mp4 -map 0:v:0 -c copy -an -movflags +faststart ../../out/gif-how-gt-works.mp4
ffmpeg -y -i renders/master.mp4 -vf "select=eq(n\,0)" -vsync 0 -frames:v 1 ../../out/gif-how-gt-works.png
python3 tools/sheet.py ../../out/gif-how-gt-works.gif ../../out/_sheets/gif-how-gt-works.png
bash kit/contact-sheet.sh ../../out/gif-how-gt-works.mp4 ../../out/sheets/gif-how-gt-works
```

Clear `renders/gif-frames` before a render, or frames from a longer earlier render stay behind. In zsh, brace a variable that a colon follows (`${n}:stats_mode`), or zsh reads `:s` as a modifier.

## Where the build departs from DESIGN.md, and why

1. **The GIF root is `gif/index.html`, not `gif.html`.** With both files in one folder, `check` stops on `multiple_root_compositions` (error). The sub-project keeps one scene module for both sizes and still renders the GIF at its own pixel.
2. **There is no `#scene` clip wrapper.** The root holds `#stage` directly, which clears `nested_structure_needs_subcomposition`.
3. **The turn's parts are staged on the one curve.** The curve still has zero speed at both ends (smoothstep over 4.3 to 5.2 and back over 11.4 to 11.9). The scale moves over 0 to 0.45 of it, the 45 degree turn and tan 30 squash over 0.2 to 1, and the centre over all of it. Moving all three together pushed the page's corners to x 1219 and y 680, past the 1200 safe edge and out of the page box.
4. **Pulses and the thumb are solid #86a8ff runs over the core, the full 4 px gauge wide.** The design had them coloring only the two 1 px threads. The reference film's own pulses are solid (checked on its frames at 1.5 s and 32.5 s), and at 1 px the thread-only pulse barely showed at GIF size.
5. **Pulses run at one constant speed of 700 stage px a second.** On routes of 126 to 242 px they take 0.24 to 0.40 s, and they never overlap.
6. **The page's text and bars hand over in sequence, not as a 0.15 s crossfade.** Text goes out from 4.30 to 4.38 and the bars come in from 4.37 to 4.45. The bars go out from 11.90 to 11.98 and the text comes in from 11.97 to 12.05. The overlapping crossfade put the 12 px heading bar across "Welcome back" at 12.0 s, where it read as a strikethrough.
7. **Headings have no `will-change`.** On its own layer, heading 1 kept a raster made mid-rise, so the loop's last frames sat a fraction of a pixel off frame 0 (4,537 differing pixels at the seam). Painted in place, the seam is exact, and the rise still steps evenly, one whole pixel at a time.
8. **A ground rect is drawn in the art.** The PNG-sequence render drops the page background, which left the ground at alpha 0.
9. **Plate details the design left open.**
   - Side faces are 10 px at the full iso view.
   - Each plate's drop lines run to the plate just below it, so the plates above them hide them correctly.
   - A plate's heading, button and selector bars tween from the English widths to its language's widths as it lifts, and back as it comes down, so no bar pops when a plate leaves or rejoins the base.
10. **Small additions.**
    - A white 2 px caret shows while B1 types (0.50 to 1.45).
    - The Dashboard top bar has a rule at y 240.
    - Save sits at x 480 (the panel's 32 px inset) instead of 488.
    - The selector chevron is the 16 px Heroicon at 1.25 (20 px), because 16 px read as a speck.

## Fix round 1 (2026-10-06): the critic's findings and what changed

1. **Major: the plates came down in the wrong depth order.** es (the top plate) came down first and sank below fr and ja while it was still painted over them, from 11.20 to 11.50. Fix: the lowest plate now leaves first (ja 11.0 to 11.3, fr 11.05 to 11.35, es 11.1 to 11.4, power2.inOut). A higher plate that starts later on the same ease never falls below the one under it. All three are down by 11.4, when the turn starts. Verified with 0 order violations at 1/240 s steps, and on GIF frames 166 to 176 (story 11.0 to 11.5), where es sits over fr over ja in every frame.
2. **Minor: the button clipped its new label when it grew** ("Get startec" at 15.15, a tight "Commencer" at 13.35). Fix: a box that grows now runs ahead of its new label (c - 0.1 to c + 0.15), so it is 92 percent of the way when the label starts in at c + 0.1. A box that shrinks waits for the old label to fade (c + 0.05 to c + 0.35). The return to English, where the clip happened, is gone (see 4). Measured: at least 13.7 px of padding for any visible label.
3. **Minor: the Dashboard drew one `<T>` as two entries.** Fix: B3 is one component row. Its Source and Translation cells each hold both lines, as `GtjsonComponentSourceCell.tsx` on gt-cloud main renders a component's whole JSX children in one cell. The focus box takes the whole Translation cell, and the edit and caret are on its second line.
4. **Minor: General Translation was never named.** Fix: B5, a 1.9 s card after B4 in the reference film's end-card layout (mark top right, name bottom left) on the plain ground, with no accent. To make room, B4's cycle ends on 日本語. The page comes back in English with the cut out of the card, so the thumb's move up three rows and the page's last change are gone. The loop is 17.3 s (was 16.0).
5. **Minor: B2 never showed a translated word.** Fix: es.json now lists its two translated strings, quoted, under it in the tree: `"Hola de nuevo"` and `"Comenzar ahora"` (white strings, titanium quotes, `lang="es"`). This follows the home page's payload panel (`TranslateWindow.tsx`, PayloadJson), which shows translated leaves lit and punctuation faint. The hashed key is left out, because at 24 px mono a key line would run past the panel's 456 px measure. fr.json and ja.json move down to L8 and L9, and their connector routes move with them. The ja connector now draws at 6.3, so its pulse no longer runs back to back with the longer fr pulse.
6. **Minor: two blues.** Fix: #2f5ce0 is gone. The draft Save is a #86a8ff fill with an ink label (8.7 : 1), and the two-frame press is a white fill with an ink label. Measured: 0 pixels near #2f5ce0 in any GIF frame.
7. **Minor: frame 0 showed code without `<T>` under "You wrap your text in <T>".** Fix: the render starts 2.70 s into the story, so the first frame is the wrapped code with both connectors and both marked boxes. I did this in the composition (`OFF` in `lib/scene.js`) rather than by reordering frames after the render, so the GIF and the MP4 come straight out of the renderer already rotated, and no concatenation or extra encode was needed. The old seam (heading 1 over the unwrapped code, story 17.3 to 0.4) is now an interior still. The poster is MP4 frame 0.

The critic's two "acceptable as is" notes were left as they were: the saved edit's pulse to the es plate, and Japanese in Hiragino Sans.

## Credits and sources

- Strings, steps and names: see DESIGN.md sections 1 and 2. They come from the gt-cloud docs content (`apps/landing/content/docs/en-US`, read only) and from gt-cloud origin/main's landing components. For fix round 1 I also read `apps/landing/src/components/landing/home/sections/TranslateWindow.tsx` (PayloadJson and its file-shape comment) and `apps/dashboard/src/components/dashboard/translations/gtjson/GtjsonComponentSourceCell.tsx` on origin/main c8ee81676.
- Inter (`kit/fonts/InterVariable.woff2`, SIL OFL), through `var(--font)` only.
- Heroicons 2.2.0, 16 solid `chevron-down` (MIT, Tailwind Labs), copied from the Prototemplate node_modules.
- The doubled-line GT mark (`kit/brand/gt-mark.svg`), in the B3 top bar and on the card.
- The drawing grammar, the end-card layout and the helper code come from `films/blog-designing-docs`.

## Open questions for Kevin

Fix round 1 settled DESIGN.md questions 1 (the card) and 3 (frame 0) by following the critic. Either can be undone.

1. Keep the General Translation card? Without it the loop goes back to about 16 s, and B4 needs its return to English again so the page matches frame 0.
2. Should Locadex get its own beat?
3. Should the ground be #000000 instead of #070707?
4. Is "Comenzar ahora" to "Comenzar" the right edit to show?
5. Does OpenAI for Startups have a width, size or fps limit? The GIF is 1.26 MB at 1280 wide. An 800 px version would need the type floor checked again, since the smallest text, 24 px at 1280, would be 15 px at 800.
