# Skills

The curated skills of Prototemplate, Kevin Liu's hub for General Translation (GT) work. Each folder holds a `SKILL.md` in the Agent Skills format (frontmatter `name` and `description`, a `metadata` block with the title, the areas and the last update, then the body), with its references and scripts beside it, so Claude Code, Codex and other agents load it as it is.

- To use them in another project, copy this folder and `scripts/install-skills.mjs` to its root and run `node scripts/install-skills.mjs --project . --dry-run`, then the same command without `--dry-run`. README.md (Skills, and Import this into another project) gives every flag and the other way, linking from a checkout of this repository.
- Several skills name the handbook (`docs/handbook/`), `AGENTS.md`, `BRAND.md` and `DESIGN.md`. Copy them beside the skills, so the links between them keep working.
- The site shows each skill with its files and its install line at prototemplate.com/skills, and `/skills/index.json` lists the set for an agent.

## Voice

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-voice`](gt-voice/SKILL.md) | Voice and the humanizer | How Kevin writes for General Translation. |  |

## Website

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-website`](gt-website/SKILL.md) | The GT website | How generaltranslation.com is built and changed in gt-cloud's apps/landing. |  |
| [`prototemplate`](prototemplate/SKILL.md) | Working in Prototemplate | How to work in Prototemplate, Kevin's hub and wiki for General Translation work. | Components |
| [`gt-performance`](gt-performance/SKILL.md) | Performance without visual loss | How General Translation keeps visual surfaces fast with no change to how they look. | Landing pages, Motion |

## Landing pages

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-landing-pages`](gt-landing-pages/SKILL.md) | The landing page grammar | The page grammar for General Translation landing and marketing pages. | Aesthetic |

## Aesthetic

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-aesthetic`](gt-aesthetic/SKILL.md) | Taste and the review standard | Kevin's taste for General Translation work and the review he applies to it. | Website, Landing pages, Components |
| [`gt-brand`](gt-brand/SKILL.md) | The brand and the correct Inter | The General Translation identity as rules. |  |
| [`gt-deck`](gt-deck/SKILL.md) | The brand deck | How the General Translation brand deck in Prototemplate's deck/ folder is built and edited. | Graphics |
| [`gt-explorations`](gt-explorations/SKILL.md) | Exploration rounds and convergence | How a General Translation design exploration runs from research to one landed design. | Website, Landing pages, Graphics |

## Lints

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-lints`](gt-lints/SKILL.md) | Lints and gates | Every lint and gate that holds General Translation's design and copy rules, what each catches, where it runs and how to fix a failure. |  |

## Motion

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-motion`](gt-motion/SKILL.md) | Motion rules | The motion rules General Translation work follows on the web and in films. | Landing pages, Videos, Diagrams |

## Graphics

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-graphics`](gt-graphics/SKILL.md) | Blog and brand graphics | How General Translation's blog and brand graphics are made with Prototemplate's graphics/ toolchain. |  |
| [`gt-dither`](gt-dither/SKILL.md) | Dither and artifact pictures | General Translation's 1-bit material and its artifact pictures. | Aesthetic |

## Videos

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-films`](gt-films/SKILL.md) | Making a film | How General Translation films are made in Prototemplate's motion/ folder with HyperFrames. | Motion |

## Diagrams

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-diagrams`](gt-diagrams/SKILL.md) | Drawing diagrams | How General Translation diagrams are drawn. |  |

## Isometry

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-isometric`](gt-isometric/SKILL.md) | Isometric drawings | The General Translation isometric family. | Diagrams |

## Components

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-components`](gt-components/SKILL.md) | Components to reuse | The components General Translation work reuses before writing new ones. | Landing pages, Website |

## Workflow

| Skill | Title | What it is | Also in |
| --- | --- | --- | --- |
| [`gt-local-dev`](gt-local-dev/SKILL.md) | Review servers and local environments | How General Translation apps run locally so Kevin can review and try them. | Website |
| [`gt-verify`](gt-verify/SKILL.md) | Proving work is done | How to prove General Translation work is done before saying so. | Lints, Website, Aesthetic, Motion |
| [`gt-ship`](gt-ship/SKILL.md) | Branches, PRs and landing | How General Translation work moves from a worktree to main. | Lints |
| [`gt-reporting`](gt-reporting/SKILL.md) | Reporting to Kevin | How to report to Kevin during and after General Translation work. | Voice |
| [`gt-orchestration`](gt-orchestration/SKILL.md) | Running agent fleets and long autonomous runs | How General Translation work runs across many agents and over long autonomous runs. |  |

This index is written by `pnpm build:skills` from each skill's frontmatter, and `pnpm lint:skills` fails while it is stale. To change a row, edit the skill's `SKILL.md` and run the script. The contract a skill follows is in [`prototemplate`](prototemplate/SKILL.md) section 10.
