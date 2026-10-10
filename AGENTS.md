# Prototemplate: the agent guide

General Translation (GT) builds localization tools for developers: open-source i18n libraries, a translation platform and the Locadex agent. Prototemplate is Kevin Liu's hub for his GT work and the wiki of how he does it. It holds the brand and design canon, the brand deck, the design lab, the curated skills and the handbook, and serves all of it at www.prototemplate.com, prototemplate.vercel.app and prototemplate.kevinliu.studio. The General Translation team's Vercel project serves the first and Kevin's personal Vercel project serves the other two, and both projects deploy this repository's main branch. This file is the entry point for an agent working in this repository, or in another project that imported the hub. It is short on purpose: the skills hold the procedures and the handbook holds the depth.

Kevin's own words, 2026-10-05: "this prototemplate is supposed to be my hub for general translation work, but also i should be able to use it anywhere and build on top of it so it also acts as a wiki / repository of how i do work at GT".

## Read in this order

1. This file.
2. [Operating principles](docs/handbook/operating-principles.md), before the first task.
3. The skill for the task, from the routing table below. Its Review checklist is the bar for the work.
4. [Quality bar](docs/handbook/quality-bar.md), before showing Kevin anything or shipping it.
5. [Decisions log](docs/handbook/decisions.md), before changing a standard or when two sources disagree.

## The principles in brief

The [operating principles](docs/handbook/operating-principles.md) hold all eighteen with their sources.

1. Finish everything that was asked. "Continue" resumes every open item and every open lane.
2. Do every step an agent can do, and collect what only Kevin can do (a login, a payment, an approval) into one numbered list.
3. Change only what was asked, keep what he approved, and after a rejection restore the exact earlier state.
4. Fix the whole class of a defect, and add the lint or test that keeps it from coming back.
5. Measure the rendered result at the spot Kevin flagged. A page that loads is a proxy check and proves nothing about the look.
6. Show the result before he asks: before and after crops, a running URL, a gallery of takes.
7. Use real content and real assets, sourced and credited. Invent no quotes, numbers or logos.
8. Ship nothing unnecessary, and prefer the free and cheap design.
9. Keep secrets in protected files, and keep private facts off this public repository.
10. Codify what worked as a skill, a document or a lint that any agent can load.

## Which skill to load

The skills live in `skills/<slug>/SKILL.md`. In this repository they are already linked into `.claude/skills` and `.agents/skills`, so Claude Code, Codex and other Agent Skills loaders find them by name. [skills/README.md](skills/README.md) lists them by area.

| Task | Skill |
| --- | --- |
| Writing any text: copy, docs, captions, PRs, posts, Slack | `gt-voice` |
| Ending a turn, reporting state, the PR slate, decision lists | `gt-reporting` |
| A page, doc, route or build of generaltranslation.com | `gt-website` (with gt-cloud's own `gt-landing`) |
| A landing, pricing, enterprise or careers page | `gt-landing-pages` |
| Anything in this repository | `prototemplate` |
| Running or debugging a local server, letting Kevin try a build | `gt-local-dev` |
| Lag, frame cost, Lighthouse, a heavy shader or canvas | `gt-performance` |
| Design taste, polish, a surface Kevin calls bad or busy | `gt-aesthetic` |
| The brand, the one Inter, marks and third-party logos | `gt-brand` |
| A slide, the brand deck or any GT presentation | `gt-deck` |
| Options, directions, variants, converging on a pick | `gt-explorations` |
| A lint, a gate, a new rule to enforce | `gt-lints` |
| Proving a fix or feature is done | `gt-verify` |
| Commits, PRs, review bots, stacks, landing | `gt-ship` |
| Workflows, subagents, briefs, handoffs, resuming after a stop | `gt-orchestration` |
| Animation of any kind | `gt-motion` |
| A blog or launch graphic | `gt-graphics` |
| Dithered fields and artifact pictures | `gt-dither` |
| A film, trailer, promo or demo GIF | `gt-films` |
| A diagram | `gt-diagrams` |
| An isometric drawing | `gt-isometric` |
| UI components and how product UI behaves | `gt-components` |

## The handbook

[docs/handbook/](docs/handbook/README.md), also served at /handbook:

- [Operating principles](docs/handbook/operating-principles.md): the standing rules and where each procedure lives.
- [Quality bar](docs/handbook/quality-bar.md): the bar for each kind of artifact and for done.
- [Multi-session playbook](docs/handbook/multi-session-playbook.md): lanes, forks, shared checkouts, collisions, Claude and Codex on one main.
- [GT product and architecture map](docs/handbook/gt-product-map.md): what GT sells, the copy that must be exact, the repositories.
- [Glossary](docs/handbook/glossary.md): the working vocabulary and where each term lives.
- [Decisions log](docs/handbook/decisions.md): Kevin's dated rulings and what each replaced.

## House rules

- **Writing.** Plain technical English: complete declarative sentences, no em dashes, no metaphors, no "X, not Y" pairs, no signposts and no eyebrows. Headings are plain nouns in sentence case with no trailing period (`gt-voice`).
- **Type.** Inter is the only typeface, the self-hosted rsms InterVariable, at weight 500 or less, read through the type tokens. `pnpm lint:type` holds it (`gt-brand`).
- **Lines.** Every line is drawn once by one owner, in one of three roles (DESIGN.md section 2). `pnpm lint:lines:shell` holds it.
- **Corners.** Rounded controls, square shells: controls and cards at 6px, chips at 4px, and only the shells square (DESIGN.md section 2, Corners). `pnpm lint:radius` holds it.
- **Pages.** Every page with a book head follows one structure (DESIGN.md section 4, The book page). `pnpm lint:heads` holds it.
- **Explorations stay local.** New directions and redesign rounds stay uncommitted or on a branch until Kevin reviews them on localhost and says to land them (`gt-explorations`, `gt-ship` section 8).
- **One session per lane.** Several sessions share this checkout. Work that belongs to another lane goes to that session by name, `motion/` belongs to the Videos session and stays untracked, and nobody runs `git add -A` or `git add .` (`docs/handbook/multi-session-playbook.md`, `prototemplate` section 8).
- **Commits.** Stage explicit paths and commit with a pathspec. gt-cloud commits carry the repository's configured General Translation work identity, which its Vercel deploys require; never set that identity globally (`gt-ship` section 2).
- **Landing.** Kevin merges, or says to merge. In this repository nothing reaches main until he has reviewed it on localhost.
- **Privacy.** The repository and the site are public. No keys, tokens, account ids, email addresses, personal details, unannounced plans or business figures go into a file, a capture or a commit (operating principle 18).

## Working in this repository

```bash
pnpm install
pnpm dev                      # http://localhost:3005
pnpm exec tsc --noEmit        # 3 to 5 minutes
pnpm lint:all                 # every static lint, the live audits against 3005 and the lint tests
pnpm check:pages --preset quick --pages <id> # eight devices in dark and 1440x900 in light on the touched pages
```

- Reuse the dev server on 3005 when it is running, and never build in the shared `.next`. The build gate runs in a scratch worktree with `&&` (`gt-ship` section 8).
- The browser lints launch the Chrome for Testing build `playwright-core` installs (`pnpm exec playwright-core install chromium`); `CHROME_PATH` overrides it.
- Generated files change only through their scripts: `pnpm build:skills` (`src/lib/skills.ts`, `skills/README.md`), `pnpm build:updated` (`src/lib/updated.ts`), `pnpm build:deck`, `pnpm build:marks`. `pnpm build:motion` runs only when the Videos session hands a film over (`gt-films` section 11).
- `README.md` maps the routes, `ARCHITECTURE.md` the code, `DESIGN.md` the visual laws and `BRAND.md` the identity.

## Using the hub in another project

README.md's "Import this into another project" section gives the commands. In short:

1. Copy `skills/` and `scripts/install-skills.mjs` to the project's root, then run `node scripts/install-skills.mjs --project . --dry-run` there and again without `--dry-run`. The skills land as relative links in `.claude/skills` and `.agents/skills`, the layout this repository uses.
2. Copy `AGENTS.md`, `BRAND.md`, `DESIGN.md` and `docs/handbook/` beside them, so every link between the skills, the canon and the handbook keeps working, and add a `CLAUDE.md` that imports `AGENTS.md`.
3. Edit the copied `AGENTS.md`: the project's name and purpose, its own commands and ports, its lanes, and its own gates. Keep the principles, the routing table and the house rules that still apply.
4. Read the current canon by its address on the site (www.prototemplate.com/docs/design, /handbook, /skills/<slug>), and copy the folders again to take later changes.

## Ending a turn

A turn that changed something ends the way `gt-reporting` section 4 sets out: the answer to what Kevin asked in the first line, what shipped with its exact state, something he can see, a numbered list of what only he can do, and the risks, numbered so he can answer by number.
