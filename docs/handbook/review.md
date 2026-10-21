# Reviewing with Kevin

Kevin Liu does design, website and product work at General Translation (GT), and he reviews the work his agent sessions do: on localhost, in pull requests and in the desktop app where the sessions run. His review words have fixed readings, his rounds start from one exemplar, and every result reaches him as something to see with its state named. Each section below gives the rule, the review that set it and the skill that holds the procedure. The [quality bar](quality-bar.md) holds the bar the work is measured against, and the [operating principles](operating-principles.md) hold the standing rules behind his corrections.

## Words read as measures

Each word Kevin uses in a review has one reading, and each reading was set by a correction. Apply the reading on the render and report the measured values.

| Word | Reading | The case that set it |
| --- | --- | --- |
| "Equivalent", "equal" | Both measures take the larger value | 2026-09-30: two gaps evened at 10px in an 814px-tall window were rejected; the accepted pair reads 16 and 16 there and 26 and 26 at 900px |
| "Smaller", "larger" | The next rung of the existing ladder | 2026-09-28: 13px card facts went to the 12px rung |
| "Fix this", on one instance | The whole class: find every member, fix it, report the count | [Operating principle 5](operating-principles.md) |
| "Remove this" | The smallest reading, then a check of the neighbours | Standing rule |
| "Add it to the left of X" | X alone; the rest of X's column stays | 2026-08-13 |
| "Standardize" | One structure on every page of the kind, with a lint or the page check to catch a page that drifts | 2026-10-06, the book page |
| "Enhance", on an existing page | Keep the page, its sections and its copy word for word, and add to it | 2026-10-08: a rebuild that dropped a page's hero, logo band and copy was rejected |
| "Redesign" | Visibly new; a change that keeps the old shape comes back as not done | 2026-09-30 |
| "Keep its aesthetic" | The geometry and the material stay, and only the named thing changes | Standing rule |
| "Make it look better", with a reference | Measure the reference and match it | Standing rule; without a reference, the brand deck for a product surface and the shipped site for a landing page |

Kevin, 2026-08-13: "incorrect. i only want you to add it to left of ...".

Once a rule matters to him, Kevin asks for a lint, so a new rule ships with its lint or names the lint that should hold it. [process.md](../../skills/gt-aesthetic/references/process.md) of `gt-aesthetic` (Reading Kevin's asks) holds the readings.

## One exemplar first

Build one section, one page or one state, get Kevin's sign-off on its grammar, then replicate it across the set. A full set built on a reading he had not confirmed costs the whole round. A version he rejected is never the base of the next attempt, which restarts from the reference.

| Date | What happened | The rule it set |
| --- | --- | --- |
| 2026-08-04 | Seven landing sections fanned out on an unconfirmed reading of the mock images, and one element survived review: an isometric drawing | One exemplar first; mock images and prototype pages are literal specs, and their notes are change orders |
| 2026-08-12 | After Kevin picked one variant per page, a variants system of about 16,000 lines left the code, and the sign-in route was checked byte-identical to the committed page | The alternatives leave the code after a pick and stay in git history |
| 2026-09-04 | Nine of ten shader frames sent for a pick looked the same | Check that a set differs before sending it |
| 2026-09-14 | A round rebuilt ten directions as forks of one earlier direction, and seven of the ten heroes had the same layout, headline and hero visual | Directions differ in silhouette, material and action |

Kevin, 2026-09-04: "they all looks the same bro 9 / 10 are the same".

The set check flags a pair of pictures under 2% mean difference as the same picture, and a pair whose tone grids correlate at 0.9 or above as the same composition. A clean report means only that no two options are near copies, so the silhouette, material and action table is still read by eye.

```sh
node skills/gt-explorations/scripts/distinct-set.mjs public/shots/light/<slug-a>.jpg public/shots/light/<slug-b>.jpg
node skills/gt-explorations/scripts/distinct-set.mjs <folder of frames> --strict
```

- A direction lives in its own route with its CSS scoped under its own root class, so it never restyles another direction. Keyframe names are global, so a direction prefixes its own with its slug.
- Explorations stay on a branch or uncommitted until Kevin has reviewed them on localhost, because Prototemplate's main branch deploys the public site.

[gt-aesthetic](../../skills/gt-aesthetic/SKILL.md) section 5 holds the loop, and [gt-explorations](../../skills/gt-explorations/SKILL.md) section 2, [rounds.md](../../skills/gt-explorations/references/rounds.md) and [charter.md](../../skills/gt-explorations/references/charter.md) hold the rules for a round.

## Showing the result

Every visual or audible result reaches Kevin as something he can see or hear, in the turn it is made and before he asks for it.

| What changed | What Kevin gets |
| --- | --- |
| An area of a page or a component | Before and after crops of every changed area at the same viewport and clip, 420 to 900 CSS px wide, in both themes |
| A set of marks, covers or directions | One contact sheet with every item numbered, plus the files |
| A page, a flow or an app | The URL of a running server, with its port, branch and commit |
| Audio takes or voices | Each option numbered on screen, as a video or on a small listening page |
| Scripts, voiceover lines, deck text | The text, for review before the final render |

Images go into the reply as attached files, so he can forward them. A claim about size or spacing carries the value measured in the browser, such as "both buttons read 9.5px from label to glyph". Crops are shot with an external browser harness, because the desktop app's browser pane pauses `requestAnimationFrame` and canvases come out blank there.

The desktop app's file card plays video files and does not play audio-only files, so on 2026-10-16 a pronunciation sample sent as `.mp3` could not be heard. A listening sample goes out as `.mp4`: one 1280 by 720 card per option with its number large, drawn with Pillow where the installed ffmpeg has no `drawtext` filter, cut to the audio and joined with ffmpeg's concat demuxer. The question then names the numbers on screen.

```sh
ffmpeg -loop 1 -i card-1.png -i take-1.wav -c:v libx264 -tune stillimage -pix_fmt yuv420p -c:a aac -shortest option-1.mp4
printf "file '%s'\n" option-*.mp4 > options.txt
ffmpeg -f concat -safe 0 -i options.txt -c copy options.mp4
```

[gt-reporting](../../skills/gt-reporting/SKILL.md) section 1 holds the table, and [process.md](../../skills/gt-aesthetic/references/process.md) of `gt-aesthetic` holds the local review recipe.

## Ship states

Each item in a report ends in one state, and each state carries its proof.

| State | Words | Proof in the line |
| --- | --- | --- |
| Local only | "local only, uncommitted" or "committed locally at `<sha>`, unpushed" | The sha |
| Pushed | "pushed to `<branch>` at `<sha>`" | The branch and the sha |
| PR open | "PR open, checks green, needs one approval" | The full link and its checks |
| Merged | "merged to main as `<sha>`" or "merged into the PR branch `<branch>`" | The merge sha and the branch it went into |
| Live | "deployed and verified live at `<url>`, serving `<sha>`" | The URL and how the build was matched to the commit |

Kevin, 2026-10-03: "when u say "merge" u mean into ur pr right".

A merged change is live only once a production build of its commit has succeeded and serves the page. While production builds fail, the site keeps serving the last good deployment, so the newest production build is read before a report says "live". A clean local type check does not prove the hosted build either. On 2026-10-16 a push that compiled cleanly with `tsc -b` failed its hosted build three times: TanStack Start's import protection refuses a server-only import that stays in a page's module graph, and a helper in a module the page imported called `setResponseStatus` from a default parameter. In a module a page imports, every request-scoped server call stays inside the server function's handler or behind an awaited import.

[gt-reporting](../../skills/gt-reporting/SKILL.md) section 2 holds the states, and [gt-verify](../../skills/gt-verify/SKILL.md) section 7 holds the checks that prove a deploy.

## The ask ledger

Kevin sends long messages with several asks and adds more while work runs, so every ask is numbered in the order received and tracked until it is reported.

```text
N. [done | in progress | blocked: reason] the ask in Kevin's terms. Where: file, route or URL. Proof: commit, PR or URL. Verified: how.
```

- A report on multi-ask work closes with the full ledger, done items included. When he re-sends a compiled list, it is matched line by line and every item is reported.
- "Did we do this" gets a yes or a no first, then the item's ledger line.
- A turn opens with the answer to what he asked, about the exact pull request, page or file he named, then what shipped, something to see, and a numbered list of what only he can do (an approval, a login, a payment, a credential, a choice).
- A short summary holds what shipped and what only he can do, in under fifteen lines.
- Workflow internals stay out: lane and agent names, bot rounds, lint runs, rebases and follow-up pull requests opened along the way.

When a run will outlast a compaction of the session, the ledger lives in a file named in each report, so a bare "continue" resumes from it. [gt-reporting](../../skills/gt-reporting/SKILL.md) sections 3 and 4 hold the ledger and the order of a turn's close.

## Sources

- Prototemplate, read on 2026-10-21: `skills/gt-aesthetic/SKILL.md` section 5 and `references/process.md`; `skills/gt-explorations/SKILL.md` section 2, `references/rounds.md` and `references/charter.md`, `scripts/distinct-set.mjs`; `skills/gt-reporting/SKILL.md` sections 1 to 4; `skills/gt-orchestration/SKILL.md` section 1; `docs/handbook/decisions.md` (2026-08-12); `docs/handbook/operating-principles.md`.
- Kevin's messages to Claude Code and Codex for the quoted rulings. Quotes keep his spelling.
- Kevin's private agent notes on the sign-in gap review, the first landing build, the variants program, sending audio samples and a hosted build failure, dated 2026-08-04 to 2026-10-16.
