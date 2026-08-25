import CareersEmailLink from './CareersEmailLink';
import CareersGlyphRain from './CareersGlyphRain';

/**
 * The close band, carried over from the shipped page
 * (apps/landing/src/components/pages/careers/CareersPage.tsx, section
 * `.careers-close`): the question, the sentence, and the address itself as
 * the only control — no button. The right two-thirds of the band is the
 * glyph field.
 */
export default function CareersClose() {
  return (
    <section className='tc-sec prc-close'>
      <div className='prc-close-copy'>
        <h2>Don&rsquo;t see a role that fits?</h2>
        <p>
          We&rsquo;re always looking for talented people. Send us your resume
          and tell us how you&rsquo;d like to contribute.
        </p>
        <CareersEmailLink />
      </div>

      <CareersGlyphRain />
    </section>
  );
}
