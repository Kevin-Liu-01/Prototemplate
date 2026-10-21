# Handbook

This handbook records how Kevin Liu runs his work at General Translation (GT), a localization platform for developers. It is written for the agents and people who work with him: Claude Code and Codex sessions, teammates, and anyone who copies this repository into another project to work the same way. The [skills](../../skills/README.md) hold the procedures for each area of the work. The handbook holds what spans them: the standing principles, the bar for done, the rules for running many sessions and agents at once, pull requests and review, the product facts, the vocabulary and the dated rulings.

The handbook is a section of the docs site, served at /docs/handbook on each of the site's three addresses (www.prototemplate.com, the canonical one, and the aliases prototemplate.vercel.app and prototemplate.kevinliu.studio). The files live in `docs/handbook/` of the public repository, and each page of the section includes its file, so the site always shows the file as it stands. The section opens with the [agent guide](../../AGENTS.md) and the operating principles. Its Process folder holds seven of the ten documents below, its Reference folder holds the product map and the glossary, and its Canon folder holds eight files from the repository's root and `docs/`: [BRAND.md](../../BRAND.md), [DESIGN.md](../../DESIGN.md), the [libraries](../LIBRARIES.md) with the build log, the [graphics pipeline](../GRAPHICS.md), the [artifact pictures](../ARTIFACT-PICTURES.md), [ARCHITECTURE.md](../../ARCHITECTURE.md), the [ship loop](../SHIP-LOOP.md) and the [tools](../TOOLS.md). Each page also answers as Markdown at its address plus `.md`. The rest of the docs site explains how the hub works.

## The documents

| Document | What it holds | Read it |
| --- | --- | --- |
| [Operating principles](operating-principles.md) | The eighteen standing rules behind Kevin's corrections, each with how to apply it, the skill that holds its procedure and the dated directive it comes from | Before the first task of any GT work |
| [Quality bar](quality-bar.md) | The measurable bar for each kind of artifact and for done, each row with the skill that owns it | Before showing Kevin work or shipping it |
| [Multi-session playbook](multi-session-playbook.md) | Lanes, forked sessions, one instruction sent to several sessions, shared checkouts, collisions, Claude and Codex on one main, relay notes and shared resources | When another session works on the same machine or repository |
| [Decisions log](decisions.md) | Kevin's dated rulings, what each replaced, his words and the lint, gate or skill that holds it | Before changing a standard, and when two sources disagree |
| [Agents on one machine](shared-machine.md) | Stopping processes by their ids, zsh traps, exit-status gates, memory and disk, long commands and shared checkouts, each with the incident that set it | Before running agents, builds or servers on a machine other sessions use |
| [Agent workflows](workflows.md) | Lane prompts that survive relayed messages, resuming a run, workflow shapes, refuters, kinds of check and paid model runs | Before launching subagents or a long autonomous run |
| [Pull requests and CI](pull-requests.md) | CI signals that mislead, the review bots, pull request size and crops, parity for a redesigned flow, lints and ratchets, and git on shared trees | Before opening, updating or reporting a pull request |
| [Reviewing with Kevin](review.md) | How his review words map to measures, one exemplar before a set, how a result reaches him, the ship states and the ask ledger | Before showing Kevin work and when reading his feedback |
| [GT product and architecture map](gt-product-map.md) | What GT sells and to whom, how the products fit together, the copy that must be exact, the CLI and agent entry points, and the repositories | Before writing about, designing for or changing a GT product |
| [Glossary](glossary.md) | The terms in Kevin's messages, the skills and the code, each with where it lives | When a word in a request or a skill is unfamiliar |

## How the handbook relates to the skills

- A skill holds the procedure. The handbook states the rule and names the skill. When the two disagree, the skill is right, and the change that finds the difference corrects the handbook.
- `AGENTS.md` at the repository root is the entry point for an agent. It summarizes the principles, routes each kind of task to its skill, and points here for depth.
- The skills name handbook files by their paths (`docs/handbook/quality-bar.md`). A project that installs the skills copies this folder and `AGENTS.md` beside them, as README.md's "Import this into another project" section describes.

## Changing the handbook

- A new ruling from Kevin goes into the decisions log as a dated row that names what it replaced, and the skill, lint or gate that holds it changes in the same commit.
- A document keeps the writing rules of `gt-voice`: plain declarative sentences, no em dashes, no metaphors, and no contrast pairs.
- The repository is public. No document carries keys, account ids, email addresses, personal details, customer names that generaltranslation.com does not show, unannounced plans or business figures (operating principle 18).
- On the site, a new document needs its page in the folder group of `content/docs/(guide)/handbook/` it belongs to (`(process)`, `(reference)` or `(canon)`), which includes the file with `<include cwd>docs/handbook/<file>.md</include>`, its row in that folder's `meta.json`, its entry in `src/app/handbook/registry.ts` in the same order, its card on the section's index page and its headings in `HANDBOOK_HEADINGS` (`src/lib/search-index.ts`). A page that sets live figures between sections includes the file one heading at a time, and the build fails when such a page leaves a heading of the file out. The `prototemplate` skill (section 6) lists every step, and `pnpm lint:registries` reports what a change missed.

## Sources

- The first six documents were written on 2026-10-05 from Kevin's messages to Claude Code and Codex between 2026-07-20 and 2026-10-05, about 5,800 in all, and from the curated skills. The four Process documents on agents on one machine, agent workflows, pull requests and review were added on 2026-10-21 from the skills and the incident records behind them. Each document's Sources section lists its own evidence.
- Kevin, 2026-10-05: "this prototemplate is supposed to be my hub for general translation work, but also i should be able to use it anywhere and build on top of it so it also acts as a wiki / repository of how i do work at GT".
