# Prototemplate, Kevin's hub for General Translation work

Prototemplate is Kevin Liu's hub and working wiki for how General
Translation work is done. General Translation (GT) is the localization
platform for developers. The repository holds the brand book, the brand
directives, the design lab with its directions and sites, the repository
documents, the curated skills, the handbook, the mark explorations, the
blog graphics and the films, and serves all of it as live pages in one
viewer. The skills under `skills/` install into any other project with one
command, and [`AGENTS.md`](./AGENTS.md) and the handbook copy in beside them
(see Import this into another project below), so an agent working in
another repository reads the same rules, and a new project can start from
this one and build on it. An agent starts at [`AGENTS.md`](./AGENTS.md).

Every direction is a built page that runs live. The Dossier
(`/d/singularity-dossier`) is the site concept Kevin called complete on
2026-08-06 and the direction the shipped site grew from. The brand has
moved past it since then (Kevin, 2026-10-06), and since 2026-10-07 the
Dossier is no longer the reference for the brand or the site. Signal and
Orbit are the two earlier site concepts, each keeping its own hero and
the sections the Dossier retired; `/d/production` is the site that
shipped at generaltranslation.com, rebuilt page for page.
Its Shipped section also carries the dashboard's sign-in and onboarding
system, which lives under `src/components/plate` with its state console
(`/d/production/signin`, `/onboarding`, `/consent`, `/device`, `/cli`;
`?state=<id>` opens any state).

## What is here

The site is served at three addresses:
https://www.prototemplate.com (the General Translation team's Vercel
project; the apex domain redirects to www), and
https://prototemplate.vercel.app and https://prototemplate.kevinliu.studio
(both from Kevin's personal Vercel project). Every route below works at
each of them.

- `/`: the design lab, the twenty-seven directions read as an article, one live exhibit at a time, or as a grid of captures, with the anatomy wall (the flagship cut into section tiles, light and dark, desktop and mobile) and the capabilities ledger (what the system can do, each entry pointing at where it runs live)
- `/brand`: the brand book, the identity canon in ten sections
- `/docs`: the repository documents read in the browser, one address per document, with the build log under the readme
- `/deck`: the General Translation brand deck, 93 slides in its own viewer
- `/skills`: the curated skills, one page per skill with its SKILL.md, its files and its install line, and the raw files at `/skills/<slug>/SKILL.md`
- `/handbook`: how Kevin runs General Translation work, read as one book: the operating principles, the quality bar, the multi-session playbook, the product map, the glossary and the decisions log, one address per document (`/handbook/<slug>`)
- `/marks`: the mark explorations, every candidate drawn in one color
- `/blog`: the docs-redesign series as General Translation published it, three posts with their sources under `content/`
- `/graphics`: every illustration of the series, by area, with what it shows and the glyphfield export it sits on; made with the toolchain in `graphics/`
- `/motion`: every film on the motion roster with its length and status, the research package of each film in the translation series (`/motion/<slug>`), and the contact sheet and script of each published cut; generated from `motion/` by `pnpm build:motion`, which publishes a film's credits, sheet and script only for the cut `public/motion/published.json` pins and lists a newer cut as in review
- `/compare`: two directions side by side in scroll-synced frames
- `/present`: the presenter, a full-screen walkthrough of the redesign with every prototype live
- `/archive`: the retired directions, each kept as a full-page capture with the commit that last held its code

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3005
```

## Read first

| doc | what it holds |
| --- | --- |
| [`AGENTS.md`](./AGENTS.md) | the entry point for an agent: the read order, the principles in brief, which skill to load for a task, the house rules, and how to use the hub in another project (`CLAUDE.md` imports it) |
| [`docs/handbook/`](./docs/handbook/README.md) | how Kevin runs GT work: the operating principles, the quality bar, the multi-session playbook, the product map, the glossary and the decisions log; the live version is `/handbook` |
| [`BRAND.md`](./BRAND.md) | the identity canon: the name, the idea, the character and voice, the mark, color, type, language as material, and the context for partners |
| [`DESIGN.md`](./DESIGN.md) | the visual canon: the four-color system, the line law, rails/grounds/seams, the doubled line, iso, the 1-bit language, moving type, motion discipline, the mobile type ladder, the svh/dvh law, the two read lines |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | the code map: directions registry, the toolchain SSOT + fork rescoping, the component inventory |
| [`docs/SHIP-LOOP.md`](./docs/SHIP-LOOP.md) | the verify/ship procedure every round runs (line audit, page check, ratchet, tsc, filming, mirror build) |
| [`docs/LIBRARIES.md`](./docs/LIBRARIES.md) | the library index; the live version is `/craft` |
| [`public/media/`](./public/media/README.md) | finished artwork made with the system: the Open Source announcement reel, the X banner, two blog films and three partnership globes, shown live in `/brand`, and the three translation series films, which play on `/motion` |
| [`docs/GRAPHICS.md`](./docs/GRAPHICS.md) | the graphics pipeline: how the blog illustrations are captured, composed, rendered, clipped and handed to a post; the live version is `/docs/graphics`, and the set is `/graphics` |
| [`graphics/`](./graphics/README.md) | the toolchain itself: the generator, the renderer, the exports, the captures and the recordings |

## Skills

The skills under `skills/` record how Kevin does General Translation work:
the rules, the tokens, the commands, the files, the traps and the review
standard for each area of it. Each is a folder in the standard SKILL.md
format (frontmatter `name` and `description`, a `metadata` block with the
title, the areas and the last update, then the body), with its references
and scripts beside it, so Claude Code, Codex and other agents load it as
it is. `/skills` lists them by area, each skill's page shows its body, its
files and its install line, and `/skills/<slug>/SKILL.md` serves the raw
file (`/skills/index.json` lists the whole set for an agent).
[`skills/README.md`](./skills/README.md) indexes the folder by area for a
reader on GitHub or in an imported copy; `pnpm build:skills` writes it.

| area | skill | folder | also in |
| --- | --- | --- | --- |
| Voice | Voice and the humanizer | [`gt-voice`](./skills/gt-voice/SKILL.md) |  |
| Website | GT website | [`gt-website`](./skills/gt-website/SKILL.md) |  |
| Website | Working in Prototemplate | [`prototemplate`](./skills/prototemplate/SKILL.md) | Components |
| Website | Performance without visual loss | [`gt-performance`](./skills/gt-performance/SKILL.md) | Landing pages, Motion |
| Landing pages | Landing page grammar | [`gt-landing-pages`](./skills/gt-landing-pages/SKILL.md) | Aesthetic |
| Aesthetic | Taste and the review standard | [`gt-aesthetic`](./skills/gt-aesthetic/SKILL.md) | Website, Landing pages, Components |
| Aesthetic | Brand and the correct Inter | [`gt-brand`](./skills/gt-brand/SKILL.md) |  |
| Aesthetic | Brand deck | [`gt-deck`](./skills/gt-deck/SKILL.md) | Graphics |
| Aesthetic | Exploration rounds and convergence | [`gt-explorations`](./skills/gt-explorations/SKILL.md) | Website, Landing pages, Graphics |
| Lints | Lints and gates | [`gt-lints`](./skills/gt-lints/SKILL.md) |  |
| Motion | Motion rules | [`gt-motion`](./skills/gt-motion/SKILL.md) | Landing pages, Videos, Diagrams |
| Graphics | Blog and brand graphics | [`gt-graphics`](./skills/gt-graphics/SKILL.md) |  |
| Graphics | Dither and artifact pictures | [`gt-dither`](./skills/gt-dither/SKILL.md) | Aesthetic |
| Videos | Making a film | [`gt-films`](./skills/gt-films/SKILL.md) | Motion |
| Diagrams | Drawing diagrams | [`gt-diagrams`](./skills/gt-diagrams/SKILL.md) |  |
| Isometry | Isometric drawings | [`gt-isometric`](./skills/gt-isometric/SKILL.md) | Diagrams |
| Components | Components to reuse | [`gt-components`](./skills/gt-components/SKILL.md) | Landing pages, Website |
| Workflow | Review servers and local environments | [`gt-local-dev`](./skills/gt-local-dev/SKILL.md) | Website |
| Workflow | Proving work is done | [`gt-verify`](./skills/gt-verify/SKILL.md) | Lints, Website, Aesthetic, Motion |
| Workflow | Branches, PRs and landing | [`gt-ship`](./skills/gt-ship/SKILL.md) | Lints |
| Workflow | Reporting to Kevin | [`gt-reporting`](./skills/gt-reporting/SKILL.md) | Voice |
| Workflow | Running agent fleets and long autonomous runs | [`gt-orchestration`](./skills/gt-orchestration/SKILL.md) |  |

Install them into any project from a checkout of this repository. The
script needs Node and nothing else:

```bash
node scripts/install-skills.mjs --list                               # the set
node scripts/install-skills.mjs --project ~/code/app --dry-run       # every step, nothing written
node scripts/install-skills.mjs --project ~/code/app                 # link all of them
node scripts/install-skills.mjs gt-voice gt-brand --project ~/code/app --copy   # vendor two
```

- `--project <dir>` writes `<dir>/.claude/skills/<slug>` and
  `<dir>/.agents/skills/<slug>`; `--agents claude,agents,codex` adds
  `.codex/skills`. `--user` writes the same folders under the home
  directory, and `--into <dir>` writes one folder of your choice.
- The default is a link to the canonical folder, so a `git pull` here
  updates every project that links it. Inside this repository the links
  are relative, which is how the committed `.claude/skills` and
  `.agents/skills` links are made (`--project .`). In a repository that
  teammates clone, use `--copy`; the script says so when git tracks the
  target.
- The script never writes into another git repository through a linked
  folder. On Kevin's machine `~/.claude/skills` and `~/.agents/skills` are
  links into his wiki's runtime list, so `--user` refuses there and says
  why; `--into` names a folder when that write is wanted.
- It replaces only its own entries (a link to this checkout, or a folder
  whose SKILL.md says `origin: prototemplate`). It skips anything else with
  the same name, and `--force` moves that entry aside, never deleting it.
  `--uninstall` removes its own entries and nothing else.

How the set relates to the other skills Kevin uses:

- Kevin's wiki holds his general skills (the humanizer, kevin-voice,
  agent-browser, create-graphics, the HyperFrames skills) and projects
  them into `~/.claude/skills` and `~/.agents/skills`. The skills here are
  the General Translation layer on top of them: each names the wiki
  skills it builds on, and no slug here exists in the wiki, so an install
  never shadows one. Prototemplate work never edits the wiki.
- gt-cloud's own `.agents/skills` (gt-landing, gt-ui, gt-dashboard,
  glyphfield, code-comments) stay authoritative for gt-cloud's code maps.
  A skill here points to them and copies none of their file maps.

To change or add a skill, edit `skills/<slug>/SKILL.md` and run
`pnpm build:skills`, which validates every skill against the contract and
regenerates `src/lib/skills.ts` for the site and `skills/README.md`;
`pnpm lint:skills` fails while either is stale or a skill breaks the
contract. The contract and the steps for a new skill are in
[`skills/prototemplate`](./skills/prototemplate/SKILL.md).

## Import this into another project

The hub is built to be copied into another repository so that project's
agents work the GT way. What travels: the skills with their installer,
`AGENTS.md`, the handbook, and the two canon files the skills cite
(`BRAND.md`, `DESIGN.md`). Copied into the same places, every relative
link between them keeps working. From a checkout of this repository:

```bash
# 1. the skills and their installer, at the project root as they sit here
cp -R skills ~/code/app/skills
mkdir -p ~/code/app/scripts && cp scripts/install-skills.mjs ~/code/app/scripts/

# 2. the agent guide, the canon the skills cite, and the handbook
cp AGENTS.md BRAND.md DESIGN.md ~/code/app/
mkdir -p ~/code/app/docs && cp -R docs/handbook ~/code/app/docs/handbook

# 3. link the skills where agents look for them (see every step first),
#    and point Claude Code at AGENTS.md
cd ~/code/app
node scripts/install-skills.mjs --project . --dry-run
node scripts/install-skills.mjs --project .
printf '# CLAUDE.md\n\n@AGENTS.md\n' > CLAUDE.md
```

- Step 3 writes relative links from `.claude/skills` and `.agents/skills`
  to the copied `skills/`, the layout this repository commits, so they work
  for everyone who clones the project.
- On your own machine you can skip the copy and link every project to this
  checkout instead: `node scripts/install-skills.mjs --project ~/code/app`
  from here, so a `git pull` here updates them all. The handbook's links to
  `skills/` then resolve only on the site and on GitHub.
- If the project already has an `AGENTS.md` or a `CLAUDE.md`, merge the
  sections in by hand and keep the project's own.
- Then edit the copied `AGENTS.md` for the new project: its name and what it
  is, its own commands, ports and gates in "Working in this repository", its
  session lanes, and any house rule that does not apply there (the line law
  and the radius law hold for GT surfaces). Keep the read order, the
  principles and the routing table.
- A few handbook links name files that stay here (`ARCHITECTURE.md`,
  `LICENSE`, `docs/ARTIFACT-PICTURES.md`). Read them on the site or on
  GitHub. To take later changes, copy the folders again; to read the
  current canon without copying, use its address on the site
  (www.prototemplate.com/docs/design, /docs/brand, /handbook,
  /skills/<slug>).
- The page check and the line audit run against any site from this
  checkout: `pnpm check:pages --base <url> --pages-module <file>` and
  `node scripts/lint-lines.mjs <url>` (the `prototemplate` skill, "Using the
  hub from another project"). On another machine set `CHROME_PATH` to a
  local Chrome for Testing first.
- The license still applies to what you copy: the code, the writing, the
  brand and the designs are copyright General Translation, Inc. (License
  below).

## The one-paragraph tour

Every page runs on the laws: hairlines drawn exactly once
(`scripts/lint-lines.mjs` fails the round otherwise; `pnpm check:pages`,
`scripts/pagecheck/`, reads every page on phones, tablets and desktops in
both themes and reports what did not hold), four absolute colors
plus one spectral accent per page, dark mode as a pure token remap, and one
mobile type ladder (`DESIGN.md` §12). `src/app/d/toolchain` is the
single source of truth the fork directions import and re-skin by root-class
rescoping; `src/lib` holds the visual engines; `src/components/shared` holds
the instruments. `src/lib/directions.ts` registers every direction, and the
index, the presenter and the sitemap all follow it. The anatomy wall's tiles come
from `docs/harness/gallery-shoot.mjs` under deterministic names
(`ARCHITECTURE.md`, "The gallery pipeline"), and a missing tile drops
from the wall.

## License

Prototemplate is public so that anyone can read it, but it is not open
source. The code, the writing, the brand and the designs are copyright
General Translation, Inc., all rights reserved, and no reuse is granted
without written permission. Third-party fonts, icons, photographs and
adapted skills keep their own licenses. See [LICENSE](./LICENSE).
