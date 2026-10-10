# The skills: contract, install and other homes

Detail for section 10 of `prototemplate`, moved from SKILL.md on 2026-10-10, with the contract of 2026-10-10 (owner, body budget, sources file, supporting file types, script headers and tests). Paths are relative to `$PROTOTEMPLATE`.

The curated GT skills live in `skills/<slug>/`. Each folder holds `SKILL.md`, and may hold `references/*.md` for detail loaded on demand (with `references/sources.md` for provenance) and `scripts/` for the tools its procedure runs. Kevin, 2026-10-05: "we only need to show and store the ones weve actually been using and updating ... dont just smash a bunch of thigns in there". The set was chosen from evidence: Skill calls, SKILL.md reads and edits from July to October 2026, and Kevin's prompts by area.

The set is the 22 folders under `skills/`: gt-voice, gt-website, prototemplate, gt-performance, gt-landing-pages, gt-aesthetic, gt-brand, gt-deck, gt-explorations, gt-lints, gt-motion, gt-graphics, gt-dither, gt-films, gt-diagrams, gt-isometric, gt-components, and in workflow gt-local-dev, gt-verify, gt-ship, gt-reporting and gt-orchestration. Sixteen were chosen from that evidence on 2026-10-05; the six workflow and process skills came from mining Kevin's messages from July to October the same day. `skills/README.md`, written by `pnpm build:skills`, lists them by area.

## The frontmatter

The frontmatter uses Agent Skills fields only, so Claude Code, Codex and other loaders accept it.

```yaml
---
name: gt-voice
description: >-
  <what it covers, then 'Use when ...'; at most 1024 characters, about 600>
metadata:
  title: Voice and the humanizer
  areas: voice
  updated: 2026-10-05
  origin: prototemplate
  owner: P
---
```

- The slug, the folder and `name` are one string of lowercase letters, digits and hyphens, and it is never `index`.
- `metadata` values are strings. `areas` is a comma-separated list from the fixed set voice, website, landing, aesthetic, lints, motion, graphics, videos, diagrams, isometry, components, workflow: Kevin's eleven areas in his order, then workflow for how the work moves (servers, proof, landing, reports, lanes). The first entry places the skill on /skills. `origin: prototemplate` marks the folders the installer owns. `owner` names the session lane that keeps the skill current and reviews every diff to it: `P` (the Prototemplate session), `V` (the Videos session) or `O` (the onboarding and dashboard session). A lane that edits a skill it does not own sends the diff to the owner before merge.

## The body

- It opens with an h1 equal to `metadata.title` and two or three sentences, then the sections, a Review checklist where the skill governs reviewable output, a Related skills line, and Sources last.
- `## Sources` stays in `SKILL.md`, because the build requires it, as a short section that points to `references/sources.md`. That file holds the dated provenance: every line added to the skill cites its memory note, transcript or inventory row and its date.
- Paths are relative to a named checkout (`$PROTOTEMPLATE`, `$GT_CLOUD`) and never to a home folder. Sources cite repository-qualified paths and Kevin's dated directives.
- The repository is public, so a skill holds no keys or key file contents, no email addresses, no personal details and no company numbers.
- The body of `SKILL.md` stays under 24,000 bytes (and under 500 lines), with the detail in `references/`. Trimming moves a rule into a reference and never deletes it. Every skill is written to gt-voice: no em dashes, no metaphors, no "X, not Y", no signposts.
- Supporting files are `.md`, `.mjs`, `.json`, `.py`, `.sh`, `.txt` or `.js`. The site serves them raw, the last four as `text/plain`, so a browser shows a script and never runs it.
- A script is self-contained (it imports nothing from the repository's `scripts/`), so an installed skill still runs it. Its header gives its purpose, its usage, a `Requires:` line and a `Last real run:` line: the date and session of its last use in real work, or `none (kept for: <trigger>)`. An offline test beside it (`<name>.test.mjs`, `.test.py` or `.test.sh`) builds its own fixtures and runs in `pnpm test:skill-scripts`; a network smoke stays manual, with its command in the header.
- A skill is kept by use. Kevin, 2026-10-05: "we only need to show and store the ones weve actually been using and updating". `pnpm skills:usage` counts loads per skill, and thirty days after distribution a skill with no loads and a script still at `none` are cut unless Kevin keeps them by name.
- The skill page renders the body with the docs parser (`src/app/skills/[slug]/body.ts`). Headings below h3 read as h3. A link into the skill's own folder, or a code span that names one of its files exactly (`references/type.md`), becomes a link to the raw file the site serves at `/skills/<slug>/<file>`; a link to `../<other-skill>/SKILL.md` opens that skill's page; and a code span or link naming a document the site renders (`docs/handbook/quality-bar.md`, `DESIGN.md`) opens that document's route. `README.md` and `AGENTS.md` in a code span stay text, because skills also name other repositories' files by those names.

## Installing

- `skills/<slug>/` is the one copy. `pnpm skills:install` (`scripts/skills/install.mjs`) links or copies it into a project's `.claude/skills` and `.agents/skills` (`--project <dir>`, codex on request), the home directory's (`--user`) or one named folder (`--into <dir>`), with `--dry-run` first. Its header comment is the authority for its flags, and README.md's Skills section gives the commands. Never run it against Kevin's home folder without asking him; on his machine `~/.claude/skills` and `~/.agents/skills` link into the wiki's runtime list, and `--user` refuses there for that reason.
- This repository's `.claude/skills` and `.agents/skills` hold relative links to `../../skills/<slug>`, made by `pnpm skills:install --project .`; rerun it after adding a skill.
- gt-cloud sessions get the set through `pnpm skills:install --project <gt-cloud checkout>`. gt-cloud tracks `.claude/skills`, so each new link gets a line in that checkout's `.git/info/exclude` and is never force-added. A gt-cloud worktree has its own `.claude/`, so it needs its own links. The six folders `.agents/skills` held from 2026-09-18 were folded into the set on 2026-10-05: blog-graphics-pipeline, docs-source-capture, glyphfield-headless-export, stop-motion-ui-capture and gt-docs-visual-tokens into `gt-graphics` and its references, and gt-blog-mdx-components into the blog section of `gt-website`.
- The `skills` CLI (`npx skills add <owner>/<repo> --skill <slug>`) reads a root `skills/` folder, which would install one skill without a checkout. It is untested on this repository, so try it before the README documents it.

## The other skill homes

- Kevin's wiki is the source of his general skills: the humanizer, kevin-voice, create-graphics, design-engineering-polish, agent-browser and the hyperframes skills. It lives at github.com/Kevin-Liu-01/Kevin-Wiki and is projected into `~/.claude/skills` and `~/.agents/skills`. Prototemplate work never edits it. A GT skill names the wiki skills it depends on in its Related skills line.
- gt-cloud's `.agents/skills` stay authoritative for gt-cloud's code maps. On origin/main they include gt-landing, gt-ui, gt-dashboard, glyphfield and code-comments, and artifact-pictures is on the branch `k/artifact-picture-standard`. A GT skill points to them and copies none of their file maps.
- No slug in the set exists in `~/.claude/skills`, `~/.agents/skills` or gt-cloud's `.agents/skills`, so an install never shadows a wiki or gt-cloud skill. A new slug is checked against all three homes first.

## Using the hub from another project

`AGENTS.md` and README.md's "Import this into another project" section give the steps.

- Copy `skills/`, `scripts/skills/install.mjs`, `AGENTS.md`, `BRAND.md`, `DESIGN.md` and `docs/handbook/` into the project at the same paths, then run the copied installer there with `--project .` (dry run first). Every relative link between the skills, the canon and the handbook keeps working. On Kevin's machine a project can instead link to this checkout (`--project <dir>` from here).
- Link the canon by its address on the site (www.prototemplate.com/docs/design, /docs/brand, /skills/<slug>), so a reader in another repository reads the current version.
- `pnpm check:pages --base <url> --pages-module <file>`, run in `$PROTOTEMPLATE`, checks another site. The module exports `pages()` in the shape of `scripts/check/pagecheck/pages.mjs`, and `--hooks-module` adds that site's invariants (`scripts/check/pagecheck/README.md`). Both paths resolve against the Prototemplate checkout, so pass absolute paths.
- `node scripts/lint/lines.mjs <url> --theme dark` audits the lines of any page at 1440 and 1280 (with no URL it audits `http://localhost:3005/d/toolchain`). Section 7 gives its Chrome path.
- `LICENSE` reserves all rights to General Translation, Inc. The repository is public to read, and reuse of its code, writing or designs outside a GitHub fork needs written permission. Third-party fonts, icons and adapted skills keep their own licenses.
