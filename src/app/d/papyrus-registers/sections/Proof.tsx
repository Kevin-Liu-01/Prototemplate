'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { prefersReducedMotion } from '@/lib/dither';

import { HELLOS, NEXT_SAMPLE } from '../data';
import Chip from './Chip';
import CodeRegister from './CodeRegister';
import ColumnHead from './ColumnHead';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The proof of the T component. The rubric column on the left holds the
 * source: the shipped Next.js sample with its strings and T tags in red,
 * the two install commands under it. Beside it, twelve ruled cells of
 * black ink carry the same string rendered per locale, each with its flag
 * chip as a marginal mark. When the register enters the viewport the cells
 * fill in one after another, once; under reduced motion they stand.
 */
export default function Proof() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cells = gsap.utils.toArray<HTMLElement>('.pr-hello', root.current);
      if (cells.length === 0 || !list.current) return;
      gsap.set(cells, { autoAlpha: 0, y: 6 });
      ScrollTrigger.create({
        trigger: list.current,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(cells, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.04, ease: 'power2.out' });
        },
      });
    },
    { scope: root }
  );

  return (
    <section className='pr-col' id='proof' ref={root} aria-labelledby='pr-proof-title'>
      <ColumnHead
        n={2}
        id='pr-proof-title'
        title='The T component'
        sub='Wrap the source once. Each locale renders the same node in its own language, from the same deploy.'
      />

      <div className='pr-reg pr-proof'>
        <div className='pr-proof-src'>
          <span className='pr-label'>source · en</span>
          <CodeRegister file='app/page.tsx' code={NEXT_SAMPLE} />
          <ul className='pr-installs' aria-label='Install'>
            <li>
              <code>npm i gt-next</code>
            </li>
            <li>
              <code>npx gt@latest</code>
            </li>
          </ul>
        </div>

        <ol className='pr-hellos' ref={list} aria-label='The source string rendered per locale'>
          {HELLOS.map((hello) => (
            <li className='pr-hello' key={hello.code}>
              <span className='pr-hello-mark'>
                <Chip code={hello.code} />
              </span>
              <span className='pr-hello-text' lang={hello.lang} dir={hello.dir}>
                {hello.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
