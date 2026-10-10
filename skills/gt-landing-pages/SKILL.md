---
name: gt-landing-pages
description: >-
  The page grammar for General Translation landing and marketing pages: one
  rail, bands and hatch spacers, heads with a heading and one lead, the
  shared Cta with Title Case labels, the two icon tiers, Inter only, the
  mobile type ladder, the svh and dvh law, the read lines for scroll stories,
  and the rule that mock layouts and the toolchain prototypes are literal
  specs. Use when designing, building or reviewing a landing page, a home
  band, or a pricing, enterprise or careers page.
metadata:
  title: Landing page grammar
  areas: landing, aesthetic
  updated: 2026-10-07
  origin: prototemplate
---

# Landing page grammar
General Translation's marketing pages (the home at generaltranslation.com, pricing, enterprise, careers, contact and the pages beside them) share one grammar: a ruled column with one rail, bands separated by hatch spacers, section heads with a heading and one lead, and one shared button. The code ships from `apps/landing` in gt-cloud, GT's monorepo. The prototypes and the design canon live in Prototemplate, Kevin's design lab and GT brand hub at prototemplate.com, which is the repository this skill is stored in. The rules come from Kevin's review rounds and from the engine CSS that implements them, and the rules a machine can check are held by a lint that the review checklist names.

Paths are relative to a gt-cloud checkout at origin/main (`$GT_CLOUD`) or a Prototemplate checkout (`$PROTOTEMPLATE`). Token values, CSS recipes and breakpoints are in [references/engine.md](references/engine.md). The component APIs (`Cta` props, `BentoRow` and `BentoCell` props, the full glyph vocabulary) are in gt-components; this skill holds how a page uses them.

## The reference

- The shipped site outranks every other example. It is generaltranslation.com, built from `apps/landing` on gt-cloud origin/main and rebuilt page for page in Prototemplate under `/d/production` (the Shipped group in the sidebar). Kevin called the Dossier (`/d/singularity-dossier` in Prototemplate) the completed direction on 2026-08-06. gt-cloud #4213 built the production landing from it, and that landing became canonical for the redesign stack on 2026-08-11. On 2026-10-07 Kevin ruled "fix the dossier references", and the Dossier stays in the gallery as the direction the site grew from (`gt-aesthetic` section 1).
- Content comes from production: the copy, the sections and their order as origin/main's page components in gt-cloud render them today. The layout grammar comes from the toolchain prototypes (`/d/toolchain` and its pages, such as `/d/toolchain/enterprise` and `/d/toolchain/pricing`) and the shipped pages. After a round that invented product vignettes, Kevin ordered production content restored and kept only the diagrams he had praised (2026-08-11).
- A mock or a toolchain page given as a spec is copied literally: its composition (what sits left and right, which visual sits in which cell, where the bento heads go), its copy and its formatting. Kevin, 2026-08-04, with the plan images: "here are the literal images of the plans." Kevin, 2026-08-11: "we literally give example copy and formatting and writing and diagrams in toolchain enterprise and pricing pages. so build those." Notes written onto a mock are change orders.
- Copy fidelity alone fails review. The first full build of the v0 sections (2026-08-04) carried the right copy and drifted from the mock layouts, and only the Locadex isometric survived.
- Mount the existing diagrams before drawing a new one. In gt-cloud: `SentenceWidth` (sections/developer), `ContextResolve` and `ReviewWorkspace` (sections/context), `EdgeGlobe` (sections/global), `StackTower` (sections/fullstack), `LocaleTag`, `DitheredMark` (shared), `RevealSeam` and `TranslateWindow` (home/sections). In Prototemplate, `src/app/d/toolchain/diagrams/` also holds `lang/RtlMirror`, `lang/PluralForms`, `LocaleRouting`, `surface/GlossarySurface` and `tc-stack-iso`. New artwork is for new content only, and it sits inside a framed cell.
- Placeholder quotes and rollout figures carry a PLACEHOLDER mark until production supplies real ones. Nothing unannounced or financial appears on a public surface.
- Before editing gt-cloud, read `$GT_CLOUD/.agents/skills/gt-landing/SKILL.md` and its `references/design.md`. They hold the editing map (home bands in `apps/landing/src/components/landing/sections/<slug>/`, the hero in `home/sections/HomeHero.tsx`, the shell in `landing/shell/`) and the section recipe. This skill does not copy that map.

### Where the home rules reach

`landing/shell/engine.css` scopes the grammar under `.toolchain-root`. `landing/home/v0-pages.css` adds the home layer (registration crosses, square surfaces, the hatch spacers, the button hover hold, the light skin and the mobile cut) under `.toolchain-root:is(.sgdh-root, .sgoh-root, .sgsh-root, .sgbh-root, .sgph-root)`, the five home roots of Prototemplate's variant sites. gt-cloud uses only `sgdh-root`, and it is not limited to the home: the roots of pricing, usage pricing, enterprise, careers, contact, the blog, legal, supported locales, the 404 and the footer mount (`SiteFooterMount.tsx`) all carry `toolchain-root sgdh-root`, and those pages import `v0-pages.css`. The partners page and the report card carry `toolchain-root` alone. Below, "`sgdh-root` pages" means that whole set.

## Rail and bands

The page is one ruled column. `.tc-rail` (the column wrapper on the home, pricing, enterprise, careers, contact, blog, legal, supported locales and report card pages, and around the footer in `SiteFooterMount.tsx`) is `min(var(--tc-rail), 100%)` wide and draws the column's two lines once with `border-inline: 1px solid var(--tc-hair)`. A border rounds to whole device pixels at any zoom, which a background-filled box does not, so the rail is a border.

- A band inside the wrapper (`<section className='tc-sec v0-<slug>'>`) draws no side rails. `.tc-sec` draws only its bottom rule, and the last section draws none.
- A full-bleed band (the feature bands `.tc-band.tcb`, the close band `.v0-dep`) spans the viewport and draws its own inner pair once, at the column edges, from its `-in` column. On the home these bands are children of `main.tc-rail` that break out with `margin-inline: calc(50% - 50vw)` (`fullstack.css`, `context.css`, `Deploy.tsx`); on Prototemplate's `/d/toolchain` the band sits at page level. `Deploy.tsx` is the model: the `v0-dep-in` column carries `w-[min(var(--tc-rail),100%)] border-x border-x-[var(--tc-hair-band)]`. The band never adds a pair beside the column.
- In dark, `--tc-hair-band` aliases `--tc-hair`, so the rail runs one color through bands and wrapped sections. Prototemplate's toolchain engine gives light bands a stronger line (`--tc-hair-band` 0.34 against `--tc-hair` 0.26), because a line on ink needs more alpha than a line on paper to look equal. In gt-cloud both resolve to `--color-border` in light, and the `sgdh-root` light skin restates `--tc-hair-band: var(--tc-hair)` on its paper bands.
- The outer pair at plus or minus 10px is retired: `.tc-rail::before`, `.tc-nav-in::before`, `.tc-band::after`, the `--tc-rail-outer` token and gt-cloud's `Rails` component were deleted in gt-cloud #5007 (Kevin, 2026-09-28: "make sure there's no rules that lead to two side rails"). gt-landing's App Structure list still names `Rails`; the export is gone from `shell/Bento.tsx`. Prototemplate keeps a `Rails` in `src/components/shell/Bento.tsx` that draws the single pair for a full-bleed band outside a wrapper.
- Call the column's lines "the page's rail pair, drawn once". The brand's two-hairline connector is "the doubled line" or "the thread". The words "outer pair", "outer rail" and "doubled rails" fail Prototemplate's `retired-rail-vocabulary` check.

### Hatch spacers

- Home bands are separated by `<div aria-hidden className='v0-hatch' />` in `HomePage.tsx`. Rows inside one section are separated by `.tc-hatch`. Both are a `clamp(28px, 3.4vw, 40px)` strip with a 1px `--tc-hair` rule on each edge over a 45 degree hatch in `--tc-hatch`. Under 720px `.tc-hatch` is 40px and `.v0-hatch` 36px.
- The hatch owns both of its edges. The section before it drops its bottom rule (`.tc-sec:has(+ .v0-hatch)`), and next to a full-bleed band the band's own border stands and the hatch drops that edge.
- `.tc-hatch` carries `position: relative; z-index: 2`, because reveal tweens leave transforms on the framed cards above it and their stacking contexts would paint over its top rule.

### Registration crosses

- On `sgdh-root` pages, each `.tc-rail > .tc-sec::after` paints a cross at both bottom corners where the seam meets the rail: 9px arms, 1px thick, hanging 5px past the rail, in `--cross-ink` (`rgba(10, 11, 13, 0.38)` light, `rgba(255, 255, 255, 0.34)` dark). The next section's top corners are the same points, so one pseudo per seam is enough.
- The full-bleed bands (`.tcb`, `.v0-dep`) clip their own pseudos, so the section after a band paints its own top pair with `::before`. Bands draw no crosses.
- The arms reach past the rail, so the page root sets `overflow-x: clip`. `overflow: hidden` would make a scroll container and stop the sticky figures further down the page.

### The row owns every seam

- Grids of cells are `BentoRow` and `BentoCell` from `apps/landing/src/components/landing/shell/Bento.tsx`. The row is a grid with `gap-px` over a `--tc-hair` background, so the 1px gaps are the seams. Cells have no border props.
- A framed cell (`BentoCell framed`, which always adds `.is-framed`) shows the row's hairline background through a 1px reveal: the framed row sets `padding: 1px 0`, its sides yield to the rail, and where two framed rows meet only the first keeps its strip. A framed cell without the class collects the gap seam and a border-top, which is a 2px double line.
- Flush at the rail: where a row meets a line that already exists, the cell sits flush and drops that side's reveal. No reveal runs beside a rail, and no border runs beside a seam.
- A translucent background under a translucent border composites darker than every other hairline (the self-stack). Clip it with `background-clip: padding-box`. Two stacked translucent grounds do the same, so cells stay transparent and the row paints the one background.
- Every structural line runs rail to rail and top to bottom. There are no floating bordered cards and no heads floating in whitespace; a head sits in a ruled `tc-head` or in the cell's own head zone (`.shell-cell-head`).
- On `sgdh-root` pages, structural surfaces are square: the hero card, the terminal window, framed cell cards and band art mats take `border-radius: 0`. Controls keep small radii (buttons 6px).

## Section heads

A section head is a heading and at most one lead paragraph inside a ruled `.tc-head` (the Customers wall carries its heading alone). The Locadex band is the model:

```tsx
<section className='tc-sec v0-ldx' id='locadex' ref={root}>
  <div className='tc-head'>
    <i className='tc-head-icon v0-ldx-head-mark' aria-hidden />
    <T>
      <h2 data-reveal>
        The easiest way to localize <br />
        your full product suite
      </h2>
    </T>
    <T>
      <p data-reveal>
        Connect agents and integrate any content source or tool with{' '}
        <GtLogoText />
      </p>
    </T>
  </div>
```

- A head runs at most two lines of display type. A three-line header is the named anti-pattern from the 2026-08-04 review. On `sgdh-root` pages a head runs one line at desktop (`white-space: nowrap` from 760px) unless an authored break splits it.
- A head has no eyebrow: no uppercase tracked line above the heading, no mono label, no kicker that restates the heading. Kevin's word for the stacked version is "3 lines of text stacked to say the same thing" (brand questionnaire, 2026-08-11). Functional layer tags inside a diagram are exempt.
- The heading has no trailing period. The lead is one or two sentences. Copy follows gt-voice: no em dashes, no metaphors, no paired contrasts.
- The `.tc-head-icon` watermark is optional: 240px, 5 percent ink, bleeding 48px off the right edge, hidden under 720px. It is a meaning mark, so it is a Heroicons solid glyph (`CodeBracketIcon` on Developer, `BookOpenIcon` on Context, `GlobeAltIcon` on Global) or a house mark (the Locadex band masks `/brand/locadex-mark.svg` at 343px).
- Inside a full-bleed band the head is `.tcb-head` (`sections/shared/darkband.css`): the heading and its one line on a shared baseline, nothing else.
- A two-column band whose copy sits beside its art reuses the `tc-head` type sizes for its copy block.
- The engine sets `.tc-head` padding to `clamp(54px, 6.4vw, 82px) var(--tc-gut) clamp(28px, 3.2vw, 38px)`, the h2 to `clamp(1.62rem, 2.5vw, 2.2rem)` with a 22ch measure, and the lead to 15px / 1.62 in `--tc-ink-2`, 13px below the heading and 60ch wide.

## Buttons

Every button on a landing page is the shared `Cta` in `apps/landing/src/components/landing/shared/Cta.tsx`, over the engine's `tc-btn` faces (`gt-ui/shared-cta` refuses `tc-btn` markup anywhere else). Its props and render forms are listed in gt-components.

- `variant='solid'` is the ink face, which flips to white in dark. `outline` is the hairline face for the second action. `on-ink-solid` and `on-ink-outline` are for the horizon heroes (careers, the 404), whose ground is the black-hole field. Those heroes turn to paper in light, and their own sheets (`careers.css`, `not-found.css`) re-key the on-ink faces to ink-on-paper there.
- `size` is `sm` 32px, `md` 38px (the default) or `lg` 44px. Under 720px the engine raises every button to 44px and `sm` to 38px.
- `tracked` fires PostHog `cta_clicked` with that location slug.
- The ring (`ring`, `.tc-cta-ring`) marks the page's primary action. On the home it appears twice: the hero's Get Started and the Deploy band's Get Started. A band carries at most one ringed button. The hero's primary goes to the product (the dashboard sign-in), and an in-page jump is the wrong target for it.
- On `sgdh-root` pages the solid face keeps its ground on hover in both themes, and the ring's lift is the hover response (v0-pages.css).
- Labels are Title Case, with short function words lower after the first word: Get Started, Get in Touch, Get a Demo, Talk to Us, Read the Docs, Go Home, Copy Prompt, Setup for Agents. The enterprise hero's Talk to an Engineer was cut on 2026-08-15; the live enterprise page reads Talk to Us (2026-10-06).
- The PostHog location slugs are frozen. Pass `tracked` only with a slug that fires today; a new slug changes the analytics contract and needs Kevin's approval.
- A label that changes state (the hero's Setup for Agents, then Copied or Copy Failed) sizes the face from the idle label through a grid sizer, so the centered row never moves (gt-cloud #5049, 2026-09-30).
- Gaps beside a glyph are matched by what the eye sees. Lucide glyphs sit differently in their 24-unit boxes (ArrowRight draws from unit 5, Copy from unit 2), so equal CSS gaps give unequal visible gaps. Measure from the label's right edge to the glyph's first drawn column and from its last drawn column to the button edge, and match those numbers across the buttons in a row (Kevin, 2026-10-01).
- At 620px and below, the hero buttons fill the content column up to 440px wide: side by side at half the row each when both labels fit, otherwise one per row.
- Prototemplate's `/d/production` mirror and the directions write `tc-btn` classes directly, because `src/app/d/**` sits outside Prototemplate's oxlint scope. Code ported back to gt-cloud goes through `Cta`.

## Icons

Icons come in two tiers, plus brand marks (gt-cloud #4909, 2026-09-24; swept site-wide in #5007, merged 2026-09-29). The tier rules, the full glyph vocabulary and the lint's reach are in gt-components and its `references/icons.md`.

- A mark that carries meaning (a card, a feature, a link destination, a section watermark, a status) is Heroicons solid from `@heroicons/react/24/solid`, sized with a class. A control (search, copy, chevrons, arrows, close, the theme and language switches, menu toggles, loaders) is Lucide outline. Brand marks stay as drawn (`GtMark`, `LocadexMark`, framework logos). `gt-ui/icon-tiers` enforces the split.
- Reuse the vocabulary before choosing a glyph: Pricing `TagIcon`, Enterprise `BuildingOffice2Icon`, Blog `NewspaperIcon`, Integrations the house `PlugIcon`, and Locadex always `LocadexMark` (a brain glyph is wrong).
- The theme switch is the circle glyphs, ◐ for light and ◑ for dark, from the shared `ThemeToggle` in `packages/ui/src/components/frame/ThemeToggle.tsx`, which the landing footer (`V0Footer.tsx`) and the header mount. The glyphs swap by CSS (`dark:hidden`, `hidden dark:inline`). A sun or moon icon is wrong (Kevin, 2026-09-28), even where main still draws one (gt-components lists those files).
- No robot, bot or sparkle iconography for AI features (questionnaire avoid list, 2026-08-11).
- Flags come only from `LocaleFlag` or `LocaleTag`: no emoji flags, hand-written `fi fi-xx` classes or flag images (`gt-ui/no-raw-locale-flags`).
- To inventory a page, grep `from 'lucide-react'` under `apps/landing/src` and `packages/ui/src/components` and classify each use.

## Type on the page

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

## Scroll stories

The full-stack band is the model for a story that builds a figure as the reader scrolls (`sections/fullstack/FullStack.tsx` and `fullstack.css` in gt-cloud; `src/app/d/_v0/sections/` in Prototemplate; DESIGN.md sections 13 and 14).

- The story keys on two lines with separate jobs. The read line at 55 percent of the viewport is structural: a beat locks in when the center of its copy block crosses it, and the tower's build clock, the capstone scrub and the sticky figure's seat all key on it. The highlight line at 80 percent belongs to the spotlight alone: a beat's copy lights as its center rises through it, while the arriving layer is still building. In code, `READ_LINE = 0.55` and `HIGHLIGHT_LINE = 0.8`.
- Anchors are measured on the copy itself and from flow geometry. The beat window's top runs about half a viewport ahead of its copy, and anchoring on it made every layer arrive early (Kevin: "each layer arrives too early"). The finale is sticky, so its flow top is the previous beat's bottom; its own rect would read the stuck pose on a refresh mid-dwell. Re-anchor on every ScrollTrigger refresh.
- One scrubbed dial spans the read. A piecewise map from measured lock-ins to story time holds the clock while a row is being read and spends each gap as hold, build, lock, so a layer stands locked before its copy reaches the read line.
- The figure is CSS sticky. JavaScript never positions it ("the diagram keeps moving down as i scroll past agents, which is wrong"). The agents beat gets a dwell runway before the native sticky release carries the figure out with the band.
- At 1020px and below (with at least 500px of height) the band becomes a stage: a CSS-sticky grid that fills the viewport, with the figure in the top 55 percent and one beat's copy in the bottom 45 percent (`grid-template-rows: minmax(0, 11fr) minmax(0, 9fr)`). The tower's width budget `--v0sm-tw` uses the same 0.55 factor, so the split and the factor change together; short windows (500 to 639px tall) rebalance both to 0.5. One ScrollTrigger over the `.v0sm-runway` spacer after the grid is the story clock. The stage's bullets stay 15px / 1.5 because the longest beat must fit the text zone.
- The svh and dvh law sets every stage height. Reach is dvh: whatever must touch the true screen bottom (the stage's rails, the text zone) sizes from `100dvh`. Layout is svh: any height that takes part in layout uses `100svh`, because a dvh layout height grows the document on every browser chrome toggle and the scroll jitters. The difference is the token `--v0sm-bar-gap` (`--v0sm-stage-h` minus `--v0sm-stage-h-stable`, 0 while the URL bar shows), and only overhangs spend it. Anything sized from the stage derives from the stable var.
- Every loop is created paused and plays only while its band is on screen. Under `prefers-reduced-motion` the setup is skipped and the markup pose is the still: the full stack with the first beat lit and the mark's shimmer parked.
- Scrolling is native. `shared/SmoothScroll.tsx` is a pass-through kept as a mount point; no Lenis or Locomotive, no `scroll-smooth`, no `behavior: 'smooth'`, and in-page links jump. Prototemplate exempts only `/present`, the presenter.

## Material

- The hero's field is the studio field: `shared/HeroField.tsx` calls `createStudioField(canvas, { preset: 'bayer8' })` from `apps/landing/src/lib/studio-field.ts`, through one shared GL context. The engine owns the frame loop, resizing and the reduced-motion still, so `destroy()` is the only cleanup.
- The glyph fields come from `packages/ui/src/lib/glyph-field.ts` (imported as `@generaltranslation/ui/lib/glyph-field`), shared since 2026-08-13: the Deploy band's condensation field, the pricing close, the careers rain (`shared/GlyphRain.tsx`) and the enterprise contact bay (through `glyph-rain/sections/band/inkField.ts`). Import the shared engine; app-local copies are not allowed to come back. Its design contract (matter is conserved and the word comes first) is in gt-motion and gt-dither.
- Density ramps use ordered dither from `packages/ui/src/lib/dither.ts` and `DitheredMark` (DESIGN.md section 7). An alpha veil does not count as a ramp.
- New decorative material starts in Glyphfield (glyphfield.com/studio), following gt-cloud's `glyphfield` skill. Copy and buttons stay page content and are never baked into the artwork.
- Marks are drawn: an SVG, a canvas field, `LocadexMark`. A gif is never a mark or a demo frame (Kevin, 2026-08-04: Locadex is never a gif). A mark seated in an isometric face is an alpha mask (gt-isometric).
- A page spends one accent, `--tc-accent: #2f5ce0`; light paper is one white; the one black is the house background; `--tc-panel` is the one dark surface for code, config and diffs. Dark mode is a token remap under `[data-theme='dark'] .toolchain-root` and nothing else. Components take colors from the tokens (`no-hex-colors` checks className and style values). A literal color lives in a stylesheet, such as the ring's gradient and the on-ink faces in `engine.css`, and never in a className or style prop.
- Light mode has no black backgrounds. On `sgdh-root` pages `v0-pages.css` moves the `.tc-band.tcb` feature bands onto paper and turns the panel family into white plates read by their rules (`--tc-panel: #ffffff`, its inks re-bound to black alphas). The Deploy close becomes a white day plate that keeps its ring (`deploy.css`), and the careers and 404 heroes turn to paper with only the black-hole disc keeping its black. A comment in `v0-pages.css` still names Deploy as the one exception; `deploy.css` overrides it.
- Avoid AI gradients ("ugly ai gradients", the blog round of 2026-08-11), glassmorphism, rainbow washes as decoration, flag soup and robot iconography.

## Process

- Work exemplar first: rebuild one section, get Kevin's sign-off on the grammar, then replicate. A full-fleet rebuild on an unconfirmed reading is the failure of 2026-08-04.
- Never iterate on a version Kevin rejected. Restart from the spec, the production content and the praised pieces.
- Explorations stay local. Prototemplate rounds are reviewed on localhost:3005 before anything reaches main, and landing a round is Kevin's call each time (2026-09-14). gt-cloud work goes up as a pull request with screenshots in its body (gt-ship).
- A visual standard ships to every surface that shows it, through `packages/ui`, in one sweep: landing, docs, dashboard, sign-in and admin. Unrelated redesigns stay out of a sweep pull request, so an objection to one does not hold up the other.
- Contrast meets AA. Dim text on the panel is at least 0.5 white on the ink panel and 0.58 black where the light skin turns the panel white (`--tc-panel-dim`). In the language diagrams, `--lang-low` (a 62 percent mix of `currentColor`, `shared/lang.css`) is the quietest tone real text may take. The full-stack tower's cold beats at opacity 0.38 fail AA on purpose as spotlight de-emphasis (2026-08-07); raising them needs Kevin's call.
- Audit every page at five widths (390, 768, 1024, 1440, 1920) in both themes. Take element-level screenshots for review, and check rail and seam work at 2x pixel crops of the junctions; a full-page shot hides a doubled line.
- A port is verified with reduced-motion screenshots and a pixel diff to 0.00 percent. The footer's metal-mark canvas is the one known source of noise (about 0.8 percent).
- Two Prototemplate tools check a page. `node scripts/lint/lines.mjs <url> --theme dark` audits any page at 1440 and 1280 for doubled lines, missing seams and junctions, gt-cloud's landing dev server included. `pnpm check:pages` reads overflow, clipped text, tap targets and layout shift on phones, tablets and desktops in both themes; `--base` and `--pages-module` point it at another site (`scripts/check/pagecheck/README.md`). Both drive Playwright's Chrome for Testing: the page check reads its path from `CHROME_PATH`, and `lint/lines.mjs` hardcodes it in `EXEC` near the top of the script, so edit that line on another machine.

## Review checklist

- [ ] Content matches production, or the toolchain page or mock it was specified from, and nothing is invented.
- [ ] The layout reproduces the spec's composition, with existing diagrams mounted.
- [ ] One rail: no band inside `.tc-rail` draws side rails, a full-bleed band draws its inner pair once from its `-in` column, and nothing draws a second pair beside the column (`gt-ui/single-rail`, `lint-practices` rail checks).
- [ ] Bands are separated by `v0-hatch` or `.tc-hatch`, and the neighbors yield the hatch's edges.
- [ ] Grids are `BentoRow` and `BentoCell`; no cell draws a border along a row seam; framed cells carry `.is-framed`.
- [ ] No translucent background sits under a translucent border, and no two translucent grounds stack.
- [ ] `lint/lines.mjs` reports no doubled lines or junctions in either theme, and 2x crops of the junctions agree.
- [ ] Every head is a heading and at most one lead in a ruled box, at most two lines of display type, with no eyebrow, mono or uppercase tracking (`gt-ui/no-eyebrow`, `gt-ui/mono-is-not-voice`) and no heading period (`gt-ui/no-heading-period`).
- [ ] Every button is `Cta` (`gt-ui/shared-cta`), labels are Title Case (`gt-ui/cta-title-case`), the ring marks the primary action only, and no new `tracked` slug was added.
- [ ] Meaning marks are Heroicons solid, controls are Lucide outline, brand marks are untouched (`gt-ui/icon-tiers`), and the theme switch draws ◐ and ◑.
- [ ] Inter is the only face (`gt-ui/inter-only`), weights stay at 500 or below, heading or paragraph metrics live in engine or band CSS, and none of gt-ui's Geist, semibold or uppercase-label defaults reached the page.
- [ ] Mobile rules consume `var(--tcm-*, <px>)`, sit in the late 720px block, and the v0-pages mobile cut moved with them.
- [ ] In light, no band, panel or close sits on a black background.
- [ ] At 390px: copy is 20px or more from every hairline, tap targets are 44px, no mock crops, no words fuse at a hidden break, and nothing scrolls sideways.
- [ ] Scroll stories key structure on the 55 percent line and the spotlight on the 80 percent line, the figure is CSS sticky, layout heights use svh and reach uses dvh.
- [ ] Scrolling is native (`gt-ui/no-smooth-scroll`), there are no gifs (`gt-ui/no-gif-mark`), and no hex colors outside the sanctioned files (`gt-ui/no-hex-colors`).
- [ ] No em dashes in copy (`gt-ui/no-em-dash`), and money follows the whole-dollar rule.
- [ ] Reduced motion renders a complete still, and loops pause off screen.
- [ ] Contrast passes AA in both themes.
- [ ] Checked at 390, 768, 1024, 1440 and 1920 in light and dark.
- [ ] gt-cloud: `pnpm lint` from the repository root passes (`scripts/check-email-identities.mjs`, which refuses GT email addresses written outside `packages/settings/src/email.ts`, then oxlint with the gt-ui plugin, then `oxfmt --check .`). Prototemplate: `pnpm lint:all` passes.

Related skills: in this set, gt-website (the app around the pages: routes, translation, deploys, the Tailwind traps), gt-voice (the copy), gt-aesthetic (the taste bar and polish), gt-lints (the gt-ui plugin and Prototemplate's lints), gt-components (the `Cta` and Bento APIs, the glyph vocabulary, shared UI), gt-motion (GSAP discipline and the moving type), gt-dither (studio and glyph fields), gt-isometric (the iso kit and seated marks), gt-diagrams (the doubled line), gt-ship (pull requests and screenshots). In the wiki: agent-browser (screenshots and the audit), design-engineering-polish (the final pass), animated-component-libraries (sourcing a component before hand-building one). In gt-cloud: `.agents/skills/gt-landing`, `gt-ui`, `glyphfield`, `react-useeffect`.

## Sources

- Prototemplate: `DESIGN.md` sections 1 (the four colors), 2 (the line law and its ownership rules), 3 (the rails), 4 and 15 (the nameplate's faces), 7 (the 1-bit language), 9 (motion discipline), 12 (the mobile type ladder and the box-air standard), 13 (the svh and dvh law), 14 (the two read lines); `BRAND.md` section 6 (type).
- Prototemplate: `ARCHITECTURE.md` (the SSOT rule, the componentized instruments); `src/lib/directions.ts` (the singularity-dossier and production entries).
- Prototemplate: `src/app/d/toolchain/styles.css` (tokens, the heading reset, `.tc-hatch`, the late 720px block); `src/app/d/_v0/v0-pages.css` (the home's mobile cut); `src/app/d/_v0/sections/FullStack.tsx` and `fullstack.css` (the read lines, the stage tokens); `src/components/shell/Bento.tsx`.
- Prototemplate: `.oxlintrc.json` (the gt-ui rules over the live surfaces); `scripts/lint/practices.mjs` (`outer-rail-pair`, `rail-outer-token`, `retired-rail-vocabulary`); `scripts/lint/lines.mjs`; `scripts/check/pagecheck/README.md` and `scripts/lib/site-pages.mjs` (`CHROME_PATH`); `src/components/shared/SmoothScroll.tsx`.
- gt-cloud: `.agents/skills/gt-landing/SKILL.md` and `references/design.md` (the editing map and the section recipe; rewritten 2026-09-18 in #4886, icon tiers added in #4909, rail and lints in #5007); `.agents/skills/gt-ui/typography.md` (the packages/ui defaults the landing overrides).
- gt-cloud: `apps/landing/src/components/landing/shared/Cta.tsx`; `landing/shell/engine.css` (tokens, `.tc-rail`, `.tc-head`, `.tc-btn` faces, `.tc-cta-ring`, the framed row, the 620px hero cut, the late 720px block, the dark remap); `landing/shell/Bento.tsx`; `landing/shell/SiteFooterMount.tsx`; `landing/home/v0-pages.css` (the five home roots, crosses, `v0-hatch`, square surfaces, the hover hold, the light skin, the mobile cut); `landing/sections/shared/darkband.css` (`.tcb-in`, `.tcb-head`); `landing/shared/lang.css` (`--lang-low`).
- gt-cloud: `landing/sections/locadex/Locadex.tsx` and `locadex.css` (the head example, the masked mark); `landing/sections/developer/Developer.tsx`, `context/ContextSec.tsx`, `global/Global.tsx`, `customers/Customers.tsx` (the other heads); `landing/sections/deploy/Deploy.tsx` and `deploy.css` (the full-bleed inner pair, the ringed close, the light day plate); `pages/careers/careers.css` and `pages/not-found/not-found.css` (the horizon heroes in light); `landing/sections/fullstack/FullStack.tsx` and `fullstack.css`; `landing/home/sections/HomeHero.tsx`; `landing/shared/HeroField.tsx` and `GlyphRain.tsx`; `apps/landing/src/lib/fonts.ts` and `fonts-prose.ts`; `apps/landing/src/app/globals.css`; `apps/landing/src/components/pages/home/HomePage.tsx`; the `className` roots of `apps/landing/src/components/pages/*` and the root `package.json` (`lint`).
- gt-cloud: `tooling/oxlint-plugins/gt-ui.ts` and `.oxlintrc.json` (`single-rail`, `shared-cta`, `cta-title-case`, `no-eyebrow`, `icon-tiers`, `inter-only`, `mono-is-not-voice`, `no-smooth-scroll`, `no-gif-mark`, `no-em-dash`, `no-heading-period`, `no-hex-colors`, `typed-text-var`, `no-raw-locale-flags`); `packages/ui/src/components/frame/ThemeToggle.tsx`; `packages/ui/src/components/pricing/dollar-format.ts`; `packages/ui/src/lib/glyph-field.ts`.
- Claude Code project memory for gt-cloud: `landing-cta-conventions.md`, `landing-icon-rule.md`, `landing-inter-only.md`, `mobile-type-ladder.md`, `redesign-v0-verdict.md`, `k-pages-restart-round.md`, `redesign-fork-architecture.md`, `tailwind-port-conventions.md`, `responsive-audit-round.md`, `lighthouse-round-conventions.md`, `dossier-completed-brand-canon.md`, `brand-questionnaire-directives.md`, `shared-ui-standardization.md`, `explorations-stay-local.md`, `landing-hero-agent-button.md`, `landing-ai-gateway-faq.md`.
- Kevin, 2026-07-31 (one white, the line law, rail ownership); 2026-08-01 (mono is for numbers); 2026-08-04 (the v0 verdict: mocks are literal, two-line heads, exemplar first); 2026-08-06 (the Dossier is the completed direction); 2026-08-07 (the hover hold, the unlayered engine, the contrast floors); 2026-08-08 (the mobile ladder); 2026-08-11 (production content, the toolchain pages as the spec, the questionnaire's avoid list); 2026-08-14 (the shared Cta, the responsive audit); 2026-09-10 (whole dollars); 2026-09-14 (explorations stay local); 2026-09-18 (Inter only); 2026-09-24 and 2026-09-28 (icon tiers, the eleven grammar lints, one rail); 2026-09-30 (one rail in Prototemplate, Setup for Agents); 2026-10-01 (glyph gaps by drawn columns); 2026-10-07 (the shipped site replaces the Dossier as the reference).
