'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import ScatterCardView from '../components/ScatterCardView';
import { FLAGS, GLYPHS, HERO_STATS, ROTATIONS, SCATTER, TRUSTED_BY } from '../content';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * The hero is composed as a film still.
 *
 * A band of dispersed light crosses the full page width through the upper
 * middle; everything above and below it is quiet black. A hairline gate sits on
 * the band's axis where the crosshairs meet, product surfaces drift sparsely
 * across the whole width — English left, translated right — and the headline is
 * anchored low and left, well clear of the light.
 *
 * Motion is deliberately slow: nothing here should ever be caught mid-gesture,
 * so a frame grabbed at any moment still reads as a composed still.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* the composition settles in rather than arriving: nothing snaps */
      if (!reduced) {
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
          scale: 0.8,
          duration: 1.8,
          ease: 'power3.out',
          delay: 0.35,
        });
      }

      /* ---- depth drift: every card floats on its own long period, so the
         field is alive without any two pieces ever moving together ---- */
      const slots = gsap.utils.toArray<HTMLElement>('[data-slot]', root.current);
      gsap.set(slots, { xPercent: -50, yPercent: -50 });

      if (!reduced) {
        const loops: gsap.core.Tween[] = [];
        for (const slot of slots) {
          const drift = Number(slot.dataset.drift ?? 8);
          const dur = Number(slot.dataset.dur ?? 20);
          loops.push(
            gsap.to(slot, {
              y: drift,
              duration: dur,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
          );
          const inner = slot.firstElementChild;
          if (inner) {
            loops.push(
              gsap.to(inner, {
                opacity: '-=0.06',
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
          onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
        });

        /* the still recedes as you leave it — the band lifts faster than the
           type, which is what sells the depth between them */
        gsap.to('[data-para-far]', {
          y: -120,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
        gsap.to('[data-para-near]', {
          y: -46,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });

        /* ---- flag strip ---- */
        const track = root.current?.querySelector<HTMLElement>('[data-marquee]');
        if (track) {
          const loop = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: 58 });
          ScrollTrigger.create({
            trigger: track,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
          });
        }

        /* ---- the one live word in the subhead ---- */
        const rot = root.current?.querySelector<HTMLElement>('[data-rotator]');
        if (rot) {
          let i = 0;
          const cycle = () => {
            gsap.delayedCall(2.8, () => {
              i = (i + 1) % ROTATIONS.length;
              gsap.to(rot, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                  rot.textContent = ROTATIONS[i] ?? 'Portuguese';
                  gsap.to(rot, { opacity: 1, duration: 0.45, ease: 'power2.out' });
                },
              });
              cycle();
            });
          };
          cycle();
        }
      }
    },
    { scope: root }
  );

  const copyCommand = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
    void navigator.clipboard?.writeText('npx gt@latest').catch(() => undefined);
  };

  return (
    <header className='ap-hero' id='top' ref={root}>
      <div className='ap-band' data-para-far aria-hidden>
        {/* The band IS the composition, and it runs the full 2880px bleed. At
            dpr 1 the brightest lobe upscales into visible stair-stepping and
            the filaments start reading as compression artefact rather than as
            anisotropic light, so this one field is rendered above 1. */}
        <PrismaticField
          className='ap-field'
          preset='1'
          dpr={1.4}
          speed={0.4}
          params={{ exposureScale: 4200 }}
        />
        <div className='ap-band-core' />
      </div>

      <div className='ap-guide-v' aria-hidden />
      <div className='ap-guide-h' aria-hidden />

      <div className='ap-scatter' data-para-near aria-hidden>
        {SCATTER.map((item) => {
          /* placement travels as custom properties on the outer slot, so the
             narrow-viewport arrangement is a media query rather than a second
             render path — and GSAP keeps the slot's transform to itself */
          const vars: StyleVars = {
            '--x': `${item.x}%`,
            '--y': `${item.y}%`,
            '--sc': item.scale,
            '--mx': `${item.mobile?.x ?? item.x}%`,
            '--my': `${item.mobile?.y ?? item.y}%`,
            '--msc': item.mobile?.scale ?? item.scale,
          };
          return (
            <div
              className={item.wide ? 'ap-slot ap-slot--wide' : 'ap-slot'}
              key={item.id}
              data-slot
              data-drift={item.drift}
              data-dur={item.dur}
              style={vars}
            >
              <div
                className='ap-slot-in'
                style={{
                  opacity: item.opacity,
                  filter: item.blur ? `blur(${item.blur}px)` : undefined,
                }}
              >
                <ScatterCardView card={item.card} rtl={item.locale === 'AR'} />
                {item.locale && <span className='ap-slot-loc'>{item.locale}</span>}
              </div>
            </div>
          );
        })}

        {GLYPHS.map((glyph) => {
          const vars: StyleVars = {
            '--x': `${glyph.x}%`,
            '--y': `${glyph.y}%`,
            '--sc': 1,
            '--mx': `${glyph.x}%`,
            '--my': `${glyph.y}%`,
            '--msc': 1,
          };
          return (
            <div
              className={
                glyph.wide ? 'ap-slot ap-slot--glyph ap-slot--wide' : 'ap-slot ap-slot--glyph'
              }
              key={`${glyph.g}-${glyph.x}`}
              data-slot
              data-drift={glyph.size}
              data-dur={22 + glyph.size * 0.4}
              style={vars}
            >
              <div
                className='ap-slot-in'
                style={{ opacity: glyph.opacity, fontSize: `${glyph.size}px` }}
              >
                {glyph.g}
              </div>
            </div>
          );
        })}
      </div>

      <div className='ap-gate' data-gate aria-hidden>
        <Image src='/brand/no-bg-gt-logo-dark.png' alt='' width={80} height={80} />
      </div>

      {/* The lower fold is a two-column grid split on the SAME 50% line as the
          vertical crosshair, so the stat block is hung off the viewfinder rule
          rather than floated against the right margin as a counterweight. */}
      <div className='ap-hero-lower'>
        <div className='ap-hero-copy'>
          <button className='ap-cmd' type='button' onClick={copyCommand} data-settle>
            <span className='dim'>$</span> npx gt@latest{' '}
            <span className='dim'>{copied ? 'copied' : 'copy'}</span>
          </button>

          <h1 className='ap-h1' data-settle>
            <span className='l1'>Launch in every</span>
            <span className='l2 chrome'>Language</span>
          </h1>

          <p className='ap-sub' data-settle>
            General Translation helps developers localize apps into{' '}
            <span className='rot' data-rotator>
              Portuguese
            </span>{' '}
            — no painful refactors and no managing large JSON files.
          </p>

          <div className='ap-ctas' data-settle>
            <a className='solid' href='#story'>
              Get Started
            </a>
            <a className='outline' href='#features'>
              Docs
            </a>
          </div>
        </div>

        <dl className='ap-hero-stats' data-settle>
          {HERO_STATS.map((stat) => (
            <div className='ap-stat' key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className='ap-bottom' data-settle>
        <div className='ap-marq'>
          <div className='ap-marq-track' data-marquee>
            {[...FLAGS, ...FLAGS].map((flag, i) => (
              <span className='ap-flag' key={`${flag.name}-${i}`}>
                <i className={`fi fi-${flag.flag}`} aria-hidden='true' /> {flag.name}
              </span>
            ))}
          </div>
        </div>
        <div className='ap-trust'>
          <span className='ap-trust-lab'>Trusted by the world&apos;s best companies</span>
          {TRUSTED_BY.map((name) => (
            <span className='ap-wm' key={name}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
