# Measurement recipes

The commands behind the gt-performance skill. Run them from a Prototemplate
checkout ($PROTOTEMPLATE), which has playwright-core; the two scripts find
Chrome for Testing under the ms-playwright cache, and `CHROME_PATH`
overrides it. Record `uptime` beside every run.

## Frame time: frame-probe.mjs

```bash
F=skills/gt-performance/scripts/frame-probe.mjs
node $F http://localhost:3005/<path> --runs 3                     # baseline, three runs and their median
node $F <url> --cpu 12 --seconds 12                               # a weak device; the governor's proof rate
node $F <url> --scroll --size 390x844 --dpr 3                     # a phone, wheel-scrolling through the window
node $F <url> --hover ".tile" --json                              # a hover state, machine-readable
node $F <url> --runs 3 --max-median 17.5 --max-contexts 1         # a budget gate: exits 1 on a breach
```

| flag | default | meaning |
| --- | --- | --- |
| `--runs` | 1 | fresh browser contexts; several runs print one line each and a median line |
| `--seconds` | 8 | the sampling window |
| `--warmup` | 3 | seconds after load before sampling |
| `--cpu` | 1 | Chrome's CPU throttling rate through the DevTools protocol |
| `--size`, `--dpr`, `--theme` | 1440x900, 2, dark | the viewport, the device pixel ratio, the seeded theme |
| `--scroll`, `--hover` | off | wheel-scroll during the window; hover a selector before it |
| `--budget` | 22 | the interval in ms counted as slow (16.7 counts every miss of 60 fps on a 60 Hz display) |
| `--headed` | off | a visible Chrome, for GPU-bound pages when the renderer column reads SwiftShader |
| `--max-median`, `--max-slow`, `--max-contexts`, `--max-long` | none | budgets on the median run; any breach exits 1 |

Each line reads: the median, p95 and worst interval; the slow share; long
tasks as a count and total ms; WebGL contexts the page created (`gl`) and
lost; canvases in the DOM; glyph-field tiers (`canvas[data-gf-tier]`); and
the one-minute load before and after. The script counts contexts by
wrapping `getContext` before page scripts run, so it creates none itself.
Reduced motion is emulated off, so the page's motion runs.

## Identity: pixel-diff.mjs

```bash
P=skills/gt-performance/scripts/pixel-diff.mjs
node $P capture http://localhost:3005/<path> --out /tmp/before.png
node $P capture http://localhost:3005/<path> --out /tmp/before-2.png
node $P compare /tmp/before.png /tmp/before-2.png          # must read 0 channels
# make the change, then
node $P capture http://localhost:3005/<path> --out /tmp/after.png
node $P compare /tmp/before.png /tmp/after.png --diff /tmp/diff.png
```

`capture` renders under reduced motion and takes `--size`, `--dpr`,
`--theme`, `--wait` (ms after load and fonts), `--full` and `--selector`.
`compare` decodes both PNGs without color conversion and prints the
differing pixels and channels, the largest channel difference and the box
that holds them; `--diff` writes the differences in red over a dimmed copy,
and `--tolerance` sets the per-channel allowance. It exits 1 on any
difference beyond the tolerance. Capture both sides with the same flags, or
the sizes differ and the compare stops.

## Weight: the built chunks

```bash
pnpm build      # Prototemplate; for gt-cloud apps see gt-website section 8
for f in $(grep -l '<token>' .next/static/chunks/*.js); do
  printf '%s raw %s gzip %s\n' "$f" "$(wc -c < "$f" | tr -d ' ')" "$(gzip -9c "$f" | wc -c | tr -d ' ')"
done
```

Pick a token the minifier keeps and only that module holds: a GLSL uniform
name works (`uDeflEnd` for the horizon shader). The loop prints every chunk
that carries the module, so the count of copies comes with the sizes.

## Lighthouse

```bash
# Prototemplate
pnpm build && pnpm start                  # next start on port 3000
mkdir -p lh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npx -y lighthouse@12 http://localhost:3000/<path> \
  --output=json --output=html --output-path=./lh/<name>
# writes lh/<name>.report.json and lh/<name>.report.html
# --preset=desktop for desktop (mobile is the default)
# --throttling-method=devtools for real throttling in place of the simulation
```

Run each cell (page, form factor, build) three times and report the medians
with the range. The HTML report's scores and metrics are the screenshots the
pull request carries. For generaltranslation.com, gt-website
`references/docs.md` holds the local command, the cache check per framework
and locale, and the two ways into an SSO-protected preview (`vercel curl`,
or the OIDC header passed with `--extra-headers`).

These rules back section 6 of the skill.

- **Landing pull requests have no preview to measure.** Git deploys run for
  `main` and `staging` only (`apps/landing/vercel.json`). On 2026-09-25 a
  CLI preview deploy was ruled out too: the landing build runs
  `git submodule update`, and an uploaded tree carries no git checkout. The
  branch was measured under a local `next start` beside production, with
  that caveat stated, and production gets the clean check after the merge.
- **Run each cell three times and report medians with the range.** The
  2026-09-25 recheck read production mobile 73 to 75 and the branch 79 to
  80 over three runs each. Name the cause of any variance or gap:
  - The CDN against a local `next start` shows up mainly as server response
    time.
  - A late font can split the score. After the docs PR's scope cut the
    branch read 79 or 70. On localhost the italic font file finished just
    before the observed first paint in five of seven runs, and Lighthouse
    charged it to the simulated paint. A throttled real Chrome painted at
    1,284 ms in every run (`--throttling-method=devtools` applies real
    throttling).
  - Machine load moves both sides. One production run taken in a loaded
    batch read 71 against its usual 73 to 75 (section 2, item 5).
  - gt-website `references/docs.md` covers the hydration JavaScript that
    Lighthouse charges to the docs' mobile LCP.
- **Keep the pull request to the changes that carry the measured win.**
  Kevin cut the docs performance PR on 2026-09-25: "imo this is doing too
  much for such little changes". gt-website `references/docs.md` records
  what stayed and what left. A change with risk and little gain leaves the
  PR. Kevin, 2026-09-15: "dont touch posthog. evaluate your chnages for
  stuff that is high risk like posthog", and the PostHog deferral was
  reverted. An idea that measures worse is built, measured, reverted and
  listed in the PR body.
