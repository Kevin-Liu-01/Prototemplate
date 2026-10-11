#!/usr/bin/env node
/*
 * blog-fuma-nama (round 7d; re-cut for the v3 build, then for the v4 cut at 58.0 s, 2026-10-06): the music bed. Kevin, on the round 7 films: "for
 * the blogs i liked the peaceful music from before". The bed is round 5's
 * again: audio/archive-r6a/bed.mp3, the one ElevenLabs sound generation of
 * round 5 (28 s: a C2 drone with partials at C3, G3, A3, C4 and G4, a slow
 * soft pulse and sparse low piano; its prompt is bed.prompt.txt beside it).
 * Round 5 edited it with lib/make-bed.mjs (archive/lib-r5/) and round 6a
 * extended that edit to 44.8 s (archive-r6a/bed-edit.wav). This script builds
 * it to this film's length the same way and masters it:
 *
 *   node lib/make-bed.mjs            write audio/bed.master.wav
 *   node lib/make-bed.mjs --search   also print, for each join, the source
 *                                    time inside its window where the drone
 *                                    holds steadiest and the partials match
 *                                    best (the pinned values came from this)
 *
 * The source swells in over its first 1.25 s, drops its drone and dips at
 * 14.5 to 16.4 s, and settles from 24.25 s (about 20 dB a second after
 * 24.5). Two passages are usable: A = 1.25 to 14.4 s and B = 16.45 to 24.25
 * s, then the settle. The edit plays A, B, A, B, A, B and the settle:
 *   - the film opens on A at 1.25 s (the end of the swell), after LEAD seconds
 *     of silence, so the bed is heard alone from 0.1 s to line 1 (0.50 s in
 *     the v3 build, where it fades in from 0.1 s already ducked);
 *   - the A to B joins are round 5's pair (14.10 into 16.447 or 16.4634) and
 *     the B to A joins its other pair (23.5634 into 3.9959), both found by
 *     round 5's search; the last A to B join is searched here, so that the
 *     source's own settle (24.25 s) begins about 1.5 s into the end card
 *     (v3 with Frederick's takes: film 45.65, 1.65 s into the card at 44.0): the card opens on the bed
 *     released from its duck, and the music resolves under it, its tail
 *     under the mix's last 0.8 s fade;
 *   - every join sits under a narration line (v3: lines 2, 3, 5, 6 and 8,
 *     each 0.6 s crossfade under spoken words) and
 *     crosses over XF seconds on a raised-cosine curve between passages of
 *     the same chord colour. The drone is wide (its channels are often near
 *     anti-phase), so each pin is scored on the left channel, the right
 *     channel and the mono fold-down, as round 5 scored them.
 *
 * The master keeps round 5's tone: its stereo image as generated (nothing
 * folds or narrows it) and its EQ, which round 5 ran in the composition and
 * which is baked in here (a 38 Hz high-pass, a -6 dB low shelf at 110 Hz that
 * thins the 65 Hz drone, a +5 dB bell at 300 Hz, Q 0.7, on the partials at
 * 130 to 400 Hz, so the bed carries on small speakers). It then sets the bed
 * to BED_LUFS integrated and holds its true peak under CEIL with ffmpeg's
 * lookahead limiter at 192 kHz, because the renderer's limiter worklet has no
 * lookahead and the renderer turns the whole AAC track down whenever its true
 * peak passes -1 dBTP. The composition's own chain sets the bed's level in
 * the film, its duck and its fades (lib/make-mix.mjs).
 *
 * Why the file is edited rather than cut from clips in the composition: the
 * voiceover carve (hyperframes-audio carve.mjs) reads a bed from the start of
 * its file and ignores data-media-start, so a bed made of trimmed clips is
 * carved against the wrong audio.
 */
import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { END, CARD } from './cues.mjs';

const SRC = 'audio/archive-r6a/bed.mp3';
const OUT = 'audio/bed.master.wav';
const SR = 44100;
const XF = 0.6; // seconds per join
// The music enters LEAD seconds into the film: HyperFrames 0.8.106 adds a
// 5 ms low-frequency bump to a processed clip that is at full level from its
// first sample (NOTES.md, round 7 traps).
const LEAD = 0.1;
const BED_LUFS = -16.0;
const CEIL = -3.0;
const SETTLE = 24.25; // the source's own settle begins here
// The edit as joins: the film opens on the source at FIRST.src at FIRST.film,
// and each join leaves the source at `out` and enters it at `in`, so each
// join's film time follows from the one before. The pins: the A to B and B
// to A pairs are round 5's (its --search, window 30 ms on the incoming side);
// the last join's `out` came from this script's --search (window `win` on
// the outgoing side), the earliest whose drone holds within 0.5 dB of the
// steadiest and whose partials match best.
const FIRST = { film: LEAD, src: 1.25 };
// v4 (59.5 s since the fix round, DESIGN-v4.md "Sound"): A, B, A, B, A, B, A, B and the settle.
// Every join's 0.6 s crossfade lies under continuous speech (the speech
// windows are 1.00 to 6.12, 7.95 to 14.46, 16.33 to 19.93, 21.03 to 24.78,
// 26.34 to 29.07, 31.04 to 35.55, 37.66 to 41.86, 44.63 to 49.22 and 50.92
// to 54.42; the fix round moved lines 7 to 9 and re-searched joins 5 and 7; inside a line the crossfade also avoids its pauses, such as the
// 0.54 s after "shadcn/ui" and the 0.50 s after "scratch"). B runs 7.12 s from
// 16.447 to the B to A pair, so each B to A join is its A to B join plus
// 7.12 s, which ties the chain to the lines. The last join enters B late
// (searched on its incoming side, window `inWin`), so that the source's own
// settle (24.25) begins 1.5 to 2.0 s into the card (55.5 since the fix round).
const JOINS = [
  { out: 10.8395, in: 16.447 }, // A into B, film 9.69 to 10.29 under "shadcn/ui" (outgoing side searched, win 0.15; worst dip -2.5 dB)
  { out: 23.5634, in: 3.9959 }, // B into A (round 5's second pair), film 16.81 under "Nama has built" (-1.5 dB)
  { out: 14.1146, in: 16.447 }, // A into B (round 5's first pair, outgoing side searched, win 0.15), film 26.92 under "look at any documentation" (-3.5 dB)
  { out: 23.5634, in: 3.9959 }, // B into A, film 34.04 under "apart" (-1.5 dB)
  { out: 9.7845, in: 16.447, win: 0.15 }, // A into B (outgoing side searched, win 0.15), film 39.83 under "of contents" (-3.1 dB)
  { out: 23.5634, in: 3.9959 }, // B into A, film 46.95 under "thinks Fumadocs" (-1.5 dB)
  { out: 8.3841, in: 18.3088, win: 0.15 }, // A into B late (outgoing side searched, win 0.15; the incoming 18.3088 kept from the first v4 cut's inWin search), film 51.33 under "Fumadocs is General" (-1.9 dB); the settle lands at 57.28, 1.78 s into the card
];
const SEGMENTS = [{ film: FIRST.film, src: FIRST.src }];
JOINS.forEach((j) => {
  const prev = SEGMENTS[SEGMENTS.length - 1];
  SEGMENTS.push({ film: Math.round((prev.film + j.out - prev.src) * 1e4) / 1e4, src: j.in, search: j.win || j.inWin ? { win: j.win || 0, inWin: j.inWin || 0 } : null });
});

function decode(file) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '2', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
}

// Zero-phase low-pass (two passes of a 2-pole Butterworth at 110 Hz), for
// scoring the joins; the bed itself is never filtered here.
function lowBand(x) {
  const w0 = (2 * Math.PI * 110) / SR;
  const alpha = Math.sin(w0) / (2 * Math.SQRT1_2);
  const c = Math.cos(w0);
  const a0 = 1 + alpha;
  const b0 = (1 - c) / 2 / a0;
  const b1 = (1 - c) / a0;
  const b2 = (1 - c) / 2 / a0;
  const a1 = (-2 * c) / a0;
  const a2 = (1 - alpha) / a0;
  function pass(v) {
    const y = new Float64Array(v.length);
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;
    for (let i = 0; i < v.length; i++) {
      const o = b0 * v[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1;
      x1 = v[i];
      y2 = y1;
      y1 = o;
      y[i] = o;
    }
    return y;
  }
  const f = pass(x);
  f.reverse();
  const b = pass(f);
  b.reverse();
  return b;
}

// the log spectrum (100 Hz to 1.2 kHz) of a 0.37 s window, for matching
// partials across a join
function spectrum(x, at) {
  const n = 16384;
  const a = Math.round(at * SR) - n / 2;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = (x[a + i] || 0) * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n));
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(ang * k);
        const wi = Math.sin(ang * k);
        const ur = re[i + k];
        const ui = im[i + k];
        const vr = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi;
        const vi = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
        re[i + k] = ur + vr;
        im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr;
        im[i + k + len / 2] = ui - vi;
      }
    }
  }
  const lo = Math.round((100 * n) / SR);
  const hi = Math.round((1200 * n) / SR);
  const s = [];
  for (let k = lo; k < hi; k++) s.push(Math.log(re[k] * re[k] + im[k] * im[k] + 1e-12));
  return s;
}
function similarity(a, b) {
  const ma = a.reduce((p, v) => p + v, 0) / a.length;
  const mb = b.reduce((p, v) => p + v, 0) / b.length;
  let n = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    n += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return n / Math.sqrt(da * db);
}

const src = decode(SRC);
const frames = src.length / 2;
const mono = new Float64Array(frames);
for (let i = 0; i < frames; i++) mono[i] = (src[2 * i] + src[2 * i + 1]) / 2;

// the outgoing side's source time at each join
function outAt(k) {
  const prev = SEGMENTS[k - 1];
  return prev.src + SEGMENTS[k].film - prev.film;
}

if (process.argv.includes('--search')) {
  // A join is scored on each channel and on the mono fold-down: in each, the
  // lowest 30 ms level of the drone band inside the crossfade against the
  // quieter of the two sides just outside it. Among the outgoing times whose
  // worst dip is within 0.5 dB of the best, the one whose partials match the
  // incoming side best wins.
  const left = new Float64Array(frames);
  const right = new Float64Array(frames);
  for (let i = 0; i < frames; i++) {
    left[i] = src[2 * i];
    right[i] = src[2 * i + 1];
  }
  const bands = [lowBand(left), lowBand(right), lowBand(mono)];
  const n = Math.round(XF * SR);
  const w = Math.round(0.03 * SR);
  const db = (x, a, len, g) => {
    let e = 0;
    for (let i = 0; i < len; i++) {
      const v = g ? g(i) : x[a + i];
      e += v * v;
    }
    return 10 * Math.log10(e / len + 1e-15);
  };
  function score(ia, ib) {
    let worst = Infinity;
    for (const x of bands) {
      const mix = (i) => {
        const gg = 0.5 - 0.5 * Math.cos((Math.PI * i) / n);
        return x[ia + i] * (1 - gg) + x[ib + i] * gg;
      };
      let low = Infinity;
      for (let k = 0; k + w <= n; k += w >> 1) low = Math.min(low, db(null, 0, w, (i) => mix(k + i)));
      const sides = Math.min(db(x, ia - w, w), db(x, ib + n, w));
      worst = Math.min(worst, low - sides);
    }
    return worst;
  }
  for (let k = 1; k < SEGMENTS.length; k++) {
    const seg = SEGMENTS[k];
    const oa = outAt(k);
    const ib = Math.round(seg.src * SR);
    const pinned = score(Math.round(oa * SR), ib);
    const pinSim = similarity(spectrum(mono, oa - 0.25), spectrum(mono, seg.src + 0.25));
    let line = `join ${k} at film ${seg.film.toFixed(3)}: source ${oa.toFixed(4)} into ${seg.src} (worst dip ${pinned.toFixed(1)} dB, partials r ${pinSim.toFixed(3)})`;
    if (seg.search && seg.search.win) {
      const span = Math.round(seg.search.win * SR);
      const cands = [];
      for (let d = -span; d <= span; d += 220) cands.push({ d, s: score(Math.round(oa * SR) + d, ib) });
      const best = Math.max(...cands.map((c) => c.s));
      let pick = null;
      for (const c of cands) {
        if (c.s < best - 0.5) continue;
        const sim = similarity(spectrum(mono, oa + c.d / SR - 0.25), spectrum(mono, seg.src + 0.25));
        if (!pick || sim > pick.sim) pick = { ...c, sim };
      }
      const film = seg.film + pick.d / SR;
      line += `; best out: film ${film.toFixed(4)}, source ${(oa + pick.d / SR).toFixed(4)} (worst dip ${pick.s.toFixed(1)} dB, partials r ${pick.sim.toFixed(3)}); the settle would land at film ${(film + SETTLE - seg.src).toFixed(2)}`;
    }
    if (seg.search && seg.search.inWin) {
      // the incoming side (v4's last join): the film time stays, the source
      // entered moves, so only the settle's film time follows it
      const span = Math.round(seg.search.inWin * SR);
      const ia = Math.round(oa * SR);
      const cands = [];
      for (let d = -span; d <= span; d += 220) cands.push({ d, s: score(ia, ib + d) });
      const best = Math.max(...cands.map((c) => c.s));
      let pick = null;
      for (const c of cands) {
        if (c.s < best - 0.5) continue;
        const sim = similarity(spectrum(mono, oa - 0.25), spectrum(mono, seg.src + c.d / SR + 0.25));
        if (!pick || sim > pick.sim) pick = { ...c, sim };
      }
      const into = seg.src + pick.d / SR;
      line += `; best in: source ${into.toFixed(4)} (worst dip ${pick.s.toFixed(1)} dB, partials r ${pick.sim.toFixed(3)}); the settle would land at film ${(seg.film + SETTLE - into).toFixed(2)}`;
    }
    console.log(line);
  }
}

// the edit, in film time (the first LEAD seconds silent)
const N = Math.round(END * SR);
const out = new Float32Array(N * 2);
const nx = Math.round(XF * SR);
SEGMENTS.forEach((seg, k) => {
  const i0 = Math.round(seg.film * SR);
  const next = SEGMENTS[k + 1];
  const i1 = next ? Math.round(next.film * SR) + nx : N;
  const offset = Math.round(seg.src * SR) - i0;
  for (let i = i0; i < i1; i++) {
    let gn = 1;
    if (k > 0 && i < i0 + nx) gn = 0.5 - 0.5 * Math.cos((Math.PI * (i - i0)) / nx);
    if (next) {
      const j = Math.round(next.film * SR);
      if (i >= j) gn = 0.5 + 0.5 * Math.cos((Math.PI * (i - j)) / nx);
    }
    const s = i + offset;
    if (s < 0 || s >= frames) continue;
    out[2 * i] += gn * src[2 * s];
    out[2 * i + 1] += gn * src[2 * s + 1];
  }
});
// 5 ms in at the music's first sample and 20 ms out at the file's end, so the
// file itself never starts or stops on a step (the mix fades it in and out)
const i0 = Math.round(LEAD * SR);
const fin = Math.round(0.005 * SR);
const fout = Math.round(0.02 * SR);
for (let i = 0; i < fin; i++) {
  const gn = i / fin;
  out[2 * (i0 + i)] *= gn;
  out[2 * (i0 + i) + 1] *= gn;
}
for (let i = 0; i < fout; i++) {
  const gn = i / fout;
  const j = N - 1 - i;
  out[2 * j] *= gn;
  out[2 * j + 1] *= gn;
}
const tmp = 'audio/.bed-edit.tmp.wav';
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', tmp], { input: Buffer.from(out.buffer), maxBuffer: 1 << 28 });

function stats(file) {
  let txt = '';
  try {
    txt = execFileSync('sh', ['-c', `ffmpeg -hide_banner -nostats -i "${file}" -af ebur128=peak=true:framelog=quiet -f null - 2>&1`], { encoding: 'utf8' });
  } catch (e) {
    txt = String(e.stdout || '');
  }
  return { I: Number((txt.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]), TP: Number((txt.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1]) };
}
// round 5's EQ (its composition chain's three filters, baked in)
const EQ = 'highpass=f=38:poles=2,lowshelf=f=110:g=-6:t=s:w=1,equalizer=f=300:t=q:w=0.7:g=5';
const st0 = stats(tmp);
let gain = BED_LUFS - st0.I;
let st1;
for (let pass = 0; pass < 4; pass++) {
  const lim = Math.pow(10, CEIL / 20).toFixed(4);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-af', `${EQ},volume=${gain.toFixed(2)}dB,aresample=192000,alimiter=limit=${lim}:attack=3:release=80:level=0:latency=1,aresample=48000,apad=whole_dur=${END},atrim=end=${END}`, '-c:a', 'pcm_s24le', OUT]);
  st1 = stats(OUT);
  if (Math.abs(st1.I - BED_LUFS) < 0.1) break;
  gain += BED_LUFS - st1.I;
}
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT], { encoding: 'utf8' }));
const last = SEGMENTS[SEGMENTS.length - 1];
console.log(`${OUT}: ${dur.toFixed(3)} s, ${SEGMENTS.length} segments, joins at film ${SEGMENTS.slice(1).map((s) => s.film.toFixed(2)).join(', ')} s; the settle at film ${(last.film + SETTLE - last.src).toFixed(2)} (the card at ${CARD})`);
console.log(`edit ${st0.I.toFixed(1)} LUFS, gain ${gain.toFixed(1)} dB -> ${st1.I.toFixed(1)} LUFS, true peak ${st1.TP.toFixed(1)} dBTP`);
writeFileSync('audio/bed.segments.json', JSON.stringify({ src: SRC, lead: LEAD, xf: XF, segments: SEGMENTS }, null, 1));
if (!process.env.KEEP_TMP) rmSync(tmp);
