---
name: gt-explorations
description: >-
  How a General Translation design exploration runs from research to one
  landed design: reading Kevin's sources and measuring the reference sites,
  writing the page as text first, directions that differ in silhouette,
  material and action, one registry and one place to compare them live,
  in-page switches for effect variants, picks by Kevin's numbers, forks that
  never overwrite a version, critic composites against the reference,
  removing the losers and archiving retired versions, and keeping rounds
  local until he lands them. Use when Kevin asks for options, versions,
  variations, directions or "try N approaches", when he links a post or
  product to learn from, and when converging a design toward his pick.
metadata:
  title: Exploration rounds and convergence
  areas: aesthetic, website, landing, graphics
  updated: 2026-10-10
  origin: prototemplate
  owner: P
---

# Exploration rounds and convergence

General Translation (GT) builds localization tools for developers, and Kevin Liu does its design, website and product work. He designs in rounds. He asks for several directions, compares them live, picks by number, and asks for variants of the pick until one design lands. A direction is one complete design of a page or a site, built as its own running route. This skill holds the mechanics of a round, from the research before it to the cleanup after it, and `gt-aesthetic` holds the taste each round is judged by.

Paths are relative to a checkout. `$PROTOTEMPLATE` is Prototemplate, Kevin's design lab and the public hub at prototemplate.com, where the site directions live. `$GT_CLOUD` is gt-cloud, the monorepo of GT's site, docs and dashboard. Kevin's wiki is github.com/Kevin-Liu-01/Kevin-Wiki, and its paths below are relative to its checkout. `references/rounds.md` records every round from July to October 2026 with what was asked, what Kevin picked and the rule it set. `references/charter.md` holds the round charter, `references/registry.md` the registry and numbers, `references/comparing.md` the variant switches, option sheets and module review, and `references/sources.md` the provenance. `scripts/distinct-set.mjs` checks that a set of options differ before Kevin sees it.

## 1. Before the round

### Kevin's sources

- Read Kevin's own sources before designing: the design pages of his wiki (`wiki/design/README.md` is the index, and `ui-library-ranking.md`, `component-library-sources.md` and `x-bookmarks-design-ui.md` list the libraries and references he trusts), his X bookmarks, and every post he links. Kevin, 2026-07-28: "read the x posts and ingest artifacts using fieldtheory and see the pictures to see what i want".
- Read a post's pictures and video as well as its text. Kevin, 2026-09-18: "look through tweet and watch its media to learn abotu the feature it adds".
- The bookmarks live in the fieldtheory CLI (`ft`, wiki page `wiki/tools/fieldtheory.md`). `ft sync` downloads new bookmarks and their media, `ft search "<terms>"` searches them, and `ft show <id> --json` prints one. A post Kevin links without bookmarking it is captured with the wiki skill `absorb-sources`, media included.
- Write down which part of the page each reference informs. `$PROTOTEMPLATE/docs/research/STORYBOARD.md` opens with the July references, each named for the section it governs (the hero mechanic, the hero background, the story window), and `docs/research/inspo.md` ranks the reference sites from the bookmarks with what to take from each.
- Credit a borrowed effect on the page with a link to its author. On 2026-07-31 Kevin asked for a shader taken from an X post to be credited at the foot of the page.

### The reference sites

- Open each named reference and the new work at the same viewport and theme, measure both, and write down what makes the reference work before imitating it (`gt-aesthetic`, "Measuring the reference"). Kevin, 2026-07-29: "first we need to delve deep into what makes the vite plus and oxlint websites tick". The answer was `docs/research/teardown-measured.md`, which read every value with `getComputedStyle` and found that the two sites are one system in two modes.
- The reference has changed with the work. The July site rounds named generaltranslation.com and resend.com as the bar, with viteplus.dev as the frame for the home page and oxc.rs for product pages. The docs took their polish from Vercel's Geist docs on Fumadocs and from Linear's docs (2026-09-01). Today the Dossier (the direction at `/d/singularity-dossier`) governs the site, and the brand deck governs product surfaces (`gt-aesthetic` section 1). Each round names its reference in its brief.
- `docs/reference-shots/<site>/` holds the July captures of generaltranslation.com, oxc, resend and viteplus. The July documents under `docs/research/` show the method. Their aesthetic mandates (black, white and metallic, Switzer headings) were replaced later, and `gt-aesthetic` holds the current ones.

### Product research

Before cloning a product or building a feature that answers one, research the product and write the findings down before the first direction:

- its full feature set;
- where each control sits, and the paths for importing content;
- how it solves the hard part, such as sync, collaboration or layout;
- prior art beyond that one product.

Kevin asked for this on 2026-09-12 and 2026-10-01 on a project of his own, and the method applies to GT work unchanged. `docs/archive/feature-inventory.md` is the GT example: each capability with the proof a visual must show and the misunderstanding it must prevent.

### Text first

- For a page with many product visuals, write the page as text first, with every section's copy and a text description of every diagram, and build from that. Kevin, 2026-07-29: "create pages of text and then text describing diagrams u would build".
- `docs/archive/MODULES_PLAN.md` came from that ask. It is a build contract written so that five builders could work in parallel without inventing anything, ordered module by module the way Kevin reviews.
- Copy comes from production or approved text. On 2026-08-12 Kevin set the minimum: the live page's own wording beats any new copy that reads worse.

### The charter

Every round starts from a written charter that every builder and reviewer reads (`references/charter.md`): the GT elements every direction keeps, the ordered section contract, the homes where the round's new idea may live, the copy rules, the builders' technical limits, and a completeness checklist run by reading code. The deco rounds of 2026-09-14 and 2026-09-15 ran from one after Kevin rejected the round before it as incomplete. Keep the charter in the round's notes or the repository, since the deco charter was lost with a scratchpad.

### One exemplar first

Build one section, page or state, show it, and replicate it only after Kevin signs off on its grammar (`gt-aesthetic` section 5). On 2026-08-04 Kevin kept one element of a full build made on an unconfirmed reading, the Locadex isometric.

## 2. Making directions

### What makes a direction

A direction differs from the others on three axes.

| Axis | The question it answers | Examples from the registry |
| --- | --- | --- |
| Silhouette | What shape does the page or its hero make at thumbnail size? | one ruled column; stepped terraces; a concentric disk; a wall of courses |
| Material | What is the surface made of, and which engine draws it? | hairlines alone; an ordered-dither field; glyph rain; a lensing shader |
| Action | What is the one motion moment, and what visibly changes? | words condense out of rain; a component crosses a lens and exits translated |

A palette, a title or a new arrangement of the same parts does not make a new direction. On 2026-09-14 a deco round rebuilt ten directions as forks of one earlier direction, and seven of the ten heroes came out with the same layout, headline and hero visual. Kevin rejected the round. Before building, write a table with one row per direction and these three columns. Two rows that match in every column are one direction. The registry keeps each direction's action as `signature`.

### Rules for a set

- "Completely new" means starting from scratch while saying the same things about GT and keeping GT's design elements: the hairline grammar, the dither, the marks and real product content. Directions that follow the previous round closely are redone. Kevin, 2026-09-14: "for those new 10 i see they followed our old onees vvery closely. they need to be COMPLETELY NEW".
- When Kevin names a style or lineage, research it before drawing. The deco rounds of 2026-09-14 drew machine-age Metropolis forms, and Kevin meant the revival of Egyptian, Mayan and Assyrian forms, in geometry only.
- Each direction is complete at rest: every section built, the content contract met, and the page readable before any motion runs. Kevin rejected the first deco round as incomplete and short of GT's design elements (2026-09-14).
- A redesign Kevin asks for is visibly new. A change that keeps the old shape is returned as not done (2026-09-30).
- Build the number he asked for. "literally 20 samples" (2026-07-28) meant twenty.
- Start the sibling variants he implies. On 2026-08-04 Kevin sent the plan for the terminal-hero version of the landing and added "you are still responsible for self starting other non-terminal-hero version !"
- Check that the set differs before anyone sees it. On 2026-09-04 a set of ten shader frames went out and Kevin answered "they all looks the same bro 9 / 10 are the same". Run the check on every set of stills, frames or captures:

  ```bash
  node skills/gt-explorations/scripts/distinct-set.mjs public/shots/light/<slug-a>.jpg public/shots/light/<slug-b>.jpg
  node skills/gt-explorations/scripts/distinct-set.mjs <folder of frames> --strict
  ```

  It flags a pair under 2% mean difference as the same picture and a pair whose tone grids correlate at 0.9 or above as the same composition. A clean report means only that no two options are near copies. The silhouette, material and action table is still checked by eye.

### Where a direction lives

- In Prototemplate a direction is a self-contained route under `src/app/d/<slug>/`, with its CSS scoped under its own root class (`.<name>-root`) so it never restyles another direction. `$PROTOTEMPLATE/skills/prototemplate/references/adding.md` ("A direction") gives the steps file by file.
- A variant of a gt-cloud production page lives behind a switch on the real route (section 4).

## 3. One registry, Kevin's numbers

`references/registry.md` holds the fields, the views and the record.

- `src/lib/directions.ts` (`DIRECTIONS`) is the one list. The gallery, `/directions/<slug>`, `/compare`, `/present`, the sitemap and the page check all read it, so a direction is registered once. `label` is the number Kevin uses, `slug` is fixed for the life of the direction, and `signature` holds its action.
- The shipped outcome carries no `label`, so it never enters the comparison (127960d, 2026-08-25). `REFERENCE_MARK` in `src/lib/marks.ts` works the same way.
- Refer to every version by the number Kevin uses, in reports, notes and commits (2026-07-29). The number he uses is the one he saw: the gallery's book view shows `label`, and the shell's sidebar and toolbar count positions. When a number could name two directions, find which view he was on, and ask once if it is still unclear.
- A version that was overwritten comes back under a number of its own, and keeps the trait it was kept for (versions 0 and 11, 2026-07-29).
- Renumber only when Kevin asks, in one registry pass: remove the losers, number the keepers from the one he names, and keep every slug and URL (2026-07-31). Otherwise survivors keep their numbers, new directions take the next free ones, and gaps are expected (2026-09-14).
- Counts written in prose drift from the registry (on 2026-10-05 six files disagreed with its 27 entries). After any registry change, find and fix them in the same change:

  ```bash
  grep -rniE "\b(thirteen|sixteen|seventeen|twenty|[0-9]+ directions)\b" README.md ARCHITECTURE.md public/llms.txt src/app src/lib src/components | grep -v "src/app/d/"
  ```

## 4. Comparing

### One place to switch

Kevin compares directions live in one place. Kevin, 2026-07-28: "give me one place to switch between all of these". Prototemplate has four views over the registry.

| Route | What it shows | Source |
| --- | --- | --- |
| `/` | the gallery: every direction as an article (Book), one live 1440 exhibit at a time (Live), or every capture at once (Grid) | `src/app/GalleryViewer.tsx` |
| `/directions/<slug>` | one direction on the shell: its summary, both captures and a live frame | `src/app/directions/` |
| `/compare` | two directions side by side in scroll-locked same-origin frames, with the pair in the hash (`#a=<slug>&b=<slug>`) | `src/app/compare/` |
| `/present` | the presenter: the opening slides, the first 16 prototypes live with a note and a star rating, and a closing gallery | `src/app/present/` |

- The presenter keeps notes and ratings in the reviewer's own browser (`localStorage` key `gt-presenter-review:v1`, `src/app/present/viewer/reviewStore.ts`). They never reach another machine or an agent, so ask Kevin for his notes in chat. `src/app/present/directions.ts` filters the presenter's list; Signal has been out since 2026-09-09.
- Direction pages hide their corner control under `?chrome=0`. Every capture uses it, so the control is never judged as part of a design.

### Variants, options and modules

`references/comparing.md` holds the detail.

- **Variants of a production page** in gt-cloud sit behind a switch on the real route: a `?v=1..5` parameter with a per-page cookie, a thin dispatcher per page, slot 1 as the committed page unchanged, and a development-only dock. Every variant follows the copy law: production wording, approved wording, or no words (2026-08-12).
- **Effect variants** (shaders, dithers, hover effects, palettes) get an options menu inside the page, read from one roster that the switch, the craft page and the default share (2026-08-05, 2026-08-13).
- **Layout options** are whole-page screenshots (2026-09-07), and a change to one area is shown as before and after crops. Every option carries its number where Kevin sees it: a contact sheet for stills and frames, a listening page for audio (`gt-reporting` section 1).
- **A direction's captures** are the first fold at 1440 by 900 under `?chrome=0`, written by `pnpm capture:pages --direction <slug>`. Open every capture before using it.
- **Many directions are reviewed module by module**: one module across every direction, then the next, in the order of the plan (2026-07-29).

## 5. Picking and forking

- Kevin picks by number and can compose a design from parts of several directions. On 2026-07-29 version 1 had "the best layout direction", number 6 had the best wheel, and 5 had the best story section and bentos. Record each pick against its number before building, in a table the next round reads; `docs/archive/ITERATION_SPEC.md` is the July table.
- Keepers become real routes. On 2026-07-29 Kevin listed the first keepers and wrote "make these into next apps and begin iterating off of these".
- A new version is a fork with its own number, slug and root class, and the original stays as it was.
- When one direction is the single source of truth, the forks import its parts and fork work never edits it. In July that source was Toolchain: forks import `src/app/d/toolchain` and rescope its CSS under their own root class (`ARCHITECTURE.md`, "The SSOT rule").
- Rounds narrow from directions to variants: N directions, a pick, then variants of the pick. Kevin, 2026-08-05: "i like 01 bayer dither the most, give a bunch ofoptions based off of this ins tead". The variants of a winner move along real axes of its engine (for the Bayer family: matrix order, cell scale, the tone field under the matrix, motion and palette balance), and slot 01 stays the pick, byte for byte (`src/lib/studio-field.ts`).
- A shortlist deepens the survivors. In the fifth deco round the seven Kevin shortlisted were built out within their own forms, and three new forms were added beside them (2026-09-14).

## 6. Converging

### The critic loop

A round converges through a separate harsh critic who scores the work against the reference side by side. `gt-orchestration` section 4 holds the loop, the bar and the July rubric (`docs/archive/DESIGN_STANDARD.md` section 8). A design round feeds the critic composites.

- Capture the work and the reference at the same viewport and theme, section against matching section. Shoot each section as an element screenshot anchored on its own landmark selector, so the pairs align at any viewport. A capture taken at a scroll depth drifts when the viewport changes. `scripts/check/gallery-shoot.mjs` does this for the Dossier's sections against the dev server on 3005, and `REDESIGN_BASE` points it at another address.
- Join each pair into one image the critic reads. `docs/composites/` holds the July composites of the work beside resend, oxc and viteplus. Two captures join at a common height with ffmpeg:

  ```bash
  ffmpeg -i ours.png -i reference.png -filter_complex "[0]scale=-2:900[a];[1]scale=-2:900[b];[a][b]hstack=inputs=2" composite.png
  ```

### After a rejection

- When Kevin rejects a round, restart from the reference or the last approved state. The rejected version is never the base of the next attempt (`gt-aesthetic` section 2). Kevin, 2026-08-11: "these diagrams are so bad. i literally want you to restart these lol".
- Before restarting, list everything Kevin praised and everything he screenshotted, and carry each item into the new round unchanged. Kevin, 2026-08-12: "my screenshotted ones are the most important to keep". On 2026-08-04 the one element he praised, the Locadex isometric, became the base of the rebuild.

### The default

The exemplar Kevin picks becomes the documented default, with its parameters in code and a comment that names the pick. `BAYER_DEFAULT_ID` in `src/lib/studio-field.ts` names 02 bayer-8x8 as the shared default, and the landing hero's measured composite is the strength every later field is held to (`gt-aesthetic`, "Material").

## 7. After the pick

### Remove the losers

- In production code, the alternatives and the switcher leave the code after Kevin picks, and they stay in git history. Kevin's words on the gt-cloud variants (2026-08-12) were "get rid of the variation system, the first ones of each are teh ones we'll go with more likely".
- Prototemplate is the record of the rounds, so a reviewed direction stays in `DIRECTIONS` with its in-page switches until Kevin cuts or retires it. `HeroFieldSwitcher` still swaps the Dossier hero's field on 2026-10-05. A direction cut inside a round leaves in a commit that names it: b6a7eba names the three revival directions cut on 2026-09-14, and its parent holds their code.
- The winner stays byte-identical through the removal. Diff its files against the commit before the removal (`git diff <before> -- <winner's paths>` prints nothing), and capture its route before and after at the same viewport. On 2026-08-12 the flattened sign-in route was checked byte-identical to the committed page.
- Name the commits that held the alternatives in the body of the removal commit, so any of them can be recovered.

### Archive before overwriting

- Archive each published version before replacing it, so an earlier element can come back exactly. On 2026-10-03 Kevin asked for part of an earlier film cut to return: "bring back the isometric view that transitions into more in the designing docs film, no need to replace anything".
- A direction retired from the lineup becomes an entry in `src/lib/archive.ts`: its slug and name, a 1440 first-fold capture and a full-page capture under `public/shots/archive`, and the last commit that held its code. `/archive/<slug>` shows it, and `git checkout <lastCommit> -- src/app/d/<slug>` restores it. Retiring also prunes its paths from `scripts/lint/practices.baseline.json`.
- A film's final is copied to the next `motion/out/v<N>/` folder before it is overwritten, and each film folder keeps `archive/` for earlier compositions (`gt-films`, "Renders").

### Landing

- A round stays uncommitted or on its own branch until Kevin reviews it on localhost and says to land it. Kevin, 2026-09-14: "wait what theyre on main? they shouldnt be pushed i should be revieiwing them loclaly". Prototemplate main deploys www.prototemplate.com, which readers outside GT see. He reviews on the running Prototemplate server (`gt-local-dev` section 1).
- Landing is his call for each round. On 2026-09-15 he shortlisted seven deco directions on localhost and said "commit and push oriignn main, we can put this on live prototemplate now". The commit he had reviewed (b6a7eba) went to main, and the next round continued on the branch. `gt-ship` section 8 holds the landing steps for the shared checkout.
- In gt-cloud a round lives on a `k/<topic>` branch in its own worktree and becomes a PR when Kevin asks for one (`gt-ship` section 1).

## Review checklist

- [ ] Kevin's sources were read, including the media of every post he linked, and each reference is mapped to the section it informs.
- [ ] The named reference sites were measured at the same viewport and theme, and the findings are written down.
- [ ] A product being cloned or answered was researched (features, controls, import paths, the hard part) and the notes exist before the first direction.
- [ ] A page with many visuals was written as text first, with every diagram described.
- [ ] The directions differ in silhouette, material and action, the table shows how, and `distinct-set.mjs` flags no pair.
- [ ] Each direction is complete at rest, says the same things about GT, and keeps GT's design elements.
- [ ] Every direction is in `DIRECTIONS` once, its `label` is the number Kevin uses, and every count written in prose matches the registry.
- [ ] Kevin can switch between all options in one place, and effect variants have an in-page menu.
- [ ] No version was overwritten: each fork has its own number, slug and root class, and the source of truth was not edited during fork work.
- [ ] Every element Kevin praised or screenshotted is still present.
- [ ] Critic scores came from side-by-side composites against a written rubric.
- [ ] After the pick, production code holds only the winner, byte-identical, and the removal commit names the commits that held the alternatives. A direction retired from Prototemplate's lineup is archived with its last commit.
- [ ] Nothing reached Prototemplate main or a gt-cloud PR before Kevin said to land it.

## Related skills

GT skills: `gt-aesthetic` (the references, the verdicts and the review loop), `gt-orchestration` (the critic loop and the agents that run it), `gt-verify` (what each kind of check proves), `gt-reporting` (showing a round to Kevin), `gt-local-dev` (review servers), `gt-ship` (landing), `prototemplate` (the registries and adding a direction), `gt-dither` (the Bayer engines and presets) and `gt-films` (film rounds and their archive). Wiki skills: `absorb-sources` and `x-bookmark-absorb` (ingesting posts and bookmarks), `design-engineering-polish` (its `references/signature-first-exploration.md` applies the same duplicate test to signature visuals), `animated-component-libraries` (component sources) and `agent-browser`.

## Sources

`references/sources.md` lists the Prototemplate files and commits, the gt-cloud commits, the wiki pages, the memory notes and Kevin's dated directives behind each section, and the lines added on 2026-10-10.
