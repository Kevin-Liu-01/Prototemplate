import { BLOG_POSTS, BLOG_RELEASES } from '@/lib/blog-posts';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import BlogViewer from './BlogViewer';

/** GT publishes the posts and serves their feed; the index points at it rather than syndicating them from a second domain. */
const GT_FEED = 'https://generaltranslation.com/rss.xml';

const route = seoRoute({
  path: '/blog',
  title: PAGE_NAMES.blog.name,
  kind: 'page',
  description: `The General Translation blog as published: ${BLOG_POSTS.length} posts and a changelog of ${BLOG_RELEASES.length} releases, kept here with their sources.`,
  feed: GT_FEED,
});

export const metadata = route.metadata;

/** /blog: the posts and the changelog on the viewer shell (BlogViewer). */
export default function BlogIndexPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <BlogViewer updated={requireUpdated('/blog')} />
    </>
  );
}
