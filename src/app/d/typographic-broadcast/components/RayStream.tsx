'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type LaneProps = {
  spread: number;
  phase: number;
  cycle: number;
  children: ReactNode;
};

function Lane({ spread, phase, cycle, children }: LaneProps) {
  return (
    <div className='tb-lane' data-lane data-spread={spread} data-phase={phase} data-cycle={cycle}>
      <div className='tb-lane-inner'>{children}</div>
    </div>
  );
}

const DRIFT_GLYPHS = ['語', '한', 'م', 'ع', 'ñ', '字', 'ü', 'ク', 'é', 'ß', '訳', 'ㅂ', 'ç', 'फ'];

type LaneState = {
  el: HTMLElement;
  inner: HTMLElement;
  card: HTMLElement | null;
  en: HTMLElement[];
  tr: HTMLElement[];
  spread: number;
  phase: number;
  cycle: number;
  glyph: boolean;
  side: number;
  /** cached card width — read on swap and on resize, never per frame */
  w: number;
};

/**
 * M1 — the hero components live on rays radiating from the same centre the
 * prismatic field and the shared LanguageWheel share. Depth is real: at the
 * dial a component is far (small, dim, soft), and it comes toward the viewer
 * as it travels out along its ray. Motion runs left fan → dial → right fan,
 * and what leaves the dial is the same component carrying a real translation,
 * re-measured to fit.
 *
 * The cards are real UI — a button, a form, a price, a nav, a quote — and
 * carry no status furniture: no dots, no pills, no "live" labels.
 */
export default function RayStream() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = root.current;
      if (!stage) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const lanes: LaneState[] = gsap.utils.toArray<HTMLElement>('[data-lane]', stage).map((el) => ({
        el,
        inner: el.querySelector<HTMLElement>('.tb-lane-inner') as HTMLElement,
        card: el.querySelector<HTMLElement>('.tb-card'),
        en: gsap.utils.toArray<HTMLElement>('[data-face="en"]', el),
        tr: gsap.utils.toArray<HTMLElement>('[data-face="tr"]', el),
        spread: Number(el.dataset.spread ?? 0),
        phase: Number(el.dataset.phase ?? 0),
        cycle: Number(el.dataset.cycle ?? 14),
        glyph: el.dataset.glyph === '1',
        side: -1,
        w: 0,
      }));

      let halfW = stage.clientWidth / 2;
      let halfH = stage.clientHeight / 2;
      const measure = () => {
        halfW = stage.clientWidth / 2;
        halfH = stage.clientHeight / 2;
        for (const lane of lanes) lane.w = lane.card?.offsetWidth ?? 0;
      };
      measure();
      window.addEventListener('resize', measure);

      /** Same component, new language: swap faces, then animate the re-measure. */
      const swap = (lane: LaneState, toTranslated: boolean, animate: boolean) => {
        const card = lane.card;
        const w0 = card?.offsetWidth ?? 0;
        const h0 = card?.offsetHeight ?? 0;
        lane.en.forEach((e) => {
          e.hidden = toTranslated;
        });
        lane.tr.forEach((e) => {
          e.hidden = !toTranslated;
        });
        if (!card) return;
        lane.w = card.offsetWidth;
        if (!animate) return;
        const w1 = card.offsetWidth;
        const h1 = card.offsetHeight;
        if (Math.abs(w1 - w0) > 1 || Math.abs(h1 - h0) > 1) {
          gsap.fromTo(
            card,
            { width: w0, height: h0 },
            { width: w1, height: h1, duration: 0.52, ease: 'power3.out', clearProps: 'width,height', overwrite: true }
          );
        }
        /* The re-measure reads as a pure white specular bloom off the card's
           own edge. No chromatic aberration: hot pink and cyan were the
           loudest colour on a page whose only sanctioned light is the
           prismatic field. */
        gsap.fromTo(
          card,
          { filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.55)) brightness(1.22)' },
          {
            filter: 'drop-shadow(0 0 0 rgba(255,255,255,0)) brightness(1)',
            duration: 0.9,
            ease: 'power2.out',
            overwrite: 'auto',
          }
        );
      };

      const place = (lane: LaneState, u: number, alphaScale: number) => {
        const au = Math.abs(u);
        const z = -900 + 1150 * Math.pow(au, 0.75);
        let x = u * halfW * 1.06;
        /* Perspective magnifies a lane as it comes forward, so a card that is
           inside the frame in layout space is still sheared off at the bezel.
           In a phone column that is every card — "Sign in" lost its S and the
           Korean nav card lost its last glyph — so the travel is clamped to
           what the frame can actually hold at this depth. */
        if (halfW < 300) {
          const persp = 1200 / (1200 - z);
          const limit = Math.max(0, (halfW - 10) / persp - lane.w / 2);
          x = gsap.utils.clamp(-limit, limit, x);
        }
        // the ray bends toward the axis near the well
        const y = lane.spread * Math.pow(au, 1.28) * halfH * 0.84;
        const pull = Math.max(0, 1 - au / 0.34);
        const shear = pull * pull;
        const rotY = -u * 18;
        const rotX = -(halfH ? y / halfH : 0) * 7;
        lane.el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) ` +
          `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) ` +
          `scale(${(1 - 0.2 * shear).toFixed(3)}, ${(1 + 0.48 * shear).toFixed(3)})`;

        const edge = 1 - gsap.utils.clamp(0, 1, (au - 0.9) / 0.1);
        /* Components dissolve INTO the dial rather than sliding behind it: at
           the axis the card is gone, so nothing ever sits half-legible under
           the wheel. */
        const body = gsap.utils.clamp(0, 1, (au - 0.07) / 0.27);
        lane.el.style.opacity = String(Math.min(body, edge) * alphaScale);

        const blur = 4 * Math.max(0, 1 - au / 0.44);
        const bright = 0.7 + 0.3 * gsap.utils.clamp(0, 1, au / 0.5);
        lane.inner.style.filter = `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(2)})`;
      };

      const tick = () => {
        const now = gsap.ticker.time;
        for (const lane of lanes) {
          const v = (now / lane.cycle + lane.phase) % 1;
          if (lane.glyph) {
            place(lane, Math.pow(v, 1.15), Math.sin(Math.PI * v) * 0.95);
            continue;
          }
          const s = v * 2 - 1;
          const u = Math.sign(s) * Math.pow(Math.abs(s), 1.35);
          place(lane, u, 1);
          const side = u < 0 ? -1 : 1;
          if (side !== lane.side) {
            swap(lane, side === 1, side === 1);
            lane.side = side;
          }
        }
      };

      if (reduced) {
        lanes.forEach((lane, i) => {
          const u = lane.glyph ? 0.55 + (i % 4) * 0.1 : ((i % 5) - 2) / 2.4;
          if (!lane.glyph && u > 0) swap(lane, true, false);
          place(lane, u, lane.glyph ? 0.7 : 1);
          lane.side = u < 0 ? -1 : 1;
        });
        return () => window.removeEventListener('resize', measure);
      }

      gsap.ticker.add(tick);
      const gate = ScrollTrigger.create({
        trigger: stage,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) gsap.ticker.add(tick);
          else gsap.ticker.remove(tick);
        },
      });

      return () => {
        gsap.ticker.remove(tick);
        gate.kill();
        window.removeEventListener('resize', measure);
      };
    },
    { scope: root }
  );

  return (
    <div className='tb-rayspace' ref={root} aria-hidden>
      <Lane spread={-0.58} phase={0} cycle={15}>
        <div className='tb-card tb-card--button'>
          <span data-face='en'>Get started</span>
          <span data-face='tr' hidden>
            始める
          </span>
        </div>
      </Lane>

      <Lane spread={0.34} phase={0.14} cycle={16.5}>
        <div className='tb-card'>
          <span data-face='en'>Payment received</span>
          <span data-face='tr' hidden>
            Paiement reçu
          </span>
        </div>
      </Lane>

      <Lane spread={-0.16} phase={0.29} cycle={18}>
        <div className='tb-card tb-card--field'>
          <span className='tb-card-k' data-face='en'>
            Form
          </span>
          <span className='tb-card-k' data-face='tr' hidden>
            Formulario
          </span>
          <div className='tb-input' data-face='en'>
            Email address
          </div>
          <div className='tb-input' data-face='tr' hidden>
            Correo electrónico
          </div>
        </div>
      </Lane>

      <Lane spread={0.72} phase={0.43} cycle={19.5}>
        <div className='tb-card tb-card--quote'>
          <div className='tb-quote-head'>
            <span className='tb-avatar'>T3</span>
            <span className='tb-quote-who'>
              <b>Theo</b>CEO, T3Chat
            </span>
          </div>
          <p className='tb-quote-body' data-face='en'>
            “Every once in awhile, I see a snippet of code that makes me a bit emotional. Now is one of those
            moments. Internationalization went from &quot;$%!# this&quot; to &quot;trivial&quot;.”
          </p>
          <p className='tb-quote-body' data-face='tr' hidden>
            «De vez en cuando veo un fragmento de código que me emociona un poco. Este es uno de esos momentos.
            La internacionalización pasó de «$%!# esto» a «trivial».»
          </p>
        </div>
      </Lane>

      <Lane spread={-0.84} phase={0.57} cycle={17.5}>
        <div className='tb-card tb-card--price'>
          <span className='tb-card-k' data-face='en'>
            Pricing
          </span>
          <span className='tb-card-k' data-face='tr' hidden>
            Preise
          </span>
          <div className='tb-price'>$0</div>
          <div className='tb-price-per' data-face='en'>
            to start · pay as you go
          </div>
          <div className='tb-price-per' data-face='tr' hidden>
            zum Start · nutzungsbasierte Abrechnung
          </div>
        </div>
      </Lane>

      <Lane spread={0.92} phase={0.71} cycle={20.5}>
        <div className='tb-card'>
          <span className='tb-card-k' data-face='en'>
            Nav
          </span>
          <span className='tb-card-k' data-face='tr' hidden>
            내비게이션
          </span>
          <span data-face='en'>Docs · Pricing · Blog</span>
          <span data-face='tr' hidden>
            문서 · 요금제 · 블로그
          </span>
        </div>
      </Lane>

      <Lane spread={-0.36} phase={0.85} cycle={16}>
        <div className='tb-card tb-card--button'>
          <span data-face='en'>Sign in</span>
          <span data-face='tr' hidden>
            تسجيل الدخول
          </span>
        </div>
      </Lane>

      {DRIFT_GLYPHS.map((glyph, i) => (
        <div
          key={`${glyph}-${i}`}
          className='tb-lane'
          data-lane
          data-glyph='1'
          data-spread={(((i * 37) % 19) - 9) / 9.5}
          data-phase={(i * 0.137) % 1}
          data-cycle={7 + (i % 5) * 1.4}
        >
          <div className='tb-lane-inner'>
            <span className='tb-glyph' style={{ fontSize: `${13 + (i % 4) * 5}px` }}>
              {glyph}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
