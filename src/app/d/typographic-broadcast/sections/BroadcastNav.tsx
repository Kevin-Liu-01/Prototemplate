import Image from 'next/image';

/**
 * Floating nav pill over a full-width masthead scrim. The story section fades
 * this whole band out while it is pinned, so it carries the id the story's
 * `navSelector` looks up.
 *
 * The drop-in is a CSS animation with a `backwards` fill rather than a tween:
 * the pill's opacity has to return to the cascade once it lands, because the
 * closing sign-off stands the masthead down through a class.
 */
export default function BroadcastNav() {
  return (
    <nav className='tb-nav' aria-label='Main' id='tb-nav'>
      <div className='tb-nav-pill' id='tb-nav-pill'>
        <a className='tb-nav-mark' href='#tb-top'>
          <span className='tb-logo'>
            <Image src='/brand/no-bg-gt-logo-dark.png' alt='General Translation' width={52} height={52} />
          </span>
          <em>General Translation</em>
        </a>
        <div className='tb-nav-links'>
          <a href='#tb-story'>How it works</a>
          <a href='#tb-features'>Docs</a>
          <a href='#tb-pricing'>Pricing</a>
          <a href='#tb-review'>Blog</a>
        </div>
        <a className='tb-nav-signin' href='#tb-pricing'>
          Sign In
        </a>
        <a className='tb-nav-cta' href='#tb-cta'>
          Get a Demo
        </a>
      </div>
    </nav>
  );
}
