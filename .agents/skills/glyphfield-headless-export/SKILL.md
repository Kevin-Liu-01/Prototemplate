---
name: glyphfield-headless-export
description: Render glyphfield.com/studio Design Lab artboards headlessly at any width with agent-browser and window.glyphfield.studio, including the project injection, export width, base64 transfer past the CSP, and per-layer tweaks. Use to produce dither and shader backgrounds for graphics without clicking through the studio.
---

# Glyphfield headless export

Glyphfield (glyphfield.com, open source) renders in headless Chromium
through agent-browser; WebGL2 works. The scripts under `graphics/glyph/`
wrap the steps below: `gfboot.sh` opens the studio and injects the
project, `gfexport.sh <artboardId> <width> <out.png> [timeMs] [hideLabel]`
exports one artboard, `gfsurvey.sh` renders a shader and effect setting
sweep at several times.

## Steps

1. `agent-browser open https://glyphfield.com/studio`, then click the nav
   button with `find role button click --name "Design Lab"`. Calling
   `studio.activate('Design Lab')` does not work: `controls()` is scoped
   to the active tool.
2. Inject the `.glyphfield.json` project (3 MB through `eval --stdin` is
   fine): `window.__proj = <json>` then `await studio.applySource(window.__proj)`.
   `readSource()` can throw "Portable composition code is still being
   prepared" right after apply; retry with waits.
3. The export width is `metadata.designLab.exportSettings.width` in the
   source: read, set (3200 for a 1600-wide stage at 2x), `applySource`
   again. The dialog's Width and Height are the artboard size, not the
   export size.
4. `await studio.invoke('design.workspace.activate', { target: artboardId })`,
   wait about 2s, then `design.export({ format: 'png', download: false })`.
   Too soon and you get "Wait for the current capture or export before
   opening another design"; retry with a delay.
5. The page CSP blocks fetch to localhost, so pull the blob out as base64
   in 1.5 MB `eval` chunks and decode with Python. macOS `base64 -d`
   fails on the single long line.
6. Hide a layer with `studio.activate('Hide <layer name>')`. Per-layer
   opacity for the active artboard lives in
   `src.elements[id].data.opacity` and `.style.opacity`, not in the
   artboard snapshot. `design.frame.seek({ timeMs })` picks a shader
   frame.

## What the graphics use

The forty-two exports in `graphics/bg/user/` came from Kevin's project
(`graphics/glyph/load.js` holds the source); they are the palette every
visual draws from, one export per visual, kept as lossless webp. The
`bg/blue/` files are the blue duotone and light-ground variants made from
them for covers. A background is drawn at exactly 2x the stage with
smooth scaling and dimmed under article visuals (see the pipeline skill).
