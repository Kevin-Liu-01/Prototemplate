'use client';

import { useRef } from 'react';

import LocaleTag from '../../components/LocaleTag';
import CodeBlock from '../../sections/code';
import { useQuietReveal } from '../../sections/reveal';

/**
 * The four signal classes, each as a real artifact: pinned vocabulary, per-
 * locale directives, the file-and-markup signals the SDK already ships with
 * every string, and the same steering on runtime calls. Every term, rule and
 * gloss is product-verbatim (docs' own glossary/directive examples, the main
 * page's Terminology row, the inventory's Spring/coil call).
 */

const TX = `await tx('Spring', {
  $context: 'the season, not a coil',
});`;

/** The dashboard's own example rows: pin a term per locale, or pin it still. */
const GLOSSARY: readonly {
  term: string;
  pins: readonly { code?: string; value: string }[];
  note?: string;
}[] = [
  { term: 'Locadex', pins: [{ value: 'never translated' }], note: 'product name' },
  { term: 'General Translation', pins: [{ value: 'never translated' }], note: 'product name' },
  {
    term: 'Workflow',
    pins: [
      { code: 'es', value: 'Flujo de trabajo' },
      { code: 'ja', value: 'ワークフロー' },
    ],
  },
  {
    term: 'Settings',
    pins: [
      { code: 'es', value: 'Configuración' },
      { code: 'de', value: 'Einstellungen' },
      { code: 'ja', value: '設定' },
    ],
  },
  { term: 'Save', pins: [{ code: 'de', value: 'Speichern' }], note: 'store, not discount' },
];

const DIRECTIVES: readonly { scope: string; text: string }[] = [
  { scope: 'de', text: 'Use formal “Sie”' },
  { scope: 'all', text: 'Use active voice, avoid jargon' },
  { scope: 'all', text: 'Never translate product names' },
];

/** What the SDK ships alongside one string — the signals nobody has to type. */
const SIGNALS: readonly { key: string; value: string }[] = [
  { key: 'string', value: '"Save"' },
  { key: 'file', value: 'app/checkout/Toast.tsx' },
  { key: 'parent', value: '<button>' },
  { key: 'sibling', value: '"Payment received"' },
  { key: 'context', value: '"checkout toast"' },
];

export default function Signals() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='signals' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Context is assembled, not typed.</h2>
        <p data-reveal>
          Four signals steer every translation: the vocabulary your team pins, the tone you set per
          locale, the file and markup around each string, and the tag at the call site.
        </p>
      </div>

      <div className='tc-row is-even ctx-pair'>
        {/* ---- glossary: vocabulary, pinned ---- */}
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Glossary — vocabulary, pinned</h3>
            <p>
              Key terms translate one way, everywhere they appear &mdash; or never translate at all.
              Decided once, per locale.
            </p>
            <div className='ctx-gloss'>
              <div className='ctx-gloss-row is-head' aria-hidden='true'>
                <span>term</span>
                <span>pinned</span>
              </div>
              {GLOSSARY.map((row) => (
                <div className='ctx-gloss-row' key={row.term}>
                  <b>{row.term}</b>
                  <span className='ctx-gloss-pins'>
                    {row.pins.map((pin, i) => (
                      <span className='ctx-pin' key={`${row.term}-${pin.code ?? 'all'}-${i}`}>
                        {pin.code ? <LocaleTag code={pin.code} className='ctx-loc' /> : null}
                        <span className='ctx-pin-val'>{pin.value}</span>
                      </span>
                    ))}
                    {row.note ? <span className='ctx-pin-note'>&mdash; {row.note}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- directives: tone, set per locale ---- */}
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Directives — tone, set per locale</h3>
            <p>
              Style rules ride along with every job: voice, formality, what never gets translated.
              Scoped to one locale or to all of them.
            </p>
            <div className='ctx-dirs'>
              {DIRECTIVES.map((rule) => (
                <div className='ctx-dirs-row' key={rule.text}>
                  {rule.scope === 'all' ? (
                    <span className='ctx-scope'>all locales</span>
                  ) : (
                    <span className='ctx-scope'>
                      <LocaleTag code={rule.scope} />
                    </span>
                  )}
                  <span className='ctx-dirs-text'>{rule.text}</span>
                </div>
              ))}
            </div>
            <div className='ctx-tone'>
              <div className='ctx-tone-row'>
                <span className='ctx-tone-key'>tone</span>
                <span className='ctx-tone-val'>playful, upbeat</span>
                <LocaleTag code='en' className='ctx-loc' />
              </div>
              <div className='ctx-tone-row'>
                <span className='ctx-tone-key'>tone</span>
                <span className='ctx-tone-val'>
                  formal <b>&ldquo;Sie&rdquo;</b>
                </span>
                <LocaleTag code='de' className='ctx-loc' />
              </div>
            </div>
            <p className='ctx-verdict'>
              The voice that&rsquo;s playful in English can be formal in German &mdash; both are the
              same product speaking.
            </p>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      <div className='tc-row is-even ctx-pair'>
        {/* ---- the file is a signal ---- */}
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>The file is a signal</h3>
            <p>
              Translation happens on the JSX tree, not on bare strings &mdash; every entry ships with
              the file it lives in and the markup around it.
            </p>
            <div className='ctx-sig'>
              <div className='ctx-sig-tree' aria-hidden='true'>
                <span>app/</span>
                <span className='ind-1'>checkout/</span>
                <span className='ind-2'>page.tsx</span>
                <span className='ind-2 is-live'>Toast.tsx</span>
              </div>
              <div className='ctx-sig-thread' aria-hidden='true' />
              <div className='ctx-sig-ledger'>
                {SIGNALS.map((signal) => (
                  <div className='ctx-sig-row' key={signal.key}>
                    <span className='ctx-sig-key'>{signal.key}</span>
                    <code className='ctx-sig-val'>{signal.value}</code>
                  </div>
                ))}
              </div>
            </div>
            <p className='ctx-verdict'>What travels with one string — before anyone types a word.</p>
          </div>
        </div>

        {/* ---- runtime calls take the same steering ---- */}
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Context at every call site</h3>
            <p>
              Strings you can&rsquo;t know at build time take the same steering &mdash; one option on
              the runtime call.
            </p>
            <div className='ctx-hero-code'>
              <CodeBlock file='server.ts' code={TX} />
            </div>
            <div className='ctx-out'>
              <LocaleTag code='es' className='ctx-loc' />
              <b className='is-accent'>primavera</b>
              <span className='ctx-out-gloss'>&mdash; the season</span>
              <s>resorte</s>
              <span className='ctx-out-gloss'>&mdash; a coil of metal</span>
            </div>
            <div className='ctx-opts'>
              <code className='tc-chip'>$context</code>
              <code className='tc-chip'>$maxChars</code>
              <code className='tc-chip'>$requiresReview</code>
              <code className='tc-chip'>$id</code>
            </div>
            <p className='ctx-verdict'>
              Cap its length, hold it for review, or give it a stable id — from the same call.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
