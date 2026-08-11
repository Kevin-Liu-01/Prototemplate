import type { CSSProperties } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import './anatomy-wall.css';

const GALLERY = join(process.cwd(), 'public', 'shots', 'gallery');

type TileSize = { w: number; h: number };

/* Format is sniffed from magic bytes, never the extension: PNG carries
   the size at fixed offsets in IHDR; JPEG carries it in the first SOF
   segment. A stem with no readable file falls back to hatched ground. */
function pngSize(buf: Buffer): TileSize | null {
  if (buf.length < 24 || buf.readUInt32BE(12) !== 0x49484452) return null;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return w > 0 && h > 0 ? { w, h } : null;
}

function jpegSize(buf: Buffer): TileSize | null {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1] as number;
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker >= 0xd0 && marker <= 0xd9) {
      i += 2;
      continue;
    }
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return w > 0 && h > 0 ? { w, h } : null;
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) return null;
    i += 2 + len;
  }
  return null;
}

function imageSize(file: string): TileSize | null {
  let buf: Buffer;
  try {
    buf = readFileSync(file);
  } catch {
    return null;
  }
  if (buf.length > 8 && buf.readUInt32BE(0) === 0x89504e47) return pngSize(buf);
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) return jpegSize(buf);
  return null;
}

/* The harness has shipped the gallery as .png and as .jpg at different
   times — a tile counts as present under either name. */
function resolveTile(stem: string): (TileSize & { src: string }) | null {
  for (const ext of ['jpg', 'png'] as const) {
    const size = imageSize(join(GALLERY, `${stem}.${ext}`));
    if (size) return { src: `/shots/gallery/${stem}.${ext}`, ...size };
  }
  return null;
}

type Cut = 'desk' | 'mob';
type Shade = 'light' | 'dark';

/* Desktop placement on the collage's unit grid: 12 columns × 36 rows,
   row unit = 0.625 column units, so any n×n cell is a 1.6:1 landscape
   and a 2×6 cell is a 1:1.9 portrait. `chip` marks the cluster's
   visually top-left tile — the one that carries the hover label. */
type Placement = {
  cut: Cut;
  shade: Shade;
  col: number;
  row: number;
  w: number;
  h: number;
  chip?: boolean;
};

type Cluster = {
  key: string;
  name: string;
  tiles: Placement[];
};

/* The nine clusters tile the 12×36 field exactly — every cluster is a
   solid rectangle of its four states, and no cell of the field is left
   uncovered. Tile order inside each cluster is fixed (desk light, desk
   dark, mob light, mob dark): the ≤760px flow relies on it. Cluster
   internals alternate — desks-left, mobs-left, banner-top, banner-
   bottom, and three tall-column arrangements — so the wall never reads
   as a repeated unit. */
const WALL: Cluster[] = [
  {
    key: 'hero',
    name: 'Hero',
    tiles: [
      { cut: 'desk', shade: 'light', col: 1, row: 1, w: 4, h: 3, chip: true },
      { cut: 'desk', shade: 'dark', col: 1, row: 4, w: 4, h: 3 },
      { cut: 'mob', shade: 'light', col: 5, row: 1, w: 2, h: 6 },
      { cut: 'mob', shade: 'dark', col: 7, row: 1, w: 2, h: 6 },
    ],
  },
  {
    key: 'customers',
    name: 'Customers',
    tiles: [
      { cut: 'desk', shade: 'light', col: 1, row: 7, w: 8, h: 2, chip: true },
      { cut: 'desk', shade: 'dark', col: 5, row: 9, w: 4, h: 4 },
      { cut: 'mob', shade: 'light', col: 1, row: 9, w: 2, h: 4 },
      { cut: 'mob', shade: 'dark', col: 3, row: 9, w: 2, h: 4 },
    ],
  },
  {
    key: 'story',
    name: 'Stack story',
    tiles: [
      { cut: 'desk', shade: 'light', col: 9, row: 1, w: 4, h: 3, chip: true },
      { cut: 'desk', shade: 'dark', col: 9, row: 10, w: 4, h: 3 },
      { cut: 'mob', shade: 'light', col: 9, row: 4, w: 2, h: 6 },
      { cut: 'mob', shade: 'dark', col: 11, row: 4, w: 2, h: 6 },
    ],
  },
  {
    key: 'developer',
    name: 'Developer',
    tiles: [
      { cut: 'desk', shade: 'light', col: 1, row: 19, w: 4, h: 3 },
      { cut: 'desk', shade: 'dark', col: 1, row: 22, w: 4, h: 3 },
      { cut: 'mob', shade: 'light', col: 1, row: 13, w: 2, h: 6, chip: true },
      { cut: 'mob', shade: 'dark', col: 3, row: 13, w: 2, h: 6 },
    ],
  },
  {
    key: 'locadex',
    name: 'Locadex',
    tiles: [
      { cut: 'desk', shade: 'light', col: 9, row: 13, w: 4, h: 3 },
      { cut: 'desk', shade: 'dark', col: 9, row: 16, w: 4, h: 3 },
      { cut: 'mob', shade: 'light', col: 5, row: 13, w: 2, h: 6, chip: true },
      { cut: 'mob', shade: 'dark', col: 7, row: 13, w: 2, h: 6 },
    ],
  },
  {
    key: 'context',
    name: 'Context platform',
    tiles: [
      { cut: 'desk', shade: 'light', col: 5, row: 19, w: 4, h: 3, chip: true },
      { cut: 'desk', shade: 'dark', col: 5, row: 22, w: 4, h: 3 },
      { cut: 'mob', shade: 'light', col: 9, row: 19, w: 2, h: 6 },
      { cut: 'mob', shade: 'dark', col: 11, row: 19, w: 2, h: 6 },
    ],
  },
  {
    key: 'global',
    name: 'Global',
    tiles: [
      { cut: 'desk', shade: 'light', col: 9, row: 25, w: 4, h: 3, chip: true },
      { cut: 'desk', shade: 'dark', col: 9, row: 28, w: 4, h: 3 },
      { cut: 'mob', shade: 'light', col: 9, row: 31, w: 2, h: 6 },
      { cut: 'mob', shade: 'dark', col: 11, row: 31, w: 2, h: 6 },
    ],
  },
  {
    key: 'deploy',
    name: 'Deploy',
    tiles: [
      { cut: 'desk', shade: 'light', col: 1, row: 25, w: 8, h: 2, chip: true },
      { cut: 'desk', shade: 'dark', col: 1, row: 27, w: 4, h: 4 },
      { cut: 'mob', shade: 'light', col: 5, row: 27, w: 2, h: 4 },
      { cut: 'mob', shade: 'dark', col: 7, row: 27, w: 2, h: 4 },
    ],
  },
  {
    key: 'footer',
    name: 'Footer',
    tiles: [
      { cut: 'desk', shade: 'light', col: 1, row: 31, w: 4, h: 4, chip: true },
      { cut: 'desk', shade: 'dark', col: 1, row: 35, w: 8, h: 2 },
      { cut: 'mob', shade: 'light', col: 5, row: 31, w: 2, h: 4 },
      { cut: 'mob', shade: 'dark', col: 7, row: 31, w: 2, h: 4 },
    ],
  },
];

/* Desktop geometry rides on custom properties so the ≤760px override
   can win the cascade — an inline grid-column would beat any media
   query. */
type CellStyle = CSSProperties & { '--aw-c': string; '--aw-r': string };

export default function AnatomyWall() {
  return (
    <>
      <div className='pt-hatch' aria-hidden='true' />

      <section className='pt-sec pt-post-sec aw-head'>
        <h2>The flagship, dissected</h2>
        <p>
          Every section of the completed direction in four states (both themes, both widths),
          interlocked into one wall. Hovering any capture lights up its section&apos;s other three
          states. The captures are theme-locked, so light and dark grounds hold whichever theme
          this page is read in.
        </p>
      </section>

      <div className='aw-wall'>
        <div className='aw-collage'>
          {WALL.map((cluster, i) =>
            cluster.tiles.map((t) => {
              const tile = resolveTile(`sec-${cluster.key}-${t.cut}-${t.shade}`);
              const device = t.cut === 'desk' ? 'desktop' : 'mobile';
              const style: CellStyle = {
                '--aw-c': `${t.col} / span ${t.w}`,
                '--aw-r': `${t.row} / span ${t.h}`,
              };
              return (
                <figure
                  className={`aw-cell is-${t.cut} is-${t.shade}`}
                  data-g={cluster.key}
                  key={`${cluster.key}-${t.cut}-${t.shade}`}
                  style={style}
                >
                  {tile ? (
                    <img
                      alt={`${cluster.name} section: ${device}, ${t.shade} theme`}
                      draggable={false}
                      loading='lazy'
                      src={tile.src}
                    />
                  ) : (
                    <div aria-hidden='true' className='aw-missing' />
                  )}
                  {t.chip ? (
                    <span aria-hidden='true' className='aw-chip'>
                      {String(i + 1).padStart(2, '0')} · {cluster.name}
                    </span>
                  ) : null}
                </figure>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
