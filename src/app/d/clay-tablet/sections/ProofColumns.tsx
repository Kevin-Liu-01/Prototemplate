'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import type { ReactNode } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { PROOF_LOCALES } from './content';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DWELL = 2.4;

/**
 * The proof tablet's columns: the source panel (server-rendered, passed in)
 * in the first column, then one column per locale, each headed by its flag
 * seal and carrying the three outputs of the sample. Every column is
 * complete at rest; the one additive motion is the lapis edge that moves
 * from seal to seal, marking the locale being served, on a paused timeline
 * played while the tablet is in view.
 */
export type ProofColumnsProps = { source: ReactNode };

export default function ProofColumns({ source }: ProofColumnsProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const scope = root.current;
      if (!scope) return;
      const columns = [...scope.querySelectorAll<HTMLElement>('.ct-proof-loc')];
      if (columns.length === 0) return;

      const activate = (index: number) => {
        columns.forEach((column, i) => {
          if (i === index) column.dataset.on = 'true';
          else delete column.dataset.on;
        });
      };

      const tl = gsap.timeline({ paused: true, repeat: -1 });
      columns.forEach((_, i) => {
        tl.call(activate, [i], i * DWELL);
      });
      tl.to({}, { duration: DWELL }, (columns.length - 1) * DWELL);

      const st = ScrollTrigger.create({
        trigger: scope,
        start: 'top 88%',
        end: 'bottom 12%',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
      if (st.isActive) tl.play();
    },
    { scope: root }
  );

  return (
    <div className='ct-cols ct-proof-cols' ref={root}>
      <div className='ct-col ct-proof-src'>{source}</div>
      {PROOF_LOCALES.map((locale, i) => (
        <div
          className='ct-col ct-proof-loc'
          data-on={i === 0 ? 'true' : undefined}
          lang={locale.code}
          dir={locale.dir}
          key={locale.code}
        >
          <div className='ct-proof-seal' dir='ltr'>
            <LocaleTag code={locale.code} className='ct-lct' />
          </div>
          <dl className='ct-proof-rows'>
            <div className='ct-proof-row'>
              <dt dir='ltr'>h1</dt>
              <dd>{locale.hello}</dd>
            </div>
            <div className='ct-proof-row'>
              <dt dir='ltr'>DateTime</dt>
              <dd>{locale.date}</dd>
            </div>
            <div className='ct-proof-row'>
              <dt dir='ltr'>Num</dt>
              <dd>{locale.num}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
