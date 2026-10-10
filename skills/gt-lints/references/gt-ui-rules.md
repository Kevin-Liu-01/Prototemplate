# The gt-ui rules and gt-cloud's other plugins

The gt-ui oxlint plugin lives in gt-cloud at
`tooling/oxlint-plugins/gt-ui.ts`, with its tests in
`tooling/oxlint-plugins/gt-ui.test.ts`. Prototemplate runs a copy at
`scripts/lint/oxlint-plugins/gt-ui.ts`. Each rule checks a static string, a JSX
element or an import, so a value built at runtime passes. Every message
states the law and its fix, and most name their source document; oxlint
prints the rule id beside it (`gt-ui(no-em-dash)`).

## The rules

| Rule | Refuses | Fix |
| --- | --- | --- |
| `no-use-effect` | a direct `useEffect` call | `useMountEffect` for mount-only effects, `useMounted` for hydration guards, derived state or an event handler otherwise (`packages/ui/design-guide/why-we-banned-useeffect.md`) |
| `no-dynamic-import` | `import()` | a static import |
| `no-raw-tailwind-colors` | a palette utility such as `bg-blue-500` or `text-zinc-400` in any string | a semantic token (`text-foreground`, `bg-muted`, `text-status-success`) |
| `no-hardcoded-black-white` | `text-white`, `text-black`, `bg-white`, `bg-black` | a token; opacity variants such as `bg-black/50` pass |
| `consistent-radius` | any radius utility except `rounded-md` and its directional variants, `rounded-full`, `rounded-none`, `rounded-[inherit]`; an inline border radius other than `var(--radius-md)` | `rounded-md` (`packages/ui/design-guide/border-radius.md`) |
| `prefer-parent-owned-spacing` | a flex parent with no `gap-*` or `space-*` whose direct children carry two or more main-axis margins | `gap-*` on the parent |
| `no-nested-surfaces` | a `Card` inside a `Card` | spacing and type inside one card, or sibling surfaces |
| `no-thin-font` | `font-light`, `font-thin`, or an inline `fontWeight` under 400 | 400 or 500 (`packages/ui/design-guide/typography.md`; the message still cites a `STYLE_GUIDE.md` that no longer exists) |
| `no-unknown-type` | an explicit `unknown` type | a specific type, or a disable comment with its reason |
| `icon-tiers` | a `lucide-react` import outside `CONTROL_LUCIDE_GLYPHS`, a namespace import of Lucide, the `LucideIcon` or `LucideProps` type, a Heroicons import from any set other than `24/solid` and `16/solid` | a meaning mark from `@heroicons/react/24/solid` (`16/solid` inline with text), sized with a class; a real control glyph added to `CONTROL_LUCIDE_GLYPHS` in the plugin; an icon slot typed `ComponentType<SVGProps<SVGSVGElement>>` |
| `inter-only` | a `next/font/google` import other than `Geist_Mono`, a `localFont` file without "inter" in its path, `font-serif` or an arbitrary `font-[...]` family utility, an inline `fontFamily` whose first family is outside the site type | Inter through its `--font` variable, Geist Mono for code; `font-[530]` is a weight and passes |
| `no-raw-locale-flags` | hand-written `fi` or `fi-xx` sprite classes, emoji flags, an image whose source contains "flag" | `LocaleFlag` (`packages/ui/src/components/ui/LocaleFlag.tsx`) |
| `no-em-dash` | an em dash (U+2014) in any string or JSX text | a period or a comma; the rule matches only U+2014, so the en dash of an empty value cell passes |
| `no-eyebrow` | an uppercase class list with wide tracking (`tracking-wide`, `-wider`, `-widest`, or an arbitrary em or px value), or an inline style with uppercase and positive letter spacing | delete the label; a section head is a heading and one lead paragraph |
| `shared-cta` | a hand-written `tc-btn` class | the shared `Cta` (`apps/landing/src/components/landing/shared/Cta.tsx`) |
| `typed-text-var` | `text-[var(--x)]`, which Tailwind v4 reads as a color | `text-[length:var(--x)]` for a size, `text-[color:var(--x)]` for a color |
| `no-hex-colors` | a hex inside a Tailwind arbitrary value anywhere, or a hex value in a `style`, `className` or `class` attribute | a token; a hex in a plain string (canvas, raster, satori, a viewport theme color) is outside the rule |
| `mono-is-not-voice` | `font-mono` or `font-tc-mono` on `h1` to `h6` or `p`, or a mono `fontFamily` in their inline style | the sans; mono is for code, tokens and numbers |
| `single-rail` | a `tc-sec` or `tc-band` that draws side borders, `--tc-rail-outer`, a `tc-rail` inside a `tc-rail`, two or more absolutely positioned full-height children that each draw both side borders | let the `.tc-rail` wrapper draw the pair once (`DESIGN.md` section 3) |
| `no-smooth-scroll` | the `scroll-smooth` utility, `scrollBehavior: 'smooth'`, `behavior: 'smooth'` on `scrollIntoView` or on `scrollTo`, `scroll` or `scrollBy` of `window`, `document` or `globalThis`, and imports of Lenis, Locomotive Scroll and the other scroll libraries | jump; an element's own scroll (a carousel track) may animate |
| `no-heading-period` | an `h1` to `h6` whose last static text ends in a period | drop the period; an ellipsis, a question mark or an exclamation mark passes |
| `no-gif-mark` | a `.gif` source on `img`, `Image`, `video`, `source` or `picture`, or a gif import | an SVG, the canvas field or `LocadexMark` |
| `cta-title-case` | a `Cta` label that is not Title Case | capitalise every word except a short function word after the first ("Read the Docs", "Get Started") |

Six checks also honour a legacy `eslint-disable` comment that targets
`no-restricted-syntax`, because they replaced ESLint restricted-syntax
entries: `no-raw-tailwind-colors`, `no-hardcoded-black-white`, the class
check of `no-thin-font`, `no-use-effect`, `no-dynamic-import` and
`no-unknown-type`. Write new suppressions as
`// oxlint-disable-next-line gt-ui/<rule> -- <reason>`, the form gt-cloud
already uses (`apps/dashboard/src/lib/billing/__tests__/stripeAppearance.test.ts`).

## Where each rule runs in gt-cloud (main, 2026-10-05)

| Scope | Rules |
| --- | --- |
| `apps/dashboard`, `apps/landing`, `packages/ui` | `no-dynamic-import`, `no-hardcoded-black-white`, `no-nested-surfaces`, `prefer-parent-owned-spacing`, `consistent-radius`, `no-raw-tailwind-colors`, `no-thin-font`, `no-unknown-type`, `no-use-effect`, `no-raw-locale-flags` |
| `apps/landing`, `packages/ui` | `inter-only`, `no-em-dash`, `typed-text-var`, `no-hex-colors`, `mono-is-not-voice`, `single-rail`, `no-smooth-scroll`, `no-heading-period`, `no-gif-mark` |
| `apps/landing` and `packages/ui/src/components/{frame,layout,mobile,fumadocs,pricing,dialog,animated}` | `icon-tiers` |
| `apps/landing` | `shared-cta`, `no-eyebrow`, `cta-title-case` |

Exemptions in `.oxlintrc.json`: `packages/ui/src/hooks/use-mount-effect.ts`
(`no-use-effect`), `LocaleFlag.tsx` (`no-raw-locale-flags`), `Cta.tsx`
(`shared-cta`); `DemoSection.tsx`, `demo/MockWebsite.tsx`, `ui/button.tsx`
and `ui/code-ide-tabs.tsx` (the color rules and `no-thin-font`); landing and
`packages/ui` tests (`no-em-dash`, `no-hex-colors`); the OG image routes
(`no-eyebrow`, `no-hex-colors`); `logocard.tsx` and `PythonLogo.tsx`
(`no-hex-colors`).

Open pull requests widen the set (states read on 2026-10-10). #4977 (`k/dashboard-shell-ia`, open) and the
branches stacked on it add `no-theme-icons` to the all-UI scope; it refuses
Sun and Moon imports (`Sun`, `SunMedium`, `SunDim`, `SunMoon`, `Moon`,
`MoonStar` and their `Icon` forms) from `lucide-react` and Heroicons,
because the theme switch draws the circle glyphs of the shared
`ThemeToggle`. The same branch turns the nine rules of the landing and
`packages/ui` row above plus `icon-tiers` on for all of `apps/dashboard`,
with dashboard tests exempt from `no-em-dash` and `no-hex-colors`. #5029
(`k/dashboard-icon-tiers`, open) turns `icon-tiers` on for all of
`apps/dashboard`. Both branches add control glyphs to
`CONTROL_LUCIDE_GLYPHS` and drop `code-ide-tabs.tsx` from the color
exemptions. Read the branch's `.oxlintrc.json` before judging a dashboard
finding.

## Where each rule runs in Prototemplate

`pnpm lint:code` runs oxlint with base rules off and these thirteen rules on
`src/app/**`, `src/components/**` and `src/lib/**`: `single-rail`,
`no-em-dash`, `no-eyebrow`, `no-heading-period`, `cta-title-case`,
`mono-is-not-voice`, `no-smooth-scroll`, `no-gif-mark`, `icon-tiers`,
`inter-only`, `no-raw-locale-flags`, `typed-text-var` and `no-hex-colors`.
It ignores `public/`, `deck/`, `src/app/d/` (the archived directions) and
`.d.ts` files. The other ten rules are off in this repository, and
`lint:practices` counts bare `useEffect` calls.

Exemptions, each with its reason in a comment in `.oxlintrc.json`:
`src/app/present/**` (`no-smooth-scroll`, the presenter's paging animates),
`src/app/present/slides/PrinciplesSlide.tsx` (`no-raw-locale-flags`, no
`LocaleFlag` in this repository), `src/app/page.tsx`, `src/lib/brand-fonts.ts`
and `src/app/present/fonts.ts` (`inter-only`, the nameplate's Fraunces and
Space Grotesk and the presenter intro's two faces), and the generated
`src/lib/skills.ts` and `src/lib/motion.ts` (`no-em-dash`).

On 2026-10-05 the copy differs from gt-cloud main in one place:
gt-cloud's `inter-only` judges only the first family of a `fontFamily` list
(`'Georgia, Inter'` sets Georgia and fails), while Prototemplate's copy
passes any list that contains "inter", "geist", "monospace" or a `--font`
variable anywhere. The copy came from an earlier state of #5007's branch
(Prototemplate 8c989de, 2026-09-28) than the squash merge on 2026-09-29. A
dry run of main's plugin with Prototemplate's config over its `src` reported
nothing that day. Copy the whole file again with `cp`, run `pnpm lint:code`,
and fix or exempt what the stricter rule finds in the same commit.

## gt-cloud's other plugins

| Plugin | Rules on | What it holds |
| --- | --- | --- |
| `gt-react` (`tooling/oxlint-plugins/gt-react.ts`) | dashboard, landing, `packages/ui` | `@generaltranslation/react-core-linter` loaded through an ESLint stub: `no-data-attrs-on-branch`, `static-jsx`, `static-string` |
| `gt-next` (`@generaltranslation/gt-next-lint`) | dashboard, as warnings | `no-dynamic-jsx`, `no-dynamic-string`; `--quiet` hides them |
| `gt-db` (`tooling/oxlint-plugins/gt-db.ts`) | everywhere | `no-raw-sql`: no `$queryRaw`, `$executeRaw` or their `Unsafe` variants; use `$queryRawTyped` or the Prisma query API |
| `gt-logging` (`tooling/oxlint-plugins/gt-logging.ts`) | `apps/api`, `packages/node/src` | a message on every logger call, scoped dotted snake case names, inline primitive attributes (`toLogAttribute` for the rest); gt-cloud's `structured-logging` skill has the detail |
| `gt-syntax` (`tooling/oxlint-plugins/gt-syntax.ts`) | everywhere | `prefer-while-true`: an endless loop is written `while (true)`, and `for (;;)` fails |
| `sonarjs` (`eslint-plugin-sonarjs`) | everywhere | `cognitive-complexity` at 50 |

Root rules besides these: `typescript/consistent-type-imports` (error),
`typescript/no-explicit-any` (warning, an error in the UI scope),
`typescript/consistent-type-definitions: type` in the UI scope, and
`no-console`, which is off in the UI apps, an error in `apps/locadex` and
`packages/node/src`, and allows only `console.error` in
`packages/locadex-core/src`.

## Tests

`gt-ui.test.ts` imports the exported predicates (`isEyebrowClassList`,
`isTitleCaseLabel`, `isPageSmoothScroll` and the rest) and tests each against
passing and failing inputs. Its integration case writes one `.tsx` file into
a temporary folder under `apps/landing/src/.gt-ui-lint-*`, runs the root
`node_modules/.bin/oxlint` with the repository config and asserts findings as
`line:rule`, both where a rule applies and on the lines where it must stay
quiet. Run them with `cd tooling/oxlint-plugins && pnpm test`.

## Sources

- gt-cloud: `tooling/oxlint-plugins/gt-ui.ts`, `gt-ui.test.ts`, `gt-react.ts`,
  `gt-db.ts`, `gt-logging.ts`, `gt-syntax.ts`; `.oxlintrc.json`;
  `packages/ui/design-guide/` (`border-radius.md`, `typography.md`,
  `colors.md`, `why-we-banned-useeffect.md`); `.oxlintrc.json` on
  `k/dashboard-shell-ia` and `k/dashboard-icon-tiers`.
- Prototemplate: `.oxlintrc.json`; `scripts/lint/oxlint-plugins/gt-ui.ts`;
  commit 8c989de (2026-09-28, the copy and its exemptions).
- Claude memory notes: landing-icon-rule (#4909 and #5007), dashboard-deck-grammar
  (`no-theme-icons`, the dashboard overrides).
- Kevin, 2026-09-28: "lint for this properly now, especially our theme icon
  lint. lint for the correct inter, flag svgs, and other lints that make
  sense".
