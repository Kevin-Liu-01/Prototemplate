import Link from 'next/link';

import PostAuthors from '@/components/blog/PostAuthors';
import PostCover from '@/components/blog/PostCover';
import { BookHead } from '@/components/viewer/BookView';
import { getAuthors, getPosts } from '@/lib/blog';
import { PAGE_NAMES } from '@/lib/page-names';
import { readingMinutes } from '@/lib/reading';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { pad2 } from '@/lib/shell-data';
import { requireUpdated } from '@/lib/updated';

import './blog.css';

/** GT publishes the posts and serves their feed; the index points at it rather than syndicating them from a second domain. */
const GT_FEED = 'https://generaltranslation.com/rss.xml';

const route = seoRoute({
  path: '/blog',
  title: PAGE_NAMES.blog.name,
  kind: 'page',
  description:
    'The docs-redesign series as General Translation published it: three posts on docs for humans and agents, kept here with their sources.',
  feed: GT_FEED,
});

export const metadata = route.metadata;

/**
 * /blog lists the posts this repository keeps, newest first, as a book in
 * the 720px column: the standard head (the panel counts the posts, their
 * authors and the reading time over their sources), the band, then one
 * section of post cards.
 */
export default function BlogIndexPage() {
  const posts = getPosts();
  const authors = new Set(posts.flatMap((post) => post.authors)).size;
  const minutes = readingMinutes(posts.map((post) => post.body).join('\n'));
  return (
    <main className='blog-root is-book'>
      <JsonLd nodes={route.jsonLd} />
      <div className='pt-book-col'>
        <BookHead
          title={PAGE_NAMES.blog.name}
          lead={
            <>
              The docs redesign in three posts, as they ran on generaltranslation.com, kept here with their sources.
              Every illustration in them is on <Link href='/graphics'>the graphics page</Link>.
            </>
          }
          updated={requireUpdated('/blog')}
          facts={[
            { icon: 'post', key: 'Posts', value: posts.length },
            { icon: 'people', key: 'Authors', value: authors },
            { icon: 'duration', key: 'Reading', value: `${minutes} min` },
          ]}
        />
        <section className='pt-book-part blog-list' aria-labelledby='blog-posts'>
          <div className='pt-book-sec'>
            <small>
              <span>Section 1</span>
              <span>
                Posts {pad2(1)} to {pad2(posts.length)}
              </span>
            </small>
            <h2 id='blog-posts'>Posts</h2>
          </div>
          <ol className='blog-index'>
            {posts.map((post) => (
              <li key={post.slug} className='blog-card'>
                <Link href={`/blog/${post.slug}`} className='blog-card-cover' aria-hidden='true' tabIndex={-1}>
                  <PostCover post={post} />
                </Link>
                <div className='blog-card-copy'>
                  <h2>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p>{post.summary}</p>
                  <PostAuthors authors={getAuthors(post.authors)} date={post.date} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
