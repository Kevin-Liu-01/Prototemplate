import Image from 'next/image';

import type { Post } from '@/lib/blog';
import { BLOG_COLUMN_SIZES } from '@/lib/blog-image-sizes';

type PostCoverProps = {
  post: Pick<Post, 'image' | 'imageLight'>;
  className?: string;
  /** the header cover loads first; cards load lazily */
  priority?: boolean;
  /** how wide the cover renders; the article column by default */
  sizes?: string;
};

/**
 * A post's cover. When the post has a light-theme cover too, both are in
 * the document and blog.css shows the one for the current theme
 * (html[data-theme='dark'] picks the dark one), so a theme switch swaps
 * covers without a request. The optimizer serves each at the width it is
 * shown, from the 3840px master, so the browser never resizes it.
 */
export default function PostCover({ post, className, priority = false, sizes = BLOG_COLUMN_SIZES }: PostCoverProps) {
  if (!post.image) return null;
  const classes = className ? ` ${className}` : '';
  const cover = (src: string, extra = '') => (
    <Image
      className={`blog-cover${extra}${classes}`}
      src={src}
      alt=''
      width={1920}
      height={1080}
      sizes={sizes}
      quality={95}
      priority={priority}
    />
  );
  if (!post.imageLight) return cover(post.image);
  return (
    <>
      {cover(post.image, ' blog-cover-dark')}
      {cover(post.imageLight, ' blog-cover-light')}
    </>
  );
}
