# Graphify Sidecar

Use Graphify as a sandboxed repo-map sidecar. It is allowed to build and query a graph. It is not allowed to install hooks or rewrite agent config.

## Boundary

Read `references/qmd-boundary.md` before using this skill.

Short version:

- Use `qmd` first for Kevin/wiki knowledge, compiled decisions, people, tools, concepts, and markdown brain queries.
- Use Graphify for codebase topology: "what touches what?", "what path connects A to B?", "what is affected if this changes?", PR risk, architecture review, and repo onboarding.
- Do not replace qmd with Graphify for the wiki. Graphify is an additional structural map, not the source of truth.

## Hard Safety Rules

- Do not run `graphify install`, `graphify hook install`, `graphify codex install`, `graphify cursor install`, or any Graphify installer path.
- Do not let Graphify write `graphify-out/` into a target repo unless Kevin explicitly asks for a project-local artifact.
- Use `npm run graphify:sidecar -- ...`; the wrapper writes under `outputs/graphify/` and disables Graphify query logging.
- Do not commit generated Graphify artifacts by default. Promote durable lessons into wiki pages or skills only after they have user value.
- For private docs, personal notes, transcripts, or the wiki corpus itself, prefer qmd unless Kevin explicitly asks for a Graphify graph and understands the extraction scope.

## Project Integration

Every enrolled Kevin project should expose Graphify through the Agent-Docs Mesh, not through Graphify's own installers.

- `agent-docs scaffold` emits a `repo-graph` auto-block in project `AGENTS.md`.
- Build graphs from `~/Documents/GitHub/kevin-wiki` and store them under `outputs/graphify/<repo>/`.
- For another repo, capture its current root before changing directories:

```bash
PROJECT_ROOT="$(pwd)" && cd ~/Documents/GitHub/kevin-wiki && npm run graphify:sidecar -- build "$PROJECT_ROOT" --run outputs/graphify/<repo> --no-viz
```

- Query the same run directory from the wiki checkout:

```bash
cd ~/Documents/GitHub/kevin-wiki && npm run graphify:sidecar -- query "what should I inspect first?" --run outputs/graphify/<repo>
```

If a project lacks the `repo-graph` auto-block, load `agent-docs` and refresh that repo's mesh before broad architecture work.

## Commands

Build the sidecar graph for the current repo:

```bash
npm run graphify:sidecar -- build .
```

Build with lower visualization cost for large repos:

```bash
npm run graphify:sidecar -- build . --no-viz
```

Ask a focused graph question:

```bash
npm run graphify:sidecar -- query "what connects auth to billing?"
```

Explain one node:

```bash
npm run graphify:sidecar -- explain "RateLimiter"
```

Find a path between two concepts or files:

```bash
npm run graphify:sidecar -- path "Auth" "Database"
```

Estimate blast radius:

```bash
npm run graphify:sidecar -- affected "BillingService" --depth 2
```

Save whether an answer helped:

```bash
npm run graphify:sidecar -- save-result --question "what owns billing retries?" --answer-file outputs/graphify-answer.md --outcome useful
```

Reflect saved outcomes into a local lesson file:

```bash
npm run graphify:sidecar -- reflect
```

Use `--run DIR` when the graph was built somewhere non-default:

```bash
npm run graphify:sidecar -- build ../some-repo --run outputs/graphify/some-repo
npm run graphify:sidecar -- query "where is auth initialized?" --run outputs/graphify/some-repo
```

## Workflow

1. Start with the user's question. If it asks about durable wiki knowledge, run qmd instead.
2. If it asks about repo structure, run `npm run graphify:sidecar -- status`.
3. If no graph exists or the repo changed meaningfully, run `build`.
4. Ask the graph with `query`, `path`, `explain`, or `affected`.
5. Read raw files only after the graph gives a focused candidate set.
6. If the graph answer was useful or wrong in a durable way, run `save-result`, then `reflect`.
7. Promote only durable, human-useful lessons into wiki pages, skills, or project docs.

## Output Policy

Graphify output is working memory. Treat these as generated sidecar artifacts:

- `outputs/graphify/<repo>/graphify-out/graph.json`
- `outputs/graphify/<repo>/graphify-out/GRAPH_REPORT.md`
- `outputs/graphify/<repo>/graphify-out/graph.html`
- `outputs/graphify/<repo>/graphify-out/reflections/LESSONS.md`

The final answer should cite the focused nodes/files that mattered, not dump the entire graph.
