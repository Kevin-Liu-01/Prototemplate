'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import RevealSeam from '@/app/d/toolchain/sections/RevealSeam';

import { Action, Choice } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

gsap.registerPlugin(useGSAP);

type Loc = 'es' | 'ja' | 'de' | 'ar';

/* the rendered string and the payload the build served for it */
const COPY: Record<Loc, { title: string; body: string; rtl?: boolean }> = {
  es: { title: 'Empieza en minutos.', body: 'Publica en cada idioma.' },
  ja: { title: '数分で始められます。', body: 'あらゆる言語で公開できます。' },
  de: { title: 'In Minuten starten.', body: 'In jeder Sprache veröffentlichen.' },
  ar: { title: 'ابدأ خلال دقائق.', body: 'انشر بكل لغة.', rtl: true },
};

const REST = 58;

/**
 * RevealSeam, live: two full-width layers pinned in one box, the rendered
 * interface on top and the served translation file beneath. The seam
 * writes one custom property, --seam-cut, on the box, and the lower layer
 * clips to it, so dragging uncovers the payload in place and nothing moves
 * with the handle. It is a real slider: drag it, or focus it and use the
 * arrow keys. Tour drives the same property from outside with GSAP, which
 * is how a page runs a guided intro.
 */
export default function RevealSeamDemo() {
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const tour = useRef<gsap.core.Timeline | null>(null);
  const [loc, setLoc] = useState<Loc>('es');
  const [cut, setCut] = useState(REST);
  const copy = COPY[loc];
  const payload = `{\n  "hero.title": "${copy.title}",\n  "hero.body": "${copy.body}"\n}`;

  const { contextSafe } = useGSAP({ scope: box });

  const play = contextSafe(() => {
    const el = box.current;
    if (!el) return;
    tour.current?.kill();
    const state = { cut: parseFloat(getComputedStyle(el).getPropertyValue('--seam-cut')) || REST };
    const write = () => {
      el.style.setProperty('--seam-cut', `${state.cut}%`);
      setCut(Math.round(state.cut));
    };
    tour.current = gsap
      .timeline({ onUpdate: write })
      .to(state, { cut: 14, duration: 0.9, ease: 'power2.inOut' })
      .to(state, { cut: 92, duration: 1.4, ease: 'power2.inOut' })
      .to(state, { cut: REST, duration: 0.9, ease: 'power2.inOut' });
  });

  const reset = () => {
    tour.current?.kill();
    box.current?.style.setProperty('--seam-cut', `${REST}%`);
    setCut(REST);
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Locale'
            options={[
              { value: 'es', label: 'es' },
              { value: 'ja', label: 'ja' },
              { value: 'de', label: 'de' },
              { value: 'ar', label: 'ar' },
            ]}
            value={loc}
            onChange={setLoc}
          />
          <Action disabled={reduced} onClick={play} title='Drive the cut from outside the component'>
            Tour
          </Action>
          <Action onClick={reset}>Reset</Action>
          <p className='dmo-bar-status' aria-live='off'>
            Cut at <span className='dmo-num'>{cut}%</span>
          </p>
        </>
      }
      height={240}
      label='A reveal seam between a rendered interface string and its served translation file'
      phoneHeight={260}
      stageClassName='dmo-seam'
      tag={`<RevealSeam defaultCut={${REST}} />`}
    >
      <div className='dmo-seam-box' ref={box} style={{ '--seam-cut': `${REST}%` }}>
        <div className='dmo-seam-main'>
          <span className='dmo-seam-file'>rendered ui</span>
          <p dir={copy.rtl ? 'rtl' : undefined} lang={loc}>
            {copy.title}
            <br />
            {copy.body}
          </p>
        </div>
        <div className='dmo-seam-under' aria-hidden='true'>
          <div className='dmo-seam-under-in'>
            <span className='dmo-seam-file'>public/_gt/{loc}.json</span>
            <pre className='dmo-seam-code'>{payload}</pre>
          </div>
        </div>
        <RevealSeam
          ariaLabel='Reveal the served translation file'
          boxRef={box}
          defaultCut={REST}
          onCutChange={(pct) => setCut(Math.round(pct))}
          onInteract={() => tour.current?.kill()}
        />
      </div>
    </Plate>
  );
}
