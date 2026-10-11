#!/usr/bin/env node
// GT motion kit: one command that checks, drafts, delivers and prunes a film,
// the same way for every film. Run it from motion/:
//
//   node kit/film.mjs status [slug]   every film's kind, final, current draft and last render pair
//   node kit/film.mjs check <slug>    hyperframes check, and a check of films/<slug>/film.json
//   node kit/film.mjs draft <slug>    the 30 fps draft, to films/<slug>/renders/draft.mp4
//   node kit/film.mjs final <slug>    delivery renders A and B, their comparison, the master
//                                     out/<slug>.mp4 and its records
//   node kit/film.mjs prune [slug]    superseded drafts and renders to the archive
//
// Options:
//   --dry-run    prune: list what would move, and move nothing
//   --no-check   draft, final: skip hyperframes check (when it has just passed)
//   --no-hear    final: make no ElevenLabs call; the previous final's transcript is reused,
//                which needs the new master's decoded audio to equal the previous master's
//   --out <dir>  status, final, prune: the folder that holds the finals, in place of motion/out,
//                for a test run that must leave the delivered records alone
//
// Each film's settings are in films/<slug>/film.json, checked against kit/film.schema.json
// (films/_smoke/film.json is the example): its kind, its render path (software or gpu), fps,
// workers, the render timeout, the poster and the records its final writes.
//
// Renders take turns through one lock at a fixed path, motion/.render.lock: a file whose one
// JSON line names its owner (the slug, this command's PID and start time, and the render's PID
// while it runs). A render that waits writes a ticket, motion/.render.queue/<epoch ms>-<slug>-<pid>,
// and only the oldest ticket whose process is alive may take the lock, so a lane that polls
// slowly is never starved by one that polls fast. A ticket or a lock whose processes have all
// exited is cleared; a live lock is never cleared, only reported once it outlives its timeout.
// On exit this command releases the lock and its ticket only while they name its own PID, and
// on a signal it first stops its own render's processes, by PID (never pkill or killall). A
// render that runs past film.json's timeout is stopped the same way. While it holds the lock, a
// render that failed before its first frame on npx's "ECOMPROMISED" or HyperFrames' "FFmpeg
// cannot start" runs again, up to three attempts 20 s apart. Each render first checks the free
// disk: 5 GiB for one worker, 8 GiB for more.
//
// A final renders A and B back to back in one hold of the lock, refuses the pair when the film's
// inputs changed between them, and compares them by framemd5 and decoded audio. When they
// differ, both are kept: the master is the one that matches the previous master on the frames
// where A and B differ, and the PSNR and the frame ranges go into renders/final.compare.txt.
// When no previous master decides and the difference is visible (PSNR under 40 dB; the _smoke
// test of 2026-10-11 had a render whose canvas stayed black), a third render, C, breaks the tie,
// and a three-way difference stops the final. The master is measured (the sound targets, faststart, 1920 x 1080 at the film's fps, no Google
// Fonts in either log) before anything is replaced. Then the previous final and its records move
// to the archive, the master and its records are written, and the A and B MP4s move to the
// archive; their logs, monitors and framemd5 files stay in renders/.
//
// Nothing is deleted. Each move goes to ~/gt/motion-archive/<date>/ at the same path relative
// to motion/ (to <date>/<hhmmss>/ when that path is taken), by rename, which fails instead of
// copying across volumes, and each is appended to that folder's INDEX.md and index.json. A file
// git tracks is never moved.
//
// Environment: MOTION_DIR, the motion folder (default: the one that holds this kit);
// MOTION_ARCHIVE, the archive root (default ~/gt/motion-archive); RENDER_LOCK_DIR, the folder
// that holds .render.lock and .render.queue/ (default: the motion folder), so a test run in
// another checkout still takes turns with every lane.
//
// Requires: Node 18.15 or later, npx (HyperFrames 0.8.106), ffmpeg and ffprobe, cwebp, and
// python3 with Pillow for the sheets. Tests: node --test motion/kit/film.test.mjs (no renders).
import { execFile, spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, closeSync, copyFileSync, existsSync, fstatSync, linkSync, mkdirSync, mkdtempSync, openSync, readFileSync, readSync, readdirSync, realpathSync, renameSync, rmSync, statSync, statfsSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir, hostname, loadavg, tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = dirname(fileURLToPath(import.meta.url));
const HF = ['-y', 'hyperframes@0.8.106'];
/** The critic's scan and measure scripts, beside this kit in the repository. */
const SKILL_SCRIPTS = join(KIT, '..', '..', 'skills', 'gt-films', 'scripts');
const POLL_MS = 5000;
const MONITOR_MS = 3000;
const ATTEMPTS = 3;
const RETRY_PAUSE_MS = 20000;
/** Failures that happen before the first frame on a loaded machine; the render runs again. */
const TRANSIENT = [/ECOMPROMISED/, /FFmpeg cannot start/i];
const GOOGLE_FONTS = /Google Fonts|fonts\.googleapis\.com|fonts\.gstatic\.com/i;
/** A master over this many bytes also gets a share copy (references/kit.md's recipe). */
const SHARE_OVER = 50_000_000;
const BASE_RECORDS = ['poster', 'sheets', 'checking', 'script', 'credits'];
const KB_RECORDS = [...BASE_RECORDS, 'web', 'captions', 'seo'];

/* ---------------------------------------------------------------- small helpers */

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Local time with its offset: 2026-10-11T12:03:04-07:00. */
export function stamp(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const zone = `${off >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${zone}`;
}
export const localDay = (d = new Date()) => stamp(d).slice(0, 10);
export const localClock = (d = new Date()) => stamp(d).slice(11, 19).replace(/:/g, '');

function say(line) {
  process.stdout.write(`film: ${line}\n`);
}

class FilmError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}
function fail(message, exitCode = 1) {
  throw new FilmError(message, exitCode);
}

/** Runs fn and returns its value, or undefined when it throws: for a file another lane may have removed first. */
function attempt(fn) {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

function readText(file) {
  return attempt(() => readFileSync(file, 'utf8')) ?? '';
}

function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
}

/** Writes a file whole: a temporary file beside it, then a rename. */
function writeAtomic(file, text) {
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

function md5File(file) {
  const hash = createHash('md5');
  const fd = openSync(file, 'r');
  const buf = Buffer.alloc(1 << 20);
  try {
    for (;;) {
      const n = readSync(fd, buf, 0, buf.length, null);
      if (n === 0) break;
      hash.update(buf.subarray(0, n));
    }
  } finally {
    closeSync(fd);
  }
  return hash.digest('hex');
}

/** A command run to its end; the output is kept, never streamed. */
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 30, ...opts });
  if (r.error) fail(`${cmd} could not start: ${r.error.message}`);
  return r;
}

/** The same, without blocking, so two decodes can run side by side. */
function runAsync(cmd, args, opts = {}) {
  return new Promise((done) => {
    execFile(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 30, ...opts }, (error, stdout, stderr) => {
      done({ status: error ? (typeof error.code === 'number' ? error.code : 1) : 0, stdout: stdout ?? '', stderr: stderr ?? '', error });
    });
  });
}

/** A path with the home folder written as ~. */
function tilde(path) {
  const rel = relative(homedir(), path);
  return rel && !rel.startsWith('..') ? `~/${rel}` : path;
}

function mb(bytes) {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}

/* ---------------------------------------------------------------- processes */

export function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

/** The start time, as ps prints it, of each of `pids` that runs: one ps call; null when ps could not run. */
export function startTimes(pids) {
  const list = [...new Set(pids.filter((p) => Number.isInteger(p) && p > 0))];
  const starts = new Map();
  if (list.length === 0) return starts;
  const r = spawnSync('ps', ['-o', 'pid=,lstart=', '-p', list.join(',')], { encoding: 'utf8' });
  if (r.error || (r.status !== 0 && r.status !== 1)) return null;
  for (const line of (r.stdout ?? '').split('\n')) {
    const m = /^\s*(\d+)\s+(.+?)\s*$/.exec(line);
    if (m) starts.set(Number(m[1]), m[2].replace(/\s+/g, ' '));
  }
  return starts;
}

export function processStart(pid) {
  return startTimes([pid])?.get(pid) ?? null;
}

/**
 * A process a record names is alive while its PID answers and, when the record
 * holds the start time, that start time still matches, so a reused PID never
 * keeps a dead lane's ticket or lock in place. `starts` is a startTimes() map
 * already read for several records.
 */
export function recordAlive(rec, starts) {
  if (!rec || !pidAlive(rec.pid)) return false;
  if (!rec.start) return true;
  const known = starts === undefined ? startTimes([rec.pid]) : starts;
  const now = known?.get(rec.pid);
  /* ps could not say, or has not listed the process yet: the PID answers, so it counts as alive */
  return now === undefined || now === rec.start;
}

/** Every process as pid, parent pid and start time. */
function processTable() {
  const r = spawnSync('ps', ['-axo', 'pid=,ppid=,lstart='], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const rows = [];
  for (const line of (r.stdout ?? '').split('\n')) {
    const m = /^\s*(\d+)\s+(\d+)\s+(.+?)\s*$/.exec(line);
    if (m) rows.push({ pid: Number(m[1]), ppid: Number(m[2]), start: m[3].replace(/\s+/g, ' ') });
  }
  return rows;
}

/** A process and all its descendants, each with its start time, the process first. */
export function processTree(pid) {
  const rows = processTable();
  const children = new Map();
  for (const row of rows) {
    if (!children.has(row.ppid)) children.set(row.ppid, []);
    children.get(row.ppid).push(row);
  }
  const root = rows.find((row) => row.pid === pid) ?? { pid, start: null };
  const tree = [root];
  for (let i = 0; i < tree.length; i++) tree.push(...(children.get(tree[i].pid) ?? []));
  return tree;
}

/**
 * Stops a process this command started and every process under it: TERM to all
 * of them (descendants first), then KILL to any still running after the grace
 * period whose start time still matches. Never a pattern, never another lane's PID.
 */
export async function stopTree(pid, { graceMs = 5000 } = {}) {
  const tree = processTree(pid);
  for (const p of [...tree].reverse()) {
    attempt(() => process.kill(p.pid, 'SIGTERM'));
  }
  const until = Date.now() + graceMs;
  while (Date.now() < until && tree.some((p) => pidAlive(p.pid))) await sleep(200);
  const now = new Map(processTable().map((row) => [row.pid, row.start]));
  for (const p of tree) {
    if (!now.has(p.pid) || (p.start && now.get(p.pid) !== p.start)) continue;
    attempt(() => process.kill(p.pid, 'SIGKILL'));
  }
  return tree.map((p) => p.pid);
}

/* ---------------------------------------------------------------- the render lock and its queue */

export function queuePaths(root) {
  return { lock: join(root, '.render.lock'), queue: join(root, '.render.queue') };
}

export function ticketName(ms, slug, pid) {
  return `${ms}-${slug}-${pid}`;
}

export function parseTicket(name) {
  const m = /^(\d{10,})-(.+)-(\d+)$/.exec(name);
  return m ? { name, ms: Number(m[1]), slug: m[2], pid: Number(m[3]) } : null;
}

/** Writes this run's ticket; the name carries the time, the slug and the PID. */
export function enqueue(root, rec) {
  const { queue } = queuePaths(root);
  mkdirSync(queue, { recursive: true });
  for (let ms = Date.now(); ; ms++) {
    const file = join(queue, ticketName(ms, rec.slug, rec.pid));
    try {
      writeFileSync(file, `${JSON.stringify({ ...rec, since: stamp() })}\n`, { flag: 'wx' });
      return file;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
}

/** The tickets of live processes, oldest first; a ticket whose process has exited is removed. */
export function liveTickets(root, { alive = recordAlive, onClear = () => {} } = {}) {
  const { queue } = queuePaths(root);
  if (!existsSync(queue)) return [];
  const tickets = readdirSync(queue).map(parseTicket).filter(Boolean);
  const starts = startTimes(tickets.map((t) => t.pid));
  const live = [];
  for (const ticket of tickets) {
    const { name } = ticket;
    let rec = { pid: ticket.pid };
    try {
      rec = { ...JSON.parse(readFileSync(join(queue, name), 'utf8')), pid: ticket.pid };
    } catch {
      /* a ticket still being written names its PID in its name */
    }
    if (!alive(rec, starts)) {
      try {
        unlinkSync(join(queue, name));
        onClear(ticket);
      } catch {
        /* another lane cleared it first */
      }
      continue;
    }
    live.push({ ...ticket, file: join(queue, name), rec });
  }
  return live.sort((a, b) => a.ms - b.ms || a.pid - b.pid || (a.name < b.name ? -1 : 1));
}

/** The lock's owner record, null when there is no lock, { unreadable: true } for a file that is not one JSON line. */
export function readLock(root) {
  const { lock } = queuePaths(root);
  let text;
  try {
    text = readFileSync(lock, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  try {
    return JSON.parse(text);
  } catch {
    return { unreadable: true };
  }
}

/** A lock is alive while its owner or its render runs. A lock that is not readable counts as alive. */
export function lockAlive(owner, alive = recordAlive) {
  if (!owner) return false;
  if (owner.unreadable) return true;
  return alive(owner) || Boolean(owner.render && alive(owner.render));
}

export function describeOwner(owner) {
  if (!owner) return 'free';
  if (owner.unreadable) return 'held (the lock file is not readable)';
  const render = owner.render ? `, render pid ${owner.render.pid}` : '';
  return `${owner.slug} (pid ${owner.pid}, ${owner.command}${owner.label ? ` ${owner.label}` : ''}, since ${owner.since ?? '?'}${render})`;
}

/** Creates the lock with its owner in one step: a hard link from a written file fails while a lock exists. */
function linkLock(root, rec) {
  const { lock } = queuePaths(root);
  const tmp = `${lock}.${rec.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(rec)}\n`);
  try {
    linkSync(tmp, lock);
    return true;
  } catch (error) {
    if (error.code === 'EEXIST') return false;
    throw error;
  } finally {
    unlinkSync(tmp);
  }
}

/** Removes a lock whose owner and render have both exited; the same file must still be in place. */
export function clearDeadLock(root, { alive = recordAlive } = {}) {
  const { lock } = queuePaths(root);
  let before;
  try {
    before = { text: readFileSync(lock, 'utf8'), ino: statSync(lock).ino };
  } catch {
    return null;
  }
  let owner;
  try {
    owner = JSON.parse(before.text);
  } catch {
    owner = { unreadable: true };
  }
  if (owner.unreadable) return null;
  if (lockAlive(owner, alive)) return null;
  try {
    if (statSync(lock).ino !== before.ino || readFileSync(lock, 'utf8') !== before.text) return null;
    unlinkSync(lock);
  } catch {
    return null;
  }
  return owner;
}

/**
 * Takes the lock for `me` ({ slug, pid, start, command, label, timeout }). It
 * writes a ticket and waits its turn: only the oldest live ticket may take the
 * lock, and only that ticket's run clears a dead lock first. Resolves when the
 * lock is this run's; the ticket is removed then.
 */
export async function acquireLock(root, me, { pollMs = POLL_MS, alive = recordAlive, log = () => {} } = {}) {
  let ticket = enqueue(root, me);
  let last = '';
  let reported = null;
  for (;;) {
    const tickets = liveTickets(root, { alive, onClear: (t) => log(`cleared a dead ticket: ${t.name}`) });
    const place = tickets.findIndex((t) => t.file === ticket);
    if (place < 0) {
      log('this run lost its ticket; writing a new one');
      ticket = enqueue(root, me);
      continue;
    }
    if (place === 0) {
      const dead = clearDeadLock(root, { alive });
      if (dead) log(`cleared a dead lock: ${describeOwner(dead)}`);
      if (linkLock(root, { ...me, since: stamp(), render: null })) {
        attempt(() => unlinkSync(ticket));
        return { ticket };
      }
    }
    const owner = readLock(root);
    const line = `waiting: ${place} ticket${place === 1 ? '' : 's'} ahead; lock ${describeOwner(owner)}`;
    if (line !== last) log(line);
    last = line;
    if (owner && !owner.unreadable && owner.since && owner.timeout && reported !== owner.since) {
      const heldMin = (Date.now() - Date.parse(owner.since)) / 60000;
      if (heldMin > 2 * owner.timeout + 10) {
        log(`the lock has been held ${Math.round(heldMin)} min, past twice its owner's ${owner.timeout} min timeout; its processes are alive, so it stays (not cleared)`);
        reported = owner.since;
      }
    }
    await sleep(pollMs);
  }
}

/** Rewrites the lock's owner record, only while the lock names `pid`. */
export function updateLock(root, pid, patch) {
  const { lock } = queuePaths(root);
  const owner = readLock(root);
  if (!owner || owner.unreadable || owner.pid !== pid) return false;
  writeAtomic(lock, `${JSON.stringify({ ...owner, ...patch })}\n`);
  return true;
}

/** Removes the lock only while it names `pid`. */
export function releaseLock(root, pid) {
  const { lock } = queuePaths(root);
  const owner = readLock(root);
  if (!owner || owner.unreadable || owner.pid !== pid) return false;
  try {
    unlinkSync(lock);
    return true;
  } catch {
    return false;
  }
}

/** Removes this PID's own tickets and no other. */
export function dropTickets(root, pid) {
  const { queue } = queuePaths(root);
  if (!existsSync(queue)) return 0;
  let n = 0;
  for (const name of readdirSync(queue)) {
    if (parseTicket(name)?.pid !== pid) continue;
    try {
      unlinkSync(join(queue, name));
      n++;
    } catch {
      /* already gone */
    }
  }
  return n;
}

/** This run's lock state, which the exit trap reads. */
export const RUN = { root: null, render: null, trapped: false };

/**
 * The exit trap. On exit it releases the lock and this run's ticket, each only
 * while it names this PID. On SIGINT, SIGTERM or SIGHUP it first stops the
 * render this run started (its whole process tree, by PID), then exits.
 */
export function installTrap(root) {
  RUN.root = root;
  if (RUN.trapped) return;
  RUN.trapped = true;
  process.on('exit', () => {
    if (!RUN.root) return;
    releaseLock(RUN.root, process.pid);
    dropTickets(RUN.root, process.pid);
  });
  for (const [signal, n] of [
    ['SIGINT', 2],
    ['SIGTERM', 15],
    ['SIGHUP', 1],
  ]) {
    process.on(signal, async () => {
      if (RUN.render && pidAlive(RUN.render)) await stopTree(RUN.render);
      process.exit(128 + n);
    });
  }
}

/** Runs `fn` while this run holds the lock; the lock is released when it returns or throws. */
async function underLock(ctx, film, command, fn) {
  installTrap(ctx.lockRoot);
  const me = { slug: film.slug, pid: process.pid, start: processStart(process.pid), command, label: null, timeout: film.timeout, host: hostname() };
  const t0 = Date.now();
  await acquireLock(ctx.lockRoot, me, { log: say });
  const waited = Math.round((Date.now() - t0) / 1000);
  say(`lock taken after ${waited} s waiting (${join(ctx.lockRoot, '.render.lock')})`);
  try {
    return await fn({ waited, takenAt: stamp() });
  } finally {
    releaseLock(ctx.lockRoot, process.pid);
    say(`lock released ${stamp()}`);
  }
}

/* ---------------------------------------------------------------- film.json */

/** The schema subset film.schema.json uses: type, enum, const, oneOf, required, properties, additionalProperties, items, uniqueItems, minimum, maximum, minLength, pattern. */
export function validate(schema, value, at = '') {
  const where = at || 'film.json';
  const errors = [];
  if ('const' in schema && value !== schema.const) errors.push(`${where}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${where}: must be one of ${schema.enum.join(', ')}`);
  if (schema.type && !typeMatches(schema.type, value)) return [...errors, `${where}: must be ${schema.type === 'integer' ? 'an integer' : `a ${schema.type}`}`];
  if (schema.oneOf) {
    const passing = schema.oneOf.filter((option) => validate(option, value, at).length === 0).length;
    if (passing !== 1) errors.push(`${where}: matches none of its forms (${schema.description ?? 'see the schema'})`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${where}: must be at least ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${where}: must be at most ${schema.maximum}`);
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${where}: must not be empty`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${where}: must match ${schema.pattern}`);
  }
  if (Array.isArray(value)) {
    if (schema.items) value.forEach((item, i) => errors.push(...validate(schema.items, item, `${where}[${i}]`)));
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) errors.push(`${where}: lists an item twice`);
  }
  if (isObject(value)) {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${where}: needs ${key}`);
    for (const [key, item] of Object.entries(value)) {
      const sub = schema.properties?.[key];
      if (sub) errors.push(...validate(sub, item, at ? `${at}.${key}` : key));
      else if (schema.additionalProperties === false) errors.push(`${where}: has an unknown field ${key}`);
    }
  }
  return errors;
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

const TYPES = {
  integer: (v) => Number.isInteger(v),
  number: (v) => typeof v === 'number' && Number.isFinite(v),
  string: (v) => typeof v === 'string',
  boolean: (v) => typeof v === 'boolean',
  object: isObject,
  array: Array.isArray,
  null: (v) => v === null,
};

function typeMatches(type, v) {
  return TYPES[type]?.(v) ?? false;
}

let SCHEMA = null;
export function loadSchema() {
  SCHEMA ??= JSON.parse(readFileSync(join(KIT, 'film.schema.json'), 'utf8'));
  return SCHEMA;
}

/** film.json with every default filled in. `raw` must have passed validate(). */
export function normalizeFilm(raw) {
  const kb = raw.kind === 'kb';
  const slug = raw.slug;
  return {
    slug,
    kind: raw.kind,
    path: raw.path,
    fps: raw.fps ?? 60,
    workers: raw.workers ?? 1,
    timeout: raw.timeout ?? 60,
    poster: raw.poster ?? (kb ? { kb: true } : null),
    records: raw.records ?? (kb ? KB_RECORDS : BASE_RECORDS),
    checking: raw.checking ?? (kb ? 'kit/kb/check-sheet.py' : 'tools/sheet.py'),
    script: {
      source: raw.script?.source ?? `out/scripts/source/${slug}.json`,
      voices: raw.script?.voices ?? 'Narrator: Frederick Surrey',
      version: raw.script?.version ?? '',
    },
    sound: raw.sound === false ? false : (raw.sound ?? { lufs: -16, within: 0.5, truePeak: -1 }),
    legacyDraft: [...new Set([`out/_draft-${slug}.mp4`, ...(raw.legacyDraft ?? [])])],
  };
}

/** The rules a schema cannot say: the slug is the folder's name, and the records need what they read. */
export function filmRules(film, folderName) {
  const errors = [];
  if (film.slug !== folderName) errors.push(`slug: is ${film.slug}, but the folder is ${folderName}`);
  if (film.records.includes('poster') && !film.poster) errors.push('poster: records lists poster, so film.json needs poster ({"frame": n} or {"at": seconds})');
  for (const r of ['web', 'captions', 'seo']) if (film.records.includes(r) && film.kind !== 'kb') errors.push(`records: ${r} is a kb film's record`);
  if (film.sound === false && (film.records.includes('script') || film.records.includes('captions'))) errors.push('records: a silent film (sound false) has no transcript for script or captions');
  return errors;
}

/** Loads and checks films/<slug>/film.json: { film } or { errors }. */
export function loadFilm(ctx, slug) {
  const file = join(ctx.films, slug, 'film.json');
  if (!existsSync(file)) return { errors: [`films/${slug}/film.json does not exist`], missing: true };
  let raw;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    return { errors: [`films/${slug}/film.json is not JSON: ${error.message}`] };
  }
  /* a film whose own tools already read a film.json of their own (kb-translate-google-slides keeps its kb data there) */
  if (isObject(raw) && !('kind' in raw) && !('path' in raw)) return { errors: [`films/${slug}/film.json is the film's own data, not kit/film.mjs settings (it has no kind and no path)`], foreign: true };
  const errors = validate(loadSchema(), raw);
  if (errors.length) return { errors };
  const film = normalizeFilm(raw);
  const rules = filmRules(film, slug);
  return rules.length ? { errors: rules } : { film };
}

function filmOrFail(ctx, slug) {
  if (!slug) fail('name a film: node kit/film.mjs <command> <slug>', 2);
  if (!existsSync(join(ctx.films, slug))) fail(`films/${slug} does not exist`, 2);
  const { film, errors } = loadFilm(ctx, slug);
  if (!film) fail(`films/${slug}/film.json:\n  ${errors.join('\n  ')}`);
  return film;
}

/** A film.json path: relative to motion/, with out/ meaning the folder that holds the finals. */
function motionPath(ctx, rel) {
  if (rel === 'out' || rel.startsWith('out/')) return join(ctx.out, rel.slice(4));
  return join(ctx.motion, rel);
}

/** A path as a reader wants it: relative to motion/ when it is inside, else whole. */
function show(ctx, abs) {
  const rel = relative(ctx.motion, abs);
  return rel && !rel.startsWith('..') ? rel : abs;
}

/** What a film needs before a render: the files its composition reads and, with records, the files its records read. */
export function prerequisites(ctx, film, { records = true } = {}) {
  const dir = join(ctx.films, film.slug);
  const missing = [];
  const need = (path, why) => {
    if (!existsSync(path)) missing.push(`${show(ctx, path)} (${why})`);
  };
  need(join(dir, 'index.html'), 'the composition');
  need(join(dir, 'kit', 'tokens.css'), 'the kit link, films/<slug>/kit -> ../../kit');
  if (!records) return missing;
  if (film.records.includes('sheets')) need(join(ctx.kit, 'contact-sheet.sh'), 'the contact sheet');
  if (film.records.includes('checking')) need(join(dir, film.checking), 'the checking sheet tool');
  if (film.records.includes('credits')) need(join(dir, 'CREDITS.txt'), 'the credits');
  if (film.records.includes('script')) {
    need(join(ctx.kit, 'script-export.py'), 'the script page');
    need(join(ctx.kit, 'audio', 'el.mjs'), 'the transcript, el.mjs hear');
    if (film.kind !== 'kb') need(motionPath(ctx, film.script.source), 'the reviewed script table');
  }
  if (film.kind === 'kb') {
    need(join(dir, 'kb.json'), 'the kb film data');
    need(join(dir, 'lib', 'kb-data.js'), 'the built kb data');
    for (const tool of ['build.mjs', 'script-source.mjs', 'captions.mjs', 'seo.mjs', 'encode-web.sh']) need(join(ctx.kit, 'kb', tool), 'the kb kit');
  }
  return missing;
}

/* ---------------------------------------------------------------- media */

export function probe(file) {
  const r = run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,duration,nb_frames:format=duration', '-of', 'json', file]);
  if (r.status !== 0) fail(`ffprobe could not read ${file}: ${r.stderr.trim()}`);
  return JSON.parse(r.stdout);
}

function rate(fraction) {
  const [n, d] = String(fraction).split('/').map(Number);
  return d ? n / d : n;
}

/** Each frame's md5 from a framemd5 file's text, in order. */
export function parseFramemd5(text) {
  const out = [];
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const fields = line.split(',');
    out.push(fields[fields.length - 1].trim());
  }
  return out;
}

/** Two frame lists compared: the frames that differ, as inclusive [first, last] runs. */
export function compareFrames(a, b) {
  const ranges = [];
  let differing = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === b[i]) continue;
    differing++;
    const last = ranges[ranges.length - 1];
    if (last && last[1] === i - 1) last[1] = i;
    else ranges.push([i, i]);
  }
  return { framesA: a.length, framesB: b.length, differing, ranges };
}

/** Of the frames where two renders differ, how many of each equal a reference (the previous master). */
export function matchReference(a, b, ref, ranges) {
  let matchA = 0;
  let matchB = 0;
  for (const [first, last] of ranges) {
    for (let i = first; i <= last; i++) {
      if (ref[i] === undefined) continue;
      if (a[i] === ref[i]) matchA++;
      if (b[i] === ref[i]) matchB++;
    }
  }
  return { matchA, matchB };
}

/** Below this PSNR (dB) two renders differ visibly; hunayn's invisible pair difference was 52.7 dB. */
const VISIBLE_PSNR = 40;

/**
 * Which render of a differing pair becomes the master. The previous master
 * decides when it equals one render on more of the differing frames (or, with
 * the video equal, has one render's audio). When it does not decide and the
 * difference is visible, `tieBreak` asks for a third render; otherwise render A.
 */
export function pickMaster({ fa, fb, frames, ref = null, audioA = null, audioB = null, prevAudio = null, psnrMin = null }) {
  if (frames.differing === 0 && audioA === audioB) return { pick: 'a', why: 'A and B are identical', tieBreak: false };
  if (ref) {
    const { matchA, matchB } = matchReference(fa, fb, ref, frames.ranges);
    const audioPick = audioA !== audioB && prevAudio ? (audioB === prevAudio ? 'b' : audioA === prevAudio ? 'a' : null) : null;
    if (matchA !== matchB || audioPick) {
      const pick = matchA !== matchB ? (matchB > matchA ? 'b' : 'a') : audioPick;
      return { pick, why: `of the ${frames.differing} differing frames, the previous master equals A on ${matchA} and B on ${matchB}${audioPick ? `; its audio equals ${audioPick.toUpperCase()}'s` : ''}`, tieBreak: false };
    }
  }
  const reason = ref ? 'the previous master equals neither render more often on the differing frames' : 'there is no previous master';
  if (psnrMin !== null && Number(psnrMin) < VISIBLE_PSNR) return { pick: null, why: `${reason}, and the difference is visible (PSNR min ${psnrMin} dB, under ${VISIBLE_PSNR})`, tieBreak: true };
  return { pick: 'a', why: `${reason}; the difference is invisible (PSNR min ${psnrMin ?? '?'} dB), so render A`, tieBreak: false };
}

/** A third render settles a visible tie: the render it equals on more of the differing frames, or null when it equals neither more. */
export function tieBreak(fa, fb, fc, ranges) {
  const { matchA, matchB } = matchReference(fa, fb, fc, ranges);
  return { pick: matchA === matchB ? null : matchA > matchB ? 'a' : 'b', matchA, matchB };
}

export async function framemd5(file, outFile) {
  const r = await runAsync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-map', '0:v:0', '-f', 'framemd5', outFile]);
  if (r.status !== 0) fail(`ffmpeg framemd5 failed on ${file}: ${r.stderr.trim()}`);
  return parseFramemd5(readFileSync(outFile, 'utf8'));
}

/** The md5 of the decoded audio, or null for a file with no audio stream. */
async function audioMd5(file) {
  /* -vn: with no audio stream, an optional map alone would fall back to hashing the video */
  const r = await runAsync('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:a:0?', '-vn', '-f', 'md5', '-']);
  return /MD5=([0-9a-f]{32})/.exec(r.stdout)?.[1] ?? null;
}

/** The PSNR between two renders over one run of frames. */
async function psnr(a, b, [first, last]) {
  const span = `trim=start_frame=${first}:end_frame=${last + 1},setpts=PTS-STARTPTS`;
  const r = await runAsync('ffmpeg', ['-hide_banner', '-nostats', '-i', a, '-i', b, '-lavfi', `[0:v]${span}[a];[1:v]${span}[b];[a][b]psnr`, '-f', 'null', '-']);
  const m = /PSNR y:\S+ u:\S+ v:\S+ average:(\S+) min:(\S+) max:(\S+)/.exec(r.stderr);
  return m ? { average: m[1], min: m[2], max: m[3] } : null;
}

/** The ebur128 summary of a file's first audio stream. */
export function loudness(file) {
  const r = run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const summary = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  const num = (re) => {
    const m = re.exec(summary);
    if (!m) return null;
    return m[1] === '-inf' ? -Infinity : Number(m[1]);
  };
  return { integrated: num(/I:\s+(-?[\d.]+) LUFS/), range: num(/LRA:\s+(-?[\d.]+) LU/), truePeak: num(/True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS/) };
}

/** The SHA-256 of each stream copied as it is, as build:motion pins a cut (the same for a render and its faststart remux). */
export function streamHashes(file) {
  const r = run('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:v', '-map', '0:a?', '-c', 'copy', '-f', 'streamhash', '-hash', 'sha256', '-']);
  const streams = {};
  for (const line of r.stdout.split('\n')) {
    const m = /^\d+,([va]),SHA256=([0-9a-f]{64})$/.exec(line.trim());
    if (m) streams[m[1] === 'v' ? 'video' : 'audio'] = m[2];
  }
  return streams;
}

/** An MP4's top-level boxes, read from their headers. */
export function topBoxes(file) {
  const fd = openSync(file, 'r');
  const size = fstatSync(fd).size;
  const head = Buffer.alloc(16);
  const boxes = [];
  try {
    for (let at = 0; at + 8 <= size && boxes.length < 64; ) {
      readSync(fd, head, 0, 16, at);
      let length = head.readUInt32BE(0);
      const type = head.toString('latin1', 4, 8);
      if (length === 1) length = Number(head.readBigUInt64BE(8));
      else if (length === 0) length = size - at;
      if (length < 8) break;
      boxes.push({ type, offset: at, size: length });
      at += length;
    }
  } finally {
    closeSync(fd);
  }
  return boxes;
}

export function isFaststart(boxes) {
  const moov = boxes.findIndex((b) => b.type === 'moov');
  const mdat = boxes.findIndex((b) => b.type === 'mdat');
  return moov >= 0 && mdat >= 0 && moov < mdat;
}

/** An MP4's length in seconds from its mvhd box, without starting ffprobe. */
export function mp4Seconds(file) {
  try {
    const moov = topBoxes(file).find((b) => b.type === 'moov');
    if (!moov) return null;
    const fd = openSync(file, 'r');
    const buf = Buffer.alloc(Math.min(moov.size, 4096));
    readSync(fd, buf, 0, buf.length, moov.offset);
    closeSync(fd);
    for (let at = 8; at + 8 <= buf.length; ) {
      const length = buf.readUInt32BE(at);
      if (buf.toString('latin1', at + 4, at + 8) === 'mvhd') {
        const v1 = buf[at + 8] === 1;
        const scale = buf.readUInt32BE(at + (v1 ? 28 : 20));
        const units = v1 ? Number(buf.readBigUInt64BE(at + 32)) : buf.readUInt32BE(at + 24);
        return scale ? units / scale : null;
      }
      if (length < 8) break;
      at += length;
    }
  } catch {
    /* not an MP4 this reader knows */
  }
  return null;
}

export function freeGiB(path) {
  const s = statfsSync(path);
  return (s.bavail * s.bsize) / 2 ** 30;
}

/* ---------------------------------------------------------------- render logs and inputs */

/** What a HyperFrames render log says about the render. */
export function renderFacts(text) {
  const plain = stripAnsi(text);
  let gate = null;
  const gateLine = /streaming-encode gate (\{[^\n]*\})/.exec(plain);
  if (gateLine) {
    try {
      const j = JSON.parse(gateLine[1]);
      gate = { enabled: j.enabled, reason: j.reason };
    } catch {
      gate = { enabled: null, reason: 'unreadable' };
    }
  }
  return {
    compositionHash: /"compositionHash":"([0-9a-f]+)"/.exec(plain)?.[1] ?? null,
    gpuMode: /"browserGpuMode":"(\w+)"/.exec(plain)?.[1] ?? null,
    totalFrames: Number(/"totalFrames":(\d+)/.exec(plain)?.[1]) || null,
    gate,
    googleFonts: GOOGLE_FONTS.test(plain),
    summary: /rendered in [^\n]*/.exec(plain)?.[0]?.trim() ?? null,
    capture: /\n\s*(\S+ capture · [^\n]*)/.exec(plain)?.[1]?.trim() ?? null,
  };
}

const SKIP_INPUT_DIRS = /^(renders|archive.*|proto-v.*|node_modules|snapshots)$/;

/**
 * Every file a render can read: the film's folder and the kit it links, by path,
 * size and modification time, without renders, archives, hidden files and the
 * docs. A pair is valid only when this is the same before A and after B.
 */
export function inputSnapshot(dir) {
  const seen = new Set();
  const lines = [];
  const walk = (abs, rel) => {
    let real;
    try {
      real = realpathSync(abs);
    } catch {
      return;
    }
    if (seen.has(real)) return;
    seen.add(real);
    for (const name of readdirSync(abs).sort()) {
      if (name.startsWith('.') || SKIP_INPUT_DIRS.test(name)) continue;
      const path = join(abs, name);
      const r = rel ? `${rel}/${name}` : name;
      let st;
      try {
        st = statSync(path);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(path, r);
      else if (st.isFile() && !/\.(md|txt)$/i.test(name) && !/^film\.(json|mjs|schema\.json|test\.mjs)$/.test(name)) lines.push(`${r}\t${st.size}\t${Math.round(st.mtimeMs)}`);
    }
  };
  walk(dir, '');
  return { files: lines.length, hash: createHash('sha256').update(lines.join('\n')).digest('hex').slice(0, 16), lines };
}

export function inputChanges(before, after) {
  const a = new Set(before.lines);
  const b = new Set(after.lines);
  return { gone: before.lines.filter((l) => !b.has(l)), added: after.lines.filter((l) => !a.has(l)) };
}

/* ---------------------------------------------------------------- renders */

function pathFlags(film) {
  return film.path === 'software' ? ['--no-browser-gpu'] : [];
}

function note(file, line) {
  appendFileSync(file, `# ${line}\n`);
}

/** The render's work folders beside its output, in MiB. */
function workMiB(dir, outName) {
  const stem = outName.replace(/\.mp4$/, '');
  let names = [];
  try {
    names = readdirSync(dir).filter((n) => n.startsWith('work-') || n.startsWith(`.${stem}.hf-transaction`));
  } catch {
    return Promise.resolve(0);
  }
  if (names.length === 0) return Promise.resolve(0);
  return new Promise((done) =>
    execFile('du', ['-sk', ...names.map((n) => join(dir, n))], (error, stdout) => {
      const kb = String(stdout ?? '')
        .split('\n')
        .reduce((sum, line) => sum + (Number(line.split('\t')[0]) || 0), 0);
      done(Math.round(kb / 1024));
    })
  );
}

function renderOnce(ctx, film, job, attempt) {
  return new Promise((done) => {
    const dir = join(ctx.films, film.slug);
    const fd = openSync(job.log, 'w');
    const child = spawn('npx', [...HF, 'render', '.', ...job.args, '-o', job.mp4], { cwd: dir, stdio: ['ignore', fd, fd] });
    closeSync(fd);
    const t0 = Date.now();
    let timedOut = false;
    let busy = false;
    let settled = false;
    let tick = null;
    let limit = null;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearInterval(tick);
      clearTimeout(limit);
      RUN.render = null;
      updateLock(ctx.lockRoot, process.pid, { render: null });
      const seconds = Math.round((Date.now() - t0) / 1000);
      note(job.mon, `render exit ${result.code ?? result.signal ?? result.error} after ${seconds} s`);
      done({ ...result, timedOut, seconds });
    };
    child.on('error', (error) => finish({ code: null, error: error.message }));
    if (!child.pid) return;
    RUN.render = child.pid;
    updateLock(ctx.lockRoot, process.pid, { label: job.label, render: { pid: child.pid, start: processStart(child.pid) } });
    note(job.mon, `attempt ${attempt}: ${stamp()}, render pid ${child.pid}: npx ${HF.join(' ')} render . ${job.args.join(' ')} -o ${relative(dir, job.mp4)}`);
    appendFileSync(job.mon, 't_s\tfree_gib\twork_mib\tload1\n');
    tick = setInterval(() => {
      if (busy) return;
      busy = true;
      workMiB(dirname(job.mp4), basename(job.mp4)).then((mib) => {
        appendFileSync(job.mon, `${Math.round((Date.now() - t0) / 1000)}\t${freeGiB(ctx.motion).toFixed(1)}\t${mib}\t${loadavg()[0].toFixed(1)}\n`);
        busy = false;
      });
    }, MONITOR_MS);
    limit = setTimeout(() => {
      timedOut = true;
      note(job.mon, `the render ran past film.json's ${film.timeout} min timeout; stopping its processes by PID`);
      stopTree(child.pid);
    }, film.timeout * 60000);
    child.on('exit', (code, signal) => finish({ code, signal }));
  });
}

/** One render with the disk gate and the retries; the caller holds the lock. */
async function renderJob(ctx, film, job, lockInfo) {
  writeFileSync(job.mon, '');
  note(job.mon, `kit/film.mjs ${job.command} ${film.slug}: ${job.label}, film.mjs pid ${process.pid}`);
  note(job.mon, `lock taken ${lockInfo.takenAt} after ${lockInfo.waited} s waiting`);
  const need = film.workers > 1 ? 8 : 5;
  const free = freeGiB(ctx.motion);
  note(job.mon, `free disk before the render: ${free.toFixed(1)} GiB (needs ${need} for ${film.workers} worker${film.workers === 1 ? '' : 's'})`);
  if (free < need) return { ok: false, reason: `${free.toFixed(1)} GiB free, under the ${need} GiB this render needs` };
  for (let attempt = 1; ; attempt++) {
    const r = await renderOnce(ctx, film, job, attempt);
    if (r.code === 0 && !r.timedOut && existsSync(job.mp4)) return { ok: true, ...r, attempts: attempt };
    const text = stripAnsi(readText(job.log));
    const transient = TRANSIENT.find((re) => re.test(text));
    if (!r.timedOut && transient && !/streaming-encode gate/.test(text) && attempt < ATTEMPTS) {
      copyFileSync(job.log, job.log.replace(/\.log$/, `.attempt${attempt}.log`));
      note(job.mon, `attempt ${attempt} stopped before its first frame (${transient.source}); trying again in ${RETRY_PAUSE_MS / 1000} s, still holding the lock`);
      say(`${job.label}: attempt ${attempt} stopped before its first frame (${transient.source}); trying again`);
      await sleep(RETRY_PAUSE_MS);
      continue;
    }
    return { ok: false, ...r, attempts: attempt, reason: r.timedOut ? `stopped after the ${film.timeout} min timeout` : `the render exited ${r.code ?? r.signal ?? r.error}` };
  }
}

/** hyperframes check in the film's folder; its output goes to renders/check.log. */
function hfCheck(dir, logFile) {
  const r = spawnSync('npx', [...HF, 'check', '.'], { cwd: dir, encoding: 'utf8', maxBuffer: 1 << 28 });
  const text = stripAnsi(`${r.stdout ?? ''}${r.stderr ?? ''}`);
  writeFileSync(logFile, text);
  const lines = text.split('\n').filter((l) => /check (passed|failed)|\berrors?\b|\bwarnings?\b/i.test(l));
  return { ok: r.status === 0, status: r.status, summary: lines.slice(-3).map((l) => l.trim()).join(' / ') };
}

function kbBuildCheck(dir, logFile) {
  const r = spawnSync('node', ['kit/kb/build.mjs', '--check'], { cwd: dir, encoding: 'utf8', maxBuffer: 1 << 28 });
  writeFileSync(logFile, `${r.stdout ?? ''}${r.stderr ?? ''}`);
  return r.status === 0;
}

/* ---------------------------------------------------------------- the archive */

/**
 * Where a set of files goes: <archive>/<day>/ followed by each file's path
 * relative to motion/, or <day>/<hhmmss>/ when one of those paths is taken.
 * `units` are { rel, from }.
 */
export function planArchive({ archive, units, now = new Date(), exists = existsSync }) {
  const day = localDay(now);
  const dayDir = join(archive, day);
  const taken = (base) => units.some((u) => exists(join(base, u.rel)));
  let base = dayDir;
  if (taken(base)) {
    const clock = localClock(now);
    base = join(dayDir, clock);
    for (let k = 2; taken(base); k++) base = join(dayDir, `${clock}-${k}`);
  }
  return { day, dayDir, base, moves: units.map((u) => ({ ...u, to: join(base, u.rel) })) };
}

/** Files git tracks among `paths` (absolute), when the motion folder is in a checkout. */
function tracked(ctx, paths) {
  const inside = paths.filter((p) => !relative(ctx.motion, p).startsWith('..'));
  if (inside.length === 0) return new Set();
  const r = spawnSync('git', ['-C', ctx.motion, 'ls-files', '-z', '--', ...inside.map((p) => relative(ctx.motion, p))], { encoding: 'utf8' });
  if (r.status !== 0) return new Set();
  return new Set(r.stdout.split('\0').filter(Boolean).map((rel) => join(ctx.motion, rel)));
}

/**
 * Moves files into the archive by rename and appends each to the day's index.
 * `units` are { rel, from, reason, tier }. Returns the moves that happened.
 */
export function archiveFiles(ctx, units, { by, now = new Date() } = {}) {
  if (units.length === 0) return [];
  const keep = tracked(ctx, units.map((u) => u.from));
  if (keep.size) fail(`refusing to move tracked files: ${[...keep].map((p) => relative(ctx.motion, p)).join(', ')}`);
  const plan = planArchive({ archive: ctx.archive, units, now });
  const moved = [];
  let error = null;
  for (const m of plan.moves) {
    try {
      mkdirSync(dirname(m.to), { recursive: true });
      renameSync(m.from, m.to);
      moved.push(m);
    } catch (e) {
      error = e;
      break;
    }
  }
  if (moved.length) {
    const at = stamp(now);
    appendIndex({
      dayDir: plan.dayDir,
      day: plan.day,
      archive: ctx.archive,
      motion: ctx.motion,
      units: moved.map((m) => ({ ...m, movedAt: at, by })),
    });
  }
  if (error) fail(`the archive move stopped at ${error.path ?? ''}: ${error.message}${error.code === 'EXDEV' ? ' (another volume; film.mjs never copies)' : ''}; ${moved.length} file(s) moved and indexed first`);
  return moved;
}

const INDEX_HEAD = '## Moves by kit/film.mjs';
const INDEX_TABLE = ['| moved at | old path (motion/...) | new path | MB | by | tier | reason |', '| --- | --- | --- | --- | --- | --- | --- |'];

/** Adds rows to the film.mjs table of an INDEX.md, creating the section at the end when it is missing. */
export function insertIndexRows(md, rows) {
  const lines = md.replace(/\n+$/, '').split('\n');
  let head = lines.indexOf(INDEX_HEAD);
  if (head < 0) {
    lines.push(
      '',
      INDEX_HEAD,
      '',
      'Each row is one file that kit/film.mjs moved here by rename: its old path relative to motion/, its new path relative to the archive root, its size, the command that moved it, the deletion tier (1: an exact copy of a kept file; 2: a superseded draft or intermediate; 3: a superseded final or a render that differs from the kept one) and why. Nothing was deleted.',
      '',
      ...INDEX_TABLE
    );
    head = lines.indexOf(INDEX_HEAD);
  }
  let sep = lines.indexOf(INDEX_TABLE[1], head);
  if (sep < 0) {
    lines.splice(head + 1, 0, '', ...INDEX_TABLE);
    sep = head + 3;
  }
  let end = sep;
  while (end + 1 < lines.length && lines[end + 1].startsWith('|')) end++;
  lines.splice(end + 1, 0, ...rows);
  return `${lines.join('\n')}\n`;
}

function indexHeader(day, motion) {
  return [
    `# Archive index: motion/, ${day}`,
    '',
    `Every file in this folder was moved by rename from \`${motion}/\` by kit/film.mjs (draft, final and prune). Nothing was deleted. A file's new path is this folder followed by its old path relative to motion/, or a time folder (\`${day}/<hhmmss>/\`) when that path was already taken.`,
    '',
    '- `index.json`: every file with its old and new path, bytes and md5, and for a video its stream SHA-256s and length.',
    '- To put a file back (its old path must not exist): `mv <new path> <motion>/<old path>`.',
    '',
  ].join('\n');
}

/** A short lock on the index of one day, so two lanes never write it at once. */
function withIndexLock(dayDir, fn) {
  const lock = join(dayDir, '.index.lock');
  const until = Date.now() + 60000;
  for (;;) {
    try {
      writeFileSync(lock, `${JSON.stringify({ pid: process.pid, start: processStart(process.pid) })}\n`, { flag: 'wx' });
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      /* an owner still being written reads as none */
      const owner = attempt(() => JSON.parse(readFileSync(lock, 'utf8')));
      if (owner && !recordAlive(owner)) {
        attempt(() => unlinkSync(lock));
        continue;
      }
      if (Date.now() > until) fail(`${lock} has been held for a minute by a live process; the index was not written`);
      sleepSync(50);
    }
  }
  try {
    return fn();
  } finally {
    unlinkSync(lock);
  }
}

/** One index.json entry for a moved file: bytes, md5, and for a video its stream hashes and length. */
function fileEntry(m, motion) {
  const bytes = statSync(m.to).size;
  const entry = { old: oldPath(m, motion), new: m.to, unit: oldPath(m, motion), kind: 'file', bytes, md5: md5File(m.to) };
  if (/\.(mp4|mov)$/i.test(m.to)) {
    entry.streams = streamHashes(m.to);
    const seconds = mp4Seconds(m.to);
    if (seconds !== null) entry.duration = seconds.toFixed(3);
  }
  return entry;
}

function oldPath(m, motion) {
  return m.from === join(motion, m.rel) ? `motion/${m.rel}` : m.from;
}

/** Appends moved files to <day>/index.json and <day>/INDEX.md, creating both when the day is new. */
export function appendIndex({ dayDir, day, archive, motion, units }) {
  mkdirSync(dayDir, { recursive: true });
  const files = units.map((m) => fileEntry(m, motion));
  return withIndexLock(dayDir, () => {
    const jsonFile = join(dayDir, 'index.json');
    const data = existsSync(jsonFile)
      ? JSON.parse(readFileSync(jsonFile, 'utf8'))
      : { about: `Files moved here by kit/film.mjs from ${motion}. Nothing was deleted. To restore one: mv "<new>" "<old>" with motion/ read as ${motion}/.`, source_root: motion, archive_root: dayDir, units: [], files: [] };
    data.units ??= [];
    data.files ??= [];
    units.forEach((m, i) => {
      data.units.push({ old: oldPath(m, motion), new: m.to, class: 'superseded', tier: String(m.tier ?? 2), reason: m.reason, bytes: files[i].bytes, files: 1, mp4s: /\.mp4$/i.test(m.to) ? 1 : 0, moved_at: m.movedAt, by: m.by });
      data.files.push(files[i]);
    });
    writeAtomic(jsonFile, `${JSON.stringify(data, null, 1)}\n`);
    const mdFile = join(dayDir, 'INDEX.md');
    const md = existsSync(mdFile) ? readFileSync(mdFile, 'utf8') : indexHeader(day, motion);
    const rows = units.map((m, i) => `| ${m.movedAt.slice(0, 16).replace('T', ' ')} | \`${m.rel}\` | \`${relative(archive, m.to)}\` | ${(files[i].bytes / 1e6).toFixed(1)} | ${m.by} | ${m.tier ?? 2} | ${m.reason} |`);
    writeAtomic(mdFile, insertIndexRows(md, rows));
    return files;
  });
}

/** The md5 of every file the archive's index.json files list, to find a render the archive already holds. */
function archivedMd5s(ctx) {
  const map = new Map();
  if (!existsSync(ctx.archive)) return map;
  for (const day of readdirSync(ctx.archive)) {
    const file = join(ctx.archive, day, 'index.json');
    if (!existsSync(file)) continue;
    const files = attempt(() => JSON.parse(readFileSync(file, 'utf8')).files) ?? [];
    for (const f of files) if (f.md5) map.set(f.md5, f.new);
  }
  return map;
}

/* ---------------------------------------------------------------- what a film holds */

function listFilms(ctx) {
  if (!existsSync(ctx.films)) return [];
  return readdirSync(ctx.films)
    .filter((name) => !name.startsWith('.') && statSync(join(ctx.films, name)).isDirectory())
    .sort();
}

/** The current draft: renders/draft.mp4, else the first old draft path that exists. */
function currentDraft(ctx, slug, film) {
  const paths = [`films/${slug}/renders/draft.mp4`, ...(film?.legacyDraft ?? [`out/_draft-${slug}.mp4`])];
  for (const rel of paths) {
    const abs = motionPath(ctx, rel);
    if (existsSync(abs)) return { rel, abs, mtimeMs: statSync(abs).mtimeMs, seconds: mp4Seconds(abs) };
  }
  return null;
}

/** The files of a draft: renders/draft.mp4 with its log, monitor and report, or an old draft with its checking sheet. */
function draftFiles(ctx, draft) {
  if (draft.rel.endsWith('/renders/draft.mp4')) {
    const dir = dirname(draft.abs);
    return ['draft.mp4', 'draft.log', 'draft.monitor.tsv', 'draft.report.txt', 'draft.check.log']
      .filter((n) => existsSync(join(dir, n)))
      .map((n) => ({ rel: `${dirname(draft.rel)}/${n}`, from: join(dir, n) }));
  }
  const files = [{ rel: draft.rel, from: draft.abs }];
  const sheet = join(ctx.out, '_sheets', basename(draft.rel).replace(/\.mp4$/, '.png'));
  if (existsSync(sheet)) files.push({ rel: `out/_sheets/${basename(sheet)}`, from: sheet });
  return files;
}

/** The last render pair: film.mjs's compare record, else the two newest framemd5 files in renders/. */
function lastPair(ctx, slug) {
  const renders = join(ctx.films, slug, 'renders');
  const record = join(renders, 'final.compare.txt');
  if (existsSync(record)) return readText(record).split('\n')[0].replace(/^summary:\s*/, '');
  if (!existsSync(renders)) return null;
  /* the two newest video framemd5 files (an older lane wrote audio ones too, render-a.audio.framemd5) */
  const sums = readdirSync(renders)
    .filter((n) => n.endsWith('.framemd5') && !/prev|audio/.test(n))
    .map((n) => ({ n, t: statSync(join(renders, n)).mtimeMs }))
    .sort((a, b) => b.t - a.t)
    .slice(0, 2);
  if (sums.length < 2) return null;
  const [b, a] = sums.map((s) => parseFramemd5(readText(join(renders, s.n))));
  const c = compareFrames(a, b);
  const names = `${sums[1].n} and ${sums[0].n}`;
  return c.differing === 0 ? `identical, ${c.framesA} frames (${names})` : `${c.differing} of ${c.framesA} frames differ (${names})`;
}

/** The final's records out/ holds for a film, as archive units. */
function finalRecordUnits(ctx, film) {
  const s = film.slug;
  const rels = [
    `${s}-share.mp4`,
    `${s}.png`,
    `${s}.credits.txt`,
    `sheets/${s}.png`,
    `sheets/${s}.webp`,
    `_sheets/${s}.png`,
    `scripts/${s}.md`,
    `scripts/source/${s}.stt.json`,
    `web/${s}.mp4`,
    `web/${s}.jpg`,
    `captions/${s}.vtt`,
    `seo/${s}.json`,
    `logs/${s}.render.log`,
    `logs/${s}.render.log.wait`,
  ];
  /* a kb film writes its script table at each final; another film's table is an input and stays */
  if (film.kind === 'kb') rels.push(`scripts/source/${s}.json`);
  /* the master last, so a move that stops early leaves it in place */
  rels.push(`${s}.mp4`);
  return rels.filter((r) => existsSync(join(ctx.out, r))).map((r) => ({ rel: `out/${r}`, from: join(ctx.out, r) }));
}

/* ---------------------------------------------------------------- status */

function fmtWhen(ms) {
  return stamp(new Date(ms)).slice(0, 16).replace('T', ' ');
}

function lockLines(ctx) {
  const owner = readLock(ctx.lockRoot);
  const { queue } = queuePaths(ctx.lockRoot);
  const waiting = [];
  if (existsSync(queue)) {
    for (const name of readdirSync(queue).sort()) {
      const t = parseTicket(name);
      if (t) waiting.push(`${t.slug} (pid ${t.pid}${pidAlive(t.pid) ? '' : ', exited'})`);
    }
  }
  return [`lock: ${describeOwner(owner)}${owner && !lockAlive(owner) ? ' (its processes have exited; the next render clears it)' : ''}`, `queue: ${waiting.length ? waiting.join(', ') : 'empty'}`];
}

function table(rows) {
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
  return rows.map((r) => r.map((cell, i) => String(cell).padEnd(widths[i])).join('  ').trimEnd()).join('\n');
}

function cmdStatus(ctx, slug) {
  for (const line of lockLines(ctx)) say(line);
  if (slug) return statusOne(ctx, slug);
  const rows = [['slug', 'kind', 'final (out/<slug>.mp4)', 'current draft', 'last render pair']];
  for (const name of listFilms(ctx)) {
    const { film, missing, foreign } = loadFilm(ctx, name);
    const kind = film ? film.kind : missing ? '-' : foreign ? 'other' : 'invalid';
    const master = join(ctx.out, `${name}.mp4`);
    const final = existsSync(master) ? `${(mp4Seconds(master) ?? 0).toFixed(1)} s, ${fmtWhen(statSync(master).mtimeMs)}` : '-';
    const draft = currentDraft(ctx, name, film);
    const older = draft && existsSync(master) && draft.mtimeMs < statSync(master).mtimeMs ? ', older than the final' : '';
    const draftCell = draft ? `${draft.rel.replace(`films/${name}/`, '')} (${(draft.seconds ?? 0).toFixed(1)} s, ${fmtWhen(draft.mtimeMs)}${older})` : '-';
    rows.push([name, kind, final, draftCell, lastPair(ctx, name) ?? '-']);
  }
  process.stdout.write(`${table(rows)}\n`);
  return 0;
}

function statusOne(ctx, slug) {
  if (!existsSync(join(ctx.films, slug))) fail(`films/${slug} does not exist`, 2);
  const { film, errors } = loadFilm(ctx, slug);
  if (film) say(`${slug}: ${film.kind}, ${film.path} path, ${film.fps} fps, ${film.workers} worker${film.workers === 1 ? '' : 's'}, ${film.timeout} min timeout; records ${film.records.join(', ')}`);
  else say(`${slug}: film.json: ${errors.join('; ')}`);
  const master = join(ctx.out, `${slug}.mp4`);
  if (existsSync(master)) {
    const st = statSync(master);
    say(`final: ${show(ctx, master)}, ${(mp4Seconds(master) ?? 0).toFixed(3)} s, ${mb(st.size)}, ${fmtWhen(st.mtimeMs)}`);
  } else say('final: none');
  const draft = currentDraft(ctx, slug, film);
  say(`current draft: ${draft ? `${draft.rel}, ${(draft.seconds ?? 0).toFixed(3)} s, ${fmtWhen(draft.mtimeMs)}` : 'none'}`);
  say(`last render pair: ${lastPair(ctx, slug) ?? 'none recorded'}`);
  if (film) {
    const records = finalRecordUnits(ctx, film).map((u) => u.rel);
    say(`records in out/: ${records.length ? records.join(', ') : 'none'}`);
    const missing = prerequisites(ctx, film);
    say(`prerequisites: ${missing.length ? `missing ${missing.join('; ')}` : 'all present'}`);
  }
  const renders = join(ctx.films, slug, 'renders');
  if (existsSync(renders)) say(`renders/: ${readdirSync(renders).sort().join(', ') || 'empty'}`);
  return 0;
}

/* ---------------------------------------------------------------- check */

function cmdCheck(ctx, slug) {
  if (!slug) fail('name a film: node kit/film.mjs check <slug>', 2);
  const dir = join(ctx.films, slug);
  if (!existsSync(dir)) fail(`films/${slug} does not exist`, 2);
  let ok = true;
  const { film, errors } = loadFilm(ctx, slug);
  if (film) {
    const missing = prerequisites(ctx, film);
    if (missing.length) {
      ok = false;
      for (const m of missing) say(`missing: ${m}`);
    } else say(`films/${slug}/film.json: valid (${film.kind}, ${film.path} path, ${film.fps} fps, ${film.workers} worker${film.workers === 1 ? '' : 's'}); every file its records need is present`);
  } else {
    ok = false;
    for (const e of errors) say(`film.json: ${e}`);
  }
  say(`npx ${HF.join(' ')} check . in films/${slug}`);
  const r = spawnSync('npx', [...HF, 'check', '.'], { cwd: dir, stdio: 'inherit' });
  if (r.status !== 0) ok = false;
  if (film?.kind === 'kb') {
    say('node kit/kb/build.mjs --check');
    const kb = spawnSync('node', ['kit/kb/build.mjs', '--check'], { cwd: dir, stdio: 'inherit' });
    if (kb.status !== 0) ok = false;
  }
  say(ok ? 'check: pass' : 'check: FAIL');
  return ok ? 0 : 1;
}

/* ---------------------------------------------------------------- draft */

/** The critic's scan and measure of a render, as text for its report. */
function criticLines(file, { draft, log }) {
  const out = [];
  for (const [name, args] of [
    ['scan.mjs', [file]],
    ['measure-render.mjs', [file, ...(draft ? ['--draft'] : []), ...(log ? ['--log', log] : [])]],
  ]) {
    const script = join(SKILL_SCRIPTS, name);
    if (!existsSync(script)) {
      out.push(`## ${name}`, `not run: ${script} is missing`, '');
      continue;
    }
    const r = run('node', [script, ...args]);
    out.push(`## ${name} (exit ${r.status})`, `${r.stdout}${r.stderr}`.trim(), '');
  }
  return out;
}

async function cmdDraft(ctx, slug, opts) {
  const film = filmOrFail(ctx, slug);
  const dir = join(ctx.films, slug);
  const renders = join(dir, 'renders');
  mkdirSync(renders, { recursive: true });
  const missing = prerequisites(ctx, film, { records: false });
  if (missing.length) fail(`missing: ${missing.join('; ')}`);
  let checkSummary = 'not run (--no-check)';
  if (!opts.noCheck) {
    say('hyperframes check (renders/draft-next.check.log)');
    const c = hfCheck(dir, join(renders, 'draft-next.check.log'));
    checkSummary = c.summary || `exit ${c.status}`;
    if (!c.ok) fail(`hyperframes check failed (${checkSummary}); see films/${slug}/renders/draft-next.check.log`);
  }
  const job = {
    command: 'draft',
    label: 'draft',
    mp4: join(renders, 'draft-next.mp4'),
    log: join(renders, 'draft-next.log'),
    mon: join(renders, 'draft-next.monitor.tsv'),
    args: ['--quality', 'draft', '--fps', '30', '--workers', String(film.workers), ...pathFlags(film)],
  };
  const result = await underLock(ctx, film, 'draft', (lockInfo) => renderJob(ctx, film, job, lockInfo));
  note(job.mon, `lock released ${stamp()}`);
  if (!result.ok) fail(`the draft failed: ${result.reason}; the previous draft is unchanged; log: films/${slug}/renders/draft-next.log`);

  /* the previous draft (and an old draft in out/) to the archive, then the new one into place */
  const previous = [];
  const old = currentDraft(ctx, slug, film);
  if (old) previous.push(...draftFiles(ctx, old));
  for (const rel of film.legacyDraft) {
    const abs = motionPath(ctx, rel);
    if (existsSync(abs) && !previous.some((p) => p.from === abs)) previous.push(...draftFiles(ctx, { rel, abs }));
  }
  const moved = archiveFiles(
    ctx,
    previous.map((p) => ({ ...p, tier: 2, reason: `the draft of ${slug} before the draft of ${stamp().slice(0, 16).replace('T', ' ')}` })),
    { by: `film.mjs draft ${slug}` }
  );
  for (const [from, to] of [
    ['draft-next.mp4', 'draft.mp4'],
    ['draft-next.log', 'draft.log'],
    ['draft-next.monitor.tsv', 'draft.monitor.tsv'],
    ['draft-next.check.log', 'draft.check.log'],
  ]) {
    if (existsSync(join(renders, from))) renameSync(join(renders, from), join(renders, to));
  }
  const draft = join(renders, 'draft.mp4');
  const facts = renderFacts(readText(join(renders, 'draft.log')));
  const info = probe(draft);
  const video = info.streams.find((s) => s.codec_type === 'video');
  const report = [
    `# Draft of ${slug}`,
    '',
    `- written: ${stamp()} by kit/film.mjs draft (${film.path} path, 30 fps, draft quality, ${film.workers} worker${film.workers === 1 ? '' : 's'})`,
    `- render: ${result.seconds} s, ${result.attempts} attempt${result.attempts === 1 ? '' : 's'}; waited for the lock as renders/draft.monitor.tsv records`,
    `- file: films/${slug}/renders/draft.mp4, ${mb(statSync(draft).size)}, ${Number(info.format.duration).toFixed(3)} s, ${video?.nb_frames ?? '?'} frames, md5 ${md5File(draft)}`,
    `- composition hash: ${facts.compositionHash ?? 'not in the log'}; browser GPU mode: ${facts.gpuMode ?? '?'}; ${facts.capture ?? ''}`,
    `- Google Fonts in the log: ${facts.googleFonts ? 'YES (the compiler replaced the kit face)' : 'no'}`,
    `- hyperframes check: ${checkSummary}`,
    `- the previous draft: ${moved.length ? moved.map((m) => relative(ctx.archive, m.to)).join(', ') : 'none'}`,
    film.sound === false ? '- the film is silent (film.json sound false), so measure-render.mjs\'s audio checks below do not apply' : null,
    '',
    ...criticLines(draft, { draft: true, log: join(renders, 'draft.log') }),
  ].filter((l) => l !== null);
  writeFileSync(join(renders, 'draft.report.txt'), `${report.join('\n')}\n`);
  say(`draft: films/${slug}/renders/draft.mp4 (${Number(info.format.duration).toFixed(3)} s); report: renders/draft.report.txt`);
  if (facts.googleFonts) say('WARNING: the render log mentions Google Fonts');
  return 0;
}

/* ---------------------------------------------------------------- final */

/** Reads KB.poster from a kb film's lib/kb-data.js, as kit/kb/deliver.sh did. */
function kbPoster(dir) {
  const text = readFileSync(join(dir, 'lib', 'kb-data.js'), 'utf8');
  const data = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  return data.poster ?? 2;
}

function kbInputs(dir) {
  return /name="kb-inputs" content="([^"]*)"/.exec(readText(join(dir, 'index.html')))?.[1] ?? null;
}

/** Measures a master against its film's targets; every check as { name, ok, value, want }. */
export function measureMaster(file, film, logs) {
  const info = probe(file);
  const video = info.streams.find((s) => s.codec_type === 'video');
  const audio = info.streams.find((s) => s.codec_type === 'audio');
  const checks = [];
  const check = (name, ok, value, want) => checks.push({ name, ok: Boolean(ok), value, want });
  const fps = video ? rate(video.r_frame_rate) : null;
  check('video codec', video?.codec_name === 'h264', video?.codec_name ?? 'none', 'h264');
  check('frame size', video?.width === 1920 && video?.height === 1080, video ? `${video.width} x ${video.height}` : 'none', '1920 x 1080');
  check('frame rate', fps !== null && Math.abs(fps - film.fps) < 0.01, fps?.toFixed(3) ?? 'none', String(film.fps));
  check('faststart', isFaststart(topBoxes(file)), topBoxes(file).map((b) => b.type).join(' '), 'moov before mdat');
  for (const log of logs) check(`no Google Fonts in ${basename(log)}`, !GOOGLE_FONTS.test(readText(log)), GOOGLE_FONTS.test(readText(log)) ? 'mentioned' : 'clean', 'clean');
  let loud = null;
  if (film.sound) {
    check('audio codec', audio?.codec_name === 'aac', audio?.codec_name ?? 'none', 'aac');
    const vs = Number(video?.duration);
    const as = Number(audio?.duration);
    check('audio as long as the video', audio && Math.abs(as - vs) <= 1 / film.fps + 1e-6, audio ? `${as.toFixed(3)} s against ${vs.toFixed(3)} s` : 'no audio', 'within one frame');
    if (audio) {
      loud = loudness(file);
      check('integrated loudness', loud.integrated !== null && Math.abs(loud.integrated - film.sound.lufs) <= film.sound.within + 1e-9, `${loud.integrated} LUFS`, `${film.sound.lufs} LUFS within ${film.sound.within}`);
      check('true peak', loud.truePeak !== null && loud.truePeak <= film.sound.truePeak + 1e-9, `${loud.truePeak} dBTP`, `at or below ${film.sound.truePeak} dBTP`);
    }
  } else check('silent film', !audio, audio ? `an ${audio.codec_name} stream` : 'no audio stream', 'no audio stream');
  return { checks, loud, seconds: Number(info.format.duration), frames: Number(video?.nb_frames) || null };
}

async function cmdFinal(ctx, slug, opts) {
  const film = filmOrFail(ctx, slug);
  const dir = join(ctx.films, slug);
  const renders = join(dir, 'renders');
  const out = ctx.out;
  mkdirSync(renders, { recursive: true });
  mkdirSync(out, { recursive: true });
  const report = [`# Final of ${slug}`, '', `- started: ${stamp()} by kit/film.mjs final (${film.path} path, ${film.fps} fps, delivery quality, ${film.workers} worker${film.workers === 1 ? '' : 's'})`];

  /* 0. before the lock: everything the renders and the records need */
  const missing = prerequisites(ctx, film);
  if (missing.length) fail(`missing: ${missing.join('; ')}`);
  if (film.kind === 'kb') {
    say('node kit/kb/build.mjs --check');
    if (!kbBuildCheck(dir, join(renders, 'next.kb-check.log'))) fail(`node kit/kb/build.mjs --check failed: the composition differs from what kb.json and the takes build; see films/${slug}/renders/next.kb-check.log`);
  }
  if (!opts.noCheck) {
    say('hyperframes check');
    const c = hfCheck(dir, join(renders, 'next.check.log'));
    if (!c.ok) fail(`hyperframes check failed (${c.summary || `exit ${c.status}`}); see films/${slug}/renders/next.check.log`);
    report.push(`- hyperframes check: ${c.summary || 'passed'}`);
  }

  /* 1. renders A and B, back to back in one hold of the lock */
  const flags = ['--quality', 'delivery', '--fps', String(film.fps), '--workers', String(film.workers), ...pathFlags(film)];
  const jobs = ['a', 'b'].map((x) => ({
    command: 'final',
    label: `final-${x}`,
    x,
    mp4: join(renders, `next-${x}.mp4`),
    log: join(renders, `next-${x}.log`),
    mon: join(renders, `next-${x}.monitor.tsv`),
    args: flags,
  }));
  /* the inputs are read as render A starts and as render B ends, both inside the lock (a lane may edit while it waits) */
  let before = null;
  let after = null;
  const results = await underLock(ctx, film, 'final', async (lockInfo) => {
    before = inputSnapshot(dir);
    const done = [];
    for (const job of jobs) {
      say(`render ${job.x.toUpperCase()}: npx ${HF.join(' ')} render . ${flags.join(' ')}`);
      const r = await renderJob(ctx, film, job, lockInfo);
      done.push(r);
      if (!r.ok) break;
    }
    after = inputSnapshot(dir);
    return done;
  });
  for (const job of jobs) if (existsSync(job.mon)) note(job.mon, `lock released ${stamp()}`);
  const failed = results.findIndex((r) => !r.ok);
  if (failed >= 0) fail(`render ${jobs[failed].x.toUpperCase()} failed: ${results[failed].reason}; nothing was replaced; log: films/${slug}/renders/next-${jobs[failed].x}.log`);
  const changes = inputChanges(before, after);
  const factsA = renderFacts(readText(jobs[0].log));
  const factsB = renderFacts(readText(jobs[1].log));

  /* 2. the comparison */
  say('comparing A and B (framemd5, decoded audio)');
  const [fa, fb, audioA, audioB] = await Promise.all([
    framemd5(jobs[0].mp4, join(renders, 'next-a.framemd5')),
    framemd5(jobs[1].mp4, join(renders, 'next-b.framemd5')),
    audioMd5(jobs[0].mp4),
    audioMd5(jobs[1].mp4),
  ]);
  const frames = compareFrames(fa, fb);
  const identical = frames.differing === 0 && audioA === audioB;
  const previous = join(out, `${slug}.mp4`);
  const hasPrevious = existsSync(previous);
  const prevAudio = hasPrevious ? await audioMd5(previous) : null;
  let span = null;
  let quality = null;
  let ref = null;
  if (!identical) {
    span = frames.ranges.length ? [frames.ranges[0][0], frames.ranges[frames.ranges.length - 1][1]] : null;
    if (span) quality = await psnr(jobs[0].mp4, jobs[1].mp4, span);
    if (hasPrevious) ref = await framemd5(previous, join(renders, 'next-prev.framemd5'));
  }
  let { pick, why, tieBreak: needThird } = pickMaster({ fa, fb, frames, ref, audioA, audioB, prevAudio, psnrMin: quality?.min ?? null });
  /* a visible difference the previous master cannot settle: a third render, C, breaks the tie */
  let third = null;
  const inputsChanged = changes.gone.length + changes.added.length > 0;
  if (needThird && !inputsChanged) {
    say(`A and B differ visibly and the previous master does not settle it; rendering C as a tie-break`);
    const jobC = { command: 'final', label: 'final-c', x: 'c', mp4: join(renders, 'next-c.mp4'), log: join(renders, 'next-c.log'), mon: join(renders, 'next-c.monitor.tsv'), args: flags };
    let afterC = null;
    const rc = await underLock(ctx, film, 'final', async (lockInfo) => {
      const r = await renderJob(ctx, film, jobC, lockInfo);
      afterC = inputSnapshot(dir);
      return r;
    });
    note(jobC.mon, `lock released ${stamp()}`);
    if (!rc.ok) fail(`the tie-break render C failed: ${rc.reason}; nothing was replaced; log: films/${slug}/renders/next-c.log`);
    const changedC = inputChanges(before, afterC);
    if (changedC.gone.length + changedC.added.length) fail(`the film's inputs changed before render C ended, so the tie-break proves nothing; nothing was replaced`);
    const fc = await framemd5(jobC.mp4, join(renders, 'next-c.framemd5'));
    third = { ...tieBreak(fa, fb, fc, frames.ranges), seconds: rc.seconds, frames: fc, audio: await audioMd5(jobC.mp4) };
    pick = third.pick;
    why = `${why}; render C equals A on ${third.matchA} and B on ${third.matchB} of the differing frames`;
  }
  const fps = film.fps;
  const rangeText = frames.ranges.map(([a, b]) => (a === b ? `${a}` : `${a} to ${b}`) + ` (${(a / fps).toFixed(3)} to ${((b + 1) / fps).toFixed(3)} s)`).join(', ');
  const summary = identical
    ? `identical, ${frames.framesA} frames, audio identical`
    : `${frames.differing} of ${frames.framesA} frames differ${frames.framesA !== frames.framesB ? ` (A ${frames.framesA}, B ${frames.framesB} frames)` : ''}${audioA !== audioB ? ', audio differs' : ''}${quality ? `, PSNR min ${quality.min} dB` : ''}${third ? `, tie-break render C` : ''}; kept both, master ${pick ? pick.toUpperCase() : 'none (the three renders differ)'}`;
  const compare = [
    `summary: ${summary}`,
    '',
    `rendered: A ${results[0].seconds} s and B ${results[1].seconds} s, back to back in one hold of the lock, ${film.path} path`,
    `composition hash: A ${factsA.compositionHash ?? '?'}, B ${factsB.compositionHash ?? '?'}`,
    `inputs (the film folder and its kit, by path, size and time): ${changes.gone.length + changes.added.length === 0 ? `unchanged between A and B (${after.files} files, ${after.hash})` : `CHANGED between A and B: ${[...changes.gone.map((l) => `- ${l.split('\t')[0]}`), ...changes.added.map((l) => `+ ${l.split('\t')[0]}`)].slice(0, 20).join(', ')}`}`,
    `video frames: A ${frames.framesA}, B ${frames.framesB}; differing ${frames.differing}${frames.ranges.length ? `: ${rangeText}` : ''}`,
    `decoded audio md5: A ${audioA ?? 'none'}, B ${audioB ?? 'none'}${audioA === audioB ? ' (identical)' : ' (DIFFERENT)'}`,
    quality ? `PSNR of A against B over frames ${span[0]} to ${span[1]}: average ${quality.average} dB, min ${quality.min} dB, max ${quality.max} dB` : null,
    `previous master: ${hasPrevious ? `${show(ctx, previous)}, decoded audio md5 ${prevAudio ?? 'none'}` : 'none'}`,
    third ? `tie-break render C (${third.seconds} s): equals A on ${third.matchA} and B on ${third.matchB} of the ${frames.differing} differing frames` : null,
    `master: ${pick ? `render ${pick.toUpperCase()}` : 'none'} (${why})`,
  ].filter((l) => l !== null);
  writeFileSync(join(renders, 'next.compare.txt'), `${compare.join('\n')}\n`);
  say(`pair: ${summary}`);
  if (inputsChanged) fail(`the film's inputs changed between render A and render B, so the pair proves nothing; nothing was replaced (renders/next.compare.txt)`);
  if (!pick) fail(`render C equals neither A nor B more often (A ${third.matchA}, B ${third.matchB}), so the three renders differ; nothing was replaced (renders/next.compare.txt)`);
  const chosen = jobs.find((j) => j.x === pick);

  /* 3. the master, written beside the renders first and measured before anything is replaced */
  const facts = pick === 'a' ? factsA : factsB;
  const inputs = film.kind === 'kb' ? kbInputs(dir) : null;
  const comment = `final-${pick}.mp4, hyperframes compositionHash ${facts.compositionHash ?? 'unknown'}${inputs ? `, kb-inputs ${inputs}` : ''}, kit/film.mjs final ${stamp()}`;
  const staged = join(renders, 'next-master.mp4');
  const mux = run('ffmpeg', ['-v', 'error', '-y', '-i', chosen.mp4, '-map', '0', '-c', 'copy', '-movflags', '+faststart', '-metadata', `comment=${comment}`, '-f', 'mp4', staged]);
  if (mux.status !== 0) fail(`ffmpeg could not write the master: ${mux.stderr.trim()}`);
  const pickStreams = streamHashes(chosen.mp4);
  const masterStreams = streamHashes(staged);
  if (pickStreams.video !== masterStreams.video || (pickStreams.audio ?? null) !== (masterStreams.audio ?? null)) fail('the remuxed master does not carry the render\'s streams; nothing was replaced');
  say('measuring the master');
  const measured = measureMaster(staged, film, [jobs[0].log, jobs[1].log]);
  const failedChecks = measured.checks.filter((c) => !c.ok);
  for (const c of measured.checks) say(`${c.ok ? 'pass' : 'FAIL'}  ${c.name}: ${c.value} (want ${c.want})`);
  if (failedChecks.length) fail(`the master fails ${failedChecks.map((c) => c.name).join(', ')}; nothing was replaced (films/${slug}/renders/next-master.mp4 is the measured file)`);

  /* the transcript: the previous one when the audio is unchanged, else one el.mjs hear call */
  const wantsTranscript = film.records.includes('script') || film.records.includes('captions');
  const sttRel = `scripts/source/${slug}.stt.json`;
  const pickAudio = pick === 'a' ? audioA : audioB;
  let reuseTranscript = null;
  if (wantsTranscript && hasPrevious && prevAudio && prevAudio === pickAudio && existsSync(join(out, sttRel))) reuseTranscript = readFileSync(join(out, sttRel));
  if (wantsTranscript && !reuseTranscript && opts.noHear) fail(`--no-hear: the master's decoded audio (${pickAudio}) is not the previous master's (${prevAudio ?? 'none'}), or there is no previous transcript, so the script page needs one el.mjs hear call; run final without --no-hear; nothing was replaced`);

  /* 4. the previous final, its records and its pair's render records to the archive; the master moves last */
  const when = stamp().slice(0, 16).replace('T', ' ');
  const prevUnits = finalRecordUnits(ctx, film).map((u) => ({ ...u, tier: 3, reason: `the final of ${slug} or one of its records, before the final of ${when}` }));
  const prevPair = readdirSync(renders)
    .filter((n) => /^final[-.]/.test(n))
    .map((n) => ({ rel: `films/${slug}/renders/${n}`, from: join(renders, n), tier: n.endsWith('.mp4') ? 3 : 2, reason: `a render record of the final of ${slug} before the final of ${when}` }));
  const archivedPrevious = archiveFiles(ctx, [...prevPair, ...prevUnits], { by: `film.mjs final ${slug}` });
  if (archivedPrevious.length) say(`archived the previous final: ${archivedPrevious.length} file(s) under ${relative(ctx.archive, archivedPrevious[0].to).split('/')[0]}/`);

  /* 5. the master into place, and the pair's records under their final names */
  const master = join(out, `${slug}.mp4`);
  if (existsSync(master)) fail(`${show(ctx, master)} is still in place after the archive move; nothing was overwritten`);
  renameSync(staged, master);
  for (const name of readdirSync(renders)) if (/^next[-.]/.test(name)) renameSync(join(renders, name), join(renders, name.replace(/^next/, 'final')));
  say(`master: ${show(ctx, master)} (render ${pick.toUpperCase()}, ${measured.seconds.toFixed(3)} s)`);

  /* 6 and 7. the records */
  const done = await writeRecords(ctx, film, { master, reuseTranscript, sttRel, opts });
  /* 8. the A and B MP4s to the archive; their logs, monitors and framemd5 files stay */
  const pairUnits = ['a', 'b', 'c']
    .map((x) => ({ x, file: join(renders, `final-${x}.mp4`) }))
    .filter(({ file }) => existsSync(file))
    .map(({ x, file }) => {
      const streams = streamHashes(file);
      const carried = streams.video === masterStreams.video && (streams.audio ?? null) === (masterStreams.audio ?? null);
      const decodedSame = x === 'c' ? compareFrames(third.frames, pick === 'a' ? fa : fb).differing === 0 && third.audio === pickAudio : identical || x === pick;
      return {
        rel: `films/${slug}/renders/final-${x}.mp4`,
        from: file,
        tier: carried ? 1 : decodedSame ? 2 : 3,
        reason: carried
          ? `delivery render ${x.toUpperCase()} of the final of ${when}; the master out/${slug}.mp4 carries its streams`
          : decodedSame
            ? `delivery render ${x.toUpperCase()} of the final of ${when}; its decoded frames and audio equal the master's, its encoded streams do not`
            : `delivery render ${x.toUpperCase()} of the final of ${when}; it differs from the master (render ${pick.toUpperCase()}) on frames where A and B differ; kept`,
      };
    });
  const archivedPair = archiveFiles(ctx, pairUnits, { by: `film.mjs final ${slug}` });

  /* the report */
  const st = statSync(master);
  report.push(
    `- renders: A ${results[0].seconds} s, B ${results[1].seconds} s${third ? `, tie-break C ${third.seconds} s` : ''} (renders/final-a.log, final-b.log and their monitors); the pair: ${summary}`,
    `- master: ${show(ctx, master)}, render ${pick.toUpperCase()}, ${mb(st.size)}, ${measured.seconds.toFixed(3)} s, md5 ${md5File(master)}`,
    `- master streams (sha256): video ${masterStreams.video}${masterStreams.audio ? `, audio ${masterStreams.audio}` : ''}`,
    `- master comment: ${comment}`,
    ...measured.checks.map((c) => `- ${c.ok ? 'pass' : 'FAIL'} ${c.name}: ${c.value} (want ${c.want})`),
    `- browser GPU mode: A ${factsA.gpuMode ?? '?'}, B ${factsB.gpuMode ?? '?'}; capture: ${facts.capture ?? '?'}; streaming-encode gate: ${facts.gate ? `enabled ${facts.gate.enabled} (${facts.gate.reason})` : 'not in the log'}`,
    `- archived: ${[...archivedPrevious, ...archivedPair].map((m) => `${m.rel} -> ${relative(ctx.archive, m.to)}`).join('; ') || 'nothing'}`,
    ...done.map((d) => `- record ${d.name}: ${d.ok ? 'written' : 'FAILED'}: ${d.detail}`)
  );
  if (st.size > 100_000_000) report.push('- note: the master is over 100 MB, which GitHub refuses; a web copy comes from the share copy');
  writeFileSync(join(renders, 'final.report.txt'), `${report.join('\n')}\n`);
  if (measured.loud) say(`loudness ${measured.loud.integrated} LUFS, true peak ${measured.loud.truePeak} dBTP`);
  if (facts.gate) say(`streaming-encode gate: enabled ${facts.gate.enabled} (${facts.gate.reason})`);
  say(`report: films/${slug}/renders/final.report.txt`);
  const bad = done.filter((d) => !d.ok);
  if (bad.length) fail(`the master is in place, but ${bad.length} record(s) failed: ${bad.map((d) => d.name).join(', ')}`);
  say('final: done');
  return 0;
}

/** The final's records, each step on its own so that one failure does not stop the others. */
export async function writeRecords(ctx, film, { master, reuseTranscript, sttRel, opts }) {
  const slug = film.slug;
  const dir = join(ctx.films, slug);
  const out = ctx.out;
  const done = [];
  const step = async (name, fn) => {
    try {
      const detail = await fn();
      done.push({ name, ok: true, detail });
      say(`record ${name}: ${detail}`);
    } catch (error) {
      done.push({ name, ok: false, detail: error.message });
      say(`record ${name}: FAILED: ${error.message}`);
    }
  };
  const must = (r, what) => {
    if (r.status !== 0) throw new Error(`${what} exited ${r.status}: ${`${r.stderr ?? ''}${r.stdout ?? ''}`.trim().split('\n').slice(-3).join(' / ')}`);
    return r;
  };
  const has = (r) => film.records.includes(r);
  const poster = join(out, `${slug}.png`);
  if (has('poster')) {
    await step('poster', async () => {
      if (film.poster.frame !== undefined) {
        must(run('ffmpeg', ['-v', 'error', '-y', '-i', master, '-vf', `select=eq(n\\,${film.poster.frame})`, '-fps_mode', 'passthrough', '-frames:v', '1', poster]), 'ffmpeg');
        if (!existsSync(poster)) throw new Error(`frame ${film.poster.frame} is past the master's end`);
        return `${show(ctx, poster)}, frame ${film.poster.frame} of the master`;
      }
      const at = film.poster.kb ? kbPoster(dir) : film.poster.at;
      const tmp = mkdtempSync(join(tmpdir(), 'film-poster-'));
      try {
        must(run('npx', [...HF, 'snapshot', '.', '-o', tmp, '--at', String(at), '--no-end', '--describe', 'false', '--timeout', '20000', ...pathFlags(film)], { cwd: dir }), 'hyperframes snapshot');
        const shot = readdirSync(tmp).find((n) => n.startsWith('frame-00-at-') && n.endsWith('.png'));
        if (!shot) throw new Error('the snapshot wrote no frame');
        copyFileSync(join(tmp, shot), poster);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
      return `${show(ctx, poster)}, a lossless snapshot at ${at} s on the ${film.path} path`;
    });
  }
  if (has('sheets')) {
    await step('sheets', async () => {
      const r = must(run('bash', [join(ctx.kit, 'contact-sheet.sh'), master, join(out, 'sheets', slug)]), 'kit/contact-sheet.sh');
      return r.stdout.trim();
    });
  }
  if (has('checking')) {
    await step('checking', async () => {
      mkdirSync(join(out, '_sheets'), { recursive: true });
      const r = must(run('python3', [join(dir, film.checking), master, join(out, '_sheets', `${slug}.png`)], { cwd: dir }), film.checking);
      return r.stdout.trim() || show(ctx, join(out, '_sheets', `${slug}.png`));
    });
  }
  const stt = join(out, sttRel);
  const needsStt = has('script') || has('captions');
  let sttReady = false;
  if (needsStt) {
    await step('transcript', async () => {
      mkdirSync(dirname(stt), { recursive: true });
      if (reuseTranscript) {
        writeFileSync(stt, reuseTranscript);
        sttReady = true;
        return `the previous final's transcript, reused: the master's decoded audio is the previous master's, so no ElevenLabs call was made`;
      }
      if (opts.noHear) throw new Error('--no-hear and no reusable transcript');
      must(run('node', [join(ctx.kit, 'audio', 'el.mjs'), 'hear', master, '--out', stt], { cwd: dir }), 'el.mjs hear');
      sttReady = true;
      return `one ElevenLabs speech-to-text call (el.mjs hear on the master, for the script page${has('captions') ? ' and the captions' : ''}): log it in films/${slug}/NOTES.md`;
    });
  }
  if (has('script')) {
    await step('script', async () => {
      if (!sttReady) throw new Error('no transcript');
      let source = motionPath(ctx, film.script.source);
      if (film.kind === 'kb') {
        source = join(out, 'scripts', 'source', `${slug}.json`);
        must(run('node', ['kit/kb/script-source.mjs', source], { cwd: dir }), 'kit/kb/script-source.mjs');
      }
      const args = [join(ctx.kit, 'script-export.py'), source, stt, master, join(out, 'scripts', `${slug}.md`), '--voices', film.script.voices];
      if (film.script.version) args.push('--version', film.script.version);
      const r = must(run('python3', args), 'kit/script-export.py');
      return r.stdout.trim() || join(out, 'scripts', `${slug}.md`);
    });
  }
  if (has('captions')) {
    await step('captions', async () => {
      if (!sttReady) throw new Error('no transcript');
      const r = must(run('node', ['kit/kb/captions.mjs', stt, join(out, 'captions', `${slug}.vtt`)], { cwd: dir }), 'kit/kb/captions.mjs');
      return r.stdout.trim() || join(out, 'captions', `${slug}.vtt`);
    });
  }
  if (has('seo')) {
    await step('seo', async () => must(run('node', ['kit/kb/seo.mjs', master, join(out, 'seo', `${slug}.json`)], { cwd: dir }), 'kit/kb/seo.mjs').stdout.trim() || join(out, 'seo', `${slug}.json`));
  }
  if (has('web')) {
    await step('web', async () => {
      const args = ['kit/kb/encode-web.sh', master, join(out, 'web', `${slug}.mp4`)];
      if (existsSync(poster)) args.push(poster, join(out, 'web', `${slug}.jpg`));
      return must(run('bash', args, { cwd: dir }), 'kit/kb/encode-web.sh').stdout.trim();
    });
  }
  if (has('credits')) {
    await step('credits', async () => {
      copyFileSync(join(dir, 'CREDITS.txt'), join(out, `${slug}.credits.txt`));
      return `CREDITS.txt -> ${show(ctx, join(out, `${slug}.credits.txt`))}`;
    });
  }
  if (statSync(master).size > SHARE_OVER) {
    await step('share', async () => {
      const share = join(out, `${slug}-share.mp4`);
      must(run('ffmpeg', ['-v', 'error', '-y', '-i', master, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', share]), 'ffmpeg');
      return `${show(ctx, share)}, ${mb(statSync(share).size)} (the master is ${mb(statSync(master).size)})`;
    });
  }
  return done;
}

/* ---------------------------------------------------------------- prune */

function cmdPrune(ctx, slug, opts) {
  const slugs = slug ? [slug] : listFilms(ctx);
  if (slug && !existsSync(join(ctx.films, slug))) fail(`films/${slug} does not exist`, 2);
  let archived = null;
  const units = [];
  for (const name of slugs) {
    const { film } = loadFilm(ctx, name);
    const master = join(ctx.out, `${name}.mp4`);
    const finalMs = existsSync(master) ? statSync(master).mtimeMs : null;
    const when = finalMs ? fmtWhen(finalMs) : null;
    /* drafts older than the current final */
    const drafts = [`films/${name}/renders/draft.mp4`, ...(film?.legacyDraft ?? [`out/_draft-${name}.mp4`])];
    for (const rel of drafts) {
      const abs = motionPath(ctx, rel);
      if (!existsSync(abs) || finalMs === null || statSync(abs).mtimeMs >= finalMs) continue;
      for (const f of draftFiles(ctx, { rel, abs })) units.push({ ...f, tier: 2, reason: `a draft of ${name} older than its final (${when})` });
    }
    /* renders/ MP4s the archive already holds, or older than the final */
    const renders = join(ctx.films, name, 'renders');
    if (!existsSync(renders)) continue;
    const mp4s = readdirSync(renders)
      .filter((n) => n.endsWith('.mp4') && n !== 'draft.mp4' && !/^(next|draft-next)/.test(n))
      .map((n) => ({ n, abs: join(renders, n), t: statSync(join(renders, n)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    /* a film with no final keeps its newest render as its current draft */
    const keepNewest = finalMs === null && !existsSync(join(renders, 'draft.mp4'));
    mp4s.forEach((m, i) => {
      if (keepNewest && i === 0) return;
      archived ??= archivedMd5s(ctx);
      const copy = archived.get(md5File(m.abs));
      if (copy) units.push({ rel: `films/${name}/renders/${m.n}`, from: m.abs, tier: 1, reason: `a render the archive already holds byte for byte (${relative(ctx.archive, copy)})` });
      else if (finalMs !== null && m.t < finalMs) units.push({ rel: `films/${name}/renders/${m.n}`, from: m.abs, tier: 2, reason: `a render of ${name} older than its final (${when})` });
    });
  }
  const keep = tracked(ctx, units.map((u) => u.from));
  const moving = units.filter((u) => !keep.has(u.from));
  for (const u of units) if (keep.has(u.from)) say(`kept (tracked): ${u.rel}`);
  if (moving.length === 0) {
    say('prune: nothing to move');
    return 0;
  }
  const rows = [['path', 'MB', 'tier', 'reason'], ...moving.map((u) => [u.rel, (statSync(u.from).size / 1e6).toFixed(1), String(u.tier), u.reason])];
  process.stdout.write(`${table(rows)}\n`);
  const total = moving.reduce((s, u) => s + statSync(u.from).size, 0);
  if (opts.dryRun) {
    say(`prune --dry-run: ${moving.length} file(s), ${mb(total)}, would move to ${tilde(join(ctx.archive, localDay()))}/; nothing was moved`);
    return 0;
  }
  const moved = archiveFiles(ctx, moving, { by: `film.mjs prune${slug ? ` ${slug}` : ''}` });
  say(`prune: moved ${moved.length} file(s), ${mb(total)}, under ${tilde(join(ctx.archive, localDay()))}/; each is in that folder's INDEX.md and index.json`);
  return 0;
}

/* ---------------------------------------------------------------- the command line */

export function parseArgs(argv) {
  const opts = { dryRun: false, noCheck: false, noHear: false, out: undefined, help: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--no-check') opts.noCheck = true;
    else if (a === '--no-hear') opts.noHear = true;
    else if (a === '--out') {
      opts.out = argv[++i];
      if (!opts.out) fail('--out needs a folder', 2);
    } else if (a === '--help' || a === '-h') opts.help = true;
    else if (a.startsWith('-')) fail(`unknown option ${a}`, 2);
    else rest.push(a);
  }
  return { command: rest[0], slug: rest[1], extra: rest.slice(2), opts };
}

export function context(opts = {}) {
  const motion = resolve(process.env.MOTION_DIR ?? dirname(KIT));
  return {
    motion,
    kit: join(motion, 'kit'),
    films: join(motion, 'films'),
    out: resolve(opts.out ?? join(motion, 'out')),
    archive: resolve(process.env.MOTION_ARCHIVE ?? join(homedir(), 'gt', 'motion-archive')),
    lockRoot: resolve(process.env.RENDER_LOCK_DIR ?? motion),
  };
}

function help() {
  const lines = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n');
  const head = [];
  for (const line of lines.slice(1)) {
    if (!line.startsWith('//')) break;
    head.push(line.replace(/^\/\/ ?/, ''));
  }
  process.stdout.write(`${head.join('\n')}\n`);
}

export async function main(argv = process.argv.slice(2)) {
  const { command, slug, extra, opts } = parseArgs(argv);
  if (opts.help || !command) {
    help();
    return command || opts.help ? 0 : 2;
  }
  if (extra.length) fail(`unexpected argument ${extra[0]}`, 2);
  const ctx = context(opts);
  if (!existsSync(ctx.films)) fail(`${ctx.films} does not exist; run from motion/ or set MOTION_DIR`, 2);
  switch (command) {
    case 'status':
      return cmdStatus(ctx, slug);
    case 'check':
      return cmdCheck(ctx, slug);
    case 'draft':
      return cmdDraft(ctx, slug, opts);
    case 'final':
      return cmdFinal(ctx, slug, opts);
    case 'prune':
      return cmdPrune(ctx, slug, opts);
    default:
      return fail(`unknown command ${command}; one of status, check, draft, final, prune`, 2);
  }
}

function invokedDirectly() {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (invokedDirectly()) {
  main().then(
    (code) => process.exit(code ?? 0),
    async (error) => {
      process.stderr.write(`film: ${error instanceof FilmError ? error.message : error.stack}\n`);
      if (RUN.render && pidAlive(RUN.render)) await stopTree(RUN.render);
      process.exit(error.exitCode ?? 1);
    }
  );
}
