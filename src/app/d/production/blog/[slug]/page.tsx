import { redirect } from 'next/navigation';

import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import ProdFooter from '../../sections/ProdFooter';
import ProdNav from '../../sections/ProdNav';

import BlogArticle from '../../sections/BlogArticle';
import BlogPostBody from '../../sections/BlogPostBody';
import BlogArticleNotFound, {
  type BlogSuggestion,
} from '../../sections/BlogArticleNotFound';
import {
  ALL_POSTS,
  findPost,
  postTypeOf,
} from '../../sections/blog-article-data';
import { suggestSlug } from '../../sections/blog-article-model';
import { readPostSource } from '../../sections/blog-post-source';

import '../../../toolchain/sections/logos-icons.css';
import '../../../toolchain/styles.css';
import '../../../_v0/v0-pages.css';
import '../../sections/blog-article.css';

import type { Metadata } from 'next';

/** This route's own prefix. The server cannot read usePathname, and only
    /d/production mounts this file, so the redirect target is spelled here;
    every link inside the article resolves against the live pathname. */
const BASE = '/d/production';

type Params = { params: Promise<{ slug: string }> };

/** Every filed post gets a static article. */
export function generateStaticParams(): { slug: string }[] {
  return ALL_POSTS.map((post) => ({ slug: post.slug }));
}

/* Each post's canonical is its generaltranslation.com/en-US/blog URL, from
   the policy, and a post filed without a summary is described by its title;
   an unknown slug takes kind error (noindex, no canonical). */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  const route = post
    ? seoRoute({
        path: `/d/production/blog/${post.slug}`,
        title: post.title,
        section: 'Shipped',
        kind: 'mirror',
        description: post.summary || `${post.title}: a post on the General Translation blog.`,
      })
    : seoRoute({
        path: `/d/production/blog/${slug}`,
        title: 'Post not found',
        section: 'Shipped',
        kind: 'error',
        description: 'No post on the shipped General Translation blog has this address.',
      });
  return route.metadata;
}

/**
 * PRODUCTION · a single blog post.
 *
 * /d/production is a CONTROL, not a direction: it reproduces the shipped
 * generaltranslation.com so a reviewer can hold a proposal beside the thing
 * it replaces. This route reproduces the shipped article page.
 *
 * The body is the post's MDX, vendored in content/production and compiled
 * on the server as live compiles it (BlogPostBody), then handed to the
 * client article as rendered nodes.
 *
 * The chrome is the one this control's landing page already runs, ProdNav
 * over the ruled column and ProdFooter closing it, because that is what the
 * shipped site does: the blog article inherits the site's own header and
 * footer from the blog layout, not a page-specific shell.
 *
 * Six old slugs never reach this page: the knowledge base articles that
 * replaced them name them in redirectFrom, live answers each with a 308 to
 * the article, and next.config.ts sends them to the live article because
 * the knowledge base is not mirrored.
 *
 * Any other slug no post owns follows the shipped ladder rather than 404ing: a
 * confident match (normalized-exact, or a near miss clearly ahead of the
 * runner-up) redirects to the live slug, and everything else renders the
 * blog's own not-found shell with the closest posts. The shipped route has
 * one rung this control does not: an alias hit, for a retitled post. No post
 * in the content tree declares `aliases`, so there is nothing to carry.
 */
export default async function ProductionBlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = findPost(slug);
  const postType = post ? postTypeOf(post.slug) : undefined;
  const source = post && postType ? readPostSource(post.slug, postType) : null;

  let suggestions: BlogSuggestion[] = [];
  if (!post) {
    const match = suggestSlug(
      slug,
      ALL_POSTS.map((candidate) => candidate.slug)
    );
    if (match.redirect) redirect(`${BASE}/blog/${match.redirect}`);
    suggestions = match.suggestions.flatMap((suggested) => {
      const found = findPost(suggested);
      return found ? [{ slug: found.slug, title: found.title }] : [];
    });
  }

  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root' id='top'>
        <ProdNav />

        <main className='tc-rail pba-article'>
          {post && postType ? (
            <BlogArticle
              body={source ? <BlogPostBody source={source.body} /> : null}
              headerIntro={source?.header ? <BlogPostBody source={source.header} /> : null}
              headings={source?.headings ?? []}
              post={post}
              postType={postType}
            />
          ) : (
            <BlogArticleNotFound suggestions={suggestions} />
          )}
          <ProdFooter />
        </main>
      </div>
      <DirectionCorner slug='production' />
    </SmoothScroll>
  );
}
