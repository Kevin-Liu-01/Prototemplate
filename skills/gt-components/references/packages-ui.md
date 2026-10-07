# packages/ui, file by file

The shared component package in gt-cloud, `@generaltranslation/ui`, read on origin/main on 2026-10-05. Paths are relative to `$GT_CLOUD/packages/ui/src`. The `exports` map in `packages/ui/package.json` resolves `@generaltranslation/ui/components/<dir>/<File>` to `src/components/<dir>/<File>.tsx`, `hooks/*`, `lib/*` and `fumadocs/*` to `.ts` files, and the three stylesheets by name. Inside the package, `#/*` resolves to `src/*`.

Import every component by its file path. `src/index.ts` re-exports `cn`, `Button`, `Input`, `Label`, `Separator` and the `Card` family, and gt-cloud's CLAUDE.md bans barrel files, so new code does not import from the package root.

## frame/

The chrome of the marketing pages and the blog, plus the theme and language controls every app uses. The landing's `(home)/layout.tsx`, `blog/layout.tsx` and `not-found.tsx` mount `Header` with `footer={false}` and render the landing's own `V0Footer` through `SiteFooterMount`. The docs (`apps/landing/src/app/[locale]/docs/layout.tsx`) do not mount `Header`; they render `DocsLayout` from `fumadocs/index.ts` (below).

| file | export | props and behavior |
| --- | --- | --- |
| `NewHeader.tsx` | `Header` | `children`, `footer` (default true), `themeToggle` (default true). Holds the nav links (Resources, Docs with its column menu, Pricing, Enterprise), the search toggle, `ThemeToggle`, `DashboardButton` and the mobile menu. Menu marks follow the icon tiers: Heroicons 24/solid sized `size-5`, brand marks from `@icons-pack/react-simple-icons`, and a `MaskIcon` that masks a logo file to `currentColor`. Header links change in this file; no app carries its own copy. |
| `NewFooter.tsx` | `Footer` | `showThemeToggle`, `showLanguageSelector`. On main its theme control is the fumadocs `ThemeToggle` from `components/fumadocs/theme-toggle.tsx`, which still draws Lucide `Sun` and `Moon`. Do not copy that control. |
| `ThemeToggle.tsx` | `ThemeToggle` | `className`, `labeled` (shows the mode word, for touch), `label` (overrides the accessible name). Draws ◐ in light and ◑ in dark, chosen by CSS (`dark:hidden`, `hidden dark:inline`). The click writes the shared `gt_theme` cookie through `setSharedThemePreference` before `setTheme`, because `ThemeCookieSync` re-applies the cookie on every load. With `labeled`, the visible word opens the accessible name (WCAG 2.5.3). |
| `LanguageSelector.tsx` | default `LanguageSelector`, named `LanguageToggle` | `dropdownPosition` (`above` default, `below`), `variant` (`full` default: the Lucide `Languages` glyph, the language name and a chevron; `compact`: flag and language code). Radix popover; rows are `LocaleFlag` plus `getLocaleDisplayName`, sorted with `customLocaleNativeSort`, custom language codes filtered out, inside a `ScrollArea` with `viewportClassName='max-h-72'`, rows `max-md:min-h-11` for touch. `LanguageToggle` is the icon-only trigger for fumadocs layouts. Returns null when the app has no locales. |
| `Search.tsx` | `Search` | Docs search on pagefind's static index, served under `/pagefind` and fetched by chunk on the client. |
| `Logo.tsx` | `Logo` | `width`, `height` (default 25). |
| `DashboardButton.tsx` | default | The header's link into the dashboard. |
| `Status.tsx` | default | `variant` (`inline` default). |
| `pagefind.ts` | | Search index helpers, exported as `components/frame/pagefind`. |

## ui/

The shadcn set on the `radix-vega` preset plus GT pieces. Add a primitive here when more than one app needs it.

| file | what to know |
| --- | --- |
| `button.tsx` | `Button` and `buttonVariants`. Variants: `default`, `rainbow`, `outline`, `secondary`, `ghost`, `destructive`, `link`, and `bare` (strips the face for an inline text control). Sizes: `xs` (h-6), `sm` (h-8), `default` (h-9), `lg` (h-10), `icon` (size-9), `icon-xs`, `icon-sm`, `icon-lg`, `none`. `loading` disables the button, sets `aria-busy`, and swaps the content for a centered spinner at the same width. `asChild` renders the child (a `Link`) with the button face; `loading` has no effect under `asChild`. `rainbow` wraps the face in the blurred gradient glow, hidden while disabled or loading. |
| `LocaleFlag.tsx` | Default export. `locale` plus span props. Resolves the country with `getLocaleFlagCountryCode` from `@generaltranslation/locales` and renders the flag-icons sprite span (`fi fi-xx`), `aria-hidden`. Renders nothing for a locale without a flag. The only file allowed to write `fi` classes (`gt-ui/no-raw-locale-flags`). |
| `LocaleLabel.tsx` | Default export. `locale`, `displayLocale`, `className`. Flag plus the language name with its region code, in the viewer's locale. |
| `scroll-area.tsx` | `ScrollArea`, `ScrollBar`. The scrollbar for every scroller React renders. The height bound goes on `viewportClassName` (`max-h-72`), so a short list stays short; `className` styles the outer frame; `orientation` is `vertical` (default), `horizontal` or `both`; `type` defaults to `scroll`, so the thumb shows while scrolling and fades at rest. |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`. A Card never sits inside a Card. |
| `copy-snippet.tsx` | `CopySnippet`. A secret value is marked so PostHog session replay masks it (`ph-no-capture`); concealable snippets always count as secret. |
| `code-ide-tabs.tsx` | `CodeIDETabs`, `CodeIDETab`. Exempt from the hex and color rules for its editor palette. |
| `localized-date-time.tsx` | Default export. Has a UTC mode for values anchored to a UTC boundary (billing periods, usage buckets). |
| `animated-ellipsis.tsx` | `AnimatedEllipsis`. Three fading dots after an in-progress caption; `aria-hidden`, so the caption carries the state. |
| `reorder.tsx` | Re-exports `Reorder` from framer-motion, so apps do not depend on framer-motion directly. |
| `desktop-tooltip.tsx` | A second Radix tooltip family (`TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`) beside `tooltip.tsx`. Read both before choosing one. |
| `date-range-picker.tsx`, `selection-popover.tsx`, `toc.tsx`, `toc-clerk.tsx`, `toc-thumb.tsx` | GT pieces for the dashboard and the docs. |
| the shadcn set | `accordion`, `badge`, `chart`, `checkbox`, `collapsible`, `dialog`, `dropdown-menu`, `input`, `input-otp`, `label`, `navigation-menu`, `popover`, `select`, `separator`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`, `toast`, `tooltip`. |

## icons/

House and brand marks.

- `LocadexMark.tsx`: the Locadex mark (Locadex is GT's AI agent). Takes `SVGProps<SVGSVGElement>`. Locadex is never drawn as a brain glyph. The dashboard draws the Locadex mark through its own `apps/dashboard/src/components/icons/LocadexIcon.tsx`, typed with `LucideProps` on main; #5029 moves it to `SVGProps<SVGSVGElement>`.
- `PlugIcon.tsx`: the house integrations mark. Takes `SVGProps<SVGSVGElement>`.
- `BrandMark.tsx`: the svg root and the `BrandMarkProps` type that `ClaudeLogo.tsx`, `DeepSeekLogo.tsx`, `GeminiLogo.tsx`, `GrokLogo.tsx`, `MistralLogo.tsx` and `OpenAILogo.tsx` take: `size` (default 24), `width`, `height`, `className`, `style`, `variant` (`brand` draws the mark's own colors, `monochrome` draws `currentColor`) and `title` (a title announces the mark; without one it is decorative).
- `PythonLogo.tsx`: the shape `BrandMarkProps` copied, with its own `PythonLogoProps` and its two brand colors as constants. It is exempt from `no-hex-colors`.

A new house mark goes in this folder so every app imports the same file.

## Other component folders

| folder | contents |
| --- | --- |
| `layout/` | The fumadocs-based docs and home layouts. `layout/docs/client.tsx` puts `gt-scrollbar` on the docs tab strip (`LayoutTabs`); the docs sidebar takes the thumb from `shared.css`'s `.fd-scroll-container` and Radix scroll-area rules. |
| `mobile/MobileMenu.tsx` | `MobileMenuPanel` and `MobileMenuToggleIcon`, used by `Header`. Carries the frame theme toggle (#4355). |
| `fumadocs/` | `search-toggle.tsx` (`LargeSearchToggle`), `sidebar.tsx`, `root-toggle.tsx`, `theme-toggle.tsx` (the Sun and Moon control the footer still uses), `primitives/` (fumadocs button and popover). |
| `pricing/` | `PlansCard`, `PricingFeatureGrid`, `UsagePricing`, `BillingPeriodSwitch`, `Currency`, `PricingHelpTooltip`, `config.ts` (plan marks), `dollar-format.ts` (whole dollars without cents at or above $1). |
| `theme/` | `ThemeCookieSync.tsx` and `ThemePreferenceInitScript.tsx`: the shared theme cookie across GT apps. |
| `analytics/` | PostHog provider, the ad pixels, the cookie banner. |
| `dialog/CookieSettingsDialog.tsx`, `animated/AnimatedButton.tsx` | Checked by `icon-tiers` with the frame folders. |

## fumadocs/

`fumadocs/index.ts` re-exports the fumadocs providers and layouts (`RootProvider`, `DocsLayout` from the notebook layout, `TreeContextProvider`, `useSidebar`, `SidebarHeader`, `SidebarFooter` and others). Every fumadocs context provider is imported from here, so the docs and the package share one module instance; the landing's docs layout imports `DocsLayout` from `@generaltranslation/ui/fumadocs/index`.

## hooks/

- `use-mount-effect.ts`: `useMountEffect(effect)`, a `useEffect(effect, [])` wrapper. The only sanctioned effect in packages/ui, the dashboard and the landing. `.oxlintrc.json` turns `gt-ui/no-use-effect` off for this one file.
- `use-mounted.ts`: `useMounted()`, false on the server and the first client render, true after mount. Use it as the hydration guard for values only the client knows (the resolved theme in `ThemeToggle`).

## lib/

| file | role |
| --- | --- |
| `cn.ts`, `utils.ts` | `cn()` class merge. |
| `dither.ts` | The CPU 1-bit Bayer renderer, shared by the landing and the dashboard: `createDitherLoop`, the field factories, `mixFields`, `prefersReducedMotion`. Has tests (`dither.test.ts`). |
| `glyph-field.ts` | `createGlyphField`, the glyph rain. The landing's `GlyphRain` and `inkField.ts` import it from here. |
| `picture-field.ts` | Picture-sampled fields for the dither loop: a tone grid decoded from a grayscale image (`loadPictureTone`, `pictureField`) in a 1600 by 900 file space. The dashboard's `FieldStack` draws its mood pictures through it. |
| `theme-preference.ts` | `setSharedThemePreference`, `ThemePreference`. |
| `urls.ts` | `homepageUrl`, `dashboardUrl`. |
| `is-active.ts`, `merge-refs.ts`, `cookies.ts`, `analyticsConsent.ts` | Small helpers. |

## css/

- `shared.css`: the tokens as HSL triples under `:root` and `.dark`, exposed to Tailwind v4 through `@theme` as `hsl(var(--x))`. A triple token is wrapped in `hsl()` wherever it is read in CSS; a bare `var(--border)` is an invalid color. Also: the radius scale (`--radius-md` is `calc(var(--radius) - 2px)`), the shared keyframes, the `typo-*` utilities, the page scrollbar on `html`, the `.gt-scrollbar` class, and the thumb for Radix scroll areas the apps do not own.
- `fd-theme.css`: the `fd-` tokens for fumadocs layouts (`fd-foreground`, `fd-muted-foreground`, `fd-accent`, `fd-card`).
- `fumadocs.css`: the docs layout styles.

The `typo-*` utilities in `shared.css`: `.typo-page-heading`, `.typo-section-heading`, `.typo-table-primary`, `.typo-table-secondary`, `.typo-code`, `.typo-error`, `.typo-empty`, `.typo-sidebar-section`. The dashboard's plate pages (sign-in, onboarding, consent, device, CLI) remap the tokens and redefine `.typo-page-heading` and `.typo-error` in `apps/dashboard/src/app/brand-tokens.css`, scoped by `:root:has(.plate-root)`, and add `.typo-lede`, `.typo-key` and `.typo-caption` there.

## Sources

- gt-cloud: packages/ui/package.json; packages/ui/src/index.ts; packages/ui/src/components/frame/*.tsx; packages/ui/src/components/ui/button.tsx, LocaleFlag.tsx, LocaleLabel.tsx, scroll-area.tsx, copy-snippet.tsx, localized-date-time.tsx, animated-ellipsis.tsx, reorder.tsx, desktop-tooltip.tsx; packages/ui/src/components/icons/BrandMark.tsx, LocadexMark.tsx, PlugIcon.tsx, PythonLogo.tsx; packages/ui/src/components/fumadocs/theme-toggle.tsx; packages/ui/src/components/layout/docs/client.tsx; packages/ui/src/fumadocs/index.ts; packages/ui/src/hooks/*.ts; packages/ui/src/lib/*.ts; packages/ui/src/css/shared.css; apps/landing/src/app/[locale]/(home)/layout.tsx, blog/layout.tsx, not-found.tsx, docs/layout.tsx; apps/dashboard/src/app/brand-tokens.css; apps/dashboard/src/components/icons/LocadexIcon.tsx; .oxlintrc.json; the body of PR #5029.
