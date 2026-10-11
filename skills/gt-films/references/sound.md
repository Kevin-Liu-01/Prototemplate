# Sound in detail

This file is the detail behind section 7 of `../SKILL.md`: the ElevenLabs helper, the narrator, the kit's sound tools, the bed, the mix the blog films use, how to read the targets, model facts, and the traps. Paths are relative to `$PROTOTEMPLATE/motion/` unless they say otherwise.

## `kit/audio/el.mjs`

```sh
node kit/audio/el.mjs line  <out.mp3> "<text>" --prev "<previous line>" --next "<next line>" [--voice <name or voice_id>] [--stability S] [--style S] [--speed S]
node kit/audio/el.mjs bed   <out.mp3> "<music prompt>" [--seconds 24] [--influence 0.5] [--loop]
node kit/audio/el.mjs music <out.mp3> "<music prompt>" --seconds <film length> [--vocals]
node kit/audio/el.mjs hear  <file.mp3|wav|m4a|mp4> [--out <file.json>]
```

The bracketed values are the defaults. `line` takes its voice, stability, style and speed from `voice.json` unless a flag overrides one. Round 5's beds were requested at `--seconds 28 --influence 0.6`.

- `line` calls text to speech with timestamps and writes `<out>.json` beside the take: the text, the voice, the model, the speed, the duration, the first sound and the per-character alignment. Beats are timed from that file.
- `bed` calls sound generation, up to 30 s. `music` calls the Music API (`music_v1`) for exactly `--seconds`, instrumental unless `--vocals`.
- `hear` transcribes a take, a bed or a whole film with speech to text (`scribe_v1`, audio event tags on) and prints each word with its start time. It writes `<in>.stt.json`.
- The script reads the key from the ElevenLabs config file itself. The key never appears in an argument, an environment variable set in a prompt, a log or a message. On HTTP 429 it waits 5 s and retries once.
- `voice.json` holds `voice_id`, `name`, `model`, `stability`, `style`, `speed` and `chosen` (the date and Kevin's words). `EL_VOICE_FILE` names another file (the series recorders use `voice-series.json`, the same narrator). Without a voice file, `el.mjs` falls back to the premade voice Charlie.
- Only Frederick Surrey's id, which the slash-announcement credits on the site print, is written in a tracked file. Every other voice is named: `--voice Yun`, or `"voice": "Yun"` in a voice file, and `el.mjs`, `kit/audio/voices.mjs` and `voices.py` read its id from `kit/audio/voices.local.json`, which git ignores (`voices.example.json` lists the names). A missing file or name stops the script with a message that names the voice. Request ids and plan names stay out of tracked files too.
- One take per line unless a take is wrong, and at most two beds or compositions per film. Each film's NOTES.md keeps a ledger of every request, its purpose, its result and whether it was used. Test the Music API with a short request before composing a new bed.

## The narrator

| voice | used | settings | why it changed |
| --- | --- | --- | --- |
| Charlie (premade, Australian) | round 5, 2026-10-01 | stability 0.7, style 0.05 | the account then allowed premade voices only |
| Patrick (library) | round 7, 2026-10-02 | stability 0.7, style 0.05, speed 0.85 | Kevin: "make the voice more australian and make the voice less shaky"; the slowed takes measured 1.6 to 1.7 percent pitch wobble |
| Australian Baritone (library) | round 7b | stability 0.85, style 0, speed 1.0 | 0.56 percent wobble; Kevin then asked for "a much more friendly australian voice" |
| Clara (library) | round 7d, from 2026-10-02 | stability 0.65, style 0.2, speed 1.0 | "like 2 but more female", "lets use clara" |
| Frederick Surrey (library, British documentary) | the series from 2026-10-05, every film from 2026-10-06 | stability 0.55, style 0.2, speed 1.0 | Kevin picked him from thirteen series auditions, then "remember, we're using Frederick Surrey" |

- Auditions live locally in `kit/audio/auditions/`, one folder per round. Each candidate reads the same lines, mixed in context over a film's bed, with its pace in words a second and its median pitch wobble (autocorrelation F0 on 40 ms frames, the median frame-to-frame relative change). Kevin picks by ear from the sent set, on the audition page (`kit/review/`).
- Never generate below speed 1.0. Slowing a voice raised its wobble every time it was measured.
- Frederick Surrey's audition read 2.60 words a second (Clara's Fuma Nama takes read 2.53 overall, from 1.95 to 3.64 per line). Plan scripts on the narrator's measured rate, and lengthen a hold when a line runs long. Never speed up or time-stretch a take.
- Send one request per line with `--prev` and `--next` and nothing else, the request text exactly the script's, curly quotes included. A quote is read as a quote and its attribution follows a pause, lower in pitch.
- Respell a name in the request text only. Vercel is said VER-sel (the "ver" of version, the "cel" of acceleration): Fuma Nama's line 7 was retaken with "Ver-sell" for Clara, and for Frederick the request spells it "Vursell" (Kevin's standing rules, 2026-10-09). Frederick reads plain "shadcn" as "Shadikn", so send "shad C N". The film's cue tool joins the respelt parts back into the script's word.
- The transcriber writes some Australian vowels as other words ("Unkey" as "Anki", "Fumadocs" as "Fumadox"). That alone is no defect when the take is right; make the picture name the word (the Unkey mark rises on its name).
- Non-English passages use a voice for that language: the Mandarin library voice Yun for jihe-yuanben's and journey-to-the-west's passages, and a Hebrew voice on `eleven_v3` for modern-hebrew's 100 s cut (the v2 cut has no reader). jihe-yuanben's 界說 came back read jiěshuō and was pitch-corrected to jièshuō with the tone tools (`kit/sound/tones/`). A native listener signs off every non-English take before release.

## The kit's sound tools

`kit/sound/` holds one canonical copy of each tool the films shared, and `kit/sound/README.md` gives each one's usage, inputs and outputs and how every published film's frozen copy differs. A new film uses the kit; a published film keeps its own copies (`tools/`, `sound/tools/`, `lib/` or `audio/`), so its sound rebuilds exactly as it was made.

## The bed

- **Blog films** use round 5's sound generation (28 s), which Kevin asked for again in round 7c. Each film edits its own bed to the film's length (Fuma Nama with `lib/make-bed.mjs`, the docs film with `audio/make-bed.py`). Fuma Nama plays passage A (1.25 to 14.4 s of the source) and passage B (16.45 to 24.25 s) as A, B, A, B, A, B, then the source's own settle under the end card.
- **Joins** are 0.6 s raised-cosine crossfades between passages of the same chord colour, each placed under a narration line. The drone's two channels are often near anti-phase, so a join is pinned where the drone below 110 Hz holds steadiest in the left channel, the right channel and the mono fold-down. A join chosen on mono alone once notched one channel's drone by 21 dB. `make-bed.mjs --search` re-derives the pins.
- **Master EQ** (round 5's): a 38 Hz high-pass, a -6 dB low shelf at 110 Hz and a +5 dB bell at 300 Hz (Q 0.7), so the bed still carries on laptop and phone speakers. The master starts with 0.1 s of silence (see the processing bump below).
- **Music API compositions** ignore timing instructions: both of round 7b's compositions spent their first seconds building and ended before the film did. Plan an edit: find the body's pulse grid, choose the splice by band-envelope and chroma similarity, cut 2 ms before two corresponding attacks, and check the pulse intervals across the splice on the master.
- Prompts are instrumental with no vocals, drops, risers or genre cliches: fire is warm, dark and slow; blue is airy, glassy and precise; the series films avoid pastiche (jihe-yuanben's bed has no guqin, pentatonic figures or gong).
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
- The five films delivered by 2026-10-05 read -16.0 to -16.5 LUFS with true peaks of -2.0 to -3.0 dBTP; every lane since measures -16 LUFS within 0.5 and a true peak at or below -1 dBTP.
- Gaps under a second never let a ducked bed reach its full level. Measure the bed alone in the open and on the end card, and under speech inside the line windows.
- The final check is `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -` (`../scripts/measure-render.mjs` wraps it with the stream checks).

## Model facts

Measured on 2026-10-06 (licences read on 2026-10-05) by the video localization research and approved for public use on 2026-10-10. They matter when a film is re-voiced in another language or a script is written to a time budget. The films still never speed up or time-stretch a take.

1. `eleven_v4` ignores `voice_settings.speed`: one English sentence measured 2.80 s with speed unset, at 0.8 and at 1.2, and a German sentence kept the same 3.52 s span at all three settings.
2. `eleven_flash_v2_5` and `eleven_multilingual_v2` follow `voice_settings.speed`: from 0.7 to 1.2 the speech span of an English, a German and a Japanese sentence stayed within 7 percent of the default span divided by the speed (one sample per text and speed, so measure the take).
3. On `eleven_v4`, pace moves with inline tags: `[fast-paced]` shortened a line by about x0.83 and `[slowly]` lengthened it by about x1.15. One re-synthesis pass with these tags brought 14 of 18 lines within 10 percent of their slots; four missed or overshot.
4. Natural-language pace instructions do not set duration on Gemini TTS: "15 percent faster" gave x0.72 to x0.78 of the default span and "15 percent slower" x1.60 to x1.91 (medians over 21 German and 21 Japanese lines, `gemini-3.8-flash-tts` and `gemini-2.5-flash-preview-tts`).
5. `gemini-2.5-pro-preview-tts` and `gemini-2.5-flash-preview-tts` read a short prefix ending in a colon as a delivery instruction and leave it out of the audio. `gemini-3.8-flash-tts` and `gemini-3.8-flash-lite-tts` take delivery in `speech_metadata.style`, read the text verbatim, and dropped no word in 324 line renderings.
6. Of six engine and voice conditions on the same 40 German and 40 Japanese lines, `gemini-3.8-flash-tts` with the voice Charon had the lowest back-transcription error (German WER 2.42 percent, Japanese romaji CER 1.95 percent, against 3.08 and 3.38 percent for `eleven_v4`); only the Japanese difference from `eleven_v4` holds in a paired bootstrap.
7. `gemini-3.8-flash-tts` accepts a seed but does not reproduce audio with it: no take of 16 lines was byte-identical across three requests. Keep every take that passes; a re-request is a new draw.
8. An ffmpeg `atempo` speed-up of 1.10 on 40 lines per language did not measurably change back-transcription error (German WER 2.00 to 1.60 percent, inside the noise; Japanese 2.00 percent both), for one voice at one factor.
9. Asked for candidate translations no shorter than 0.85 of a line's target length, `claude-sonnet-5-5` still wrote 26.5 percent (German) and 22.0 percent (Japanese) of its candidates below 0.85. A prompt does not enforce a length floor; selection must reject short candidates.
10. Licences: OmniVoice, F5-TTS, E2-TTS, MaskGCT, Llasa, Voxtral TTS, Spark-TTS and XTTS-v2 have non-commercial weights, and Fish Audio S2 research-only weights; MOSS-TTS v1.5, VoxCPM2, Qwen3-TTS, CosyVoice and Kokoro are Apache-2.0, and Chatterbox is MIT with a watermark on every output. ffmpeg `atempo` is in FFmpeg's LGPL build and Signalsmith Stretch is MIT; Rubber Band is GPL-2.0-or-later, and ffmpeg's `rubberband` filter makes the FFmpeg build GPL.
11. List prices on 2026-10-06: `eleven_v4` $0.08 and `eleven_flash_v2_5` $0.04 per 1,000 characters, Scribe v2 $0.22 an hour; `gemini-3.8-flash-tts` $0.50 input and $9.00 output per 1M tokens and `gemini-3.8-flash-lite-tts` $0.50 and $6.00 (both double on 2027-01-01). At the measured 25 output tokens per audio second, that is about $0.0136 and $0.0091 per audio minute.

## Traps

- **The AAC true-peak correction.** HyperFrames 0.8.106 measures the mixed AAC and, when its true peak passes -1 dBTP, lowers the whole track to -1.5 dBTP (`enforceAacTruePeak`). A louder mix can come out quieter. Compare an audio-only render with the sum of its stems, or the render with its offline mix (`kit/sound/measure.py --ref`): a uniform gap means the correction fired.
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
