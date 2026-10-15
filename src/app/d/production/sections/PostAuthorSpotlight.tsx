import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useId, type ReactNode } from 'react';

import { getAuthor } from '@/lib/blog';

import { bayerTile } from './pricing-bayer';

/**
 * PRODUCTION · the contributor card two posts carry, ported from live's
 * apps/landing/src/components/blog/AuthorSpotlight.tsx: the GitHub
 * portrait under four Bayer dither bands, the name, the bio (the author
 * file's body, or the post's own words), and the project and GitHub links.
 * The author file is content/authors/<slug>.mdx, which this repository
 * already carries for its own blog and which matches the content
 * repository's copy byte for byte.
 */

const ditherBands = [
  { cover: 1, start: 44, end: 51 },
  { cover: 3, start: 51, end: 58 },
  { cover: 6, start: 58, end: 65 },
  { cover: 10, start: 65, end: 72 },
] as const;

const ditherCell = 2;
const ditherTile = ditherCell * 4;
const ditherSlope = 30;

function PortraitDither({ id }: { id: string }) {
  return (
    <svg aria-hidden='true' className='author-spotlight-dither'>
      <defs>
        {ditherBands.map(({ cover }) => (
          <pattern height={ditherTile} id={`${id}-${cover}`} key={cover} patternUnits='userSpaceOnUse' width={ditherTile}>
            <path d={bayerTile(cover, ditherCell)} data-dither-cover={cover} shapeRendering='crispEdges' />
          </pattern>
        ))}
      </defs>
      {ditherBands.map(({ cover, start, end }) => (
        <rect
          fill={`url(#${id}-${cover})`}
          height='100%'
          key={cover}
          style={{
            clipPath: `polygon(${start}% 0, ${end}% 0, ${end + ditherSlope}% 100%, ${start + ditherSlope}% 100%)`,
          }}
          width='100%'
        />
      ))}
      <rect
        className='author-spotlight-dither-seal'
        height='100%'
        style={{ clipPath: 'polygon(72% 0, 100% 0, 100% 100%)' }}
        width='100%'
      />
    </svg>
  );
}

/** The simple-icons GitHub mark live's SocialIcon draws. */
function GithubMark() {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <title>GitHub</title>
      <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
    </svg>
  );
}

type Props = {
  /** Slug of an author file in content/authors. */
  author: string;
  /** Overrides the author's bio. */
  children?: ReactNode;
};

export default function PostAuthorSpotlight({ author, children }: Props) {
  const ditherId = `author-spotlight-${useId().replace(/:/g, '')}`;
  const data = getAuthor(author);
  if (!data?.name) return null;

  const profileUrl = data.github ? `https://github.com/${data.github}` : undefined;
  const portraitUrl = data.github ? `https://avatars.githubusercontent.com/${data.github}?s=1200` : data.avatar;
  const githubUrl = data.githubUrl ?? profileUrl;
  const description = children ?? (data.bio ? <MDXRemote source={data.bio} /> : null);

  const portrait = portraitUrl ? (
    <>
      <Image
        alt={data.name}
        className='author-spotlight-image'
        fill
        sizes='(max-width: 720px) calc(100vw - 40px), 340px'
        src={portraitUrl}
        unoptimized={!portraitUrl.startsWith('/')}
      />
      <PortraitDither id={ditherId} />
    </>
  ) : null;

  return (
    <section className='author-spotlight not-prose' data-testid='author-spotlight'>
      {profileUrl ? (
        <a className='author-spotlight-portrait' href={profileUrl} rel='noreferrer' target='_blank'>
          {portrait}
        </a>
      ) : (
        <div className='author-spotlight-portrait'>{portrait}</div>
      )}

      <div className='author-spotlight-copy'>
        <h3>{data.name}</h3>
        {description ? <div className='author-spotlight-description'>{description}</div> : null}

        <div className='author-spotlight-links'>
          {data.project && data.projectUrl ? (
            <a href={data.projectUrl} rel='noreferrer' target='_blank'>
              {data.projectIcon ? (
                <Image alt='' height={28} src={data.projectIcon} unoptimized={!data.projectIcon.startsWith('/')} width={28} />
              ) : null}
              <span>{data.project}</span>
            </a>
          ) : null}
          {githubUrl ? (
            <a href={githubUrl} rel='noreferrer' target='_blank'>
              <span className='author-spotlight-github-icon'>
                <GithubMark />
              </span>
              <span>GitHub</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
