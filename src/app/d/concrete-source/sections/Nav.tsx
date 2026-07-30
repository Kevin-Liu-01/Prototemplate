/**
 * The 52px ruled bar. Its bounding box is the FLIP source for the story dock,
 * so the id has to stay `nav` — the morph reads it off the document.
 *
 * The mark is the literal word "GT" set in the mono face inside a 22px white
 * square, exactly as authored — the brand PNG overflows the square and clips
 * the G's bowl at this size.
 */
export default function Nav() {
  return (
    <nav className='nav' id='nav' aria-label='Main'>
      <a className='nav-mark' href='#top'>
        <span className='gtsq'>GT</span>
        <span className='wm-txt'>GENERAL&nbsp;TRANSLATION</span>
      </a>
      <span className='nav-meta'>GT/2026 · SF · 118 LOCALES</span>
      <div className='nav-links'>
        <a href='#docs'>Docs</a>
        <a href='#pricing'>Pricing</a>
        <a href='#enterprise'>Enterprise</a>
        <a href='#blog'>Blog</a>
      </div>
      <div className='nav-cta'>
        <a className='ghost keep' href='#signin'>
          Sign&nbsp;In
        </a>
        <a className='solid keep' href='#demo'>
          Get&nbsp;a&nbsp;Demo
        </a>
      </div>
    </nav>
  );
}
