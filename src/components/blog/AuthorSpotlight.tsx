import { SiGithub } from '@icons-pack/react-simple-icons';

import { getAuthor } from '@/lib/blog';

/**
 * The contributor card the Fuma Nama post opens with: the GitHub portrait,
 * the name, the one-line bio from the author file, and the project and
 * GitHub links. The author is a slug into content/authors.
 */
export default function AuthorSpotlight({ author }: { author: string }) {
  const data = getAuthor(author);
  if (!data) return null;
  const profileUrl = data.github ? `https://github.com/${data.github}` : undefined;
  const portrait = data.github ? `https://avatars.githubusercontent.com/${data.github}?s=800` : data.avatar;
  const githubUrl = data.githubUrl ?? profileUrl;
  return (
    <section className='blog-spotlight' data-testid='author-spotlight'>
      {portrait ? (
        <a className='blog-spotlight-portrait' href={profileUrl} rel='noreferrer' target='_blank'>
          <img src={portrait} alt={data.name} loading='lazy' decoding='async' />
        </a>
      ) : null}
      <div className='blog-spotlight-copy'>
        <h3>{data.name}</h3>
        {data.bio ? <p>{data.bio}</p> : null}
        <p className='blog-spotlight-links'>
          {data.project && data.projectUrl ? (
            <a href={data.projectUrl} rel='noreferrer' target='_blank'>
              {data.projectIcon ? <img src={data.projectIcon} alt='' width={20} height={20} /> : null}
              <span>{data.project}</span>
            </a>
          ) : null}
          {githubUrl ? (
            <a href={githubUrl} rel='noreferrer' target='_blank'>
              <SiGithub aria-hidden='true' size={16} />
              <span>GitHub</span>
            </a>
          ) : null}
        </p>
      </div>
    </section>
  );
}
