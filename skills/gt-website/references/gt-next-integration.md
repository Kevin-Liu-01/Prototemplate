# gt-next in another Next.js site

Detail for section 3 of `gt-website`. Read it before every integration of
`gt-next` into a Next.js site other than generaltranslation.com: a
showcase, a customer's app under review, a demo. The traps below were met
on 2026-10-06 and 2026-10-07, when a GT showcase translated an open-source
project's documentation site into 34 locales with `gt-next` and the `gt`
CLI and had to look exactly like the original site.

## Configuration

- **`withGTConfig` refuses a prop that conflicts with `gt.config.json`.**
  Keep the locale roster in `gt.config.json` for the CLI, give
  `withGTConfig` a routing-only config file of its own (the showcase used
  `i18n/gt-next.config.json`), and pass the URL locales as props. The
  landing meets the same refusal from `next.config.ts` (section 3).
- **Use `next.config.ts`.** The ESM config entry of `gt-next` calls
  `require`, so `withGTConfig` from `next.config.mjs` fails with "require
  is not defined". A `.ts` (or `.js`) config works.
- **Locales named by the project.** A site whose locales follow the
  project's own names (`es_AR`, `sr@latin`, `ko_KR`) maps each one to its
  BCP 47 code with `customMapping`. Folders keep the project's names and
  URLs use the codes.
- **Static generation** needs `experimental.rootParams`, a `getLocale`
  that reads `next/root-params`, a `getRegion` that returns `undefined`,
  and `enableSmartRouting: false`, so an unprefixed URL stays in the
  default locale.

## Routing

- **`usePathname()` returns the internal path.** The proxy serves the
  default locale from an internal `/en/...` path, and `usePathname()`
  returns that path. Client code that builds links or marks the current
  page maps it back to the public path (the showcase's `usePublicPathname`
  hook). Missing this broke the language menu on every default-locale page
  and showed the navigation bar on `/`. Test the language switcher from
  default-locale pages as well as translated ones.
- A hydration mismatch that appeared only under `next dev`, at random, on
  docs pages left the production build clean; judge it on a production
  build before chasing it.

## The CLI

- `gt save-local` and `gt translate` print one `RangeError` per alias
  locale when `customMapping` is set (settings validation skips the
  mapping). The run completes and the files are right; the error is noise
  (reported to the `gt` repository on 2026-10-06).
- A full run of 102 pages in 34 locales took about 30 minutes on GT's
  side. Validate the structure after it (the showcase's `i18n:check`
  script) before reviewing the text.

## Translated MDX

- **Frontmatter.** GT's MDX translation left the frontmatter untranslated
  on about 40 pages per locale. Check titles and descriptions per locale,
  and overlay translated frontmatter where it is missing.
- **Emphasis next to CJK text.** `**` and `_` next to CJK characters came
  back escaped as entities. Write that emphasis as `<strong>` and `<em>`.
- **Agents that edit translations** get a numbers rule: an editor agent
  changed `0.5` to `0,5` inside values that are not prose. They never run
  a regular expression across files without a reviewed diff: one bulk
  replacement broke the list markers of a whole locale.
- **The project's own terms win** for named UI elements. Where the project
  ships its own translations (gettext `.po` files, for instance), align
  the UI terms with them.

## Sources

- Claude memory `ghostty-docs-i18n` (2026-10-06 and 2026-10-07), the
  integration traps only; system-v2 inventory `memories.json` row
  "ghostty-docs-i18n" (plan item N-13). The project key, the GT project
  ids and the evaluation protocol stay out.
- The `next.config.mjs` failure is also recorded in Claude memory
  `ramp-routing-review` (2026-09-09).
