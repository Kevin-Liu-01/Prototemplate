# The instruments library

The signature visuals of the GT identity live as components and engines. Prototemplate is the registry: `$PROTOTEMPLATE/src/app/craft/libraries.ts` holds each entry's body, live plate and API snippet (rendered on `/craft`), and `$PROTOTEMPLATE/docs/LIBRARIES.md` is the index. The landing in gt-cloud carries the production copies. When a page needs one of these behaviors, mount the component; page code never re-implements one (ARCHITECTURE.md, "Componentized instruments").

## Where each one lives

| instrument | Prototemplate | gt-cloud | interface |
| --- | --- | --- | --- |
| dither | `src/lib/dither.ts` | `packages/ui/src/lib/dither.ts` (shared by the landing and the dashboard) | `createDitherLoop(canvas, field, opts)` returns `render`, `start`, `stop`, `running`, `setField`, `setOptions`, `destroy`. Fields are `fn(u, v, t)` returning 0 to 1; factories `radialBurst`, `globe`, `streakBands`, `gradientRamp`, `makeGlyphField`; combinators `multiplyFields`, `maxFields`, `mixFields`, `mapField`. One device pixel per cell, upscaled by CSS with `image-rendering: pixelated`; capped at 30fps. |
| picture field | `src/components/plate/lib/picture-field.ts` (plate port) | `packages/ui/src/lib/picture-field.ts` | `loadPictureTone`, `pictureField`: a grayscale picture as a tone grid for the dither loop. The pictures follow `docs/ARTIFACT-PICTURES.md`. |
| studio field | `src/lib/studio-field.ts`, wrapper `src/components/shared/StudioField.tsx` | `apps/landing/src/lib/studio-field.ts`, mounted by `components/landing/shared/HeroField.tsx` with preset `bayer8` | `createStudioField(canvas, opts)` returns `setParams`, `pause`, `resume`, `renderStatic`, `destroy`. The `BAYER_PRESETS` roster has ten variants; `BAYER_DEFAULT_ID` is `'02'` (bayer 8x8). One session-wide GL context; switching presets is a remount (`key` the component). |
| glyph field | `src/lib/glyph-field.ts` | `packages/ui/src/lib/glyph-field.ts`, mounted by `components/landing/shared/GlyphRain.tsx` | `createGlyphField({ canvas, drift, copy, glyphScale, displayFamily, monoFamily, onScript, copyBottom })` returns `{ destroy }` or null. 1,280 glyphs in one typed-array pool, a frame-time governor that only steps quality down. Read the families off the host with `getComputedStyle` so canvas type matches the page. |
| ink field | `src/app/d/glyph-rain/sections/band/inkField.ts` | `components/landing/glyph-rain/sections/band/inkField.ts`, `shared/InkField.tsx` | `createInkField({ canvas, clearEl, clearing, interactive, displayFamily })`; glyphs rise in the margins around a measured content box. |
| horizon field | `src/lib/horizon-field.ts` | `apps/landing/src/lib/horizon-field.ts` | `createHorizonField(canvas, opts)` returns `setParams`, `pause`, `resume`, `renderStatic`, `setEffectMode`, `previewPulse`, `previewRelease`, `destroy`. Draws nothing until `setParams` gives it a center and a radius. |
| prismatic field | `src/components/shared/PrismaticField.tsx` over `src/lib/prismatic-field.ts` | `apps/landing/src/lib/prismatic-field.ts` | Presets `'1'` and `'2'`; `exposureScale` dims it under content. |
| iso kit | `src/app/d/toolchain/diagrams/iso.ts` | `components/landing/shared/iso.ts` | `project(x, y, z)`, `IsoBox` faces (`topFace`, `leftFace`, `rightFace`, `silhouette`, `frontEdge`), `roundedPolygon`, `IsoPrism` (`prismFaces`, `prismSilhouette`, `prismFrontEdges`), `plane(z, ox, oy)`, `markPath()`, `ISO_RADIUS = 2.4`. The drawing law is DESIGN.md section 6 and the gt-isometric skill. |
| DitheredMark | `src/app/d/toolchain/diagrams/DitheredMark.tsx` | `components/landing/shared/DitheredMark.tsx`, `DitheredLedgerMark.tsx` | A masked brand mark with a 4x4 Bayer specular band; `shineTravel()` gives the driver its tween endpoints; windows are pre-rotated 60 degree geometry swept by translate. |
| DoubledLine | `src/components/shared/diagrams/DoubledLine.tsx` | no component; the landing draws the thread inline in its section SVG and CSS (`sections/shared/bento-motion.css`, the context and developer bands) | Props `d` (the one center path), `core` (required: the surface color that carves, matching the ground), `gauge`, `gap`, `ink`, `inkB` with `splitD` for two-tone, and `children` as the pulse slot between threads and core. The gt-diagrams skill owns the grammar. |
| EdgeGlobe | `src/app/d/toolchain/diagrams/EdgeGlobe.tsx` | `components/landing/sections/global/EdgeGlobe.tsx` with `GlobeAtmosphere.tsx` | Props `title`, `className`, `strokeWidth`, `accent`. Ink-only orthographic sphere, five points of presence, one accent route. |
| LocaleTag | `src/app/d/toolchain/components/LocaleTag.tsx` | `components/landing/shared/LocaleTag.tsx` | Props `code`, `className`. Flag first, then the code; the host supplies the box. gt-cloud draws the flag with `LocaleFlag`. Prototemplate has no `LocaleFlag`: its `LocaleTag` keeps a `LOCALE_FLAGS` map from language code to country code (`en` to `us`, `ja` to `jp`), lets an explicit region win (`en-GB` to `gb`), and writes the flag-icons sprite span (`fi fi-<country>`) itself. An unknown code renders without a flag. |
| RevealSeam | `src/app/d/toolchain/sections/RevealSeam.tsx` | `components/landing/home/sections/RevealSeam.tsx` | Props `boxRef`, `ariaLabel`, `defaultCut`, `onInteract`, `onCutChange`. Writes `--seam-cut` on the host; the top layer clips to it; drags cause no React renders; full slider role with arrow keys. DESIGN.md section 10. |
| EverySentence | `src/components/shared/EverySentence.tsx` | inline in `components/landing/home/sections/HomeHero.tsx` (`HERO_HOPS = 1`) | Props `words`, `initial`, `hops` (1 to 5, default 2), `armDelay`, and a ref whose `setLocale(loc)` is the only input. The host owns the one clock; the component runs no timer. DESIGN.md section 8. |
| TranslateWindow | `src/app/d/_v0/TranslateWindow.tsx` | `components/landing/home/sections/TranslateWindow.tsx` | The hero's windowed demo and the locale belt; `onLocaleChange` passes the active locale to a host. |
| FullStack | `src/app/d/_v0/sections/FullStack.tsx` | `components/landing/sections/fullstack/FullStack.tsx`, `StackTower.tsx` | The scroll-scrubbed stack story; beats lock as their copy centre takes the 55% read line (DESIGN.md section 14). |

Also in the Prototemplate roster: the locale belt, the nameplate take (`src/app/PrototemplateHero.tsx`), the site compare rig (`src/app/SiteCompare.tsx`), the gallery shooter (`scripts/gallery-shoot.mjs`), the mobile type ladder (`src/app/d/toolchain/styles.css`, the last 720px block), the pre-boot scripts in `src/app/layout.tsx`, and the four colors in `src/app/globals.css`.

## The lifecycle contract

Every mounted canvas or GL instrument (DESIGN.md section 11, docs/LIBRARIES.md):

1. Mounts lazily behind an IntersectionObserver.
2. Pauses itself offscreen and on a hidden tab.
3. Draws exactly one still under `prefers-reduced-motion` and schedules no loop.
4. `destroy()` releases everything the instance owns. Shared GL contexts stay for the session by design.
5. Re-resolves its ink when the theme flips.

A `create*` function returns null when the device cannot run it, so the host guards: `return () => field?.destroy()`.

## Mounting from React

- gt-cloud's landing mounts engines through `useGSAP` from `@gsap/react` and returns `destroy()` as the cleanup (`HeroField.tsx`, `GlyphRain.tsx`). The dashboard mounts through `useMountEffect`.
- Prototemplate mounts through `src/lib/use-mount-effect.ts` or `useGSAP`.
- A preset switch is a remount: put the preset id in the component's `key`.
- Read fonts and ink from computed styles at mount (`getComputedStyle(host).fontFamily`, a `--tc-mono` or `--pt-mono` property), so the canvas follows the page's type and theme.

## Changing an engine

When an engine gains an option or changes behavior, the same round updates its `/craft` entry in `src/app/craft/libraries.ts` (body and snippet) and its row in `docs/LIBRARIES.md`. When the change belongs in production too, port it to the gt-cloud copy in its own PR. `packages/ui/src/lib/dither.ts` and `picture-field.ts` have tests; extend them with the change.

## Sources

- Prototemplate: docs/LIBRARIES.md; ARCHITECTURE.md ("Componentized instruments"); src/app/craft/libraries.ts; DESIGN.md sections 5 to 11 and 14; src/lib/dither.ts, studio-field.ts, glyph-field.ts, horizon-field.ts, prismatic-field.ts; src/components/shared/diagrams/DoubledLine.tsx; src/components/shared/EverySentence.tsx; src/app/d/toolchain/components/LocaleTag.tsx; src/app/d/toolchain/sections/RevealSeam.tsx.
- gt-cloud: packages/ui/src/lib/dither.ts, glyph-field.ts, picture-field.ts; apps/landing/src/lib/studio-field.ts, horizon-field.ts, prismatic-field.ts; apps/landing/src/components/landing/shared/*.tsx; apps/landing/src/components/landing/home/sections/HomeHero.tsx; apps/dashboard/src/components/brand/FieldStack.tsx.
