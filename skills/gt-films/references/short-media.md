# Short media

Detail for section 12 of `gt-films`. The rest of the skill covers the
HyperFrames films in `motion/`. These rules cover the shorter pieces around a
launch: promos, product demo videos and GIFs, README and launch GIFs,
captures of the shipped pages, and briefs for the video vendor. `gt-graphics`
covers the stop-motion UI clips inside blog posts.

## 1. Promos

- Open on a hook that shows the finished result, then cut quickly between
  many clips or shader scenes to music. A promo has no narration and runs
  under about 30 s.
- Favor faster edits that fit more clips over long holds, and give each cut
  a different scene (2026-08-19: "add 10 more cuts of DIFFERENT shaders").
- Cuts sit on the beat. The music is written or chosen to the cut list and
  smooths out at the end.
- Diegetic effects layer over a constant music bed and never duck it. Tune
  the sync to about 0.1 s.
- Place shaders so they never overlap the title.
- When Kevin dislikes a new cut, restore the previous cut exactly
  (2026-08-19).
- When the bed does not fit, render several alternatives of different
  kinds, calmer ones included.

## 2. Product demo videos and GIFs

- Start inside the product, with no intro slide.
- Set the key value proposition large and centered.
- Keep persistent elements (logos, the frame) on screen for the whole scene,
  and move them only between scenes.
- Hold the final frame about 1.5 s longer than the rest.

## 3. README and launch GIFs

- Use the real CLI with real flags and freshly run results, in a titled
  window frame.
- Color the text for the GIF only.
- End on a card with the claim and the compatible agents' logos in their
  theme-correct variants (`gt-brand`, Third-party material).
- Ship the render script, so Kevin can regenerate the GIF.
- Size it for legibility: about 960 by 540 at 20 fps, with the holds kept
  long enough to read.

## 4. Launch capture

Record the real shipped pages (2026-08-14: "update all the videos in these
artifacts with our actual pages").

1. Take CDP screencast frames at device pixels. The Playwright recorder
   drops quality.
2. Drive scrolling with a constant-velocity `requestAnimationFrame` glide,
   with holds.
3. Pre-seed the cookie consent, so no banner covers the page.
4. Assemble H.264 from the real frame timestamps, and time-compress a
   linear ride to the target length.
5. Give every clip a download button where it is shown (2026-08-10,
   2026-08-12).

## 5. Vendor briefs

A request for the video vendor goes out as a pasteable brief in Kevin's
voice (2026-09-30). It holds:

- the deliverables, and which one is the priority while Kevin is away;
- the demo URL;
- the brand rules from prototemplate.com/deck: ink on paper in both themes,
  Inter only;
- dummy data and visuals in place of any customer's brand until permission
  is confirmed.

Replies to the vendor follow `gt-voice` `references/messages.md` (a reply to
an outside partner).

## 6. Who directs

- Kevin directs media. Agents propose captures and refresh them across
  materials after visual changes. They do not produce whole media suites he
  has not asked for (2026-09-30).
- Finished media goes onto Prototemplate's `/brand` or `/motion` in the same
  round (2026-08-19: the open-source promo and banner were added "to
  prototemplate as media"). Section 11 of the skill gives the steps.

## Sources

- Kevin's messages: the open-source promo of 2026-08-18 and 2026-08-19
  (shader cuts, music aligned to the cuts, a reverted re-cut, then adding
  the promo and the banner to Prototemplate); the launch captures
  (2026-08-10, 2026-08-12, 2026-08-14); the vendor brief and who directs
  media (2026-09-30). Promo pacing and the demo-video rules also come from
  his edits on personal projects, used here for their method.
- Prototemplate: `public/media/README.md` (the open-source announcement
  reel and the X banner).
