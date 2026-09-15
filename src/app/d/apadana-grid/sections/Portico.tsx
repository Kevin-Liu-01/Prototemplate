'use client';

/**
 * The portico: the hero as a 6 by 2 column plan. The front and back rows of
 * six bases stand on the field's top and bottom axes; the claim spans the
 * three central bays between them; the two outer bays are sun-disk plates
 * in ordered dither. The capitals stand over the front row and hang under
 * the back row as pure arcs. The install command sits in the back aisle,
 * mirroring the capitals in the front one. Under the plan: the sub with the
 * GT wordmark inline, the two acts, and the trust register of six marks.
 *
 * Motion: the one morphing word swaps its text, lang and dir on a paused
 * GSAP timeline that a ScrollTrigger plays while the portico is on screen.
 * The word slides, never fades; at rest it reads "language" in full. Under
 * reduced motion the timeline is never built.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { GtMark } from '@/components/viewer/GtMark';
import { prefersReducedMotion } from '@/lib/dither';

import { CUSTOMERS, DOCS_URL, EVERY, HERO_SUB, INSTALL_COMMAND, SIGNIN_URL, TRUST_LEAD } from '../data';
import { sunDisk, useDither } from '../fields';
import { CopyButton } from './CopyButton';
import { Capitals } from './deco/Capitals';
import { Bay, Hall, Row } from './deco/Hall';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HOLD = 2.4;

export function Portico() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLElement>(null);
  const left = useDither(sunDisk, { scale: 3, fps: 12 });
  const right = useDither(sunDisk, { scale: 3, fps: 12 });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const em = word.current;
      const section = root.current;
      if (!em || !section) return;
      let index = 0;
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: HOLD });
      tl.to(em, { y: -12, duration: 0.24, ease: 'power2.in' })
        .add(() => {
          index = (index + 1) % EVERY.length;
          const next = EVERY[index] ?? EVERY[0];
          if (!next) return;
          em.textContent = next.text;
          em.lang = next.lang;
          em.dir = next.rtl ? 'rtl' : 'ltr';
        })
        .set(em, { y: 12 })
        .to(em, { y: 0, duration: 0.34, ease: 'power2.out' });
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        end: 'bottom 10%',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
      return () => {
        trigger.kill();
        tl.kill();
      };
    },
    { scope: root }
  );

  return (
    <section className='apg-hall is-portico' id='top' ref={root} aria-labelledby='apg-claim'>
      <Hall
        cols={5}
        base={56}
        className='is-portico'
        over={
          <>
            <Capitals count={6} />
            <div className='apg-incant'>
              <code>{INSTALL_COMMAND}</code>
              <CopyButton text={INSTALL_COMMAND} label='Copy command' />
            </div>
          </>
        }
      >
        <Row>
          <Bay className='is-plate'>
            <canvas ref={left} className='apg-plate' aria-hidden='true' />
          </Bay>
          <Bay className='is-claim' span={3}>
            <h1 id='apg-claim'>
              Your product speaks every{' '}
              <em ref={word} className='apg-word' lang='en' dir='ltr'>
                language
              </em>
              .
            </h1>
          </Bay>
          <Bay className='is-plate'>
            <canvas ref={right} className='apg-plate' aria-hidden='true' />
          </Bay>
        </Row>
      </Hall>

      <div className='apg-thresh is-after is-hero'>
        <p className='apg-sub'>
          <span className='apg-wordmark'>
            <GtMark width={22} height={14} />
            General Translation
          </span>{' '}
          {HERO_SUB}
        </p>
        <div className='apg-acts'>
          <a className='apg-btn is-solid' href={SIGNIN_URL}>
            Get Started
          </a>
          <a className='apg-btn is-line' href={DOCS_URL}>
            Docs
          </a>
        </div>
      </div>

      <div className='apg-trust'>
        <p className='apg-trust-lead'>{TRUST_LEAD}</p>
        <div className='apg-trust-row'>
          {CUSTOMERS.map((customer) => (
            <a className='apg-trust-cell' href={customer.href} key={customer.id}>
              <i className={`apg-wm is-${customer.id}`} role='img' aria-label={customer.name} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
