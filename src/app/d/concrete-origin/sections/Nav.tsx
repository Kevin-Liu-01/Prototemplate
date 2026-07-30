import Image from 'next/image';

/**
 * Slim ruled nav. Its geometry is the morph source for the story dock, so the
 * proportions (52px tall, hard 2px rules, one solid CTA) have to survive being
 * squeezed into a 50px floating slab.
 */
export default function Nav() {
  return (
    <nav className='cm-nav' data-cm-nav aria-label='Main'>
      <a className='cm-nav-mark' href='#top'>
        <Image
          src='/brand/no-bg-gt-logo-dark.png'
          alt='General Translation'
          width={44}
          height={44}
        />
        <span className='wm'>GENERAL TRANSLATION</span>
      </a>
      <span className='cm-nav-meta'>GT/2026 · SF · 118 LOCALES</span>
      <div className='cm-nav-links'>
        <a href='#features'>Docs</a>
        <a href='#pricing'>Pricing</a>
        <a href='#review'>Enterprise</a>
        <a href='#story'>Blog</a>
      </div>
      <div className='cm-nav-cta'>
        <a className='keep' href='#pricing'>
          Sign In
        </a>
        <a className='solid keep' href='#closing'>
          Get a Demo
        </a>
      </div>
    </nav>
  );
}
