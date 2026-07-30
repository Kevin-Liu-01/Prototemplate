'use client';

import Image from 'next/image';

import PrismaticField from '@/components/shared/PrismaticField';

import KineticText from '../components/KineticText';
import Reveal from '../components/Reveal';
import { FOOTER_COLUMNS } from '../lib/content';

/** Closing CTA over the second prismatic burst, then the footer. */
export default function Closing() {
  return (
    <>
      <section className='kv-sect kv-closing' id='cta' aria-label='Get started'>
        <PrismaticField
          className='kv-prism kv-prism-cta'
          preset='2'
          params={{ exposureScale: 6400 }}
          speed={0.28}
        />
        <div className='kv-closing-dim' aria-hidden />
        <div className='kv-sect-inner'>
          <h2 className='kv-display kv-display-xl'>
            <KineticText text='Deploy today' intro='scroll' />
            <br />
            <KineticText text='in every language' intro='scroll' />
          </h2>
          <Reveal>
            <p className='kv-lede kv-lede-center'>
              Talk to an engineer about implementation or get started for free — for your next
              1,000,000,000 users.
            </p>
            <div className='kv-hero-ctas kv-hero-ctas-center'>
              <a className='kv-btn kv-btn-solid' href='#top'>
                <span className='kv-iri' aria-hidden />
                Get a Demo
              </a>
              <a className='kv-btn kv-btn-ghost' href='#top'>
                Sign Up
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className='kv-footer'>
        <div className='kv-foot-grid'>
          <div className='kv-foot-brand'>
            <span className='kv-brand'>
              <span className='kv-brand-mark'>
                <Image
                  src='/brand/no-bg-gt-logo-dark.png'
                  alt=''
                  width={1198}
                  height={1198}
                  aria-hidden
                />
              </span>
              <span className='kv-brand-name'>General Translation</span>
            </span>
            <p>
              SOC 2 TYPE II · GDPR · ISO 27001
              <br />
              LANGUAGE INFRASTRUCTURE
              <br />
              FOR THE INTERNET
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div className='kv-foot-col' key={column.title}>
              <h4>{column.title}</h4>
              {column.links.map((link) => (
                <a href='#top' key={link}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className='kv-foot-bottom'>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
          <span>EST. 2023 · SF · 118 LOCALES</span>
        </div>
      </footer>
    </>
  );
}
