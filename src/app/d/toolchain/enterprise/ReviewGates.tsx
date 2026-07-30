'use client';

import { ClipboardCheck } from 'lucide-react';
import { useRef } from 'react';

import LocaleTag from '../components/LocaleTag';
import CodeBlock from '../sections/code';
import { useQuietReveal } from '../sections/reveal';

/** The gate as a prop: hold the entry from the call site. Indentation keeps
 *  every wrapped line past column 3, so CodeBlock draws the doubled thread
 *  bracket from <T> to </T>. */
const RECEIPT = `import { T } from 'gt-next';

export default function Receipt() {
  return (
    <T $requiresReview $id="checkout.receipt">
      Payment received
    </T>
  );
}`;

/** Per-locale review state for the same entry — the asymmetry IS the feature:
 *  Spanish approved while French is still held. Strings are the page's own
 *  established translations of "Payment received". */
const LOCALE_STATES: readonly { code: string; text: string; lang: string; state: string; held?: boolean }[] = [
  { code: 'es', text: 'Pago recibido', lang: 'es', state: 'approved · @mira' },
  { code: 'fr', text: 'Paiement reçu', lang: 'fr', state: 'held · note open', held: true },
  { code: 'ja', text: '支払いを受領しました', lang: 'ja', state: 'approved · @mira' },
];

/**
 * The review gate, drawn in the brand's two threads: source and translation
 * run side by side at constant gauge, go dashed inside the gate while the
 * entry is held, and run solid again only after approval. Stations are
 * annotated in the caliper vocabulary — doubled ticks on the thread, mono
 * values in ink, captions muted. On narrow viewports the same journey
 * re-hangs off a vertical doubled rail.
 */
export default function ReviewGates() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='review' ref={root}>
      <div className='tc-head'>
        <ClipboardCheck className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Nothing ships until someone says so.</h2>
        <p data-reveal>
          Hold a translation from the call site, review it in the workspace, approve it per entry
          and per locale — then it goes to the edge, and not before.
        </p>
      </div>

      <div className='tc-row is-one'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>The review gate</h3>
            <p>
              Source and translation travel together; the gate holds the pair until a reviewer
              lets it through.
            </p>

            <div
              className='tce-gate'
              role='img'
              aria-label='The two threads — source and translation — run through a review gate: submitted with $requiresReview, held for review under the Legal label, then published as v214 after approval'
            >
              <span className='tce-gate-thread is-l' aria-hidden='true' />
              <span className='tce-gate-thread is-m' aria-hidden='true' />
              <span className='tce-gate-thread is-r' aria-hidden='true' />
              <span className='tce-gate-box' aria-hidden='true'>
                <span>review gate</span>
              </span>
              <div className='tce-gate-cols'>
                <div className='tce-gate-st'>
                  <b>submitted</b>
                  <span>
                    <code>&lt;T $requiresReview&gt;</code> · hash df0269ba
                  </span>
                </div>
                <div className='tce-gate-st'>
                  <b>held for review</b>
                  <span>labels · Legal, Needs review</span>
                </div>
                <div className='tce-gate-st'>
                  <b>published</b>
                  <span>approved @mira · v214 · edge</span>
                </div>
              </div>
            </div>

            <div className='tce-gate-locales'>
              {LOCALE_STATES.map((row) => (
                <div className={`tce-glo${row.held ? ' is-held' : ''}`} key={row.code}>
                  <LocaleTag code={row.code} />
                  <i lang={row.lang}>{row.text}</i>
                  <span>{row.state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      <div className='tc-row is-even'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Approval is per entry, and per locale</h3>
            <p>
              Labels, one note per locale, and comment threads live on the pair — Spanish can be
              approved while French is still in review.
            </p>
            <div className='tce-entry'>
              <div className='tce-entry-bar'>
                <b>checkout.receipt</b>
                <span>Components · ⌘K</span>
              </div>
              <div className='tce-erow is-src'>
                <span className='tce-erow-loc'>source</span>
                <i>Payment received</i>
              </div>
              <div className='tce-erow'>
                <span className='tce-erow-loc'>
                  <LocaleTag code='es' />
                </span>
                <i lang='es'>Pago recibido</i>
                <span className='tce-labs'>
                  <span className='tce-lab is-ok'>Approved</span>
                </span>
              </div>
              <div className='tce-erow'>
                <span className='tce-erow-loc'>
                  <LocaleTag code='fr' />
                </span>
                <i lang='fr'>Paiement reçu</i>
                <span className='tce-labs'>
                  <span className='tce-lab'>Needs review</span>
                  <span className='tce-lab'>Legal</span>
                </span>
              </div>
              <div className='tce-enote'>
                <span>note · fr</span>legal sign-off required for payment copy
              </div>
              <div className='tce-enote is-com'>
                <span>comments · 2</span>
                <b>resolve</b>
              </div>
              <div className='tce-efoot'>
                <span>filter · label: Needs review</span>
                <span>not on the Starter plan</span>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-panel is-framed' data-reveal>
          <div className='tc-card'>
            <h3>The gate starts as a prop</h3>
            <p>
              Hold a string for approval from the call site — it renders only after review lets it
              go.
            </p>
            <CodeBlock file='checkout/receipt.tsx' code={RECEIPT} />
            <div className='tce-code-foot'>
              <span>runtime twin</span>
              <code>tx(text, {'{ $requiresReview: true }'})</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
