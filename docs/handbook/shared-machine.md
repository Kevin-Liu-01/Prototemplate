# Agents on one machine

Kevin Liu runs many coding agent sessions on one Mac for his General Translation (GT) work: Claude Code sessions, Codex sessions, the subagents they launch, and his own apps beside them. The sessions share the machine's processes, its shell, its memory and its disk. Each trap below stopped other sessions' work at least once between August and October 2026, and each section gives the rule, the incident that set it, the fix and the skill that holds the procedure. The [multi-session playbook](multi-session-playbook.md) holds the rules for lanes, branches and messages between sessions.

## Stopping a process

Stop a process by the process id recorded when it started. macOS ships the BSD `pkill`, which stops reading options at its first pattern, so every argument after the pattern becomes another pattern and matches far more than the command meant.

| Date | Command | What it matched | What it stopped |
| --- | --- | --- | --- |
| 2026-10-01 | `pkill -f "<pattern>" -P 1` | Every command line that contained "1" | About 140 Chrome processes, other sessions' dev servers, a test run and the session's own renders |
| 2026-10-13 | `pkill -f "next build --turbopack" -U $(id -u)` | Every command line that contained "501", the user id, which is part of the path of the agents' shared temp folder | Another session's deploy gate after hours of running, and several background waiters |

Record `$!` for every process you start, check it before you stop it, and stop it with `kill`. A dev server is found by the port it listens on. The `-sTCP:LISTEN` filter matters: without it, the kill also reaches a browser connected to that port.

```sh
pnpm dev --port 3011 > dev.log 2>&1 &
pid=$!                                    # record the id at launch
ps -o pid,ppid,command -p "$pid"          # the command is still yours
lsof -p "$pid" -d cwd                     # and it runs in your folder
kill "$pid"

kill $(lsof -ti tcp:3011 -sTCP:LISTEN)    # a server, by the port it listens on
```

When matching by name cannot be avoided, put every option before the pattern and run `pgrep -fl` with the same arguments first, so the list of matches is read before anything is signalled. Every agent brief carries the rule, because a subagent knows only its brief. The procedure is in [harness-traps.md](../../skills/gt-orchestration/references/harness-traps.md) of `gt-orchestration` (Processes on a shared machine), and the port kill in [gt-local-dev](../../skills/gt-local-dev/SKILL.md) section 2.

## Shell traps in zsh

Claude Code runs its shell commands in the user's shell, which is zsh on a Mac. Nine zsh behaviours differ from bash, and each one either fails silently or stops the rest of a command line.

| Trap | What happens | Fix |
| --- | --- | --- |
| A variable named `path` | zsh ties the `path` array to `PATH`, so `path=apps/x` replaces the search path and every later command reports "command not found" | Name it `p`, `file` or `target` |
| `"$B:apps/landing"` | zsh reads `:a` as the absolute-path modifier and rewrites the string | Brace the name: `"${B}:apps/landing"` |
| `timeout 90 pnpm lint \|\| echo failed` | macOS has no GNU `timeout`, and the `\|\| echo` hides the "command not found" | `perl -e 'alarm 90; exec @ARGV' pnpm lint` |
| `for u in $urls` | An unquoted variable does not split on spaces, so the loop runs once over the whole string | An array, an explicit list, or `${=urls}` |
| Several heredocs on one `&&` chain | zsh feeds the bodies in operator order, and a Python body once became a pushed commit message | Write each message or script to a file first, then `git commit -F <file>` |
| `grep --include=*.tsx` | zsh expands the glob itself and fails with "no matches found" | Quote it: `--include='*.tsx'` |
| A glob with no match | The whole command line aborts with "no matches found", so `grep x a/*.md b/*.md` greps nothing when `b/` has no Markdown | `find ... -print0 \| xargs -0 grep`, or quote the pattern for a tool that globs itself |
| `echo ====` | A word that starts with `=` is a command lookup, so the line fails with "=== not found" and the rest of the chain stops | Quote it: `echo '----'` |
| `$TAIL[m]` in an ffmpeg filter graph | zsh reads `[m]` as an array subscript | `${TAIL}[m]` |

The heredoc trap is the costly one, because its result reaches the remote before anyone reads it. A commit message written to a file with `cat > msg.txt <<'EOF'`, as a command of its own, cannot pick up another heredoc's body. [gt-ship](../../skills/gt-ship/SKILL.md) section 2 holds the commit form, [gt-local-dev](../../skills/gt-local-dev/SKILL.md) section 1 the quoting rules for port loops, and [sound.md](../../skills/gt-films/references/sound.md) of `gt-films` the ffmpeg case.

## Exit-status gates

A command that must stop on a failure chains to the next step with `&&` on the real exit status. A `;` ignores the status, and a pipe replaces it with the status of the last command in the pipe, because zsh runs without `pipefail` unless it is set.

| Date | Command | What happened |
| --- | --- | --- |
| 2026-08-07 | `pnpm build > log; git add -A && git commit && git push` | A broken build reached main: the `;` ignored the build's exit 1 |
| 2026-08-11 | `pnpm build 2>&1 \| tail -2 && git ...` | A failing build was pushed: the pipeline returned `tail`'s exit 0 |
| 2026-10-14 | `headroom can-start ... \| tail -1 && node check.mjs` | A browser started while the memory check said to wait |

Capture output to a file and gate on the command itself. When a report needs the number, capture the exit code on its own line.

```sh
pnpm build > build.log 2>&1 && git push origin HEAD:main || tail -40 build.log
pnpm build > build.log 2>&1; echo "build exit $?"     # the real code, for a report
set -o pipefail                                        # only where a pipe cannot be avoided
```

The rule is held by the [ship loop](../SHIP-LOOP.md) section 7, [gt-lints](../../skills/gt-lints/SKILL.md) section 5 and the [Gates](https://www.prototemplate.com/docs/gates) page of the docs, which runs the build gate this way.

## Memory and disk

Gate each heavy job on its own memory estimate, and check free disk before a large batch. A runaway process on a shared workstation can take the whole machine faster than any alert reports it, and a crash restarts every session at once.

| What was measured | Value |
| --- | --- |
| The workstation | A 128GB Mac that ran out of application memory twice on 2026-10-12 |
| One runaway node process | 457GB |
| All node processes at the crashes | 243 to 273 processes holding 91 to 555GB |
| The agent desktop app | 232GB with about 25 sessions open |
| `git grep -E` over 130 ORed ids without `-I`, 18 threads, in a repository with binary assets | Grew from 42.6 to 166GB in about 55 seconds |
| A local model trial on the GPU | Grew from 0 to 87GB in about 66 seconds |
| A gt-cloud worktree with its install | 4.3GB in `du`; removing one frees about 1.15GB, because pnpm clones files from its store |
| Leftover scratch worktrees on 2026-10-05 | 48 worktrees in 259GB of scratch space, with 27GB of the disk left free |
| The disk on 2026-10-14 | 100% full |

Headroom, Kevin's open-source menu bar app, reads the machine's memory, and its `can-start` command exits 0 when a job of the stated size fits and 1 when it should wait. A literal search runs with `-F` and a pattern file, and `git grep` gets `-I` to skip binaries and a thread count. A torch process gets a watermark ratio, so it fails with an out-of-memory error inside itself before it starves the machine. A scratch worktree is removed as soon as its branch is pushed.

```sh
headroom can-start --gb 6 --label build && pnpm build    # 0 starts the job, 1 holds it
df -h /System/Volumes/Data                               # free disk, before a large batch
rg -F -l -f patterns.txt                                 # many literal ids at once
git grep -I -F -f patterns.txt --threads 4
PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.35 python trial.py    # caps the GPU allocator for this process
xargs -P 6 -n 1 git worktree remove --force --force < pushed-worktrees.txt
```

A worktree goes on the removal list only after `git -C <wt> status --short` prints nothing and `git -C <wt> branch -r --contains HEAD` names a remote branch. One removal job hit the two-hour background limit after removing 35 worktrees one at a time, and the parallel form above removed the rest in 12 minutes. A crash ends in a reboot, and a reboot empties the system temp folder that holds the sessions' scratchpads (helper scripts, ship records, scratch worktrees) and stops every process. The checkouts, files under `~/.config` and the agents' run journals survive, so a spec or a helper that must outlive the day goes into a repository or a durable folder. [gt-ship](../../skills/gt-ship/SKILL.md) section 1 holds the worktree checks, and [harness-traps.md](../../skills/gt-orchestration/references/harness-traps.md) of `gt-orchestration` holds what survives a reboot.

## Long commands

An agent's background shell task is stopped at its timeout, which is at most two hours in Claude Code. A job that may run or wait past about 90 minutes starts detached from the session, writes its own process id, and is watched by a poll that ends on a milestone or on the job's exit.

```sh
(nohup sh -c 'echo $$ > job.pid; exec ./long-job.sh' >> job.log 2>&1 < /dev/null &)   # parent PID reads 1
pid=$(cat job.pid)
until grep -q 'DONE' job.log || ! kill -0 "$pid" 2>/dev/null; do sleep 20; done      # run as a background task, re-armed every two hours
```

On 2026-10-08 lane agents hung for two to five hours on shell calls that never started, which fits a confirmation prompt that a subagent cannot answer. Lane prompts now hold these rules:

- No `rm` of any kind in a lane's shell call. Deletions go to the lead or to a helper that refuses paths outside the scratchpad, and a symlink is replaced with `ln -sfn`.
- File edits and deletions go in separate calls.
- A git network call (`push`, `fetch`, `ls-remote`) runs alone under an alarm: `perl -e 'alarm 90; exec @ARGV' git push origin HEAD`.
- Every background worker is redirected (`> worker.log 2>&1 &`), and every long wait runs in the background and is polled.
- A long runner is resumable: it skips the passes it finished and reruns only its failures.

[harness-traps.md](../../skills/gt-orchestration/references/harness-traps.md) of `gt-orchestration` holds these rules under Long commands and Bash calls inside lanes.

## One checkout and several sessions

In a checkout that several sessions share, stage and commit only explicit paths. The index, the working tree and the branch are shared, so any command that takes "everything" takes the other sessions' work too. The [multi-session playbook](multi-session-playbook.md) sections 4 and 5 hold the rules, and these are the incidents behind them.

| Date | What happened | The rule it set |
| --- | --- | --- |
| 2026-08-07 | A bare `git commit` after `git add <file>` published another session's staged deletions inside a landing commit | Commit with a pathspec |
| 2026-08-07 | A desktop git client's revert, run mid-round, left conflict markers in four CSS files | Sweep for markers before every push or copy |
| 2026-08-07 | A co-editing session that commits with `git add -A` folded another session's uncommitted files into its own commit, and "nothing to commit" meant they were already in | Verify by content, and commit your own files promptly |
| 2026-08-26 | A copy into the tree with `rsync --delete`, run without a fetch, erased a 20-commit campaign another session had pushed | Fetch and read `HEAD..origin/main` before any copy or push |
| 2026-10-01 | `git add -A` swept 229 files (92MB) of another lane's folder onto main | Stage explicit paths |

```sh
git status --short                                   # read paths you did not touch
git add src/app/page.tsx docs/handbook/review.md
git commit -F msg.txt -- src/app/page.tsx docs/handbook/review.md
git grep -n '^<<<<<<< ' -- src docs deck skills scripts   # any hit stops the push
```

Rerun a failure once before diagnosing it when another session may be mid-save: a 500 from hot reload or a type error in a file another session is editing often clears on the second run. [gt-ship](../../skills/gt-ship/SKILL.md) section 2 holds the staging rules, and the [ship loop](../SHIP-LOOP.md) sections 0 and 7 hold the landing order.

## Sources

- Prototemplate, read on 2026-10-21: `skills/gt-orchestration/SKILL.md` sections 2, 6 and 9, `skills/gt-orchestration/references/harness-traps.md`; `skills/gt-ship/SKILL.md` sections 1 and 2; `skills/gt-local-dev/SKILL.md` sections 1 and 2; `skills/gt-lints/SKILL.md` section 5; `skills/gt-films/references/sound.md`; `docs/SHIP-LOOP.md` sections 0 and 7; `docs/handbook/multi-session-playbook.md`.
- Kevin's private agent notes on the machine's memory crashes, the pattern kills, the zsh traps, worktree disk use, the reboot of 2026-10-07 and the shared-checkout sweeps, dated 2026-08-07 to 2026-10-18, for the measurements the skills do not carry.
