import type { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import PostAuthors from '@/components/blog/PostAuthors';
import PostCover from '@/components/blog/PostCover';
import { getAuthors, getPost, getPosts, type Post } from '@/lib/blog';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { mdxComponents } from '../mdx-components';
import { postCard } from '../post-card';

import '../blog.css';

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
 * /blog/[slug] renders one post from content/blog with the components the
 * posts use. The MDX is compiled the way the landing site compiles it
 * (next-mdx-remote with JavaScript expressions blocked), so a post reads
 * the same here as there.
 */
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const authors = getAuthors(post.authors);
  return (
    <main className='blog-root'>
      <JsonLd nodes={postRoute(post).jsonLd} />
      <article className='blog-article'>
        <header className='blog-article-head'>
          <p className='blog-crumb'>
            <Link href='/blog'>Blog</Link>
            {post.tags[0] ? <span> / {post.tags[0]}</span> : null}
          </p>
          <h1>{post.title}</h1>
          <p className='blog-lead'>{post.summary}</p>
          <PostAuthors authors={authors} date={post.date} />
          <PostCover post={post} priority />
        </header>
        <div className='blog-body'>
          <MDXRemote
            source={post.body}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
          />
        </div>
        <footer className='blog-article-foot'>
          <Link href='/graphics'>Every illustration in this series, with how it was made</Link>
        </footer>
      </article>
    </main>
  );
}
