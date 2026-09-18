import type { Metadata } from 'next';
import Link from 'next/link';

import PostAuthors from '@/components/blog/PostAuthors';
import PostCover from '@/components/blog/PostCover';
import { getAuthors, getPosts } from '@/lib/blog';

import './blog.css';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'The docs-redesign series as General Translation published it: rewriting the docs for humans and agents, the Fuma Nama interview, and designing docs for humans, with every illustration.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** /blog lists the posts this repository keeps, newest first. */
export default function BlogIndexPage() {
  const posts = getPosts();
  return (
    <main className='blog-root'>
      <header className='blog-index-head'>
        <p className='blog-eyebrow'>General Translation blog</p>
        <h1>The docs redesign, in three posts</h1>
        <p className='blog-lead'>
          The posts as they ran on generaltranslation.com, kept here with their sources: the content rewrite for humans and
          agents, the interview with the creator of Fumadocs, and the design principles behind the redesign. Every
          illustration in them is on <Link href='/graphics'>the graphics page</Link>, and the toolchain that made them is in
          the repository.
        </p>
      </header>
      <ol className='blog-index'>
        {posts.map((post) => (
          <li key={post.slug} className='blog-card'>
            <Link href={`/blog/${post.slug}`} className='blog-card-cover'>
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
    </main>
  );
}
