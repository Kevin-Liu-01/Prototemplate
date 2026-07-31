'use client';

import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { useQuietReveal } from './reveal';

import './pricing-v2.css';

const STARTER_FEATURES = [
  'Unlimited users, projects, and languages',
  'Every SDK and the translation CLI',
  'Dashboard, glossaries, and the editor',
  'Locadex agent runs on your repo',
  'GitHub integration',
  'Usage limits with a hard cap you set',
];

const ENTERPRISE_FEATURES = [
  'Forward-deployed engineers',
  'Custom workflows for any format or framework',
  'Shared context across projects',
  'SSO, RBAC, and webhooks',
  'Custom SLA and volume pricing',
  'SOC 2 Type II, GDPR, ISO 27001',
];

/**
 * The conversion run that closes the page: the plans ruled onto the sheet
 * (two equal columns inside one fully-extended frame), then Theo's quote as
 * a dark plate ruled onto the same sheet — his real avatar beside the
 * attribution — then the final ask on the dark band, lit from behind by the
 * page's one light source. Three sections from one component so the page
 * shell stays untouched; each gets its own quiet-reveal scope.
 */
export default function Pricing() {
  const plansRef = useRef<HTMLElement>(null);
  const proofRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);
  useQuietReveal(plansRef);
  useQuietReveal(proofRef);
  useQuietReveal(closeRef);

  return (
    <>
      <section className='tc-sec tcpv-sec' id='pricing' ref={plansRef}>
        <div className='tc-head tcpv-head'>
          <div>
            <h2 data-reveal>Pricing for everyone.</h2>
            <p data-reveal>Full-stack localization across buildtime, runtime, and review.</p>
          </div>
          <p className='tc-mono tcpv-head-meta' data-reveal>
            Usage-based · Not per seat
          </p>
        </div>

        {/* the ruled sheet: the frame's rules are drawn by full-bleed pseudo
            bands on .tcpv-plans and clipped here, so every line runs to the
            sheet's edges */}
        <div className='tcpv-sheet' data-reveal>
          <div className='tcpv-plans'>
            <article className='tcpv-card is-star'>
              <header className='tcpv-top'>
                <h3>Starter</h3>
                <span className='tcpv-tag'>Start free</span>
              </header>
              <div className='tcpv-price'>
                <span className='tcpv-num'>$0</span>
                <span className='tcpv-per'>
                  <b>/ month</b>
                  plus published usage rates
                </span>
              </div>
              <p className='tcpv-def'>
                Everything included — the gate is a payment method, not a feature list.
              </p>
              <ul className='tc-list'>
                {STARTER_FEATURES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className='tcpv-acts'>
                <a className='tc-btn tc-btn-solid' href='#top'>
                  Get started
                </a>
              </div>
            </article>

            <article className='tcpv-card is-ent'>
              <header className='tcpv-top'>
                <h3>Enterprise</h3>
              </header>
              <div className='tcpv-price'>
                <span className='tcpv-num is-custom'>Custom</span>
                <span className='tcpv-per'>
                  <b>annual</b>
                  scoped to your volume
                </span>
              </div>
              <p className='tcpv-def'>
                Talk to an engineer about implementation, volume, and your security review.
              </p>
              <ul className='tc-list'>
                {ENTERPRISE_FEATURES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className='tcpv-acts'>
                <a className='tc-btn tc-btn-line' href='#top'>
                  Contact us
                </a>
              </div>
            </article>
          </div>

          <div className='tcpv-compare'>
            <a href='/d/toolchain/pricing'>
              Compare plans and usage pricing
              <ArrowUpRight className='tc-ico-arrow' aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section className='tc-sec tcpq-sec' id='proof' ref={proofRef}>
        <div className='tcpq-wrap' data-reveal>
          <figure className='tcpq-mat'>
            <div className='tcpq-plate'>
              <div className='tcpq-meta'>
                <a
                  href='https://x.com/theo/status/2008302190168019187'
                  target='_blank'
                  rel='noreferrer'
                >
                  x.com/theo
                  <ArrowUpRight aria-hidden />
                </a>
              </div>
              <blockquote className='tcpq-quote'>
                <p>Every once in awhile, I see a snippet of code that makes me a bit emotional.</p>
                <p>
                  Now is one of those moments. Internationalization went from <em>“$%!# this”</em>{' '}
                  to <em>“trivial”</em>.
                </p>
              </blockquote>
              <figcaption className='tcpq-attr'>
                <img
                  className='tcpq-face'
                  src='/brand/theo.png'
                  alt='Theo'
                  width={48}
                  height={48}
                  loading='lazy'
                />
                <span className='tcpq-who'>
                  <span className='tcpq-name'>Theo</span>
                  <span className='tcpq-role'>CEO, T3Chat</span>
                </span>
                <a
                  href='https://x.com/theo/status/2008302190168019187'
                  target='_blank'
                  rel='noreferrer'
                >
                  View the post
                  <ArrowUpRight aria-hidden />
                </a>
              </figcaption>
            </div>
          </figure>
        </div>
      </section>

      <section className='tc-sec tcpx' id='start' ref={closeRef}>
        {/* the page's one light source, burning behind the final ask; the
            engine is a shared singleton and ships its own reduced-motion
            still, so the band reads the same as a freeze frame */}
        <PrismaticField className='tcpx-field' preset='1' speed={0.45} params={{ exposureScale: 1900 }} />
        <div className='tcpx-in'>
          <div className='tcpx-copy'>
            <p className='tcpx-kick' data-reveal>
              Reach every user
            </p>
            <h2 data-reveal>Deploy today in every language.</h2>
            <p className='tcpx-sub' data-reveal>
              Talk to an engineer about implementation, or get started for free.
            </p>
          </div>
          <div className='tcpx-acts' data-reveal>
            <a className='tc-btn tc-btn-solid' href='#top'>
              Get started
            </a>
            <a className='tc-btn tc-btn-line' href='#top'>
              Get a demo
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
