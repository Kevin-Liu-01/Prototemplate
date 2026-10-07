# Sound in detail

This file is the detail behind section 7 of `../SKILL.md`: the ElevenLabs helper, the narrator, the bed, the mix the blog films use, how to read the targets, and the traps. Paths are relative to `$PROTOTEMPLATE/motion/` unless they say otherwise.

## `kit/audio/el.mjs`

```sh
node kit/audio/el.mjs line  <out.mp3> "<text>" --prev "<previous line>" --next "<next line>" [--voice <voice_id>] [--stability S] [--style S] [--speed S]
node kit/audio/el.mjs bed   <out.mp3> "<music prompt>" [--seconds 24] [--influence 0.5] [--loop]
node kit/audio/el.mjs music <out.mp3> "<music prompt>" --seconds <film length> [--vocals]
node kit/audio/el.mjs hear  <file.mp3|wav|m4a|mp4> [--out <file.json>]
```

The bracketed values are the defaults. `line` takes its voice, stability, style and speed from `voice.json` unless a flag overrides one. Round 5's beds were requested at `--seconds 28 --influence 0.6`.

- `line` calls text to speech with timestamps and writes `<out>.json` beside the take: the text, the voice, the model, the speed, the duration, the first sound and the per-character alignment. Beats are timed from that file.
- `bed` calls sound generation, up to 30 s. `music` calls the Music API (`music_v1`) for exactly `--seconds`, instrumental unless `--vocals`.
- `hear` transcribes a take, a bed or a whole film with speech to text (`scribe_v1`, audio event tags on) and prints each word with its start time. It writes `<in>.stt.json`.
- The script reads the key from the ElevenLabs config file itself. The key never appears in an argument, an environment variable set in a prompt, a log or a message. On HTTP 429 it waits 5 s and retries once.
- `voice.json` holds `voice_id`, `name`, `model`, `stability`, `style`, `speed` and `chosen` (the date and Kevin's words). Without it, `el.mjs` falls back to the premade voice Charlie.
- Credits are limited: one take per line unless a take is wrong, and at most two beds or compositions per film. Each film's NOTES.md keeps a ledger of every request, its result and whether it was used.

## The narrator

| voice | used | settings | why it changed |
| --- | --- | --- | --- |
| Charlie (premade, Australian) | round 5, 2026-10-01 | stability 0.7, style 0.05 | the account then allowed premade voices only |
| Patrick (library) | round 7, 2026-10-02 | stability 0.7, style 0.05, speed 0.85 | Kevin: "make the voice more australian and make the voice less shaky"; the slowed takes measured 1.6 to 1.7 percent pitch wobble |
| Australian Baritone (library) | round 7b | stability 0.85, style 0, speed 1.0 | 0.56 percent wobble; Kevin then asked for "a much more friendly australian voice" |
| Clara (library) | round 7d, from 2026-10-02 | stability 0.65, style 0.2, speed 1.0 | "like 2 but more female", "lets use clara" |

- Auditions live in `kit/audio/auditions/` (`creator`, `creator2`, `friendly`, `friendly-female`, `series`). Each candidate reads the same lines, mixed in context over a film's bed, with its pace in words a second and its median pitch wobble (autocorrelation F0 on 40 ms frames, the median frame-to-frame relative change). Kevin picks by ear from the sent set.
- Never generate below speed 1.0. Slowing a voice raised its wobble every time it was measured.
- Clara's Fuma Nama takes read 2.53 words a second overall, from 1.95 to 3.64 per line. Plan scripts on that rate, and lengthen a hold when a line runs long. Never speed up or time-stretch a take.
- Send one request per line with `--prev` and `--next` and nothing else, the request text exactly the script's, curly quotes included. A quote is read as a quote and its attribution follows a pause, lower in pitch.
- Respell a name in the request text only. Fuma Nama's line 7 was retaken with "Ver-sell" because the first take stressed Vercel's first syllable; `lib/cues.mjs` joins the respelt parts back into the script's word.
- The transcriber writes some Australian vowels as other words ("Unkey" as "Anki", "Fumadocs" as "Fumadox"). That alone is no defect when the take is right; make the picture name the word (the Unkey mark rises on its name).
- Non-English passages use a voice for that language: a Mandarin library voice for jihe-yuanben's seven passages and a Hebrew voice on `eleven_v3` for modern-hebrew. jihe-yuanben's 界說 came back read jiěshuō and was pitch-corrected to jièshuō. A native listener signs off every non-English take before release.

## The bed

- **Blog films** use round 5's sound generation (28 s), which Kevin asked for again in round 7c. Each film edits its own bed to the film's length (Fuma Nama with `lib/make-bed.mjs`, the docs film with `audio/make-bed.py`). Fuma Nama plays passage A (1.25 to 14.4 s of the source) and passage B (16.45 to 24.25 s) as A, B, A, B, A, B, then the source's own settle under the end card.
- **Joins** are 0.6 s raised-cosine crossfades between passages of the same chord colour, each placed under a narration line. The drone's two channels are often near anti-phase, so a join is pinned where the drone below 110 Hz holds steadiest in the left channel, the right channel and the mono fold-down. A join chosen on mono alone once notched one channel's drone by 21 dB. `make-bed.mjs --search` re-derives the pins.
- **Master EQ** (round 5's): a 38 Hz high-pass, a -6 dB low shelf at 110 Hz and a +5 dB bell at 300 Hz (Q 0.7), so the bed still carries on laptop and phone speakers. The master starts with 0.1 s of silence (see the processing bump below).
- **Music API compositions** ignore timing instructions: both of round 7b's compositions spent their first seconds building and ended before the film did. Plan an edit: find the body's pulse grid, choose the splice by band-envelope and chroma similarity, cut 2 ms before two corresponding attacks, and check the pulse intervals across the splice on the master.
- Confirm with `hear` that a bed holds no voice.

## The mix (Fuma Nama, round 7d)

This is Fuma Nama's chain, the one that uses the wiki's `hyperframes-audio` tools. The docs film builds its mix with one Python script, `audio/mix.py`: voice masters at -18.8 LUFS mono with a -3.5 dBFS lookahead ceiling at 4x oversampling, written dual mono; the bed under speech at about -28.5 LUFS with a dip shaped by Clara's voice (up to 12 dB in each third of an octave where the bed comes within 6 dB of her median, and up to 20 dB in her 400 to 800 Hz vowel band); one narration envelope held through every gap under 1.2 s, with the bed lifted 35 percent of the way back in each gap (`GAP_LIFT`); and `film-premix.wav` and `mix-report.json` for measuring. Its NOTES.md ("Round 7d revision") has the numbers. Read the film's own NOTES.md before changing its sound.

Fuma Nama's chain runs from the film folder, in this order:

```sh
node lib/make-voice.mjs          # audio/vo-N.master.wav from the takes
node lib/cues.mjs                # the word times; copy its CUE block into index.html if a placement changed
node lib/make-bed.mjs            # audio/bed.master.wav
node lib/make-mix.mjs            # the mix block in index.html
node <hyperframes-audio skill>/scripts/carve.mjs --comp index.html --bed music-bed --strength 0.3 --core <folder with @hyperframes/core@0.8.106>
node lib/make-mix.mjs --flatten-carve-level
```

- **Voice masters.** A 75 Hz high-pass; each take brought to -26.5 LUFS before an RMS compressor (its threshold is absolute, and Clara's takes arrive 6 to 14 dB quieter than the baritone's); every master at -19.3 to -19.4 LUFS mono, which reads about -16.4 LUFS in the film because the mixer plays mono into both channels; ffmpeg's lookahead limiter at -3.6 dBTP at 192 kHz.
- **The mix block.** `make-mix.mjs` writes everything between `<!-- mix:` and `<!-- /mix -->` in `index.html`. Never edit that block by hand. The narration clips are members of one `<hf-audio-group>` bus at 0 dB; each clip fades in over 20 ms and out over 60 ms and ends 0.18 s after its last word.
- **The bed** sits in its own group at -0.5 dB, fades in over 0.3 s from 0.1 s and out over the end card's last 0.8 s. Its volume lane ducks it 5.8 dB on 0.3 s ramps that end 0.05 s before each line's first sound. Across every gap under about 1.2 s the duck holds, rising only 1.5 dB on a half-sine. After the last line it releases over 0.8 s on a smoothstep.
- **A fixed dip** rides the duck where the bed's partials sit on the narrator's fundamental: 260 Hz, -5 dB, Q 1.1 for Clara.
- **The carve** runs at strength 0.3 in Fuma Nama (0.1 in round 5). The wiki skill's default of 0.8 is for a bed that must get out of the way first. Its level stage is removed and its dynamic dips are held at their deepest across the gaps (`--flatten-carve-level`). `make-mix.mjs` rewrites the whole block and drops the carve, so run the carve and the flatten after every `make-mix.mjs`. `carve.mjs` needs `@hyperframes/core@0.8.106` installed somewhere; point `--core` at it.
- **Stems.** Measure on audio-only renders of the same mix block, whose audio equals the film's sample for sample: `node lib/make-mix.mjs --standalone <dir>/full.html --stems <dir>` (with `kit` and `audio` linked into `<dir>`), carve `full.html`, then `npx -y hyperframes@0.8.106 render <dir> -c full.html -o <dir>/full.mp4 --fps 1 --quality draft --workers 1`.

## Reading the targets

- MOTION.md asks for the narrator at about -16 LUFS for the film, the bed at about -26 LUFS under speech and -20 LUFS alone, and true peak under -1 dBTP. Fuma Nama's measured bed sits about 10 dB under the narrator while she speaks (-25.9 LUFS). The docs film's bed sits lower (about -28.5 LUFS under speech), because at -26 its 160 to 800 Hz body covered Clara's vowels; masking decides over the figure.
- "-20 alone and -26 under speech" is a 6 dB duck in loudness terms. Meet the LUFS numbers.
- Gaps under a second never let a ducked bed reach its full level. Measure the bed alone in the open and on the end card, and under speech inside the line windows.
- The final check is `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -` (`../scripts/measure-render.mjs` wraps it with the stream checks).

## Traps

- **The AAC true-peak correction.** HyperFrames 0.8.106 measures the mixed AAC and, when its true peak passes -1 dBTP, lowers the whole track to -1.5 dBTP (`enforceAacTruePeak`). A louder mix can come out quieter. Compare an audio-only render with the sum of its stems: a uniform gap means the correction fired.
- **The limiter is an envelope follower.** The renderer's limiter has no lookahead and holds its envelope under the ceiling, so waveform peaks pass it by their crest factor. Put peak control in the ffmpeg masters.
- **The processing bump.** A clip that is at full level from its first sample and has any gain, `data-volume` or lane gets a 5 ms low-frequency bump of up to about 9 dB at about 0.14 and 0.37 s. Start the file with 0.1 s of silence.
- **Sub-bass in AAC.** Sub-bass downbeats made the encoder overshoot by up to 2.6 dB. A -9 dB low shelf at 100 Hz keeps them down.
- **ffmpeg `volume` with `eval=frame`** evaluates once per decoded frame (1152 samples for MP3), so a gain ramp becomes a staircase heard as clicks. Use `aeval` for any gain curve and check with an impulse scan.
- **`adelay` then `apad` or `atrim` in one graph** dropped about 56 ms from the head. Pad in a separate pass on a file input, and cross-correlate the master against its source above 300 Hz.
- **The carve ignores `data-media-start`.** It decodes the bed from the start of its file, so the bed edit is a file of its own that starts at film time 0.
- **`carve.mjs --voice` takes clip ids.** Without `--voice` it finds the narration clips and writes the group form.
- **A duck that releases in sub-second gaps pumps.** Hold the duck, the dip and the carve's dips across any gap under about 1.2 s.
- **A lift that starts on a swell extends the swell.** Lift a held chord only after the swell has decayed.
- **A take can end on the narrator's next breath.** Read a line's end no later than 0.4 s past its last word.
- **Many clips can mix differently between renders.** Three renders of journey-to-the-west's 24 clips decoded as two variants that differed from 8.7 s by a residual of -45 to -55 dBFS. Its final places one pre-mixed WAV.
- **zsh.** `$TAIL[m]` is an array subscript; write `${TAIL}[m]` in an ffmpeg graph label.
