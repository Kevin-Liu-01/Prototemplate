# Stop-motion UI capture

`agent-browser record start` recreates the browser context (the page
reloads and client state is lost) and, at 1440 by 900 with a device pixel
ratio of 4, keeps one or two frames per second. A 300ms thumb glide shows
as two frames. Stop-motion gives every frame you want, at full density.

## The loop

`graphics/build/capture-sidebar.sh` is the worked example (the docs
sidebar's rail thumb sliding row by row, then the pill following the
pointer back up). The shape:

1. Set the page up after any recorder would have started: theme, scroll
   position, expanded folders, the dev overlay hidden, the pointer parked.
   Take the resting still first; it is the poster and the composite base.
2. Block real pointer events inside the region you drive. Every
   screenshot re-dispatches trusted `pointerover` and `mouseover` on
   whatever the last real click landed on, which moves hover states while
   you are stepping. A capture-phase listener that calls
   `stopImmediatePropagation()` on `isTrusted` pointer and mouse events
   fixes it; drive hovers with synthetic `PointerEvent('pointerover')`
   dispatches instead.
3. Trigger the interaction from `eval` (`el.click()` or a dispatched
   event), flush styles (`void getComputedStyle(el).top`), then
   `document.getAnimations().forEach(a => a.pause())` and keep the list.
4. For t from 0 to 300 in steps of 25 (or 0 to 160 in 20 for a hover):
   set `a.currentTime = t` on every paused animation, re-pause any that
   started, screenshot. Then `a.finish()` and `a.play()` and wait for the
   navigation to commit before the next step.
5. Write a concat list with per-frame durations (about 1/36s per step, a
   0.5 to 0.7s hold on each landing, 0.9s at the start, 1.5s at the end)
   and assemble: `ffmpeg -f concat -safe 0 -i frames.txt -vsync vfr -c:v
   libx264 -crf 12 -pix_fmt yuv420p clip.mp4`.

## Compositing and the GIF

`graphics/build/composite-videos.sh` reads the crop's page rectangle from
the rendered visual (`data-rect` on the `.crop` element) and its on-stage
box, crops the recording to that rectangle at the recording's density,
scales it to the box and overlays it on the still. Output the MP4 at 30fps
and the GIF at 1600 wide, 24 to 30fps, `palettegen=max_colors=256:
stats_mode=diff` and `paletteuse=dither=sierra2_4a:diff_mode=rectangle`.
Nineteen seconds of sidebar came to under a megabyte because the
background never changes.

## Checks

- Tile frames before compositing (`ffmpeg ... select=... tile=8x1`) and
  look at the last frame of every step: the state that should persist
  must persist.
- Confirm the still and the first recorded frame match, or the composite
  will pop on loop.
