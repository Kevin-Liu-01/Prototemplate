# The PR body

Detail for section 4 of `gt-ship`: the body's shape, the screenshots, where
the images live and how to rewrite a body without losing the bot blocks.
Every command runs from a gt-cloud checkout or worktree (`$GT_CLOUD`).

## Shape

Kevin reviews from the PR page and from the running app. On #5007 he asked to
"make this pr page much much easier to read and show the images" (Kevin,
2026-09-28). The body that answered him has this order:

1. **Stack line**, only above the bottom of a stack: `Stacked on #N. Merge
   that first.`
2. **Summary**: two sentences. What the PR delivers and what changes for a
   user or a system. gt-cloud's `pr-desc` skill sets the standard: outcome
   first, no line-by-line narration, file names only when a reviewer should
   look at them.
3. **What to look at**: one `###` heading per surface (sign-in, consent, the
   hero), one or two sentences each, then that surface's before and after
   crops.
4. **Short closing sections**, a few lines each, only the ones that apply:
   the lints added or changed, the parity record for an onboarding or auth
   change (section 7 of the skill), the dependency change behind a lockfile
   diff, and **Checks**: the gates run, with counts ("13 pass"), and what was
   measured by hand.
5. **The bot blocks**, untouched, at the end.

Keep the prose under about 500 words. Write it to `gt-voice`: plain
declarative sentences, no em dashes, no headings that end in a period.
`gt-voice` also holds the casing and footer rules for Kevin's PR text.

A stacked PR body in this shape, with the facts of #4815:

```markdown
Stacked on #5054. Merge that first.

Docs pages paid for a marketing 404 page, 746 kb of fonts and a sidebar
that prefetched every visible row on load. This PR removes those three
costs and changes nothing else.

## What to look at

### The sidebar
...

## Checks
...
```

## Screenshots

- **From the first push.** A `## Screenshots` section (or the crops inside
  What to look at) goes in with the first push and is refreshed after every
  visible change: "add the screenshots of this to the pr the whole time"
  (Kevin, 2026-09-25).
- **Crops.** Full-page captures in a two-column table render as strips
  nobody can read. Crop to the changed elements: their bounding boxes plus
  24 px of padding, 420 to 900 CSS px wide and at most 620 tall. Use the
  same clip for production (or main) and the branch so the pair lines up.
- **Layout.** One bold caption line per pair, then
  `| Before (main) | After (this branch) |` for crops up to 640 px wide.
  Wider crops stack full width, the before above the after.
- **Coverage.** Both themes where the change has a theme. Phone widths
  (390, 360) next to 1440 when the change touches layout.
- **Captions** state what the reader should see, with numbers where they
  help ("464 by 44 controls, the same column as the steps"). Add a one-line
  note under a caption when something in the after shot is out of the PR's
  scope (a control that keeps its Lucide icon in an icon PR).
- **Many states at once** (a review of every sign-in state, a run of
  viewports) go on one contact sheet:
  `python3 $PROTOTEMPLATE/skills/gt-ship/scripts/contact-sheet.py <out.png> 3 480 "label=file.png" ...`.
- **Capture tool.** `playwright-core` driven from a script, at
  `deviceScaleFactor` 2 for anything with 1 px lines. The in-app browser
  pane pauses requestAnimationFrame, so shader and dither canvases come out
  blank there. The capture recipes are in `gt-graphics`
  (references/capture.md).

## Where the images live

The images go on the `pr-assets` branch of gt-cloud, an orphan branch with
no app code, under `screenshots/pr-<n>/`. Nothing is committed to the PR
branch. The body links each file as

```
https://github.com/generaltranslation/gt-cloud/blob/pr-assets/screenshots/pr-<n>/<file>.png?raw=true
```

The repository is private; these `?raw=true` blob links render in the PR body
for any signed-in member.

Older PRs used one `screenshots/pr-<n>` branch per PR. Vercel builds every
pushed branch, and an orphan branch has no `apps/landing`, so each push of
images posts an instant failed landing build ("Root Directory apps/landing
does not exist"). That failure is expected. One shared `pr-assets` branch
keeps it to one branch name.

Add files without touching the worktree's index or checkout.
`scripts/pr-assets.sh` runs these steps and prints the links:

```sh
sh $PROTOTEMPLATE/skills/gt-ship/scripts/pr-assets.sh --repo generaltranslation/gt-cloud --pr 5200 <scratch>/shots/*.png
sh $PROTOTEMPLATE/skills/gt-ship/scripts/pr-assets.sh --repo generaltranslation/gt-cloud --pr 5200 --sub round3 <files>
```

It requires `--repo`, refuses a Prototemplate repository (Vercel builds
every branch pushed there, so an orphan branch fails a build on each push)
and has `--dry-run`. By hand, a private index file holds the new tree:

```sh
N=5200                                   # the PR number
SHOTS=<scratch>/shots                    # the PNGs to upload
git fetch origin pr-assets
parent=$(git rev-parse origin/pr-assets)
export GIT_INDEX_FILE=<scratch>/pr-assets.index
rm -f "$GIT_INDEX_FILE"
git read-tree "$parent"
for f in "$SHOTS"/*.png; do
  blob=$(git hash-object -w "$f")
  git update-index --add --cacheinfo "100644,${blob},screenshots/pr-${N}/$(basename "$f")"
done
tree=$(git write-tree)
commit=$(git commit-tree "$tree" -p "$parent" -m "screenshots: pr-${N} <what changed>")
unset GIT_INDEX_FILE
git push origin "${commit}:refs/heads/pr-assets"
```

In zsh, brace the variable in the refspec: `$commit:refs/...` reads `:r` as
a modifier and pushes the wrong name. A later round of the same PR goes in a
subfolder (`screenshots/pr-<n>/round3/`) or under new file names, so the
images an older body revision links stay valid.

## Rewriting the body

Three bots write into the body itself, each inside its own markers:

- Devin: `<!-- devin-review-badge-begin -->` to `<!-- devin-review-badge-end -->`
- Cursor Bugbot: `<!-- CURSOR_SUMMARY -->` to `<!-- /CURSOR_SUMMARY -->`
- Greptile: `<!-- greptile_comment -->` to `<!-- /greptile_comment -->`
  (holds `Confidence Score: N/5` and `Last reviewed commit`)

Replace only the human part above the first of these bot markers. A body
can carry markers of its own above them (`<!-- screenshots-begin -->` and
`<!-- screenshots-end -->` around a screenshots section, on #5133), and
those belong to the human part:

```sh
gh pr view N --json body --jq .body > <scratch>/body-N.md
# edit the part above the first bot marker, keep the rest byte for byte
gh pr edit N --body-file <scratch>/body-N.md
```

When the section has its own markers, `scripts/patch-body.py` replaces only
the text between them (or puts the marked block above `## Verification` or
the first bot block when the body has none) and writes the body back:

```sh
python3 $PROTOTEMPLATE/skills/gt-ship/scripts/patch-body.py --repo generaltranslation/gt-cloud --pr N --section <scratch>/shots.md --dry-run
```

Drop `--dry-run` to write it. `--name parity` targets
`<!-- parity-begin -->` and `<!-- parity-end -->` instead.

Never pass a body through `--body "<text>"` built in the shell, and never
write it from a heredoc on the same `&&` chain as a commit message: zsh feeds
heredocs in operator order and once put a script into a pushed commit
message (#4689).

An edit made right after a force push can race Bugbot's own rewrite of its
block and bring back the stale summary. Read the body again a minute later;
if the Cursor block names an old commit, comment `bugbot run`.

## Sources

- gt-cloud: .agents/skills/pr-desc/SKILL.md.
- gt-cloud PRs #5021 (crops per surface on pr-assets), #5095 (crops per
  width and locale), #5007 (the rewrite Kevin asked for), #4815 (the
  stacked body above), #5133 (a screenshots section between its own
  markers), read 2026-10-05.
- Claude memory: pr-screenshots-and-gallery.md, pr-bot-review-loop.md,
  pr-stacks-2026-10.md, landing-deploy-failures.md, zsh-shell-traps.md.
- Kevin, 2026-09-25 (screenshots the whole time); Kevin, 2026-09-28 (the
  readable PR page).
- The three scripts (added 2026-10-10): `references/sources.md`.
