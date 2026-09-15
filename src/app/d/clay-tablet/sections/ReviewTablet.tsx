import WedgeRule from '../diagrams/deco/WedgeRule';
import { REVIEW_BAR, REVIEW_FOOT, REVIEW_HEADS, REVIEW_ROWS } from './content';
import Shelf, { Tablet } from './Shelf';

/**
 * Tablet V: the review workspace (A6). Source beside translation on one slip
 * panel, four real rows, revision state carried by type and stamps and never
 * by colour. The regenerated row keeps its struck previous translation. The
 * still is the workspace complete; the one motion is the stylus caret at the
 * end of the edited line, a CSS keyframe.
 */
export default function ReviewTablet() {
  return (
    <Shelf
      id='review'
      label={{
        numeral: 'V',
        name: 'Review',
        note: 'Source beside translation in one workspace. Revision state is carried by type and stamps, never by color.',
      }}
    >
      <Tablet size='full' className='ct-review'>
        <header className='ct-reg ct-head'>
          <h2>The review workspace</h2>
          <p>
            A node marked requires review fires a webhook instead of shipping. Legal reads the Spanish,
            approves it, and only then does it go live.
          </p>
        </header>

        <WedgeRule />

        <div className='ct-reg ct-ws-reg'>
          <div className='ct-slip ct-ws'>
            <div className='ct-ws-bar'>
              <span className='ct-ws-title'>{REVIEW_BAR.title}</span>
              <span className='ct-ws-count'>{REVIEW_BAR.count}</span>
            </div>
            <div className='ct-ws-table' role='table' aria-label='Review workspace'>
              <div className='ct-ws-row is-head' role='row'>
                <span role='columnheader'>{REVIEW_HEADS.source}</span>
                <span role='columnheader'>{REVIEW_HEADS.translation}</span>
                <span role='columnheader'>{REVIEW_HEADS.state}</span>
              </div>
              {REVIEW_ROWS.map((row) => (
                <div className='ct-ws-row' role='row' key={row.key}>
                  <span className='ct-ws-src' role='cell' lang='en'>
                    {row.source}
                  </span>
                  <span className='ct-ws-tr' role='cell' lang='es'>
                    {row.previous ? <s className='ct-ws-prev'>{row.previous}</s> : null}
                    <span className='ct-ws-now'>
                      {row.translation}
                      {row.state === 'edited' ? <span className='ct-caret' aria-hidden='true' /> : null}
                    </span>
                  </span>
                  <span className='ct-ws-state' role='cell'>
                    <span className='ct-stamp' data-kind={row.state}>
                      {row.state}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className='ct-ws-foot'>
              {REVIEW_FOOT.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </Tablet>
    </Shelf>
  );
}
