# Sources

Where every rule, number and script in `gt-performance` comes from. This list
moved out of `SKILL.md` on 2026-10-10 to keep the skill under its size
budget; `SKILL.md` keeps a `## Sources` section that points here.

## Through 2026-10-06

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

## Added 2026-10-10 (system v2, lane L2)

- `metadata.owner: P`, from the plan's skill table (2026-10-10).
- The `Last real run` lines of the scripts: `pixel-diff.mjs` from a scan of
  Claude Code transcripts on 2026-10-10 (last runs on 2026-10-08 in the
  Prototemplate session); `frame-probe.mjs` from the plan's script table
  (no run outside authoring; kept for frame-rate checks in performance
  rounds). The LCP probe of the docs performance round stays out of this
  skill (plan item C6: one run).
