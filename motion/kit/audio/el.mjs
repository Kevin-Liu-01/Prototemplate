#!/usr/bin/env node
/*
 * GT motion kit: ElevenLabs narration and music beds for the films.
 *
 * The key is read from ~/.config/elevenlabs-sfx/config.yml (api_key: "..."),
 * never from an argument or the environment of a prompt, and never printed.
 * The narrator is whatever kit/audio/voice.json
 * names (voice_id, name, model, stability, style, speed); without that file
 * it falls back to the premade Australian voice Charlie. Music beds come
 * from the Music API (`music`, any length) or the older sound generation
 * endpoint (`bed`, up to 30 s).
 *
 * A voice id that is not public never enters a tracked file. A voice file
 * may name its voice ("voice": "Yun") in place of a voice_id, and --voice
 * may take a name; the id is then read from voices.local.json beside this
 * file (git ignores it; voices.example.json lists the names). A missing file
 * or name stops the take with a message that says which. Frederick Surrey's
 * id is public and stays in voice.json.
 *
 * Usage:
 *   node el.mjs line  <out.mp3> "<text>" [--prev "<previous line>"] [--next "<next line>"] [--stability 0.7] [--style 0.05] [--speed 0.92]
 *       Narration for one line, plus <out>.json with the duration and the
 *       per character timings (the with-timestamps endpoint), so a beat can
 *       start when its words start. --speed is ElevenLabs' own delivery
 *       rate (0.7 to 1.2, default 1.0): the voice is generated slower or
 *       faster, so nothing is time-stretched afterwards.
 *   node el.mjs bed   <out.mp3> "<music prompt>" [--seconds 24] [--influence 0.5] [--loop]
 *       A music bed from the sound generation endpoint.
 *   node el.mjs music <out.mp3> "<music prompt>" [--seconds 44] [--vocals]
 *       A composed music bed from the Music API (music_v1), instrumental
 *       unless --vocals, exactly --seconds long.
 *   node el.mjs line ... [--voice <name or voice_id>] overrides voice.json for one take.
 *   node el.mjs hear  <in.mp3|wav|m4a|mp4> [--out <file.json>]
 *       Transcribes a take or a mix (speech to text, scribe_v1, with audio
 *       event tags) and prints the words with their start times, so a lane
 *       can check what was said, how names came out, and that a bed holds
 *       no voice. Writes <in>.stt.json unless --out names another file.
 *
 * One take per line unless a take is wrong, at most two beds per film.
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHARLIE = { voice: 'Charlie', name: 'Charlie', model: 'eleven_multilingual_v2', stability: 0.7, style: 0.05 };
// The ids of the voices tracked files name, from the ignored local file beside
// this script's real path (it also runs through symlinks with
// --preserve-symlinks, so no relative import is used here).
const LOCAL_VOICES = join(dirname(realpathSync(fileURLToPath(import.meta.url))), 'voices.local.json');
function voiceIdOf(name) {
  if (!existsSync(LOCAL_VOICES)) {
    throw new Error(`the voice "${name}" needs ${LOCAL_VOICES}: copy voices.example.json beside it to voices.local.json and fill in each voice's ElevenLabs id`);
  }
  const id = (JSON.parse(readFileSync(LOCAL_VOICES, 'utf8')).voices || {})[name];
  if (!id) throw new Error(`${LOCAL_VOICES} has no id for the voice "${name}": add it (voices.example.json lists the names)`);
  return id;
}
// EL_VOICE_FILE picks another narrator file (the translation series uses
// voice-series.json); without it the narrator is voice.json.
const VOICE_FILE = process.env.EL_VOICE_FILE || new URL('./voice.json', import.meta.url).pathname;
const NARRATOR = existsSync(VOICE_FILE) ? { ...CHARLIE, ...JSON.parse(readFileSync(VOICE_FILE, 'utf8')) } : CHARLIE;
const MODEL = NARRATOR.model;

function key() {
  const cfg = readFileSync(homedir() + '/.config/elevenlabs-sfx/config.yml', 'utf8');
  const m = cfg.match(/^api_key:\s*"?([^"\n]+)"?/m);
  if (!m) throw new Error('no api_key in ~/.config/elevenlabs-sfx/config.yml');
  return m[1].trim();
}

function flag(args, name, fallback) {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
}

async function post(url, body) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const form = body instanceof FormData;
    const res = await fetch(url, {
      method: 'POST',
      headers: form ? { 'xi-api-key': key() } : { 'xi-api-key': key(), 'Content-Type': 'application/json' },
      body: form ? body : JSON.stringify(body),
    });
    if (res.status === 429 && attempt === 0) {
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ElevenLabs ${res.status}: ${text.slice(0, 400)}`);
    }
    return res;
  }
  throw new Error('ElevenLabs: rate limited twice');
}

const [cmd, out, text, ...rest] = process.argv.slice(2);
if (cmd === 'hear' && out) {
  const args = process.argv.slice(4);
  const form = new FormData();
  form.append('model_id', 'scribe_v1');
  form.append('tag_audio_events', 'true');
  form.append('timestamps_granularity', 'word');
  form.append('file', new Blob([readFileSync(out)]), out.split('/').pop());
  const res = await post('https://api.elevenlabs.io/v1/speech-to-text', form);
  const j = await res.json();
  const dest = flag(args, '--out', null) || out.replace(/\.[^./]+$/, '') + '.stt.json';
  writeFileSync(dest, JSON.stringify(j, null, 1));
  console.log(`heard ${out} (${j.language_code ?? '?'}):`);
  console.log(j.text);
  for (const w of j.words || []) if (w.type !== 'spacing') console.log(`${(w.start ?? 0).toFixed(2).padStart(6)}  ${w.text}`);
  process.exit(0);
}
if (!cmd || !out || !text) {
  console.error('usage: node el.mjs line <out.mp3> "<text>" [--prev ...] [--next ...] | bed <out.mp3> "<prompt>" [--seconds N] [--loop]');
  process.exit(2);
}

if (cmd === 'line') {
  const body = {
    text,
    model_id: MODEL,
    voice_settings: {
      stability: Number(flag(rest, '--stability', NARRATOR.stability)),
      similarity_boost: 0.8,
      style: Number(flag(rest, '--style', NARRATOR.style)),
      use_speaker_boost: true,
    },
  };
  const speed = flag(rest, '--speed', NARRATOR.speed ?? null);
  if (speed) body.voice_settings.speed = Number(speed);
  const prev = flag(rest, '--prev', null);
  const next = flag(rest, '--next', null);
  if (prev) body.previous_text = prev;
  if (next) body.next_text = next;
  const voiceArg = flag(rest, '--voice', null);
  const voiceId = voiceArg ? (/^[A-Za-z0-9]{20}$/.test(voiceArg) ? voiceArg : voiceIdOf(voiceArg)) : NARRATOR.voice_id || voiceIdOf(NARRATOR.voice);
  const voiceName = voiceId === NARRATOR.voice_id ? NARRATOR.name : voiceArg || NARRATOR.name;
  const res = await post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, body);
  const j = await res.json();
  writeFileSync(out, Buffer.from(j.audio_base64, 'base64'));
  const a = j.alignment || j.normalized_alignment || {};
  const ends = a.character_end_times_seconds || [];
  const starts = a.character_start_times_seconds || [];
  const duration = ends.length ? ends[ends.length - 1] : null;
  writeFileSync(out.replace(/\.mp3$/, '.json'), JSON.stringify({ text, voice: voiceName, voice_id: voiceId, model: MODEL, speed: body.voice_settings.speed ?? 1, duration, firstSound: starts[0] ?? 0, alignment: a }, null, 1));
  console.log(`line ${out}: ${duration?.toFixed(2)} s`);
} else if (cmd === 'music') {
  const seconds = Number(flag(rest, '--seconds', 44));
  const body = { prompt: text, music_length_ms: Math.round(seconds * 1000), model_id: 'music_v1' };
  if (!flag(rest, '--vocals', false)) body.force_instrumental = true;
  const res = await post('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', body);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`music ${out}: ${seconds} s requested`);
} else if (cmd === 'bed') {
  const body = { text, prompt_influence: Number(flag(rest, '--influence', 0.5)), duration_seconds: Number(flag(rest, '--seconds', 24)) };
  if (flag(rest, '--loop', false)) body.loop = true;
  const res = await post('https://api.elevenlabs.io/v1/sound-generation', body);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`bed ${out}: ${body.duration_seconds} s requested`);
} else {
  console.error('unknown command ' + cmd);
  process.exit(2);
}
