'use client';

import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * PRODUCTION · the blog's own not-found — a port of BlogSlugNotFound, the
 * branch the shipped route renders when no post owns the slug
 * (apps/landing/src/app/[locale]/blog/[slug]/page.tsx).
 *
 * A missing post never dead-ends on a generic 404 there, and it does not
 * here: the article shell keeps its rail and its back link, the copy column
 * says what happened, the closest posts are offered when the matcher found
 * any, and a Back to Blog outline CTA closes it. No cover, no contents rail,
 * no post footer — the shipped branch renders the header alone.
 */

export type BlogSuggestion = { slug: string; title: string };

export default function BlogArticleNotFound({
  suggestions,
}: {
  suggestions: readonly BlogSuggestion[];
}) {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  return (
    <header className='pba-header'>
      <div className='pba-lead'>
        <div className='pba-lead-rail'>
          <a className='pba-back' href={`${base}/blog`}>
            <ArrowLeft aria-hidden='true' />
            Back
          </a>
        </div>

        <div className='pba-copy'>
          <h1>Post not found</h1>
          <p className='pba-summary'>
            This post does not exist. It may have moved or been renamed.
          </p>

          {suggestions.length > 0 ? (
            <div className='pba-miss'>
              <p className='pba-miss-ask'>Were you looking for one of these?</p>
              <ul className='pba-miss-list'>
                {suggestions.map((suggestion) => (
                  <li key={suggestion.slug}>
                    <a
                      className='pba-suggestion'
                      href={`${base}/blog/${suggestion.slug}`}
                    >
                      {suggestion.title || suggestion.slug}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className='pba-miss-cta'>
            <a className='tc-btn tc-btn-line' href={`${base}/blog`}>
              Back to Blog
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
