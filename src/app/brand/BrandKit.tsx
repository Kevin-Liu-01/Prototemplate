import { headingId } from './brand-sections';
import KIT from '../../../public/brand/kit/manifest.json';
import GtLogoMotion from '@/components/brand/GtLogoMotion';

/**
 * The brand kit section: the kit's download, then each part of it shown
 * from the small files under public/brand/kit (pnpm build:brand-kit copies
 * them and the zip from the kit build and writes manifest.json). The
 * button links the manifest's zip.url, the zip in the same folder; without
 * one the section shows no button.
 */
const KIT_ZIP_URL: string | null = KIT.zip?.url ?? null;

const BASE = '/brand/kit';
const MB = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;
const KB = (bytes: number) => (bytes < 1000 ? `${bytes} B` : `${Math.round(bytes / 1e3)} KB`);
const FILES = Object.values(KIT.folders).reduce((sum, n) => sum + n, 1);

type LogoKey = (typeof KIT.logos)[number]['key'];

/** each logo type's name and where it is used, from the kit README */
const LOGO_TEXT: Record<LogoKey, { name: string; use: string; wide: boolean }> = {
  mark: { name: 'Mark', use: 'The globe alone, for icons, avatars and places where the name is already near.', wide: false },
  'lockup-stacked': { name: 'Stacked lockup', use: 'The main logo: the mark beside “General” over “Translation”.', wide: true },
  'lockup-horizontal': { name: 'One-line lockup', use: 'The logo where height is short: a header bar, a footer or a banner.', wide: true },
  wordmark: { name: 'Wordmark', use: 'The name alone on one line, where the mark is already near.', wide: true },
  'wordmark-stacked': { name: 'Stacked wordmark', use: 'The name alone on two lines, in the spacing of the stacked lockup.', wide: true },
};

const SVG_LABEL = [
  ['ink', 'ink'],
  ['white', 'white'],
  ['accent', 'accent'],
  ['accent-lift', 'accent lift'],
  ['currentcolor', 'currentColor'],
] as const;

const sheet = (key: string) => {
  const found = KIT.sheets.find((s) => s.key === key);
  if (!found) throw new Error(`brand kit: no sheet ${key}`);
  return found;
};

/** the guide sheets in the order the kit README lists them, each with its caption */
const GUIDES = [
  ['clear-space', 'Construction and clear space: both lockups drawn with their numbers, and X on every side of each logo.'],
  ['minimum-size', 'Minimum sizes: the mark at 24 px, and a 9 px cap height for the lockups and wordmarks.'],
  ['variant-sheet', 'The variant sheet: every logo file in the kit on one page.'],
  ['frames-sheet', 'The frames: the logo centred in every common aspect ratio, from a square post to a LinkedIn banner.'],
] as const;

/** the loader and hover films the kit carries, at their public paths */
const MOTION = [
  ['loader', 'Meridian, then G', 'meridian-then-g'],
  ['hover', 'the draw-back hover', 'draw-back'],
] as const;

/** A guide sheet. `crop` shows its top at 4:3 and links the whole sheet below it. */
function Sheet({ k, alt, caption, crop = false }: { k: string; alt: string; caption: string; crop?: boolean }) {
  const s = sheet(k);
  const href = `${BASE}/${s.file}`;
  return (
    <figure className={crop ? 'ptb-kit-sheet is-crop' : 'ptb-kit-sheet'}>
      <a href={href}>
        <img alt={alt} decoding='async' height={s.height} loading='lazy' src={href} width={s.width} />
      </a>
      <figcaption>{caption}</figcaption>
      {crop ? (
        <p className='ptb-kit-links'>
          <a href={href}>Open the whole sheet</a>
        </p>
      ) : null}
    </figure>
  );
}

export default function BrandKit() {
  return (
    <>
      <p>
        The brand kit holds every logo file, the palette, Katagami Text, the logo&rsquo;s motion and the guides
        in one download. Each logo file is generated from the one drawing of the mark and from the name&rsquo;s
        outlines, so the mark, the lockups, the frames and the icons agree exactly. Every SVG is outlined, with no
        fonts, live text or embedded images.
      </p>
      <div className='ptb-kit-get'>
        {KIT_ZIP_URL ? (
          <a className='ptb-kit-zip' download href={KIT_ZIP_URL}>
            Download the Brand Kit
          </a>
        ) : null}
        <span>
          {KIT.zip ? `${KIT.zip.name}, ${MB(KIT.zip.bytes)}, ${FILES} files` : `${FILES} files`}
        </span>
      </div>
      <Sheet
        alt='The General Translation brand on one page: the stacked lockup, the one-line lockup on ink, the mark, the wordmark, the six colours, the type, and the rules for using the logo'
        caption='The brand sheet: the brand on one page, with the logo in use and the rules for it.'
        k='brand-sheet'
      />

      <h3 id={headingId('brand-kit', 'logo')}>Logo</h3>
      <p>
        Every logo comes as SVG, PDF and PNG at 512, 1024 and 2048 px. The transparent files use ink or accent on a
        light ground and white or accent lift on a dark one. The <code>currentColor</code> SVG takes the colour of
        the text around it, for inline SVG and icon systems.
      </p>
      <div className='ptb-kit-logos'>
        {KIT.logos.map((logo) => {
          const text = LOGO_TEXT[logo.key];
          return (
            <div className={text.wide ? 'ptb-kit-logo is-wide' : 'ptb-kit-logo'} key={logo.key}>
              <div className='ptb-kit-logo-art'>
                <span className='is-paper'>
                  <img alt={`The ${text.name.toLowerCase()} in ink on paper`} decoding='async' loading='lazy' src={`${BASE}/${logo.svg.ink.file}`} />
                </span>
                <span className='is-ink'>
                  <img alt={`The ${text.name.toLowerCase()} in white on ink`} decoding='async' loading='lazy' src={`${BASE}/${logo.svg.white.file}`} />
                </span>
              </div>
              <b>{text.name}</b>
              <p>{text.use}</p>
              <p className='ptb-kit-links'>
                {SVG_LABEL.map(([color, label]) => (
                  <a download href={`${BASE}/${logo.svg[color].file}`} key={color}>
                    SVG {label}
                  </a>
                ))}
                <a download href={`${BASE}/${logo.png.ink.file}`}>
                  PNG ink
                </a>
                <a download href={`${BASE}/${logo.png.white.file}`}>
                  PNG white
                </a>
              </p>
            </div>
          );
        })}
      </div>

      <h3 id={headingId('brand-kit', 'transparent')}>Transparent PNGs</h3>
      <p>
        Every transparent logo PNG is in the kit&rsquo;s <code>logo/transparent</code> folder, sorted by logo
        type: the mark, the square mark, both lockups and both wordmarks at three sizes in four colours. Each one is
        named <code>-on-transparent</code>, or <code>-white-on-transparent</code> for a dark ground. Every PNG
        without that name has a solid ground, because Google Drive and some previews draw transparency as black and a
        white logo there looks like an empty black square. The 1024 px PNGs in ink and white download from the cards
        above.
      </p>

      <h3 id={headingId('brand-kit', 'color')}>Color</h3>
      <Sheet
        alt='The colour sheet: ink, raised ink, titanium, paper, the accent and its lift, each with its values'
        caption='The colour sheet: four absolute colours and one blue accent, with the hex, RGB, HSL and OKLCH values of each.'
        crop
        k='color-sheet'
      />
      <p className='ptb-kit-links ptb-kit-row'>
        {KIT.color.map((file) => (
          <a download href={`${BASE}/${file.file}`} key={file.file}>
            {file.file.replace('color/', '')} ({KB(file.bytes)})
          </a>
        ))}
      </p>

      <h3 id={headingId('brand-kit', 'type')}>Type</h3>
      <Sheet
        alt='The type spec: Katagami Text at weights 400 and 500, and Geist Mono for code'
        caption='The type spec: Katagami Text sets the name in the logo, the interface, headings and body at weights 400 and 500, and Geist Mono sets code.'
        crop
        k='type-spec'
      />
      <p>
        The kit carries Katagami Text, roman and italic, as desktop TTF and web WOFF2 files with its SIL Open Font
        License. Katagami is a free, open-source type family.
      </p>

      <h3 id={headingId('brand-kit', 'motion')}>Motion</h3>
      <p>
        The kit carries the loader and the hover as MP4 films on paper and on ink. The two figures below are the
        same motion drawn live in SVG and CSS. Hover the second figure to run the draw-back.
      </p>
      <div className='ptb-kit-motion'>
        <figure className='ptb-kit-motion-cell'>
          <div className='ptb-kit-motion-art is-paper'>
            <GtLogoMotion label='The General Translation loader' mode='loader' size={88} />
          </div>
          <figcaption>The loader, Meridian, then G, as it runs while a page loads.</figcaption>
        </figure>
        <figure className='ptb-kit-motion-cell'>
          <div className='ptb-kit-motion-art is-ink' data-gt-logo-host=''>
            <GtLogoMotion mode='hover' size={88} />
          </div>
          <figcaption>The hover: the meridian draws back while the pointer is over the logo.</figcaption>
        </figure>
      </div>
      <p className='ptb-kit-links ptb-kit-row'>
        {MOTION.flatMap(([key, name, stem]) =>
          (['light', 'dark'] as const).map((theme) => (
            <a
              aria-label={`MP4 of ${name} on ${theme === 'light' ? 'paper' : 'ink'}`}
              download
              href={`/marks/graticule/motion/${stem}-${theme}.mp4`}
              key={`${key}-${theme}`}
            >
              {key} MP4 on {theme === 'light' ? 'paper' : 'ink'}
            </a>
          ))
        )}
      </p>

      <h3 id={headingId('brand-kit', 'guides')}>Guides</h3>
      <div className='ptb-kit-guides'>
        {GUIDES.map(([key, caption]) => (
          <Sheet alt={caption} caption={caption} crop k={key} key={key} />
        ))}
      </div>
      <p>
        Each guide is in the kit as a PDF for print and a PNG for screens. The frames folder holds the logo at every
        size a platform asks for, each with a transparent version.
      </p>
    </>
  );
}
