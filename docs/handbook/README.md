# Handbook

This handbook records how Kevin Liu runs his work at General Translation (GT), a localization platform for developers. It is written for the agents and people who work with him: Claude Code and Codex sessions, teammates, and anyone who copies this repository into another project to work the same way. The [skills](../../skills/README.md) hold the procedures for each area of the work. The handbook holds what spans them: the standing principles, the bar for done, the rules for running many sessions at once, the product facts, the vocabulary and the dated rulings.

The handbook is served at /handbook on each of the site's three addresses (www.prototemplate.com, prototemplate.vercel.app and prototemplate.kevinliu.studio), and the files live in `docs/handbook/` of the public repository.

## The documents

| Document | What it holds | Read it |
| --- | --- | --- |
| [Operating principles](operating-principles.md) | The eighteen standing rules behind Kevin's corrections, each with how to apply it, the skill that holds its procedure and the dated directive it comes from | Before the first task of any GT work |
| [Quality bar](quality-bar.md) | The measurable bar for each kind of artifact and for done, each row with the skill that owns it | Before showing Kevin work or shipping it |
| [Multi-session playbook](multi-session-playbook.md) | Lanes, forked sessions, one instruction sent to several sessions, shared checkouts, collisions, Claude and Codex on one main, relay notes and shared resources | When another session works on the same machine or repository |
| [GT product and architecture map](gt-product-map.md) | What GT sells and to whom, how the products fit together, the copy that must be exact, the CLI and agent entry points, and the repositories | Before writing about, designing for or changing a GT product |
| [Glossary](glossary.md) | The terms in Kevin's messages, the skills and the code, each with where it lives | When a word in a request or a skill is unfamiliar |
| [Decisions log](decisions.md) | Kevin's dated rulings, what each replaced, his words and the lint, gate or skill that holds it | Before changing a standard, and when two sources disagree |

## How the handbook relates to the skills

- A skill holds the procedure. The handbook states the rule and names the skill. When the two disagree, the skill is right, and the change that finds the difference corrects the handbook.
- `AGENTS.md` at the repository root is the entry point for an agent. It summarizes the principles, routes each kind of task to its skill, and points here for depth.
- The skills name handbook files by their paths (`docs/handbook/quality-bar.md`). A project that installs the skills copies this folder and `AGENTS.md` beside them, as README.md's "Import this into another project" section describes.

## Changing the handbook

- A new ruling from Kevin goes into the decisions log as a dated row that names what it replaced, and the skill, lint or gate that holds it changes in the same commit.
- A document keeps the writing rules of `gt-voice`: plain declarative sentences, no em dashes, no metaphors, and no contrast pairs.
- The repository is public. No document carries keys, account ids, email addresses, personal details, customer names beyond BRAND.md section 9, unannounced plans or business figures (operating principle 18).
- On the site, a new document needs its entry in `src/app/handbook/registry.ts` and its headings in `HANDBOOK_HEADINGS` (`src/lib/search-index.ts`). The `prototemplate` skill (section 6) lists every step, and `node skills/prototemplate/scripts/check-registries.mjs` reports what a change missed.

## Sources

- The six documents were written on 2026-10-05 from Kevin's messages to Claude Code and Codex between 2026-07-20 and 2026-10-05, about 5,800 in all, and from the curated skills. Each document's Sources section lists its own evidence.
- Kevin, 2026-10-05: "this prototemplate is supposed to be my hub for general translation work, but also i should be able to use it anywhere and build on top of it so it also acts as a wiki / repository of how i do work at GT".
