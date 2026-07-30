import Image from 'next/image';

import ThemeToggle from '@/components/shared/ThemeToggle';

/** Slim, ruled, and quiet — the column's top edge more than a navigation bar. */
export default function TopNav() {
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
          <a href='#toolchain'>Blog</a>
          <a href='#toolchain'>Enterprise</a>
        </nav>

        <div className='tc-nav-right'>
          <ThemeToggle className='tc-nav-theme' />
          <a href='#pricing'>Sign in</a>
          <a className='tc-btn tc-btn-solid tc-btn-sm' href='#pricing'>
            Get a demo
          </a>
        </div>
      </div>
    </header>
  );
}
