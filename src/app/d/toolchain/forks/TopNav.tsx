import Image from 'next/image';

import { ThemeButton } from '@/components/viewer/ThemeButton';

type Props = {
  /** The in-page anchor the Blog link jumps to. */
  blogHref?: string;
  /** The in-page anchor the Enterprise link jumps to. */
  enterpriseHref?: string;
};

/** The forks' top bar: slim, ruled, and quiet, the column's top edge more than
    a navigation bar. Every link jumps to an anchor on the same page. */
export default function TopNav({ blogHref = '#platform', enterpriseHref = '#platform' }: Props) {
  return (
    <header className='tc-nav' data-tc-nav>
      <div className='tc-nav-in'>
        <a className='tc-nav-brand' href='#top'>
          <Image className='tc-logo-light' src='/brand/no-bg-gt-logo-light.png' alt='' width={22} height={22} />
          <Image className='tc-logo-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={22} height={22} />
          General Translation
        </a>

        <nav className='tc-nav-links'>
          <a href='#frameworks'>Docs</a>
          <a href='#pricing'>Pricing</a>
          <a href={blogHref}>Blog</a>
          <a href={enterpriseHref}>Enterprise</a>
        </nav>

        <div className='tc-nav-right'>
          <ThemeButton className='tc-nav-theme' />
          <a href='#pricing'>Sign in</a>
          <a className='tc-btn tc-btn-solid tc-btn-sm' href='#pricing'>
            Get a demo
          </a>
        </div>
      </div>
    </header>
  );
}
