# blog-fuma-nama: the script, version 3 (the build spec)

The trailer for "Fuma Nama: The philosophy of an open-sourcerer" (`apps/landing/content/blog/en-US/fuma-nama.mdx`, Taylor Fang, September 3, 2026). It replaces SCRIPT-v2.md, whose build was stopped. SCRIPT.md (round 7d, the words of the current cut) and SCRIPT-v2.md stay unchanged as records. The build writes a new STORYBOARD.md from the narrator's takes of these lines (Frederick Surrey since 2026-10-06; see the voice).

Kevin, 2026-10-06, on the v2 scripts: "we need to convey the gravitas better earlier. vercel is pronounced with the ver of version and cel of acceleration. shadcn is like the shad of shaddy. for both the new videos keep all the visual spectacle, i would hate to see removals. make the script not driven by quotes but tell its own story."

**Story, in one sentence:** one developer, Fuma Nama, created Fumadocs, a docs framework with over 13,000 GitHub stars that Vercel Turborepo, shadcn/ui, Better Auth, Unkey and many others use, and built it for three years on top of his schoolwork; he learned to code by modding games and reading code, and he did not read documentation; he designed Fumadocs in four layers that developers can take apart, down to copying only the table of contents into their own code; he thinks he would build it the same shape again, and General Translation has made it its first open-source grantee.

## How this script was chosen

Three writers each wrote a v3 script from a different angle: A, stakes first; B, the maker; C, cause and effect. Before scoring them I built a spectacle inventory of the current cut and of the v2 shot list:

- I watched `out/blog-fuma-nama.mp4` (round 8, 54.0 s) as 108 frames at 0.5 s.
- I read STORYBOARD.md, CONCEPT.md, SCRIPT.md, NOTES.md (round 8 removed only the series frame), the scene comments in `index.html` and `lib/cues.mjs`.
- I read SCRIPT-v2.md, including its shot list, its "Visual changes", its removed list (now reversed) and its opener change.

The inventory is the spectacle map below. Then I checked every script against it and every fact against the post. Each score is out of 10.

| script | gravitas early | own story | clear | pace | faithful | writing rules | spectacle kept | total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A, stakes first | 9 | 9 | 8 | 8 | 8 | 9 | 9 | 60 |
| B, the maker | 8 | 8 | 7 | 8 | 9 | 8 | 8 | 56 |
| C, cause and effect | 7 | 6 | 6 | 7 | 7 | 7 | 6 | 46 |

**A wins.** Its first words are "One developer". The heading of those words breaks into the Fumadocs moon, the moon slides over to become the shelf's moon, 13.3k tallies on "stars", and Vercel Turborepo's mark lights at 6.8 s. The narration has nine plain sentences of its own, with zero quotes and no "he said". Its map gives every current-cut piece and every v2 piece a line to serve. Its two hardest conflicts are solved in a way that serves the story:

- The moon breaking shows the framework built to be taken apart, and the page breaking shows the CLI copying one part of it.
- The current cut's reassembly and glyph moon become the literal picture of "started again from scratch ... the same shape".

What A lost points for:

- **Line 4 narrows how he learned.** "He learned to code by reading JavaScript files." The post says he learned "through modding videogames and reverse engineering", picked up C# that way, and then gives his own summary, "I learned to code from files. Like I would see a huge pile of JavaScript and read that."
- **Line 6 lands its two biggest events on "so" and "that".** "He built Fumadocs so that developers can take it apart and reshape it." The crosses draw on "so" and the moon turns to print on "that", so the picture never meets the four layers in the words.
- **Its timing runs short in three places.**
  - Line 1 has no comma pause after "Fumadocs" (Clara's comma pauses run 0.26 to 0.68 s), so the line runs about 0.35 s longer than planned.
  - The wordmark leaves at 4.10, before its 1.33 s reading floor ends. Its own 0.4 s rise from 2.6 sets it at 3.0, so the floor ends at 4.33.
  - Line 9 is planned at 3.95 s, but the stopped v2 take of the same eight words measures 4.10 s.
- **Line 8 drops "probably".** It keeps "he thinks", so the view stays hedged, but it loses the post's second hedge.

B is the same skeleton with Fuma's name in place of "One developer". A stranger does not know the name, so the number carries less weight. Its line 4 is the most accurate account of how he learned, and its line 6 speaks the four layers on the picture of the four layers. Its weak lines are line 7, "It can copy one part", where "It" and "one part" are vague, and line 8, "a rebuild from scratch would probably have the same shape", which never says what is rebuilt. Line 5's "X, without Y" is close to the banned contrast form. Its map also misses v2's "Into your codebase" heading.

C shows the number fastest: 13,000 counts up inside the hook heading by 2.4 s. But the film does not say what Fumadocs is until 23 s, so the number has nothing to belong to. Its spine is the post's own sentences said as narration:

- Line 6 is the post's thesis word for word.
- Line 4 uses "a huge pile of JavaScript".
- Line 5 uses "the code itself".
- Line 9 is "each site looks vastly different", introduced by "That is why". That phrase claims a cause the post states more broadly (composability), and it points back 30 s to sites the viewer never saw.

C runs at the 50.0 s cap with no slack. It drops four round 7d headings ("The primary source", "Designed to be that way", "Software for the public good" and the full "Each site looks vastly different") and v2's "On top of his schoolwork". Its one strong idea, the shelf's GT column left dark until the grant, would cost A's early pulse that ties the GT mark to the moon.

### Grafts into A

1. **Line 4 from B:** "He learned to code by modding games and reading piles of JavaScript." It is the post's account (modding videogames, then "a huge pile of JavaScript"). The heap's crest now lands on "JavaScript".
2. **Line 6 from B:** "He designed Fumadocs in four layers that developers can take apart and reshape." The crosses draw on "four", the glass turns to print on "layers" and the seams cut the disc on "that developers", so the four layers are said while they are drawn.
3. **The Vercel audition order from B and C.** Plain "Vercel" goes first, then "Vur-sell", and the build never starts with "Ver-sell". Round 7d's retake and the stopped v2 list take both used "Ver-sell", and those are the readings Kevin's note answers. B's "Shadd C N U I" is the shadcn fallback.

### Fixes to A

1. **Line timing** is re-planned from Clara's measured words, comma pauses included. Every cut falls in a gap on the 0.5 s beat, and the gaps are 0.25 to 0.35 s.
2. **The wordmark** holds its 1.33 s floor (set 3.15, leaves 4.50).
3. **Line 9** is planned at its measured 4.10 s.
4. **Line 8** keeps A's "he thinks" and leaves out "probably" for length (see "Decisions for Kevin").
5. **The bed's fourth join** moves out of line 8's comma pause.
6. **Line 9 may reuse the stopped v2 take** of the same words (see the voice).

## Length and pace

| | |
| --- | --- |
| Length | 49.5 s at 60 fps, 1920 x 1080: 45.5 s of story and the 4.0 s shared end card. The current cut runs 54.0 s, and v2 planned 42.0 s. The cap is 50.0 s. |
| Words | 106 in 9 lines. No quotes. |
| Speech | About 42.5 s, from 0.25 to 44.82. That is 106 words at 2.50 words a second, close to her measured 2.55. |
| Gaps | 0.25 to 0.35 s between lines. The bed is heard alone for 0.25 s before the first word. The last word ends 0.68 s before the card, so the grant's pulse lands first. |
| Cuts | All cuts are on the 0.5 s beat: 0, 18.0, 22.0, 25.5, 31.0, 35.5 and 40.5, with the card at 45.5. Shot 1 has no cut for 18 s, and something in it moves on a word every 0.3 to 3.0 s. |
| Picture | A new event lands on a spoken word at least every 3.0 s. The longest hold is 14.3 to 17.3 under "On top of his schoolwork", which is that heading's reading floor. |
| Headings | Twelve type moments. They are all eight round 7d headings, plus v2's "Fumadocs" wordmark, "On top of his schoolwork" and "Into your codebase", plus the new hook "One developer". Each rises out of its mask (expo.out 0.4, lines 60 ms apart, 0.067 s before a cut when it arrives on one) and holds at least (words / 3) + 1 s after it is set. |
| Pace basis | Clara's round 7d takes (`audio/vo-1` to `vo-8`): 113 words in 44.4 s of speech, 2.55 words a second. Her plain sentences run 15.6 to 18.2 characters a second, and her comma pauses run 0.26 to 0.47 s, with 0.68 s after "scratch," in vo-6. These measured words are used directly: "Fumadocs" 0.48 to 0.70 s, "13,000" 1.01 s, "stars" 0.41 s, "GitHub" 0.46 s, "documentation" 0.72 to 0.91 s, "developers" 0.54 s and "take apart and reshape" 2.3 s. The stopped v2 takes (`audio/archive-v2-stopped`) are a reference only, for the respelt list ("Ver-sell Turborepo" 1.42 s, "shad C N U I" 1.61 s, "Better Auth" 0.64 s, "Unkey" 0.57 s, Vercel to "others" 6.67 s), "Fuma Nama" (0.66 s), "on top of his schoolwork" (1.26 s) and line 9 (4.10 s). |

## The voice

Updated for the build on 2026-10-06. Kevin: "remember, we're using Frederick Surrey". The section as first written named Clara and planned every time at her pace; that version is `archive/SCRIPT-v3-clara.md`. The planned times in "The lines" below are still Clara-pace estimates; the build placed Frederick's takes by their own `.json` timings, and STORYBOARD.md holds the measured times.

- **Narrator:** Frederick Surrey, from `kit/audio/voice.json` (j9jfwdrw7BRfcR43Qohk, eleven_multilingual_v2, stability 0.55, style 0.2, speed 1.0), the narrator of every GT film. No `EL_VOICE_FILE` and no `--voice`. Every take's `.json` "voice" starts with "Frederick Surrey". Never use a speed below 1.0, never speed a take up, and never time-stretch one.
- **Takes:** nine requests, one per line, with `node kit/audio/el.mjs line`, passing `--prev` and `--next` with the neighbouring v3 lines in their voice text. Line 1 has no `--prev`, and line 9 has no `--next`. The request text is the line as written, except for the respellings below. At most two takes per line unless a take is mis-said.
- **His pace:** about 2.75 words a second against Clara's 2.55. The nine takes run 38.5 s of speech against the 42.5 s planned here, so the gaps (0.44 to 0.55 s) and the open (line 1 at 0.50 s) absorb the difference, and "probably" returns to line 8 under "If the takes run long or short".
- **Line 9:** a new take. The stopped v2 take of the same words is Clara's.
- **Archive first:** the round 7d takes go to `audio/archive-r7d-final/` (it already holds identical copies of all eight). Rejected takes and the audition go to `audio/takes-v3/`.
- **Credit check:** run `el.mjs hear` on every take and on the final, and require all the words in order.

### Pronunciation

- **Vercel** (line 2). Kevin's note gives the two syllables: the "ver" of "version", the NURSE vowel /ɜː/, and the "cel" of "acceleration", a full DRESS vowel before the dark l, never reduced to "sl". Stress it as the company says it, ver-SELL.
  - Audition order: plain "Vercel", then "Vur-sell", then "Vursell". Do not lead with "Ver-sell".
  - One short audition request, "Version. Acceleration. Vercel.", gives his own "version" and "acceleration" vowels to measure the takes against.
  - Keep the first take whose two vowels match "version" and "acceleration" and that `el.mjs hear` writes as "Vercel".
- **shadcn/ui** (line 2). Send "shad C N U I" from the first take (a test take of Frederick heard plain "shadcn" as "Shadikn"). "shad" has the vowel of "shaddy" and "had", /ʃæd/, then the letters C and N and then U and I. If "shad" comes back as "shard", "shade" or "shed", send "Shadd C N U I".
- **Better Auth** (line 2). Send "Better Auth" (the post writes "BetterAuth").
- **CLI** (line 7). Send "C L I", three letters.
- **Fuma Nama:** FOO-mah NAH-mah, two words. Send "Fuma Nahma" only if "Nama" fails.
- **Fumadocs:** FOO-mah-docks. Send "Fuma docs" only if a take splits the word oddly.
- **Unkey:** UN-key. The mark rises on the name.
- **`lib/cues.mjs` RESPELL** joins the respelt parts back into the names: `'Vursell': 'Vercel'` (and the other Vercel forms), `'shad C N U I': 'shadcn/ui'` and `'C L I': 'CLI'`. The screen, the CUE table and this script keep the real names.
- **Line shapes:**
  - Line 1 is one sentence with a comma pause after "Fumadocs" and its weight on "13,000".
  - Line 2 is a list with short pauses between names and a fall on "use it".
  - Line 8 has a comma pause after "scratch".

### What the build recorded (2026-10-06)

- Line 2, take 1 (plain "Vercel"): "Ver" is his "version" vowel (F1 400 to 480 Hz, F2 1330 to 1400), but "cel" has no vowel: F1 270 to 320 and F2 820 to 970, a syllabic dark l, "VER-sl". The audition's plain "Vercel" did the same. Mis-said.
- Line 2, take 2 ("Vur-sell"): "sell" has his "acceleration" vowel (F1 460 to 590, F2 1400 falling into the l; his "acceleration" measures F1 480 to 670, F2 1520 falling), but "Vur" opens on a rounded vowel (F2 1010 to 1190 for 0.08 s before it reaches 1300). Mis-said on its first syllable.
- Line 2, take 3 ("Vursell"), kept: "Vur" F1 about 400, F2 1280 to 1460 from its onset (his "version" vowel); "sell" F1 460 to 535, F2 1420 falling to 900 into the l, 0.14 s voiced; the pitch peaks on "sell" (133 Hz against 106 on "Vur"), so the stress is ver-SELL. `hear` writes "Vercel", "ShadCNUI", "BetterAuth" and "Unkey". "shad" is the TRAP vowel (F1 610 to 750, F2 1495 to 1550).
- Line 8, take 2, kept: "If he started again from scratch, he thinks Fumadocs would probably have the same shape." Take 1 (without "probably") is in `audio/takes-v3/`.

## The lines

The times are planned from Clara's measured pace. The build retimes every event to each take's `.json` word times through `lib/cues.mjs`, as now. A word in quotation marks in the picture column is the spoken word the event lands on.

| n | planned | said (voice text where it differs) | source (fuma-nama.mdx, link markup removed) | picture: what moves on which word |
| --- | --- | --- | --- | --- |
| 1 | 0.25 to 6.50 | One developer created Fumadocs, a docs framework with over 13,000 stars on GitHub. | "We’re excited to announce our first grantee project: Fumadocs, created by Fuma Nama." / "Fumadocs is built to be a docs framework you can break." / "Fumadocs has since grown to over 13,000 stars on GitHub" (13,283 from Kevin, shown 13.3k) | Shot 1. "One developer" stands alone over the field, and "One" turns fire. At the end of "Fumadocs" the heading breaks into cells that land as the moon's print. On "docs framework" the print turns to glass and the wordmark rises. During "13,000" the wordmark leaves and the moon slides to the shelf. 13.3k tallies onto "stars". On "GitHub" the rule draws. |
| 2 | 6.80 to 13.85 | Vercel Turborepo, shadcn/ui, Better Auth, Unkey and many others use it. (voice: "Vercel Turborepo, shad C N U I, Better Auth, Unkey and many others use it.") | "Fumadocs is used by Vercel Turborepo, shadcn/ui, BetterAuth, Unkey, and many others." / "used by companies like Vercel, Unkey, Orama, and yours truly" / "General Translation uses Fumadocs for our own documentation" (counts from Kevin) | No cut. Each mark and its count light on a name: Turborepo on "Vercel", shadcn/ui on "shad", Better Auth on "Better", Unkey on "Unkey", Orama on "many" and the GT mark in fire on "others". "Each site looks / vastly different" rises on "Better". On "use" a fire pulse runs the rule from the GT mark to the moon. |
| 3 | 14.10 to 17.86 | Fuma Nama has built it for three years, on top of his schoolwork. | "Over the past three years, Fuma Nama has continued building and maintaining the framework, investing hundreds of hours on top of his schoolwork and other obligations." | No cut. Over the full shelf, "On top of / his schoolwork" rises where "One developer" stood. On "schoolwork" that word turns fire, as "One" did. Hard cut at 18.0. |
| 4 | 18.11 to 21.88 | He learned to code by modding games and reading piles of JavaScript. | "Instead, he learned to code through modding videogames and reverse engineering." / "“It’s kind of crazy. I learned to code from files. Like I would see a huge pile of JavaScript and read that,” he said." | Shot 2, the heap, under "A huge pile / of JavaScript". The glyph rain falls from the cut and condenses base first through "modding games and reading piles of". The last glyphs settle on the crest on "JavaScript". Hard cut at 22.0. |
| 5 | 22.13 to 25.32 | He did not look at any documentation while he was learning. | "“I didn’t look at any kind of documentation, just the code itself.”" / "By going directly to “the primary source” (albeit accidentally), Fuma came to understand the bare bones cognitive principles at a deep level." | Shot 3, under "The primary / source". The small docs page builds on the cut, and its table of contents steps on "look". On "documentation" the page dissolves into the field. On "while" the file lights top to bottom, and its lit band crosses the middle block on "learning". Hard cut at 25.5. |
| 6 | 25.57 to 30.84 | He designed Fumadocs in four layers that developers can take apart and reshape. | "The framework has four modular layers: Core, Content, UI, and CLI." / "It’s a framework which can be truly broken, and which has been meticulously designed to be that way." / "By “breakable,” he refers to the ability for a developer to take apart and reshape any piece of the framework." | Shot 4, the big moon. It lights from black, fully lit on "Fumadocs". Crosses draw on "four", the glass turns to print on "layers", and three seams cut it into four layers on "that developers". The layers part on "take" and spread on "apart", with the slot outline. The third layer slides out and squares off into a block on "reshape", joined back by a connector. Hard cut at 31.0. |
| 7 | 31.09 to 35.43 | The CLI can copy just the table of contents into your codebase. (voice: "The C L I can copy just the table of contents into your codebase.") | "The CLI works per component and can go even finer, pulling a single slot of a layout (for example, only the table of contents)." / "and can copy UI components directly into your codebase via the CLI." | Shot 5, under "Less magic", then "Into your codebase". The full docs page is cut by a seam on each letter, "C", "L" and "I", and its parts move apart on "copy". The page shrinks and a code panel draws on "just". The table of contents lifts on "table", and its connector draws on "contents". It travels, the rows open on "into", and it seats on "codebase". A sun block then runs down it. Hard cut at 35.5. |
| 8 | 35.68 to 40.37 | If he started again from scratch, he thinks Fumadocs would have the same shape. | "“Even if I started again from scratch, I think Fumadocs would probably be the same shape,” said Fuma. It’s a framework which can be truly broken, and which has been meticulously designed to be that way." | Shot 6, back to the parted moon, under "Designed / to be that way". On "started" the pieces return to the circle. On "scratch" the print leaves. The glyph moon refills the same circle row by row, and its last row lands on "shape". Hard cut at 40.5. |
| 9 | 40.72 to 44.82 | Fumadocs is General Translation’s first open-source grantee. | "We’re excited to announce our first grantee project: Fumadocs, created by Fuma Nama." / the callout title "About General Translation Open-Source Grants" | Shot 7, the grant, under "Software for / the public good". The moon lights on "Fumadocs", and the GT mark forms in its end card place on "General". The connector draws on "first". A fire pulse runs into the moon on "grantee", and the moon flares. Hard cut to the card at 45.5. |

### Planned word times (the cues)

These come from Clara's measured words. The build replaces them with the new takes' times.

| line | key words (film seconds) |
| --- | --- |
| 1 | One 0.25, developer 0.53, created 1.07, Fumadocs 1.57 to 2.23, (pause), a 2.68, docs 2.82, framework 3.23 to 3.72, with 3.80, over 4.02, 13,000 4.28 to 5.29, stars 5.36 to 5.77, on 5.87, GitHub 6.04 to 6.50 |
| 2 | Vercel 6.80, Turborepo 7.41, shad 8.64, C 9.09, N 9.51, U 9.78, I 10.01, Better 10.77, Auth 11.10, Unkey 11.74, and 12.63, many 12.85, others 13.10, use 13.47, it 13.67 to 13.85 |
| 3 | Fuma 14.10, Nama 14.50, has 14.83, built 15.00, three 15.57, years 15.87 to 16.25, (pause), on 16.60, top 16.75, his 17.14, schoolwork 17.28 to 17.86 |
| 4 | He 18.11, learned 18.29, code 18.66, by 19.02, modding 19.19, games 19.58, and 20.06, reading 20.23, piles 20.60, JavaScript 21.16 to 21.88 |
| 5 | He 22.13, did 22.30, not 22.50, look 22.75, any 23.08, documentation 23.35 to 24.20, while 24.32, he 24.58, was 24.70, learning 24.87 to 25.32 |
| 6 | He 25.57, designed 25.74, Fumadocs 26.22 to 26.83, in 26.91, four 27.04, layers 27.37 to 27.79, that 27.87, developers 28.06, can 28.65, take 28.84, apart 29.17, and 29.82, reshape 30.06 to 30.84 |
| 7 | The 31.09, C 31.24, L 31.52, I 31.80, can 32.10, copy 32.28, just 32.72, the 32.98, table 33.11, of 33.45, contents 33.56, into 34.16, your 34.43, codebase 34.59 to 35.43 |
| 8 | If 35.68, he 35.81, started 35.97, again 36.35, from 36.68, scratch 36.89 to 37.35, (pause), he 37.80, thinks 37.93, Fumadocs 38.24, would 38.91, have 39.17, same 39.53, shape 39.92 to 40.37 |
| 9 | Fumadocs 40.72, is 41.50, General 41.69, Translation’s 42.04, first 42.87, open 43.41, source 43.81, grantee 44.20 to 44.82 |

### The heading clock

A heading is set 0.4 s after its rise starts, and it holds at least (words / 3) + 1 s after it is set.

| heading | size | rises | set | floor ends | gives way |
| --- | --- | --- | --- | --- | --- |
| One developer | 150, one line | 0.05 | 0.45 | 2.12 | 2.23, by moving type |
| Fumadocs (wordmark, on the moon's centre line) | 150 | 2.75 | 3.15 | 4.48 | 4.50, drops into its mask |
| Each site looks / vastly different | 130 | 10.70 | 11.10 | 13.77 | 14.03 |
| On top of / his schoolwork | 130 | 14.03 | 14.43 | 17.10 | 17.93 |
| A huge pile / of JavaScript | 140 | 17.93 | 18.33 | 21.00 | 21.93 |
| The primary / source | 140 | 21.93 | 22.33 | 24.33 | 25.43 |
| Four modular / layers | 150 | 25.43 | 25.83 | 27.83 | 27.90 |
| Building / blocks | 140 | 27.90 | 28.30 | 29.97 | 30.93 |
| Less magic | 150, one line | 30.93 | 31.33 | 33.00 | 33.00 |
| Into your codebase | 130, one line | 33.00 | 33.40 | 35.40 | 35.43 |
| Designed / to be that way | 120 | 35.43 | 35.83 | 38.50 | 40.43 |
| Software for / the public good | 130 | 40.43 | 40.83 | 43.50 | 45.5, the card's cut |

From 4.8 to 10.7 the heading place holds only the field while the first three marks land on the shelf.

## The pictures, shot by shot

The same rules apply to every shot.

- **Field.** The dithered fire gem-smoke field is kept from the current cut. Mount A is printed through the 8 by 8 Bayer screen on one 3 px cell grid anchored at (0, 0), in black, ember `#7a2a08` and fire `#fe5b16`, with its black cells transparent. It turns on one slow clock from the first frame to the card. It is held off every heading and object by zones drawn from their own ink, with round 7d's distances. Each zone clears on a smoothstep just before its object arrives (each heading's zone 0.07 s before its cut, each shelf element 0.45 s before its word) and gives the field back after its object leaves.
- **Type.** Inter 500 through `var(--font)`, sentence case, at most two lines. Each heading's first glyph is seated on x 160, with cap tops at y 172. The heading zones are painted with the cv11 FontFace, as now.
- **Colours.** Only the material's black, ember, fire, sun `#f7ff61` and white, plus raised ink `#101010` for the docs page's panels.
- **Not used.** No frame, eyebrow, caption, label, byline, monospace or URL. The only figures are the seven star counts. The only URL is the end card's link.
- **Mounts.** Mount A is the field and the heap's and file's light. Mount B is the moon: the r 230 glass moon in shot 1, the 762 px moon in shots 4 and 6, and the r 180 moon in shot 7. Mount C is the GT mark, in shot 7 only. At most two full-frame gem mounts are live at once, as now. In shot 1 the moon is on screen from 2.75 to 18.0, so choose mount B's phase and rate so that it stays in its lit half for that whole span. Round 7b measured a 6.4 s cycle whose lit half lasts about 2 shader seconds, about 15 film seconds at rate 0.13.
- **The docs page** is v2's vector object, rebuilt from the post's two images (`kit/blog/fumadocs-landing.png` and `kit/blog/fumadocs-slider.png`).
  - It has raised-ink panels, square corners and 1 px hairline seams (`rgba(242,242,240,0.11)`), and the Fumadocs moon at 28 px in its nav. No text on it is readable.
  - The sidebar has six token bars. The content column has a white title bar over five ember paragraph bars.
  - The table of contents has six short bars beside its curved line. The line jogs right at nested entries and has a dot at its top. Its active stretch is sun, and the rest is ember.
  - At full size it is 1600 x 480: the nav is 68 px tall, the sidebar 320 px wide, the content 920 px wide and the table of contents 360 px wide.
  - It appears at 0.45 scale (shot 3), at full size (shot 5) and at 0.625 scale (shot 5, after the parting).

### Shot 1, the hook, the lockup and the shelf (0.0 to 18.0, lines 1 to 3, no cut)

- **0.00 to 0.60:** the film opens on ink. The field raises its tone from 0 in Bayer order and is full by 0.60.
- **0.05:** the heading "One developer" (150 px, one line, white) rises out of its mask over the field alone and is set by 0.45. The lower two thirds of the frame show only the field.
- **0.45 to 0.75:** "One" turns fire `#fe5b16`. This is the film's first accent, and "schoolwork" answers it at 17.28.
- **2.23, at the end of "Fumadocs" (the heading's floor ends at 2.12):** moving type, MOTION.md transition (d).
  - The heading breaks into its 3 px glyph cells in reading order. The first cells leave at 2.23 and the last at 2.38.
  - They travel right on seeded paths (power2.inOut, 0.2 to 0.35 s each) and land by 2.65 as the moon's Bayer print in black, ember, fire and sun: a disc of r 230 at (1390, 400).
  - The disc's other cells raise their tone from 2.38 to 2.68.
- **2.75 to 3.15, on "docs":** the print tone-mixes into the glass moon inside the disc only (smoothstep 0.4). The moon is mount B, `kit/gem-shapes/fumadocs-moon.png`, with outer glow 0, clipped 1 px outside its limb.
- **2.75, on "docs framework":** the wordmark "Fumadocs" (150 px, white) rises at x 160 on the moon's centre line, y 400 (expo.out 0.4), and is set by 3.15. The moon and the name stand as a lockup, as on Fumadocs' own site.
- **4.45:** the field starts clearing around the count's place.
- **4.50, during "13,000":** the wordmark drops into its mask (0.3 s). The glass moon moves to the shelf's position, (1530, 530), at the same size (power2.inOut 0.6, done 5.10). Its 1 px clip and its field zone move with it. The lockup's moon is now the shelf's moon.
- **4.85:** Fumadocs' count rises under the moon, left-aligned on its left limb at x 1300, baseline 898: a sharp fire star and "13.3k" in Inter 500 tabular figures at 80 px (expo.out 0.5). It tallies in GitHub's rounding (ease none) and lands on 13.3k at the end of "stars" (5.77).
- **5.60:** the rule's narrow zone clears (black within 18 px, whole 60 px further out).
- **6.04, "GitHub":** the doubled-line rule at y 800, from x 160 to 1760, draws out of its left cross (power3.out 1.0). It is a 7 px white gauge under a 3 px black core, and its right cross appears when it is complete.
- **6.80 to 13.10, line 2:** each mark raises its tone from 0 on the 3 px Bayer grid on its spoken name (0.5 s smoothstep). The marks are white, drawn true from `assets/logos`, with their feet on y 760 and on columns at x 160 + 180 i. The field clears around each mark 0.45 s before it rises. Its count, a fire star and the figure in Inter 500 tabular at 40 px, rises 0.12 s after it.

  | mark | count | lights on | time |
  | --- | --- | --- | --- |
  | Turborepo | 31.2k | "Vercel" | 6.80 |
  | shadcn/ui | 125k | "shad" | 8.64 |
  | Better Auth | 30.2k | "Better" | 10.77 |
  | Unkey | 5.5k | "Unkey" | 11.74 |
  | Orama | 10.6k | "many" | 12.85 |
  | GT mark, in fire | 1.1k | "others" | 13.10 |

- **10.70, on "Better":** the heading "Each site looks / vastly different" (130 px) rises in the heading place and is set by 11.10.
- **13.47, "use it":** once the GT mark is nearly lit, a 160 px fire pulse runs the rule between gauge and core, from under the GT mark (x 1130) to under the moon's centre (x 1530) (ease none 0.6). Its tail closes by 14.27. This ties GT to Fumadocs 30 s before the grant line says why.
- **14.03, on "Fuma Nama":** the heading "On top of / his schoolwork" (130 px, white) replaces the last one in the hook's place and is set by 14.43. The full shelf holds under it with all seven counts.
- **17.28, "schoolwork":** that word turns fire over 0.3 s, the same fire as the hook's "One".
- **17.55 to 17.93:** the field clears the heap's mound for the next shot.
- **Hard cut at 18.0**, in the gap after line 3.

### Shot 2, the heap (18.0 to 22.0, line 4)

- **17.93:** the heading "A huge pile / of JavaScript" (140 px) rises and is set by 18.33. Its floor ends at 21.00.
- **18.0, hard cut:** the glyph heap's ground. The field leaves a dark mound in the lower right two thirds of the frame. The heap is made of braces, brackets, semicolons, equals signs, slashes and the letters of const, let, function, return, import and export, set on the 18 px grid as a glyph halftone. It is lit white, sun, fire and ember by mount A sampled once, with glyphs tilted up to 15 degrees.
- **From 18.05:** the glyph rain falls (ease none) and condenses base first through "modding games and reading piles of". The last glyphs settle on the crest on "JavaScript" (21.16). No loose glyph comes within 60 px of the heading.
- **21.16 to 22.0:** the heap holds while its light drifts by less than 3 percent of each glyph's size.
- **21.55 to 21.93:** the field clears the zones of the next shot's page and file.
- **Hard cut at 22.0.**

### Shot 3, the docs page and the file (22.0 to 25.5, line 5)

- **21.93:** the heading "The primary / source" (140 px) rises and is set by 22.33.
- **22.0, hard cut:** on the left the docs page builds at 0.45 scale (x 160 to 880, y 560 to 776). Its raised-ink panels rise (expo.out 0.5), then the nav, the sidebar bars, the content bars and the table of contents fill 60 ms apart from left to right, done by 22.70. On the right the file (25 lines of token bars with real code indentation and blank lines between its three blocks, x 975 to 1736, top at y 450) waits at tone 0.
- **22.75, "look":** the table-of-contents highlight steps down one section (power2.inOut 0.35), so the page reads as live.
- **23.35, "documentation":** the docs page leaves by a tone mix on the 3 px grid. Its cells switch off in Bayer order (0.6 s smoothstep) and are gone by 23.95, and the field returns into its zone.
- **24.32, "while":** the file's lines raise their tone from 0, top to bottom and 40 ms apart, done by 25.32. They are printed through the Bayer screen in black, ember, fire and sun. The smoke behind them runs at half rate, re-anchored so the lit band lies across the middle block on "learning" (24.87).
- **25.05 to 25.43:** the field clears the moon's disc.
- **Hard cut at 25.5.**

### Shot 4, the moon breaks (25.5 to 31.0, line 6)

- **25.43:** the heading "Four modular / layers" (150 px) rises and is set by 25.83.
- **25.5, hard cut to black:** the Fumadocs moon as a glass shape in fire gem smoke (mount B), 762 px across at (1348, 540). It has no outer glow and is clipped 1 px outside its limb, and the field's printed smoke wraps it to within 10 px. It raises its own glow from black (innerGlow 0 to 1, power3.out 0.8 from 25.45) and is fully lit on "Fumadocs" (26.22). White and sun pool at its top, and a bright filament runs along its lower limb. The smoke inside turns at rate 0.2.
- **27.04, "four":** three registration crosses draw at the limb, x 928, at y 348, 540 and 729, 80 ms apart, each arm out of its centre (expo.out 0.4).
- **27.37, "layers":** the glass tone-mixes into its Bayer print inside the disc (smoothstep 0.4), and the smoke eases from rate 0.2 to 0.015.
- **27.85, 28.05 and 28.25, "that developers":** the three doubled-line seams draw out of the crosses (expo.out 0.45) and cut the disc into four horizontal layers, with no labels. The last one is complete by 28.70.
- **27.90:** the heading changes to "Building / blocks" (140 px), set by 28.30.
- **28.84, "take":** the layers part along the seams by 11 and 33 px (power3.out 0.4, snapped to the 3 px cell). The field is black in the gaps.
- **29.17, "apart":** they spread to 15 and 42 px (power2.inOut 0.5). The third layer's slot draws its 1 px fire hairline outline once (expo.out 0.6). The field clears the piece's path from 28.90.
- **29.35 to 29.95:** the third layer slides left out of its slot to x 180 to 732 (power2.inOut 0.6, snapped to the cell) and arrives as "reshape" begins.
- **30.06, "reshape":** the band's curved ends square off into a 552 by 270 px block (power2.inOut 0.6). Its print is re-sampled on the same grid, so its light still matches the moon.
- **30.55:** the straight doubled-line connector, with a cross at each end, draws from the slot's cross to the block (expo.out 0.35). It holds through the cut and comes back in shot 6's first frame.
- **Hard cut at 31.0.**

### Shot 5, the page breaks (31.0 to 35.5, line 7)

- **30.93:** the heading "Less magic" (150 px, one line) rises and is set by 31.33.
- **31.0, hard cut:** the docs page at full size (x 160 to 1760, y 480 to 960), with its table-of-contents highlight lit.
- **On "C" (31.24), "L" (31.52) and "I" (31.80):** three doubled-line seams draw out of registration crosses, one per letter (expo.out 0.4), in the moon's gauge (7 px white under a 3 px black core).
  - The nav seam is horizontal at y 548, from a cross at x 136 to x 1784.
  - The sidebar seam is vertical at x 480.
  - The table-of-contents seam is vertical at x 1400.
  - Both vertical seams run from the nav seam to a cross at y 984.
- **32.28, "copy":** the four parts move apart along the seams (power3.out 0.4, snapped to the cell). The nav rises 24 px, the sidebar moves left 36 px and the table of contents moves right 36 px. The field is black in the gaps.
- **32.72, "just":** the parted page eases to 0.625 scale about its left edge (power2.inOut 0.6, done 33.32). At the same time the code panel draws on the right, a raised-ink panel at x 1280 to 1760 and y 420 to 960. Its 1 px edge comes out of its top-left cross (expo.out 0.6). Then 18 rows of token bars in white and ember, with real indentation, rise top to bottom 40 ms apart, from 32.95 to 33.67.
- **33.00:** the heading changes to "Into your codebase" (130 px, one line), set by 33.40.
- **33.11, "table":** the table-of-contents part lifts 24 px out of the page and leaves a 1 px fire hairline outline in its slot.
- **33.56, "contents":** a straight doubled-line connector draws from a cross on the part's right edge to a cross on the panel's left edge, x 1268 (expo.out 0.5).
- **33.85 to 34.65:** the part travels along the connector into the panel (power2.inOut 0.8).
- **34.16, "into":** the panel's rows part at its middle to open a gap the part's height (power2.inOut 0.4).
- **34.59, "codebase":** the part seats in the gap.
- **34.75 to 35.25:** a sun block runs down the part's curved line once (ease none 0.5). This is the post's active-section highlight, now inside your code.
- **Hard cut at 35.5.**

### Shot 6, the same shape (35.5 to 40.5, line 8)

- **35.43:** the heading "Designed / to be that way" (120 px) rises and is set by 35.83.
- **35.5, hard cut:** back to the 762 px moon as shot 4 left it: the parted print, the block at the left, the slot outline and the connector.
- **35.97, "started":** the outline and the connector tone out (0.3 s). The pieces return to the circle, with the block taking back its band shape as it slides in (power2.inOut 0.8, done 36.77). The field returns into the piece's path.
- **36.89, "scratch":** the print leaves as its tone lowers to 0 (0.5 s).
- **From 37.30:** while the print's last cells leave, the glyph moon fills the same circle row by row from the top, in reading order (ease none). Its glyphs come from 16 writing systems (Latin, Greek, Cyrillic, Hebrew, Arabic, Devanagari, Tamil, Kannada, Bengali, Thai, Georgian, Armenian, Ethiopic, kana, Han and Hangul) with a few code characters among them. Each glyph is one text node on a 30 px grid with `lang` set, inked from the moon's smoke as the print was lit. The last row lands on "shape" (39.92).
- **39.92 to 40.5:** the ink (never the size) follows the moon's smoke, so a lit band drifts through the glyphs.
- **40.05 to 40.43:** the field clears the grant's mark box and moon.
- **Hard cut at 40.5.**

### Shot 7, the grant (40.5 to 45.5, line 9)

- **40.43:** the heading "Software for / the public good" (130 px) rises and is set by 40.83. Its second line ends near x 1160, about 270 px clear of the mark.
- **40.5, hard cut, with innerGlow 0 on both shapes:**
  - The doubled-line GT mark (`kit/gem-shapes/gt-mark.png`) is a glass shape in fire gem smoke on mount C. It sits exactly in the end card's own mark box, x 1428 to 1760 and y 160 to 369, at the card's scale (`kit/endcard/endcard.js` LAYOUT: the mark is as tall as the title's ink, its right edge on x 1760).
  - The moon is glass on mount B at (1100, 740), r 180.
- **40.72, "Fumadocs":** the moon lights (innerGlow 0 to 1, power3.out 0.8).
- **41.69, "General":** the GT mark forms in the smoke (innerGlow 0 to 1, power3.out 1.0).
- **42.87, "first":** one doubled-line connector draws out of a cross under the mark at (1594, 393). It runs down to y 740 and then left to a cross at the moon's limb, x 1292, as one path with a square corner (expo.out 0.7).
- **44.20, "grantee":** a 160 px fire pulse runs along the connector into the moon (ease none 0.5), between the gauge and the core.
- **44.70:** the pulse arrives, and the moon's smoke thickens inside its disc (innerGlow 1 to 1.4, power3.out 0.3), settling by 45.30.
- **45.0 to 45.5:** the GT mark's density eases to the card's opening state, the bloom's 0.4 (power2.inOut 0.5).
- **Hard cut at 45.5** to the card, 0.68 s after the last word. The cut holds the mark in place.

## The spectacle map

Every piece of the current cut (round 8) and every new visual in SCRIPT-v2.md's shot list and "Visual changes" has a place. The four pieces SCRIPT-v2.md removed are back:

- its item 20, the eight old headings;
- its item 21, the glyph moon;
- its item 22, the 762 px moon scene with its crosses, glass to print, layers, spread and square-off;
- its item 23, the shelf pulse.

Nothing is dropped. "Current cut" means round 8 (`out/blog-fuma-nama.mp4`), and "v2 new" means SCRIPT-v2.md's new visuals.

| piece | origin | where it plays in v3 |
| --- | --- | --- |
| The dithered fire gem-smoke field (mount A through the 8 by 8 Bayer screen on one 3 px grid, one slow clock, black cells transparent) | current cut | Every line, 0.0 to 45.5. It opens from tone 0 to full by 0.6 under the hook. |
| The field's zones, drawn from each object's own ink with smoke-shaped edges, clearing before an arrival and returning after it leaves | current cut | Every line: per mark in line 2 (0.45 s before each name), around the 13.3k count in line 1, the rule's narrow band before "GitHub", the heap's mound, the page and the file, the moon's disc, the piece's path, the grant's mark box. |
| The opening tone rise of the field in Bayer order | current cut (round 7d opened from 0.4), v2 timing | Line 1, 0.0 to 0.6. |
| Heading mask rise (Inter 500, x 160, cap top 172, expo.out, lines 60 ms apart, 0.067 s before a cut), including headings that change over a continuing picture | current cut | All lines. Headings change over a continuing picture in shot 1 (three times), shot 4 and shot 5. |
| Hook frame: a heading over the field alone, with its key word turning fire | v2 new | Line 1: "One developer", with "One" in fire at 0.45. |
| Moving type (transition d): the heading's 3 px cells travel into the moon's Bayer print | v2 new | Line 1, 2.23 to 2.65, at the end of "Fumadocs". |
| The print tone-mixing into the glass moon inside its disc | v2 new | Line 1, 2.75 to 3.15, on "docs". |
| The Fumadocs lockup: the glass moon r 230 at (1390, 400) and the 150 px wordmark | v2 new | Line 1, 2.75 to 4.50, on "docs framework". |
| The lockup's moon moving to the shelf's position | v3 join of two pieces (v2's lockup and the current cut's shelf moon) | Line 1, 4.50 to 5.10, during "13,000". It replaces a cut, so the brand and its stakes are one object. |
| The shelf moon: glass, 460 px at (1530, 530), no outer glow, crisp clipped limb, lit through the shot | current cut | Lines 1 to 3, 5.10 to 18.0. |
| Fumadocs' 13.3k (fire star, 80 px tabular figures) rising out of its mask and tallying in GitHub's rounding | current cut | Line 1, rising at 4.85 and landing on "stars". It is the first figure the viewer sees. |
| The doubled-line rule at y 800, drawn out of its left cross, with a cross 16 px beyond each end and its own narrow field zone | current cut | Line 1, on "GitHub" (6.04). |
| The six adopter marks drawn true in white, raising their tone in Bayer order on their names, each with a fire star and a 40 px count and its own field clearing, the GT mark in fire | current cut | Line 2: Turborepo on "Vercel", shadcn/ui on "shad", Better Auth on "Better", Unkey on "Unkey", Orama on "many", GT on "others". |
| The fire pulse along the shelf's rule from the GT mark to the moon (removed by v2, restored) | current cut | Line 2, on "use it" (13.47 to 14.27). |
| Heading "Each site looks / vastly different" (removed by v2, restored) | current cut | Line 2, over the shelf, from "Better". |
| The payoff heading in the hook's place, with its key word turning the hook's fire | v2 new | Line 3: "On top of / his schoolwork", with "schoolwork" in fire to answer "One". (v2's later "documentation" fire-word chain belonged to its quote payoff; this pair keeps the device.) |
| The glyph heap: code characters on the 18 px grid, lit white, sun, fire and ember by mount A, tilted up to 15 degrees | current cut | Line 4, shot 2. |
| The glyph rain condensing base first, with the crest settling on a key word | current cut | Line 4, from 18.05, the crest on "JavaScript" (21.16). |
| The heap's light drift under 3 percent after it settles | current cut | Line 4, 21.16 to 22.0. |
| Heading "A huge pile / of JavaScript" (removed by v2, restored) | current cut | Line 4. |
| The docs page as a vector object from the post's two images, building: panels rise, then nav, sidebar, content and table of contents fill left to right | v2 new | Line 5, on the cut at 22.0, at 0.45 scale. v2 built it at 0.6 under the lockup, where the shelf now stands, so the build moved to its 0.45 placement in the file shot. |
| The live table-of-contents highlight stepping down one section | v2 new | Line 5, on "look". |
| The docs page leaving by a tone mix, its cells off in Bayer order | v2 new | Line 5, on "documentation". |
| The file of 25 token-bar lines lighting top to bottom in black, ember, fire and sun | current cut | Line 5, from "while". |
| The file's lit band, with the smoke at half rate, lying across the middle block | current cut | Line 5, on "learning". |
| Heading "The primary / source" (removed by v2, restored) | current cut | Line 5. |
| The 762 px glass moon raising its glow from black, white pool at the top and a filament on the lower limb, clipped at its limb and wrapped by the printed field (removed by v2, restored) | current cut | Line 6, from the cut at 25.5, lit on "Fumadocs". Its glow shortened from 1.4 s to 0.8 s. |
| Registration crosses drawn at the moon's limb at the seam heights (removed by v2, restored) | current cut | Line 6, on "four". |
| The glass-to-print tone mix inside the disc, with the smoke easing from rate 0.2 to 0.015 (removed by v2, restored) | current cut | Line 6, on "layers". |
| Three doubled-line seams cutting the moon into four layers (removed by v2, restored) | current cut | Line 6, on "that developers", 0.2 s apart (shortened from one per beat). |
| Heading "Four modular / layers" (removed by v2, restored) | current cut | Line 6, over the moon as it is lit and cut. |
| The layers parting along the seams by 11 and 33 px | current cut | Line 6, on "take". |
| The layers spreading to 15 and 42 px (removed by v2, restored) | current cut | Line 6, on "apart". |
| The slot's 1 px fire hairline outline, drawn once | current cut | Line 6, on "apart". |
| The third layer sliding out of its slot | current cut | Line 6, 29.35 to 29.95, shortened from 1.3 s to 0.6 s. |
| The band squaring off into a 552 by 270 block, re-sampled on the same grid (removed by v2, restored) | current cut | Line 6, on "reshape", shortened from 0.8 s to 0.6 s. |
| The straight doubled-line connector from the slot to the block | current cut | Line 6, at 30.55, and again in shot 6's first frame. |
| Heading "Building / blocks" (removed by v2, restored) | current cut | Line 6, from 27.90. |
| The docs page at full size cut by three doubled-line seams (nav, sidebar, table of contents) drawn out of registration crosses | v2 new | Line 7, one seam on each letter of "C L I". |
| The page's four parts moving apart along the seams | v2 new | Line 7, on "copy". |
| The parted page easing to 0.625 scale | v2 new | Line 7, from "just". |
| The code panel drawing out of its top-left cross, with 18 token-bar rows rising | v2 new | Line 7, 32.72 to 33.67. |
| The table-of-contents part lifting out and leaving a fire hairline outline in its slot | v2 new | Line 7, on "table". |
| The connector from the part to the panel, the part's travel along it, the panel's rows opening and the part seating | v2 new | Line 7: the connector on "contents", the rows open on "into", the seat on "codebase". The travel is shortened from 1.2 s to 0.8 s. |
| The sun block running down the part's curved line inside the code | v2 new | Line 7, during "codebase". |
| Heading "Less magic" (removed by v2, restored) | current cut | Line 7. It moves from the seams of round 7d's moon to the page the CLI takes apart, whose sentence in the post ends on the CLI. |
| Heading "Into your codebase" | v2 new | Line 7, from 33.00. |
| The pieces returning to the circle (removed by v2, restored) | current cut | Line 8, on "started". The film rebuilds what it broke. |
| The print leaving as its tone lowers to 0 (removed by v2, restored) | current cut | Line 8, on "scratch". |
| The glyph moon in 16 writing systems with a few code characters, one `lang`-set text node per glyph on a 30 px grid, filling row by row and then drifting with the smoke (removed by v2, restored) | current cut | Line 8, from 37.30, the last row on "shape". Its job is the moon rebuilt from scratch as the same circle. |
| Heading "Designed / to be that way" (removed by v2, restored) | current cut | Line 8. |
| The GT mark as a glass shape in fire gem smoke on mount C, forming from black | current cut | Line 9, on "General". |
| The grant connector from the GT mark to the moon | current cut | Line 9, on "first", now one path with a square corner. |
| The fire pulse along the grant connector into the moon, the moon's smoke thickening and settling | current cut | Line 9, on "grantee". |
| The grant re-laid: the GT mark in the end card's own mark box, the moon at (1100, 740) r 180, and the mark's density easing into the card's bloom so that the cut holds it | v2 new | Line 9 and the cut at 45.5. |
| Heading "Software for / the public good" (removed by v2, restored) | current cut | Line 9. |
| Spoken-word headings and the wordmark (v2's device: a heading made of the words said under it) | v2 new | Kept as a device: "One developer" and the "Fumadocs" wordmark (line 1), "On top of / his schoolwork" (line 3) and "Into your codebase" (line 7). "Four modular / layers" and "A huge pile / of JavaScript" now also share their key words with the narration. |
| The shared series end card | current cut | 45.5 to 49.5, silent. |
| Hard cuts on the 0.5 s beat, and tone mixes on the one cell grid as the film's only transitions besides moving type | current cut | Every shot. |

**v2 heading texts that are not used.** v2 made each heading from the words spoken under it, and these four texts belonged to lines v3 no longer says:

- "Fuma Nama just completed / high school last year". v2 itself had already retired it with its opener change.
- "“I learned to code / from files”" and "“Just the code / itself”". These are Fuma's quotes, and Kevin's newest note asks for a film not driven by quotes.
- "The documentation framework / for the web", v2's quoted payoff after its opener change.

v2's "A docs framework / you can break" and "First open-source / grantee" are plain phrases. Their two places (over the page breaking and over the grant) now hold round 7d's "Less magic" and "Software for / the public good", which v2 had removed. The type treatment of all of them (the mask rise, x 160 and the fire turn) is on every heading. Kevin can swap any of them back (see "Decisions for Kevin").

## The end card

- **Timing:** 45.5 to 49.5 s, silent.
- **Card:** the shared series end card from `kit/endcard`, used as it is: `addEndCard(tl, { palette: 'fire', title: ['Fuma Nama: The philosophy', 'of an open-sourcerer'], url: 'generaltranslation.com/blog/fuma-nama', start: 45.5 })`. It shows the doubled-line GT mark in fire gem smoke, which is already in its place from shot 7. It also shows the post's title in two lines and the link, which is the film's only URL. The card draws no frame by default.
- **Composition:** the root `data-duration` is 49.5. Mounts A, B and C and the field stop drawing at 45.5.
- **Sound:** the bed comes out of its duck over 0.8 s under the cut and resolves on its own settle under the card.

## Visual changes the build must make

These are listed against the current composition (`index.html`, round 8). Nothing is removed.

### Kept and retimed

1. **The field** (mount A's Bayer print, its zones from each thing's own ink, its clock and tones) is unchanged. Its zone windows move to the new times. It opens from tone 0 to full by 0.6 (round 8 rises from 0.4 over 0.8 s).
2. **The type system** stays: Inter 500 through `var(--font)`, the x 160 axis, cap tops at y 172, the mask rise, and the heading zones painted with the cv11 FontFace.
3. **The glyph heap and its rain** (round 8, 0.0 to 4.0) move to 18.0 to 22.0, with the crest on "JavaScript".
4. **The file and its lit band** (round 8, 4.0 to 8.5) move to 22.0 to 25.5. The file lights on "while", the band crosses on "learning", and the file's top is lowered to y 450 (v2).
5. **The 762 px moon scene** (round 8, 8.5 to 26.5) is compressed into 25.5 to 31.0:
   - the glow from black, 0.8 s, lit on "Fumadocs";
   - the crosses on "four";
   - glass to print on "layers";
   - the seams 0.2 s apart on "that developers";
   - the parting on "take", and the spread and outline on "apart";
   - the slide over 0.6 s;
   - the square-off on "reshape";
   - the connector at 30.55.
6. **The return and the glyph moon** (round 8, 26.5 to 34.5) move to 35.5 to 40.5. The pieces return on "started", the print leaves on "scratch", and the last row lands on "shape".
7. **The shelf** (round 8, 34.5 to 45.5) moves into shot 1. Its moon arrives by moving from the lockup, 13.3k tallies onto "stars", the rule draws on "GitHub", and the marks light on line 2's names, with Orama on "many" and GT on "others". The pulse runs on "use it".
8. **The grant** (round 8, 45.5 to 50.0, with the GT mark at the lower left) is re-laid as v2's shot 6, at 40.5 to 45.5.
9. **The eight round 7d headings** return at the times in the heading clock. "Less magic" moves to the page shot, and "Each site looks / vastly different" moves to the opening shelf.
10. **The `addEndCard` call** is unchanged except for `start` (50.0 to 45.5). The root duration goes from 54.0 to 49.5.

### New (v2's visuals, built here)

11. **The hook frame:** "One developer" over the field alone, with "One" turning fire.
12. **The moving type** from the hook's cells into the moon's print at (1390, 400).
13. **The lockup:** the print to glass and the 150 px wordmark.
14. **The lockup's moon moving to the shelf's position** (4.50 to 5.10), with its clip and its zone. This is the one motion v3 adds to join two existing pieces.
15. **The docs page object:**
    - at 0.45 scale in shot 3, with its build, its table-of-contents step and its exit by tone mix;
    - at full size in shot 5, with its three seams, its parting and its ease to 0.625;
    - the code panel, and the table-of-contents part's journey into it: the lift, the outline, the connector, the travel, the rows opening, the seat and the sun run.
16. **"On top of / his schoolwork"** in the hook's place, with "schoolwork" turning fire.
17. **"Into your codebase"** over the part's journey.
18. **The grant layout:** the GT mark in the end card's mark box, the moon at (1100, 740) r 180, the square-cornered connector, and the mark's density easing into the card's bloom.
19. **Timing data:**
    - `lib/cues.mjs` gets FIRST_SOUND (0.25, 6.80, 14.10, 18.11, 22.13, 25.57, 31.09, 35.68, 40.72), CUTS (0, 18.0, 22.0, 25.5, 31.0, 35.5, 40.5; lines 2 and 3 share shot 1) and CARD (45.5), all re-measured from the new takes.
    - RESPELL gains the respellings listed under the voice.
    - A new `CUE` table is copied into `index.html`.

### Removed

Nothing from the picture. The round 7d takes are archived (see the voice), and only the vo-4 copy is new there.

## The sound plan

- **Music:** round 5's peaceful bed (`audio/archive-r6a/bed.mp3`: a low drone, a slow pulse and sparse low piano), re-cut to 49.5 s with `lib/make-bed.mjs`. It keeps round 5's EQ (38 Hz high-pass, -6 dB low shelf at 110 Hz, +5 dB bell at 300 Hz) and its stereo image.
  - It keeps the passages (A = 1.25 to 14.4 s of the source, B = 16.45 to 24.25 s) in the order A, B, A, B, A, B, then the source's own settle, which begins about 1.5 s into the card (film about 47.0).
  - Every join must sit under a spoken word, never in a gap or a comma pause. Run `--search` for every pin that moves.
  - The current pins at film 12.95, 20.05 and 30.17 fall under "many" (line 2), "games" to "and" (line 4) and "reshape" (line 6). They can stay if the new takes keep a word over them.
  - The fourth join (37.29 in the current edit) would fall in line 8's pause after "scratch". Move it onto "started again" (35.97 to 36.62) or onto "thinks Fumadocs" (37.93 to 38.81) by searching its window.
  - The last A to B join goes where the settle lands about 1.5 s into the card, near film 39.2, under "would have". If that leaves the short A passage before it under 1.5 s, let the settle begin up to 2.0 s into the card instead.
- **Ducking:** as now, 5.8 dB on 0.3 s ramps that end 0.05 s before each line's first sound.
  - Line 1 starts at 0.25, so the bed fades in from 0.0 to 0.2 s and enters already ducked.
  - The duck holds flat across every gap, with no breath, because gaps of 0.25 to 0.35 s are too short to lift without pumping.
  - After line 9 the duck lets go over 0.8 s on a smoothstep to -1.5 dB for the card, and the bed fades over the card's last 0.8 s.
  - The hand-built 260 Hz dip (-5 dB, Q 1.1) rides the duck. The hyperframes-audio carve (strength 0.3, `--flatten-carve-level`) stays as in round 7d.
- **Narrator:** one `hf-audio-group` bus at 0 dB. Each clip has a 20 ms fade in and a 60 ms fade out, and ends 0.18 s after its last word. Takes are mastered by `lib/make-voice.mjs` as now: each brought to -26.5 LUFS, then the compressor, then the limiter at -3.6 dBTP.
- **Targets:** narrator about -16 LUFS integrated, bed about -26 LUFS under speech and about -20 on the card, true peak below -1 dBTP. The audio stream must be exactly 49.5 s, AAC in the MP4. Measure with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.
- **Picture reads alone:** no beat depends on the sound.

## If the takes run long or short

- **Retiming:** every event is keyed to a spoken word, and the new takes' word times replace the planned ones. Each cut falls on a 0.5 s beat inside the gap, never inside a word. The next line's first sound comes 0 to 0.3 s after the cut, and gaps stay at 0.25 to 0.40 s. If no beat fits, the gap may grow to 0.5 s at that one place.
- **Reading floors come first.** The heading clock above lists each floor. A heading that would change before its floor ends changes on the next keyed word instead. The floor is never shortened.
- **Line 1:**
  - The moving type starts at the end of "Fumadocs", never before 2.12.
  - The wordmark leaves no earlier than its floor and before "stars".
  - If "13,000" to the end of "stars" is under 1.2 s, the wordmark drops and the moon moves from "over".
  - The count always lands on "stars".
- **Line 2:** each mark lights on its own name. If "Unkey and many others" runs together, Orama lights on "many" and GT on "others" as long as they are at least 0.2 s apart. Otherwise GT lights 0.2 s after Orama.
- **Line 4:** the rain needs at least 2.5 s from the cut to "JavaScript".
- **Line 6:** from "take" to the cut needs at least 2.0 s for the parting, spread, slide, square-off and connector. If it is shorter, the slide starts on "apart" and the connector draws as the square-off ends.
- **Line 7:**
  - If the three letters come faster than 0.2 s apart, the seams draw 0.2 s apart from "C".
  - The part's travel needs at least 0.7 s between "contents" and "codebase". If it is shorter, the connector draws on "table" and the lift moves to "just".
- **Line 8:** the glyph fill needs at least 2.0 s from "scratch" to "shape". Clara's pause after "scratch," measured 0.68 s in vo-6 (planned here at 0.45), so if it is long the fill starts with the print's exit.
- **Line 9:** the pulse needs 0.5 s, plus 0.3 s for the moon to thicken, before the card. The card starts on the first beat at least 0.45 s after the last word and after the pulse arrives.
- **Long (the film must stay at or under 50.0 s).** Apply these in order:
  1. Tighten the gaps to 0.25 s.
  2. Start the card on the first beat 0.45 s after the last word, with the pulse starting on "open-source".
  3. Change line 4 to "He learned to code by reading piles of JavaScript." (about 0.9 s shorter, one retake), with the crest still on "JavaScript".
  4. Retake the line that ran furthest over its estimate once, with `--prev` and `--next` (most likely line 2, the list, or line 8).

  Never speed up a take.
- **Short:** the card moves to the first beat at least 0.45 s after line 9 and after the pulse lands, and the film may run down to 48.0 s. Do not add holds anywhere else. If the takes come in 0.6 s or more short, "probably" can return to line 8 (see "Decisions for Kevin").

## Decisions for Kevin

1. **Vercel's stress.** Your note sets the vowels: the "ver" of "version" and the "cel" of "acceleration". It does not say which syllable carries the stress. The build keeps the take whose two vowels are both full and right. The company itself says ver-SELL. If two passing takes differ only in stress, you pick.
2. **"probably" in line 8.** The post's sentence is "I think Fumadocs would probably be the same shape". Line 8 keeps "he thinks" and leaves out "probably" so the film stays at 49.5 s. Putting it back adds about 0.6 s and moves the card to 46.0 (film 50.0, the cap).
3. **Line 4's length.** "He learned to code by modding games and reading piles of JavaScript." is the post's account of how he learned. The shorter "He learned to code by reading JavaScript files." saves about 0.9 s.
4. **v2's headings.** "A docs framework / you can break" and "First open-source / grantee" are unused, because their places hold round 7d's "Less magic" and "Software for / the public good". v2's quoted headings are retired. Say if you want any of them back in place of a round 7d heading.

## Audit

### Facts (each checked in fuma-nama.mdx, link markup removed)

| claim in the film | where it is in the post |
| --- | --- |
| One developer created Fumadocs (line 1) | "our first grantee project: Fumadocs, created by Fuma Nama."; "Fuma Nama, the creator of Fumadocs" |
| A docs framework (line 1) | "Fumadocs is built to be a docs framework you can break."; "a beautiful and flexible React documentation framework" |
| Over 13,000 stars on GitHub (line 1) | "Fumadocs has since grown to over 13,000 stars on GitHub". The screen's 13.3k is Kevin's 13,283 in GitHub's rounding. |
| Vercel Turborepo, shadcn/ui, Better Auth, Unkey and many others use it (line 2) | "Fumadocs is used by Vercel Turborepo, shadcn/ui, BetterAuth, Unkey, and many others." |
| Orama's and GT's marks on "many others" (line 2) | "used by companies like Vercel, Unkey, Orama, and yours truly"; "General Translation uses Fumadocs for our own documentation" |
| He has built it for three years, on top of his schoolwork (line 3) | "Over the past three years, Fuma Nama has continued building and maintaining the framework, investing hundreds of hours on top of his schoolwork and other obligations." |
| He learned to code by modding games (line 4) | "Instead, he learned to code through modding videogames and reverse engineering." |
| and reading piles of JavaScript (line 4) | "I learned to code from files. Like I would see a huge pile of JavaScript and read that"; "how Fuma Nama learned to code from looking at code files" |
| He did not look at any documentation while he was learning (line 5) | "I didn’t look at any kind of documentation, just the code itself." |
| He designed Fumadocs in four layers (line 6) | "The framework has four modular layers: Core, Content, UI, and CLI."; "which has been meticulously designed to be that way" |
| that developers can take apart and reshape (line 6) | "By “breakable,” he refers to the ability for a developer to take apart and reshape any piece of the framework." |
| The CLI can copy just the table of contents into your codebase (line 7) | "The CLI works per component and can go even finer, pulling a single slot of a layout (for example, only the table of contents)."; "can copy UI components directly into your codebase via the CLI" |
| If he started again from scratch, he thinks Fumadocs would have the same shape (line 8) | "“Even if I started again from scratch, I think Fumadocs would probably be the same shape,” said Fuma." "He thinks" carries his "I think". "probably" is left out for length (Decision 2). |
| Fumadocs is General Translation's first open-source grantee (line 9) | "We’re excited to announce our first grantee project: Fumadocs"; the callout "About General Translation Open-Source Grants" |
| The star counts | From Kevin, read from GitHub: fumadocs 13,283 (13.3k), shadcn/ui 124,997 (125k), turborepo 31,159 (31.2k), better-auth 30,152 (30.2k), orama 10,569 (10.6k), unkey 5,456 (5.5k), gt 1,065 (1.1k), rounded as GitHub rounds them. |
| The moon is Fumadocs' logo | "The logo of Fumadocs is a circle that I would call the moon, Luna." |
| The docs page and its table-of-contents highlight | The post's images `fumadocs-landing.png` and `fumadocs-slider.png`; "a glowing block sliding behind it so the “active section” highlight travels along the line" |
| The heap of code characters | "Like I would see a huge pile of JavaScript and read that" |
| The four layers drawn on the moon | "The framework has four modular layers" |
| The glyph moon's writing systems | A picture, with no claim attached. Its job is the same circle rebuilt from scratch. |
| The headings | "Each site looks vastly different": "It’s a testament to Fumadocs’ composability that each site looks vastly different." "A huge pile of JavaScript": the quote above, as a phrase. "The primary source": "By going directly to “the primary source”". "Four modular layers": the layers sentence. "Building blocks": "Each library is a set of “building blocks”". "Less magic": "Fumadocs is thus a less magic, less opinionated framework." "Designed to be that way": "which has been meticulously designed to be that way". "Software for the public good": the callout's "software for the public good". "One developer", "On top of his schoolwork" and "Into your codebase" are the spoken words. |

Nothing from outside the post or Kevin's star counts is stated. The film says no age, company number, launch date or grant amount.

### Quotes

Zero. The narration quotes no one and never says "he said", and no heading carries quotation marks. Line 8 reports his view in the narrator's words. The post's phrases appear only where they are the fact itself: "over 13,000 stars on GitHub", "on top of his schoolwork", "piles of JavaScript", "take apart and reshape", "from scratch" and "the same shape".

### Writing rules

- **Sentences:** each of the nine lines is a complete declarative sentence in plain technical English.
- **Metaphors:** none. "The same shape" is Fuma's word for the framework's structure, said plainly, and the picture shows it literally as the same circle. "On top of his schoolwork" is the post's plain phrase for "in addition to".
- **Banned forms:** there is no fragment for rhythm, no rhetorical question, no exclamation, no em dash, no signpost or label and no hype word. There is no "X, not Y" or "not X but Y". Line 5 is one negative fact with one subject.
- **Lists:** line 2's list is the post's list of adopters, and each name lights its own mark. Line 4 names two ways he learned. No line uses a triad for rhythm.
- **Person:** there is no first person. "He" opens lines 4, 5 and 6 because each states a new fact about him in order.
- **Repetition:** nothing is said twice. "Fumadocs" is spoken four times (lines 1, 6, 8 and 9), each time as part of a new fact.
- **On screen:** there are no eyebrows, no monospace, no captions or bylines, no frame overlay and no URL except the end card's. Every heading is at most two lines, from 120 to 150 px, in sentence case with no trailing period.
