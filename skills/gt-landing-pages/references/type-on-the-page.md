# Type on the page

`SKILL.md` points here: the faces, the engine's heading metrics, the Tailwind traps, the mobile ladder and the copy rules that show on the page. Moved from `SKILL.md` on 2026-10-10, unchanged.

## The faces and the metrics

- Inter is the only typeface on landing pages (Kevin, 2026-09-18: "change switzer to inter everywhere. dont need switzer and remove those files"; gt-cloud #4887). The face is rsms.me's InterVariable v4.1 from `apps/landing/public/fonts`, declared once in `apps/landing/src/lib/fonts.ts` as `--font-sans`; the italic build lives in `fonts-prose.ts` so only prose routes preload it. Prototemplate loads the same build as `--font-inter`.
- Mono comes in two forms. The engine's `--tc-mono` (Tailwind `font-tc-mono`) is the system stack `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`, and band code uses it. Geist Mono, loaded in `fonts.ts` as `--font-mono`, is Tailwind's `font-mono` and the only mono webfont the app loads.
- `--tc-disp` resolves to `--tc-sans`. Keep the slot; it is the grammar's hook for display rules.
- Weight 500 is the cap for headings at every size. The engine sets h1 to h4 to weight 500, line-height 1.06, letter-spacing -0.028em and margin 0.
- Mono is for strings that carry numerals: measurements, values, code (Kevin, 2026-08-01). A plain-word caption or label is set in Inter, without uppercase tracking.
- gt-cloud's `gt-ui` skill, which gt-landing routes UI work to, describes packages/ui defaults in `typography.md`: Geist on `font-sans`, `font-semibold` headings and `text-xs uppercase tracking-widest` section labels. None of those hold on a landing page. The landing's `--font-sans` is Inter, the engine caps headings at 500, and an uppercase tracked label fails `gt-ui/no-eyebrow`.
- Prototemplate's own chrome sets its nameplate in Fraunces and Space Grotesk (DESIGN.md sections 4 and 15), which BRAND.md section 6 calls the lab's stationery. A GT landing page uses Inter alone.
- Heading and paragraph metrics live in engine CSS. The engine's resets are unlayered and Tailwind utilities sit in a layer, so `font-semibold`, `leading-*`, `tracking-*` and margin utilities on h1 to h4 and p lose without a warning. Put those properties in the band's own stylesheet under `.toolchain-root`, or space siblings with a gap on the flex or grid parent (2026-08-07).
- The other Tailwind 4 traps (`text-[length:var(--x)]` for a size, class candidates scanned from comments, unused `@theme` tokens dropped from the build) are in gt-website. Tailwind classes added to `packages/ui` may also need `touch apps/landing/src/app/globals.css` before the landing dev server compiles them.

### The mobile ladder

Under 720px, type and spacing come from one token ladder (gt-cloud #4240, 2026-08-08). Kevin's standing directive is that mobile is designed for the phone and never reads as the desktop page shrunk.

- The `--tcm-*` slots are declared on `.toolchain-root` in the engine's late `@media (max-width: 720px)` block, near the end of `engine.css` (Prototemplate: `src/app/d/toolchain/styles.css`). Several base rules sit between the early 720px block and the late one, and a same-specificity override only wins by following them, so new mobile floors go in the late block.
- Every consumer reads `var(--tcm-X, <px fallback>)` with the slot's canonical value as the fallback, so a rule outside the ladder's reach degrades to the same number. A new mobile rule never hardcodes a size the ladder has a slot for.
- The mobile cut in `home/v0-pages.css` (`.toolchain-root:is(.sgdh-root, ...)`) has higher specificity than any engine floor. A raise made only in the engine does not render on `sgdh-root` pages. Change both in the same commit.
- Copy sits at least 20px from any hairline on mobile: `--tc-card-pad` drops to 20px under 720px, and the trust lead carries a 20px bottom pad.
- Tap targets are 44px: `.tc-btn` is 44px under 720px, and footer links sit on about a 46px pitch.
- An authored `<br />` needs `{' '}` before it. The mobile cut hides some breaks, and without the space the two words fuse.
- The mobile hero h1 reserves two lines (`min-height: 2.2em`), so the morphing headline cycles every locale without moving the layout. Its size is set against the longest of the sixteen sentences: at 390px French tips to a third line at 2.75rem, so the size stays just under it (`clamp(2.1rem, 10.9vw, 2.7rem)`).

### Copy rules that show on the page

- Rendered copy carries no em dashes (Kevin, 2026-08-11, and the `no-em-dash` lint).
- On pricing pages, whole dollars of at least $1 render without cents ($2, $5), and cent prices keep two decimals ($0.50, $1.06). The formatter is `packages/ui/src/components/pricing/dollar-format.ts` (Kevin, 2026-09-10).
- Mocks read complete at 390px. A diff, terminal or table mock that would crop gets its own narrow block (the enterprise PR diff mock has a 480px block with 11.5px type and its file path hidden).
