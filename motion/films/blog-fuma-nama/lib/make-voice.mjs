#!/usr/bin/env node
/*
 * blog-fuma-nama (round 7d, v3 build): the narrator's masters. Writes
 * audio/vo-N.master.wav (48 kHz, 24-bit, mono) from each ElevenLabs take
 * audio/vo-N.mp3 (Frederick Surrey since the v3 build), so the mix gets nine lines at one
 * loudness whose peaks are already under control. Run it from the film folder whenever a take changes,
 * then lib/make-mix.mjs and the carve (NOTES.md, round 7):
 *
 *   node lib/make-voice.mjs
 *
 * The peaks are controlled here, not in the composition, because the
 * HyperFrames limiter worklet has no lookahead (a word's onset passes it by
 * its crest factor), and the renderer turns the whole AAC track down to
 * -1.5 dBTP whenever the mix's true peak passes -1 dBTP. ffmpeg's alimiter
 * looks ahead (its attack is the lookahead, latency compensated), and running
 * it at 192 kHz catches the peaks between samples, so the master's true peak
 * is its ceiling.
 *
 * Each take: a 75 Hz high-pass, a gain that brings the take to PRE_LUFS
 * (Clara's takes arrived 6 to 14 dB under the round 7b baritone's, Frederick's arrive at -22 to -23 LUFS,
 * and the
 * compressor's threshold is absolute, so without it the compressor would
 * barely touch them), an RMS compressor that brings the quieter
 * attributions ("said Fuma Nama", "said Fuma") nearer the quotes, a gain that
 * sets the take to TARGET LUFS integrated (measured after the filters, so
 * every line sits at one loudness), the lookahead limiter at CEIL dBFS at 4x
 * the rate, then back to 48 kHz. Nothing here moves the audio in time, so
 * the take's .json timings hold for its master.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// The mixer plays a mono clip into both channels at full level, which reads
// 3 dB louder, so a -19 LUFS mono master is a -16 LUFS narrator in the film.
// TARGET is measured on the master, after the limiter: the gain is found in
// up to four passes, so every line lands within 0.1 LU of it.
// v3 (Frederick Surrey): -18.9, 0.4 dB over round 7d's -19.3, because the
// mix with his takes read -16.5 LUFS at -19.3, the low edge of the -16 target
// v4 cut: -18.0. The v4 film is 10 s longer with the same 38.5 s of speech,
// and its 1.1 to 2.0 s gaps carry only the ducked bed, so at -18.9 the mix
// read -16.9 LUFS integrated; 0.9 dB more brings it to the -16 target
const TARGET = -18.0;
const CEIL = -3.6; // dBFS at 192 kHz: the master's true peak (1 dB under round 7's first pass: a narrator peak plus the ducked bed reached -1.0 dBTP)
const LINES = 9;
// the level every take is brought to before the compressor (the round 7b
// takes' own level, which the compressor's threshold was set for)
const PRE_LUFS = -26.5;

function stats(file, pre) {
  let out = '';
  try {
    out = execFileSync('sh', ['-c', `ffmpeg -hide_banner -nostats -i "${file}" -af "${pre ? pre + ',' : ''}ebur128=peak=true:framelog=quiet" -f null - 2>&1`], { encoding: 'utf8' });
  } catch (e) {
    out = String(e.stdout || '');
  }
  const I = Number((out.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
  const TP = Number((out.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1]);
  return { I, TP };
}

// `node lib/make-voice.mjs 7` remasters only the lines named (all eight by default)
const ONLY = process.argv.slice(2).map(Number).filter(Boolean);
for (let n = 1; n <= LINES; n++) {
  if (ONLY.length && !ONLY.includes(n)) continue;
  const src = `audio/vo-${n}.mp3`;
  if (!existsSync(src)) throw new Error('missing ' + src);
  // threshold 0.06 (-24 dBFS RMS on the raw take), ratio 3, slow enough to
  // keep the consonants' attack
  const raw = stats(src, 'highpass=f=75:poles=2');
  const pre = `highpass=f=75:poles=2,volume=${(PRE_LUFS - raw.I).toFixed(2)}dB,acompressor=threshold=0.063:ratio=3:attack=10:release=150:knee=6:detection=rms`;
  const before = stats(src, pre);
  const lim = Math.pow(10, CEIL / 20).toFixed(4);
  let gain = TARGET - before.I;
  let after;
  for (let pass = 0; pass < 4; pass++) {
    const chain = `${pre},volume=${gain.toFixed(2)}dB,aresample=192000,alimiter=limit=${lim}:attack=2:release=50:level=0:latency=1,aresample=48000`;
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-af', chain, '-ac', '1', '-c:a', 'pcm_s24le', `audio/vo-${n}.master.wav`]);
    after = stats(`audio/vo-${n}.master.wav`);
    if (Math.abs(after.I - TARGET) < 0.1) break;
    gain += TARGET - after.I;
  }
  console.log(`vo-${n}: take ${before.I.toFixed(1)} LUFS, gain ${gain >= 0 ? '+' : ''}${gain.toFixed(1)} dB -> master ${after.I.toFixed(1)} LUFS, true peak ${after.TP.toFixed(1)} dBTP`);
}
