'use client';

import { useRef } from 'react';

import { useQuietReveal } from './reveal';

type TransitRow = {
  en: string;
  tr: string;
  locale: string;
  rtl?: boolean;
};

/**
 * Real strings with vetted translations (from the Concrete Origin prototype,
 * the portal hero's pair data, and the shell's own CLI transcript) — the
 * strip's claim is that what crosses the seam is correct copy. The rows are
 * deliberately more than words: a plural pair and an RTL pair sit among them,
 * because that is the actual surface of localization.
 */
const ROWS: readonly TransitRow[] = [
  { en: 'Hello, world!', tr: '¡Hola, mundo!', locale: 'ES' },
  { en: 'Payment received', tr: 'Paiement reçu', locale: 'FR' },
  { en: '1 file · 4 files', tr: '1 plik · 4 pliki', locale: 'PL' },
  { en: 'Home / Docs / Pricing', tr: '홈 / 문서 / 요금제', locale: 'KO' },
  { en: 'Changes saved', tr: 'تم حفظ التغييرات', locale: 'AR', rtl: true },
  { en: 'Get started', tr: 'Jetzt starten', locale: 'DE' },
];

/**
 * The transit strip — the hero's ray narrative flattened to a ledger. One
 * vertical seam (the lens meridian) runs the strip's full height; each row is
 * an English string arriving from the left, crossing the seam through a small
 * gate node — the lens in section — and leaving locale-stamped on the right.
 */
export default function Transit() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='transit' aria-label='Strings crossing the gate' ref={root}>
      <div className='lg-transit'>
        <div className='lg-transit-head' data-reveal>
          <span>in — English source</span>
          <span>out — translated, locale-stamped</span>
        </div>
        <div className='lg-transit-rows'>
          {ROWS.map((row) => (
            <div className='lg-transit-row' data-reveal key={row.locale}>
              <span className='lg-transit-en'>{row.en}</span>
              <span className='lg-transit-gate' aria-hidden>
                <i className='lg-transit-node' />
              </span>
              <span className='lg-transit-tr'>
                <b className='lg-transit-loc'>{row.locale}</b>
                <span dir={row.rtl ? 'rtl' : undefined}>{row.tr}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
