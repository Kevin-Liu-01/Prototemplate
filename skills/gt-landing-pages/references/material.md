# Material on a landing page

`SKILL.md` points here. Moved from it on 2026-10-10, unchanged.

## The rules

- The hero's field is the studio field: `shared/HeroField.tsx` calls `createStudioField(canvas, { preset: 'bayer8' })` from `apps/landing/src/lib/studio-field.ts`, through one shared GL context. The engine owns the frame loop, resizing and the reduced-motion still, so `destroy()` is the only cleanup.
- The glyph fields come from `packages/ui/src/lib/glyph-field.ts` (imported as `@generaltranslation/ui/lib/glyph-field`), shared since 2026-08-13: the Deploy band's condensation field, the pricing close, the careers rain (`shared/GlyphRain.tsx`) and the enterprise contact bay (through `glyph-rain/sections/band/inkField.ts`). Import the shared engine; app-local copies are not allowed to come back. Its design contract (matter is conserved and the word comes first) is in gt-motion and gt-dither.
- Density ramps use ordered dither from `packages/ui/src/lib/dither.ts` and `DitheredMark` (DESIGN.md section 7). An alpha veil does not count as a ramp.
- New decorative material starts in Glyphfield (glyphfield.com/studio), following gt-cloud's `glyphfield` skill. Copy and buttons stay page content and are never baked into the artwork.
- Marks are drawn: an SVG, a canvas field, `LocadexMark`. A gif is never a mark or a demo frame (Kevin, 2026-08-04: Locadex is never a gif). A mark seated in an isometric face is an alpha mask (gt-diagrams, `references/isometric.md`).
- A page spends one accent, `--tc-accent: #2f5ce0`; light paper is one white; the one black is the house background; `--tc-panel` is the one dark surface for code, config and diffs. Dark mode is a token remap under `[data-theme='dark'] .toolchain-root` and nothing else. Components take colors from the tokens (`no-hex-colors` checks className and style values). A literal color lives in a stylesheet, such as the ring's gradient and the on-ink faces in `engine.css`, and never in a className or style prop.
- Light mode has no black backgrounds. On `sgdh-root` pages `v0-pages.css` moves the `.tc-band.tcb` feature bands onto paper and turns the panel family into white plates read by their rules (`--tc-panel: #ffffff`, its inks re-bound to black alphas). The Deploy close becomes a white day plate that keeps its ring (`deploy.css`), and the careers and 404 heroes turn to paper with only the black-hole disc keeping its black. A comment in `v0-pages.css` still names Deploy as the one exception; `deploy.css` overrides it.
- Avoid AI gradients ("ugly ai gradients", the blog round of 2026-08-11), glassmorphism, rainbow washes as decoration, flag soup and robot iconography.
