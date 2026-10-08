# Diagram components

The drawings that already exist, where they live, what each one shows and where its one accent goes. Mount one of these before drawing anything new. Paths are relative to `$PROTOTEMPLATE` unless a row names `$GT_CLOUD`.

## The toolchain family

`src/app/d/toolchain/diagrams/` is the canon. The production home (`/d/production`), the v0 home (`/d/_v0`, which the Dossier mounts) and about a dozen directions import from it, and gt-cloud's landing ports of these drawings came from it. Five directions keep forked copies of the `lang/` or `surface/` set in their own `diagrams/` folder (glyph-rain, hourglass, prism-light, dither-field, event-horizon); a change to the original does not reach them.

Rows marked unmounted are imported by no route in Prototemplate today. They are reference drawings: check one against SKILL.md sections 3 to 6 before mounting it.

| component | file | what it shows | accent |
| --- | --- | --- | --- |
| TranslationFlow | `TranslationFlow.tsx`, `flow.css` | The real `app/page.tsx` forked into `public/_gt/es.json`, `ja.json` and `de.json`, each holding the three translated strings, over a doubled-line fan-out with a traveling pulse. Under 620px the fork hides and the panels stack. | None since 2026-07-31: the lit output (ja) is set in ink at 500 and the pulse runs in `--tc-ink` (`flow.css`). The file header still names the accent and describes a dashed window; the code moves the window as geometry. |
| LocaleRouting | `LocaleRouting.tsx`, `flow.css` | One URL bar per locale with the prefix the middleware adds, the localized pathname (`/fr/a-propos`) underlined in ink, and the detection ladder (URL locale, cookie, Accept-Language, default). `locales` filters the rows. | None; emphasis is ink weight and an ink underline |
| SdkLedger | `SdkLedger.tsx` | The first-party packages on the dark panel: package, runtime, the import you write, each runtime's mark as a currentColor mask. It replaced a plate stack that drew stand-in slabs for text. | None; the API names carry weight (white at 500) |
| SdkStack (unmounted) | `SdkStack.tsx` | Four planes on one axis with a leader out to each package. The house reference for annotation leaders (`_v0/sections/Locadex.tsx` cites it). Its labels use the 9px mono `.iso-label`; set new labels in Inter. | The chip on the top plane |
| EdgeGlobe | `EdgeGlobe.tsx` | An orthographic globe with five points of presence on graticule intersections, one user and one great-circle route answered in 12 ms. Near arcs at the regular weight, far arcs as dashed hairlines, the limb as the strongest neutral line. Pairs with the `GlobeAtmosphere` Bayer field in `src/app/d/production/sections/Global.tsx`. | The route arc at rest; each arrival flashes its callout to the accent and settles back |
| TcStackIso | `tc-stack-iso.tsx` | The full stack as seven planes on the 30 degree axis, one per toolchain stage, each a hover and focus target wired to its caption row. Its slabs are frosted glass, a founder pick recorded in the header; BRAND.md's final avoid list refuses glassmorphism, so new drawings do not copy that fill. | The delivered string, the chip on the runtime plane |
| TcCtxLayers (unmounted) | `tc-ctx-layers.tsx` | The context model as three levels (Organization, Project, Component). Its link is two separate paths at `--thread-gauge` ending in a 14 by 11 filled arrowhead; both break the current rules, so redraw the link with DoubledLine and a marker before mounting it. | None in the file |
| TcStackTrace (unmounted) | `tc-stack-trace.tsx` | One commit's journey through the stack with timestamps (09:41:02 to 09:45:09), the time axis beside the isometric assembly. | None in the file |
| TcMini* (unmounted) | `tc-stack-minis.tsx` | Four different artifacts under the service grid: an editor, an API exchange with the doubled thread, a dashboard card, a diff sheet. | None in the file |
| SentenceWidth | `lang/SentenceWidth.tsx` | One sentence in four locales, each laid out and measured by the browser, one vertical guide at the English width, a shared ruler. | The German leading edge, the one locale that breaks the layout |
| ContextResolve | `lang/ContextResolve.tsx` | "Save" forked into `speichern` and `sparen`; both branches drawn at rest, a pulse runs the live branch. | The live branch's pulse |
| PluralForms | `lang/PluralForms.tsx` | One count against English (two forms), Polish (four) and Japanese (one); markers move to the CLDR form. | The markers |
| RtlMirror | `lang/RtlMirror.tsx` | The same panel twice with only `dir` changed; the back chevron and the underline are handled by hand. | The underline, growing from each panel's leading edge |
| ExpansionBars | `lang/ExpansionBars.tsx` | Text expansion as a diverging chart around the English axis. | German, permanently |
| ScriptSampler | `lang/ScriptSampler.tsx` | "Language" in eight writing systems at eight depths. | None; depth marks the source |
| WordMorph | `lang/WordMorph.tsx` | One UI term printed in every locale it ships in, a reading step down the ledger, said with ink and size. | None; the six words are the illustration |
| GlossarySurface | `surface/GlossarySurface.tsx` | One glossary entry against three locales, the rejected word struck through beside the one that ships, then the per-locale directives. | The glossary pin |
| LiveSurface, PreviewSurface, CustomSurface | `surface/*.tsx` | A live round trip with its cost; the Spanish preview beside its English source; the detection hook as code. | None; the four panels share the glossary pin's accent |
| BenchmarkBars (unmounted) | `BenchmarkBars.tsx` | Horizontal bars extruded on the family's 30 degree vector. | One row |
| StatRow | `StatRow.tsx` | A large number, a quiet label and a hairline. The number is the figure; no glyph beside it. | None |
| IsoFrame, IsoSolid, iso | `IsoFrame.tsx`, `IsoSolid.tsx`, `iso.ts` | The isometric frame (240 by 180 viewBox, stroke 1.2, currentColor), `IsoSlab`, `IsoPlane`, `IsoWire`, `IsoArrow`, and the projection kit. Covered by gt-isometric. | The `accent` prop |
| DitheredMark | `DitheredMark.tsx` | A brand mark as an alpha mask with the Bayer specular shimmer. Covered by gt-isometric and gt-dither. | The mark |
| LocaleTag | `../components/LocaleTag.tsx` | The one locale pill: flag print and code. Every diagram names a locale with it. | None |

The headers of these files record why each drawing has its shape and which earlier version it replaced. Read the header before changing a drawing.

## The shared set

`src/components/shared/diagrams/` holds the connector and an older line-art set.

| component | file | use |
| --- | --- | --- |
| DoubledLine | `DoubledLine.tsx` | The connector: one center path stroked twice, optional two-tone, a pulse slot. Props `d`, `core` (required), `gauge` 1.5, `gap` 3, `ink`, `inkB` with `splitD`, `children`. See `doubled-line.md`. |
| DiagramFrame | `DiagramFrame.tsx`, `diagrams.css` | The 200 by 74 drafting frame. Props `strokeWidth` 1.4, `accentStrokeWidth` 1.6, `scale`, `title`. Skinned by `--gtd-line`, `--gtd-ink`, `--gtd-accent`, `--gtd-panel`, `--gtd-label`, `--gtd-mono` and `--gtd-code-size` on any ancestor. |
| CodeWrap, ConfigSliders, EdgeDelivery, Glossary, PreviewPanes, RoutingTree, RuntimeSwap, TranslationFlowDiagram, SignalPath | `*Diagram.tsx` | The line-art set inside DiagramFrame, drawn for the earlier directions' `src/components/shared/FeatureBento.tsx` and `StorySection.tsx`. Nothing mounts those two now; the set stays as reference. Its text is mono at 9.5px, which predates BRAND.md's rule that diagram labels avoid mono. Its `.gtd-thread` class draws the doubled line as two separate parallel paths, and its SignalPath pulse carries a `drop-shadow` glow (`--gtd-pulse-glow` in `diagrams.css`); both predate DoubledLine and the no-glow rule. Reuse the geometry; label new work in Inter and link with DoubledLine. |

## Live plates

The build log at the end of the readme on `/docs` mounts the components the way a consumer does (`/craft` redirects there; the sections are `CRAFT_SECTIONS` in `src/app/craft/CraftArticle.tsx`):

- The libraries: the DoubledLine plate (`src/app/craft/ThreadsDemo.tsx`: two forks merging into a trunk, two-toned, with a static pulse window), the iso plate (`IsoDemo.tsx`), EdgeGlobe and the rest of `docs/LIBRARIES.md`.
- Rails, grounds and seams: `RailFigure.tsx`, the ownership drawing with two border crosses.
- Corners, spacers and the second surface: `CornerFigure.tsx`.
- The line law: `AuditorFigure.tsx`, the auditor's mock.

`docs/LIBRARIES.md` is the index of these instruments. When an engine gains an option, its craft entry in `src/app/craft/libraries.ts` changes in the same round.

## The deck's diagram slides

A new slide diagram starts from the markup of an existing one (`deck/slides/`). The slide number is the file's position in sort order, which differs from the file's prefix after slide 35:

| slide | file | shows |
| --- | --- | --- |
| 30 | `30-lines.html` | Cell borders against row seams, with registration crosses where a seam meets a rail |
| 31 | `31-doubled-line.html` | The doubled line as a curve with a junction and as two enlarged bars |
| 33 | `33-diagrams.html` | The grammar as two ruled tables and four 300 by 210 examples: a three-step flow, a scale with a marker, a stacked layer model, an isometric plate with the seated mark |
| 35 | `35-iso.html` | The isometric family |
| 74 | `76-line-law.html` | The line law in chrome, a shell sketch with one owner per edge |

`node deck/shoot-slide.mjs 33` renders slide 33 in both themes to `deck/preview/` on Kevin's machine (the script hard-codes its Playwright paths); elsewhere use `scripts/deck-page.mjs` with `scripts/figure-check.mjs` (SKILL.md section 9).

## gt-cloud

The landing app carries ports of the toolchain drawings under `apps/landing/src/components/` in `$GT_CLOUD`, with the same `--thread-gauge`, `--thread-gap` and `--thread-ink` tokens in `landing/shell/engine.css`:

- `landing/sections/fullstack/StackTower.tsx` (the scroll-driven tower, its rail and taps) and `landing/shared/iso.ts`;
- `landing/sections/locadex/Locadex.tsx` (the integrate diagram and its border ring);
- `landing/sections/context/ContextResolve.tsx`, `landing/sections/global/EdgeGlobe.tsx` with `GlobeAtmosphere.tsx`, `landing/sections/developer/SentenceWidth.tsx`;
- `pages/pricing/PricingStackDiagram.tsx`, `pages/enterprise/services-landing/EnterpriseContextFork.tsx`, `pages/report-card/ReportCardFigure.tsx`.

gt-cloud's `.agents/skills/gt-landing` (`SKILL.md` and `references/design.md`) is the code map for those files. Change a landing diagram there, and keep its Prototemplate original in step when the drawing itself changes.
