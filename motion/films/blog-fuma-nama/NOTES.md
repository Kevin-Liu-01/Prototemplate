# blog-fuma-nama: notes

The blog trailer for "Fuma Nama: The philosophy of an open-sourcerer" by Taylor Fang, published September 3, 2026 at generaltranslation.com/blog/fuma-nama. 24.0 s, 1920 x 1080, 60 fps, silent. The beats, copy and timing are in `STORYBOARD.md`.

## Deliverables

- `../../out/blog-fuma-nama.mp4`: the final, `--quality delivery --fps 60 --workers 3`, H.264 yuv420p, 1440 frames.
- `../../out/blog-fuma-nama.png`: the poster, the title card at 3.0 s, full resolution.
- `../../out/_sheets/blog-fuma-nama.png`: contact sheet of the final, one frame per second, six columns, 480 px tiles, time under each.
- `../../out/_draft-blog-fuma-nama.mp4`: the last draft (30 fps), safe to delete.

## Sources and credits

- The post MDX and its `FumadocsArchitecture` figure (gt-cloud `apps/landing`). The architecture is rebuilt, not copied: plates and modules in the isometric family, the post's layer and package names as labels.
- No third-party picture appears, so no credit line is needed. The moon is a synthetic dither field (a shaded sphere), standing for the Fumadocs logo as the post describes it. The post's author is credited on the title card.
- The post's own images (`kit/blog/fumadocs*.png`, `fuma-nama-og.png`) are not used: they carry orange and yellow that break the one-accent rule, and dithered as plates their interface text turns to noise.

## Files

- `index.html`: the composition (monolithic; MOTION.md allows it for a short film). One paused timeline on `window.__timelines.main`, built after `document.fonts.load` so the glyph sampling sees Inter.
- `lib/iso.js`: written for this film because the kit has no isometric helper. `GTIso.make({ ox, oy })` gives the 30 degree map and `box()` (opaque hull, top 4 / left 9 / right 15 percent faces, the silhouette and the interior front edges each stroked once); `GTIso.polyline()` rewrites a sub-path per frame for draw-ons and pulses (real geometry, no dash offsets).
- `lib/swarm.js`: written for this film because the kit has no moving-type engine. `GTSwarm.sample()` rasterises each line element into 3 px cells against the anchored 8 x 8 Bayer threshold; `pair()` conserves matter (N = max(nA, nB) particles in reading order); `draw()` is a pure function of progress.
- The series frame is `GTSheet.mount` from the kit with its four rails hidden and replaced by eight half-rails in `index.html`, so each rail draws out of both of its crosses (the kit's single rail can only scale from one origin).

## Traps for a later editor

- Do not put `font-variant-numeric: tabular-nums` on a whole text block: Inter's `tnum` also makes the hyphen tabular, which opens "open-sourcerer" into "open - sourcerer". Only the date line (`.tnum`) and the kit counter carry it.
- The kit sets Inter `cv11` (single-storey a) in the DOM; canvas text cannot switch features, so `swarm.js` samples U+0251 where the text has an a. Remove that substitution if `cv11` ever leaves `tokens.css`.
- Sampling reads layout through `offsetLeft/offsetTop`, before any tween is built. Keep every text element in the DOM and laid out for the whole film (visibility is opacity sets, not clips).
- The doubled line here is threads in the body tone (`#9b9b9a`, solid so the carve is exact), stroke 7 under a 3 px ground core: two 2 px threads with a 3 px gap. The pulse is the third copy at 7 px in the accent between them.

## Check

`npx -y hyperframes@0.8.106 check .` passes with 0 errors. Warnings kept on purpose:

- `composition_file_too_large`: one monolithic file, as MOTION.md allows for a short film.
- Contrast 4.12:1 on the series counter: the kit's frame furniture (15 px at 45 percent ink), left as the kit draws it so the counter matches every other film.
