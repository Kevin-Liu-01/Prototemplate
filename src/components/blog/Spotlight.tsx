import { SiGithub } from '@icons-pack/react-simple-icons';
import Image from 'next/image';
import { useId, type ReactNode } from 'react';

import { bayerTile } from '@/app/d/production/sections/pricing-bayer';

/** Four Bayer bands that slant across the portrait, each a step denser, then a solid seal at its right edge. */
const DITHER_BANDS = [
  { cover: 1, start: 44, end: 51 },
  { cover: 3, start: 51, end: 58 },
  { cover: 6, start: 58, end: 65 },
  { cover: 10, start: 65, end: 72 },
] as const;

const DITHER_CELL = 2;
const DITHER_TILE = DITHER_CELL * 4;
const DITHER_SLOPE = 30;

type SpotlightProps = {
  name: string;
  /** the person's own page, which the portrait and the name link to */
  href: string;
  /** the portrait: a public path or a GitHub avatar address */
  image: string;
  project: string;
  projectUrl: string;
  projectIcon?: string;
  githubUrl: string;
  /** the post's one line about the person */
  children?: ReactNode;
};

function PortraitDither({ id }: { id: string }) {
  return (
    <svg aria-hidden='true' className='spotlight-dither'>
      <defs>
        {DITHER_BANDS.map(({ cover }) => (
          <pattern height={DITHER_TILE} id={`${id}-${cover}`} key={cover} patternUnits='userSpaceOnUse' width={DITHER_TILE}>
            <path d={bayerTile(cover, DITHER_CELL)} data-dither-cover={cover} shapeRendering='crispEdges' />
          </pattern>
        ))}
      </defs>
      {DITHER_BANDS.map(({ cover, start, end }) => (
        <rect
          fill={`url(#${id}-${cover})`}
          height='100%'
          key={cover}
          style={{ clipPath: `polygon(${start}% 0, ${end}% 0, ${end + DITHER_SLOPE}% 100%, ${start + DITHER_SLOPE}% 100%)` }}
          width='100%'
        />
      ))}
      <rect className='spotlight-dither-seal' height='100%' style={{ clipPath: 'polygon(72% 0, 100% 0, 100% 100%)' }} width='100%' />
    </svg>
  );
}

/** The optimizer serves files under public/ only; a remote portrait loads as it is. */
const isLocal = (src: string) => src.startsWith('/');

/**
 * The person card a grantee post carries (gt-cloud #5567, which replaced
 * AuthorSpotlight): the portrait under four dither bands, the name, the
 * post's line about them, and the project and GitHub links. Every field is
 * a string attribute on the MDX element, so the card needs no author file.
 * It renders the landing site's markup and class names; /blog dresses them
 * in blog.css and the production mirror in blog-article.css.
 */
export default function Spotlight({ name, href, image, project, projectUrl, projectIcon, githubUrl, children }: SpotlightProps) {
  const ditherId = `spotlight-${useId().replace(/:/g, '')}`;
  return (
    <section className='spotlight not-prose' data-testid='spotlight'>
      <a className='spotlight-portrait' href={href} rel='noreferrer' target='_blank'>
        <Image
          alt={name}
          className='spotlight-image'
          fill
          sizes='(max-width: 720px) calc(100vw - 40px), 340px'
          src={image}
          unoptimized={!isLocal(image)}
        />
        <PortraitDither id={ditherId} />
      </a>
      <div className='spotlight-copy'>
        <h3>
          <a href={href} rel='noreferrer' target='_blank'>
            {name}
          </a>
        </h3>
        {children ? <div className='spotlight-description'>{children}</div> : null}
        <div className='spotlight-links'>
          <a href={projectUrl} rel='noreferrer' target='_blank'>
            {projectIcon ? <Image alt='' height={28} src={projectIcon} unoptimized={!isLocal(projectIcon)} width={28} /> : null}
            <span>{project}</span>
          </a>
          <a href={githubUrl} rel='noreferrer' target='_blank'>
            <span className='spotlight-github-icon'>
              <SiGithub aria-hidden='true' />
            </span>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
}
