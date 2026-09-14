'use client';

import { useRef } from 'react';

import { GtMark } from '@/components/viewer/GtMark';

import BarDot from '../components/BarDot';
import Claim from '../components/Claim';
import CopyCommand from '../components/CopyCommand';
import GlyphBand from '../components/GlyphBand';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { CUSTOMERS, DOCS, SIGN_IN } from '../data';

/**
 * Leaf one. The upper register carries the claim as one shaped sentence,
 * the sub with the wordmark inline, the two acts and the install command.
 * The middle register is the band of dithered glyph blocks with the
 * language count in the margin, printed in bar and dot beside the figure.
 * The lower register is the trust strip: six customer marks in the ink.
 */
export default function HeroPanel() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={1} fold='a' id='hero' className='is-hero'>
        <Register className='is-head'>
          <h1 className='sfc-h1' data-reveal>
            <Claim />
          </h1>
          <p className='sfc-lead sfc-sub' data-reveal>
            <span className='sfc-wordmark'>
              <GtMark width={22} height={14} />
              <span className='sfc-vh'>General Translation</span>
            </span>
            builds full-stack infrastructure for localizing apps, docs, and websites
          </p>
          <div className='sfc-acts' data-reveal>
            <a className='sfc-btn is-solid' href={SIGN_IN}>
              Get Started
            </a>
            <a className='sfc-btn' href={DOCS} rel='noreferrer' target='_blank'>
              Docs
            </a>
            <CopyCommand text='npx gt@latest' />
          </div>
        </Register>

        <Register className='is-band'>
          <div className='sfc-band-row' data-reveal>
            <GlyphBand />
            <div className='sfc-margin'>
              <BarDot n={100} scale={1.1} label='One hundred in bar and dot numerals' />
              <span className='sfc-margin-figure'>100+</span>
              <span className='sfc-margin-cap'>languages, served from the edge</span>
            </div>
          </div>
        </Register>

        <Register className='is-trust'>
          <p className='sfc-trust-lead' data-reveal>
            Cursor, Ramp and Profound ship in over thirty languages
          </p>
          <ul className='sfc-trust' data-reveal>
            {CUSTOMERS.map((customer) => (
              <li key={customer.name}>
                <span className={`sfc-wm is-${customer.file}`} role='img' aria-label={customer.name} />
              </li>
            ))}
          </ul>
        </Register>
      </Panel>
    </div>
  );
}
