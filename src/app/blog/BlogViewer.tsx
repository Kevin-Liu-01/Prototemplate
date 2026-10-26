'use client';

import Link from 'next/link';
import type { RefObject } from 'react';
import { useRef } from 'react';

import PostAuthors from '@/components/blog/PostAuthors';
import PostCover from '@/components/blog/PostCover';
import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { formatDay } from '@/lib/dates';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { rangeText } from '@/lib/shell-data';
import type { ShellMode } from '@/lib/shell-data';

import { AUTHOR_COUNT, CHANGELOG_ID, POSTS, RELEASES, SECTIONS, postHref, releaseHref } from './model';

import './blog.css';

const TITLE = PAGE_NAMES.blog.name;
const MODES: readonly ShellMode[] = ['book', 'grid'];
const LEAD = 'The posts and the changelog of the General Translation blog as they run on generaltranslation.com, kept here with their sources.';

const NOTE = (
  <p>
    Each post opens on its own page. Each release opens on the <Link href='/d/production/blog'>production mirror</Link>,
    which renders it as the live site does. Every illustration in the posts is on <Link href='/graphics'>the graphics page</Link>.
  </p>
);

/** The cover column in a row: the reading column less the gutter, so the optimizer serves the width it is shown at. */
const ROW_COVER_SIZES = '(max-width: 900px) 100vw, 720px';

type BlogBookProps = {
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the row jump, for a re-click on the active row in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active row, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

/**
 * The blog read top to bottom inside the flow sheet: the head with the
 * counts and a contents list, then two sections under their dividers. Posts
 * holds one ruled row per post (the number in the gutter, the title as the
 * link to the post, the summary, the byline and the cover). Changelog holds
 * one row per release (the headline, the packages and the date), each a
 * link to its page on the production mirror. The reading state is the
 * shared read line: the post row or the changelog under the line is
 * selected through the shell.
 */
function BlogBook({ sheetRef, jumpRef, activeOut, updated }: BlogBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.bl-spy', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const firstPost = POSTS[0]?.post.slug ?? '';

  return (
    <div className='bl-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={LEAD}
        note={NOTE}
        updated={updated}
        facts={[
          { icon: 'post', key: 'Posts', value: POSTS.length },
          { icon: 'queue-list', key: 'Releases', value: RELEASES.length },
          { icon: 'people', key: 'Authors', value: AUTHOR_COUNT },
        ]}
        contents={
          <nav className='bl-toc pt-book-toc' aria-label='Contents'>
            <a href={`#${firstPost}`} onClick={(e) => onContents(e, firstPost)}>
              <span>Posts</span>
              <small>{rangeText(POSTS)}</small>
            </a>
            <a href={`#${CHANGELOG_ID}`} onClick={(e) => onContents(e, CHANGELOG_ID)}>
              <span>Changelog</span>
              <small>{rangeText(RELEASES)}</small>
            </a>
          </nav>
        }
      />

      <section className='pt-book-part bl-cat' aria-labelledby='bl-posts'>
        <div className='pt-book-sec'>
          <small>
            <span>Section 1</span>
            <span>Posts {rangeText(POSTS)}</span>
          </small>
          <h2 id='bl-posts'>Posts</h2>
        </div>
        {POSTS.map(({ post, n }) => (
          <article
            key={post.slug}
            id={post.slug}
            className={cn('bl-row bl-spy', post.slug === active && 'is-active')}
            data-id={post.slug}
            aria-current={post.slug === active ? 'true' : undefined}
          >
            <div className='bl-n'>
              <b>{n}</b>
            </div>
            <div className='bl-body'>
              <h3>
                <Link href={postHref(post.slug)}>{post.title}</Link>
              </h3>
              <p>{post.summary}</p>
              <PostAuthors authors={post.authors} date={post.date} />
              <Link className='bl-cover' href={postHref(post.slug)} aria-hidden='true' tabIndex={-1}>
                <PostCover post={post} sizes={ROW_COVER_SIZES} />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section
        id={CHANGELOG_ID}
        className={cn('pt-book-part bl-cat bl-spy', active === CHANGELOG_ID && 'is-active')}
        data-id={CHANGELOG_ID}
        aria-labelledby='bl-changelog'
      >
        <div className='pt-book-sec'>
          <small>
            <span>Section 2</span>
            <span>Releases {rangeText(RELEASES)}</span>
          </small>
          <h2 id='bl-changelog'>Changelog</h2>
        </div>
        <ol className='bl-releases'>
          {RELEASES.map(({ release, n }) => (
            <li key={release.slug}>
              <Link className='bl-release' href={releaseHref(release.slug)} prefetch={false}>
                <span className='bl-release-n'>{n}</span>
                <span className='bl-release-body'>
                  <b>{release.headline}</b>
                  <code>{release.title}</code>
                </span>
                <time dateTime={release.date}>{formatDay(release.date)}</time>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export type BlogViewerProps = {
  /** the /blog entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The blog on the viewer shell: the posts as one numbered run under
 * Knowledge > Blog in the list with the changelog after them, the posts
 * and the releases as ruled rows inside the flow sheet, and every post as
 * its cover in the grid. Flow keys, so Space and the arrows scroll. A post
 * row in the list opens the post's page; the changelog row scrolls to its
 * section.
 */
export default function BlogViewer({ updated }: BlogViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(POSTS[0]?.post.slug ?? '');

  return (
    <ViewerShell
      id='blog'
      title={TITLE}
      mark='pt'
      count={`${POSTS.length} posts`}
      sections={SECTIONS}
      modes={MODES}
      thumb='shot'
      surfaces='site'
      keys='flow'
      noun='post'
      onSelect={(id) => {
        /* re-clicking the active row brings it back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <BlogBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
