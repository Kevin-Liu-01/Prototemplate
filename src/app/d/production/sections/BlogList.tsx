import BlogHeroBoard from './BlogHeroBoard';
import BlogPostBoard from './BlogPostBoard';
import { getBlogCategory, POSTS, RELEASES } from './blog-index-data';
import FlapPhrase from './FlapPhrase';
import UpdatesBoard from './UpdatesBoard';

/**
 * The blog index, section for section as the shipped page composes it
 * (apps/landing/src/components/blog/BlogList.tsx): the terminus masthead,
 * the changelog departures board, then the essays deck.
 *
 * The shipped list reads the two content trees off disk and resolves the
 * request locale; this control reads the vendored fixture in
 * blog-index-data.ts and renders the en-US resolution.
 */
export default function BlogList() {
  const posts = POSTS.map((post) => ({
    ...post,
    category: getBlogCategory(post),
  }));

  return (
    <>
      {/* The masthead is a terminus board: the flap field runs behind
          the copy, and the headline itself lands on flap cells. */}
      <section className='tc-sec blog-hero'>
        <BlogHeroBoard>
          <h1 id='blog-index-title'>
            <FlapPhrase text='Blog' flash={false} />
          </h1>
        </BlogHeroBoard>
      </section>

      {/* Updates run horizontally across the top — the departures board.
          The shipped DevlogList renders nothing without releases; the
          fixture always has them, and this guard keeps that rule. */}
      {RELEASES.length > 0 && <UpdatesBoard releases={RELEASES} />}

      <section className='tc-sec blog-essays'>
        <h2 className='sr-only'>Blog</h2>
        <BlogPostBoard posts={posts} />
      </section>
    </>
  );
}
