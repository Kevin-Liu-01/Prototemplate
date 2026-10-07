#!/usr/bin/env node
// Measures a General Translation film render against the motion brief's
// delivery targets (motion/MOTION.md, "Sound" and "What each film delivers"):
// H.264 at 1920 x 1080, 60 fps for a final (30 for a draft), AAC audio as
// long as the video, integrated loudness near -16 LUFS and a true peak under
// -1 dBTP. It reads the file with ffprobe and ffmpeg's ebur128 filter and
// writes nothing.
//
// Usage:
//   node measure-render.mjs <film.mp4> [--draft] [--log <render.log>] [--json]
//
// --draft   expects 30 fps instead of 60.
// --log     a saved render log; the check fails when it mentions Google
//           Fonts, which means the compiler replaced the kit's InterVariable.
// --json    prints the measurements as JSON instead of a table.
//
// Exit code 0 when every check passes, 1 when one fails, 2 on a usage error.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--log');
if (!file || !existsSync(file)) {
  console.error('usage: node measure-render.mjs <film.mp4> [--draft] [--log <render.log>] [--json]');
  process.exit(2);
}
const draft = args.includes('--draft');
const logAt = args.indexOf('--log');
const log = logAt >= 0 ? args[logAt + 1] : undefined;
const asJson = args.includes('--json');

/** Targets from MOTION.md. The loudness band is the films' measured range around -16. */
const TARGET = { width: 1920, height: 1080, fps: draft ? 30 : 60, lufsLow: -17, lufsHigh: -15, truePeakMax: -1 };

function probe(path) {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,duration,sample_rate,channels', '-show_entries', 'format=duration', '-of', 'json', path],
    { encoding: 'utf8' }
  );
  return JSON.parse(out);
}

function rate(fraction) {
  const [n, d] = String(fraction).split('/').map(Number);
  return d ? n / d : n;
}

/** The ebur128 summary: integrated loudness, loudness range and true peak. */
function loudness(path) {
  const run = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  const text = run.stderr ?? '';
  const summary = text.slice(text.lastIndexOf('Summary:'));
  const num = (re) => {
    const m = re.exec(summary);
    return m ? Number(m[1]) : undefined;
  };
  return {
    integrated: num(/I:\s+(-?[\d.]+) LUFS/),
    range: num(/LRA:\s+(-?[\d.]+) LU/),
    truePeak: num(/True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS/),
  };
}

const info = probe(file);
const video = info.streams.find((s) => s.codec_type === 'video');
const audio = info.streams.find((s) => s.codec_type === 'audio');
const fps = video ? rate(video.r_frame_rate) : undefined;
const videoSeconds = video ? Number(video.duration) : undefined;
const audioSeconds = audio ? Number(audio.duration) : undefined;
const loud = audio ? loudness(file) : {};

const checks = [];
function check(name, ok, value, want) {
  checks.push({ name, ok: Boolean(ok), value, want });
}

check('video codec', video?.codec_name === 'h264', video?.codec_name ?? 'none', 'h264');
check('frame size', video?.width === TARGET.width && video?.height === TARGET.height, video ? `${video.width} x ${video.height}` : 'none', `${TARGET.width} x ${TARGET.height}`);
check('frame rate', fps !== undefined && Math.abs(fps - TARGET.fps) < 0.01, fps?.toFixed(3) ?? 'none', String(TARGET.fps));
check('audio codec', audio?.codec_name === 'aac', audio?.codec_name ?? 'none', 'aac');
check(
  'audio length equals video length',
  audio && video && Math.abs(audioSeconds - videoSeconds) <= 1 / TARGET.fps + 1e-6,
  audio && video ? `${audioSeconds.toFixed(3)} s against ${videoSeconds.toFixed(3)} s` : 'missing stream',
  `within one frame (${(1 / TARGET.fps).toFixed(4)} s)`
);
check(
  'integrated loudness',
  loud.integrated !== undefined && loud.integrated >= TARGET.lufsLow && loud.integrated <= TARGET.lufsHigh,
  loud.integrated !== undefined ? `${loud.integrated} LUFS` : 'none',
  `about -16 LUFS (${TARGET.lufsLow} to ${TARGET.lufsHigh})`
);
check(
  'true peak',
  loud.truePeak !== undefined && loud.truePeak < TARGET.truePeakMax,
  loud.truePeak !== undefined ? `${loud.truePeak} dBTP` : 'none',
  `under ${TARGET.truePeakMax} dBTP`
);
if (log) {
  const text = existsSync(log) ? readFileSync(log, 'utf8') : '';
  check('render log has no Google Fonts fetch', existsSync(log) && !/Google Fonts/i.test(text), existsSync(log) ? (/Google Fonts/i.test(text) ? 'fetched' : 'clean') : 'log missing', 'clean');
}

const notes = [];
if (loud.truePeak !== undefined && Math.abs(loud.truePeak - -1.5) <= 0.15) {
  notes.push(
    'The true peak sits at about -1.5 dBTP, where the renderer pins a track whose peak passed -1 dBTP (enforceAacTruePeak). Compare the film with the sum of its voice and bed stems: a uniform gap means the correction fired and lowered the whole mix.'
  );
}

if (asJson) {
  console.log(JSON.stringify({ file, draft, fps, videoSeconds, audioSeconds, loudness: loud, checks, notes }, null, 1));
} else {
  console.log(`${file}${draft ? ' (draft)' : ''}`);
  for (const c of checks) console.log(`${c.ok ? 'pass' : 'FAIL'}  ${c.name}: ${c.value} (want ${c.want})`);
  if (loud.range !== undefined) console.log(`info  loudness range: ${loud.range} LU`);
  for (const n of notes) console.log(`note  ${n}`);
}
process.exit(checks.every((c) => c.ok) ? 0 : 1);
