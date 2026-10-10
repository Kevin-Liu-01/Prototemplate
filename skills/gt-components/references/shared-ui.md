# packages/ui and the gt-ui rules

`SKILL.md` points here for the gt-cloud side: the packages/ui inventory with each export and what to know about it, and the gt-ui design rules with the oxlint rules that hold them.

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
