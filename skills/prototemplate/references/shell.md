# The viewer shell, for a route author

A Prototemplate route mounts the shell, feeds it sections and renders the stage. Paths are relative to `$PROTOTEMPLATE`. The shell's own code is `src/components/viewer/`; the data shapes are `src/lib/shell-data.ts`. The rules for what the shell draws are `DESIGN.md` sections 2, 15 and 16. This file records the shapes on 2026-10-06, after the round that made one book page for every route (DESIGN.md section 4, The book page); read the types in the files when they disagree with it.

## The two files of a shell route

A shell route is a server page and a client viewer.

```tsx
// src/app/things/page.tsx: server. Metadata, data read from disk, the viewer.
import type { Metadata } from 'next';
import { PAGE_NAMES } from '@/lib/page-names';
import { requireUpdated } from '@/lib/updated';
import ThingsViewer from './ThingsViewer';

// 'things' joins PageId and PAGE_NAMES in src/lib/page-names.ts first
export const metadata: Metadata = {
  title: PAGE_NAMES.things.name, // the layout's template adds ", Prototemplate"
  description: 'One sentence a stranger understands.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

export default function ThingsPage() {
  // the route's paths are listed in scripts/build-updated.mjs; pnpm build:updated writes the entry
  return <ThingsViewer blocks={readThings()} updated={requireUpdated('/things')} />;
}
```

```tsx
// src/app/things/ThingsViewer.tsx: client. Sections for the list, the shell, the stage.
'use client';
import { useMemo, useRef } from 'react';
import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { PAGE_NAMES, pageLabel } from '@/lib/page-names';
import type { ShellMode } from '@/lib/shell-data';
import './things.css';

const MODES: readonly ShellMode[] = ['book', 'grid'];

export default function ThingsViewer({ blocks, updated }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const sections = useMemo(() => toSections(blocks), [blocks]); // each with under: 'things'
  return (
    <ViewerShell id='things' title={pageLabel('things')} mark='pt' count={`${n} things`} sections={sections}
      modes={MODES} thumb='row' surfaces='site' keys='flow' noun='thing'>
      <Sheet variant='flow' width={1280} scrollRef={sheetRef}>
        <div className='pt-book-col things-book'>
          <BookHead
            title={PAGE_NAMES.things.name}
            lead={lead}
            updated={updated}
            facts={[
              { icon: 'index', key: 'Things', value: n },
              { icon: 'document', key: 'Sections', value: blocks.length },
              { icon: 'duration', key: 'Reading', value: `${minutes} min` },
            ]}
            contents={<nav className='pt-book-toc' aria-label='Contents'>{/* one link per section */}</nav>}
          />
          {blocks.map((block, i) => (
            <section key={block.id} className='pt-book-part things-sec'>
              <div className='pt-book-sec'>
                <small><span>Section {i + 1}</span><span>{block.fact}</span></small>
                <h2>{block.title}</h2>
              </div>
              {/* the route's own content */}
            </section>
          ))}
        </div>
      </Sheet>
    </ViewerShell>
  );
}
```

The server page or a server module does every read from disk, so no file contents reach a client bundle. `src/app/skills/[slug]/body.ts` reads a skill body with `readFileSync` from `process.cwd()` in this way.

## ViewerShell props

The props are `ViewerShellProps` in `src/components/viewer/ViewerShell.tsx`.

| prop | type | what it does |
| --- | --- | --- |
| `id` | string | Storage namespace (`gt-shell-mode:<id>`) and `body[data-shell]`. Routes of one family share it: `/skills` and `/skills/<slug>` are both `skills`. |
| `title` | string | The sidebar head and the toolbar's title. |
| `mark` | `'pt'` or `'gt'` | The mark in the head. Every site route passes `'pt'`. |
| `count` | string | Already worded: `` `${n} images` ``. |
| `sections` | `ShellSection[]` | The route's list. See below. |
| `active` | string | The item open when the hash names none; the first item by default; `''` marks nothing. |
| `modes` | `ShellMode[]` | Any of `'slide'`, `'grid'`, `'book'`; the first is the default. The seg always shows them in `MODE_ORDER`. |
| `surfaces` | `'site'` or `'public'` | The set the index panel opens on. |
| `thumb` | `'shot'` or `'row'` | Captures in thumbnail density, or plain rows. |
| `keys` | `'paged'`, `'flow'` or a function of the mode | Paged routes take the arrows and Space; flow routes let them scroll. The gallery pages only in slide mode. |
| `noun` | string | The word in the digit toast and the help rows (`slide` by default). |
| `onSelect` | `(id) => void` | Called after the shell selects an item. /graphics uses it to scroll its book back to a re-clicked row. |
| `toolbarSlot` | ReactNode | The route's own controls, first in the toolbar's right group (`OpenPage`, `RawLink`). |
| `modeLabels` | partial record | Words for the mode seg where the defaults do not fit (`{ slide: 'Live' }` on the gallery). |
| `renderSub` | `(item, active) => ReactNode` | Rows hung under an item in the list (document headings, brand h3s). The 2026-10-05 sidebar round moves /brand, /docs and /motion/<slug> to sub rows (`ShellSubRow` in `shell-data.ts`); use whichever the type in `ViewerShell.tsx` offers. |
| `siteMap` | boolean | Draw the site map around the route's sections. Defaults to true when `surfaces` is `'site'`. |
| `countLabel` | string | A word before the count (`Left` on /compare). |
| `onCurrentPage` | `() => void` | What the route's own Pages row does on click (the gallery returns its book to the top). |
| `children` | ReactNode | The stage: a `Sheet`, a `BookView`, a frame. The grid is mounted by the shell. |

## ShellSection and ShellItem

Both types live in `src/lib/shell-data.ts`, which holds pure types and helpers and is safe to import in server modules.

`ShellSection`:

| field | meaning |
| --- | --- |
| `id` | Stable id. An id equal to a site map group's name in lower case (`documents`, `sites`, `explorations`, `shipped`, `archive`) makes the section stand in for that group. |
| `label` | The group header and the grid's section label. |
| `items` | The rows. |
| `paged: false` | Selectable but outside the count, the progress line and the arrows (the gallery's archive rows). |
| `under` | The surface id of the page row the section opens under (`skills`, `graphics`, `motion`, and from the 2026-10-05 round `brand`, `docs`, `marks`). Set it on every section a page owns. |
| `short` | The label in the sidebar when the label is a sentence (2026-10-05 round). |

`ShellItem`:

| field | meaning |
| --- | --- |
| `id` | Stable id; the hash and the active state track it. Unique across the route's sections. |
| `n` | The padded number column (`01`, `007`); blank hides it. `pad2` in `shell-data.ts`, `pad3` in `src/app/skills/model.ts`. |
| `title` | The name: the grid caption, the preview title, the filter text, the hover title. |
| `short` | The sidebar name when the title would run past two lines (2026-10-05 round). |
| `href` | The item's own page. A row whose href names another path navigates there. |
| `inPlace: true` | The shell selects it in place even though `href` names another path (the documents on /docs, whose book scrolls and writes the address). |
| `url` | An address off the site; the row opens a new tab with the external glyph. |
| `shot` | `{ light, dark? }` captures for the grid and the thumbnail density. |
| `desc` | One sentence; the filter matches it and the hover title shows it. |
| `surface` | The `surfaces.ts` id the preview layer resolves when it differs from `id` (`docs-design`, `brand-the-mark`). `previewId(item)` reads it. |
| `mark` | A short mark at the row's right end (the pane letters on /compare). |

## The stage

- `Sheet` (`Sheet.tsx`) has two variants. `variant='fixed'` is a `w` by `h` stage (1600 by 900 for a slide, 1440 wide for a site exhibit) that `fitSheet` scales to fit, with an optional `frame` and `caption`. `variant='flow'` is a scrolling page, `width` 1280 or `'rail'`, with `scrollRef` for the route's own observer.
- `BookView` (`BookView.tsx`) lays out a whole book from the sections: the head, the contents grid, then each section under a divider with one page per item. It takes the head's props (`title`, `lead`, `note`, `updated`, `facts` or `install`), `sections`, `renderPage(item, index)`, `frame` (16:9 page frames, on by default and off for flowing content), `noun` (`{ one, many }`) and `label`. No route mounts it on 2026-10-06; it compiles on the current props.
- `BookHead` renders the whole front matter of the book page (DESIGN.md section 4): the h1 (`title`, the page's `PAGE_NAMES` name or a record's own title), the `lead`, and the panel, whose first row is Updated (`updated`, the route's `src/lib/updated.ts` entry). After Updated come three `facts` (`{ icon, key, value }`, the icon a Heroicons 20 solid name from `icons.tsx`), or one fact and `install`, a command shown in the copy field. Then the rule, the optional `note`, the optional `contents` nav (`.pt-book-toc`) and the hatch band. The type allows exactly four panel slots. Each section after it is a `section.pt-book-part` opened by a `.pt-book-sec` divider whose gutter note reads `Section n` and one short fact. `pnpm lint:heads` holds all of it.
- The lead is one to three lines, 200 characters at most (`LEAD_MAX` in `shell-data.ts`). `splitLead(text)` keeps whole sentences up to that length and returns the rest as the note. `BookHead` prints whatever note it gets; the route moves a note longer than `NOTE_MAX` (600) out of the head into the book's last section, as `src/app/directions/DirectionViewer.tsx` does.
- The shell mounts `GridView` and `ThumbList` itself while the mode is `grid`, built from the same groups the sidebar builds. A pick in the grid opens the item in slide mode where the route has one.

## Reading the shell from route code

`usePtShell()` (`shell-context.ts`) returns the published state: `id`, `modes`, `keys`, `noun`, `items`, `paged`, `mode`, `transition`, `density`, `sidebarOpen`, `sidebarShown`, `panelOpen`, `helpOpen`, `present`, `narrow`, `active`, `index`, `dir`, `total`, `countLabel`, `ready`, and the actions `setMode`, `setDensity`, `setSidebar`, `setPanel`, `setHelp`, `setPresent`, `select`, `step`, `say` (the toast). `usePtStage()` returns `stageSize`.

- `select(id)` writes the hash with `history.replaceState` and calls `onSelect`.
- `ready` turns true after the mount effect has applied the saved state and the hash. Code that scrolls to the deep-linked row waits for it.
- A route that owns a scroll region marks the row under its read line and selects it through the shell, and mutes that spy while a programmatic scroll is landing (`GraphicsViewer.tsx`, `SETTLE_MS`), so a hash deep link holds.

## Keys

`useShellKeys.ts` is the one owner of the keys. The help card reads `shellKeyRows` from the same file, so the card always shows the route's true table.

| keys | action |
| --- | --- |
| Right, Space, Page down, J, L / Left, Page up, Backspace, K, H | next / previous (paged routes) |
| Down and up arrows | next and previous in the book view (paged routes with a book) |
| Home, End | first and last item (paged routes) |
| Space, arrows | scroll the sheet (flow routes) |
| Digits then Enter | go to an item by number |
| G, B, P, F | grid, book, presentation, fullscreen (where offered) |
| Cmd K or Ctrl K | search |
| R | index panel |
| `[` or S | show or hide the list |
| ? | keyboard shortcuts |
| D | dark or light |
| Esc | back one layer: shortcuts, index, list filter, view, presentation, list |

## What persists

| key or attribute | holds |
| --- | --- |
| `localStorage['gt-theme']` | `light` or `dark`; dark when unset. The boot script in `src/app/layout.tsx` stamps `html[data-theme]` before first paint. |
| `gt-shell-sb` | `'0'` when the list is hidden; stamped as `html[data-shell-sb]`. |
| `gt-shell-density` | `outline` or `thumbs`; stamped as `html[data-shell-density]`. |
| `gt-shell-mode:<id>` | the route family's last mode. A first visit at 600px or less opens the book where the route has one. |
| `gt-shell-groups` | a JSON map of sidebar group key to open or closed, site wide. |
| `gt-shell-hint` | the route families that have shown the first-visit toast. |
| `body[data-shell]` | set while a shell is mounted; the document does not scroll. |
| the hash | the active item's id. |

A framed page follows the parent's theme through the storage event and through `postMessage({ type: 'gt-theme', theme })`. An embedding page can freeze a frame's animation loops with `postMessage({ type: 'gt:freeze', frozen })` (the presenter's prototype stage while it is off screen, and `DirectionFrame` while its exhibit is off screen).

## How the sidebar builds its groups

`buildGroups` in `Sidebar.tsx` builds the list in this order.

1. The site map groups run in one order on every route: Pages, Knowledge, Shipped, Documents, Sites, Explorations, Archive (`NAV_GROUPS`), from `surfaceGroups('site')`.
2. A route section whose id is a group's name stands in for that group and merges the group's rows with its own items by surface id.
3. A section with `under` hangs as a child group under the row whose surface id it names, wherever that row stands. Nested groups are closed until one holds the current item. When no row in the list has that id, the section falls through to step 4.
4. A section that matches no group and names no row stands as a group of its own after Pages. Kevin rejected this layout for /brand on 2026-10-05 (its ten sections stood in a separate "Sections" group), so a page's own sections always set `under`.
5. The current row is the one whose path is the longest covering the pathname. It carries `aria-current="page"`, and so does the page row the reader is inside (Skills on `/skills/<slug>`, `isParentPage`). A marked row that is a reading position on another page, or an item with no address of its own, carries `aria-current="true"` (`linkAttrs`).

## Previews and thumbnails

- Any element with `data-preview="<surface id>"` under the shell opens that surface's capture in the one hover preview (`PreviewLayer.tsx`). The layer reads the row's `shot` and `shotDark` through `getSurface(id)` in `surfaces.ts`, so the attribute must name a surface id. On a device that can hover, the layer preloads the captures of the rows in view; a touch screen preloads nothing and opens a preview only from keyboard focus.
- Thumbnails are 640 by 360 WebP files (quality 82) at `public/shots/thumb/<id>.webp` and `<id>-dark.webp`, cut by `pnpm build:thumbs` from the 1440 by 900 captures `pnpm capture:pages` writes to `public/shots/pages/<id>-light.jpg` and `-dark.jpg`. A capture pass that writes straight into `public/shots/thumb` (the brand sections, the documents) leaves JPEGs, which `pnpm build:thumbs` cuts to WebP and removes; `check-registries.mjs` fails while a JPEG is left there. A row without a shot draws the plate with its initial.
- `ThumbShot.tsx` carries both captures and swaps them by CSS on `data-theme`; markup never reads the theme.

## Code inside the shell

- Mount-only work runs in `useMountEffect` from `src/lib/use-mount-effect.ts`, and a dependency effect runs in `useLayoutWork` from `src/lib/use-layout-work.ts` with `dependencies`: a layout effect that keeps useGSAP's timing (a returned cleanup runs on unmount, or before each rerun under `revertOnUpdate`) without loading GSAP. GSAP stays in the components that tween (the home hero, the /d sections, the craft demos). The practices ratchet counts a bare `useEffect(` outside a file whose path contains `use-mount-effect`, and fails any GSAP import under `src/components/viewer`. The hook defers its cleanup one task because React strict mode's simulated remount removed every listener registered through it.
- Listeners registered on mount read the latest values through refs assigned on every render (`itemsRef.current = items`), as `ViewerShell.tsx` does.
- Motion reads the `--pt-dur-*` tokens and moves transform and opacity only; the sidebar column's width is the one exception. Under reduced motion the tokens are 0ms.
- Every `.pt-*` class is global. `.pt-row` once existed in both `prototemplate.css` and the shell's `ListRow`; grep the name before using it.
- A button is a `.pt-ib` through `ToolButton`, with `type="button"` and a title that names its key. An option group is a `Seg`, and a glyph is an `Icon` from `icons.tsx`.
