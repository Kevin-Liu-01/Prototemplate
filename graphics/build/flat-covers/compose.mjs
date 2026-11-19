// The blog covers that were flat exports (open source, Fumadocs, Fuma Nama, Cuelume, Slash, Paraglide JS), rebuilt at
// 3840x2160 with 5 px dither cells or 2400x1260 with 4 px cells: each published ground re-screened by ../redither.py with
// its type and marks masked out, the titles set again in Inter fitted to the published ones, the partner marks, and the
// logo (public/brand). The published covers are kept in graphics/shots/covers-1117.
//   node graphics/build/flat-covers/compose.mjs [--dest DIR ...] [id ...]
// Writes graphics/build/out/flat-covers/ and each file under public/static/blogs and every --dest (a landing checkout's).
import { createRequire } from "node:module";
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = resolve(HERE, "../../..");
const require = createRequire(join(ROOT, "package.json"));
const { chromium } = require("playwright-core");
const SRC = join(ROOT, "graphics/shots/covers-1117"), BG = join(ROOT, "public/graphics/bg/covers");
const OUT = join(ROOT, "graphics/build/out/flat-covers");
const uri = (p, type) => `data:${type};base64,${readFileSync(p).toString("base64")}`;
const img = (p) => uri(p, p.endsWith(".webp") ? "image/webp" : p.endsWith(".jpg") ? "image/jpeg" : "image/png");
const white = (svg) => svg.replace(/currentColor/g, "#ffffff");
const GLOBE = white(readFileSync(join(ROOT, "public/brand/gt-globe-logo.svg"), "utf8"));
const LOCKUP = white(readFileSync(join(ROOT, "public/brand/gt-globe-lockup.svg"), "utf8"));
const SLASH = readFileSync(join(SRC, "slash-logo.svg"), "utf8");
const TREFOIL = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" fill-rule="evenodd" d="M17.10 19.27A15 15 0 0 1 46.90 19.27A9 9 0 0 0 50.48 25.46A15 15 0 0 1 35.57 51.26A9 9 0 0 0 28.42 51.27A15 15 0 0 1 13.53 25.46A9 9 0 0 0 17.10 19.27ZM32 24.5A7.5 7.5 0 1 0 32 39.5A7.5 7.5 0 1 0 32 24.5Z"/></svg>`;
// "Open Source" beside the globe is one element on every cover, so it takes one weight, set by the one-line lockup rule.
const lock = (text, region, T, center) => ({ t: "lockup1", text, region, T, center, globe: GLOBE, weight: 600 });
const text = (t, region, T = 200, weight, dx = 0) => ({ t: "text", text: t, region, T, weight, dx });
// A partner cover is the partner's logo and wordmark x the General Translation lockup, the x on the cover's centre line.
const shift = (box, dx) => [box[0] + dx, box[1], box[2] + dx, box[3]];
const dy = (box, d) => [box[0], box[1] + d, box[2], box[3] + d];
const pub = (name) => join(SRC, name.replace(/\//g, "_"));

// ground: [source, window, size, cell, ...redither.py options]; boxes are in the published cover's pixels.
const COVERS = {
  "open-source": { pub: "supporting-open-source-software.png", W: 3840, H: 2160,
    ground: [join(BG, "open-source.png"), "0,0,960,540", "3840x2160", 5],
    items: [lock("Open Source", [310, 225, 745, 330], 238, 480)] },
  fumadocs: { pub: "fumadocs.png", W: 3840, H: 2160,
    ground: [join(BG, "fumadocs.png"), "0,0,960,540", "3840x2160", 5, "--hole", "338,190,786,317", "--hole-ring", "218.5,254,50,65"],
    // Outside the glass the ground comes from a run that masks the whole disc, so the glass never spills past its rim.
    outer: [join(BG, "fumadocs.png"), "0,0,960,540", "3840x2160", 5, "--hole", "338,190,786,317", "--hole-ring", "218.5,254,0,65"],
    items: [{ t: "rim", box: [161, 196, 276, 312], rim: 1.2, rimColor: "rgba(255,255,255,0.9)" },
      text("Fumadocs", [330, 190, 795, 320]), lock("Open Source", [400, 425, 615, 485], 200, 480)] },
  "fuma-nama-og": { pub: "fuma-nama-og.png", W: 2400, H: 1260,
    ground: [join(BG, "fuma-nama-og.png"), "0,0,960,504", "2400x1260", 4, "--hole", "80,183,886,250", "--hole", "236,255,728,311"],
    // Both lines take the weight whose summed ink coverage equals the published title's (1.00 at about 555).
    items: [text("Fuma Nama: The philosophy of", [60, 180, 900, 252], 200, 560), text("an open-sourceror", [60, 253, 900, 320], 200, 560), lock("Open Source", [395, 400, 615, 452], 200, 480)] },
  cuelume: { pub: "daniel-white/cover.webp", W: 3840, H: 2160,
    ground: [join(BG, "cuelume.png"), "0,0,1920,1080", "3840x2160", 5, "--hole", "405,382,1515,600", "--src-cell", "4", "--reach", "5"],
    items: [{ t: "svg", name: "trefoil", svg: TREFOIL, box: [413, 390, 612, 592] }, text("Cuelume", [670, 385, 1515, 600], 200, 475), lock("Open Source", [780, 795, 1255, 900], 200, 960)] },
  "cuelume-og": { pub: "daniel-white/og.png", W: 2400, H: 1260,
    ground: [join(BG, "cuelume-og.png"), "0,0,1920,1008", "2400x1260", 4, "--hole", "405,379,1515,584", "--reach", "5"],
    items: [{ t: "svg", name: "trefoil", svg: TREFOIL, box: [413, 387, 612, 576] }, text("Cuelume", [670, 380, 1515, 585], 200, 475), lock("Open Source", [790, 765, 1235, 860], 200, 960)] },
  slash: { pub: "supporting-slash-companies.jpg", W: 2400, H: 1260,
    ground: [join(BG, "slash.png"), "0,0,1024,537.6", "2400x1260", 4],
    // The Slash wordmark and the lockup share its 80 px height; 60 px of white either side of the x, centred at 512.
    items: [{ t: "svg", name: "slash", svg: SLASH, box: [200.4, 228, 440, 308] }, text("×", [560, 240, 600, 300], 190, 350, -72), { t: "svg", name: "lockup", svg: LOCKUP, box: [584, 228, 887.6, 308] }] },
  "paraglide-cover": { pub: "paraglide-js/cover.webp", W: 3840, H: 2160, mirror: false, parachute: [368, 452, 540, 628], dx: -40,
    ground: ["pub", "0,0,1920,1080", "3840x2160", 5, "--hole-all", "368,452,540,628", "--hole-all", "560,508,934,584", "--hole-all", "979,519,1021,561", "--hole-all", "1065,471,1557,609",
      // Kevin, 11-18: the orange swelled into the dark oval by the parachute; it now steps back around it.
      "--clear", "400,540,200,180,150"],
    items: [text("Paraglide JS", [560, 505, 935, 590], 200, undefined, -40), text("×", [978, 518, 1022, 562], 200, undefined, -40), { t: "svg", name: "lockup", svg: LOCKUP, box: shift([1072, 478, 1550, 602], -40) }] },
  "paraglide-og": { pub: "paraglide-js/og.png", W: 2400, H: 1260, mirror: false, parachute: [368, 416, 540, 592], dx: -40,
    ground: ["pub", "0,0,1920,1008", "2400x1260", 4, "--hole-all", "368,416,540,592", "--hole-all", "560,472,934,548", "--hole-all", "979,483,1021,525", "--hole-all", "1065,435,1557,573", "--clear", "400,504,200,180,150"],
    items: [text("Paraglide JS", dy([560, 505, 935, 590], -36), 200, undefined, -40), text("×", dy([978, 518, 1022, 562], -36), 200, undefined, -40), { t: "svg", name: "lockup", svg: LOCKUP, box: shift(dy([1072, 478, 1550, 602], -36), -40) }] },
};

const args = process.argv.slice(2), dests = [join(ROOT, "public/static/blogs")], ids = [];
for (let i = 0; i < args.length; i++) args[i] === "--dest" ? dests.push(resolve(args[++i])) : ids.push(args[i]);
const screen = (c, spec, out) => {
  const [src, ...rest] = spec;
  execFileSync("python3", [join(HERE, "../redither.py"), src === "pub" ? pub(c.pub) : src, out, ...rest.map(String)], { stdio: "inherit" });
  return out;
};

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const font = uri(join(ROOT, "public/fonts/InterVariable.woff2"), "font/woff2");
  await page.setContent(`<style>@font-face{font-family:Inter;src:url(${font}) format('woff2');font-weight:100 900}</style><body>`);
  await page.addScriptTag({ path: join(HERE, "compose-page.js") });
  for (const id of ids.length ? ids : Object.keys(COVERS)) {
    const c = COVERS[id], items = [...c.items];
    const ground = process.env.GROUND_FILE || screen(c, c.ground, join(OUT, `${id}-ground.png`));
    if (c.outer) items[0] = { ...items[0], outer: img(screen(c, c.outer, join(OUT, `${id}-outer.png`))) };
    if (c.parachute) {
      execFileSync("python3", [join(HERE, "matte.py"), pub(c.pub), join(OUT, `${id}-parachute.png`), c.parachute.join(",")]);
      items.unshift({ t: "img", name: "parachute", src: img(join(OUT, `${id}-parachute.png`)), box: [c.parachute[0] + (c.dx || 0), c.parachute[1]] });
    }
    const r = await page.evaluate((s) => window.compose(s), { pub: img(pub(c.pub)), ground: img(ground), W: c.W, H: c.H, items });
    const png = join(OUT, `${id}.png`), file = join(OUT, c.pub);
    writeFileSync(png, Buffer.from(r.png.split(",")[1], "base64"));
    execFileSync("python3", [join(HERE, "encode.py"), png, file]);
    // This repository has no copy of the Paraglide JS post, so its covers go only to --dest folders.
    for (const d of c.mirror === false ? dests.slice(1) : dests) { mkdirSync(dirname(join(d, c.pub)), { recursive: true }); copyFileSync(file, join(d, c.pub)); }
    console.log(id, JSON.stringify(r.log));
  }
} finally {
  await browser.close();
}
