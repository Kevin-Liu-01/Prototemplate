'use client';

import { useId, useState } from 'react';

import BlogFeatureDither, { motifFor } from '@/app/d/production/sections/BlogFeatureDither';

import Plate from '../Plate';

import './artifacts.css';

/** A title as the blog would slug it: lowercase words joined by hyphens. */
function slugOf(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'post'
  );
}

/**
 * The blog's cover for a post that has no image: BlogFeatureDither draws
 * one word as an SVG mask over a ramp of Bayer coverage tiers, solid on
 * one flank and thinning to 12 of 64 on the other. motifFor picks the
 * word from the title (a release name, then a topic such as i18n,
 * Next.js or plurals, else 語), sizes it to the 400 by 225 plate and turns
 * the ramp by an angle seeded from the slug.
 */
export default function FallbackCoverDemo() {
  const inputId = useId();
  const coverId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [title, setTitle] = useState('How to handle plurals in React');
  const slug = slugOf(title);
  const motif = motifFor({ slug, title, tags: [] });

  return (
    <Plate
      controls={
        <>
          <div className='dmo-field dmo-field-wide'>
            <label className='dmo-field-label' htmlFor={inputId}>
              Post title
            </label>
            <input
              className='dmo-input dmo-input-wide'
              id={inputId}
              spellCheck={false}
              type='text'
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
            />
          </div>
          <p className='dmo-bar-status' role='status'>
            The word is <span className='dmo-num'>{motif.text}</span> at <span className='dmo-num'>{motif.size}</span> on the
            plate, with the ramp at <span className='dmo-num'>{motif.angle}</span> degrees.
          </p>
        </>
      }
      fit
      label={`The fallback cover for ${title || 'an untitled post'}`}
      tag={`motifFor({ slug: '${slug}' })`}
    >
      <div className='dmo-fc'>
        <BlogFeatureDither className='dmo-fc-cover' id={coverId} motif={motif} />
      </div>
    </Plate>
  );
}
