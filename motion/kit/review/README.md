# Review pages

Two static pages for reviewing a film round. `script-review.html` shows each film's script as a timeline and a table of its lines: who speaks, the words, the subtitle, what is on screen and when. `voices.html` plays narrator auditions, each take with the film's music under it or the voice alone. Each page reads one JSON file, named by the `?data=` parameter, and draws everything from it. With no parameter a page reads its sample beside it: `sample-script-review.json` or `sample-voices.json`. The samples are placeholders that use every field.

## Open a page

The pages fetch their JSON, and browsers refuse that on `file://` pages, so serve the motion folder:

```sh
cd motion
python3 -m http.server 8000
```

Then open, for example:

- `http://localhost:8000/kit/review/script-review.html` (the sample)
- `http://localhost:8000/kit/review/script-review.html?data=/review/<round>/script-review.json`
- `http://localhost:8000/kit/review/voices.html?data=/review/<round>/voices.json`

`?data=` takes a path from the server's root (motion/) or a path relative to the page. `?theme=dark` or `?theme=light` sets the theme; without it a page follows the system setting. An address that ends in `#<film id>-<line n>` opens the script page at that line, for example `script-review.html#sample-a-2`.

The pages load the kit's `../tokens.css` for Inter and the palette, and use the system sans when the kit or its fonts are not there. They load nothing else from the network. Every string from the JSON is set as plain text, so markup in the JSON shows as typed. The pages ignore fields they do not know.

## Script review JSON

The top level:

| Field | Type | Meaning |
| --- | --- | --- |
| `title` | string | The page heading and the tab title. Default "Script review". |
| `intro` | string or array of strings | The paragraphs under the heading. |
| `links` | array of `{ "label", "href" }` | Links under the intro, such as the round's auditions page. An `href` resolves against the JSON file's address, and only http and https links are kept. |
| `voices` | object | Each voice code the films use, mapped to a voice. N, R and X have defaults. |
| `films` | array of films | Required. One section per film, in order. |

A voice, in `voices` or in a film's `voices`:

| Field | Type | Meaning |
| --- | --- | --- |
| `label` | string | The name in the voice column and the legend. Defaults: N "Narrator", R "Reader", X "No voice". Another code shows the code. |
| `kind` | `"narrator"`, `"reader"` or `"silent"` | How the voice's bars are drawn: grey, the accent, or a dashed outline. Defaults: N narrator, R reader, X silent. Another code is a narrator. |
| `lang` | BCP 47 tag | The language of the voice's words, set as `lang` on them. A reader without one takes its film's `lang`. |

A film:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | The section's anchor and the prefix of its lines' anchors (`#<id>-<n>`). Default `film-<position>`. |
| `title` | string | The heading and the label in the film list at the top. |
| `native` | string | The film's title in its own language, shown beside the heading. |
| `lang` | BCP 47 tag | The language of `native` and of a reader's lines, such as `zh-Hant` or `he`. |
| `length` | number | The film's length in seconds: the timeline's scale and the figure in the film list. Default: the latest end among the lines. |
| `meta` | string | The line under the heading. Default: the length and the number of lines. |
| `story` | string or array of strings | The story in one paragraph or several. |
| `shape` | array of `{ "beat", "lines" }` | The film's beats and where each one falls, such as `{ "beat": "Hook", "lines": "lines 1 and 2" }`. |
| `voices` | object | Voice fields for this film only, laid over the page's `voices` field by field. |
| `lines` | array of lines | The film's lines in order. |
| `notes` | array of notes | The lists after the lines. |

A line holds the fields of a film's `script.json` and its times:

| Field | Type | Meaning |
| --- | --- | --- |
| `n` | number or string | The line's number, or a short label such as "Close". Bars show number labels only. Default: the line's position. |
| `who` | string | The voice code. Default N. |
| `start` | number | Where the line starts, in seconds from the film's start. When it is absent the page reads `at`, the start a `script.json` records from the film itself. |
| `end` | number | Where the line ends, in seconds. A line with a start and an end gets a bar on the timeline, and every line gets a row. |
| `said` | string | The words. A line with no voice shows its words, or the voice's label, in grey. |
| `sub` | string or null | The subtitle of a line in another language. |
| `screen` | string | What is on screen during the line. |

A note:

| Field | Type | Meaning |
| --- | --- | --- |
| `heading` | string | The list's heading, such as "What changed from the last cut". |
| `items` | array of strings | The list. |
| `callout` | boolean | Draws the list in a box. Use it for the decisions the reviewer has to make. |

## Voices JSON

The top level:

| Field | Type | Meaning |
| --- | --- | --- |
| `title` | string | The page heading and the tab title. Default "Narrator auditions". |
| `intro` | string or array of strings | The paragraphs under the heading. |
| `links` | array of `{ "label", "href" }` | Links under the intro, resolved as on the script page. |
| `sample` | string or array of strings | The text every voice reads, in a box headed "What each voice reads". |
| `modes` | array of `{ "id", "label" }` | The ways to hear a take, in the switch's order. The first is selected when the page opens, and the switch is drawn when there are two or more. Default: the keys of the first voice's `takes`. |
| `groups` | array of `{ "id", "label" }` | The headings the voices sit under, in order. A group that a voice names and the list leaves out follows the listed ones, headed by its id. Voices without a group sit under no heading. |
| `voices` | array of voices | Required. One row per voice, in order within each group. |
| `notes` | string or array of strings | The paragraphs at the foot of the page, such as what the figures measure. |

A voice:

| Field | Type | Meaning |
| --- | --- | --- |
| `n` | number or string | The number before the name, and the row's anchor (`#voice-<n>`). Default: the voice's position. |
| `name` | string | The voice's name. |
| `group` | string | The `id` of the voice's group. |
| `description` | string | One line about the voice. |
| `pace` | number | Words a second, shown with two decimals. |
| `steadiness` | number | A percentage, shown with two decimals. |
| `pick` | string | A recommendation, shown as a tag in the accent, such as "First pick". |
| `current` | boolean | Adds a "Current" tag to the voice the films use now. |
| `takes` | object | Each mode's `id` mapped to the take's path, relative to the JSON file. |

## What the pages do

The script page draws each line that has a start and an end as a bar on its film's timeline, to scale: the narrator in grey, a reader in the accent, a line with no voice as a dashed outline. A bar's label is its line's number. Clicking a bar jumps to its line and marks it. The film list at the top stays in view and jumps to each film. Below 560 px wide the time column moves above the words.

The voices page plays every take through one audio element, so starting a voice stops the voice before it. A voice's button plays and pauses its take, and the rule under the voice shows how far the take has played. The switch picks the mode, and changing it during a take continues the same voice's other take at the same time. The page fetches each take whole before it plays it, because a Blob is seekable on any static server and a server without Range requests, such as python's, leaves a file unseekable. A take that does not load, or that the browser cannot decode, is reported in the now-playing line, and its button returns to play.

## How a film round fills the JSON

Keep a round's JSON and audio in a folder that stays local, such as `motion/review/<round>/`, because a round's scripts, takes and open decisions are drafts. Under motion/ the `.gitignore` allowlist tracks only MOTION.md, kit/, films/ and stills/. Keep the audio out of the repository.

For the script page:

1. Start each film from its `script.json`, the reviewed script that `kit/script-export.py` also reads: `title`, `story`, and `lines` with `n`, `who`, `said`, `sub` and `screen`. The page reads those fields as they are.
2. Add the film's `id` and `length`, and each line's `start` and `end` in seconds. Before the final cut the times are estimates, such as the takes laid end to end with the planned gaps. After a render, `kit/script-export.py` places each line from the film's own audio.
3. For a film with a title in another language, add `native` and `lang`. A reader's lines take that `lang`. A voice that needs a label of its own, such as "Mandarin reader", goes in the film's `voices`.
4. Write the beats into `shape`. Write what changed since the last cut as a note, and the decisions the reviewer has to make as a note with `callout: true`.
5. Put all of the round's films in one file's `films`, and link the round's auditions page from `links` when there is one.

For the voices page:

1. Write one entry per voice, with `n`, `name`, `group` and `description`, in the order the page lists them.
2. When each take exists dry and mixed over the film's bed, the modes are `dry` and `music`, and each voice's `takes` names both files.
3. Measure `pace` as words a second at the voice's natural speed, and `steadiness` as the median frame-to-frame pitch change in percent, where lower is steadier. State both definitions in `notes`.
4. Give the recommendation as `pick`, and mark the voice the films use now with `current: true`.

## Smoke test

```sh
node motion/kit/review/smoke.mjs                 # from the repository root
node motion/kit/review/smoke.mjs --shots <dir>   # also saves screenshots to <dir>
```

The test serves motion/ on a free port with a small `node:http` server and opens both pages with their samples in headless Chrome: dark and light at 1280 x 900, and dark at 390 x 844. It fails on a console error or a page error; on rows, bars, players or switches that differ from the samples' counts; on a heading or text that differs from the samples; on a stringified value such as "[object"; on a sideways scroll; and when a timeline bar, a play button or the mode switch does not respond. A 404 for the kit's `tokens.css` or fonts, or for a take the sample names, is expected and printed as a note. It imports `playwright-core` from the repository's node_modules and launches the Chrome for Testing build that `pnpm exec playwright-core install chromium` installs, or the browser at `CHROME_PATH`. It exits 0 on a pass, 1 on a failure and 2 when there is no browser.
