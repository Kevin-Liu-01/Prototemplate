'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import PostCover from '@/components/blog/PostCover';
import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { formatDay } from '@/lib/dates';
import type { PageUpdated } from '@/lib/page-updated';
import { PAGE_NAMES } from '@/lib/page-names';
import type { ShellMode } from '@/lib/shell-data';

import { CHANGELOG_ID, POSTS, SECTIONS, authorNames, findPost, postHref } from './model';

import './blog.css';

const MODES: readonly ShellMode[] = ['book'];

/** A divider in the book's grammar (.pt-book-sec): the section and one fact in the gutter, the title beside. */
function Divider({ n, fact, id, title }: { n: number; fact: string; id: string; title: string }) {
  return (
    <div className='pt-book-sec'>
      <small>
        <span>Section {n}</span>
        <span>{fact}</span>
      </small>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

export type PostViewerProps = {
  slug: string;
  /** the post's MDX, rendered on the server by src/app/blog/[slug]/page.tsx */
  body: ReactNode;
  /** reading minutes over the post's source, counted on the server */
  minutes: number;
  /** the post's entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * One post on the viewer shell: the posts as one numbered run under
 * Knowledge > Blog with this post's row marked, and the post as a book in
 * the flow sheet. The head carries the title, the summary as the lead, and
 * the date, the authors and the reading time in the panel. Section 1 is the
 * post (its cover, then its text with the components it uses), and section
 * 2 names its authors. Selecting another post navigates to its page; the
 * changelog row opens its section on the index.
 */
export default function PostViewer({ slug, body, minutes, updated }: PostViewerProps) {
  const router = useRouter();
  const row = findPost(slug) ?? POSTS[0];
  if (!row) return null;
  const { post, n } = row;

  const onSelect = (id: string) => {
    if (id === slug) return;
    if (id === CHANGELOG_ID) router.push(`/blog#${CHANGELOG_ID}`);
    else if (findPost(id)) router.push(postHref(id));
  };

  return (
    <ViewerShell
      id='blog'
      title={PAGE_NAMES.blog.name}
      mark='pt'
      count={`${POSTS.length} posts`}
      sections={SECTIONS}
      active={slug}
      modes={MODES}
      thumb='shot'
      surfaces='site'
      keys='flow'
      noun='post'
      onSelect={onSelect}
    >
      <Sheet variant='flow'>
        <div className='bl-post pt-book-col'>
          <BookHead
            title={post.title}
            lead={post.summary}
            updated={updated}
            facts={[
              { icon: 'post', key: 'Published', value: formatDay(post.date) },
              { icon: 'people', key: post.authors.length > 1 ? 'Authors' : 'Author', value: authorNames(post) },
              { icon: 'duration', key: 'Reading', value: `${minutes} min` },
            ]}
          />

          <section className='pt-book-part bl-doc' aria-labelledby='bl-post-h'>
            <Divider n={1} fact={`Post ${n} of ${POSTS.length}`} id='bl-post-h' title='Post' />
            <div className='bl-doc-row'>
              <div aria-hidden='true' />
              <div className='bl-doc-body'>
                <PostCover post={post} priority />
                <div className='blog-body'>{body}</div>
              </div>
            </div>
          </section>

          <section className='pt-book-part bl-doc' aria-labelledby='bl-authors-h'>
            <Divider
              n={2}
              fact={`${post.authors.length} ${post.authors.length > 1 ? 'authors' : 'author'}`}
              id='bl-authors-h'
              title={post.authors.length > 1 ? 'Authors' : 'Author'}
            />
            <div className='bl-doc-row'>
              <div aria-hidden='true' />
              <ul className='bl-authors'>
                {post.authors.map((author) => (
                  <li key={author.slug}>
                    {author.avatar ? (
                      <Image
                        src={author.avatar}
                        alt=''
                        width={40}
                        height={40}
                        quality={95}
                        unoptimized={!author.avatar.startsWith('/')}
                      />
                    ) : null}
                    <span>
                      <b>{author.name}</b>
                      {author.occupation || author.company ? (
                        <small>{[author.occupation, author.company].filter(Boolean).join(', ')}</small>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </Sheet>
    </ViewerShell>
  );
}
