import { REVIEW_AGENT, REVIEW_BAR, REVIEW_FOOT, REVIEW_ROWS } from '../data';
import { Chip } from './deco/Chip';
import { Tablero, Talud, Terrace } from './deco/Terrace';

/**
 * The review moment. Source beside translation in one mounted editor,
 * revision state carried by type and chips: the approved rows carry an
 * `approved` stamp, the regenerated row shows its previous translation
 * struck through above the new one and keeps the `edit` affordance. Every
 * row is complete at rest; the only motion is the caret after the last
 * translation, a CSS blink.
 */
export default function Review() {
  return (
    <Terrace tier={1} className='tt-review' id='review'>
      <Tablero depth={2}>
        <header className='tt-head'>
          <h2 className='tt-h2'>Source beside translation</h2>
          <p>Revision state is carried by type and chips. One workspace holds every string of the project.</p>
        </header>
        <div className='tt-work'>
          <div className='tt-work-bar'>
            <span>{REVIEW_BAR.workspace}</span>
            <span>{REVIEW_BAR.count}</span>
          </div>
          <div className='tt-work-cols'>
            <span>
              source · <Chip code='en' />
            </span>
            <span>
              translation · <Chip code='es' />
            </span>
            <span className='tt-work-state'>state</span>
          </div>
          {REVIEW_ROWS.map((row, i) => (
            <div key={row.key} className='tt-work-row'>
              <p className='tt-work-src' lang='en'>
                {row.source}
              </p>
              <div className='tt-work-tr' lang='es'>
                {row.previous ? <s className='tt-work-prev'>{row.previous}</s> : null}
                <p>
                  {row.translation}
                  {i === REVIEW_ROWS.length - 1 ? <span className='tt-caret' aria-hidden='true' /> : null}
                </p>
              </div>
              <span className={`tt-stamp is-${row.final}`}>{row.final === 'approved' ? 'approved' : 'edit'}</span>
            </div>
          ))}
          <div className='tt-work-foot'>
            {REVIEW_FOOT.map((label) => (
              <span key={label}>{label}</span>
            ))}
            <span className='is-right'>{REVIEW_AGENT}</span>
          </div>
        </div>
      </Tablero>
      <Talud relief='chevron' />
    </Terrace>
  );
}
