#!/usr/bin/env node
// kit/sound/record.mjs: records takes from a film's lines file through
// kit/audio/el.mjs, which alone reads the ElevenLabs key, and transcribes each
// take with `el.mjs hear`.
//
//   node kit/sound/record.mjs <lines.json> [options] <id> ...
//
//   --takes <dir>       where the takes go (default: the lines file's "takes",
//                       relative to the lines file, else takes/ beside it)
//   --pattern <name>    a take's file name without .mp3, {id} replaced (default {id})
//   --as <name>         record one line under another name (a retake or a variant)
//   --text "<text>"     send this text instead of the line's
//   --prev "<text>"     send this previous text instead of the line's
//   --next "<text>"     send this next text instead of the line's
//   --stability <s>     override the voice file's stability for these takes
//   --style <s>         override the voice file's style for these takes
//   --why "<purpose>"   the purpose the request log records (default: the line id)
//   --hear              only transcribe existing takes
//   --no-hear           record without transcribing
//   --dry-run           print what each call would send, and exit before any call
//
// The lines file is {"lines": [{"id", "who", "text", "prev", "next"}, ...]},
// where prev and next are optional, with optional "voices" ({"<who>": "<voice
// file>"}), "takes" and "context" fields; or a plain {"<id>": "<text>"} map,
// read in key order as narrator lines.
//
// Voices come only from voice files, never from a voice id in a command or in
// this code. A line whose `who` the lines file maps under "voices" is read by
// that file (a path relative to the lines file). Every other line is the
// narrator, read by EL_VOICE_FILE, which must name a kit/audio/voice*.json
// (kit/audio/voice.json when it is unset). After each take, the take's .json
// must hold the voice id of the file it was recorded with.
//
// Context: a line's own prev and next are sent as the lines file gives them.
// With "context": "neighbours" (and always for a plain map), they are the
// texts of the lines before and after it with the same `who`. A take on a
// voice file whose model is eleven_v3 is sent without prev and next, which
// that model refuses.
//
// Every call to el.mjs appends one row to <takes>/el-calls.tsv: the time, the
// command, the purpose, the characters sent, the output, the voice file and
// the result, so the ledger (kit/sound/ledger.py) lists failed and replaced
// requests too.
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { voiceId } from '../audio/voices.mjs';

const EL = fileURLToPath(new URL('../audio/el.mjs', import.meta.url));
const KIT_AUDIO = fileURLToPath(new URL('../audio/', import.meta.url));
const USAGE = 'usage: node kit/sound/record.mjs <lines.json> [--takes <dir>] [--pattern <name>] [--as <name>] [--text ...] [--prev ...] [--next ...] [--stability s] [--style s] [--why ...] [--hear | --no-hear] [--dry-run] <id> ...';

const args = process.argv.slice(2);
const opt = (k) => {
  const i = args.indexOf(k);
  if (i < 0) return null;
  const v = args[i + 1];
  if (v === undefined) throw new Error(k + ' needs a value');
  args.splice(i, 2);
  return v;
};
const has = (k) => {
  const i = args.indexOf(k);
  if (i >= 0) args.splice(i, 1);
  return i >= 0;
};
if (args.includes('--voice')) throw new Error('--voice is refused: a voice comes from a voice file (EL_VOICE_FILE for the narrator, "voices" in the lines file for the others)');
const takesFlag = opt('--takes');
const pattern = opt('--pattern') || '{id}';
const as = opt('--as');
const text = opt('--text');
const prevFlag = opt('--prev');
const nextFlag = opt('--next');
const stability = opt('--stability');
const style = opt('--style');
const why = opt('--why');
const hearOnly = has('--hear');
const noHear = has('--no-hear');
const dry = has('--dry-run');
const [linesPath, ...ids] = args;
if (!linesPath || !ids.length) {
  console.error(USAGE);
  process.exit(2);
}
if (as && ids.length > 1) throw new Error('--as names one take; give one id');
const unknown = ids.filter((a) => a.startsWith('--'));
if (unknown.length) throw new Error('unknown option ' + unknown.join(' '));
if (!dry && !existsSync(EL)) throw new Error('no ' + EL + ': run the kit copy that sits beside kit/audio');

const LINES_DIR = dirname(resolve(linesPath));
const doc = JSON.parse(readFileSync(linesPath, 'utf8'));
const plainMap = !Array.isArray(doc.lines);
const lines = plainMap
  ? Object.entries(doc).filter(([k, v]) => !k.startsWith('_') && typeof v === 'string').map(([id, t]) => ({ id, who: 'N', text: t }))
  : doc.lines;
const neighbours = plainMap || doc.context === 'neighbours';
const takesDir = takesFlag ? resolve(takesFlag) : resolve(LINES_DIR, plainMap ? '.' : doc.takes || 'takes');
const voiceMap = plainMap ? {} : doc.voices || {};
if ('N' in voiceMap) throw new Error('the narrator (who N) is read by EL_VOICE_FILE, not by the lines file');

function readVoice(file) {
  if (!existsSync(file)) throw new Error('no voice file ' + file);
  const v = JSON.parse(readFileSync(file, 'utf8'));
  /* a voice whose id is not public is named ("voice": "Yun"), and its id comes from kit/audio/voices.local.json */
  if (!v.voice_id && v.voice) v.voice_id = voiceId(v.voice);
  if (!v.voice_id) throw new Error(file + ' names no voice_id and no voice');
  return v;
}

function narratorFile() {
  const f = resolve(process.env.EL_VOICE_FILE || join(KIT_AUDIO, 'voice.json'));
  if (!existsSync(f) || !existsSync(KIT_AUDIO) || realpathSync(dirname(f)) !== realpathSync(KIT_AUDIO) || !/^voice[^/]*\.json$/.test(basename(f))) {
    throw new Error('EL_VOICE_FILE must name a kit/audio/voice*.json file (the narrator); it names ' + (process.env.EL_VOICE_FILE || 'kit/audio/voice.json'));
  }
  return f;
}

function voiceFor(line) {
  const f = voiceMap[line.who];
  const file = f ? resolve(LINES_DIR, f) : narratorFile();
  return { file, label: f ? relative(LINES_DIR, file) : 'kit/audio/' + basename(file), ...readVoice(file) };
}

function context(line, key) {
  if (!neighbours) return line[key];
  const same = lines.filter((l) => l.who === line.who);
  const k = same.indexOf(line);
  const other = key === 'prev' ? same[k - 1] : same[k + 1];
  return other ? other.text : undefined;
}

const LOG = join(takesDir, 'el-calls.tsv');
// The log sits in the film folder, so a result keeps no machine path.
const tidy = (s) => s.split(LINES_DIR + '/').join('').split(homedir()).join('~');
function log(cmd, purpose, chars, out, voiceLabel, r) {
  if (!existsSync(LOG)) appendFileSync(LOG, 'when_utc\tcommand\tpurpose\tchars\toutput\tvoice_file\tresult\n');
  const result = tidy(r.status === 0 ? (r.stdout || '').split('\n')[0] : 'FAILED ' + (r.stderr || '').replace(/\s+/g, ' ')).slice(0, 200);
  const row = [new Date().toISOString().slice(0, 19) + 'Z', cmd, purpose, chars, out, voiceLabel, result];
  appendFileSync(LOG, row.map((v) => String(v).replace(/[\t\n]/g, ' ')).join('\t') + '\n');
}

// el.mjs runs from the lines file's folder with paths relative to it, so what it prints and logs is relative too.
function el(a, env, purpose, voiceLabel) {
  mkdirSync(takesDir, { recursive: true });
  a = [a[0], relative(LINES_DIR, a[1]), ...a.slice(2)];
  const r = spawnSync('node', [EL, ...a], { cwd: LINES_DIR, encoding: 'utf8', env: { ...process.env, ...env } });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  log(a[0], purpose, a[0] === 'line' ? [...a[2]].length : '', a[1], voiceLabel, r);
  if (r.status !== 0) throw new Error('el.mjs ' + a[0] + ' failed for ' + a[1]);
}

for (const id of ids) {
  const L = lines.find((l) => l.id === id);
  if (!L) throw new Error('no line ' + id + ' in ' + linesPath);
  const name = as || id;
  const out = join(takesDir, pattern.replaceAll('{id}', name) + '.mp3');
  if (!hearOnly) {
    const voice = voiceFor(L);
    const a = ['line', out, text || L.text];
    if (!/^eleven_v3/.test(voice.model || '')) {
      const p = prevFlag ?? context(L, 'prev');
      const n = nextFlag ?? context(L, 'next');
      if (p) a.push('--prev', p);
      if (n) a.push('--next', n);
    }
    if (stability) a.push('--stability', stability);
    if (style) a.push('--style', style);
    if (dry) {
      console.log(JSON.stringify({ id, voice_file: voice.label, voice_id: voice.voice_id, model: voice.model, el: a.map((v, i) => (i === 1 ? relative(LINES_DIR, v) : v)) }));
    } else {
      el(a, { EL_VOICE_FILE: voice.file }, why || (as ? `${id} as ${as}` : id), voice.label);
      const j = JSON.parse(readFileSync(out.replace(/\.mp3$/, '.json'), 'utf8'));
      if (j.voice_id !== voice.voice_id) throw new Error(`${name}: recorded with voice ${j.voice_id}, but ${voice.label} names ${voice.voice_id}`);
      console.log(`${name}: ${String(j.voice || '').split(' (')[0]}, ${j.model}, ${Number(j.duration).toFixed(2)} s`);
    }
  }
  if (noHear) continue;
  if (dry) console.log(JSON.stringify({ id, el: ['hear', relative(LINES_DIR, out)] }));
  else el(['hear', out], {}, `hear ${name}`, '');
}
