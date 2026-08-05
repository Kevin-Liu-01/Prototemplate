'use client';

import { useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import CodeBlock from '../sections/code';
import { useQuietReveal } from '../sections/reveal';

/* the .lct locale-chip base, singularity-scoped */
import '../components/icons.css';

/**
 * The four signal classes, each as a real artifact on a ruled sheet: pinned
 * vocabulary, per-locale directives, the file-and-markup signals the SDK
 * already ships with every string, and the same steering on runtime calls.
 * Every term, rule and gloss is product-verbatim (the docs' own glossary and
 * directive examples, the inventory's Spring/coil call).
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

export default function ContextSignals() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='signals' ref={root}>
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          Four signals
        </span>
        <h2 data-reveal>Context is assembled, not typed.</h2>
        <p data-reveal>
          Four signals steer every translation: the vocabulary your team pins, the tone you set per
          locale, the file and markup around each string, and the tag at the call site.
        </p>
      </div>

      <div className='sgx-body'>
        <div className='sgx-duo'>
          {/* ---- glossary: vocabulary, pinned ---- */}
          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Glossary</span>
              <i>vocabulary, pinned</i>
            </div>
            <p>
              Key terms translate one way, everywhere they appear &mdash; or never translate at
              all. Decided once, per locale.
            </p>
            <div className='sgx-ledger sgx-gloss'>
              <div className='sgx-lr is-head'>
                <span>term</span>
                <span>pinned</span>
              </div>
              {GLOSSARY.map((row) => (
                <div className='sgx-lr' key={row.term}>
                  <b>{row.term}</b>
                  <span>
                    {row.pins.map((pin, i) => (
                      <span className='sgx-pin' key={`${row.term}-${pin.code ?? 'all'}-${i}`}>
                        {pin.code ? <LocaleTag code={pin.code} /> : null}
                        <span>{pin.value}</span>
                      </span>
                    ))}
                    {row.note ? <span className='sgx-pin-note'>&mdash; {row.note}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- directives: tone, set per locale ---- */}
          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Directives</span>
              <i>tone, per locale</i>
            </div>
            <p>
              Style rules ride along with every job: voice, formality, what never gets translated.
              Scoped to one locale or to all of them.
            </p>
            <div className='sgx-ledger sgx-dirs'>
              {DIRECTIVES.map((rule) => (
                <div className='sgx-lr' key={rule.text}>
                  {rule.scope === 'all' ? (
                    <span className='sgx-scope'>all locales</span>
                  ) : (
                    <span className='sgx-scope'>
                      <LocaleTag code={rule.scope} />
                    </span>
                  )}
                  <span>{rule.text}</span>
                </div>
              ))}
              <div className='sgx-lr'>
                <span className='sgx-scope'>
                  <LocaleTag code='en' />
                </span>
                <span>
                  tone · <b>playful, upbeat</b>
                </span>
              </div>
              <div className='sgx-lr'>
                <span className='sgx-scope'>
                  <LocaleTag code='de' />
                </span>
                <span>
                  tone · <b>formal &ldquo;Sie&rdquo;</b>
                </span>
              </div>
            </div>
            <p className='sgx-verdict'>
              The voice that&rsquo;s playful in English can be formal in German &mdash; both are
              the same product speaking.
            </p>
          </div>
        </div>

        <div className='sgx-duo'>
          {/* ---- the file is a signal ---- */}
          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>The file is a signal</span>
              <i>shipped by the SDK</i>
            </div>
            <p>
              Translation happens on the JSX tree, not on bare strings &mdash; every entry ships
              with the file it lives in and the markup around it.
            </p>
            <div className='sgx-sig'>
              <div className='sgx-sig-tree' aria-hidden='true'>
                <span>app/</span>
                <span className='ind-1'>checkout/</span>
                <span className='ind-2'>page.tsx</span>
                <span className='ind-2 is-live'>Toast.tsx</span>
              </div>
              <div className='sgx-ledger'>
                {SIGNALS.map((signal) => (
                  <div className='sgx-lr' key={signal.key}>
                    <span className='sgx-sig-key'>{signal.key}</span>
                    <code>{signal.value}</code>
                  </div>
                ))}
              </div>
            </div>
            <p className='sgx-verdict'>
              What travels with one string — before anyone types a word.
            </p>
          </div>

          {/* ---- runtime calls take the same steering ---- */}
          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Every call site</span>
              <i>runtime</i>
            </div>
            <p>
              Strings you can&rsquo;t know at build time take the same steering &mdash; one option
              on the runtime call.
            </p>
            <div className='sgx-code'>
              <CodeBlock file='server.ts' code={TX} numbers={false} />
            </div>
            <div className='sgx-out'>
              <LocaleTag code='es' />
              <b>primavera</b>
              <span className='sgx-out-gloss'>&mdash; the season</span>
              <s>resorte</s>
              <span className='sgx-out-gloss'>&mdash; a coil of metal</span>
            </div>
            <div className='sgx-opts'>
              <code className='tc-chip'>$context</code>
              <code className='tc-chip'>$maxChars</code>
              <code className='tc-chip'>$requiresReview</code>
              <code className='tc-chip'>$id</code>
            </div>
            <p className='sgx-verdict'>
              Cap its length, hold it for review, or give it a stable id — from the same call.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
