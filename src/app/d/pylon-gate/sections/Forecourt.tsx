'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import EverySentence, { type EverySentenceHandle } from '@/components/shared/EverySentence';

import CopyButton from './CopyButton';
import Crown from './deco/Crown';
import Pylon from './deco/Pylon';
import GtWordmark from './GtWordmark';
import { CUSTOMERS, HERO_ORDER, HERO_WORDS, HREF } from './data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The forecourt. Two battered pylon masses frame the passage; on the axis
 * sit the disk-and-bars crown, the claim as one shaped morphing text node,
 * the sub with the wordmark inline, the two actions and the command. The
 * pylons stand on the floor register that carries the six customer marks.
 *
 * One clock: a paused GSAP timeline calls the sentence engine every beat
 * while the section is on screen and stops when it leaves. Under reduced
 * motion no timeline is built and the English sentence is the still.
 */
const BEAT = 3.6;
const COMMAND = 'npx gt@latest';

export default function Forecourt() {
  const root = useRef<HTMLElement>(null);
  const every = useRef<EverySentenceHandle>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const section = root.current;
      if (section === null) return;

      const tl = gsap.timeline({ paused: true, repeat: -1 });
      HERO_ORDER.forEach((loc, i) => {
        if (i === 0) return;
        tl.call(() => every.current?.setLocale(loc), [], i * BEAT);
      });
      tl.call(() => every.current?.setLocale(HERO_ORDER[0] ?? 'en'), [], HERO_ORDER.length * BEAT);

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
    },
    { scope: root }
  );

  return (
    <section className='pg-court pg-fore' id='top' ref={root}>
      <div className='pg-passage'>
        <div className='pg-gate'>
          <Pylon side='l' />

          <div className='pg-axis'>
            <Crown />

            <h1>
              <EverySentence hops={1} initial='en' ref={every} words={HERO_WORDS} />
            </h1>

            <p className='pg-sub'>
              <GtWordmark /> builds full-stack infrastructure for localizing apps, docs, and websites
            </p>

            <div className='pg-acts'>
              <a className='pg-btn pg-btn-solid' href={HREF.signIn}>
                Get Started
              </a>
              <a className='pg-btn pg-btn-line' href={HREF.docs} rel='noreferrer' target='_blank'>
                Docs
              </a>
            </div>

            <div className='pg-cmd'>
              <code>{COMMAND}</code>
              <CopyButton text={COMMAND} className='pg-cmd-copy' />
            </div>
          </div>

          <Pylon side='r' />
        </div>

        <div className='pg-trust'>
          <p className='pg-trust-lead'>Cursor, Ramp and Profound ship in over thirty languages</p>
          <ul className='pg-trust-row'>
            {CUSTOMERS.map((customer) => (
              <li key={customer.id}>
                <a aria-label={customer.name} href={customer.href} rel='noreferrer' target='_blank'>
                  <span
                    className={`pg-wm is-${customer.id}`}
                    style={{ width: customer.width, height: customer.height }}
                    aria-hidden='true'
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
