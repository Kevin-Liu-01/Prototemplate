import CourseHead from '../components/CourseHead';
import { WedgeNumeral } from '../components/Rosette';
import Sheen from '../components/Sheen';
import { BEATS } from '../data';

/**
 * The ziggurat: the story as a stepped setback. Nine beats on three tiers,
 * three to a tier; the top tier is the narrowest and each tier below it is
 * wider, so the read runs down the profile from the first read of the page
 * to the merged pull request at the base. Every tier is a glazed tread: it
 * draws its own top rule, which is the seam under the tier above, and
 * carries a lapis glaze sheen at its arris; the base tier draws the ground
 * rule.
 */
const TIERS = [BEATS.slice(0, 3), BEATS.slice(3, 6), BEATS.slice(6, 9)];

export default function Ziggurat() {
  return (
    <section className='gb-course' id='story'>
      <div className='gb-course-in'>
        <CourseHead
          n={4}
          title='How a string becomes a shipped translation.'
          sub='From the first read of the page to the merged pull request.'
        />

        <ol className='gb-zig' aria-label='The nine beats'>
          {TIERS.map((tier, t) => (
            <li className={`gb-tier is-${t + 1}`} key={t}>
              <Sheen ink='lapis' />
              <ol className='gb-tier-in'>
                {tier.map((beat) => (
                  <li className='gb-tread' key={beat.n}>
                    <span className='gb-tread-n'>
                      <WedgeNumeral n={beat.n} label={`Beat ${beat.n}`} />
                    </span>
                    <h3>{beat.title}</h3>
                    <p>{beat.body}</p>
                    <code className='gb-annot'>{beat.annot}</code>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
