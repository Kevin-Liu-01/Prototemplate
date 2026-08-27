import { ArrowUpRight } from 'lucide-react';

import type { Position } from '../../singularity/company-sections/careers';

/**
 * OPEN ROLES — the shipped page's openings ledger
 * (apps/landing/src/components/pages/careers/CareersPage.tsx, section
 * `.careers-openings`): a real h2 with its own sentence beside it, then a
 * five-column ruled ledger whose head row names Role / Team / Location /
 * Type and whose every body row IS the link out to the Ashby posting.
 *
 * The rows are whatever the live board returns — nothing is authored here.
 * On the narrow fold the three meta columns collapse into one line under
 * the title, the shipped behaviour. An empty board prints the shipped
 * sentence rather than hiding the section.
 */
export default function CareersOpenings({
  positions,
}: {
  positions: readonly Position[];
}) {
  return (
    <section
      id='positions'
      className='tc-sec prc-openings'
      aria-labelledby='prc-open-roles'
    >
      <div className='prc-section-head'>
        <h2 id='prc-open-roles'>Open roles</h2>
        <p>Join our team and help shape the future of global software.</p>
      </div>

      <div className='prc-ledger'>
        <div className='prc-role-row is-head'>
          <span>Role</span>
          <span className='prc-role-column'>Team</span>
          <span className='prc-role-column'>Location</span>
          <span className='prc-role-column'>Type</span>
          <span aria-hidden='true' />
        </div>

        {positions.length > 0 ? (
          positions.map((position) => (
            <a
              className='prc-role-row'
              href={position.url}
              key={position.id}
              rel='noopener noreferrer'
              target='_blank'
            >
              <span className='prc-role-title'>
                <span>{position.title}</span>
                <span className='prc-role-mobile-meta'>
                  {position.team} &middot; {position.location} &middot;{' '}
                  {position.type}
                </span>
              </span>
              <span className='prc-role-column'>{position.team}</span>
              <span className='prc-role-column'>{position.location}</span>
              <span className='prc-role-column'>{position.type}</span>
              <span className='prc-role-apply'>
                Apply
                <ArrowUpRight aria-hidden='true' />
              </span>
            </a>
          ))
        ) : (
          <div className='prc-empty-state'>
            <p>
              No open roles at the moment. Check back soon or reach out to us
              directly.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
