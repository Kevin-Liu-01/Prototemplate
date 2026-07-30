import Image from 'next/image';

/** Slim drafting-rail nav. In Act II a proxy of this bar morphs into the dock. */
export default function Nav() {
  return (
    <nav className='ba-nav' data-ba-nav aria-label='Main'>
      <a className='ba-nav-logo' href='#top'>
        <Image
          className='ba-logo-img'
          src='/brand/no-bg-gt-logo-dark.png'
          alt='General Translation'
          width={52}
          height={52}
          priority
        />
        General Translation
      </a>
      <div className='ba-nav-links'>
        <a href='#docs'>Docs</a>
        <a href='#pricing'>Pricing</a>
        <a href='#enterprise'>Enterprise</a>
        <a href='#blog'>Blog</a>
      </div>
      <div className='ba-nav-cta'>
        <a className='ba-btn ba-nav-ghost' href='#dashboard'>
          Sign In
        </a>
        <a className='ba-btn ba-btn-solid' href='#demo'>
          Get a Demo
        </a>
      </div>
    </nav>
  );
}
