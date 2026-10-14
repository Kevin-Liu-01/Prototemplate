import Image from 'next/image';

/** An author as a byline needs it: content/authors/<slug>.mdx `name` and `avatar`. */
type BylineAuthor = {
  name: string;
  avatar?: string;
};

type PostAuthorsProps = {
  authors: readonly BylineAuthor[];
  variant: 'article' | 'card';
};

const variantStyles = {
  article: {
    avatar: 'size-[22px]',
    authors: 'inline-flex min-w-0 items-center gap-2',
    size: 22,
  },
  card: {
    avatar: 'size-[18px]',
    authors:
      'mt-auto inline-flex min-w-0 items-center gap-2 pt-4 text-[12.5px] text-(--tc-ink-3)',
    size: 18,
  },
} as const;

/**
 * A post's byline: the avatars stacked with the first author on top, then
 * every name joined by commas. One component serves the index cards and
 * the article header.
 *
 * Ported from apps/landing/src/components/blog/PostAuthors.tsx (gt-cloud
 * #4855, the co-author byline). The stack's overlap is an inline margin on
 * each later avatar, where the shipped file uses -space-x-1.5: Tailwind
 * margin utilities lose to the engine's element resets on a ported route.
 */
export default function PostAuthors({ authors, variant }: PostAuthorsProps) {
  if (authors.length === 0) return null;

  const styles = variantStyles[variant];
  const authorsWithAvatars = authors.filter(
    (author): author is Required<BylineAuthor> => Boolean(author.avatar)
  );

  return (
    <span className={styles.authors} data-testid='post-authors'>
      {authorsWithAvatars.length > 0 ? (
        <span aria-hidden='true' className='flex shrink-0'>
          {authorsWithAvatars.map((author, i) => (
            <Image
              key={author.name}
              src={author.avatar}
              alt=''
              width={styles.size}
              height={styles.size}
              className={`${styles.avatar} relative rounded-full object-cover ring-2 ring-(--tc-paper)`}
              // The first author sits on top of the stack; later ones tuck
              // behind, in reading order.
              style={{
                zIndex: authorsWithAvatars.length - i,
                marginInlineStart: i === 0 ? 0 : -6,
              }}
            />
          ))}
        </span>
      ) : null}
      <span>{authors.map((author) => author.name).join(', ')}</span>
    </span>
  );
}
