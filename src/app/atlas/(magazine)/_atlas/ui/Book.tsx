'use client';

import Link from 'next/link';
import { useId, type CSSProperties } from 'react';

import type { MagazineIssue, StoryCard } from '../content';
import { dmsPair } from '../coords';
import { storyHref, useEdition } from '../edition';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import { bookTitle } from '../titles';
import { magazineName, type Lang } from '../stories';
import type { ArtBox } from '../gpu/emblems';
import { darkStock, issueMonth, pad, paleOf } from '../riffle/print';
import Cover from './Cover';
import MapSheet from './MapSheet';
import Seal from './Seal';

export type BookStory = Pick<
  StoryCard,
  'slug' | 'n' | 'authors' | 'cover' | 'summary' | 'minutes' | 'dateline'
> &
  Partial<Pick<StoryCard, 'sections' | 'date' | 'figureCount'>>;

type Props = {
  story: BookStory;
  title: string;
  lang: Pick<Lang, 'code' | 'dir'>;
  /** Runs the cover's fluid; a still otherwise. */
  playing: boolean;
  /** The chosen book in a row. */
  on?: boolean;
  /** Swings the front board open on the spine to show the colophon and the contents. */
  open?: boolean;
  /** Draws the inside: the colophon on the board and the contents page under it. */
  inside?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Hidden from screen readers where a link beside it already names the story, as on the rack. */
  decorative?: boolean;
  onClick?: () => void;
  /** A hardcover (the shelf), or a thin magazine with its cover lines over the art (the rack). */
  format?: 'book' | 'magazine';
  /** A magazine's inside, printed on the page under its front, which shows when a corner lifts. */
  issue?: MagazineIssue;
};

/** Every book is the same size and thickness, whatever the story's length; a magazine is a few sheets. */
export function bookDepth(format: 'book' | 'magazine' = 'book'): number {
  return format === 'magazine' ? 5 : 24;
}

/** Where a magazine's design draws: left of the middle, a third of the way down, with open paper around it. */
export const MAGAZINE_ART: ArtBox = { x: 0.06, y: 0.3, w: 0.45, h: 0.42 };

/* A magazine's front page on the story's own stock: its cover's colors and marbling
   with its own design (gpu/emblems.ts) left of the middle, the scan's
   folds, specks and grain over it, turned a different way on each issue;
   up the right edge the story's name as its credit line; the folio at
   the foot. Every line is Katagami Text in the cover's ink. The gloss
   follows the pointer (--hx, --hy, set by the shelf).

   With the story's issue, the page under the front is printed too: the
   inside, the magazine's feature page. When the shelf lifts a corner (the slot's
   data-peel) the front is cut along the fold, the corner curls back over
   it (PageCurl), and the inside shows through (front-page.css). */
function MagazinePage({
  story,
  title,
  lang,
  playing,
  issue,
}: {
  story: BookStory;
  title: string;
  lang: Pick<Lang, 'code' | 'dir'>;
  playing: boolean;
  issue?: MagazineIssue;
}) {
  const name = magazineName(story.slug, title, lang.code === 'en');
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  return (
    <>
      {issue ? (
        <InsidePage story={story} title={title} lang={lang} issue={issue} />
      ) : null}
      <div
        className='gtp-mag-page'
        data-turn={story.n % 4}
        data-stock={darkStock(spec.colors[0]) ? 'dark' : 'light'}
      >
        <Cover
          slug={story.slug}
          title=''
          lang={lang.code}
          dir={lang.dir}
          picture={story.cover}
          playing={playing}
          artAt={MAGAZINE_ART}
          poster={`/atlas/covers/${story.slug}.webp`}
        />
        <p className='gtp-mag-cred' lang={lang.code} dir={lang.dir}>
          {name}
        </p>
        <p className='gtp-mag-folio'>
          <b>{pad(story.n)}</b>
          <span>Atlas</span>
          <span>{issueMonth(story.date)}</span>
        </p>
        <i className='gtp-mag-mottle' aria-hidden='true' />
        <i className='gtp-mag-grain' aria-hidden='true' />
      </div>
      {issue ? <PageCurl n={story.n} /> : null}
    </>
  );
}

/* Each issue folds its corner a little differently: the crease's slope (the
   fold's width and height against the peel, front-page.css) and which way
   its tip turns. `edge` is the curl's free edges, from one end of the crease
   round the tip to the other; `outline` closes them along the crease. */
const FOLDS = [
  {
    x: 1.08,
    y: 0.93,
    edge: 'M100 0 Q48 10 14 7 Q8 6 7 13 Q17 44 0 100',
    outline: 'M0 100 L100 0 Q48 10 14 7 Q8 6 7 13 Q17 44 0 100 Z',
  },
  {
    x: 0.94,
    y: 1.07,
    edge: 'M0 100 Q10 48 7 14 Q6 8 13 7 Q44 17 100 0',
    outline: 'M100 0 L0 100 Q10 48 7 14 Q6 8 13 7 Q44 17 100 0 Z',
  },
  {
    x: 1.03,
    y: 0.97,
    edge: 'M0 100 Q12 44 9 12 Q8 6 14 6 Q40 14 100 0',
    outline: 'M100 0 L0 100 Q12 44 9 12 Q8 6 14 6 Q40 14 100 0 Z',
  },
  {
    x: 0.96,
    y: 1.03,
    edge: 'M100 0 Q44 12 12 9 Q6 8 6 14 Q14 40 0 100',
    outline: 'M0 100 L100 0 Q44 12 12 9 Q6 8 6 14 Q14 40 0 100 Z',
  },
] as const;

/** The fold an issue's corner takes. */
const foldOf = (n: number) => FOLDS[n % FOLDS.length] ?? FOLDS[0];

/* The lifted corner as a page curls back: the back of the cover, pale paper
   tinted with the cover's color (--flap, paleOf), folded over the front along the
   fold. Its two free edges bow in unevenly and its tip rounds off, as a
   curled sheet's do; it catches the light just past the crease and dims
   toward the tip. The crease draws no line: the inside page under the fold
   is only a little shaded where the lifted paper keeps the light off it,
   and in the dark theme the curl lays a soft shade beside it. Drawn in a
   100 unit square that front-page.css sizes to the peel (--peel), so it
   grows with the lift. */
function PageCurl({ n }: { n: number }) {
  const id = useId().replace(/:/g, '');
  const { edge, outline } = foldOf(n);
  return (
    <svg
      className='gtp-mag-flap'
      viewBox='0 0 100 100'
      preserveAspectRatio='none'
      aria-hidden='true'
    >
      <defs>
        {/* the stops take their colors from front-page.css (.gtp-mag-flap stop) */}
        <linearGradient
          id={`${id}u`}
          className='gtp-mag-flap-under'
          gradientUnits='userSpaceOnUse'
          x1='50'
          y1='50'
          x2='100'
          y2='100'
        >
          <stop offset='0' />
          <stop offset='0.3' />
          <stop offset='1' />
        </linearGradient>
        <linearGradient
          id={`${id}b`}
          className='gtp-mag-flap-paper'
          gradientUnits='userSpaceOnUse'
          x1='50'
          y1='50'
          x2='6'
          y2='6'
        >
          <stop offset='0' />
          <stop offset='0.2' />
          <stop offset='0.62' />
          <stop offset='1' />
        </linearGradient>
        <filter id={`${id}s`} x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur stdDeviation='2.4' />
        </filter>
        {/* the curl's own side of the crease, so its shade falls on the cover and never across the crease */}
        <clipPath id={`${id}c`}>
          <path d='M-20 -20 L120 -20 L100 0 L0 100 L-20 120 Z' />
        </clipPath>
      </defs>
      <path d='M0 100 L100 0 L100 100 Z' fill={`url(#${id}u)`} />
      <g clipPath={`url(#${id}c)`}>
        <path
          className='gtp-mag-flap-cast'
          d={outline}
          transform='translate(3 3)'
          filter={`url(#${id}s)`}
        />
      </g>
      <path d={outline} fill={`url(#${id}b)`} />
      <path className='gtp-mag-flap-edge' d={edge} />
    </svg>
  );
}

/* The magazine's inside, under its front: Riffle's feature page on white
   uncoated stock, the story's title as the headline, its summary as the
   deck, the byline, and its opening paragraph in two columns with a drop cap
   in the story's accent; the folio at the foot. Only the corner the shelf
   lifts shows it, so its lower right is where the text runs. */
function InsidePage({
  story,
  title,
  lang,
  issue,
}: {
  story: BookStory;
  title: string;
  lang: Pick<Lang, 'code'>;
  issue: MagazineIssue;
}) {
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  // the story's own place and road in its accent, or in its cover's ink where it has none, so they stand clear of the sea
  const accent = spec.accent ?? spec.paper;
  return (
    <div
      className='gtp-mag-inside'
      style={
        {
          '--accent': accent,
          '--map-sea': spec.colors[0],
          '--map-ink': spec.paper,
        } as CSSProperties
      }
      aria-hidden='true'
    >
      <MapSheet
        sheet={issue.sheet}
        n={pad(story.n)}
        title={magazineName(story.slug, title, lang.code === 'en')}
        month={issueMonth(story.date)}
      />
      <i className='gtp-mag-mottle' aria-hidden='true' />
      <i className='gtp-mag-grain' aria-hidden='true' />
    </div>
  );
}

export default function Book({
  story,
  title,
  lang,
  playing,
  on = false,
  open = false,
  inside = false,
  className,
  style,
  decorative = false,
  onClick,
  format = 'book',
  issue,
}: Props) {
  const edition = useEdition();
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  const magazine = format === 'magazine';
  const vars = {
    '--board': spec.colors[0],
    '--band': spec.accent ?? spec.colors[1],
    '--ink': spec.paper,
    '--bd': `${bookDepth(format)}px`,
    '--flap': paleOf(spec.colors[0] ?? spec.paper),
    '--fold-x': foldOf(story.n).x,
    '--fold-y': foldOf(story.n).y,
    ...style,
  } as CSSProperties;
  return (
    <div
      className={['gtp-book', magazine ? 'gtp-mag' : null, className]
        .filter(Boolean)
        .join(' ')}
      data-on={on}
      data-open={open}
      style={vars}
      aria-hidden={decorative || undefined}
      onClick={onClick}
    >
      {inside ? (
        <div className='gtp-book-page'>
          <p className='gtp-page-title'>Contents</p>
          <ol>
            <li>
              <Link
                href={storyHref(edition, story.slug)}
                tabIndex={open ? 0 : -1}
              >
                <span>00</span>
                Opening
              </Link>
            </li>
            {(story.sections ?? []).map((section, i) => (
              <li key={section.id}>
                <Link
                  href={`${storyHref(edition, story.slug)}#${section.id}`}
                  tabIndex={open ? 0 : -1}
                >
                  <span>{pad(i + 1)}</span>
                  {section.text}
                </Link>
              </li>
            ))}
          </ol>
          <p className='gtp-page-foot'>
            {story.minutes} minutes
            {story.figureCount ? `, ${story.figureCount} figures` : ''}
          </p>
        </div>
      ) : null}

      <div className='gtp-book-board'>
        <div className='gtp-book-front'>
          {magazine ? (
            <MagazinePage
              story={story}
              title={title}
              lang={lang}
              playing={playing}
              issue={issue}
            />
          ) : (
            <>
              <Cover
                slug={story.slug}
                title={title}
                lang={lang.code}
                dir={lang.dir}
                picture={story.cover}
                playing={playing}
              />
              <span className='gtp-book-hinge' />
            </>
          )}
          <span className='gtp-book-sheen' />
        </div>
        {inside ? (
          <div className='gtp-book-inside'>
            <dl>
              <dt>Press</dt>
              <dd>Atlas</dd>
              <dt>By</dt>
              <dd>{story.authors.join(', ')}</dd>
              {story.date ? (
                <>
                  <dt>Published</dt>
                  <dd>{story.date}</dd>
                </>
              ) : null}
              <dt>Filed from</dt>
              <dd>San Francisco, {dmsPair(story.dateline)}</dd>
              <dt>Set in</dt>
              <dd>Katagami Text, Serif and Mono</dd>
              <dt>Cover</dt>
              <dd>Fluid Energy, from Glyphfield</dd>
            </dl>
          </div>
        ) : null}
      </div>

      <div className='gtp-book-face gtp-book-back'>
        <p>{story.summary}</p>
        <Seal size={64} className='gtp-book-seal' />
        <span className='gtp-book-back-line'>{dmsPair(story.dateline)}</span>
      </div>
      <div className='gtp-book-face gtp-book-spine'>
        {magazine ? (
          // printed as a perfect-bound magazine's spine: the issue's number and name, then Atlas and the month at the foot
          <>
            <b>{pad(story.n)}</b>
            <span
              className='gtp-mag-spine-name'
              lang={lang.code}
              dir={lang.dir}
            >
              {magazineName(story.slug, title, lang.code === 'en')}
            </span>
            <span>Atlas</span>
            <span>{issueMonth(story.date)}</span>
          </>
        ) : (
          <>
            <span
              className='gtp-book-spine-title'
              lang={lang.code}
              dir={lang.dir}
            >
              {bookTitle(title, lang.code)}
            </span>
            <span className='gtp-book-spine-by'>
              {story.authors.join(', ')}
            </span>
          </>
        )}
      </div>
      <div className='gtp-book-face gtp-book-fore' />
      <div className='gtp-book-face gtp-book-head' />
      <div className='gtp-book-face gtp-book-tail' />
    </div>
  );
}
