import Image from 'next/image';

/** Slim paper nav. Act II morphs a clone of this bar into the story dock. */
export default function GalleryNav() {
  return (
    <nav className='wg-nav' data-gallery-nav>
      <a className='wg-brand' href='#top'>
        <Image src='/brand/no-bg-gt-logo-light.png' alt='' width={26} height={26} />
        General Translation
      </a>
      <div className='wg-nav-links'>
        <a href='#features'>Docs</a>
        <a href='#pricing'>Pricing</a>
        <a href='#review'>Enterprise</a>
        <a href='#story'>Blog</a>
      </div>
      <div className='wg-nav-cta'>
        <a className='wg-btn wg-btn-line' href='#pricing'>
          Sign In
        </a>
        <a className='wg-btn wg-btn-ink' href='#close'>
          Get a Demo
        </a>
      </div>
    </nav>
  );
}
