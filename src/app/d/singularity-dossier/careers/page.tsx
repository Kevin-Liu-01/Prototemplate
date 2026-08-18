import { ArrowUpRight } from 'lucide-react';

import Image from 'next/image';

import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import CareersEmailLink from './CareersEmailLink';
import CareersHorizon from './CareersHorizon';
import GlyphRain from './GlyphRain';
import LogosGrid from './LogosGrid';
import ScrollToPositionsButton from './ScrollToPositionsButton';

import { getJobPostings } from './careers-data';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';
import './careers.css';

export const metadata = {
  title: 'Careers — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the careers page ported whole from the live
 * redesign: the event-horizon hero with the locale orbit (printed in
 * ink on the light sheet), the customer proof wall, the mission pitch
 * beside the dithered office plate, the live Ashby openings ledger,
 * and the glyph-rain close with the hover-revealed mailto. The board
 * is fetched through the page's local careers-data mirror — same
 * source, same hourly revalidate as the live page.
 */
export default async function DossierCareersPage() {
  const openPositions = await getJobPostings();

  return (
    <SmoothScroll>
      <div className='singularity-root toolchain-root sgd-root careers-root'>
        <V0Nav />
        <div className='tc-rail'>
          <section className='tc-sec careers-hero'>
            <CareersHorizon />

            <div className='careers-hero-copy'>
              <h1>
                Bring the world&rsquo;s best products to the{' '}
                <span>whole world</span>
              </h1>

              <div className='careers-actions'>
                <ScrollToPositionsButton />
              </div>
            </div>
          </section>

          <section className='tc-sec careers-proof'>
            <h2>
              Join the team building language infra for the world&rsquo;s best
              companies
            </h2>
            <LogosGrid />
          </section>

          <section
            className='tc-sec careers-mission'
            aria-labelledby='careers-mission-title'
          >
            <div className='careers-mission-grid'>
              <div className='careers-mission-copy'>
                <h2 id='careers-mission-title'>Mission</h2>
                <p>
                  <strong>
                    General Translation is bringing the world&rsquo;s best
                    products to the whole world.
                  </strong>{' '}
                  Every product should be natively available in every
                  language, from day one.
                </p>
                <p>
                  Toward that goal, we serve many of the world&rsquo;s best
                  companies and are backed by a list of S-tier investors.
                </p>
                <p>
                  <strong>
                    Our company takes an engineering-first approach to solving
                    problems.
                  </strong>
                </p>
                <ul>
                  <li>
                    In our product, this means applying engineering wherever
                    necessary to create an incredible customer experience.
                  </li>
                  <li>
                    In our operations, this means automating busywork, and
                    building our company to be worked on by agents as much as
                    humans.
                  </li>
                  <li>
                    In our culture, this means prioritizing truth-seeking over
                    politics.
                  </li>
                </ul>
                <p>
                  <strong>
                    Our company is in the business of original ideas.
                  </strong>{' '}
                  We&rsquo;re looking for ambitious and exceptional
                  talent&mdash;people who can invent their way out of
                  impossible problems. You&rsquo;ll join a lean team with
                  unlimited AI token spend and extreme creative control.
                </p>
                <p>
                  We work in-person in San Francisco. We offer highly
                  competitive salary and equity, and provide top-tier benefits
                  including free meals, gym, Waymo rides from the office, and
                  full health coverage. You&rsquo;ll get career acceleration,
                  ownership, and resources you can&rsquo;t find at any other
                  early-stage company.
                </p>
                <p className='careers-mission-close'>
                  If you care deeply about your work, we&rsquo;d love to talk.
                </p>
              </div>
              <div className='careers-mission-scene'>
                <Image
                  alt='Two engineers pairing on code at our San Francisco office'
                  className='careers-mission-photo'
                  height={2562}
                  src='/careers/mission-dither.png'
                  unoptimized
                  width={1920}
                />
              </div>
            </div>
          </section>

          <section
            id='positions'
            className='tc-sec careers-openings'
            aria-labelledby='careers-open-roles'
          >
            <div className='careers-section-head'>
              <h2 id='careers-open-roles'>Open roles</h2>
              <p>
                Join our team and help shape the future of global software.
              </p>
            </div>

            <div className='careers-ledger'>
              <div className='careers-role-row is-head'>
                <span>Role</span>
                <span className='careers-role-column'>Team</span>
                <span className='careers-role-column'>Location</span>
                <span className='careers-role-column'>Type</span>
                <span aria-hidden='true' />
              </div>

              {openPositions.length > 0 ? (
                openPositions.map((position) => (
                  <a
                    className='careers-role-row'
                    href={position.url}
                    key={position.id}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    <span className='careers-role-title'>
                      <span>{position.title}</span>
                      <span className='careers-role-mobile-meta'>
                        {position.department} · {position.location} ·{' '}
                        {position.type}
                      </span>
                    </span>
                    <span className='careers-role-column'>
                      {position.department}
                    </span>
                    <span className='careers-role-column'>
                      {position.location}
                    </span>
                    <span className='careers-role-column'>{position.type}</span>
                    <span className='careers-role-apply'>
                      Apply
                      <ArrowUpRight aria-hidden='true' />
                    </span>
                  </a>
                ))
              ) : (
                <div className='careers-empty-state'>
                  <p>
                    No open roles at the moment. Check back soon or reach out
                    to us directly.
                  </p>
                </div>
              )}

            </div>
          </section>

          <section className='tc-sec careers-close'>
            <div className='careers-close-copy'>
              <h2>Don&rsquo;t see a role that fits?</h2>
              <p>
                We&rsquo;re always looking for talented people. Send us your
                resume and tell us how you&rsquo;d like to contribute.
              </p>
              <CareersEmailLink />
            </div>

            <GlyphRain
              className='careers-glyph-scene'
              canvasClassName='careers-glyph-canvas'
            />
          </section>

          <V0Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}
