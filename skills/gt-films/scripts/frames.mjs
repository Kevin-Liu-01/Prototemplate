#!/usr/bin/env node
// Extracts a critic's frames from a render by frame index. `ffmpeg -ss t`
// returned the wrong, near-black frame on these renders (blog-fuma-nama
// NOTES.md, round 7 traps), so every frame here is chosen with
// select='eq(n,N)', where N = round(t x fps).
//
// It takes one frame every --every seconds (default 0.5) and, for each time
// in --around, a frame every 0.25 s from 1 s before to 1 s after (the cuts
// and the major moves). Files are written as f<frame>-<seconds>s.png into
// the output folder, at full size unless --scale gives a width (1280 gives
// the 1280 x 720 legibility read).
//
// Usage:
//   node frames.mjs <film.mp4> <out-dir> [--every 0.5] [--around 8,11.5] [--at 41.43,41.6] [--scale 1280]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const [file, outDir] = args;
if (!file || !outDir || file.startsWith('--') || outDir.startsWith('--') || !existsSync(file)) {
  console.error('usage: node frames.mjs <film.mp4> <out-dir> [--every 0.5] [--around 8,11.5] [--at 41.43] [--scale 1280]');
  process.exit(2);
}
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
}
const list = (s) =>
  String(s)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map(Number);
const every = Number(opt('--every', 0.5));
const around = list(opt('--around', ''));
const at = list(opt('--at', ''));
const scale = opt('--scale', '');

const probe = JSON.parse(
  execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate,nb_frames', '-show_entries', 'format=duration', '-of', 'json', file], {
    encoding: 'utf8',
  })
);
const [fn, fd] = probe.streams[0].r_frame_rate.split('/').map(Number);
const fps = fd ? fn / fd : fn;
const total = Number(probe.streams[0].nb_frames) || Math.round(Number(probe.format.duration) * fps);

const wanted = new Set();
const add = (sec) => {
  const n = Math.round(sec * fps);
  if (n >= 0 && n < total) wanted.add(n);
};
if (every > 0) for (let s = 0; s * fps < total; s = Math.round((s + every) * 1e6) / 1e6) add(s);
for (const c of around) for (let k = -4; k <= 4; k++) add(c + k * 0.25);
for (const s of at) add(s);
const frames = [...wanted].sort((a, b) => a - b);

mkdirSync(outDir, { recursive: true });
const tmp = mkdtempSync(join(outDir, '.frames-'));
const select = frames.map((n) => `eq(n\\,${n})`).join('+');
const filters = [`select='${select}'`];
if (scale) filters.push(`scale=${Number(scale)}:-2:flags=lanczos`);
execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:v:0', '-vf', filters.join(','), '-fps_mode', 'passthrough', join(tmp, 'x%05d.png')], {
  stdio: ['ignore', 'inherit', 'inherit'],
});
const written = readdirSync(tmp)
  .filter((f) => f.endsWith('.png'))
  .sort();
if (written.length !== frames.length) console.error(`frames.mjs: asked for ${frames.length} frames, ffmpeg wrote ${written.length}`);
written.forEach((name, i) => {
  const n = frames[i];
  renameSync(join(tmp, name), join(outDir, `f${String(n).padStart(5, '0')}-${(n / fps).toFixed(3)}s.png`));
});
rmSync(tmp, { recursive: true, force: true });
console.log(`${written.length} frames from ${file} (${fps.toFixed(3)} fps) into ${outDir}`);
