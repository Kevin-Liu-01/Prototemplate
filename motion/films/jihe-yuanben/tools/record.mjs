// Records takes from tools/lines.json through kit/audio/el.mjs (which alone
// reads the ElevenLabs key) and transcribes each with `el.mjs hear`.
//   node tools/record.mjs en01 en02 ...      record and hear those ids
//   node tools/record.mjs --hear en01 ...    only transcribe existing takes
//   node tools/record.mjs --as zh3b --text "吳淞，徐光啓，筆受。" zh3
//                                            record a variant of a line under another name
// Takes land in audio/<id>.mp3 with audio/<id>.json (timings) and audio/<id>.stt.json.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const EL = ROOT + 'kit/audio/el.mjs';
// the Mandarin reader, by name: kit/audio/el.mjs reads its id from kit/audio/voices.local.json
const YUN = 'Yun';
const { lines } = JSON.parse(readFileSync(ROOT + 'tools/lines.json', 'utf8'));
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
  const r = spawnSync('node', [EL, ...a], { cwd: ROOT, encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  if (r.status !== 0) throw new Error('el.mjs failed: ' + a[0] + ' ' + a[1]);
}

for (const id of args) {
  const L = lines.find((l) => l.id === id);
  if (!L) throw new Error('no line ' + id);
  const name = as || id;
  const out = 'audio/' + name + '.mp3';
  if (!hearOnly) {
    const a = ['line', out, text || L.text];
    const p = prev ?? L.prev;
    const n = next ?? L.next;
    if (p) a.push('--prev', p);
    if (n) a.push('--next', n);
    if (L.who === 'R' || voice) a.push('--voice', voice || YUN, '--stability', stab || '0.85', '--style', '0');
    else if (stab) a.push('--stability', stab);
    run(a);
  }
  run(['hear', out]);
}
