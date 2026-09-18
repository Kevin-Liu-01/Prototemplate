import type { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import PostAuthors from '@/components/blog/PostAuthors';
import PostCover from '@/components/blog/PostCover';
import { getAuthors, getPost, getPosts } from '@/lib/blog';

import { mdxComponents } from '../mdx-components';

import '../blog.css';

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Blog' };
  return {
    title: post.title,
    description: post.summary,
    openGraph: post.ogImage ? { images: [{ url: post.ogImage }] } : undefined,
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
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
      <article className='blog-article'>
        <header className='blog-article-head'>
          <p className='blog-eyebrow'>
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
