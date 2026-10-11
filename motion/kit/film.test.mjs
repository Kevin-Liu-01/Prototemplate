// Tests for kit/film.mjs that run no render: the render lock's queue (its
// order, a dead ticket, a dead owner, a reused PID, the exit trap), the
// framemd5 comparison, the archive and its index writer, and the records a
// final writes (from a two-second ffmpeg clip, with a transcript it reuses, so
// no ElevenLabs call).
//
//   node --test motion/kit/film.test.mjs
//
// The queue tests use real processes (sleep children) for live PIDs and
// a child that has exited for a dead one; every process they start is stopped
// by its PID when the test ends. The media tests make two ten-frame clips with
// ffmpeg's test source and skip when ffmpeg is missing.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  acquireLock,
  appendIndex,
  archiveFiles,
  compareFrames,
  dropTickets,
  enqueue,
  framemd5,
  insertIndexRows,
  isFaststart,
  liveTickets,
  loadSchema,
  localDay,
  matchReference,
  normalizeFilm,
  parseFramemd5,
  parseTicket,
  pickMaster,
  pidAlive,
  planArchive,
  processStart,
  queuePaths,
  readLock,
  releaseLock,
  renderFacts,
  tieBreak,
  topBoxes,
  validate,
  writeRecords,
} from './film.mjs';

const FILM = fileURLToPath(new URL('./film.mjs', import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 'film-test-'));
const started = [];

after(() => {
  for (const child of started) if (pidAlive(child.pid)) child.kill('SIGKILL');
  rmSync(scratch, { recursive: true, force: true });
});

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

/** A live process to stand for another lane. */
async function sleeper() {
  const child = spawn('sleep', ['120'], { stdio: 'ignore' });
  started.push(child);
  for (let i = 0; i < 50 && !processStart(child.pid); i++) await sleep(20);
  return { pid: child.pid, start: processStart(child.pid), child };
}

/** A PID whose process has exited. */
async function deadPid() {
  const child = spawn('true', [], { stdio: 'ignore' });
  await new Promise((done) => child.on('exit', done));
  return child.pid;
}

function lockRoot(name) {
  const root = join(scratch, name);
  mkdirSync(root, { recursive: true });
  return root;
}

function writeOwner(root, owner) {
  writeFileSync(queuePaths(root).lock, `${JSON.stringify(owner)}\n`);
}

async function until(test, ms = 5000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await test()) return true;
    await sleep(20);
  }
  return false;
}

describe('the render queue', () => {
  it('names a ticket by time, slug and PID, and reads it back', () => {
    assert.deepEqual(parseTicket('1760209384123-slash-announcement-es-4711'), {
      name: '1760209384123-slash-announcement-es-4711',
      ms: 1760209384123,
      slug: 'slash-announcement-es',
      pid: 4711,
    });
    assert.equal(parseTicket('notes.txt'), null);
  });

  it('gives the lock to the oldest live ticket, in order', async () => {
    const root = lockRoot('order');
    const [one, two, three] = [await sleeper(), await sleeper(), await sleeper()];
    const me = (p, slug) => ({ slug, pid: p.pid, start: p.start, command: 'test' });
    await acquireLock(root, me(one, 'one'), { pollMs: 20 });
    assert.equal(readLock(root).pid, one.pid);
    const got = [];
    const second = acquireLock(root, me(two, 'two'), { pollMs: 20 }).then(() => got.push('two'));
    await sleep(30);
    const third = acquireLock(root, me(three, 'three'), { pollMs: 20 }).then(() => got.push('three'));
    await sleep(150);
    assert.deepEqual(got, [], 'nobody takes a held lock');
    assert.deepEqual(
      liveTickets(root).map((t) => t.slug),
      ['two', 'three']
    );
    assert.equal(releaseLock(root, one.pid), true);
    await second;
    await sleep(150);
    assert.deepEqual(got, ['two'], 'the older ticket goes first and the younger one waits');
    assert.equal(readLock(root).pid, two.pid);
    assert.equal(releaseLock(root, two.pid), true);
    await third;
    assert.deepEqual(got, ['two', 'three']);
    assert.equal(readLock(root).pid, three.pid);
    releaseLock(root, three.pid);
    assert.deepEqual(readdirSync(queuePaths(root).queue), [], 'each ticket is removed when its run takes the lock');
  });

  it('clears a dead ticket that stands ahead', async () => {
    const root = lockRoot('dead-ticket');
    const dead = await deadPid();
    const ticket = enqueue(root, { slug: 'gone', pid: dead, command: 'test' });
    await sleep(5);
    const live = await sleeper();
    const cleared = [];
    await acquireLock(root, { slug: 'live', pid: live.pid, start: live.start, command: 'test' }, { pollMs: 20, log: (l) => cleared.push(l) });
    assert.equal(existsSync(ticket), false);
    assert.ok(cleared.some((l) => l.startsWith('cleared a dead ticket')));
    assert.equal(readLock(root).pid, live.pid);
    releaseLock(root, live.pid);
  });

  it('clears a ticket whose PID now belongs to another process', async () => {
    const root = lockRoot('reused-pid');
    const other = await sleeper();
    const ticket = enqueue(root, { slug: 'reused', pid: other.pid, start: 'Thu Jan  1 00:00:00 1970', command: 'test' });
    assert.deepEqual(liveTickets(root), []);
    assert.equal(existsSync(ticket), false);
  });

  it('clears a lock whose owner and render have exited', async () => {
    const root = lockRoot('dead-owner');
    writeOwner(root, { slug: 'gone', pid: await deadPid(), command: 'final', since: new Date().toISOString(), render: { pid: await deadPid() } });
    const live = await sleeper();
    const log = [];
    await acquireLock(root, { slug: 'live', pid: live.pid, start: live.start, command: 'test' }, { pollMs: 20, log: (l) => log.push(l) });
    assert.equal(readLock(root).pid, live.pid);
    assert.ok(log.some((l) => l.startsWith('cleared a dead lock: gone')));
    releaseLock(root, live.pid);
  });

  it('keeps a lock whose owner exited while its render still runs', async () => {
    const root = lockRoot('live-render');
    const render = await sleeper();
    writeOwner(root, { slug: 'orphan', pid: await deadPid(), command: 'final', render: { pid: render.pid, start: render.start } });
    const live = await sleeper();
    let taken = false;
    const waiting = acquireLock(root, { slug: 'live', pid: live.pid, start: live.start, command: 'test' }, { pollMs: 20 }).then(() => (taken = true));
    await sleep(300);
    assert.equal(taken, false, 'the render still runs, so the lock stays');
    render.child.kill('SIGKILL');
    await waiting;
    assert.equal(readLock(root).pid, live.pid);
    releaseLock(root, live.pid);
  });

  it('releases only a lock that names the PID, and drops only that PID\'s tickets', async () => {
    const root = lockRoot('release');
    const [a, b] = [await sleeper(), await sleeper()];
    writeOwner(root, { slug: 'a', pid: a.pid, command: 'test' });
    assert.equal(releaseLock(root, b.pid), false);
    assert.equal(readLock(root).pid, a.pid);
    enqueue(root, { slug: 'a', pid: a.pid });
    enqueue(root, { slug: 'b', pid: b.pid });
    assert.equal(dropTickets(root, b.pid), 1);
    assert.deepEqual(
      liveTickets(root).map((t) => t.pid),
      [a.pid]
    );
    assert.equal(releaseLock(root, a.pid), true);
    assert.equal(readLock(root), null);
  });
});

describe('the exit trap', () => {
  /** A child that joins the queue in `root`, installs the trap and runs a two-process fake render. */
  function trapChild(root, { take }) {
    const script = join(scratch, `trap-${take ? 'take' : 'wait'}.mjs`);
    writeFileSync(
      script,
      [
        `import { acquireLock, enqueue, installTrap, processStart, RUN } from ${JSON.stringify(pathToFileURL(FILM).href)};`,
        "import { spawn } from 'node:child_process';",
        'const root = process.argv[2];',
        'installTrap(root);',
        "const me = { slug: 'trap', pid: process.pid, start: processStart(process.pid), command: 'test' };",
        take ? 'await acquireLock(root, me, { pollMs: 20 });' : 'enqueue(root, me);',
        "const render = spawn('/bin/sh', ['-c', 'sleep 60 & wait'], { stdio: 'ignore' });",
        'RUN.render = render.pid;',
        "setTimeout(() => process.stdout.write(`ready ${render.pid}\\n`), 300);",
        'setInterval(() => {}, 1000);',
      ].join('\n')
    );
    const child = spawn(process.execPath, [script, root], { stdio: ['ignore', 'pipe', 'inherit'] });
    started.push(child);
    return new Promise((done) => {
      let text = '';
      child.stdout.on('data', (d) => {
        text += d;
        const m = /ready (\d+)/.exec(text);
        if (m) done({ child, render: Number(m[1]) });
      });
    });
  }

  function descendantsOf(pid) {
    const table = spawnSync('ps', ['-axo', 'pid=,ppid='], { encoding: 'utf8' }).stdout;
    return table
      .split('\n')
      .map((l) => l.trim().split(/\s+/).map(Number))
      .filter(([, ppid]) => ppid === pid)
      .map(([p]) => p);
  }

  it('on a signal, stops its own render tree, then releases its lock and ticket', async () => {
    const root = lockRoot('trap-take');
    const { child, render } = await trapChild(root, { take: true });
    const grandchildren = descendantsOf(render);
    assert.ok(grandchildren.length >= 1, 'the fake render has a process under it');
    assert.equal(readLock(root).pid, child.pid);
    const exit = new Promise((done) => child.on('exit', (code, signal) => done({ code, signal })));
    child.kill('SIGTERM');
    assert.deepEqual(await exit, { code: 143, signal: null });
    assert.equal(readLock(root), null, 'the lock is released');
    assert.ok(await until(() => !pidAlive(render) && grandchildren.every((p) => !pidAlive(p))), 'the render and its child are stopped');
  });

  it('leaves another lane\'s lock and tickets alone', async () => {
    const root = lockRoot('trap-other');
    const other = await sleeper();
    writeOwner(root, { slug: 'other', pid: other.pid, start: other.start, command: 'final' });
    enqueue(root, { slug: 'other-waiting', pid: other.pid, start: other.start });
    const { child } = await trapChild(root, { take: false });
    assert.equal(liveTickets(root).length, 2);
    const exit = new Promise((done) => child.on('exit', done));
    child.kill('SIGINT');
    assert.equal(await exit, 130);
    assert.equal(readLock(root).pid, other.pid, 'the other lane keeps its lock');
    assert.deepEqual(
      liveTickets(root).map((t) => t.slug),
      ['other-waiting'],
      'only the stopped run\'s ticket is gone'
    );
  });

  it('releases a lock its run still held when it exits normally', async () => {
    const root = lockRoot('trap-exit');
    const script = join(scratch, 'trap-exit.mjs');
    writeFileSync(
      script,
      [
        `import { acquireLock, installTrap, processStart } from ${JSON.stringify(pathToFileURL(FILM).href)};`,
        'const root = process.argv[2];',
        'installTrap(root);',
        "await acquireLock(root, { slug: 'exit', pid: process.pid, start: processStart(process.pid), command: 'test' }, { pollMs: 20 });",
        'process.exit(0);',
      ].join('\n')
    );
    const r = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(readLock(root), null);
  });
});

describe('the framemd5 comparison', () => {
  const header = '#format: frame checksums\n#version: 2\n#hash: MD5\n#tb 0: 1/60\n#media_type 0: video\n#codec_id 0: rawvideo\n#dimensions 0: 1920x1080\n#sar 0: 1/1\n#stream#, dts,        pts, duration,     size, hash\n';
  const body = (hashes) => hashes.map((h, i) => `0,          ${i},          ${i},        1,  6220800, ${h}`).join('\n');

  it('reads every frame hash in order', () => {
    assert.deepEqual(parseFramemd5(`${header}${body(['aa', 'bb', 'cc'])}\n`), ['aa', 'bb', 'cc']);
  });

  it('counts the differing frames and gives their runs', () => {
    const a = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const b = ['0', '1', 'x', 'x', '4', '5', 'x', '7'];
    assert.deepEqual(compareFrames(a, b), { framesA: 8, framesB: 8, differing: 3, ranges: [[2, 3], [6, 6]] });
    assert.deepEqual(compareFrames(a, a), { framesA: 8, framesB: 8, differing: 0, ranges: [] });
  });

  it('counts a frame one render lacks as a difference', () => {
    assert.deepEqual(compareFrames(['0', '1', '2'], ['0', '1', '2', '3']), { framesA: 3, framesB: 4, differing: 1, ranges: [[3, 3]] });
  });

  it('finds which render matches the previous master on the differing frames', () => {
    const a = ['0', 'a1', 'a2', '3'];
    const b = ['0', 'b1', 'b2', '3'];
    const previous = ['0', 'b1', 'b2', '3'];
    const { ranges } = compareFrames(a, b);
    assert.deepEqual(matchReference(a, b, previous, ranges), { matchA: 0, matchB: 2 });
  });

  it('picks the master: the previous master decides, an invisible tie goes to A, a visible one asks for C', () => {
    const fa = ['0', 'a1', 'a2', '3'];
    const fb = ['0', 'b1', 'b2', '3'];
    const frames = compareFrames(fa, fb);
    assert.deepEqual(pickMaster({ fa, fb: fa, frames: compareFrames(fa, fa), audioA: 'x', audioB: 'x' }), { pick: 'a', why: 'A and B are identical', tieBreak: false });
    assert.equal(pickMaster({ fa, fb, frames, ref: ['0', 'b1', 'b2', '3'], psnrMin: '14.0' }).pick, 'b');
    assert.deepEqual(
      pickMaster({ fa, fb, frames, psnrMin: '52.7' }).pick,
      'a',
      'hunayn: an invisible difference with no deciding master goes to A'
    );
    assert.deepEqual(pickMaster({ fa, fb, frames, psnrMin: '14.0' }).tieBreak, true, '_smoke: a visible difference with no previous master needs a third render');
    assert.equal(pickMaster({ fa, fb, frames, ref: ['0', 'x', 'y', '3'], psnrMin: '14.0' }).tieBreak, true, 'a previous master that equals neither does not decide');
    const sameVideo = compareFrames(fa, fa);
    assert.equal(pickMaster({ fa, fb: fa, frames: sameVideo, ref: fa, audioA: 'aa', audioB: 'bb', prevAudio: 'bb' }).pick, 'b', 'with the video equal, the previous master\'s audio decides');
  });

  it('settles a visible tie by the render that the third one equals', () => {
    const fa = ['0', 'a1', 'a2', '3'];
    const fb = ['0', 'b1', 'b2', '3'];
    const { ranges } = compareFrames(fa, fb);
    assert.deepEqual(tieBreak(fa, fb, ['0', 'a1', 'a2', '3'], ranges), { pick: 'a', matchA: 2, matchB: 0 });
    assert.deepEqual(tieBreak(fa, fb, ['0', 'c1', 'c2', '3'], ranges), { pick: null, matchA: 0, matchB: 0 });
  });

  const ffmpeg = spawnSync('ffmpeg', ['-version']).status === 0;
  it('compares two real clips that differ in two frames', { skip: !ffmpeg && 'no ffmpeg' }, async () => {
    const dir = join(scratch, 'clips');
    mkdirSync(dir, { recursive: true });
    const clip = (name, vf, extra = []) =>
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=64x36:rate=10', '-frames:v', '10', '-vf', vf, '-c:v', 'libx264', '-qp', '0', '-pix_fmt', 'yuv444p', ...extra, join(dir, name)]).status;
    assert.equal(clip('a.mp4', 'null'), 0);
    assert.equal(clip('b.mp4', "drawbox=x=0:y=0:w=20:h=20:color=red:t=fill:enable='between(n,3,4)'", ['-movflags', '+faststart']), 0);
    const a = await framemd5(join(dir, 'a.mp4'), join(dir, 'a.framemd5'));
    const b = await framemd5(join(dir, 'b.mp4'), join(dir, 'b.framemd5'));
    assert.equal(a.length, 10);
    assert.deepEqual(compareFrames(a, b).ranges, [[3, 4]]);
    assert.equal(isFaststart(topBoxes(join(dir, 'a.mp4'))), false, 'a plain mux puts moov after mdat');
    assert.equal(isFaststart(topBoxes(join(dir, 'b.mp4'))), true);
  });
});

describe('the archive and its index', () => {
  const day = localDay(new Date(2026, 9, 12, 14, 3, 9));
  const now = new Date(2026, 9, 12, 14, 3, 9);

  it('puts a file at the same path under the day, or under a time folder when that path is taken', () => {
    const units = [{ rel: 'out/tyndale.mp4', from: '/m/out/tyndale.mp4' }];
    const free = planArchive({ archive: '/a', units, now, exists: () => false });
    assert.equal(free.base, `/a/${day}`);
    assert.equal(free.moves[0].to, `/a/${day}/out/tyndale.mp4`);
    const taken = planArchive({ archive: '/a', units, now, exists: (p) => p === `/a/${day}/out/tyndale.mp4` });
    assert.equal(taken.moves[0].to, `/a/${day}/140309/out/tyndale.mp4`);
    const twice = planArchive({ archive: '/a', units, now, exists: (p) => p.endsWith('/out/tyndale.mp4') && !p.includes('140309-2') });
    assert.equal(twice.moves[0].to, `/a/${day}/140309-2/out/tyndale.mp4`);
  });

  it('adds the film.mjs table after an existing index and keeps every line before it', () => {
    const phase1 = '# Archive index\n\n## Every unit\n\n| old | new |\n| --- | --- |\n| `out/v1` | `out/v1` |\n\n## Checks after the moves\n\n- clean\n';
    const once = insertIndexRows(phase1, ['| r1 |']);
    assert.ok(once.startsWith(phase1.trimEnd()), 'the existing index is unchanged');
    assert.match(once, /## Moves by kit\/film\.mjs\n\n.+\n\n\| moved at .+\n\| --- .+\n\| r1 \|\n$/);
    const twice = insertIndexRows(`${once}\n## A later section\n\ntext\n`, ['| r2 |', '| r3 |']);
    assert.match(twice, /\| r1 \|\n\| r2 \|\n\| r3 \|\n\n## A later section/);
  });

  it('moves files by rename and writes INDEX.md and index.json, creating the day and then appending', () => {
    const root = join(scratch, 'archive-run');
    const motion = join(root, 'motion');
    mkdirSync(join(motion, 'out', 'sheets'), { recursive: true });
    writeFileSync(join(motion, 'out', 'film.mp4'), 'not really a video');
    writeFileSync(join(motion, 'out', 'sheets', 'film.png'), 'png');
    const ctx = { motion, out: join(motion, 'out'), archive: join(root, 'archive') };
    const first = archiveFiles(
      ctx,
      [
        { rel: 'out/sheets/film.png', from: join(motion, 'out', 'sheets', 'film.png'), tier: 3, reason: 'its sheet' },
        { rel: 'out/film.mp4', from: join(motion, 'out', 'film.mp4'), tier: 3, reason: 'the old final' },
      ],
      { by: 'film.mjs final film', now }
    );
    assert.equal(first.length, 2);
    assert.equal(existsSync(join(motion, 'out', 'film.mp4')), false);
    assert.equal(readFileSync(join(ctx.archive, day, 'out', 'film.mp4'), 'utf8'), 'not really a video');
    const index = JSON.parse(readFileSync(join(ctx.archive, day, 'index.json'), 'utf8'));
    const md5 = (text) => createHash('md5').update(text).digest('hex');
    assert.deepEqual(
      index.files.map((f) => [f.old, f.md5, f.bytes]),
      [
        ['motion/out/sheets/film.png', md5('png'), 3],
        ['motion/out/film.mp4', md5('not really a video'), 18],
      ]
    );
    assert.equal(index.units[1].reason, 'the old final');
    assert.equal(index.units[1].tier, '3');
    writeFileSync(join(motion, 'out', 'film.mp4'), 'the next old final');
    const second = archiveFiles(ctx, [{ rel: 'out/film.mp4', from: join(motion, 'out', 'film.mp4'), tier: 3, reason: 'the next old final' }], { by: 'film.mjs final film', now });
    assert.equal(second[0].to, join(ctx.archive, day, '140309', 'out', 'film.mp4'), 'a taken path goes under a time folder');
    const md = readFileSync(join(ctx.archive, day, 'INDEX.md'), 'utf8');
    const rows = md.split('\n').filter((l) => l.startsWith('| 2026-10-12'));
    assert.equal(rows.length, 3);
    assert.match(rows[2], /`out\/film\.mp4` \| `2026-10-12\/140309\/out\/film\.mp4` \|/);
    assert.equal(JSON.parse(readFileSync(join(ctx.archive, day, 'index.json'), 'utf8')).files.length, 3);
    assert.equal(existsSync(join(ctx.archive, day, '.index.lock')), false);
  });

  it('appends to an index another tool wrote, keeping its entries', () => {
    const dayDir = join(scratch, 'existing', day);
    mkdirSync(join(dayDir, 'out'), { recursive: true });
    writeFileSync(join(dayDir, 'index.json'), JSON.stringify({ about: 'phase 1', units: [{ old: 'motion/out/v1' }], files: [{ old: 'motion/out/v1/x.mp4' }] }));
    writeFileSync(join(dayDir, 'INDEX.md'), '# Archive index\n\n## Checks\n\n- clean\n');
    writeFileSync(join(dayDir, 'out', 'moved.txt'), 'x');
    appendIndex({ dayDir, day, archive: join(scratch, 'existing'), motion: '/m', units: [{ rel: 'out/moved.txt', from: '/m/out/moved.txt', to: join(dayDir, 'out', 'moved.txt'), tier: 2, reason: 'a test', movedAt: '2026-10-12T14:03:09-07:00', by: 'film.mjs prune' }] });
    const index = JSON.parse(readFileSync(join(dayDir, 'index.json'), 'utf8'));
    assert.equal(index.about, 'phase 1');
    assert.deepEqual(
      index.units.map((u) => u.old),
      ['motion/out/v1', 'motion/out/moved.txt']
    );
    assert.match(readFileSync(join(dayDir, 'INDEX.md'), 'utf8'), /^# Archive index\n\n## Checks\n\n- clean\n\n## Moves by kit\/film\.mjs/);
  });
});

describe('film.json', () => {
  const schema = loadSchema();
  const example = JSON.parse(readFileSync(new URL('../films/_smoke/film.json', import.meta.url), 'utf8'));

  it('accepts the example and fills in the defaults', () => {
    assert.deepEqual(validate(schema, example), []);
    const film = normalizeFilm(example);
    assert.equal(film.slug, '_smoke');
    assert.equal(film.sound, false);
    assert.deepEqual(film.legacyDraft, ['out/_draft-_smoke.mp4']);
  });

  it('refuses an unknown field, a kind it does not know and a poster with both forms', () => {
    const errors = validate(schema, { ...example, kind: 'trailer', colour: 'blue', poster: { frame: 1, at: 2 } });
    assert.ok(errors.some((e) => e.includes('kind: must be one of')));
    assert.ok(errors.some((e) => e.includes('unknown field colour')));
    assert.ok(errors.some((e) => e.startsWith('poster: matches none of its forms')));
  });

  it('gives a kb film its records and its checking sheet tool', () => {
    const film = normalizeFilm({ slug: 'kb-x', kind: 'kb', path: 'gpu' });
    assert.deepEqual(film.records, ['poster', 'sheets', 'checking', 'script', 'credits', 'web', 'captions', 'seo']);
    assert.equal(film.checking, 'kit/kb/check-sheet.py');
    assert.deepEqual(film.poster, { kb: true });
    assert.deepEqual(film.sound, { lufs: -16, within: 0.5, truePeak: -1 });
  });
});

describe('render logs', () => {
  it('reads the composition hash, the GPU mode, the encode gate and the font check', () => {
    const log = [
      '[INFO] [Render] Pipeline started {"fps":{"num":60,"den":1},"browserGpuMode":"software","forceScreenshot":true}',
      '[INFO] [Render:trace] {"phase":"compile","status":"checkpoint","compositionHash":"3780d23a4d777512"}',
      '[INFO] [Render:trace] {"phase":"browser_probe","totalFrames":5841,"compositionHash":"3780d23a4d777512"}',
      '[INFO] streaming-encode gate {"enabled":true,"reason":"single_worker","workerCount":1}',
      '   28.7 MB · 1m 37.3s video · rendered in 17m 51.9s',
      '   screenshot capture · software gpu · compile 12.4s',
    ].join('\n');
    const facts = renderFacts(log);
    assert.equal(facts.compositionHash, '3780d23a4d777512');
    assert.equal(facts.gpuMode, 'software');
    assert.equal(facts.totalFrames, 5841);
    assert.deepEqual(facts.gate, { enabled: true, reason: 'single_worker' });
    assert.equal(facts.googleFonts, false);
    assert.equal(facts.capture, 'screenshot capture · software gpu · compile 12.4s');
    assert.equal(renderFacts('Fetching Inter from Google Fonts').googleFonts, true);
  });
});

describe('the records a final writes', () => {
  const tools = ['ffmpeg', 'cwebp'].every((t) => spawnSync(t, ['-version']).status === 0) && spawnSync('python3', ['-c', 'import PIL']).status === 0;
  it('writes the poster, both sheets, the script page from a reused transcript and the credits', { skip: !tools && 'needs ffmpeg, cwebp and python3 with Pillow' }, async () => {
    const root = join(scratch, 'records');
    const motion = join(root, 'motion');
    const dir = join(motion, 'films', 'rec');
    const out = join(root, 'out');
    mkdirSync(join(dir, 'tools'), { recursive: true });
    mkdirSync(join(out, 'scripts', 'source'), { recursive: true });
    copyFileSync(fileURLToPath(new URL('../films/journey-to-the-west/tools/sheet.py', import.meta.url)), join(dir, 'tools', 'sheet.py'));
    writeFileSync(join(dir, 'CREDITS.txt'), 'Made by General Translation.\n');
    writeFileSync(join(out, 'scripts', 'source', 'rec.json'), JSON.stringify({ title: 'A records test', story: 'Two words.', lines: [{ n: 1, who: 'N', said: 'Hello world.', screen: 'A test card.' }] }));
    const master = join(root, 'rec.mp4');
    const made = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=60', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '2', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', master]);
    assert.equal(made.status, 0);
    const ctx = { motion, kit: fileURLToPath(new URL('.', import.meta.url)), films: join(motion, 'films'), out, archive: join(root, 'archive'), lockRoot: root };
    const film = normalizeFilm({ slug: 'rec', kind: 'blog', path: 'software', poster: { frame: 30 } });
    const stt = Buffer.from(JSON.stringify({ words: [{ text: 'Hello', start: 0.2, end: 0.5, type: 'word' }, { text: 'world.', start: 0.6, end: 1.0, type: 'word' }] }));
    const done = await writeRecords(ctx, film, { master, reuseTranscript: stt, sttRel: 'scripts/source/rec.stt.json', opts: {} });
    assert.deepEqual(done.filter((d) => !d.ok), []);
    assert.deepEqual(
      done.map((d) => d.name),
      ['poster', 'sheets', 'checking', 'transcript', 'script', 'credits']
    );
    for (const f of ['rec.png', 'sheets/rec.png', 'sheets/rec.webp', '_sheets/rec.png', 'scripts/rec.md', 'scripts/source/rec.stt.json', 'rec.credits.txt']) assert.ok(existsSync(join(out, f)), f);
    const page = readFileSync(join(out, 'scripts', 'rec.md'), 'utf8');
    assert.match(page, /^# A records test\n\n2\.0 s · Narrator: Frederick Surrey\n/);
    assert.match(page, /\| 0:00\.20 \| Narrator \| Hello world\. \| A test card\. \|/);
    assert.ok(done.find((d) => d.name === 'transcript').detail.includes('no ElevenLabs call'));
  });
});
