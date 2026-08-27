import { notFound } from 'next/navigation';

import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import BlogArticle from '../../../singularity/company-sections/BlogArticle';
import { ALL_POSTS, findPost } from '../../../singularity/company-sections/posts';
import SiteFooter from '../../../singularity/sections/SiteFooter';
import TopNav from '../../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../../singularity/sections/logos-icons.css';
import '../../../singularity/styles.css';
import '../../../singularity/company-sections/company.css';
import '../../../singularity/company-sections/blog-article.css';
import '../../styles.css';

import type { Metadata } from 'next';

type Params = { params: Promise<{ slug: string }> };

/** Every filed post gets a static article; anything else falls through to 404. */
export function generateStaticParams(): { slug: string }[] {
  return ALL_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  return {
    title: post
      ? `${post.title} — Blog — Dossier — GT Redesign`
      : 'Blog — Dossier — GT Redesign',
    description: post?.summary,
    icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  };
}

/**
 * A single blog post — the article the dossier's index has been linking out
 * to. The shell is the same one every Dossier company page runs; the
 * article itself is the shared section under
 * ../../../singularity/company-sections, so the other finals can mount it
 * from their own /blog/[slug] route unchanged.
 */
export default async function SingularityDossierBlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <BlogArticle post={post} />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
