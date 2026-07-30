'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import LanguageWheel from '@/components/shared/LanguageWheel';
import PrismaticField from '@/components/shared/PrismaticField';

import {
  DEPARTURES,
  LANE_ROWS,
  PHONE_GATE,
  STREAM_ITEMS,
  TESTIMONIAL,
  TRUSTED_BY,
  WHEEL_GLYPHS,
} from '../components/content';
import { flipTo, setBoard } from '../components/flapEngine';
import SplitFlapBoard, { SplitFlapLine } from '../components/SplitFlapBoard';
import StreamItem from '../components/StreamItem';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Half-width of the gate's dead zone. Nothing renders inside it: a component
 * disappears into the dial in English and reappears past it translated.
 */
const GATE_R = 148;
/** Distance over which a component fades back up after clearing the gate. */
const GATE_FADE = 82;
/** Where past the gate the translated face swaps in — just inside the fade. */
const SWAP_X = 156;
/** Extra travel beyond the viewport edge so nothing pops in at the bezel. */
const OVERRUN = 40;
/**
 * Fade measured from a component's OUTER edge, not its centre, so a wide card
 * and a narrow chip both dissolve before the bezel instead of being clipped.
 */
const EDGE_FADE = 190;
/**
 * How far inside the viewport edge a component must be fully gone. Measured
 * against the real half-width (not the overrun span), which is what stops a
 * card being sheared in half by the bezel the way it used to be.
 */
const EDGE_MARGIN = 30;

const ROTATOR = [
  'SPANISH',
  'FRENCH',
  'GERMAN',
  'JAPANESE',
  'CHINESE',
  'KOREAN',
  'ITALIAN',
  'HINDI',
  'ARABIC',
];

type Lane = {
  el: HTMLElement;
  row: number;
  phase: number;
  period: number;
  translated: boolean;
};

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bandEl = band.current;
      if (!bandEl) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // --- intro: the board clacks up from blanks -------------------------
      const lines = gsap.utils.toArray<HTMLElement>('.ft-hero-board [data-flap-line]');
      if (!reduced) {
        lines.forEach((line, i) => {
          const text = line.dataset.text ?? '';
          setBoard(line, ' '.repeat(Array.from(text).length));
          flipTo(line, text, { per: 0.02, cycles: 3 }).delay(0.3 + i * 0.22);
        });
        gsap.from('.ft-hero-sub', { autoAlpha: 0, y: 14, duration: 0.8, delay: 0.8 });
        gsap.from('.ft-hero-ctas .ft-btn', {
          autoAlpha: 0,
          y: 12,
          stagger: 0.08,
          duration: 0.7,
          delay: 0.95,
        });
        gsap.from('.ft-boarding, .ft-trusted', {
          autoAlpha: 0,
          y: 18,
          stagger: 0.12,
          duration: 0.9,
          delay: 1.1,
        });
      }

      // --- rotating destination word --------------------------------------
      // The first turn is held well past the point where a fresh page has
      // settled, so the board is never read mid-flip.
      const rotator = bandEl.ownerDocument.querySelector<HTMLElement>('#ft-lang-flap');
      let heroActive = true;
      let rotatorIndex = 0;
      if (rotator && !reduced) {
        const spin = (wait: number) => {
          gsap.delayedCall(wait, () => {
            if (heroActive && !document.hidden) {
              rotatorIndex = (rotatorIndex + 1) % ROTATOR.length;
              const word = ROTATOR[rotatorIndex] ?? 'SPANISH';
              flipTo(rotator, word.padEnd(8, ' '), { per: 0.018, cycles: 3 });
            }
            spin(5.4);
          });
        };
        spin(5.4);
      }

      // --- flags marquee ---------------------------------------------------
      const marquee = gsap.to('.ft-marquee-track', {
        xPercent: -50,
        ease: 'none',
        repeat: -1,
        duration: 48,
      });

      // --- the two lanes ---------------------------------------------------
      const items = gsap.utils.toArray<HTMLElement>('.ft-si[data-row]', bandEl);
      const lanes: Lane[] = items.map((el) => ({
        el,
        row: Number(el.dataset.row ?? 0),
        phase: Number(el.dataset.phase ?? 0),
        period: Number(el.dataset.period ?? 28),
        translated: false,
      }));

      const swap = (lane: Lane, translated: boolean) => {
        if (lane.translated === translated) return;
        lane.translated = translated;
        const w0 = lane.el.offsetWidth;
        const h0 = lane.el.offsetHeight;
        lane.el.classList.toggle('is-tr', translated);
        const w1 = lane.el.offsetWidth;
        const h1 = lane.el.offsetHeight;
        // The same component, re-measured to fit its new language.
        gsap.fromTo(
          lane.el,
          { width: w0, height: h0 },
          {
            width: w1,
            height: h1,
            duration: 0.5,
            ease: 'power3.out',
            clearProps: 'width,height',
          }
        );
      };

      let clock = reduced ? 6.4 : 0;
      const frame = (_time: number, delta: number) => {
        clock += delta / 1000;
        const w = bandEl.clientWidth;
        const h = bandEl.clientHeight;
        const span = w / 2 + OVERRUN;

        for (const lane of lanes) {
          const { el } = lane;
          const p = (clock / lane.period + lane.phase) % 1;
          const x = -span + 2 * span * p;
          const ax = Math.abs(x);
          // 0 inside the dial, ramping back to 1 once the component is clear.
          const gate = Math.min(1, Math.max(0, (ax - GATE_R) / GATE_FADE));
          const reach = ax + el.offsetWidth / 2;
          const room = w / 2 - EDGE_MARGIN - reach;
          const edge = Math.min(1, Math.max(0, room / EDGE_FADE));
          const near = 1 - ax / span;
          const y = ((lane.row + 0.5) / LANE_ROWS - 0.5) * h + Math.sin(clock * 0.7 + p * 6) * 6;
          const scale = 0.84 + 0.16 * near;
          const blur = (1 - gate) * 2.6;

          el.style.transform =
            `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) ` +
            `scale(${scale.toFixed(3)})`;
          el.style.opacity = (gate * edge * (0.88 + 0.12 * near)).toFixed(3);
          el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
          swap(lane, x > SWAP_X);
        }
      };

      if (reduced) {
        frame(0, 0);
      } else {
        gsap.ticker.add(frame);
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          heroActive = self.isActive;
          if (self.isActive) marquee.play();
          else marquee.pause();
        },
      });

      return () => {
        gsap.ticker.remove(frame);
      };
    },
    { scope: root }
  );

  return (
    <section className='ft-hero' id='ft-top' ref={root}>
      {/* dpr above 1 keeps the filaments as filaments: at dpr 1 the upscale
          smears the anisotropic streaks into an airbrushed haze. The high
          exposureScale is what lets the field fall to true black at the
          margins instead of washing khaki across the full width. */}
      <PrismaticField
        className='ft-prism'
        params={{ exposureScale: 6200, fieldDetailScale: 5.9, domainAttenuation: 4.3 }}
        dpr={1.4}
        speed={0.5}
      />
      <div className='ft-hero-vignette' aria-hidden />

      <div className='ft-hero-copy'>
        <h1 className='ft-sr'>Launch in every language</h1>
        <SplitFlapBoard className='ft-hero-board' lines={['LAUNCH IN', 'EVERY LANGUAGE']} />
        <p className='ft-hero-sub'>
          General Translation helps developers localize apps into{' '}
          <SplitFlapLine className='ft-lang-flap' id='ft-lang-flap' text='JAPANESE' pad={8} />
        </p>
      </div>

      {/* the gate: English on the left, the dial at dead centre, translated on the right */}
      <div className='ft-gateband' ref={band}>
        <div className='ft-gate-rails' aria-hidden />
        <div className='ft-gate-seam' aria-hidden />

        {STREAM_ITEMS.map((spec) => (
          <StreamItem key={spec.id} spec={spec} />
        ))}

        {/* The hero is an isolated stacking context, so the lens shells'
            backdrop resolves to black and they paint a ~500px matte disc over
            the field instead of bending it. Without them the shader's own
            void frames the dial, which is the composition we want. */}
        <LanguageWheel
          className='ft-gate'
          glyphs={WHEEL_GLYPHS}
          arcDuration={4.2}
          arcSweep={22}
          lens={false}
          priority
        />

        {/* the one card that is never allowed to leave: source left of the
            seam, its translation right of it */}
        <StreamItem
          spec={TESTIMONIAL}
          still
          className='ft-resident ft-resident--en'
        />
        <StreamItem
          spec={TESTIMONIAL}
          still
          translated
          className='ft-resident ft-resident--tr'
        />

        {/* phones get the same mechanic stacked: in above, out below */}
        <StreamItem spec={PHONE_GATE} still className='ft-phonegate ft-phonegate--en' />
        <StreamItem spec={PHONE_GATE} still translated className='ft-phonegate ft-phonegate--tr' />
      </div>

      <div className='ft-hero-ctas'>
        <a className='ft-btn ft-btn-solid' href='#ft-how'>
          Get Started <span aria-hidden>→</span>
        </a>
        <a className='ft-btn ft-btn-line' href='#ft-features'>
          Docs
        </a>
      </div>

      <div className='ft-hero-base'>
        <div className='ft-boarding'>
          <div className='ft-boarding-label'>100+ languages supported</div>
          <div className='ft-marquee'>
            <div className='ft-marquee-track'>
              {[0, 1].map((copy) =>
                DEPARTURES.map(([flag, name]) => (
                  <span className='ft-flag-chip' key={`${copy}-${name}`}>
                    <span aria-hidden>{flag}</span>
                    <span>{name}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className='ft-trusted'>
          <div className='ft-trusted-label'>Trusted by the world&rsquo;s best companies</div>
          <div className='ft-trusted-row'>
            {TRUSTED_BY.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
