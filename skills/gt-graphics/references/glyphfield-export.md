# Exporting glyphfield grounds headlessly

The grounds under GT graphics are artboards from Kevin's glyphfield project, rendered by the Glyphfield studio (glyphfield.com/studio, source at github.com/Kevin-Liu-01/Glyphfield) in headless Chromium through agent-browser. WebGL2 works there. Paths are relative to `$PROTOTEMPLATE`.

## The scripts

| Script | What it does |
| --- | --- |
| `graphics/glyph/gfboot.sh` | opens the studio at 1600 by 1000, clicks the Design Lab button, injects the project from `graphics/glyph/load.js` (`window.__proj`, about 3 MB), applies it with a small export width of 640, activates the artboard `artboard-4d2e3a5a-…` and prints its layer kinds |
| `graphics/glyph/gfexport.sh <artboardId> <exportWidth> <out.png> [timeMs] [hideLabel]` | activates one artboard, sets the export width, optionally seeks the shader clock and hides a layer (`hideLabel` is the control's full label, such as `Hide <layer name>`), exports a PNG and writes it to disk |
| `graphics/glyph/gfsurvey.sh <outdir> <exportWidth> '<shaderSettings>' '<effectSettings>' <shaderSize> <shaderOpacity> <effectOpacity> t1 t2 ...` | applies shader and effect settings to every layer of their kind and exports one frame per time, for comparing a setting sweep |

All three use the agent-browser session `glyph`. Run `gfboot.sh` once, then `gfexport.sh` per ground. The project holds six artboards, listed with their ids and names under `metadata.designLab.workspace.artboards` in `load.js`, and its saved export width is 1920. The grounds in `bg/user/` are 1920 by 1080, so a new ground is exported at width 1920, converted to lossless webp and added to `BG` in `gen-lib.js`.

## The steps the scripts wrap

1. Open the studio and click the nav button with `agent-browser find role button click --name "Design Lab"`. Calling `studio.activate('Design Lab')` does not work, because `controls()` is scoped to the active tool.
2. Inject the project through `eval --stdin` (`window.__proj = <json>`), then `await studio.applySource(window.__proj)`. Right after an apply, `readSource()` can throw "Portable composition code is still being prepared"; retry with waits of about 700ms.
3. The export width is `metadata.designLab.exportSettings.width` in the source document. Read the source, set the width, and apply it again. The dialog's Width and Height are the artboard size and do not change the export size.
4. `await studio.invoke('design.workspace.activate', { target: artboardId })`, wait about two seconds, then `await studio.invoke('design.export', { format: 'png', download: false })`. An export started too soon fails with "Wait for the current capture or export before opening another design"; retry after a delay.
5. The page's content security policy blocks `fetch` to localhost, so the PNG leaves the page as base64: `gfexport.sh` stores it in `window.__b64`, reads it back in 1.5 MB `eval` slices and decodes it with Python. macOS `base64 -d` fails on the single long line.
6. Hide a layer with `studio.activate('Hide <layer name>')`. Per-layer opacity for the active artboard lives in `src.elements[id].data.opacity` and `.style.opacity`; the artboard snapshot does not carry it. `studio.invoke('design.frame.seek', { timeMs })` picks a shader frame.

## The studio automation API

`window.glyphfield.studio` acts on the active tool, so rediscover after switching tools:

- `describe()` lists the active tool's actions and source capabilities.
- `controls()` lists controls by label; `activate(label)` and `set(label, value)` operate them.
- `readSource()` returns the source document; `await applySource(document)` applies an edited one. Preserve the fields you did not change.
- `invoke(action, input)` runs an action that `describe()` lists. Read the action's input contract before calling it, because export names and options change between studio versions.
- `download(artifact)` saves an export artifact (a `Blob` and a `fileName`). A Blob does not cross a JSON-only automation boundary, which is why the scripts use base64.

Studio state is local to the browser. Explore in a separate project so an existing composition survives. Design Lab exports freeze the render clock, wait for each provider and composite every layer; a screenshot of the editor includes the editor chrome and only counts as a preview.

## What the graphics use

- `public/graphics/bg/user/u10.webp` to `u59.webp`: forty-two exports at 1920 by 1080 from Kevin's project, lossless webp identical to the PNG originals. They are the palette every article visual draws from, one export per visual.
- `public/graphics/bg/blue/`: blue duotone variants (`u16-A`, `u25-A` and their B and C cuts) and the light-ground `u25-light`, which carry the covers.
- `graphics/bg` links to `public/graphics/bg`, so the generator and `/graphics` read one set.
- The stage draws a ground at twice its height with the aspect kept and `image-rendering: pixelated`, so each dither dot stays a crisp square and a 1200 by 630 card is never stretched. Article visuals dim it with a 0.64 wash. Covers keep a light wash of 0.1 to 0.3.

## Live dither on a page

A ground for a still image comes from the studio export. A live, responsive dither or shader on a GT page is a different job: gt-cloud's landing renders its own Bayer-family field in `apps/landing/src/lib/studio-field.ts`, adapted from Glyphfield's `glyphfield-dither-gradient` material (a moving wave distorted by layered noise, a repeating 4x4 Bayer threshold and three palette colours, where `grain` sets the screen-space cell size). That work follows gt-cloud's `.agents/skills/glyphfield` and gt-dither.

## Sources

- Prototemplate: `.agents/skills/glyphfield-headless-export/SKILL.md` (2026-09-18), absorbed here; `graphics/glyph/gfboot.sh`, `gfexport.sh`, `gfsurvey.sh`; `graphics/build/gen-lib.js` (`BG`, `CSS`); `graphics/build/gen-visuals.js` (`ASSIGN`, `BG_WASH`); `docs/GRAPHICS.md`, Backgrounds.
- gt-cloud: `.agents/skills/glyphfield/SKILL.md` and `references/source-map.md` (Studio and exports, Existing GT dither example).
- The older skill text said grounds were scaled smoothly. The code draws them pixelated (`gen-lib.js`, `.stage`), and this reference follows the code.
