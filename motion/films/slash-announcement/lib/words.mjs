#!/usr/bin/env node
/*
 * slash-announcement: the words of each take, from its .json character
 * timings (ElevenLabs with-timestamps). Prints each take's first sound,
 * its words with their take-relative times, and its last word's end.
 *   node lib/words.mjs
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
export const IDS = ['1', '3', '6', '7', '8'];

export function onsetOf(file, db = -40) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], { maxBuffer: 1 << 26 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const hop = 480;
  let first = null, last = 0;
  for (let i = 0; (i + 1) * hop <= x.length; i++) {
    let s = 0;
    for (let k = i * hop; k < (i + 1) * hop; k++) s += x[k] * x[k];
    if (10 * Math.log10(s / hop + 1e-20) > db) { if (first === null) first = i / 100; last = (i + 1) / 100; }
  }
  return { on: first ?? 0, off: last, len: x.length / 48000 };
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
    } else if (cur) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out;
}

export function takes() {
  return IDS.map((id) => {
    const j = JSON.parse(readFileSync(`audio/vo-${id}.json`, 'utf8'));
    const e = onsetOf(`audio/vo-${id}.mp3`);
    return { id, text: j.text, voice: j.voice, duration: j.duration, on: e.on, off: e.off, len: e.len, words: wordsOf(j) };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const t of takes()) {
    const w = t.words;
    console.log(`vo-${t.id}: file ${t.len.toFixed(2)} s, sound ${t.on.toFixed(2)}..${t.off.toFixed(2)}, words ${w[0].s.toFixed(2)}..${w[w.length - 1].e.toFixed(2)} (${(w[w.length - 1].e - w[0].s).toFixed(2)} s), ${w.length} words`);
    console.log('   ' + w.map((q) => `${q.w} ${q.s.toFixed(2)}`).join(', '));
  }
}
