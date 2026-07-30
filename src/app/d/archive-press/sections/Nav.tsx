import Image from 'next/image';

/** Mono uppercase rule across the top. It fades out while the story is pinned. */
export default function Nav() {
  return (
    <nav className='ap-nav' data-ap-nav aria-label='Main'>
      <a className='ap-nav-mark' href='#top'>
        <Image
          src='/brand/no-bg-gt-logo-dark.png'
          alt='General Translation'
          width={44}
          height={44}
        />
        <span>General Translation</span>
      </a>
      <div className='ap-nav-links'>
        <a href='#features'>Docs</a>
        <a href='#pricing'>Pricing</a>
        <a href='#review'>Enterprise</a>
        <a href='#story'>Blog</a>
      </div>
      <div className='ap-nav-cta'>
        <a href='#pricing'>Sign In</a>
        <a className='solid' href='#closing'>
          Get a Demo
        </a>
      </div>
    </nav>
  );
}
