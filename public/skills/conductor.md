# Conductor

Use this skill when helping a user configure, operate, or troubleshoot Conductor.

Conductor is a macOS app for running multiple coding agents in parallel. Each workspace is a separate git worktree and branch tied to a repository. Conductor is the workspace, review, and orchestration layer around agent harnesses; model usage is billed through the user's provider accounts, not by Conductor.

Do not claim Windows or Linux support. Conductor is a Mac app.

## When to use

Use this skill for:

- Creating or explaining Conductor workspaces, branches, git worktrees, and `.context`.
- Recommending project setup for a repository.
- Writing or reviewing `.conductor/settings.toml` and `.conductor/settings.local.toml`.
- Migrating or troubleshooting legacy `conductor.json`.
- Configuring setup, run, and archive scripts.
- Configuring Files to copy, `.worktreeinclude`, and workspace-local environment files.
- Explaining app settings, repository settings, managed settings, model providers, and privacy controls.
- Guiding users through agent modes, plan mode, fast mode, reasoning controls, Codex personality, Codex goals, checkpoints, MCP, slash commands, todos, and instruction files.
- Helping users review, test, open PRs, interpret checks, and merge work.
- Troubleshooting shell behavior, script failures, nested workspaces, privacy behavior, permissions, provider auth, and missing MCP tools.

## Core model

- Conductor runs agents locally on the user's Mac unless the documented cloud workspace path is explicitly involved.
- Each repository has a main root directory and can have many workspaces.
- Each workspace is a separate git worktree on its own branch.
- New workspaces are created from the repository's configured base branch, such as `origin/main`.
- Conductor fetches from `origin` before creating a workspace so the workspace starts from the latest remote commit even when the local root checkout is behind. This fetch does not move the branch checked out in the root directory.
- Each workspace has its own branch, files, terminal, diff, checks, pull request path, and review state.
- Workspaces include a gitignored `.context` directory for shared agent context.
- Agents run with the user's local permissions unless stricter controls are configured.
- Conductor supports Claude Code, Codex, Cursor, and OpenCode sessions in isolated workspaces.
- Claude Code, Codex, and OpenCode are bundled with Conductor. Cursor sessions use Cursor Agent through the Cursor API.

Relevant docs:

- https://www.conductor.build/docs/concepts/workspaces-and-branches
- https://www.conductor.build/docs/concepts/workflow
- https://www.conductor.build/docs/concepts/parallel-agents
- https://www.conductor.build/docs/reference/harnesses

## Choose the right settings file

Use this decision tree before recommending a file:

1. If the setting should apply only on this user's machine for one repository, write `<repo>/.conductor/settings.local.toml`.
2. If the setting should apply to everyone working in the repository, write `<repo>/.conductor/settings.toml`, commit it, and make clear that Conductor reflects the change only after it is merged to the default branch on the remote, such as `origin/main`.
3. If the setting should apply to this user across all repositories, write `~/.conductor/settings.toml`.
4. If an organization controls the setting, write `~/.conductor/settings.managed.toml`.
5. If the repository still has `conductor.json`, treat it as legacy. Migrate supported settings into `<repo>/.conductor/settings.toml` unless the user explicitly asks to keep the legacy file.

Precedence:

1. Managed settings.
2. Repository local settings.
3. Repository shared settings.
4. User shared settings.
5. Built-in defaults.

Within one layer, Conductor reads legacy JSON settings first and TOML settings second. TOML wins when both exist. Conductor writes new settings as TOML.

Schema URLs:

- User settings: `https://conductor.build/schemas/settings.schema.json`
- Repository settings: `https://conductor.build/schemas/settings.repo.schema.json`
- Managed settings: `https://conductor.build/schemas/settings.toml.json`

Docs:

- https://www.conductor.build/docs/reference/settings
- https://www.conductor.build/docs/reference/scripts/share-with-teammates
- https://www.conductor.build/docs/reference/conductor-json

## Harnesses and auth

Use the harness docs when helping with provider setup. Do not invent unsupported providers, model IDs, executable paths, or billing behavior.

| Harness | Setup facts |
| --- | --- |
| Claude Code | Can use bundled or configured system Claude Code. Auth can come from Claude Pro/Max, Anthropic API billing, or supported third-party/cloud providers via environment variables. Check status in `Settings` -> `Harnesses` or Claude Code `/status`. |
| Codex | Can use bundled or configured system Codex. Auth can come from `codex login`, subscription setup, or API-key access. Visible models depend on the user's account and model availability. |
| Cursor | Runs through Cursor API with Composer. Requires a Cursor API key in `Settings` -> `Harnesses` -> `Cursor` or `CURSOR_API_KEY` in Conductor environment settings. There is no Cursor executable path to configure. |
| OpenCode | Conductor includes a managed OpenCode executable. Provider keys can be configured in Conductor or through OpenCode's provider setup. Common providers include OpenRouter, Baseten, Cerebras, and Vercel AI Gateway. |

Manual account work the agent cannot do for the user:

- Add provider API keys or subscriptions.
- Confirm paid account limits.
- Sign into Google Meet or grant screen-sharing permissions.
- Choose billing path when both subscription and API-key billing are possible.

Docs:

- https://www.conductor.build/docs/guides/providers
- https://www.conductor.build/docs/reference/harnesses/claude-code
- https://www.conductor.build/docs/reference/harnesses/codex
- https://www.conductor.build/docs/reference/harnesses/cursor
- https://www.conductor.build/docs/reference/harnesses/opencode

## Repository settings

Shared repository settings file:

```toml
"$schema" = "https://conductor.build/schemas/settings.repo.schema.json"

[scripts]
setup = "pnpm install"
run_mode = "concurrent"

[scripts.run.dev]
command = "pnpm dev --port $CONDUCTOR_PORT"
default = true
icon = "play"
```

Common repository settings:

- `scripts.setup`: command to run when Conductor creates a workspace.
- `scripts.archive`: command to run before Conductor archives a workspace.
- `scripts.run_mode`: `concurrent` or `nonconcurrent`.
- `scripts.run.<id>.command`: named run script command shown in the Run button menu.
- `scripts.run.<id>.default`: selects the default run script when multiple scripts exist.
- `scripts.run.<id>.icon`: Lucide icon name for the script, such as `play`, `rocket`, `globe`, or `flame`.
- `scripts.run.<id>.available_in`: `local`, `cloud`, or both.
- `enterprise_data_privacy`: enables Enterprise data privacy for the repository.
- `spotlight_testing`: uses Spotlight testing for projects that must run from the repository root.
- `file_include_globs`: Files to copy patterns when `.worktreeinclude` is not present.
- `environment_variables`: environment variables passed to agents in this repository.
- `prompts.code_review`, `prompts.create_pr`, `prompts.fix_errors`, `prompts.resolve_merge_conflicts`, `prompts.rename_branch`, `prompts.general`: repository action prompts.
- `claude_code_executable_path`, `codex_executable_path`, `claude_provider`, `codex_provider`, `bedrock_region`, `vertex_project_id`, `ssh_key_path`: provider and cloud workspace configuration.
- `git.delete_branch_on_archive`, `git.archive_on_merge`, `git.worktree_push_auto_setup_remote`, `git.branch_prefix_type`, `git.branch_prefix`: git behavior.

Settings that are not repository-configurable include model defaults, model reasoning defaults, tool approvals, and the default workspace location. Keep those in user settings.

## Project setup recommendations

Before proposing Conductor config, inspect how the project actually runs locally:

- README files, docs, onboarding guides, package manager manifests, lockfiles, Procfiles, Docker Compose files, Makefiles, justfiles, taskfiles, scripts, env examples, existing `.conductor/settings.toml`, `.conductor/settings.local.toml`, legacy `conductor.json`, and `.worktreeinclude`.
- Setup commands, dependency managers, generated files, required environment files, local services, databases, caches, fixed ports, and normal dev loop commands.
- Whether commands can run from an arbitrary git worktree workspace or assume the original repository root.
- Whether local servers can use `CONDUCTOR_PORT` and nearby allocated ports.
- Whether multiple workspaces can run safely at the same time.
- Whether static gitignored files should be copied with Files to copy or generated by a setup script.

Recommend:

- Use `.worktreeinclude` or `file_include_globs` for static gitignored files such as `.env` files, local config, certificates, or tool state that should be copied into every workspace.
- Use `scripts.setup` for commands that install dependencies, generate files, create symlinks, initialize per-workspace resources, or otherwise prepare a newly created workspace.
- Use named run scripts under `scripts.run` for development servers, apps, workers, watchers, test commands, or other commands users should be able to run from Conductor.
- Use `CONDUCTOR_PORT` for local servers whenever the project supports configurable ports. Use `CONDUCTOR_PORT+1` through `CONDUCTOR_PORT+9` for companion services when needed.
- Use `scripts.run_mode = "concurrent"` only when multiple workspaces can safely run at the same time with separate ports and no conflicting shared local resource.
- Use `scripts.run_mode = "nonconcurrent"` when the project depends on one fixed port, one local database, one Docker stack, or another shared resource that cannot be made workspace-specific.
- Recommend Spotlight testing when the project must run from the repository root, relies on expensive root-local build artifacts, or should use one heavy local stack while agents work in separate workspaces.
- Put required shell or toolchain setup directly in setup and run scripts when possible so scripts do not depend on interactive shell startup behavior.

Deliver:

- Short summary of the project's local development workflow.
- Exact proposed `.conductor/settings.toml`, `.worktreeinclude`, setup scripts, run scripts, and repository settings to add or modify.
- Explanation of why each script, file, setting, and mode is needed.
- Validation steps the user can run to confirm workspace setup and run behavior.
- Known limitations, risks, manual steps, or cases where multiple workspaces cannot run simultaneously.

## Script facts

- Setup, run, and archive scripts run from the workspace directory.
- Conductor uses non-interactive shells for scripts.
- Although Conductor captures the login shell environment, most commands including setup and run scripts use `zsh`.
- Use Files to copy or `.worktreeinclude` before writing setup scripts only to copy static gitignored files.
- Use `CONDUCTOR_ROOT_PATH` when a workspace script needs a file from the repository root.
- Use `CONDUCTOR_PORT` when multiple workspaces need separate local server ports.
- Conductor allocates ten ports to each workspace: `CONDUCTOR_PORT` through `CONDUCTOR_PORT+9`.
- Use `CONDUCTOR_IS_LOCAL` to branch local-only setup from cloud workspace setup.
- New multi-run configurations should use `[scripts.run.<id>]` with `command`.
- Legacy `scripts.run` is still read for a single run script and is migrated to `[scripts.run.<id>]` when Conductor rewrites the settings file.
- Prefer the Settings UI or `.conductor/settings.local.toml` for run scripts unless the user specifically needs a shared, code-reviewed settings change.
- `.conductor/settings.local.toml` run script changes are reflected in this repository's workspaces on the user's Mac only.
- `.conductor/settings.toml` run script changes are reflected only after they are merged to the default branch on the remote.
- Run script `icon` values use Lucide dynamic icon names in lowercase kebab case. Invalid names fall back to `play`.
- When a run script starts multiple processes, keep them in the same process group with a tool such as `concurrently` instead of backgrounding commands with `&`.
- When Conductor stops a process, it sends `SIGHUP`, waits up to `200ms`, then sends `SIGKILL` if the process is still running.
- Use Spotlight testing when a project cannot run cleanly from a workspace directory.

Environment variables:

- `CONDUCTOR_WORKSPACE_NAME`
- `CONDUCTOR_WORKSPACE_PATH`
- `CONDUCTOR_ROOT_PATH`
- `CONDUCTOR_DEFAULT_BRANCH`
- `CONDUCTOR_PORT`
- `CONDUCTOR_IS_LOCAL`

Docs:

- https://www.conductor.build/docs/reference/scripts
- https://www.conductor.build/docs/reference/scripts/setup
- https://www.conductor.build/docs/reference/scripts/run
- https://www.conductor.build/docs/reference/scripts/spotlight-testing
- https://www.conductor.build/docs/reference/shells
- https://www.conductor.build/docs/reference/environment-variables

## Files to copy

Use Files to copy when Conductor only needs to copy static gitignored files into each new workspace.

Resolution order:

1. `.worktreeinclude` at the repository root.
2. `file_include_globs` in repository settings.
3. Default `.env*` pattern.

Use a setup script instead when the workspace needs commands, generated files, dependency installs, symlinks, or workspace-specific resources.

Docs:

- https://www.conductor.build/docs/reference/files-to-copy
- https://www.conductor.build/docs/reference/worktreeinclude

## MCP

Use MCP when every Conductor workspace should give agents the same external tool access: docs search, issue tracking, databases, dashboards, or internal APIs.

Routing:

- Claude Code user MCP: `claude mcp add -s user ...`
- Claude Code project MCP: `.mcp.json` in the repository root.
- Codex user MCP: `codex mcp add ...` or `~/.codex/config.toml`.
- Codex project MCP: `.codex/config.toml` in the repository.
- Cursor Composer user MCP: `~/.cursor/mcp.json` or Cursor settings.
- Cursor Composer project MCP: `.cursor/mcp.json` in the repository.

Keep secrets out of committed MCP files. Use environment variables, user config, secret managers, or Conductor environment settings.

Docs:

- https://www.conductor.build/docs/guides/configure-mcp-servers
- https://www.conductor.build/docs/reference/mcp

## Review and merge

When helping users review and merge agent work, focus on the path from local changes to merged code.

Explain:

- How to inspect changes in the diff viewer.
- How to run or interpret checks.
- How pull request state relates to the workspace branch.
- How review comments, CI status, and deployments affect merge readiness.
- What the user should verify before merging.

When leaving review feedback from inside Conductor, use the Conductor `DiffComment` tool when it is available. These comments appear in the app's Checks panel. Do not post review feedback to GitHub unless the user explicitly asks for GitHub comments.

Recommend a validation step that exercises the riskiest part of the change.

Docs:

- https://www.conductor.build/docs/guides/review-and-merge
- https://www.conductor.build/docs/reference/diff-viewer
- https://www.conductor.build/docs/reference/checks

## Troubleshooting

Start by identifying whether the issue is about repository setup, workspace creation, scripts, shell behavior, permissions, privacy settings, nested workspaces, provider auth, agent behavior, MCP, or review flow.

Common checks:

- Confirm the user is on macOS.
- Confirm the repository root has a git repository and expected remote setup.
- Confirm the failing command works from the workspace directory.
- Confirm setup and run scripts do not depend on interactive shell startup behavior.
- Check whether missing files are gitignored files that should be copied with Files to copy or `.worktreeinclude`.
- Check whether the project requires fixed ports, a single local database, or a shared Docker stack.
- Check whether `scripts.run_mode` should be `nonconcurrent`.
- Check whether the project should use Spotlight testing because it cannot run cleanly from a workspace directory.
- Check whether managed settings in `~/.conductor/settings.managed.toml` override app settings.
- Check whether legacy `conductor.json` is still present and whether `.conductor/settings.toml` already exists.
- Check privacy and permission behavior before assuming an agent or provider issue.
- Check harness-specific auth before assuming Conductor is broken.

Docs:

- https://www.conductor.build/docs/faq
- https://www.conductor.build/docs/troubleshooting/issues
- https://www.conductor.build/docs/reference/shells
