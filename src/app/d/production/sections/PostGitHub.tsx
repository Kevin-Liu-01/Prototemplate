import { SiGithub } from '@icons-pack/react-simple-icons';

/**
 * PRODUCTION · the repository button two posts carry, ported from live's
 * apps/landing/src/components/blog/GitHub.tsx (GitHubRepositoryLink over
 * the design system's outline Button). Live server-renders the known
 * minimum, 1.0k, and then asks its own /api/github-stars for the current
 * count. This mirror makes no call to a GT service, so the label is the
 * count a visitor read on 2026-10-15.
 */
export default function PostGitHub() {
  return (
    <div className='pba-github not-prose'>
      <a className='pba-github-link' href='https://github.com/generaltranslation/gt' rel='noopener noreferrer' target='_blank'>
        <SiGithub aria-hidden='true' size={16} />
        <span className='sr-only'>View General Translation on GitHub: </span>
        <span>generaltranslation/gt</span>
        <span className='pba-github-count'>
          <span>1.1k</span>
        </span>
      </a>
    </div>
  );
}
