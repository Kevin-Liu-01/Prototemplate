import Image from 'next/image';

import BlogFeatureDither, { motifFor } from './BlogFeatureDither';

import type { IndexPost } from './blog-index-data';

/**
 * A card's cover: the post's own image where the frontmatter carries one,
 * the Bayer motif plate where it does not.
 *
 * Ported from apps/landing/src/components/blog/BlogPostCover.tsx.
 */

/* PORT NOTE: the frontmatter's image path carries a cache-buster query
   ("…png?v=8704532b"). next/image rejects a local src with a search
   string unless images.localPatterns allows it, which the landing app's
   next.config.ts does and this prototype's does not. The query is a
   deploy artifact, not content, so it is dropped here rather than
   reaching into shared config — the served bytes and the rendered
   markup are the same either way. */
function localSrc(image: string): string {
  const query = image.indexOf('?');
  return query === -1 ? image : image.slice(0, query);
}
export default function BlogPostCover({
  post,
  id,
  className,
  scale,
  priority = false,
  sizes = '100vw',
}: {
  post: Pick<IndexPost, 'slug' | 'title' | 'tags' | 'images' | 'imagesLight'>;
  id: string;
  className?: string;
  scale?: number;
  priority?: boolean;
  sizes?: string;
}) {
  const image = post.images?.[0];
  const imageLight = post.imagesLight?.[0];

  if (!image) {
    return (
      <BlogFeatureDither
        motif={motifFor(post)}
        id={id}
        className={className}
        scale={scale}
      />
    );
  }

  // Dithered artwork ships as webp and smears at the default 75; the
  // PNG covers of older posts keep the default.
  const quality = (src: string) =>
    /\.webp(?:\?|$)/.test(src) ? 95 : undefined;
  const classes = `blog-dither-cover blog-post-cover${className ? ` ${className}` : ''}`;

  if (!imageLight) {
    return (
      <Image
        src={localSrc(image)}
        alt=''
        width={960}
        height={540}
        sizes={sizes}
        quality={quality(image)}
        priority={priority}
        className={classes}
      />
    );
  }

  // A post with a light-theme cover keeps both in the document;
  // blog-index.css shows the one for the current theme. The dark cover
  // takes the priority fetch and the light one loads lazily, so the
  // hidden twin of a dark page is never fetched.
  return (
    <>
      <Image
        src={localSrc(image)}
        alt=''
        width={960}
        height={540}
        sizes={sizes}
        quality={quality(image)}
        priority={priority}
        className={`${classes} blog-post-cover-dark`}
      />
      <Image
        src={localSrc(imageLight)}
        alt=''
        width={960}
        height={540}
        sizes={sizes}
        quality={quality(imageLight)}
        className={`${classes} blog-post-cover-light`}
      />
    </>
  );
}
