// modern-hebrew: records narrator takes from sound/lines.json through
// kit/audio/el.mjs (which alone reads the ElevenLabs key for the narrator)
// and transcribes each with `el.mjs hear`.
// v2 (2026-10-05): the narrator is the translation series' voice, Frederick
// Surrey, named by kit/audio/voice-series.json. Run with
//   EL_VOICE_FILE=<motion>/kit/audio/voice-series.json node sound/tools/record.mjs ...
// The script refuses to record without it, and checks that every take's .json
// names Frederick Surrey.
//   node sound/tools/record.mjs n01 n02 ...         record and hear those ids
//   node sound/tools/record.mjs --hear n01 ...      only transcribe existing takes
//   node sound/tools/record.mjs --as n06b --text "..." n06
//                                                  record a variant under another name
// Takes land in sound/takes/<id>.mp3 with <id>.json (timings) and <id>.stt.json.
// The Hebrew reader's take is made with sound/tools/he-line.mjs (eleven_v3).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SOUND = new URL('..', import.meta.url).pathname;
const EL = new URL('../../../../kit/audio/el.mjs', import.meta.url).pathname;
const { lines } = JSON.parse(readFileSync(SOUND + 'lines.json', 'utf8'));
const args = process.argv.slice(2);
const opt = (k) => {
  const i = args.indexOf(k);
  if (i < 0) return null;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const hearOnly = args.includes('--hear');
if (hearOnly) args.splice(args.indexOf('--hear'), 1);
const as = opt('--as');
const text = opt('--text');
const prev = opt('--prev');
const next = opt('--next');
const stab = opt('--stability');
const VF = process.env.EL_VOICE_FILE || '';
if (!hearOnly && !VF.endsWith('/kit/audio/voice-series.json')) throw new Error('set EL_VOICE_FILE to kit/audio/voice-series.json (the series narrator)');

function run(a) {
  const r = spawnSync('node', [EL, ...a], { cwd: SOUND, encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  if (r.status !== 0) throw new Error('el.mjs failed: ' + a[0] + ' ' + a[1]);
}

for (const id of args) {
  const L = lines.find((l) => l.id === id);
  if (!L) throw new Error('no line ' + id);
  if (L.who !== 'N') throw new Error(id + ' is not a narrator line; use he-line.mjs');
  const out = 'takes/' + (as || id) + '.mp3';
  if (!hearOnly) {
    const a = ['line', out, text || L.text];
    const p = prev ?? L.prev;
    const n = next ?? L.next;
    if (p) a.push('--prev', p);
    if (n) a.push('--next', n);
    if (stab) a.push('--stability', stab);
    run(a);
    const j = JSON.parse(readFileSync(SOUND + out.replace(/\.mp3$/, '.json'), 'utf8'));
    if (!String(j.voice || '').startsWith('Frederick Surrey')) throw new Error(out + ': voice is ' + j.voice);
    console.log('voice ok: ' + j.voice);
  }
  run(['hear', out]);
}
