const fs = require('fs');
const man = require('./manifest.json');
const AREAS = {
  A: { name: 'Intuitive flow and direction', slot: 'The visual after the four-line list of screen areas', quote: 'Each area of the screen maps to a unified action or output, so functions are surfaced to users where they expect to find them: one navigation on the left, minimal action buttons top right, links bottom left, user preferences bottom left. (Because some users have a strong preference for visual themes, the mode swapper appears in two areas.)' },
  B: { name: 'Cleaning up mental clutter', slot: '[VISUAL] after “deleting extraneous elements; in our case, a lot of extra lines, links, and buttons.”', quote: 'So our first job is to cut mental clutter. This means deleting extraneous elements; in our case, a lot of extra lines, links, and buttons.' },
  C: { name: 'One singular accordion', slot: '[VISUAL] after “Our sidebar is now one singular accordion”', quote: 'The sidebar has a clear hierarchy, preventing it from becoming a daunting list of links and options. And it persists: clicking a link doesn’t change the sidebar options, take you to a separate page, or erase your place.' },
  D: { name: 'Drawing the eye', slot: '[VISUALS] after the visual-hierarchy list, and [VISUAL QUICKSTART BEFORE/AFTER] after the Linear note', quote: 'Using icons in important areas to break up walls of text. Adding more separators between text sections. Styling text differentially, including italics (which docs tend to fear) and lowered weight (400) for body text. We especially paid attention to spacing and white space. The header is center-aligned to be more visually harmonious.' },
  E: { name: 'A unique GT flair', slot: '[VISUAL - TOC SLIDE] after the table-of-contents paragraph, plus the UI-primitives list', quote: 'A subtle interaction on the iconic Fumadocs table-of-contents component: an SVG path applied as a CSS mask. Solid icons. Corners that are not over-rounded. Custom flag SVGs rather than emojis. And the localization experience must be top-tier, preserving spacing, alignment, and order.' },
  F: { name: 'The hit list', slot: 'The closing list of anti-patterns', quote: 'Eyebrow text · Random extraneous explanatory text · Over-rounded boxes · Non-solid icons · Variable spacing not attached to importance of content · Non-localized docs (!) · Multiple navigation elements spread across the page · Sidebars that seem to expand infinitely · Sidebars that change when you click something · Sidebars where you lose your place' },
  H: { name: 'Cover and OpenGraph', slot: 'No text, diagram cleaned up, blue background. Two directions, each at 1600×900 and 1200×630.', quote: 'Designing docs for humans. Why design still matters in the age of AI and our docs design principles to clean up mental clutter, draw the eye, and add micro-UI details.' },
};
const BGNAMES = { blue16: 'Your export 16, blue duotone (navy → #0078FF)', blue25: 'Your export 25, blue duotone (navy → #0078FF)', u10: 'Your glyphfield export 10 (1920×1080), shown at an exact 2× so the dither stays crisp', u11: 'Your glyphfield export 11 (1920×1080), shown at an exact 2× so the dither stays crisp', u16: 'Your glyphfield export 16 (1920×1080), shown at an exact 2× so the dither stays crisp', u17: 'Your glyphfield export 17 (1920×1080), shown at an exact 2× so the dither stays crisp', u18: 'Your glyphfield export 18 (1920×1080), shown at an exact 2× so the dither stays crisp', u19: 'Your glyphfield export 19 (1920×1080), shown at an exact 2× so the dither stays crisp', u20: 'Your glyphfield export 20 (1920×1080), shown at an exact 2× so the dither stays crisp', u25: 'Your glyphfield export 25 (1920×1080), shown at an exact 2× so the dither stays crisp', u26: 'Your glyphfield export 26 (1920×1080), shown at an exact 2× so the dither stays crisp', u27: 'Your glyphfield export 27 (1920×1080), shown at an exact 2× so the dither stays crisp', u28: 'Your glyphfield export 28 (1920×1080), shown at an exact 2× so the dither stays crisp', u29: 'Your glyphfield export 29 (1920×1080), shown at an exact 2× so the dither stays crisp', u30: 'Your glyphfield export 30 (1920×1080), shown at an exact 2× so the dither stays crisp', u31: 'Your glyphfield export 31 (1920×1080), shown at an exact 2× so the dither stays crisp', u32: 'Your glyphfield export 32 (1920×1080), shown at an exact 2× so the dither stays crisp', u33: 'Your glyphfield export 33 (1920×1080), shown at an exact 2× so the dither stays crisp', u34: 'Your glyphfield export 34 (1920×1080), shown at an exact 2× so the dither stays crisp', u35: 'Your glyphfield export 35 (1920×1080), shown at an exact 2× so the dither stays crisp', u36: 'Your glyphfield export 36 (1920×1080), shown at an exact 2× so the dither stays crisp', u37: 'Your glyphfield export 37 (1920×1080), shown at an exact 2× so the dither stays crisp', u38: 'Your glyphfield export 38 (1920×1080), shown at an exact 2× so the dither stays crisp', u39: 'Your glyphfield export 39 (1920×1080), shown at an exact 2× so the dither stays crisp', u40: 'Your glyphfield export 40 (1920×1080), shown at an exact 2× so the dither stays crisp', u41: 'Your glyphfield export 41 (1920×1080), shown at an exact 2× so the dither stays crisp', u42: 'Your glyphfield export 42 (1920×1080), shown at an exact 2× so the dither stays crisp', u43: 'Your glyphfield export 43 (1920×1080), shown at an exact 2× so the dither stays crisp', u44: 'Your glyphfield export 44 (1920×1080), shown at an exact 2× so the dither stays crisp', u45: 'Your glyphfield export 45 (1920×1080), shown at an exact 2× so the dither stays crisp', u46: 'Your glyphfield export 46 (1920×1080), shown at an exact 2× so the dither stays crisp', u47: 'Your glyphfield export 47 (1920×1080), shown at an exact 2× so the dither stays crisp', u48: 'Your glyphfield export 48 (1920×1080), shown at an exact 2× so the dither stays crisp', u49: 'Your glyphfield export 49 (1920×1080), shown at an exact 2× so the dither stays crisp', u50: 'Your glyphfield export 50 (1920×1080), shown at an exact 2× so the dither stays crisp', u51: 'Your glyphfield export 51 (1920×1080), shown at an exact 2× so the dither stays crisp', u52: 'Your glyphfield export 52 (1920×1080), shown at an exact 2× so the dither stays crisp', u53: 'Your glyphfield export 53 (1920×1080), shown at an exact 2× so the dither stays crisp', u54: 'Your glyphfield export 54 (1920×1080), shown at an exact 2× so the dither stays crisp', u55: 'Your glyphfield export 55 (1920×1080), shown at an exact 2× so the dither stays crisp', u56: 'Your glyphfield export 56 (1920×1080), shown at an exact 2× so the dither stays crisp', u57: 'Your glyphfield export 57 (1920×1080), shown at an exact 2× so the dither stays crisp', u58: 'Your glyphfield export 58 (1920×1080), shown at an exact 2× so the dither stays crisp', u59: 'Your glyphfield export 59 (1920×1080), shown at an exact 2× so the dither stays crisp', silk1: 'Gem-smoke silk, frame 1', silk2: 'Gem-smoke silk, frame 2', silk3: 'Gem-smoke silk, frame 3', silk4: 'Gem-smoke silk, frame 4', silk5: 'Gem-smoke silk, frame 5', silk6: 'Gem-smoke silk, frame 6', silkog: 'Gem-smoke silk, cover frame cropped to 1200×630', ab1: 'Artboard 1 as designed (grey gem-smoke + dithered silk image), shader time 10.35s', ab1t2: 'Artboard 1, shader time 4.0s', ab1t3: 'Artboard 1, shader time 16.5s', ab1t4: 'Artboard 1, shader time 23.0s', ab1plain: 'Artboard 1 with the image layer hidden (smoke only)', ab1og: 'Artboard 1, centre-cropped to 1200×630', navy: 'Navy gem-smoke + #0078FF Bayer dither (your artboard 4)', navy2: 'Navy gem-smoke + blue dither, shader time 9.8s', navy3: 'Navy gem-smoke + blue dither, shader time 14.2s', field: 'White Bayer dither on #457AFF (your artboard 5)', gray: 'Grey gem-smoke silk, dither hidden (artboard 3)', grayDither: 'Grey gem-smoke silk + 40% Bayer dither', grayBayer: 'Grey gem-smoke, full Bayer dither (artboard 3 as designed)', smoke: 'Grey gem-smoke, shader size 1 (artboard 1, image layer hidden)', og: 'Navy + blue dither, OpenGraph artboard (artboard 6)' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const byArea = {}; for (const m of man) (byArea[m.area] ||= []).push(m);
const order = ['H', 'A', 'B', 'C', 'D', 'E', 'F'];
let nav = order.map(a => `<a href="#area-${a}"><span class="k">${a === 'H' ? '◆' : a}</span><span>${esc(AREAS[a].name)}</span><span class="n">${byArea[a].length}</span></a>`).join('');
let sections = order.map(a => {
  const items = byArea[a].map((m, i) => {
    const media = m.animated
      ? `<video class="shot" autoplay muted loop playsinline poster="img/${m.id}.jpg" width="${m.w}" height="${m.h}"><source src="img/${m.id}.mp4" type="video/mp4"></video>`
      : `<img class="shot" src="img/${m.id}.jpg" width="${m.w}" height="${m.h}" alt="${esc(m.name)}" loading="lazy">`;
    return `<article class="concept" id="${m.id}">
      <div class="concept-head"><span class="idx">${a === 'H' ? 'Direction ' + (Math.floor(i / 2) + 1) + (i % 2 ? ' · OG' : '') : 'Version ' + (i + 1)}</span><h3>${esc(m.name)}</h3><span class="file mono">${m.id}.png · ${m.w}×${m.h}${m.animated ? ' · GIF / MP4' : ''}</span></div>
      ${media}
      <div class="concept-body"><p class="why">${esc(m.why)}</p><p class="meta"><span class="mono">Background</span> ${esc(BGNAMES[m.bg] || m.bg)}${m.animated ? ` · <a href="img/${m.id}.gif">open the GIF</a>` : ''}</p></div>
    </article>`;
  }).join('');
  return `<section class="area" id="area-${a}">
    <header class="area-head"><div class="area-tag">${a === 'H' ? 'Cover image' : `Area ${a} · five versions`}</div><h2>${esc(AREAS[a].name)}</h2><p class="slot">${esc(AREAS[a].slot)}</p><blockquote>${esc(AREAS[a].quote)}</blockquote></header>
    <div class="concepts">${items}</div>
  </section>`;
}).join('');
const bgs = ['u10', 'u16', 'u20', 'u25', 'u29', 'u33', 'u39', 'u44', 'u48', 'u52', 'u56', 'u58'].filter(f => fs.existsSync(`gallery/bg/${f}.jpg`)).map(f => `<figure><img src="bg/${f}.jpg" alt="${f}" loading="lazy"><figcaption class="mono">${f}</figcaption></figure>`).join('');
const html = `<title>GT Docs Redesign Visuals</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
<style>
:root{--bg:#f5f5f7;--surface:#ffffff;--surface-2:#ececf0;--border:#dcdce2;--text:#111216;--muted:#5d5d68;--dim:#8c8c97;--accent:#0062d1;--accent-soft:#2f7fe8;--quote:#3a3a44}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0b0b0e;--surface:#111216;--surface-2:#17181d;--border:#262630;--text:#f4f4f5;--muted:#a0a0aa;--dim:#6b6b76;--accent:#0078FF;--accent-soft:#60a5fa;--quote:#c9c9d1}}
:root[data-theme="dark"]{--bg:#0b0b0e;--surface:#111216;--surface-2:#17181d;--border:#262630;--text:#f4f4f5;--muted:#a0a0aa;--dim:#6b6b76;--accent:#0078FF;--accent-soft:#60a5fa;--quote:#c9c9d1}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:var(--accent-soft)}
.mono{font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;letter-spacing:.02em}
.wrap{display:grid;grid-template-columns:260px minmax(0,1fr);gap:48px;max-width:1440px;margin:0 auto;padding:40px 32px 120px}
@media (max-width:980px){.wrap{grid-template-columns:1fr;gap:24px}.rail{position:static!important}}
.rail{position:sticky;top:24px;align-self:start}
.rail h1{font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0 0 6px;text-wrap:balance}
.rail .sub{color:var(--muted);font-size:13.5px;margin:0 0 22px}
.rail nav{display:flex;flex-direction:column;gap:2px}
.rail nav a{display:grid;grid-template-columns:24px 1fr auto;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;color:var(--text);text-decoration:none;font-size:13.5px}
.rail nav a:hover{background:var(--surface-2)}
.rail nav .k{font-family:'Geist Mono',monospace;font-size:12px;color:var(--accent-soft)}
.rail nav .n{font-family:'Geist Mono',monospace;font-size:11.5px;color:var(--dim)}
.rail .legend{margin-top:26px;padding-top:18px;border-top:1px solid var(--border);color:var(--muted);font-size:12.5px;line-height:1.5}
.rail .legend p{margin:0 0 10px}
.intro{max-width:760px;margin:0 0 52px}
.intro h2{font-size:30px;font-weight:600;letter-spacing:-.025em;line-height:1.15;margin:0 0 14px;text-wrap:balance}
.intro p{color:var(--muted);margin:0 0 12px;max-width:66ch}
.intro strong{color:var(--text);font-weight:600}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:22px 0 0}
.facts div{border:1px solid var(--border);border-radius:8px;padding:12px 14px;background:var(--surface)}
.facts .mono{color:var(--dim);display:block;margin-bottom:4px}
.facts b{font-weight:600}
.bgs{margin:28px 0 0}
.bgs h3{font-size:13px;font-weight:600;color:var(--muted);margin:0 0 10px;letter-spacing:.01em}
.bgs .row{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
@media (max-width:980px){.bgs .row{grid-template-columns:repeat(2,1fr)}}
.bgs figure{margin:0}
.bgs img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px;border:1px solid var(--border);display:block}
.bgs figcaption{color:var(--dim);margin-top:6px;font-size:11px}
.area{padding-top:56px;margin-top:8px;border-top:1px solid var(--border)}
.area-head{max-width:760px;margin-bottom:28px}
.area-tag{font-family:'Geist Mono',monospace;font-size:12px;letter-spacing:.04em;color:var(--accent-soft);margin-bottom:10px}
.area-head h2{font-size:26px;font-weight:600;letter-spacing:-.022em;margin:0 0 8px;line-height:1.15}
.area-head .slot{color:var(--muted);margin:0 0 14px;font-size:14px}
.area-head blockquote{margin:0;padding:0 0 0 16px;border-left:2px solid var(--border);color:var(--quote);font-style:italic;font-size:14.5px;max-width:62ch}
.concepts{display:flex;flex-direction:column;gap:44px}
.concept-head{display:flex;align-items:baseline;gap:14px;margin-bottom:12px;flex-wrap:wrap}
.concept-head .idx{font-family:'Geist Mono',monospace;font-size:12px;color:var(--accent-soft);letter-spacing:.03em}
.concept-head h3{margin:0;font-size:18px;font-weight:600;letter-spacing:-.015em}
.concept-head .file{margin-left:auto;color:var(--dim)}
.shot{display:block;width:100%;height:auto;border-radius:8px;border:1px solid var(--border);background:#111216}
.concept-body{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:24px;margin-top:12px}
@media (max-width:980px){.concept-body{grid-template-columns:1fr}}
.concept-body p{margin:0}
.why{color:var(--text);font-size:14.5px;max-width:64ch}
.meta{color:var(--muted);font-size:13px}
.meta .mono{color:var(--dim);margin-right:6px}
.foot{margin-top:72px;padding-top:24px;border-top:1px solid var(--border);color:var(--muted);font-size:13px;max-width:70ch}
.foot p{margin:0 0 8px}
@media (prefers-reduced-motion:reduce){video{display:none}}
</style>
<div class="wrap">
  <aside class="rail">
    <h1>GT Docs Redesign Visuals</h1>
    <p class="sub">Five versions for each [VISUAL] slot in the finalized draft, plus two cover directions.</p>
    <nav>${nav}</nav>
    <div class="legend"><p>Every screenshot is a real crop of the live docs captured at 3× to 5×. The old docs were captured from the protected Vercel deployment through your signed-in Chrome.</p><p>Backgrounds are your own glyphfield exports from “blog graphic backgrounds”, one distinct frame per visual.</p></div>
  </aside>
  <main>
    <section class="intro">
      <h2>Thirty visuals, six areas, your gem-smoke exports</h2>
      <p>The draft has six places that ask for a picture. For each one there are five structurally different versions below: a literal overlay, an abstraction, a comparison, a diagram, and a specimen or list. The visuals carry labels only; no titles or captions, so the surrounding prose does the explaining.</p>
      <p>Every background is one of your own glyphfield exports from the “blog graphic backgrounds” project, a pool of 42 dithered gem-smoke frames at 1920×1080. Each visual gets a different frame, placed at an exact 4× during render and 2× in the final file, so the dither pattern stays crisp. Labels use <strong>#0078FF</strong>; deletions and anti-patterns use one muted red. Type is Inter and Geist Mono, the same faces as the docs.</p>
      <div class="facts">
        <div><span class="mono">Sources</span><b>generaltranslation.com/docs</b> (new) and the <b>landing-nqssq5533</b> deployment (old), both at 1440×900</div>
        <div><span class="mono">Output</span><b>3840×2160</b> PNG, rendered at 7680 wide and downsampled 2×; every cover also at <b>1200×630</b> (3840×2016)</div>
        <div><span class="mono">Animated</span><b>E1</b> ships as GIF and MP4 from a live recording of the table of contents while scrolling</div>
        <div><span class="mono">Editable</span>Every visual is an HTML file; a generator script rebuilds all thirty-two from the manifest</div>
      </div>
      <div class="bgs"><h3>A dozen of the 42 frames in the pool</h3><div class="row">${bgs}</div></div>
    </section>
    ${sections}
    <div class="foot">
      <p><strong>Truth notes.</strong> F2 “Spot the anti-patterns” is an illustrative mock built for the article and is labelled as such on the image. The “six to three” count in C1 follows the categories written on the image. Old and new pages both keep a Copy page control; the visuals do not claim otherwise.</p>
      <p><strong>Regenerate.</strong> The source folder holds the HTML for every visual, the generator, the backgrounds, the screenshots and the fonts. Edit a coordinate or a caption in the generator and re-render.</p>
    </div>
  </main>
</div>`;
fs.writeFileSync('gallery/index.html', html);
console.log('gallery written', html.length);
