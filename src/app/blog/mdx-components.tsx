import { Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from 'react';

import AuthorSpotlight from '@/components/blog/AuthorSpotlight';
import Callout from '@/components/blog/Callout';
import Carousel, { CarouselItem } from '@/components/blog/Carousel';
import FumadocsArchitecture from '@/components/blog/FumadocsArchitecture';
import GitHubLink from '@/components/blog/GitHubLink';
import HitList, { HitItem } from '@/components/blog/HitList';
import Video from '@/components/blog/Video';
import { BLOG_COLUMN_SIZES, isGif } from '@/lib/blog-image-sizes';

const SITE = 'https://generaltranslation.com';

/**
 * A link in a post. The posts were written for generaltranslation.com, so
 * a root-relative address that is not one of this site's blog or asset
 * paths points at the live site.
 */
function PostLink({ href = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith('/blog') || href.startsWith('#')) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  const target = href.startsWith('/') ? `${SITE}${href}` : href;
  return (
    <a href={target} rel='noreferrer' target='_blank' {...rest}>
      {children}
    </a>
  );
}

/**
 * A markdown image: the asset at its public path, lazy, served at the
 * column's device width (the masters are 3840px wide, and a browser-side
 * shrink softens them). Animated clips skip the optimizer.
 */
function PostImage({ src = '', alt = '' }: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== 'string' || !src) return null;
  return (
    <Image
      className='blog-image'
      src={src}
      alt={alt}
      width={1600}
      height={900}
      sizes={BLOG_COLUMN_SIZES}
      quality={95}
      unoptimized={isGif(src)}
    />
  );
}

type Components = NonNullable<MDXRemoteProps['components']>;

/** Everything the three posts reach for, under the names they use. */
export const mdxComponents: Components = {
  a: PostLink,
  img: PostImage,
  AuthorSpotlight,
  Callout,
  Carousel,
  CarouselItem,
  Check,
  FumadocsArchitecture,
  GitHub: GitHubLink,
  HitItem,
  HitList,
  Video,
  X,
};
