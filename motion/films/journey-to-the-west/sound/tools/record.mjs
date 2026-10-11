// Records takes from sound/lines.json through kit/audio/el.mjs (which alone
// reads the ElevenLabs key) and transcribes each with `el.mjs hear`.
// After jihe-yuanben's tools/record.mjs.
//   node sound/tools/record.mjs n01 n02 ...     record and hear those ids
//   node sound/tools/record.mjs --hear n01 ...  only transcribe existing takes
//   node sound/tools/record.mjs --as n04b --text "..." n04
//                                              record a variant of a line under another name
// Takes land in sound/takes/<id>.mp3 with <id>.json (timings) and <id>.stt.json.
// v2 build (2026-10-05): the narrator is the translation series' Frederick
// Surrey, kit/audio/voice-series.json, which el.mjs reads when EL_VOICE_FILE
// names it. Narrator lines are refused without it, are never given --voice,
// and every new take's .json must name Frederick Surrey.
//   EL_VOICE_FILE=$PROTOTEMPLATE/motion/kit/audio/voice-series.json node sound/tools/record.mjs v01
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SOUND = new URL('..', import.meta.url).pathname;
const EL = new URL('../../kit/audio/el.mjs', import.meta.url).pathname;
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
const voice = opt('--voice');
const prev = opt('--prev');
const next = opt('--next');
const stab = opt('--stability');

function run(a) {
  const r = spawnSync('node', [EL, ...a], { cwd: SOUND, encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  if (r.status !== 0) throw new Error('el.mjs failed: ' + a[0] + ' ' + a[1]);
}

for (const id of args) {
  const L = lines.find((l) => l.id === id);
  if (!L) throw new Error('no line ' + id);
  const name = as || id;
  const out = 'takes/' + name + '.mp3';
  if (!hearOnly) {
    const a = ['line', out, text || L.text];
    const p = prev ?? L.prev;
    const n = next ?? L.next;
    if (p) a.push('--prev', p);
    if (n) a.push('--next', n);
    if (L.who === 'R') throw new Error('reader lines are not recorded in the v2 build (' + id + ' plays r04g)');
    if (voice) throw new Error('--voice is refused for narrator lines: the narrator comes from EL_VOICE_FILE');
    if (!(process.env.EL_VOICE_FILE || '').endsWith('/kit/audio/voice-series.json')) throw new Error('set EL_VOICE_FILE to kit/audio/voice-series.json');
    if (stab) a.push('--stability', stab);
    run(a);
    const j = JSON.parse(readFileSync(SOUND + 'takes/' + name + '.json', 'utf8'));
    if (!String(j.voice).startsWith('Frederick Surrey')) throw new Error(name + ' was voiced by ' + j.voice);
    console.log(name + ': voice ' + j.voice.split(' (')[0] + ', ' + j.model + ', ' + j.duration.toFixed(2) + ' s');
  }
  run(['hear', out]);
}
