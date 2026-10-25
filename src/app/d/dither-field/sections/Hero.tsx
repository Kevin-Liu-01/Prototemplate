'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

import { useCopied } from '@/app/d/toolchain/components/use-copied';

import { startEveryMorph } from '@/app/d/toolchain/sections/every-morph';

import './logos-icons.css';
import { heroTransmission, useDitherField } from '../fields';

import './hero-every.css';

gsap.registerPlugin(useGSAP);

/**
 * THE BROADCAST HERO, on the founder stack — recomposed so the field FILLS
 * its component (the founder's directive, verbatim).
 *
 * Two ranks of surfaces on the shell-grey ground, separated by 1px seams:
 * a SPLIT row — the white copy card (mark, two authored headline lines with
 * the morphing `language` hinge, sub, acts, and the real copyable command)
 * beside the TRANSMISSION PLATE, the hero's media panel — then the trust
 * card below, full width. On mobile the plate stacks under the copy.
 *
 * The plate is the Bayer TRANSMISSION, filled edge to edge: the pinned
 * source greeting docks in a paper pocket on the plate's left edge, squircle
 * wavefronts launch from its fringe and sweep the full width, a fan of thick
 * needle rays carries signal ticks, an ambient print fill inks the far
 * corners, a dithered planet limb grounds the bottom edge — and real
 * greetings with their locale tags materialise out of the dither across the
 * whole component as each front reaches them: the localization story printed
 * by the field itself. One hairline wire passes under the field through the
 * dock, on the shell's rule grammar.
 *
 * The field is 1-bit and theme-following (P2): its ink is the canvas's
 * computed `color` (var(--tc-ink)), re-sampled when data-theme flips — dark
 * mode prints light dust on the ink-black paper, never a white flash.
 *
 * The trust card runs the same material through a glyph mask: all six
 * customer wordmarks rasterised to 1-bit fields, so the first viewport is
 * one process applied twice — to energy and to letterforms.
 */

/* Founder edit: the trust row shows the ACTUAL logo lockups (shared
   logos-icons grammar), undithered — the 1-bit process belongs to the
   transmission plate, not to the customers' marks. */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const { copied, copy } = useCopied('npx gt@latest');

  /* The plate composition: the transmission docked on the left edge, filling
     the component. reducedMotionTime 6.8 is a composed still: two fronts
     mid-plate with a third fading at the far corner, one greeting held
     solid, one mid-dissolve, one mid-assembly. */
  const canvasRef = useDitherField(
    (aspect) => heroTransmission(aspect, { cellScale: 3 }),
    {
      scale: 4,
      ink: '#070707',
      paper: 'transparent',
      fps: 24,
      reducedMotionTime: 6.8,
      themeInk: true,
    }
  );

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.1,
      });

      /* The headline hinge (every-morph.ts): the word after "every" cycles
         through eight scripts while the hero is on screen. */
      const em = root.current?.querySelector<HTMLElement>('[data-every]');
      const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
      return em && word ? startEveryMorph(em, word) : undefined;
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's stack, split: the calm white copy card beside the
          transmission plate — two cards on the shell-grey ground, one 1px
          seam between them; the trust row repeats the card grammar below. */}
      <div className='tch-split'>
        <div className='tc-hero tch-card tch-copy'>
          <Image
            className='tc-hero-mark'
            data-hero-in
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={34}
            height={34}
          />

          {/* Two authored lines rather than a wrap; the accented word opens
              line two, on the hinge of the sentence. */}
          <h1 data-hero-in>
            <span>Your product speaks</span>
            <span>
              every{' '}
              <em data-every>
                <span data-every-word lang='en' dir='ltr'>
                  language
                </span>
              </em>
              .
            </span>
          </h1>

          <p className='tc-hero-sub' data-hero-in>
            General Translation builds full-stack infrastructure for localizing apps, docs, and
            websites.
          </p>

          {/* The acts carry the dev-first device too: the real, copyable
              command sits with the buttons, on calm paper — outside the
              plate, so the field keeps the whole component. */}
          <div className='tc-hero-acts' data-hero-in>
            <a className='tc-btn tc-btn-solid' href='#pricing'>
              Get started
            </a>
            <a className='tc-btn tc-btn-line' href='#frameworks'>
              Docs
            </a>
            <button className='tc-copy df-hero-cmd' type='button' onClick={copy}>
              <span>$ npx gt@latest</span>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* The plate: the hero's media panel, and the field fills ALL of it —
            source dock on the left edge, greetings materialising across the
            component. The one wire passes under the field through the dock. */}
        <div className='df-plate' data-hero-in>
          <span className='df-plate-wire' aria-hidden />
          <canvas className='df-plate-field' ref={canvasRef} aria-hidden />
        </div>
      </div>

      {/* The trust card — six wordmarks through the same 1-bit process as the
          plate above. The claim is the lead; the restraint is the diagram. */}
      <div className='tc-trust tch-trustcard'>
        <p className='tc-trust-lead'>Cursor, Ramp and Profound ship in over thirty languages</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
