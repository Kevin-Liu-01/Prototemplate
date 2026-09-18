import { SiGithub } from '@icons-pack/react-simple-icons';

const REPO = 'generaltranslation/gt';

/** The repository chip the posts drop in with `<GitHub />`. */
export default function GitHubLink() {
  return (
    <p className='blog-github'>
      <a href={`https://github.com/${REPO}`} rel='noreferrer' target='_blank'>
        <SiGithub aria-hidden='true' size={16} />
        <span>{REPO}</span>
        <span className='blog-github-meta'>on GitHub</span>
      </a>
    </p>
  );
}
