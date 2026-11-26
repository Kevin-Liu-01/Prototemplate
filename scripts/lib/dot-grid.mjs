// A grid of round dots as a PNG and as plain text, shared by pnpm
// build:ascii-header (the dot-matrix header) and pnpm build:ascii-armillary
// (the armillary on the header's grid), so both draw the same dot.

import { deflateSync } from 'node:zlib';

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  let c = 0xffffffff;
  for (const b of body) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE((c ^ 0xffffffff) >>> 0, body.length + 4);
  return out;
}

/** A #rrggbb grey's level, 0 to 255. */
export const hexGray = (hex) => parseInt(hex.slice(1, 3), 16);

/**
 * The dots ([column, row] pairs) of a `width` by `height` grid at `pitch`
 * pixels a dot, each dot `dot` of the pitch across, each pixel's share of
 * its dot from a 4 by 4 sample, as an 8-bit grayscale PNG from `ground` to
 * `ink` (levels, 0 to 255).
 */
export function dotsPng(dots, width, height, { pitch: P, dot, ground, ink }) {
  const w = width * P;
  const h = height * P;
  const cover = new Float32Array(w * h);
  const rad = (dot * P) / 2;
  for (const [c, r] of dots) {
    const cx = (c + 0.5) * P;
    const cy = (r + 0.5) * P;
    for (let y = Math.floor(cy - rad); y < Math.ceil(cy + rad); y++)
      for (let x = Math.floor(cx - rad); x < Math.ceil(cx + rad); x++) {
        let n = 0;
        for (let j = 0; j < 4; j++)
          for (let i = 0; i < 4; i++) {
            const dx = x + (i + 0.5) / 4 - cx;
            const dy = y + (j + 0.5) / 4 - cy;
            if (dx * dx + dy * dy <= rad * rad) n++;
          }
        cover[y * w + x] = Math.max(cover[y * w + x], n / 16);
      }
  }
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w + 1)] = 0;
    for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = Math.round(ground + (ink - ground) * cover[y * w + x]);
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0);
  head.writeUInt32BE(h, 4);
  head[8] = 8;
  head[9] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/**
 * A grid of booleans as plain ASCII for a terminal, two rows of dots a line
 * (: both, ' top, . bottom), its blank lines and its common indent trimmed.
 */
export function dotsText(grid) {
  const pairs = (top, bottom) => (top && bottom ? ':' : top ? "'" : bottom ? '.' : ' ');
  const txt = [];
  for (let r = 0; r < grid.length; r += 2) {
    txt.push(grid[r].map((on, c) => pairs(on, grid[r + 1]?.[c] ?? false)).join('').trimEnd());
  }
  while (txt.length && !txt[0]) txt.shift();
  while (txt.length && !txt[txt.length - 1]) txt.pop();
  const indent = Math.min(...txt.filter(Boolean).map((l) => l.match(/^ */)[0].length));
  return `${txt.map((l) => l.slice(indent)).join('\n')}\n`;
}
