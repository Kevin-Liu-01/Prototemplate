# Sources

Where every line of `SKILL.md` and the files beside it comes from. Each line added after the skill's last update names its memory, transcript or inventory row and its date.

## Sources of the skill as written before 2026-10-10

- Prototemplate: DESIGN.md sections 2, 5, 7, 8, 9, 10, 11, 13 and 14;
  BRAND.md section 9 (the final avoid list); motion/MOTION.md ("The
  standard", "Motion", "Texture", "Line", "The marks", rounds 4 and 7);
  motion/kit/dither.js; motion/films/_smoke/index.html;
  motion/films/jihe-yuanben/NOTES.md (rounds 3 to 8 of beat 6).
- Prototemplate: src/app/craft/CraftArticle.tsx ("The dither transitions,
  and the grid they run on", "The moving type"), src/app/craft/libraries.ts
  (`TRANSITION_RULES`), src/app/craft/TransitionDemo.tsx.
- Prototemplate: src/lib/dither.ts; src/lib/glyph-field.ts (`resample`);
  src/components/shared/EverySentence.tsx;
  src/app/d/toolchain/sections/RevealSeam.tsx;
  src/app/d/toolchain/diagrams/DitheredMark.tsx.
- Prototemplate: src/app/d/_v0/sections/FullStack.tsx, StackTower.tsx,
  Locadex.tsx and locadex.css; src/app/d/production/sections/Developer.tsx
  and Locadex.tsx (`beamAt`).
- Prototemplate: src/components/viewer/tokens.css; docs/LIBRARIES.md;
  docs/ARTIFACT-PICTURES.md; .oxlintrc.json; scripts/lint/practices.mjs;
  scripts/check/pagecheck/README.md; src/app/layout.tsx (the `gt-theme` key).
- gt-cloud: apps/dashboard/src/components/brand/FieldStack.tsx and
  fieldController.ts; apps/dashboard/src/app/brand-tokens.css
  (`.plate-row-in`, `brand-field-picture-in`);
  apps/dashboard/src/app/[locale]/signin/device/_components/DeviceCodeForm.tsx.
- gt-cloud: apps/landing/src/components/landing/sections/shared/reveal.ts
  and bento-motion.css; apps/landing/src/components/blog/flap.ts;
  apps/landing/src/app/globals.css (`#nd-sidebar[data-sb-ready]`).
- gt-cloud: tooling/oxlint-plugins/gt-ui.ts (`no-smooth-scroll`,
  `no-gif-mark`, `no-use-effect`); packages/ui/src/lib/dither.ts (the
  engine copy with `simBase` and the held `stop()`);
  packages/ui/src/hooks/use-mount-effect.ts.
- gt-cloud branch k/blog-lottie-translation (PR #5068):
  apps/landing/src/components/blog/LottieTranslationWindow.tsx,
  lottieDocument.ts, lottieLoader.ts, ditherMask.ts.
- wiki: skills/engineering/hyperframes-animation/SKILL.md,
  skills/engineering/gsap-scrolltrigger/SKILL.md,
  skills/engineering/lottie-animations/SKILL.md.
- Claude Code memory for gt-cloud: svg-dash-gotchas, lottie-web-canvas-traps,
  blog-lottie-figure, signin-field-transition, docs-shell-transition-traps,
  redesign-screenshot-harness, dashboard-deck-grammar, gt-motion-films.
  svg-dash-gotchas states the park sign backwards; the code comments in
  FullStack.tsx and StackTower.tsx and a headless Chromium check on
  2026-10-05 agree with section 7.
- Kevin: the backwards dash draw-on (August 2026); no entrance animation on
  the onboarding pages (September 2026); "make the dither transitions 2x
  faster" (2026-09-29); the seam drag performance (2026-10-01); the dither
  background in films (round 7, 2026-10-02); the triangle reassembly
  (2026-10-04).

## Lines added on 2026-10-10 (system v2, lane L4)

- Sections 8 and 9 moved to `references/tools.md` (with #5068 tagged open on 2026-10-10, plan row N-27), with a summary left in `SKILL.md`, to keep the body under the 24,000-byte budget (plan section 2.2). The film pacing lines stay in this skill until the Videos session moves them into `gt-films` in its own lane (plan message M1, lane L6).
- Related skills and section 4: the isometric skill merged into `gt-diagrams` on 2026-10-10; `gt-verify` replaces `agent-browser` in the Related line (inventory `skills.json` row 38, plan row N-28). The verification section still names `agent-browser` beside Playwright as a way to take pixels from outside the app.
