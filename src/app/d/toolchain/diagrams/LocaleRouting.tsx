import LocaleTag from '../components/LocaleTag';

import './flow.css';

/**
 * Locale routing — the thing itself: the same page's address drawn once per
 * locale the config one cell away declares, source first. Each bar shows the
 * locale prefix the middleware adds; the French bar shows the localized
 * *pathname*, which is the part most readers have never seen an i18n library
 * do, so it is the row set in ink. Beneath the bars, the detection order,
 * with the winning rung in ink.
 */

const BARS: readonly {
  seg?: string;
  path: string;
  loc: string;
  lit?: boolean;
}[] = [
  { path: '/about', loc: 'en' },
  { seg: '/es', path: '/about', loc: 'es' },
  { seg: '/fr', path: '/a-propos', loc: 'fr', lit: true },
  { seg: '/ja', path: '/about', loc: 'ja' },
  { seg: '/de', path: '/about', loc: 'de' },
  { seg: '/zh', path: '/about', loc: 'zh' },
];

export type LocaleRoutingProps = {
  className?: string;
  title?: string;
  /** Locale rows to render, kept in BARS order; omitted = all six, so the
      toolchain page's default render is unchanged. */
  locales?: readonly string[];
};

export default function LocaleRouting({ className, title, locales }: LocaleRoutingProps) {
  const bars = locales ? BARS.filter((bar) => locales.includes(bar.loc)) : BARS;
  return (
    <div
      className={['rt', className].filter(Boolean).join(' ')}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {bars.map((bar) => (
        <div className='rt-bar' key={bar.loc}>
          <span className='rt-dom'>example.com</span>
          {bar.seg ? <b className='rt-seg'>{bar.seg}</b> : null}
          <span className={`rt-path${bar.lit ? ' is-lit' : ''}`}>{bar.path}</span>
          <span className='rt-loc'>
            <LocaleTag code={bar.loc} />
          </span>
        </div>
      ))}
      <p className='rt-ladder'>
        <b>URL locale</b> → cookie → Accept-Language → default
      </p>
    </div>
  );
}
