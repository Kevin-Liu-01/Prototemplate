# Porting a gt-cloud page into Prototemplate

Detail for section 6 of `prototemplate`. Trigger: a gt-cloud page is rebuilt here as a direction, a `/d/production` mirror page or a fork. The recipe comes from the Dossier enterprise port of 2026-08-13 and its re-sync on 2026-08-14, and the fork conventions from the July 2026 propagation round. Paths are relative to `$PROTOTEMPLATE` unless they name gt-cloud.

## The transform

1. **One root.** The port is self-contained under one root class on its root div (the enterprise port used `singularity-root sgd-root sgde-root`), and every rule it adds is scoped under it.
2. **Stylesheets are rescoped mirrors.** Each gt-cloud stylesheet the page uses is copied whole, then transformed: its source roots (`.enterprise-root`, `.toolchain-root`) become the port's root, a doubled root collapses to one, `--color-emphasis` becomes `--tc-accent`, and `!important` is stripped. A mirror holds nothing else, so a re-sync replaces it in one copy.
3. **One compatibility sheet.** Everything the prototype adds (bridges to the shell's tokens, carried rings, specimen chips, flag boxes, explicit form margins) lives in `port-compat.css`. Mirrors are never edited by hand.
4. **Sections pass through one transform.** Each section file is re-copied through the same steps: `gt-next` stripped (`<T>` and `gt()` become plain strings), `LocaleFlag` replaced by `flag-icons`, and `Cta` ported locally with link shims. Engines the page needs (ink field, board field, glyph field, the language list) are local copies under `sections/`.
5. **Record the copy.** A copy that will drift from its source is an entry in `scripts/lint/copies.json` (`pin`, `source` or `fork` with its origin and reason), and `pnpm lint:copies` checks it. The plate port (`src/components/plate/`) is frozen at its recorded copy: no re-sync without product and infrastructure agreement.

## Traps

- Tailwind margin utilities (`mt-6`) are dead on a ported route, because the family reset beats the utility layer. State margins in `port-compat.css`.
- LightningCSS folds a standalone `scale` into `transform`, so a hover-scale reset has to happen in the markup.
- `createHorizonField` on a fresh canvas draws nothing until it gets geometry: call `setParams({ center, radius })`, since both default to 0.
- Shader source strings carry no comments (they ship to every visitor; the notes go in a TypeScript comment block that minifies away), and `#version` stays on the literal's first line, or the shader fails silently to its fallback.

## Forks of one source

When one direction is the single source of truth (Toolchain in July 2026), its forks follow four rules (`ARCHITECTURE.md`, "The SSOT rule"):

- Section CSS is copied and rescoped from the source's root to the fork's root (`.toolchain-root` to `.<fork>-root`) and is never imported across forks.
- Diagram CSS scoped by its diagram class (`.tflow`, `.eg`, `.iso`) with `var(--tc-*)` fallbacks travels with the component import. A root-scoped sheet (the surface diagram's `surface.css`, `components/icons.css`) needs a rescoped copy in the fork.
- Imports go one way, from a fork to the source (`@/app/d/toolchain/...`), so forks get the source's fixes. Canvas and shader engines shared by several forks live once in `src/lib`.
- Dark mode is a token remap under `[data-theme='dark'] .<fork>-root` and nothing else. Plates that are always dark never remap, and canvas visuals read their inks from CSS variables and re-read them when `html[data-theme]` changes.
