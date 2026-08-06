import { chromium } from 'playwright-core';

const EXE =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL = 'http://localhost:3006/d/singularity-orbit';
const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ executablePath: EXE });

for (const vp of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // ---- STACK: scroll so the platform section's bottom sits at the viewport bottom
  const stack = await page.evaluate(() => {
    const sec = document.querySelector('#platform');
    if (!sec) return { missing: true };
    const r = sec.getBoundingClientRect();
    const target = window.scrollY + r.bottom - window.innerHeight;
    window.scrollTo(0, target);
    return { ok: true };
  });
  await page.waitForTimeout(900);
  const stackGeo = await page.evaluate(() => {
    const sec = document.querySelector('#platform');
    const secR = sec.getBoundingClientRect();
    // finale copy: the element containing "Just merge a PR."
    const all = [...sec.querySelectorAll('p, div, article, section')];
    let copy = null;
    for (const el of all) {
      if (el.textContent.includes('Just merge a PR.') && (!copy || el.getBoundingClientRect().height < copy.getBoundingClientRect().height)) {
        copy = el;
      }
    }
    // find the copy BLOCK (the beat window that owns it)
    let beat = copy;
    while (beat && beat.parentElement !== sec && !/beat|copy|step/i.test(beat.className)) beat = beat.parentElement;
    const copyR = copy ? copy.getBoundingClientRect() : null;
    const fig = sec.querySelector('.v0-stack-fig');
    const figR = fig ? fig.getBoundingClientRect() : null;
    // heading of the beat ("Automate the whole process.")
    const heads = [...sec.querySelectorAll('h3, h2')].filter((h) => h.textContent.includes('Automate'));
    const headR = heads[0] ? heads[0].getBoundingClientRect() : null;
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      sectionBottom: secR.bottom,
      sectionTop: secR.top,
      sectionHeight: secR.height,
      copyBottom: copyR ? copyR.bottom : null,
      copyTop: headR ? headR.top : null,
      figBottom: figR ? figR.bottom : null,
      figTop: figR ? figR.top : null,
      gapCopyToSectionBottom: copyR ? secR.bottom - copyR.bottom : null,
      gapFigToSectionBottom: figR ? secR.bottom - figR.bottom : null,
      beatClass: beat ? beat.className : null,
      beatH: beat ? beat.getBoundingClientRect().height : null,
    };
  });
  await page.screenshot({ path: `${OUT}/probe-${vp.width}-stack-end.png` });

  // ---- CONTEXT review row
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('h3, h2')].find((h) =>
      h.textContent.includes('Review and approve')
    );
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(900);
  const ctxGeo = await page.evaluate(() => {
    const head = [...document.querySelectorAll('h3, h2')].find((h) =>
      h.textContent.includes('Review and approve')
    );
    if (!head) return { missing: true };
    // the copy cell: nearest grid-cell ancestor
    let cell = head.parentElement;
    while (cell && getComputedStyle(cell.parentElement).display !== 'grid') cell = cell.parentElement;
    const cellR = cell.getBoundingClientRect();
    // copy extent: last text el in the cell
    const kids = [...cell.querySelectorAll('h3, h2, p')];
    const lastR = kids.length ? kids[kids.length - 1].getBoundingClientRect() : null;
    const row = cell.parentElement;
    const rowR = row.getBoundingClientRect();
    const workspace = row.querySelector('.tcr') || [...row.children].find((c) => c !== cell);
    const wsR = workspace ? workspace.getBoundingClientRect() : null;
    return {
      rowClass: row.className,
      cellClass: cell.className,
      rowH: rowR.height,
      copyCellH: cellR.height,
      copyContentBottom: lastR ? lastR.bottom - cellR.top : null,
      deadBelowCopy: lastR ? cellR.bottom - lastR.bottom : null,
      workspaceH: wsR ? wsR.height : null,
      wsRows: workspace ? workspace.querySelectorAll('[class*="row"], tr, li').length : null,
    };
  });
  await page.screenshot({ path: `${OUT}/probe-${vp.width}-ctx-review.png` });

  console.log(JSON.stringify({ vp, stack: { ...stack, ...stackGeo }, ctx: ctxGeo }, null, 1));
  await ctx.close();
}
await browser.close();
