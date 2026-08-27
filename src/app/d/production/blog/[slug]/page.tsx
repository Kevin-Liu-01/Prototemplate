import { redirect } from 'next/navigation';

import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../../_v0/V0Footer';
import V0Nav from '../../../_v0/V0Nav';

import BlogArticle from '../../sections/BlogArticle';
import BlogArticleNotFound, {
  type BlogSuggestion,
} from '../../sections/BlogArticleNotFound';
import {
  ALL_POSTS,
  findPost,
  postTypeOf,
} from '../../sections/blog-article-data';
import { suggestSlug } from '../../sections/blog-article-model';

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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found — Blog — Shipped — GT Redesign',
      robots: { index: false, follow: false },
      icons: { icon: '/brand/no-bg-gt-logo-light.png' },
    };
  }

  return {
    title: `${post.title} — Blog — Shipped — GT Redesign`,
    description: post.summary || undefined,
    icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  };
}

/**
 * PRODUCTION · a single blog post.
 *
 * /d/production is a CONTROL, not a direction: it reproduces the shipped
 * generaltranslation.com so a reviewer can hold a proposal beside the thing
 * it replaces. This route reproduces the shipped article page.
 *
 * The chrome is the one this control's landing page already runs — V0Nav
 * over the ruled column, V0Footer closing it — because that is what the
 * shipped site does: the blog article inherits the site's own header and
 * footer from the blog layout, not a page-specific shell.
 *
 * A slug no post owns follows the shipped ladder rather than 404ing: a
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
        <V0Nav />

        <main className='tc-rail pba-article'>
          {post && postType ? (
            <BlogArticle post={post} postType={postType} />
          ) : (
            <BlogArticleNotFound suggestions={suggestions} />
          )}
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
