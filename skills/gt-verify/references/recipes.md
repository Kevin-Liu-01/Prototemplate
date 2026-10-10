# Verification recipes

Commands and code for the checks in `SKILL.md`, read on 2026-10-05. `<scratch>` is the session's scratchpad. Scripts run with the working directory in a checkout that has `playwright-core` (Prototemplate does). Every browser here is headless.

## Real gestures in Playwright

A text selection, as a user makes it:

```js
const box = await page.getByText('Project name', { exact: true }).boundingBox();
await page.mouse.move(box.x + 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, { steps: 12 });
await page.mouse.up();
console.log(await page.evaluate(() => window.getSelection().toString())); // "Project name"
```

On 2026-09-02 this drag returned "Project name" on the fixed dashboard label and an empty string with `select-none` put back. A Range API selection had painted a highlight on the fixed label but proved nothing about the drag.

- Hover, then click, for controls with a hover state: `await loc.hover(); await page.waitForTimeout(300); await loc.click();`. Never pass `force: true` in a verification run; it skips the checks that a covered or disabled control fails.
- Type with `locator.pressSequentially(text, { delay: 30 })` when the field reacts to keystrokes.
- An authenticated dashboard page loads the seeded session of the per-worktree dev environment through `browser.newContext({ storageState: <its storage-state file> })`; gt-cloud's `dev-infra/README.md` names the file and the dashboard's local host (internal to gt-cloud, `gt-local-dev` section 4).

## Request URLs in a harness

Build every request URL as `new URL(ORIGIN + path)`, never `new URL(path, ORIGIN)`. A path that starts with `//` (`//evil.com/x`, a doubled slash from a join) is a protocol-relative URL, so the second form sends the request to that other host, and the harness reports a result from the wrong server. A routing review of 2026-09-09 first read an off-origin redirect from one such row; the row was the harness's own request. The same holds for a page-side `fetch(path)`, where a `//` path also leaves the origin, and for curl loops: append the path to the origin as a string.

## Layout shift around one interaction

```js
await page.evaluate(() => {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries())
      window.__shifts.push({ value: e.value, input: e.hadRecentInput, nodes: e.sources.map((s) => s.node?.className ?? s.node?.nodeName) });
  }).observe({ type: 'layout-shift', buffered: false });
});
await page.getByRole('button', { name: 'Continue' }).click();
await page.waitForTimeout(1500);
console.log(await page.evaluate(() => window.__shifts));
```

Entries within 500 ms of an input carry `hadRecentInput` and stay out of the CLS score, but Kevin sees them: a footer that jumps after a click is a defect unless the size change is animated. Layout-shift entries exist in Chromium only.

## CPU and network throttling (Chromium)

```js
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 10 });
// fonts that arrive late
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 50 * 1024, uploadThroughput: 50 * 1024 });
```

To tell a frame-starved run from a wrong one, time the story's events against the wall clock in both runs. On 2026-08-08 a MutationObserver ledger timed each belt crossing against the headline rewrite it triggers: 2.46 s at 1x and 2.43 to 2.50 s at 10x, while frames fell to 4 to 6 per second. The timing held, so the run was frame-starved and correct. `stress.mjs` makes the same comparison on settled states. For a late-font fix, sample the moving property every 80 ms for 5 s on a cold load under the network throttle and count backward jumps.

## WebKit

`--browser webkit` on `probe.mjs` and `stress.mjs`, or `require('playwright-core').webkit.launch({ headless: true })`. WebKit 26.5 runs from the ms-playwright cache on Kevin's machine. Compare one invariant in both engines: on 2026-08-18 the check was that the blog lead card's cover ends at its frame and the post body starts after it, at desktop and tablet widths in Chromium and WebKit.

## iOS Simulator

```sh
xcrun simctl list devices available | grep iPhone
xcrun simctl boot <udid>                                   # no Simulator window opens
xcrun simctl openurl <udid> http://localhost:3001/en-US    # the simulator reaches the host's localhost
xcrun simctl io <udid> screenshot <scratch>/ios.png
xcrun simctl io <udid> recordVideo <scratch>/ios.mov       # stop with Ctrl-C
xcrun simctl shutdown <udid>
```

Boot by UDID when a device name appears twice in the list. The iOS Simulator control tool swipes, taps and takes screenshots headless; its `attach` opens a panel, so attach only when Kevin wants to watch. A device the tool has not used needs Kevin's one-time grant. The simulator runs at the host's CPU speed, so CPU tiers come from the CDP throttle. To test the URL bar, swipe up until Safari's bar collapses and down until it returns, and compare screenshots: the document must not jump (DESIGN.md section 13).

## Phone recordings

```sh
ffprobe -v error -show_entries format=duration:format_tags=creation_time -of default=nw=1 <rec>.mov
mkdir -p <scratch>/frames && ffmpeg -v error -i <rec>.mov -vf "fps=10,scale=480:-1" <scratch>/frames/%04d.png
ffmpeg -v error -i <rec>.mov -vf "fps=2,scale=320:-1,tile=6x4" -frames:v 1 <scratch>/sheet.png
```

Read the frames in order. Attribute the recording to a build before saying whether it is fixed: compare its creation time with the deployment times (`vercel ls landing --scope general-translation --prod`) and look for a feature that only one build has. A file with no duration never finished writing; reproduce the condition directly and say so.

## Console errors across routes

Prototemplate pages: `pnpm check:pages --pages <ids>` reads console errors, page errors and failed resources in every cell. Other sites, route by route:

```sh
for r in / /pricing /enterprise /blog; do
  node skills/gt-verify/scripts/stress.mjs "http://localhost:3001/en-US$r" --phases first,slow --viewports 1440x900,390x844 --steps 6 --out "<scratch>/errors${r//\//-}"
done
```

A page error fails the run; console errors and 4xx or 5xx responses are listed in each `REPORT.md`.

## The live deployment

generaltranslation.com (the gt-cloud `landing` project):

```sh
git -C $GT_CLOUD fetch origin main
vercel ls landing --scope general-translation --prod                    # pick the newest row whose status is Ready
vercel api /v13/deployments/<deployment url> --scope general-translation > <scratch>/dep.json
jq -r '.id, .meta.githubCommitSha, .readyState, (.alias | join(" "))' <scratch>/dep.json
git -C $GT_CLOUD merge-base --is-ancestor <your merged sha> <githubCommitSha> && echo CONTAINS
curl -s https://generaltranslation.com/en-US | grep -oE 'dpl_[A-Za-z0-9]+' | sort -u
```

The longest `dpl_` id on the live page is the deployment that serves it. A newer row still Building serves nothing yet. On 2026-10-05 the stamp equalled the newest Ready production deployment's `id`, whose `githubCommitSha` was origin/main's e17fce499 and whose aliases included generaltranslation.com. A docs or blog change merged in `generaltranslation/content` reaches the site through the deploy hook, so read the newest deployment after that merge. Prototemplate's check is `gt-ship` section 8.

## OG and Twitter cards

```sh
curl -s https://generaltranslation.com/en-US | grep -oE '<meta (property|name)="(og|twitter):[^"]+" content="[^"]*"'
curl -s -o <scratch>/og.png -w '%{http_code} %{content_type}\n' https://generaltranslation.com/api/og-home
```

The image must answer `200 image/png`. Open the PNG and look at it at full size against the hero's resting state. The wiki skill `og-metadata-audit` covers the full tag set.

## Mutation verification in a shared tree

```sh
git diff -- <fix files> > <scratch>/fix.patch
git apply -R <scratch>/fix.patch
pnpm --dir apps/landing exec vitest run <test file>    # must fail on the behaviour the fix changed
git apply <scratch>/fix.patch
pnpm --dir apps/landing exec vitest run <test file>    # must pass
git diff --stat -- <fix files>                         # the fix is back
```

Reverse only files this session owns. For a committed fix, run `git revert --no-commit <sha>` in a scratch worktree instead.

## A known-good commit

```sh
git -C $GT_CLOUD log --oneline <good>..<bad> -- <paths>
git -C $GT_CLOUD diff <good> <bad> -- <paths>
git -C $GT_CLOUD worktree add --detach <scratch>/bisect <bad>
cd <scratch>/bisect && git bisect start HEAD <good>
git bisect run <script>     # exit 0 good, 1 bad, 125 skip; a probe reading makes a good script
git bisect reset && cd - && git -C $GT_CLOUD worktree remove <scratch>/bisect
```

Never bisect in a checkout another session uses.

## Edge counts and languages

- Counts: render the list at 0, 1, 2, a typical count, the cap, the cap plus one and a large count, with fixtures or the dashboard's `/dev/states` gallery, which lives on a branch outside main (gt-local-dev section 4).
- The landing translates into es, fr, zh, ja, it, ru and en-GB (`apps/landing/gt.config.json`). Translations are generated at deploy, and staging translates Spanish only, so read the longest string on production:

```sh
for l in en-US es fr it ru ja zh en-GB; do
  node skills/gt-verify/scripts/probe.mjs "https://generaltranslation.com/$l" --sel "<css>" --viewport 390x844 --out "<scratch>/i18n-$l" | grep -E '^  (rect|crop)'
done
```

- Components that carry their own multilingual strings (the hero's locale belt, demo windows) are measured with every string they hold, Arabic and Devanagari included.
