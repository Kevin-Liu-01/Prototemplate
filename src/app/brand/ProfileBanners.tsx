import { headingId } from './brand-sections';

const DIR = '/media/profile-banners';

/** The five LinkedIn styles, in the order of their file numbers. */
const LINKEDIN = [
  {
    stem: 'linkedin-1-rows',
    name: 'Rows',
    caption: 'rows of hello that run off the right edge and dissolve through the screen, the first row stopping at the globe',
  },
  {
    stem: 'linkedin-2-rows-tagged',
    name: 'Rows with locale tags',
    caption: 'the rows with each word’s locale tag, and a hairline over the logos',
  },
  {
    stem: 'linkedin-3-band-cloud',
    name: 'Band cloud',
    caption: 'a word cloud in one band beside a large globe, its tone set by word size',
  },
  {
    stem: 'linkedin-4-word-cloud',
    name: 'Word cloud',
    caption: 'a word cloud across the whole banner around the globe, its tone set by word size',
  },
  {
    stem: 'linkedin-5-word-cloud-small-globe',
    name: 'Word cloud, small globe',
    caption: 'the word cloud with a smaller globe at the top right',
  },
] as const;

const EDITIONS = [
  { id: 'with-logos', name: 'with logos' },
  { id: 'no-logos', name: 'no logos' },
] as const;

const THEMES = [
  { id: 'dark', name: 'dark' },
  { id: 'light', name: 'light' },
] as const;

type BannerSetProps = {
  stem: string;
  name: string;
  caption: string;
  /** the 1x size, the size each site takes; the shown WebP is twice it */
  width: number;
  height: number;
};

/** One style: its four banners in a grid, editions as rows and themes as columns, then the caption and the PNG of each. */
function BannerSet({ stem, name, caption, width, height }: BannerSetProps) {
  return (
    <div className='ptb-art'>
      <figure className='ptb-shot'>
        <div className='ptb-banners'>
          {EDITIONS.flatMap((edition) =>
            THEMES.map((theme) => (
              <img
                alt={`${name}, ${edition.name}, ${theme.name}`}
                className={`ptb-banner-${theme.id}`}
                height={height * 2}
                key={`${edition.id}-${theme.id}`}
                loading='lazy'
                src={`${DIR}/${stem}-${edition.id}-${theme.id}@2x.webp`}
                width={width * 2}
              />
            ))
          )}
        </div>
        <figcaption>
          {name}&nbsp;· {caption}
        </figcaption>
      </figure>
      <p className='pt-site-links ptb-send'>
        {EDITIONS.flatMap((edition) =>
          THEMES.map((theme) => (
            <a
              aria-label={`PNG of ${name}, ${edition.name}, ${theme.name}`}
              download
              href={`${DIR}/${stem}-${edition.id}-${theme.id}.png`}
              key={`${edition.id}-${theme.id}`}
            >
              {theme.name}, {edition.name}
            </a>
          ))
        )}
      </p>
    </div>
  );
}

/**
 * Kevin's LinkedIn and X profile banners: the five LinkedIn styles, then the
 * X banner. The pictures are the 2x masters in lossless WebP, and the links
 * download the PNG at the size each site takes (public/media/README.md).
 */
export default function ProfileBanners() {
  return (
    <>
      <p>
        These are Kevin&rsquo;s banners for his LinkedIn and X profiles. Each is a field of hello in
        fourteen languages, set in Katagami Text with Katagami CJK, that fades through
        the 8 by 8 Bayer screen beside the globe. They are monochrome, on ink or on
        paper. The banners with logos carry the six customer logos on
        generaltranslation.com: Cursor, Ramp, Sierra, Partiful, ClickHouse and Okta.
        The banners with no logos show no other company. Each link downloads the PNG
        at the size the site takes: 1584 by 396&nbsp;px for LinkedIn and 1500 by
        500&nbsp;px for X.
      </p>
      <h3 id={headingId('profile-banners', 'linkedin')}>LinkedIn</h3>
      <div className='ptb-media'>
        {LINKEDIN.map((style) => (
          <BannerSet key={style.stem} {...style} width={1584} height={396} />
        ))}
      </div>
      <h3 id={headingId('profile-banners', 'x')}>X</h3>
      <div className='ptb-media'>
        <BannerSet
          stem='x-word-cloud'
          name='Word cloud'
          caption='the word cloud in the X frame, clear of the profile photo at the lower left'
          width={1500}
          height={500}
        />
      </div>
    </>
  );
}
