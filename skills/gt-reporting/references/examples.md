# Worked examples

Detail for `gt-reporting`. Each example comes from reports an agent sent Kevin between August and October 2026, trimmed, reworded to `gt-voice` where needed, and with colleagues named by role. The decision list joins three decisions that were asked separately. The PR numbers are real gt-cloud, gt and content PRs; `<sha>` marks a value the example leaves out.

## A turn close

From a gt#2341 round on 2026-10-02, in the order of `SKILL.md` section 4.

> The copy icon is in [gt#2341](https://github.com/generaltranslation/gt/pull/2341), pushed to `k/cli-login-callback-page` at 6f46920fc. The PR is open and needs one approval.
>
> **Shipped**
> - A copy icon sits one space after `npx gt login`. A click copies the command, and the icon turns into a check for 1.6 seconds.
> - The copy and check icons take the same space, so the line holds still when they swap.
>
> **To see it:** http://127.0.0.1:3341 serves the four pages with the CLI's security header: `/denied`, `/failed`, `/signed-in` and `/signed-in-no-name`. Open it in Chrome, because the in-app pane blocks clipboard writes. Crops of the signed-in page in light and dark are attached.
>
> **Tested:** all 3,186 CLI tests pass. In Chromium the clipboard holds `npx gt login` and no Content-Security-Policy errors appear. Not covered: WebKit swaps the icon with no errors, and its clipboard could not be read.
>
> **What I need from you**
> 1. Approve and merge https://github.com/generaltranslation/gt/pull/2341.
>
> **Risks**
> 1. Cursor's approval bot labels the PR "Risk: high" because it touches the sign-in callback. The label asks for a human review and reports no bug.

## An ask ledger

A review thread Kevin pasted on 2026-09-04 held four asks: two image notes, a recovery and a list of dropdown links. The placeholders stand for the component, commit and reason each line names.

```
1. [done] image 1: hovering no longer moves the icon and its box. Where: <component>. Proof: <sha> on k/<branch>. Verified: hover crops before and after at 1440, both themes.
2. [done] image 2: the (i) on notes is the accent blue. Where: <component>. Proof: <sha>. Verified: crops in both themes.
3. [in progress] recover the rrweb move. Where: <file>. Proof: none yet. Verified: not yet.
4. [blocked: <reason>] the dropdown links: platform (Dashboard, Locadex, Core, OpenAPI), content (Storyblok, Google Drive), libraries (Vue). Unblocks when: <what, and who does it>.
```

## The PR slate

The full slate, from 2026-10-05, trimmed to one or two lines per group:

> **Merge now**
> - [#5091](https://github.com/generaltranslation/gt-cloud/pull/5091) creates a managed org in one transaction (+1039/-142). Approved, green, no conflicts. After it merges I point [#5116](https://github.com/generaltranslation/gt-cloud/pull/5116) at main and rebase it.
>
> **Green, waiting on one approval (to bump)**
> - [#5101](https://github.com/generaltranslation/gt-cloud/pull/5101) re-checks scheduled email recipients and retries failed sends (+1189/-129).
> - [#4703](https://github.com/generaltranslation/gt-cloud/pull/4703), then [#4707](https://github.com/generaltranslation/gt-cloud/pull/4707): the docs locale guard, then the locale switch stacked on it (+178/-110, +228/-36).
>
> **Blocked on a Linear issue id**
> - [#5068](https://github.com/generaltranslation/gt-cloud/pull/5068) Lottie blog figure.
> - [#4885](https://github.com/generaltranslation/gt-cloud/pull/4885) FAQ band, which also needs `FAQ_ASSISTANT_ENABLED`.
>
> Send me the issue ids and I'll retitle them.
>
> **Needs work**
> - [#5116](https://github.com/generaltranslation/gt-cloud/pull/5116): e2e fails in `runtime-translation.test.ts` on an assertion outside this PR's change, which looks like a flake. `run-tests` also fails, and I have not found the cause in its log yet.
>
> **Stale since July or August, left open on purpose**
> - The dashboard redesign stack [#4281](https://github.com/generaltranslation/gt-cloud/pull/4281) to [#4288](https://github.com/generaltranslation/gt-cloud/pull/4288).

The second ask on 2026-10-01 ("what the heck? why so many prs? give me my list againnn") got one action per line:

> Six to act on now, in order. Each line is one action.
>
> 1. [gt-cloud #5063](https://github.com/generaltranslation/gt-cloud/pull/5063): approve, squash-merge. Onboarding and sign-in.
> 2. [content #573](https://github.com/generaltranslation/content/pull/573): approve, merge. The agent prompt.
> 3. [content #576](https://github.com/generaltranslation/content/pull/576): approve, merge. CLI command names.
> 4. [gt-cloud #5054](https://github.com/generaltranslation/gt-cloud/pull/5054): approve, merge. Docs redirects, after 2 and 3.
> 5. [gt-cloud #5049](https://github.com/generaltranslation/gt-cloud/pull/5049): put a Linear issue id in the title, approve, merge. The hero button.
> 6. [gt #2341](https://github.com/generaltranslation/gt/pull/2341): approve, merge. CLI login page.
>
> After #5063 merges, close #4980, #5021 and #5038. After #5049 merges, close #4976.

The third ask ("give me a list to resolve in slack with lowercase") got the Slack version:

```
prs to get out today, in order:

1. approve + squash merge https://github.com/generaltranslation/gt-cloud/pull/5063 (onboarding + sign-in)
2. approve + merge https://github.com/generaltranslation/content/pull/573 (agent prompt)
3. approve + merge https://github.com/generaltranslation/content/pull/576 (cli command names)
4. approve + merge https://github.com/generaltranslation/gt-cloud/pull/5054 (docs redirects, after 2 and 3)
5. linear issue in the title, then approve + merge https://github.com/generaltranslation/gt-cloud/pull/5049 (setup for agents button)
6. approve + merge https://github.com/generaltranslation/gt/pull/2341 (cli login page)

after 5063 merges, close https://github.com/generaltranslation/gt-cloud/pull/4980, https://github.com/generaltranslation/gt-cloud/pull/5021 and https://github.com/generaltranslation/gt-cloud/pull/5038
after 5049 merges, close https://github.com/generaltranslation/gt-cloud/pull/4976

later: https://github.com/generaltranslation/gt-cloud/pull/4977 (shell) and https://github.com/generaltranslation/gt-cloud/pull/5029 (icons), rebased once 5063 is in
```

## A decision list

Three decisions from the onboarding and landing work of late September and early October 2026.

> Reply with the id and a word, for example "ONB-01 yes".
>
> **ONB-01.** The records that prove onboarding matches production add about 18,000 lines of JSON to #5063. Keep them in the PR, or keep the tests that check against them and move the records to a separate PR? Keeping them makes #5063 hard to read; moving them keeps the proof one command away. [move them out]
>
> **LND-01.** Landing production builds run out of memory on Next 16.3.8. Pin the landing to Next 16.2, which built the same pages in 25 seconds and lacks 16.3.8's image-optimization security fix, or hold landing deploys until Next fixes the leak? [pin to 16.2 and track the fix]
>
> **PR-01.** #5068's title starts with `feat`, which needs a Linear issue id to pass the title check. Send an id, or retitle it as `style`? [send an id, since it is a feature]

## Numbered risks

From a #5063 report on 2026-10-02.

> 1. The production records add about 18,000 lines of JSON to the PR. Tell me if they should go in a separate PR.
> 2. One reviewer approved, and another reviewer's change request still blocks the merge until they look again. The cleanup they asked for is pushed.
> 3. Tagging the Linear issue needs the Linear connector authorized in your claude.ai connector settings.

## One-sentence explanations

> Greptile's 4/5 came from its first review of the PR's first commit. Both of its findings were already fixed in b696dd9c1, and it scored 5/5 once asked to review again.

> A merge reaches generaltranslation.com only through a successful production build of the landing. When that build fails, the site keeps serving the last good deployment.

## An end-of-day recap

From 2026-08-08, after Kevin cut the merge and follow-up PR lines.

```
today was mobile and polish on the landing redesign. the scroll stories, footer and type now hold up on phones, and every note from the review list is fixed.

- rewrote the fullstack scroll story so it holds and locks with the scroll, with the blue rail rising to the top and new copy
- fixed the story that showed half mobile, half desktop at 150% zoom
- fixed the dead ctas and the footer roster (cookies, supported locales, status, locale selector)
- cut the font preloads from 876kb to 476kb
- fixed the carousel jerk on reload
- pointed the hero get started cta at the real sign-in
- stopped the mobile footer jitter on scroll (dvh to svh)
- redid mobile type and spacing section by section on one token ladder
```

## Stop and hand over

From 2026-08-12, after "stop and give me everythign right now".

> All stopped, and nothing else is running.
>
> - The copy: the 9-post X thread and the LinkedIn post, plain text with media notes inline, in `~/Downloads/redesign-launch-media/launch-posts.md`.
> - The media in the same folder: the final site rides (desktop dark, the Japanese walkthrough, mobile at 2x), the four fork rides and the stitched tour, the hero stills, and the studio session.
> - Incomplete: the presenter re-ride and the fork click-through were stopped mid-run, so those two files are the older versions.
> - The review page with the copy beside the media is still live at <artifact link>.

## Blocked by a repository rule

From 2026-09-21, when a teammate's approval did not unblock a content PR.

> There is a rule in the way, and you cannot lift it yourself.
>
> - **The rule.** Content's main branch requires one approving review from a code owner. `.github/CODEOWNERS` names two team handles for every file, and one of them does not exist, so the teammate's approval registers as a review and never satisfies the code-owner check.
> - **Why you cannot change it.** Your permission on the repository is write. Changing the team, the ruleset or CODEOWNERS needs a team maintainer or an admin, and a CODEOWNERS fix is itself a PR that needs a code owner's approval.
> - **Fast path today.** Any member of the code-owner team can approve #548.
> - **Message for the repository admin:**
>
> ```
> hey, quick one on generaltranslation/content. <teammate> can't approve prs there because codeowners points at a team handle that doesn't exist, so their approvals never count as the code-owner review and prs stay blocked.
>
> two asks:
> 1. fix the handle in .github/CODEOWNERS, or add <teammate> to the code-owner team. i can't do either (not a team maintainer, write on the repo).
> 2. in the meantime could you or anyone on the team approve https://github.com/generaltranslation/content/pull/548? it's a one-file follow-up to the docs post (restamps images, no text changes).
>
> thanks
> ```

## A listening page handoff

From 2026-10-05, after "i cant listen to the voices, make it in html so i can go through and listen to em".

> All 13 voices are on one listening page: <artifact link>.
>
> Each voice has a play button and reads the same two sentences, and a switch at the top plays them over the film's music or alone. My picks are tagged on the page: voice 1 first, voice 2 as a warmer alternative.
>
> When you're done, send:
> 1. A voice number.
> 2. Any lines to change, as film and line number.
> 3. Yes or no on the cut I flagged in the script page.
