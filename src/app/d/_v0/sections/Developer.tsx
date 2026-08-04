'use client';

import { Braces } from 'lucide-react';
import { useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import LocaleRouting from '@/app/d/toolchain/diagrams/LocaleRouting';
import RtlMirror from '@/app/d/toolchain/diagrams/lang/RtlMirror';
import SentenceWidth from '@/app/d/toolchain/diagrams/lang/SentenceWidth';
import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';
import { BentoCell } from '@/components/shell/Bento';

import './developer.css';

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
  return new Intl.PluralRules(locale).resolvedOptions().pluralCategories.length;
}

/** Plural rows carry a count instead of a formatted string: the numeral is
    mono, the words sans, both at the row's one size. */
type LedgerRow = { code: string; value: string } | { code: string; pluralCount: number };

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

/**
 * Built for developers — the Figma DX beat expressed in the sheet's own
 * ledger: a tc-head header cell, then framed bento rows whose seams the row
 * owns, mounting the ORIGINAL diagram components the mock's screenshots were
 * taken from (SentenceWidth, RtlMirror, LocaleRouting). Only the thorny-
 * locale Intl ledger is v0-authored, and it lives inside a framed cell like
 * any other artifact.
 */
export default function V0Developer() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec v0-dev' id='developers' ref={root}>
      <div className='tc-head'>
        <Braces className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Built for developers.</h2>
        <p data-reveal>
          General Translation handles all the infrastructure, so you no longer need to think about
          localization.
        </p>
      </div>

      {/* ---- row 1: the problem — width, then orientation ---- */}
      <div className='tc-row is-lead' data-eq-heads>
        <BentoCell
          cell='is-tall is-framed'
          title='Every locale is a different length'
          sub='One button in four languages, measured by the browser rather than estimated. German runs long, Japanese runs short, and Arabic re-anchors the whole line.'
        >
          <div className='tc-lang is-lead'>
            <SentenceWidth title='The same sentence measured in English, German, Japanese and Arabic' />
          </div>
        </BentoCell>

        <BentoCell
          cell='is-tall is-framed'
          title='Some change your entire orientation'
          sub='GT renders components correctly for every locale — under an RTL locale the whole component mirrors, not just the words.'
        >
          <div className='tc-lang'>
            <RtlMirror title='The same form mirrored under an RTL locale' />
          </div>
        </BentoCell>
      </div>

      {/* ---- row 2: the branches, then the routes ---- */}
      <div className='tc-row is-lead' data-eq-heads>
        <BentoCell
          cell='is-tall is-framed'
          title='Every locale uses different numbers, currencies, dates, plurals, and more'
          sub='GT handles every possible branch and edge case.'
        >
          <div className='v0-dev-ledger'>
            {LEDGER_PANELS.map((panel) => (
              <div className='v0-dev-panel' key={panel.label}>
                <span className='v0-dev-panel-label'>{panel.label}</span>
                {panel.rows.map((row) => (
                  <span className='v0-dev-ledger-row' key={`${panel.label}-${row.code}`}>
                    <LocaleTag code={row.code} />
                    {'value' in row ? (
                      <b>{row.value}</b>
                    ) : (
                      <span className='v0-dev-plural'>
                        <b>{row.pluralCount}</b> plural {row.pluralCount === 1 ? 'form' : 'forms'}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </BentoCell>

        <BentoCell
          cell='is-tall is-framed'
          title='Every locale needs to be routed correctly'
          sub='GT automatically routes your users to the correct SEO-friendly URL path — localizing in French means translating both the pathname and the page.'
        >
          <div className='tc-art-center'>
            <LocaleRouting title='The same page routed for all six configured locales, /fr/a-propos localized, with the detection order beneath' />
          </div>
        </BentoCell>
      </div>
    </section>
  );
}
