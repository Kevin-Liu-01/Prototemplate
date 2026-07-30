'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useRef } from 'react';

import LanguageWheel from '@/components/shared/LanguageWheel';
import PrismaticField from '@/components/shared/PrismaticField';

import StreamArtifact, { STREAM_SPECS } from '../components/StreamArtifact';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** The locale rail, set as catalogue codes — the wall stays black, white, metal. */
const LOCALES: [string, string][] = [
  ['ES', 'Español'],
  ['FR', 'Français'],
  ['JA', '日本語'],
  ['DE', 'Deutsch'],
  ['ZH', '中文'],
  ['PT', 'Português'],
  ['KO', '한국어'],
  ['IT', 'Italiano'],
  ['HI', 'हिन्दी'],
  ['AR', 'العربية'],
  ['NL', 'Nederlands'],
  ['SV', 'Svenska'],
  ['PL', 'Polski'],
  ['TR', 'Türkçe'],
  ['VI', 'Tiếng Việt'],
  ['TH', 'ไทย'],
  ['HE', 'עברית'],
  ['EL', 'Ελληνικά'],
];

const ROTATOR = [
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

/** The wall label beside the work: what it is, in numbers. */
const PLACARD: [string, string][] = [
  ['Languages', '118'],
  ['Users ahead', '1,000,000,000'],
  ['Frameworks', '6'],
  ['To start', '$0'],
];

/** Clearance between the dial's rim and the nearest edge of a pair. */
const GATE_GAP = 30;
/** Clearance between a pair and the plate's left/right edge. */
const EDGE_X = 34;
/** Clearance between a pair and the plate's top edge, and between lanes. */
const EDGE_Y = 16;
const LANE_GAP = 16;
/** Clearance between the axis and the innermost lane on each side. */
const AXIS_GAP = 18;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

type Lane = {
  index: number;
  src: HTMLElement;
  tgt: HTMLElement;
  /** Solved once per measure: lane geometry in plate coordinates. */
  r0: number;
  rMax: number;
  y: number;
  fits: boolean;
};

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const stage = root.current?.querySelector<HTMLElement>('[data-stage]');
      const gate = root.current?.querySelector<HTMLElement>('[data-gate]');
      const dial = root.current?.querySelector<HTMLElement>('.wg-wheel');
      if (!stage || !gate || !dial) return;

      const loops: gsap.core.Animation[] = [];
      const lanes: Lane[] = [];

      STREAM_SPECS.forEach((_, index) => {
        const src = stage.querySelector<HTMLElement>(`[data-piece="src"][data-index="${index}"]`);
        const tgt = stage.querySelector<HTMLElement>(`[data-piece="tgt"][data-index="${index}"]`);
        if (src && tgt) lanes.push({ index, src, tgt, r0: 0, rMax: 0, y: 0, fits: false });
      });

      /* ---- geometry, solved from the plate rather than authored ----
         r0 clears the dial and its halo; rMax keeps the far edge of the widest
         face inside the plate; lanes stack outward from the axis by measured
         height so two cards can never overlap. A lane with no room is not drawn
         at all, which is what makes a phone safe without a second layout. */
      const measure = () => {
        const halfW = stage.clientWidth / 2;
        const stageH = stage.clientHeight;
        const axis = gate.offsetTop;
        const radius = dial.offsetWidth / 2;
        const copy = root.current?.querySelector<HTMLElement>('.wg-work-copy');
        const floor = Math.min(stageH - EDGE_Y, (copy?.offsetTop ?? stageH) - 14);

        for (const side of [true, false]) {
          let edge = side ? axis - AXIS_GAP : axis + AXIS_GAP;
          const group = lanes
            .filter((l) => STREAM_SPECS[l.index]?.above === side)
            .sort(
              (a, b) => (STREAM_SPECS[a.index]?.stack ?? 0) - (STREAM_SPECS[b.index]?.stack ?? 0)
            );

          for (const lane of group) {
            const a = lane.src.firstElementChild as HTMLElement | null;
            const b = lane.tgt.firstElementChild as HTMLElement | null;
            const w = Math.max(a?.offsetWidth ?? 0, b?.offsetWidth ?? 0);
            const h = Math.max(a?.offsetHeight ?? 0, b?.offsetHeight ?? 0);

            const centre = side ? edge - h / 2 : edge + h / 2;
            lane.y = centre - axis;
            lane.r0 = radius + w / 2 + GATE_GAP;
            lane.rMax = halfW - w / 2 - EDGE_X;
            lane.fits =
              lane.rMax - lane.r0 > 24 && centre - h / 2 >= EDGE_Y && centre + h / 2 <= floor;

            if (side) edge -= h + LANE_GAP;
            else edge += h + LANE_GAP;
            if (!lane.fits) gsap.set([lane.src, lane.tgt], { opacity: 0 });
          }
        }
      };

      const place = (lane: Lane, u: number) => {
        const spec = STREAM_SPECS[lane.index];
        if (!spec || !lane.fits) return;
        const r = lane.r0 + (lane.rMax - lane.r0) * u;
        /* resolving out of the lens: soft and dim near the gate, sharp at reach,
           gone before the rim — nothing is ever cut by an edge */
        const resolve = clamp01(u / 0.3);
        const vis = clamp01(u / 0.13) * clamp01((1 - u) / 0.2);
        const vars: gsap.TweenVars = {
          y: lane.y,
          opacity: vis * spec.opacity,
          scale: 0.88 + 0.12 * resolve,
          filter: `blur(${((1 - resolve) * 2.6).toFixed(2)}px)`,
          '--wg-ab': (1 - resolve) * 3.2,
        };
        gsap.set(lane.src, { ...vars, x: -r });
        gsap.set(lane.tgt, { ...vars, x: r });
      };

      measure();

      for (const lane of lanes) {
        const spec = STREAM_SPECS[lane.index];
        if (!spec) continue;
        const proxy = { u: 0 };
        place(lane, reduced ? 0.62 : 0);
        if (reduced) {
          place(lane, 0.62);
          continue;
        }
        const tween = gsap.to(proxy, {
          u: 1,
          duration: spec.dur,
          repeat: -1,
          ease: 'none',
          onUpdate: () => place(lane, proxy.u),
        });
        tween.time(spec.phase % spec.dur);
        loops.push(tween);
      }

      const onResize = () => {
        measure();
        for (const lane of lanes) place(lane, reduced ? 0.62 : 0);
      };
      window.addEventListener('resize', onResize);
      ScrollTrigger.addEventListener('refreshInit', measure);

      if (!reduced) {
        const track = root.current?.querySelector<HTMLElement>('[data-locales]');
        if (track) {
          track.innerHTML += track.innerHTML;
          loops.push(gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: 38 }));
        }

        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
        });

        /* ---- intro ---- */
        const intro = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1 } });
        SplitText.create('[data-h1]', {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 118,
              duration: 1.1,
              ease: 'expo.out',
              stagger: 0.09,
              delay: 0.45,
            }),
        });
        intro
          .from('[data-npx]', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.1)
          .from('[data-stage-wrap]', { autoAlpha: 0, y: 24, duration: 1.2 }, 0.24)
          .from('[data-cross]', { scaleX: 0, autoAlpha: 0, duration: 1.4 }, 0.5)
          .from('[data-crossv]', { scaleY: 0, autoAlpha: 0, duration: 1.2 }, 0.6)
          .from('[data-sub]', { y: 16, autoAlpha: 0 }, 0.95)
          .from('[data-cta] > *', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 1.08)
          .from('[data-stats] > *', { autoAlpha: 0, y: 14, stagger: 0.06, duration: 0.7 }, 1.2)
          .from('[data-langs]', { autoAlpha: 0, y: 16 }, 1.32)
          .from('[data-trusted]', { autoAlpha: 0, y: 16 }, 1.42);

        /* ---- typewriter rotator ---- */
        const rot = root.current?.querySelector<HTMLElement>('[data-rot]');
        if (rot) {
          let wi = 0;
          let ci = 0;
          let deleting = false;
          let timer = 0;
          const type = () => {
            const w = ROTATOR[wi] ?? '';
            rot.textContent = w.slice(0, ci);
            if (!deleting && ci < w.length) {
              ci++;
              timer = window.setTimeout(type, 70);
            } else if (!deleting) {
              deleting = true;
              timer = window.setTimeout(type, 1600);
            } else if (ci > 0) {
              ci--;
              timer = window.setTimeout(type, 34);
            } else {
              deleting = false;
              wi = (wi + 1) % ROTATOR.length;
              timer = window.setTimeout(type, 220);
            }
          };
          type();
          return () => {
            window.clearTimeout(timer);
            window.removeEventListener('resize', onResize);
            ScrollTrigger.removeEventListener('refreshInit', measure);
          };
        }
      }

      return () => {
        window.removeEventListener('resize', onResize);
        ScrollTrigger.removeEventListener('refreshInit', measure);
      };
    },
    { scope: root }
  );

  return (
    <header className='wg-hero' ref={root} id='top'>
      {/* wall text: the one line that belongs on the paper, not in the work */}
      <div className='wg-wall'>
        <span className='wg-npx' data-npx>
          <span className='wg-dollar'>$</span> npx gt@latest
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden>
            <rect x='9' y='9' width='12' height='12' rx='2' />
            <path d='M5 15V5a2 2 0 0 1 2-2h10' />
          </svg>
        </span>
      </div>

      {/* THE WORK — burst, crosshair, gate and type are one object: the band's
          horizontal axis runs through the dial, and the title hangs off the
          vertical rule that drops out of it. */}
      <div className='wg-stage-wrap' data-stage-wrap>
        <div
          className='wg-stage'
          data-stage
          aria-label='English components disperse from the GT gate beside their translations'
        >
          <PrismaticField
            className='wg-stage-field'
            preset='1'
            dpr={1}
            speed={0.55}
            params={{ exposureScale: 5400 }}
          />
          <div className='wg-stage-tint' aria-hidden />
          <div className='wg-cross-h' data-cross aria-hidden />
          <div className='wg-cross-v' data-crossv aria-hidden />

          {STREAM_SPECS.map((spec, i) => (
            <StreamArtifact key={`src-${spec.kind}`} kind={spec.kind} out={false} index={i} />
          ))}

          <div className='wg-gate' data-gate>
            {/* lens={false}: the backdrop shells crush a BRIGHT band to mud.
                Over the burst the dial has to stay crisp metal. */}
            <LanguageWheel
              className='wg-wheel'
              glyphs='語한文عñßЖ中れ글अй字ه訳ы'
              arcDuration={4.2}
              arcSweep={14}
              lens={false}
              priority
            />
          </div>

          {STREAM_SPECS.map((spec, i) => (
            <StreamArtifact key={`tgt-${spec.kind}`} kind={spec.kind} out index={i} />
          ))}

          <div className='wg-work-copy'>
            <h1 data-h1>
              Launch in every
              <br />
              <span className='wg-foil'>language</span>
            </h1>
            <p className='wg-hero-sub' data-sub>
              General Translation helps developers localize apps{' '}
              {/* the preposition, the word and its caret are one unit, so the
                  line can never break to leave a single word on the wall */}
              <span className='wg-rot-wrap'>
                into{' '}
                <span className='wg-rot' data-rot>
                  Spanish
                </span>
                <span className='wg-caret' aria-hidden />
              </span>
            </p>
            <div className='wg-hero-cta' data-cta>
              <a className='wg-btn wg-btn-ink' href='#pricing'>
                Get Started <span className='wg-arr'>→</span>
              </a>
              <a className='wg-btn wg-btn-line' href='#features'>
                Docs
              </a>
            </div>
          </div>

          <div className='wg-stage-vign' aria-hidden />
        </div>
      </div>

      {/* the wall label under the work, then the plinth */}
      <div className='wg-rail'>
        <dl className='wg-placard' data-stats>
          {PLACARD.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className='wg-langs' data-langs>
          <div className='wg-marquee'>
            <div className='wg-locale-track' data-locales>
              {LOCALES.map(([code, name]) => (
                <span className='wg-locale' key={name}>
                  <i>{code}</i>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className='wg-trusted' data-trusted>
          <span className='wg-lead'>Trusted by</span>
          <span className='wg-wm wg-wm-cursor'>Cursor</span>
          <span className='wg-wm wg-wm-ramp'>ramp</span>
          <span className='wg-wm wg-wm-mintlify'>Mintlify</span>
          <span className='wg-wm wg-wm-profound'>Profound</span>
          <span className='wg-wm wg-wm-partiful'>Partiful</span>
          <span className='wg-wm wg-wm-clickhouse'>ClickHouse</span>
        </div>
      </div>
    </header>
  );
}
