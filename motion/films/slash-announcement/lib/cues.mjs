#!/usr/bin/env node
/*
 * slash-announcement v3: where each narration take sits in the film, and the
 * film time of every spoken word. Writes lib/cues.js (window.CUE, CUTS, CARD,
 * END, BEAT, EV, read by lib/film.js) and audio/placement.json (read by
 * lib/mix.py).
 *
 *   node lib/cues.mjs
 *
 * v3 (Kevin, 2026-10-08: "make its pacing a lil faster, we hang around on
 * many shots for too long"): v2's five lines and takes, in the same order. A
 * take is never moved inside itself, slowed or stretched: each line is placed
 * by its first word, and every event lands on its word by reading this table.
 *
 * v7 (Kevin, 2026-10-09: "\"more than one\" -> \"every\" at end"): line 8
 * is a new take, "Your product should exist in every language." (audio/
 * vo-8.mp3, v7's t3), and its French step is on "every". Nothing else in the
 * clock changes: the card stays on its bar line (the take's "product" is at
 * v6's offset, so the shared gap and "product" do not move).
 *
 * The clock (STORYBOARD.md, v3): the opener's "Slash" at LEAD. The bed's beat
 * grid is set so that the cut to the globe on "businesses" lands on a beat
 * (a bar line). The glyph bridge after line 1 is the pulse, a HOLD, the
 * switch, a HOLD, the step and a HOLD, so "partner" (a tone mix, no beat
 * snap) lands where the bridge ends. "up" goes on the first beat that keeps
 * the gap after line 3 at MIN_GAP or more. Lines 7 and 8 share the slack
 * evenly so that "product" lands on a beat with both gaps between MIN_GAP and
 * MAX_GAP. The card goes on the first beat HOLD after the app page's Japanese
 * step is done; the bed's held chord falls there.
 *
 * The bed (audio/bed.mp3, audio/beats.json) starts at frame 0 from source
 * OFF, the offset that puts its beats on the film's grid. One splice leaves
 * the source bar line beats.splice.at for beats.splice.to, so the held chord
 * at beats.sourceHeld falls on the card; the solver checks that it does.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { takes } from './words.mjs';

export const LEAD = 0.24; // the opener's "Slash" (the wordmark rises from 40 percent to full across it)
export const MIN_GAP = 0.3; // the least silence between two lines' words
export const MAX_GAP = 0.45; // the most, apart from the glyph bridge after line 1
export const HOLD = 0.4; // a hold after a piece completes
export const CARD_D = 3.532; // the end card: its contents land by 0.53, then the title's 3.0 s
export const FPS = 60;
// the bed (audio/beats.json): beats at phase + k * period in the source
const BEATS = JSON.parse(readFileSync('audio/beats.json', 'utf8'));
const PERIOD = BEATS.period;
const BAR = 4 * PERIOD;

// the glyph bridge after line 1: on "countries" the "+" is set and the
// approved cut's screen-gold pulse runs out along every route (its head
// PULSE_D, its 0.25 tail clear at PULSE_DONE); a hold; the routes retract and
// the blocks switch to glyphs (SW_D); a hold; every glyph steps once to its
// next writing system (STEP_D); a hold; the lockup prints on "partner"
export const PULSE_D = 0.35;
export const PULSE_DONE = PULSE_D * 1.25;
export const SW_D = 0.49;
export const STEP_D = 0.315;
// line 6's surfaces are complete this long after "surface" (the fifth stem's
// plate and its row, 42 ms apart); line 7's last plate this long after
// "design"; on "more" the pulse down the stems (42 ms apart) and the plates'
// white outlines this long after its word (the fifth stem's pulse tail)
const SURF_DONE = 0.59;
const PLATE_DONE = 0.49;
const MORE_PULSE = 0.52;
// line 8: the page steps to es on "exist", fr on "every", ja on "language"
// (v7: Kevin changed the line to "Your product should exist in every
// language."; v2 to v6 stepped to fr on "more"); each step is done LANG_DONE
// after its word
const LANG_WORDS = ['exist', 'every', 'language'];
const LANG_DONE = 0.35;

const key = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const r3 = (v) => Math.round(v * 1000) / 1000;

function wordTable(t) {
  const words = {};
  t.words.forEach((w, k) => {
    const n = t.words.filter((v, q) => q < k && key(v.w) === key(w.w)).length;
    words[key(w.w) + (n ? '_' + (n + 1) : '')] = w.s;
  });
  return { words, last: t.words[t.words.length - 1].e };
}

export function place() {
  const T = {};
  for (const t of takes()) T[t.id] = { ...wordTable(t), take: t };
  const w = (id, k) => {
    const v = T[id].words[k];
    if (v == null) throw new Error(`line ${id} has no word "${k}"`);
    return v;
  };
  const P = {};
  P[1] = LEAD - w(1, 'slash');
  // the cut to the globe on "businesses" sets the beat grid
  const c1 = P[1] + w(1, 'businesses');
  const ph = ((c1 % PERIOD) + PERIOD) % PERIOD;
  const beatAtOrAfter = (x) => ph + Math.ceil((x - ph) / PERIOD - 1e-9) * PERIOD;
  // the glyph bridge
  const E = P[1] + w(1, 'countries'); // the pulse starts here
  const sw0 = E + PULSE_DONE + HOLD;
  const step0 = sw0 + SW_D + HOLD;
  const mix3 = step0 + STEP_D + HOLD;
  P[3] = mix3 - w(3, 'partner');
  // line 6: the cut to the offer on "up", on the first beat MIN_GAP after line 3
  const c6 = beatAtOrAfter(P[3] + T[3].last + MIN_GAP + w(6, 'up'));
  P[6] = c6 - w(6, 'up');
  // lines 7 and 8 share the slack evenly so that "product" lands on a beat
  const base = P[6] + T[6].last + T[7].last + w(8, 'product');
  const c8 = beatAtOrAfter(base + 2 * MIN_GAP);
  const g = (c8 - base) / 2;
  P[7] = P[6] + T[6].last + g;
  P[8] = P[7] + T[7].last + g;
  const langs = LANG_WORDS.map((k) => P[8] + w(8, k));
  // the card (and the chord) on the first beat HOLD after the Japanese step is done
  const CARD = beatAtOrAfter(langs[langs.length - 1] + LANG_DONE + HOLD);
  // the floors: each piece complete and held before the next starts
  const checks = [
    ['gap 1 to 3', P[3] - (P[1] + T[1].last), MIN_GAP],
    ['gap 3 to 6', P[6] - (P[3] + T[3].last), MIN_GAP],
    ['gap 6 to 7', g, MIN_GAP],
    ['the surfaces held before "app"', P[7] + w(7, 'app') - (P[6] + w(6, 'surface') + SURF_DONE), HOLD],
    ['the last plate held before "more"', P[7] + w(7, 'more') - (P[7] + w(7, 'design') + PLATE_DONE), HOLD],
    ['the pulse on "more" held before the cut', c8 - (P[7] + w(7, 'more') + MORE_PULSE), HOLD],
  ];
  for (const [name, v, min] of checks) if (v < min - 1e-6) throw new Error(`${name}: ${v.toFixed(3)} s, under ${min}`);
  if (g > MAX_GAP + 1e-6) throw new Error(`gaps 6 to 7 and 7 to 8: ${g.toFixed(3)} s, over ${MAX_GAP}`);
  if (P[6] - (P[3] + T[3].last) > MAX_GAP + 1e-6) throw new Error('gap 3 to 6 over MAX_GAP');
  // the bed: where the film starts in the source, so its beats fall on the film's grid
  const OFF = (((BEATS.phase - ph) % PERIOD) + PERIOD) % PERIOD;
  const chord = BEATS.sourceHeld - (BEATS.splice.to - BEATS.splice.at) - OFF;
  if (Math.abs(chord - CARD) > 0.002) throw new Error(`the held chord falls at ${chord.toFixed(3)}, the card at ${CARD.toFixed(3)}: the splice must skip ${((BEATS.sourceHeld - OFF - CARD) / BAR).toFixed(3)} bars`);
  const END = r3(Math.round((CARD + CARD_D) * FPS) / FPS);
  return { T, P, E, c1, sw0, step0, mix3, c6, c8, g, langs, CARD, OFF, ph, END };
}

export function cues(P, T) {
  return Object.keys(T).map((id) => {
    const t = T[id].take;
    const at = P[id];
    const words = {};
    const list = t.words.map((w) => ({ w: w.w, s: r3(at + w.s), e: r3(at + w.e) }));
    list.forEach((w, k) => {
      const n = list.filter((v, q) => q < k && key(v.w) === key(w.w)).length;
      const id2 = key(w.w) + (n ? '_' + (n + 1) : '');
      words[id2] = w.s;
      words[id2 + '$'] = w.e;
    });
    return { id, start: at, on: r3(at + t.on), first: list[0].s, last: list[list.length - 1].e, words, list, take: t };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { T, P, E, c1, sw0, step0, mix3, c6, c8, g, langs, CARD, OFF, ph, END } = place();
  const C = cues(P, T);
  const CUTS = { c1: r3(c1), mix3: r3(mix3), c6: r3(c6), c8: r3(c8) };
  const EV = { pulse0: r3(E), pulseD: PULSE_D, pulseDone: PULSE_DONE, sw0: r3(sw0), swD: SW_D, step0: r3(step0), stepD: STEP_D, langs: langs.map(r3) };
  const out = {};
  for (const c of C) out['L' + c.id] = { _first: c.first, _last: c.last, ...c.words };
  const js = `/* generated by lib/cues.mjs from the takes' .json timings; do not edit by hand */\nwindow.CUE = ${JSON.stringify(out, null, 1)};\nwindow.CUTS = ${JSON.stringify(CUTS)};\nwindow.CARD = ${r3(CARD)};\nwindow.END = ${END};\nwindow.BEAT = ${JSON.stringify({ period: PERIOD, phase: r3(ph) })};\nwindow.EV = ${JSON.stringify(EV)};\n`;
  writeFileSync('lib/cues.js', js);
  writeFileSync('audio/placement.json', JSON.stringify({ card: r3(CARD), end: END, bedOff: Math.round(OFF * 10000) / 10000, phase: r3(ph), splice: BEATS.splice, lines: C.map((c) => ({ id: c.id, start: r3(c.start), first: c.first, last: c.last, takeLast: c.take.words[c.take.words.length - 1].e, takeLen: c.take.len })) }, null, 1));
  for (const c of C) console.log(`L${c.id} at ${c.start.toFixed(3)}: ${c.first.toFixed(2)} to ${c.last.toFixed(2)}  ` + c.list.map((w) => `${w.w} ${w.s.toFixed(2)}`).join(', '));
  for (let i = 1; i < C.length; i++) console.log(`gap L${C[i - 1].id} -> L${C[i].id}: ${(C[i].first - C[i - 1].last).toFixed(3)} s`);
  console.log(`gap L8 -> card: ${(CARD - C[C.length - 1].last).toFixed(3)} s`);
  console.log('phase', ph.toFixed(4), 'OFF', OFF.toFixed(4), 'countries', E.toFixed(3), 'sw0', sw0.toFixed(3), 'step0', step0.toFixed(3), 'shared gap 6-7-8', g.toFixed(3));
  console.log('cuts', JSON.stringify(CUTS), 'langs', langs.map((x) => x.toFixed(3)).join(' '), 'CARD', CARD.toFixed(3), 'END', END, 'frames', Math.round(END * FPS), 'card', (END - CARD).toFixed(3));
  for (const [k, v] of Object.entries({ ...CUTS, card: r3(CARD) })) console.log(k, v.toFixed(3), 'beat', ((v - ph) / PERIOD).toFixed(3));
}
