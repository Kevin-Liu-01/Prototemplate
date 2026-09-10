# Agent Process Tracking, Audit, And Cleanup

This skill is intentionally a thin router. The durable behavior lives in scripts.
The skill is the memory hook: it exists so agents remember when to run the
script. Do not turn deterministic cleanup logic into prompt text. Run the
script, inspect the dry run, then act only when ownership is clear.

This wiki keeps `cleanup-terminals-browsers` as the MECE owner for process
hygiene. The complete portable Agent Broom package is vendored under
`references/agent-broom/` at commit
`1bab484c38a3061826cbb93cec591c5d786a48db` for version comparison and
cross-harness installs.

## Script entrypoint

Prefer the repo-root wrapper when it exists:

```bash
scripts/agent-hygiene.sh <command>
```

Fallback to the skill-local script:

```bash
cleanup_skill_dir="${CLAUDE_SKILL_DIR:-${CODEX_SKILL_DIR:-skills/productivity/cleanup-terminals-browsers}}"
[ -d "$cleanup_skill_dir" ] || cleanup_skill_dir=".agents/skills/cleanup-terminals-browsers"
bash "$cleanup_skill_dir/scripts/agent-hygiene.sh" <command>
```

Commands:

```bash
scripts/agent-hygiene.sh list
scripts/agent-hygiene.sh audit
scripts/agent-hygiene.sh add --pid <PID> --kind dev --port <PORT> --purpose "<why>" -- <command>
scripts/agent-hygiene.sh stop
scripts/agent-hygiene.sh stop --kill
scripts/agent-hygiene.sh prune
scripts/agent-hygiene.sh artifacts
scripts/agent-hygiene.sh devclean
scripts/agent-hygiene.sh devclean --deep
scripts/agent-hygiene.sh devclean --optimize
scripts/agent-hygiene.sh devclean --disk
scripts/agent-hygiene.sh doctor
scripts/devclean.sh --deep --optimize --disk
```

`list`, `audit`, `stop`, `artifacts`, `devclean`, and `doctor` are
dry-run/reporting first.
Cleanup requires an explicit cleanup command such as `stop --kill` or
`artifacts --clean`. Dev-machine cleanup requires `devclean --apply`.

## Lifecycle

1. Before starting a localhost/dev server, run `scripts/agent-hygiene.sh audit`.
2. When starting a long-running command, record it immediately with `add`.
3. Before ending the turn, run `audit` again and report what remains running.
4. Stop only recorded or clearly agent-owned process groups that are no longer needed.
5. For broader machine leaks, run `devclean` dry-run first:
   - no flags: safe orphaned dev/MCP/frontend/mobile processes only.
   - `--deep`: heavy daemons such as Gradle, Kotlin LSP, Flutter, FVM, simulators, and Logi agents.
   - `--optimize`: IDE crash reporter settings, Crashpad dumps, and known background agents.
   - `--disk`: global dev caches plus project build artifacts.
6. Keep the one dev server the user is actively using.

Never kill Cursor, VS Code, Codex, the user's shell, or shared MCP servers such as
`playwright-mcp` and `chrome-devtools-mcp`.

## Extension rule

If this needs more cleanup domains, add them to the scripts, not to this prompt.
The script should stay dry-run-first, report sizes/processes before deleting or
killing, and expose a narrow command such as `artifacts`, `docker`, `simulators`,
or `dev-caches`.

The macOS cleanup gist from kibotu is the right shape for broader disk cleanup:
a deterministic script with `--dry-run`, category flags, and a report. Use it as
a reference for new script subcommands, not as more prose inside this skill:
https://gist.github.com/kibotu/5a20336239bb4745e346ac113969d2cb

`ImL1s/devclean` is the reference shape for dev-machine leak cleanup: safe
orphan detection, explicit deep mode, optimize mode, disk mode, and dry-run
preview. This skill's local `devclean.sh` implements those capabilities with
agent-safe defaults: dry-run unless `--apply` is passed, and no generic
Crashpad-handler killing because that catches normal Codex/Cursor/Chrome
helpers on macOS.
https://github.com/ImL1s/devclean

## Related

- `references/agent-broom/` - full Agent Broom repo import and source receipt
- `scripts/agent-hygiene.sh` - single entrypoint
- `scripts/devclean.sh` - devclean-style machine cleanup
- `scripts/process-ledger.sh` - process inventory
- `scripts/audit-processes.sh` - localhost/listener/process audit
- `scripts/clean-artifacts.sh` - build/cache audit and cleanup
- `config/cursor/rules/process-hygiene.mdc` - always-on enforcement rule
- `wiki/concepts/agent-process-hygiene.md` - rationale
