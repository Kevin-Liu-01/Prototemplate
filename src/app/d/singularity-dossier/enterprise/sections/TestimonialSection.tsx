
import EnterpriseDither from './EnterpriseDither';

/**
 * The Cursor word on a quiet ink plate, seated between the hero and
 * the contact ask: bounded by the page's end-to-end border lines with
 * corner crosses closing its foot, a whisper of the Bayer material on
 * its right flank. Same words as the shared CursorTestimonial (which
 * the YC page keeps); only the staging is the enterprise rail's.
 */
export default function TestimonialSection() {
  return (
    <section className='tc-sec enterprise-testimonial'>
      <div className='tce-quote-band'>
        <EnterpriseDither className='is-quote is-left' zoom={1.4} />
        <EnterpriseDither className='is-quote' zoom={1.4} />
        <span className='tce-quote-corner is-bl' aria-hidden='true' />
        <span className='tce-quote-corner is-br' aria-hidden='true' />
        <figure className='tce-quote'>
          <blockquote>
              <p>
                Kudos to General Translation for helping with the localization
                efforts (great team)
              </p>
          </blockquote>
          <figcaption>
            <a
              href='https://www.linkedin.com/posts/leeerob_just-shipped-new-docs-for-cursor-been-hacking-activity-7374285675900297216-veY1/'
              target='_blank'
              rel='noopener noreferrer'
            >
              <img
                src='https://github.com/leerob.png'
                alt='Lee Robinson'
                width={40}
                height={40}
              />
              <span>
                <b>Lee Robinson</b>
                  <em>VP of Developer Experience, Cursor</em>
              </span>
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
