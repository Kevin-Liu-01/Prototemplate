# Icons

One mark per idea across the header, the docs, the blog, the marketing pages and the dashboard. Kevin reads an outline glyph in a meaning slot as unsynced (2026-09-28, from a screenshot of the navbar menu: "look for ANYWHERE ELSE icons need to be synced").

## The tiers in gt-cloud

| tier | what it covers | source | how it is drawn |
| --- | --- | --- | --- |
| meaning | a card, a feature, a link destination, a section or package mark, a status or label mark, a sidebar or menu row | `@heroicons/react/24/solid`; `@heroicons/react/16/solid` only for a mark set inline with running text | sized with a class (`size-4`, `size-5`) |
| control | search, copy, chevrons, arrows, close, plus, menu toggle, loaders, theme and language switches, record and stop | `lucide-react`, named imports on `CONTROL_LUCIDE_GLYPHS` | Lucide outline |
| brand | framework and service logos, the GT mark, Locadex | `@icons-pack/react-simple-icons`, `packages/ui/src/components/icons/*`, masked logo files | the mark's own geometry; colors per `BrandMark`'s `variant` |

`gt-ui/icon-tiers` (`$GT_CLOUD/tooling/oxlint-plugins/gt-ui.ts`) enforces four things:

1. A `lucide-react` import names a glyph on `CONTROL_LUCIDE_GLYPHS`. To add a control, extend that set in the same file.
2. No namespace import of `lucide-react`.
3. No `LucideIcon` or `LucideProps` type. An icon slot is typed `ComponentType<SVGProps<SVGSVGElement>>` so a Heroicons mark fits it.
4. Heroicons come from `24/solid` or `16/solid` only. The `20/solid` set and every outline set are refused.

Scope on main: `apps/landing/**` and `packages/ui/src/components/{frame,layout,mobile,fumadocs,pricing,dialog,animated}/**`. PR #5029 (open on 2026-10-05, stacked on #4633) widens it to all of `apps/dashboard` and remaps the meaning marks in 96 dashboard files. Until it merges, apply the tiers to dashboard work by hand from the mapping below.

## The theme glyphs

The theme switch is the pair of circle glyphs: ◐ in light and ◑ in dark (Kevin, 2026-09-28: "the theme icon should be the circle versions we use in landing and docs. fix and lint for this"). It is never a sun or a moon.

- gt-cloud: `packages/ui/src/components/frame/ThemeToggle.tsx`. The landing's `V0Footer` and header use it; the dashboard's `components/dashboard/header/ThemeToggle.tsx` wraps it.
- Prototemplate: `src/components/viewer/ThemeButton.tsx` draws the same glyphs as text at 16px on a `ToolButton`.
- The glyphs swap by CSS. Neither file reads the theme in markup.

Still on main on 2026-10-05: `packages/ui/src/components/fumadocs/theme-toggle.tsx` (used by `NewFooter`) and `apps/dashboard/src/components/dashboard/header/ThemeSelector.tsx` import Lucide `Sun` and `Moon`, and `Sun`, `Moon` and `Monitor` sit on `CONTROL_LUCIDE_GLYPHS`. Do not copy either control. A sun or a moon in a review is a finding even though main's lint passes it. The rule that refuses them, `gt-ui/no-theme-icons`, exists only on the open #4977 branch (`k/dashboard-shell-ia`); neither main nor #5029 carries it.

## The glyph vocabulary

Reuse these before choosing a new glyph. All Heroicons are 24/solid.

| idea | mark |
| --- | --- |
| Blog | `NewspaperIcon` |
| Careers | `BriefcaseIcon` |
| Locales | `MapPinIcon` |
| Report Card | `ClipboardDocumentCheckIcon` |
| Contact | `ChatBubbleLeftRightIcon` |
| Resources menu | `FolderOpenIcon` |
| Documentation | `BookOpenIcon` |
| Dashboard | `Squares2X2Icon` |
| CLI | `CommandLineIcon` |
| Overview | `GlobeAltIcon` |
| Integrations | the house `PlugIcon` |
| Core, a package | `CubeIcon` (the header's Core row uses `CpuChipIcon`) |
| OpenAPI, code | `CodeBracketIcon` |
| Pricing | `TagIcon` |
| Enterprise | `BuildingOffice2Icon` |
| Support | `LifebuoyIcon` |
| Locadex | `LocadexMark` (brand); no brain glyph |
| Audience | `UsersIcon` |
| Workflows | `ArrowPathRoundedSquareIcon` |
| Edit this page | `PencilSquareIcon` |
| Markdown and LLM files | `DocumentTextIcon`, `ListBulletIcon`, `BookOpenIcon` |
| Callout status | `InformationCircleIcon`, `ExclamationTriangleIcon`, `XCircleIcon`, `CheckCircleIcon` |

The docs content repository's `meta.json` icon names map through an explicit allowlist in the landing's `source.ts`; a new name needs an entry there.

## The dashboard mapping

From the #5029 sweep. Use it for any dashboard mark, merged or not.

| Lucide | Heroicons 24/solid |
| --- | --- |
| Trash2 | TrashIcon |
| Folder, FolderOpen | FolderIcon, FolderOpenIcon |
| AlertTriangle, TriangleAlert | ExclamationTriangleIcon |
| AlertCircle | ExclamationCircleIcon |
| Info | InformationCircleIcon |
| CheckCircle, CheckCircle2, CircleCheck | CheckCircleIcon |
| XCircle, CircleX | XCircleIcon |
| CircleDashed | EllipsisHorizontalCircleIcon |
| Ban | NoSymbolIcon |
| Lock | LockClosedIcon |
| KeyRound | KeyIcon |
| ShieldAlert, ShieldCheck | ShieldExclamationIcon, ShieldCheckIcon |
| Zap | BoltIcon |
| Layers | Square3Stack3DIcon |
| LayoutGrid | Squares2X2Icon |
| Table | TableCellsIcon |
| Code, Code2, Braces | CodeBracketIcon |
| FileCode, FileJson | CodeBracketSquareIcon |
| File | DocumentIcon |
| FileText, FileType2 | DocumentTextIcon |
| FilePlus | DocumentPlusIcon |
| FileImage | PhotoIcon |
| FileArchive | ArchiveBoxIcon |
| Presentation | PresentationChartBarIcon |
| User, UserPlus | UserIcon, UserPlusIcon |
| Share2 | UsersIcon |
| Building2 | BuildingOffice2Icon |
| Landmark | BuildingLibraryIcon |
| CreditCard | CreditCardIcon |
| Tag | TagIcon |
| Globe | GlobeAltIcon |
| Link2 | LinkIcon |
| Unplug | LinkSlashIcon |
| Clock, Clock3 | ClockIcon |
| Activity | ChartBarIcon |
| Radio | SignalIcon |
| Send, SendHorizontal | PaperAirplaneIcon |
| MessageSquare | ChatBubbleLeftIcon |
| MessageSquarePlus | ChatBubbleLeftEllipsisIcon |
| MessageSquareReply | ChatBubbleLeftRightIcon |
| UploadCloud | CloudArrowUpIcon |
| BookOpen | BookOpenIcon |
| Palette | SwatchIcon |
| GitBranch | ShareIcon (Heroicons has no git glyphs) |
| GitPullRequest, GitCompareArrows | ArrowsRightLeftIcon |
| MinusCircle | MinusCircleIcon |
| Rocket | RocketLaunchIcon |
| Building | BuildingOfficeIcon |
| LogOut | ArrowRightStartOnRectangleIcon |
| Mail | EnvelopeIcon |
| Newspaper | NewspaperIcon |
| BarChart3 | ChartBarIcon |
| ScrollText | DocumentTextIcon |
| Blocks (Connections) | LinkIcon |
| Workflow (Automations) | BoltIcon |
| RadioTower | SignalIcon |
| Brain | the Locadex mark (`LocadexIcon` in the dashboard) |
| Plug | the house PlugIcon |

The dashboard's nav rows take the marks the redesigned shell (#4977) picked: Settings `Cog6ToothIcon` with its General row `AdjustmentsHorizontalIcon`, Plans `ArrowUpCircleIcon`, Chat `ChatBubbleLeftRightIcon`, Webhook Events `ListBulletIcon`, Overview `HomeIcon` and Translations `LanguageIcon`.

#5029 also adds `Pencil`, `RotateCw`, `ListFilter`, `CornerDownRight`, `Save`, `Grid3X3` and `Square` to the control set.

A scripted rename is unsafe for `File`, `User`, `Tag`, `Lock`, `Info`, `Code`, `Send`, `Clock`, `Table`, `Globe`, `Folder` and `Save`, which are also DOM or type names. Rename JSX tags only, then handle bare references (an icon slot such as `const Icon = a ? X : Y`, `typeof File`) by hand.

## Prototemplate's chrome

The viewer shell draws one icon family: Heroicons 20 solid, inlined as paths in `$PROTOTEMPLATE/src/components/viewer/icons.tsx` at viewBox 0 0 20 20, rendered at 16px with `fill: currentColor`. Each entry names its Heroicons source in a comment; the file is regenerated from the extracted set, and a path is never edited by hand. Only names with an importer are kept.

- No lucide, no icon font, no hand-drawn path and no Unicode glyph icon in chrome. The theme button's half discs are the one text glyph.
- The other exceptions are the GT mark (`GtMark.tsx`), the Prototemplate mark (`PtMark.tsx`) and the colored site icons, which are these Heroicons on a `--pt-site-*` color.
- The site map vocabulary: gallery `squares-plus`, Brand and its sections `swatch`, Docs and documents `document-text`, deck `presentation-chart-bar`, present `play`, compare `arrows-right-left`, archive `archive-box`, explorations `sparkles`, Motion and films `film`, slides `rectangle-stack`, libraries `cube`, fallback `rectangle-group`.
- The archived directions under `src/app/d/` import lucide freely and are outside the lint (`.oxlintrc.json` ignores `src/app/d/**`).

Prototemplate's live surfaces run `gt-ui/icon-tiers` through `pnpm lint:code`; the inlined paths in `icons.tsx` are not imports, so the rule does not see them.

## Sources

- gt-cloud: tooling/oxlint-plugins/gt-ui.ts (`CONTROL_LUCIDE_GLYPHS`, `icon-tiers`); .oxlintrc.json; .agents/skills/gt-landing/SKILL.md (the two-tier paragraph); packages/ui/src/components/frame/NewHeader.tsx; packages/ui/src/components/frame/ThemeToggle.tsx; packages/ui/src/components/fumadocs/theme-toggle.tsx; apps/dashboard/src/components/dashboard/header/ThemeSelector.tsx.
- Prototemplate: src/components/viewer/icons.tsx; src/components/viewer/ThemeButton.tsx; .oxlintrc.json.
- Kevin, 2026-09-24 (PR #4909, the two tiers on the docs and the blog); Kevin, 2026-09-28 (the sweep to every surface in #5007, merged 2026-09-29; the circle theme glyphs); PR #5029 (the dashboard sweep, open, its body read on 2026-10-05); the branches `k/dashboard-shell-ia` (#4977) and `k/dashboard-icon-tiers` (#5029), read for `no-theme-icons`.
