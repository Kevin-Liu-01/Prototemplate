# Designing docs for humans: the script (round 7)

The trailer for the post "Designing docs for humans" (Kevin Liu and Taylor Fang, General Translation blog, September 17, 2026). Written from scratch from the post, the brand and the kit. The winning treatment is r7-idea, with two pictures grafted in from r7-viewer (line 1) and r7-people (line 2). The words are r7-idea's, unchanged.

**Story, in one sentence:** People still read docs to understand a product, so General Translation deleted the clutter from its docs and kept the writing.

| | |
| --- | --- |
| Words | 89 in 8 lines |
| Excerpt share | 64 of 89 words are verbatim from the post (0.719) |
| Connecting lines | lines 1 and 8, 25 words |
| Estimated length | 38.7 s of speech at 2.3 words a second, plus a 0.3 s pause inside line 5; the film runs 44.5 s |
| Narrator | Patrick, the Australian library voice in `kit/audio/voice.json` (eleven_multilingual_v2, stability 0.7, style 0.05, speed 0.85) |

## Lines

| n | spoken text | heading on screen | source sentence in the post |
| --- | --- | --- | --- |
| 1 | Designing docs for humans is a post from General Translation, which makes localization tools for developers. | Documentation is an / open problem in web design | Connecting line. The heading is the post's first sentence: "Documentation is an open problem in web design." |
| 2 | Agents are mass executors of code, but statistics on sheer volume don't capture everything. | Human readability / and visual design | "Yes, agents are mass executors of code, but statistics on sheer volume don't capture everything." The leading "Yes," is dropped at its comma and "agents" takes a capital. The concession after "but" is kept whole. |
| 3 | Humans still look at docs sites to understand and evaluate a product. | Guide their attention / to what’s important | "Humans still look at docs sites to understand and evaluate a product." The whole sentence. |
| 4 | Interfaces are increasingly cluttered. | Telltale signs / of AI design | "Interfaces are increasingly cluttered." The whole sentence, the first of the section "Cleaning up mental clutter". |
| 5 | So our first job is to cut mental clutter. This means deleting extraneous elements. | A lot of extra lines, / links, and buttons | "So our first job is to cut mental clutter. This means deleting extraneous elements; in our case, a lot of extra lines, links, and buttons." The second sentence stops at the post's semicolon, and the list it drops goes on screen as the heading. |
| 6 | Our sidebar is now one singular accordion. | A rarity in / docs sites | "Our sidebar is now one singular accordion." The whole sentence. The heading is the start of the post's next sentence. |
| 7 | We work hard on our writing, and we want people to read it. | A simpler reading experience / focused on content | "We work hard on our writing, and we want people to read it." The whole sentence. |
| 8 | The full post is on the General Translation blog. | Designing docs / for humans | Connecting line (the Sound section's "On the General Translation blog." as a complete sentence). The heading is the post's title on the end card. |

In the heading column, " / " marks the line break. Every heading is a verbatim run of the post in sentence case with no trailing period: line 2 from "Why should you even put effort into human readability and visual design?", line 3 from "...and guide their attention to what's important.", line 4 from "...are telltale signs of AI design.", line 5 from "...a lot of extra lines, links, and buttons.", line 7 from the bold "a simpler reading experience focused on content". The post types "what's" with a straight apostrophe; on screen it is set with the typographic apostrophe, the same character as the post's "doesn’t". No heading shares a phrase with the voice line under it.

## Audit

- Each excerpt was matched as an exact substring of the post, after the bold marks and link markup were removed. Every one is found once: line 2 (from "agents are mass executors"), 3, 4, 5 (both sentences), 6 and 7. No word is reworded. The hedges "still", "increasingly" and "don't capture everything" are kept.
- The post quotes no person. The "we" and "our" lines come after line 1, which names the post as General Translation's. Fumadocs and Linear are never spoken, so no logo is used.
- Connecting lines 1 and 8 are complete declarative sentences. They have no metaphor, no "X, not Y", no triad, no fragment, no question, no exclamation, no hype, no em dash and no signpost. Line 1's subject is the four-word title, and its "which" clause closes the sentence. Line 1 says what General Translation is.
- Adjacent lines share no phrase. The single word "clutter" carries from line 4 into line 5, and "our" from line 5 into lines 6 and 7.
- No excerpt reads aloud an em dash, a parenthesis, a list or a link.

## Pronunciation and delivery

- Generate each line separately with `node kit/audio/el.mjs line`, passing `--prev` and `--next` with the neighbouring lines so the reads flow. Use one take per line, and redo a line only if the take is wrong. If the eight takes measure under 2.2 words a second in total, the film runs past 45 s. Then shorten the gaps first. If that is still not enough, regenerate at `--speed 0.92`, which is the voice's own delivery rate. Never time-stretch the audio.
- Designing docs for humans: read it as a title, with a slight lift on "Designing" and a short pause after "humans".
- General Translation: the company name, both words at full weight every time, never "GT".
- localization: loh-kuh-ly-ZAY-shun. Patrick's Australian vowel is fine; keep the z sound.
- executors: ig-ZEK-yuh-terz, stressed on the second syllable.
- statistics on sheer volume: stuh-TIS-tiks; keep "sheer" and "volume" separate and unhurried.
- don't capture everything: a falling close, then a 0.4 s breath before line 3.
- Interfaces: IN-ter-fay-siz. Line 4 is four words; give it its own falling stop.
- Line 5: a 0.3 s pause between "clutter." and "This means". "extraneous" is ek-STRAY-nee-us. The trimmed sentence ends on a falling full stop, never a rising list intonation.
- accordion: uh-KOR-dee-un. "one singular" carries a light stress on "one".
- docs: one syllable, rhymes with "locks", never "documents".
- Line 7 is the film's reason. Read it plainly and at the same pace, with no added warmth.

## Changes after judging (orchestrator, 2026-10-02)

- Line 6's heading is "A rarity in / docs sites" (the post: "It doesn’t sound revolutionary, but has become a rarity in docs sites"). "It doesn’t sound revolutionary" alone depends on a sentence the film does not show.

## Round 7b changes (Kevin, 2026-10-02; these override everything above where they differ)

Kevin: "for the designing docs and fuma we want to add links at end, and we want to make a consistent end card after videos that also adds link. ... also make the voice more australian and make the voice less shaky".

- **Line 8 is no longer spoken.** The story ends on line 7, "We work hard on our writing, and we want people to read it." The link on the end card replaces "The full post is on the General Translation blog."
- **The end card is the shared series end card** (`kit/endcard/`), after the narrative and silent (the music resolves under it): the GT mark in this film's blue gem smoke, the title in two lines, and the link `generaltranslation.com/blog/designing-docs-for-humans`.
- **Words:** 80 spoken words in 7 lines, 64 of them verbatim (0.80).
- **Narrator:** `kit/audio/voice.json` now names the Australian Baritone at stability 0.85, style 0, speed 1.0. Never slow the voice with --speed below 1.0: the slowed takes measured the most pitch wobble. Calm comes from the gaps between lines.

