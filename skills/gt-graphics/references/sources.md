# Sources

Where every line of `SKILL.md` and the files beside it comes from. Each line added after 2026-10-06 names its memory, transcript or inventory row and its date.

## Sources of the skill as written through 2026-10-06

- Prototemplate: `docs/GRAPHICS.md` (What a visual is, Sizing, The files, Procedure, Capturing, Backgrounds, Clips, Handing off to a post, Where it went wrong); served at `/docs/graphics`.
- Prototemplate: `graphics/README.md`; `graphics/build/gen-lib.js` (`SHOTS`, `BG`, `MIN_TEXT`, `PAD`, the primitives, `CSS`, `CENTER_SCRIPT`, `stage`); `graphics/build/gen-visuals.js` (`N`, `O`, `add`, `ASSIGN`, `BG_WASH`, the covers); `graphics/build/audit.js`; `graphics/build/render.sh`; `graphics/build/export-blog.py`; `graphics/build/composite-videos.sh`; `graphics/build/capture-sidebar.sh`; `graphics/build/sheet.py`; `graphics/serve/server.js`; `graphics/glyph/gfboot.sh`, `gfexport.sh`, `gfsurvey.sh`.
- Prototemplate: `src/lib/blog-image-sizes.ts`, `next.config.ts` (`images.deviceSizes`, `qualities`), `src/lib/graphics.ts`, `src/app/brand/page.tsx` (`GLOBES`), `src/app/brand/brand-sections.ts`, `src/lib/dither.ts` (`globe`), `public/media/README.md`, `content/blog/designing-docs-for-humans.mdx`.
- Prototemplate: `motion/stills/partnership-globe/render.mjs` (local, untracked, owned by the Videos session).
- Prototemplate, absorbed by this skill: `.agents/skills/blog-graphics-pipeline`, `docs-source-capture`, `glyphfield-headless-export`, `stop-motion-ui-capture` and `gt-docs-visual-tokens` (written 2026-09-18 in 3d87326; the pipeline revised the same day in 70380de and the tokens on 2026-09-21 in c18a362).
- gt-cloud (origin/main, 2026-10-05): `.agents/skills/glyphfield/SKILL.md` and `references/source-map.md`; `apps/landing/src/lib/studio-field.ts`; `apps/landing/src/components/blog/BlogPostCover.tsx` (webp covers at quality 95), `imageSizes.ts`; `scripts/deploy-landing.sh` (content main on every deploy).
- wiki: `skills/engineering/create-graphics/SKILL.md`.
- Session notes: blog-graphics-pipeline-traps (2026-09-18 to 2026-09-24), gt-motion-films (partnership globes, 2026-10-01 to 2026-10-02), docs-redesign-post-part2 (the screenshot cookies, 2026-09-09), fuma-blog-pipeline (the merge order, verified 2026-09-14), explorations-stay-local, session-lanes-prototemplate.
- Where this skill and `docs/GRAPHICS.md` differ, the skill follows the code and gt-cloud main: the set is thirty-three visuals and eight covers and cards (the doc says thirty-six), the GIF is 1400 wide (its Clips section says 1600), the ground is drawn pixelated (its trap table says smooth), the fit never scales up (its table says sparse compositions zoom to fill), webp covers are served at quality 95 (it says 90), and the gt-cloud pull request merges before the content one (it says content first). `graphics/README.md` writes `pnpm graphics:export -- --covers`, which fails under pnpm 11.
- Kevin, 2026-09-14 (review explorations on localhost first); Kevin, 2026-10-01 (the partnership globes); Kevin, 2026-10-02 (show the glyph globes without the logo); Kevin, 2026-10-03 (dedicated pages for graphics and motion); Kevin, 2026-10-05 (no readable text on artifact pictures).

## Lines added on 2026-10-10 (system v2, lane L4)

- "Store listings": Kevin's memory note `locadex-listing-images` (2026-10-09, written in the Videos session: the Marketplace specs verified that day, Kevin's credit and type rules). Inventory `memories.json` row "locadex-listing-images", plan row N-10. The harness, the add-on's markup and the open naming question stay out (plan section 3.3).
- "Maps": Kevin's memory note `world-language-map` (Kevin, 2026-10-02 and 2026-10-03, the language-first design of the world map). Inventory `memories.json` row "world-language-map", plan row N-12. The policy table, the decision list and the round log stay in the memory note.
- "Traps and fixes" moved to `references/traps.md` and the still artwork detail to `references/still-artwork.md`, unchanged, with summaries left in `SKILL.md`, to keep the body under the 24,000-byte budget (plan section 2.2).
