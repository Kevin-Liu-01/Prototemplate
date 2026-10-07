---
name: gt-performance
description: >-
  How General Translation keeps visual surfaces fast with no change to how
  they look: measure first with the machine's load recorded, 60 fps motion
  and no lag on first use, quality tiers driven by measured frame time, one
  WebGL context per engine and full cleanup on unmount, frozen previews in
  galleries, shader and module weight cut with a pixel-identity proof while
  the library API stays, Lighthouse on production builds, live values
  hydrated on static pages, and budgets that exit 1 on a breach. Use when a
  page or animation lags, before shipping a shader, canvas or heavy
  component, and when Kevin asks for Lighthouse or performance work.
metadata:
  title: Performance without visual loss
  areas: website, landing, motion
  updated: 2026-10-06
  origin: prototemplate
---

# Performance without visual loss

General Translation (GT) runs live canvas and WebGL material (the dither
globe, the glyph field, the studio field, the horizon shader) on
generaltranslation.com, on the dashboard and in Prototemplate, and those
pages must also load fast. This skill is the procedure for making any such
surface fast without changing a pixel: the rule, measurement, quality
tiers, engine lifecycles, shrinking code, Lighthouse, live values on static
pages and budgets. Page specifics stay with their skills. gt-website
`references/docs.md` ("Performance") holds the docs investigation and the
Lighthouse commands for generaltranslation.com. gt-motion section 6 and
DESIGN.md section 11 hold the engine contract, gt-dither holds the engines
and their copies, and gt-cloud's `react-best-practices` covers React
rendering.

Paths are relative to a Prototemplate checkout ($PROTOTEMPLATE) unless
marked gt-cloud ($GT_CLOUD, GT's product monorepo, origin/main on
2026-10-05). A direction is one of the design-exploration pages under
Prototemplate's `/d/<slug>`. The two scripts in this folder's `scripts/`
run from a checkout that has playwright-core (Prototemplate does) and find
Chrome for Testing the way gt-aesthetic's `measure-type.mjs` does.

## 1. The rule

- **Performance is part of done, and it never changes the look.** Kevin,
  2026-08-05: "fix the lighthouse without changing anything aesthetically".
  Fix every audit and every hitch whose fix leaves the pixels alone. List
  each one whose fix would change the design (color contrast, tap target
  size, a dropped effect, a lower resolution) with its measured gain, and
  Kevin decides.
- On 2026-08-05 these fixes on the site redesign's prototype (now
  Prototemplate) left every pixel identical:
  - a `<dl>` whose cells held buttons became divs, with the CSS re-anchored
    on existing data attributes;
  - a decorative mock headline `<h3>` became a styled `<div>`, so the
    outline steps in order;
  - the existing rail `div` became `<main>`, with no new wrapper;
  - the marks got intrinsic `width` and `height` as ratio hints, and CSS
    keeps their size;
  - `<body suppressHydrationWarning>` silenced the hydration error that
    extensions such as Grammarly cause by stamping attributes on the body;
  - `robots.ts` was added.

  `color-contrast` and `target-size` went to Kevin as design changes.
- A target-size fix can keep the look when the hit area grows and the paint
  stays. gt-cloud's `.sgdh-ins-mark`
  (`apps/landing/src/components/landing/home/sections/translate-window.css`)
  is a 25 px invisible button whose 11 px badge is painted by `::before`.
- Contrast fixes move color tokens, so they wait for Kevin's call. He made
  it on 2026-08-07 with a preview's report and "review this lighthouse
  report again and resolve the issues". The flagged text rose to 4.5:1 in
  both themes, and gt-landing-pages ("Process") lists the floors that
  shipped.
- **Motion runs at a smooth 60 fps at full resolution.** Kevin flagged the
  blue lines of the Locadex diagram for looking choppy where they should run
  at "smooth 60 fps" (2026-08-05), and rising glyphs that looked "less than
  60fps" and needed to "look full resolution" (2026-08-06).
- **A pattern on a moving sprite moves by whole pattern cells.** The glyph
  rain first moved its dithered sprites in whole CSS pixels to keep the
  Bayer pattern rigid, and slow rises then stepped at about 15 Hz (the
  "less than 60fps" report). The atlas then moved to device-pixel cells
  blitted on whole device pixels, so each step translates the pattern by
  whole cells (`ditherAtlasRows` in `src/lib/glyph-field.ts`). The moving
  rain still flickered, and Kevin removed the dither from it: "the dither
  is making it flicker every time it moves. remove the dither" (2026-08-06).
  Depth now reads by size and alpha (`TIER_COVER`), and the dither stays
  for static consumers.
- **Loops start full and with no lag.** Kevin asked for a loop that "works
  without a startup lag" (2026-08-04). On 2026-08-06 he flagged black space
  at the bottom of the glyph field that "fixes itself as animation
  progresses". The field now re-measures and re-seeds on first visibility,
  so its first frame is complete (`src/lib/glyph-field.ts`, `start()`), and
  `createDitherLoop` paints one frame synchronously before its first rAF.
- **The first interaction and heavy events never stall.** Lazy work runs on
  first use: a shader compiled on the frame of the first click, an atlas
  baked on first hit, a raster sampled on the first frame of a move. The
  glyph field rastered the next word on the morph's first frame and stalled
  for about 200 ms on a throttled phone. It now prepares the raster during
  the hold through `requestIdleCallback` (the prepared sample set in
  `src/lib/glyph-field.ts`). Measure each event twice, the first use and
  the second. Move anything heavier on the first use into idle time,
  behind a loading state, or into a warm-up render before the user can act.

## 2. Measure first

1. Record a baseline before touching code, and the same numbers after.
   Report medians with their spread:
   - frame time: the median, p95 and the share of frames over budget;
   - long tasks during the interaction, as a count and total ms;
   - GPU work where the engine exposes it: draw calls or triangles per
     frame, and GPU time from the DevTools Performance panel;
   - weight: raw, minified and gzipped bytes and the share of the route
     chunk (section 5);
   - Lighthouse metrics for load work (section 6).
2. Measure frame time with `scripts/frame-probe.mjs`. It samples
   `requestAnimationFrame` intervals for a fixed window after a warmup, and
   prints the median, p95, worst interval, slow share, long tasks, WebGL
   contexts created and lost, canvases in the DOM, any glyph-field tier, the
   GL renderer and the load average before and after
   (`node skills/gt-performance/scripts/frame-probe.mjs <url> --runs 3`;
   the flags and more examples are in
   [references/recipes.md](references/recipes.md)). Headless Chrome on
   Kevin's Mac draws WebGL on the real GPU (the renderer column reads ANGLE
   Metal). Where it reads SwiftShader, rerun with `--headed`. The Claude
   in-app browser pane reports `document.hidden` as true, pauses
   `requestAnimationFrame` and leaves shared-engine canvases blank, so never
   measure motion there. Discard the first probe after a dev server compiles
   a route: on 2026-08-07 a first probe of the hero read 21 fps with a 1.6 s
   frame, and unthrottled repeats read 118 fps.
3. Keep a live readout in a corner of the dev build while working on motion:
   fps, median and p95 frame ms, and the quality tier. It is a dev tool and
   leaves before the pull request.
4. Use the real app the way a user does: scroll, hover, click, navigate
   between routes, resize, zoom and flip the theme. Record every lag spike
   with its attribution (console, the DevTools Performance panel with CPU
   throttling, long task entries, Lighthouse), fix them one at a time and
   re-measure after each fix. Then read the authoritative guides for the
   stack (web.dev's performance guides, MDN's WebGL best practices, the
   library's own performance page) for further wins.
5. **Record the load average beside every timing** (`uptime`, or the load
   frame-probe prints). The machine is shared with parallel agent
   pipelines: in September 2026 they pushed the one-minute load to between
   100 and 370, and it read 280 on the 18-core machine while this skill was
   written. Every timing reads slow under that load. Rerun at low load, take
   the before and after runs back to back under similar load, and compare
   deltas. frame-probe warns when the load is above the core count.
6. Report each metric before and after in a table, with how it was measured
   (tool, viewport, DPR, throttle, load) and what remains. gt-reporting
   holds the report's form.

## 3. Quality follows measured device performance

Kevin asked on 2026-08-07 whether the glyph rain matched the device's real
performance or only its responsive width. It keyed off width alone, so a
wide window on weak hardware got the heaviest tier and a narrow window on a
fast laptop got the lean one. Kevin approved a frame-time governor the same
day, and Prototemplate's `src/lib/glyph-field.ts` holds the pattern:

- Width still sets the layout, and a `narrow` field (under 880 px) starts on
  the lean tier. Every quality site reads one combined flag,
  `lean = narrow || govTier >= 2`.
- Cadence is judged over windows of 120 counted frames (`GOV_WINDOW`) after
  a 2.5 s warmup (`GOV_WARMUP_MS`), skipping any interval over 900 ms as a
  hidden tab (`GOV_GAP_MS`). A window trips when 35% or more of its frames
  exceed 22 ms (`GOV_TRIP`, `GOV_BUDGET_MS`), which is a sustained cadence
  below about 45 fps.
- The trip counts slow frames. The first draft watched a rolling median
  above about 20 ms, and throttled hardware missed the budget on 34% of its
  frames while the median stayed healthy.
- Tier 1 drops the device-pixel cap from 2 to 1.25 through one `resize()`,
  so the backing store, the atlas and every blit change together. Tier 2
  binds the frame path to the lean pool (560 of 1,280 glyphs) and waits
  until no glyph is in flight, so no particle leaves the draw path mid-move.
- The shipped ladder only steps down, so it can never oscillate. A governor
  that also steps up does so only after sustained headroom and never
  switches a tier in the middle of a move.
- The tier is written to `canvas.dataset.gfTier` for probes. Proof on
  2026-08-07: a CDP throttle at 12x stepped to tier 2 within the window and
  an unthrottled 10 s control never tripped. Reproduce with frame-probe's
  `--cpu 12` (its `tiers` column).
- A loop with a frame cap judges raw rAF cadence. The band rain drifts 2 to
  8 px a second and draws at `fpsCap: 30`, which skips half the paints. Its
  governor counts every rAF tick, so a skipped draw never reads as a slow
  frame (`src/app/d/production/sections/ink-field.ts`, 2026-08-07).
- The copies differ. On 2026-10-05 gt-cloud's
  `packages/ui/src/lib/glyph-field.ts` has the zoom watcher (section 4) and
  no governor, and Prototemplate's copy has the governor and no zoom
  watcher. A performance fix goes into every copy in the same round, the
  rule gt-dither section 2 sets for the studio field's copies.

## 4. WebGL and canvas lifecycles

- Chrome keeps about 16 live WebGL contexts. Past that, `getContext`
  returns null and fields draw black with no error. On 2026-07-29 a
  direction's shader rendered on a fresh load and was black after 12
  client-side switches between directions.
- **A shared engine holds one context per engine module per session.** The
  fix for 2026-07-29 put every field on one module-level engine.
  `src/lib/studio-field.ts`, `src/lib/prismatic-field.ts` and
  `src/lib/horizon-field.ts` each draw into one offscreen GL canvas, blit
  into every subscriber's 2D canvas from one rAF loop, and keep the context
  when a subscriber's `destroy()` runs, so it survives route switches.
  gt-dither section 2 and `references/engines.md` hold the mechanism and
  the rebuild after a lost context.
- **A canvas read back with `getImageData` stays off the blit path.**
  `willReadFrequently` pins a canvas to CPU memory, so every `drawImage`
  from it uploads to the GPU. That upload was the glyph rain's mobile lag,
  worst on WebKit. The glyph field snapshots each finished atlas into an
  `ImageBitmap` and blits from the snapshot (`atlasSrc` in
  `src/lib/glyph-field.ts`).
- **A component that owns a context releases all of it on unmount**:
  delete the buffer, the program and both shaders, then call
  `gl.getExtension('WEBGL_lose_context')?.loseContext()`. gt-cloud's
  `apps/landing/src/components/landing/shell/V0FooterMark.tsx` does this
  after a pull request review caught the footer mark leaking one context
  per mount (2026-08-08). The same file adds its GSAP ticker callback only
  while the mark is on screen. A registered callback that returns early
  still keeps GSAP's global rAF loop awake site-wide.
- **An effect removes every DOM node it creates.** gt-cloud's
  `useMountEffect` (`packages/ui/src/hooks/use-mount-effect.ts`) is a
  mount-only `useEffect`, so React strict mode runs setup, cleanup and setup
  again in dev. Prototemplate's `src/lib/use-mount-effect.ts` defers cleanup
  by one task so the simulated rerun cancels it. The headline engine's
  cleanup removes the dust canvas and the two guides it appended
  (`EverySentence.tsx`, and gt-cloud's `HomeHero.tsx`). Probing on
  2026-08-07 found the dev double effect leaving a dead duplicate canvas
  and guide pair in the DOM, and the cleanup landed the same day. Check in
  dev that exactly one canvas and one of each created node exist after
  mount and after a hot reload.
- **Count contexts without creating them.** A probe that calls
  `getContext` on the page's canvases creates contexts and exhausts the
  budget it measures (2026-07-29). Screenshot after real navigation, or wrap
  `getContext` before page scripts run, as frame-probe does (its `gl`
  column).
- **Every engine follows the lifecycle contract**: mount lazily behind an
  IntersectionObserver, pause offscreen and on a hidden tab, draw one still
  under reduced motion, re-read ink on a theme flip and release everything
  in `destroy()` (DESIGN.md section 11, gt-motion section 6).
- **A gallery freezes its live previews.** Twenty-two live iframes running
  shaders made the presenter wall lag (2026-07-31). Prototemplate's root
  layout (`src/app/layout.tsx`) installs a rAF gate in every page: a parent
  posts `{ type: 'gt:freeze', frozen }`, callbacks queue while frozen, and
  the queue flushes on resume so loops continue where they stopped.
  `src/app/present/viewer/LazyFrame.tsx` mounts an iframe only near the
  viewport (far frames release their contexts), freezes it 2.8 s after load
  and lets it animate under the pointer. Gallery tiles show static captures
  (`public/shots/<theme>/<slug>.jpg`), and
  `src/app/directions/DirectionFrame.tsx` keeps the capture behind its one
  live frame until the frame loads. The gate wraps `requestAnimationFrame`
  only, so a new scene animates on rAF; a loop on `setInterval` or
  `setTimeout` keeps running inside a frozen preview.
- **An engine used on several pages lives in one shared library and
  survives resize and zoom for every usage.** Kevin, 2026-08-13, on the glyph
  rains: they must be "resilient to screen resizing and zooming", for "all
  usages of the component", from a shared library like the dither globe's.
  gt-cloud's engines live in `packages/ui/src/lib/` (`glyph-field.ts`,
  `dither.ts`, `picture-field.ts`) and the apps mount them (for example
  `apps/landing/src/components/landing/shared/GlyphRain.tsx`). Browser zoom
  changes `devicePixelRatio` without resizing the box, so a ResizeObserver
  alone leaves the blits soft. gt-cloud's glyph field coalesces
  ResizeObserver callbacks into one rAF, watches
  `matchMedia('(resolution: <dpr>dppx)')` and re-arms it on every change,
  keeps `resize()` idempotent for when both fire, and remaps in-flight
  positions by the box ratio.

## 5. Shrinking shaders and modules

1. **Measure first.** Kevin, 2026-08-13: "how many kb is our ditherglobe".
   Report the source, the minified module, the minified and gzipped module,
   and the tree-shaken bytes the page ships, which is the number that
   counts. The answer that day: 47.3 KB of source (mostly comments), 4.8 KB
   gzipped for the whole `dither.ts`, and 2.8 KB gzipped for what sign-in
   imports.
   Then read the built chunks for a string the minifier keeps, such as a
   GLSL uniform name (the loop is in
   [references/recipes.md](references/recipes.md)). One source module can
   still land in several route chunks: on the 2026-10-01 Prototemplate build
   the horizon shader sits in four chunks of 11.7 to 19.3 KB gzipped. Report
   the count with the sizes.
2. **Merge identical copies.** On 2026-08-01 two direction forks each
   shipped an identical 20.9 KB `horizon-field.ts`. One shared
   `src/lib/horizon-field.ts` replaced both.
3. **Move GLSL comments out of template literals.** A minifier cannot strip
   text inside a string, so every comment in a shader ships to every
   visitor. The narration lives in a TypeScript `SHADER NOTES` block beside
   the literal (`src/lib/horizon-field.ts`, `src/lib/studio-field.ts`). The
   horizon fragment literal went from 6.5 KB to 4.4 KB, and the module from
   about 7.4 KB to 4.6 KB gzipped.
4. **`#version 300 es` stays the literal's first characters**
   (`` const FRAG = `#version 300 es ``). A compaction that put a newline
   before it failed the compile silently, and only the DOM fallback disc
   rendered until the screenshot pass caught it. After any edit to shader
   text, check that the shader draws and the fallback is hidden.
5. **Keep the full configurable library API in source.** The same day a
   second cut folded about twelve unused uniforms into GLSL constants, made
   the setters table-driven and deleted `pause`, `resume` and
   `renderStatic`, for 2.5 KB gzipped. Kevin reversed it (2026-08-01): "add back the functions
   and whatever to configure, this is still good for making it into a
   library", and asked for the compiled output to be lighter at build time.
   Every parameter stays a uniform with a setter and a default, the build's
   minifier shrinks the shipped code, and any GLSL identifier minification
   runs as a build step over readable source.
6. **Prove identity with a pixel diff of a deterministic frame.** Reduced
   motion renders one deterministic frame for every engine that follows the
   lifecycle contract. Capture the baseline twice and confirm the two match
   at zero. A baseline that differs from itself is not deterministic, and a
   diff against it proves nothing. Then make the change, capture with the
   same flags and compare with `scripts/pixel-diff.mjs`
   (`capture <url> --out <png>`, then `compare <a.png> <b.png> --diff <png>`,
   which exits 1 on any difference). The sequence is in
   [references/recipes.md](references/recipes.md).
   Report residue exactly. The constant fold left 4 of the 4,039,200
   channels in a 1,009,800-pixel capture off by 1/255 each, because GPU
   drivers may fuse multiply-adds differently after any source change. The
   revert diffed at zero.
7. **When a target is out of reach without loss, give a ledger.** Kevin
   asked for 1.5 KB; the answer was 2.5 KB with the remainder named: about
   1 KB of gzipped GLSL that draws the lens, plus the shared-context
   singleton, the visibility gating and the context-loss handling. Each
   further cut was named with what it would remove.
8. **Question every dependency added for one feature, and reuse what
   exists.** Kevin, 2026-08-28, on three packages installed for one feature:
   he would "prefer to not have package bloat", and the system should reuse
   as much as possible. Judge each package on its own. cheerio was replaced
   by a small tag scanner, verified byte-identical against an 11-case
   reference harness and the live results, and ten packages left the
   lockfile. franc stayed because nothing in the monorepo detected
   language, and undici stayed for the DNS-pinning `Agent` that global fetch
   lacks; each kept package carries a one-line comment saying why. The
   contact route moved onto the shared limiter in gt-cloud's
   `apps/landing/src/lib/rate-limit.ts`.

## 6. Lighthouse

- **Measure a production build in a clean profile, or production after the
  merge.** Dev mode ships unminified code and dev chunks, and an everyday
  Chrome adds extension work. Kevin's 2026-08-05 run against the dev server
  scored 0.65 on performance, and Lighthouse itself warned that Chrome
  extensions had slowed the load. The Lighthouse CLI launches Chrome with a
  fresh profile; for Prototemplate run `pnpm build && pnpm start` and point
  `npx -y lighthouse@12` at port 3000 (the full command is in
  [references/recipes.md](references/recipes.md)). For
  generaltranslation.com, gt-website `references/docs.md` ("Performance")
  holds the local command, the cache check per framework and locale, and
  the way into SSO-protected previews.
- **Read field numbers and the mobile score.** Kevin's "FCP and TTFB kinda
  slow no?" (2026-09-14) came from PageSpeed Insights field data: CrUX, the
  origin's 75th percentile, redirects included. The lab desktop run on the
  same page scored 95 with a 0.3 s FCP, and that did not answer the
  complaint. Report mobile and desktop, lab and field.
- **Run each cell three times and report medians with the range.** The
  causes of past gaps, the landing's missing preview and the scope of a
  performance PR are in [references/recipes.md](references/recipes.md).
- **Attach the real report.** Kevin, 2026-09-15: "show the actual lighthouse
  scrfeenshotds". The pull request body carries screenshots of the
  Lighthouse report (scores and metrics, before and after) and the numbers
  in a table; gt-ship section 4 holds where PR images live. Confirm the
  body edit or comment landed. In September 2026 a `gh pr comment` inside a
  pipeline failed silently because the command takes no `--jq` flag, and
  the round's numbers never posted.

## 7. Static pages with live values

A prerendered page never bakes a live value into its HTML. On 2026-08-18 the
GitHub star badge on a blog post was missing in production while localhost
showed it: the prerender's GitHub fetch had failed, and the HTML served the
empty result. Kevin: "maybe it shouldnt be a server side. we can cache on
server side". The pattern on gt-cloud main (#4380):

- The page stays static and renders the formatted known minimum
  (`formatGitHubStarCountKnownMinimum` in `apps/landing/src/lib/github-stars.ts`)
  as its first label.
- `apps/landing/src/app/api/github-stars/route.ts` is a same-origin route.
  `getGitHubStarCount()` (`apps/landing/src/lib/github-stars.server.ts`)
  fetches GitHub with `next: { revalidate: 3600 }`, a 5 s timeout and a
  schema check. The route answers with
  `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`,
  or with `503` and `no-store` when GitHub fails.
- `apps/landing/src/components/ui/GitHubStarCount.tsx` fetches the route
  once on mount through `useMountEffect`, aborts on unmount and ignores
  values under the known minimum. It holds its slot, `invisible` while a
  deferred label resolves, so the badge never shifts the layout.

Any count, status or price that changes after the build uses the same
shape.

## 8. Budgets are gates

- A budget lives in the probe that measures it, and a breach exits 1 and
  blocks the change. In July 2026 a 3D scene's probe script held a `BUDGET`
  block: median triangles per frame at 1080p, every shadow pass included,
  over a fixed 70 s scripted run, capped at 7 million. Two content rounds
  raised the median to between 10 and 12 million, and the gate failed hard.
  The regression note named the rounds, the medians before and after, the
  mechanism and the fix.
- frame-probe takes `--max-median`, `--max-slow`, `--max-contexts` and
  `--max-long` and exits 1 when the median run breaches one. Run it from
  Prototemplate against the gt-cloud page, and put the command and its
  output in the pull request body. Probe scripts stay out of the gt-cloud
  diff (gt-ship section 3, "Verification instruments stay out"). A red
  budget blocks the change like any other failing check.

## Review checklist

- [ ] Before and after numbers are recorded, each with its tool, viewport,
      DPR, throttle and load average, and the deltas were taken under
      similar load.
- [ ] The look is unchanged: a pixel diff of a reduced-motion frame where
      the change touched a shader, canvas or style, with any residue
      counted; audits whose fix would change the design are listed for
      Kevin.
- [ ] Motion holds 60 fps at full resolution, a pattern on a moving sprite
      moves by whole cells, loops start full, and each first use costs what
      the second use costs.
- [ ] Quality tiers follow measured frame time with a warmup and gap skip,
      never switch mid-move, and width sets only the layout.
- [ ] A shared engine holds one context; a component-owned context deletes
      its objects and loses the context on unmount; exactly one canvas
      exists after a strict-mode mount and a hot reload; ticker callbacks
      unhook offscreen; no per-frame blit reads from a
      `willReadFrequently` canvas.
- [ ] Gallery previews are frozen at rest, animate on hover and run on
      rAF.
- [ ] Engines used on several pages live in one shared library, resize and
      re-read the pixel ratio on zoom for every usage, and a fix reached
      every copy.
- [ ] Weight is measured raw, gzipped and tree-shaken with its chunk count;
      GLSL comments sit outside the literals; `#version` comes first; the
      library API is intact; each new dependency is justified on its own.
- [ ] Lighthouse comes from a production build or production, three runs
      per cell, mobile and desktop, field numbers read, any split or gap
      named with its cause, and the screenshots are in the pull request.
- [ ] Live values hydrate from a cached same-origin route with a fallback.
- [ ] Every budget passes, and its command and output are in the pull
      request body.

## Related skills

In this set: gt-motion (the engine contract, the governor's place in it,
the moving type law), gt-dither (the engines, their copies and their cost
tables), gt-website (docs performance, Lighthouse commands, deploys),
gt-verify (proving a visual fix), gt-local-dev (review servers and dev
environments), gt-reporting (the before and after report), gt-ship (the
pull request body, its screenshots and what stays out of the diff),
gt-landing-pages (the contrast floors), gt-lints (gates). In gt-cloud:
`react-best-practices`, `react-useeffect`, `glyphfield`, `gt-landing`. Wiki:
`perf` (the cheap-to-invasive investigation ladder), `core-web-vitals`,
`agent-browser`.

## Sources

- Prototemplate: `src/lib/glyph-field.ts` (the governor constants,
  `govern()`, `start()`, the prepared sample set, the atlas snapshot,
  `ditherAtlasRows`, `TIER_COVER`), `src/app/d/production/sections/ink-field.ts`
  (the capped loop's governor), `src/lib/studio-field.ts`,
  `src/lib/prismatic-field.ts` and `src/lib/horizon-field.ts` (the shared
  context, `SHADER NOTES`, `#version`), `src/lib/dither.ts`,
  `src/lib/use-mount-effect.ts`, `src/components/shared/EverySentence.tsx`
  (cleanup), `src/app/layout.tsx` (the rAF gate),
  `src/app/present/viewer/LazyFrame.tsx`,
  `src/app/directions/DirectionFrame.tsx`, `DESIGN.md` section 11,
  `docs/LIBRARIES.md`, `package.json`, `.next/static/chunks` of the
  2026-10-01 build.
- Prototemplate skills: `gt-motion` sections 4 and 6, `gt-dither` section 2
  and `references/engines.md`, `gt-website` section 8 and
  `references/docs.md`, `gt-landing-pages` ("Process"), `gt-ship` sections
  3 and 4, `gt-aesthetic/scripts/measure-type.mjs` (the browser setup the
  scripts here reuse).
- gt-cloud (origin/main, 2026-10-05):
  `apps/landing/src/components/landing/shell/V0FooterMark.tsx`,
  `packages/ui/src/lib/glyph-field.ts`,
  `packages/ui/src/hooks/use-mount-effect.ts`,
  `apps/landing/src/components/landing/shared/GlyphRain.tsx`,
  `apps/landing/src/components/landing/home/sections/HomeHero.tsx`,
  `apps/landing/src/components/landing/home/sections/translate-window.css`,
  `apps/landing/src/app/api/github-stars/route.ts`,
  `apps/landing/src/lib/github-stars.ts`,
  `apps/landing/src/lib/github-stars.server.ts`,
  `apps/landing/src/components/ui/GitHubStarCount.tsx`,
  `apps/landing/src/lib/rate-limit.ts`,
  `apps/landing/src/components/landing/shared/lang.css`,
  `apps/landing/package.json`, `apps/landing/vercel.json`; pull requests
  #4380 and #4815.
- Kevin's private Claude Code memory for gt-cloud (not in this repository):
  `docs-perf-investigation`, `lighthouse-round-conventions`,
  `redesign-screenshot-harness`, `pr-size-discipline`, and the 2026-09-26
  ship-lessons note on shared-machine load.
- Kevin's rulings: no aesthetic change in performance work (2026-08-05,
  2026-08-06); 60 fps at full resolution (2026-08-05, 2026-08-06); no
  startup lag (2026-08-04); the library API kept (2026-08-01); the
  frame-time governor (2026-08-07); the dither removed from the moving rain
  (2026-08-06); the listed audits resolved (2026-08-07); gallery previews
  animated on hover (2026-07-31); one shared library with resize and zoom
  resilience (2026-08-13); weight measured first (2026-08-13); live stars
  cached on the server and hydrated (2026-08-18); no package bloat
  (2026-08-28); field FCP and TTFB, mobile Lighthouse and real screenshots
  (2026-09-14, 2026-09-15); PostHog and other high-risk changes untouched
  (2026-09-15); small performance pull requests (2026-09-25).
