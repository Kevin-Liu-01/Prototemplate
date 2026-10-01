# blog-designing-docs: notes

The trailer for "Designing docs for humans" by Kevin Liu and Taylor Fang,
published September 17, 2026 at
generaltranslation.com/blog/designing-docs-for-humans.

- Duration: 24.0 s. 1920 x 1080, 60 fps, silent.
- Renders: `out/blog-designing-docs.mp4` (delivery), `out/blog-designing-docs.png`
  (poster, the title card at 4.0 s), `out/_sheets/blog-designing-docs.png`
  (contact sheet of the final, one frame a second).
- Composition: `index.html`, one standalone file with one paused GSAP timeline
  (`window.__timelines.main`). Every visual is a pure function of the
  timeline's state object `S`; `render()` runs from the timeline's `onUpdate`.
- Beats, copy and timing: `STORYBOARD.md`.

## What the film is

The post takes the docs Introduction page apart. The film rebuilds that page
as one wireframe object in SVG and takes it apart in motion:

1. Cold open: the page sets itself in reading order, lies down into the 30
   degree axonometric and comes apart into three plates (page and content,
   navigation, actions and contents), after the post's exploded-layers figure.
2. Title card with the exploded stack.
3. The reading path (the post's figure A4: Orient, Navigate, Read, Choose,
   Act) as a doubled line with one accent pulse.
4. The redline pass (figures B1 and B5): the search field folds into the
   search icon, the GitHub banner into the star pill, the collapse toggle goes
   to nothing, the header rule retracts.
5. The React reference sidebar at real size with the blue thumb stepping row
   by row along the rail and bending where the tree nests (figure E6 and the
   sidebar-mask recording).
6. End card: the GT mark, the title, the post's address.

## Sources

- The post: `/Users/kevinliu/gt/gt-cloud-wt-icons/apps/landing/content/blog/en-US/designing-docs-for-humans.mdx`.
  The three sentences: "The page funnels users towards what they want to
  achieve." (paraphrase of "the page supports an intuitive flow, funneling
  users towards what they want to achieve"); "Our first job is to cut mental
  clutter." (the post's "So our first job is to cut mental clutter.");
  "Docs sites are still webpages that shouldn’t feel lifeless." (quoted, with
  a typographic apostrophe).
- The post's figures in `kit/blog/designing-docs-*` were read as references
  for the rebuild (A1, A2, A3, A4, B1, B2, B5, C4, C6, E6, the sidebar-mask
  and toc-slide recordings). No blog image is placed in the film: every
  figure the film shows is rebuilt, because each one moves.
- Sidebar rows in beat 4 are the React reference sidebar exactly as the post's
  figure E6 lists them.
- Kit: `tokens.css`, `gsap.min.js`, `dither.js` (one 3 px grid; the field is
  an analytic band field, `fillField`), `sheet.js` (the series frame; its
  label ink is raised to 0.52 alpha so the counter clears WCAG AA).

## Credits

No third-party picture appears, so no credit line is needed. The post's
authors are credited on the title card.

## For a later editor

- The accent `#86a8ff` appears only on: the pulse (10.0 to 11.0), one redline
  mark at a time (12.5 to 15.65), the thumb (17.0 to 21.0).
- The redline marks are in the film's one accent, where the post's figures
  use red for deletions and blue for replacements; MOTION.md allows one accent
  per film.
- The page clip ends at 16.5 and the sidebar clip starts there; both cuts
  after it (16.5, 21.0) land on a scene that is already set on the cut frame.
- `check` passes with 0 errors. The 9 warnings it keeps are structural advice
  (file length, track density, nested timed elements wanting
  sub-compositions); the film is kept in one file on purpose, since every
  beat drives the same page object.
- The kit had what this film needed; nothing was added outside this folder.
