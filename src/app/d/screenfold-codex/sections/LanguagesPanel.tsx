'use client';

import { useRef } from 'react';

import { SUPPORTED_LOCALES } from '@/app/d/production/sections/locales-data';

import BarDot from '../components/BarDot';
import Chip from '../components/Chip';
import GlyphBlock from '../components/GlyphBlock';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { LOCALES_URL, RTL_CODES, SCRIPT_CODES, SIGNS, VARIANT_ROWS, leaf } from '../data';

/**
 * Leaf four: languages as material. A grid of sixteen script tiles, each
 * the language named in itself with its own `lang` and `dir`, a flag chip,
 * and a small glyph block; the variants ledger with regional flag chips
 * and the zh-Hans and zh-Hant tell ringed in the accent; the roster as a
 * tablet grid of every locale tag the API lists; and the count line with
 * both figures in bar and dot.
 */
const LEAF = leaf('languages');

const BY_CODE = new Map(SUPPORTED_LOCALES.map((row) => [row.code, row]));

/** The corner marks' densities, all tiers the screen defines. */
const MARK_TIERS: readonly number[] = [3, 4, 5, 6, 8];

const TELL = new Set(['zh-Hans', 'zh-Hant']);

export default function LanguagesPanel() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={LEAF.n} fold={LEAF.fold} sign={LEAF.sign} id={LEAF.id}>
        <Register className='is-head'>
          <h2 className='sfc-h2' data-reveal>
            100+ languages, and the variants that matter
          </h2>
          <p className='sfc-lead' data-reveal>
            zh-Hant is not zh-Hans. Both ship.
          </p>
        </Register>

        <Register>
          <ul className='sfc-scripts' data-reveal>
            {SCRIPT_CODES.map((code, i) => {
              const row = BY_CODE.get(code);
              if (row === undefined) return null;
              return (
                <li className='sfc-script' key={code}>
                  <GlyphBlock
                    className='sfc-script-mark'
                    motif={SIGNS[i % SIGNS.length]?.motif ?? 'fret'}
                    tier={MARK_TIERS[i % MARK_TIERS.length] ?? 4}
                    size={22}
                  />
                  <b className='sfc-script-name' lang={code} dir={RTL_CODES.has(code) ? 'rtl' : 'ltr'}>
                    {row.nativeName}
                  </b>
                  <span className='sfc-script-foot'>
                    <Chip code={code} />
                    <span className='sfc-script-en'>{row.name}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Register>

        <Register className='is-variants'>
          <div className='sfc-variants' data-reveal>
            <ul className='sfc-ledger is-variants'>
              {VARIANT_ROWS.map((row) => (
                <li className='sfc-ledger-row' key={row.tag}>
                  <Chip code={row.tag} />
                  <span className='sfc-ledger-name'>{row.name}</span>
                  <span className='sfc-ledger-chips'>
                    {row.variants.map((variant) => (
                      <Chip code={variant} key={variant} plain={TELL.has(variant)} tell={TELL.has(variant)} />
                    ))}
                  </span>
                </li>
              ))}
              <li className='sfc-ledger-row is-tail'>
                <span aria-hidden='true' />
                <span className='sfc-ledger-name is-muted'>and the long tail</span>
                <span className='sfc-ledger-chips is-muted'>
                  <span className='sfc-tail'>
                    <Chip code='cnr' plain /> Montenegrin
                  </span>
                  <span className='sfc-tail'>
                    <Chip code='cy' plain /> Welsh
                  </span>
                </span>
              </li>
            </ul>
            <aside className='sfc-counts'>
              <div className='sfc-count'>
                <BarDot n={78} scale={1} label='Seventy-eight in bar and dot numerals' />
                <span className='sfc-count-figure'>78</span>
                <span className='sfc-count-cap'>base languages</span>
              </div>
              <div className='sfc-count'>
                <BarDot n={129} scale={1} label='One hundred twenty-nine in bar and dot numerals' />
                <span className='sfc-count-figure'>129</span>
                <span className='sfc-count-cap'>distinct locale tags</span>
              </div>
            </aside>
          </div>
        </Register>

        <Register className='is-roster'>
          <div data-reveal>
            <h3 className='sfc-reg-title'>The roster, as the API lists it</h3>
            <ul className='sfc-roster'>
              {SUPPORTED_LOCALES.map((row) => (
                <li className='sfc-roster-cell' key={row.code}>
                  <code title={row.name}>{row.code}</code>
                </li>
              ))}
            </ul>
            <div className='sfc-acts is-end'>
              <a className='sfc-btn' href={LOCALES_URL} rel='noreferrer' target='_blank'>
                Browse All Supported Locales
              </a>
              <span className='sfc-note'>
                Every variant negotiated per request · served from the edge
              </span>
            </div>
          </div>
        </Register>
      </Panel>
    </div>
  );
}
