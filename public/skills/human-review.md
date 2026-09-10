# Human Review

Use Human Review as a local, user-authored feedback channel. It complements an
agent-run design audit; it does not replace visual, accessibility, build, or
approval proof.

## Boundary

- Pin the executable to `human-review@0.6.0`. Re-review source, tests, and the
  package lock before changing that version.
- The server binds to loopback and stores pending feedback locally. Never expose
  its URL or token beyond the local machine.
- Markdown and localhost routes are feedback-only. Map every accepted edit back
  to the real Markdown, MDX, TSX, template, or component source; never write a
  rendered HTTP response into the project.
- Plain HTML is directly writable. If direct file mutation was not requested,
  use a disposable copy or worktree and say so before opening it.
- A feedback batch is evidence of what the user wants changed. It is not approval
  to merge, deploy, publish, send, spend, or alter unrelated canonical owners.
- Preserve every user-authored `after` value verbatim. Translate formatting into
  the source syntax without rewriting the wording.

## Review Loop

1. Resolve the exact target and its source owner. Record the starting revision
   or file hash and whether the target is directly writable.
2. Start the existing development server when reviewing a route. Open the exact
   artifact:

   ```sh
   npx -y human-review@0.6.0 path/to/file.md
   npx -y human-review@0.6.0 http://localhost:3000/route
   ```

3. Poll in the foreground for at most ten minutes at a time:

   ```sh
   npx -y human-review@0.6.0 poll path/to/file.md --timeout 600
   ```

   Keep waiting on a returned process/session handle. On `timeout`, report the
   unchanged state and poll again only while the user still wants the review
   open. On `closed`, stop; unsent feedback remains durable.

4. Treat one returned batch as an atomic review unit:
   - apply every page, not just the first;
   - preserve exact edits, deletions, moves, image paths, and formatting;
   - locate comments by quote and anchor, then satisfy the requested outcome;
   - map localhost and rendered-Markdown feedback to source;
   - do not broaden the edit beyond the batch without explaining why.
5. Run the target's normal formatter, focused tests, build, and rendered check.
   If the source changed after the reviewed baseline, reconcile explicitly; do
   not overwrite the newer version.
6. Acknowledge only after the full batch is applied and verified:

   ```sh
   npx -y human-review@0.6.0 poll path/to/file.md --ack --timeout 600
   ```

   Acknowledgement clears exactly the delivered batch. Newer comments and edits
   must survive for the next pass.
7. Repeat until the user ends the review. The final receipt names the target,
   baseline, batches applied, source paths changed, proof, unresolved comments,
   and any separately required approval.

## Failure Rules

- Do not acknowledge an unseen, partially applied, or unverified batch.
- Do not infer approval from a comment, direct copy edit, closed browser, silence,
  or successful visual review.
- Do not use the tool on a remote URL; its URL review is intentionally limited
  to `localhost`, `127.0.0.1`, and `[::1]`.
- Do not trust the reviewed page with the review shell. File/Markdown artifacts
  stay in an opaque sandbox; localhost retains its origin only so the real app
  can run.
- If the target contains private material, keep the state directory and all
  screenshots/receipts private and exclude excerpts from public writeback.

## Provenance

Adapted from `petergyang/human-review@64deff14506cfc18d542d28fb7b7e0ac98c0c459`
(MIT). The pinned repository's 90 tests passed locally on 2026-08-12, including
token/Host protection, path and symlink containment, stale-write refusal,
durable unacknowledged feedback, safe Markdown rendering, source-route
separation, and exact acknowledgement behavior.
