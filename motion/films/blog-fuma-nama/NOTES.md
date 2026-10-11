# blog-fuma-nama: notes

## 2026-10-06, v4 flow and headings: the fix round (the current film)

The critic failed the first v4 render (the entry below) on three majors and eight minors. This round fixes the three majors and six of the minors, leaves two with reasons, and re-renders. The takes are unchanged and no ElevenLabs request was made except one speech-to-text check of the mix (`el.mjs hear`). The first v4 render's composition, `lib/`, storyboard, notes, bed master and segments, and its final, poster and sheet are in `archive-v4-pass1/` (`archive-v4-pass1/out/`). `DESIGN-v4.md` has a new "Fix round" section; `STORYBOARD.md` is rewritten.

### What changed, finding by finding

| finding | change | measured on the final |
| --- | --- | --- |
| Major: the 762 px moon popped in at 30.70, file glyphs left on the lit glass | The file's tone falls from its first frame (1 - (1 - u)^2, 30.50 to 31.00). The glow starts with it and rises on sine.inOut over 1.0 s (30.50 to 31.50; was power3.out 0.8 s from 30.70). | Mean luminance (480 x 270) 7.4 at 30.50, 6.7, 9.6, 13.8, 18.1 (31.00), 23.0, 26.5, 29.1, 31.0, 31.8 at 31.50, every 0.1 s. Largest one-frame change 30.4 to 31.6: 0.28 percent of pixels (first v4 cut: 4.5 percent at 30.75 on the same scan). The file's last glyphs go at 31.0, as the glow reaches half. |
| Major: the disc nearly empty from 44.9 to about 45.9 | On "scratch" the print lowers its tone to 0.3, not 0. From 46.38 each 36 px block of it leaves on the frame its glyph lands on it (`printGate`), so the fill replaces the print block by block. | 45.8 to 48.9 (186 frames): at least 19.8 percent of the disc lit in every frame, and every eighth of the disc (top to bottom) at least 15.1 percent lit (first v4 cut, 44.3 to 47.4: 0 and 0). Frames 45.9 to 48.85 read as one whole circle. |
| Major: lines 6 and 7 ran their steps back to back | Lines 7 to 9 moved later (line 7 +0.5 s, lines 8 and 9 +1.5 s; cuts at 37.5 and 44.5, card 55.5, film 59.5 s). Line 6 plays as three moves: the print on "four layers"; the seams run on into the parting on "that developers can take apart"; the slide runs on into the square-off on "and reshape" (done 35.75). Line 7 plays as the seams on "CLI", the parting run on into the shrink on "copy just", the lift and connector on "of contents", the heading on "into your codebase", and the travel and seat in the gap (42.30 to 43.50). | Still runs of 1.0 s or more (one-frame change under 0.75 percent), 31 to 45 s: 31.82 to 33.98, 35.53 to 37.48 (1.97 s), 37.52 to 38.55, 39.55 to 41.00, 41.30 to 42.72 and 42.97 to 44.48 (1.53 s). Motion onsets in 31 to 45 s: 31.62, 32.63, 33.97, 34.75, 37.50, 38.57, 41.02, 42.68 and 44.50 (first v4 cut, 31 to 43: 11). |
| Minor: zone clears and returns were events of their own | Every zone clears and returns over 0.6 to 1.0 s inside a running motion: "Fuma Nama" during the pulse, "Fumadocs" during the file's tone-down, "Into your codebase" during the shrink, the shelf's zones through the recede (which starts on "on top", 18.66), the heap's with the name's dissolve, the docs page's place while the crest settles; after the cut back the field stays off until the pieces return (44.88). Zones that change on a cut switch on the cut. | 23 motion onsets in 59.5 s (first v4 cut: 30 in 58), never more than two in any 1.0 s window. The onsets the critic traced to zones (19.78, 21.7, 30.73, 31.15, 39.72, 43.03 in old time) are gone. Largest one-frame change in the "Fuma Nama alone" hold 0.10 percent (was 0.70); the left half changes 6.9 percent from the cut back to the pieces' return, and that is the print's tone easing up, not the field (first v4 cut: 10.6 percent, the field flooding). |
| Minor: the 43.0 match cut was weak | The nav seam keeps its length through the shrink, its right cross easing to x 1768; the code panel moved to y 568 to 952 (14 rows) so the seam runs above it, and the part drops below the seam into the panel. After the cut the print comes back at 0.7 of its tone and eases to full over 0.4 s. | The seam runs x 113 to 1768 before the cut and x 928 to 1768 after it: 840 px of the line hold across the cut (was 280). Mean luminance 14.7 before the cut, 22.5 on it, 32.5 by 44.80 (first v4 cut: 14.8 to 33.1 in one frame). |
| Minor: "Fumadocs" stayed 4.9 s after its word | It drops into its mask as the layers part (33.82 to 34.27), after its floor (33.44). | Frames 33.90 (still set) and 34.30 (gone). It is on screen 31.55 to 34.27. |
| Minor: the glyph moon to glass flared | 0.8 s on sine.inOut (50.05 to 50.85; the glyphs switch off in Bayer order at the rate the glass glows up). | Mean luminance 12.6 at 50.10 to 43.4 at 50.80, 2 to 7 a tenth of a second; largest one-frame change 0.14 percent (first v4 cut: 12.5 to 43.6 in 0.44 s). |
| Minor: the rain began as a thin band | The rain starts with the name's dissolve (20.46), and each glyph's landing time follows its height to the power 1.8 (was 0.85), so the lower rows land fastest. | At 21.5 the landed glyphs stand from y 820 to the bottom across x 560 to 1920 (about ten rows) and the falling glyphs above already mark the mound's outline (first v4 cut: five rows on the bottom 110 px). The crest still lands on "JavaScript". |
| Minor: the pulses were too thin for a phone | Both pulses fill the doubled line's whole 9 px gauge in fire (the black core too) inside an 8 px fire glow. | Crops at 14.70 and 53.60: a solid fire band with a soft glow, about 25 px tall in all. |
| Minor: the render log was not kept | The final's render log is kept. | `../../out/logs/blog-fuma-nama.render.log`; it has no Google Fonts line. |
| Minor: the gaps sit 9 to 12 LU under speech | Not changed; see below. | |

### Left as they are, and why

- **The gaps' bed level.** The critic made this conditional on Kevin's ear. The gap swing target is under 4 LU, and with the 3 dB rise two gaps already swing 3.2 and 3.7 LU; a 5 dB rise would put them near 5. `RISE_DB` stays 3 until Kevin has listened (`RISE_DB=5 node lib/make-mix.mjs`, then the carve and the flatten, would change it).
- **"Fuma Nama" stays through line 3** (16.21 to 20.46, 3.5 s after "Nama"). Line 3 is about him ("Fuma Nama has built it for three years, on top of his schoolwork"), the heading is alone on the field for the last second as the hook frame's repeat, and it leaves as moving type into the heap, which is how shot 2 begins. The critic's fix named only "Fumadocs".
- **"Into your codebase" stays to the cut** (40.63 to 44.5, 2.6 s after "codebase"): the travel and seat it names play under it in the gap (42.30 to 43.50), and its floor ends at 43.50.

### Deliverables

- `../../out/blog-fuma-nama.mp4`: the final (render C), `--quality delivery --fps 60 --workers 3`, 10 min 16 s at load 130 to 650 with other lanes rendering. H.264 High 1920 x 1080 at 60 fps, 3570 frames, and AAC LC 48 kHz stereo at 195 kb/s; both streams 59.500 s. Boxes in order ftyp, moov, free, mdat (faststart as written).
- `../../out/logs/blog-fuma-nama.render.log`: the final's render log. It has no Google Fonts line; its only "Google" is the WebGL vendor string.
- `../../out/blog-fuma-nama.png`: the poster, the settled card at 59.48 (`snapshot --at 59.48 --no-end --describe false`), byte for byte the first v4 poster (the card is deterministic in card time).
- `../../out/sheets/blog-fuma-nama.png` and `.webp`: the 2 fps contact sheet (119 frames).

### Timing (measured, `lib/cues.mjs`)

| line | first sound | last word ends | gap before the next line | picture held in the gap |
| --- | --- | --- | --- | --- |
| 1 | 1.00 | 6.12 | 1.83 s | the print moon, its count and the empty shelves |
| 2 | 7.95 | 14.45 | 1.88 s | the full shelf and the lit moon |
| 3 | 16.33 | 19.94 | 1.09 s | "Fuma Nama" alone over the field |
| 4 | 21.03 | 24.75 | 1.59 s | the heap, then the docs page building |
| 5 | 26.34 | 29.05 | 1.99 s | the file, then the moon rising in its place |
| 6 | 31.04 | 35.62 | 2.04 s | the parted moon and the block (1.75 s still) |
| 7 | 37.66 | 41.86 | 2.77 s | the part's travel and seat, then the page at 0.625 and the seated part (1.0 s still) |
| 8 | 44.63 | 49.22 | 1.70 s | the glyph moon, then the glass |
| 9 | 50.92 | 54.42 | | the card at 55.5 (the first beat after 54.42 + 0.6) |

### The headings against the voice (speech to text of the final, `el.mjs hear`)

| heading | heard | rises | set | floor ends | leaves |
| --- | --- | --- | --- | --- | --- |
| One developer | One 1.04, developer 1.18 | 0.92, 1.12 | 1.67 | 3.34 | its cells land in the moon by 3.94 |
| Fuma Nama | Fuma 16.42, Nama 16.72 | 16.21, 16.65 | 17.20 | 18.87 | its cells fall into the heap from 20.46 |
| Fumadocs | Fumadocs 31.66 | 31.55 | 32.10 | 33.44 | drops into its mask 33.82 to 34.27 |
| Into your codebase | into 40.76, your 41.02, codebase 41.20 | 40.63, 40.95 | 41.50 | 43.50 | with the page at the cut (44.5) |

The transcript reads every line as scripted, "Vercel" included: "One developer created Fumadocs, a docs framework with over 13,000 stars on GitHub. Vercel Turborepo, Shadcn UI, Better Auth, Unkey, and many others use it. Fuma Nama has built it for three years on top of his schoolwork. ... Fumadocs is General Translation's first open source grantee." Frames 31.53 (no heading), 31.70 ("Fumadocs" rising), 33.90 (set), 34.30 (gone), 40.60 (none), 40.75 ("Into" rising), 41.05 ("your codebase" rising) and 41.50 (set) were read by eye.

### Pacing (measured on the final)

- Frame difference at 480 x 270 (share of pixels changing by more than 24 levels from the previous frame). Motion onsets (over 0.5 percent after at least 0.2 s of calm): 23 in 59.5 s, at 1.10, 3.35, 4.45, 5.25, 13.58, 16.30, 16.77, 18.75, 20.47, 28.53, 31.62, 32.63, 33.97, 34.75, 37.50, 38.57, 41.02, 42.68, 44.50, 51.03, 51.75, 55.17 and 55.70; never more than two in any 1.0 s window.
- Still runs of 1.0 s or more (every frame under 0.75 percent): 15, including 35.53 to 37.48, 37.52 to 38.55, 39.55 to 41.00, 41.30 to 42.72 and 42.97 to 44.48 in lines 6 and 7.
- Largest one-frame change inside each hold: shelves 0.11 percent, lit shelf 0.28, "Fuma Nama" alone 0.10, heap 0.06, file 0.10, block 0.04, seated part 0.01, glyph moon 0.06, grant 0.05. What changes across a hold is the slow smoke (the shelf moon's glass and the field's edges, read on difference maps).
- The two cuts are the only frames over 8 percent (27.3 at 37.50 and 25.2 at 44.50). The next largest are the pieces' return at 45.15 to 45.43 (6 to 8 percent) and the parting at 34.07 to 34.28 (6 percent).

### Sound

- **Bed:** `lib/make-bed.mjs` re-cuts round 5's bed to 59.5 s. Joins 1 to 4 are unchanged (9.69, 16.81, 26.92, 34.04). Joins 5 to 7 were re-searched under the moved lines: 39.83 under "of contents" (source 9.7845 into 16.447, worst dip -3.1 dB), 46.95 under "thinks Fumadocs" (round 5's B to A pair, -1.5 dB) and 51.33 under "Fumadocs is General" (source 8.3841 into 18.3088, -1.9 dB). The settle lands at 57.28, 1.78 s into the card. Master -16.0 LUFS, true peak -5.1 dBTP.
- **Mix:** levels unchanged (narrator masters -18.0 LUFS, bed +0.4 dB, duck 5.8 dB, 3 dB half-sine rise in gaps of 1.5 s or longer). `BRIDGE` and `HOLD_BACK` in `lib/make-mix.mjs` widened from 2.0 to 3.0 s, so the duck and the carve's dips hold across the 2.77 s gap after line 7 instead of releasing in it.
- **Measured on the final:** integrated -16.1 LUFS, true peak -2.6 dBTP, LRA 4.1 LU. Momentary loudness: median -15.2 LUFS in speech; in the gaps (0.5 s after the last word to 0.15 s before the next first sound) -27.8 to -20.3 LUFS, swinging 3.2, 3.7, 0.2, 1.5, 1.6, 2.5, 1.4 and 2.2 LU; -31.6 to -19.2 on the card as the bed settles.

### Rendering and the frame check

Render A (8 min 40 s) was the first of this round; its strips and scans showed a short dip in brightness at 30.8, where the file had gone before the glow was a fifth lit, so the glow was moved to start with the file's tone-down (30.50, 1.0 s). Render C is the final, and render D (10 min 0 s, at load up to 650) was rendered from the same composition to check it. Compared frame by frame at 960 x 540 (a frame differs where more than 20 pixels are more than 64 levels apart), C and D agree on all 3570 frames, and A differs from C only on frames 1834 to 1865 (30.57 to 31.08), where the glow changed. The decoded audio of A, C and D hashes the same (SHA-256 of s16le 48 kHz stereo, b5c22673...). No frame run dropped raster. After render C only the header comment of `index.html` changed (the card's start time and a summary of this round); `check` passes on it with 0 errors.

### Rebuilding

As in the entry below, from the film folder: `node lib/cues.mjs` (copy its CUE block into `index.html` if a placement changes), `node lib/make-bed.mjs`, `node lib/make-mix.mjs`, the carve (`carve.mjs --comp index.html --bed music-bed --strength 0.3 --core <folder with @hyperframes/core@0.8.106>`), `node lib/make-mix.mjs --flatten-carve-level`, `check`, then `render ... --quality delivery --fps 60 --workers 3 2>&1 | tee ../../out/logs/blog-fuma-nama.render.log`.

### Traps met in the fix round

- **A crossfade between two objects in one place dips if the outgoing one is gone before the incoming one is a third up.** Start both on the same frame and let the incoming one reach half as the outgoing one's last ink goes.
- **A zone that clears in a hold is a visible event.** The field's smoke is large and bright, so a 0.4 s clear reads as a motion of its own; clear it inside a motion that is already running, or switch it on a cut.
- **A seam that runs over a panel reads as cutting it.** To keep the nav seam on screen through the shrink, the code panel had to move below it (y 568) and the part had to drop into the panel below the seam.

### Open items

- Kevin to hear "Vercel" in line 2 (the v3 take, unchanged).
- Kevin to watch the pace at 59.5 s and to listen to the gaps: if they feel thin, raise `RISE_DB` (see above); if any hold feels long, the gaps after lines 6 and 7 can shrink by 0.5 s each through `lib/cues.mjs`, with joins 5 to 7 re-searched.
- Lint keeps one warning, `composition_file_too_large` (2720 lines in one file, by the lint's count). Layout keeps two infos at 16.53 s, while "Nama" still waits inside its mask.

## 2026-10-06, v4 flow and headings: the first render (superseded by the fix round above; its composition, lib/, storyboard, notes and outputs are in archive-v4-pass1/)

Kevin's note on the v3 cut, binding: "there are way too many headers in the blog videos and they dont actually line up with whats being said as well and theres too many visuals that are rapidly playing, which is not good, we can just increase the length if u need". Before it: "you should be fine with redoing visuals so that transition flows and headers are a lot better for the blog videos". The v4 cut builds `DESIGN-v4.md` on the v3 composition and Frederick Surrey's v3 takes (unchanged; no new takes, no ElevenLabs request). `STORYBOARD.md` is rewritten from the result. `SCRIPT-v3.md` keeps the words, the facts and the spectacle map.

What changed, in short:

- **Headings:** twelve type moments became four: "One developer" (line 1, "One" in fire), "Fuma Nama" (line 3), "Fumadocs" (line 6) and "Into your codebase" (line 7). Each is made of words said in its line, and each word rises 0.06 s before its own spoken start. One size (160 px), one line, one placement (ink on x 160, cap top 172, baseline 288.4). The eight round 7d post phrases, "On top of his schoolwork" and the line-1 wordmark are gone; the wordmark's job moves to line 6, where "Fumadocs" rises on the word beside the 762 px moon.
- **Pacing:** 58.0 s instead of 48.0. The takes keep their audio; the gaps between lines are 1.10 to 1.97 s (v3: 0.44 to 0.55), each holding a finished picture for at least 1.0 s. One main motion at a time, event starts at least 0.5 s apart.
- **Transitions:** two hard cuts instead of six, both match cuts on the y 540 seam, on a beat and a spoken word (37.0 "The", 43.0 "If"). Every other change of picture is an object that stays and transforms: the hook's cells become the moon's print, the name's cells become the first glyphs of the heap, the docs page builds above the held heap, the heap's glyphs travel into the file, the file lowers its tone as the moon rises in its place, the glyph moon turns to glass in the same disc, and that moon moves into the grant.
- **Scale:** marks 93 to 130 px tall in a 3 by 2 grid, counts 64 px (13.3k 92 px), shelf moon r 270, doubled lines 9 px (3 px threads), crosses 3 px arms 25 px across, fire outlines 3 px, pulses 200 px, the shot 3 docs page at 0.6 scale with 6 to 7.2 px bars on screen, the shot 5 page with 12 px bars, a 150 px connector to the code panel, the heap on a 24 px grid, the file made of the heap's own glyphs at 22 px, the glyph moon on a 36 px grid, the grant moon r 210.

### Deliverables

- `../../out/blog-fuma-nama.mp4`: the final (render C), `--quality delivery --fps 60 --workers 3`, 5 min 53 s at load 130 to 170. H.264 High 1920 x 1080 at 60 fps, 3480 frames, and AAC LC 48 kHz stereo at 196 kb/s; both streams 58.000 s. Boxes in order ftyp, moov, free, mdat (faststart as written). The render log has no Google Fonts line (its only "Google" is the WebGL vendor string).
- `../../out/blog-fuma-nama.png`: the poster, the settled card at 57.98 (`snapshot --at 57.98 --no-end --describe false`). It is byte for byte v3's poster: the card is deterministic in card time.
- `../../out/sheets/blog-fuma-nama.png` and `.webp`: the 2 fps contact sheet (`kit/contact-sheet.sh`).
- The v3 final, poster and sheet are in `../../out/v10/` (`blog-fuma-nama.mp4`, `.png`, `.sheet.png`), copied before anything was replaced.

### Archive

- `archive-v3/`: the v3 composition (`index.html`), `lib/` and `STORYBOARD.md`, byte-identical to the files this cut replaced.
- The narrator masters (`audio/vo-N.master.wav`) are rebuilt from the same takes at -18.0 LUFS (v3: -18.9); the takes themselves (`audio/vo-N.mp3`, `.json`) are untouched.

### Timing (measured, `lib/cues.mjs`)

| line | first sound | last word ends | gap before the next line | picture held in the gap |
| --- | --- | --- | --- | --- |
| 1 | 1.00 | 6.12 | 1.83 s | the print moon, its count and the empty shelves |
| 2 | 7.95 | 14.45 | 1.87 s | the full shelf and the lit moon |
| 3 | 16.33 | 19.94 | 1.10 s | "Fuma Nama" alone over the field |
| 4 | 21.03 | 24.75 | 1.56 s | the heap, then the docs page building |
| 5 | 26.34 | 29.05 | 1.97 s | the file, then the moon rising in its place |
| 6 | 31.04 | 35.62 | 1.61 s | the parted moon and the block |
| 7 | 37.16 | 41.36 | 1.83 s | the page at 0.625 and the seated part |
| 8 | 43.13 | 47.72 | 1.72 s | the glyph moon, then the glass |
| 9 | 49.42 | 52.92 | | the card at 54.0 (the first beat after 52.92 + 0.6) |

### The headings against the voice (read on the final's frames)

| heading | words spoken (film s) | rises | set | floor ends | on screen | leaves |
| --- | --- | --- | --- | --- | --- | --- |
| One developer | One 0.98 to 1.14, developer 1.18 to 1.57 | 0.92, 1.12 | 1.67 | 3.34 | 0.92 to 3.34 | its cells land in the moon by 3.94 |
| Fuma Nama | Fuma 16.27 to 16.65, Nama 16.71 to 17.00 | 16.21, 16.65 | 17.20 | 18.87 | 16.21 to 20.46 | its cells fall into the heap; unreadable by 20.70 |
| Fumadocs | Fumadocs 31.61 to 32.10 | 31.55 | 32.10 | 33.44 | 31.55 to 37.0 | with the moon at the cut |
| Into your codebase | into 40.19, your 40.51, codebase 40.68 to 41.36 | 40.13, 40.45 | 41.00 | 43.00 | 40.13 to 43.0 | with the page at the cut |

Frames 1.00 and 1.20 show "One" and then "developer" mid-rise; 16.40 shows "Fuma" set and "Nama" not yet risen, 16.80 "Nama" mid-rise; 31.53 shows no heading and 31.70 "Fumadocs" rising; 40.10 shows no heading, 40.30 "Into" alone and 40.60 "your codebase" mid-rise. Nothing else moves during any rise.

### Pacing (measured on the final)

- Frame difference at 480 x 270 (share of pixels changing by more than 24 levels from the previous frame), through each hold of DESIGN-v4: shelves 0.11 percent at worst, lit shelf 0.07, "Fuma Nama" alone 0.70 (the field returning where the shelf was), heap 0.52 (the heap's light drift), file 0.12, block 0.04, seated part 0.01, glyph moon 0.06, grant 0.05. Every hold reads as still apart from the smoke.
- Motion onsets (a frame changing more than 0.5 percent of the picture after at least 0.2 s of calm): 30 in 58 s, and never more than two in any 1.0 s window.
- The 2 fps contact sheet shows each heading only while its words are heard, and no frame without a picture: the field is on screen from frame 0, and the glyph moon now starts filling as the print's last tone goes (44.88).

### Spectacle map, checked on the final

Every piece of SCRIPT-v3's map plays, now with the time DESIGN-v4 gives it (STORYBOARD.md has every start and length): the field (0 to 54), its zones, the opening tone rise, the four heading mask rises, the hook frame in fire and its repeat, the two moving-type transitions, the print mixing into glass (on the pulse's arrival), the Fumadocs lockup (line 6), the moon moving to a new place (into the grant), the shelf moon, 13.3k tallying onto "stars", the doubled-line rule (two shelves), the six marks with their counts and the GT mark in fire, the pulse along the shelf, the glyph heap and its rain (crest on "JavaScript"), the heap's light drift, the docs page building and leaving and its highlight step on "look", the file lit in the material (now built from the heap's glyphs) and its lit band, the 762 px glass moon raising its glow from black (twice), the crosses, the glass-to-print mix, the three seams, the parting and spread (one move), the slot's fire outline, the slide, the square-off, the connector, the page cut by three seams, the parts moving apart, the shrink, the code panel, the lift and its outline, the connector, travel, rows and seat, the sun run, the pieces returning, the print leaving, the glyph moon in 16 writing systems, the GT mark forming in the card's box, the grant connector, the pulse into the moon and its thickening, the grant re-laid, spoken-word headings, and the shared end card.

### Deviations from DESIGN-v4, and why

- **The grant moon stays on mount B; mount D is gone.** The design hands the moon over from B to D after its move. A handover between a full-frame mount and a 490 px square mount cannot be checked identical by construction (different canvases), and a mismatch would pop on one frame. B carries the moon from the glyph moon's disc through the move to the card, on one smoke clock. Mount C is now under B in the DOM: each mount draws an opaque black ground, and B is clipped to its circle. On the first build C sat over B and its ground hid the grant moon from 50.21 (found on the snapshots and fixed before the final).
- **The hook's floor ends at 3.34, not 3.33** (set 1.67 + 2/3 + 1 = 3.337).
- **"Into" rises at 40.13 and shadcn/ui lights at 9.48** (the design wrote 40.12 and 9.47): the takes' alignment puts "into" at 40.19 and "shad" at 9.52, and every rise and mark is keyed to its word.
- **The nav and the body each move 12 px about the nav seam on "copy"** (the design: the nav up 24 px). The nav seam is drawn in the middle of the gap the parting opens, as the other seams are, so it stays on y 540 only if both sides move. The nav's top at 0.625 is y 490 (the design: 482); "Into your codebase" still ends above y 330.
- **The heap's crest is near (1240, 515)** (the design: near (1344, 580)). The mound is v3's shape lowered 60 px as the design asks; its peak term is centred at x 1344, but the shape's other terms put the highest glyphs about 100 px left of it. No glyph stands in the docs page's place.
- **`pile-core` is back, along a path.** The field's smoke prints the same dark ring v3 met (its clock is unchanged), at about (1210, 352) from 19.5 s drifting to (1150, 325) by 25.0 s. The shelf moon's zone hid it until the shelf receded; from 18.86 a zone of discs (r 58) along that path holds the field off it, and it gives the place back from 25.34, when the docs page's zone covers it.
- **Shot 4's connector follows the layer's right edge.** The layer is 738 px wide, so its edge clears the slot only near the end of the slide; the connector's free end follows it through the slide and the square-off to the block, and the slot's cross opens as the edge clears it (on the first build the cross stood over the sliding layer).
- **The glyph moon starts filling at 44.88**, as the print's tone reaches 0 (the design: 45.17). With the design's start the disc's place was empty for 0.29 s (44.88 to 45.17) on the first render, and the right half of the frame was nearly empty. The fill now takes 2.43 s and still ends on "shape".
- **"Fuma Nama" loosens by up to 30 px over 0.24 s** before its cells fall, so it is unreadable by 20.70 as the design asks; with 15 px over 0.15 s (the first render) "Nama" could still be read at 20.70.
- **The heading zones keep v3's distances** (44 px black, 230 px ramp). The design says "a 60 px ramp, as in v3"; v3's ramp is 230 px and 60 px is its smoke shift.
- **The narrator masters are -18.0 LUFS** (v3: -18.9) and the bed's level gain is +0.4 dB (v3: -0.5). With v3's levels the 58 s mix read -16.9 LUFS: the longer gaps carry only the ducked bed. Both moved by 0.9 dB, so the bed stays 11 dB under the narrator.
- **The file's lit band lies across the upper and middle blocks** (sun and white glyphs in lines 1 to 16), not the middle block alone.

### Sound

- **Bed:** `lib/make-bed.mjs` re-cuts round 5's bed (`audio/archive-r6a/bed.mp3`) to 58.0 s: A, B, A, B, A, B, A, B and the source's own settle. Seven joins, each a 0.6 s raised-cosine crossfade under continuous speech (not across a pause inside a line): 9.69 ("shadcn/ui"), 16.81 ("Nama has built"), 26.92 ("look at any documentation"), 34.04 ("apart"), 38.73 ("just the table"), 45.85 ("Fumadocs would probably") and 49.77 ("Fumadocs is General"). Worst drone dips -2.5, -1.5, -3.5, -1.5, -3.0, -1.5 and -1.8 dB (v3: -1.5 to -3.4). B runs 7.12 s from 16.447 to its B to A pair, so each B to A join sits 7.12 s after its A to B join, which ties the chain to the lines. The last join enters B late, at source 18.3088, so the settle begins at 55.72, 1.72 s into the card. `make-bed.mjs` gained an incoming-side search (`inWin`) to find it. Master -16.0 LUFS, true peak -5.2 dBTP.
- **Mix:** `lib/make-mix.mjs`, the carve at strength 0.3 (dips at 160 Hz, 250 Hz and 2.5 kHz), `--flatten-carve-level`. The duck (5.8 dB) holds across every gap (BRIDGE 2.0 s). In each gap of 1.5 s or longer the bed rises 3 dB on a half-sine from 0.15 s after the last word back to full depth 0.05 s before the next first sound; the 1.10 s gap after line 3 holds flat. The carve's dips hold across the whole gap (HOLD_BACK 2.0 s), so only the rise moves the bed there. After line 9 the duck lets go over 0.8 s to -1.5 dB for the card, and the bed fades over its last 0.8 s.
- **Measured on the final:** integrated -16.0 LUFS, true peak -2.5 dBTP, LRA 3.7 LU. Stems (audio-only renders of `make-mix.mjs --stems`, in the session scratch folder): the narrator -14.9 LUFS inside the lines, the bed -26.0 LUFS under speech (11.1 dB under him) and -20.6 LUFS on the card (54.0 to 57.2). In the gaps the bed alone swings 3.1, 3.5, 0.2, 1.3, 1.5, 2.6, 2.4 and 1.6 LU (momentary loudness, from 0.5 s after the last word to 0.15 s before the next first sound).

### Rendering and the frame check

The first delivery render (A, 5 min 32 s) found the two problems above (the near-empty disc at 44.9 and the legible name at 20.70); the fixed composition was rendered twice (C, 5 min 53 s, then D, 5 min 35 s, at load 130 to 170 with other lanes rendering). Compared frame by frame at 960 x 540 (a frame differs where more than 20 pixels are more than 64 levels apart): C and D agree on all 3480 frames, and their decoded audio hashes the same (SHA-256 of s16le 48 kHz stereo, 95862367...). C also differs from A only where the composition changed (20.47 to 21.40 and 44.88 to 47.22). So every frame of the final agrees with a second render; no frame run dropped raster. C is the final. Before the final renders, 104 frames of A (every heading change and both sides of every transition, `pick.py` in the session scratch folder) and the changed passages of the snapshots were read by eye.

### Rebuilding

From the film folder:

```
node lib/make-voice.mjs          # audio/vo-N.master.wav from the nine takes (-18.0 LUFS)
node lib/cues.mjs                # the word times; copy its CUE block into index.html if a placement changed
node lib/make-bed.mjs            # audio/bed.master.wav and bed.segments.json; --search re-derives a pin (win or inWin on its join)
node lib/make-mix.mjs            # the mix block in index.html
node <hyperframes-audio skill>/scripts/carve.mjs --comp index.html --bed music-bed --strength 0.3 --core <folder with @hyperframes/core@0.8.106>
node lib/make-mix.mjs --flatten-carve-level
npx -y hyperframes@0.8.106 check .
npx -y hyperframes@0.8.106 render . -o ../../out/blog-fuma-nama.mp4 --quality delivery --fps 60 --workers 3
```

The carve's `@hyperframes/core@0.8.106` is not installed anywhere in the motion tree; this cut installed it in the session scratch folder (`npm i @hyperframes/core@0.8.106`). To measure the mix alone, write the stems (`node lib/make-mix.mjs --stems <dir>`), put each stem's HTML as `index.html` in a folder with links to this film's `kit/` and `audio/`, and render it at `--fps 1 --quality draft` (1 min 30 s).

### Traps met in the v4 cut

- **Two full-frame gem mounts stack by DOM order, and each draws an opaque ground.** Only the top one's clip lets the lower one show. Put the clipped mount (the moon) over the unclipped one (the GT mark).
- **`check` reports "text_occluded" for a heading at a time when its words still wait inside their masks** (16.11 s, before "Fuma" rises). It is an info, not a fault.
- **A heading made of inline-block word masks:** measure the units' x from the seated left edge and the canvas face's advances, not from `getBoundingClientRect`, because a clip outside its window may not be laid out at boot.

### Open items

- Kevin to hear "Vercel" in line 2 (unchanged from v3: the kept take passes on measurement, and no person has listened to it).
- Kevin to watch the pace at 58 s. The gaps can shrink toward v3's if he finds any hold too long; each gap's picture and the bed's joins would move with `lib/cues.mjs`.

## 2026-10-06, v3 build (superseded by the v4 cut; its composition, scripts and storyboard are in archive-v3/, its final and poster in ../../out/v10/)

Kevin's notes on the round 8 cut: too slow, not very interesting, the script weird; he loves the diagrams and visuals. Then: "we need to convey the gravitas better earlier. vercel is pronounced with the ver of version and cel of acceleration. shadcn is like the shad of shaddy. for both the new videos keep all the visual spectacle, i would hate to see removals. make the script not driven by quotes but tell its own story." And on 2026-10-06: "remember, we're using Frederick Surrey". The film is rebuilt end to end on `SCRIPT-v3.md`: nine new lines in Frederick Surrey's voice, the composition on round 8's with SCRIPT-v3's shot list (every set piece kept and retimed, v2's new visuals built), the round 5 bed re-cut, the mix, the render and the checks. `STORYBOARD.md` is rewritten from his takes (round 8's is `archive/STORYBOARD-r8.md`). SCRIPT-v3's voice section now names Frederick Surrey (its Clara version is `archive/SCRIPT-v3-clara.md`). `SCRIPT.md` and `SCRIPT-v2.md` are unchanged.

The composition code is the stopped v3 build's (`archive-v3-stopped/index.html` and `lib/`): round 8's composition with SCRIPT-v3's shot list built, every event keyed to a spoken word through `CUE`. Its Clara takes were not used. Every time in it now comes from Frederick's takes: `lib/cues.mjs` (FIRST_SOUND, CUTS, CARD), the CUE table, the clip windows of the twelve headings, the glyph moon and the counts, and the root duration.

A critic then passed the build with six minors. The fix round ("After the critic" below) moved 13.3k onto "13" and held the field off a ring in the heap shot; the other four are left with their reasons. The numbers in this section are the fix round's final.

### Deliverables

- `../../out/blog-fuma-nama.mp4`: the final, `--quality delivery --fps 60 --workers 3`, the fix round's third render (9 min 41 s at load about 140 to 330; the first two each had a bad frame run, see "After the critic"). H.264 High 1920 x 1080 at 60 fps, 2880 frames, 5.85 Mb/s, and AAC LC 48 kHz stereo at 197 kb/s. Both streams are 48.000 s. The moov atom is ahead of the mdat (faststart as written; no remux needed). The render log has no Google Fonts line (its only "Google" is the WebGL vendor string, "Google Inc. (Apple)").
- `../../out/blog-fuma-nama.png`: the poster, the settled end card at 47.98 s (`snapshot --at 47.98 --no-end --describe false`, hardware GPU; snapshotted again in the fix round, byte for byte the same file). It is byte for byte round 8's poster (`../../out/v9/blog-fuma-nama.png`): the shared card is deterministic in card time and its title and link are unchanged.
- `../../out/_sheets/blog-fuma-nama.png`: the contact sheet of the final, one frame per second, six columns of 480 px tiles, 2929 x 2399 (rebuilt from the fix round's final).
- The first render of this build (before the heading-roll fix) is kept in the session scratch folder (`fuma/final-pass1.mp4`); the final differs from it only in the three rolls.
- Moved, not deleted: the stopped v3 build's render, draft, poster and sheet (Clara, 48.5 s) are in `archive-v3-stopped/out/`. Round 8's final and poster stay in `../../out/v9/` (untouched).

### Archive

- The round 7d takes (vo-1 to vo-8 with their masters and checks) and round 8's bed master and `bed.segments.json` were moved into `audio/archive-r7d-final/`, which already held byte-identical copies of every one of them (`cmp`, 2026-10-06).
- Round 8's composition, scripts and storyboard are `archive/index-r8.html`, `archive/lib-r8/` and `archive/STORYBOARD-r8.md` (byte-identical to the files this build replaced).
- The build as the critic reviewed it (its `index.html`, NOTES.md and STORYBOARD.md, and its final, poster and sheet) is `archive-v3-pass1/`; its final is `archive-v3-pass1/out/blog-fuma-nama.mp4`.
- This build's audition and rejected takes are in `audio/takes-v3/`. The stopped builds' takes stay in `audio/archive-v2-stopped/` and `archive-v3-stopped/audio/` (Clara; none reused).

### Takes (ElevenLabs ledger, v3 build)

Every request used `kit/audio/voice.json` (no `EL_VOICE_FILE`, no `--voice`), and every take's `.json` "voice" reads "Frederick Surrey (British, history and science documentary; ElevenLabs library)" (j9jfwdrw7BRfcR43Qohk, eleven_multilingual_v2, speed 1). Each line was sent with `--prev` and `--next` set to its neighbouring v3 lines in their voice text (line 1 without `--prev`, line 9 without `--next`), through `el.mjs line` (the batch driver is in the session scratch folder).

| request | text sent | result | used |
| --- | --- | --- | --- |
| line 1 | "One developer created Fumadocs, a docs framework with over 13,000 stars on GitHub." (82) | 5.90 s; speech 5.12 s; a 0.39 s pause after "Fumadocs" | yes |
| line 2, take 1 | "Vercel Turborepo, shad C N U I, Better Auth, Unkey and many others use it." (74) | 7.20 s. "Ver" is his "version" vowel (F1 400 to 480 Hz, F2 1330 to 1400), but "cel" has no vowel: F1 270 to 320, F2 820 to 970, a syllabic dark l ("VER-sl"), 5 dB under "Ver". Mis-said. | no (`takes-v3/vo-2.take1.*`) |
| audition | "Version. Acceleration. Vercel." (30) | 2.88 s. His "version": F1 470 to 490, F2 1320 to 1430. His "acceleration" cel: F1 480 to 670, F2 1520 falling to 1285 into the dark l. His plain "Vercel" again reduced "cel" to a dark l (F1 360 to 420, F2 745 to 915). | reference (`takes-v3/audition-vercel.*`) |
| line 2, take 2 | "Vur-sell Turborepo, shad C N U I, ..." (76) | 7.25 s. "sell" has his "acceleration" vowel (F1 460 to 590, F2 1405 falling into the l), but "Vur" opens rounded (F2 1010 to 1190 for 0.08 s before it reaches 1300). Mis-said on its first syllable. | no (`takes-v3/vo-2.take2.*`) |
| line 2, take 3 | "Vursell Turborepo, shad C N U I, ..." (75) | 7.20 s; speech 6.50 s. "Vur" F1 about 400, F2 1280 to 1460 from its onset; "sell" F1 460 to 535, F2 1420 falling to 900 into the l, 0.14 s voiced; the pitch peaks on "sell" (133 Hz against 106 Hz on "Vur"), so the stress is ver-SELL. "shad" F1 610 to 750, F2 1495 to 1550 (the TRAP vowel of "had"). `hear`: "Vercel Turborepo, ShadCNUI, BetterAuth, Unkey, and many others use it". | yes |
| line 3 | "Fuma Nama has built it for three years, on top of his schoolwork." (65) | 4.37 s; speech 3.61 s | yes |
| line 4 | "He learned to code by modding games and reading piles of JavaScript." (68) | 4.50 s; speech 3.72 s | yes |
| line 5 | "He did not look at any documentation while he was learning." (59) | 3.67 s; speech 2.71 s | yes |
| line 6 | "He designed Fumadocs in four layers that developers can take apart and reshape." (79) | 5.25 s; speech 4.58 s | yes |
| line 7 | "The C L I can copy just the table of contents into your codebase." (65) | 4.83 s; speech 4.20 s; C, L, I 0.23 and 0.20 s apart | yes |
| line 8, take 1 | "If he started again from scratch, he thinks Fumadocs would have the same shape." (79) | 4.64 s; speech 4.03 s | no (`takes-v3/vo-8.take1.*`), see "probably" below |
| line 8, take 2 | "If he started again from scratch, he thinks Fumadocs would probably have the same shape." (88) | 5.99 s; speech 4.59 s; a 0.50 s pause after "scratch" | yes |
| line 9 | "Fumadocs is General Translation’s first open-source grantee." (60) | 3.76 s; speech 3.50 s | yes |
| STT | the nine first takes, line 2's takes 2 and 3, line 8's take 2, and the final | as above and below | checks |

TTS characters sent: 900 (the nine lines 631, retakes 239, the audition 30); the neighbours' context goes as `previous_text` and `next_text`. `hear` returned every word of every take in order. Written by the transcriber: "Fumadocs" right in line 1 and as "Fumodox" or "Fumadox" in lines 6, 8 and 9 (the same sounds, FOO-mah-docks, with his reduced middle vowel; not retaken), "Fuma Nama", "Turbo repo" or "Turborepo", "shadcn-ui" or "ShadCNUI", "better-auth" or "BetterAuth", "Unkey" (no longer "Anki"), "CLI", "code base", "General Translation's" and "open source". No name was misheard. Masters (`lib/make-voice.mjs`): the raw takes read -22 to -23 LUFS; every master is -18.9 LUFS mono with a true peak of -3.6 to -4.5 dBTP.

### Timing (measured, `lib/cues.mjs`)

| line | first sound | last word ends | silence before the next line (voice stem, below -50 dBFS) | cut after it |
| --- | --- | --- | --- | --- |
| 1 | 0.50 | 5.62 | 0.53 s | none (shot 1) |
| 2 | 6.17 | 12.67 | 0.47 s | none (shot 1) |
| 3 | 13.22 | 16.83 | 0.44 s | 17.0 (0.17 after, 0.30 before line 4) |
| 4 | 17.30 | 21.02 | 0.49 s | 21.5 (0.48 after, 0.05 before) |
| 5 | 21.55 | 24.26 | 0.44 s | 24.5 (0.24 after, 0.28 before) |
| 6 | 24.78 | 29.36 | 0.50 s | 29.5 (0.14 after, 0.30 before) |
| 7 | 29.80 | 34.00 | 0.57 s | 34.5 (0.50 after, 0.02 before) |
| 8 | 34.52 | 39.11 | 0.49 s | 39.5 (0.39 after, 0.12 before) |
| 9 | 39.62 | 43.12 | | the card at 44.0, 0.88 s after the last word |

The longest silence inside a line is 0.51 s (line 2, between "C N U I" and "Better"). Key words in film time: "One" 0.48, "Fumadocs" 1.57 to 2.19, "docs" 2.72, "13" 3.86, "stars" 4.69 to 5.04, "GitHub" 5.23, "Vercel" 6.11, "shad" 7.74, "Better" 9.55, "Unkey" 10.67, "many" 11.72, "others" 11.95, "use" 12.25, "Nama" 13.60, "schoolwork" 16.27, "JavaScript" 20.30, "look" 22.00, "documentation" 22.61, "while" 23.37, "learning" 23.85, "Fumadocs" 25.35, "four" 26.06, "layers" 26.39, "that" 26.73, "take" 27.56, "apart" 27.82, "reshape" 28.68, "C" 29.91, "L" 30.14, "I" 30.34, "copy" 30.69, "just" 31.26, "table" 31.62, "contents" 32.09, "into" 32.83, "codebase" 33.32, "started" 34.77, "scratch" 35.65, "probably" 37.69, "shape" 38.70, "Fumadocs" 39.56, "General" 40.37, "first" 41.51, "grantee" 42.53 (the full table is `CUE` in `index.html`).

### Spectacle map, checked on the final

Each piece of SCRIPT-v3's map, read on frames decoded by index from the final (sheets of 95 key frames plus full-resolution crops, in the session scratch folder):

- [x] The dithered fire field, 0.0 to 44.0, on one clock; it opens from tone 0 (near black at 0.0 to 0.07) and is full by 0.6.
- [x] The field's zones from each object's own ink: per mark 0.45 s before each name, around 13.3k (from 3.41), the rule's narrow band, the heap's mound, the page and the file, the moon's disc, the piece's path, the grant's mark box. One zone is not an object's ink: `pile-core`, in the heap shot, holds the field off the smoke's dark core beside "of JavaScript" (fix round). On 142 frames every 0.25 s with heading ink in them, no field cell stands within 40 px of a heading's ink except while its glyphs move: 29.5 ("Less magic" mid-rise on the cut, 55 px of cells), 31.75 ("Less magic" leaving upward, 32) and 32.0 ("Into your codebase" mid-rise, 2).
- [x] The opening tone rise in Bayer order, 0.0 to 0.6.
- [x] Heading mask rises at x 160, cap top 172, including the five changes over a continuing picture (13.68, 26.83, 31.72 and the wordmark's drop at 4.51 and rise at 2.78).
- [x] The hook "One developer" over the field alone, "One" in fire from 0.45 (said at 0.48 to 0.64).
- [x] Moving type: the hook's 3 px cells leave 2.28 to 2.43 and land as the moon's print by 2.78 (frames 2.35 and 2.50).
- [x] The print tone-mixing into the glass moon, 2.78 to 3.18 (frame 2.95).
- [x] The lockup: the glass moon r 230 at (1390, 400) and the 150 px wordmark, 2.78 to 4.51 (frames 2.95 to 4.20).
- [x] The lockup's moon moving to the shelf, 4.51 to 5.11, during "13,000" (frame 4.85).
- [x] The shelf moon, glass, crisp limb, lit 5.11 to 17.0.
- [x] 13.3k rising on "13" (3.86) under the lockup and tallying in GitHub's rounding through "thirteen thousand", landing at 5.01 on "stars" (1.0k rising at 3.95, 6.2k at 4.40, 9.7k at 4.70, 13.3k at 5.02; fix round).
- [x] The doubled-line rule drawn out of its left cross on "GitHub", 5.23 (frame 5.60).
- [x] The six marks on their names with their counts: Turborepo 6.11 ("Vercel"), shadcn/ui 7.74 ("shad"), Better Auth 9.55 ("Better"), Unkey 10.67, Orama 11.72 ("many"), the GT mark in fire 11.95 ("others"); counts 31.2k, 125k, 30.2k, 5.5k, 10.6k, 1.1k.
- [x] The fire pulse along the rule from the GT mark to the moon on "use it", 12.25 to 12.85 (crop at 12.50).
- [x] "Each site looks / vastly different" from "Better", 9.55, set 9.95.
- [x] "On top of / his schoolwork" in the hook's place from 13.80, "schoolwork" in fire at 16.27.
- [x] The glyph heap, its rain condensing base first from 17.05, the crest on "JavaScript" (20.30), the light drifting after it (20.58 to 21.5).
- [x] "A huge pile / of JavaScript", 16.93 to 21.5.
- [x] The docs page at 0.45 scale building on the cut at 21.5 (panels, then nav, sidebar, content, table of contents, done 22.08).
- [x] The table of contents' highlight stepping on "look", 22.08.
- [x] The page leaving by a tone mix on "documentation", 22.61 to 23.21 (frame 22.90).
- [x] The file of 25 token-bar lines lighting top to bottom from "while", 23.29 to 24.37, its lit band across the middle block on "learning".
- [x] "The primary / source", 21.43 to 24.5.
- [x] The 762 px glass moon raising its glow from black from 24.45, lit on "Fumadocs" (25.35).
- [x] The registration crosses at the limb on "four", 26.06.
- [x] Glass to print on "layers", 26.39, the smoke easing to rate 0.015.
- [x] The three seams on "that developers", 26.73, 26.93 and 27.13.
- [x] "Four modular / layers" over the moon as it is lit and cut, then "Building / blocks" from 26.95.
- [x] The layers parting on "take" (27.56) and spreading on "apart" (27.82), the slot's fire hairline drawn once.
- [x] The third layer sliding out (27.82 to 28.42), squaring off into the 552 by 270 block on "reshape" (28.68 to 29.28), the connector at 29.20.
- [x] The docs page at full size cut by three seams on "C", "L" and "I" (29.91, 30.14, 30.34).
- [x] The page's parts moving apart on "copy" (30.69), easing to 0.625 on "just" (31.26), the code panel drawing out of its cross with 18 rows from 31.49.
- [x] The table of contents lifting out with its fire hairline on "table" (31.62), its connector on "contents" (32.09), its travel (32.52 to 33.32), the rows opening on "into" (32.83), the seat on "codebase" (33.32), the sun block running down it (33.47 to 33.97).
- [x] "Less magic" (29.43) and "Into your codebase" (31.84).
- [x] The pieces returning to the circle on "started" (34.77 to 35.57), the print leaving on "scratch" (35.65 to 36.15).
- [x] The glyph moon in 16 writing systems with code characters filling row by row from 35.95, its last row on "shape" (38.70), its ink drifting after (crop at 38.80).
- [x] "Designed / to be that way", 34.43 to 39.5.
- [x] The GT mark in the end card's own box forming on "General" (40.37), the square-cornered connector on "first" (41.51), the fire pulse into the moon on "grantee" (42.53 to 43.03, crop at 42.80), the moon thickening and settling (43.03 to 43.68), the mark easing to the card's 0.4 (43.5 to 44.0) so the cut holds it.
- [x] "Software for / the public good", 39.43 to 44.0.
- [x] The shared end card, 44.0 to 48.0, silent, frame off.
- [x] Hard cuts on the 0.5 s beat and tone mixes on the one cell grid as the only transitions besides the moving type.

Nothing on screen holds still: on the final decoded at 480 x 270, the longest run before the card in which under 0.05 percent of pixels change by more than 8 levels a frame is 0.15 s (33.38 to 33.53, while the part seats).

### Deviations from SCRIPT-v3, and why

- **The narrator is Frederick Surrey, not Clara** (Kevin, 2026-10-06). SCRIPT-v3's voice section is updated; its lines table and planned word times are still Clara-pace estimates, and STORYBOARD.md has the measured ones.
- **48.0 s, not 49.5 s** (within 1.5 s). Frederick's nine takes run 38.5 s of speech against the 42.5 s planned. Placed with SCRIPT-v3's gaps the film would run 46.5 s, so the gaps and the open absorb the difference (no take is slowed or stretched): the gaps between lines are 0.44 to 0.55 s by the alignment (0.44 to 0.57 s of measured silence) instead of 0.25 to 0.40, and line 1 starts at 0.50 s instead of 0.25, so "One" is said as it turns fire. The card is then the first beat 0.45 s after the last word and after the pulse lands: it starts at 44.0, not at SCRIPT-v3's 45.5, and every cut moves with the takes (17.0, 21.5, 24.5, 29.5, 34.5 and 39.5 against the planned 18.0, 22.0, 25.5, 31.0, 35.5 and 40.5). Gaps of 0.30 s would have given 46.5 s, 3.0 s under the plan.
- **"probably" returns to line 8.** SCRIPT-v3's short rule allows it once the takes come in 0.6 s or more short (Decision 2); they came in 4.0 s short. Line 8 says the post's two hedges again.
- **Vercel is respelt "Vursell"**, SCRIPT-v3's third audition option, after plain "Vercel" reduced "cel" to a dark l and "Vur-sell" opened on a rounded vowel. Line 2 had three takes, two of them mis-said.
- **The neighbours' context of two takes.** Lines 1 and 3 were sent with line 2's first voice text as `--next` and `--prev` (plain "Vercel"), and lines 7 and 9 with line 8 without "probably". The retakes came after them; the difference is one word in each neighbour, so they were not retaken (the credits rule).
- **13.3k rises on "13" (3.86), before the moon reaches the shelf.** SCRIPT-v3 plans the rise 0.35 s after the wordmark leaves. "13,000" to the end of "stars" is 1.18 s, so SCRIPT-v3's rule would drop the wordmark on "over" (3.64), but the wordmark's floor ends at 4.51 and floors come first. The build first tallied from the moon's move (4.51 to 5.01), which put the figure on screen after "thirteen thousand" was said (the critic's finding). The count's place (x 1300, cap top 840) is clear of the lockup (moon bottom y 630, wordmark y 345 to 455), so in the fix round it rises on "13" and tallies for 1.15 s onto "stars"; the wordmark's floor and the moon's move at 4.51 are unchanged, and the moon comes to rest over its count.
- **One field zone is not an object's ink** (`pile-core`, fix round). Through the heap shot the smoke printed a dark disc with a black ring about 100 px across on the plume's lower edge, just right of "of JavaScript" (centre drifting from (1222, 372) at 18.6 s to (1200, 352) at 21.0 s). It read as a stray object beside the heading. A disc of r 56 at (1208, 360) with its own distances (black within 12 px, whole 70 px further out, the smoke's usual 60 px shift) is held in the heading's window (16.55 to 16.93 in, given back 21.5 to 22.0). The plume's edge now curves into a dark bay there; no ring is left.
- **Line 6's slide starts on "apart"** and the connector draws as the square-off ends: "take" to the cut is 1.94 s, under the 2.0 s SCRIPT-v3 asks for (its own rule for this case).
- **The table of contents steps at 22.08**, on "look" (22.00 to 22.15) but after its own fill ends; the page builds for 0.58 s and "look" comes 0.50 s after the cut.
- **The file's top stays at y 141**, not y 450: 27 rows at the 30 px pitch from y 450 would end at y 1260, below the frame. "The primary / source" ends at x 860 and the file starts at x 975, so the reason v2 lowered it (its wider heading) does not apply.
- **The narrator masters are -18.9 LUFS, not -19.3**: the mix measured -16.5 LUFS at -19.3, the low edge of the target.

The decisions SCRIPT-v3 leaves to Kevin, as built: (1) Vercel's stress is ver-SELL in the kept take (the only take whose two vowels both pass); (2) "probably" is back, by the short rule; (3) line 4 is the long version; (4) v2's headings stay unused.

### Measured on the final

- `ffprobe`: video 48.000 s (2880 frames at 60 fps), audio 48.000 s. Boxes in order ftyp, moov, free, mdat (faststart).
- `ffmpeg -i blog-fuma-nama.mp4 -af ebur128=peak=true -f null -`: integrated -16.1 LUFS, true peak -2.4 dBTP, LRA 2.3 LU (fix round's final; `loudnorm` reads -16.3 LUFS and -2.44 dBTP). The renderer's true-peak correction did not fire: the MP4's decoded audio hashes the same as the audio-only render of the same mix block (SHA-256 of s16le 48 kHz stereo), and the fix round's final hashes the same as the reviewed final (1f881281...).
- Stems (`lib/make-mix.mjs --stems`, rendered audio-only): the narrator -15.9 LUFS integrated, -15.8 inside the lines; the bed -26.7 LUFS under speech (10.9 dB under the narrator) and -20.6 LUFS on the card (44.0 to 47.2).
- `el.mjs hear` on the final returns all 107 words in order ("13,000" as "thirteen thousand"; its character stream, letters and digits only, equals the script's), every name written right: "Fumadocs" in all four places, "Vercel", "Turborepo", "Shadcn UI" ("ShadCNUI" in the run on the first render, whose audio is sample for sample this one's), "Better Auth", "Unkey", "Fuma Nama", "CLI", "General Translation's". The bed is tagged `[outro jingle]` on the card. On the fix round's final (`final-fix.stt.json` in the session scratch folder) `hear` again writes every word in order, with the same character stream as the script; it splits "Turbo Repo" and "open source" this time, and tags no audio event. The audio is sample for sample the reviewed final's, so the voice is unchanged.
- Against the first render (before the heading-roll fix), the decoded audio is identical (SHA-256 of s16le) and the picture differs only in the three rolls (13.78 to 14.05, 26.93 to 27.18 and 31.82 to 32.03 s; mean difference over 1 level nowhere else).
- Near-black frames: the open's first five (0.0 to 0.07, the field rising from tone 0) and the card's first three (44.03 to 44.07, the card's black ground with the mark at its opening density).
- `npx -y hyperframes@0.8.106 check .`: 0 errors (run again on the fix round's composition: the same). Lint keeps three warnings, as round 8 kept two: `composition_file_too_large` (2385 lines after the fix round, one monolithic file as MOTION.md allows) and `timeline_track_too_dense` on tracks 5 and 6 (six headings each). Runtime and motion 0 and 0. Layout has five `content_overlap` infos at 13.75 and 26.88 s, the boxes of two headings that share a place during a roll (the new one is still under its mask then). Contrast passes 23 of 23.

### Sound

- **Bed:** `lib/make-bed.mjs` re-cuts round 5's bed (`audio/archive-r6a/bed.mp3`, no new music) to 48.0 s: A, B, A, B, A, B and the source's own settle. Joins at film 6.77 (under "Turborepo"), 13.87 ("Nama has built it"), 21.57 ("He did not look"), 28.69 ("reshape") and 37.85 ("probably have the same"), each a 0.6 s raised-cosine crossfade under spoken words; the three A to B joins' outgoing sides were searched (`--search`, window 0.15 s): worst drone dips -2.2, -1.5, -3.4, -1.5 and -2.7 dB. The settle begins at 45.65, 1.65 s into the card. Master -16.0 LUFS, true peak -5.2 dBTP, round 5's EQ, 0.1 s lead-in.
- **Mix:** as round 7d (`lib/make-mix.mjs`, the carve at strength 0.3, `--flatten-carve-level`): the narrator on one bus at 0 dB; the bed enters already ducked (5.8 dB), holds the duck flat across every gap (RISE_DB 0, the gaps are under the 1.2 s bridge), the 260 Hz dip rides the duck, and after line 9 the duck lets go over 0.8 s to -1.5 dB for the card, the bed fading over its last 0.8 s. The carve put its dips at 160 Hz, 250 Hz and 2.5 kHz for his voice (Clara's were 160 Hz, 1.6 kHz and 2.5 kHz).

### Rebuilding

From the film folder:

```
node lib/make-voice.mjs          # audio/vo-N.master.wav from the nine takes
node lib/cues.mjs                # the word times; copy its CUE block into index.html if a placement changed (and the clip windows of the headings)
node lib/make-bed.mjs            # audio/bed.master.wav and bed.segments.json; --search re-derives a pin (set win on its join)
node lib/make-mix.mjs            # the mix block in index.html
node <hyperframes-audio skill>/scripts/carve.mjs --comp index.html --bed music-bed --strength 0.3 --core <folder with @hyperframes/core@0.8.106>
node lib/make-mix.mjs --flatten-carve-level
npx -y hyperframes@0.8.106 check .
npx -y hyperframes@0.8.106 render . -o ../../out/blog-fuma-nama.mp4 --quality delivery --fps 60 --workers 3
```

### Open items

- Kevin to hear "Vercel" in line 2. The kept take passes on measurement (both vowels and the ver-SELL stress), but no person has listened to it; takes 1 and 2 and the audition are in `audio/takes-v3/`.
- Pace against length. The gaps are 0.44 to 0.57 s so that the film stays within 1.5 s of SCRIPT-v3's 49.5 s. If Kevin prefers pace, the gaps can return to 0.30 s and the film would run about 46.5 s with no other change.
- Lines 1, 3, 7 and 9 were recorded with the neighbours' first voice texts (above); retake them only if a join between lines sounds off.
- The field reaches within 40 px of a heading only while its glyphs move (the rise on the cut at 29.5, the leave at 31.75).
- Two headings for Kevin (SCRIPT-v3 Decision 4). The critic found that "Less magic" and "Each site looks / vastly different" share no words with what is said under them. "Each site looks vastly different" is the post's own sentence about the adopters' docs, over their marks. For "Less magic", SCRIPT-v3 already offers v2's "A docs framework / you can break", the post's thesis, over the page being cut apart. It is a text swap only (the masks, timing and zones stay), built if Kevin asks.

### After the critic (v3 build, fix round)

The critic passed the build with six minors and no majors. Two were fixed, four are left, and nothing else changed (the takes, the mix, the bed and every other event are the reviewed build's).

Fixed:

1. **13.3k came after "thirteen thousand" was said.** `COUNT_AT` is now `CUE.L1['13']` (3.86) instead of the moon's move (4.51); its zone clears 3.41 to 3.81. The tally runs 3.86 to 5.01 (ease none) and lands on "stars" (4.69 to 5.04). Read on the final: no figure at 3.86 (the rise starts), "1.0k" rising at 3.95, "6.2k" at 4.40 (during "000"), "9.7k" at 4.70, "13.3k" at 5.02, and the moon settles over it by 5.11. The field around the count is clear from 3.80.
2. **A ring in the smoke beside "of JavaScript" (17.0 to 21.5).** The `pile-core` zone (Deviations above). Read on the final at 18.60, 19.50, 20.40 and 21.00 (full-resolution crops): the plume's lower edge curves into a dark bay, with no black outline and no disc. The rain still crosses the place, and the crest on "JavaScript" is unchanged.

Left, with the reason:

3. **The card at 44.0, not 45.5.** SCRIPT-v3's short rule puts the card on the first beat 0.45 s after the last word (43.12, so 44.0); reaching 45.5 would need 1.5 s of holds, which the same rule forbids. The critic agrees.
4. **Gaps of 0.44 to 0.55 s.** Gaps of 0.30 s would give about 46.5 s, under the 48.0 s floor (within 1.5 s of SCRIPT-v3's 49.5). Pace against length is Kevin's call (Open items); no take changes either way.
5. **"Vercel" not yet heard by a person.** Measurement cannot settle it, and the critic's own readings agree with the build's. Kevin listens to 6.0 to 7.4 s; takes 1 and 2 and the audition are in `audio/takes-v3/`.
6. **"Less magic" and "Each site looks / vastly different".** SCRIPT-v3 Decision 4 leaves the heading swap to Kevin, and the build keeps SCRIPT-v3's recommendation (round 7d's headings). The swap is offered in Open items.

Rendering: the documented render ran three times at load 140 to 460 (other lanes rendering; 9 min 41 s, 8 min 32 s and 9 min 41 s). The first final had 0.8 s of the glyph moon with two rows half drawn (38.67 to 39.45); the second had a torn heap at 18.40 (one frame) and a few rain glyphs off at 17.23. The third was kept. Compared frame by frame at full resolution (pixels more than 64 levels apart), the third equals the first everywhere but the first's glyph-moon run, and equals the second everywhere but the second's two frames (plus one pixel at 19.57), so each of its frames agrees with at least one other render. Against the reviewed final it differs only at 3.43 to 5.00 (the count and its zone) and 16.57 to 21.93 (`pile-core`, with the field coming back after the cut), plus encoder noise under 20 levels on a few pixels at 23.4 to 24.7. The two rejected renders are in the session scratch folder (`fumafix/render-a.mp4` and `render-b.mp4`).

### Traps met in the v3 build

- **A render under heavy load can drop raster on a run of frames.** At load 300 and more the renderer wrote frames with glyph rows half drawn (the glyph moon, 0.8 s) or a torn heap (one frame), and the check and the render log said nothing. Compare every new render with the last good one frame by frame (full resolution, pixels more than 64 levels apart) and expect differences only where the composition changed; render again where they are not.

- **Frederick's plain "Vercel" is "VER-sl".** In the line and in the audition he reduces the second syllable to a dark l; formants on the take's own alignment show it (F2 under 1000 Hz from the /s/ on). "Vur-sell" fixes "cel" but rounds "Vur"; "Vursell" gives both vowels and the ver-SELL pitch accent. Measure the audition's "version" and "acceleration" first and compare.
- **A faster voice and a fixed length.** His takes are 4 s shorter than the script's Clara-pace plan; the cut grid and the 0.6 s ceiling on silence leave the open, the gaps and "probably" as the only places to absorb it.
- **Rolling headings need 0.12 s.** With the next heading rising 0.06 s after the last one started to leave (the stopped build's ROLL_LAG), the leaving second line's feet still showed at the top of its mask for two frames, across the rising first line (13.78 s on the first render). At 0.12 s the snapshots and the final's frames of all three rolls are clean, and every floor still ends before its cut ("On top of / his schoolwork" 16.87 against the cut at 17.0). `check` still reports the two rolls as `content_overlap` infos: it measures the boxes, which share a place.
- **zsh `rm -f *.png` in an empty folder** stops an `&&` chain (no match is an error); extract first, or use `(N)`.
- **zsh's `time`** prints "... total", not "real"; a watcher waiting for "real" never fires.

## Round 8 (superseded by the v3 build): the series frame removed

Kevin, on both blog films: "remove the frame that seems to be overlaid on top of everything, its overlapping with a lot of stuff and is not the cleanest." The series frame is gone from the film. Everything else is round 7d's: the same pictures, timing and sound. The round 7d cut and poster are kept at `../../out/v8/blog-fuma-nama.mp4` and `.png`.

- **Removed from `index.html`.** The `kit/sheet.js` script and its `#sheet` layer: four registration crosses at (67, 67), (1853, 67), (67, 1013) and (1853, 1013), the doubled-line GT mark in the lower left margin (30 x 19 at (79, 1031)) and the blank counter. The `#rails` layer: two 1 px rails at x 67 and 1853 and two rules at y 67 and 1013, sixteen pieces drawn out of the crosses over 0 to 0.6 s. Also removed is the code that served only the frame: the `.seg` CSS, the `seg()` builder, the rails' tweens, the margin mark's step-out at the cut to line 7 (`tl.set(sheet.mark, ...)`), and the field's `margin` zone, which held the field 8 px plus a 60 px ramp off the margin mark until line 7. No other zone or knockout served the frame. Every scene line is kept: the seams and their crosses, the slot's hairline, the connectors and their crosses, line 7's rule and its end crosses, and line 8's connector.
- **The end card** comes from `kit/endcard`, which now draws no frame by default (its README). The film's call is unchanged.
- **Check.** `npx -y hyperframes@0.8.106 check .` reports 0 errors, the same two kept warnings (`composition_file_too_large`, `timeline_track_too_dense`), the same layout info at 39 s, and contrast 17 of 17.
- **Final.** `../../out/blog-fuma-nama.mp4`, rendered with `--quality delivery --fps 60 --workers 3` in 5 min 7 s at load about 60. It is H.264 1920 x 1080 at 60 fps (3240 frames) with AAC 48 kHz stereo at 194 kb/s, and both streams are 54.000 s. The render log has no Google Fonts line. Loudness is -16.5 LUFS integrated with a -2.6 dBFS true peak and 2.2 LU LRA, the same as round 7d.
- **Sound.** The audio stream matches v8's exactly. The AAC packets hash the same (stream copy) and so does the decoded PCM (SHA-256 of s16le 48 kHz stereo).
- **Picture: composition.** I took lossless `hyperframes snapshot`s (hardware GPU) of the round 7d composition and this one every 0.5 s from 0 to 53.5 s (108 times). The only changed pixels are the frame's. From 0.5 to 49.5 s each frame differs on exactly the 5996 pixels of the four 1 px lines (the crosses lie on them). Until 34.5 s it also differs on 309 pixels inside the margin mark's box. At 0.0 s only 100 line pixels differ (the rails are just leaving their crosses). From 50 s nothing differs (both use the frameless kit card). No other pixel changed, including the field around the old margin zone.
- **Picture: MP4 against v8.** Frames were decoded by index every 0.5 s. More than 16 px from the frame lines and away from the lower left corner, the two films' source frames are identical. Both MP4s carry the same coding error against their sources there (mean 2.947 levels). The films differ from each other by a mean of 0.72 levels (at most 68, and 0.49 percent of pixels over 8 levels), and no frame's difference exceeds its coding error. That residue is H.264 re-quantisation: removing the rails changes every frame's complexity. It is not a change in the picture.
- **Poster.** `../../out/blog-fuma-nama.png` is the settled end card at 53.98 s (`snapshot --at 53.98 --no-end --describe false`, hardware GPU). Against round 7d's poster only the 5996 frame-line pixels changed. The title, link and mark bands are identical. A `--no-browser-gpu` snapshot differs by up to 5 levels in the smoke, so the poster uses the GPU path, as before.
- **Contact sheet.** `../../out/_sheets/blog-fuma-nama.png` has one frame per second from the new final, in six columns of 480 px tiles. It uses the same layout as before (2922 x 2688).

## Round 7d (superseded by round 8, which only removes the series frame)

Round 7d answers Kevin's notes after watching the round 7 films: "for the blogs i liked the peaceful music from before and make the narration a much more friendly australian voice and show the options"; after the auditions, "like 2 but more female. and also im sad to see the dither disappear from background"; then "lets use clara" and "continue everything". Three things changed and nothing else: the narrator is Clara (every line re-recorded), the music is round 5's bed again, and the Bayer dither is back as the ground of every scene. The words (`SCRIPT.md`), the pictures of lines 1 to 8 (`CONCEPT.md`) and the shared end card are round 7b's; `STORYBOARD.md` is rewritten from Clara's takes. Round 7b's composition and storyboard are `archive/index-r7b.html` and `archive/STORYBOARD-r7b.md`, its scripts `archive/lib-r7b/`, and its takes and the Music API music with their mix files `audio/archive-r7b/`. The published round 7b cut is kept at `../../out/v7/blog-fuma-nama.mp4` and `.png`.

Round 7d was then revised after its two critics (see "After the critics (round 7d)" below): the field is held off the type and the objects by their own ink instead of boxes and thins in the smoke's own contours, line 7's shelf clears one element at a time just before its word, the glass moons end crisply at their limbs, line 7 was retaken so that "Vercel" is stressed as the company says it, and line 1's duck finishes before its first word. The final critic passed that revision with one new minor point, and line 7's rule now has its own narrow zone ("After the final critic (round 7d)" below). The first round 7d cut is kept outside the repository, in the round 7d scratch folder (`rev/before/`), with the composition and the scripts it was built from; line 7's first take is `audio/archive-r7d/`.

### Deliverables

- `../../out/blog-fuma-nama.mp4`: the final, `--quality delivery --fps 60 --workers 3`, rendered in 2 min 42 s. H.264 1920 x 1080 at 60 fps, 3240 frames, and AAC 48 kHz stereo at 194 kb/s. Both streams are 54.000 s. The render log has no Google Fonts line (its only "Google" is the WebGL vendor string).
- `../../out/blog-fuma-nama.png`: the poster, the settled end card at 53.98 s (a lossless `hyperframes snapshot`). It is byte for byte round 7b's poster, snapshotted again for this final: the shared card is deterministic and its title and link are unchanged.
- `../../out/_sheets/blog-fuma-nama.png`: the contact sheet of the final, one frame per second (MOTION.md), six columns, 480 px tiles, with the time under each.
- `../../out/v7/blog-fuma-nama.mp4` and `.png`: the round 7b cut and poster as they were published.
- The drafts, the review sheets (one frame per 0.5 s), the frame grabs of every beat and both sides of every cut, the probes and the measuring scripts are in the round 7d scratch folder, outside the repository (`rev/` for the revision, `r2/` for the rule's zone after the final critic, with the cut it replaced as `r2/look/pass2-before.mp4`).

### Measured on the final

- `ffprobe`: video 54.000 s (3240 frames at 60 fps), audio 54.000 s.
- `ffmpeg -i blog-fuma-nama.mp4 -af ebur128=peak=true -f null -`: integrated -16.5 LUFS, true peak -2.6 dBTP, LRA 2.2 LU. The renderer's true-peak correction did not fire: the MP4's audio is sample for sample the audio-only render of the same mix block (largest difference 0), so the stem measurements under Sound are the final's.
- `el.mjs hear` on the final (run again on this cut, whose audio is sample for sample the last cut's) returns SCRIPT.md word for word, 113 of 113 words in order ("13,000" as "thirteen thousand", the quotes of lines 1, 2 and 6 inside quotation marks), "Vercel", "Fuma Nama", "Fumadocs" and "Orama" written right, with one name written otherwise: "Unkey" as "Anki", her Australian vowel (the transcriber has written it so in every run of every take; the round 7d sound critic showed that the first pass's formant reading of that vowel did not hold, so this rests on the transcripts and on the mark rising on the name). The bed is tagged on the card at 49.18 s (`[gentle music]` in the last run, `[outro jingle]` in this one: the same audio, the transcriber's label).
- `npx -y hyperframes@0.8.106 check`: 0 errors. Two lint warnings are kept on purpose, `composition_file_too_large` and `timeline_track_too_dense` (one monolithic file with eight headings on one track, as MOTION.md allows). One layout info is a count still inside its mask at 39 s, before it rises. The contrast audit passes 17 of 17.
- Type and objects over the field, on the composition at 76 times (every cut and both sides of it, every key word of line 7 and the 0.45 s before each, the middle of every beat), measured on the screen as rendered: each frame twice, with and without the field canvas, the field being the cells that differ; the headings' ink is the white inside each heading's line boxes; distances are exact on the 3 px cell grid. No field cell stands within 40 px of a heading's ink at any of the 76 times (nearest 46 to 48 px once a heading is up). No field cell stands within 15 px of an object (nearest 16 px or more) except where the brief wants it: the glass moon of line 3, which the printed smoke wraps to 8 to 10 px, and the glyphs of line 1's rain, which fall through the smoke for their 0.34 s before they land on cleared ground. In line 7 no field cell touches a mark, the rule or a count once it has arrived.
- Line 7's lower half (y 600 to 1080, x 0 to 1250) is 7.0 percent field colour at 36.7 s and 5.4 percent at 39.0 s on the final (0.7 and 0.9 percent in the first round 7d cut), 2.2 to 2.7 percent from 39.1 to 42.1 s while the rule draws and the first marks rise (1.7 to 2.0 with the rule's old zone; the final critic's crop, decoded every 0.5 s), and 1.9 percent at 44.2 s, when the shelf is full.
- Lone specks (8-connected groups under 12 cells with no other field cell within 15 px): 0 to 9 single cells per frame at the 76 times, and 51 at 4.05 s, in the first frame of a zone's return, when a rising tone lights its first cells in Bayer order.
- The field's life on the final at 60 fps: 0.06 to 0.14 percent of a patch's pixels change by more than 40 levels from one frame to the next (lower left at 6.0 and 20.0 s, line 7's lower half at 36.7 s, line 8 at 47.0 s); 0.48 percent at 39.0 s, while the rule's zone clears in Bayer order (0.58 with its old zone).

### What was built and why

- **The field.** Kevin missed the dither of the round 4 and 5 cuts (their opening title printed the fire smoke through the Bayer screen around the glass moon) and of the post's own covers. Round 7 had kept the Bayer screen only inside its objects (the file's bars, the moon's print), so every scene stood on flat black. Now mount A's free fire smoke (the Paper fire preset's metaballs, scale 0.6, offsetX 0.1, at pixel ratio 0.5) is printed on the film's one 3 px cell grid, anchored at (0, 0), through the kit's 8 by 8 Bayer matrix, in black, ember and fire (fire only where the tone, after a 1.6 gamma, a 0.8 gain and a 0.72 cap, passes the upper of two nested Bayer thresholds, so fire takes at most 44 percent of the cells in the hottest smoke). It runs from the first frame to the end card's cut on one clock, shader seconds 0.4 + 0.075 t (3.75 shader seconds over 50 s, about 60 percent of the swirl's cycle, chosen on a sheet of the whole cycle so that the smoke sweeps the lower left in lines 1 to 6, the band between the heading and the shelf in line 7, and the bottom of the frame in line 8). Its black cells are transparent, so it lies over the gem mounts' black grounds (mount B's full frame and mount C's square) and under the heap, the prints, the line work, the glyph moon, the headings and the counts.
- **The field is atmosphere, held off by the things' own ink.** Each heading and each object is a zone: its own ink painted on the cell grid at boot (the heading's glyphs, in a face with the heading's single-storey a; a mark's silhouette; a count's star and figures, tabular; a doubled line with its crosses; a disc; the heap's glyph cells as 11 px discs; the file's bars; the printed moon's layers at rest, parted and spread with the seams past the limb; the piece's whole path out, into the block and home), never its bounding box, and an exact Euclidean distance from that ink (Felzenszwalb and Huttenlocher's transform). The field is black within m0 of the ink and whole at m0 + ramp: 44 px and 230 px for headings (44 cell centre to cell centre keeps at least 40 px of black on screen), 18 px and 150 px for objects, 18 px and 60 px for line 7's rule (its shift scaled with its ramp to 24 px), 10 px and 90 px for the glass moon of line 3, 8 px and 60 px for the margin mark. In the ramp the tone is lowered by (1 - w) x 0.72 instead of being scaled by w, so the haze goes first and the hot cores reach in furthest: the cleared ground's edge is one of the smoke's own contours, and over smoke of one tone the density thins across the whole ramp instead of ending on a line. The distance is also shifted by up to 60 px by the smoke's plume-scale contrast (its tone low-passed over 42 px minus the same over 120 px), so a plume reaches in further than the dark between plumes. Each zone holds only inside its window, clearing on one smoothstep before its object arrives and giving the field back on one smoothstep after it leaves (the file's bars from 3.5 s, the moon from 8.0 s, the piece's path from 0.55 s before "take", each next heading 0.45 to 0.07 s before its cut; in line 7, Fumadocs' count 0.45 s before "grown", the rule 0.5 s before "used", each mark with its count 0.45 s before its name; in line 8 the connector 0.45 s before "first"), so the field changes only by mixing tone on its grid. A soft knee at the bottom of the tone (nothing under 0.014, a smoothstep to 0.07) keeps the thinnest wisps from leaving lone cells in the margins.
- **The glass and the field.** The moon's outer glow in line 3 is 0 (round 7b had 0.18): above 0 the shader lays a faint smoke wash over the whole frame, which tinted the field's black cells in that scene alone. The field now carries the smoke around the moon. Mount B's host is clipped to a circle 1 px outside the moon's limb in lines 3, 7 and 8 (`clip-path`, set per frame): the shader's soft rim lit the 20 px outside the disc, the one blurred edge beside the field's hard cells (round 5 clipped its glass the same way).
- **The prints are clear outside their objects.** The file's print and the moon's print used to fill the frame with opaque black; they are now transparent outside their bars and the disc, and the glass-to-print mix at 14.0 s switches only the disc's cells.
- **Timing.** Clara's takes set the clock (`lib/cues.mjs`): each line starts 0.1 to 0.3 s after its cut, line 1 at 0.70 s, and 0.55 to 0.70 s of music separates the lines (0.99 s between lines 7 and 8, since the line 7 retake is 0.32 s shorter). The cuts are 0, 4.0, 8.5, 14.0, 17.5, 26.5, 34.5 and 45.5 s, and the end card cuts in at 50.0 s, 0.88 s after the last word, once the grant's pulse has reached the moon; the film is 54.0 s. Every key action is tied to its word through `CUE` (the table `lib/cues.mjs` prints), so the retime moved them all: the crest on "files" (1.73), the lit band on "itself" (7.60, the file's smoke clock re-anchored to it), the moon lit on "Fumadocs" (9.60), the crosses on "sites" (13.09), the parting on "break" (16.68), the spread on "breakable" (17.86), the outline on "ability" (19.91), the slide on "take apart" (21.99), the block on "reshape" (23.46), the connector on "any piece" (24.43), the print's exit on "from scratch" (28.03), the glyph moon's last row on "shape" (32.31), the count on "grown" (35.72) and "stars" (37.50), the rule on "used" (39.44), the marks on "Vercel", "Unkey", "Orama" and "yours" (40.54, 41.73, 42.69, 43.78; line 7's retake), the GT mark on "General" (46.39), the connector on "first" (47.53) and the pulse on "project" (48.52).

### Sound

- **Narrator:** Clara (`kit/audio/voice.json`, eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0), one request per line with `--prev` and `--next` and nothing else, the request text exactly SCRIPT.md's with its curly quotes, except line 7's retake, which respells "Vercel" as "Ver-sell" (SCRIPT.md, round 7d; `lib/cues.mjs` joins the respelt parts back into "Vercel" and keeps the script's text). Her takes arrive 6 to 14 dB quieter than the round 7b baritone's (-32.4 to -40.1 LUFS), so `lib/make-voice.mjs` now brings each take to -26.5 LUFS before its compressor (whose threshold is absolute); then as before: 75 Hz high-pass, RMS compressor, every master at -19.3 to -19.4 LUFS mono, ffmpeg's lookahead limiter at -3.6 dBTP at 192 kHz (true peaks -3.6 to -5.2 dBTP). The quotes read as quotes: each attribution comes after a pause (0.26 s in line 1, 0.58 s in line 6) and sits at the bottom of the line's pitch range ("said Fuma Nama" 155 to 176 Hz after a quote that falls from 232 Hz; "said Fuma" 155 to 158 Hz after a quote that starts at 308 Hz).
- **Music:** round 5's bed, `lib/make-bed.mjs` (rewritten; round 7b's Music API edit is `archive/lib-r7b/make-bed.mjs`). The source is `audio/archive-r6a/bed.mp3`, the round 5 sound generation (28 s). The edit plays its passage A (1.25 to 14.4 s) and passage B (16.45 to 24.25 s) as A, B, A, B, A, B and then the source's own settle, with five joins at film 12.95, 20.05, 30.17, 37.29 and 43.87 s, each under a narration line (lines 3, 5, 6, 7 and 7), each a 0.6 s raised-cosine crossfade between passages of the same chord colour. The A to B and B to A pairs are round 5's pins (14.10 into 16.4634, 23.5634 into 3.9959) and round 6a's (14.10 into 16.447); the third join's outgoing side and the last join were searched here (`--search`: the drone below 110 Hz scored through the crossfade in the left channel, the right and the mono fold-down, then the partials): worst drone dips -3.0, -1.5, -3.5, -1.5 and -2.0 dB. The settle begins at film 51.67, 1.67 s into the end card, and the bed decays to -37 dB by 53.0 s under the mix's last fade. The master bakes in round 5's EQ (38 Hz high-pass, -6 dB low shelf at 110 Hz, +5 dB at 300 Hz, Q 0.7) and keeps its stereo image as generated (the drone's channels often near anti-phase), sits at -16.0 LUFS with true peak -5.1 dBTP (lookahead limiter at 192 kHz) and has a 0.1 s silent lead-in. An impulse scan finds no click in it.
- **Mix** (`lib/make-mix.mjs`, then the hyperframes-audio carve at strength 0.3 with `--bed music-bed`, then `--flatten-carve-level`): the narrator on one `hf-audio-group` bus at 0 dB, each clip with a 20 ms fade in and a 60 ms fade out, ending 0.18 s after its last word. The bed (`audio/bed.master.wav`) at -0.5 dB, fading in over 0.3 s from 0.1 s and out over the card's last 0.8 s. Its volume lane ducks it 5.8 dB on 0.3 s ramps that end 0.05 s before each line's first sound (line 1's too: 0.35 to 0.65 s), holds the duck across every gap between lines (all seven are 0.55 to 0.99 s, under the 1.2 s bridge) with only a 1.5 dB half-sine breath in each, and after line 8 lets go over 0.8 s on a smoothstep to -1.5 dB for the card (`CARD_DB`: at 0 dB the B passage's last swell, which peaks just before the settle, put the card's loudest moment level with the narrator's median). A hand-built peaking dip at 260 Hz (Q 1.1) rides the duck at -5 dB and holds across the gaps: round 5's EQ lifts the bed's partials (130 to 400 Hz) by 5 dB, and they sit on Clara's fundamental (150 to 310 Hz in her takes). The carve put its dynamic dips at 160 Hz, 1.6 kHz and 2.5 kHz (-5.7, -6.8 and -3.7 dB at their deepest), each held at its deepest across the gaps and rising back at most 12 dB a second; its level stage is removed. Measured on audio-only renders of the same mix block (`--stems`), which the final's audio equals sample for sample: the narrator -16.4 LUFS integrated (-16.2 inside the lines, momentary median -16.4); the bed -25.9 LUFS under speech, 10 dB under the narrator, -23.4 in the open (0.1 s to line 1: it fades in over 0.3 s and its duck starts at 0.35 s) and -20.5 on the card; in each gap its momentary loudness peaks 0 to 2.5 LU over its level under the neighbouring lines (no pumping); its loudest moment is -16.9 LUFS momentary at the card's cut, under the narrator's median. The full mix's loudest moment is "I learned" at 0.7 to 1.1 s, -12.2 LUFS momentary, and the narrator alone reads -12.6 there: the bed under it is -23.9 (it was -18.4 before line 1's duck moved).

### ElevenLabs ledger (round 7d)

| request | what | result | used |
| --- | --- | --- | --- |
| TTS vo-1 | line 1, 47 chars | 3.30 s, 9 words in 2.79 s, 3.23 w/s, a 0.26 s pause before "said" | yes |
| TTS vo-2 | line 2, 67 chars | 4.83 s, 12 words in 3.98 s, 3.01 w/s, a 0.48 s pause at the comma | yes |
| TTS vo-3 | line 3, 80 chars | 5.57 s, 13 words in 4.92 s, 2.64 w/s | yes |
| TTS vo-4 | line 4, 55 chars | 3.71 s, 11 words in 3.02 s, 3.64 w/s | yes |
| TTS vo-5 | line 5, 110 chars | 9.29 s, 20 words in 8.71 s, 2.30 w/s (pauses 0.31, 0.38, 0.24 s) | yes |
| TTS vo-6 | line 6, 101 chars | 8.92 s, 18 words in 7.26 s, 2.48 w/s (0.69 s after "scratch", 0.58 s before "said") | yes |
| TTS vo-7 | line 7, 125 chars | 11.15 s, 22 words in 10.43 s, 2.11 w/s (list pauses 0.32 to 0.43 s) | yes |
| TTS vo-8 | line 8, 56 chars | 3.95 s, 7 words in 3.59 s, 1.95 w/s | yes |
| STT | the eight takes and the first final | as below | checks |
| TTS vo-7, retake | line 7 with "Ver-sell", 127 chars | 10.91 s, 22 words in 9.96 s, 2.21 w/s; "Vercel" stressed on its second syllable | yes (the first vo-7 is in `audio/archive-r7d/`) |
| STT | the retake and the revised final | "Vercel" right in both; the final 113 of 113 words | checks |
| STT | the final after the rule's zone (the same audio) | 113 of 113 words in order, "Unkey" as "Anki" as before | checks |

One take per line, and one retake: line 7, because its first take stressed "Vercel" on its first syllable (the round 7d sound critic's finding, measured here: "Ver" 4 dB louder than "cel", whose vowel was reduced, F1 about 330 Hz and F2 falling from 1500 to 750 Hz, and its contour the one Clara gives Orama's stressed syllable before a list rise). In the retake "sell" is 0.28 s against "Ver"'s 0.18 s, carries the rise from 166 to 230 Hz, and has a full DRESS vowel (F1 505 to 571 Hz, F2 1580 to 1776 Hz before the dark l); its pitch is steadier than the first take's (median frame-to-frame change 1.01 percent against 1.10). TTS characters sent: 768. The set reads 112 words over 44.2 s of speech, 2.53 words a second at speed 1.0. `hear` returned every word of every take with no audio event: "Fuma Nama" as "Fumanama", "Fumadocs" as "Fumadox", "Fuma Docs" or "Fumodox" (the joined name in her accent), "Vercel" and "General Translation's" right, and "Unkey" as "Anki" again (round 7b measured the same vowel in the baritone's take as the Australian STRUT vowel; Clara is Australian too). The median frame-to-frame pitch change per take is 1.0 to 1.6 percent (her audition, 0.96). No music was generated: the bed is round 5's.

### Rebuilding the sound

From the film folder, in this order (each step's header says what it does):

```
node lib/make-voice.mjs [n ...]  # audio/vo-N.master.wav from the takes (all eight, or the lines named)
node lib/cues.mjs                # the word times; copy its CUE block into index.html if a placement changed
node lib/make-bed.mjs            # audio/bed.master.wav (and bed.segments.json, the edit as played); --search re-derives the pins
node lib/make-mix.mjs            # the mix block in index.html
node <hyperframes-audio>/scripts/carve.mjs --comp index.html --bed music-bed --strength 0.3 --core <folder with @hyperframes/core@0.8.106>
node lib/make-mix.mjs --flatten-carve-level
```

### Look and fix (round 7d)

- **Probe frames, round 1.** The field first used the round 7b clearance of the moon for every moon scene (the disc plus its parting, as a box), which kept the smoke 120 px off the glass in line 3. The glass now has its own tight zone (10 px, ramp 70), so the printed smoke wraps it as it wrapped the glass in the round 5 opening; the printed moon keeps the wider zone, because a print against a print loses its limb. The field's gain went from 0.85 to 0.8 and its cap from 0.8 to 0.72, so its hottest smoke is a fire and ember screen rather than solid fire.
- **Draft 1.** The field drew few cells in line 7: at 0.06 shader seconds a second its smoke sat at the top of the frame through the adopters. A sheet of the whole swirl cycle showed the smoke crossing the middle band at 3.0 to 3.8; at 0.075 a second line 7 lands there, and lines 1 to 6 still have the lower left. Measured over the heading boxes, a heading that rises on a cut met field cells for its first frames (2022 pixels at 34.6 s, under "vastly different"), because the weight change for lines 7 and 8 cleared after the cut: those two changes now clear the next heading's zone before the cut and the shelf or the grant after it. The heading knockout grew from 26 to 40 px, so no stray cell sits in the ramp's first steps beside a heading.
- **Draft 2.** The mix's open and card read -21.3 and -21.1 LUFS, a dB under the brief's -20; the bed went up 0.8 dB and its duck 0.8 dB deeper, so it still reads -26.0 under speech. The release after line 8 went from 1.0 to 0.8 s and the open's fade in from 0.1 to 0.3 s, inside the brief's 0.3 to 0.8 s.

### After the critics (round 7d)

Picture critic (fail, two majors, two minors):

- **Line 7 lost its field for 5.8 s (major).** Fixed. The shelf band no longer clears as one block on the cut. Each thing on the shelf is its own zone and clears just before its word: Fumadocs' count from 35.27 s (before "grown"), the rule's line from 38.94 s (before "used"), each mark with its count from 0.45 s before its name. Through "grown" and "stars" the plume crosses the lower half of the frame (7.0 percent of the lower left in field colour at 36.7 s, 0.7 before). The sampling window did not need to drift: at the 0.075 clock the smoke is there. Once each thing has arrived no field cell touches it.
- **Ruled edges and chamfered corners (major).** Fixed. The zones are the things' own ink with exact Euclidean distances, so no zone has a long straight side unless its object does (the rule, the connector, the seams). The tone in a zone's ramp is lowered rather than scaled, so the cleared edge is a contour of the smoke, and the distance is shifted by the plume's own contrast. The first try kept the scaling and added a ramp that ran faster in hot smoke; at 20 s it cut the lower plume's tip with a vertical edge, because together they compressed the taper into about 20 px. Pure lowering spreads it over the whole ramp. Checked on full-resolution crops at 20.0, 36.7, 39.0, 44.2 and 48.5 s: the slab above the heading in line 7 thins along its own contours, and line 8's smoke under the connector ends in wisps.
- **The moon's rim halo (minor).** Fixed: mount B is clipped 1 px outside the limb in lines 3, 7 and 8. A radial profile of the first cut put the disc's edge at the measured radius and the halo from 2 to 20 px beyond it in both moons.
- **Stray specks (minor).** Fixed with the soft knee at the bottom of the tone. Lone single cells are 0 to 9 a frame; the critic's cluster at 39.0 s is now the tail of a continuous wisp.

Sound critic (pass, seven minors):

- **"Vercel" stressed on its first syllable.** Retaken, once (SCRIPT.md, round 7d, and the ledger above). The retake also changed line 7's times, which `CUE` carries to every action in the scene; the bed's joins at 37.29 and 43.87 s still sit under it.
- **"I learned" on the unducked bed.** Fixed: line 1's duck runs 0.35 to 0.65 s like every other line's. The bed under the first word is -23.9 LUFS momentary (it was -18.4), and the full mix's loudest moment is now the narrator's own "I learned" (-12.2 with the bed, -12.6 alone). The open's bed reads -23.4 LUFS instead of -20.5: in a 0.6 s open it fades in over 0.3 s and is ducking from 0.35 s.
- **Line 4 is the fastest line.** Kept. MOTION.md never slows a take, every word is right, and the 0.60 s after it gives it room; a retake would only be another reading at the same speed.
- **The bed's 17 s loop.** Kept. It is the bed Kevin asked for, every join is clean, and moving the last B pass would make a new join without a listen to judge it by.
- **Turborepo, shadcn/ui and Better Auth on "Vercel".** Kept. The post names "Vercel Turborepo", the marks follow the post, and the row fills left to right.
- **"Fumadocs" six times.** Kept: the words are the approved script.
- **Stale documents.** Fixed: SCRIPT.md marks its superseded first-plan sections, and MOTION.md's Round 7 direction names Clara, the blog films' round 5 music and the dither in the background.
- **The first pass's formant evidence for "Unkey".** Withdrawn: an F1 of 305 Hz in her voice is a harmonic, not a formant. The case rests on the transcripts and on the mark rising on the name.

### After the final critic (round 7d)

The final critic passed the revision (both majors fixed, no new blocker or major) with one new minor point, fixed here:

- **The rule's zone emptied the lower half again (minor).** Fixed. The rule is one 1600 px stroke at y 800, and with the objects' 150 px ramp (and 60 px shift) its zone reached from y 570 to 1030: from "used" the lower half fell from 6.4 to 1.8 percent field colour, and from 39.1 to about 40.5 s the lower left held only the rule drawing. The rule now has its own zone, 18 px of black and a 60 px ramp, with its shift scaled with the ramp to 24 px (the other zones keep 60 px of shift on 150 px of ramp, so the taper keeps their proportions; at 60 px of shift on a 60 px ramp a plume would print whole at 18 px from the stroke). The curl of smoke below the rule (y 870 to 1000) now stays through "used" until the first marks' own zones clear it from 40.1 s, and the lower half reads 2.2 to 2.7 percent from 39.1 to 42.1 s instead of 1.7 to 2.0. The plume that lay along y 800 at "used" is still cleared, since it lies on the stroke itself. The critic's other suggestion, clearing the rule's zone left to right with its draw, is a wipe on a dithered field, which MOTION.md's texture rules refuse; the rule's head also crosses most of the frame in its first 0.5 s (power3.out), so it would buy little.
- Nothing else changed. Against the cut it replaces, every frame sampled each 0.5 s is identical outside 39.0 to 42.0 s and 45.5 s (the rule's zone returning on line 8's cut), and the audio decodes to the same samples. The type and objects stay clear of the field: on the composition at 17 times from 36.7 to 45.43 s no field cell is within 40 px of a heading's ink (nearest 46 px) or within 15 px of an object (nearest 20 px), and lone specks are 0 to 4 a frame.

### Traps met in round 7d

- **A background needs every layer above it to be clear.** The print canvas filled the whole frame with opaque black in the file and the moon scenes, and the gem mounts B and C draw opaque black grounds (their colorBack has alpha 1). The field therefore sits above the gem mounts with transparent black cells, and the prints are transparent outside their bars and the disc; the glass-to-print mix switches only the disc's cells (it used to switch every cell of the frame to black in Bayer order).
- **Outer glow tints the ground.** Any outer glow on a glass shape lays a faint smoke wash across the frame; over the field it shows in every black cell. The moon's outer glow is 0 wherever the field is up.
- **A plain browser shows every clip at once.** A Playwright probe of `index.html` has no HyperFrames runtime, so every heading and the glyph moon draw together; the round 7d probe sets each `.clip`'s visibility from its `data-start` and `data-duration` before it seeks.
- **Quiet takes and an absolute threshold.** Clara's takes arrive about 10 dB under the round 7b baritone's, and `make-voice.mjs`'s compressor threshold is absolute; each take is now brought to -26.5 LUFS first.
- **An anti-phase drone at a guessed join.** The first guess for the last join lost 14.7 dB of drone in one channel through the crossfade (the bed's channels are often near anti-phase); `make-bed.mjs --search` found a point 0.21 s later that loses 2.0 dB.
- **The brief's sound targets.** "About -20 LUFS alone and -26 under speech" is a 6 dB duck in loudness, not 10; the mix meets the LUFS targets, which put the bed 10 dB under the narrator while she speaks.
- **A canvas cannot take font-feature-settings.** The headings set Inter's single-storey a (cv11); painted with plain Inter, a line with two a's came out 12 px short, and the field reached 28 px from "to be that way". The zones paint with two FontFaces built from the kit's own Inter file with `featureSettings` (cv11 for the headings, tnum for the counts), loaded at boot; measured against the DOM, the painted line's width matches to 0.01 px.
- **Distances on a cell grid are cell centre to cell centre.** A field cell's nearest pixel can stand 3 px nearer than its centre, so the heading clearance is 44 to keep 40 px of black on screen.
- **A take can end on the next line's breath.** Line 7's retake ends with 60 ms of the start of a breath, 0.75 s after its last word. The mix never plays it (each clip stops 0.18 s after its last word), but `offsetOf` read it as the line's end; it now looks no later than 0.4 s past the last word.
- **Lowering, not scaling.** Scaling the tone by the weight and also subtracting from it shortened the taper over flat smoke to about 20 px, a hard edge on the zone's contour; lowering alone keeps the taper as long as the ramp.
- **A loaded machine.** The revision ran on a machine at load 140 to 220 (other lanes rendering), so probes and checks took minutes; the final itself rendered in 3 min 44 s.

## Round 7b (superseded by round 7d; its takes, music and mix files are in audio/archive-r7b/, its composition is archive/index-r7b.html)

Round 7b answers Kevin's notes on the round 7 scripts and key frames: "for the designing docs and fuma we want to add links at end, and we want to make a consistent end card after videos that also adds link. for fuma, mention the teams that fumadocs is used by with their logos and stars. ... also make the voice more australian and make the voice less shaky". The words are `SCRIPT.md` with its round 7b changes (eight lines, 113 words, the new line 7 on the adopters and line 8 on the grant), the pictures are `CONCEPT.md` (r7-viewer for lines 1 to 6, the r7b-adopters key frames for lines 7 and 8), and the film ends on the shared series end card (`kit/endcard/`), used as it is. `STORYBOARD.md` is the plan with the new takes' real timings. After the first render, a picture critic passed the film with seven minor points and a sound critic failed it on two majors (clicks in the bed on the end card, the bed pumping in every gap); "After the critics" below says what was done for each, and the numbers in this section are the revised final's.

Nothing from the earlier cuts is used. The round 7 lane's takes (Patrick at speed 0.85) and every mix file built on them are in `audio/archive-r7a/`, and its partial composition and storyboard are `archive/index-r7a.html` and `archive/STORYBOARD-r7a.md`. Its scene code for lines 1 to 6 follows CONCEPT.md, so it was the starting point for those scenes; every time in it was replaced.

### Deliverables

- `../../out/blog-fuma-nama.mp4`: the final, `--quality delivery --fps 60 --workers 3`. H.264 1920 x 1080 at 60 fps, 3090 frames, and AAC 48 kHz stereo at 193 kb/s. Both streams are 51.500 s. The render log has no Google Fonts line (its only "Google" is the WebGL vendor string).
- `../../out/blog-fuma-nama.png`: the poster, the settled end card at 51.48 s (a lossless snapshot). The film's title appears only on the card.
- `../../out/_sheets/blog-fuma-nama.png`: the contact sheet of the final, one frame per second (MOTION.md), six columns, 480 px tiles, with the time under each.
- The drafts, frame grabs, probes and measurement scripts are in the round 7b scratch folder, outside the repository.

### Measured on the final

- `ffprobe`: video 51.500 s, audio 51.500 s.
- `ffmpeg -i blog-fuma-nama.mp4 -af ebur128=peak=true -f null -`: integrated -16.5 LUFS, true peak -2.3 dBTP, LRA 2.0 LU. The renderer's true-peak correction did not fire: the MP4's audio nulls against the audio-only render of the same mix block 130 dB down.
- Stems (audio-only renders of the mix block): the narrator -16.4 LUFS over the film (-16.2 inside the lines, momentary median -16.0, loudest -13.6); the bed -26.2 LUFS under speech, -20.8 LUFS where it plays alone (the open, 0.1 to 0.8 s, and the end card), its loudest moments -17.3 LUFS momentary in the open and -17.7 on the card's cut. In the gaps between lines it stays under its duck: at its loudest -22.3 to -29.2 LUFS momentary, at most 4.7 LU over its level under the neighbouring lines (the largest, after line 3, is where the composition itself is 2.7 LU louder). The 120 to 300 Hz band swings 5 to 8 dB per gap (12 to 17 before). Under a 180 Hz high-pass (a laptop) the bed loses 5.0 dB against the voice's 2.2.
- An impulse scan of the audio (third difference over 8 times its neighbourhood, groups within 5 ms) finds no group in the final, in the bed stem, in the bed master or in the source composition; the round 7b master had 32 (every 26 ms in the open and on the card).
- `el.mjs hear` on the final returns every word of SCRIPT.md in order ("thirteen thousand" for 13,000). "Fuma Nama", "Vercel" and "General Translation's" are written right; "Fumadocs" comes back as "FumaDocs" (case only). "Unkey" comes back as "Anki" (see the ledger), and its mark now lights on the word. The quotes of lines 1, 2 and 6 come back inside quotation marks.
- `npx -y hyperframes@0.8.106 check`: 0 errors. Two lint warnings are kept on purpose, `composition_file_too_large` and `timeline_track_too_dense` (one monolithic file with eight headings on one track, as MOTION.md allows). Six layout infos are headings and counts caught inside their masks mid-rise. The contrast audit passes 17 of 17.
- A frame scan of the draft (every frame at 192 x 108): the only near-black frames are the open's first 0.5 s, while the rails draw and the glyph rain begins under the music; the largest frame differences are the cuts, and no luma flicker. The glyph moon is no longer still after "shape": a few glyphs change tone per frame, most of them once.
- Smoke on type: in every beat's heading zone (ink box plus 24 px, the moon's disc excluded) no pixel is coloured above 13 of 255 luma in line 3 (the outer glow's faint field) and none at all elsewhere; the big count's zone in line 7 has none.

### What was built and why

- **Timing.** The takes set the clock. Each line starts 0.1 to 0.35 s after its cut (line 1 at 0.8 s, so the music is heard alone for 0.7 s), and 0.45 to 0.86 s of music, held under its duck, separates the lines. The cuts are 0, 4.0, 8.5, 14.0, 17.5, 25.5, 32.0 and 43.0 s, and the end card cuts in at 47.5 s, 0.61 s after the last word; the film is 51.5 s. `lib/cues.mjs` places the clips and prints every word's film time; `index.html` holds the same table as `CUE`.
- **Key actions on words.** The heap's crest settles on "files" (1.92 s). The lit band crosses the file's middle block on "itself" (7.44 s). The moon is lit on "Fumadocs" (9.65 s) and the seams' crosses draw at its limb on "sites" (13.06 s). The layers part on "break" (16.68 s) and spread on "breakable" (17.87 s). The slot's hairline draws on "ability" (19.85 s), the piece slides out on "take apart" (21.29 s), squares off on "reshape" (22.63 s) and is joined by the connector on "any piece" (23.34 s). The print leaves on "from scratch" (26.79 s), the glyph moon's last row lands on "shape" (30.16 s), and its ink drifts from there. Fumadocs' count rises on "grown" (33.35 s) and tallies to 13.3k on "stars" (35.37 s). The rule draws on "used" (37.36 s); Turborepo lights on "Vercel" (38.60 s) with shadcn/ui and Better Auth 90 ms apart behind it, Unkey on "Unkey" (39.62 s), Orama on "Orama" (40.51 s) and the GT mark, in fire, on "yours" (41.71 s); the fire pulse runs from it to the moon from 41.96 to 42.56 s. The GT mark forms on "General" (44.23 s), the connector draws on "first" (45.44 s), and its pulse runs on "project" (46.30 s).
- **Lines 1 to 6** are the round 7 scenes retimed: the heap, the file, the moon, the seams, the piece and the glyph moon, with the same mounts, prints and line work. Two changes after looking at the drafts: the glyph moon now starts filling 0.3 s after "from scratch", while the print's last cells leave (draft 1 had 0.3 s with only the heading on screen), and every line of every heading is seated on x 160 by its own first glyph (round 7 seated only the first line, so "to be that way" and "vastly different" stood 7 px left of the axis and "of JavaScript" 4 px right of it). The seat is measured at boot from the loaded face and applied as a margin on the line's mask, so no line overflows its heading and no tween's transform is touched.
- **Line 7, the adopters**, ports `concepts/blog-fuma-nama/r7b-adopters/adopters.js` into the film: the moon at (1530, 530) with radius 230 on mount B (scale and offsets derived from round 7's measured disc, no outer glow), six marks drawn in white from `assets/logos/` (copied from the concept folder: Turborepo for "Vercel Turborepo", shadcn/ui, Better Auth, the traced Unkey and Orama marks, the GT mark) and rasterised once at their drawn heights, a doubled-line rule at y 800, and the GitHub counts (stars in fire, figures in Inter 500 tabular). Each mark enters by a tone mix on the film's 3 px Bayer grid on its name (above); the GT mark is tinted fire. Measured on a frame: every mark's left edge on its column (160, 340 ... 1060), every star's point on x + 1, the cap line at 840 and the baseline at 867, the 13.3k cap at 839 and baseline at 898, every mark's foot on 759 to 761.
- **Line 8, the grant**: the moon holds still through the cut (mean frame difference 1.2 levels across it, 0.7 within a line), and the GT mark forms on mount C, a 614 px square glass shape with no outer glow, its T's crossbar on the moon's centre line, so the connector reads as the T's arm carried to the moon.
- **The moon's smoke in lines 7 and 8** turns at rate 0.13 from shader time 39.6, not the concept's 0.2 from 38.6. A sheet of 32 phases showed a 6.4 s cycle whose lit half (the white pool at the top, then the bright arcs) lasts about 2 shader seconds; at 0.2 the moon spent the open of line 7 and most of line 8 in its dark half. At 0.13 lines 7 and 8 stay lit, with the brightest pool on "Vercel".
- **The end card** is `GTEndCard.addEndCard(tl, { palette: 'fire', title: ['Fuma Nama: The philosophy', 'of an open-sourcerer'], url: 'generaltranslation.com/blog/fuma-nama', start: 47.5 })`, added after the film's own tweens; the timeline is registered when `card.ready` resolves, so no seek lands on a card without its smoke. Mounts B and C stop drawing under it, and the margin GT mark steps out from line 7 on.
- **Mounts.** A (free fire smoke, hidden, pixel ratio 0.5) lights the heap and the file. B draws the moon from 8.5 to 27.3 s, is read (hidden) for the glyph moon's ink from 30.16 to 32.0 s, and draws again from 32.0 to 47.5 s with the line 7 look. C draws line 8's GT mark. The end card owns its own full-frame mount and draws only in its window, so at most two full-frame mounts draw at any moment.

### Sound

- **Narrator:** the Australian Baritone (`kit/audio/voice.json`, eleven_multilingual_v2, stability 0.85, style 0, speed 1.0), one request per line with `--prev` and `--next` and nothing else, the request text exactly SCRIPT.md's with its curly quotes, except line 7's retake, which respells "Vercel" as "Ver-sell" (SCRIPT.md, round 7d; `lib/cues.mjs` joins the respelt parts back into "Vercel" and keeps the script's text). Every take reads at speed 1.0; the set's median frame-to-frame pitch change is 0.49 to 0.82 percent per take (the audition measured 0.56 for this voice, against 1.6 for the slowed Patrick takes). The attributions sit lower than their quotes ("said Fuma Nama" at 74 to 78 Hz after a quote that falls from 94 Hz; "said Fuma" at 73 to 75 Hz after a quote that starts at 117 Hz), each after a pause of 0.33 to 0.41 s.
- **Masters:** `lib/make-voice.mjs` unchanged but for the line count: a 75 Hz high-pass, an RMS compressor, every master at -19.3 to -19.4 LUFS mono, ffmpeg's lookahead limiter at -3.6 dBTP at 192 kHz.
- **Music:** two Music API compositions at the film's exact length (51.5 s), the most allowed. Both ignored the prompt's timing. The first (`audio/music.take1.mp3`) is silent for 0.5 s, swells for 10 s, holds a slowly changing drone from 10 to 36 s and fades out from 36 s, gone by 46 s. The second (`audio/music.mp3`, chosen) builds over 7 s, holds an even body of pad, sub pulse (a 0.22 s grid) and sparse low piano on a D minor drone from 7 to 41.1 s, then stops and lets one chord ring down. `lib/make-bed.mjs` edits it: the film opens on 7.38 s (the end of the build, lifted 3 dB tapering to 0 by 2.5 s), plays to 39.71 s, splices back to 25.92 s (a 12 ms crossfade 2 ms before two corresponding pulse attacks, chosen as the most alike pair of points in the body: band envelopes correlate 0.99, chroma 1.00, level within 0.4 dB) and runs on into the composition's own stop, whose last swell lands on the end card's cut at 47.5 s. The ring is lifted 11 dB, ramped in from 0.45 s after the card's cut (once the swell has decayed) over 0.6 s, so the card is not left silent. Both lifts are one gain curve evaluated per sample (`aeval`). The sub pulse keeps its grid across the splice (0.210 s from the last attack before it to the first after it, against 0.200 to 0.260 s elsewhere). The splice sits under line 7 ("Fumadocs has"). The master thins the sub (35 Hz high-pass, -9 dB low shelf at 100 Hz, another -4 dB at 90 Hz) and lifts 300 Hz to 1 kHz by 2.5 dB, sits at -15.0 LUFS and peaks at -3.0 dBTP. `hear` finds no voice in either composition.
- **Mix** (`lib/make-mix.mjs`, the carve at strength 0.3 with `--bed music-bed`, then `--flatten-carve-level`): the narrator on one `hf-audio-group` bus at 0 dB, each clip with a 20 ms fade in and a 60 ms fade out, ending 0.18 s after its last word. The bed at +1 dB. Its volume lane ducks it 5.5 dB from line 1's first sound (0.3 s down) to 0.05 s after line 8's last word and holds the duck across every gap between lines, breathing up only 1.5 dB on a half-sine in each; it lets go over 1.0 s on a smoothstep after line 8, fades in over 0.1 s from 0.1 s and out over the card's last 0.8 s. A hand-built peaking dip at 280 Hz (Q 1.1) holds at -9 dB over the same span (lane `fx.b2.gain`): the carve put its dips at 160 Hz, 1 kHz and 1.6 kHz, and without the dip the narrator stood only 6 dB over the bed's pad at 200 to 400 Hz. The carve's level stage is removed, as in round 7, and its three dynamic dips are held at their deepest across the gaps (`--flatten-carve-level`).

### ElevenLabs ledger (round 7b)

| request | what | result | used |
| --- | --- | --- | --- |
| TTS vo-1 | line 1, 47 chars | 3.90 s, 9 words in 3.14 s, 2.87 w/s | yes |
| TTS vo-2 | line 2, 67 chars | 4.78 s, 12 words in 3.52 s, 3.41 w/s | yes |
| TTS vo-3 | line 3, 80 chars | 5.57 s, 13 words in 4.95 s, 2.63 w/s | yes |
| TTS vo-4 | line 4, 55 chars | 3.76 s, 11 words in 2.96 s, 3.71 w/s | yes |
| TTS vo-5 | line 5, 110 chars | 7.99 s, 20 words in 7.15 s, 2.80 w/s | yes |
| TTS vo-6 | line 6, 101 chars | 7.11 s, 18 words in 5.96 s, 3.02 w/s | yes |
| TTS vo-7 | line 7, 125 chars | 11.38 s, 23 words in 10.39 s, 2.21 w/s (list pauses 0.35 to 0.5 s) | yes |
| TTS vo-8 | line 8, 56 chars | 4.13 s, 7 words in 3.77 s, 1.86 w/s | yes |
| Music 1 | 51.5 s, 800-char prompt (`music.take1.prompt.txt`) | silent first 0.5 s, 10 s swell, fades from 36 s | no |
| Music 2 | 51.5 s, 807-char prompt (`music.prompt.txt`) | 7 s build, even body to 41.1 s, stop and ring | yes, edited |
| STT | the eight takes, both compositions, draft 2, the final | as above | checks |

One take per line; none was retaken. TTS characters sent: 641. The set reads 113 words over 41.8 s of speech, 2.70 words a second at speed 1.0; the calm comes from the 0.55 to 0.86 s of music between lines. `hear` returned every word of every take. "Fumadocs" came back as "Fumadox", "Fuma Docs", "Fuma Dox" or "Fumodox" (the joined name said as two stressed syllables and "docks", with the middle vowel reduced in line 7), "Fuma Nama" as "Fumanama". "Unkey" came back as "Anki" in line 7 with full confidence. Its first vowel was measured (LPC formants on the take's own character timing) at F1 742 Hz, F2 1186 Hz, which matches the same take's STRUT vowel in "companies" (702, 1228) and not its TRAP vowel in "and" (867, 1795): it is "Un-key" in an Australian accent, whose STRUT vowel an American-trained transcriber writes as the "ah" of Anki. No respelling was sent.

### After the critics (round 7b)

Picture critic (pass, seven minor points):

- **The cut to the end card moves the GT mark across the frame.** Kept. CONCEPT.md sets line 8's GT mark on the shelf at the lower left, its T's crossbar on the moon's centre line so the connector reads as the T's arm, and says "nothing from line 8 carries into the end card except the fire material and the rails"; it allowed a hold on the mark only if the card's mark sat where line 8's does. It does not (the card's mark hangs at the upper right, over where the moon stands), so recomposing line 8 would break the moon's hold through the cut from line 7 and CONCEPT.md's layout.
- **Line 7's 2.8 s with nothing new** (after "stars"): the rule now draws on "used by companies" (37.36 s) as the shelf, and the marks light by name over 38.60 to 41.71 s, so the line has an arrival on every name.
- **The pulses were 2 px of colour at 720p:** the GT mark in the row now arrives in fire on "yours" (its own drawing, tinted in the material's #fe5b16) and sends the pulse; in line 8 the moon's smoke thickens inside its disc as the pulse reaches it (innerGlow 1 to 1.4 and back).
- **The glyph moon's light and rim:** its ink is now mapped as the print maps it (no lift), so it correlates 0.83 with the print it replaces (0.74 before) and its light's centroid is within 6 px of the print's. The critic read f06's light (another smoke phase) as the print's; the print is the film's own reference. Glyph centres stand at least 15 px inside the limb and no glyph's ink passes it.
- **"Four modular layers" over an uncut moon:** on "sites" the seams' three left crosses draw at the limb (x 928, 60 px under the heading), and line 4's seams draw out of them.
- **The frozen 1.9 s after "shape":** the glyphs' ink follows the moon's smoke again from "shape" (easing up to 0.08 shader seconds a second); their sizes hold.
- **Two GT marks in line 7:** the margin mark steps out at 32.0 s.

Sound critic (fail, two majors):

- **Clicks on the card (major):** `lib/make-bed.mjs` evaluated its lifts with `volume=...:eval=frame`, one gain per decoded MP3 frame (26.1 ms), so the 8 dB ring lift was a staircase of 0.4 dB steps. The lifts are now one curve evaluated per sample (`aeval`).
- **The bed pumping in every gap (major):** every gap is under 1.2 s, so `lib/make-mix.mjs` holds the duck across it (a 1.5 dB breath on a half-sine), keeps the 280 Hz dip at depth, and `--flatten-carve-level` holds each carve dip at its deepest within 0.95 s before and 0.3 s after, rising back at most 12 dB a second. The duck is 5.5 dB (7.5 before) so the bed still reads about -26 LUFS under speech with the deeper held dips.
- **The card's entry as a crescendo:** the ring's lift (now 11 dB) ramps in from 0.45 s after the cut, once the swell has decayed, and the duck after line 8 lets go over 1.0 s on a smoothstep: the card's loudest moment went from -13.2 to -17.7 LUFS momentary, under the narrator's median.
- **0.45 s of music alone at the open:** lines 1 and 2 moved 0.2 and 0.1 s later and the fade in is 0.1 s, so the music plays alone for 0.7 s. Line 2's lit band keeps its phase on "itself" (shader clock 2.05 instead of 2.1).
- **Small speakers:** the master takes another -4 dB below 90 Hz and +2.5 dB from 300 Hz to 1 kHz (the critic's numbers).
- **"Unkey" heard as "Anki", and the spoken list against the marks:** each named mark lights on its name (Turborepo on "Vercel", Unkey on "Unkey", Orama on "Orama", GT on "yours"); shadcn/ui and Better Auth, which the voice does not name, follow Turborepo 90 ms apart so the row still fills left to right. No respelling: the vowel is the Australian one.
- **Line 2 rushed (optional retake):** kept. MOTION.md never slows a take, every word of it is right, and a retake would only be another reading at the same speed.
- **"Less magic" never explained:** kept. SCRIPT.md's headings are final and the task binds the film to them.

### Traps met in round 7b

- **Heading seats.** Seating a heading by its first line only leaves the second line wherever its first glyph's sidebearing puts it (7 px left for "t" and "v" at 120 to 130 px). Seat each line. A negative margin on a line trips the layout audit's `container_overflow` warning; set the heading at the leftmost line's position and step the others in.
- **Layout reads at boot.** A clip's elements may not be laid out while the clip is outside its window at boot, so the counts' tops come from Inter's metrics (baseline 0.8638 em below a line-height-1 box's top, cap height 0.7275 em), not from `offsetTop`.
- **Probing the page in Playwright.** `page.evaluate(() => tl.seek(t))` returns the GSAP timeline and hangs serialising it; return a number. `waitForFunction` returning the timeline object hangs the same way; return a boolean. A plain browser has no `window.__timelines`; an init script must create it.
- **Contact-sheet tiles lie about the moon.** At 240 px a lit moon with a dark left half reads as a crescent; compare phases on full-resolution crops (`moon-phases` sheet, then the probe, the snapshot and the render all agreed).
- **Music API timing.** Both compositions ignored every timing instruction (a build at the start, an early ending), as round 7's did. Plan on an edit: find the body's pulse grid, pick the splice by band-envelope and chroma similarity, cut 2 ms before corresponding attacks, and check the pulse intervals across the splice on the master.
- **Short gaps never let a ducked bed reach full level.** With 0.55 to 0.86 s between lines and 0.3 / 0.45 s ramps, the gaps read about 6 dB under the bed's steady level; measure "alone" in the gaps themselves, the open and the card, and the undocked bed in the line windows to know the real duck.
- **ffmpeg `volume` with `eval=frame` is a staircase.** The expression is evaluated once per audio frame, which for a decoded MP3 is 1152 samples; an 8 dB ramp becomes 0.4 dB steps every 26 ms, heard as clicks wherever the bed plays alone. Use `aeval` (per sample) for any gain curve, and check with an impulse scan against the source.
- **A duck that releases in sub-second gaps is a pump.** With 0.45 to 0.86 s gaps, releasing the duck, the low-mid dip and the carve's dynamic dips in each one made six surges in 46 s; hold them across any gap under about 1.2 s and let go only at the open and the card. The carve's lanes need the same hold, or the bed's 120 to 300 Hz band still breathes.
- **A ring lift that starts on the swell extends the swell.** Lift the held chord only after the swell has decayed, or the card's cut becomes the loudest moment of the film.
- **Living ink drifts the light.** Re-sampling the glyph moon's ink from a moving smoke clock while its rows are still landing moved its light away from the print it replaces (correlation 0.83 to 0.33 by the time it was whole); start the drift once the shape is complete.
- The renderer traps from round 7 still hold (no literal family names in CSS, the true-peak correction above -1 dBTP, peak control in the ffmpeg masters, gem mounts seeked with `gem.at()` in `onUpdate`, frames grabbed by index, the 0.1 s lead-in on the bed).

## Round 7 (superseded by round 7b; its takes and mix are in audio/archive-r7a/)

Round 7 rebuilt the film from scratch for Kevin's requests ("make the videos a lot better and more properly scripted", "for the new videos, we need new visuals too", "the new scripts and visuals and stuff have to be done from scratch"). The words are `SCRIPT.md` and the pictures are `CONCEPT.md` (the r7-viewer treatment), both with their changes after judging. `STORYBOARD.md` is the plan with the takes' real timings. Nothing of the earlier cuts' pictures, scripts, timings, takes or bed is used. The round 5 composition, storyboard and scene code are in `archive/` (`index-r5.html`, `STORYBOARD-r5.md`, `lib-r5/`, `assets-r5/`), and its takes and mix files, with a stopped lane's half-finished round 6 edits, are in `audio/archive-r6a/`. The round 5 render is `../../out/v5/blog-fuma-nama.mp4`.

The story: Fuma Nama learned to code by reading code instead of documentation, and he built Fumadocs, a docs framework any developer can take apart and reshape. One object carries the middle of the film. The Fumadocs moon is lit, printed and cut into four layers. It gives up one layer to be reshaped into a block, and it comes back whole in glyphs from sixteen writing systems before the GT mark closes the film.

### Deliverables

- `../../out/blog-fuma-nama.mp4`: the final, `--quality delivery --fps 60 --workers 3`. H.264 1920 x 1080, 2850 frames, and AAC 48 kHz stereo at 197 kb/s. Both streams are 47.500 s. The render log has no Google Fonts line (its only "Google" is the WebGL vendor string).
- `../../out/blog-fuma-nama.png`: the poster, the end card at 46.0 s with the title set.
- `../../out/_sheets/blog-fuma-nama.png`: the contact sheet of the final, one frame per 0.5 s, six columns, 480 px tiles, with the time under each.
- The drafts are in the round 7 scratch folder, outside the repository.

### Measured on the final

- `ffmpeg -i blog-fuma-nama.mp4 -af ebur128=peak=true -f null -`: integrated -16.8 LUFS, true peak -2.0 dBTP, LRA 3.4 LU. The renderer's true-peak correction did not fire: an audio-only copy of the mix equals the sum of its voice and bed stems to 0.03 dB.
- Stems, from audio-only renders of the same mix block (`lib/make-mix.mjs --stems`): the narrator -16.4 LUFS (-16.3 inside the lines), the bed -25.9 LUFS under speech, -21.1 LUFS outside the lines (the open, the gaps and the end card together) and -19.4 LUFS on the end card before its fade. While a line plays, the narrator is 7 dB over the bed at 100 to 200 Hz, 11 dB at 200 to 400 Hz, 17 dB at 400 to 800 Hz, 29 dB at 0.8 to 1.6 kHz and 48 dB above 1.6 kHz.
- `el.mjs hear` on the final returns all 90 words of SCRIPT.md in order, with every name right ("Fuma Nama", "Fumadocs", "General Translation's"); the music reads as an instrumental tag only, at the end.
- `npx -y hyperframes@0.8.106 check`: 0 errors. Two warnings are kept on purpose: `composition_file_too_large` and `timeline_track_too_dense` (one monolithic file with seven headings on one track, as MOTION.md allows for a short film).

### What was built and why

- **Timing.** The takes set the clock. Each line starts 0.1 s after its cut (line 1 at 0.6 s so the music is heard alone first, line 6 0.2 s after its cut as a breath before the quote). Placed at the script's planned starts, the real takes left 0.05 s between lines 1 and 2 and 0.2 s between lines 6 and 7, so each later cut moved to the next 0.5 s beat. The cuts are 0, 4.5, 9.0, 15.5, 19.5, 30.5 and 39.0 s, the title arrives at 43.0 s, and the film is 47.5 s, inside the orchestrator's 47 to 48 s. Every line then has 0.55 to 0.75 s of silence before the next. `lib/cues.mjs` places the clips and prints every word's film time; `index.html` holds the same table as `CUE`.
- **Key actions on words.** The heap's crest settles on "files" (1.89 s). The lit band crosses the file's middle block on "itself" (7.80 s). The moon is lit on "Fumadocs" (10.14 s). The layers part on "break" (18.46 s) and spread on "breakable" (19.97 s). The slot's hairline draws on "ability" (22.42 s), the piece slides out through "to take apart" (24.4 to 25.7 s), squares off on "reshape" (26.91 s) and is joined by the connector on "any piece" (28.24 s). The print leaves on "from scratch" (32.13 s), the glyph moon's last row lands on "shape" (36.26 s), and the GT mark is lit as the voice says "General Translation's" (39.87 to 41.14 s). The title arrives after line 7's last word and holds 3.84 s once set, and the frame holds 4.78 s after the last word.
- **Cut frames.** A heading that arrives on a cut starts its mask rise 0.067 s before the cut (its clip is hidden until then), so the cut frame already shows half of it. The file's lines, the moon's glow and the GT mark's glow likewise start 0.12 to 0.15 s early. In the first draft the cuts at 4.5 and 39.0 s landed on near-black frames.
- **Headings.** Each heading's box is moved left by its first letter's sidebearing so its ink starts at x 160 (measured on the render: 161 to 170 px before). Cap tops measure 171 to 172 px. The title is shifted 4.5 px left so its ink centre sits on the mark's centre (959.5).
- **Mounts.** Two gem smoke mounts. Mount A (free fire smoke, hidden, pixel ratio 0.5) is read for the heap's light (shader time 14, scale 0.9, offsetX 0.25) and the file's print (2.1 + 0.5 (t - 4.5), scale 0.6, offsetX 0.3). Mount B draws the moon (scale 1.1, offsetX 0.36) from 9.0 to 32.6 s and the GT mark (scale 0.62, offsetY -0.16) from 39.0 s. Each switches look through `mount.setUniformValues`, which caches by value, so a texture uploads only when the shape changes.
- **The moon's disc** was measured on screen with the inner colour white and both glows 0: centre (1348.3, 539.5), radius 380.9. The treatment's (1355, 534) was 6 px off, and the print's disc mask and the four layers' cuts (153, 348, 540, 729, 927, snapped to the 3 px cell) use the measured one.
- **The prints** are one 640 x 360 grid of 3 px cells through the kit's 8 x 8 Bayer matrix in four tones (black, ember, fire, sun). The glass turns into the print cell by cell in Bayer order on one smoothstep (15.5 to 16.0 s). Each layer is printed at home and carried by its shift, so its pattern travels with it. The piece re-samples its own band from arc to rectangle with the Bayer tile anchored to the piece, so at progress 0 it is the band itself. The print leaves by lowering its tone to 0.
- **The moon's clock.** Beat 3 turns at rate 0.2 (the concept said 0.4) and shows the treatment's key state (shader time 2.30) on "Fumadocs". At rate 0.4 the swirl reached its dark half (4.4 to 6.0, where only 0 to 9 percent of the print's cells are sun) during the prints, and the print and the glyph moon read dim. At 0.2 the mix comes in at 3.37 and the prints drift at 0.015 to about 3.6, inside the bright half (21 to 34 percent sun).
- **Smoke off type.** Every phase was scored over the whole cycle with a probe that renders the mount and measures the share of pixels above a luminance threshold inside each heading's ink box plus margin, excluding the moon's disc. Above an outer glow of about 0.2, the shader lays a faint smoke field over the whole frame, including the headings. Beat 3 and the end card therefore stop at 0.18. There, beat 3's heading zone peaks at 1.6 percent luminance and the title zone at 1.2 percent, and neither has a pixel above 2 percent.
- **The glyph moon** is 492 text nodes on a 30 px grid, each with `lang` (and `dir` for Hebrew and Arabic), sized and inked from the moon's smoke at the moment the print leaves. Its container carries `data-layout-ignore`, the CLI's opt-out for texture text: without it the layout audit counts overlapping glyph boxes as errors and the contrast audit flags the ember glyphs. The fallback families are set from JS (`GLYPH_FAMILY`), because the compiler reads family names only from `<style>` text and fetches any it cannot find from Google Fonts.
- **Lines.** The doubled line is drawn as whole-pixel rows, a 7 px white gauge under a 3 px black core (2, 3 and 2 px threads), so it stays crisp. The concept's 6 / 3 cannot be centred on pixels. The slot's hairline is 1 px fire. Ember was too faint at 1080p in the first draft. The seams' left crosses sit at x 928; their arms end 65 px clear of "magic".

### Sound

- **Narrator:** Patrick (`kit/audio/voice.json`, eleven_multilingual_v2, stability 0.7, style 0.05, speed 0.85), one request per line with `--prev` and `--next`, the request text exactly SCRIPT.md's with its curly quotes. No respelling was needed: `hear` returned "Fuma Nama" (as "Fumanama" in line 1), "Fumadocs" (as "Fumadox", or "Fuma Dox" with a 0.04 s join in line 6) and "docs" as said.
- **Masters:** `lib/make-voice.mjs` gives each take a 75 Hz high-pass, an RMS compressor (-24 dBFS, ratio 3), a gain found in up to four passes so every master is -19.3 to -19.4 LUFS mono (-16.4 LUFS in the film, since the mixer plays mono into both channels), and ffmpeg's lookahead limiter at -3.6 dBTP at 192 kHz. Cross-correlation shows each master on its take's timing to the sample, so the `.json` timings hold.
- **Music:** two Music API compositions, the most allowed (`audio/music.take1.prompt.txt`, `audio/music.prompt.txt`). Both ignored the prompt's timing: each builds from silence over its first 7 s and resolves from about 34.5 s. `lib/make-bed.mjs` edits the second, whose body is eight even bars at 69.8 BPM (the sub bass re-attacks on each downbeat) in a four-bar progression played twice (Dm, F, G, A; bar k matches bar k + 4 at 0.93 to 0.98). The film opens on bar 4 at 0.1 s, plays bars 4 to 8, splices from the end of bar 8 to bar 1's downbeat at 17.23 s (the music's own A to Dm change, a 12 ms crossfade ending 2 ms before both attacks, under line 4), then plays bars 1 to 8 and the composition's own outro from 44.66 s. The master thins the sub (35 Hz high-pass, -9 dB low shelf at 100 Hz), sits at -15.1 LUFS and peaks at -3.0 dBTP. `hear` finds no voice in it.
- **Mix** (`lib/make-mix.mjs`, then the hyperframes-audio carve at strength 0.3, then `--flatten-carve-level`): the narrator on one `hf-audio-group` bus at 0 dB. Each clip has a 20 ms fade in and a 60 ms fade out and ends 0.18 s after its last word. The bed runs at -2.5 dB. Its volume lane ducks it 8 dB under each line (0.3 s down, ending 0.05 s before the line's first sound, except line 1, which ducks from its first sound so the open is heard at full level; 0.6 s back up from 0.05 s after the last word, 0.8 s after line 7) and fades it in over 0.3 s from 0.1 s and out over 0.8 s from 46.7 s. The carve's three dynamic dips (250 Hz, 1.6 kHz, 2.5 kHz) follow the narrator's level in those bands. Its level stage is removed, because it held the bed 6 dB down from the first line to the end card and released over about 4 s, which doubled the duck and missed the 0.3 to 0.8 s ramps.

### ElevenLabs ledger (round 7)

| request | what | result | used |
| --- | --- | --- | --- |
| TTS vo-1 | line 1, 47 chars | 4.23 s, 9 words in 3.46 s, 2.60 w/s | yes |
| TTS vo-2 | line 2, 67 chars | 5.25 s, 12 words in 3.79 s, 3.17 w/s | yes |
| TTS vo-3 | line 3, 80 chars | 7.06 s, 13 words in 5.92 s, 2.20 w/s | yes |
| TTS vo-4 | line 4, 55 chars | 4.55 s, 11 words in 3.40 s, 3.23 w/s | yes |
| TTS vo-5 | line 5, 110 chars | 11.98 s, 20 words in 10.46 s, 1.91 w/s (pauses after "developer" 0.82 s and "apart" 0.71 s) | yes |
| TTS vo-6 | line 6, 101 chars | 9.47 s, 18 words in 7.70 s, 2.34 w/s | yes |
| TTS vo-7 | line 7, 56 chars | 4.04 s, 7 words in 3.71 s, 1.88 w/s (long words: 15 syllables, 4.0 a second) | yes |
| TTS vo-2 take 2 | line 2 again, 67 chars | 3.54 w/s, further off | no (`vo-2.take2.*`) |
| TTS vo-5 take 2 | line 5 again, 110 chars | 1.73 w/s, longer pauses | no (`vo-5.take2.*`) |
| Music take 1 | 44.5 s, 579-char prompt | silent first second, resolves at 35 to 41 s | no (`music.take1.mp3`) |
| Music take 2 | 44.5 s, 790-char prompt with explicit timing | same structure, even body | yes, edited |
| STT | the seven takes, both compositions, draft 2, the final | as above | checks |

The set's rate is 2.34 words a second (90 words over 38.4 s of speech), inside 2.2 to 2.6, so speed 0.85 stayed for the whole film. Lines 2 and 5 were retaken once each at the same settings because their rates sat furthest outside the band; both retakes came out further off and the first takes were kept. Line 5's pauses fall where the picture's take-apart and reshape actions sit. TTS characters sent: 693.

### Traps met in round 7

- **The renderer's processing bump.** HyperFrames 0.8.106 adds a 5 ms low-frequency bump, up to about 9 dB over the signal, at about 0.14 and 0.37 s to a clip that is at full level from its first sample whenever the clip has any gain, `data-volume` or lane. The file format does not matter (16, 24, 32-bit WAV and FLAC all show it), the fps does not matter, and a plain clip with no processing does not have it. In the full mix it reached +0.4 dBFS and fired the true-peak correction, which took 2.9 dB off the whole film. A clip that starts with 0.1 s of silence does not get it, so the bed master has a 0.1 s lead-in.
- **The true-peak sum.** The narrator's masters at -2.6 dBTP plus the ducked bed reached -1.0 dBTP where a word's onset met a bar's attack, and the correction fired again (0.9 dB). With the masters' ceiling at -3.6 dBTP the film peaks at -2.0. To check a mix, compare the full render with the sum of its voice and bed stems; any uniform gap means the correction fired.
- **AAC and the sub.** The bed's sub-bass downbeats made the AAC encoder overshoot by up to 2.6 dB. The -9 dB shelf at 100 Hz keeps them down.
- **ffmpeg, the edit graph.** `apad` and `atrim` after `adelay` in the same filter graph dropped about 56 ms from the head (the delay inserts samples without moving timestamps), which shifted the bed's first segment 40 to 55 ms early. The padding now runs in the limiter pass, on a file input. Check an edit by cross-correlating the master against its source above 300 Hz: both segments sit within 0.4 ms.
- **ffmpeg, frame grabs.** `ffmpeg -i film.mp4 -ss t -frames:v 1` returned the wrong, near-black frame on these renders. Select frames by index instead (`select='eq(n,N)'`, as the round 7 scratch `frames.py` does).
- **carve.mjs** takes clip ids for `--voice`, not a group id. Without `--voice` it finds the seven clips and writes the group form (`sources: ["voiceover"]`). Re-carving rewrites its level lane, so run `make-mix.mjs --flatten-carve-level` after every carve, then `--stems` to measure.
- **zsh.** `$TAIL[m]` is an array subscript; write `${TAIL}[m]` in an ffmpeg graph label.
- **Retiming.** Change a placement in `lib/cues.mjs`, copy the words it prints into `CUE` in `index.html`, move the matching cut in `CUT`, run `make-mix.mjs`, the carve, the flatten and the stems, and check that the bed's splice (17.23 s) still sits under a line.

## Round 5 (the earlier cut, archived)

Everything below describes the round 5 cut. Its composition is `archive/index-r5.html`, its storyboard `archive/STORYBOARD-r5.md`, its scene code `archive/lib-r5/`, its takes and mix files `audio/archive-r6a/`, and its render `../../out/v5/blog-fuma-nama.mp4`. Paths in it are as they were then.

The blog trailer for "Fuma Nama: The philosophy of an open-sourcerer" by Taylor Fang, published September 3, 2026 at generaltranslation.com/blog/fuma-nama. It runs 27.0 s at 1920 x 1080 and 60 fps, with an Australian narrator and a music bed. The beats, copy, narration and timing are in `STORYBOARD.md`.

Round 5 is the sound pass (Kevin: "add music and an australian voice from elevenlabs"). It keeps round 4, revision 2, the cut the critics passed, and lengthens three holds so the narration fits (STORYBOARD.md lists them). Its revision after the sound critic changed only the sound: the bed is now edited so it holds level to the end card and resolves there, EQ'd so it carries on small speakers, and up before the first word, which now starts at 0.5 s. No take or bed was regenerated. Round 4 redesigned the film for Kevin's direction ("the color we can use is the color and dither and shaders we used (gem smoke from glyphfield). make headers no more than 2 lines large. feel free to use logos. no need for captions/subheaders") and the art director's notes for this film:

- fire gem smoke;
- the moon as a glass shape;
- marks in the architecture;
- the GT mark in smoke on the end card.

### Deliverables

- `../../out/blog-fuma-nama.mp4`: the final, rendered with `--quality delivery --fps 60 --workers 3`. H.264, 1620 frames, and AAC-LC 48 kHz stereo; both streams are 27.000 s.
- `../../out/blog-fuma-nama.png`: the poster, the title card (frame 137, the frame round 4's poster showed at frame 120, with the same smoke).
- `../../out/_sheets/blog-fuma-nama.png`: a contact sheet of the final, one frame per second, six columns, 480 px tiles, with the time under each.
- `../../out/_draft-blog-fuma-nama.mp4`: the last draft (30 fps, with the final mix), safe to delete.
- The silent round 4 final and poster are kept at `../../out/v4/blog-fuma-nama.mp4` and `.png`; the round 3 cut at `../../out/v3/`.

### Measured on the final

- `ffmpeg -i blog-fuma-nama.mp4 -af ebur128=peak=true -f null -`: integrated -16.0 LUFS, true peak -1.3 dBTP, LRA 2.6 LU. No sample is flat-topped (astats flat factor 0).
- The narrator alone (an audio-only render of the same mix with the bed removed): -15.6 LUFS integrated.
- The bed, from an audio-only render with the narrator's bus hidden: -26.3 LUFS under speech, about 10 dB under the narrator; -24.6 LUFS in the gaps between lines; -21.0 LUFS on the end card from 25.53 to 26.2. Momentary loudness on the end card is -24.0 LUFS at 25.6 s and -21.8 to -18.9 from 25.8 to 26.4, then falls through the fade to silence at 27.0. Round 5's first mix read -35.8 to -39.1 over the same span.
- Small speakers: with a 200 Hz high-pass on the final, the bed in the gaps is -30.7 LUFS against the narrator's -17.3, 13.4 dB under. Round 5's first mix measured 21 dB under.
- Every clip edge and both bed joins: the largest sample-to-sample step within 5 ms is at most 1.1 times the local 99th percentile, and the 3 kHz band at each edge equals its neighbourhood. The film starts and ends in silence.
- `el.mjs hear` on the MP4 reads the whole script back in order, each line within 0.15 s of its planned first sound.
- The picture is round 5's: index.html changed only inside the mix block, and all 1620 frames are bit-identical to round 5's first final. The contact sheet shows the same scenes as round 4's (`../../out/v4/`), with round 5's longer holds.

### Sources and credits

- The post MDX and its `FumadocsArchitecture` figure (gt-cloud `apps/landing`). The architecture is rebuilt in the isometric family, not copied.
- The material is Paper Shaders' Gem Smoke (Apache-2.0), through `kit/gemsmoke.js`. It is the Glyphfield fire render the post's covers use. No photograph or third-party picture appears, so no credit line is needed, and round 4 carries no captions.
- Marks:
  - `kit/logos/fumadocs.png`.
  - `mdx.svg`, as drawn.
  - `react-logo-dark.svg` and `tanstack-logo.svg`, one-color, recolored to paper.
  - `nextjs-logo.svg`, reversed: the circle in paper, the N in ink.
  - `kit/gem-shapes/fumadocs-moon.png` and `gt-mark.png`, the glass shapes.
- `assets/issue-rings.png`: six open-issue rings (the ring and its dot), drawn by `lib/make-rings.mjs` and pre-processed by Paper's own `toProcessedGemSmoke`.
- `fonts/JetBrainsMono-latin.woff2`: JetBrains Mono 2.211 (SIL Open Font License 1.1), for the code panel only. See `fonts/README.md`.
- Sound, all from ElevenLabs through `kit/audio/el.mjs`:
  - The narrator is the premade voice Charlie (eleven_multilingual_v2, stability 0.7, style 0.05): `audio/vo-1.mp3` to `vo-7.mp3`, each with its `.json` timings and its `.stt.json` check.
  - The bed is one sound generation: `audio/bed.mp3` (28 s, prompt influence 0.6), its prompt in `audio/bed.prompt.txt`, its check in `audio/bed.stt.json`. The film plays `audio/bed-edit.wav`, cut from it by `lib/make-bed.mjs` (below); no second bed was generated.

### ElevenLabs ledger

| call | what | characters or audio |
| --- | --- | --- |
| line x 7 | one take per line, none retaken | 345 characters of text (47, 40, 54, 50, 68, 54, 32), plus 611 characters of `--prev` / `--next` context |
| bed x 1 | one bed of the two allowed | a 332 character prompt, 28 s generated |
| hear x 11 | the seven takes, the bed, round 5's first final and two finals of its revision | 53.5 s of takes and bed, 3 x 27 s of film |

### Files

- `index.html`: the composition, monolithic, as MOTION.md allows for a short film. It has one paused timeline on `window.__timelines.main`, registered only after both gem mounts resolve, both shape images load and the fonts load. Every frame is drawn by the timeline's `onUpdate` from proxies, so a frame is a pure function of time. The sound is the block between `<!-- mix:` and `<!-- /mix -->` at the end of the root.
- `audio/`: the takes, the bed and their checks (above), and `bed-edit.wav`, the bed as the film plays it.
- `lib/make-bed.mjs`: writes `audio/bed-edit.wav` from `audio/bed.mp3` (below). Run it from the film folder.
- `lib/make-mix.mjs`: writes the mix block from the takes' `.json` timings (below). Run it from the film folder; do not edit the block by hand.
- `lib/iso.js`: the 30 degree isometric map, the box recipe (opaque hull, faces, hairlines once) and a polyline helper.
- `lib/logos.js`: generated by `lib/make-logos.mjs` from `kit/logos/` (React and TanStack recolored to paper, Next.js reversed). Run `node lib/make-logos.mjs` to regenerate; do not edit it by hand.
- `lib/swarm.js`: the moving type. It samples each line of a heading into 3 px glyph cells on the frame's grid, pairs the cells of two headings in reading order with matter conserved, and draws the swarm as a pure function of progress.
- `lib/ringprint.js`: beat 5's issues. It draws one ring's box of the second mount's canvas in full color, or prints it through the Bayer screen in fire and sun with its tone multiplied by k.
- `lib/make-rings.mjs`: writes `assets/issue-rings.png`. Run `node lib/make-rings.mjs` to regenerate. Its geometry must match `RINGS` in `index.html`.

### How the sound is built

- **The bed edit.** `lib/make-bed.mjs` writes `audio/bed-edit.wav` (44.1 kHz, 16-bit stereo, 27.3 s) from `bed.mp3`. The generation swells in from silence over 1.25 s, drops its drone and dips at 14.5 to 16.4 s (to -33 dB full band at 16.0 s), and decays from 24.25 s. The edit is three passages of it:
  - film 0.0 to 13.7 plays the source from 1.0 s;
  - film 13.1 to 20.8 plays it from 16.4634 s;
  - film 20.2 to 27.3 plays it from 3.9959 s.

  The joins cross over 0.6 s on a raised-cosine curve, under lines 4 and 6, between passages of the same chord colour. The drone is wide: its two channels are often near anti-phase. So each join's source time is the one, within 30 ms, where the drone below 110 Hz holds steadiest through the crossfade in the left channel, the right channel and the mono fold-down. The first pin, chosen on mono alone, notched the left channel's drone by 21 dB. `node lib/make-bed.mjs --search` re-derives the pins. The drone's re-attack at 3.0 to 3.75 s of the source stays, at film 2.0 to 2.75 under line 1: removing it too would repeat ten seconds of the bed.
- **Placement.** `lib/make-mix.mjs` holds `CUES`, the beats where each line's heading is revealed (equal to `B2` to `B7` in `index.html`, with 0 for the title). Each clip starts so its first sound (the first 10 ms of the take above -40 dBFS) lands 0.10 s after its cue. Line 1 lands at 0.50 s: the title is on screen from frame 0, and the bed comes up first. Each clip ends 0.25 s after the last letter in the take's alignment, inside the take's silence; that also keeps out a small sound at 3.56 s in `vo-6.mp3`. Each clip fades in over 20 ms and out over 60 ms on its own volume lane; line 2's lane holds at -1 dB (`TRIM_DB`, see the true-peak trap).
- **The narrator's bus.** The seven clips are members of `<hf-audio-group id="voiceover">`, whose chain is a compressor (threshold -20 dB, ratio 3, attack 5 ms, release 120 ms, about 2 dB of reduction on average), the narrator's level (+8.8 dB) and a limiter (-3.4 dB, attack 0.1 ms, release 40 ms).
- **The bed.** `music-bed` is in its own group, `music`, with no bus. Its chain is the carve's nodes, then its own EQ and level:
  - a high-pass at 38 Hz;
  - a low shelf of -6 dB at 110 Hz, which thins the 65 Hz drone;
  - a +5 dB bell at 300 Hz (Q 0.7) on its partials at 130 to 400 Hz;
  - its level, -3.5 dB.

  Without the EQ the bed's energy is almost all below 150 Hz, which laptop and phone speakers do not play. Its volume lane holds the duck (-6 dB, down over 0.3 s ending 0.05 s before each first sound, up over 0.8 s from 0.05 s after each last letter), the 0.3 s fade in at the start and the 0.8 s fade out at the end. After the last line the release is 0.3 s, and a lane on the level stage (`fx.b4.gain`) lifts the bed 1.5 dB over the same 0.3 s and holds it to the end, so the end card carries the music at about -21 LUFS before it fades.
- **The carve.** After `make-mix.mjs`, the bed is carved against the `voiceover` bus with the hyperframes-audio skill's script, at strength 0.1: dynamic dips at 250 Hz (to -3.6 dB) and 1 kHz (to -1.8 dB) and a level stage that sits at -2 dB from the first line until 26.2 s, written as `fromCarve` nodes and lanes beside the duck and the lift. The carve needs `@hyperframes/core@0.8.106` installed somewhere; point `--core` at it:

  ```
  node lib/make-bed.mjs
  node lib/make-mix.mjs
  node <hyperframes-audio skill>/scripts/carve.mjs --comp index.html --bed music-bed --strength 0.1 --core <folder with @hyperframes/core@0.8.106>
  ```

  `make-mix.mjs` rewrites the whole block and drops the carve, so run both, in that order, every time. Re-carve after `make-bed.mjs` too: the carve's level stage is measured on the bed file.
- **The levels.** MOTION.md asks for the narrator at about -16 LUFS for the film, the bed at about -26 LUFS under speech and -20 alone, and a duck of about 10 dB. Read as the bed sitting about 10 dB under the narrator while a line plays, all of them hold: -16.0 for the film, -26.3 under speech against the narrator's -15.6, -21.0 on the end card. The lane and the carve take the bed about 8 dB under its own unducked level while a line plays.
- **The script's simplifications.** Line 4, "The package is a black box. The CLI is a compiler.", drops the post's hedges: Fuma says the package is "a kind of black box for most developers", and the post says the CLI is "effectively a compiler". The line states the two halves of the post's own section title, "A black box and a compiler", which is the heading on screen in that beat. The full wording is three words, about 0.8 s, longer; it would run past the cut at 15.5 into line 5, so it is kept short. Lines 6 and 7 both say "General Translation": line 6 is the grantee heading word for word, and MOTION.md fixes line 7.
- **The bed's spectrum.** The drone is C2 (65.4 Hz) with partials at C3, G3, A3, C4 and G4 and sparse low piano; above 1 kHz it is 50 to 60 dB down, so it leaves the voice's consonants alone. In the mix the narrator stays at least 12.9 dB over the bed in every band above 100 Hz while a line plays, and 30 dB over it above 400 Hz.

### Traps for a later editor

- **Retiming.** `CUES` in `lib/make-mix.mjs` must equal the beats in `index.html`. Move a beat, then move its cue, run both mix commands, and check that the line still ends before its cut. If a beat moves a line, check that the bed's joins (13.1 and 20.2 s) still sit under a line.
- **The render's true-peak ceiling.** HyperFrames 0.8.106 measures the mixed AAC and, when its true peak is above -1 dBTP, attenuates the whole track to -1.5 dBTP (`enforceAacTruePeak`). The correction lowers everything by up to 2 dB, so a louder bed or narrator can come out quieter. The peaks that reach the ceiling are the narrator's word onsets, with the bed under them; the loudest of the seven is line 2's "I" at 4.12 s, hence its -1 dB trim. With the narrator at +8.8 dB and the limiter at -3.4 dB the mix peaks at -1.3 dBTP and the correction does not fire. Check each audio-only render's loudness against its stems: a full mix quieter than the sum of its stems has been corrected.
- **The limiter is an envelope follower.** Its detector is a one-pole follower of |x| with the attack and release given, and it holds that envelope, not the waveform, under the ceiling. Waveform peaks pass it by their crest factor, so it cannot hold a word's onset under -1 dBTP on its own.
- **The carve ignores `data-media-start`.** carve.mjs decodes a bed from the start of its file, so a bed clip trimmed with a media offset is carved against the wrong audio. That is why the bed edit is a file of its own, starting at film time 0.
- **Measure a mix without the picture.** Generate an audio-only copy with `node lib/make-mix.mjs --standalone <dir>/full.html --stems <dir>` (a folder with `kit` and `audio` symlinked), carve `full.html`, and render each file with `npx -y hyperframes@0.8.106 render <dir> -c full.html -o <dir>/full.mp4 --fps 1 --quality draft --workers 1`: about ten seconds each. Its audio is bit-identical to the film's. `voice.html` is the narrator alone; for the bed alone, copy the carved `full.html` with `data-hidden="true"` on the `hf-audio-group`. The numbers marked `num()` in `make-mix.mjs` take environment overrides, for measuring a variant this way; the film is built with the values written there.
- **Fonts.** Never write a literal font family in the composition's CSS other than the shipped JetBrains Mono `@font-face`. Inter comes from `kit/tokens.css` through `var(--font)`. The render log must not mention Google Fonts.
- **The lint's call graph.** Write helpers as function declarations or block-bodied arrows. `hyperframes check` follows calls from the timeline callback with a text scan. An expression-bodied arrow (`const g = (id) => ...`) is read as running to the next top-level comma, so it swallows later code. That once marked `draw` as reaching the `getComputedStyle` in `build()` (`gsap_callback_dom_measurement`).
- **Type placement.** Keep the type in the lower left in beats 1, 6 and 7. The smoke rises from the shape, and type above or beside the shape sits in the plume.
- **The match cut** depends on both shapes being drawn with the same `GEM` scale and offsets, and on both shape PNGs being square (1024 x 1024). The rings shape is 1920 x 1080 and carries its own look.
- **`MOON` is measured, not derived.** Re-measure it if `GEM.scale` or the offsets change: render the mount with `colorInner` white and both glows 0, and take the lit pixels' bounds.
- **The stack's position is bound by heading 1.**
  - "less opinionated software" ends at x 1204.
  - The thread's centre `RX` is 1286.5, a half pixel so its 3 px threads land on whole pixels. That leaves 78 px to the thread's left edge.
  - The column runs to x 1790, 63 px inside the right rail.
  - The marks' right edges sit 26 px left of the thread. Scale 1.32 is the largest stack that keeps all of that.
  - The copied module's route (at x 1.5 cells, out to y `YR`) stays 30 px right of the thread. If the scale changes, check both.
- **Do not dither the code panel's text.** The code is DOM text in a panel, never printed through the screen.

### How the material is drawn

- **Two full-frame gem mounts.** The moon mount draws beats 1 and 6. The second mount draws the issue rings in beat 5 and the GT mark from 23.5 on. Only one mount draws and shows in any frame.
  - The second mount changes shape through `lookOf()`, which sets `u_image` (a loaded hidden `<img>`), `u_scale` and the offsets with `mount.setUniformValues`. The mount caches uniforms by value, so the shape texture is uploaded only when it changes.
  - The moon and the GT mark share every other parameter (`GEM` in `index.html`). The smoke outside the glass is therefore the same picture in both, and the cut at 23.5 changes only the shape.
- **Beat 1 prints the moon mount through the Bayer screen.** `gem.dither` uses the tones ink, ember and fire, with gamma 1.7 so the ink ground prints with no stray cells, and raises the tone from 0 by the `amount` option.
  - The mount's own canvas then shows through a `clip-path: circle()` exactly inside the moon's outline (measured on screen: x 1243 to 1657, y 116 to 531, radius 207).
  - The glass is the one unprinted thing in the frame.
  - As on the Fumadocs cover, the print may run under the title.
- **Beat 5 draws the rings glass only** (outer glow 0, inner glow 0.65, smoke size 1).
  - The ring shape is a full frame because the smoke's plume is laid out in a square box of the canvas height. On a narrow band canvas it lit only the middle rings.
  - Each ring's box is copied onto the field canvas while it is open.
  - A closing ring is printed by `lib/ringprint.js` on the 3 px grid with its tone lowering to 0. Tone starts above the ink ground's luminance, so the ground prints as ink.
- **The smoke's clock.** The shader's swirl repeats every 2 pi shader seconds. Each phase was chosen in round 4 with a probe that renders the mount at 480 x 270 over the full period and scores the hottest 96 px column of any line of type, so a local intrusion counts. The probe is in the round 4 scratch folder (`r6/probe.html`, `probe.mjs`). Round 5 maps each beat's clock back onto round 4's beats (`R4_B2`, `R4_B5`, `R4_B6` in `index.html`), so each beat shows the smoke that was searched: beat 1 runs at 3.5 / 4.0 of the rate and reaches its cut in the searched state; beats 5 to 7 kept their lengths and are shifted by 3.0 s.

  | beats | shader seconds (t in film seconds) | what the search measured | result |
  | --- | --- | --- | --- |
  | beat 1, the print | 3.25 + 0.35 x (3.5 / 4.0) t | the share of fire cells on the title over the beat, with the tone ramp modelled | worst column 14 percent, behind the ascenders of "phy" in the beat's last tenth of a second |
  | beat 5, the rings | 2.6 + 0.35 (t - 3.0) | the darkest ring's mean luminance while it is open | at least 0.43, fire-bright, with a mean of 0.66 |
  | beats 6 and 7, the close | 4.35 + 0.25 (t - 3.0) | luminance above 0.3 on the grantee line and the title over both beats, from 16 px above the ascenders, probed at half resolution so thin tails count | worst column 8.5 percent on the grantee line during the bloom and 4.7 percent on the end card's title |

  Beats 6 and 7 run at smoke size 0.35, slower and tighter round the shape, and the bloom is included in that search. If the type, a shape, `GEM` or a beat's length changes, search again.
- **Uniforms change per beat** through `mount.setUniformValues` (cached, synchronous) before `gem.at(t)`. That covers `u_size`, `u_innerGlow` for the glass filling in beat 1, `u_outerGlow` for the bloom in beat 6, and the second mount's look. Do not call `gem.set()` per frame: it loads the shape image asynchronously.
- **The copied module's faces are SVG patterns.** Each face is one 8 x 8 Bayer tile of 3 px cells: top 0.86, left 0.6, right 0.36 of the three-tone ramp ink, fire, sun. The tiles are in user space anchored at the frame's origin, on the same grid as the field canvas.

### Check

`npx -y hyperframes@0.8.106 check .` passes with 0 errors. One warning is kept on purpose: `composition_file_too_large`, because the film is one monolithic file, as MOTION.md allows for a short film. The two hanging quote lines carry `data-layout-allow-overflow` because the opening mark sits in the margin by design.
