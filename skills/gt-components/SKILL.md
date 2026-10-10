---
name: gt-components
description: >-
  The components General Translation work reuses before writing new ones:
  gt-cloud's packages/ui (header, footer, theme toggle, language selector,
  LocaleFlag, ScrollArea, Button), the landing's Cta and Bento primitives, the
  gt-ui design rules and the oxlint rules that hold them, the icon tiers, the
  React and translation rules, Prototemplate's instruments library (dither,
  studio field, glyph field, DoubledLine, EdgeGlobe, LocaleTag, RevealSeam,
  EverySentence) and its viewer shell, and when an outside library is the
  right call. Use when building or reviewing UI in gt-cloud or Prototemplate,
  or before adding a component.
metadata:
  title: Components to reuse
  areas: components, landing, website
  updated: 2026-10-06
  origin: prototemplate
---

# Components to reuse
General Translation (GT) builds its interfaces from components that already exist in two repositories. gt-cloud is GT's product monorepo. It holds the marketing site generaltranslation.com and the docs in `apps/landing`, the product dashboard in `apps/dashboard`, and the UI they share in `packages/ui` (the workspace package `@generaltranslation/ui`). Prototemplate is the design hub of Kevin, GT's founder. It holds the brand deck, the prototypes of the site, the signature visuals as components, and the viewer shell around its own pages. This skill names the components with their files and props, states the rules that hold them, and sets the order to search before anything new is written. A component that two apps need lives in gt-cloud's packages/ui.

Paths are written relative to a gt-cloud checkout at origin/main (`$GT_CLOUD` here) or a Prototemplate checkout (`$PROTOTEMPLATE`). gt-cloud's own skills in `$GT_CLOUD/.agents/skills` (gt-ui, gt-landing, gt-dashboard, react-useeffect, react-best-practices) stay authoritative for gt-cloud's file maps; read the app's skill before editing that app.

## References

- `references/icons.md` holds the icon tiers, the glyph vocabulary, the dashboard mapping and Prototemplate's chrome icons.
- `references/instruments.md` lists every instrument with its Prototemplate and gt-cloud paths, its interface and the lifecycle contract.
- `references/react.md` holds the effect table, the code shape rules, the translation rules and the Prototemplate differences.
- `references/behavior.md` holds how product UI behaves once built: honesty and recovery, hover and click, chrome, selectors, copy to clipboard, forms, lists and tables, layout shift, agent-facing surfaces, recreations, embedded previews and accessibility.

## Reuse order

Search in this order and stop at the first fit.

1. **The app's own components.** Run `rg -n "export (default )?(function|const) <Name>\b" apps/<app>/src` in gt-cloud, or the same over `src/components` and `src/app` in Prototemplate. Search by role words too (`rg -il "tooltip|popover"`), since a component may carry another name.
2. **packages/ui.** The frame, the primitives, the house marks, the hooks and the shared engines. Run the same search over `packages/ui/src`. Import by file path: `@generaltranslation/ui/components/ui/button`. The package root re-exports a few primitives from `src/index.ts`, and gt-cloud's CLAUDE.md bans barrel files, so new code uses the file path.
3. **The instruments library.** Fields, marks, diagrams and morphs, registered in `$PROTOTEMPLATE/src/app/craft/libraries.ts` and carried in production by the landing. Mount the component. Page code never re-implements an instrument's behavior.
4. **An outside source.** Route through animated-component-libraries, a general skill in Kevin's wiki. In gt-cloud the behavior layer is Radix through the shadcn `radix-vega` set, so focus, overlay, menu, select, popover and dialog logic comes from there first. Read the exact payload, its dependencies and its license before installing, and never bulk-add a registry. Retokenize anything brought in before it merges: Inter, the semantic tokens, `rounded-md`, the icon tiers, native scrolling, a still under reduced motion, and a cleanup on unmount.

A new primitive goes in one of two places, and both `components.json` files keep the same settings.

- A primitive for the dashboard alone is generated with `cd apps/dashboard && pnpm dlx shadcn@latest add <component>`.
- A primitive for more than one app goes in `packages/ui/src/components/ui/`.
- Keep the `radix-vega` preset, the `neutral` base and CSS variables on. Style through CSS variables and utilities layered on the generated file, and leave the generated base as shadcn wrote it.
- `components.json` sets `iconLibrary: "lucide"`, so a generated file imports Lucide glyphs. A generated glyph that carries meaning must become its Heroicons solid equivalent before `gt-ui/icon-tiers` passes (see Icons below).

## The packages/ui inventory

`$GT_CLOUD/packages/ui/src`, on origin/main, 2026-10-05.

| file | export | what to know |
| --- | --- | --- |
| `components/frame/NewHeader.tsx` | `Header` | The header of the marketing pages, the blog and the 404 page (`(home)/layout.tsx`, `blog/layout.tsx`, `not-found.tsx` in the landing). The nav links live here, so a header change is a packages/ui change. Props `footer` (the landing passes `false` and mounts its own footer through `SiteFooterMount`) and `themeToggle`. The docs do not use it: they render fumadocs' `DocsLayout` from `@generaltranslation/ui/fumadocs/index`. |
| `components/frame/NewFooter.tsx` | `Footer` | `showThemeToggle`, `showLanguageSelector`. Its theme control on main is the fumadocs Sun and Moon toggle; do not copy it. |
| `components/frame/ThemeToggle.tsx` | `ThemeToggle` | The ◐ / ◑ switch. Props `className`, `labeled`, `label`. Writes the shared `gt_theme` cookie, then calls `setTheme`. |
| `components/frame/LanguageSelector.tsx` | default, and `LanguageToggle` | `dropdownPosition` (`above` default, `below`), `variant` (`full` default: the Lucide `Languages` glyph, the language name, a chevron; `compact`: flag and code). Rows are `LocaleFlag` plus the display name in a `ScrollArea`. The landing footer, the docs sidebar footer, the mobile menu and the dashboard's plate pages all use the `full` form; Kevin rejected the compact form on the plate pages (2026-09-25). |
| `components/frame/Search.tsx`, `Logo.tsx`, `DashboardButton.tsx`, `Status.tsx` | | Docs search on pagefind, the GT logo, the dashboard link, the status line. |
| `components/ui/button.tsx` | `Button`, `buttonVariants` | Variants `default`, `rainbow`, `outline`, `secondary`, `ghost`, `destructive`, `link`, `bare`; sizes `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`, `none`; `loading`; `asChild`. |
| `components/ui/LocaleFlag.tsx` | default | The only flag renderer: the flag-icons sprite span for `getLocaleFlagCountryCode(locale)`, `aria-hidden`, nothing for a locale without a flag. |
| `components/ui/LocaleLabel.tsx` | default | Flag plus the language name with its region code. |
| `components/ui/scroll-area.tsx` | `ScrollArea` | The scrollbar for every scroller React renders. The height bound goes on `viewportClassName`. |
| `components/ui/*` | | The shadcn set plus `copy-snippet` (masks secrets from session replay), `code-ide-tabs`, `localized-date-time` (UTC mode for billing periods), `animated-ellipsis`, `reorder`, `date-range-picker`, `toc`. |
| `components/icons/*` | | The house marks `LocadexMark` and `PlugIcon` (both take `SVGProps<SVGSVGElement>`), `PythonLogo`, and the model logos, which take the `BrandMark` props (`size`, `variant` brand or monochrome, `title`). A new house mark goes here. |
| `hooks/use-mount-effect.ts`, `hooks/use-mounted.ts` | `useMountEffect`, `useMounted` | The sanctioned effect and the hydration guard. |
| `lib/dither.ts`, `lib/glyph-field.ts`, `lib/picture-field.ts` | | The engines the landing and the dashboard share. |
| `css/shared.css` | | Tokens as HSL triples under `:root` and `.dark`, the `typo-*` utilities, the page scrollbar, `.gt-scrollbar`. |

**Scrollbars.** A scroller React renders uses `ScrollArea`. A container React does not render (the fumadocs sidebar, a TOC, a code block, a third-party popover) takes the `.gt-scrollbar` class; `shared.css` also styles `.fd-scroll-container` and the thumbs of Radix scroll areas the apps do not own. Containers set to `scrollbar-width: none` stay hidden. PR #4671, the sweep that applies the class to every remaining `overflow-*-auto` container, is open on 2026-10-05; a sweep must tag template-literal class strings that a plain regex misses.

**Tokens in CSS.** The packages/ui tokens are HSL triples. Read them as `hsl(var(--border))`; a bare `var(--border)` is an invalid color. The dashboard's `globals.css` imports `shared.css`, the fumadocs sheets, `shadcn/tailwind.css` and `brand-tokens.css`; gt-ui's `shadcn-preset.md` still says the dashboard defines OKLCh tokens, which main no longer does.

## gt-ui rules

From `$GT_CLOUD/.agents/skills/gt-ui`, for packages/ui, the dashboard and the landing. The lint column names the rule in `tooling/oxlint-plugins/gt-ui.ts`; `.oxlintrc.json` turns it on for all three unless the row says otherwise.

| area | rule | lint |
| --- | --- | --- |
| Radius | `rounded-md` on every surface: buttons, inputs, menus, cards, dialogs, tooltips, badges, banners. Directional `-md` variants for a composed control. `rounded-full` only for avatars, switches, sliders, scrollbar thumbs and status dots. `rounded-none` only for flush rows, tab strips, segmented controls and adjacent cards sharing borders. `rounded-[inherit]` for a child that clips to its parent. A library that takes no class gets `var(--radius-md)`. | `consistent-radius` |
| Color | Black and white plus five approved colors: rainbow, which exists only as the `rainbow` button variant; blue `emphasis` for emphasis only; green `status-success`; orange `status-in-progress`; red `status-error` and `destructive`. A status token (including `status-warning`, amber) is used only for its meaning. Semantic tokens only (`bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`), opacity by slash (`bg-emphasis/80`). Third-party brand marks keep their own colors. Flags go through `LocaleFlag`: `colors.md` still allows emoji flags from `getLocaleEmoji`, and `gt-ui/no-raw-locale-flags` refuses them, so the lint wins. | `no-raw-tailwind-colors`, `no-hardcoded-black-white`, `no-raw-locale-flags`; `no-hex-colors` on the landing and packages/ui |
| Buttons | `Button` for every button in the dashboard and packages/ui. `rainbow` on the single most important action of a page, paired with `outline`. `loading` is wired to the in-flight state of async actions only. A spinner is never placed in a button by hand, and `loading` is never combined with `asChild`. The landing uses `Cta`. | |
| Spacing | The parent owns the space between its direct children with `gap-*` or `space-*`. Repeated main-axis margins on siblings are refused. | `prefer-parent-owned-spacing` |
| Surfaces | No `Card` inside a `Card`. Group with `CardHeader`, `CardContent`, headings and spacing, or make the inner content a sibling Card. Inputs, tables, alerts and segmented controls keep their own structure inside a Card. | `no-nested-surfaces` |
| Weight | No `font-light` or `font-thin`, no inline weight under 400. | `no-thin-font` |
| Dark mode | Tokens switch under `.dark`. `dark:` only where a token lacks the control (`dark:border-input` on outline buttons). No `useTheme()` or `resolvedTheme` to choose markup; swap with CSS. `ThemeToggle` uses the resolved theme for its label and its next value, behind `useMounted`, and swaps the glyph with CSS. Test both modes. | |
| Type in copy | No em dash, no trailing period on a heading, mono never sets a heading or a paragraph, `text-[var()]` typed as `length:` or `color:`. | `no-em-dash`, `no-heading-period`, `mono-is-not-voice`, `typed-text-var` (landing and packages/ui) |

**Type, per app.** gt-ui's `typography.md` names Geist for the sans and `font-semibold` for headings. What ships differs, so check the app's font module before choosing a face or a weight:

- The landing (`apps/landing/src/lib/fonts.ts`) and the dashboard (`apps/dashboard/src/app/[locale]/layout.tsx`) load rsms Inter v4.1 variable as `--font-sans` and Geist Mono as `--font-mono`. `gt-ui/inter-only` refuses any other face on the landing and packages/ui (Kevin, 2026-09-18: Inter is the landing's only face, PR #4887). The landing's `shell/engine.css` caps h1 to h4 at weight 500.
- The dashboard's plate pages cap heading weight at 500 and set tracking on the deck's curve through `apps/dashboard/src/app/brand-tokens.css` (Kevin, 2026-09-25 and 2026-09-28).
- Prototemplate loads the rsms InterVariable through `src/lib/fonts.ts` as `--font-inter`, weight 500 at most in chrome, with the sidebar nameplate's Fraunces and Space Grotesk as the one exception (DESIGN.md section 15). The gt-brand skill holds the type system.
- Body text is at least `text-sm`, the root is `antialiased`, and muted text uses `text-muted-foreground` with no opacity utility.

**Product surfaces.** On the redesigned dashboard surfaces Kevin judges every component against the brand deck (2026-09-25: "too busy", "no ugly border lines", "use shaders that have our dither applied"). Content sits in ruled rows with one rule per seam. Boxed tiles, shadows, chevrons on groups and uppercase mono labels are refused, and mono is kept for ids and code. The one material on the plate pages (sign-in, onboarding, consent, device, CLI) is the dithered field that `apps/dashboard/src/components/frame/PlateRoot.tsx` mounts: `components/brand/FieldStack.tsx` drives the packages/ui dither loop, with the globe on sign-in and the mood pictures from `moodPictures.ts` (through packages/ui's `lib/picture-field.ts`) on onboarding. Patterns, border plates and heavier forms are refused. The gt-aesthetic skill carries the rest.

## The landing's primitives

`$GT_CLOUD/apps/landing/src/components/landing/`. These are the landing's component APIs. The gt-landing-pages skill holds how a page uses them (ring placement, label wording, section heads, the rail, native scrolling), and gt-cloud's gt-landing skill holds the file map and the section recipe.

**Cta** (`shared/Cta.tsx`) is the landing's one button (`gt-ui/shared-cta` refuses `tc-btn` markup anywhere else).

- Props: `variant` (`solid`, `outline`, `on-ink-solid`, `on-ink-outline`), `ring` (the rainbow ring, `.tc-cta-ring`), `size` (`sm` 32px, `md` 38px default, `lg` 44px), `href`, `external`, `tracked`, `type`, `disabled`, `onClick`, `className`.
- It renders a `Link`, a plain anchor (external, `mailto:`, `tel:`), a `TrackedLink` or `TrackedAnchor` (tracked), or a `<button>` when `href` is absent. `disabled` exists only on the button form; hide or swap a link instead.
- `tracked` takes an existing PostHog `cta_clicked` location slug. The slugs are frozen, and a new one needs Kevin's approval. Labels are Title Case (`gt-ui/cta-title-case`).

**BentoRow and BentoCell** (`shell/Bento.tsx`) lay out a grid of cells under the line law.

- `BentoRow` owns every seam: `gap-px` over the `--tc-hair` ground. Props `cols` (any `grid-template-columns`, such as `'7fr 5fr'`), `eqHeads` (default true, aligns cell heads), `headH`, `className`. Below `lg` it collapses to one column on the same gaps.
- `BentoCell` has no border props. Props `cell` (variant classes such as `is-tall`), `framed` (default true: mounts `.tc-card` and always carries `.is-framed`), `headClass`, `title` (an h3), `sub` (a p), `head`, `style`. The class grammar `.tc-cell`, `.tc-card` is a contract each band's stylesheet styles.
- gt-cloud deleted its `Rails` component in #5007, and the gt-landing skill's structure line still lists it. Prototemplate's `src/components/shell/Bento.tsx` keeps `Rails` for a full-bleed band outside a wrapper.

**LocaleTag** (`shared/LocaleTag.tsx`) renders a bare locale code: `LocaleFlag` and the code in a `.lct` span. The host supplies the chip.

**Fields and marks.** `HeroField.tsx` (the studio field, preset `bayer8`), `GlyphRain.tsx` (`createGlyphField` with `drift: 'rise'`, `copy: 'none'`), `InkField.tsx`, `DitheredMark.tsx`, `DitheredLedgerMark.tsx`, `OrbitHorizon.tsx`. `GtLogoText.tsx` sets the GT mark inline in a sentence with hidden text for readers and copy.

**SmoothScroll** (`shared/SmoothScroll.tsx`) is a pass-through that returns its children. It stays as a mount point; scrolling is native.

## Icons

The full vocabulary and mapping are in `references/icons.md`.

- **Meaning** (a card, a feature, a destination, a section or package mark, a status): Heroicons from `@heroicons/react/24/solid`, sized with a class; `16/solid` only inline with text.
- **Control** (search, copy, chevrons, arrows, close, plus, menu, loaders, the theme and language switches): Lucide outline, on `CONTROL_LUCIDE_GLYPHS` in `tooling/oxlint-plugins/gt-ui.ts`. Extend that set to add a control.
- **Brand**: `@icons-pack/react-simple-icons`, the marks in `packages/ui/src/components/icons`, masked logo files. Locadex is drawn with `LocadexMark`, and a brain glyph is wrong for it. Integrations is the house `PlugIcon`.
- Type an icon slot `ComponentType<SVGProps<SVGSVGElement>>`. No `LucideIcon` type, no namespace import, no Heroicons outline or 20/solid set in gt-cloud.
- `gt-ui/icon-tiers` covers the landing and the frame, layout, mobile, fumadocs, pricing, dialog and animated folders of packages/ui. PR #5029 (open on 2026-10-05) widens it to the whole dashboard.
- **Theme**: the circle glyphs ◐ (light) and ◑ (dark) (Kevin, 2026-09-28). A sun or a moon glyph is refused. Use `ThemeToggle`. Main still draws Sun and Moon in packages/ui's `components/fumadocs/theme-toggle.tsx` (the footer's toggle) and the dashboard's `header/ThemeSelector.tsx`, and `Sun`, `Moon` and `Monitor` sit on the control allowlist, so main's lint passes them. `gt-ui/no-theme-icons`, which refuses Sun and Moon imports, exists only on the open #4977 branch (`k/dashboard-shell-ia`); it is on neither main nor #5029.
- **Prototemplate chrome**: Heroicons 20 solid inlined in `src/components/viewer/icons.tsx` at 16px, the one icon family in chrome; the theme button's half discs are the one text glyph.

## React and translation rules

Detail and examples in `references/react.md`.

- No direct `useEffect` (`gt-ui/no-use-effect`). Derive during render, handle events in handlers, reset with `key`, fetch with `useQuery`, and use `useMountEffect` for a one-time external sync on mount. A conditional mount effect becomes a wrapper and a child.
- `useMounted` guards client-only values during hydration.
- Engines mount through `useGSAP` or `useMountEffect` and return `destroy()`.
- No `import()` (`gt-ui/no-dynamic-import`), no barrel files, no `any`, no explicit `unknown`, `type` aliases for props, one default-exported component per file, `data-testid` on components a test drives.
- One `<T>` around the largest static JSX block; never nested; dynamic values through `Var`, `Num`, `DateTime`, `Plural` and `Branch`; user-facing props through `gt()`. `const gt = useGT();` in a client component, `const gt = await getGT();` from `gt-next/server` in an async one.
- An internal error string never reaches the UI. Show one translated sentence the user can act on.
- Prototemplate's `useMountEffect` (`src/lib/use-mount-effect.ts`) defers cleanup one task to survive StrictMode's double run; gt-cloud's is a plain `useEffect(effect, [])`. Keep each repository's own.

## The instruments library

The signature visuals as components and engines. Full table, interfaces and gt-cloud counterparts in `references/instruments.md`.

| instrument | Prototemplate entry point |
| --- | --- |
| dither | `src/lib/dither.ts` (`createDitherLoop`, field factories, combinators) |
| studio field | `src/lib/studio-field.ts` with `src/components/shared/StudioField.tsx` (`BAYER_PRESETS`, default `'02'`) |
| glyph field | `src/lib/glyph-field.ts` (`createGlyphField`) |
| horizon field | `src/lib/horizon-field.ts` (`createHorizonField`) |
| prismatic field | `src/components/shared/PrismaticField.tsx` |
| iso kit | `src/app/d/toolchain/diagrams/iso.ts` (`project`, `IsoPrism`, `plane`, `markPath`) |
| DitheredMark | `src/app/d/toolchain/diagrams/DitheredMark.tsx` |
| DoubledLine | `src/components/shared/diagrams/DoubledLine.tsx` |
| EdgeGlobe | `src/app/d/toolchain/diagrams/EdgeGlobe.tsx` |
| LocaleTag | `src/app/d/toolchain/components/LocaleTag.tsx` |
| RevealSeam | `src/app/d/toolchain/sections/RevealSeam.tsx` |
| EverySentence | `src/components/shared/EverySentence.tsx` |
| TranslateWindow | `src/app/d/_v0/TranslateWindow.tsx` |
| FullStack | `src/app/d/_v0/sections/FullStack.tsx` |

In gt-cloud, `dither`, `glyph-field` and `picture-field` are shared from `packages/ui/src/lib`; the studio, horizon and prismatic engines live in `apps/landing/src/lib`; the hero carries the sentence morph inline in `HomeHero.tsx`.

The lifecycle contract for every mounted instrument: mount lazily behind an IntersectionObserver, pause offscreen and on a hidden tab, draw one still under `prefers-reduced-motion`, release everything in `destroy()` (shared GL contexts persist for the session), and re-resolve ink when the theme flips.

When an engine gains an option or changes behavior, the same round updates its `/craft` entry in `src/app/craft/libraries.ts` (body and snippet) and its row in `docs/LIBRARIES.md`.

## Prototemplate's viewer shell

The chrome around every Prototemplate page, in `$PROTOTEMPLATE/src/components/viewer/`. Its tokens are in `tokens.css`; its rules are DESIGN.md section 2 ("Line law for chrome"), section 15 (the five chrome exceptions) and section 16 (the sidebar's rows). The table below is the inventory. The prototemplate skill covers how a route mounts the shell and feeds it data.

| component | role |
| --- | --- |
| `ViewerShell.tsx`, `shell-context.ts`, `useShellKeys.ts` | The shell, the shared state, the one key table (the help card reads `shellKeyRows`). |
| `Toolbar.tsx` | The 52px bar: list toggle, paging, search, the route's controls, the mode seg, Index, Theme, Present, Fullscreen, Copy link, Help. |
| `ToolButton.tsx` | Every control: a `.pt-ib` button with `type="button"` and a title naming its key; with no label it is the 32px icon square. |
| `Seg.tsx` | The segmented control, generic over its value type, with one sliding indicator. |
| `Sidebar.tsx`, `SidebarFilter.tsx`, `ListRow.tsx` | The site map. Every row is a link to a page; route sections nest under their page row; the current page is always marked. `ListRow` gives `role="button"` rows native Enter and Space. |
| `Sheet.tsx`, `SheetFrame.tsx`, `BookView.tsx` (`BookHead`), `GridView.tsx`, `ThumbShot.tsx` | The stage, the book and grid modes, the book head, captures with light and dark twins swapped by CSS. |
| `Search.tsx`, `IndexPanel.tsx`, `PreviewLayer.tsx` | The ⌘K palette over `src/lib/search-index.ts`, the index panel over `src/lib/surfaces.ts`, and the one hover preview: any element with `data-preview="<surface id>"` gets a capture. |
| `Toast.tsx`, `HelpCard.tsx`, `Progress.tsx`, `DirectionCorner.tsx` | Notices (`useToast`), the key card, the 2px progress line, the floating chrome on `/d` pages (hidden under `?chrome=0`). |
| `GtMark.tsx`, `GtWord.tsx`, `PtMark.tsx`, `ThemeButton.tsx`, `icons.tsx` | The GT mark; `GtWord` sets every standalone "GT" in rendered prose as the mark (`gtText()` for strings that arrive as data); the Prototemplate mark; the theme button; the icon set. |

A component added to chrome reuses these parts and follows these rules.

- A new control is a `ToolButton`; a new option group is a `Seg`; a glyph comes from `icons.tsx`; a hover capture is a `data-preview` attribute.
- Corners come from the radius tokens: shells square, controls and cards at 6px, a part inside a control at 5px, chips at 4px (DESIGN.md section 2, Corners; `pnpm lint:radius`). Weight 500 at most and Inter, except for the five elements DESIGN.md section 15 lists (the search pill's hover border, its key chip, Present, the Prototemplate mark, the sidebar nameplate). Colors come from `tokens.css`, and borders take the three roles only: `--pt-hair` structural, `--pt-hair-soft` rows, `--pt-edge` frames of pictures. Where two bordered components touch, one draws the line (the junction table in DESIGN.md section 2).
- One thin scrollbar in chrome, owned by `.pt-scroll` in `tokens.css`.
- The theme is `data-theme` on `<html>` under the `gt-theme` key, dark by default.
- `pnpm lint:shell` refuses raw colors in `src/components/shell`, `src/components/viewer` and two toolchain bento files; `pnpm lint:lines:shell` audits the drawn lines against the dev server on port 3005. The gt-lints skill covers both.

`src/components/shared` holds the other cross-page pieces, among them `StudioField`, `PrismaticField`, `HeroFieldSwitcher`, `TcMobileNav` and `diagrams/`, plus `FeatureBento`, `StorySection` and `LanguageWheel`, which nothing mounts and which stay as reference, and `src/components/shell/Bento.tsx` the Prototemplate copy of the bento primitives. `src/components/plate` is a port of the dashboard's sign-in and onboarding pages with its own `ui/` copies and a `gt-next` shim; it follows the dashboard source.

## Standardization

Kevin's rule (September 2026): a cross-cutting UI change ships to every user-facing interface through shared components in packages/ui ("the locale changes and scrollbar changes should be throughout any user seeing interface - and should all use shared consolidated components").

1. Put the standard in packages/ui: a component, a class in `shared.css`, or a house mark in `components/icons`.
2. Inventory every app before the PR: the landing, the docs, the dashboard, sign-in and admin. Grep for the old pattern, including class strings built in template literals.
3. Sweep all of them in one PR. A fix to one surface alone is incomplete.
4. Keep unrelated redesigns out of the sweep PR, so an objection to one change does not block the other.
5. Respect owners. The navbar has an owner; the locale-selector redesign was pulled from the scrollbar sweep at that owner's request (2026-09-14). A navbar or locale-switcher redesign needs the owner's sign-off.
6. Hold the standard with a lint: a rule in `tooling/oxlint-plugins/gt-ui.ts`, tests in `gt-ui.test.ts`, scope in `.oxlintrc.json` overrides. Prototemplate runs a copy at `scripts/lint/oxlint-plugins/gt-ui.ts` through `pnpm lint:code`; on 2026-10-05 the copy lags main's `inter-only` first-family check, so recopy it when a rule changes.
7. After merging a branch that adds a dependency to packages/ui, run `pnpm install --frozen-lockfile --prefer-offline` in every worktree.

## Behavior

The components above say what to build with. Kevin's behavior rules, set across the dashboard, onboarding, the landing and GT's tools, say how the result acts. `references/behavior.md` holds all twelve with their dates, and seven of them are summarized here.

- **Honesty.** No offer or capability shows before the backend delivers it ("we only show it if we actually do it", 2026-09-29), and a failed or expired resource offers a way back.
- **One interaction.** Hover reveals, click pins, leaving hides, Escape closes. A highlight turns blue and never scales or shifts layout.
- **Selectors.** Custom dropdowns with real icons or flags, flags only through `LocaleFlag` or `LocaleTag`, locale selectors with flags and short codes.
- **Copy to clipboard.** The icon shows the state (the check turns blue) and the label never changes; the state is announced and holds about 1.6 s.
- **Forms.** Inputs are 16px or larger under `md` so iOS does not zoom, and a third-party form takes the house field look through its appearance API.
- **No shift.** Reserve the largest state, fix row heights and line counts, and fade heavy visuals in.
- **Accessibility.** Icon-only controls have names that match their action, labels are selectable, and state changes are announced (2026-09-02).

## Review checklist

- [ ] The component was searched for in the app, packages/ui and the instruments before it was written; a component two apps use lives in packages/ui.
- [ ] Imports use file paths, with no barrel and no `import()`.
- [ ] Every surface is `rounded-md` (or one of the listed exceptions); no Card sits in a Card; parents own sibling spacing.
- [ ] Colors are semantic tokens; no raw Tailwind color, hex, `text-white` or `bg-black`; blue means emphasis and the status colors mean status.
- [ ] Buttons are `Button` (dashboard, packages/ui) or `Cta` (landing); one rainbow at most per page; async buttons use `loading`; Cta labels are Title Case and `tracked` slugs are existing ones.
- [ ] The face is Inter with Geist Mono for code; no thin weights; heading weight follows the app (500 on the landing's engine pages, the dashboard's plate pages and in Prototemplate).
- [ ] Meaning marks are Heroicons solid, controls are Lucide on the allowlist, brand marks are their own; the theme control is ◐ ◑.
- [ ] Flags render through `LocaleFlag` (gt-cloud) or `LocaleTag`; no emoji flag, flag image or hand-written `fi` class.
- [ ] Scrollers use `ScrollArea` or `.gt-scrollbar` (`.pt-scroll` in Prototemplate chrome); scrolling is native.
- [ ] No direct `useEffect`; no theme read in markup; dark mode works by tokens and was checked in both themes.
- [ ] Static copy sits in one `<T>`; props go through `gt()`; no internal error string reaches the UI.
- [ ] Behavior follows `references/behavior.md`: nothing is offered before the backend delivers it, hover and click are one interaction, copy shows its state on the icon, inputs are 16px or larger under `md`, nothing shifts, and icon-only controls have accessible names.
- [ ] An instrument is mounted from its component, honors the lifecycle contract, and an engine change updated its `/craft` entry.
- [ ] Rails and seams are drawn once: the row owns the seam, the wrapper owns the rails, cells draw no borders.
- [ ] The lints pass: `pnpm lint` at the gt-cloud root (an email identity check, `oxlint --quiet .` with the gt-ui plugin, then `oxfmt --check .`), or `pnpm exec oxlint --quiet <path>` from the root for one folder; `pnpm lint:all` in Prototemplate (it includes `lint:lines:shell`, which needs the dev server on port 3005).

## Related skills

General skills from Kevin's wiki: animated-component-libraries (outside sources and their order), design-engineering-polish, agent-browser (checking a component in both themes and at phone width). GT skills in this set: gt-lints (every rule and how to run it), gt-aesthetic, gt-brand (the type system), gt-landing-pages, gt-dither, gt-diagrams, gt-isometric, gt-verify (proving behavior in the running app), prototemplate. gt-cloud: gt-dashboard `references/conventions.md` (dashboard data, forms and tables).

## Sources

- gt-cloud: .agents/skills/gt-ui/SKILL.md, border-radius.md, buttons.md, colors.md, dark-mode.md, nested-surfaces.md, sibling-spacing.md, typography.md, shadcn-preset.md; .agents/skills/react-useeffect/SKILL.md; .agents/skills/gt-landing/SKILL.md; CLAUDE.md ("Code Style"); package.json (`lint`); tooling/oxlint-plugins/gt-ui.ts; .oxlintrc.json; packages/ui/package.json and components.json; apps/dashboard/components.json; packages/ui/src/components/frame/NewHeader.tsx, NewFooter.tsx, ThemeToggle.tsx, LanguageSelector.tsx; packages/ui/src/components/ui/button.tsx, LocaleFlag.tsx, scroll-area.tsx; packages/ui/src/components/icons/BrandMark.tsx, LocadexMark.tsx, PlugIcon.tsx; packages/ui/src/fumadocs/index.ts; packages/ui/src/hooks/use-mount-effect.ts; packages/ui/src/css/shared.css; apps/landing/src/app/[locale]/(home)/layout.tsx, blog/layout.tsx, not-found.tsx, docs/layout.tsx; apps/landing/src/components/landing/shared/Cta.tsx, LocaleTag.tsx, HeroField.tsx, GlyphRain.tsx, SmoothScroll.tsx; apps/landing/src/components/landing/shell/Bento.tsx, V0Footer.tsx; apps/landing/src/lib/fonts.ts; apps/dashboard/src/app/brand-tokens.css; apps/dashboard/src/components/frame/PlateRoot.tsx, PlateFoot.tsx; apps/dashboard/src/components/brand/FieldStack.tsx, moodPictures.ts. The `no-theme-icons` placement was read from the branches `k/dashboard-shell-ia` (#4977) and `k/dashboard-icon-tiers` (#5029) on 2026-10-05.
- Prototemplate: docs/LIBRARIES.md; ARCHITECTURE.md; src/app/craft/libraries.ts; DESIGN.md sections 2, 3, 11, 15 and 16; src/components/viewer/*.tsx and tokens.css; src/components/shell/Bento.tsx; src/lib/use-mount-effect.ts; .oxlintrc.json; package.json (`lint:*`); scripts/lint/oxlint-plugins/gt-ui.ts; scripts/lint/shell.mjs; scripts/lint/practices.mjs.
- wiki: skills/engineering/animated-component-libraries/SKILL.md and references/details.md ("Library Selection Protocol").
- Kevin's behavior rules, 2026-07-30 to 2026-10-03, listed with their dates in `references/behavior.md` (the onboarding credit, 2026-09-29; hover and click, 2026-10-01; the copy control, 2026-10-02 and 2026-10-03; the accessibility briefs, 2026-09-02).
- Kevin, September 2026 and 2026-09-14 (shared UI standardization; the locale-selector redesign pulled from PR #4671); the landing Cta round, 2026-08-14, landed in #4348 (one landing Cta, Title Case labels, frozen tracking slugs); Kevin, 2026-09-18 (Inter as the landing's only face, PR #4887); Kevin, 2026-09-24 and 2026-09-28 (the icon tiers in #4909, the sweep and eleven lints in #5007, merged 2026-09-29; the circle theme glyphs); Kevin, 2026-09-25 (the dashboard judged against the brand deck, the full language selector on the plate pages); PR #5029 (the dashboard icon sweep, open, stacked on #4633).
