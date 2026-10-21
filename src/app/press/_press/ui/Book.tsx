'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import type { StoryCard } from '../content';
import { dmsPair } from '../coords';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import { bookTitle } from '../titles';
import type { Lang } from '../stories';
import Cover from './Cover';
import Seal from './Seal';

export type BookStory = Pick<StoryCard, 'slug' | 'n' | 'authors' | 'cover' | 'summary' | 'minutes' | 'dateline'> &
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
  onClick?: () => void;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Every book is the same size and thickness, whatever the story's length. */
export function bookDepth(): number {
  return 24;
}

/* A story as a hardcover. The front board is hinged on the spine: its
   outside carries the live fluid and the title, its inside the colophon,
   and under it the first page holds the contents, each section a link into
   the article. The back carries the blurb and the seal; the spine takes the
   board color and carries the title and the authors; the three page edges
   are cream with the boards showing at their ends. The size comes from
   --bw and --bh and is the same for every story. */
export default function Book({ story, title, lang, playing, on = false, open = false, inside = false, className, style, onClick }: Props) {
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  const vars = {
    '--board': spec.colors[0],
    '--band': spec.accent ?? spec.colors[1],
    '--ink': spec.paper,
    '--bd': `${bookDepth()}px`,
    ...style,
  } as CSSProperties;
  return (
    <div
      className={['gtp-book', className].filter(Boolean).join(' ')}
      data-on={on}
      data-open={open}
      style={vars}
      onClick={onClick}
    >
      {inside ? (
        <div className='gtp-book-page'>
          <p className='gtp-page-title'>Contents</p>
          <ol>
            <li>
              <Link href={`/press/${story.slug}`} tabIndex={open ? 0 : -1}>
                <span>00</span>
                Opening
              </Link>
            </li>
            {(story.sections ?? []).map((section, i) => (
              <li key={section.id}>
                <Link href={`/press/${story.slug}#${section.id}`} tabIndex={open ? 0 : -1}>
                  <span>{pad(i + 1)}</span>
                  {section.text}
                </Link>
              </li>
            ))}
          </ol>
          <p className='gtp-page-foot'>
            {story.minutes} minutes{story.figureCount ? `, ${story.figureCount} figures` : ''}
          </p>
        </div>
      ) : null}

      <div className='gtp-book-board'>
        <div className='gtp-book-front'>
          <Cover
            slug={story.slug}
            title={title}
            lang={lang.code}
            dir={lang.dir}
            picture={story.cover}
            playing={playing}
          />
          <span className='gtp-book-hinge' />
          <span className='gtp-book-sheen' />
        </div>
        {inside ? (
          <div className='gtp-book-inside'>
            <dl>
              <dt>Press</dt>
              <dd>GT Atlas</dd>
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
        <span className='gtp-book-spine-title' lang={lang.code} dir={lang.dir}>
          {bookTitle(title, lang.code)}
        </span>
        <span className='gtp-book-spine-by'>{story.authors.join(', ')}</span>
      </div>
      <div className='gtp-book-face gtp-book-fore' />
      <div className='gtp-book-face gtp-book-head' />
      <div className='gtp-book-face gtp-book-tail' />
    </div>
  );
}
