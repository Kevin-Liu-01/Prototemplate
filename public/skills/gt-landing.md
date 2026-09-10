# GT Landing App

This skill is the canonical guidance for `apps/landing`. Resolve landing app rules from this skill and its `references/` files.

## Required Workflow

1. Before editing `apps/landing`, read `references/design.md`.
2. Before creating a marketing diagram, SVG, shader composition, or animated product visualization, read `references/visualizations.md`.
3. Apply the repository-wide TypeScript, React, i18n, and testing rules from the active repo instructions in addition to this skill.
4. For UI work, also apply the `gt-ui`, `react-best-practices`, and `react-useeffect` skills.
5. For docs/content work, inspect the relevant MDX/content files and preserve the existing content organization.

## App Structure

- App Router with i18n:
  - `src/app/[locale]/(home)` for marketing pages.
  - `src/app/[locale]/(home)/blog` for blog.
  - `src/app/[locale]/docs` for docs.
- Header links live in `src/lib/layout.shared.tsx`.
- Home footer lives in `src/app/[locale]/(home)/layout.tsx`.
- Marketing sections live under `src/components/marketing`.
- Customer and brand assets live under `public/logos`, `public/brand`, and related public asset folders.

## Non-Negotiable Landing Rules

- Keep the site developer-first and minimalist: black/white base, subtle titanium accents, neon only for CTA or announcement emphasis.
- Preserve the clear information architecture: Landing, Docs, Blog, Pricing.
- Make developer experience cues prominent: install commands, examples, automation, framework support.
- Keep marketing section copy concise and concrete.
- Prefer theme-aware monochrome logo assets for consistency.
- Use GT runtime i18n patterns. UI strings should live in `content/ui.*.json` when finalized; inline copy is acceptable only while copy is still being actively shaped.
- For JSX UI copy, prefer one `<T>` around the largest static JSX structure that makes sense instead of wrapping only text nodes. Do not nest `<T>`, put raw dynamic expressions inside it, or rely on it to translate child component props; use GT variable/branch components for dynamic content and `gt()` for user-facing props.
- OpenGraph rendering stays in `src/app/opengraph-image.tsx` and `src/lib/og/mono.tsx`.
- Do not add a marketing-only landing wrapper around the actual experience; edit the real section components.

## Editing Map

- Home hero: `src/components/marketing/Hero.tsx`
- Install commands: `src/components/marketing/InstallBar.tsx`
- Customer logos: `src/components/marketing/Logos.tsx`
- Automation: `src/components/marketing/Automation.tsx`
- Framework examples: `src/components/marketing/FrameworkExamples.tsx`
- Framework support: `src/components/marketing/Frameworks.tsx`
- Structured translations: `src/components/marketing/StructuredTranslations.tsx`
- Libraries: `src/components/marketing/Libraries.tsx`
- Tools: `src/components/marketing/Tools.tsx`
- Languages: `src/components/marketing/Languages.tsx`
- Pricing: `src/app/[locale]/(home)/pricing/page.tsx`

## Visual Explanations

- Diagram and visualization system: `references/visualizations.md`
- A marketing visual must explain a real GT input, transformation, and output.
- Prefer HTML/CSS for interactive product UI, SVG for relationships and paths, Canvas/WebGL for fields and light, and raster images only for authored artwork.

When adding a marketing section, create it under `src/components/marketing/` and import it from the home page. When adding a framework example, update the `examples[]` array in `FrameworkExamples.tsx`. When adding a logo, add the asset under `public/logos` and register it in `Logos.tsx`.
