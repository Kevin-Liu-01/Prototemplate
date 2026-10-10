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
  updated: 2026-10-10
  origin: prototemplate
  owner: P
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

### The enterprise page

Kevin's ideal order for the enterprise page (2026-08-15), in this order: governance and SSO, built-in translation review, shared context across teams, forward-deployed support, then the contact form. His verdict on the page built before it: every component beautiful, the structure scattered. A rebuild of the page follows that spine and reuses the existing bands (the governed explorer's gate and review cards, the context fork, the contact bay) rather than new art.

## Rail and bands

The page is one ruled column, and every structural line is drawn once. The full rules with their classes and files are in [references/rail-and-bands.md](references/rail-and-bands.md); these are the ones a reviewer checks first.

- `.tc-rail` draws the column's two lines once as a border. A band inside it draws no side rails and only its bottom rule; a full-bleed band draws its own inner pair at the column edges and never adds a pair beside the column.
- The outer pair at plus or minus 10px is retired (Kevin, 2026-09-28: "make sure there's no rules that lead to two side rails"). The column's lines are "the page's rail pair, drawn once"; "outer pair", "outer rail" and "doubled rails" fail `retired-rail-vocabulary`.
- Hatch spacers separate home bands (`.v0-hatch`) and rows inside a section (`.tc-hatch`), and the hatch owns both of its edges.
- On `sgdh-root` pages a registration cross sits at each seam where it meets the rail, and the root sets `overflow-x: clip`, never `overflow: hidden`.
- The row owns every seam: `BentoRow` and `BentoCell`, a `gap-px` grid over the hairline ground, cells with no border props, no reveal beside a rail, `background-clip: padding-box` against the self-stack, no floating bordered cards and no heads floating in whitespace. Structural surfaces on `sgdh-root` pages are square; controls keep small radii.

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

Detail is in [references/type-on-the-page.md](references/type-on-the-page.md).

- Inter is the only typeface (Kevin, 2026-09-18, gt-cloud #4887): rsms InterVariable v4.1 as `--font-sans`, with the italic only on prose routes. Mono is the engine's system stack `--tc-mono` or Geist Mono (`font-mono`), and only for strings that carry numerals: measurements, values, code (Kevin, 2026-08-01).
- Headings h1 to h4 are weight 500 at every size. gt-ui's packages/ui defaults (Geist, `font-semibold`, uppercase tracked labels) do not hold on a landing page.
- Heading and paragraph metrics live in the engine CSS, whose unlayered resets beat Tailwind utilities on h1 to h4 and p without a warning; put them in the band's stylesheet or space siblings with a gap (2026-08-07).
- Under 720px type and spacing come from the `--tcm-*` ladder in the engine's late 720px block, read as `var(--tcm-X, <fallback>)`; the `sgdh-root` mobile cut outranks the engine, so a raise changes both in one commit. Mobile is designed for the phone, copy keeps 20px from any hairline, tap targets are 44px, and an authored `<br />` needs `{' '}` before it.
- Rendered copy has no em dashes; pricing shows whole dollars without cents and cent prices with two decimals (Kevin, 2026-09-10); mocks read complete at 390px.

## Scroll stories

The full-stack band is the model for a story that builds a figure as the reader scrolls; its mechanics are in [references/scroll-stories.md](references/scroll-stories.md).

- Two lines with separate jobs: the read line at 55 percent locks beats and keys the build, and the highlight line at 80 percent lights the copy (`READ_LINE`, `HIGHLIGHT_LINE`). Anchors are measured on the copy and from flow geometry, and re-anchored on every refresh.
- The figure is CSS sticky and JavaScript never positions it. Below 1020px the band becomes a stage of figure over copy.
- The svh and dvh law: what must reach the true screen bottom sizes from `100dvh`; any height that takes part in layout uses `100svh`.
- Every loop is created paused and plays only on screen; reduced motion skips the setup and the markup pose is the still.
- Scrolling is native everywhere except Prototemplate's `/present`: no smooth-scroll library, no `scroll-smooth`, no `behavior: 'smooth'`.

## Material

The hero's field is the studio field (`createStudioField`, preset `bayer8`, one shared GL context); glyph fields import the shared `packages/ui` engine and app-local copies never come back; density ramps are ordered dither, never an alpha veil; new decorative material starts in Glyphfield; marks are drawn, never a gif, and a mark in an isometric face is an alpha mask. A page spends one accent, dark mode is a token remap, a literal color lives in a stylesheet and never in a className or style prop, light mode has no black backgrounds, and AI gradients, glassmorphism, rainbow washes, flag soup and robot icons are refused. The full rules are in [references/material.md](references/material.md).

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

Related skills: in this set, gt-website (the app around the pages: routes, translation, deploys, the Tailwind traps), gt-voice (the copy), gt-aesthetic (the taste bar and polish), gt-lints (the gt-ui plugin and Prototemplate's lints), gt-components (the `Cta` and Bento APIs, the glyph vocabulary, shared UI), gt-motion (GSAP discipline and the moving type), gt-dither (studio and glyph fields), gt-diagrams (the doubled line, and the iso kit and seated marks in `references/isometric.md`), gt-ship (pull requests and screenshots). In this set, gt-verify (screenshots and the audit in a real browser). In the wiki: design-engineering-polish (the final pass), animated-component-libraries (sourcing a component before hand-building one). In gt-cloud: `.agents/skills/gt-landing`, `gt-ui`, `glyphfield`, `react-useeffect`.

## Sources

Dated provenance for every rule is in `references/sources.md`: the gt-cloud engine and page files, the Prototemplate prototypes and canon, the lints, and Kevin's dated directives with the memory notes that recorded them.
