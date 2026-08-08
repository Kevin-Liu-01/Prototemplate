import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import './anatomy-wall.css';

/* The wall's order is the flagship page's own reading order. */
const SECTIONS = [
  { key: 'hero', name: 'Hero' },
  { key: 'customers', name: 'Customers' },
  { key: 'story', name: 'Stack story' },
  { key: 'developer', name: 'Developer' },
  { key: 'locadex', name: 'Locadex' },
  { key: 'context', name: 'Context platform' },
  { key: 'global', name: 'Global' },
  { key: 'deploy', name: 'Deploy' },
  { key: 'footer', name: 'Footer' },
] as const;

/* Four states per section, always in this order — desktop before mobile,
   light before dark. Captures are theme-locked; both themes always show. */
const STATES = [
  { cut: 'desk', shade: 'light', width: '1440' },
  { cut: 'desk', shade: 'dark', width: '1440' },
  { cut: 'mob', shade: 'light', width: '390' },
  { cut: 'mob', shade: 'dark', width: '390' },
] as const;

const GALLERY = join(process.cwd(), 'public', 'shots', 'gallery');

type TileSize = { w: number; h: number };

/* Tiles hold each capture's true proportions (clamped by the strip's
   cap), so the ratio must come from the file itself. Format is sniffed
   from magic bytes, never the extension: PNG carries the size at fixed
   offsets in IHDR; JPEG carries it in the first SOF segment. */
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
   times — a tile counts as present under either name; a stem with no
   readable file under both falls back to the hatched placeholder. */
function resolveTile(stem: string): (TileSize & { src: string }) | null {
  for (const ext of ['jpg', 'png'] as const) {
    const size = imageSize(join(GALLERY, `${stem}.${ext}`));
    if (size) return { src: `/shots/gallery/${stem}.${ext}`, ...size };
  }
  return null;
}

export default function AnatomyWall() {
  return (
    <>
      <div className='pt-hatch' aria-hidden='true' />

      <section className='pt-sec pt-post-sec aw-head'>
        <h2>The flagship, dissected</h2>
        <p>
          Every section of the completed direction, in four states: both themes, both widths —
          the same page the production redesign shipped from. The captures are theme-locked, so
          light and dark sit side by side whichever theme this page is read in.
        </p>
      </section>

      <div className='aw-rows'>
        {SECTIONS.map((section, i) => (
          <div className='aw-row' key={section.key}>
            <div className='aw-row-label'>
              <span className='aw-n'>{String(i + 1).padStart(2, '0')}</span>
              <h3>{section.name}</h3>
            </div>
            <div className='aw-strip'>
              {STATES.map((state) => {
                const tile = resolveTile(`sec-${section.key}-${state.cut}-${state.shade}`);
                const device = state.cut === 'desk' ? 'desktop' : 'mobile';
                return (
                  <figure
                    className={`aw-tile is-${state.cut} is-${state.shade}`}
                    key={`${state.cut}-${state.shade}`}
                  >
                    {tile ? (
                      <div className='aw-plate' style={{ aspectRatio: `${tile.w} / ${tile.h}` }}>
                        <img
                          alt={`${section.name} section — ${device}, ${state.shade} theme`}
                          draggable={false}
                          loading='lazy'
                          src={tile.src}
                        />
                      </div>
                    ) : (
                      <div aria-hidden='true' className='aw-plate is-missing' />
                    )}
                    <figcaption>
                      {state.width} · {state.shade}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
