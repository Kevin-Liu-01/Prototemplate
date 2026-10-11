# blog-fuma-nama: the script (round 7)

The trailer for "Fuma Nama: The philosophy of an open-sourcerer". This script was written from scratch from the post, the brand and the kit. The winning treatment is r7-viewer (`motion/concepts/blog-fuma-nama/r7-viewer/`), with the judge's fixes below. The earlier script was moved, unread, to `SCRIPT-r6a.md`.

**Read the last two sections first.** The film as made follows "Round 7b changes" and "Round 7d" at the end of this file: 8 lines and 113 spoken words, narrated by Clara at speed 1.0 over round 5's music bed. The summary bullets, the Timing and the Sound sections below are round 7's first plan (6 lines, 83 words, Patrick at speed 0.85, a Music API bed) and are marked superseded. The Lines table, the heading sources, the pronunciation notes and the audit still hold.

- **Story:** Fuma Nama learned to code by reading code instead of documentation, and he went on to build Fumadocs, a documentation framework that any developer can take apart and reshape.
- **Words (superseded: now 113 words in 8 lines, see Round 7b):** 83 spoken words in 6 lines, then a silent end card.
- **Excerpt share:** 67 of 83 words are verbatim from the post (0.807). The 16 connecting words are line 3 (13 words) and the attribution "said Fuma Nama" in line 1 (3 words). The "said Fuma" in line 6 is the post's own attribution and counts as excerpt.
- **Estimated length (superseded: the film runs 54.0 s, see STORYBOARD.md):** 36.1 s of speech at 2.3 words a second. The film runs 44.5 s: six lines from 0.0 to 40.0 s, then the end card from 40.0 to 44.5 s.

## Lines

| n | spoken text | heading | source sentence (fuma-nama.mdx) |
| --- | --- | --- | --- |
| 1 | “I learned to code from files,” said Fuma Nama. | A huge pile / of JavaScript | “It’s kind of crazy. I learned to code from files. Like I would see a huge pile of JavaScript and read that,” he said. The second sentence is spoken whole. Its period becomes a comma before the attribution, and "said Fuma Nama" is connecting text. |
| 2 | “I didn’t look at any kind of documentation, just the code itself.” | The primary / source | “I didn’t look at any kind of documentation, just the code itself.” The whole sentence is read as Fuma's quote, continuing line 1 in the first person, as it does in the post. |
| 3 | He went on to create Fumadocs, which developers use to make documentation sites. | Four modular / layers | Connecting line. Its facts come from “We’re excited to announce our first grantee project: Fumadocs, created by Fuma Nama.” and “Fumadocs is a beautiful and flexible React documentation framework.” |
| 4 | Fumadocs is built to be a docs framework you can break. | Less magic | “In the Philosophy section of the Fumadocs documentation, Fuma defines the core thesis: Fumadocs is built to be a docs framework you can break.” The clause after the colon is spoken, which also drops the linked words. |
| 5 | By “breakable,” he refers to the ability for a developer to take apart and reshape any piece of the framework. | Building / blocks | “By “breakable,” he refers to the ability for a developer to take apart and reshape any piece of the framework.” The whole sentence, which follows line 4's sentence in the post. |
| 6 | “Even if I started again from scratch, I think Fumadocs would probably be the same shape,” said Fuma. | Designed / to be that way | “Even if I started again from scratch, I think Fumadocs would probably be the same shape,” said Fuma. The whole sentence with the post's attribution. The hedges “I think” and “probably” are kept. |
| 7 | Fumadocs has since grown to over 13,000 stars on GitHub, and is used by companies like Vercel, Unkey, Orama, and yours truly. | Each site looks / vastly different | “Fumadocs has since grown to over 13,000 stars on GitHub, and is used by companies like Vercel, Unkey, Orama, and yours truly.” (the whole sentence) |
| 8 | Fumadocs is General Translation’s first grantee project. | Software for / the public good | Connecting line, from “We’re excited to announce our first grantee project: Fumadocs, created by Fuma Nama.” |

### Heading sources

| n | heading | size | source in the post |
| --- | --- | --- | --- |
| 1 | A huge pile / of JavaScript | 140 px | “Like I would see a huge pile of JavaScript and read that,” he said. |
| 2 | The primary / source | 140 px | By going directly to “the primary source” (albeit accidentally), Fuma came to understand the bare bones cognitive principles at a deep level. |
| 3 | Four modular / layers | 150 px | “The framework has four modular layers: Core, Content, UI, and CLI.” |
| 4 | Less magic | 150 px, one line | Fumadocs is thus a less magic, less opinionated framework. |
| 5 | Building / blocks | 140 px | Each library is a set of “building blocks” which expose how they work, giving developers the ability to modify and create docs exactly the way they want. |
| 6 | Designed / to be that way | 120 px | It’s a framework which can be truly broken, and which has been meticulously designed to be that way. |
| 7 | Each site looks / vastly different | 130 px | “It’s a testament to Fumadocs’ composability that each site looks vastly different.” |
| 8 | Software for / the public good | 130 px | The post's callout: “We’re now supporting other open-source developers who build and maintain software for the public good”. |

All headings are Inter 500 through `var(--font)`, in sentence case, with no trailing period. None runs past two lines. None shares a content word with the line spoken under it.

## Timing (round 7's first plan, superseded: the times are STORYBOARD.md's, from Clara's takes)

| n | scene | voice (planned) | key word |
| --- | --- | --- | --- |
| 1 | 0.0 to 5.0 s | 0.5 to 4.4 s | files, about 3.1 s |
| 2 | 5.0 to 11.0 s | 5.4 to 10.6 s | itself, about 10.4 s |
| 3 | 11.0 to 17.0 s | 11.3 to 17.0 s | Fumadocs, about 13.9 s |
| 4 | 17.0 to 22.5 s | 17.4 to 22.2 s | break, about 22.0 s |
| 5 | 22.5 to 31.5 s | 22.8 to 31.5 s | reshape, about 29.3 s |
| 6 | 31.5 to 40.0 s | 32.0 to 39.8 s | shape, about 39.0 s |
| 7 | 40.0 to 44.5 s | none | the end card |

Scene changes sit on the 0.5 s beat grid. Generate one take per line, place it at its planned start, and retime each key action to the take's `.json` character timings. Lines 3 and 5 end on their cuts in this plan. If a take runs long, push the following scene to the next beat and lengthen the hold. Never speed up the audio. The film may grow to 45.0 s at most, which leaves 0.5 s of slack. The end card can give up another 0.5 s, because its title needs only 3.33 s after it has fully arrived.

## Sound (round 7's first plan, superseded by Round 7d below)

- **Narrator:** `kit/audio/voice.json`, which names Patrick (Australian, ElevenLabs library), eleven_multilingual_v2, stability 0.7, style 0.05, speed 0.85. Generate each line separately with `el.mjs line`, passing `--prev` and `--next`. Check the names in each take with `el.mjs hear`.
- **Music:** one bed from the Music API (`el.mjs music`, 44.5 s, instrumental) with a fire prompt: warm, dark and slow, with a low pulse and no drums, drops or risers. Duck it about 10 dB under each line and let it resolve under the end card with a 0.8 s fade from 43.7 s.
- **Mix:** the narrator at about -16 LUFS integrated, the bed at about -26 LUFS under speech, and true peak below -1 dBTP.

## Pronunciation

- **Fuma Nama:** FOO-mah NAH-mah, two words, each stressed on its first syllable.
- **Fumadocs:** FOO-mah-docks, one word, stressed on FOO. If a take splits it oddly, send "Fuma docs" in that line's request text only. The script and the screen keep "Fumadocs".
- **docs** (line 4): "docks".
- **breakable** (line 5): BRAY-kuh-bul. Keep the post's quotation marks in the request text so the voice sets the word apart, with a short pause at the comma after it.
- **Quotes:** lines 1, 2 and 6 are Fuma's own words. Line 2 continues line 1's quote in the first person. Read the attributions "said Fuma Nama" and "said Fuma" lower and quicker than the quote. Lines 3, 4 and 5 are narration, read plainly.
- **General Translation** is not spoken. It appears only as the GT mark on the end card.

## Audit

The judge checked every excerpt and heading against `apps/landing/content/blog/en-US/fuma-nama.mdx` by exact string match, with curly quotes as published. Each spoken excerpt (lines 1, 2, 4, 5 and 6) matches the post once. Each heading phrase matches, and the title matches the frontmatter. No drift was found and no wording was changed. No two adjacent lines share a two-word phrase. No spoken line contains an em dash, a parenthesis, an exclamation mark or a question mark. The only connecting sentence, line 3, is a complete declarative sentence with a short subject and its relative clause at the end. It uses no metaphor, contrast pair, triad, signpost or hype.

## Changes after judging (orchestrator, 2026-10-02)

- Line 3's heading is "Four modular / layers" (the post: "The framework has four modular layers: Core, Content, UI, and CLI."). "The moon, Luna" needed the post's context to make sense, and line 4 cuts the moon into four layers right after it.
- Line 7, the end card, now carries one connecting line: "Fumadocs is General Translation’s first grantee project." (from "We’re excited to announce our first grantee project: Fumadocs"). A trailer for the General Translation blog has to say why General Translation tells this story. The script is now 90 words with 67 excerpt words (0.74), and the film runs about 47 to 48 s: the end card's title arrives with the line and holds at least 3.4 s after its last word.

## Round 7b changes (Kevin, 2026-10-02; these override everything above where they differ)

Kevin: "for the designing docs and fuma we want to add links at end, and we want to make a consistent end card after videos that also adds link. for fuma, mention the teams that fumadocs is used by with their logos and stars. ... also make the voice more australian and make the voice less shaky".

- **Line 7 (new): the adopters.** "Fumadocs has since grown to over 13,000 stars on GitHub, and is used by companies like Vercel, Unkey, Orama, and yours truly." (verbatim). The picture shows the teams that use Fumadocs, each by its true logo with its GitHub star count, and Fumadocs' own count largest. The post names Vercel Turborepo, shadcn/ui, BetterAuth, Unkey, Orama and General Translation ("yours truly"). Counts read from the GitHub API on 2026-10-02: fuma-nama/fumadocs 13,283; shadcn-ui/ui 124,997; vercel/turborepo 31,159; better-auth/better-auth 30,152; oramasearch/orama 10,569; unkeyed/unkey 5,456; generaltranslation/gt 1,065. Show them rounded as GitHub does (13.3k, 125k, 31.2k, 30.2k, 10.6k, 5.5k, 1.1k) with a star glyph. Logos are in `kit/logos/adopters/` (thesvg marks for Vercel, Turborepo, shadcn/ui, Better Auth and GitHub; the Unkey and Orama GitHub organization avatars, which are their logos) and the GT mark in `kit/brand/`.
- **Line 8: the grant.** "Fumadocs is General Translation’s first grantee project." with its own picture (Fumadocs and General Translation together, the moon and the GT mark), heading "Software for / the public good".
- **The end card is the shared series end card** (`kit/endcard/`), after the narrative and silent (the music resolves under it): the GT mark in this film's fire gem smoke, the title in two lines, and the link `generaltranslation.com/blog/fuma-nama`. The old line 7 end card is replaced by it.
- **Words:** 113 spoken words in 8 lines, 90 of them verbatim (0.80). The film runs about 55 to 60 s including the end card.
- **Narrator:** `kit/audio/voice.json` now names the Australian Baritone at stability 0.85, style 0, speed 1.0. Never slow the voice with --speed below 1.0: the slowed takes measured the most pitch wobble. Calm comes from the gaps between lines.

## Round 7d (Kevin, 2026-10-02; the spoken words above are unchanged)

Kevin: "for the blogs i liked the peaceful music from before and make the narration a much more friendly australian voice", then, after the auditions, "like 2 but more female", and "lets use clara".

- **Narrator:** `kit/audio/voice.json` now names Clara (Australian, warm and friendly; eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0). Every line was re-recorded with her at those settings, one request per line with `--prev` and `--next` only, the text exactly as above. The film's timing comes from her takes (`STORYBOARD.md`, round 7d).
- **Music:** the Music API bed is replaced by round 5's bed (`audio/archive-r6a/bed.mp3`: a low drone, a slow pulse and sparse low piano), built to the film's length by `lib/make-bed.mjs`.
- **Vercel** (line 7): ver-SELL, stressed on its second syllable, as the company says it. Clara's first take of line 7 said "VER-sl" (the first syllable 4 dB louder, the second vowel reduced), so line 7 was retaken once with the name respelt "Ver-sell" in the request text only. The script, the screen and the take's word table (`lib/cues.mjs` joins the respelt parts back into "Vercel") keep "Vercel". The retake's second syllable is the longer one and carries the rise, with a full DRESS vowel (F1 about 550 Hz, F2 about 1700 Hz). The first take is `audio/archive-r7d/vo-7.mp3`.
- **Unkey and Orama** (line 7): kept as Clara says them. The transcriber writes "Anki" and sometimes "Arama" for her Australian vowels; each mark rises on its name, so the picture names them.
