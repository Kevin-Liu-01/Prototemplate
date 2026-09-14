'use client';

import { useRef, useState } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { GtMark } from '@/components/viewer/GtMark';
import { prefersReducedMotion } from '@/lib/dither';

import { BELT, CLAIM, CLAIM_ROSTER, LINKS } from '../data';
import type { Shaped } from '../data';
import { Chip } from './Chip';
import { CopyButton } from './CopyButton';
import { SunDisk } from './deco/SunDisk';
import { Band, Register } from './Register';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Register I. The upper register of the stele: the claim incised in the
 * first band, the same claim in a living script in the second, the served
 * interface in the third. Bands two and three follow one clock: every few
 * seconds the shaped node fades, takes the next locale's text, lang and
 * dir, and returns, and the interface beside it re-renders in that
 * locale. The five locales are the ones the belt serves both the claim
 * and the button label for.
 */
const HERO_LOCALES = ['ja', 'es', 'de', 'fr', 'zh'] as const;

const BUTTON_ROW = BELT.find((row) => row.source === 'Get started');

function shapedFor(loc: string): Shaped {
  return CLAIM_ROSTER.find((word) => word.lang === loc) ?? CLAIM;
}

function buttonFor(loc: string): string {
  return BUTTON_ROW?.outputs.find((out) => out.loc === loc)?.text ?? BUTTON_ROW?.source ?? '';
}

const COMMAND = 'npx gt@latest';

export function Claim() {
  const stage = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const targets = [line.current, face.current].filter((el): el is HTMLDivElement => el !== null);
      if (targets.length === 0) return;
      const tl = gsap.timeline({ paused: true, repeat: -1 });
      tl.to({}, { duration: 2.6 })
        .to(targets, { autoAlpha: 0, duration: 0.28, ease: 'power1.in' })
        .call(() => setIndex((n) => (n + 1) % HERO_LOCALES.length))
        .to(targets, { autoAlpha: 1, duration: 0.36, ease: 'power1.out' });
      const trigger = ScrollTrigger.create({
        trigger: stage.current,
        start: 'top 92%',
        end: 'bottom 8%',
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
    { scope: stage }
  );

  const active = HERO_LOCALES[index] ?? HERO_LOCALES[0];
  const word = shapedFor(active);
  const button = buttonFor(active);
  const dir = word.dir ?? 'ltr';

  return (
    <Register id='claim' numeral='I' name='The claim'>
      <Band className='is-claim'>
        <div className='tr-crown' aria-hidden='true'>
          <span className='tr-crown-bar' />
          <SunDisk />
          <span className='tr-crown-bar' />
        </div>
        <h1 className='tr-h1' lang={CLAIM.lang} data-cut>
          {CLAIM.text}
        </h1>
        <p className='tr-sub is-hero' data-cut>
          <span className='tr-wordmark'>
            <GtMark width={20} height={13} />
            <span>General Translation</span>
          </span>{' '}
          builds full-stack infrastructure for localizing apps, docs, and websites
        </p>
        <div className='tr-acts' data-cut>
          <a className='tr-act is-solid' href={LINKS.signin}>
            Get Started
          </a>
          <a className='tr-act is-line' href={LINKS.docs}>
            Docs
          </a>
          <span className='tr-cmd'>
            <code>{COMMAND}</code>
            <CopyButton text={COMMAND} />
          </span>
        </div>
      </Band>

      <Band label='the same claim · in a living script' className='is-demotic'>
        <div className='tr-demotic' ref={stage}>
          <div className='tr-demotic-line' ref={line}>
            <p className='tr-demotic-text' lang={word.lang} dir={dir}>
              {word.text}
            </p>
            <Chip code={word.lang} />
          </div>
        </div>
      </Band>

      <Band label='the interface · served from the edge' className='is-face'>
        <div className='tr-face'>
          <div className='tr-face-src'>
            <p className='tr-face-key'>source · en</p>
            <code>
              <span className='tr-tok-tag'>{'<T>'}</span>
              <span className='tr-tok-str'>{CLAIM.text}</span>
              <span className='tr-tok-tag'>{'</T>'}</span>
            </code>
            <code>
              <span className='tr-tok-tag'>{'<T>'}</span>
              <span className='tr-tok-str'>{BUTTON_ROW?.source ?? ''}</span>
              <span className='tr-tok-tag'>{'</T>'}</span>
            </code>
          </div>
          <div className='tr-face-out' ref={face}>
            <div className='tr-face-bar'>
              <span className='tr-face-route'>/{active}</span>
              <Chip code={active} />
            </div>
            <div className='tr-face-page' lang={word.lang} dir={dir}>
              <p className='tr-face-h'>{word.text}</p>
              <span className='tr-face-btn'>{button}</span>
            </div>
          </div>
        </div>
      </Band>
    </Register>
  );
}
