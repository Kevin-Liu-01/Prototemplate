import Image from 'next/image';

import type { Author } from '@/lib/blog';
import { formatDate } from '@/lib/blog';

/**
 * The byline: avatars stacked in author order (the first on top), the names, the date.
 * The avatars go through next/image, so a 1600px portrait reaches the reader as a
 * file near its 22px box; a remote avatar (a GitHub URL) is passed through as it is.
 */
export default function PostAuthors({ authors, date }: { authors: readonly Author[]; date: string }) {
  const avatars = authors.flatMap((author) => (author.avatar ? [{ slug: author.slug, src: author.avatar }] : []));
  return (
    <p className='blog-byline'>
      {avatars.length > 0 ? (
        <span aria-hidden='true' className='blog-byline-avatars'>
          {avatars.map((avatar, i) => (
            <Image
              key={avatar.slug}
              src={avatar.src}
              alt=''
              width={22}
              height={22}
              unoptimized={!avatar.src.startsWith('/')}
              style={{ zIndex: avatars.length - i }}
            />
          ))}
        </span>
      ) : null}
      <span>{authors.map((author) => author.name).join(', ')}</span>
      <span className='blog-byline-dot' aria-hidden='true'>
        ·
      </span>
      <time dateTime={date}>{formatDate(date)}</time>
    </p>
  );
}
