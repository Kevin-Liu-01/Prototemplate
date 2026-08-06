/* Stack story-rhythm probe: seat flatness through the pass, copy-block
   doc-space gaps (the story rhythm), rest-view ledger, finale hotness,
   the agents dwell, and the no-descent law.
   Usage: node docs/harness/rhythm-probe.mjs [w] [h] [shotDir]

   The laws (founder: "the diagram keeps moving down as i scroll past
   agents, which is wrong ... stay on agents a lil longer as we scroll
   to show the scanning"):
   - every beat's read: seated (beat 1 may ride in), hot, rule below fold
   - figShift must be 0 at EVERY sampled position — the figure never
     translates (the old JS settle is dead; pure sticky only)
   - the dwell: at the last beat's read + ~150px the figure is STILL
     seated, the beat still hot (the scan-beam showcase), AND the
     finale copy still reads at ~55% viewport — the sticky beat rides
     the runway with the viewer (founder: "make the 'make it automatic'
     section stay with you for that 260 px")
   - rest view: figBottomGap is the NATURAL pinned gap (vh − seat − figH;
     ~152px at 900, larger on tall viewports — the old ≈29 ledger is
     dead), with the figure still seated and the finale hot
   - RELEASE PARITY (founder: "make sure the make it automatic height is
     same height as the diagram section to avoid this extra movement"):
     sampling every 25px from the last read through both releases, the
     offset between the finale copy's center and the figure's center
     must stay constant (±2px) — the two stickies release together and
     ride out together */
import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const W = Number(process.argv[2] ?? 1440);
const H = Number(process.argv[3] ?? 900);
const OUT = process.argv[4];

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('http://localhost:3006/d/singularity-orbit', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const doc = await page.evaluate(() => {
  const sec = document.querySelector('#platform');
  const r = sec.getBoundingClientRect();
  const beats = [...sec.querySelectorAll('.v0-stack-beat')].map((b) => {
    const br = b.getBoundingClientRect();
    const copy = b.querySelector('h3');
    /* the copy block's floor: the LAST content element — the bullets
       replaced the old single <p> (founder's four-part beat grammar) */
    const parts = b.querySelectorAll('h3, .v0-stack-points li, p');
    const lastEl = parts.length > 0 ? parts[parts.length - 1] : null;
    const cr = copy ? copy.getBoundingClientRect() : null;
    const pr = lastEl ? lastEl.getBoundingClientRect() : null;
    return {
      top: br.top + window.scrollY,
      h: br.height,
      copyTop: cr ? cr.top + window.scrollY : null,
      copyBottom: pr ? pr.bottom + window.scrollY : cr ? cr.bottom + window.scrollY : null,
    };
  });
  return {
    secTop: r.top + window.scrollY,
    secBottom: r.bottom + window.scrollY,
    secH: r.height,
    beats,
  };
});

// story rhythm: gaps between consecutive copy blocks in doc space
const gaps = [];
for (let i = 1; i < doc.beats.length; i++) {
  gaps.push(Math.round(doc.beats[i].copyTop - doc.beats[i - 1].copyBottom));
}

// the figure's translation — must be 0 at EVERY sampled position: no JS
// ever moves the figure (the no-descent law)
const figShiftNow = () =>
  page.evaluate(() => {
    const t = getComputedStyle(document.querySelector('.v0-stack-fig')).transform;
    if (t === 'none') return 0;
    const m = new DOMMatrixReadOnly(t);
    return Math.round((Math.abs(m.m41) + Math.abs(m.m42)) * 10) / 10;
  });

// seat flatness through the pass
const seat = [];
for (const frac of [0.15, 0.35, 0.55, 0.75]) {
  await page.evaluate(
    ({ top, h, f }) => window.scrollTo(0, top + h * f - window.innerHeight),
    { top: doc.secTop, h: doc.secH, f: frac }
  );
  await page.waitForTimeout(500);
  const figTop = await page.evaluate(
    () => document.querySelector('.v0-stack-fig').getBoundingClientRect().top
  );
  seat.push({ frac, figTop: Math.round(figTop * 10) / 10, figShift: await figShiftNow() });
}

// rest view: figBottomGap is the NATURAL pinned gap now (vh − seat −
// figH) — the figure must still be seated here, mid-dwell
await page.evaluate((b) => window.scrollTo(0, b - window.innerHeight), doc.secBottom);
await page.waitForTimeout(700);
const rest = await page.evaluate(() => {
  const sec = document.querySelector('#platform');
  const secR = sec.getBoundingClientRect();
  const figEl = document.querySelector('.v0-stack-fig');
  const fig = figEl.getBoundingClientRect();
  const seatPx = parseFloat(getComputedStyle(figEl).top);
  const beats = [...sec.querySelectorAll('.v0-stack-beat')];
  const last = beats[beats.length - 1];
  const lastR = last.getBoundingClientRect();
  const copy = last.querySelector('h3').getBoundingClientRect();
  const parts = last.querySelectorAll('h3, .v0-stack-points li, p');
  const tail = parts[parts.length - 1].getBoundingClientRect();
  return {
    figBottomGap: Math.round((secR.bottom - fig.bottom) * 10) / 10,
    figTop: Math.round(fig.top),
    seated: Math.abs(fig.top - seatPx) < 2,
    copyTop: Math.round(copy.top),
    copyBottom: Math.round(tail.bottom),
    copyBesideFig: copy.top < fig.bottom && tail.bottom > fig.top,
    copyBottomToRule: Math.round(secR.bottom - tail.bottom),
    finaleHot: last.classList.contains('is-hot'),
    windowTopFrac: Math.round((lastR.top / window.innerHeight) * 100) / 100,
  };
});
rest.figShift = await figShiftNow();
if (OUT) await page.screenshot({ path: `${OUT}/rest-${W}x${H}.png` });

// per-beat read assertions: figure seated + rule below the fold, every beat
const readState = (idx) =>
  page.evaluate((i) => {
    const fig = document.querySelector('.v0-stack-fig').getBoundingClientRect();
    const sec = document.querySelector('#platform').getBoundingClientRect();
    const beat = document.querySelectorAll('.v0-stack-beat')[i];
    const seat = parseFloat(getComputedStyle(document.querySelector('.v0-stack-fig')).top);
    return {
      figTop: Math.round(fig.top * 10) / 10,
      seated: Math.abs(fig.top - seat) < 2,
      ruleBelowFold: sec.bottom >= window.innerHeight,
      ruleAt: Math.round(sec.bottom),
      hot: beat.classList.contains('is-hot'),
    };
  }, idx);
const reads = [];
let lastReadY = 0;
for (let i = 0; i < doc.beats.length; i++) {
  const b = doc.beats[i];
  lastReadY = await page.evaluate(
    ({ cTop, cBot }) => {
      const y = (cTop + cBot) / 2 - window.innerHeight * 0.55;
      window.scrollTo(0, y);
      return y;
    },
    { cTop: b.copyTop, cBot: b.copyBottom }
  );
  await page.waitForTimeout(600);
  const state = await readState(i);
  reads.push({ beat: i + 1, ...state, figShift: await figShiftNow() });
  if (OUT) await page.screenshot({ path: `${OUT}/read-b${i + 1}-${W}x${H}.png` });
}

// THE AGENTS DWELL: ~150px past the last beat's read the figure must
// still be seated, the finale still hot, and the finale COPY still on
// the ~55% read line (the sticky beat travels the runway with the
// viewer) — the founder's "stay on agents a lil longer as we scroll to
// show the scanning" + "make the 'make it automatic' section stay with
// you for that 260 px"
await page.evaluate((y) => window.scrollTo(0, y + 150), lastReadY);
await page.waitForTimeout(600);
const dwellState = await readState(doc.beats.length - 1);
const dwellCopy = await page.evaluate(() => {
  const beats = document.querySelectorAll('.v0-stack-beat');
  const last = beats[beats.length - 1];
  const copy = last.querySelector('h3').getBoundingClientRect();
  const parts = last.querySelectorAll('h3, .v0-stack-points li, p');
  const tail = parts[parts.length - 1].getBoundingClientRect();
  return Math.round(((copy.top + tail.bottom) / 2 / window.innerHeight) * 100) / 100;
});
const dwell = {
  at: 'lastRead+150px',
  seated: dwellState.seated,
  figTop: dwellState.figTop,
  hot: dwellState.hot,
  copyCenterFrac: dwellCopy,
  copyHolds: Math.abs(dwellCopy - 0.55) < 0.04,
  figShift: await figShiftNow(),
};
if (OUT) await page.screenshot({ path: `${OUT}/dwell-${W}x${H}.png` });

// RELEASE PARITY: from the last read through both sticky releases and
// beyond, the copy-center-to-figure-center offset must stay constant —
// neither sticky may keep pinning after the other releases
const parity = [];
const parityEnd = doc.secBottom - H + 260;
for (let y = Math.round(lastReadY); y <= parityEnd; y += 25) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(80);
  const offset = await page.evaluate(() => {
    const fig = document.querySelector('.v0-stack-fig').getBoundingClientRect();
    const beats = document.querySelectorAll('.v0-stack-beat');
    const last = beats[beats.length - 1];
    const copy = last.querySelector('h3').getBoundingClientRect();
    const parts = last.querySelectorAll('h3, .v0-stack-points li, p');
    const tail = parts[parts.length - 1].getBoundingClientRect();
    return (copy.top + tail.bottom) / 2 - (fig.top + fig.height / 2);
  });
  parity.push(Math.round(offset * 10) / 10);
}
const parityDrift = Math.round((Math.max(...parity) - Math.min(...parity)) * 10) / 10;

console.log(
  JSON.stringify(
    {
      viewport: `${W}x${H}`,
      secH: Math.round(doc.secH),
      beatHeights: doc.beats.map((b) => Math.round(b.h)),
      storyGaps: gaps,
      seat,
      reads,
      dwell,
      parity: { drift: parityDrift, ok: parityDrift <= 2, samples: parity.length },
      rest,
      errors,
    },
    null,
    1
  )
);
await browser.close();
