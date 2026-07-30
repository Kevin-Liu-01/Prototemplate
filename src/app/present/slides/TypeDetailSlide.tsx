'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { DIRECTIONS } from '@/lib/directions';

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin, ScrambleTextPlugin);

/**
 * The official Inter release, served from Rasmus Andersson's own site. Falls
 * back to the Google build if the stylesheet has not loaded, which makes the
 * comparison read as "no difference" rather than breaking.
 */
const RSMS_STACK = "'InterVariable', 'Inter var', var(--font-inter), sans-serif";

const ROWS = [
  {
    label: 'Disambiguation (ss02)',
    text: 'Illegal 10Ol',
    features: '"ss02"',
  },
  {
    label: 'Slashed zero (zero)',
    text: '0 skips in 100 songs',
    features: '"zero"',
  },
  {
    label: 'Alternate glyphs (cv05, cv11)',
    text: 'a little while ago',
    features: '"cv05", "cv11"',
  },
];

const OVERLAY_TEXT = 'Illegal 10Ol agile';
const OVERLAY_FEATURES = '"ss02", "zero", "cv05", "cv11"';

function GoogleMark() {
  return (
    <svg viewBox='0 0 48 48' width='18' height='18' aria-hidden>
      <path
        fill='#EA4335'
        d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
      />
      <path
        fill='#4285F4'
        d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
      />
      <path
        fill='#FBBC05'
        d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
      />
      <path
        fill='#34A853'
        d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
      />
    </svg>
  );
}

function Specimen({
  name,
  stack,
  variant,
}: {
  name: string;
  stack: string;
  variant: 'google' | 'rsms';
}) {
  return (
    <div className={`pr-detail-col pr-col-${variant}`} style={{ fontFamily: stack }}>
      <svg
        className='pr-col-frame'
        aria-hidden
        preserveAspectRatio='none'
        viewBox='0 0 100 100'
      >
        <rect x='0.5' y='0.5' width='99' height='99' vectorEffect='non-scaling-stroke' />
      </svg>
      <header>
        <span>{name}</span>
        {variant === 'google' ? (
          <GoogleMark />
        ) : (
          <img
            className='pr-detail-mark'
            src='https://github.com/rsms.png'
            alt='Rasmus Andersson'
          />
        )}
      </header>
      <p className='pr-detail-big'>Gg Ra 0123</p>
      {ROWS.map((row) => (
        <div key={row.label} className='pr-detail-row'>
          <span>{row.label}</span>
          <p style={{ fontFeatureSettings: row.features }}>{row.text}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * A fun-fact interlude that doubles as the thesis: frontend is details.
 * Scrolling collapses the side-by-side columns into one overlaid specimen,
 * official build in white under the Google build in red, and scrubs the red
 * layer's opacity so the drift between the two becomes visible.
 */
export default function TypeDetailSlide() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // The two builds render their baselines at slightly different heights.
      // Font-metric math proved unreliable, so measure the truth instead: a
      // zero-height inline-block sits exactly on the baseline of the line it
      // ends, so compare one in each layer and nudge the red one to match.
      const alignBaselines = () => {
        const white = document.querySelector<HTMLElement>('.pr-overlay-rsms');
        const red = document.querySelector<HTMLElement>('.pr-overlay-google');
        if (!white || !red) return;
        const baselineTop = (el: HTMLElement) => {
          const probe = document.createElement('span');
          probe.style.cssText =
            'display:inline-block;width:0;height:0;overflow:hidden;';
          el.appendChild(probe);
          const top = probe.getBoundingClientRect().top;
          probe.remove();
          return top;
        };
        const previous = Number(gsap.getProperty(red, 'y')) || 0;
        gsap.set(red, { y: 0 });
        const delta = baselineTop(white) - baselineTop(red);
        const cap = parseFloat(getComputedStyle(white).fontSize) * 0.2;
        gsap.set(red, { y: Math.abs(delta) <= cap ? delta : previous });
      };
      alignBaselines();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.fonts.ready.then(alignBaselines);
        return;
      }

      gsap.from('.pr-detail-head', {
        autoAlpha: 0,
        y: 40,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 65%' },
      });
      gsap.from('.pr-detail-col', {
        autoAlpha: 0,
        y: 46,
        stagger: 0.16,
        duration: 0.65,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 45%' },
      });

      // The convergence is driven by a proxy so the target can be re-measured
      // on every frame: cached end values go stale when fonts or refreshes
      // shift the anchor, which used to land the pair off-register and then
      // visibly snap. With a live target, the flight ends exactly on the
      // anchor, every time, with nothing left to correct. Origins are
      // captured on the first moving frame (transforms backed out) and reset
      // whenever the scrub returns to the start.
      const fly = { p: 0 };
      const flightEls = () => [
        document.querySelector<HTMLElement>('.pr-col-rsms .pr-detail-big'),
        document.querySelector<HTMLElement>('.pr-col-google .pr-detail-big'),
      ];
      // The rendered translation, from the DOM itself. GSAP's property cache
      // resets across fast-refresh while stale inline transforms survive, so
      // gsap.getProperty can report 0 for a visibly translated element and
      // poison every measurement built on it.
      const renderedOffset = (el: Element) => {
        const transform = getComputedStyle(el).transform;
        if (!transform || transform === 'none') return { x: 0, y: 0 };
        const matrix = new DOMMatrix(transform);
        return { x: matrix.m41, y: matrix.m42 };
      };
      // No cached origins: every frame re-derives each element's natural
      // position from that same frame's rect minus its rendered transform.
      // Origin and anchor are therefore always measured in the same
      // coordinate space at the same instant, which survives pin reverts,
      // refreshes, and late font loads. At p=1 this converges exactly onto
      // the anchor, so nothing is left to snap afterwards.
      const placePair = () => {
        const els = flightEls();
        if (els.some((el) => !el)) return;
        if (fly.p <= 0.001) {
          els.forEach((el) => gsap.set(el, { x: 0, y: 0 }));
          return;
        }
        const anchor = document
          .querySelector<HTMLElement>('.pr-overlay-rsms')!
          .getBoundingClientRect();
        const redCorrection = renderedOffset(
          document.querySelector('.pr-overlay-google')!
        ).y;
        els.forEach((el, i) => {
          const rect = el!.getBoundingClientRect();
          const offset = renderedOffset(el!);
          const naturalLeft = rect.left - offset.x;
          const naturalTop = rect.top - offset.y;
          gsap.set(el, {
            x: (anchor.left - naturalLeft) * fly.p,
            y:
              (anchor.top - naturalTop + (i === 1 ? redCorrection : 0)) *
              fly.p,
          });
        });
      };

      // The size match is a real font-size tween, not a transform scale: the
      // browser then resolves the same optical size as the anchor, so the
      // grown text is metric-identical to it.
      const targetFontSize = () =>
        parseFloat(
          getComputedStyle(
            document.querySelector<HTMLElement>('.pr-overlay-rsms')!
          ).fontSize
        );

      // The stack is never shown: it is a pure layout anchor that sizes the
      // stage and provides the landing rect and baseline measurements. The
      // flown specimens ARE the visible overlay, so there is one setup and
      // nothing to hand off or misalign.
      gsap.set('.pr-overlay-stack', { autoAlpha: 0 });

      // Kill any styles a previous mount left inline (fast-refresh keeps the
      // DOM), so this run starts from clean geometry.
      gsap.set('.pr-detail-big', {
        clearProps: 'transform,fontSize,opacity,visibility,color,zIndex',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          pin: pin.current,
          invalidateOnRefresh: true,
        },
      });

      // Build: each comparison row lands as a matched pair, left and right
      // together, so the two builds can be read line against line...
      const googleRows = gsap.utils.toArray<HTMLElement>(
        '.pr-col-google .pr-detail-row'
      );
      const rsmsRows = gsap.utils.toArray<HTMLElement>(
        '.pr-col-rsms .pr-detail-row'
      );
      googleRows.forEach((row, i) => {
        const pair = rsmsRows[i] ? [row, rsmsRows[i]!] : [row];
        tl.fromTo(
          pair,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
          0.2 + i * 0.55
        );
      });

      // ...then the box borders draw themselves around the finished cards,
      // hold, and the whole build tears back down in reverse...
      tl.fromTo(
        '.pr-col-frame rect',
        { drawSVG: '0%' },
        { drawSVG: '0% 100%', duration: 0.8, stagger: 0.2, ease: 'power2.inOut' },
        '+=0.25'
      )
        .to({}, { duration: 0.55 })
        .to(
          '.pr-detail-row',
          { autoAlpha: 0, y: -16, stagger: 0.08, duration: 0.35 },
          '+=0.2'
        )
        // Explicit start: the real-time entrance tween may still be fading
        // the head in when a fast scroll initializes this teardown, and a
        // captured mid-fade value would strand the headline dim forever.
        .fromTo(
          '.pr-detail-head',
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -40, duration: 0.5, immediateRender: false },
          '<'
        )
        .to(
          '.pr-detail-note, .pr-detail-col header',
          { autoAlpha: 0, duration: 0.35 },
          '<0.1'
        )
        .fromTo(
          '.pr-col-frame rect',
          { drawSVG: '0% 100%' },
          {
            drawSVG: '100% 100%',
            duration: 0.6,
            stagger: 0.1,
            ease: 'power1.in',
            immediateRender: false,
          },
          '>-0.05'
        )
        .addLabel('flight', '>-0.05')
        // ...the two specimens converge on the center, merging into one
        // line as they travel: rewriting into the comparison text, growing
        // to overlay size, the Google build turning red and drifting out of
        // register as its metrics diverge. Red sits above white from the
        // start, exactly as it will rest in the overlay...
        .set('.pr-col-google', { zIndex: 2 }, 'flight')
        .set('.pr-col-rsms', { zIndex: 1 }, 'flight')
        .set('.pr-detail-big', { fontFeatureSettings: OVERLAY_FEATURES }, 'flight')
        .to(
          fly,
          {
            p: 1,
            duration: 1.2,
            ease: 'power2.inOut',
            onUpdate: placePair,
          },
          'flight'
        )
        .to(
          '.pr-detail-big',
          {
            duration: 0.85,
            scrambleText: { text: OVERLAY_TEXT, chars: 'lowerCase', speed: 0.5 },
          },
          'flight+=0.15'
        )
        .to(
          '.pr-detail-big',
          { fontSize: () => targetFontSize(), duration: 1, ease: 'power2.inOut' },
          'flight+=0.2'
        )
        .to(
          '.pr-col-google .pr-detail-big',
          { color: '#ff3b30', duration: 0.5 },
          'flight+=0.5'
        )
        // ...while the specimen guides draw in around the landing spot...
        .fromTo(
          '.pr-guide',
          { drawSVG: '50% 50%' },
          { drawSVG: '0% 100%', duration: 0.7, stagger: 0.09, ease: 'power2.out' },
          'flight+=0.45'
        )
        // ...the guides undraw, leaving only a faint baseline...
        .to(
          '.g-cap, .g-mean, .g-desc',
          { drawSVG: '50% 50%', duration: 0.5, stagger: 0.06, ease: 'power1.in' },
          'flight+=1.55'
        )
        .to('.g-base', { opacity: 0.3, duration: 0.5 }, 'flight+=1.55')
        // The caption (which build is which) sits under the comparison for
        // the whole dwell. fromTo with explicit states: a bare from() can
        // strand the element hidden if the scrub playhead jumps.
        .fromTo(
          '.pr-overlay-legend',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4, immediateRender: true },
          'flight+=1.3'
        )
        // ...and the red layer breathes so the drift flashes in and out.
        .to(
          '.pr-col-google .pr-detail-big',
          { opacity: 0.15, duration: 0.6 },
          'flight+=2.1'
        )
        .to('.pr-col-google .pr-detail-big', { opacity: 0.95, duration: 0.6 }, '>')
        // ...then the comparison rewrites into the name it actually matters
        // for: the two builds, still out of register, on our own wordmark...
        .to(
          '.pr-detail-big',
          {
            duration: 0.8,
            scrambleText: {
              text: 'General Translation',
              chars: 'lowerCase',
              speed: 0.5,
            },
          },
          '+=0.35'
        )
        // ...and breathes again so the two builds can be compared on the
        // wordmark itself...
        .to('.pr-col-google .pr-detail-big', { opacity: 0.15, duration: 0.6 }, '+=0.25')
        .to('.pr-col-google .pr-detail-big', { opacity: 0.95, duration: 0.6 }, '>')
        .to({}, { duration: 0.45 })
        // Finally the comparison yields to the handoff line.
        .to(
          '.pr-overlay-stage, .pr-overlay-legend',
          { autoAlpha: 0, y: -50, duration: 0.6, ease: 'power2.in' },
          '+=0.4'
        )
        .to(
          '.pr-detail-big',
          { autoAlpha: 0, y: '-=50', duration: 0.6, ease: 'power2.in' },
          '<'
        )
        .fromTo(
          '.pr-detail-close',
          { autoAlpha: 0, y: 70 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          '>-0.1'
        )
        .from(
          '.pr-close-tile',
          { autoAlpha: 0, y: 26, stagger: 0.035, duration: 0.4, ease: 'power3.out' },
          '>-0.35'
        )
        .to({}, { duration: 0.5 });

      // The flight getters measure the overlay's layout, and that layout
      // shifts when the webfonts finish loading (the centered stack's origin
      // depends on the red line's width). Re-measure the baseline and force
      // every function-based value to re-evaluate against final geometry.
      document.fonts.ready.then(() => {
        alignBaselines();
        tl.invalidate();
        ScrollTrigger.refresh();
        // If the viewer is resting mid-dwell when fonts land, no scroll tick
        // will re-run the placement, so do it once here.
        placePair();
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className='pr-slide pr-detail' data-slide='detail'>
      <link rel='stylesheet' href='https://rsms.me/inter/inter.css' precedence='default' />
      <div ref={pin} className='pr-pin pr-detail-inner'>
        <div className='pr-detail-main'>
          <div className='pr-detail-head'>
            <h2>
              Fun fact: We were using the{' '}
              <span className='pr-wrong-inter'>
                wrong <em className='pr-glitch-inter'>Inter</em>
              </span>
              .
            </h2>
            <p className='pr-sub'>
              The Inter that Google Fonts serves is not quite the Inter that
              Rasmus Andersson ships. The official build keeps its OpenType
              features; the hosted one quietly drops most of them. Same name,
              different font.
            </p>
          </div>
          <div className='pr-detail-grid'>
            <Specimen
              name='Inter, via Google Fonts'
              stack='var(--font-inter)'
              variant='google'
            />
            <Specimen name='Inter, via rsms.me' stack={RSMS_STACK} variant='rsms' />
          </div>
          <p className='pr-detail-note'>Keep scrolling to lay one over the other.</p>
        </div>

        <div className='pr-detail-overlay'>
          <div className='pr-overlay-stage'>
            <svg
              className='pr-overlay-guides'
              aria-hidden
              preserveAspectRatio='none'
              viewBox='0 0 100 100'
            >
              <line className='pr-guide g-cap' x1='0' y1='16' x2='100' y2='16' vectorEffect='non-scaling-stroke' />
              <line className='pr-guide g-mean' x1='0' y1='40' x2='100' y2='40' vectorEffect='non-scaling-stroke' />
              <line className='pr-guide g-base' x1='0' y1='76' x2='100' y2='76' vectorEffect='non-scaling-stroke' />
              <line className='pr-guide g-desc' x1='0' y1='92' x2='100' y2='92' vectorEffect='non-scaling-stroke' />
            </svg>
            <div className='pr-overlay-stack'>
              <p
                className='pr-overlay-line pr-overlay-rsms'
                style={{ fontFamily: RSMS_STACK, fontFeatureSettings: OVERLAY_FEATURES }}
              >
                {OVERLAY_TEXT}
              </p>
              <p
                className='pr-overlay-line pr-overlay-google'
                aria-hidden
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontFeatureSettings: OVERLAY_FEATURES,
                }}
              >
                {OVERLAY_TEXT}
              </p>
            </div>
          </div>
          <div className='pr-overlay-legend'>
            <span>
              <i className='pr-overlay-dot pr-overlay-dot-red' /> Google Fonts build
            </span>
            <span>
              <i className='pr-overlay-dot' /> Official build
            </span>
            <span className='pr-overlay-hint'>
              Every red fringe is a glyph or metric the hosted build changed.
              Frontend is the details.
            </span>
          </div>
        </div>

        <div className='pr-detail-close'>
          <h3>So I built 20.</h3>
          <div className='pr-close-gallery'>
            {DIRECTIONS.map((direction) => (
              <button
                key={direction.slug}
                type='button'
                className='pr-close-tile'
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('pr:goto', { detail: direction.slug })
                  )
                }
              >
                {/* Placeholder stage; swap in real capture images later. */}
                <span className='pr-close-ph'>
                  <span>{direction.label}</span>
                </span>
                <span className='pr-close-tile-meta'>
                  <span className='pr-close-tile-num'>{direction.label}</span>
                  <strong>{direction.name}</strong>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
