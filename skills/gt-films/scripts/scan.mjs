#!/usr/bin/env node
// The critic's whole-film scan (skills/gt-films/references/critic.md). It
// decodes every frame of a render at 384 x 216 in grey and reports:
//   - the darkest frame and every run of near-black frames;
//   - single-frame flicker: a frame that differs from both neighbours while
//     the neighbours match each other;
//   - the largest frame-to-frame changes with their times, which should be
//     the film's cuts; with --cuts, each cut is matched to a change and every
//     large change away from a cut is listed.
// It reads the file with ffmpeg and writes nothing.
//
// Usage:
//   node scan.mjs <film.mp4> [--cuts 4,8.5,14] [--top 12] [--black 6] [--flicker 6]
//
// --cuts     the planned cut times in seconds (STORYBOARD.md), comma separated.
// --top      how many of the largest changes to list (default 12).
// --black    mean luma (0 to 255) under which a frame counts as near black (default 6).
// --flicker  mean absolute difference (0 to 255) that counts as a change for
//            the flicker test (default 6); the neighbours must match within a
//            sixth of it.
//
// Requires: Node 18 or later, ffmpeg and ffprobe.
// Last real run: none (kept for: the whole-film scan of every draft and final;
// references/critic.md step 2).
import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args[0];
if (!file || file.startsWith('--') || !existsSync(file)) {
  console.error('usage: node scan.mjs <film.mp4> [--cuts 4,8.5,14] [--top 12] [--black 6] [--flicker 6]');
  process.exit(2);
}
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
}
const cuts = String(opt('--cuts', ''))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map(Number);
const top = Number(opt('--top', 12));
const blackAt = Number(opt('--black', 6));
const flickerAt = Number(opt('--flicker', 6));

const W = 384;
const H = 216;
const SIZE = W * H;

const fraction = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', file], {
  encoding: 'utf8',
}).trim();
const [fn, fd] = fraction.split('/').map(Number);
const fps = fd ? fn / fd : fn;

const means = [];
const diffs = []; // diffs[i] = mean |frame i - frame i-1|, diffs[0] = 0
const skips = []; // skips[i] = mean |frame i+1 - frame i-1|, for the flicker test
let prev2 = null;
let prev1 = null;

function meanOf(f) {
  let s = 0;
  for (let k = 0; k < SIZE; k++) s += f[k];
  return s / SIZE;
}
function diffOf(a, b) {
  let s = 0;
  for (let k = 0; k < SIZE; k++) s += Math.abs(a[k] - b[k]);
  return s / SIZE;
}
function take(frame) {
  means.push(meanOf(frame));
  diffs.push(prev1 ? diffOf(frame, prev1) : 0);
  if (prev2) skips[means.length - 2] = diffOf(frame, prev2);
  prev2 = prev1;
  prev1 = frame;
}

await new Promise((resolve, reject) => {
  const ff = spawn('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:v:0', '-vf', `scale=${W}:${H}:flags=area,format=gray`, '-f', 'rawvideo', '-']);
  let pending = Buffer.alloc(0);
  ff.stdout.on('data', (chunk) => {
    pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
    while (pending.length >= SIZE) {
      take(Uint8Array.from(pending.subarray(0, SIZE)));
      pending = pending.subarray(SIZE);
    }
  });
  ff.stderr.on('data', (d) => process.stderr.write(d));
  ff.on('error', reject);
  ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
});

const n = means.length;
const t = (i) => (i / fps).toFixed(3);
console.log(`${file}: ${n} frames at ${fps.toFixed(3)} fps (${(n / fps).toFixed(3)} s)`);

let darkest = 0;
for (let i = 1; i < n; i++) if (means[i] < means[darkest]) darkest = i;
console.log(`darkest frame: ${darkest} at ${t(darkest)} s, mean luma ${means[darkest].toFixed(1)}`);

const runs = [];
for (let i = 0; i < n; i++) {
  if (means[i] >= blackAt) continue;
  const last = runs[runs.length - 1];
  if (last && last.end === i - 1) last.end = i;
  else runs.push({ start: i, end: i });
}
if (runs.length === 0) console.log(`near-black frames (mean under ${blackAt}): none`);
else {
  console.log(`near-black frames (mean under ${blackAt}): ${runs.reduce((s, r) => s + r.end - r.start + 1, 0)} in ${runs.length} runs`);
  for (const r of runs.slice(0, 20)) console.log(`  ${t(r.start)} to ${t(r.end)} s (frames ${r.start} to ${r.end})`);
  if (runs.length > 20) console.log(`  ... ${runs.length - 20} more runs`);
}

const flickers = [];
for (let i = 1; i < n - 1; i++) {
  if (diffs[i] > flickerAt && diffs[i + 1] > flickerAt && skips[i] !== undefined && skips[i] < flickerAt / 6) flickers.push(i);
}
if (flickers.length === 0) console.log('single-frame flicker: none');
else {
  console.log(`single-frame flicker: ${flickers.length} frames`);
  for (const i of flickers.slice(0, 20)) console.log(`  frame ${i} at ${t(i)} s (in ${diffs[i].toFixed(1)}, out ${diffs[i + 1].toFixed(1)}, across ${skips[i].toFixed(2)})`);
}

const ranked = diffs
  .map((d, i) => ({ i, d }))
  .slice(1)
  .sort((a, b) => b.d - a.d);
console.log(`largest frame-to-frame changes (mean absolute difference):`);
for (const { i, d } of ranked.slice(0, top)) console.log(`  ${t(i)} s (frame ${i}): ${d.toFixed(1)}`);

if (cuts.length > 0) {
  const tolerance = 1.5 / fps;
  const changeAt = (sec) => {
    const centre = Math.round(sec * fps);
    let best = centre;
    for (let i = Math.max(1, centre - 2); i <= Math.min(n - 1, centre + 2); i++) if (diffs[i] > diffs[best]) best = i;
    return best;
  };
  console.log('planned cuts:');
  const floor = ranked[Math.min(ranked.length - 1, Math.max(cuts.length, top) - 1)]?.d ?? 0;
  for (const c of cuts) {
    const i = changeAt(c);
    const on = Math.abs(i / fps - c) <= tolerance;
    console.log(`  ${c.toFixed(3)} s: change ${diffs[i].toFixed(1)} at ${t(i)} s${on ? '' : ' (off the planned frame)'}`);
  }
  const strays = ranked.slice(0, Math.max(cuts.length, top)).filter(({ i }) => !cuts.some((c) => Math.abs(i / fps - c) <= tolerance + 1 / fps));
  if (strays.length === 0) console.log('large changes away from a planned cut: none');
  else {
    console.log(`large changes away from a planned cut (at least ${floor.toFixed(1)}):`);
    for (const { i, d } of strays) console.log(`  ${t(i)} s (frame ${i}): ${d.toFixed(1)}`);
  }
}
