'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useRef, useState } from 'react';

import InterferenceField from './InterferenceField';
import { HERO_STATS, ROTATIONS, SLOTS, type WrCard } from './wr-content';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Six names in one weight read as a word list, so each is set as its own
 * typographic mark — weight, case, size and tracking are the only variables,
 * and they stay inside the page's two faces. The row is ruled into six cells so
 * the two hairlines bracketing the band bound a table rather than a sentence.
 */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/**
 * One product surface adrift on a shelf. Every variant is a paper-filled
 * hairline chip in the shell's own card language: opaque, so a card seated on
 * the band's fringes occludes the arcs behind it cleanly instead of letting
 * hairlines strike through its text.
 */
function CardView({ card }: { card: WrCard }) {
  switch (card.kind) {
    case 'nav':
      return (
        <span className='wr-c wr-c-nav'>
          {card.items.map((item, i) => (
            <span key={item}>
              {i > 0 && <i className='wr-c-sep'>/</i>}
              {item}
            </span>
          ))}
        </span>
      );

    case 'line':
      return <span className='wr-c wr-c-line'>{card.text}</span>;

    case 'toast':
      /* dir on the chip itself: the RTL pair mirrors for real — flex order,
         tick side and punctuation all flip with the script. */
      return (
        <span className='wr-c wr-c-toast' dir={card.dir} lang={card.lang}>
          <i className='wr-c-tick' />
          {card.label}
        </span>
      );
  }
}

/**
 * Wide Rule hero — 100svh of paper worked as a film still.
 *
 * The composition is two ruled lines and one event: a vertical rule at 50%, a
 * horizontal rule on the 36% axis, a circular gate mark at their crossing
 * (the page's only circle), and an analytic interference band breathing along
 * the axis. The shader's anti-phased pair sits ON the gate, so its fringes
 * radiate along the corridor from the mark itself, and the pair's bisector
 * null — a compact seam through the gate, aimed at the measured headline
 * block — parts the band exactly where the composition needs its void: the
 * calm is the physics' own doing (see ../lib/interference.ts). Everything
 * else is doctrine from the source still: mirrored EN/translated shelves, a
 * 1.5s power3 settle, 16–29s unsynchronized drifts, and nothing ever caught
 * mid-gesture.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* A. the settle — the composition settles in rather than arriving. */
      gsap.from('[data-settle]', {
        autoAlpha: 0,
        y: 22,
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.13,
        delay: 0.15,
      });
      gsap.from('[data-gate]', {
        autoAlpha: 0,
        scale: 0.85,
        duration: 1.8,
        ease: 'power3.out',
        delay: 0.35,
      });
      /* Shelves fade rather than rise: their y belongs to the drift loops
         below from frame one, so the entrance must not contest it. */
      gsap.from('.wr-slot', {
        autoAlpha: 0,
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.13,
        delay: 0.3,
      });

      /* B. perpetual depth drift — every slot on its own long period, signs
         alternating, so the field is alive without any two pieces ever
         moving together. The inner opacity breathe runs at 0.62× the position
         period so the two never phase-lock. */
      const loops: gsap.core.Tween[] = [];
      const slots = gsap.utils.toArray<HTMLElement>('.wr-slot', root.current);
      for (const slot of slots) {
        const drift = Number(slot.dataset.drift ?? 8);
        const dur = Number(slot.dataset.dur ?? 20);
        loops.push(
          gsap.to(slot, { y: drift, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1 })
        );
        const inner = slot.firstElementChild;
        if (inner) {
          loops.push(
            gsap.to(inner, {
              opacity: '-=0.05',
              duration: dur * 0.62,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
          );
        }
      }
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          for (const loop of loops) {
            if (self.isActive) loop.play();
            else loop.pause();
          }
        },
      });

      /* C. parallax exit — the registration lifts as one unit, faster than
         the shelves, which is what sells the depth between them. */
      gsap.to('[data-para-far]', {
        y: -72,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-para-near]', {
        y: -30,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      /* D. the one live word — ~3s cadence, out faster than in. The fade
         floors at 0.25 instead of 0: the swap happens at the dim point, so a
         frame grabbed mid-swap still shows a word, never a hole in the
         sentence — film-still doctrine applied to 0.75 seconds. */
      const rot = root.current?.querySelector<HTMLElement>('[data-rot]');
      if (rot) {
        let idx = 0;
        const swap = () => {
          if (!root.current || !root.current.isConnected) return;
          gsap.to(rot, {
            opacity: 0.25,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              idx = (idx + 1) % ROTATIONS.length;
              rot.textContent = ROTATIONS[idx] ?? 'Spanish';
              gsap.to(rot, { opacity: 1, duration: 0.45, ease: 'power2.out' });
            },
          });
          gsap.delayedCall(2.8, swap);
        };
        gsap.delayedCall(2.8, swap);
      }
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='wr-hero'>
        {/* The registration layer: field, two rules, gate. Lifted as one unit
            on exit so the crosshair never separates from its band. */}
        <div className='wr-scene' data-para-far>
          <InterferenceField
            className='wr-field'
            nullRef={copyRef}
            speed={1}
            params={{ lambda: 84, pairSep: 0.5, axis: 0.36, band: 0.14, ghost: 0.1 }}
            /* Narrow flanks are short, so the antinodal window covers most of
               their arc length — the accent must come down with the width or
               the phone band reads tinted instead of struck; the light scales
               (falloff, halo, bloom) tighten with it so the phone corridor
               still decays visibly inside its half-width. */
            narrowParams={{
              lambda: 64,
              axis: 0.34,
              band: 0.12,
              ghost: 0.1,
              accentAmt: 0.3,
              falloff: 320,
              haloRadius: 110,
              bloomRadius: 38,
            }}
            /* The dark exposure is the same event re-photographed: white ink
               rides a lifted-slate corridor (dark paper has headroom, so the
               band of light can sit ~10% up where paper only allows ~2%), the
               bloom cools toward the plate's own blue-white, and the pressed
               frame needs a deeper multiplicative bite to register against
               near-black. */
            darkParams={{
              ink: [1, 1, 1],
              paper: [0.086, 0.09, 0.114],
              inkAlpha: 0.5,
              accentAmt: 0.7,
              coreLift: 0.5,
              shimmer: 0.11,
              glow: [0.3, 0.33, 0.43],
              bloomColor: [0.94, 0.96, 1.0],
              bloom: 0.85,
              press: 0.24,
            }}
          />
          <span className='wr-guide-h' aria-hidden />
          <span className='wr-guide-v' aria-hidden />
          <div className='wr-gate' data-gate>
            <Image
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={26}
              height={26}
            />
          </div>
        </div>

        {/* The shelves: English left, the same surface translated right,
            mirrored about the 50% rule. Atmosphere, so hidden from readers —
            the argument's real copy lives in the sections below. */}
        <div className='wr-shelves' data-para-near aria-hidden>
          {SLOTS.map((slot) => {
            const vars: StyleVars = {
              '--x': `${slot.x}%`,
              '--y': `${slot.y}%`,
              '--sc': slot.scale,
            };
            if (slot.mobile) {
              vars['--mx'] = `${slot.mobile.x}%`;
              vars['--my'] = `${slot.mobile.y}%`;
              vars['--msc'] = slot.mobile.scale;
            }
            const cls = [
              'wr-slot',
              slot.wide ? 'wr-slot--wide' : '',
              slot.low ? 'wr-slot--low' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div
                className={cls}
                key={slot.id}
                data-drift={slot.drift}
                data-dur={slot.dur}
                style={vars}
              >
                <div className='wr-slot-in' style={{ opacity: slot.opacity }}>
                  {slot.locale ? <span className='wr-slot-loc'>{slot.locale}</span> : null}
                  <CardView card={slot.card} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Content gravity is the bottom of the frame: headline low-left in
            the null, stats hung off the 50% rule to the right. */}
        <div className='wr-lower'>
          <div className='wr-copy' ref={copyRef}>
            <h1 data-settle>
              <span>Launch in</span>
              <span>
                <em>every</em> language.
              </span>
            </h1>
            {/* The live word ends the sentence so its 2.8s swaps only grow the
                last line — mid-sentence it re-wrapped the subhead, which is
                exactly the mid-gesture flicker this frame is not allowed. */}
            <p className='wr-sub' data-settle>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites — live on day one in{' '}
              <span className='wr-rot' data-rot>
                Spanish
              </span>
              .
            </p>
            <div className='wr-acts' data-settle>
              <a className='tc-btn tc-btn-solid' href='#pricing'>
                Get started
              </a>
              <a className='tc-btn tc-btn-line' href='#frameworks'>
                Docs
              </a>
              <button className='tc-copy' type='button' onClick={copy}>
                <span>$ npx gt@latest</span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <dl className='wr-stats' data-settle>
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className='tc-trust'>
        <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
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
