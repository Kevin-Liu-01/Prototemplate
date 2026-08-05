/* PLACEHOLDER QUOTE — invented scaffolding for the layout. Swap for
   Michael Truell's real words (and confirm the title) before this copy
   ships anywhere. */

import GtLogoText from '../../_v0/GtLogoText';

/**
 * The witness: one voice, given the whole width. A dashed orbit arc rides
 * behind the quote — the speaker is inside the well, and the typography is
 * the only other thing on the paper.
 */
export default function Witness() {
  return (
    <section className='sgo-witness' aria-label='Customer statement'>
      <span className='sgo-witness-arc' aria-hidden />
      <figure className='sgo-witness-plate'>
        <blockquote>
          <p>
            Localization used to be the last thing before launch and the first thing to slip.
            With <GtLogoText /> it is just part of the build — our locales ship the same hour
            the English does.
          </p>
        </blockquote>
        <figcaption>
          <i className='sgo-wm is-cursor' aria-hidden />
          <span>
            <b>Michael Truell</b>
            CEO, Cursor
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
