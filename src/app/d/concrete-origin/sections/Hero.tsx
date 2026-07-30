'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import LensGate from '../components/LensGate';
import RayCardView from '../components/RayCard';
import { FLAGS, RAY_PAIRS, STATS, TRUSTED_BY, type RayCard } from '../content';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const ROTATIONS = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese',
  'Portuguese',
  'Korean',
  'Italian',
  'Hindi',
  'Arabic',
];

/** Short string the lens emits during the optical transit. */
function transitLabel(card: RayCard): string {
  if (card.kind === 'testimonial') return `${card.name} — ${card.role}`;
  return card.label;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
/** Bell centred on the rim: peaks where the well's pull is strongest. */
const rimBell = (d: number) => Math.exp(-Math.pow((d - 0.16) / 0.19, 2));

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ---- headline: hard-cut per-character stamp, the direction's signature ---- */
      const heading = root.current?.querySelector<HTMLElement>('[data-headline]');
      if (heading && !reduced) {
        const split = new SplitText(heading, { type: 'chars', charsClass: 'ch' });
        gsap.from(split.chars, {
          autoAlpha: 0,
          scale: 1.9,
          duration: 0.2,
          ease: 'steps(2)',
          stagger: 0.018,
          delay: 0.1,
        });
      }
      if (!reduced) {
        gsap.from('[data-hero-reveal]', {
          autoAlpha: 0,
          scale: 1.28,
          duration: 0.2,
          ease: 'steps(2)',
          stagger: 0.08,
          delay: 0.34,
        });
      }

      /* ---- M1: components ride rays out of the same centre the shader
         converges on. Radius drives depth, so a card near the lens is far
         away and a card at the fan's edge is right in front of you. ---- */
      const loops: gsap.core.Tween[] = [];
      const host = stage.current;
      const lensEl = host?.querySelector<HTMLElement>('.cm-lens') ?? null;

      RAY_PAIRS.forEach((pair) => {
        const enEl = host?.querySelector<HTMLElement>(`[data-ray="${pair.id}-en"]`);
        const trEl = host?.querySelector<HTMLElement>(`[data-ray="${pair.id}-tr"]`);
        const flash = host?.querySelector<HTMLElement>(`[data-transit="${pair.id}"]`);
        if (!enEl || !trEl || !flash) return;

        const place = (el: HTMLElement, side: -1 | 1, progress: number) => {
          const width = host?.clientWidth ?? 1440;
          const rMin = ((lensEl?.clientWidth || 268) / 2) * 0.7;
          const rMax = Math.max(rMin + 120, width * 0.335);

          // slow at the rim: incoming decelerates into the well, emitted
          // accelerates out of it
          const eased = side < 0 ? 1 - Math.pow(1 - progress, 2.1) : Math.pow(progress, 1.7);
          const depth = side < 0 ? 1 - eased : eased; // 1 = fan edge, 0 = rim
          const radius = rMin + (rMax - rMin) * depth;

          const bell = rimBell(depth);
          // the ray bends toward the equator of the well as it falls in
          const angle = pair.angle * (1 - 0.5 * bell) * (Math.PI / 180);
          const x = Math.cos(angle) * radius * side;
          const y = Math.sin(angle) * radius * 0.62;
          const z = -520 + 760 * depth;

          // squeezed along the ray, stretched across it — tidal distortion
          const squeeze = 1 - 0.26 * bell;
          const stretch = 1 + 0.4 * bell;

          const edge = smooth((1 - depth) / 0.15);
          const core = 0.3 + 0.7 * smooth(depth / 0.26);
          const opacity = clamp01(core * edge);
          const blur = 2.6 * (1 - smooth(depth / 0.34));

          el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(
            1
          )}px, ${z.toFixed(1)}px) rotate(${(pair.angle * side * -0.16).toFixed(
            2
          )}deg) scale(${squeeze.toFixed(3)}, ${stretch.toFixed(3)})`;
          el.style.opacity = opacity.toFixed(3);
          el.style.filter = blur > 0.08 ? `blur(${blur.toFixed(2)}px)` : 'none';
        };

        const paintTransit = (progress: number) => {
          const split = 20 * (1 - progress);
          const bell = Math.sin(Math.PI * clamp01(progress));
          flash.style.opacity = bell.toFixed(3);
          flash.style.transform = `translate(-50%, -50%) scale(${(1.34 - 0.34 * progress).toFixed(
            3
          )})`;
          const cyan = flash.querySelector<HTMLElement>('.tc');
          const magenta = flash.querySelector<HTMLElement>('.tm');
          if (cyan) cyan.style.transform = `translate(calc(-50% - ${split.toFixed(1)}px), -50%)`;
          if (magenta)
            magenta.style.transform = `translate(calc(-50% + ${split.toFixed(1)}px), -50%)`;
        };

        const state = { t: 0 };
        const tick = () => {
          const t = state.t;
          if (t < 0.46) {
            place(enEl, -1, t / 0.46);
            trEl.style.opacity = '0';
            paintTransit(0);
          } else if (t < 0.56) {
            enEl.style.opacity = '0';
            trEl.style.opacity = '0';
            paintTransit((t - 0.46) / 0.1);
          } else {
            enEl.style.opacity = '0';
            place(trEl, 1, (t - 0.56) / 0.44);
            paintTransit(0);
          }
        };

        if (reduced) {
          place(enEl, -1, 0.45);
          place(trEl, 1, 0.75);
          return;
        }

        const tween = gsap.to(state, {
          t: 1,
          duration: pair.duration,
          ease: 'none',
          repeat: -1,
          onUpdate: tick,
        });
        tween.progress(pair.phase);
        loops.push(tween);
      });

      if (loops.length) {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
        });
      }

      /* ---- flag marquee ---- */
      if (!reduced) {
        const track = root.current?.querySelector<HTMLElement>('[data-marquee]');
        if (track) {
          const loop = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: 42 });
          ScrollTrigger.create({
            trigger: track,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
          });
        }

        /* ---- language rotator: whole-word hard cuts, never a running scramble,
           so any frozen frame reads a real language name ---- */
        const rot = root.current?.querySelector<HTMLElement>('[data-rotator]');
        if (rot) {
          let i = 0;
          const cycle = () => {
            gsap.delayedCall(2.2, () => {
              i = (i + 1) % ROTATIONS.length;
              rot.textContent = ROTATIONS[i] ?? 'Spanish';
              gsap.fromTo(
                rot,
                { backgroundColor: '#ffffff', color: '#060606' },
                {
                  backgroundColor: 'rgba(255,255,255,0)',
                  color: '#ffffff',
                  duration: 0.3,
                  ease: 'steps(2)',
                }
              );
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
    window.setTimeout(() => setCopied(false), 1300);
    void navigator.clipboard?.writeText('npx gt@latest').catch(() => undefined);
  };

  return (
    <header className='cm-hero' id='top' ref={root}>
      <PrismaticField
        className='cm-hero-field'
        preset='1'
        dpr={1}
        speed={0.5}
        params={{ exposureScale: 4300 }}
      />
      <div className='cm-hero-scrim' />

      {/* real displacement map for the accretion glyphs */}
      <svg width='0' height='0' aria-hidden style={{ position: 'absolute' }}>
        <filter id='cm-lens-warp' x='-40%' y='-40%' width='180%' height='180%'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.011 0.02'
            numOctaves={2}
            seed={7}
            result='warp'
          />
          <feDisplacementMap
            in='SourceGraphic'
            in2='warp'
            scale='26'
            xChannelSelector='R'
            yChannelSelector='G'
          />
        </filter>
      </svg>

      <div className='cm-hero-inner'>
        <div className='cm-stage' ref={stage}>
          <div className='cm-hairline-h' />
          <div className='cm-hairline-v' />
          <span className='cm-stage-tag left'>IN // ENGLISH SOURCE</span>
          <span className='cm-stage-tag right'>OUT // 118 LOCALES</span>

          <div className='cm-rays'>
            {RAY_PAIRS.map((pair) => (
              <div className='cm-ray cm-ray--en' key={`${pair.id}-en`} data-ray={`${pair.id}-en`}>
                <RayCardView card={pair.en} />
              </div>
            ))}
            {RAY_PAIRS.map((pair) => (
              <div className='cm-ray cm-ray--tr' key={`${pair.id}-tr`} data-ray={`${pair.id}-tr`}>
                <RayCardView card={pair.tr} locale={pair.locale} rtl={pair.locale === 'AR'} />
              </div>
            ))}
          </div>

          <LensGate />

          {RAY_PAIRS.map((pair) => (
            <div className='cm-transit' key={`${pair.id}-t`} data-transit={pair.id}>
              <span className='tc'>{transitLabel(pair.tr)}</span>
              <span className='tm'>{transitLabel(pair.tr)}</span>
              <span className='tw'>{transitLabel(pair.tr)}</span>
            </div>
          ))}
        </div>

        <div className='cm-hero-copy'>
          <div>
            <button className='cm-cmd' type='button' onClick={copyCommand}>
              <span className='dim'>$</span> npx gt@latest{' '}
              <span className='dim'>{copied ? '✓' : '⧉'}</span>
            </button>
            <h1 className='slab' data-headline>
              Launch in every language
            </h1>
            <p className='cm-hero-sub' data-hero-reveal>
              General Translation helps developers localize apps into{' '}
              <span className='rot' data-rotator>
                Spanish
              </span>{' '}
              — no painful refactors and no managing large JSON files.
            </p>
            <div className='cm-hero-ctas' data-hero-reveal>
              <a className='primary' href='#story'>
                Get Started
              </a>
              <a className='ghost' href='#features'>
                Docs
              </a>
            </div>
          </div>

          <div className='cm-hero-stats' data-hero-reveal>
            {STATS.map((stat) => (
              <div key={stat.label}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='cm-flags'>
          <span className='k'>100+ languages supported // production-ready locales</span>
          <div className='cm-marq'>
            <div className='cm-marq-track' data-marquee>
              {[...FLAGS, ...FLAGS].map((flag, i) => (
                <span className='cm-flag' key={`${flag.name}-${i}`}>
                  {flag.flag} {flag.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className='cm-trust'>
          <span className='k'>Trusted by the world&apos;s best companies //</span>
          {TRUSTED_BY.map((name) => (
            <span className='wm' key={name}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
