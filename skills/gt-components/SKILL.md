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
  updated: 2026-10-10
  origin: prototemplate
  owner: P
---

# Components to reuse
General Translation (GT) builds its interfaces from components that already exist in two repositories. gt-cloud is GT's product monorepo. It holds the marketing site generaltranslation.com and the docs in `apps/landing`, the product dashboard in `apps/dashboard`, and the UI they share in `packages/ui` (the workspace package `@generaltranslation/ui`). Prototemplate is the design hub of Kevin, GT's founder. It holds the brand deck, the prototypes of the site, the signature visuals as components, and the viewer shell around its own pages. This skill names the components with their files and props, states the rules that hold them, and sets the order to search before anything new is written. A component that two apps need lives in gt-cloud's packages/ui.

Paths are written relative to a gt-cloud checkout at origin/main (`$GT_CLOUD` here) or a Prototemplate checkout (`$PROTOTEMPLATE`). gt-cloud's own skills in `$GT_CLOUD/.agents/skills` (gt-ui, gt-landing, gt-dashboard, react-useeffect, react-best-practices) stay authoritative for gt-cloud's file maps; read the app's skill before editing that app.

## References

- `references/icons.md` holds the icon tiers, the glyph vocabulary, the dashboard mapping and Prototemplate's chrome icons.
- `references/instruments.md` lists every instrument with its Prototemplate and gt-cloud paths, its interface and the lifecycle contract.
- `references/react.md` holds the effect table, the code shape rules, the translation rules and the Prototemplate differences.
- `references/shared-ui.md` holds the packages/ui inventory and the gt-ui rules in full; `references/viewer-shell.md` holds Prototemplate's chrome.
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

`$GT_CLOUD/packages/ui/src` holds the frame (`NewHeader.tsx` `Header` for the marketing pages, the blog and the 404, so a nav change is a packages/ui change; `NewFooter.tsx`; `ThemeToggle.tsx`, the ◐ / ◑ switch; `LanguageSelector.tsx`, whose `full` form the plate pages use), the shadcn primitives with `Button`, `LocaleFlag` (the only flag renderer) and `ScrollArea` (the scrollbar for every scroller React renders), the house marks in `components/icons`, `useMountEffect` and `useMounted`, the shared engines in `lib/`, and the tokens in `css/shared.css`. The table with each export's props and traps is in `references/shared-ui.md`, with two rules worth stating here:

- **Scrollbars.** A scroller React renders uses `ScrollArea`; a container React does not render takes `.gt-scrollbar`; containers set to `scrollbar-width: none` stay hidden.
- **Tokens in CSS.** The packages/ui tokens are HSL triples: `hsl(var(--border))`, never a bare `var(--border)`.

## gt-ui rules

From `$GT_CLOUD/.agents/skills/gt-ui`, for packages/ui, the dashboard and the landing, each held by a rule in `tooling/oxlint-plugins/gt-ui.ts` where one exists. The full table, the type per app and the product-surface rules are in `references/shared-ui.md`. In short:

- **Radius** `rounded-md` on every surface, `rounded-full` only for round shapes, `rounded-none` only for flush rows and shared borders (`consistent-radius`).
- **Color** black and white plus five approved colors, each used only for its meaning, through semantic tokens; flags only through `LocaleFlag` (`no-raw-tailwind-colors`, `no-hardcoded-black-white`, `no-raw-locale-flags`, `no-hex-colors`).
- **Buttons** `Button` in the dashboard and packages/ui, one `rainbow` per page paired with `outline`, `loading` only on async actions and never with `asChild`; the landing uses `Cta`.
- **Spacing** the parent owns the space between its children (`prefer-parent-owned-spacing`); **surfaces** no Card in a Card (`no-nested-surfaces`); **weight** nothing under 400 (`no-thin-font`).
- **Dark mode** tokens switch under `.dark`; no `useTheme()` or `resolvedTheme` to choose markup.
- **Type in copy** no em dash, no heading period, no mono heading or paragraph (`no-em-dash`, `no-heading-period`, `mono-is-not-voice`, `typed-text-var`). The landing and the dashboard load rsms Inter v4.1 as `--font-sans` and Geist Mono (`inter-only`), whatever gt-ui's `typography.md` says.
- **Product surfaces** are judged against the brand deck: ruled rows, one rule per seam, one dithered material on the plate pages (`gt-aesthetic`).

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
- A scripted icon rename touches JSX tags only, because `File`, `User`, `Lock`, `Info` and other icon names are also DOM or type names; bare references are fixed by hand (`references/icons.md`).
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

The chrome around every Prototemplate page is `$PROTOTEMPLATE/src/components/viewer/` (tokens in `tokens.css`; rules in DESIGN.md sections 2, 15 and 16). The component inventory and the chrome rules are in `references/viewer-shell.md`. A component added to chrome reuses its parts: a new control is a `ToolButton`, an option group a `Seg`, a glyph from `icons.tsx`, a hover capture a `data-preview` attribute. Corners come from the radius tokens, colors from `tokens.css`, borders take the three roles (`--pt-hair`, `--pt-hair-soft`, `--pt-edge`), the theme is `data-theme` under `gt-theme`, and `pnpm lint:shell` and `pnpm lint:lines:shell` hold it.

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
- **Forms.** Inputs are 16px or larger under `md` so iOS does not zoom, a third-party form takes the house field look through its appearance API, and a third-party widget (Turnstile) takes the site's resolved theme, keyed so it remounts on a flip.
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

General skills from Kevin's wiki: animated-component-libraries (outside sources and their order), design-engineering-polish. GT skills in this set: gt-lints (every rule and how to run it), gt-aesthetic, gt-brand (the type system), gt-landing-pages, gt-dither, gt-diagrams (with the isometric family), gt-verify (proving behavior in the running app, both themes and phone width), gt-product-surfaces (the map of the product surfaces), prototemplate. gt-cloud: gt-dashboard `references/conventions.md` (dashboard data, forms and tables).

## Sources

Dated provenance for every rule is in `references/sources.md`: the gt-cloud and Prototemplate files read, the wiki skill, and Kevin's dated directives.
