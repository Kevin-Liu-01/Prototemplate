#!/usr/bin/env node
/*
 * blog-fuma-nama (v4 cut and its fix round, 2026-10-06, Frederick Surrey; v3 build before it): where each narration line sits in the film, and
 * the film time of every spoken word. lib/make-mix.mjs places the clips from
 * FIRST_SOUND; index.html's CUE table holds the word times this prints
 * (`node lib/cues.mjs` from the film folder). Change a placement here, run
 * this, copy the CUE block into index.html, then run make-bed.mjs and
 * make-mix.mjs.
 *
 * A take's first sound is its first 10 ms frame above -40 dBFS (measured on
 * the take, audio/vo-N.mp3); its words come from the take's .json character
 * timings (ElevenLabs' with-timestamps alignment).
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// film time of each line's first sound (v4 cut, DESIGN-v4.md, "The clock";
// the v4 fix round moved lines 7 to 9). The takes are Frederick Surrey's v3
// takes, unchanged; v4 only moves them. Kevin, on the v3 cut: "theres too
// many visuals that are rapidly playing ... we can just increase the length
// if u need". Each line moves later by the pause added in front of it, and
// each pause holds a picture that needs it. The fix round (the v4 critic:
// lines 6 and 7 still ran their steps back to back) adds 0.5 s before line 7
// and 1.0 s before line 8, so line 6's last move and line 7's travel and seat
// each finish and hold for over 1.0 s before the next cut: the gaps are now
// 1.10 to 2.78 s. Each move keeps a whole 0.5 s, so both cuts stay on a beat
// with a spoken word on them. Line 9 keeps its place after line 8, so the
// card falls on the first 0.5 s beat after its end plus 0.6 s
// (54.42 + 0.6 = 55.02, so 55.5).
export const FIRST_SOUND = [1.0, 7.95, 16.33, 21.03, 26.34, 31.04, 37.66, 44.63, 50.92];
// the two hard cuts, both match cuts on the y 540 seam, on a beat and a spoken word
// ("The" at 37.55 and "If" at 44.55); every other change of picture is a transform
export const CUTS = [37.5, 44.5];
export const CARD = 55.5;
export const END = CARD + 4;
export const LINES = FIRST_SOUND.length;

export function onsetOf(file) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], { maxBuffer: 1 << 26 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const hop = 480;
  for (let i = 0; (i + 1) * hop <= x.length; i++) {
    let s = 0;
    for (let k = i * hop; k < (i + 1) * hop; k++) s += x[k] * x[k];
    if (10 * Math.log10(s / hop + 1e-20) > -40) return i / 100;
  }
  return 0;
}

/* The last 10 ms frame above -45 dBFS in a file (the master's own tail),
 * looking no later than `until` seconds: a take can end on the first breath of
 * a line that follows it (round 7d's line 7 retake, at 10.85 s), which the
 * mix never plays. */
export function offsetOf(file, until = Infinity) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], { maxBuffer: 1 << 26 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const hop = 480;
  let last = 0;
  for (let i = 0; (i + 1) * hop <= x.length && i / 100 < until; i++) {
    let s = 0;
    for (let k = i * hop; k < (i + 1) * hop; k++) s += x[k] * x[k];
    if (10 * Math.log10(s / hop + 1e-20) > -45) last = (i + 1) / 100;
  }
  return last;
}

export function wordsOf(j) {
  const a = j.alignment;
  const ch = a.characters;
  const out = [];
  let cur = null;
  for (let k = 0; k < ch.length; k++) {
    if (/[\p{L}\p{N}’']/u.test(ch[k])) {
      if (!cur) cur = { w: '', s: a.character_start_times_seconds[k], e: a.character_end_times_seconds[k] };
      cur.w += ch[k];
      cur.e = a.character_end_times_seconds[k];
    } else if (cur) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/*
 * A take's request text may respell a name so that the voice says it as its
 * owner does (round 7d: line 7's "Vercel" came back stressed on its first
 * syllable, "VER-sl"; the retake asked for "Ver-sell"). The film's words stay
 * the script's: the respelt parts are joined back into the name, with the
 * first part's start and the last part's end, and the text is restored.
 * v3 (Frederick Surrey): line 2 says "Vursell" (its first take, plain
 * "Vercel", reduced the second syllable to a syllabic l, "VER-sl"; its second,
 * "Vur-sell", began on a rounded vowel) and "shad C N U I"; line 7 says "C L I".
 */
export const RESPELL = { 'Ver-sell': 'Vercel', 'Vur-sell': 'Vercel', 'Vursell': 'Vercel', 'shad C N U I': 'shadcn/ui', 'C L I': 'CLI' };
function unspell(words, text) {
  let out = words;
  let txt = text;
  for (const [spelt, name] of Object.entries(RESPELL)) {
    const parts = spelt.split(/[^\p{L}\p{N}’']+/u).filter(Boolean);
    const next = [];
    for (let k = 0; k < out.length; k++) {
      if (parts.every((p, q) => out[k + q] && out[k + q].w === p)) {
        next.push({ w: name, s: out[k].s, e: out[k + parts.length - 1].e, parts: out.slice(k, k + parts.length).map((q) => ({ w: q.w, s: q.s, e: q.e })) });
        k += parts.length - 1;
      } else next.push(out[k]);
    }
    out = next;
    txt = txt.split(spelt).join(name);
  }
  return { words: out, text: txt };
}

export function lines() {
  return FIRST_SOUND.map((at, i) => {
    const n = i + 1;
    const j = JSON.parse(readFileSync(`audio/vo-${n}.json`, 'utf8'));
    const onset = onsetOf(`audio/vo-${n}.mp3`);
    const start = Math.round((at - onset) * 1000) / 1000;
    const said = unspell(wordsOf(j), j.text);
    const at3 = (v) => Math.round((start + v) * 1000) / 1000;
    const words = said.words.map((w) => ({ w: w.w, s: at3(w.s), e: at3(w.e), parts: w.parts ? w.parts.map((q) => ({ w: q.w, s: at3(q.s), e: at3(q.e) })) : null }));
    const tail = offsetOf(`audio/vo-${n}.master.wav`, said.words[said.words.length - 1].e + 0.4);
    return { n, text: said.text, onset, start, words, end: Math.round((start + tail) * 1000) / 1000, duration: j.duration };
  });
}

// a CUE key: the word in lower case, letters and digits only ('shadcn/ui' is shadcnui)
function key(w) {
  return w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const L = lines();
  for (const l of L) {
    console.log(`line ${l.n}: clip ${l.start.toFixed(3)}, first sound ${(l.start + l.onset).toFixed(2)}, last sound ${l.end.toFixed(2)}`);
    console.log('  ' + l.words.map((w) => `${w.w} ${w.s.toFixed(2)}-${w.e.toFixed(2)}`).join(', '));
  }
  console.log('\n// CUE: film time of the spoken words (lib/cues.mjs)');
  console.log('const CUE = {');
  for (const l of L) {
    const keys = [];
    l.words.forEach((w, k) => {
      const n = l.words.filter((v, q) => q < k && key(v.w) === key(w.w)).length;
      const name = key(w.w) + (n ? '_' + (n + 1) : '');
      keys.push(`'${name}': ${w.s.toFixed(2)}`);
      // a respelt name keeps its spoken parts too ('cli_c', 'cli_l', 'cli_i')
      if (w.parts) w.parts.forEach((q, i) => keys.push(`'${name}_${key(q.w)}${w.parts.filter((v, j) => j < i && key(v.w) === key(q.w)).length ? '_' + (w.parts.filter((v, j) => j < i && key(v.w) === key(q.w)).length + 1) : ''}': ${q.s.toFixed(2)}`));
    });
    console.log(`  L${l.n}: { _on: ${(l.start + l.onset).toFixed(2)}, _off: ${l.end.toFixed(2)}, ${keys.join(', ')} },`);
  }
  console.log('};');
}
