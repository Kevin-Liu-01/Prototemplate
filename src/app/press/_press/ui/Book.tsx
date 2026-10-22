'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import type { StoryCard } from '../content';
import { dmsPair } from '../coords';
import { storyHref, useEdition } from '../edition';
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
  /** A hardcover (the shelf), or a thin magazine with its cover lines over the art (the rack). */
  format?: 'book' | 'magazine';
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Every book is the same size and thickness, whatever the story's length; a magazine is a few sheets. */
export function bookDepth(format: 'book' | 'magazine' = 'book'): number {
  return format === 'magazine' ? 5 : 24;
}

/** A magazine's cover line: the title as the story writes it, in sentence case; a title with a colon breaks there, the rest set under it. */
function MagazineTitle({ title, lang }: { title: string; lang: Pick<Lang, 'code' | 'dir'> }) {
  const split = /^(.+?)\s*[:：]\s*(.+)$/.exec(title);
  return (
    <p className='gtp-mag-title' lang={lang.code} dir={lang.dir}>
      {split ? split[1] : title}
      {split ? <span className='gtp-mag-sub'>{split[2]}</span> : null}
    </p>
  );
}

/** '2026-10-19' as a cover dates its issue: October 2026. */
function issueMonth(iso: string | undefined): string {
  const date = iso ? new Date(`${iso}T00:00:00Z`) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
}

/* A story as a hardcover. The front board is hinged on the spine: its
   outside carries the live fluid and the title, its inside the colophon,
   and under it the first page holds the contents, each section a link into
   the article. The back carries the blurb and the seal; the spine takes the
   board color and carries the title and the authors; the three page edges
   are cream with the boards showing at their ends. The size comes from
   --bw and --bh and is the same for every story. As a magazine (the rack's
   format) it is a few sheets thick, its art carries no title, and its own
   cover lines frame the art: the masthead over it, and under it the title,
   the issue and the authors on the cover's own color. */
export default function Book({ story, title, lang, playing, on = false, open = false, inside = false, className, style, onClick, format = 'book' }: Props) {
  const edition = useEdition();
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  const magazine = format === 'magazine';
  const vars = {
    '--board': spec.colors[0],
    '--band': spec.accent ?? spec.colors[1],
    '--ink': spec.paper,
    '--bd': `${bookDepth(format)}px`,
    ...style,
  } as CSSProperties;
  return (
    <div
      className={['gtp-book', magazine ? 'gtp-mag' : null, className].filter(Boolean).join(' ')}
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
              <Link href={storyHref(edition, story.slug)} tabIndex={open ? 0 : -1}>
                <span>00</span>
                Opening
              </Link>
            </li>
            {(story.sections ?? []).map((section, i) => (
              <li key={section.id}>
                <Link href={`${storyHref(edition, story.slug)}#${section.id}`} tabIndex={open ? 0 : -1}>
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
          {/* a magazine sets its own cover lines over the art, so the art carries no title */}
          <Cover
            slug={story.slug}
            title={magazine ? '' : title}
            lang={lang.code}
            dir={lang.dir}
            picture={story.cover}
            playing={playing}
          />
          {magazine ? (
            <div className='gtp-mag-cover'>
              <p className='gtp-mag-masthead'>Atlas</p>
              <div className='gtp-mag-lines'>
                <MagazineTitle title={title} lang={lang} />
                <p className='gtp-mag-foot'>
                  <span>
                    No. {pad(story.n)}, {issueMonth(story.date)}
                  </span>
                  <span>{story.authors.join(' and ')}</span>
                </p>
              </div>
            </div>
          ) : (
            <span className='gtp-book-hinge' />
          )}
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
        {magazine ? null : (
          <>
            <span className='gtp-book-spine-title' lang={lang.code} dir={lang.dir}>
              {bookTitle(title, lang.code)}
            </span>
            <span className='gtp-book-spine-by'>{story.authors.join(', ')}</span>
          </>
        )}
      </div>
      <div className='gtp-book-face gtp-book-fore' />
      <div className='gtp-book-face gtp-book-head' />
      <div className='gtp-book-face gtp-book-tail' />
    </div>
  );
}
