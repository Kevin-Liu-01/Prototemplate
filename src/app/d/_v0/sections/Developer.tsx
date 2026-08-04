import { CornerDownRight } from 'lucide-react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import './developer.css';

type SaveDemo = {
  code: string;
  label: string;
  /** dir='rtl' rides the row, not the label — the whole row must mirror */
  rtl?: boolean;
};

/** One Save button, five rendered widths — two rows reverse the entire
    orientation. The widths are the artifact: nothing is equalized. */
const SAVE_DEMOS: readonly SaveDemo[] = [
  { code: 'en', label: 'Save changes' },
  { code: 'de', label: 'Änderungen speichern' },
  { code: 'ja', label: '変更を保存' },
  { code: 'ar', label: 'حفظ التغييرات', rtl: true },
  { code: 'he', label: 'שמור שינויים', rtl: true },
];

/* Fixed inputs — every displayed value must be real Intl output computed
   at render, never a transcribed string. */
const NUMBER_INPUT = 1234567.89;
const CURRENCY_INPUT = 1234.5;
const DATE_INPUT = new Date(Date.UTC(2026, 7, 4));

function formatNumber(locale: string): string {
  return new Intl.NumberFormat(locale).format(NUMBER_INPUT);
}

function formatCurrency(locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(CURRENCY_INPUT);
}

function formatDate(locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(DATE_INPUT);
}

function pluralFormCount(locale: string): number {
  return new Intl.PluralRules(locale).resolvedOptions().pluralCategories
    .length;
}

/** Plural rows carry a count instead of a formatted string: the numeral is
    mono, the words sans, both at the row's one size (founder note). */
type LedgerRow =
  | { code: string; value: string }
  | { code: string; pluralCount: number };

type LedgerPanel = {
  label: string;
  rows: readonly LedgerRow[];
};

const LEDGER_PANELS: readonly LedgerPanel[] = [
  {
    label: 'Numbers',
    rows: ['en-US', 'de-DE', 'ar-EG'].map((locale) => ({
      code: locale,
      value: formatNumber(locale),
    })),
  },
  {
    label: 'Currency',
    rows: [
      { code: 'en-US', value: formatCurrency('en-US', 'USD') },
      { code: 'de-DE', value: formatCurrency('de-DE', 'EUR') },
      { code: 'ja-JP', value: formatCurrency('ja-JP', 'JPY') },
    ],
  },
  {
    label: 'Dates',
    rows: ['en-US', 'de-DE', 'ja-JP'].map((locale) => ({
      code: locale,
      value: formatDate(locale),
    })),
  },
  {
    label: 'Plural forms',
    rows: ['en', 'ar', 'ja'].map((locale) => ({
      code: locale,
      pluralCount: pluralFormCount(locale),
    })),
  },
];

function LedgerValue({ row }: { row: LedgerRow }) {
  if ('value' in row) {
    return <code className='v0-dev-lval'>{row.value}</code>;
  }
  return (
    <span className='v0-dev-lplural'>
      <code>{row.pluralCount}</code> plural{' '}
      {row.pluralCount === 1 ? 'form' : 'forms'}
    </span>
  );
}

type RouteRow = {
  code: string;
  path: string;
};

/** The pathnames themselves are localized — that is the point. */
const ROUTE_ROWS: readonly RouteRow[] = [
  { code: 'de', path: '/de/ueber-uns' },
  { code: 'fr', path: '/fr/a-propos' },
];

/**
 * DEVELOPER EXPERIENCE — "Built for developers." A three-cell bento where
 * the middle (numbers) cell earns more width: rendered button widths
 * (incl. two RTL rows), a bento-within-bento Intl ledger, and localized
 * routing. Static server component; copy verbatim from the Figma v0 spec.
 */
export default function V0Developer() {
  return (
    <section className='tc-sec v0-dev' id='developers'>
      <div className='v0-dev-head'>
        <h2>Built for developers.</h2>
        <p>
          General Translation handles all the infrastructure, so you no longer
          need to think about localization.
        </p>
      </div>

      <div className='v0-dev-cells'>
        <article className='v0-dev-cell'>
          <h3>Every locale is a different length.</h3>
          <p>
            Some change your entire orientation. GT renders components
            correctly for every locale.
          </p>
          <div className='v0-dev-art v0-dev-saves'>
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

        <article className='v0-dev-cell'>
          <h3>
            Every locale uses different numbers, currencies, dates, plurals,
            and more.
          </h3>
          <p>GT handles every possible branch and edge case.</p>
          <div className='v0-dev-art v0-dev-ledger'>
            {LEDGER_PANELS.map((panel) => (
              <div className='v0-dev-mini' key={panel.label}>
                <div className='v0-dev-mini-label'>{panel.label}</div>
                {panel.rows.map((row) => (
                  <div className='v0-dev-lrow' key={row.code}>
                    <LocaleTag code={row.code} />
                    <LedgerValue row={row} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </article>

        <article className='v0-dev-cell'>
          <h3>Every locale needs to be routed correctly.</h3>
          <p>
            GT automatically routes your users to the correct SEO-friendly URL
            path.
          </p>
          <div className='v0-dev-art v0-dev-routes'>
            <div className='v0-dev-route is-src'>
              <LocaleTag code='en' />
              <code>/about</code>
            </div>
            {ROUTE_ROWS.map((route) => (
              <div
                className={
                  route.code === 'fr' ? 'v0-dev-route is-fr' : 'v0-dev-route'
                }
                key={route.code}
                tabIndex={route.code === 'fr' ? 0 : undefined}
              >
                <CornerDownRight
                  className='v0-dev-route-arrow'
                  strokeWidth={1.5}
                  aria-hidden
                />
                <LocaleTag code={route.code} />
                <code>{route.path}</code>
              </div>
            ))}
            <p className='v0-dev-footnote'>
              Localizing in French means translating both the pathname and the
              page.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
