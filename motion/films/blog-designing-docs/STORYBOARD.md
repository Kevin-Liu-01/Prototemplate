# blog-designing-docs: storyboard

Film: the trailer for "Designing docs for humans" (Kevin Liu and Taylor Fang,
September 17, 2026). 1920 x 1080, 24.0 s, 60 fps, silent, dark first, accent
`#86a8ff`.

One hero object carries the film: the docs Introduction page rebuilt as a
wireframe in the brand's four colors (sidebar, actions row, content column,
quickstart cards, contents rail), its zones taken from the post's figures A1,
A2 and A3. The film takes it apart the way the post does: the layers (cold
open), the reading path (idea one, figure A4), the redline pass (idea two,
figures B1 and B5), then one detail at full size, the sidebar thumb (idea
three, figures E6 and the sidebar-mask recording).

Grid: 0.5 s beats. Copy column x 160 to 720; the page sits in the right column
(x 776 to 1776 flat, one page unit per pixel). One dither grid of 3 px cells,
ink a dim titanium (`#2f3134`) so the field stays under the hairlines. The
accent is spent on one thing at a time: the pulse (idea one), the current
redline mark (idea two), the thumb (idea three). Never on the cold open, the
title or the end card.

Copy rises from its own baseline mask: 0.4 s, `power3.out`, 40 ms between
lines. Reading holds (words / 3 + 1 s after the last line lands):

| copy | lands | holds | needs |
| --- | --- | --- | --- |
| title and byline | 3.02 | 3.98 | 4.00 |
| idea one | 7.48 | 4.52 | 4.33 |
| idea two | 12.44 | 4.06 | 3.67 |
| idea three | 16.98 | 4.02 | 4.00 |
| end title | 21.44 | 2.56 | 2.33 |

Counter in the series frame: 01 / 05 to 05 / 05, switching on the scene cuts.

## Beat 0: cold open, the page comes apart (0.0 to 2.5)

- 0.0 to 0.6: the series frame's four rails draw out of their crosses, each
  from its own cross (`expo.out`). Frame 0 shows the four crosses. The GT mark
  and the counter fade in 0.1 to 0.5.
- 0.1 to 0.35: the page plate arrives (its surface and rim).
- 0.25 to 1.4: the page sets itself in reading order, 16 groups 45 ms apart:
  seams draw from their owners, text bars grow from their left edge as lines
  being set, italic lines lean 12 degrees, boxes arrive (`expo.out`).
- 0.4 to 1.6: a dithered field of soft diagonal bands (the grounds of the
  post's figures) rises from tone 0 in the right half, after the plate is
  opaque, so nothing ever veils the dither.
- 1.0 to 2.0: the page lies down into the 30 degree axonometric of DESIGN.md
  section 6 (rotation to 45 degrees and a squash to tan 30, `power2.inOut`).
  Faces: top 4, left 9, right 15 percent.
- 1.5 to 2.7: the navigation plate lifts off its footprint; 1.65 to 2.85 the
  actions and contents plate lifts higher (`expo.out`). Dashed drop lines run
  from each lifted plate to a dashed ghost of its footprint on the page.
- Copy: none.
- Out: continuous. From 2.0 to 3.0 the stack glides right and scales down
  (`power2.inOut`) to make room for the title.

## Beat 1: title card (2.0 to 7.0, copy from 2.5)

- 2.5 to 3.0: the four lines rise (`power3.out`, 40 ms apart).
- Copy, word for word:
  - "Designing docs for humans" (88 px, two lines: "Designing docs" /
    "for humans")
  - "Kevin Liu and Taylor Fang" (31 px, body ink)
  - "September 17, 2026" (31 px, titanium, tabular figures)
- Hold: 3.0 to 7.0. The field drifts under 1 percent a second.
- Out: hard cut of the copy on 7.0; the page continues.

## Beat 2: idea one, the reading path (7.0 to 12.0)

- 7.0 to 7.5: the sentence rises.
- 7.0 to 7.8: the plates descend; 7.0 to 8.0 the page stands back up flat in
  the right column (`power2.inOut`); the field lowers to tone 0 (it leaves in
  Bayer order); 7.5 to 8.0 the page mutes to 40 percent.
- 8.0 to 10.0: the reading path, a doubled line (one path stroked twice: a
  6 px stroke under a 2 px core in the page surface color, two 2 px threads),
  draws stop to stop, one segment a beat (`power3.out`): Orient (the section
  switcher) 8.0, Navigate (the active item) 8.5, Read (the title) 9.0, Choose
  (the first quickstart card) 9.5, Act (Get a Demo) 10.0. A square node and a
  label chip land at each stop as the segment reaches it.
- 10.0 to 11.0: one accent pulse travels the thread (a 200 px sub-path
  rewritten per frame, `none`) and ends in the Act node.
- Copy: "The page funnels users towards what they want to achieve." (53 px,
  three lines). Stop labels, the post's own figure labels: "Orient",
  "Navigate", "Read", "Choose", "Act".
- Out: hard cut on 12.0.

## Beat 3: idea two, the redline pass (12.0 to 16.5)

- 12.0: hard cut to the old page, unmuted: the search field in the header,
  the GitHub banner under the sidebar head, the sidebar collapse toggle, the
  header rule. The tree sits 34 px lower under the banner.
- 12.0 to 12.5: the sentence rises.
- A redline mark (a 3 px accent box) draws around one element on the beat,
  holds on it while it is still, rides it to where the post says it went,
  and lifts off as it lands, before the next mark draws:
  - 12.5: the search field. 12.85 to 13.3 it folds into the search icon in
    the actions row (`power2.inOut`). 13.2 the theme icon of the new row
    arrives beside it (figure B5's new row).
  - 13.5: the GitHub banner. 13.85 to 14.3 it folds into the star pill in the
    actions row; the tree slides up into the space it left.
  - 14.5: the sidebar toggle. 14.75 to 15.0 it shrinks to nothing.
  - 15.0: the header rule. 15.25 to 15.65 it retracts into the sidebar seam
    that owns the junction.
- Copy: "Our first job is to cut mental clutter." (53 px, two lines)
- Hold: the clean page holds from 15.65.
- Out: hard cut on 16.5.

## Beat 4: idea three, the sidebar thumb (16.5 to 21.0)

- 16.5: hard cut onto the React reference sidebar, set in full on the cut
  frame at real size (20 px rows): the React section switcher, Reference,
  Configuration, Components with its twelve children, Hooks, Functions,
  Types; the sidebar's right edge as a seam.
- 16.5 to 17.0: the sentence rises.
- 17.0: the accent thumb grows on the rail at Configuration (`power3.out`).
  It then steps row by row on the beats (each move 0.35 s, `power2.inOut`):
  Components 18.0, `<GTProvider>` 18.5 (it bends inward with the rail where
  the tree nests), `<T>` 19.0, `<Var>` 19.5, `<Num>` 20.0, `<Currency>` 20.5.
  The hover row and the row's ink follow it.
- Copy: "Docs sites are still webpages that shouldn’t feel lifeless." (53 px,
  three lines, the post's sentence).
- Out: hard cut on 21.0.

## Beat 5: end card (21.0 to 24.0)

- 21.0: hard cut onto the doubled-line GT mark, present on the cut frame.
- 21.0 to 21.45: the title and the address rise.
- 21.0 to 22.0: the dithered field returns from tone 0, low in the frame.
- Copy:
  - "Designing docs for humans" (53 px)
  - "generaltranslation.com/blog/designing-docs-for-humans" (26 px, titanium)
- Hold: 21.45 to 24.0, clean.
