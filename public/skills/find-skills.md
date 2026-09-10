# Find Skills

[skills.sh](https://skills.sh) is the definitive open registry for agent skills. Before solving a
specialized task from scratch, check if a battle-tested skill already exists.

## When to Use

- User asks "how do I do X" where X is a common domain task
- User says "find a skill for X" or "is there a skill for X"
- User asks "can you do X" where X is a specialized capability
- A task touches a domain you lack deep procedural knowledge in
- You want to extend capabilities with specialized workflows

## Skills CLI

```bash
npx skills find [query]     # Search for skills by keyword
npx skills add <source>     # Install a skill
npx skills add <source> -g -y  # Install globally, skip prompts
npx skills check            # Check for skill updates
npx skills update           # Update all installed skills
```

Browse the registry: https://skills.sh/

## How to Find the Right Skill

### 1. Understand the Need

Identify the domain (React, testing, design, deployment) and the specific task
(writing tests, creating animations, reviewing PRs).

### 2. Check the Leaderboard

Visit [skills.sh](https://skills.sh/) for the ranked leaderboard by total installs. Top
ecosystem sources:

| Source | Focus |
|---|---|
| `vercel-labs/skills` | React, Next.js, web design, find-skills |
| `vercel-labs/agent-skills` | React best practices, composition patterns |
| `anthropics/skills` | Frontend design, document processing |
| `microsoft/github-copilot-for-azure` | Azure services, cloud infrastructure |
| `coreyhaines31/marketingskills` | SEO audit, content strategy, pricing |
| `resciencelab/opc-skills` | SEO/GEO, programmatic SEO |
| `pbakaus/impeccable` | Design polish, critique, copywriting |
| `superagent-ai/skills` | Security, browser automation |

### 3. Search by Keyword

```bash
npx skills find react performance
npx skills find pr review
npx skills find changelog
npx skills find seo
```

### 4. Verify Quality Before Recommending

| Signal | Threshold |
|---|---|
| Weekly installs | Prefer 1K+. Cautious under 100. |
| Source reputation | Official sources (vercel-labs, anthropics, microsoft) preferred |
| GitHub stars | Under 100 stars = treat with skepticism |
| Security audits | Check the Gen Agent Trust Hub badge on skills.sh |

### 5. Present to User

Always show: skill name, what it does, install count, source, install command,
and a link to the skills.sh page for review.

### 6. Install

```bash
npx skills add <owner/repo> --skill <skill-name> -g -y
```

The `-g` flag installs globally (user-level), `-y` skips confirmation prompts.

## Kevin's Installed Skills

Skills live in the shared category source tree: `skills/engineering/<name>/SKILL.md`,
`skills/productivity/<name>/SKILL.md`, `skills/personal/<name>/SKILL.md`, or
`skills/misc/<name>/SKILL.md`. Cursor, Claude Code, Codex, and AgentSkills load
the generated `skills/.runtime/all` symlink index.

When installing new skills, install through the normal tool, then make sure the
committed source lands under the right category and run `npm run skill-registry`.
After install, update the wiki if the skill represents a new capability worth documenting.

## Common Skill Categories

| Category | Example Queries |
|---|---|
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing | testing, jest, playwright, e2e |
| DevOps | deploy, docker, kubernetes, ci-cd |
| Documentation | docs, readme, changelog, api-docs |
| Code Quality | review, lint, refactor, best-practices |
| Design | ui, ux, design-system, accessibility |
| Marketing/SEO | seo, geo, content-strategy, copywriting |
| Productivity | workflow, automation, git |

## When No Skill Exists

1. Acknowledge no existing skill was found
2. Offer to help with the task directly
3. If it's a recurring need, suggest creating a custom skill in the right `skills/<category>/` folder

## Related Skills

- `seo-audit` — technical SEO auditing
- `seo-geo-optimization` — AI search engine optimization
- `content-strategy` — content planning and publishing
- `ultracite` — zero-config linting and formatting

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `claude-find-skills` | [`references/skills/claude-find-skills/SKILL.md`](references/skills/claude-find-skills/SKILL.md) | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill. |
<!-- folded-skills:auto:end -->
