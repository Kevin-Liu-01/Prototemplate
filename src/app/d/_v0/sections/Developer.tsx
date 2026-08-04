import { CornerDownRight } from 'lucide-react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import './developer.css';

type SaveDemo = {
  code: string;
  label: string;
  /** the RTL row: the whole reading direction flips, not just the label */
  rtl?: boolean;
};

/** One Save button, four rendered widths — and one row that reverses the
    entire orientation. The widths are the artifact: nothing is equalized. */
const SAVE_DEMOS: readonly SaveDemo[] = [
  { code: 'en', label: 'Save changes' },
  { code: 'de', label: 'Änderungen speichern' },
  { code: 'zh', label: '保存更改' },
  { code: 'ar', label: 'حفظ التغييرات', rtl: true },
];

type FormatRow = {
  label: string;
  en: string;
  altCode: string;
  alt: string;
  /** plural counts read as prose — the numeral stays text-sized, in sans */
  prose?: boolean;
};

/** Real Intl outputs, en beside the locale that formats it differently. */
const FORMAT_ROWS: readonly FormatRow[] = [
  { label: 'Number', en: '1,234.56', altCode: 'de', alt: '1.234,56' },
  { label: 'Currency', en: '$10.99', altCode: 'de', alt: '10,99 €' },
  { label: 'Date', en: 'Aug 4, 2026', altCode: 'fr', alt: '4 août 2026' },
  {
    label: 'Plurals',
    en: '2 plural forms',
    altCode: 'pl',
    alt: '4 plural forms',
    prose: true,
  },
];

type RouteRow = {
  code: string;
  path: string;
};

const ROUTE_ROWS: readonly RouteRow[] = [
  { code: 'fr', path: 'example.com/fr/tarification' },
  { code: 'de', path: 'example.com/de/preise' },
  { code: 'es', path: 'example.com/es/precios' },
];

/** A locale-tagged Intl output cell; paths and formatted values are code,
    the plural-form counts are prose (spec note: numeral same size as text). */
function FormatCell({
  code,
  value,
  prose,
}: {
  code: string;
  value: string;
  prose?: boolean;
}) {
  return (
    <span className='v0-dev-fcell'>
      <LocaleTag code={code} />
      {prose ? (
        <span className='v0-dev-fprose'>{value}</span>
      ) : (
        <code>{value}</code>
      )}
    </span>
  );
}

/**
 * DEVELOPER EXPERIENCE — "Built for developers." Three ruled columns, each a
 * messy-part of localization with a small live-looking artifact: rendered
 * button widths (incl. an RTL row), an Intl output mini-table, and locale
 * routing. Static server component; copy verbatim from the Figma v0 spec.
 */
export default function V0Developer() {
  return (
    <section className='tc-sec v0-dev'>
      <div className='v0-dev-head'>
        <h2>Built for developers.</h2>
        <p>General Translation handles all the messy parts of localization.</p>
      </div>

      <div className='v0-dev-cols'>
        <article className='v0-dev-col'>
          <h3>Every locale is a different length.</h3>
          <p>
            Some change your entire orientation. GT renders components
            correctly for every language.
          </p>
          <div className='v0-dev-art'>
            {SAVE_DEMOS.map((demo) => (
              <div
                className='v0-dev-save'
                dir={demo.rtl ? 'rtl' : undefined}
                key={demo.code}
              >
                <LocaleTag code={demo.code} />
                <span className='v0-dev-btn'>{demo.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className='v0-dev-col'>
          <h3>
            Every locale uses different numbers, currencies, dates, plurals,
            and more.
          </h3>
          <p>GT handles every possible branch and edge case.</p>
          <div className='v0-dev-art v0-dev-table'>
            {FORMAT_ROWS.map((row) => (
              <div className='v0-dev-frow' key={row.label}>
                <span className='v0-dev-flabel'>{row.label}</span>
                <span className='v0-dev-fcells'>
                  <FormatCell code='en' value={row.en} prose={row.prose} />
                  <FormatCell
                    code={row.altCode}
                    value={row.alt}
                    prose={row.prose}
                  />
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className='v0-dev-col'>
          <h3>Every locale needs to be routed correctly.</h3>
          <p>
            GT automatically routes your users to the correct SEO-friendly URL
            path.
          </p>
          <div className='v0-dev-art v0-dev-routes'>
            <div className='v0-dev-route is-src'>
              <LocaleTag code='en' />
              <code>example.com/pricing</code>
            </div>
            {ROUTE_ROWS.map((route) => (
              <div className='v0-dev-route' key={route.code}>
                <CornerDownRight
                  className='v0-dev-route-arrow'
                  strokeWidth={1.5}
                  aria-hidden
                />
                <LocaleTag code={route.code} />
                <code>{route.path}</code>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
