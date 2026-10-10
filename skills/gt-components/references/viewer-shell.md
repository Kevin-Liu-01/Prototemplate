# Prototemplate's viewer shell

`SKILL.md` points here: the inventory of the chrome around every Prototemplate page and the rules a component added to chrome follows.

## The shell

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
