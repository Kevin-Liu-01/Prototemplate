# kit/sound

One canonical copy of the sound tools the films share: recording takes, the take ledger, click and harmony checks, render measurement, the mix, and (in `tones/`) the Mandarin tone tools. Each published film copied these tools from the film before it and edited them, so the copies drifted. This folder holds the version every new film uses. It was folded from the published films' frozen copies, and each tool was checked against them (see "How the copies were checked").

## The rule

- Published films keep their frozen copies. A published film's sound is rebuilt with the tools in its own folder, never with these.
- A new film uses `kit/sound`. It supplies its numbers in its own files (a lines file, a mix plan, a tone spec) and never edits a kit tool. A tool changes here, for every film.
- Film constants stay out of this folder: no script text, line ids, bed edits, cue times or voice ids.

## Requirements

- python3 with numpy (checked with Python 3.14 and numpy 2.5)
- ffmpeg with the `alimiter` (including its `latency` option) and `ebur128` filters (checked with ffmpeg 8.1)
- node (checked with node 24), for `record.mjs`
- `kit/audio/el.mjs` beside this folder. It is the only reader of the ElevenLabs key. `record.mjs` and `tones/hearctx.sh` call it; every other tool here works offline and makes no request.

Run the tools from the film folder through its `kit` link (`films/<slug>/kit -> ../../kit`), for example `python3 kit/sound/mix.py sound/plan.json`. Paths inside a lines file, plan or spec are relative to that file.

## The tools

### record.mjs

Records takes from a film's lines file through `kit/audio/el.mjs` and transcribes each with `el.mjs hear`.

```sh
node kit/sound/record.mjs <lines.json> [--takes <dir>] [--pattern <name>] [--as <name>] [--text "..."] [--prev "..."] [--next "..."] [--stability s] [--style s] [--why "..."] [--hear | --no-hear] [--dry-run] <id> ...
```

- Input: a lines file, `{"lines": [{"id", "who", "text", "prev", "next"}, ...]}` (prev and next optional) with optional `"voices": {"<who>": "<voice file>"}`, `"takes": "<dir>"` and `"context": "neighbours"`; or a plain `{"<id>": "<text>"}` map, read in key order as narrator lines.
- Voices come only from voice files. A voice whose id is not public is named in its voice file (`"voice": "Yun"`), and its id comes from `kit/audio/voices.local.json`, which git ignores (`kit/audio/voices.example.json` lists the names); a missing id stops the take with a message that names the voice. The narrator (every line whose `who` the lines file does not map) is read by `EL_VOICE_FILE`, which must name a `kit/audio/voice*.json` (default `kit/audio/voice.json`). Another speaker, such as a reader, is read by the voice file the lines file maps to its `who`. `--voice` is refused, and no voice id appears in a command or in this code.
- Context: a line's own prev and next are sent as given. With `"context": "neighbours"`, and always for a plain map, they are the texts of the lines before and after it with the same `who`. A voice file whose model is `eleven_v3` is sent without prev and next, which that model refuses.
- Output: `<takes>/<name>.mp3`, the `.json` that `el.mjs line` writes beside it (text, voice, voice id, model, speed, duration, per-character alignment) and `<name>.stt.json` from `hear`. After each take, the take's `.json` must hold the voice id of the file it was recorded with, or the run stops. Every call appends one row to `<takes>/el-calls.tsv` (time, command, purpose, characters sent, output, voice file, result), with paths relative to the lines file.
- `--dry-run` prints each request it would send and exits before any call.

### ledger.py

Prints the take ledger for a film's NOTES.md as Markdown.

```sh
python3 kit/sound/ledger.py <takes folder> [--ctx <folder>] [--calls <el-calls.tsv>] [--voices <voice.json> ...]
```

- Input: every take record in the folder (a `.json` with a `text` and an `alignment` or `voice_id`), its `.stt.json`, the carrier transcripts in `--ctx` (default `<takes>/_ctx`) and the request log (default `<takes>/el-calls.tsv`).
- Output (stdout): one row per take in natural order (n2 before n10): the text given, the voice and model, the length, what `el.mjs hear` returned, and what it heard behind the carrier where `tones/hearctx.sh` ran. A take that `tones/splice.py` or `tones/tune.py` built says what it was built from. Then every request from the log, failed and replaced ones included.
- The voice is named by the take's own record. When the record holds only a voice id, the name comes from `kit/audio/voice*.json` and any `--voices` file.

### clicks.py

Looks for clicks in a take, a stem or a mix.

```sh
python3 kit/sound/clicks.py <file> [threshold] [--edges <clips.json>]
python3 kit/sound/clicks.py --hf <file> [db] [--edges <clips.json>]
```

- The default detector works per channel at full band: a sample whose second difference stands more than `threshold` (12) times above its 10 ms block's median and above 0.01. Hits within 50 ms merge, and the first 40 print.
- `--hf` works on the mono fold-down high-passed at 3 kHz: a 1 ms window more than `db` (24) above the median of the 60 ms around it, and above -70 dB. Hits within 20 ms merge, and all print.
- `--edges` names the clip edges within 15 ms of each hit: every object in any list of the JSON file with numeric `start` and `duration`, named by its `id`, `kind` or `name`.

### chroma.py

Pitch-class profile of a music take, its best matching keys and its beat.

```sh
python3 kit/sound/chroma.py <music file> [--window START END] [--sections S] [--band LOW HIGH] [--frame N] [--hop H] [--per-frame]
```

- Folds 55 to 2000 Hz (`--band`) into the twelve pitch classes over 8192-sample Hann frames every 2048 at 22.05 kHz, and prints each class's share strongest first, the seven strongest classes in pitch order (the check that a bed is not built on a five-note set), the four best matching keys (Krumhansl profiles) and the strongest spectral-flux period between 0.4 and 2.5 s.
- `--sections S` adds the six strongest classes of each S-second section; the whole profile is then the sum of the sections. `--per-frame` weighs every frame alike instead of by its energy.

### measure.py

Measures a render or any audio file.

```sh
python3 kit/sound/measure.py <render.mp4> [--ref <offline mix.wav>] [--out <measure.json>]
```

- Prints the streams (ffprobe), the audio length minus the video length (MOTION.md asks for 0), the integrated loudness, loudness range and true peak (ebur128), and with `--ref` the best alignment against the offline mix within 20 ms, the residual and the level difference. A uniform level difference means the renderer changed the gain (the AAC true-peak correction). `--out` writes every number as JSON.

### mix.py

A film's sound from a plan file: the voice masters, the placed narration, the bed's level and duck, and the premix, with a report.

```sh
python3 kit/sound/mix.py <plan.json> [--only masters|bed|premix] [--dry-run]
```

The plan is JSON in the film folder. A key it leaves out takes the default in `DEFAULTS` at the top of `mix.py`, which is the newest published chain tuned to MOTION.md's targets; an unknown key is an error. The module docstring lists every key. The stages:

- **Masters.** Each line's take is decoded (optionally through `decode_filters` at the take's own rate), cut (`cut`, or from 0 to `trim.tail` after its last word, never later than `trim.guard` before the next line's first word), optionally levelled (`pre_level`), faded (`fade`, `fade_shape`), filtered (`filters`: by default a 70 Hz high-pass and a 2:1 compressor), brought to its loudness (`level`) and held by ffmpeg's lookahead limiter at 192 kHz (`limiter`, default a -3.5 dB ceiling). `level.mode` is `take` (every master at `lufs` integrated, mono, measured after the limiter and corrected up to `passes` times; default -19 LUFS, which reads about -16 LUFS in the film as dual mono) or `dialogue` (one gain for every take, so the placed dialogue measures `lufs`). Masters are written mono or dual mono (`channels`), 24 bit.
- **Placement.** A line's `start` is the film time of the take's 0, or `at` gives the film time of its first word and the start comes from the take's `.json` alignment. The first and last words (for the trim and the duck) come from the same alignment unless the line gives `first` and `last`. `round_ms` places clips on whole milliseconds, as the renderer's `adelay` does.
- **Bed.** The music file (already cut to the film by the film's own tool) is set to its alone level: by default so that its loudest 400 ms where it plays free (the open, released gaps, the card) measures -20 LUFS (`alone_peak_m`); or `alone_lufs` for the whole unducked bed; or a fixed `gain_db`. The duck holds the bed down through every gap under `hold_gap` (1.2 s), with raised-cosine ramps (`ramp_in`, `ramp_out`, `ramp_out_last`, `lead`, `after`) and an optional partial lift in long held gaps (`gap_lift`). Its depth is `db`, or is solved so the bed measures `under_lufs` (-26) inside the line windows, and is never above 0 dB. Then fades (0.3 s in, 0.8 s out) and a -6 dB ceiling.
- **Premix.** Narration, bed and any finished `stems` are summed and set to -16 LUFS integrated with one gain (or a fixed `gain_db`), under a -2 dB ceiling at 192 kHz, so the AAC encode stays at or under -1 dBTP.
- **Report.** Every line's placement, gain, loudness and true peak; the gaps; the narration; the bed (alone gain, duck depth, held windows, loudness whole and under speech, the loudest free 400 ms); the premix (gain, loudness, true peak, range, length); and the clips (file, start, duration) for a composition that places the masters as `<audio>` elements. Placing the one premix instead keeps two renders identical (journey-to-the-west's finding).

A minimal plan with every default:

```json
{
  "duration": 40.0,
  "lines": [
    {"id": "line1", "take": "takes/line1.mp3", "at": 0.6},
    {"id": "line2", "take": "takes/line2.mp3", "at": 4.2}
  ],
  "bed": {"file": "music/bed-edit.wav"},
  "premix": {"out": "film-premix.wav"}
}
```

ebur128 prints integrated loudness to 0.1 LU, so measured gains land on 0.1 dB steps. Every meter here shares that resolution.

### audio_util.py

The helpers the Python tools import: `load` (decode to float32 through ffmpeg), `save` (24- or 16-bit PCM WAV), `rms_db`, `extent` and `lufs`.

### tones/

The Mandarin tone tools. They read a take's `.json` alignment; the readers print and write nothing.

- `tones.py <take> [expected tones]`: each Han character's contour in semitones against the take's median (YIN, 10 ms hop, 140 to 480 Hz), read as H (tone 1), R (tone 2), L (tone 3) or F (tone 4). It also holds the `yin()` tracker the others share.
- `pitch.py [--ref HZ] [--span T0 T1] <take> ...`: the same read with a 70 Hz floor, so a low voice's third tone does not clip. Each character's start, end, peak, low and fall are given against `--ref` (the voice's speech median) or, without it, the take's own median.
- `f0dump.py <take> [--marks json|stt] [--fmin HZ] [--fmax HZ] [--level]`: the F0 contour every 20 ms with each character (or transcript word) marked, to read tone shapes by eye; `--level` adds dB and Hz columns.
- `psola.py`: `retune(x, sr, t0, t1, contour, ref, stretch)` re-pitches one syllable by TD-PSOLA on the voice's own glottal periods and keeps the rest of the take sample for sample.
- `splice.py <spec.json> [name ...]`: builds a take from pieces of other takes of the same voice, cut inside pauses, levelled to one speech RMS, joined with 8 ms fades and given silences. Writes `<name>.wav`, `.mp3` and `.json`. `splice.py join [--takes <dir>] <out> <takeA> <cutA> <prefixA> <takeB> <cutB> <restB>` joins two takes of one line at a silence with a 15 ms equal-power crossfade (it works for any language).
- `tune.py <spec.json> [name ...]`: builds tone-corrected takes the same way, re-pitching the syllables the spec names.
- `hearctx.sh [--ctx <dir>] [--dry-run] <carrier.mp3> <take.mp3> ...`: transcribes short takes behind a carrier phrase (a take of the same voice that transcribes exactly), so speech to text settles on the language first. It writes `<ctx>/<take>.wav` and `el.mjs hear`'s `.stt.json`, which the ledger shows. `--dry-run` builds the joined files without calling el.mjs.

The spec that `splice.py` and `tune.py` read:

```json
{
  "sr": 44100, "takes": "takes", "out": "takes", "ref_hz": 200,
  "contours": {"fall": [[0, 5.0], [0.3, 5.5], [1.0, -6.0]]},
  "splice": {"x1s": {"text": "<the take's text>", "pieces": [
    {"src": "x1", "from": 0.0, "to": 0.8, "silence": 0.0, "chars": [["<char>", {"index": 0}]]},
    {"src": "x1b", "from": 1.2, "to": 2.1, "silence": 0.05, "chars": [["<char>", 1.25]]}]}},
  "tune": {"x2t": {"text": "<the take's text>", "pieces": [
    {"src": "x2", "from": 0.3, "to": 0.8, "silence": 0.0, "chars": [["<char>", 0.31]], "retune": [[0.32, 0.5, "fall", 1.2]]}]}}
}
```

A character's onset is seconds in the source take, or `{"index": k}` for the start of character k in the source's alignment. A retune is `[t0, t1, contour, stretch]`: the syllable's span in the source take, a contour name or `[[u, st], ...]` (u from 0 to 1 over the voiced span, st in semitones against `ref_hz`), and the voiced span's new length as a multiple of the old. `voice` (`{"voice", "voice_id", "model"}`) is optional; without it a built take's record copies its first source's.

## The frozen copies

Where each published film's copy lives (under `motion/films/<film>/`) and how it differs from the canonical one.

| frozen copy | canonical | how it differs |
| --- | --- | --- |
| jihe-yuanben `tools/audio_util.py`, journey-to-the-west `sound/tools/audio_util.py` | `audio_util.py` | the same functions; the kit's `rms_db` also folds a stereo input and has a default rate, `load` takes a dtype, `lufs` returns None where ebur128 prints no summary |
| modern-hebrew `sound/tools/audio_util.py` | `audio_util.py` | `load` returns float64 (the same values; the kit defaults to float32) |
| jihe-yuanben `tools/record.mjs` | `record.mjs` | fixed paths (`tools/lines.json`, `audio/`); the reader's voice id and settings are in the code and sent with `--voice` (the kit reads them from a voice file) |
| journey-to-the-west `sound/tools/record.mjs` | `record.mjs` | an absolute el.mjs path; refuses reader lines; wants `voice-series.json` by name and checks the voice's name (the kit checks the voice id of any `kit/audio/voice*.json`) |
| modern-hebrew `sound/tools/record.mjs` | `record.mjs` | narrator only (its reader used he-line.mjs); wants `voice-series.json` by name |
| slash-announcement `lib/take.sh` | `record.mjs` with a plain map, `--pattern vo-{id} --no-hear` | the line order is in the script; no hear, no voice check, no log |
| jihe-yuanben `tools/ledger.py` | `ledger.py` | voice names from an id table in the code, no model, no carrier column, files skipped by name |
| journey-to-the-west `sound/tools/ledger.py` | `ledger.py` | names every take whose voice is not one hard-coded id after the reader, so its 12 narrator takes read as the reader's |
| jihe-yuanben `tools/clicks.py`, journey-to-the-west `sound/tools/clicks.py` | `clicks.py` | the same detector and output; the kit adds `--hf` and `--edges` |
| modern-hebrew `sound/tools/clicks.py` | `clicks.py --hf --edges <manifest.json>` | reads the film's manifest and mix by fixed paths |
| jihe-yuanben `tools/chroma.py` | `chroma.py --sections 8` | per-section only; sharps written A#, C#, D#, F#, G# (the kit writes B♭, C♯, E♭, F♯, A♭) |
| journey-to-the-west `sound/tools/chroma.py` | `chroma.py --frame 4096 --per-frame` | whole-file shares and the seven strongest only |
| modern-hebrew `sound/tools/chroma.py` | `chroma.py --band 40 2000 [--window S E]` | a 40 Hz band edge; no seven strongest |
| jihe-yuanben `tools/measure.py` | `measure.py --ref <mix> --out <json>` | the offline mix and the JSON at fixed paths; stops on an audio-only file; no length line |
| jihe-yuanben `tools/mix.py` | `mix.py`, level mode `dialogue` | its masters are a dialogue-mode plan (decode filters, speech-RMS pre-level, sin squared fades, one gain to -16.1 LUFS, a 0.66 limit at 1 ms attack with asc, post fades); its music re-cut, level ride, speech-to-music floors, room tone, effects and `index.html` block stay with the film |
| journey-to-the-west `sound/tools/build_vo.py`, `build_mix.py`, `tools/premix.py` | `mix.py` | build_vo levels by active speech level and adds zero-phase high-passes and a de-pop blend, which the kit does not have; the premix's fixed gain and millisecond placement are the kit's premix `gain_db` and `round_ms`; the bed sections and room tone stay with the film |
| modern-hebrew `sound/tools/mix.py` | `mix.py` | its layout from plan.json, the phrase rider, the per-take loudness after the filters, the effects and `cues.js` stay with the film; its duck interpolates amplitude where the kit's interpolates dB |
| slash-announcement `lib/mix.py` | `mix.py`, level mode `take` | its masters are the kit's defaults with `latency` off; its bed edit, gap floors and card trim solve stay with the film |
| blog-designing-docs `audio/mix.py` | `mix.py`, level mode `take`, one pass | its own trim (given to the kit as `cut`), a 60 Hz high-pass, the bed's spectral dip under the voice and a 16-bit dithered writer (the dip and the writer are not in the kit) |
| blog-fuma-nama `lib/make-voice.mjs` (with `make-mix.mjs`, `make-bed.mjs`) | `mix.py` | one ffmpeg graph at the take's 44.1 kHz and a pre-level after the high-pass; its limiter already compensates its latency (the kit's default); the HyperFrames mix block and carve stay with the film |
| jihe-yuanben `tools/tones.py`, journey-to-the-west `sound/tools/tones.py` | `tones/tones.py` | identical logic |
| jihe-yuanben `tools/pitch.py` | `tones/pitch.py --ref <Hz>` | the reference is the reader's median as a constant |
| jihe-yuanben `tools/psola.py` | `tones/psola.py` | the reference is a constant (the kit's `retune` takes `ref`) |
| jihe-yuanben `tools/tune.py` | `tones/tune.py <spec>` | its contours and pieces are in the code |
| jihe-yuanben `tools/splice.py` | `tones/splice.py <spec>` | its pieces are in the code; a silence is truncated to a sample (the kit rounds) |
| modern-hebrew `sound/tools/splice.py` | `tones/splice.py join` | positional arguments and a fixed `takes/` folder |
| jihe-yuanben `tools/hearctx.sh`, journey-to-the-west `sound/tools/hearctx.sh` | `tones/hearctx.sh` | zsh; the carrier take is fixed (one film's take; journey's by an absolute path) and the takes are named by id |
| jihe-yuanben `tools/f0dump.py` | `tones/f0dump.py --marks stt` | the transcript marks only |
| journey-to-the-west `sound/tools/f0.py` | `tones/f0dump.py --marks json --fmin 70 --fmax 400 --level` | the alignment marks and level columns only |

## What the canonical copies change

Generic fixes, each from a published copy or found while comparing them:

- **The limiter's delay.** ffmpeg's `alimiter` without `latency=1` delays its output by its attack, less one sample at the rate it runs: 959 samples at 192 kHz (4.995 ms) for a 5 ms attack, and the last 4.995 ms of the input never comes out. The output is otherwise identical (residual -300 dB). Every published Python mix limits that way, so its masters sit about 5 ms (1 ms at a 1 ms attack) late against their `.json` timings; journey-to-the-west's premix limits a second time. blog-fuma-nama's `make-voice.mjs` sets `latency=1`, and the kit's limiter does by default. Set `"latency": false` to reproduce a published chain.
- **A duck never lifts.** A solved duck depth above 0 dB is clamped to 0, and the report says so.
- **record.mjs** creates the takes folder before a request, because a request that cannot write its take has already spent credits; checks the voice id rather than a voice name; and keeps machine paths out of its log.
- **ledger.py** names voices from the takes' own records, which fixes journey-to-the-west's misnamed narrator takes, and escapes `|` in text.
- **measure.py** measures audio-only files and silent tracks (`-inf`).
- **splice.py** rounds a silence to the nearest sample.

Ported from two later films' recorders, as code logic with no film content:

- **The request log** (`el-calls.tsv`: when, command, purpose, characters, output, voice file, result), from those films' `el.mjs` wrappers. `record.mjs` writes it and `ledger.py` prints it, so the ledger lists failed and replaced requests.
- **The purpose of a request** (`--why`), from the same films' recorders.
- **Context from neighbouring lines of the same speaker**, which those recorders also use; slash-announcement's published `take.sh` takes it from the line order.

## Left out

- **modern-hebrew's `he-line.mjs`** reads the ElevenLabs key itself, which breaks the rule that `kit/audio/el.mjs` alone reads it, and `el.mjs` has no model or language flag (and is not changed here). A reader on another model goes through `record.mjs` with a voice file whose `model` is `eleven_v3`: `el.mjs` takes the model from the file `EL_VOICE_FILE` names, which is what journey-to-the-west's v3 retakes did through a symlinked `el.mjs`. he-line.mjs's language code, its route without timings, its fixed-language `hear` and its voice and credit lookups have no `el.mjs` route, so the tool stays with modern-hebrew.
- **journey-to-the-west's `sound/tools/v3/`** (a symlink to the kit's el.mjs, a local voice file and `line.sh`): replaced by a reader voice file in the lines file.
- **jihe-yuanben's `sylls.py`**: no published film's notes use it; `tones.py` reads each syllable from the alignment and `f0dump.py --marks stt` reads against the transcript.
- **Per-film tools**: jihe-yuanben's `timeline.py`, `events.mjs` and the rest of its `tools/`; journey-to-the-west's `timeline.py`, `plan.py`, `cues.py`, `manifest.py`, `make_grain.py`, `compose.py`; modern-hebrew's mix layout; slash-announcement's `cues.mjs`, `cues.js`, `words.mjs`; blog-fuma-nama's `cues.mjs`, `make-bed.mjs`, `make-mix.mjs`; blog-designing-docs' `make-bed.py`. Each encodes its own film's beat clock, bed edit or composition.

## How the copies were checked

On 2026-10-10 each canonical tool and the frozen copy it came from ran on the same local files (the published films' takes, masters, mixes and renders, read only), with the frozen copies run from scratch copies.

- `clicks.py`: byte-identical output on four mixes and masters against both second-difference copies, and on two modern-hebrew files with `--hf --edges` (one hit names a clip edge).
- `chroma.py`: every share, key and period identical to the three published variants (two section lengths, per-frame, whole file and a window).
- `measure.py`: identical numbers on jihe-yuanben's published render against its offline mix.
- `ledger.py`: 72 jihe-yuanben and 42 journey-to-the-west rows with identical take, text, length and transcript cells (and carrier cells, which only journey-to-the-west's prints); the voice cells differ as listed above.
- `record.mjs`: against a stand-in for el.mjs that makes no request, the requests it would send (voice id, text, model, settings, context) are identical to each frozen recorder's: 8 of 8 (jihe-yuanben, with a reader voice file holding the settings its code sent), 6 of 6 (journey-to-the-west), 6 of 6 (modern-hebrew), 3 of 3 (slash-announcement's take.sh).
- `mix.py`: masters sample-exact in memory with the frozen code's: 5 of 5 (slash-announcement), 17 of 17 (jihe-yuanben, dialogue mode), 10 of 10 (blog-designing-docs). jihe-yuanben's 17 master files, written by the kit, are byte-identical to the published ones. slash-announcement's differ by at most 1 LSB at 24 bits (residual -122 dB), because the kit writes WAVs with `audio_util.save` where that film let ffmpeg convert. A plan restating slash-announcement's premix (its masters from the takes, its bed master as a stem) reproduces the published `film-premix.wav` within 2 LSB at 24 bits (residual -125 dB), with the same gains, loudness, true peaks, range and length in the report. The duck envelope is identical to blog-designing-docs' (with its gap lift) and to slash-announcement's.
- `tones/`: `tones.py` 14 of 14, `pitch.py` 2 of 2 and `f0dump.py` 6 of 6 outputs byte-identical; `tune.py` and `splice.py` rebuild jihe-yuanben's seven built takes byte-identical (WAV, MP3, JSON), and `splice.py join` rebuilds modern-hebrew's joined take; `hearctx.sh` builds the same joined files.
