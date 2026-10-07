---
name: gt-reporting
description: >-
  How to report to Kevin during and after General Translation work: show
  every result as crops, a running page, a gallery or files he can grab;
  state each item's exact ship state with its SHA, PR or URL; keep a
  numbered ledger of every ask; close a turn with what shipped, what only
  Kevin can do and numbered risks; draft the PR slate across gt-cloud, gt
  and content; batch decisions with recommendations; map his screenshot
  notes to fixes; and write one-sentence explanations, end-of-day recaps and
  stop-and-handover reports. Use when ending every turn that changed
  something, when Kevin asks "show me", "is it on main", "give me my PR
  list", "what did you do" or "what do you need from me", and when a round
  produces decisions for him.
metadata:
  title: Reporting to Kevin
  areas: workflow, voice
  updated: 2026-10-05
  origin: prototemplate
---

# Reporting to Kevin

Kevin Liu reviews General Translation (GT) work through what an agent puts in front of him: pictures, a running page, a link, and numbered lists he can answer by number. This skill sets the formats for the turn close, the ask ledger, the PR slate, decision lists, recaps and the stop-and-handover report. Read it before ending any turn that changed something.

`$PROTOTEMPLATE` is a Prototemplate checkout and `$GT_CLOUD` a gt-cloud checkout. `scripts/pr-slate.mjs` drafts the PR slate from GitHub, and [references/examples.md](references/examples.md) holds a worked example of each format. Crop sizes and viewports belong to `gt-aesthetic`, review servers to `gt-local-dev`, deploy checks to `gt-website` and `gt-ship`, handoff files to `gt-orchestration`, the PR body to `gt-ship`, and the register to `gt-voice`.

## 1. Show the result

Every visual or audible result reaches Kevin as something he can see or hear, in the turn it is made and before he asks for it.

| What changed | What Kevin gets |
| --- | --- |
| An area of a page or a component | Before and after crops of every changed area at the same viewport and clip, in both themes (`gt-aesthetic` "Showing the work" and "Local review") |
| A set: marks, covers, a round of directions | One contact sheet with every item labelled, plus the files |
| A page, a flow or an app | The URL of a running server in `gt-local-dev`'s server line (URL, port, branch, commit and folder), with the page opened in his browser when he is at the machine |
| Audio takes, voices, a session's whole output | A small HTML gallery or listening page: each item numbered, playable or viewable, described in one line, with the recommended pick tagged |
| Scripts, voiceover lines, deck text | The text, shown for review before the final render |

- Images go inline in the reply as attached files, so Kevin can forward them. A path alone makes him open the file himself.
- "Where is this visible" gets the URL in the first line, with the server already running. Kevin, 2026-08-11: "where is this visiible. start building".
- "Show me everything" gets one page that holds the whole session's output, published as an Artifact or opened locally (2026-10-02, 2026-10-05).
- A claim about size or spacing carries the value measured in the browser, such as "both buttons read 9.5px from label to glyph".
- Say which kind of check passed. A page that loads at the right size has passed a proxy check. The visual check is a person or a critic comparing the crop with the reference (`docs/handbook/quality-bar.md`).
- Shoot crops and try copy buttons outside the in-app browser pane, which blanks canvases and blocks clipboard writes (`gt-aesthetic` "Local review", `gt-local-dev`). Send Kevin to Chrome for anything that copies.

## 2. Ship state

End each turn with the state of every item in one of these phrasings.

| State | Words | Proof in the line |
| --- | --- | --- |
| Local only | "local only, uncommitted" or "committed locally at `<sha>`, unpushed" | the sha |
| Pushed | "pushed to `<branch>` at `<sha>`" | branch and sha |
| PR open | "PR #N open, checks green, needs one approval" | the full PR link |
| Merged | "merged to main as `<sha>`" or "merged into the PR branch `<branch>`" | the merge sha |
| Live | "deployed and verified live at `<url>`, serving `<sha>`" | the URL and how the build was matched to the commit |
| Left | "left:" and what remains, with the reason | |

- Name the branch every merge goes into. Kevin, 2026-10-03: "when u say "merge" u mean into ur pr right".
- A change is live once a production build of its commit has succeeded and serves the page. A merged PR can stay invisible: while production builds fail, generaltranslation.com keeps serving the last good deployment (2026-10-02: "5049 was merged but i cant see it live. whyy?"). Read the newest production build before writing "live". The landing's commands are in `gt-website` section 8, and Prototemplate's `dpl` stamp check is in `gt-ship` section 8.
- Answer "is everything on main?" from git, item by item: `git fetch origin`, `git branch -r --contains <sha>`, `gh pr view <n> --json state,mergedAt,mergeCommit`. When he adds "send pics" (2026-09-24), attach crops from the deployed page.
- Say so when work reached main or a public preview before Kevin reviewed it. Exploration rounds stay local until he lands them (`gt-ship` section 8).
- A long run reports a percentage and what remains. Count it from the ledger (done items over all items, or gates passed over all gates), say what each number counts, and name the slow items with an estimate. On 2026-10-05 "give me a progress/percentage report" got a table with one row per workstream (what it counted, its percentage) and one overall estimate.

## 3. The ask ledger

Kevin sends long messages with several asks and adds more while work runs. Each ask is tracked until it is reported.

- Split every message into items: each numbered note, each "also", each image, each line of a pasted list. Add mid-run messages to the same list. Number items in the order received and keep the numbers.
- One line per item:
  `N. [done | in progress | blocked: reason] the ask in Kevin's terms. Where: file, route or URL. Proof: commit, PR or URL. Verified: how.`
- Close each report on multi-ask work with the full ledger, done items included.
- A hard item is attempted and reported with what was tried. A blocked item names what unblocks it and who can do that.
- When a run will outlast a compaction, keep the ledger in a file (the round's plan file, or the session's scratchpad for a run that ends the same day, since the scratchpad can vanish at the date change) and name the file in each report, so a bare "continue" resumes from it.
- When Kevin re-sends a compiled list ("all the addon requests i addded, recompiled", 2026-10-03), match it against the ledger line by line and report every item, including the ones already done.
- Kevin's "did we do this" gets a yes or a no first, then the item's ledger line.

## 4. The turn close

A turn that changed something ends in this order.

1. **The answer to what Kevin asked**, in the first line, about the exact PR, page or file he named. When several of his messages queued during a run, answer each in its own words before any progress report. On 2026-10-02 "make 5091 a lot easier to understannd. wha twas the problem?" got a first line on #5091 itself, then the problem and the fix in two sentences each, before the list of changes.
2. **What shipped**, one line each, in product terms (what a user sees or what changed for the team), each with its state from section 2.
3. **Something to see** (section 1).
4. **What I need from you**, numbered, holding only what Kevin alone can do: an approval or a merge that needs his rights, an issue id from Linear (GT's issue tracker), a login, a payment, a credential, a choice. Each item carries the exact link, file or command. For a credential, name the gitignored env or config file and the variable he fills in himself, and never ask him to paste a secret into chat.
5. **How it was tested and what testing did not cover**, for systems work, with numbers: scenarios run, tests passed, browsers covered, and the case nobody could check.
6. **Risks and side effects**, numbered, each with its consequence and the action offered, so Kevin answers by number (2026-09-28: "yeah lets do 1., fix 2, anything else?").
7. **The ledger** (section 3), when the turn carried more than one ask.

- Keep items resolved since the last report apart from new findings.
- Leave out workflow internals: lane and agent names, harness and monitor states, bot rounds, lint runs, rebases, and follow-up PRs opened along the way. Kevin cut "got 4213 merged mid-push, spun up follow-up pr 4240" from a recap as unimportant (2026-08-08).
- Kevin's "give me a shorter summary oof your accomplishments and what you need from me" (2026-09-28) means items 2 and 4 only, in under fifteen lines.
- Write to `gt-voice`: plain sentences, no em dashes, no hype, and no narration of steps such as "Starting the build now".

## 5. The PR slate

"Give me my PR list", "PR slate" and "PR order" each mean every open PR Kevin authored in GT's three repositories, in merge order, grouped by what each needs. The repositories are `generaltranslation/gt-cloud` (the private product monorepo), `generaltranslation/gt` (the open-source libraries and the `gt` CLI) and `generaltranslation/content` (the docs and blog). The reply opens with the list.

```sh
node $PROTOTEMPLATE/skills/gt-reporting/scripts/pr-slate.mjs           # grouped Markdown
node $PROTOTEMPLATE/skills/gt-reporting/scripts/pr-slate.mjs --slack   # lowercase, in a code fence
node $PROTOTEMPLATE/skills/gt-ship/scripts/pr-bots.mjs <n>             # one PR's bots, threads and checks
```

The script reads titles, line counts, review decisions, merge states, checks and stacks, and changes nothing. It prints groups 1 to 6 and 9, and marks new PRs "new today". The agent adds what it cannot know: the order between unrelated PRs, the diagnosis of each red check, the close candidates and the items only Kevin can do.

The slate has ten groups in this order, and an empty group is left out.

1. **Merge now**: approved, green, no conflict, and not stacked on an open PR.
2. **Green, waiting on an approval**: to bump, with the reviewers already requested.
3. **Blocked on a Linear id or an env flag**: a `feat` title needs a Linear issue id (`gt-ship` section 3), and a feature behind a flag names the variable (`FAQ_ASSISTANT_ENABLED` for #4885).
4. **Needs work**: each failing check with its diagnosis from the log, flake or real. A failure in a test the PR does not touch is a likely flake; name the test and say why.
5. **Changes requested**: the reviewer's open ask, and whether the fix is pushed.
6. **Conflicts**: needs a rebase onto its base.
7. **New today**: moved here from the group the script gave it.
8. **Close candidates**: each names the merged PR that carries its change. Close only a PR whose change is already on main, with a comment naming the merged PR, and keep the branch. Kevin, 2026-10-02: "only delete prs that are already in the codebase".
9. **Drafts, stale and left open on purpose**: listed once and left alone.
10. **Only you**: approvals that need his rights, Linear ids, env values, reviewer choices.

- Each line holds the full link, a one-line purpose, the line counts from GitHub (`+1039/-142`) and what it needs.
- Ordering constraints go inline: "after #4703", or a chain such as "4673, then 4522, then 506" (2026-09-04). That chain put the UI PR first, the docs PR before the post, and the content PR last, since merging it publishes the post (`gt-website` section 5).
- Each repeat is simpler than the last. On 2026-10-01 the first answer ran to nine items under two headings. Kevin asked again ("what the heck? why so many prs? give me my list againnn") and got six lines with one action each, then asked for the Slack version.
- The Slack version is lowercase plain text in a code fence: one action per line, every PR as a full URL, the close list and the later list at the bottom. The wiki's `slack-voice` holds the register.
- GitHub reports the merge state as `UNKNOWN` until something asks for it. `gh pr view <n> --json mergeStateStatus` starts the computation; ask again after a few seconds.
- To find close candidates, list recent merges (`gh pr list -R generaltranslation/gt-cloud --state merged --author @me --limit 40 --json number,title,mergedAt`) and compare each open PR's files with the merged PR that absorbed them. Squash merges rewrite commits, so compare the diffs.

## 6. Decision lists

At a checkpoint ("put everything on main and give me decisions", 2026-09-25), batch every open decision into one numbered list.

- Each item has a short id (an area prefix and a number, such as `ONB-03`), the question in plain language, what each answer leads to, and the recommended answer in brackets.
- Open with one line on how to answer: the id and a word. Kevin replies inline ("FSP 03 - yes. fsp-04 - no, theyre good", 2026-09-25) or pastes the items back with his answer in capitals after each.
- Use words a reader outside the work understands. A check name, lane name or metric appears only with its visible effect, such as "the onboarding PR would grow by 18,000 lines of recorded JSON".
- Group items by area when there are more than about eight.
- Kevin decides spend, naming, licensing, scope, production policy, growth surfaces, tracking, pricing, and any instruction that reads two ways. The agent decides the rest and reports it.
- When a new state resembles an existing one, reuse the existing behavior and say so.
- A single question is for one real choice or a real ambiguity: one multiple-choice question with the recommended option first.
- Kevin's "look through all prev conversations and tell me the open questions you had" (2026-09-14) means reading the memory notes, the plan and spec files, and the session transcripts (`~/.claude/projects/<project>/<session>.jsonl` and `~/.codex/sessions/`, searched by topic), then listing each undecided item with the default the work has run under.
- After Kevin answers, carry out every answer and report each by its id in the ledger.

## 7. Reading Kevin's feedback

Kevin sends feedback in four forms, and every item in it becomes a line in the ledger.

### The four forms

- **Numbered notes keyed to screenshots**, such as "1. image 1: lets make sure bentos have vertical lines between them" (2026-07-30). "image 1" is the first attached image. Map each note to its region of the image, then to the component and file that render it.
- **An element picked in the browser pane**: a `<launch-selected-element>` block with the tag, the classes, a `<path>`, the React component chain and the HTML, followed by a one-line instruction. Edit the component the block names, at the element its path names.
- **Exact CSS or markup from DevTools** or from a reference site. Apply the values exactly to the selector he named, then check that the computed values match.
- **A pasted Slack thread from the CEO** with timestamps. Number each ask into the ledger. An approval in the thread is an approval to merge, and an unfinished part stays hidden until its fix lands. On 2026-08-16 the unfinished sections of the enterprise page were commented out for the merge. A dashboard feature that is not ready ships behind a feature flag (`docs/handbook/decisions.md`, 2026-09-03).

### Turning feedback into work

- Read typos for intent.
- Restate an ambiguous swap, move or removal in one sentence before building it. "Swap the boxes" meant switching the words and the diagram box, and the first reading cost a round (2026-08-04).
- When he says "check my image", the image is the spec. Re-read it before changing anything else.
- Fold asks queued mid-run into the work in flight and add them to the ledger.
- Report per item: what landed, the commit, how it was verified, and the after crop.
- His design vocabulary ("equivalent", "keep its aesthetic", "smaller") is defined in `gt-aesthetic` "Reading Kevin's asks".

## 8. Explanations, recaps and handover

- **Explanations.** Explain a mechanism in one or two plain sentences before any detail. Kevin, 2026-08-17: "so how does our matcher work in one sentence". "What was the problem" with a PR gets the cause and the fix in one or two sentences each.
- **End-of-day recap.** The recap is Kevin's own account of his day, so it is written in his voice and in lowercase: two sentences on the day, then one line per meaningful, user-visible change, weighted to what the CEO asked for. Kevin, 2026-08-16: "explain it in 2 sentences then give full list of things i did today one sentence each in my style". Merges, bot rounds, lint runs, rebases and follow-up PRs stay out.
- **Stop and give me everything.** Halt every lane at once and write the hard stop record (`gt-orchestration`, `references/handoffs.md`). The reply itself holds every path and link: what exists, what is complete, what is incomplete and where it stopped, and the review page if one exists (2026-08-12). His "can we just stop and give me the list of tasks and start again" (2026-08-07) means stop, send the ledger, and wait for his next message.
- **Handover to another agent or session.** `gt-orchestration` section 8 sets what the handoff holds, and the wiki's `handoff` skill writes a clipboard prompt for another machine. The report to Kevin names the receiving session and the file or prompt it starts from.

## 9. Files in Downloads

- Images and audio Kevin asks for go to his Downloads folder (`~/Downloads`) at full resolution: PNG for images, MP3 for audio, MP4 for video.
- Name each file `<subject>-<variant>-<theme>.<ext>` and deliver light and dark where both exist (2026-09-21: `designing-docs-wireframe-dark.png` and `designing-docs-wireframe-light.png` at 3840 by 2160).
- Show the files inline in the same reply and name the variant each one is.
- A set goes in its own folder (`~/Downloads/<round>/`) with the gallery page from section 1.
- Downloads holds copies. Commit the masters to the repository that owns them (for example, lossless WebP in Prototemplate) and say where they are.
- Audio for approval goes as MP3s plus a listening page, and Kevin confirms by number (2026-10-03: "send me the mp3s and ill confirm").

## 10. Rules, forms and shared documents

**A repository rule blocks what Kevin wants.** Read the rule before answering:

```sh
gh api repos/<owner>/<repo>/rules/branches/main                     # rules in force on main
gh api repos/<owner>/<repo>/collaborators/<login>/permission --jq .permission
gh api orgs/<org>/teams/<team>/memberships/<login>                  # 404 when not a member
git show origin/main:.github/CODEOWNERS
```

Then report in this order: the exact rule and where it lives; why Kevin cannot lift it himself (his role on the team and his permission on the repository); the fast path that works today, such as who can approve now; and a drafted Slack message to the admin who can change the rule, lowercase, with numbered asks and the PR link. On 2026-09-21 a content PR stayed at "review required" because CODEOWNERS named a team handle that did not exist, so a teammate's approval never counted; references/examples.md holds that report.

**A pasted form or questionnaire** is filled in directly, in Kevin's voice, from the repositories and GT's published pages. Mark only the fields that need facts only he has. Kevin, 2026-08-10: "no i just want you to fill this out".

**A shared Google Doc** is written only in the tab Kevin names. Read the tab id from the URL (`?tab=t.<id>`), confirm the tab's title before writing, place the text below anything he already wrote in that tab, and leave every other tab untouched (Kevin stated this in capitals on 2026-09-10). Writes go through the wiki's `gws` skill or the page he has open, with his confirmation before each write.

## Review checklist

- [ ] The first line answers what Kevin asked, about the exact item he named.
- [ ] Something to see is attached or linked: crops in both themes, a contact sheet, a running URL or a gallery page.
- [ ] Every item has its exact state with a SHA, a PR link or a URL; each merge names its target branch; "live" was read from the production deployment.
- [ ] The ledger lists every ask, mid-run additions included, with status, location, proof and how it was verified.
- [ ] "What I need from you" and the risks are numbered and hold only what Kevin alone can do or decide.
- [ ] Each decision has an id, a plain question, its consequences and a recommendation.
- [ ] The PR slate is grouped, in merge order, with full links, purposes, line counts and ordering constraints, and each close candidate names the merged PR that carries its change.
- [ ] Files Kevin asked for are in Downloads, in both themes where both exist, and shown inline.
- [ ] The report carries no process noise: lane names, bot rounds, lint runs or monitor states.
- [ ] The text passes `gt-voice`, and Slack versions are lowercase in a code fence.

## Related skills

Prototemplate: `gt-aesthetic` (crop sizes, local review, Kevin's design vocabulary), `gt-local-dev` (review servers and the server line), `gt-orchestration` (handoffs, the hard stop record, resume reports), `gt-ship` (the PR body, `pr-bots.mjs`, Prototemplate deploy checks), `gt-voice` (the register), `gt-website` (the two-PR blog order and landing deploys) and `prototemplate`. Handbook: `docs/handbook/quality-bar.md` (kinds of check) and `docs/handbook/decisions.md`. Kevin's wiki: `slack-voice` (Slack drafts), `handoff` (clipboard prompts for another agent), `human-review` (Kevin annotating a page in place), `gws` (Google Docs) and `agent-browser`.

## Sources

- Prototemplate: `skills/gt-aesthetic/SKILL.md` section 5; `skills/gt-local-dev/SKILL.md` section 1; `skills/gt-orchestration/SKILL.md` section 8 and `references/handoffs.md`; `skills/gt-ship/SKILL.md` sections 3, 4, 5 and 8, with `references/pr-body.md`, `references/review-loop.md` and `scripts/pr-bots.mjs`; `skills/gt-voice/SKILL.md`; `skills/gt-website/SKILL.md` sections 5 and 8; `skills/prototemplate/SKILL.md` section 10; `docs/handbook/quality-bar.md` and `docs/handbook/decisions.md`.
- gt-cloud: `scripts/deploy-landing.sh`. generaltranslation/content: `.github/CODEOWNERS` and the rulesets on main. Open PR data for generaltranslation/gt-cloud, gt and content, read on 2026-10-05 to test `scripts/pr-slate.mjs`.
- Claude memory notes (gt-cloud project): landing-deploy-failures, pr-screenshots-and-gallery, explorations-stay-local, plain-technical-english, sentence-order-rules, writing-for-strangers, cli-callback-page, docs-redesign-post-part2, redesign-screenshot-harness.
- Kevin's wiki: `skills/productivity/handoff/SKILL.md`, `skills/productivity/human-review/SKILL.md`, `skills/productivity/gws/SKILL.md` and `skills/personal/slack-voice/SKILL.md`.
- Kevin's directives from 2026-07-30 to 2026-10-05 (the mining synthesis, sections D1 to D10 and P3): numbered image notes (07-30); the swap read wrong (08-04); cutting process lines from a recap (08-08); a form filled in (08-10); where is this visible (08-11); stop and give me everything (08-12); the recap weighted to the CEO's asks (08-16); the matcher in one sentence (08-17); the 4673, 4522, 506 order (09-04); the Google Doc tab (09-10); open questions from earlier conversations (09-14); is everything on main (09-15, 09-24); a rule blocking an approval (09-21); PNGs in Downloads (09-21); inline decisions (09-25); the shorter summary and numbered risks (09-28); the PR slate and its Slack version (10-01, 10-02, 10-05); close only what is on main and the 5091 explanation (10-02); a merge into the PR branch (10-03); MP3s to confirm (10-03); the percentage report and the listening and review pages (10-05).
