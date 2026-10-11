#!/usr/bin/env node
/*
 * blog-fuma-nama (round 7d; v3 build, v4 cut 2026-10-06): the sound. Writes the narrator's nine clips, the
 * voice bus and the music bed with its duck into index.html between the
 * markers <!-- mix: ... --> and <!-- /mix -->. Run it from the film folder
 * after a take, a placement or a level changes, then carve the bed:
 *
 *   node lib/make-voice.mjs               the narrator's masters (if a take changed)
 *   node lib/make-bed.mjs                 the bed's master (if the length or an edit changed)
 *   node lib/make-mix.mjs                 rewrite the block in index.html
 *   node <hyperframes-audio>/scripts/carve.mjs --comp index.html --bed music-bed \
 *        --strength 0.3 --core <folder with @hyperframes/core@0.8.106>
 *   node lib/make-mix.mjs --flatten-carve-level
 *   node lib/make-mix.mjs --stems <dir>   also write audio-only compositions
 *                                         <dir>/full.html, voice.html and
 *                                         bed.html (a blank frame, the same
 *                                         markup), to measure the mix alone
 *
 * The narrator is Frederick Surrey (kit/audio/voice.json since 2026-10-06); the bed is
 * round 5's sound generation, edited to the film's length and mastered with
 * round 5's EQ by lib/make-bed.mjs (audio/bed.master.wav).
 *
 * The carve is kept for its spectral half only: its dynamic dips follow the
 * narrator's own level in their bands. Its level stage (the fromCarve gain
 * node and its lane) held the bed down from the first line to the end card
 * and released over about 4 s, so it doubled this file's duck.
 * --flatten-carve-level removes that one lane after each carve (the node
 * stays at 0 dB, so a re-carve rewrites it and this step runs again), and
 * holds the dips across the gaps between lines: each dip lane takes the
 * deepest value within HOLD_BACK seconds before and HOLD_AHEAD after, and
 * rises back at most CARVE_RELEASE dB a second. Without the hold every dip
 * let go in each 0.5 to 0.9 s gap and the bed surged with it (the round 7b
 * critic measured 9 to 11 LU of swing in each gap).
 *
 * The clips are the narrator's masters (lib/make-voice.mjs: every line at
 * -19.3 LUFS mono, true peak under -3.6 dBTP under a lookahead limiter),
 * placed by lib/cues.mjs. Each clip ends TAIL seconds after its last word (the
 * take's alignment), and never later than GUARD seconds before the next
 * line's first sound, with a 20 ms fade in and a 60 ms fade out.
 *
 * The bed runs the whole film. Its volume lane is the duck and the fades:
 * down DUCK_DB over ATTACK seconds, ending PRE seconds before each line's
 * first sound (line 1's as well: its duck runs 0.35 to 0.65 s, so the bed is
 * heard alone from 0.1 s and is already down when "I learned" begins). Every gap between lines is under BRIDGE seconds (0.55 to 0.99
 * s), so the duck is held across it and only breathes up RISE_DB on a
 * half-sine from POST seconds after the last word to the next line's full
 * depth (the low-mid dip stays at depth): a bed that released fully in each
 * gap would surge seven times in 49 s. The duck lets go only for the end
 * card: from POST seconds after line 8's last word over RELEASE_LAST seconds
 * on a smoothstep, so the card opens on the bed at its own level and the
 * music resolves under it. BED_DB sets its level: about -20 LUFS alone,
 * about -26 under speech with the dips. It fades in over FADE_IN and out over
 * FADE_OUT at the end of the end card, under the source's own settle.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { lines, END } from './cues.mjs';

const TAIL = 0.18;
const GUARD = 0.08;
const num = (name, v) => (process.env[name] === undefined ? v : Number(process.env[name]));
const VOICE_DB = num('VOICE_DB', 0); // the narrator bus; never above 0 dB (the masters' limiter is the last peak control)
const BED_DB = num('BED_DB', 0.4); // v4: +0.9 dB with the narrator's masters (make-voice.mjs TARGET -18.0), so the bed stays 10 to 11 dB under him
const DUCK_DB = num('DUCK_DB', -5.8);
const CARD_DB = num('CARD_DB', -1.5);
const ATTACK = 0.3;
const RELEASE = 0.45; // a release after a gap of BRIDGE seconds or more (none in this film)
const RELEASE_LAST = 0.8;
// v4 (DESIGN-v4.md, "Sound"): the gaps between lines are 1.10 to 1.97 s
// (1.10 to 2.78 s since the fix round, which lengthened the gaps after lines
// 6 and 7).
// The duck is held across every one of them (BRIDGE), so the bed never
// releases and re-ducks between lines. In each gap of RISE_MIN seconds or
// longer it rises RISE_DB on a half-sine, from RISE_DELAY seconds after the
// last word back to full depth PRE seconds before the next first sound, so
// the music fills the pause without pumping; the 1.10 s gap after line 3
// holds flat.
const BRIDGE = 3.0; // fix round: the gap after line 7 is 2.78 s (its duck window 2.37 s)
const RISE_DB = num('RISE_DB', 3);
const RISE_MIN = 1.5;
const RISE_DELAY = 0.15;
const HOLD_BACK = 3.0; // v4: the gaps are up to 2.78 s (fix round), so the carve dips hold across the whole gap and only the half-sine rise moves the bed there
const HOLD_AHEAD = 0.3;
const CARVE_RELEASE = 12; // dB a second
const PRE = 0.05;
const POST = 0.05;
const LEAD = 0.1; // the bed master's silent lead-in (lib/make-bed.mjs)
const FADE_IN = 0.3;
const FADE_OUT = 0.8;

const r3 = (v) => Math.round(v * 1000) / 1000;
const attr = (o) => JSON.stringify(o).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const L = lines().map((l, i, all) => {
  const last = l.words[l.words.length - 1].e;
  const on = l.start + l.onset;
  const next = all[i + 1] ? all[i + 1].start + all[i + 1].onset : END;
  const stop = Math.min(last + TAIL, next - GUARD);
  return { ...l, on: r3(on), last: r3(last), dur: r3(stop - l.start) };
});

const SEG = L.map((l, i) => {
  let d0 = l.on - PRE - ATTACK; // the duck starts (line 1's too: round 7d's critic heard "I learned" on the unducked bed, the film's loudest moment)
  // v3: line 1 starts at 0.25 s, before the bed's fade in ends, so the bed
  // enters already ducked (full depth from the first frame)
  if (i === 0 && d0 + ATTACK > LEAD) d0 = -ATTACK;
  return { d0, d1: d0 + ATTACK, u0: l.last + POST, last: l.last, next: L[i + 1] ? L[i + 1].on : null };
});
SEG.forEach((s, i) => {
  s.rise = s.next !== null && s.next - s.last >= RISE_MIN ? 1 : 0;
  s.bridged = i < SEG.length - 1 && SEG[i + 1].d0 - s.u0 < BRIDGE; // held to the next line
  s.fromHeld = i > 0 && SEG[i - 1].bridged; // its attack is inside the previous gap's breath
});
const sstep = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
// after line 8 the duck lets go to CARD_DB, not to 0: the source's B passage
// peaks just before its settle, under the card's cut, and at full level the
// card's loudest moment came within 0.1 LU of the narrator's median
function duckAt(t, rise = RISE_DB, cardDb = CARD_DB) {
  if (t <= SEG[0].d0) return 0;
  for (let i = 0; i < SEG.length; i++) {
    const s = SEG[i];
    const next = SEG[i + 1];
    if (!s.fromHeld && t < s.d1) return t <= s.d0 ? 0 : (DUCK_DB * (t - s.d0)) / ATTACK;
    if (t <= s.u0) return DUCK_DB;
    if (s.bridged) {
      if (t < next.d1) {
        const r0 = s.last + RISE_DELAY;
        return t <= r0 ? DUCK_DB : DUCK_DB + s.rise * rise * Math.pow(Math.sin((Math.PI * (t - r0)) / (next.d1 - r0)), 2);
      }
      continue;
    }
    const rel = i === SEG.length - 1 ? RELEASE_LAST : RELEASE;
    if (i === SEG.length - 1) return t < s.u0 + rel ? DUCK_DB + (cardDb - DUCK_DB) * sstep((t - s.u0) / rel) : cardDb;
    if (t < s.u0 + rel) return DUCK_DB * (1 - (t - s.u0) / rel);
    if (!next || t < next.d0) return 0;
  }
  return 0;
}
// keep only the corners of a sampled lane: drop points on a straight line with their neighbours
function corners(pts, tol) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = out[out.length - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const lin = a.v + ((c.v - a.v) * (b.t - a.t)) / (c.t - a.t);
    if (Math.abs(lin - b.v) > tol) out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function bedLane() {
  const vol = [];
  const dip = [];
  const step = 0.025;
  for (let k = 0; k * step <= END + 1e-9; k++) {
    const t = r3(k * step);
    let v = Math.pow(10, duckAt(t) / 20);
    if (t < LEAD + FADE_IN) v *= Math.max(0, (t - LEAD) / FADE_IN);
    if (t > END - FADE_OUT) v *= Math.max(0, (END - t) / FADE_OUT);
    vol.push({ t, v: Math.round(v * 10000) / 10000 });
    // the low-mid dip rides the duck: DIP_DB under a line and held at depth
    // across the gaps between lines (no breath), 0 dB at the open and the card
    dip.push({ t, v: Math.round(((DIP_DB * duckAt(t, 0, 0)) / DUCK_DB) * 100) / 100 });
  }
  return {
    version: 1,
    lanes: [
      { target: 'volume', points: corners(vol, 0.002) },
      { target: 'fx.b2.gain', points: corners(dip, 0.05) },
    ],
  };
}

// The bed's partials sit at 130 to 400 Hz (round 5's EQ lifts them 5 dB at
// 300 Hz so they carry on small speakers), which is where Clara's voice had
// its fundamental (150 to 310 Hz in her takes); Frederick's runs 80 to 150 Hz
// with its first formants above it, so the dip is kept as it was. A hand-built peaking dip at
// DIP_HZ rides the duck (fx.b2.gain): DIP_DB under each line and across the
// gaps between them, 0 dB at the open and the card. The carve keeps
// hand-built nodes and lanes when it re-runs.
const DIP_HZ = num('DIP_HZ', 260);
const DIP_DB = num('DIP_DB', -5.0);
const VOICE_BUS = { version: 1, nodes: [{ type: 'gain', id: 'v1', label: 'Narrator Level', params: { gain: Math.min(0, VOICE_DB) } }] };
const BED_CHAIN = { version: 1, nodes: [{ type: 'gain', id: 'b1', label: 'Bed Level', params: { gain: BED_DB } }, { type: 'peaking', id: 'b2', label: 'Low-mid Dip', params: { frequency: DIP_HZ, gain: 0, q: 1.1 } }] };

function markup({ voice = true, bed = true } = {}) {
  const m = ['<!-- mix: generated by lib/make-mix.mjs; do not edit by hand -->'];
  if (voice) {
    m.push(`<hf-audio-group id="voiceover" data-label="Narrator" data-volume="1" data-fx-chain="${attr(VOICE_BUS)}"></hf-audio-group>`);
    for (const l of L) {
      const lane = { version: 1, lanes: [{ target: 'volume', points: [{ t: 0, v: 0 }, { t: 0.02, v: 1 }, { t: r3(l.dur - 0.06), v: 1 }, { t: l.dur, v: 0 }] }] };
      m.push(`<!-- line ${l.n}: ${l.text.replace(/--/g, '-')} (first sound ${l.on.toFixed(2)}, last word ends ${l.last.toFixed(2)}) -->`);
      m.push(`<audio id="vo-${l.n}" src="audio/vo-${l.n}.master.wav" data-start="${l.start}" data-duration="${l.dur}" data-track-index="${20 + ((l.n - 1) % 2)}" data-volume="1" data-audio-group="voiceover" data-automation="${attr(lane)}"></audio>`);
    }
  }
  if (bed) m.push(`<audio id="music-bed" src="audio/bed.master.wav" data-start="0" data-duration="${END}" data-track-index="10" data-volume="1" data-audio-group="music" data-fx-chain="${attr(BED_CHAIN)}" data-automation="${attr(bedLane())}"></audio>`);
  m.push('<!-- /mix -->');
  return m;
}

function standalone(file, block) {
  writeFileSync(
    file,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>mix</title>
    <script src="kit/gsap.min.js"></script>
    <style>html,body{width:1920px;height:1080px;margin:0;background:#000}#root{position:relative;width:100%;height:100%;background:#000}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${END}" data-width="1920" data-height="1080">
      ${block.join('\n      ')}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.set({}, {}, ${END});
      window.__timelines['main'] = tl;
    </script>
  </body>
</html>
`,
  );
}

for (const l of L) console.log(`line ${l.n}: clip ${l.start.toFixed(3)} + ${l.dur.toFixed(3)} s, first sound ${l.on.toFixed(2)}, last word ends ${l.last.toFixed(2)}`);
const html = readFileSync('index.html', 'utf8');
const a = html.indexOf('<!-- mix:');
const b = html.indexOf('<!-- /mix -->');
if (a < 0 || b < 0) throw new Error('index.html has no <!-- mix: ... <!-- /mix --> block');
const args = process.argv.slice(2);
const st = args.indexOf('--stems');
if (args.includes('--flatten-carve-level')) {
  const tag = html.match(/<audio id="music-bed"[^>]*>/)[0];
  const unq = (v) => JSON.parse(v.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  const chain = unq(tag.match(/data-fx-chain="([^"]*)"/)[1]);
  const auto = unq(tag.match(/data-automation="([^"]*)"/)[1]);
  const level = chain.nodes.filter((n) => n.fromCarve && n.type === 'gain').map((n) => 'fx.' + n.id + '.gain');
  const before = auto.lanes.length;
  auto.lanes = auto.lanes.filter((l) => !level.includes(l.target));
  // hold each carve dip across the gaps: the deepest value in [t - HOLD_BACK, t + HOLD_AHEAD], rising back at most CARVE_RELEASE dB/s
  const dips = chain.nodes.filter((n) => n.fromCarve && n.type === 'peaking').map((n) => 'fx.' + n.id + '.gain');
  auto.lanes.forEach((lane) => {
    if (!dips.includes(lane.target)) return;
    const p = lane.points;
    const at = (t) => {
      if (t <= p[0].t) return p[0].v;
      for (let k = 1; k < p.length; k++) if (t <= p[k].t) return p[k - 1].v + ((p[k].v - p[k - 1].v) * (t - p[k - 1].t)) / (p[k].t - p[k - 1].t);
      return p[p.length - 1].v;
    };
    const step = 0.025;
    const n = Math.round(END / step);
    const raw = [];
    for (let k = 0; k <= n; k++) raw.push(at(k * step));
    const held = [];
    const kb = Math.round(HOLD_BACK / step);
    const ka = Math.round(HOLD_AHEAD / step);
    for (let k = 0; k <= n; k++) {
      let m = 0;
      for (let q = Math.max(0, k - kb); q <= Math.min(n, k + ka); q++) m = Math.min(m, raw[q]);
      held.push(m);
    }
    for (let k = 1; k <= n; k++) held[k] = Math.min(held[k], held[k - 1] + CARVE_RELEASE * step);
    const pts = held.map((v, k) => ({ t: r3(k * step), v: Math.round(v * 100) / 100 }));
    lane.points = corners(pts, 0.05);
  });
  chain.nodes.forEach((n) => { if (n.fromCarve && n.type === 'gain') n.params.gain = 0; });
  const next = tag.replace(/data-fx-chain="[^"]*"/, `data-fx-chain="${attr(chain)}"`).replace(/data-automation="[^"]*"/, `data-automation="${attr(auto)}"`);
  writeFileSync('index.html', html.replace(tag, next));
  console.log(`index.html: removed ${before - auto.lanes.length} carve level lane(s) (${level.join(', ')}); held ${dips.join(', ')} across the gaps; kept ${auto.lanes.length} lanes`);
} else if (st >= 0) {
  // the stems take the bed's carve from index.html as it stands, so run the
  // carve on index.html first and the stems match the film
  const dir = args[st + 1];
  mkdirSync(dir, { recursive: true });
  const block = html.slice(a, b + '<!-- /mix -->'.length).split('\n').map((s) => s.trim()).filter(Boolean);
  standalone(dir + '/full.html', block);
  standalone(dir + '/voice.html', block.filter((s) => !s.includes('id="music-bed"')));
  standalone(dir + '/bed.html', block.filter((s) => !/id="vo-|hf-audio-group/.test(s)));
  console.log(`stems written to ${dir} (full, voice, bed), from the mix block now in index.html`);
} else {
  const indent = html.slice(html.lastIndexOf('\n', a) + 1, a);
  writeFileSync('index.html', html.slice(0, a) + markup().join('\n' + indent) + html.slice(b + '<!-- /mix -->'.length));
  console.log('index.html: mix block written');
}
