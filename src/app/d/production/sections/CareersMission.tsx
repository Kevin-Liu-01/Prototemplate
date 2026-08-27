import Image from 'next/image';

/**
 * MISSION — the largest block on the shipped careers page, and the one the
 * proposals drop. Carried over word for word from
 * apps/landing/src/components/pages/careers/CareersPage.tsx (section
 * `.careers-mission`): an h2, six paragraphs with the three lead sentences
 * set in strong, a three-item list under the engineering-first claim, and
 * the closing line in its own weight.
 *
 * Beside it stands the shipped page's own print — /careers/mission-dither.png,
 * a pre-rendered ordered-Bayer plate of the San Francisco office, copied
 * from apps/landing/public — seated flush between two hairline rails that
 * run the section's full height.
 */
export default function CareersMission() {
  return (
    <section className='tc-sec prc-mission' aria-labelledby='prc-mission-title'>
      <div className='prc-mission-grid'>
        <div className='prc-mission-copy'>
          <h2 id='prc-mission-title'>Mission</h2>
          <p>
            <strong>
              General Translation is bringing the world&rsquo;s best products
              to the whole world.
            </strong>{' '}
            We believe that the software products of the future should be
            natively available in every language, from day one.
          </p>
          <p>
            Toward that goal, we serve many of the world&rsquo;s best companies
            and are backed by a list of S-tier investors.
          </p>
          <p>
            <strong>
              Our company takes an engineering-first approach to our mission.
            </strong>
          </p>
          <ul>
            <li>
              In our product, this means applying engineering wherever it is
              needed for an incredible customer experience.
            </li>
            <li>
              In our operations, this means automating busywork, and building
              our company to be worked on by agents as much as humans.
            </li>
            <li>
              In our culture, this means prioritizing truth-seeking over
              bureaucracy.
            </li>
          </ul>
          <p>
            <strong>Our company is in the business of original ideas.</strong>{' '}
            We&rsquo;re looking for ambitious and exceptional people who can
            invent their way out of impossible problems. You&rsquo;ll join a
            lean team with unlimited AI usage and extreme creative control.
          </p>
          <p>
            We work in-person in San Francisco. We offer highly competitive
            salary and equity, and provide top-tier benefits including free
            meals, gym, Waymo rides from the office, and full, Platinum-tier
            health coverage. You&rsquo;ll get career acceleration, ownership,
            and resources you can&rsquo;t find at any other early-stage
            company.
          </p>
          <p className='prc-mission-close'>
            If you care deeply about your work, we&rsquo;d love to talk.
          </p>
        </div>
        <div className='prc-mission-scene'>
          <Image
            alt='Two engineers pairing on code at our San Francisco office'
            className='prc-mission-photo'
            height={2562}
            src='/careers/mission-dither.png'
            unoptimized
            width={1920}
          />
        </div>
      </div>
    </section>
  );
}
