import type { Author } from '@/lib/blog';
import { formatDate } from '@/lib/blog';

/** The byline: avatars stacked in author order (the first on top), the names, the date. */
export default function PostAuthors({ authors, date }: { authors: readonly Author[]; date: string }) {
  const withAvatars = authors.filter((author) => author.avatar);
  return (
    <p className='blog-byline'>
      {withAvatars.length > 0 ? (
        <span aria-hidden='true' className='blog-byline-avatars'>
          {withAvatars.map((author, i) => (
            <img key={author.slug} src={author.avatar} alt='' width={22} height={22} style={{ zIndex: withAvatars.length - i }} />
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
