# The footer and the theme

Detail for section 7 of `gt-website`, moved out of `SKILL.md` on 2026-10-10
to keep the skill under its size budget; every rule still holds. Paths that
start with `src/` are inside `$GT_CLOUD/apps/landing`.

- One footer serves the whole site. `src/components/landing/shell/SiteFooterMount.tsx` renders `V0Footer` inside `.toolchain-root sgdh-root` with `ThemeAttributeBridge` and a `tc-rail` column. The `sgdh-root` class is required, because the light theme's token remaps in `v0-pages.css` are scoped to the page root classes and the footer stays dark on light pages without it. The `(home)` and blog layouts pass `footer={false}` to `Header` and append the mount right after the content; the home page has no footer of its own. The docs have no site footer. Footer links live in `src/components/landing/shell/footer-links.tsx`, tested in `shell/__tests__/footer-links.test.ts`.
- The theme is set before first paint. `src/app/[locale]/layout.tsx` emits `ThemePreferenceInitScript` and an inline script (`DATA_THEME_PREPAINT`) that sets `data-theme` from the stored theme or the system preference. The site's stylesheets key on `[data-theme]` while `next-themes` sets the `dark` class, and `ThemeAttributeBridge` (`src/components/pages/home/ThemeAttributeBridge.tsx`) mirrors the class onto the attribute after hydration. `SiteFooterMount`, the blog layout and `HomePage` mount the bridge; a page that renders none of them keeps its first-paint theme when the reader switches themes.
