# Stop-motion clips of UI interactions

A clip shows a CSS transition in the live product, such as the docs sidebar's thumb sliding along its rail or the contents marker following the scroll. Paths are relative to `$PROTOTEMPLATE`.

## Why stop-motion

`agent-browser record start` recreates the browser context, so the page reloads and client state is lost. At 1440 by 900 and a device pixel ratio of 4 it also keeps only one or two frames per second, and a 300ms thumb glide shows as two frames. Stop-motion captures every frame you want at full density.

## The loop

`graphics/build/capture-sidebar.sh` is the worked example: the React reference sidebar, hovering down the rows, clicking several components, expanding Hooks and hovering back up. It reads `DOCS_URL` (default `http://localhost:3001`) and writes frames and a concat list to `graphics/rec/stopmo2/`.

1. Set the page up after any recorder would have started: viewport 1440 by 900 at 4x, the folders expanded, the scroll position set, the dev overlay hidden, the pointer parked at 900, 820. Take the resting still first. It is the poster, the first frame and the composite base.
2. Block real pointer events inside the region you drive. Every screenshot re-dispatches trusted `pointerover` and `mouseover` events on whatever the last real click landed on, which moves hover states while you step. A capture-phase listener on the region that calls `stopImmediatePropagation()` for events with `isTrusted` fixes it. Drive hovers with synthetic `new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })` dispatches.
3. Trigger the interaction from `eval` (`el.click()` or a dispatched event), flush styles on the element that moves (the script reads `void getComputedStyle(thumb).top` on the rail thumb), then pause every running animation from `document.getAnimations()` and keep the list.
4. Step and shoot. The script steps a hover from 0 to 160ms in 20ms steps at 0.025 s per frame with a 0.36 s hold on the last frame, and a click from 0 to 300ms in 25ms steps at 0.028 s per frame with a 0.7 s hold. Set `currentTime` on every paused animation, re-pause any that started, then screenshot. After the last step call `finish()` and `play()` and let the navigation commit before the next interaction.
5. The first frame holds 0.9 s. The script ends on a 1.6 s hold after the pointer leaves, so the final state is visible before the loop restarts, and repeats the last file without a duration, as ffmpeg's concat demuxer needs for the last duration to count.
6. Assemble the concat list: `ffmpeg -f concat -safe 0 -i frames.txt -fps_mode vfr -c:v libx264 -crf 12 -pix_fmt yuv420p clip.mp4`. ffmpeg 8 deprecates the older `-vsync vfr` spelling and still accepts it with a warning.

## Compositing and the GIF

`graphics/build/composite-videos.sh` lays each recording over its visual's still. It opens the visual at 1600 by 900, reads the first `.crop` element's page rectangle (`data-rect`) and its on-stage box after the zoom, scales both to the 3840 export (2.4 device px per stage px), crops the recording at its own density and overlays it. It writes:

- an MP4 master at 30fps, `libx264 -crf 18`, `+faststart`;
- a GIF scaled to 1400 wide with Lanczos at 24 or 30fps, `palettegen=max_colors=256:stats_mode=diff` and `paletteuse=dither=sierra2_4a:diff_mode=rectangle`.

The script is wired to the docs set's two clips (`E1-hover-mask` from `graphics/rec/toc4.webm` and `E6-sidebar-mask` from `graphics/rec/react-stopmo2.mp4`). A new clip adds its own `build(...)` line. `export-blog.py` copies the GIFs into `public/static/blogs` under the names in its `VIDEOS` map, and the MP4 masters stay in `graphics/build/out/`. The shipped sidebar clip (`designing-docs-sidebar-mask.gif`) is 1400 by 788 with 459 frames in 644 KB, because the background never changes and rectangle diffing stores only the moving region.

A visual that carries a clip is added with `{ animated: true }`, so `/graphics` shows its still, GIF and video together.

## Checks

- Tile the frames before compositing (`ffmpeg ... -vf "select=...,tile=8x1"`) and look at the last frame of every step. A state that should persist must persist.
- Confirm the still and the first recorded frame match, or the composite pops on every loop.
- Read the GIF at its embed size in the post, with the page serving it untouched by the image optimizer.

## Sources

- Prototemplate: `.agents/skills/stop-motion-ui-capture/SKILL.md` (2026-09-18), absorbed here; `graphics/build/capture-sidebar.sh`; `graphics/build/composite-videos.sh`; `graphics/build/export-blog.py` (`VIDEOS`); `docs/GRAPHICS.md`, Clips.
- The older skill text gave the GIF width as 1600. `composite-videos.sh` scales to 1400, the column's 2x width, and this reference follows the script.
