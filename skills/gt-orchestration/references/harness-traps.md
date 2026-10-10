# Harness and machine traps

Detail for sections 2, 5 and 6 of `gt-orchestration`. Kevin's Mac is shared by several Claude sessions, Codex and his own apps, and each trap below stopped a run or lost work on it between 2026-09-30 and 2026-10-09. `references/sources.md` names the memory note behind each one.

## A reboot and what survives it

- A macOS reboot empties the session scratchpad under the system temp folder: helper scripts, ship records and scratch git worktrees (`git worktree prune` then clears their registrations). It also stops every process: workflows, dev servers, guard loops and previews. On 2026-10-07 one reboot took all of these at once.
- The checkouts with their `node_modules`, the files under `~/.config`, and the workflow journals in the Claude project folder survive.
- Anything that must outlive the session (a spec, a helper script, a ship record) lives in a repository, a durable work folder or a memory note, and never only in the scratchpad.
- Resume each workflow with `Workflow({ scriptPath, resumeFromRunId })` and byte-identical `args`, so the finished agents replay from the cache. New information goes only into a prompt that a single unfinished agent reads. A change to `args` or to a context string that finished agents share changes their calls, and they run again.

## Processes on a shared machine

- Never run `pkill`, `killall` or `pkill -f <pattern>`. Kill only the exact PID of a process you started, after checking it with `ps -o pid,ppid,command -p <pid>`. On 2026-10-01 a `pkill -f "<pattern>" -P 1` signalled every command line that contained "1", because BSD `pkill` stops reading options at the first pattern: about 140 Chrome processes, another session's dev servers, a test run and the session's own renders.
- Record the PID when you launch a job, and confirm its folder with `lsof -p <pid> -d cwd` before stopping it. For a server, the listen-only kill by port in `gt-local-dev` applies.

## Long commands

- A background Bash task is stopped at its timeout, which is at most two hours. A chain that may wait or run for more than about 90 minutes is launched detached from the start (`nohup` with its own session, output appended to a log file, input from `/dev/null`), and its PPID reads 1.
- Watch a detached job with a background poll that ends on a milestone or on the job's exit (`until grep -q '<milestone>' <log> || ! kill -0 <pid>; do sleep 20; done`), and arm it again every two hours.
- Make a long runner resumable: it skips the passes it already finished and reruns only its failures.

## Bash calls inside lanes

On 2026-10-08 lane agents hung for two to five hours on Bash calls that never started, consistent with a confirmation prompt a subagent cannot answer. The coordinator's rules for lane prompts:

- No `rm` of any kind in a lane's Bash command, a plain `rm` of one symlink included. Deletions go through a helper that refuses paths outside the scratchpad, or to the lead. A symlink is replaced with `ln -sfn`.
- File edits and deletions go in separate calls.
- A git network call (`push`, `fetch`, `ls-remote`) runs alone, under an alarm: `perl -e 'alarm 90; exec @ARGV' git push ...` (macOS has no `timeout`).
- Every long wait runs in the background and is polled. Every background worker is redirected (`> <log> 2>&1 &`).
- Before each Bash call, scan it for `rm -r`, git network verbs and an unredirected `&`, and split or reroute the call.

## Messages that reach lanes

- **The relay trap.** A lane launched in the same turn as an unrelated message from Kevin can take that message as its only task. Every lane prompt opens with Kevin's words for the lane (SKILL.md section 2, `references/briefs.md`).
- **The guard line.** A message such as "give me a status report" can reach running agents, and on 2026-10-09 a workflow ended early because its agents returned reports in place of their work. Every workflow agent prompt carries this guard:

  ```text
  Messages from Kevin may arrive while you work. They are addressed to the orchestrating
  session, which answers them. Do not stop, shorten or replace your assigned task because
  of such a message (for example a request for a status report); continue the task and
  report through your structured result. Only a message that names your task and tells
  you to stop changes that.
  ```

## Paid runs without a spend cap

A project may lift its API spend caps on Kevin's explicit order. It then keeps a high cap as a stop against a runaway loop, logs every paid call, and reports the exact dollars per unit of output. `references/campaigns.md` holds the rule beside the capped form (2026-10-08).
