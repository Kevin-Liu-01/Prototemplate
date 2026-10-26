import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { getAuthors, getPost, getPosts, type Post } from '@/lib/blog';
import { readingMinutes } from '@/lib/reading';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { mdxComponents } from '../mdx-components';
import { postCard } from '../post-card';
import PostViewer from '../PostViewer';

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

/**
 * The head of one post. The post is GT's: generaltranslation.com publishes
 * the same file, so the policy gives it GT's URL as its canonical (each
 * one answered 200 on 2026-10-15) and the BlogPosting names that URL. It
 * keeps the card GT made for it.
 */
function postRoute(post: Post) {
  return seoRoute({
    path: `/blog/${post.slug}`,
    title: post.title,
    section: 'Blog',
    kind: 'post',
    description: post.summary,
    crumbs: [{ name: 'Blog', path: '/blog' }],
    published: post.date,
    authors: getAuthors(post.authors).map((author) => author.name),
    image: post.ogImage ? postCard(post.ogImage, post.title) : undefined,
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return postRoute(post).metadata;
}

/**
 * /blog/[slug] renders one post from content/blog on the viewer shell
 * (PostViewer). The MDX is compiled here on the server the way the landing
 * site compiles it (next-mdx-remote with JavaScript expressions blocked),
 * so a post reads the same here as there, and the client receives elements.
 */
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return (
    <>
      <JsonLd nodes={postRoute(post).jsonLd} />
      <PostViewer
        key={slug}
        slug={slug}
        minutes={readingMinutes(post.body)}
        updated={requireUpdated(`/blog/${slug}`)}
        body={
          <MDXRemote
            source={post.body}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
          />
        }
      />
    </>
  );
}
