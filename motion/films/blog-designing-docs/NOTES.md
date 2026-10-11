# blog-designing-docs: notes

The trailer for "Designing docs for humans" by Kevin Liu and Taylor Fang,
published September 17, 2026 at
generaltranslation.com/blog/designing-docs-for-humans.

- Duration: 53.5 s (the v4 cut after the critic's fix round, 2026-10-06):
  49.5 s of story and the 4.0 s end card. 1920 x 1080, 60 fps, H.264 High with
  AAC-LC stereo 48 kHz (narrator and music bed); audio and video both 53.500 s.
- Renders: `out/blog-designing-docs.mp4` (delivery, faststart),
  `out/blog-designing-docs.png` (poster: the settled series end card, the
  film's last frame, frame 3209), `out/sheets/blog-designing-docs.png` and
  `.webp` (the kit's contact sheet, two frames a second). Earlier cuts: round
  3 in `out/v3/`, the silent round 4 final in `out/v4/`, the round 5 narrated
  cut in `out/v5/`, the round 7c cut in `out/v7/`, the first round 7d cut in
  `out/v7d/`, the round 7d revision with the series frame in `out/v8/`, the
  round 7d revision without the frame (Clara, 42.5 s) in `out/v9/`, and the v3
  build (Frederick Surrey, 41.5 s, md5 60658809c0d09d461a98cd212f3f99e4) in
  `out/v10/` with its poster and contact sheet, and the v4 cut before the fix
  round (50.5 s, md5 ca97807253797ab2a6aefc92516ba309) in `out/v11/` with its
  poster and contact sheet.
- Composition (v4): `index.html`, one standalone file with one paused GSAP
  timeline (`window.__timelines.main`); `render(t)` runs from the timeline's
  `onUpdate` and draws every layer from film time only. One stage clip (`#sS`,
  0 to 46.5) holds all the picture layers, each shown only inside its own
  window; one flat camera (`camF`) carries the page from the landing to the
  close. The shared drawing (palette, the 3 px cell buffer, the page model with
  its old-page extras, the kind-tagged clutter, the wall's miniatures, the glyph
  globe, doubled-line geometry, the Heroicons and the tone masks) is
  `lib/film.js`; the canvas face is `lib/fonts/InterCanvas.woff2`. The film ends
  on the shared series end card, `kit/endcard/endcard.js`, used as it is.
- Words and pictures: `DESIGN-v4.md` (the v4 design: clock, headings, picture,
  transition map, pacing, scale, set pieces, sound); `SCRIPT-v3.md` keeps the
  lines, the takes and the facts. Beats and cues: `STORYBOARD.md` (rewritten for
  v4). Narrator: Frederick Surrey (`kit/audio/voice.json`), the ten v3 takes as
  recorded.
- Sound: `audio/make-bed.py` builds the bed at the film's length from the
  round 5 generation (`audio/bed.mp3`) into `audio/bed-edit.wav` (now with as
  many six-bar jumps as the card needs) and writes the joins' film times to
  `audio/bed-edit.json`; `audio/mix.py` builds everything else
  from the takes (`audio/vo-1` to `vo-10`: `.mp3`, `.json`, `.stt.json`) and that
  bed: the masters (`vo-N.master.wav`, `music.master.wav`), `film-premix.wav`
  (for measuring) and `mix-report.json`, and it rewrites the `<audio>` start
  and duration attributes from the cue table `O` in `index.html`.
- Set aside, not deleted: the v4 composition before the fix round in
  `archive-v4/` (`index.html`, `lib/`, `STORYBOARD.md`) with its sound files
  in `audio/archive-v4/` (`mix.py`, `make-bed.py`, `mix-report.json`,
  `music.master.wav`, `bed-edit.wav`, `film-premix.wav`); the v3 composition in `archive-v3/` (`index.html`,
  `lib/`, `STORYBOARD.md`, `NOTES-before-v4.md`, and in `audio/` the v3
  `mix.py`, `make-bed.py`, `mix-report.json`, `music.master.wav`,
  `bed-edit.wav`, `film-premix.wav`); round 5's composition and storyboard in
  `archive/`; every earlier take, bed and mix file in `audio/archive-r6a/`,
  `audio/archive-r7a/`, `audio/archive-r7b/`, `audio/archive-r7d/`,
  `audio/archive-r7d2/`, `audio/archive-v3-replaced/`,
  `audio/archive-v2-stopped/` and `audio/archive-v3-frederick/`; v3's stopped
  Clara build in `archive-v3-stopped/`; the v3 build's first final, before the
  critic's fixes, in `archive-v3-build1/`; line 7's retake in
  `audio/takes-7d/` and line 6's unused first take in `audio/takes-v3fs/`.

## 2026-10-06, v4 flow and headings: the critic's fixes

The critic did not pass the v4 cut: three major pacing problems in lines 6
and 7 (the diagram built as a burst, the wall arrived after "docs sites" was
said, the fly-in was the film's fastest move with seven events in a second)
and seven minors. This round fixes all ten, re-renders and checks each fix on
the new render. The film is now 53.5 s: 49.5 s of story and the end card at
49.5. No take was made or changed and no music was generated.

Before changing anything I archived the v4 composition (`index.html`, `lib/`,
`STORYBOARD.md`) to `archive-v4/` and its sound files (`mix.py`,
`make-bed.py`, `mix-report.json`, `music.master.wav`, `bed-edit.wav`,
`film-premix.wav`) to `audio/archive-v4/`, and copied the v4 final (md5
ca97807253797ab2a6aefc92516ba309), its poster and its contact sheet to
`out/v11/`.

### What changed, finding by finding

- **Major, the fly-in (was 29.33 to 30.33).** It is now 2.0 s (30.73 to
  32.73) on the trapezoid ease (`F.ease.trap`: speed up over the first 30
  percent on a cosine ramp, hold, down over the last 30 percent; top speed 1.43
  times the mean, power2.inOut's is 2). It starts in the pause before line 7,
  after heading 3 has left (30.28 to 30.73). The wall's pages move outward with
  the camera and their tone follows the camera's scale s (full below s 1.5,
  none above s 3.5), so they cross the frame edges while General
  Translation's page grows; when they have gone the page is 840 px wide. While
  the camera moves their lines sit at 0.7 and their text bars at 0.25. The
  panel's crosses glide with the camera over the whole move. Nothing else
  starts until the camera lands: on landing (32.73, "more open space") the
  furniture tones out over 0.4 s while the writing's hairlines draw out of the
  crosses and its rail draws down; from 33.23 the eleven lines print, each
  taking over from the page's own pieces in its row, and the white thumb runs
  down the rail with the print (0.96 s). Hold 34.19 to 35.19. In v4 the
  furniture toned out and the print started while the camera was still
  moving, and the crosses glided on a clock of their own.
- **Major, the diagram build (was nine events in 1.34 s).** The connectors
  draw one after another, each starting as the one before arrives (0.5 s
  each, power2.out): second nav 24.68, sub-tabs 25.18, tab bar 25.68, the last
  arriving on "one" (26.18). Each arrival lights its rows and lands its cross;
  its old surface dims to 35 percent and stays there through the hold, so the
  held frame shows the three old surfaces, their connectors and the one
  accordion. The three surfaces and the connectors tone out together in the
  pull back's first 0.3 s. On "one" the rail draws (0.7 s, power2.inOut) and
  the white thumb rides its head down g2 and parks at the active page: one
  gesture, where v4 had the rail and then the thumb. Gap 5 is 2.16 s (was
  1.50), so the clean page still holds 1.0 s before the push.
- **Major, the pull back into the wall (was 26.63 to 27.93).** It now starts
  on "rare" (27.88) and runs 1.8 s on the trapezoid ease. The neighbours'
  tone follows the camera's scale (full below s 1.6, none at s 7, the pull
  back's start), so they come in across the frame edges as the frame widens:
  the first is on screen by "docs" (28.42) and every page is in by the end
  of "sites" (29.08). Their text bars settle in over the camera's last 0.45
  s. The panel draws over that same last 0.45 s, and General Translation's white
  outline, now carried by the camera, draws over the last 0.4 s, so the
  outline is round the slot as the camera lands (29.68). The wall holds 29.69
  to 30.73.
- **Minor, the iso stack.** Once heading 2 has left (12.88) the camera
  re-centres the stack, plates still lifted, and scales it up (0.7 s,
  power2.inOut, k 0.541 to 0.63, centre 1340, 980 to 1000, 672: the stack spans
  x 425 to 1574, y 77 to 1025); the plates then come down and the page lands
  (13.58 to 15.18, 1.6 s). The thumb on the rail plate is 56 page units long
  (about 30 px on the plate, was 34 units and 18 px); its travel is about 48 px.
  The iso view itself stays at k 0.53 to 0.541 while heading 2 is up (the
  reason is in the v4 entry). Gap 3 is 1.90 s (was 1.00).
- **Minor, the pile waves.** They are 0.5 s apart and 0.2 s earlier relative
  to the words: 16.20 (0.16 s before "creates", rising through it), 16.70 (on
  "mental"), 17.20 (inside "clutter"). The landing moved with them to 0.24 s
  before "cluttered", so the flat page still holds 1.02 s before the first
  wave.
- **Minor, the pull-out and the planet.** The camera lands first (35.19 to
  36.19, 1.0 s, trapezoid), then the planet lights from the crown (36.19 to
  36.79) as "Translated" begins (36.29). Gap 7 is 2.24 s (was 1.50).
- **Minor, the planet's glyphs.** One glyph per 30 px cell (was 21), so the
  glyphs are about 20 to 26 px tall and the script step on "same" reads as
  scripts changing.
- **Minor, the tab bar's connector in heading 3's band.** The push camera is
  k 1.3 with the switcher at y 250 (was k 1.4 at y 110), so the first group's
  heading, and the tab bar connector's horizontal into it, sit at y 340: all
  three connectors run at y 337 or below, 85 px under the ink of "One
  accordion". The sidebar spans x 1200 to 1543 and its footer links end by y
  1065.
- **Minor, the wall's sameness.** `F.mini` lays out each neighbour from its
  own seed: 4 to 7 tabs, 3 to 6 sub-tabs, a second section nav on the left or
  the right of the content and 30 to 42 units wide, a sidebar 34 to 56 units
  wide, a header with two to four links, a card grid (2 to 4 columns, 1 or 2
  rows) or a list, and a contents rail on about 70 percent. Every page still
  carries the three old surfaces. `F.mini` also takes a mode ('lines',
  'bars', 'all'), so the wall can draw its pages' structure and their text at
  different tones.
- **Minor, the sound.** The gap lift's ramps are gentler: up over 0.5 s (was
  0.35) and down over 0.4 s (was 0.30), as the critic suggested if they pump,
  and the lift is half way (`GAP_LIFT` 0.5, was 0.7), so the gaps read about
  as loud as v4's (measured below). `HOLD_GAP` is 2.4, over the longest gap (2.25). The bed's second join now
  falls in gap 6 (29.53, 0.45 s after "sites"). I tried holding that gap's
  lift until the join's crossfade had passed: the gap then rose twice (-30,
  -23, -27, -21 LUFS in 400 ms windows), so I kept the plain lift, which is one
  rise with no step at the join (now -30 under "sites", -22 at the top, -28 by
  "The"). `make-bed.py` now writes the
  joins to `audio/bed-edit.json`, and `mix.py` reports their crossfade
  windows. No person has listened to the gaps or the joins.

### The clock

`O = [0, 1.00, 3.98, 7.72, 14.04, 18.66, 24.94, 31.33, 36.29, 40.65, 44.70]`.
The gaps between lines are 0.80, 1.30, 1.90, 1.30, 2.16, 2.25, 2.24, 1.50
and 1.31 s (v4: 0.80, 1.30, 1.00, 1.30, 1.50, 1.50, 1.50, 1.50, 1.36). The
gap before line 10 shrank, so the card stays on the first 0.5 s beat after
the last word (48.42) plus 0.6 s, at 49.50, with heading 5's floor (to 49.46)
inside it. Scene clock: rise 5.94, iso 7.40, recent 12.88, flat0 13.58, land
15.18, pile 16.20, red 18.80, push 23.68, diag 24.68, back6 27.88, wall
29.68, fly 30.73, write 32.73, out 35.19, planet 36.19, step 37.67, guides
38.49, tobox 39.89, path 40.69, back 44.70, card 49.50, end 53.50. The
headings: heading 3 26.18 to 30.73, heading 4 36.29 to 40.34, heading 5
44.70 to the card; headings 1 and 2 are unchanged.

### Measured on the final

- `npx -y hyperframes@0.8.106 check .`: "Check passed", 0 errors, 8 warnings
  (the file's length and seven clips with nested children, as in every round),
  runtime 0, layout 0 issues over 9 samples, motion 0, contrast 7 of 7.
- Renders, all `npx -y hyperframes@0.8.106 render . --quality delivery --fps 60
  --workers 3`, machine load about 140 to 240: E (the first fix state; its
  fly-in traced 20.6 grey levels a frame, which led to the scale-tied wall
  tones and the longer moves), G (the clock as delivered, 8 m 18 s, clean), H
  (the same inputs as G: six "CONTEXT_LOST_WEBGL" lines, the smoke missing from
  frame 242 on; discarded), J and K (the delivered code, 13 m 01 s and 7 m 58 s,
  no context loss in either log) and L (the delivered code with the gap lift
  lowered, 8 m 08 s, no context loss). F and I were stopped when the code
  changed under them. L matches J frame for frame (480 x 270 grey: median
  difference 0.000, largest frame mean 0.050, no pixel over 60) and K (median
  0.000, largest 0.153); J matches K the same way. G matches E over 0 to 27.87
  s (largest 0.044), before any of the later changes. L is the delivered file
  (md5 e09d28d09d89daf4055d61491ccb18e5). No render log has a Google Fonts
  line; each has one "Google", the GPU vendor string.
- ffprobe: H.264 High 1920 x 1080 at 60 fps, 3210 frames, 53.500 s; AAC-LC 48
  kHz stereo, 53.500 s. Top-level atoms ftyp, moov, free, mdat (faststart as
  rendered; copied to `out/` byte for byte).
- `ffmpeg -af ebur128=peak=true`: -16.1 LUFS integrated, LRA 4.8 LU, true
  peak -2.5 dBTP. `film-premix.wav` reads -16.1 LUFS and -2.5 dBTP.
- `mix-report.json`: narrator -15.0 LUFS (`VO_TARGET_MONO` -17.9, up 0.3 dB
  for the longer film), masters true peak -3.5 to -4.5 dBTP; the bed under
  speech -29.1 LUFS; the largest 400 ms loudness in each gap -26.5 (gap 1, held
  down), then -22.4, -23.6, -24.8, -23.5, -21.6, -22.6, -23.3 and -26.1 (v4:
  -23.2 to -26.8; with `GAP_LIFT` at v4's 0.7 they read -19.9 to -23.9,
  because the earlier bed start made the alone gain 4.2 dB higher); the open
  -19.9 and the card's first second -19.8; voice over bed 300 to 500 Hz +4.3
  dB, 500 to 700 Hz +3.2, 1 to 4 kHz +11.1.
- `make-bed.py --report`: two jumps of 18.007 s; film 0 is source 10.863; the
  joins at film 11.510 (inside line 3, under "read its writing") and 29.532
  (gap 6, 0.45 s after "sites"), pin -15.9 ms, pad correlation 0.308; the
  resolution at 49.532, on the card's cut.
- `el.mjs hear` on the delivered file: 99 words for SCRIPT-v3's 99, in order,
  one of them heard as "doc" ("among doc sites" at 28.44); "Most" 1.00,
  "Humans" 3.98, "General" 7.74, "Interfaces" 14.04, "redesign" 18.80,
  "sidebar" 25.12, "one" 26.22, "writing" 31.46, "Translated" 36.30, "Each"
  40.66, "action" 42.56, "Docs" 44.72, "team" 47.20; audio tags "[gentle
  music]" at 0.10 and 48.68.
- Frame-difference trace of the final (480 x 270 grey, median 0.22 a frame):
  one step, the card's cut at 49.500 (75.4). The fastest continuous moves are
  the fly-in 9.8 at 31.42 (v4: 12.5), the pull back 8.6 at 28.92 (v4: 7.2),
  the re-centre 6.2 at 13.27, the pull-out 4.9, the push 4.7, the flatten 4.1,
  the shrink back 3.9 and the move into the page box 3.8. No frame outside the
  card's cut is over 10.
- Heading clearance (the lab's `clear.mjs` on the delivered code: field and
  moving type hidden, the nearest drawn pixel to each visible line's ink box),
  every 0.1 s while a heading is up, 225 samples: none under 28 px. Minimums:
  heading 2 32 px (the iso stack at 11.55), heading 3 35 px (the panel's
  top-left cross at 29.28), heading 4 53 px (the page over the planet at
  36.39), heading 5 33 px (the shrinking page at 45.70); heading 1 nothing
  within 60 px.
- Measured in the frames: the tab bar's connector runs at y 337 to 345 (v4:
  211), 85 px under the ink of "One accordion"; the re-centred stack spans x
  425 to 1574, y 77 to 1025 at 13.58; the iso thumb is about 30 px long on the
  plate; the planet's glyphs are about 20 to 26 px tall at 38.0.
- Event starts in the rebuilt stretch, each at least 0.5 s from the next: the
  push 23.68, the old surfaces 24.18, the connectors 24.68, 25.18 and 25.68,
  the rail and heading 3 on "one" 26.18, the pull back 27.88, the panel and
  outline 29.23, the fly-in 30.73, the landing 32.73, the print 33.23, the
  pull-out 35.19, the planet 36.19.
- Frames read: one a second of render G over the whole film (identical to the
  final outside 27.9 to 35.4, where only the wall's pull back tone and the
  encoder's drift to the next keyframe differ, under 0.6 grey levels after
  29.75); the delivered pull back at 28.0, 28.2, 28.42, 28.6, 28.75 and 29.08;
  render G at 13.58, 16.45, 17.4, 27.0, 28.42, 28.75, 30.2, 31.5, 31.9, 32.5,
  33.0, 34.5, 35.9, 36.5, 38.2 and 39.4; lab frames every 0.1 s from 23.6 to
  36.6 (the first fix state) and from 27.9 to 33.8 (the delivered clock);
  full-size crops of the iso rail and thumb (10.75, 11.25, 11.70), the accordion's rail and thumb (27.0), the planet (38.0) and
  the connectors (27.0, the final); the contact sheet.

### Deviations from the critic's fixes, and why

- **The writing's frame draws on landing, before the print** (the critic: the
  print first, then the hairlines and the rail). The thumb runs on the rail
  with the print as one reading gesture, so the rail has to be there first;
  drawing the frame with the furniture's tone-out keeps the landing one event
  and saves 0.44 s of pause.
- **The accordion's rail and thumb are one gesture** (v4 and the design: the
  rail, then the thumb). That moved the hold earlier, so the pull back starts
  on "rare" and the wall forms during "among docs sites".
- **The fly-in's neighbours tone out by s 3.5** (the critic: full tone, toning
  only in the last third). At full tone to the last third the trace in the lab
  was 15.9 grey levels a frame (render E, before the bars dimmed: 20.6), far
  over v4's 12.5. Toned by scale between s 1.5 and 3.5 they are in frame
  through the first half of the move and the page is 840 px wide when they
  have gone.
- **The pull back's trace rose** from v4's 7.2 to 8.6 grey levels a frame,
  because the wall's pages are now on screen while the camera moves, which is
  the fix.
- **The gaps are 1.90 to 2.25 s in four places** (the brief: 0.5 to 1.5 s;
  the critic: about 2.0). The steps of each bridge now run one after another,
  and these are the shortest gaps in which they do.

### Open items

- Kevin's ear on the gaps (the lifts, now 0.5 s up and 0.4 s down) and on
  the two joins: 11.510 inside line 3 ("read its writing") and 29.532 in gap 6
  under the lift.
- `el.mjs hear` heard "docs sites" as "doc sites" (28.44) twice, on render G
  and on the final. The take is the v3 take as recorded; its own transcript
  and both of v4's hears read "docs". Kevin's ear on that word.
- The iso view stays at k 0.53 to 0.541 while heading 2 is up; the re-centre
  shows the stack at 0.63 only after the heading has left.
- Render H lost WebGL in all workers under load (the smoke missing from
  frame 242 on), as render A did in v4. Every render's log needs the
  "CONTEXT_LOST" check and a second render to compare against.
- The 8 check warnings are structural advice, as in every round.

## 2026-10-06, v4 flow and headings

Kevin on the v3 cut: "there are way too many headers in the blog videos and
they dont actually line up with whats being said as well and theres too many
visuals that are rapidly playing, which is not good, we can just increase the
length if u need", on top of "you should be fine with redoing visuals so that
transition flows and headers are a lot better for the blog videos". The v4 cut
implements `DESIGN-v4.md` on the v3 composition and the v3 takes as recorded.
No take was made or changed and no music was generated.

### What changed

- **Headings.** Ten leftover post phrases at ten sizes became five headings
  made of the narrator's own words, each word entering on its own word start
  (0.30 s, 12 px rise, power2.out): "Humans still read docs" (line 2, "Humans"
  in `#86a8ff`, the film's one accent), "General Translation / redesigned its
  docs" (line 3), "One accordion" (line 6), "Translated pages" (line 8), "Docs
  design is / an open problem" (line 10). One size (144 px), one grid (ink from
  x 160, baselines y 252 and 402), one exit (0.45 s, 8 px up, power2.inOut) in a
  pause or the sentence's own tail. Every heading holds its reading floor. The
  moving type runs once, heading 1 into heading 2's first line (7.55 to 8.35),
  the accent cells mixing to white.
- **The clock.** The gaps between lines are 0.80, 1.30, 1.00, 1.30, 1.50,
  1.50, 1.50, 1.50 and 1.36 s (v3: 0.25 to 0.53), with 1.00 s of lead before
  line 1: `O = [0, 1.00, 3.98, 7.72, 13.14, 17.76, 23.38, 29.02, 33.24, 37.60,
  41.70]`. The card is at 46.50, the first 0.5 s beat after the last word
  (45.42) plus 0.6 s; the film is 50.5 s (v3: 41.5).
- **Transitions.** The four hard cuts of v3 are gone; the only cut is to the end
  card. One page carries the eye: it lifts into the iso map from the rect it
  sits in, lands in the page box, is buried and cleaned in place, and then one
  flat camera pushes into its own sidebar (the diagram's accordion), pulls back
  into a 6 by 4 wall of docs pages, flies into General Translation's page and
  its writing, pulls out to the page over the planet, moves into the page box
  for the path and shrinks back to its first rect among the readers. Every move
  is a zoom about its two cameras' fixed point on power2.inOut. Below about 0.4
  px a page unit the page hands over by tone to its miniature (`F.mini`). The
  wall's panel crosses glide to the writing view's crosses on the fly-in.
- **Pacing.** Every set piece completes and holds at least 1.0 s before the
  next starts; never more than two picture events start in any second. The pile
  lands in three waves 0.5 s apart (was 168 pieces in 1.6 s), the twelve late
  pieces with the spill; the redline is one 1.0 s top-to-bottom sweep (was
  inside 0.1 s); each kind's boxes turn `#86a8ff` on its word before it sweeps
  out (this replaces v3's heading 5 runs).
- **Scale.** The opening and closing page is x 160 to 1056 (k 0.694); the
  reader icons are 44 px on 52 px plates at a 70 by 80 pitch with 20 px stubs,
  the pulses 3 by 60 px at 450 px a second; the GT mark is 44 page units; the
  contents rail has six rows on a 146-unit rule; the iso rims and drop lines are
  2 px; the diagram's old surfaces are 2 px outlines with 96 by 40 tabs and the
  connectors the doubled 9/3 on 19 px casings with 2 px white crosses; the wall
  is 6 by 4 at 240 by 150; the writing's rail and thumb are 9/3; the page over
  the planet is k 0.56 (724 px) with 2 px white guides running 60 px past it and
  held 1.0 s; the reader's path is 9/3 with 16 px seats and a 160 px pulse.
- **Code.** `index.html` rewritten on v3's drawing: one stage clip, `camF` and
  `CAMS`, `VPage` with two grounds (sidebar and main) and a rail that draws and
  carries its thumb, `litStyle` and `mutedStyle`, the wall (`drawWall`, the
  panel in screen space), the writing in page coordinates (`LINE7P`), the
  diagram's surfaces and connectors (`DG`, `CONN`), and the new reader grid
  (`RG`, one pulse train per thread). `lib/film.js`: the 44-unit mark, the
  six-row rail, `cross2` and `mini`. `audio/make-bed.py`: a jump count (the
  smallest that starts the film past the generation's swell). `audio/mix.py`:
  the gap lift (`GAP_MIN` 0.9, `HOLD_GAP` 1.6, `GAP_LIFT` 0.7, up 0.35 s from
  0.10 s after the last word, down 0.30 s), and `VO_TARGET_MONO` -18.2 (was
  -18.8) so the longer film still reads -16 LUFS.

### Measured on the final

- `npx -y hyperframes@0.8.106 check .`: "Check passed", 0 errors, 8 warnings
  (the file's length and seven clips with nested children, structural advice as
  in every round), runtime 0, layout 0 issues over 9 samples, motion 0,
  contrast 7 of 7.
- Render: `npx -y hyperframes@0.8.106 render . --quality delivery --fps 60
  --workers 3`, 5 m 16 s (capture 2 m 08 s on the hardware GPU, machine load
  about 125 to 155). The log has no Google Fonts line; its one "Google" is the
  GPU vendor string.
- Four renders were made. The first (A) lost its WebGL contexts in all three
  workers at once ("CONTEXT_LOST_WEBGL" six times, a GPU reset under load): from
  frames 225, 1240 and 2245 the smoke is missing, frames 2246 to 2249 are white
  and the whole end card is white. It was discarded. The second (B) was clean;
  after it the wall's rise and leave were retimed (below), and the final was
  rendered twice (C and D). C and D are byte-identical (md5
  ca97807253797ab2a6aefc92516ba309, no context loss in either log), and C
  matches B frame for frame (median difference 0.000) outside the retimed wall
  frames (1626 to 1700 and 1764 to 1800). C is the delivered file.
- ffprobe: H.264 High 1920 x 1080 at 60 fps, 3030 frames, 50.500 s; AAC-LC 48
  kHz stereo, 50.500 s. Top-level atoms ftyp, moov, free, mdat (faststart as
  rendered; copied to `out/` byte for byte).
- `ffmpeg -af ebur128=peak=true`: -16.1 LUFS integrated, LRA 3.4 LU, true peak
  -2.5 dBTP. `film-premix.wav` reads -16.0 LUFS and -2.5 dBTP.
- `mix-report.json`: narrator -15.3 LUFS, masters true peak -3.5 to -4.8 dBTP;
  the bed under speech -29.0 LUFS; the largest 400 ms loudness in each gap
  -27.2 (gap 1, held down), then -23.2, -25.4, -24.7, -24.6, -24.3, -23.4,
  -23.3 and -26.8; the open -20.0 and the card's first second -19.8; voice over
  bed 300 to 500 Hz +3.5 dB, 500 to 700 Hz +3.0, 1 to 4 kHz +10.5.
- `make-bed.py --report`: two jumps of 18.007 s; film 0 is source 13.863; the
  joins at film 8.510 (inside "Translation") and 26.532 (between "rare" and
  "among"), each source 22.373 to 4.3504, pin -15.9 ms, pad correlation 0.308
  (the same source segments as v3's one join); the resolution at film 46.532.
- `el.mjs hear` on the render: 99 words for SCRIPT-v3's 99, in order; "Most"
  1.00, "Humans" 4.00, "General" 7.74, "Interfaces" 13.14, "redesign" 17.90,
  "sidebar" 23.56, "one" 24.66, "Translated" 33.26, "Each" 37.62, "action"
  39.50, "Docs" 41.72, "team" 44.20; its one audio tag is "[outro jingle]" at
  50.12.
- Heading clearance (the lab's `clear.mjs`: field and moving type hidden, the
  nearest drawn pixel to each visible line's ink box), every 0.1 s while a
  heading is up, 224 samples: none under 28 px. Minimums: heading 2 32 px (the
  iso stack at 12.15), heading 3 35 px (the panel's top-left cross at 27.42),
  heading 4 41 px (the page over the planet at 33.34), heading 5 33 px (the
  shrinking page at 42.70); heading 1 nothing within 60 px.
- Frame-difference trace of the final (480 x 270 grey, median 0.19 a frame):
  one step, the card's cut at 46.500 (74.8). The fastest continuous moves are
  the fly-in (12.5 at 29.52), the pull back into the wall (7.2 at 27.82; it was
  16.7 in render B, see below) and the writing's print (6.6 at 30.05).
- The field's lit share of open ground (lab, `lit.mjs`; it counts the cells
  under the page box as open where the page covers them): opening 17 to 18
  percent, iso 22 to 25, pile and deletion 9 to 12, diagram 14 to 15, wall 16.5,
  writing 25 to 26, planet 7 to 12, path 10 to 11, closing 8 to 15.
- Frames read on the final (frame numbers at 60 fps): every heading word's
  entrance, each floor end and each exit (239, 248, 274, 289, 313, 453, 477, 501,
  535, 586, 746, 773, 1477, 1505, 1713, 1740, 2015, 2047, 2210, 2234, 2502, 2529,
  2556, 2608, 2788); the start, middle and end of every bridge (0, 24, 356, 400,
  444, 746, 816, 870, 1367, 1397, 1427, 1598, 1638, 1676, 1760, 1790, 1820,
  1958, 1986, 2015, 2210, 2234, 2258, 2502, 2529, 2556, 2788, 2790); the holds
  (930, 1014, 1074, 1144, 1307); one frame every second of the whole film (0 to
  50, from render B, identical to the final outside the wall's retimed frames,
  which were read on the final); full-size crops of the iso rail and its rows
  (666), the diagram's accordion, rail and crosses (1500), the guides (2154) and
  the path's action and seats (2400).

### Deviations from DESIGN-v4, and why

- **The iso scale is k 0.53 drifting to 0.541** (the design: about 0.56 to
  0.58). With the extras at +450 and the rail plate inside the frame and the
  whole stack 28 px clear of heading 2's two lines, 0.54 is the largest scale
  that fits (a search over the placement, `scratchpad/v4b/iso.py`: no placement
  fits at 0.56). The stack sits low at the right (centre 1342, 972 to 1340,
  980), the content plate running off the foot. The thumb's travel is about 54
  px on screen (the design: about 67).
- **The tab bar's connector rises to y 211** (the design: no connector above y
  340). The push camera puts g1's heading at y 211; the connectors' vertical runs
  at x 1104, 1136 and 1168 stay 71 px or more right of heading 3's ink.
- **The push** frames the sidebar at x 1200 to 1570 with the switcher at y 110
  and the footer links ending at y 988 (k 1.4); the content column, header and
  contents rail, with the main ground, tone out over the push's last 0.5 s as
  well as leaving across the edges, because at k 1.4 the content column's left
  300 px stay in frame.
- **The wall's pages rise from 27.35 to 28.0** (the design: 26.9 to 27.7) and
  leave on the fly-in from 29.33 to 29.83 (spread 0.2 s, 0.3 s each). Risen from
  26.9 they rushed in at three times their size; the pull back's trace was 16.7
  grey levels a frame, the film's fastest move, and is now 7.2. While heading 3
  is up, a page whose rect is inside the heading's keep-out waits at tone 0 and
  rises over its next 24 px of travel (the top row's left pages come in as the
  camera lands).
- **The panel stays in screen space** (it does not travel with the camera), and
  on the fly-in three of its crosses glide to the writing view's corners (29.43
  to 30.08), where the writing's hairlines draw out of them from 30.08 and its
  rail from 30.15 (the design: "the crosses stay").
- **The writing's lowest line ends at y 882** (the design: by 880).
- **The bed's second join is at 26.532** (the design: 26.517): the -15.9 ms pin
  adds up over the two returns.
- **The narrator is 0.6 dB up** (`VO_TARGET_MONO` -18.2): with the longer gaps
  the v3 level read -16.5 LUFS integrated. The gap lift reaches -23.2 to -26.8
  LUFS in a 400 ms window (the design: about -24).
- **The agent pulses** are one train per thread, each pulse going to the row's
  next agent, a second train from "agents" (the design: one, then two per
  thread).

### Open items

- Kevin's ear on the new gaps: the bed's lift in each pause (0.35 s up, 0.30 s
  down) has not been listened to by a person for pumping.
- The iso scale (0.53 to 0.541) is below the design's 0.56; a larger stack
  needs a lower lift for the extras or a smaller heading 2.
- The fly-in's middle (29.7 to 29.9) shows the lit page alone in the centre as
  its neighbours leave the frame.
- The lit share is under 12 percent in the planet shot and the closing frame,
  where the calms round the page and the node block take the smoke, as in v3.
- Render A's GPU reset is a hazard of rendering under heavy load: check every
  render's log for "CONTEXT_LOST" and compare it with a second render.
- The 8 check warnings are structural advice.

## 2026-10-06, v3 build: the critic's fixes

The critic failed the v3 build's first final (now in `archive-v3-build1/`) on
two majors, both of them spectacle-map pieces that were on screen but too weak
to read: the thumb on the iso contents-rail plate and E5's alignment guides. It
also listed seven minors. Every finding was answered. One of them (line 9's
"Each page") is recorded in SCRIPT-v3's audit and left without a retake, with
the reason below. No take was made or changed and no music was generated: the
ten masters and `bed-edit.wav` are byte-identical to the first final's, and
`mix.py` was rerun only because lines 9 and 10 moved.

### What changed, finding by finding

- **The thumb on the iso rail plate (major).** It was an 18 page-unit dash on
  the rail's rule that moved 24 units (the critic read about 6 by 3 px moving
  4 px on screen).
  The thumb is now a 34-unit run, 3 px wide and about 15 px long on screen. It
  runs the rule's whole length (y 104 to 182 on the page, past all three of the
  rail's rows), still from "people" (8.90) to "read" (9.40), power2.inOut, and
  it tones in over 0.12 s. The row it passes prints white by tone as it goes
  (full white within 3.5 frame px of the thumb's centre, none past 17.5), so
  the longest row (138 units, about 59 px on screen) is white at 9.2 and the
  last row stays white until the flatten takes the thumb and the row back to
  `#2f5ce0` (u 0.62 to 0.74). The travel is about 19 px on screen. The critic
  asked for 60 px. That is not possible on this plate: the rail plate is 136
  page units deep, which is about 59 px on screen at the iso view's scale (0.48
  of frame px along either page axis), and its rule is 78 units (34 px). The
  sidebar plate, the critic's alternative, has no rail on the old page; the
  accordion's rail first draws in line 6 on "one", so a rail in line 3 would
  spend that beat early. The rows printing white give the move its read.
  Measured on the final: SEE BELOW.
- **E5's guides (major).** They drew from "alignment" at 0.35 s each, 50 ms
  apart, in 1 px `#86a8ff`, and were complete for only about 9 frames before
  the cut at 29.43. They now start on "and" (28.77), take 0.3 s each, 25 ms
  apart (power3.out), and are white 1 px dashes, so they read over the page's
  `#86a8ff` text and are complete by 29.12, 0.31 s (19 frames) before the cut.
  The cut, the heading chain and the card are where they were.
- **The top connector against heading 5 (minor).** The connectors now start
  bottom first (the second section nav at 19.60, the sub-tabs at 19.73, the
  tab bar at 19.86), so the top one reaches heading height after heading 5's
  wide cells have moved on, and it still arrives on "one" (20.46). The v3
  section's clearance line is corrected. Measured on the page every frame from
  19.60 to 20.60 (field and the other layers hidden, heading white against
  connector `#86a8ff`): no connector pixel within 100 px of a heading pixel.
  The same tool on the first final's composition reads 38, 15, 15, 1, 12, 42
  and 84 px at 19.733 to 19.933.
- **The field round three objects (minor).** Three envelopes, each changing
  by tone where there is no cut:
  - The small page above the planet (line 8): zero within 28 px of its frame
    (its guides run 24 px past it), back to full 100 px away, from the cut. A
    heading's 230 px was tried first; it took two thirds of the shot's smoke,
    which sits in a band beside the page, and emptied the sky.
  - The readers' node block (x 1550 to 1752, y 496 to 960), lines 1, 2 and 10:
    zero within 8 px, back to full 70 px away, while the readers are up: from
    frame 0, out by tone with the readers on "product" (4.89 to 5.19), and in
    by tone with their return (33.39 to 34.14). The closing frame's nodes now
    sit on clear ground as the opening's do, with the smoke round them.
  - The page box in line 6: it clears by tone from 21.25 to 21.55, just ahead
    of the clean page's cells (which rise from 21.50), so no smoke shows
    through the page while it tones in round the accordion. Once the page is
    opaque (21.95) the smoke comes back behind it by 22.17, so the shrink on
    "rare" still uncovers smoke for the panel to close over cell by cell.
  - The cost, measured as lit field cells in the whole frame (lab, the same
    times on both compositions): the planet shot 5.6 to 6.1 percent before,
    2.4 to 3.4 after; the closing frame 8.4 to 11.7 before, 4.5 to 7.6 after;
    line 6's move 6.4 to 8.7 before, 4.0 to 5.4 after; the opening 12.6 before,
    12.5 after. The smoke that went was the smoke against the objects.
- **The redline (minor).** The boxes are now 2 px white, 4 to 6 px outside each
  piece (were 1 px, 3 px outside), with square caps, so they sit apart from
  the pieces' own 1 px outlines and read as a layer drawn over the pile.
  SCRIPT-v3 says 1 px.
- **The AI-design pile on General Translation's page (minor, facts).** Only
  the lines, links and buttons now land on the page, which is what the post
  claims for General Translation ("in our case, a lot of extra lines, links,
  and buttons") and what SCRIPT-v3's audit says the picture presents. The 30
  pieces of kind other that sat on the page (the two eyebrow pills, the
  callout and its three lines, the eight badges and eight outline icons, the
  floating widget and its line, the footer banner, the two toast cards and
  their line by the rail, the two ghost titles) are moved whole, group by
  group, into the spill zones: the left margin (right edge at page x -8 or
  less) and above the page (bottom at page y -8 or less, x 650 or more, clear
  of the headings). They join the spill's schedule (from 12.82), carry the
  spill's opaque navy card and leave with the band on "deleting". The toast
  stays over the action but now hangs over the page's top edge from outside
  (page y -34 to 58, frame 426 to 510), so it reads as laid over the page.
  Nothing is removed: 168 pieces as before. Lab check: every moved piece ends
  off the page box (x + w at most 556 or y + h at most 451), and the nearest
  drawn pixel to a heading line's ground in lines 4 and 5 is the page box's
  top hairline (24 px under heading 4's ground, 37 px under heading 5's) once the box's top-left cross is set aside; no moved piece or redline box comes nearer.
  `lib/film.js` `clutter()` holds the moves (`g` and `SPOT`).
- **"Each page" (minor, facts): not retaken.** The post says the funnelling of
  one page (A4, the Introduction page). The docs-wide part rests on its "The
  docs highlight links to actions users might want to take", so the line
  generalises without contradicting the post. A retake would move every cue
  from 29.83 on for no picture gain; the critic called it not worth a retake on
  its own. SCRIPT-v3's audit now records it, with the retake text should line
  9 ever be redone ("The page guides its reader toward the action they want.").
- **The cadence (minor, sound).** The gaps before lines 9 and 10 are now 0.40 s
  (were 0.25), so the second half is 0.25, 0.25, 0.40, 0.40 s against the
  first half's 0.45 to 0.53. The 0.30 s comes from the closing hold (36.39 to
  37.5 before, 36.69 to 37.5 now), which the critic's plan did not count. The
  gaps before lines 7 and 8 stay at 0.25 s: the cut to the planet follows line
  7 and the cut to the path page is line 8's last word, heading 8 rises on the
  first cut and heading 9 on the second, and heading 10's floor (3.67 s) must
  end by the card, so moving either line moves the card. Taking headings 6 and
  8 to their floors (the critic's plan) would only help if headings rose before
  those cuts; they were left on the cuts. Heading 10 now arrives 0.28 s before
  "open" (34.11) instead of on it. `mix.py` placed the same masters on the new
  `O`; the bed holds down from the first word to the last as before (every gap
  under `GAP_MIN`).

### The clock (lines 9 and 10 moved; everything before 29.43 is unchanged)

`O = [0, 0.30, 2.93, 5.82, 10.74, 14.59, 19.21, 23.60, 26.57, 29.83, 32.97]`,
`B.back` 32.97. Key words now: "Each" 29.83, "action" 31.73 (the path reaches
Get a Demo), the pulse 31.98 to 32.93, "Docs" 32.97 (the shrink), the readers'
return 33.54 to 34.14, the path's continuation from 34.14, "team" 35.45, the
last word ending 36.69, the card 37.5. `WD.and8` (28.77) is new, for the guides.
Gaps: 0.45, 0.45, 0.50, 0.53, 0.50, 0.25, 0.25, 0.40, 0.40 s.

### Measured on the new final

- `npx -y hyperframes@0.8.106 check .`: "Check passed", 0 errors, the same 22
  structural warnings, runtime 0, layout 0 issues over 9 samples, motion 0,
  contrast 11 of 11.
- Render: `npx -y hyperframes@0.8.106 render . --quality delivery --fps 60
  --workers 3`, 6 m 57 s, screenshot capture on the hardware GPU (load about
  280 to 300). The log has no Google Fonts line; its one "Google" is the GPU vendor
  string.
- ffprobe: H.264 High 1920 x 1080 at 60 fps, 2490 frames, 41.500 s; AAC-LC
  48 kHz stereo, 41.500 s. Top-level atoms ftyp, moov, free, mdat (faststart
  as rendered; copied to `out/` byte for byte, md5 60658809c0d09d461a98cd212f3f99e4).
- `ffmpeg -af ebur128=peak=true`: -15.9 LUFS integrated, LRA 2.4 LU, true peak
  -3.0 dBTP. The delivered audio matches `film-premix.wav` at lag 0 and -0.05
  dB.
- `mix-report.json`: narrator -15.8 LUFS, masters true peak -3.5 to -5.4 dBTP;
  the bed under speech -29.0 LUFS (was -29.1); in the gaps -27.4 to -32.3, the
  two widened gaps -30.2 (before line 9) and -29.7 (before line 10); voice over
  bed 300 to 500 Hz +3.7 dB, 500 to 700 Hz +2.7, 1 to 4 kHz +11.0; premix -15.9
  LUFS, true peak -3.0 dBTP. `make-bed.py` output is byte-identical (join at
  17.516, resolution at 37.516).
- On the placed masters the longest silence under -50 dBFS is line 6's own
  comma, 0.53 s at 21.23; between lines it is 0.44 s (14.12), and the two
  widened gaps read 0.32 s and under 0.30 s (the takes' own lead and tail).
- `el.mjs hear` on the final: 99 words for SCRIPT-v3's 99, in order, no
  difference; "Each" 29.84, "action" 31.74, "Docs" 32.98, "open" 34.14,
  "team" 35.46, "and" (line 8) 28.78, "alignment" 28.90; its one audio tag is
  "[outro jingle]" from 36.72.
- Frame-difference trace (480 x 270 grey, median 0.22): steps only at the cuts,
  19.583 (6.6), 23.817 (6.4), 26.433 (13.0), 29.433 (12.0) and 37.500 (74.8,
  the card). The fastest continuous moves are the growth out of the wall (6.5
  at 23.73, unchanged), the shrink on "Docs" (4.7 at 33.22) and the accordion's
  move into the page (3.8 at 21.55); the new tone mixes (4.8 to 5.3, 21.1 to
  22.3, 33.3 to 34.3) show no step.
- The guides on the final: white pixels in x 1180 to 1800, y 140 to 240 rise
  from 28.80 and hold flat from 29.067 to 29.400 (21 frames complete), and the
  cut at 29.433 takes them.
- Poster: frame 2489 decoded from the MP4, identical to the first final's
  poster (the card did not change). Contact sheet: frames 0, 60, ... 2460, six
  columns, 480 px tiles.
- Frames read on the final: every line's start plus 0.5 s (0.80, 3.43, 6.35,
  11.40, 15.09, 19.71, 24.10, 27.07, 30.33, 33.47), both sides of every cut
  (12.117/12.133, 19.567/19.583, 23.800/23.817, 26.417/26.433,
  29.417/29.433, 37.483/37.500), and 0.0, 0.6, 2.3, 3.3, 4.6, 5.1, 7.5, 8.3,
  9.2, 9.95, 10.9, 12.6, 13.3, 13.85, 14.5, 14.95, 15.5, 16.2, 16.6, 17.0,
  17.4, 17.6, 17.8, 18.0, 18.4, 18.6, 20.0, 20.47, 20.7, 21.2, 21.65, 22.0,
  22.45, 22.8, 23.3, 23.6, 25.0, 26.2, 26.9, 28.4, 28.9, 29.12, 31.0, 31.8,
  32.5, 34.0, 34.5, 35.0, 35.7, 37.4, 38.5, 39.0, 41.483, with full-size crops
  of the iso thumb (8.917, 9.15, 9.40), the guides (28.9, 29.12, 29.417), the
  pile and the toast (13.85), the redline (14.95), the connectors (19.8,
  19.867, 19.95), the action, the pulse, the human stubs, the lit page and the
  writing's thumb (31.8, 32.5, 35.7, 23.3, 26.2), and the closing frame (37.4).

### Deviations from SCRIPT-v3 added by this round, and why

- The iso thumb runs to the rail's third row and its rows print white
  (SCRIPT-v3: to its second row): the run had to be long enough to read.
- The guides start on "and" (28.77), 0.3 s each, in white (SCRIPT-v3: on
  "alignment", 0.4 s, `#86a8ff`): so they are complete 0.3 s before the cut
  that line 8's last word fixes.
- The connectors draw bottom first: so the top one clears heading 5's cells.
- The redline is 2 px, 4 to 6 px outside each piece (SCRIPT-v3: 1 px): so it
  reads as a layer over the pieces' outlines.
- The pieces of kind other land in the spill, and the toast hangs over the
  page's top edge (SCRIPT-v3: the whole pile lands on the flat page): so the
  picture claims for General Translation only what the post claims.
- Gaps of 0.40 s before lines 9 and 10 (inside SCRIPT-v3's 0.25 to 0.40),
  heading 10 arriving 0.28 s before "open" instead of on it.
- Two calms that SCRIPT-v3 does not list, round the small page above the planet
  (back to full 100 px away, not a heading's 230) and round the node block.

### The spectacle map, checked on the new final

Every piece of SCRIPT-v3's spectacle map, with the time it plays and the frame
it was read on (this final).

- [x] The dithered gem smoke field, one clock, opening at three quarters of its tone, shaped by envelopes: 0.0 to 37.5 (every frame read; the new calms at 2.6, 21.65, 28.9, 37.4).
- [x] The heading motion (26 px rise, 18 px drop): every non-moving-type change (4.03, 7.50, 11.63, 23.35, 26.15, 29.23, 33.03).
- [x] The seven round 7d headings on lines 2, 3, 4, 5, 6, 9 and 10 (4.6, 8.3, 12.6, 16.6, 20.47, 30.33, 34.0).
- [x] The page model with the GT mark: lines 1 to 10.
- [x] The isometric camera from "product" (4.89) to the landing on "cluttered" (12.12): 5.1, 6.35, 9.95, 10.9, 11.4.
- [x] The plates (rail +110, sidebar +210, header +330), slabs, dithered faces, rims, drop lines, drift: 6.35 to 10.14 (7.5, 9.2).
- [x] The flatten, plates down in order, rims back to `#2f5ce0`, the pixel-exact landing and the crosses: 10.14 to 12.12 (12.117 against 12.133).
- [x] The full round 7 clutter pile, seeded and speeding up, its lines, links and buttons on the page and its other pieces in the spill: 12.12 to 13.72 (12.6, 13.3, 13.85).
- [x] The toast over the action, hanging over the page's top edge: 12.58 (12.6, 13.85 crop).
- [x] The spill past the page as opaque cards: from 12.82 (13.3, 13.85).
- [x] The twelve late spill pieces: 13.84 to 14.70, before "redesign" (14.5).
- [x] The field's heading calm changing by tone around the moving type: 15.0 to 15.7 (15.09, 15.5).
- [x] The moving type twice: 15.10 and 19.57 (15.5, 20.0).
- [x] The deletion band uncovering the action, the spill leaving the smoke: "deleting" 15.89 (16.2, 16.6).
- [x] The accordion diagram by the hard cut inside "sidebar": 19.58 (19.583).
- [x] Three connectors on navy casings, rows rising, white crosses, bottom first: 19.60 to 20.46 (19.71, 19.8, 19.867, 19.95, 20.0, 20.47).
- [x] The rail drawing and bending on 45 degree runs: "one" 20.45 (20.7).
- [x] The thumb sliding to the active page: 20.90 to 21.35 (21.2).
- [x] The docs panel's hairline frame, right edge, crosses, panel closing over the smoke: "rare" 22.19 (22.45, 22.8).
- [x] The 9 by 6 grid rising from the lower right: 22.31 to 22.86 (22.8).
- [x] The one lit page with its outline: "sites" 22.99 (23.3 crop).
- [x] The bridge's opening (growth, pages leaving, outline and hairlines back, panel opening): 23.35 to 23.81 (23.6, 23.8).
- [x] The writing printed from GEM7, eleven lines, the rule, the smoke's light along the words: from 23.81 (24.1, 25.0).
- [x] The writing's thumb arriving on "it": 26.18 (26.2 crop).
- [x] The glyph planet lighting from the crown down as the smoke leaves its disc: 26.42 (26.433, 26.9).
- [x] The script step on "same": 27.95 (28.4).
- [x] The reader's path at one constant speed with white seats: from "Each" 29.83 (30.33, 31.0).
- [x] The action mixing to white: "action" 31.73 (31.8 crop).
- [x] The pulse into the lit action: 31.98 to 32.93 (32.5 crop).
- [x] The shared end card: 37.5 to 41.5 (37.5, 38.5, 39.0, 41.483).
- [x] The old page's four B1 extras from frame 0 until line 5 deletes them (0.0, 9.95, 13.85, 17.4 to 18.6).
- [x] The reader grid: 28 nodes, seven threads, stubs (0.6, 0.8; again 34.0).
- [x] The agent pulses doubling on "agents" 2.04 (2.3), running again from 33.84 (34.5).
- [x] The agents leaving on "Humans" 2.93 (3.3, 3.43).
- [x] The humans, stubs and threads toning out on "product" 4.89 (5.1).
- [x] The iso rise from the opening page's rect (5.1).
- [x] The GT mark and name bar white from "General" 5.82 to the end (9.95, 13.85 crop, 37.4).
- [x] The extras at +450 with drop lines on "redesigned" 6.86, landing last (7.5, 9.95, 10.9).
- [x] The thumb on the iso rail plate, "people" to "read" 8.90 to 9.40, the rows printing white as it passes (8.917, 9.15, 9.40 crops).
- [x] The writing printed white on the iso content plate, "read" to "writing" (9.95), back to `#2f5ce0` as the extras land (11.4).
- [x] The pile tagged by kind, each kind leaving on its word (17.0, 17.4, 17.6, 18.0, 18.4).
- [x] The white redline boxes out of each piece's corner, 2 px and outside it: "redesign" 14.73 (14.95 crop).
- [x] Each kind deleted on its word: "lines" 16.75, "links" 17.43, "buttons" 18.21 (17.0, 17.6, 18.4).
- [x] Heading 5's runs turning white: "extra" 16.41, "lines" 16.75, "links" 17.43, "buttons" 18.21 (16.6, 17.0, 17.8, 18.6).
- [x] The banner shrinking into the star pill on "links" (17.6, 18.0).
- [x] The toggle toning out, the search field into the search icon, the header row of five controls on "buttons" (18.4, 18.6).
- [x] The second moving type at the cut to the diagram (19.583, 20.0).
- [x] Each old surface toning out as its connector arrives (20.47, 20.7).
- [x] The accordion moving into the page's sidebar slot in the comma pause, the page rising around it on clear ground: 21.35 to 21.95 (21.65, 22.0).
- [x] The path through A4's five stops from the section switcher (31.0, 31.8).
- [x] The closing mirror: the shrink on "Docs", the readers back, the path into row 1's human, the last frame of the story repeating the first (33.47, 34.0, 34.5, 35.0, 37.4).
- [x] The headings that are runs of the post or the spoken line: "Agents are the majority / of docs readers", "More open space", "The same spacing" (0.8, 24.1, 27.07).
- [x] The human stubs mixing to white on "evaluate" 4.27 and on "team" 35.45 (4.6, 35.7 crop).
- [x] The clean page shrinking into the grid slot, the other thumbnails with the old surfaces in miniature: "rare" 22.19 (22.45, 22.8).
- [x] The small clean page above the planet, its ink changing on "spacing" 28.37 and E5's three dashed guides from "and" 28.77 into "alignment" (26.9, 28.4, 28.9, 29.12, 29.417 crops).

### Open items (after the fixes)

- Kevin's ear on Frederick's reads, as before: line 6's retake and the
  respelled "dox sites", and now the cadence with 0.40 s before lines 9 and 10.
  The gaps before lines 7 and 8 stay at 0.25 s; widening them means moving the
  card to 38.0 (a 42.0 s film) or letting headings 9 and 10 rise before their
  cuts.
- The iso thumb's travel is about 18 px on screen, the most the rail plate's
  rule allows; the critic asked for 60 px. The rows printing white carry the
  move. If it still reads small, the next step is a larger plate scale in the
  iso view (`CAM.kIso`), which moves the whole stack and needs heading 2 and 3
  clearance re-measured.
- The new calms take smoke from the planet shot (2.4 to 3.4 percent of the
  frame lit, was 5.6 to 6.1) and the closing frame (4.5 to 7.6, was 8.4 to
  11.7). A critic may ask for more smoke there; the field's clock (`FIELD.g0`)
  was not re-chosen.
- The growth out of the wall is still the fastest continuous move (6.5 grey
  levels a frame).
- The page box's top-left cross still sits 18 px under the ground of headings 4
  and 6, as in round 7d.
- The 22 check warnings are structural advice, as in every earlier round.
- Line 9's "Each page" generalises the post's one page; recorded in SCRIPT-v3's
  audit, not retaken.

## 2026-10-06, v3 build (SCRIPT-v3, Frederick Surrey)

Kevin on the round 7d cut: too slow, not very interesting, the script weird;
he loves the diagrams and visuals. On the v2 scripts: "we need to convey the
gravitas better earlier ... for both the new videos keep all the visual
spectacle, i would hate to see removals. make the script not driven by quotes
but tell its own story." And: "remember, we're using Frederick Surrey". This
build records SCRIPT-v3's ten lines in Frederick Surrey's voice and rebuilds
the picture on its shot list and spectacle map, with SCRIPT-v3's recommended
answers to its open decisions. Nothing of round 7d's picture is removed.

### Where the composition came from

The stopped v3 build (Clara, parked in `archive-v3-stopped/`) had already
written SCRIPT-v3's shot list onto round 7d's composition: `index.html` and
`lib/film.js` there are round 7d's scenes plus every v2 and v3 piece (the old
page's extras, the reader grid, the redline, the deletion by kind, the
accordion into the page, the small page over the planet, the closing mirror).
That code is the starting point here; its Clara takes, masters, bed edit and
premix are not used. Every timed value was re-keyed to Frederick's takes (the
cue tables `O`, `WD`, `B` and `HT`, the clip windows, the connectors), the
flatten was re-shaped (below), and `audio/mix.py` is that build's version with
the changes listed under the mix. `audio/make-bed.py` is unchanged.

### Narration ledger (ElevenLabs; Frederick Surrey from kit/audio/voice.json)

`node kit/audio/el.mjs line audio/vo-N.mp3 "<line>" --prev "<line n-1>" --next
"<line n+1>"` from the film folder, line 1 without `--prev` and line 10 (the
last line, with its falling close) without `--next`; no `EL_VOICE_FILE`, no
`--voice`. Every take's `.json` reads voice "Frederick Surrey (British, history
and science documentary; ElevenLabs library)", voice_id j9jfwdrw7BRfcR43Qohk,
eleven_multilingual_v2, speed 1. Every take was heard with `el.mjs hear`.
Nothing was cut inside a line and nothing was slowed, sped or stretched.

| line | take | length | speech | words a second | heard | kept |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | vo-1.mp3 | 2.93 s | 2.18 s | 3.21 | word for word, "AI" as two letters; falls from 96 to 55 Hz over "AI agents" | yes |
| 2 | vo-2.mp3 | 3.25 s | 2.44 s | 3.28 | word for word | yes |
| 3 | vo-3.mp3 | 5.34 s | 4.42 s | 2.94 | word for word, "from scratch" kept | yes |
| 4 | vo-4.mp3 | 4.13 s | 3.32 s | 2.71 | word for word; 0.34 s at the comma | yes |
| 5 | vo-5.mp3 | 4.97 s | 4.12 s | 2.43 | word for word; list pauses 0.14 and 0.15 s | yes |
| 6 | takes-v3fs/vo-6a-docs-sites.mp3 | 4.18 s | 3.50 s | 3.71 | "docked sites": the two s sounds merged | no |
| 6 | vo-6.mp3 (voice text "dox sites") | 4.92 s | 4.14 s | 2.90 | word for word, "docs sites"; 0.55 s at the comma | yes |
| 7 | vo-7.mp3 | 3.48 s | 2.72 s | 3.31 | word for word | yes |
| 8 | vo-8.mp3 | 3.85 s | 2.86 s | 2.80 | word for word | yes |
| 9 | vo-9.mp3 | 3.76 s | 2.74 s | 3.65 | word for word | yes |
| 10 | vo-10.mp3 | 4.09 s | 3.72 s | 3.49 | word for word; falls to 61 Hz on "on it" | yes |

Eleven takes, 650 characters of text (586 for the ten lines and 64 for line
6's retake; the neighbouring lines go as context). Speech to text: the eleven
takes (44.9 s) and the final (41.5 s). No music was generated. Vercel and
shadcn are not spoken in this film, so their respellings were not needed.
Frederick runs faster than SCRIPT-v3's Clara estimate: 32.66 s of speech for
its 33.5 s, but lines 1 to 5 are 0.95 s shorter than planned and line 7 is
0.27 s longer.

### The clock, measured

`O = [0, 0.30, 2.93, 5.82, 10.74, 14.59, 19.21, 23.60, 26.57, 29.68, 32.67]`,
the key words from the takes' word times (STORYBOARD.md has the table), and
`B = { rise 4.89, iso 6.35, flat0 10.14, land 12.12, mt1 15.10, mt2 19.57,
s6 19.58, wall 22.19, grow 23.35, s7 23.81, s8 26.42, s9 29.43, back 32.67,
card 37.5, end 41.5 }`. The last word ends at 36.39. Gaps (last word's end
to the next first word): 0.45, 0.45, 0.50, 0.53, 0.50, 0.25, 0.25, 0.25,
0.25 s. On the placed masters the longest silence under -50 dBFS between
lines is 0.44 s (14.12 to 14.56), and the longest anywhere in the narration
is line 6's own comma pause, 0.53 s. `el.mjs hear` on the final: 99 words
for SCRIPT-v3's 99, in order, no difference; "Most" 0.32, "Humans" 2.94,
"General" 5.84, "redesigned" 6.88, "cluttered" 12.12, "redesign" 14.74,
"deleting" 15.90, "sidebar" 19.38, "one" 20.50, "accordion" 20.62, "rare"
22.20, "writing" 23.72, "Translated" 26.58, "same" 27.98, "alignment" 28.90,
"Each" 29.70, "action" 31.58, "team" 35.16; its only audio tag is "[outro
jingle]" at 36.42, the bed rising after the last word.

### Deviations from SCRIPT-v3, and why

- **Gaps of 0.45 to 0.53 s into line 6** (SCRIPT-v3: 0.30, 0.40 before lines
  5 and 6, inside 0.25 to 0.40). Headings 1 to 5 change on their reading
  floors from 0.10, so heading 5's floor ends at 19.57 whatever the takes do,
  and Frederick's first five lines are 0.95 s shorter than the estimate. At
  SCRIPT-v3's gaps "sidebar" fell at 18.62, so the diagram's connectors could
  not arrive on "one" and "extra" fell before heading 5 had assembled. The
  gaps carry the difference instead (the task's rule: place the takes by their
  own times and let gaps and holds absorb it), all under the 0.6 s dead-air
  limit.
- **Gaps of 0.25 s from line 6 on** (SCRIPT-v3's shortest). Line 6's kept take
  is 4.14 s with its comma pause and line 7 is 0.27 s longer than planned, and
  from the second moving type the heading chain needs every change at or near
  its floor for heading 10's floor to end on the card at 37.5. The cut to the
  path page sits on line 8's last word (29.43) and the cut to the planet in the
  0.25 s gap after line 7 (26.42), so heading 10 rises at 33.23 and arrives on
  "open" (33.83), and its floor ends at 37.50.
- **SCRIPT-v3's heading table gave heading 10's floor as ending at 37.26.**
  "Documentation is an open problem in web design" is eight words, a 3.67 s
  floor, so arriving at 33.93 as planned would have ended it at 37.60, past the
  card. The build arrives at 33.83.
- **The cut to the diagram is 0.23 s into "sidebar"** (the word runs 19.35 to
  19.79; the cut is 19.58, with the second moving type from 19.57 on heading
  5's floor). SCRIPT-v3's fallback is to cut on the next word; that would put
  the cut on "is" (20.05) and leave the connectors 0.4 s to reach "one". The
  connectors start 0.02, 0.15 and 0.28 s after the cut and the last arrives at
  20.46, on "one" (20.45).
- **The flatten is re-shaped.** On the stopped build's curve the extras, still
  at +450 while the page began to turn and grow, rose into heading 3's second
  line ("focused on content") at 10.8 to 11.0 (0 px clearance, measured on the
  page with the field and headings hidden). Now the plates come down first, in
  order (header u 0.55 to 0.66, sidebar 0.57 to 0.68, rail 0.59 to 0.70), the
  extras last (0.60 to 0.74, landing about 11.0 instead of 11.45), and only
  then does the page turn (tilt from u 0.66 to 0.95) and grow (scale and
  position from u 0.64). The writing and the rail thumb return to `#2f5ce0` as
  the extras land (u 0.62 to 0.74). Measured every 0.1 s from 9.9 to 12.05, the
  nearest drawn pixel to a heading line's ground is 30 px or more while heading
  3 is up. The landing is still exact: the last open frame (12.117) and the
  first pile frame (12.133) differ inside the page box only where the pile's
  first piece starts to print (64 px) and in one anti-aliased pixel of the
  right hairline. The flatten takes 1.98 s (10.14 to 12.12; planned 1.85 s).
- **The twelve late spill pieces are 0.06 s apart** (SCRIPT-v3's fallback):
  at 0.07 s the last would finish after "redesign" (14.73); at 0.06 s it is up
  at 14.70.
- **E5's guides draw in 0.35 s, 50 ms apart** (planned 0.4 s), so all three are
  drawn by 29.34, before the cut on line 8's last word.
- **Heading 7 drops on its floor (26.15 to 26.35) and heading 8 rises on the
  planet's cut (26.42)**, so the heading ground is empty for 0.07 s; heading 8
  holds 0.21 s past its floor, to line 8's last word.
- **The mix, for a male narrator:** the dip's vowel band is 300 to 800 Hz
  (Clara's was 400 to 800; Frederick's first formants reach down to about 300
  Hz). With 400 to 800 his 300 to 500 Hz sat only +0.9 dB over the bed
  (median, the bed louder in 48 percent of frames); with 300 to 800 it is +3.7
  dB. The wider dip took the bed under speech to -30.4 LUFS, so `BED_SPEECH`
  went from -16 to -14.5 and it reads -29.1. `GAP_MIN` is 0.6 s, so no gap
  takes the lift and the bed holds down from the first word to the last (every
  gap is under 0.6 s, and a 0.2 s bump in a half-second gap pumps).

### The music and the mix, measured

- `make-bed.py` (unchanged): film 0 is source 4.857 s; the six-bar join at
  film 17.516 (inside line 5, between "links" 17.43 and "and" 17.99; pin -15.9
  ms, pad correlation 0.308, as before); the resolution at film 37.516 (the
  card at 37.5); peak -10.2 dBFS.
- `mix-report.json`: narrator -15.8 LUFS, every master -15.7 to -15.9 LUFS
  stereo, true peak -3.5 to -5.4 dBTP (the lookahead limiter at 4x
  oversampling holds the ceiling in the masters); the bed under speech -29.1
  LUFS, its largest 400 ms in the card's first second -19.9, over the card
  -24.7; in the gaps -27.4 to -32.3; dip 13.7 dB at 250 Hz, 19.8 at 400, 19.2
  at 500, 20.0 at 630, 17.0 at 800, 8.6 at 1 kHz; voice over bed 300 to 500
  Hz +3.7 dB, 500 to 700 Hz +2.5 dB, 1 to 4 kHz +11.0 dB (medians); premix
  -15.9 LUFS, true peak -2.9 dBTP.
- Final MP4 (`ffmpeg -af ebur128=peak=true`): -15.9 LUFS integrated, LRA 2.6
  LU, true peak -2.9 dBTP, so the renderer's -1 dBTP guard never acts. The
  delivered audio matches `film-premix.wav` at lag 0 and -0.05 dB.

### The picture, measured on the final

- `npx -y hyperframes@0.8.106 check .`: "Check passed", 0 errors, 22
  structural warnings (18 nested_structure_needs_subcomposition, 3
  timeline_track_too_dense, 1 composition_file_too_large, kept on purpose as
  before), runtime 0, layout 0 issues over 9 samples, motion 0, contrast 11 of
  11.
- Render: `npx -y hyperframes@0.8.106 render . --quality delivery --fps 60
  --workers 3`, 7 m 36 s on a machine at load 500 to 670 (screenshot capture,
  hardware GPU). ffprobe: H.264 High 1920 x 1080 at 60 fps, 2490 frames,
  41.500 s; AAC-LC 48 kHz stereo, 41.500 s. Top-level atoms ftyp, moov, free,
  mdat (faststart as rendered). The render log has no Google Fonts line (its
  one "Google" is the GPU vendor string).
- The field's clock (gem time 9.2 + 0.12 s a second, rotation 240) re-measured
  on the new scene times: the lit share of each shot's open ground reads 12.7
  to 29.8 percent at 29 times across the film (8.8 and 9.6 read 11.4 to 35.5
  and 6.2 to 33.7), so 9.2 stays.
- Frame-difference trace (480 x 270 grey, median 0.29): steps at the cuts only,
  19.583 (6.9), 23.817 (6.8), 26.433 (12.3), 29.433 (11.9) and 37.500 (73.2,
  the card); the landing at 12.12, the two moving types and every tone change
  show no step. The fastest continuous moves are the growth out of the wall
  (23.65 to 23.78, up to 6.9, SCRIPT-v3's 0.46 s), the shrink back on "Docs"
  (33.1 to 33.2, 4.9) and the accordion's move into the page (21.5, 4.2).
- Clearance, objects to the heading lines' ground: 30 px or more in the iso
  view and the flatten, nothing within 60 px in lines 1, 7, 8 and 10 and in the
  diagram once heading 6 has assembled; heading 8's line ends about 96 px left
  of the small page. (Corrected after the critic: during the second moving
  type the top connector's vertical came within 15 px of heading 5's cells at
  19.77 to 19.80 and 1 to 12 px of the comma in "lines," at 19.83 to 19.87,
  measured on heading white against connector `#86a8ff`; the fix round below
  reverses the stagger.) The page
  box's top-left cross (561, 456) sits 18 px under the ground of headings 4 and
  6 and 44 px under heading 3's, where round 7d drew it.
- Frames read at every line's start plus 0.5 s (0.80, 3.43, 6.32, 11.23,
  15.08, 19.72, 24.10, 27.07, 30.18, 33.17), on both sides of every cut
  (12.117/12.133, 19.567/19.583, 23.800/23.817, 26.417/26.433,
  29.417/29.433, 37.483/37.500) and at 60 key events, plus crops of the iso
  logo, the header morphs, the guides and the lit page.
- Poster: frame 2489 decoded from the MP4 (the settled card). Contact sheet:
  frames 0, 60, ... 2460, six columns, 480 px tiles.

### The spectacle map, checked on the final

Every piece of SCRIPT-v3's spectacle map, with the time it plays and the frame
it was read on.

- [x] The dithered gem smoke field, one clock, opening at three quarters of its tone, shaped by envelopes: 0.0 to 37.5 (every frame; 0.0 opens on it).
- [x] The heading motion (26 px rise, 18 px drop): every non-moving-type change (4.03, 7.50, 11.63, 23.35, 26.15, 29.23, 33.03).
- [x] The seven round 7d headings on lines 2, 3, 4, 5, 6, 9 and 10 (4.6, 8.3, 12.6, 16.6, 20.47, 30.3, 34.0).
- [x] The page model with the GT mark: lines 1 to 10.
- [x] The isometric camera from "product" (4.89) to the landing on "cluttered" (12.12): 5.1, 6.35, 9.95, 10.9, 11.4.
- [x] The plates (rail +110, sidebar +210, header +330), slabs, dithered faces, rims, drop lines, drift: 6.35 to 10.14 (7.5, 9.2).
- [x] The flatten, plates down in order, rims back to `#2f5ce0`, the pixel-exact landing and the crosses: 10.14 to 12.12 (12.117 against 12.133).
- [x] The full round 7 clutter pile, seeded and speeding up: 12.12 to 13.72 (12.6, 13.3, 13.85).
- [x] The toast over the action: 12.58 (12.6).
- [x] The spill past the page as opaque cards: from 12.82 (13.3, 13.85).
- [x] The twelve late spill pieces: 13.84 to 14.70, before "redesign" (14.5).
- [x] The field's heading calm changing by tone around the moving type: 15.0 to 15.7 (15.08, 15.5).
- [x] The moving type twice: 15.10 and 19.57 (15.5, 20.0).
- [x] The deletion band uncovering the action, the spill leaving the smoke: "deleting" 15.89 (16.2, 16.6).
- [x] The accordion diagram by the hard cut inside "sidebar": 19.58 (19.583).
- [x] Three connectors on navy casings, rows rising, white crosses: 19.60 to 20.46 (19.72, 20.0, 20.47).
- [x] The rail drawing and bending on 45 degree runs: "one" 20.45 (20.7).
- [x] The thumb sliding to the active page: 20.90 to 21.35 (21.2).
- [x] The docs panel's hairline frame, right edge, crosses, panel closing over the smoke: "rare" 22.19 (22.45, 22.8).
- [x] The 9 by 6 grid rising from the lower right: 22.31 to 22.86 (22.8).
- [x] The one lit page with its outline: "sites" 22.99 (23.3, crop).
- [x] The bridge's opening (growth, pages leaving, outline and hairlines back, panel opening): 23.35 to 23.81 (23.6, 23.8).
- [x] The writing printed from GEM7, eleven lines, the rule, the smoke's light along the words: from 23.81 (24.1, 24.2, 25.0).
- [x] The writing's thumb arriving on "it": 26.18 (26.2).
- [x] The glyph planet lighting from the crown down as the smoke leaves its disc: 26.42 (26.433, 26.9).
- [x] The script step on "same": 27.95 (28.4).
- [x] The reader's path at one constant speed with white seats: from "Each" 29.68 (30.3, 31.0).
- [x] The action mixing to white: "action" 31.58 (31.7).
- [x] The pulse into the lit action: 31.83 to 32.78 (32.3).
- [x] The shared end card: 37.5 to 41.5 (37.5, 38.5, 39.0, 41.483).
- [x] The old page's four B1 extras from frame 0 until line 5 deletes them (0.0, 9.95 crop, header crops 17.4 to 18.6).
- [x] The reader grid: 28 nodes, seven threads, stubs (0.6, 0.8; again 34.0).
- [x] The agent pulses doubling on "agents" 2.04 (2.3), running again from 33.54 (34.5).
- [x] The agents leaving on "Humans" 2.93 (3.3, 3.43).
- [x] The humans, stubs and threads toning out on "product" 4.89 (5.1).
- [x] The iso rise from the opening page's rect (5.1).
- [x] The GT mark and name bar white from "General" 5.82 to the end (9.95 crop, header crops).
- [x] The extras at +450 with drop lines on "redesigned" 6.86, landing last (7.5, 9.95 crop, 10.9).
- [x] The thumb on the iso rail plate, "people" to "read" 8.90 to 9.40 (9.2).
- [x] The writing printed white on the iso content plate, "read" to "writing" (9.95 crop), back to `#2f5ce0` as the extras land (11.4).
- [x] The pile tagged by kind, each kind leaving on its word (17.0, 17.4, 17.6, 18.2, 18.4).
- [x] The white redline boxes out of each piece's corner: "redesign" 14.73 (14.95).
- [x] Each kind deleted on its word: "lines" 16.75, "links" 17.43, "buttons" 18.21 (17.0, 17.6, 18.4).
- [x] Heading 5's runs turning white: "extra" 16.41, "lines" 16.75, "links" 17.43, "buttons" 18.21 (16.6, 17.0, 17.8, 18.6).
- [x] The banner shrinking into the star pill on "links" (17.6, 18.0 crops).
- [x] The toggle toning out, the search field into the search icon, the header row of five controls on "buttons" (18.4, 18.6 crops).
- [x] The second moving type at the cut to the diagram (19.583, 20.0).
- [x] Each old surface toning out as its connector arrives (20.47, 20.7).
- [x] The accordion moving into the page's sidebar slot in the comma pause, the page rising around it: 21.35 to 21.95 (21.65, 22.0).
- [x] The path through A4's five stops from the section switcher (31.0, 31.7).
- [x] The closing mirror: the shrink on "Docs", the readers back, the path into row 1's human, the last frame of the story repeating the first (33.17, 34.0, 34.5, 37.4).
- [x] The headings that are runs of the post or the spoken line: "Agents are the majority / of docs readers", "More open space", "The same spacing" (0.8, 24.1, 27.07).
- [x] The human stubs mixing to white on "evaluate" 4.27 and on "team" 35.15 (4.6, 35.4).
- [x] The clean page shrinking into the grid slot, the other thumbnails with the old surfaces in miniature: "rare" 22.19 (22.45, 23.3 crop).
- [x] The small clean page above the planet, its ink changing on "spacing" 28.37 and E5's three dashed guides on "alignment" 28.89 (26.9, 28.9, 29.383 crop).

Heroicons 2.2.0 (MIT, Tailwind Labs) supply the reader grid's `cpu-chip` and
`user` (solid, 24 px), copied into `lib/film.js`.

### Open items

- Kevin's ear on Frederick's reads: line 6's retake (its 0.26 s pause after
  "sidebar" and 0.55 s at the comma), the respelled "dox sites", and the pace
  difference between the first half (0.45 to 0.53 s gaps) and the second (0.25
  s gaps), which the heading floors and the card at 37.5 set.
- The growth out of the wall (0.46 s, SCRIPT-v3's) is the film's fastest
  continuous move on the difference trace (6.9 grey levels a frame).
- Under speech the bed is -29.1 LUFS with Frederick's 500 to 700 Hz at +2.5 dB
  over it (Clara's round 7d mix: -28.5 and +4.0). The final is heard word for
  word; a critic may still ask for more room there.
- The 22 check warnings are structural advice, as in every earlier round.

### For a later editor (v3 build)

- To change a take: `el.mjs line` with `--prev`/`--next` (never `--voice` or
  `EL_VOICE_FILE`), `el.mjs hear` it, then rebuild `O`, `WD` and `B` from the
  `.stt.json` (the heading chain in `HT` is fixed by the floors; check that
  heading 10's floor still ends by `B.card`), then `python3 audio/make-bed.py
  && python3 audio/mix.py` and keep the join inside a line.
- The flatten's order lives in `PLATES[].down`, `exLift`, `writeWhite`, the
  rail thumb's fade, `camera()`'s tilt and its flatten `a`; re-measure
  heading 3's clearance if any of them moves (the stack must stay 28 px clear).
- The lab used on this build (playwright-core driving `window.__render` over
  `python3 -m http.server`, scans of the field's lit share and of heading
  clearance) lives in the session scratchpad, `ddfs/lab/`; `clear.mjs` there
  measures the nearest drawn pixel to the visible heading's line boxes.

## The series frame removed (2026-10-04)

Kevin asked for the frame over everything to come off both blog films: it
overlapped a lot of the pictures and was not clean. The round 7d revision
final with the frame is kept in `out/v8/` (`blog-designing-docs.mp4` and
`.png`, copied before this render).

- Removed from `index.html`: the `kit/sheet.js` script tag, the `#sheet`
  host and its `z-index` rule, the `GTSheet.mount` call (rails at x 67 and
  1853, rules at y 67 and 1013, four 13 px crosses on their meetings; the
  counter and corner mark were already removed after mounting), the
  pinwheel transform origins and the two 0.6 s rail tweens at 0.0 s. The end
  card in `kit/endcard` now draws no frame by default (that change was made
  in the kit, not here). No field knockout existed for the rails, so no
  envelope changed. The comments that named "the right rail" now give
  x 1853 or 1854.
- Kept, all scene drawing: the page box's hairlines and its three crosses
  at (561, 456), (1853, 456) and (561, 1013) in lines 2 to 5 and on the
  bridge, line 7's hairlines and crosses at x 480, scene 6's connector
  crosses, every doubled line, the reading path and its seats, the plates,
  `PAGEBOX` (x 561 to 1854, so the strip right of x 1854 keeps its smoke as
  before), and the planet's limb darkening. The page box's right side was
  the series rail at x 1853; the first frameless render left it as a bare
  knockout edge, and the page box now draws its own right hairline there
  (see the next section).
- CONCEPT.md and STORYBOARD.md no longer describe the frame.
- `check`: 0 errors, the same 9 structural warnings, layout 0 issues over 9
  samples, contrast 11 of 11.
- Final: `--quality delivery --fps 60 --workers 3`, 4 m 11 s, screenshot
  capture on the hardware GPU. H.264 High 1920 x 1080 at 60 fps, 2550
  frames, 42.500 s; AAC-LC 48 kHz stereo, 42.500 s, 1994 packets. The audio
  is bit-identical to v8's: the copied AAC stream and the decoded PCM have
  the same md5 in both files.
- Pictures, lossless: snapshots of the pre-edit and the edited composition
  (`snapshot --at 1.5,10,15.5,20,25.5,32,36,40 --no-end --browser-gpu`)
  differ only on the four 1 px frame lines and the four crosses (4668 to
  5882 px a frame, the removed `#2f5ce0` and `#86a8ff` over navy or field,
  up to 219 levels), and not at all at 40.0 (the card). The one exception is
  15.5 in the bridge: 14 px of anti-aliasing on one iso plate edge (x 1348
  to 1371, y 599 to 613, at most 27 levels), repeatable on both sides
  (each composition snapshotted twice is identical), so it is the
  rasterizer's result once the layer above is gone, not a drawing change.
- Pictures, encoded: the final against `out/v8/` every 0.5 s (85 frames).
  Inside the frame zone (lines and crosses dilated 3 px) up to 226 levels and
  9160 to 11878 px over 24 levels from 0.5 to 38.0; 163 to 211 px at up to
  91 levels on the card (its old rails). Outside the zone the mean
  difference is 0.2 to 2.2 levels, and the largest is 78 levels on at most
  2950 px (15.5, the bridge), spread as fine noise over dithered and
  hairline detail with no shape of its own: the encoder's own response to
  the changed lines. 38.5 to 42.0 has at most 7 px over 24 levels outside
  the zone. The poster differs from v8's only in the frame zone (157 px).
- Poster: frame 2549 decoded from the MP4 (the settled card, no rails:
  row 67 and column 67 match their neighbours). Contact sheet: one frame a
  second, six columns, 480 px tiles.

## The page box's right edge (2026-10-05)

The critic of the frameless render failed it on one major: with the rail
gone, the smoke knockout under the page box (`PAGEBOX`, x 561 to 1854)
stopped on a bare vertical line at x 1853 whenever smoke crossed it (clearest
27.5 to 28.5, also 17.0 and 20.5 to 21.5), and the box read open on its
right in lines 2 to 5. The fix is one hairline, nothing else:

- `pageHairlines()` (lines 3 to 5) draws `F.hair(s, 1853, PB.y, 1853, 1080)`
  in `C.blue` with the box's other hairlines, so the header hairline at
  `Y(60)` now meets an edge.
- Line 2's panel has `panelRight`: it draws down out of the top-right corner
  from `B.s2 + 0.25` over 0.35 s, `expo.out`, as the top hairline arrives
  (the top is at x 1813 by 8.30, the gap 40 px), so it is down before the
  knockout's right strip closes (`ENV.closeT`, 8.30 to 8.45). It runs back up
  into the top-right cross with the others on the bridge (from `BR.t0 + 0.1`,
  0.6 s, `power2.inOut`). No envelope, timing or other drawing changed.
- Line 7's knockout runs to the frame edge (x 480 to 1920), so it has no edge
  at 1853 and gets no line.
- Lossless: snapshots of the pre-fix and fixed compositions at 10, 15.5,
  25.375, 28.5 and 40 differ only in column x 1853, y 463 to 1079 (617 px;
  above 463 the cross already covered it), and not at all at 15.5 (the
  bridge) and 40 (the card).
- Encoded, against the pre-fix final every 0.25 s (170 frames): the new
  column (x 1850 to 1856, y 453 down) carries the line from 8.375 to 13.6
  and 17.0 to 30.4; outside it, an 8 by 8 block low-pass of the difference
  peaks at 11.35 levels (encoder noise over the dither, no shape). Column
  1853 averages (68, 91, 163) over y 470 to 1070 at 20.6, 27.6 and 28.6,
  against (9, 16, 37) a column either side.
- Final: `--quality delivery --fps 60 --workers 3`, 3 m 8 s. H.264 High
  1920 x 1080, 60 fps, 2550 frames, 42.500 s; AAC-LC 48 kHz stereo, 42.500
  s, 1994 packets, stream and PCM md5 identical to v8's. The poster (frame
  2549) is identical to the pre-fix poster; the contact sheet was remade.
- `check`: 0 errors, the same 9 structural warnings, layout 0 issues,
  contrast 11 of 11.

## Round 7d revision (after the round 7d critics)

The picture critic failed the first round 7d cut (now `out/v7d/`) on one
major, a one-frame step of the field at 24.5 with no cut, and eight minors;
the sound critic failed it on one major, the bed 5 to 8 dB quieter than the
round 5 cut Kevin liked, and four minors. Every finding was answered; one
optional finding was declined (line 3's seats), with the reason below. The
words are SCRIPT.md's, unchanged; one take (line 7) was regenerated.

### What changed, finding by finding

- **The field stepped at 24.5 (major).** The envelope switched from line 4's
  heading calm to line 5's in one frame at the moving type. It now mixes by
  tone from 24.65 to 25.3 (the moving type is at 25.0 on the new clock), so
  the cells switch in Bayer order. Every other place where the envelope
  changes without a cut is a tone mix too: the planet's disc (below), the
  panel at the cut into line 2 (below), the bridge's opening and its calms.
  The final's frame-difference trace now shows steps only at the five cuts
  (8.0, 21.5, 30.5, 34.0, 38.5).
- **The bed was too quiet (major).** `audio/mix.py`: BED_SPEECH -25 to -16
  LUFS before the dip, and the dip held DIP_VOWEL_MARGIN_DB (4) further
  under Clara in her vowel band (400 to 800 Hz, with third-octave
  shoulders), by up to DIP_VOWEL_MAX_DB (8) more, so at most 20 dB there.
  Under speech the bed now reads -28.5 LUFS (was -32.5; round 5 read -27.5)
  and her 500 to 700 Hz sits +4.0 dB over it (median; 300 to 500 Hz +4.9,
  1 to 4 kHz +14.0). In each held gap the bed now comes up GAP_LIFT (0.35)
  of the way, up over 0.25 s from 50 ms after the last word and down over
  0.2 s onto the next first word: the gaps read -26.3 to -29.7 LUFS
  integrated, 2 to 3 dB over the speech around them (each gap's own music
  sets its absolute level). The cost, measured: this bed has most of its body
  in 160 to 800 Hz, so the level under speech comes from its low end and its
  top. Against the bed alone, under speech it reads +4 to +6.5 dB at 100 to
  125 Hz, -5 to -20 dB at 200 to 800 Hz and +1 to +4 dB at 1.25 to 4 kHz
  (part of that is the music's own content in the two windows). The sweep
  that chose it (`round7d/r7e/sweep.py`): at no boost over the bed's level
  alone the bed reads about -30.5 under speech with her vowels at +0.8 dB;
  -28 with +4 dB needs the 20 dB vowel dip. A dip that follows each phrase
  instead of the held envelope was tried and set aside: it let the bed jump
  4 to 6 dB in the gaps, the pumping round 7b's critic failed.
- **The open (minor).** Line 1 moved 0.3 s later (O[1] 1.2), so the bed is
  alone for 1.0 s at full level after its 0.3 s fade, and RAMP_IN is 0.2 s
  (was 0.4), ending on each held run's first word: the bed reaches its floor
  on "Designing" and on "Humans", not 0.2 s before them.
- **Line 7 read fastest (minor).** Retaken once with voice.json's settings
  and `--prev` (line 6): 3.50 s of speech (was 2.94), 3.71 words and about
  4.3 syllables a second (was 4.42 and 5.1), with a 0.52 s pause at
  "writing," (was 0.16 s). Median pitch 184 Hz (was 191), p5 to p95 155 to
  233 Hz (was 169 to 255), frame-to-frame movement 0.57 percent on the
  critic's tracker (was 0.45; lines 5 and 6 read 0.47 and 0.49). Heard word
  for word. Kept; the first take is `audio/archive-r7d/vo-7-r7d1.*`.
- **Lines 4 and 5 ran together (minor).** Line 5 moved 0.2 s further than
  the rest, so the gap is 0.80 s (was 0.60). Scribe still writes "cluttered,
  so" on the final; Clara's take falls on "cluttered" and the pause is now
  0.28 s longer than her longest comma.
- **Line 3 reads brighter than the audition (minor, optional).** Not
  retaken. The take is word for word, "docs sites" is heard as two words,
  and the critic marked it optional; a retake is a new random read with the
  same settings, and the audition's own reading of the sentence would need
  0.45 s more and a cut out of a three-sentence take.
- **The retime.** Moving line 1 by 0.3 s and line 5 by 0.2 s, with line 7's
  longer take, needed room: every cut after the open moved 0.5 s later, and
  every cut from line 6 on 1.0 s later (8.0, 21.5, 25.0, 30.5, 34.0, the
  card at 38.5), so the film is 42.5 s (was 41.0). Gaps between lines:
  0.78, 2.60, 0.84, 0.80, 0.92, 0.75 s. The bridge runs from "capture"
  (13.24) to "Humans" (17.0), 3.76 s (was 3.61).
- **The strip past the rail popped at 12.9 (minor).** The panel's opening
  times were computed for cells past the right rail too, so the strip (x
  1854 to 1920, y 456 down) went empty on the bridge's first frame and filled
  again. Those cells are now outside the opening; the strip keeps its smoke.
- **The panel's edge without its line at the cut into line 2 (minor).** The
  panel now closes over the smoke cell by cell, each cell by tone (0.15 s)
  once both hairlines, drawn out of the top-left cross with expo.out, have
  passed it (`ENV.closeT`, capped at 0.3 s), so no part of the panel's edge
  shows before its line. The planet's disc is gone at the cut, so the smoke
  that stood behind it is in the panel for its first 0.1 to 0.45 s.
- **The weak opening (minor).** The planet's disc no longer empties the
  field before the planet is there: the smoke inside the disc leaves by
  tone, row by row, on the planet's own rise (1.0 to 1.9). And the field's
  clock and orientation changed (next item), so frame 0 has a full band
  across the middle of the frame.
- **The field nearly absent in the deletion, loose cells as dust
  (minor).** Measured over the whole clock with the scenes' envelopes
  (`round7d/r7e/scan.mjs`, the lit share of each scene's open ground at
  three or four times): the first round 7d field (no rotation, clock 6.0)
  read 9.3, 35.3, 25.9, 7.0, 4.0, 0.7, 8.5 and 11.2 percent for the planet,
  the grid, the bridge, lines 3, 4, 5, 6 and 7. No clock offset fixes it
  (the rich stretch of the smoke moves through about three scenes whatever
  the offset, and gamma only scales it); turning the smoke changes where its
  bands cross. Rotation 240 degrees with the clock at 6.75 + 0.18 s a second
  reads 12.1, 15.7, 16.6, 30.2, 21.1, 17.3, 12.9 and 13.4 percent, the best
  lowest scene of 75 tries (rotations 0 to 315 in 45 degree steps at five
  clock offsets, then 195 to 255 in 15 degree steps at seven). The grid and the bridge are less thick with smoke than
  before; every scene has a band. Loose single cells: tone under 0.045 now
  prints nothing, and tone from 0.045 to 0.075 rises to meet the field
  (`FIELD.floor`), a function of tone alone, so tone mixes still switch in
  Bayer order.
- **The clutter landed 0.24 s early (minor).** The page's pieces and the
  spill now have their own schedules (the same seeded shuffles): the page's
  last piece lands on "cluttered" (23.14; the page region's activity falls
  under 0.01 at 23.17 on the draft), and the spill starts halfway through
  and finishes 0.12 s after the word.
- **The heading rose while the page still turned (minor).** The bridge's
  flatten is 1.86 s (was 1.16), longer than its 1.45 s rise; the turn is done
  at 16.5, so the last 0.5 s before "Humans" is scale and position only, and
  line 3's heading rises at 16.85 (was 0.32 s before the landing, now 0.15
  s). Modelled on the camera, the peak turn fell from 100 to 84 degrees a
  second. On the frame-difference trace the flatten still peaks highest of
  any move (3.65 grey levels a frame at 15.98; was 3.8): almost all of it is
  the page's edges crossing bright smoke inside the page box (7.7 levels
  there, 1.4 outside).
- **The rail plate clipped the cards and read heavy (minor).** The contents
  rail now lifts only its block of rows (page y 60 to 196); the empty rest of
  the rail column stays on the page plane as the rail's foot, one cell
  under the block so no seam opens. The cut edge between them has no
  hairline on the flat page, so its rims show only while the plates stand
  apart (`stroke-opacity` on the separation). The lifted block clears the
  content column.
- **The page read as a silhouette (minor).** The bridge page's content
  (bars, hairlines, dithered icons, the GT mark) takes the thumbnail's
  `#86a8ff` from "capture", holds it through the iso view, and returns to
  `#2f5ce0` as the page lays flat (`contentInk(u)`, u 0.62 to 0.95), so the
  lit page no longer dims as it lifts and the landing stays exact (inside the
  page box 78 pixels differ between 16.983 and 17.0, by at most 23 levels,
  antialiasing).
- **Line 2's heading met the lifted plates.** On the new clock the iso view
  arrives 0.29 s after line 2's last word, and the sidebar plate reached the
  heading's second line while it was still up. The heading now drops out on
  the line's last word (14.1 to 14.4), after its 2.7 s hold.
- **Line 3's seats (minor, optional): declined.** Seating the row, the
  title and the card on "look", "docs" and "understand" with a monotone
  curve was built and measured: the last run to the action is 1300 px long,
  so the speed would swing from about 210 to 2040 px a second. CONCEPT.md's
  own rule for the path is "ease none, because reading is a process". At
  its one constant speed the title's seat lands on "look" (17.76) and the
  card's on "docs" (18.11), and the action fills on "evaluate".

### Narration ledger (this revision)

| line | take | length | speech | words a second | heard | kept |
| --- | --- | --- | --- | --- | --- | --- |
| 7 | vo-7.mp3 (retake) | 4.04 s | 3.50 s | 3.71 | word for word; 0.52 s at the comma | yes |

One `el.mjs line` call (59 characters plus line 6 as context) and three
`hear` calls: the retake, and the final (42.5 s). No music was generated.

### The music and the mix, measured

- `make-bed.py` (unchanged) on the new clock: film 0 is source 3.857 s, the
  join at film 18.516 (under line 3), the resolution at film 38.516 (the
  card at 38.5). Two runs give the same bytes.
- `mix-report.json`: narrator -15.9 LUFS; bed alone -20.5 LUFS at the open
  (largest 400 ms -19.9), -21.1 under the bridge, -24.7 over the card
  (largest 400 ms of its first second -19.9); under speech -28.5; the held
  gaps -29.7, -28.5, -26.3, -28.9, -27.4; dip 12 dB at 250 Hz, 18.3 at 400,
  19.3 at 500, 20.0 at 630, 16.1 at 800, 5.4 at 1 kHz.
- Final MP4: ffprobe H.264 High 1920 x 1080 at 60 fps, 2550 frames, 42.500
  s; AAC-LC 48 kHz stereo, 42.500 s. ebur128: -16.4 LUFS integrated, LRA 5.1
  LU, true peak -2.8 dBTP. The delivered audio matches `film-premix.wav`
  at lag 0 and -0.04 dB (the residual of a plain subtraction reads -27 to
  -47 dB by section, as the first round 7d cut does against its premix). No
  clip edge, the bed's start, the join, the card's cut or the end shows
  high-frequency energy over its neighbourhood (2 to 4 ms windows).
- `el.mjs hear` on the final: 80 words for SCRIPT.md's 80, in order, no word
  difference; scribe writes "cluttered, so". Line starts 1.20, 8.20, 17.02,
  21.80, 24.32, 30.82, 34.26; localization 5.46, but 10.94, capture 13.24,
  look 17.76, docs 18.10, understand 18.98, evaluate 19.76, cluttered 23.14,
  cut 25.66, deleting 27.96, one 32.08, accordion 32.94, writing 35.28,
  read 37.46. Its audio tag is now "[on-hold music]" (the first round 7d
  final: "[gentle music]"; the same generation was tagged "on-hold music"
  once in round 5).

### The picture, measured on the final

- Frame-difference trace (480 x 270 grey): steps at 8.0 (14.9), 21.5 (8.4),
  30.5 (14.2), 34.0 (12.4) and 38.5 (75.9, the card); the bridge's start,
  its landing, the 25.0 tone mix and the moving type show no step. Largest
  continuous moves: the flatten 3.65 (15.98), the moving type 3.45 (25.38).
- At each heading's hold (4.0, 12.5, 18.5, 24.0, 28.0, 32.5, 36.5): no
  field cell inside any heading line's box; white over the brightest ground
  pixel in the boxes 16.4 to 17.8 to 1 at 1920 and 18.0 to 18.5 to 1 at 1280
  x 720; the nearest blue pixel above the page line to a heading glyph is 57
  to 97 px away (in line 4 that pixel is a spill card). `check`: 0 errors,
  11 of 11 contrast. The render log has no Google Fonts line.
- Poster: the final's last frame (2549) decoded from the MP4. Contact sheet:
  one frame a second (frames 0, 60, 120 ...), as MOTION.md asks.

### Traps met (this revision)

- Draft renders put a keyframe every 250 frames; at draft quality each one
  reads as a 0.4 to 1.4 level step on the difference trace (25.0 is frame
  1500). Check a step against the keyframe list before chasing it.
- A background `python3 -m http.server` for the lab stops at the tool's
  background time limit; restart it before a lab run.
- The lab (`round7d/r7e/lab.mjs`, `scan.mjs`, `raw.mjs`) drives the real
  page through `window.__render(t)` and `window.__dbg`, with playwright-core
  from `$PROTOTEMPLATE/node_modules`. Scene 7 switches
  the one gem mount to its own setting, so a scan that sets field params on
  the mount directly loses them after line 7; set them on `FIELD.params`.

### For a later editor (this revision)

- The film's clock is `O`, `WD` and `B` in `index.html`; the root
  `data-duration` and the clip windows follow `B` by hand (`B.card + 4`).
  After moving any of them: `python3 audio/make-bed.py && python3
  audio/mix.py`, then check that the join stays under a line.
- The field is `FIELD` (params with `rotation: 240`, `g0` 6.75, `rate`,
  `gamma`, `cap`, `floor`). Its envelopes are `ENV` from `buildEnvs()`;
  every change without a cut goes through `envAt(t)` as a tone mix
  (`planetRise`, `ENV.closeT` with `PANEL_CLOSE`, `ENV.openT`, `ENVMIX`).
- The bridge's camera is `UK` (rise 1.45 s, hold 0.45 s, flatten to `B.s3`)
  and `camera()`; the plates are `PLATES` (the rail's block and foot share
  the cut at `PG.yr`); `contentInk(u)` sets the bridge page's ink.
- The mix's new knobs: `DIP_VOWEL`, `DIP_VOWEL_MARGIN_DB`,
  `DIP_VOWEL_MAX_DB`, `GAP_LIFT`, `GAP_RAMP`; `mix-report.json` now reports
  `bed_lufs_in_held_gaps`.

## Round 7d (Clara, the round 5 music, the dither back, the isometric bridge)

Kevin, after watching the round 7 films: "for the blogs i liked the peaceful
music from before and make the narration a much more friendly australian
voice and show the options"; after the auditions, "like 2 but more female.
and also im sad to see the dither disappear from background"; then "i also
wonder if theres a way to bring back the isometric view that transitions
into more in the designing docs film, no need to replace anything. and lets
use clara"; then "continue everything". Every scene of round 7c is kept; the
words are SCRIPT.md's, unchanged.

### Step 0, archives

- The published round 7c cut and poster were copied to `out/v7/`
  (`blog-designing-docs.mp4`, `.png`; byte-identical, sha1 f0d18e5b for the
  MP4). Nothing in `out/v3/`, `v4/` or `v5/` was touched.
- The Australian Baritone's takes and the Music API bed with their mix files
  moved into `audio/archive-r7b/` (listed above). round 7c's `index.html` and
  `STORYBOARD.md` were copied there too before they were rewritten.

### Narration ledger (ElevenLabs; Clara from kit/audio/voice.json)

`node kit/audio/el.mjs line audio/vo-N.mp3 "<line>" --prev "<line n-1>" --next
"<line n+1>"` from the film folder (line 1 has no --prev, line 7 no --next,
since line 8 is not spoken), nothing else passed: voice Clara,
eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0. Each take was
checked with `el.mjs hear`. No respelling was needed; nothing was cut inside a
line and nothing was time-stretched.

| line | take | length | speech | words a second | heard | kept |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | vo-1.mp3 | 6.92 s | 6.22 s | 2.57 | word for word; the title read as a title ("Designing Docs for Humans"), General Translation right | yes |
| 2 | vo-2.mp3 | 7.11 s | 6.20 s | 2.26 | word for word | yes |
| 3 | vo-3.mp3 | 4.64 s | 3.96 s | 3.03 | word for word, "docs sites" heard as two words (the Baritone's take was heard as "doc sites") | yes |
| 4 | vo-4.mp3 | 2.60 s | 1.70 s | 2.35 | word for word, a falling stop | yes |
| 5 | vo-5.mp3 | 6.32 s | 5.58 s | 2.51 | word for word; 0.48 s between "clutter." and "This" | yes |
| 6 | vo-6.mp3 | 3.34 s | 2.70 s | 2.59 | word for word | yes |
| 7 | vo-7.mp3 | 3.44 s | 2.94 s | 4.42 (short words) | word for word | yes |

- Seven takes, one each, 490 characters of text (plus the neighbouring lines
  as context). Speech-to-text this round: the seven takes (34.4 s) and two
  final renders (the first final and the one kept, 41 s each), about 116 s of
  audio in all. No music was generated.
- Inside-line pauses measured on the takes (10 ms frames under -55 dBFS): line
  1's after "Translation," 0.44 s, line 2's after "code," 0.40 s (a breath at
  -60 dBFS inside it), line 5's between its sentences 0.48 s, and a 0.17 s
  silence between "capture" and "everything". Each is shorter than every gap
  between lines, so none was cut.

### The music (audio/make-bed.py)

- The bed is the round 5 generation Kevin liked, `audio/bed.mp3` (a byte copy
  of `audio/archive-r6a/bed.mp3`, 28 s; `hear` tags it "[outro jingle]", no
  voice, and on the final "[gentle music]"). Its measured shape: eighth notes
  every 0.37514 s from 0.24 s (80 BPM), bars of eight eighths, slow pad chords
  in G with E minor, C and D colours, a swell from silence to 2.0 s, a body,
  and its own resolution from 24.35 s that decays to silence by 28.0 s.
- `make-bed.py` reads `B.card` and `B.end` from `index.html` and builds the
  bed to the film's length, deterministically (two runs give the same bytes,
  sha1 896ba96c). One passage, one jump back of six whole bars (48 eighths,
  18.007 s) at the phrase point where the music on both sides is most alike:
  source 22.373 s returns to source 4.350 s (chroma cosine 0.94 over 1.5 s on
  each side, levels within 1.1 dB; searched over 5, 5.5, 6, 6.5 and 7 bar
  lags for joins under the narration). A 0.75 s equal-power crossfade (two
  eighths; the two sides are different notes of the same chords, pad
  correlation 0.31), pinned -15.9 ms to the best pad alignment. The film
  starts at source 5.357 s, past the swell, so the resolution lands on the
  card's cut: the join is at film 17.02 s (under line 3, ducked) and the
  resolution begins at film 37.02 and rings out under the silent card.
- The round 5 tone: no EQ, and round 5's stereo treatment (its `master.sh`,
  revision 5b): left = 0.675 L + 0.325 R, right = 0.325 L + 0.675 R.

### The mix (audio/mix.py)

- Narrator masters as round 7c's (trim on the take's own sound edges, 10 ms
  and 60 ms raised-cosine fades, 60 Hz high-pass, 2:1 compressor, -18.8 LUFS
  mono, ffmpeg's lookahead limiter at 4x oversampling with a -3.5 dBFS
  ceiling), written dual mono: every master reads -15.8 to -16.0 LUFS stereo
  and -3.5 dBTP (line 6 -4.7); the narrator stem -15.9 LUFS.
- The bed: level under speech set to -25 LUFS before a dip shaped by the
  voice (in each third of an octave where the bed comes within 6 dB of
  Clara's median it is taken down to that margin, at most 12 dB: 12.0 dB at
  250 Hz, 7.8 at 500 Hz, 0.3 at 1 kHz), on one narration envelope that holds
  through every gap under 1.2 s (0.4 s ramp in before a held run, 0.8 s
  ramp out after it). The 2.45 s bridge gap is the one place the bed comes up
  alone in the middle of the film, and it ducks again for "Humans".
- Measured on the premix (`mix-report.json`): bed alone -21.2 LUFS at the open
  (largest 400 ms -19.7), -21.1 alone under the bridge (largest 400 ms about
  -20.0), -23.3 over the card's first 2 s (largest 400 ms -19.9, a decaying
  chord); under speech -32.5 LUFS, so the duck is about 11 dB from its level
  alone. In the held gaps the bed's momentary loudness moves only with the
  music (-30.0 to -35.6). Voice over bed on speech frames: 300 to 500 Hz
  median +8.6 dB, 500 to 700 Hz +3.9 dB, 1 to 4 kHz +18.3 dB.
- MOTION's "about -26 under speech" was not kept, as in round 7c: this bed
  sits almost all in 160 to 800 Hz (+7 to +11 dB over Clara's median at 250 to
  400 Hz at -25 LUFS), so at -26 under speech it covered her vowels in 300 to
  700 Hz (500 to 700 Hz median -0.1 dB, the bed louder in half the frames).
  The masking finding of round 7c decides it; the duck is MOTION's other
  figure, about 10 dB.
- Fades: 0.3 s in at the open (the bed is alone 0.9 s before the first word),
  0.8 s out at the end; every narration clip has its own 10 ms and 60 ms
  fades. No edge starts or stops on a click.
- Final MP4 (`ffmpeg -af ebur128=peak=true`): -16.4 LUFS integrated, LRA
  5.6 LU (the bridge swell and the card), true peak -3.1 dBTP, so the
  renderer's -1 dBTP guard never acts. ffprobe: video 41.000 s (2460 frames
  at 60 fps), AAC-LC 48 kHz stereo 41.000 s.
- `el.mjs hear` on the final reads back 80 words for SCRIPT.md's 80, in order,
  with no difference (scribe joins lines 4 and 5 with a comma). Line starts
  heard at 0.86, 7.86, 16.52, 21.30, 23.62, 29.82 and 33.26 against the cue
  table's 0.90, 7.85, 16.50, 21.30, 23.60, 29.80 and 33.25; key words
  localization 5.16, but 10.60, capture 12.90, look 17.26, docs 17.60,
  evaluate 19.26, cluttered 22.64, cut 24.96, deleting 27.26, one 31.08,
  accordion 31.94, writing 34.22, read 35.90.

### The dither back in the background

- One field behind every scene (`#cf`, a full-frame canvas under the scene
  clips), from the first frame to the end card's cut: round 4 and 5's
  dithered smoke (white gem smoke on black, metaballs, size 0.55, angle 35,
  outer glow 0.8, gamma 1.45, printed in navy, `#2f5ce0` and `#86a8ff` on
  the anchored 8 by 8 tile, 3 px cells) at scale 1.8 instead of 1.3, chosen
  from field-only lab renders of the whole clock so a band crosses the
  open ground of every scene (the lower-left and upper-right in lines 2 to 5,
  the planet's sky and shoulders, scene 6's bottom, scene 7's lower-left),
  and capped at 0.88 of full tone so the brightest smoke prints as a mix of
  the two inks. Its clock is gem time 6.0 + 0.18 s a second for the whole
  film, never cut; it opens at three quarters of its tone and is full by
  1.2 s.
- It is shaped only by envelopes of tone (see STORYBOARD.md): knocked out at
  the page box and panels at their hairline frames and inside the planet's
  disc, thinned around scene 6's groups, and at zero within 28 px of every
  heading line (full again 230 px away). The envelope follows what stands in
  front of the field at the cuts and changes by tone inside the bridge.
  Pieces over the smoke carry their own navy ground (the spill cards, by
  tone with them; scene 6's connectors, a 17 px casing).
- One gem mount serves the field and line 7's writing: both settings name
  every parameter, so switching them with `gem.set()` (synchronous without an
  image) is exact; in line 7 the mount draws twice a frame. The end card's
  mount is the second. Both are seeked with `gem.at()` from `onUpdate`.
- Measured on the final at each heading's hold (4.0, 12.0, 18.0, 23.5, 27.0,
  31.5, 35.5): no field cell inside any heading line's box; white type over
  the brightest ground pixel in its box reads 17.3 to 17.7 to 1 at 1920 and
  18.1 to 18.3 to 1 at 1280 x 720. The nearest smoke to a heading glyph is 64
  to 76 px away (lines 1, 2, 3, 5 and 7; in lines 4 and 6 the nearest blue
  pixels are the clutter's spill and the accordion's rows, not smoke). The
  only cell inside a heading's bounding box is one cell 229 px right of line
  1's "an" at 4.0, beside the shorter line. `check`: 11 of 11 contrast checks
  pass.

### The isometric bridge (round 5's move, this film only)

- Between line 2 and line 3, where the grid's one lit page hands over to the
  full page, nothing replaced: from "capture" (12.89) the lit page lifts out
  of the grid and the rest of the mass leaves by tone while "don't capture
  everything" is said, the panel opens to the smoke, the page swings into
  round 5's axonometric map (a 45 degree turn, a tan 30 squash and a sqrt 1.5
  scale, the same `matrix()` as `archive/index-r5.html`), comes apart into
  its four layers as plates over the smoke (the header, the sidebar, the
  content column and the contents rail, light from the upper left, dithered
  left and right faces, rims and drop lines as round 5 drew them), holds,
  and lays flat into the page box, landing with zero speed on "Humans"
  (16.5). STORYBOARD.md has the beat.
- It is one camera move: one progress curve (a monotone cubic with zero
  speed at both ends, a slow 0.6 s drift at the iso view) drives the turn,
  the squash, the separation, the scale and the position together.
- The page in the bridge is scene 3's page in its own flat frame pixels
  (the snapped geometry `F.place` gives scene 3), carried by the matrix, so
  at the landing the matrix is the identity: the last bridge frame (16.483)
  and scene 3's first (16.5) differ inside the page box by one pixel of the
  GT mark's antialiasing. Hairlines carry `vector-effect: non-scaling-stroke`
  and sit on the +0.5 grid; the icons and the active row are polygons
  filled with screen-anchored Bayer patterns (a 24 px tile at the frame's
  origin), so their cells stay square and on the film's one grid while only
  their outline is foreshortened (DESIGN.md section 7).
- The gap between lines 2 and 3 grew from round 7c's 1.10 s to 2.45 s for
  the move; no line was cut. Line 2's heading holds its 3.0 s after it lands
  and drops out after its last word; line 3's rises as the page lands.

### Look-and-fix rounds

- Snapshots at the bridge's beats, then draft 1 (30 fps): the field was
  thin in every scene after line 2 (the smoke had moved off the open
  ground), so the field was rendered alone across the film and scaled from
  1.3 to 1.8; the iso plates read weakly over navy (rims and drop lines
  added, thicker dithered faces, a larger iso view); the panel's
  hairlines crossed the iso view (they now run back into their cross); a
  plate seam fell 1 px off scene 3's hairline (rims moved to +0.5 on every
  edge, the right edge onto the rail, the header given its run of the rail
  seam).
- The landing diff found the rims missing (`GTDither.mixColor` returns an
  array, which `stroke` refused) and the page box's crosses hidden under the
  plates (the crosses now ride above the landing page); after the fix the
  hand-over is pixel-identical.
- Draft 2: every cut opened on a frame where the field had not yet filled
  the freed ground (a 0.5 s tone rise after each cut), so the field now
  follows what stands in front of it at the cut and runs on; scene 6's
  connectors were cased in navy; the open was raised to three quarters tone;
  the panel opened as a visible hard-edged rectangle, so its cells now open
  outward from the slot and inward from the panel's edges.
- Draft 3: the contents rail, lifted in front, covered the cards; the plates
  now step up toward the back (rail 110, sidebar 210, header 330).
- Draft 4 and the first final: the flatten peaked at 4.1 grey levels a frame
  of motion, quicker than the rise; the hold was shortened 0.1 s and the
  flatten given 1.16 s (peak 3.8). The kept final's frame-difference trace
  shows spikes only at the five cuts (7.5, 21.0, 29.5, 33.0, 37.0); the
  bridge's start, its landing and the moving type show no jump.

### Traps met (round 7d)

- A clip that is not on screen may have no layout, so heading widths for the
  envelopes are measured on the canvas face (`measureText`), not from DOM
  offsets.
- `GTDither.mixColor` returns `[r, g, b]`, not a CSS colour.
- zsh does not split `set -- $var`; a tuning loop that relied on it wrote
  empty constants into `mix.py` (caught, fixed by passing arguments).
- `ebur128` returns -70 LUFS for a window one sample short of 400 ms; the
  gap tracks in `mix-report.json` show one such reading at 32.4 s.
- Renderer traps from earlier rounds still hold: `var(--font)` only (the
  final's log has no Google Fonts line; its one "Google" is the GPU vendor
  string), peak control in the masters, gem mounts seeked in `onUpdate`.
- `check`: 0 errors, 11 of 11 contrast; the 9 warnings are structural advice
  (sub-compositions), kept on purpose.

### For a later editor (round 7d)

- To change a take: generate it with `el.mjs line` (with `--prev`/`--next`),
  `el.mjs hear` it, update `O` and `WD` in `index.html` from its
  `.stt.json`, then `python3 audio/make-bed.py && python3 audio/mix.py`.
- Scene cuts are `B` in `index.html`; the card's start is `B.card`, the root
  `data-duration` must stay `B.card + 4`, and `make-bed.py` keeps the bed's
  resolution on `B.card` (the join moves with it; it must stay under a line).
- The bridge's beats are `BR` and its camera keys `CAM` and `UK`; the plates
  are `PLATES` (z and `THICK` in flat frame px). The landing is exact only
  while `camera(B.s3)` is the identity (`CAM`'s last key is the page box).
- The field is `FIELD` (params, clock `g0` and `rate`, `gamma`, `cap`), its
  envelopes `ENV` built in `buildEnvs()`; `S6CALM` shapes scene 6. Move a
  heading and its calm follows (it is measured from the heading's text).

## Round 7c (round 7b revised after its two critics)

The picture critic passed round 7b with four minors; the sound critic failed
it on three majors, all in the bed (panned 6 dB right, pumping 5 to 8 dB in
every gap, a dark 300 to 700 Hz pad on the narrator's vowels), and seven
minors. What changed, finding by finding:

- **Bed character (major).** Recomposed once with the Music API (the second
  and last composition of round 7b's allowance): `node kit/audio/el.mjs music
  audio/music.mp3 "Airy, glassy, precise ambient instrumental in a high
  register ... Celesta, glockenspiel and soft glass bells lead a slow, even
  arpeggio, over a thin, high, airy string pad; very light low end, no bass,
  no low drones and no thick low-mid pads ... centred in the stereo image ...
  no silence and no fade-in ... resolves to the home chord" --seconds 39`.
  `hear`: "[outro jingle]", no voice. The model again put 84 percent of the
  energy in 300 to 700 Hz (centroid 539 Hz, 1 percent above 1 kHz, though 20
  times the old piece's share), so the register was moved in the mix: a
  fourth-order 250 Hz high-pass, 8 dB less at 470 Hz, a 9 dB shelf from
  1.3 kHz. The EQ'd composition has 34 percent of its energy above 1 kHz
  (centroid 1.46 kHz). Its structure: A major, 72 BPM, eight 3.336 s bars of
  I V IV bVII I V IV bVII from 1.68 s, the home chord at 28.36 s.
- **Bed edit.** The film starts at 6.69 s (bar 2's mid-bar re-attack); at
  film 11.66 s the end of bar 5 (A) joins the start of bar 2 (E), the same
  A to E change as bars 1 to 2 (chroma similarity of the two tails 0.998), a
  40 ms equal-power crossfade ending 4 ms before the downbeat, aligned on the
  waveform (lag 3.8 ms, correlation 0.83); the progression plays once more
  and the home chord lands at film 35.00 s. Onsets are read by a 100 to
  700 Hz flux detector (the full-band one read the downbeats 20 to 60 ms
  early). A 60 ms crossfade 10 ms early left a 40 ms, 15 dB hole in the
  outgoing bar's bass; the tighter one leaves one 20 ms frame 11 dB down.
- **Bed image (major).** A static per-band balance (L and R scaled to equal
  energy in every third of an octave over the whole bed), the side 3 dB
  down, then a slow balance in four bands (below 300 Hz, to 700 Hz, to
  2 kHz, above; 1 s window, at most 6 dB) so every stretch is centred.
  Measured R minus L on the final: 0.0 to 0.9 s -0.3 dB (300 to 700 Hz
  -0.4, 1 to 4 kHz -0.6), 35 to 38 s +0.2 dB (-0.4, +0.8). Round 7b read
  +6.2 and +6.0.
- **Pumping (major).** The narration envelope bridges every gap under 1.2 s,
  and every gap is under 1.2 s, so the bed goes down 0.35 s before
  "Designing" and stays down until 34.2 s, then rises over 0.8 s into the
  home chord. The bed's momentary loudness in the six gaps is no higher than
  around them (7.5 s -35.5, 14.0 s -32.2, 19.5 s -33.9, 22.0 s -31.6, 27.5 s
  -32.3, 30.5 s -29.4); what movement remains (momentary median -32.5,
  p05 -35.5, p95 -27.1) is the arpeggio's own notes on the 1.67 s pattern.
- **Masking (major).** Under the narration the bed takes a dip shaped by
  the voice: in each third of an octave from 150 Hz to 12 kHz, over the
  frames where the narrator sounds, the bed's median level is held 9 dB
  under the voice's median (at most 20 dB of dip; the dip reads 5.7 dB at
  500 Hz, 1.0 at 1 kHz, 3.6 at 2 kHz, 7.2 at 8 kHz). Voice over bed on
  active speech frames (`round7c/snr.py`, the critic's figures reproduced
  for round 7b): 300 to 500 Hz median +8.8 dB, bed louder in 28 percent of
  frames (round 7b +5.2, 34 percent); 500 to 700 Hz +7.3, 35 percent (round
  7b -5.5, 62 percent); 700 Hz to 1 kHz +7.1; 1 to 4 kHz +13.5, 16 percent;
  4 to 10 kHz +13.6. The cost is level: the bed under speech reads -30.7
  LUFS, against MOTION's "about -26". That is 10.7 dB under its -20 alone,
  which is MOTION's other figure ("duck it about 10 dB while a line plays");
  the two figures cannot both hold for a bed at -20 alone, and the masking
  finding decides between them. Trying the bed at -26 under speech put it
  level with the voice in the consonant band (1 to 4 kHz median +3 dB, bed
  louder in 38 percent of frames), so that was not kept.
- **Card onset (minor).** The level is set per region on the carved bed:
  the home chord's largest 400 ms loudness is -20.0 LUFS (round 7b -16.5),
  the open's -19.9. The chord decays as it rings, so the card reads -26.0
  LUFS over 35 to 37 s and -27.6 over the whole card.
- **The open (minor).** The fade in is 0.3 s (was 0.6), on a bar's
  re-attack, so the bed is at full level from 0.3 s to the first word at
  0.9 s.
- **Pauses (minor).** Two more cuts inside silence, like line 5's: 0.14 s
  of line 1's pause after "Translation," (region peak -64.7 dBFS) and
  0.32 s of line 2's after "code," (-63.5 dBFS), so each comma pause is about
  0.4 s. Lines 4 and 6 moved 0.15 s and 0.1 s later and line 5 0.15 s later,
  so the gaps between lines are 0.76, 1.10, 0.76, 0.77, 0.67 and 0.62 s,
  each longer than any pause inside a line. On the final, scribe now ends
  line 4 with a full stop (round 7b joined lines 4 and 5 with a comma).
- **"docs sites" (minor), kept.** Re-measured on take A with 5 ms frames
  (4 to 11 kHz against 150 Hz to 1 kHz): the sibilant from the release of
  "docs" to the vowel of "sites" runs 1.355 to 1.485 s, about 130 ms; the
  word-final s of "sites" runs about 105 ms. The geminate is there but
  short, which is ordinary connected speech; scribe writes it as one s, as
  it did on the same-text retake. No retake was made (the critic's first
  option is to accept it): a respelling that forces a release adds a pause,
  and the path's seats are timed on this take.
- **Scene 2's first frame (minor).** The pages' tone rise starts 0.3 s
  before the cut and spreads from the lower right to "code" (9.52), so
  frame 450 opens on the smoke and the first pages printing.
- **The action at 19.5 (minor).** The action stays white into line 4
  (`pageFills(cells, 1)`); a toast (an opaque navy plate, a white edge, a
  line of text; three new pieces flagged `cover` in `lib/film.js`) lands on
  it a third of the way through the clutter's landing, outside the seeded
  shuffle so every other piece keeps its order; the deletion band uncovers
  it, and the clean page holds with its action white.
- **Moving type pops (minor).** The cells are the heading's own 3 px cells
  on the frame grid, lit to their coverage of the anti-aliased type, and
  each end is a six-frame hand-over while the cells hold still: the cells
  come up under the set heading (frames 1380 to 1383), the heading fades off
  them (1383 to 1386); the new heading fades onto its cells (1422 to 1425),
  the cells go (1425 to 1428). The first attempt crossfaded heading and
  cells against each other and dimmed the type by about a quarter for a
  frame; white over white does not. On the final no frame in the change
  differs from the one before by more than 0.36 levels (round 7b: 0.78 and
  1.0 in one frame each).
- **The planet (minor).** Latin first, the world's scripts on
  "localization": kept and written into STORYBOARD.md as a deviation from
  CONCEPT.md.
- **Story minors, kept.** The opening's heading against a different spoken
  sentence, line 2's unstated premise and the switch from "General
  Translation" to "our" all follow from SCRIPT.md's words and headings and
  CONCEPT.md's line 1, which this lane may not change; the critic offered
  each as the director's call.
- Measured on the final: ffprobe video and audio 39.000 s (2340 frames at
  60 fps, AAC-LC 48 kHz stereo); ebur128 -16.2 LUFS integrated, LRA 2.6 LU,
  true peak -2.9 dBTP; the render log has no Google Fonts line. `hear`: 80
  words for SCRIPT.md's 80 in order, "doc sites" the one difference; every
  cue word within 0.02 s of the cue table. The per-frame difference trace
  shows changes only at the cuts, the headings' rises, the moving type,
  the clutter, the smoke in line 7 and the card, plus two encoder keyframe
  refreshes (frames 250 and 700, under 0.26 levels).
- Credits this round: one 39 s Music API composition and two speech-to-text
  checks (the composition, the final). No narration was regenerated.
- For a later editor: the bed's bar grid is `JOIN_A`, `JOIN_B` and `HOME`
  in `audio/mix.py` (file seconds of the downbeat after the jump's source
  bar, the bar it returns to, and the home chord); a new composition needs
  its own read first (`round7c` in the scratchpad has the chroma and onset
  readers). `DIP_MARGIN_DB` sets how far the bed sits under the voice band
  by band; `BED_SPEECH` is its level before the dip. The section "For a
  later editor (round 7b)" below still holds for takes and cues, except
  that its note on the bed's onsets is replaced by this one.

## Round 7b (the Australian Baritone, the series end card)

Kevin, 2026-10-02: "for the designing docs and fuma we want to add links at
end, and we want to make a consistent end card after videos that also adds
link"; "also make the voice more australian and make the voice less shaky".
SCRIPT.md's round 7b changes: line 8 is no longer spoken, the story ends on
line 7, and the shared series end card (blue, the title in two lines, the
link) follows it in silence. The narrator is the Australian Baritone at
speed 1.0.

### What was built and why

- Step 0. Round 7's takes (Patrick at speed 0.92, then 0.85 in
  `takes-s085/`) were void, so they and every mix file built on them
  (masters, premix, report, `mix.py`, the 44.56 s composition and its
  rejected sibling) moved to `audio/archive-r7a/`. Round 7's composition
  followed CONCEPT.md scene for scene, so it was the starting point; its
  scene 8 (its own end card with a voiced line) was removed, every cue was
  re-read from the new takes, and nothing of round 5 or earlier was used.
- The clock. Seven takes at the voice's natural rate (80 words in 29.08 s of
  speech, 2.75 words a second) make the story 34.2 s; the card follows at
  35.0 and the film runs 39.0 s, 5.5 s shorter than round 7. The cue table
  `O = [0, 0.9, 7.8, 14.6, 19.65, 22.3, 27.6, 31.1]` puts 0.86 s of music
  alone at the open and 0.61 to 0.78 s of music between lines. The scene
  cuts (`B`) sit on the 0.5 s grid in the gaps: 7.5, 14.5, 19.5, 23.0 (the
  moving type), 27.5, 31.0 and 35.0 (the card).
- Heading holds were the binding constraint from line 4 on: each heading
  holds (words / 3) + 1 s after it arrives, so line 4's heading (arrived
  20.1) holds to the moving type at 23.0, line 5's (readable 23.8) to 27.5,
  line 6's (arrived 28.1) to 31.0, and line 7's (arrived 31.6) to 35.0.
  Line 7's heading rises in 0.6 s like lines 2, 4 and 6 so the card can
  follow 0.8 s after the last word instead of 1.3 s.
- Key actions land on their words (checked on the final's transcript, every
  cue word within 0.04 s of its plan): the planet changes script on
  "localization" (5.22); line 2's heading and lit page on "but" (10.60); the
  reader's path takes its seats on "at", between "docs" and "sites", on
  "understand", and fills the action on "evaluate" (17.92); the clutter's
  last pieces on "cluttered" (21.17); the deletion starts on "cut" (23.42)
  and the upper half is clear on "deleting" (25.28); the last connector
  meets the accordion on "one" (29.00) and the thumb arrives on "accordion"
  (29.84); the writing is complete on "writing" (32.10) and the thumb
  arrives on "read" (33.84).
- The path in line 3 is drawn at a constant speed per run (ease none); its
  knots were moved so the runs' speeds stay within a factor of 2.3 of each
  other (517, 713, 423 and 969 px a second) at the new speech rate.
- The deletion band in line 5 is timed from "cut" so the upper half is
  clear on "deleting" and the page stands alone 0.24 s before the last
  word ends.
- Look-and-fix round 1 (draft 1): the glyph planet's low side limbs carried
  loose white land glyphs across the left rail; scene 2's cut landed on an
  almost empty navy frame. Round 2 (drafts 2 to 4): lowering the rim light
  dimmed the whole crown (the visible cap of a sphere centred below the
  frame is all limb), so that was reverted and only the low side limbs now
  darken (land there prints as ocean and the glyphs' light factor falls to 0.45); scene 2's
  smoke tone starts 0.25 s before the cut, so the cut opens on it printing
  while the panel's hairlines draw. Both sides of every join were pulled at
  full resolution on draft 4 and at each key word.
- Smoke never sits on type: in scene 2 no smoke pixel falls inside the
  heading's box (x 120 to 1200, y 120 to 450) at any of 28 sampled times;
  scene 7's smoke prints only inside the writing's bars, below the heading;
  the end card's smoke placement is the kit's (its README measures it).
- The end card is added with `GTEndCard.addEndCard(tl, { palette: 'blue',
  title: ['Designing docs', 'for humans'], url:
  'generaltranslation.com/blog/designing-docs-for-humans', start: 35 })`
  once the module has loaded; the timeline is registered after it, and the
  card's `ready` promise is registered on `window.__hf.buildReady.endcard`
  so no frame is captured before its smoke mounts. Root `data-duration` is
  39 (start + 4). Two gem mounts exist: the film's (scenes 2 and 7, pixel
  ratio 0.5) and the card's; one draws per frame.

### Narration ledger (ElevenLabs; the Australian Baritone from kit/audio/voice.json)

`node kit/audio/el.mjs line audio/vo-N.mp3 "<line>" --prev ... --next ...`
from the film folder, nothing else passed (eleven_multilingual_v2,
stability 0.85, style 0, speed 1.0). Each take checked with `el.mjs hear`.

| line | take | length | speech | heard | kept |
| --- | --- | --- | --- | --- | --- |
| 1 | vo-1.mp3 | 7.38 s | 6.28 s | word for word | yes |
| 2 | vo-2.mp3 | 7.15 s | 6.02 s | word for word | yes |
| 3 | vo-3.mp3 | 5.43 s | 4.44 s | "doc sites" for "docs sites" (see below) | yes |
| 3 | takes-7b-alt/vo-3.b.mp3 | 4.88 s | 3.98 s | "doc sites" again | no (test) |
| 4 | vo-4.mp3 | 2.65 s | 1.88 s | word for word | yes |
| 5 | vo-5.mp3 | 5.62 s | 4.58 s after the cut | word for word | yes |
| 6 | vo-6.mp3 | 3.67 s | 2.78 s | word for word | yes |
| 7 | vo-7.mp3 | 3.53 s | 3.10 s | word for word | yes |

- "docs sites": scribe writes the geminate s as one word boundary. The take
  has the /ks/ of "docs" and a 135 ms sibilant into "sites", against 110 ms
  for the word-final s of "sites", so both s are said. One retake with the
  same text (no respelling: no spelling avoids the merge without adding a
  pause) was heard the same way, so take A stays: its 0.5 s pause before
  "and evaluate" lets the path arrive on the word.
- Steadiness: a YIN pitch track (10 ms frames) gives a median frame-to-frame
  pitch change of 0.46 to 0.54 percent per take, against 0.66 to 0.70
  percent for round 7's Patrick takes of line 3. Median f0 77 to 83 Hz.
- Line 5's pause between "clutter." and "This" was 0.66 s; 0.26 s of
  silence (peak -64.6 dBFS) was cut at 2.30 s with a 10 ms crossfade, so the
  pause is 0.40 s. Nothing was time-stretched; no take was slowed.
- Credits: 8 takes (559 characters: the seven lines, 490, plus the line 3
  retake, 69), one 39 s Music API composition, and 11 speech-to-text checks
  (7 takes, the retake, the bed, draft 1, the final).

### Music ledger

- One composition, `audio/music.mp3`, 39.0 s:
  `node kit/audio/el.mjs music audio/music.mp3 "Airy, glassy and precise
  ambient instrumental for a design film about clean documentation. Soft
  sustained pad chords and a quiet celesta and glass arpeggio, bright and
  steady, gentle and calm, around 72 BPM in a major key. A soft start that
  fades in, an even body with no build, no drops, no risers, no hits, no
  percussion, no vocals. In the final four seconds the arpeggio stops and
  the harmony resolves to the home chord, which holds and rings out softly
  to the end." --seconds 39`. `hear`: "[outro jingle]", no voice.
- Its spectrogram: 3.3 s of silence, a hard entry at 3.33 s, then 72 BPM
  (3.332 s bars) in two four-bar phrases of I I X Y, the home chord at
  30.0 s ringing out to about 37.5 s. Its energy is 150 to 700 Hz (pads and
  arpeggio, on the voice's first formant) with celesta partials to 6 kHz.
  Round 7's 44.56 s composition could not be kept (the film is 39.0 s).
- Rather than a second composition, it was edited on its bar grid: the film
  starts at 8.315 s (beat 3 of bar 1, under a 0.6 s fade in); at film 18.34
  s the tail of bar 6 (an X bar) joins the tail of bar 2 (the same X to Y
  change in the first phrase), a 60 ms equal-power crossfade aligned on the
  waveform (lag -0.46 ms, correlation 0.90), so the second phrase plays
  twice; the home chord lands at film 35.00 s, on the card's cut, and rings
  under the card to a 0.8 s fade at 38.2 s. The seam's spectrogram shows no
  break.

### Mix (audio/mix.py)

- Narrator masters: trimmed by the takes' own sound edges (30 ms before the
  first sound over -60 dBFS, at least 0.30 s after the last word), 10 ms and
  60 ms raised-cosine fades, 60 Hz high-pass, 2:1 compressor, -18.8 LUFS mono
  (about -16 LUFS as the stereo film reads dual mono), and ffmpeg's lookahead
  limiter at 4x oversampling with a -3.5 dBFS ceiling. Every master reads
  -15.9 to -16.1 LUFS and -3.5 dBTP; the narrator stem -16.1 LUFS.
- Bed: body -16.5 LUFS before the duck; a broadband duck of 4 dB plus a
  dynamic carve of 6 dB from 300 Hz to 2.5 kHz (one-octave shoulders), both
  on one narration envelope (0.35 s ramp in before each line, 0.6 s ramp out
  after it, zero phase in an STFT), so the voice's band is 10 dB down under
  speech; a -3.5 dB trim at the open and -3.0 dB on the card, each crossing
  over inside a duck ramp so the bed only moves while it ducks.
- Measured on the premix: bed -26.4 LUFS under speech, -20.1 LUFS for the
  first 2 s of the card (-21.7 over the whole card with its fade), the bed's
  short-term level 3 to 6 dB up in each gap; premix -16.2 LUFS, -2.3 dBTP.
- Final MP4 (`ffmpeg -af ebur128=peak=true`): -16.3 LUFS integrated, LRA
  1.6 LU, true peak -2.3 dBTP, so the renderer's -1 dBTP guard never acts.
  ffprobe: video 39.000 s (2340 frames at 60 fps), audio 39.000 s.
- `el.mjs hear` on the final reads back 80 words for SCRIPT.md's 80 in
  order; the one difference is "doc sites" for "docs sites" (above).

### Traps met (round 7b)

- scribe_v1 starts a word after its soft onset ("Agents" sounds from 0.06 s,
  scribe says 0.14; the s of "So" from 0.03, scribe 0.10), so a trim at the
  first word minus 0.05 s clipped the onsets; the trim now follows the
  take's energy and each master is placed by its first word's offset.
- The Music API composition opened on 3.3 s of silence with a hard entry
  and resolved 9 s before its requested end, against the prompt. Editing on
  its bar grid was cheaper and surer than a second composition.
- The planet's rim light is what lights the crown: a sphere centred below
  the frame shows only its limb, so a global rim change relit the whole
  picture. Limb changes must be local (the low side limbs only).
- The voice limiter at -3.0 dBFS left the premix at -1.9 dBTP (the bed adds
  about 1 dB at voice peaks); at -3.5 the premix and the AAC final are both
  -2.3 dBTP.
- `ffmpeg -ss` past the last frame (38.985 on a 38.983 s last frame) writes
  nothing and leaves an old file in place; the poster is pulled at 38.97.
- Renderer traps carried from round 7 still hold: `var(--font)` only (the
  final's render log has no Google Fonts line; its one "Google" is the GPU
  vendor string), peak control in the masters, gem mounts seeked with
  `gem.at()` in onUpdate.
- `check`: 0 errors, 9/9 contrast; the 8 warnings are structural advice
  (sub-compositions, track density). The end card README expects two
  `text_occluded` infos; this film's check reports none.

### For a later editor (round 7b)

- To change a take: generate it into `audio/` with `el.mjs line`, run
  `el.mjs hear`, update its first-word time in `const O` and its cue words in
  `WD` in `index.html`, then `python3 audio/mix.py`, which remasters,
  re-ducks, re-carves, re-edits the bed so its home chord stays on the card
  (`CARD` in mix.py), and rewrites the `<audio>` attributes. Scene cuts are
  `B` in `index.html`; the card's start is `B.card`, and the root
  `data-duration` must stay `B.card + 4`.
- The bed edit reads the composition's own onsets near 26.62, 13.30 and
  29.95 s; a new composition needs its own bar grid read first.

## Round 7 (from scratch: new script, new concept, new pictures)

Kevin: "make the videos a lot better and more properly scripted"; "for the
new videos, we need new visuals too"; "the new scripts and visuals and stuff
have to be done from scratch [...] it needs to be coherent and tell a clear
simple story taking excerpts from the blogs". The script (SCRIPT.md) and
the concept (CONCEPT.md, the
r7-idea treatment with r7-viewer's glyph planet for line 1 and r7-people's
grid of pages for line 2) were written and judged before this stage. Nothing
of the earlier cuts' pictures, scripts or timings is reused; the scene code
was written new from the treatments' key-frame HTML.

### What was built and why

One docs page carries the film, in the post cover's own material (blue gem
smoke and blue Bayer dither on the navy page `#071124`). The story is the
script's sentence: people still read docs to understand a product, so
General Translation deleted the clutter from its docs and kept the writing.

1. 0.0 to 9.0: the glyph planet (twenty writing systems, one glyph per 21 px
   cell, size carrying the light), turning, stepping to its next writing
   system on "localization". It shows what localization tools are.
2. 9.0 to 16.5: 54 docs pages rising in tone from the lower right while the
   voice says "Agents are mass executors of code"; on "but" one page lights
   and the heading lands. Gem smoke dithered in the corners.
3. 16.5 to 21.5: that page at full size, one reader's path drawn as the
   doubled line at one constant speed, the action filling white on
   "evaluate", then a white pulse running the path into it.
4. 21.5 to 25.0: the same page buried under 142 pieces of the clutter the
   post names, landing faster and faster to "cluttered", and still arriving.
5. 25.0 to 30.0: the heading dissolves into glyph cells and reassembles; from
   "cut" the clutter leaves top to bottom by tone; the page stays whole.
6. 30.0 to 33.5: three old navigation surfaces carried by doubled lines into
   one accordion; the thumb lands on "accordion".
7. 33.5 to 38.0: the content column close, its lines the only thing printed
   from the gem smoke; the thumb slides to the section on "read".
8. 38.0 to 44.5: the GT mark as glass full of the smoke, the title beside it,
   the home chord ringing out.

Every heading reveal and key action sits on its spoken word (table in
STORYBOARD.md). Read back from the final with `el.mjs hear`: localization
6.34, but 12.08, evaluate 20.10, cluttered 23.30, cut 25.48, deleting 27.72,
one 31.36, accordion 32.44, writing 34.74, read 36.92, post 38.60.

### Narration ledger (ElevenLabs; Patrick from kit/audio/voice.json)

| pass | what | result |
| --- | --- | --- |
| A | 8 takes at voice.json's speed 0.85, `--prev`/`--next` | 89 words over 41.4 s of speech spans: 2.15 words a second, under the 2.2 floor; with the 3.4 s end hold the film would run about 48 s. Not used; kept in `audio/takes-s085/`. SCRIPT.md's rule: regenerate at `--speed 0.92`. |
| B | 8 takes at `--speed 0.92` (one re-take pass for the whole set) | 89 words over 37.1 s: 2.40 words a second. |
| B, line 2 | heard "Agents amass executors" (the weak "are" ran into "mass") | wrong take; re-taken once (`audio/takes-rejected/vo-2.a.*`). The re-take heard right. |

| n | words | speech (s) | rate (w/s) | heard back | placed at (master start) |
| --- | --- | --- | --- | --- | --- |
| 1 | 16 | 7.82 | 2.05 | every word, General Translation right | 0.70 |
| 2 | 14 | 6.86 | 2.04 | every word (re-take) | 9.15 |
| 3 | 12 | 4.64 | 2.59 | every word | 16.55 |
| 4 | 4 | 1.90 | 2.11 | every word | 21.80 |
| 5 | 14 | 5.80 (5.30 after the pause edit) | 2.41 (2.64) | every word | 24.25 |
| 6 | 7 | 2.80 | 2.50 | every word | 30.15 |
| 7 | 13 | 3.62 | 3.59 | every word | 33.65 |
| 8 | 9 | 2.88 | 3.13 | every word, General Translation right | 38.15 |

No respelling was needed. The rates per line differ with the words (line 7's
are short); the film keeps one speed. Line 5's pause between its sentences
was cut from 0.90 s to 0.40 s inside silence (the script asks for 0.3 s);
nothing was time-stretched. Calls: 17 TTS takes, 12 speech-to-text checks
(8 + 1 takes, 2 beds, 1 final), 2 Music API compositions.

### Music ledger

| composition | result |
| --- | --- |
| 1 (`audio/music-rejected/music-a.mp3`) | 12.4 s of near silence, a hard entry, dead by 41 s. Not used. |
| 2 (`audio/music.mp3`, used) | Airy pad chords and a celesta and glass arpeggio, 80 BPM, 3.0 s bars, chord changes every 9 s from 4.49 s; begins at once; heard as instrumental (scribe tags it "[on-hold music]", no words). Its own resolution came early (home chord at 37.48 s, near silence by 43 s), so one bar (22.49 to 25.49 s) is repeated at 25.49 s, joined by a 120 ms equal-power crossfade 4 ms aligned; the second join is the music's own continuation. The home chord now lands at 40.48 s, under "blog", and rings through the end card. |

The spectrogram put the pad at 160 to 500 Hz and the arpeggio at 600 Hz to
2.5 kHz, on the voice's band, so the bed is carved there (below).

### Mix (audio/mix.py)

- Narrator masters: trim to 0.05 s before the first word and 0.3 s after the
  last, 75 Hz high-pass, compressor (threshold -22 dB, ratio 2.5), gain to
  -19 LUFS a channel, ffmpeg's lookahead limiter at 4x oversampling (ceiling
  -3.0 dBFS), 15 ms and 150 ms fades; written dual mono so the film reads
  them at -16.0 LUFS and the renderer makes no upmix choice.
- Bed: body (3 to 36 s) at -20 LUFS; a dynamic carve in the voice's band
  (an STFT gain curve, zero phase: -2.5 dB at 200 Hz, -4 at 450, -6.5 at
  1 kHz, -8 at 2 kHz, -6 at 3.4 kHz, -2.5 at 5.2 kHz) driven by the narrator's
  own envelope (attack 40 ms, release 350 ms); a broadband duck of 3.5 dB
  under the narration (0.4 s ramp into the first word, 0.8 s ramp out after
  the last); the open lifted 4 dB and the release 5 dB so the bed is heard
  alone; 0.3 s fade in, 0.8 s fade out from 43.7 s.
- Peak control before the mix: a sum-aware safety gain on the bed (dips only
  where the oversampled sum would pass -1.7 dBTP); at the final settings it
  dips no sample.
- Measured (mix-report.json, then the final MP4): narrator -16.0 LUFS, true
  peak -3.0; bed under speech -26.8 LUFS, 6.5 dB down broadband and 9.6 dB
  down in 1 to 4 kHz against the same bed unprocessed; bed alone at the open
  -22.8 LUFS (the composition's soft start), the ring-out after the last word
  -31.7 LUFS (a decaying chord); premix -16.4 LUFS, -1.7 dBTP.
- Final MP4 (`ffmpeg -i out/blog-designing-docs.mp4 -af ebur128=peak=true`):
  integrated -16.5 LUFS, true peak -1.8 dBTP, LRA 2.6 LU. Video and audio
  both 44.500 s (2670 frames at 60 fps). The renderer's guard never acted.
- `el.mjs hear` on the final reads SCRIPT.md back word for word, 89 of 89
  words in order, with no audio events.

### Picture decisions made against the takes

- The cuts follow the voice: 9.0, 16.5, 21.5, (25.0 moving type), 30.0,
  33.5, 38.0; the bed alone 0.75 s at the open; the end card holds 3.42 s
  after the last word.
- Line 3's path keeps one constant speed; with the real take that puts the
  title seat on "docs" and the action on "evaluate", the sidebar seat near
  "look" and the card seat near "sites" (the concept's "at" and
  "understand" cannot both hold at one speed).
- Gem phases were searched numerically over one period (the blue mark card
  repeats every 10π s of gem time, the corner field about every 44 s): the
  end card at angle 55, phase 9.5, 0.35 gem seconds a second puts no smoke
  pixel in the title's box at any 0.25 s sample; the corner field keeps the
  key frame's phase 14.0 (lowest smoke in the heading slot, strongest top
  right corner) with a fixed calm over the heading.
- The end card's mark is 255 px tall (scale 0.5598), its top and foot on the
  title's cap height and last baseline (412 to 667 against 411 to 666).
- Two look-and-fix rounds on drafts: the end card's glow ramp starts 0.3 s
  before the cut (its first frame was flat blue); the mark rescaled; a frozen
  1.1 s in line 3 given the pulse and a frozen 1.4 s in line 4 given the
  late clutter; line 3's tone and line 7's lines pre-rolled 0.15 s and
  0.12 s so their cuts open on the scene already printing; the moving-type
  canvas seated under the headings.

### Traps met

- A literal font-family 'Inter' fetches Google Fonts: CSS uses `var(--font)`
  only; the canvas uses `InterCanvas`, registered through the FontFace API,
  never named in CSS. The final's render log has no "Google Fonts" line (its
  only "Google" is the GPU vendor string).
- `kit/tokens.css` turns on Inter's `cv11` (single-storey a) for DOM text;
  canvas text cannot take feature settings, so the moving type's cells would
  have shown a different a. `lib/fonts/InterCanvas.woff2` is the kit's Inter
  with the cv11 substitutions baked into its cmap (fontTools); the kit is
  untouched.
- The runtime waits on promises in `window.__hf.buildReady` before it marks a
  page ready: the fonts, both gem mounts and the moving type's cell sets are
  gated there, so no worker captures a frame before the smoke exists.
  Outside the runtime `window.__timelines` does not exist; it is created
  defensively.
- Gem smoke mounts are seeked with `gem.at()` in onUpdate; one mount serves
  lines 2 and 7 by `gem.set()` (synchronous when no image is passed), the
  mark card has its own. At most two mounts exist and one draws per frame.
- The renderer turns the whole AAC track down to -1.5 dBTP past -1 dBTP and
  its limiter has no lookahead: peaks are held in the masters. Found on the
  way: a mono narrator reads 3.01 dB louder once it fills both channels of
  the film, so the masters are dual mono at -19 LUFS a channel; and the
  celesta's transients added onto voice peaks (premix -0.7 dBTP at a -2.3
  ceiling) until the ceiling went to -3.0.
- `ffmpeg -ss` just past a frame's time returns the next frame; join frames
  are pulled at the cut minus 0.04 s and minus 0.001 s.
- The layout audit reads a transparent canvas over a heading as occlusion;
  the moving-type canvas sits under the headings (it draws only while they
  are hidden).
- `check`: 0 errors, 10/10 contrast; the 9 lint warnings are structural
  advice (sub-compositions, file length), kept on purpose: the scenes share
  one render function and one cell library.

### For a later editor (round 7)

- To change a take: generate it into `audio/` with `el.mjs line`, run
  `el.mjs hear` on it, update the line's first-word time in `const O` and its
  cue words in `WD` in `index.html` (word times from the new `.stt.json`),
  then `python3 audio/mix.py`, which remasters, re-ducks and re-carves the bed
  and rewrites the `<audio>` attributes. Scene cuts are `B` in `index.html`.
- Gem settings live in `GEM2`, `GEM7` and `GEM8`; move a phase and re-search
  it (the end card's title box must stay free of smoke).
- `lib/film.js` holds the page (page units 1440 x 900, placed at 0.897 from
  561, 456), the clutter, the globe and the cell buffer; scene code is in
  `index.html`.

The sections below record earlier cuts. Their files are in `archive/` and
`audio/archive-r6a/`; none of their code or timing is in the round 7 film.

## Revision 6 (the scripted film)

Kevin, after watching the narrated cuts: "make the videos a lot better and
more properly scripted". The script was written and approved before this
round (`SCRIPT.md`); this revision rebuilds the picture and the sound around
it. Nothing on screen is spoken and nothing spoken is on screen: no captions,
subheaders, labels, bylines, dates, counters or URLs.

### Picture

- One scene per narration line, in the film's built order, each starting on
  its line's first sound: the cold open (0.0), the title (9.0), the reading
  path (17.0), the redline pass (24.0), the sidebar (30.5), the end card
  (38.0 to 44.5). Every key action is placed on its spoken word through the
  `VO` cue table, which `audio/mix.py` writes from the takes' `.json`
  alignment (`W(line, word)` in the timeline): the page lies down on
  "Humans" and settles on "product"; the plates lift from "consolidated" and
  the third settles on "three"; the pulse's head reaches Get a Demo on
  "demo"; the header rule leaves on "lines", the toggle on "buttons", the
  banner folds in the pause after it, the search field's mark draws on
  "search" and the field becomes the ⌘K icon on "icon"; the thumb starts on
  "sidebar". A new take re-times the picture with `python3 audio/mix.py film`.
- The script's picture changes: the page comes apart into three plates, one
  for each navigation surface figure C1 numbers on the new page (the sidebar,
  the actions row, the contents rail; round 4 lifted the last two as one),
  and the redline pass removes its elements in the order the voice names
  them (rule, toggle, banner, search field).
- The first frame: the film opens on the dithered field at half tone (the
  post cover's material) and raises it to full by 1.2, with the rails
  drawing and the page plate landing on it, so frame 0 is the material, not
  navy.
- The page sets itself in reading order one zone a beat over 0.5 to 3.6
  (staggers inside a zone are 70 ms, inside the brief's 40 to 90 ms).
- The flat page sits at 0.85 (x 910 to 1760, y 429 to 960) instead of round
  5's 0.9 at y 398, because the reading path's heading is now 136 px: its
  baseline sits at 370 and the page keeps 59 px under it.
- The plate heights (120, 200, 380 page units) were set from the first draft,
  where the contents rail at 320 sat in front of the actions row and hid its
  buttons; at 380 the rail rides clear and the row reads under it.
- The open finding "the dithered act drifted against round 4": both smoke
  clocks now run on round 4's own path. Each round 6 scene boundary maps to
  the matching round 4 boundary (0, 2.0, 5.5, 10.5, 15.5, 20.0, 23.5) through
  a monotone cubic (`pchip`, `R4`, `R6`, `FIELD_ARG`, `BLUE_ARG`), so the drift
  speed never steps and every frame of both acts is a frame of round 4's
  material, in round 4's state at each cut. The drift is slower than round
  4's (the dithered act about 0.08 to 0.14 of a smoke second a second, the
  blue act about 0.6 and 0.46 of round 4's rate).
- The smoke phases, searched again for the new lengths (lab renders in the
  round 6 scratch folder, `smoke-*`, with type, page, band, panel and frame
  hidden, scoring the share of each heading's box that the smoke covers at
  10 fps, threshold 60 in RGB distance from the ground):
  - the dithered act: 0.0 percent in every heading box (the tone envelope);
  - the blue act at round 4's own rate run on from 30.5: 5.4 percent in the
    sidebar beat and 28.5 percent of the end card's title box (it crosses the
    title);
  - round 4's path mapped onto the new beats: 3.7 and 3.7 percent (10.8 at
    the last frame);
  - the same path with the end card ending at round 4's 23.0 instead of 23.5
    (kept): 3.8 and 2.8 percent, 7.3 at most, against 25 percent of the open
    lower left. The veil then holds the slot at 8 percent of that: 0.0
    percent above the threshold in every frame of the final's lab twin.
- Kept from rounds 4 and 5: the material and palette, the heading slot and
  sizes, the reading path's doubled line and pulse, the B1 band and its
  B5/C4 After, the E6 sidebar and its thumb, the glass mark end card, the
  series frame without a counter.

### Voice

- Charlie (premade, Australian, eleven_multilingual_v2,
  stability 0.7, style 0.05), one take per line via `node kit/audio/el.mjs
  line` with `--prev`/`--next`, now with `--speed` (ElevenLabs' own delivery
  rate) chosen per line for 2.2 to 2.6 words a second, measured with
  `python3 audio/words.py audio/vo-N.json` (words over first letter to last
  letter, pauses included):

  | take | speed | words a second | heard back |
  | --- | --- | --- | --- |
  | vo-1 | 0.90 | 2.23 | every word |
  | vo-2 | 1.20, respelled | 2.24 | every word |
  | vo-3 | 0.72 | 2.49 | every word |
  | vo-4 | 0.88 | 2.26 | every word |
  | vo-5 | 0.85 | 2.24 | every word |
  | vo-6 | 0.75 | 2.42 | every word; Kevin Liu and Taylor Fang right |

  0.9 was tried first (vo-1 read 2.23 there). The polysyllabic L2 read 1.73
  at 0.9 and the monosyllabic L3 2.84 at 0.82, so each line has its own
  speed. Every take was heard with `el.mjs hear`.
- L2 took six generations. 0.90: 1.73 words a second. 1.15: 2.32, heard as
  "navigation services". 1.12: 2.17, every word back alone, but in the full
  film speech to text heard "services" twice (Charlie's f and v differ only
  by voicing, and the bed's low pad under the f tipped it; in 8.5 s windows
  of the mixes it was "surfaces" 10 times in 12). 1.13: "services" twice alone. Then the
  script's own respelling, sent in the text only ("navigation sur-fuh-sez";
  SCRIPT.md keeps "surfaces"): 1.12 read 2.05, 1.20 (kept) reads 2.24, is
  heard as "surfaces" alone (twice), in the full mix (twice) and in the
  final. It says the word a touch longer than the plain takes (0.63 s) with
  a 0.25 s breath before "into three", where the third plate settles.
- L3 took two: 0.82 read 2.84; 0.72 (kept) reads 2.49.
- The unused takes are kept in `audio/r6-alt/`.
- `audio/words.py` counts a hyphenated respelling as one word.

### Bed

- `audio/make-bed.py` extends the round 5 generation (`audio/bed.mp3`, 28 s)
  to the film's length, deterministically: passage 1 plays the source from
  2.008 s at film 0 (past the generation's swell, so the bed is at its body
  from the first frame); at film 21.9 an equal-power crossover of 0.75 s (two
  eighth notes) jumps back 7 bars (56 eighths, 21.008 s, so pulse and bar
  keep their places) to source 2.8955, the best 7-bar join in the file by
  chroma (cosine 0.92 over the 1.5 s around it) and pinned within 25 ms to
  where the two sides' pad (under 400 Hz) correlates best (offset -4.5 ms);
  passage 2 runs into the generation's own resolution, which begins at film
  43.35, after the last word (43.31). Then narrowed as round 5 narrowed it
  (mid kept, side at 0.35). The join sits under L3 inside the duck.
- The analysis behind it (round 6 scratch, `bed/analyse.py`, `bed/search.py`):
  eighth-note onsets every 0.3751 s (80 BPM) from 0.24 to 27.25 s, pad
  chords on G, E, D and C, body from 2.0 s, resolution from 24.35 s.
- Checked: `el.mjs hear` on `bed-edit.wav` returns only "[on-hold music]" (no
  voice); its spectrogram shows no seam at the join, no broadband hit, no
  riser. Its 100 ms RMS stays within the source's own range; the largest rise
  (10 dB in 100 ms) is the source's own note release and re-attack at source
  11.4 s, which lands at film 9.4 (under the title's first words, ducked) and
  at film 30.4, where its re-attack falls on the 30.5 cut.

### Mix

- Narrator masters (`audio/master.sh`): each take through a 70 Hz high-pass,
  a per-take trim to -24.4 LUFS (the six together), +5.8 dB and ffmpeg's
  lookahead limiter (ceiling -2.0 dBFS, 5 ms lookahead, latency
  compensated). The composition's voice bus is a unity fader; nothing in the
  composition limits.
- Placement (`audio/mix.py`): each clip starts at its beat minus its measured
  onset (the first 10 ms above -50 dBFS), so the first sound lands on the cut
  (1.0, 9.0, 17.0, 24.0, 30.5, 38.0); each clip ends 0.3 s after its last
  letter, with 50 ms in and 150 ms out. L1 waits until 1.0 so the bed is
  heard alone first.
- The bed: fade in 0.0 to 0.3, at level 0.3 to 0.7, down 0.7 to 1.0 into L1;
  one duck run from L1 to L6 (the gaps between lines are 0.45 to 0.92 s and
  each holds a cut, too short to rise and fall without the pumping round 5's
  critic found); up 43.35 to 43.70 into its resolution; out 43.70 to 44.45.
- The carve, the open finding "the bed's energy sat in the voice's own band":
  a third-octave comparison of the bed at its alone level with the six
  masters put the bed level with or over the voice at 160 Hz (+0.4 dB), 315
  Hz (+3.1) and 400 Hz (+4.3), within 3 dB at 200, 250, 630 and 800 Hz, and
  6 to 35 dB under it above 1 kHz. Under the lines the bed goes down 2.5 dB
  broadband and three peaking dips follow the duck's envelope: 170 Hz -3.5
  dB (q 1.4), 370 Hz -7 dB (q 1.6), 650 Hz -4 dB (q 1.6). Measured on the
  rendered stems while he speaks, the bed now sits 9 to 26 dB under the voice
  in every third octave from 125 Hz to 3.15 kHz (9 at 160, 315 and 400 Hz).
- Measured (stems from `python3 audio/mix.py lab voice|bed|mix <dir>`, the
  final with `ffmpeg -af ebur128=peak=true`):
  - final: integrated -16.0 LUFS, true peak -1.4 dBTP, LRA 2.4 LU; video and
    AAC both 44.500 s (2670 frames at 60 fps). The renderer's pre-guard mix
    measured the same loudness (its -1 dBTP guard never acted);
  - narrator stem: -16.0 LUFS integrated, true peak -1.9 dBTP;
  - bed: -19.5 LUFS alone at the open (0.3 to 0.7, the same window in the
    final), -28.5 LUFS under the lines (9 LU down), -29.4 in the held gaps,
    momentary at most -23.2 on the end card as its resolution decays;
  - the brief's three bed numbers cannot all hold (round 5's note); this mix
    keeps -20 alone and a 9 dB duck, so under speech it sits at -28.5, 2.5 LU
    under the -26 the brief names, because the carve removes the pad's body
    where the voice is;
  - no clicks: high-frequency energy in 5 ms windows at every clip edge sits
    within 2 dB of its neighbourhood, except vo-4's tail at 29.96 (+3.6 dB),
    which measures the same in the bed-only stem (a bed note; the voice has
    faded there).
- `el.mjs hear` on the final returns SCRIPT.md word for word, 91 of 91 in
  order, first words at 1.02, 9.02, 17.06, 24.02, 30.52 and 38.06.

### Credits ledger (ElevenLabs, round 6)

| call | what | characters / seconds |
| --- | --- | --- |
| line | vo-1 at 0.90 (kept) | 101 text (+127 context) |
| line | vo-2 at 0.90, 1.15, 1.12, 1.13 | 4 x 127 text (+188 context each) |
| line | vo-2 respelled at 1.12, 1.20 (kept) | 2 x 130 text (+188 context each) |
| line | vo-3 at 0.82, 0.72 (kept) | 2 x 87 text (+205 context each) |
| line | vo-4 at 0.88 (kept) | 78 text (+181 context) |
| line | vo-5 at 0.85 (kept) | 94 text (+153 context) |
| line | vo-6 at 0.75 (kept) | 75 text (+94 context) |
| bed | none | the round 5 generation was extended |
| hear | twelve takes, the bed edit, L2 windows and variants, three mixes, three finals | about 503 s of audio |

Narration: 1290 characters of text in twelve generations (the context is the
neighbouring lines passed as `previous_text`/`next_text`). No call was
refused. No bed was generated this round.

## Revision 5 (sound)

Kevin: "add music and an australian voice from elevenlabs". The narration is
voice only: no captions, subtitles or on-screen text were added.

- Narrator: Charlie (premade, Australian,
  eleven_multilingual_v2, stability 0.7, style 0.05), one take per line via
  `kit/audio/el.mjs line` with `--prev`/`--next`: `audio/vo-1.mp3` to
  `vo-5.mp3`, each with its `.json` timings and its `.stt.json` check. Every
  take was heard back (`el.mjs hear`) and every word returned; Kevin Liu,
  Taylor Fang and General Translation came out right. Take 4 transcribes as
  "Doc sites" and "web pages": the s of "Docs" and the s of "sites" merge
  into one long s (130 ms, 0.27 to 0.40 s in the take, against 50 to 70 ms
  for the single s sounds later in the same take), as natural speech says
  it, so the take was kept. No take was regenerated.
- Placement: each clip starts at its heading's reveal minus its measured
  onset (the start of sound at -50 dB, 65 to 96 ms into each take; the
  `.json` first character reads 0.00 for every take), so the first word's
  sound begins on the reveal: 2.0, 6.5, 11.5, 18.5, 23.0. The final MP4's
  transcript puts the first words at 2.00, 6.52, 11.56, 18.52 and 23.04.
- Holds: two, through `R()` in the script (`R_HOLDS`): +1.0 s at 5.5 on the
  round 4 clock (the title holds to 6.5 so L1 ends before the cut) and +2.0 s
  at 11.0 (after the redline heading lands, before the first mark), so L3's
  second sentence runs over the marks: the rule leaves on "lines", the banner
  folds on "links", the toggle goes on "buttons". No tween crosses either
  point; every join is round 4's hard cut. The blue act's smoke is drawn at
  film time minus 3.0, so its frames are round 4's (difference 0.00 across
  the 18.5 and 23.0 joins). The dithered field keeps its continuous clock and
  so runs 1 to 3 s further along its drift after each hold.
- Narrator masters: `audio/master.sh` runs each take once through a 70 Hz
  high-pass, +5.7 dB and ffmpeg's lookahead limiter (ceiling -2.0 dBFS, 5 ms
  lookahead, 50 ms release, no auto level, latency compensated) into
  `audio/vo-N.wav` (48 kHz, 24-bit), which the composition plays. Same input,
  same bytes out. The original takes are kept untouched.
  Why not in the composition's voice bus: the HyperFrames limiter and
  compressor worklets are one-pole peak followers with no lookahead; measured
  on these takes the limiter overshot a -4 dB ceiling by 3.5 to 4 dB at word
  onsets, and the compressor raised the peak-to-loudness ratio (15.7 to 16.9
  dB). The renderer then enforces -1 dBTP on the delivered AAC by turning the
  whole track down (`enforceAacTruePeak`, to -1.5 dBTP), so any gain above
  that point is thrown away. The lab that found it is in the scratch folder
  (`round5/lab`, `round5/sim.py`).
- Bed: `audio/bed.mp3`, one generation (`el.mjs bed`, 28 s, influence 0.6),
  prompt in STORYBOARD.md. Heard back: no speech or singing (the only tag is
  "[gentle music]" / "[outro jingle]"). Spectrogram: energy at 100 to 800 Hz,
  partials to 2.2 kHz, faint regular note onsets above 3 kHz (the eighth-note
  arpeggio), no broadband hit. Loudness curve: its own 2.5 s swell in, a
  steady body (-18 to -23 LUFS momentary, LRA 2.7 LU), its own decay from
  25.0 s; the largest rise in 100 ms is 1.9 LU, inside the swell. It outlasts
  the film, so it is not looped; it enters 0.6 s into its file
  (`data-media-start`). Since revision 5b the film plays `audio/bed.wav`,
  the generation narrowed by `audio/master.sh` (see revision 5b).
- Mix (all in the composition, written by `audio/mix.py`): the five lines on
  one bus (`<hf-audio-group id="voiceover">`, unity fader), each with a 50 ms
  fade in and 150 ms fade out so no clip starts or stops on an edge; the bed
  with a volume lane (0.3 s fade in, +3.4 dB alone, 4.7 dB duck under the
  lines on 0.5 to 0.6 s ramps, down 1.95 to 9.45 and 11.45 to 24.55, 0.8 s
  fade out 25.65 to 26.45) and a hand
  carve, three peaking dips that follow the same envelope (315 Hz -4 dB,
  630 Hz -4 dB, 1.6 kHz -3 dB). The carve is hand-built because the skill's
  `carve.mjs` needs `@hyperframes/core` installed in the project, which this
  lane did not download; the dips sit where a third-octave comparison found
  this bed over the voice (250 to 500 Hz, 3.5 dB over the raw voice).
- Measured on the final MP4 (`ffmpeg -af ebur128=peak=true`, revision 5b):
  integrated -17.0 LUFS, true peak -1.3 dBTP, LRA 2.7 LU, no sample at full
  scale; video and AAC both 26.500 s. On the stems, rendered from the same
  markup in a blank lab composition: narrator -16.0 LUFS integrated (true
  peak -1.8 dBTP); bed -20.1 LUFS where it plays alone (10.05 to 10.9),
  -27.5 LUFS under the lines (7.4 dB down), -25.7 LUFS in the gap between L4
  and L5 (held down), -23.8 LUFS in the cold open (its own swell), -27.0 LUFS
  on the end card's tail. The program integrates 1.0 LU under the narrator
  because the bed-only passages count in its gating. The brief's three bed
  numbers cannot all hold (-20 alone less a 10 dB duck is -30, not -26): the
  bed sits at -20 alone and about 7.5 dB down under speech, between the two.
- No clicks: high-frequency energy in 5 ms windows at every clip start and
  end sits at or under its neighbourhood, except vo-2's end at 10.171, which
  measures the same in the bed-only render (a bed note, the voice is silent
  there).

### Credits ledger (ElevenLabs, round 5)

| call | what | characters / seconds |
| --- | --- | --- |
| line | vo-1 | 56 text (+57 context) |
| line | vo-2 | 57 text (+148 context) |
| line | vo-3 | 92 text (+116 context) |
| line | vo-4 | 59 text (+124 context) |
| line | vo-5 | 32 text (+59 context) |
| bed | bed.mp3 | 254 prompt, 28 s generated |
| hear | five takes, the bed, the final | 74.75 s of audio |
| hear | the revision 5b final | 26.5 s of audio |

Narration: 296 characters of text, one take each, no regeneration (the
context is the neighbouring lines passed as `previous_text`/`next_text`).
One bed of the two allowed. Revision 5b sent no text and generated no bed.

## Revision 5b (the critic's sound review)

- Major, the bed pumped between L4 and L5: the duck released 21.45 to 22.05
  and grabbed again 22.4 to 22.95, over a swell in the bed's own content, so
  the bed went from -30.6 to -17.0 LUFS momentary in 1.0 s, left-heavy, and
  fell into the 23.0 cut: a riser and an audible release-and-grab. Fixed in
  `audio/mix.py`: L3, L4 and L5 are one duck run (down 10.9 to 11.45, up
  24.55 to 25.15), with no lift on the cut. The gap now reads -25.7 LUFS
  integrated and peaks at -24.8 momentary (22.0), inside the bed's own range
  under the lines (it reaches -24.9 at 17.4 under L3); the 23.0 cut lands on
  a bed already down, and the bed rises again only after L5's last word.
- Minor, the bed's stereo image wandered (L/R correlation 0.14, per-second
  balance -7.9 to +12.8 dB): the generation's notes land hard left or hard
  right. Fixed with a deterministic pre-master in `audio/master.sh`: a mid/
  side matrix keeps the mid and 0.35 of the side (side -9.1 dB) into
  `audio/bed.wav`, which the composition now plays (`bed.mp3` is kept
  untouched). Measured on the bed stem: correlation 0.84, per-second balance
  -4.4 to +4.6 dB; in the final's voice-free windows +0.8 (cold open), +2.7
  (10.05 to 10.9), +4.8 (21.5 to 22.5, the old +12.8) and +2.7 dB (end
  card). Narrowing cost 1.9 dB in the bed alone, so `bed_db` rose from 1.0
  to 3.4 (the lift reads -20.1, round 5a -20.5). The narrator masters were
  rewritten by the same script and are byte-identical.
- Minor, the bed's character (warm pad, 100 to 800 Hz, 'on-hold music' in
  one tag): not changed. The critic's static fix (200 Hz high-pass, +2 dB
  shelf above 3 kHz) was conditional on a listen, and by measurement the
  shelf has nothing to lift: above 2.5 kHz the bed sits 58 to 76 dB under its
  own total in every third octave, so the bed could only be made thinner, not
  airier. The second allowed bed is the real fix if a listen calls it hold
  music; it was not spent without one.
- Minor, Charlie reads the short lines quickly (L1 3.0, L2 3.4, L4 3.1, L5
  3.4 words a second): kept. `el.mjs line` sends no speed setting (only
  stability and style), the kit is read only for films, and MOTION.md
  refuses speeding audio up or down, so a regenerated L5 would come back at
  the same pace for 32 more characters.
- Minor, L4 transcribes as "Doc sites": kept. Besides the 130 ms merged s,
  the take's own alignment gives "s", the space and "s" of "Docs sites" 116
  ms (0.302 to 0.418 s) before the vowel of "sites". It needs a listen; if
  "Docs" does not come through, regenerate L4 alone (59 characters) with the
  same `--prev`/`--next`.
- Picture: unchanged. The final's frames match revision 5a's final exactly
  (PSNR infinite over all 1590 frames), and the poster is byte-identical to
  round 4's.

## Revision 4 (Kevin's round 4 direction)

"the color we can use is the color and dither and shaders we used (gem smoke
from glyphfield). make headers no more than 2 lines large. feel free to use
logos. no need for captions/subheaders".

- Material, not accent: the film is blue gem smoke in two renders. 0.0 to
  15.5 the smoke is printed through the 8 by 8 Bayer screen in navy
  `#070d1b`, brand blue `#2f5ce0` and `#86a8ff` (the post cover's look: blue
  Bayer bands over a navy page); 15.5 to 23.5 it is the full-color smoke
  (white and `#86a8ff` on `#2f5ce0`) wrapped around the doubled-line GT mark
  as a glass shape.
- Headers: every heading is two lines, 108 px for the three ideas and 136 px
  for the title and the end card, all in one slot (left 160, top 112 to 118).
  The reading path keeps the post's own sentence at 108 px ("The page funnels
  users towards" / "what they want to achieve.").
- Removed: the byline and date, the stop chips (Orient ... Act), the Before and
  After tags, the counter, the address on the end card. Before and after are
  shown by the motion: the redline cuts, and the switcher's labels and the group
  heading rolling to the new page's words.
- Logos: the GT mark in the page's sidebar head (the iso page and the band, as
  figures A1, A4, B1 and B5 print it), the GitHub mark on the star pill (the
  page's actions row and the band's banner and pill), the GT mark in glass on
  the end card, the series frame's corner mark. The Fumadocs moon is not used:
  no heading in the film states the post's point about building on Fumadocs.
- Kept from round 3: the page assembling in reading order and coming apart into
  three plates; the reading path as a doubled line with one pulse; the redline
  close-up of B1's band at 2.3 times with every B1 element and B5/C4's After;
  the sidebar close-up with the hover pill and the thumb bending along the
  rail.
- New: the Act node lit in `#86a8ff` when the pulse landed (revision 4b lights the Get a Demo button instead); the switcher's
  labels move up one line ("General Translation" leaves, "Overview" becomes the
  first line, "Quickstarts" arrives); one smoke mount runs from the sidebar
  through the end card, with the mark waiting behind the panel, so the 20.0
  cut swaps the panel for the mark while the smoke runs on.

## Revision 4b (the critic's round 4 review)

- Major, the sidebar beat looked like a panel on a flat blue slide: the
  full-color smoke is now a wide stream (size 0.8, outer glow 0.8, outer
  distortion 1.0, angle 180, phase 21, rate 0.35) that runs in from the lower
  left, wraps the panel and spills past its edges. The phase was chosen by
  measurement: across 15.5 to 20.0 about 4 percent of the heading box shows
  any smoke before the envelope, against 25 percent of the open lower left
  quadrant (it was 6 percent). A static envelope plate (`#veil`, the smoke's
  own ground at 1 minus the envelope) keeps 8 percent of the smoke inside the
  heading slot (x under 1480, y under 390) and all of it 150 px beyond, so no
  wisp crosses the type.
- End card: the mark's inner glow is 0 behind the panel, so the 20.0 cut shows
  the mark as a blue silhouette cut out of the stream; the glow rises 20.0 to
  21.0 and the stream narrows and settles 20.0 to 22.0 (tween-driven uniforms
  set through the mount's `setUniformValues` before each frame).
- Reading path: Orient sits on the switcher's globe (inside the switcher);
  the thread ends on the Get a Demo button's lower edge and the button lights
  in `#86a8ff` when the pulse lands on 10.0; the fifth node is gone.
- Heading slot: the dithered field's envelope finishes on 2.0 (1.2 to 2.0),
  before the title rises, and its floor is 0 above y 350, so the slot is
  clean navy.
- Field crawl: the dithered smoke's clock eases from 0.35 to 0.18 over 2.0 to
  3.0 (`fieldClock`, the exact integral of a smoothstep rate), half the drift
  under the title and the reading holds.
- Redline: the search field's label and keycaps tone out 11.15 to 11.3
  before the frame narrows; the header rule takes a beat (mark 12.0 to 12.3,
  the rule leaves 12.5 to 13.0 on `expo.out`, mark off 12.85); the switcher
  and the group heading tone a leaving line out before its row mask can cut
  it and an arriving line in once it is whole (the group heading's mask is
  29 units tall and its new line rises 12 units).
- Kept: the periods on the three ideas. They are sentences quoted from the
  post and are set as sentences, as MOTION.md sets its own on-screen
  sentences ("Writing began as a record of trade.", "One pipeline. Every
  language ships with the deploy."); the title is a heading and has none.

## Sources (round 7)

- The post: the MDX source of Designing docs for humans, the post at generaltranslation.com/blog/designing-docs-for-humans.
  Every heading is a verbatim run of it in sentence case (SCRIPT.md's heading
  column gives each source sentence); "what’s" is set with the typographic
  apostrophe. Lines 2 to 7 of the narration are the post's own sentences
  (SCRIPT.md's audit); lines 1 and 8 are the script's connecting lines.
- The treatments' key frames: `concepts/blog-designing-docs/r7-idea/frames/`
  (f3 to f8, `lib.js`, `clutter.js`), `r7-viewer/f1.html` and `lib.js`, and
  `r7-people/f2.html`, `page.js`, `common.js`. The page model, the clutter
  list, the thumbnail page and the accordion layout are carried from them
  into `lib/film.js` and `index.html`; the glyph globe's field is copied from
  `stills/partnership-globe/dither-lib.js` (`globe()`).
- The post's cover (`kit/blog/designing-docs.webp`) is the palette's source.
  No blog image is placed in the film.
- Kit (unchanged): `tokens.css`, `gsap.min.js`, `dither.js` (the Bayer tile),
  `sheet.js` (the series frame; counter and corner mark removed at mount),
  `gemsmoke.js` (two mounts), `gem-shapes/gt-mark.png`, `audio/el.mjs`,
  `audio/voice.json`, `fonts/InterVariable.woff2` (the source of
  `lib/fonts/InterCanvas.woff2`).

## Credits (round 7)

No third-party picture appears. The material is Paper Shaders' gem smoke
(Apache-2.0, the kit's build) as Glyphfield renders it, and the kit's Bayer
dither. The narration (Patrick, an Australian ElevenLabs library voice) and
the music (the ElevenLabs Music API) are generated with ElevenLabs. No byline is on screen (Round 4); the post is
by Kevin Liu and Taylor Fang.

## For a later editor (round 6 build, archived)

- The film is timed by its narration. To change a take: generate it into
  `audio/`, run `bash audio/master.sh` (add its trim), then `python3
  audio/mix.py film`, which re-places the clips and rewrites the `VO` cue
  table, so every word-keyed move follows. Scene starts are `BEATS` in
  `mix.py` and the clip windows in `index.html`; change both.
- The field is printed by the film's own `printField` (a copy of
  `gem.dither`'s three-tone screen) so it can take a gamma (1.45) and a fixed
  tone envelope over the heading slot (`envRow`, 0 above y 350, full below
  y 640, switched on by `S.hz` 7.6 to 8.6). It changes only by tone.
- Field tone `S.fa`: 0.5 on frame 0, full by 1.2, to 0.5 over 17.0 to 18.0,
  held to the 30.5 cut so the pulse and the redline marks are the only
  `#86a8ff` things in focus.
- The smoke clocks: `FIELD_ARG` and `BLUE_ARG` map film time to round 4's
  clock through `pchip`; the blue act's knots are 30.5, 38.0, 44.5 to 15.5,
  20.0, 23.0 (searched, see Revision 6). Move a scene boundary and the map
  follows; recheck the heading boxes with a smoke-only lab render.
- The blue smoke's parameters (scale 0.8, offset 0.4046 / 0.139, size 0.8,
  outer glow 0.8, outer distortion 1.0, angle 180, phase 21, rate 0.35) put
  the mark at (1397, 690), inside the panel's footprint (x 1034 to 1760, y 420
  to 960). Move the panel or the mark and recheck.
- The full-color envelope is a static canvas (`#veil`), drawn once at a
  quarter resolution and upscaled smoothly; it covers both headings' glyphs.
- At most two gem mounts exist and only one is drawn per frame (the field
  before 30.5, the blue smoke after).
- The glass shape's PNG is also an `<img>` in the DOM so the renderer waits
  for it.
- The flat page sets `shape-rendering: crispEdges` once it is flat (18.0).
- The hidden "Introduction" word is `display: none` until the page is flat,
  so the contrast audit does not sample an invisible text node.
- Never write a literal `font-family: 'Inter'`: the compiler then fetches Inter
  from Google Fonts over the kit's self-hosted face. Use `var(--font)`. The
  series frame's counter (which names Inter in `kit/sheet.js`) is removed at
  mount. The final's render log has no "Google Fonts" line.
- The renderer turns the whole AAC track down to -1.5 dBTP whenever its true
  peak passes -1 dBTP, and its limiter worklet has no lookahead, so the
  narrator's peaks are held in `master.sh`. Measure a mix with a `--debug`
  render: the work dir's `audio.m4a` is the pre-guard mix.
- `check` passes with 0 errors and 16/16 contrast checks; the 13 warnings it
  keeps are structural advice (nested timed elements wanting
  sub-compositions, file length). The film stays in one file on purpose: the
  scenes share one state object and one render function.
