# Traps and fixes

Each row below is a failure met in General Translation (GT) work on Prototemplate, generaltranslation.com and the films between July and October 2026. A row gives the symptom a reader sees first, then the fix in a few words, and links the section that explains the cause, the proof and the date. When something breaks, find its symptom here; before a round of work in an area, read that area's rows. [Numbers](numbers.md) indexes the values the fixes depend on in the same way.

The cause and the measurement live on the linked page, so a row changes when its section does. Paths are relative to the root of the Prototemplate repository.

## Dev servers

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A second `next dev` for the same checkout refuses to start | One server per checkout; another worktree runs its own server on its own port | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| Every route answers 404 after a restart | Two servers shared one `.next`: stop both by PID, `rm -rf .next`, start one | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| Every route answers 500 with "Unexpected non-whitespace character after JSON" | Stop the server by PID, delete `.next/dev`, start it again | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| The server answers nothing after a large fast-forward | The same restart | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| The disk fills while a shared server runs | Delete `.next/dev` at the restart | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| A changed image still shows its old version | `rm -rf .next` and restart | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| A cold image request hangs for 900s and times out a page check | Retry once the machine's load drops | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| `next start` serves the old build after a rebuild reported success | Delete `.next` in the scratch tree before diagnosing | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| Every docs page answers 404 after a merge, with nothing in the log | `pnpm install --frozen-lockfile` and a restart | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| `Module not found` for a workspace package whose sources changed | Build the package, which resolves from a stale `dist/` | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| A pending navigation lasts longer than in production | Judge navigation timing on a production build | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| A route answers 200 and its body is the error overlay | Call a server ready only when a real page's body has no build error | [Dev servers and builds: failure modes of next dev](https://www.prototemplate.com/docs/engineering/dev-servers#failure-modes-of-next-dev) |
| A hydration mismatch appears at random under `next dev` | Judge it on a production build before chasing it | [Localized routing: links, routers and strings in gt-next](https://www.prototemplate.com/docs/engineering/i18n-routing#links-routers-and-strings-in-gt-next) |
| `pnpm add` fails on a dependency the change never touched | Add the one dependency by hand under the minimum release age | [Dev servers and builds: a minimum release age for dependencies](https://www.prototemplate.com/docs/engineering/dev-servers#a-minimum-release-age-for-dependencies) |
| "Can't resolve 'gt-next/link'" after a relink | Restart the dev server that ran during it | [Dev servers and builds: a minimum release age for dependencies](https://www.prototemplate.com/docs/engineering/dev-servers#a-minimum-release-age-for-dependencies) |

## Gates and tooling

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A failing build reached main through `pnpm build 2>&1 \| tail -2 && git push` | Capture output to a file and chain on the real exit status with `&&` | [Agents on one machine: exit-status gates](shared-machine.md#exit-status-gates) |
| `next build` passes with type errors | It never type-checks here; run `pnpm exec tsc --noEmit` as its own gate | [Gates: the type check](https://www.prototemplate.com/docs/gates#the-type-check) |
| `tsc` reports errors in `.next/dev/types` that no change touched | Run the type check in the scratch worktree that runs the build | [Gates: the type check](https://www.prototemplate.com/docs/gates#the-type-check) |
| `pnpm lint:lines:shell` fails on pages that are correct | Run browser gates one at a time, then rerun the failing one alone | [Gates: browser gates run one at a time](https://www.prototemplate.com/docs/gates#browser-gates-run-one-at-a-time) |
| The line audit exits 2 on its first route | Load the route by hand; restart the server only when your session owns it | [Gates: before trusting a red browser gate](https://www.prototemplate.com/docs/gates#before-trusting-a-red-browser-gate) |
| A lint exits clean under `--report` | Read the findings; `--report` drops exits 1 and 2 | [Gates: exit codes](https://www.prototemplate.com/docs/gates#exit-codes) |
| A new violation passes its ratchet | Lower the baseline in the cleanup commit and read the JSON diff | [Gates: ratchets](https://www.prototemplate.com/docs/gates#ratchets) |
| A missing page or a list of URLs audits clean | A status of 400 or more and a URL with whitespace exit 2; pass lists as arrays | [Lines and seams: the line auditor's thresholds](https://www.prototemplate.com/docs/craft/lines#the-line-auditors-thresholds) |
| Every browser gate breaks at once after a generator change | Keep the single quotes and field names the route list's regexes read | [Scripts: first slugs read by regex](https://www.prototemplate.com/docs/scripts#first-slugs-read-by-regex) |
| A lint at rest misses the search dialog and the scroll thumb | Open the dialog and hover the list before collecting | [Proving a visual change: states that mount on demand](https://www.prototemplate.com/docs/engineering/verification#states-that-mount-on-demand) |
| `pnpm doctor` runs something other than the setup check | Write `pnpm run doctor`; the bare form is pnpm's own command | [Get started: run the site](https://www.prototemplate.com/docs/get-started#run-the-site) |
| A skill install replaces a project's own skill with no report | The installer refuses foreign entries; check a new slug against every skills folder | [Skills: slug collisions](https://www.prototemplate.com/docs/skills#slug-collisions) |

## Builds and deploys

| Symptom | Fix | Explained in |
| --- | --- | --- |
| Docs HTML grows from 245KB to 731KB | Revert `experimental.inlineCss`, which embeds the entry CSS twice | [Docs site traps: inline CSS, built and reverted](https://www.prototemplate.com/docs/engineering/docs-traps#inline-css-built-and-reverted) |
| The build worker is killed partway through prerendering | Pin `next` 16.2.12 | [Docs site traps: prerender memory on Next.js 16.3](https://www.prototemplate.com/docs/engineering/docs-traps#prerender-memory-on-nextjs-163) |
| Every deploy fails with `TS6306` on a referenced package | Reference only the packages the app imports | [Dev servers and builds: filtered installs and project references](https://www.prototemplate.com/docs/engineering/dev-servers#filtered-installs-and-project-references) |
| CI fails on content a submodule never checked out | Guard the read itself and degrade the feature | [Dev servers and builds: CI without the content submodule](https://www.prototemplate.com/docs/engineering/dev-servers#ci-without-the-content-submodule) |
| A live count renders on localhost and is empty in production | A static minimum label and a cached same-origin route for the value | [Canvas and WebGL engines: static pages with live values](https://www.prototemplate.com/docs/engineering/engines#static-pages-with-live-values) |
| A merged change does not show on the site | Read the `dpl_` stamp on the production host against the newest Ready build | [Proving a visual change: whether it is live](https://www.prototemplate.com/docs/engineering/verification#whether-it-is-live) |
| Builds fail at random in the Google font loader | Self-host the faces | [Proving a visual change: whether it is live](https://www.prototemplate.com/docs/engineering/verification#whether-it-is-live) |
| A push that compiles cleanly fails its hosted build | Keep request-scoped server calls inside the server function's handler | [Reviewing with Kevin: ship states](review.md#ship-states) |

## SEO and agent files

| Symptom | Fix | Explained in |
| --- | --- | --- |
| Every page names the home page as its canonical | Write each route's whole head with `seoRoute()`; the root layout sets no canonical | [The SEO system: the lint](https://www.prototemplate.com/docs/seo#the-lint) |
| A route's partial `openGraph` drops the parent's fields | `seoRoute()` writes every field every time | [The SEO system: what one call writes](https://www.prototemplate.com/docs/seo#what-one-call-writes) |
| A Markdown twin answers 200 locally and 500 in production | Prerender every twin with `dynamicParams = false` | [Docs site traps: Markdown twins in production](https://www.prototemplate.com/docs/engineering/docs-traps#markdown-twins-in-production) |
| A `.md` URL never reaches the middleware | Put the twin rules in `next.config.ts` rewrites or the route | [The SEO system: why the twins are prerendered](https://www.prototemplate.com/docs/seo#why-the-twins-are-prerendered) |
| Agent-readability checkers find no links in a closed menu | A machine-only `sr-only` anchor in the server-rendered body | [The SEO system: why the twins are prerendered](https://www.prototemplate.com/docs/seo#why-the-twins-are-prerendered) |
| A disallowed URL is still indexed | Put the policy in `noindex` and leave robots.txt open | [The SEO system: the policy](https://www.prototemplate.com/docs/seo#the-policy) |

## Docs adapters

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A click on a docs folder paints the layout with no article for about 280ms | Link to leaf pages; redirect folders in `next.config.ts` | [Docs site traps: links that point at leaf pages](https://www.prototemplate.com/docs/engineering/docs-traps#links-that-point-at-leaf-pages) |
| The sidebar's rail and current-row tint pop in at hydration | Show only the row tint before `data-sb-ready` | [Docs site traps: marks that exist at first paint](https://www.prototemplate.com/docs/engineering/docs-traps#marks-that-exist-at-first-paint) |
| The sidebar's rail runs past the remaining rows while a folder folds | Read whether a folder is open from its collapsible | [Docs site traps: the sidebar after fumadocs 16.16](https://www.prototemplate.com/docs/engineering/docs-traps#the-sidebar-after-fumadocs-1616) |
| The pill and thumb stay on a row that is folding away | Treat an active link inside a closed collapsible as not current | [Docs site traps: the sidebar after fumadocs 16.16](https://www.prototemplate.com/docs/engineering/docs-traps#the-sidebar-after-fumadocs-1616) |
| The sidebar list jumps when a folder reopens | Replace the viewport's `scroll()` and write `scrollTop` | [Docs site traps: the sidebar after fumadocs 16.16](https://www.prototemplate.com/docs/engineering/docs-traps#the-sidebar-after-fumadocs-1616) |
| The sidebar list scrolls when a folder opens near its end | `overflow-anchor: none` on the viewport | [Docs site traps: the sidebar after fumadocs 16.16](https://www.prototemplate.com/docs/engineering/docs-traps#the-sidebar-after-fumadocs-1616) |
| The sticky sidebar lifts at the end of the page | `margin-bottom: -1px` on its grid column | [Docs site traps: the sidebar after fumadocs 16.16](https://www.prototemplate.com/docs/engineering/docs-traps#the-sidebar-after-fumadocs-1616) |
| Two builds of one page ship different code colours | `tokenizeTimeLimit: 0` wherever Shiki runs | [Docs site traps: code highlighting across builds](https://www.prototemplate.com/docs/engineering/docs-traps#code-highlighting-across-builds) |
| An MDX component renders with its props undefined and no build error | Components that take string attributes and child elements | [Docs site traps: MDX that drops props](https://www.prototemplate.com/docs/engineering/docs-traps#mdx-that-drops-props) |
| Every docs element computes `font-feature-settings: normal` | Type the docs root as a class in the token base rules | [Docs site traps: features that compute normal](https://www.prototemplate.com/docs/engineering/docs-traps#features-that-compute-normal) |
| A token set in the docs sheet's `@theme` reaches other routes | Scope docs rules to docs-only ids or `:root:has(#nd-notebook-layout)` | [Docs site traps: features that compute normal](https://www.prototemplate.com/docs/engineering/docs-traps#features-that-compute-normal) |
| The docs title renders at 28px, off the display ladder | Put the title, lead and prose on the ladder in `docs.css` | [Docs site traps: what fumadocs leaves for the lints](https://www.prototemplate.com/docs/engineering/docs-traps#what-fumadocs-leaves-for-the-lints) |
| Docs headings render at 600 and 700 | One weight cap at 500 in `docs.css` | [Use these docs as a template: the adapters](https://www.prototemplate.com/docs/template#the-adapters) |
| fumadocs' dark mode ignores `html[data-theme]` | `theme={{ enabled: false }}` and a `dark` variant on `:root[data-theme='dark']` | [Use these docs as a template: the adapters](https://www.prototemplate.com/docs/template#the-adapters) |
| Tailwind's theme layer resets the font tokens for the whole document | Point `--font-sans` and `--font-mono` at the site's type tokens in `@theme` | [Use these docs as a template: the adapters](https://www.prototemplate.com/docs/template#the-adapters) |
| A prose override restyles the table of contents | Scope it to `#nd-page .prose` | [Docs site traps: markup that hides from a lint](https://www.prototemplate.com/docs/engineering/docs-traps#markup-that-hides-from-a-lint) |
| The search dialog and the phone drawer keep shadows and blur | Name the portaled dialog, its overlay and the drawer in the flat rule | [Interface details: shadows and blur from a component library](https://www.prototemplate.com/docs/craft/interface-details#shadows-and-blur-from-a-component-library) |
| A script looks for `/docs/(internals)/gates` | Drop every `(name)` segment when a path becomes a route | [Use these docs as a template: adding a page](https://www.prototemplate.com/docs/template#adding-a-page) |
| A plate appears in the Markdown twin as a bare tag | A sentence beside every plate says what it shows | [Use these docs as a template: adding a page](https://www.prototemplate.com/docs/template#adding-a-page) |

## CSS and Tailwind

| Symptom | Fix | Explained in |
| --- | --- | --- |
| `font-semibold`, `tracking-*` and `mt-6` do nothing on headings | Metrics in the section's own stylesheet, gaps on the parent | [Docs site traps: unlayered rules and layered utilities](https://www.prototemplate.com/docs/engineering/docs-traps#unlayered-rules-and-layered-utilities) |
| One ID in a list of root classes overrides component rules site-wide | Join an `:is()` list as a class | [Docs site traps: specificity of an is() list](https://www.prototemplate.com/docs/engineering/docs-traps#specificity-of-an-is-list) |
| `text-sm` beats `.prose` on a table-of-contents row | Scope prose rules under `#nd-page`, which breaks the tie with the utilities layer | [Docs site traps: the typography plugin in the utilities layer](https://www.prototemplate.com/docs/engineering/docs-traps#the-typography-plugin-in-the-utilities-layer) |
| A corner lint reports 33,554,400px | `rounded-full` is `calc(infinity * 1px)`; a square box takes `50%` | [Docs site traps: the full round corner](https://www.prototemplate.com/docs/engineering/docs-traps#the-full-round-corner) |
| A token read only by inline styles is missing from the built CSS | Declare it in `@theme static` | [Docs site traps: Tailwind 4 build traps](https://www.prototemplate.com/docs/engineering/docs-traps#tailwind-4-build-traps) |
| The CSS build breaks after an edit to a comment | Fix the bracketed utility in the comment, then `rm -rf .next` | [Docs site traps: Tailwind 4 build traps](https://www.prototemplate.com/docs/engineering/docs-traps#tailwind-4-build-traps) |
| Classes added to a workspace package never compile | `touch` the app's `globals.css` | [Docs site traps: Tailwind 4 build traps](https://www.prototemplate.com/docs/engineering/docs-traps#tailwind-4-build-traps) |
| `text-[var(--x)]` becomes a colour | `text-[length:var(--x)]` | [Docs site traps: Tailwind 4 build traps](https://www.prototemplate.com/docs/engineering/docs-traps#tailwind-4-build-traps) |
| A rule removed with `border-image: none` still paints | `border-image-source: none` | [Lines and seams: rules that run the full width](https://www.prototemplate.com/docs/craft/lines#rules-that-run-the-full-width) |
| A hover-scale reset in CSS does nothing | Reset the scale in the markup, because Lightning CSS folds `scale` into `transform` | [Lines and seams: rules that run the full width](https://www.prototemplate.com/docs/craft/lines#rules-that-run-the-full-width) |
| Margin utilities do nothing on a ported page | Put margins in the port's compatibility sheet | [The design lab and the directions: the port recipe](https://www.prototemplate.com/docs/directions#the-port-recipe) |

## WebGL and canvas

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A field draws black after a dozen client-side navigations, with no error | One engine and one context per engine module for the session | [Canvas and WebGL engines: the context budget](https://www.prototemplate.com/docs/engineering/engines#the-context-budget) |
| Fields go black while a probe counts contexts | Wrap `getContext` before the page's scripts run | [Canvas and WebGL engines: the context budget](https://www.prototemplate.com/docs/engineering/engines#the-context-budget) |
| A mark leaks one WebGL context per mount | Delete its buffers and shaders, then `loseContext()`, on unmount | [The component library: the numbers behind it](https://www.prototemplate.com/docs/components#the-numbers-behind-it) |
| Two fields of different sizes keep the main thread busy | Grow the shared canvas to the largest field and blit from its bottom-left corner | [Canvas and WebGL engines: a shared canvas that only grows](https://www.prototemplate.com/docs/engineering/engines#a-shared-canvas-that-only-grows) |
| The glyph rain lags on phones, worst on WebKit | Snapshot the readback atlas into an `ImageBitmap` for the blits | [Canvas and WebGL engines: readback canvases and the blit path](https://www.prototemplate.com/docs/engineering/engines#readback-canvases-and-the-blit-path) |
| A canvas goes soft after browser zoom | Watch the resolution media query and re-arm it on every change | [Canvas and WebGL engines: browser zoom](https://www.prototemplate.com/docs/engineering/engines#browser-zoom) |
| A wide window on weak hardware gets the heaviest quality tier | Pick the tier from measured frame time | [Canvas and WebGL engines: quality from measured frame time](https://www.prototemplate.com/docs/engineering/engines#quality-from-measured-frame-time) |
| Only a shader's fallback renders after an edit | No newline before `#version 300 es`; check that the shader draws | [Canvas and WebGL engines: shader source weight](https://www.prototemplate.com/docs/engineering/engines#shader-source-weight) |
| A wall of frozen previews still lags | Stills on every card, the live page only under the pointer | [Canvas and WebGL engines: galleries of live previews](https://www.prototemplate.com/docs/engineering/engines#galleries-of-live-previews) |
| A frozen preview keeps animating | Move the loop to `requestAnimationFrame`, the only thing the gate holds | [Canvas and WebGL engines: galleries of live previews](https://www.prototemplate.com/docs/engineering/engines#galleries-of-live-previews) |
| A duplicate canvas stays in the DOM in development | Remove every node an effect creates, and check for exactly one canvas | [Canvas and WebGL engines: strict mode and effects](https://www.prototemplate.com/docs/engineering/engines#strict-mode-and-effects) |
| Every listener is dead in development | Defer the mount effect's cleanup by one task, as `useMountEffect` does | [Pages and the viewer shell: effects under strict mode](https://www.prototemplate.com/docs/pages#effects-under-strict-mode) |
| Dragging a seam over a large figure runs at 5 fps | Keep the subtree under a moving inherited variable small, such as one canvas | [Canvas and WebGL engines: inherited properties on a moving subtree](https://www.prototemplate.com/docs/engineering/engines#inherited-properties-on-a-moving-subtree) |
| A canvas shows its stretched 300 by 150 store for a frame | Paint one frame before any `requestAnimationFrame` | [Dither and the studio field: engine copies and canvas traps](https://www.prototemplate.com/docs/components/dither#engine-copies-and-canvas-traps) |
| A cloned canvas is blank | Redraw clones from the theme tokens, sized from `clientWidth` | [Dither and the studio field: engine copies and canvas traps](https://www.prototemplate.com/docs/components/dither#engine-copies-and-canvas-traps) |

## Dither

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A dithered transition flashes on its first frame | Anchor the tile: `phase.y = n % 8` for a canvas n cells lower | [Dither in practice: transitions on one grid](https://www.prototemplate.com/docs/craft/dither#transitions-on-one-grid) |
| Quick steps flash back to a picture that has gone | Start each new mix from the frame on screen | [Dither in practice: transitions on one grid](https://www.prototemplate.com/docs/craft/dither#transitions-on-one-grid) |
| A step through a new level becomes a cut | Decode all 65 mask levels before the first step | [Dither in practice: transitions on one grid](https://www.prototemplate.com/docs/craft/dither#transitions-on-one-grid) |
| A picture's edge fades in grey cells | A hard cut at the plate's edge, then a dissolve by tone | [Dither in practice: transitions on one grid](https://www.prototemplate.com/docs/craft/dither#transitions-on-one-grid) |
| A field arrives as a fade | Raise its tone from 0 | [Dither in practice: transitions on one grid](https://www.prototemplate.com/docs/craft/dither#transitions-on-one-grid) |
| A dithered pattern on a moving sprite flickers | Put dither on fields and stills; a moving sprite carries solid ink | [Dither and the studio field: dither on a moving sprite](https://www.prototemplate.com/docs/components/dither#dither-on-a-moving-sprite) |
| Dither dots alias into noise at 1x | Draw at 2x the stage height with `image-rendering: pixelated` | [Dither in practice: cells are screen pixels](https://www.prototemplate.com/docs/craft/dither#cells-are-screen-pixels) |
| A dithered photograph loses its inscriptions | No blur; the cutter solves the black and white points | [Dither in practice: the picture standard](https://www.prototemplate.com/docs/craft/dither#the-picture-standard) |
| The picture cutter refuses a source file | Its bytes changed upstream; the recorded sha256 pins the original | [Dither in practice: the picture standard](https://www.prototemplate.com/docs/craft/dither#the-picture-standard) |
| The hero's field has no effect in the light theme | A filter, because a screen blend is inert in an isolated host | [Dither in practice: material strength](https://www.prototemplate.com/docs/craft/dither#material-strength) |
| A placed picture reads as an empty window with a sliver | Anchor it to a share of the field's ramp | [Dither in practice: placing a picture on a field](https://www.prototemplate.com/docs/craft/dither#placing-a-picture-on-a-field) |

## Lines and seams

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A seam reads at the two-stroke grey | Check the neighbouring pixels: a glow raises them and a double leaves them at the ground | [Lines and seams: reading a seam by its grey](https://www.prototemplate.com/docs/craft/lines#reading-a-seam-by-its-grey) |
| A bordered element's edge composites darker than every other hairline | `background-clip: padding-box` | [Lines and seams: self-stacks and stacked grounds](https://www.prototemplate.com/docs/craft/lines#self-stacks-and-stacked-grounds) |
| A new rail doubles every hairline by 2px a side | Seat it on the existing pages' edges | [Lines and seams: rails drawn as borders](https://www.prototemplate.com/docs/craft/lines#rails-drawn-as-borders) |
| Rules keep their author colour in forced colours | The hairline tokens become `CanvasText` | [Lines and seams: rules that run the full width](https://www.prototemplate.com/docs/craft/lines#rules-that-run-the-full-width) |
| A grid of links draws stacked lines | Only the first link of each row draws the rule | [Lines and seams: rules that run the full width](https://www.prototemplate.com/docs/craft/lines#rules-that-run-the-full-width) |
| Cards paint over the rule below them after a reveal | Set `will-change` only for the tween and clear what the tween set | [Lines and seams: stacking contexts over seams](https://www.prototemplate.com/docs/craft/lines#stacking-contexts-over-seams) |
| Sticky figures stop sticking | `overflow-x: clip` on the root, which clips without making a scroll container | [Lines and seams: registration crosses and horizontal clipping](https://www.prototemplate.com/docs/craft/lines#registration-crosses-and-horizontal-clipping) |

## SVG lines

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A dash meant as a fraction of a path draws as a short fleck | Drop `pathLength` under `non-scaling-stroke` and dash in user units | [SVG lines in motion: pathLength under a non-scaling stroke](https://www.prototemplate.com/docs/craft/svg-motion#pathlength-under-a-non-scaling-stroke) |
| One travelling pulse shows up as several | Move a short `<line>` segment by translate | [SVG lines in motion: a travelling dash that tiles](https://www.prototemplate.com/docs/craft/svg-motion#a-travelling-dash-that-tiles) |
| An arc parked on a closed shape leaves part of it unpainted | Start the path where the arc starts | [SVG lines in motion: dashes on a closed path](https://www.prototemplate.com/docs/craft/svg-motion#dashes-on-a-closed-path) |
| A draw-on runs backwards | Read the first point of `d`, then flip the parked sign | [SVG lines in motion: the sign of the parked offset](https://www.prototemplate.com/docs/craft/svg-motion#the-sign-of-the-parked-offset) |
| A fleck stays at the end of a line that should be empty | `'100 200'` parked at 101 or -101 | [SVG lines in motion: a fleck at the end of the path](https://www.prototemplate.com/docs/craft/svg-motion#a-fleck-at-the-end-of-the-path) |
| A dash freezes for about four frames, then jumps | `autoRound: false`, and `pathLength` 1000 on a looping dash | [SVG lines in motion: rounding, cached paths and empty paths](https://www.prototemplate.com/docs/craft/svg-motion#rounding-cached-paths-and-empty-paths) |
| A rerun of an effect traces an empty path | Store the authored `d` once and restore it before measuring | [SVG lines in motion: rounding, cached paths and empty paths](https://www.prototemplate.com/docs/craft/svg-motion#rounding-cached-paths-and-empty-paths) |
| Curves warp and text distorts in a stretched strip | Straight taps with one elbow, labels in HTML | [SVG lines in motion: drawing under a stretched viewBox](https://www.prototemplate.com/docs/craft/svg-motion#drawing-under-a-stretched-viewbox) |
| The GT monogram renders 214 units too high | Reference the symbol from an svg with no viewBox | [SVG lines in motion: symbols and masks](https://www.prototemplate.com/docs/craft/svg-motion#symbols-and-masks) |
| A mask lands away from its shape | Write the mask in the masked shape's coordinates | [SVG lines in motion: symbols and masks](https://www.prototemplate.com/docs/craft/svg-motion#symbols-and-masks) |
| A second copy of a figure draws the first one's mask | A unique id prefix per figure | [SVG lines in motion: symbols and masks](https://www.prototemplate.com/docs/craft/svg-motion#symbols-and-masks) |
| A mark seated on an iso face lies flatter than the face | `plane()` in place of `scale(1 0.5) rotate(45)` | [Isometric drawings: numbers and traps](https://www.prototemplate.com/docs/components/iso#numbers-and-traps) |

## GSAP

| Symptom | Fix | Explained in |
| --- | --- | --- |
| `window.gsap` is undefined in the page | Read state from the page, such as a computed CSS-variable dial | [SVG lines in motion: GSAP from outside the page](https://www.prototemplate.com/docs/craft/svg-motion#gsap-from-outside-the-page) |
| Overriding `requestAnimationFrame` does not freeze an animation | Poll the dial and capture about 100ms early | [SVG lines in motion: GSAP from outside the page](https://www.prototemplate.com/docs/craft/svg-motion#gsap-from-outside-the-page) |
| A harness that seeks a timeline gets stale frames | `tl.seek(t, false)` so `onUpdate` runs | [SVG lines in motion: GSAP from outside the page](https://www.prototemplate.com/docs/craft/svg-motion#gsap-from-outside-the-page) |
| A shimmer's sweep lands about 180 units off its mark | Pre-rotated windows moved by a pure translate | [SVG lines in motion: GSAP from outside the page](https://www.prototemplate.com/docs/craft/svg-motion#gsap-from-outside-the-page) |
| A CSS transition never runs on the first frame | A keyframe animation | [SVG lines in motion: transitions at first paint](https://www.prototemplate.com/docs/craft/svg-motion#transitions-at-first-paint) |
| Glyphs jump across the screen after the fonts load | Measure again and never resample | [SVG lines in motion: moving type](https://www.prototemplate.com/docs/craft/svg-motion#moving-type) |

## Lottie on canvas

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A translated animation draws nothing after one text layer | An empty glyph entry for every drawable character, `\r` and `\u0003` | [Lottie on canvas: a missing glyph stops the frame](https://www.prototemplate.com/docs/engineering/lottie#a-missing-glyph-stops-the-frame) |
| Content under a track matte stays clipped after the canvas grows | Resize every matte buffer after each resize and redraw | [Lottie on canvas: track-matte buffers are sized once](https://www.prototemplate.com/docs/engineering/lottie#track-matte-buffers-are-sized-once) |
| `drawImage` throws from a canvas parked at 0 by 0 | Park a hidden player at `resize(1, 1)` | [Lottie on canvas: track-matte buffers are sized once](https://www.prototemplate.com/docs/engineering/lottie#track-matte-buffers-are-sized-once) |
| A playing animation redraws 120 times a second | `setSubframe(false)`, and per-frame work only when the frame changes | [Lottie on canvas: subframes redraw at display rate](https://www.prototemplate.com/docs/engineering/lottie#subframes-redraw-at-display-rate) |
| A hidden layer builds its canvas at the wrong size | A `visibility: hidden` class in place of the `hidden` attribute | [Lottie on canvas: hidden layers that keep their box](https://www.prototemplate.com/docs/engineering/lottie#hidden-layers-that-keep-their-box) |
| Two players meant to match stay a frame apart | One leader; followers stay paused and take its raw frame | [Lottie on canvas: two players on one clock drift](https://www.prototemplate.com/docs/engineering/lottie#two-players-on-one-clock-drift) |
| The animation jumps at every loop | `loop: false`, a copy of the last frame, then a dither back to the start | [Lottie on canvas: the loop is a cut](https://www.prototemplate.com/docs/engineering/lottie#the-loop-is-a-cut) |
| Reduced motion shows an empty frame | A poster frame from the longest stretch with text on screen | [Lottie on canvas: a poster frame for reduced motion](https://www.prototemplate.com/docs/engineering/lottie#a-poster-frame-for-reduced-motion) |
| A lower canvas resolution barely speeds up text | Cut the text drawn; the cost is replaying glyph paths in script | [Lottie on canvas: canvas text costs JavaScript](https://www.prototemplate.com/docs/engineering/lottie#canvas-text-costs-javascript) |

## Type

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A page renders desktop Inter 3 when its font file fails | Bind the face to an identifier no installed font carries | [Type: the binding](https://www.prototemplate.com/docs/craft/type#the-binding) |
| A client-side navigation swaps one page's face for another's | A unique identifier for every `localFont` call | [Type: the binding](https://www.prototemplate.com/docs/craft/type#the-binding) |
| A subset renders a shade off the full file | Keep glyph names when subsetting | [Type: subsets and glyph names](https://www.prototemplate.com/docs/craft/type#subsets-and-glyph-names) |
| A tracked heading loses its `->` arrow and its centred colons | Name `calt` in the feature list | [Type: contextual alternates under letter-spacing](https://www.prototemplate.com/docs/craft/type#contextual-alternates-under-letter-spacing) |
| The brand deck's headings lose their contextual alternates | The same `calt`, which waits for the deck's owner | [The brand deck: the sheet and the grammar](https://www.prototemplate.com/docs/deck#the-sheet-and-the-grammar) |
| Optical sizing stops for a whole subtree | Never write `font-variation-settings` or `font-optical-sizing: none` | [Type: optical size](https://www.prototemplate.com/docs/craft/type#optical-size) |
| A measure of `62ch` holds 84 characters a line | Set measures in em | [Type: measure](https://www.prototemplate.com/docs/craft/type#measure) |
| Hebrew and Arabic render in Arial | A script stack with no Inter variable in front | [Type: scripts and the Arial fallback](https://www.prototemplate.com/docs/craft/type#scripts-and-the-arial-fallback) |
| Numerals in a weight 500 block render at 700 | A base rule sets `b, strong` to 500 | [Type: weight and stack traps](https://www.prototemplate.com/docs/craft/type#weight-and-stack-traps) |
| A second Inter appears only while the page loads | Stacks read `var(--font-inter)` and name no bare Inter | [Type: weight and stack traps](https://www.prototemplate.com/docs/craft/type#weight-and-stack-traps) |
| A label draws a different `a` from the row beside it | Labels read the text token | [Type: weight and stack traps](https://www.prototemplate.com/docs/craft/type#weight-and-stack-traps) |
| A heading sits 1.85px above its label from 1348px wide | A trim inside the media query where the rounding step occurs | [Type: seating display type](https://www.prototemplate.com/docs/craft/type#seating-display-type) |
| A heading painted on a canvas comes out 12px short | A `FontFace` built with `featureSettings` | [Type: canvas text](https://www.prototemplate.com/docs/craft/type#canvas-text) |
| WebKit canvas text changes its optical size | Copies of the font pinned to one opsz and `text-rendering: auto` | [Type: canvas text](https://www.prototemplate.com/docs/craft/type#canvas-text) |
| A face meant for one page is preloaded on every page | `preload: false` and a family name only that route's CSS names | [Type: preloads that leak across routes](https://www.prototemplate.com/docs/craft/type#preloads-that-leak-across-routes) |
| The theme button's glyph renders in a system face | Read the face with `CSS.getPlatformFontsForNode`, since the lint's range misses it | [Type: glyphs outside the subsets](https://www.prototemplate.com/docs/craft/type#glyphs-outside-the-subsets) |

## Interface

| Symptom | Fix | Explained in |
| --- | --- | --- |
| Two buttons with one CSS gap show different gaps beside their icons | Match the measured visible gaps | [Interface details: gaps beside a glyph](https://www.prototemplate.com/docs/craft/interface-details#gaps-beside-a-glyph) |
| A row of buttons moves when one label reads Copied | Size the face from the idle label through a grid sizer | [Interface details: gaps beside a glyph](https://www.prototemplate.com/docs/craft/interface-details#gaps-beside-a-glyph) |
| A copy button fails in an agent app's browser pane | Test it in Chrome; the pane blocks clipboard writes | [Interface details: the copy control](https://www.prototemplate.com/docs/craft/interface-details#the-copy-control) |
| The foot of a page jumps when a control mounts at hydration | Reserve the control's height in the server markup | [Interface details: layout shifts](https://www.prototemplate.com/docs/craft/interface-details#layout-shifts) |
| Controls move when the language changes | Anchor the language left and the theme toggle right | [Interface details: layout shifts](https://www.prototemplate.com/docs/craft/interface-details#layout-shifts) |
| A sign-in widget draws a white card on a dark page | Pass the resolved theme and key the widget on it | [Interface details: third-party widgets and the site's theme](https://www.prototemplate.com/docs/craft/interface-details#third-party-widgets-and-the-sites-theme) |
| Captions fail contrast in the light theme | `#6e737c` or ink-2 in place of titanium | [Interface details: contrast](https://www.prototemplate.com/docs/craft/interface-details#contrast) |
| A double click moves a carousel two slides | Drop commands within 350ms of the last one | [Interface details: carousels and galleries](https://www.prototemplate.com/docs/craft/interface-details#carousels-and-galleries) |
| An element that moves on hover flickers under the pointer | A still hit area with the moving drawing inside it | [Interface details: a still hit area for a moving target](https://www.prototemplate.com/docs/craft/interface-details#a-still-hit-area-for-a-moving-target) |

## Verification

| Symptom | Fix | Explained in |
| --- | --- | --- |
| Shader and dither canvases come back blank in an embedded browser pane | Take pixels with Playwright in Chrome for Testing | [Proving a visual change: the in-app browser pane](https://www.prototemplate.com/docs/engineering/verification#the-in-app-browser-pane) |
| A capture comes out in the wrong theme | Seed the theme before load and assert it took | [Proving a visual change: the in-app browser pane](https://www.prototemplate.com/docs/engineering/verification#the-in-app-browser-pane) |
| An edit trims padding where the gap came from a margin | Quote the box model before editing | [Proving a visual change: the spot before the edit](https://www.prototemplate.com/docs/engineering/verification#the-spot-before-the-edit) |
| A scroll story locks in a different place scrolling up | Run the whole stress matrix | [Proving a visual change: the stress matrix](https://www.prototemplate.com/docs/engineering/verification#the-stress-matrix) |
| A fix shown with a scripted selection proves nothing about a drag | Perform the real gesture and read the result back | [Proving a visual change: real gestures](https://www.prototemplate.com/docs/engineering/verification#real-gestures) |
| A harness request leaves its origin | Build every URL as `new URL(ORIGIN + path)` | [Proving a visual change: real gestures](https://www.prototemplate.com/docs/engineering/verification#real-gestures) |
| A layout breaks in Safari alone | Check one invariant in Chromium and WebKit | [Proving a visual change: WebKit](https://www.prototemplate.com/docs/engineering/verification#webkit) |
| A route list read from a running dev server is truncated | Take the routes from the source or the sitemap | [Proving a visual change: parity across an upgrade](https://www.prototemplate.com/docs/engineering/verification#parity-across-an-upgrade) |
| Timings read slow and a dev-server Lighthouse run scores 0.65 | Record the load average, and run a production build in a clean profile | [Performance without visual loss: measure honestly](https://www.prototemplate.com/docs/engineering/performance#measure-honestly) |
| A lab score does not answer a complaint about a slow first paint | Read field data | [Performance without visual loss: field data against lab data](https://www.prototemplate.com/docs/engineering/performance#field-data-against-lab-data) |
| A structural audit passes every item while the visual bar fails | Report each kind of check on its own line | [Agent workflows: kinds of check](workflows.md#kinds-of-check) |

## Films

| Symptom | Fix | Explained in |
| --- | --- | --- |
| Two renders of one film differ | Compare every pair by `framemd5`; large animated type renders on the software path | [Films: compare every render pair](https://www.prototemplate.com/docs/craft/films#compare-every-render-pair) |
| One render loses its dither field and reports success | Guard every cached image read with `img.complete && img.naturalWidth > 0` | [Films: images and the first timeline update](https://www.prototemplate.com/docs/craft/films#images-and-the-first-timeline-update) |
| The render log reads "Fetched 11 font face(s)" | Set type through the kit's `var(--font)` | [Films: fonts in a composition](https://www.prototemplate.com/docs/craft/films#fonts-in-a-composition) |
| A thin blue stroke turns slate grey in the encoded file | Start it on an even pixel | [Films: thin coloured strokes in H.264](https://www.prototemplate.com/docs/craft/films#thin-coloured-strokes-in-h264) |
| 1px routes vanish at phone size | 2.5px routes over a keyline, checked at 640 by 360 | [Films: thin lines over a dithered ground](https://www.prototemplate.com/docs/craft/films#thin-lines-over-a-dithered-ground) |
| A louder mix comes out quieter | Put peak control in the ffmpeg masters | [Films: the mix and its traps](https://www.prototemplate.com/docs/craft/films#the-mix-and-its-traps) |
| A gain ramp clicks | `aeval` for any gain curve | [Films: the mix and its traps](https://www.prototemplate.com/docs/craft/films#the-mix-and-its-traps) |
| The music bed pumps between lines | Hold the duck across gaps under about 1.2s | [Films: the mix and its traps](https://www.prototemplate.com/docs/craft/films#the-mix-and-its-traps) |
| A voice model ignores its speed setting | Inline pace tags | [Films: speech synthesis](https://www.prototemplate.com/docs/craft/films#speech-synthesis) |
| A still pulled with `-ss` comes out near black | Select the frame by index | [Films: frames, probes and disks](https://www.prototemplate.com/docs/craft/films#frames-probes-and-disks) |
| A render that looks fine in its log is an error page | Flag frames whose grey standard deviation is under about 20 | [Films: frames, probes and disks](https://www.prototemplate.com/docs/craft/films#frames-probes-and-disks) |
| `page.evaluate(() => tl.seek(t))` hangs | Return a number from `evaluate` | [Films: frames, probes and disks](https://www.prototemplate.com/docs/craft/films#frames-probes-and-disks) |

## Routing

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A locale prefix outside the roster answers 500 | A locale guard ahead of every rewrite | [Localized routing: middleware order](https://www.prototemplate.com/docs/engineering/i18n-routing#middleware-order) |
| Every old URL redirects to a 404 | Deploy a redirect only after the moved pages exist | [Localized routing: middleware order](https://www.prototemplate.com/docs/engineering/i18n-routing#middleware-order) |
| Links to `/sitemap.xml` and other root files answer 404 | A plain `<a>` for root files | [Localized routing: links, routers and strings in gt-next](https://www.prototemplate.com/docs/engineering/i18n-routing#links-routers-and-strings-in-gt-next) |
| A programmatic navigation loses the locale | Push a path that already carries the locale | [Localized routing: links, routers and strings in gt-next](https://www.prototemplate.com/docs/engineering/i18n-routing#links-routers-and-strings-in-gt-next) |
| Strings render in English in every locale | `const gt = await getGT();` on its own line | [Localized routing: links, routers and strings in gt-next](https://www.prototemplate.com/docs/engineering/i18n-routing#links-routers-and-strings-in-gt-next) |
| The language menu breaks on default-locale pages | Map `usePathname()` back to the public path | [Localized routing: links, routers and strings in gt-next](https://www.prototemplate.com/docs/engineering/i18n-routing#links-routers-and-strings-in-gt-next) |
| A CLI setup command waits forever under an agent | `--no-interactive` and a flag for every answer | [Localized routing: a start prompt that must run unchanged](https://www.prototemplate.com/docs/engineering/i18n-routing#a-start-prompt-that-must-run-unchanged) |

## The shared machine

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A `pkill -f` stops other sessions' servers, browsers and renders | Stop a process by the PID recorded when it started | [Agents on one machine: stopping a process](shared-machine.md#stopping-a-process) |
| A kill by port closes a browser | `kill $(lsof -ti tcp:<port> -sTCP:LISTEN)` | [Agents on one machine: stopping a process](shared-machine.md#stopping-a-process) |
| Every later command reports "command not found" | Never name a zsh variable `path` | [Agents on one machine: shell traps in zsh](shared-machine.md#shell-traps-in-zsh) |
| `"$B:apps/landing"` rewrites the string | Brace the name: `"${B}:apps/landing"` | [Agents on one machine: shell traps in zsh](shared-machine.md#shell-traps-in-zsh) |
| A loop over an unquoted variable runs once | An array, an explicit list or `${=urls}` | [Agents on one machine: shell traps in zsh](shared-machine.md#shell-traps-in-zsh) |
| A Python heredoc becomes a pushed commit message | Write each message to a file first, then `git commit -F` | [Agents on one machine: shell traps in zsh](shared-machine.md#shell-traps-in-zsh) |
| `echo ====` stops a `&&` chain | Quote it | [Agents on one machine: shell traps in zsh](shared-machine.md#shell-traps-in-zsh) |
| A grep over two folders greps nothing | A glob with no match aborts the line; use `find` or quote the pattern | [Agents on one machine: shell traps in zsh](shared-machine.md#shell-traps-in-zsh) |
| A browser starts while the memory check said to wait | Chain on the check's own exit status with `&&` and no pipe | [Agents on one machine: exit-status gates](shared-machine.md#exit-status-gates) |
| One `git grep` grows from 42.6 to 166GB | `-F` with a pattern file, `-I` and a thread count | [Agents on one machine: memory and disk](shared-machine.md#memory-and-disk) |
| A reboot empties the sessions' scratch folders | Keep specs and helpers that must outlive the day in a repository | [Agents on one machine: memory and disk](shared-machine.md#memory-and-disk) |
| Lane agents hang for hours on shell calls that never start | No `rm` in a lane, edits in separate calls, network calls under an alarm | [Agents on one machine: long commands](shared-machine.md#long-commands) |
| A commit publishes another session's staged deletions | Commit with a pathspec | [Agents on one machine: one checkout and several sessions](shared-machine.md#one-checkout-and-several-sessions) |
| A copy into the tree erases commits another session pushed | Fetch and read `HEAD..origin/main` before any copy or push | [Agents on one machine: one checkout and several sessions](shared-machine.md#one-checkout-and-several-sessions) |

## Pull requests and workflows

| Symptom | Fix | Explained in |
| --- | --- | --- |
| A pull request's checks are stale, cancelled or missing | Resolve the merge conflicts first | [Pull requests and CI: CI signals that mislead](pull-requests.md#ci-signals-that-mislead) |
| The latest push shows a red e2e it did not cause | List the runs and find the first red one | [Pull requests and CI: CI signals that mislead](pull-requests.md#ci-signals-that-mislead) |
| The build dies in "Running TypeScript" | Raise `--max-old-space-size` | [Pull requests and CI: CI signals that mislead](pull-requests.md#ci-signals-that-mislead) |
| A bot's summary describes a diff that no longer exists | Compare its reviewed commit with the head before acting | [Pull requests and CI: review bots](pull-requests.md#review-bots) |
| A force push erases a collaborator's commits | Fetch, then lease against the sha you expect | [Pull requests and CI: git on shared trees](pull-requests.md#git-on-shared-trees) |
| A fast-forward overwrites ignored files without a warning | Copy the ignored originals aside first | [Pull requests and CI: git on shared trees](pull-requests.md#git-on-shared-trees) |
| Commits meant for a pull request never reach it | Check the branch before each commit and compare the head with `HEAD` | [Pull requests and CI: git on shared trees](pull-requests.md#git-on-shared-trees) |
| A lane builds nothing and verifies something unrelated | Open every lane prompt with the user's own words for that lane | [Agent workflows: lane prompts](workflows.md#lane-prompts) |
| A resumed workflow pays for its finished agents again | Resume by run id with byte-identical arguments | [Agent workflows: resuming a run](workflows.md#resuming-a-run) |

## Sources

- The pages each row links to, read on 2026-10-21: the Craft and Engineering tabs of /docs, the Components and Internals pages with trap sections, and the handbook's documents on one machine, workflows, pull requests and review.
- The curated skills those pages cite: `gt-motion` (`references/traps.md`), `gt-performance` (`references/webgl-lifecycles.md`), `gt-website` (`references/docs.md`, `references/deploys.md`), `gt-local-dev`, `gt-verify`, `gt-films`, `gt-dither`, `gt-brand` (`references/type.md`), `gt-orchestration` and `gt-ship`.
