'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';

import Icon, { type IconName } from '../icons';

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin, MorphSVGPlugin);

/**
 * A literal barbell seen from the side: three plates per end in a
 * small-big-small stack so each side echoes the bell hump it replaces, with
 * the bar drawn only where the plates don't cover it. One stroked path so
 * the audience curve can morph into it.
 */
const PLATE_SHAPES = [
  // left plates: small, big, small
  'M 105 88 H 111 a 9 9 0 0 1 9 9 V 183 a 9 9 0 0 1 -9 9 H 105 a 9 9 0 0 1 -9 -9 V 97 a 9 9 0 0 1 9 -9 Z',
  'M 138 58 H 150 a 12 12 0 0 1 12 12 V 210 a 12 12 0 0 1 -12 12 H 138 a 12 12 0 0 1 -12 -12 V 70 a 12 12 0 0 1 12 -12 Z',
  'M 177 88 H 183 a 9 9 0 0 1 9 9 V 183 a 9 9 0 0 1 -9 9 H 177 a 9 9 0 0 1 -9 -9 V 97 a 9 9 0 0 1 9 -9 Z',
  // right plates: small, big, small
  'M 497 88 H 503 a 9 9 0 0 1 9 9 V 183 a 9 9 0 0 1 -9 9 H 497 a 9 9 0 0 1 -9 -9 V 97 a 9 9 0 0 1 9 -9 Z',
  'M 530 58 H 542 a 12 12 0 0 1 12 12 V 210 a 12 12 0 0 1 -12 12 H 530 a 12 12 0 0 1 -12 -12 V 70 a 12 12 0 0 1 12 -12 Z',
  'M 569 88 H 575 a 9 9 0 0 1 9 9 V 183 a 9 9 0 0 1 -9 9 H 569 a 9 9 0 0 1 -9 -9 V 97 a 9 9 0 0 1 9 -9 Z',
];

const BARBELL_D = [
  ...PLATE_SHAPES,
  // bar: sleeve, center span, sleeve
  'M 40 140 H 96 M 192 140 H 488 M 584 140 H 640',
].join(' ');

/**
 * Hatched area under the curve, pre-sliced into six closed regions that
 * partition it at the dip: the three left slices condense into the left
 * plates and the three right slices into the right plates, so the shading
 * splits down the middle during the morph instead of sliding one way.
 * Slice edges reuse the same de Casteljau pieces as the stroke, so adjacent
 * slices share edges and the hatch still reads as one region.
 */
const AREA_FILL_D = [
  'M 20 206 C 50.5 202.9 75.9 168.3 100 135 C 115.2 114.1 129.8 93.7 145 82 L 145 207 L 20 207 Z',
  'M 145 82 C 153.1 75.8 161.4 72 170 72 C 177.9 72 186.3 74.6 195 78.9 L 195 207 L 145 207 Z',
  'M 195 78.9 C 209.3 86.1 224.5 98 240 111.1 C 274.8 140.6 310.8 176 340 176 L 340 207 L 195 207 Z',
  'M 340 176 C 369.2 176 405.2 140.6 440 111.1 C 455.5 98 470.7 86.1 485 78.9 L 485 207 L 340 207 Z',
  'M 485 78.9 C 493.7 74.6 502.1 72 510 72 C 518.6 72 526.9 75.8 535 82 L 535 207 L 485 207 Z',
  'M 535 82 C 550.2 93.7 564.8 114.1 580 135 C 604.1 168.3 629.5 202.9 660 206 L 660 207 L 535 207 Z',
].join(' ');

const PLATES_FILL_D = PLATE_SHAPES.join(' ');

type DemoAfter = { t: string; f?: string };

const DEMOS: {
  k: string;
  icon: IconName;
  title: string;
  before: string;
  after?: DemoAfter;
  cycle?: DemoAfter[];
  code?: boolean;
}[] = [
  {
    k: 'copy',
    icon: 'globe',
    title: 'Translate copy',
    before: '“Start shipping globally.”',
    cycle: [
      { t: '« Commencez à livrer dans le monde entier. »', f: 'fr' },
      { t: '„Weltweit liefern, ab heute.“', f: 'de' },
      { t: '「今日から世界へ届けよう」', f: 'jp' },
      { t: '«Empieza a lanzar globalmente.»', f: 'es' },
    ],
  },
  {
    k: 'code',
    icon: 'code',
    title: 'Change code',
    before: '<p>{greeting}</p>',
    code: true,
  },
  {
    k: 'currency',
    icon: 'coins',
    title: 'Convert currency',
    before: '$49 / mo',
    cycle: [
      { t: '45 € / mois', f: 'fr' },
      { t: '£39 / month', f: 'gb' },
      { t: '¥6,800 / 月', f: 'jp' },
      { t: 'R$ 249 / mês', f: 'br' },
      { t: '49 zł / mies.', f: 'pl' },
    ],
  },
  {
    k: 'format',
    icon: 'calendar',
    title: 'Reformat everything',
    before: '07/30/2026 · 1,000.5 mi',
    cycle: [
      { t: '30.07.2026 · 1 610,2 km', f: 'de' },
      { t: '2026/07/30 · 1,610.2 km', f: 'jp' },
      { t: '30/07/2026 · 1.610,2 km', f: 'br' },
      { t: '2026-07-30 · 1 610,2 km', f: 'se' },
      { t: '٣٠/٠٧/٢٠٢٦ · ١٦١٠٫٢ كم', f: 'sa' },
    ],
  },
];

/** The full-stack pipeline, left to right. */
const PIPELINE: { icon: IconName; label: string; detail: string; hot?: boolean }[] = [
  { icon: 'code', label: '<T> in code', detail: 'components stay components' },
  { icon: 'activity', label: 'CLI', detail: 'scan, translate, validate' },
  { icon: 'layers', label: 'Context Groups', detail: 'inherited meaning', hot: true },
  { icon: 'users', label: 'Review', detail: 'edit, approve, publish' },
  { icon: 'globe', label: 'Edge', detail: 'served per locale' },
];

/** One glossary decision fanning out to every surface. */
const CTX_LEAVES = [
  { f: 'fr', surface: 'App', term: '« Portefeuille »' },
  { f: 'de', surface: 'Docs', term: '„Wallet“' },
  { f: 'jp', surface: 'Checkout', term: '「ウォレット」' },
];

const TERMS: { label: string; icon: IconName }[] = [
  { label: 'translation', icon: 'globe' },
  { label: 'localization', icon: 'layers' },
  { label: 'i18n', icon: 'code' },
  { label: 'l10n', icon: 'type' },
];

/** The element `<T>` wraps in the code card; cycles through real usages. */
const CODE_SNIPPETS = [
  { tag: 'p', expr: 'greeting' },
  { tag: 'h1', expr: 'headline' },
  { tag: 'button', expr: 'cta' },
  { tag: 'li', expr: 'feature' },
  { tag: 'label', expr: 'placeholder' },
];

/**
 * Infinite continuous vertical scroll: the track holds two copies of the
 * item stack and drifts upward by exactly one copy per loop, so the roll
 * never shows a seam and never stops.
 */
function VerticalMarquee({
  items,
  duration = 14,
  className,
}: {
  items: ReactNode[];
  duration?: number;
  className: string;
}) {
  return (
    <span className={`pr-vmarquee ${className}`}>
      <span
        className='pr-vmarquee-track'
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <span key={copy} aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span key={i} className='pr-vmarquee-item'>
                {item}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * First principles, in three pinned beats: the barbell audience, the
 * infrastructure bar, and the challenger sale shown as live transformations.
 */
export default function PrinciplesSlide() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          pin: pin.current,
        },
      });

      // Beat A — the statement.
      tl.fromTo(
        '.pr-need-head',
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, duration: 0.8 }
      )
        .to('.pr-need-head', { autoAlpha: 0, y: -50, duration: 0.7, ease: 'power2.in' }, '+=0.6')

        // Beat B — the barbell draws itself, then the tails and the bar land.
        .fromTo('.pr-need-b', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo(
          '.pr-barbell-path',
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 1.6, ease: 'power1.inOut' },
          '<'
        )
        .fromTo(
          '.pr-barbell-base',
          { drawSVG: '50% 50%' },
          { drawSVG: '0% 100%', duration: 0.9 },
          '<0.2'
        )
        .fromTo(
          '.pr-barbell-fill',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.7, ease: 'power1.inOut' },
          '<0.35'
        )
        .from('.pr-tail-left', { autoAlpha: 0, x: -34, duration: 0.55 }, '>-0.5')
        .from('.pr-tail-right', { autoAlpha: 0, x: 34, duration: 0.55 }, '<0.2')
        .from('.pr-tail-mid', { autoAlpha: 0, y: 14, duration: 0.45 }, '<0.25')
        .from('.pr-infra', { autoAlpha: 0, y: 40, duration: 0.6 }, '+=0.3')
        .from(
          '.pr-infra-chip',
          { autoAlpha: 0, y: 18, stagger: 0.14, duration: 0.4 },
          '<0.15'
        )
        // Each promise checks off as it is made.
        .fromTo(
          '.pr-infra-chip .pr-term-check',
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            stagger: 0.3,
            duration: 0.35,
            ease: 'back.out(2.4)',
          },
          '+=0.3'
        )
        // The audience curve resolves into the thing it was named after,
        // its shading condensing into the plates.
        .to(
          '.pr-barbell-path',
          {
            morphSVG: { shape: BARBELL_D },
            duration: 1.1,
            ease: 'power2.inOut',
          },
          '+=0.5'
        )
        .to(
          '.pr-barbell-fill',
          {
            morphSVG: { shape: PLATES_FILL_D },
            duration: 1.1,
            ease: 'power2.inOut',
          },
          '<'
        )
        .to('.pr-barbell-base', { autoAlpha: 0, duration: 0.4 }, '<')
        .to({}, { duration: 0.7 })
        .to('.pr-need-b', { autoAlpha: 0, y: -60, duration: 0.7, ease: 'power2.in' })

        // Beat C — show, don’t define.
        .fromTo(
          '.pr-need-c-head',
          { autoAlpha: 0, y: 60 },
          { autoAlpha: 1, y: 0, duration: 0.7 }
        )
        .from(
          '.pr-demo-card',
          { autoAlpha: 0, y: 56, stagger: 0.22, duration: 0.55 },
          '>-0.15'
        );

      gsap.utils.toArray<HTMLElement>('.pr-demo-card').forEach((card, i) => {
        const after = card.querySelector('.pr-demo-after');
        const before = card.querySelector('.pr-demo-before');
        if (!after || !before) return;
        tl.fromTo(
          after,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.inOut' },
          `>${i === 0 ? 0.25 : -0.3}`
        )
          // The old value recedes as the localized one lands.
          .to(before, { opacity: 0.35, duration: 0.4 }, '<');
      });

      tl.from('.pr-terms', { autoAlpha: 0, y: 24, duration: 0.5 }, '+=0.3')
        .fromTo(
          '.pr-term-check',
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            stagger: 0.16,
            duration: 0.35,
            ease: 'back.out(2.4)',
          },
          '>-0.1'
        )
        .to({}, { duration: 0.7 })

        // Beat D — the whole system draws itself, then Context Groups fan
        // one glossary decision out to every surface.
        .to('.pr-need-c', { autoAlpha: 0, y: -60, duration: 0.7, ease: 'power2.in' }, '+=0.4')
        .fromTo('.pr-need-d', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 })
        .from('.pr-need-d .pr-beat-title', { autoAlpha: 0, y: 40, duration: 0.5 }, '<0.1')
        .from('.pr-need-d .pr-sub', { autoAlpha: 0, y: 20, duration: 0.4 }, '<0.15')
        .addLabel('pipe', '>-0.1');

      // The system assembles itself: each node pops in and the wire draws
      // onward to the next, one continuous gesture left to right.
      const pipeNodes = gsap.utils.toArray<HTMLElement>('.pr-pipe-node');
      const pipeSegs = gsap.utils.toArray<SVGLineElement>('.pr-pipe-seg');
      pipeNodes.forEach((node, i) => {
        tl.fromTo(
          node,
          { autoAlpha: 0, y: 26, scale: 0.92 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.8)' },
          `pipe+=${i * 0.5}`
        );
        if (pipeSegs[i]) {
          tl.fromTo(
            pipeSegs[i]!,
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.42, ease: 'power1.inOut' },
            `pipe+=${i * 0.5 + 0.25}`
          );
        }
      });

      // The walkthrough: scroll IS the signal. The pulse tracks scroll
      // linearly across the whole line, and each stage lifts and holds
      // while the pulse is passing through it.
      tl.fromTo(
        ['.pr-pipe-pulse', '.pr-pipe-halo'],
        { attr: { cx: 88 }, autoAlpha: 0 },
        { attr: { cx: 912 }, autoAlpha: 1, duration: 4, ease: 'none' },
        'pipe+=2.7'
      );
      pipeNodes.forEach((node, i) => {
        tl.to(
          node,
          { y: -7, scale: 1.04, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.inOut' },
          `pipe+=${2.7 + i - 0.45}`
        );
      });
      tl.to(['.pr-pipe-pulse', '.pr-pipe-halo'], { autoAlpha: 0, duration: 0.25 }, 'pipe+=6.6')
        // ...then Context Groups feeds the spotlight: the stem drops out of
        // the hot node, the group lands, branches draw, and one glossary
        // decision fans out surface by surface as the scroll continues.
        .fromTo(
          '.pr-ctx-stem line',
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 0.5, ease: 'power1.in' },
          'pipe+=6.9'
        )
        .from('.pr-ctx-root', { autoAlpha: 0, y: -16, duration: 0.5 }, 'pipe+=7.3')
        .fromTo(
          '.pr-ctx-tree path',
          { drawSVG: '0%' },
          { drawSVG: '100%', stagger: 0.3, duration: 0.55, ease: 'power1.inOut' },
          'pipe+=7.8'
        )
        .from(
          '.pr-ctx-leaf',
          {
            autoAlpha: 0,
            y: 20,
            scale: 0.95,
            stagger: 0.42,
            duration: 0.5,
            ease: 'back.out(1.6)',
          },
          'pipe+=8.35'
        )
        .from('.pr-ctx-note', { autoAlpha: 0, y: 12, duration: 0.45 }, 'pipe+=9.9')
        .to({}, { duration: 0.9 });
    },
    { scope: root }
  );

  return (
    <section ref={root} className='pr-slide pr-need' data-slide='need'>
      <div ref={pin} className='pr-pin'>
        {/* Beat A */}
        <div className='pr-phase pr-need-head'>
          <h2>First principles.</h2>
          <p className='pr-sub'>
            Before picking a look, pick the truths the site must serve.
          </p>
        </div>

        {/* Beat B — barbell + infrastructure */}
        <div className='pr-phase pr-need-b'>
          <h3 className='pr-beat-title'>A barbell audience.</h3>
          <div className='pr-need-barbell'>
            <svg viewBox='0 0 680 250' aria-hidden>
              <defs>
                <pattern
                  id='pr-hatch'
                  patternUnits='userSpaceOnUse'
                  width='7'
                  height='7'
                  patternTransform='rotate(45)'
                >
                  <line x1='0' y1='0' x2='0' y2='7' />
                </pattern>
              </defs>
              <path className='pr-barbell-fill' d={AREA_FILL_D} />
              <path
                className='pr-barbell-base'
                d='M 20 208 L 660 208'
                pathLength={1}
              />
              {/*
                One visually continuous bimodal curve drawn as nine subpaths
                whose order mirrors the barbell's: each hump's rise, crest,
                and fall morph into that side's small-big-small plates, and
                the tails and dip flatten into the three bar segments. The
                pieces are exact de Casteljau subdivisions of four smooth
                cubics, so every joint is tangent-continuous.
              */}
              <path
                className='pr-barbell-path'
                d={[
                  'M 100 135 C 115.2 114.1 129.8 93.7 145 82',
                  'M 145 82 C 153.1 75.8 161.4 72 170 72 C 177.9 72 186.3 74.6 195 78.9',
                  'M 195 78.9 C 209.3 86.1 224.5 98 240 111.1',
                  'M 440 111.1 C 455.5 98 470.7 86.1 485 78.9',
                  'M 485 78.9 C 493.7 74.6 502.1 72 510 72 C 518.6 72 526.9 75.8 535 82',
                  'M 535 82 C 550.2 93.7 564.8 114.1 580 135',
                  'M 20 206 C 50.5 202.9 75.9 168.3 100 135',
                  'M 240 111.1 C 274.8 140.6 310.8 176 340 176 C 369.2 176 405.2 140.6 440 111.1',
                  'M 580 135 C 604.1 168.3 629.5 202.9 660 206',
                ].join(' ')}
              />
            </svg>
            <div className='pr-tail pr-tail-left'>
              <span className='pr-tail-icon'>
                <Icon name='users' size={18} />
              </span>
              <strong>Casual</strong>
              <p>
                Hobbyists and indie devs. Embraceable and comfortable:{' '}
                <code>npm i gt-next</code> and go.
              </p>
            </div>
            <div className='pr-tail pr-tail-mid'>
              <span>the middle is thin, so design for the tails</span>
            </div>
            <div className='pr-tail pr-tail-right'>
              <span className='pr-tail-icon'>
                <Icon name='building' size={18} />
              </span>
              <strong>Enterprise</strong>
              <p>Buyers and platform teams. Presence, trust, procurement-ready.</p>
            </div>
          </div>
          <div className='pr-infra'>
            <p>Both tails read the same signal:</p>
            <div className='pr-infra-row'>
              <span className='pr-infra-chip'>
                <i className='pr-term-check'>✓</i>
                <Icon name='server' size={15} />
                INFRASTRUCTURE-GRADE
              </span>
              <span className='pr-infra-chip'>
                <i className='pr-term-check'>✓</i>
                <Icon name='zap' size={15} />
                FAST
              </span>
              <span className='pr-infra-chip'>
                <i className='pr-term-check'>✓</i>
                <Icon name='shield' size={15} />
                RELIABLE
              </span>
            </div>
          </div>
        </div>

        {/* Beat C — challenger sale */}
        <div className='pr-phase pr-need-c'>
          <div className='pr-need-c-head'>
            <h3 className='pr-beat-title'>Show, don’t define.</h3>
            <p className='pr-sub'>
              Nobody arrives knowing localization vs. translation vs. i18n, and
              we never make them learn it. The site demonstrates the difference
              instead.
            </p>
          </div>
          <div className='pr-demo-grid'>
            {DEMOS.map((demo) => (
              <div key={demo.k} className='pr-demo-card'>
                <span className='pr-demo-title'>
                  <Icon name={demo.icon} size={15} />
                  {demo.title}
                </span>
                <div className='pr-demo-swap'>
                  <span className='pr-demo-before'>
                    {demo.code ? (
                      <code className='pr-code'>{demo.before}</code>
                    ) : (
                      demo.before
                    )}
                  </span>
                  <span className='pr-demo-after'>
                    {demo.code ? (
                      <code className='pr-code pr-code-block'>
                        <span className='pr-code-line'>
                          <em>{'<T>'}</em>
                        </span>
                        <VerticalMarquee
                          className='pr-vmarquee-code'
                          duration={16}
                          items={CODE_SNIPPETS.map((snippet) => (
                            <span key={snippet.tag} className='pr-code-inner'>
                              <span className='pr-code-line'>{`<${snippet.tag}>`}</span>
                              <span className='pr-code-line pr-code-expr'>{`{${snippet.expr}}`}</span>
                              <span className='pr-code-line'>{`</${snippet.tag}>`}</span>
                            </span>
                          ))}
                        />
                        <span className='pr-code-line'>
                          <em>{'</T>'}</em>
                        </span>
                      </code>
                    ) : (
                      <VerticalMarquee
                        className='pr-vmarquee-text'
                        duration={11 + (demo.k.length % 3) * 2}
                        items={(demo.cycle ?? []).map((entry) => (
                          <span key={entry.t}>
                            {entry.f && (
                              <span className='pr-demo-flag'>{entry.f}</span>
                            )}
                            {entry.t}
                          </span>
                        ))}
                      />
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className='pr-terms'>
            <p>…and the terms still check the boxes:</p>
            <div className='pr-terms-row'>
              {TERMS.map((term) => (
                <span key={term.label} className='pr-term'>
                  <i className='pr-term-check'>✓</i>
                  <Icon name={term.icon} size={16} />
                  {term.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Beat D — the system, end to end, and Context Groups */}
        <div className='pr-phase pr-need-d'>
          <h3 className='pr-beat-title'>End to end, or it doesn&rsquo;t hold.</h3>
          <p className='pr-sub'>
            Not a widget over the site: code, pipeline, context, review, and
            delivery are one framework.
          </p>

          <div className='pr-pipe'>
            <svg
              className='pr-pipe-line'
              viewBox='0 0 1000 12'
              preserveAspectRatio='none'
              aria-hidden
            >
              <line className='pr-pipe-seg' x1='88' y1='6' x2='294' y2='6' />
              <line className='pr-pipe-seg' x1='294' y1='6' x2='500' y2='6' />
              <line className='pr-pipe-seg' x1='500' y1='6' x2='706' y2='6' />
              <line className='pr-pipe-seg' x1='706' y1='6' x2='912' y2='6' />
              <circle className='pr-pipe-halo' cx='88' cy='6' r='10' />
              <circle className='pr-pipe-pulse' cx='88' cy='6' r='4.5' />
            </svg>
            <div className='pr-pipe-nodes'>
              {PIPELINE.map((node) => (
                <span
                  key={node.label}
                  className={node.hot ? 'pr-pipe-node is-hot' : 'pr-pipe-node'}
                >
                  <Icon name={node.icon} size={16} />
                  <strong>{node.label}</strong>
                  <em>{node.detail}</em>
                </span>
              ))}
            </div>
          </div>

          {/* The stem: Context Groups feeding the spotlight below. */}
          <svg className='pr-ctx-stem' viewBox='0 0 2 56' aria-hidden>
            <line x1='1' y1='0' x2='1' y2='56' />
          </svg>

          <div className='pr-ctx'>
            <div className='pr-ctx-root'>
              <Icon name='layers' size={15} />
              Context Group: Payments — glossary and tone every translation
              inherits. &ldquo;wallet&rdquo; means one thing.
            </div>
            <svg className='pr-ctx-tree' viewBox='0 0 600 80' aria-hidden>
              <path d='M 292 3 C 292 42 100 36 100 77' />
              <path d='M 300 3 L 300 77' />
              <path d='M 308 3 C 308 42 500 36 500 77' />
            </svg>
            <div className='pr-ctx-leaves'>
              {CTX_LEAVES.map((leaf) => (
                <span key={leaf.surface} className='pr-ctx-leaf'>
                  <span className='pr-ctx-leaf-surface'>
                    {leaf.f} {leaf.surface}
                  </span>
                  <strong>{leaf.term}</strong>
                </span>
              ))}
            </div>
            <p className='pr-ctx-note'>
              The hardest thing to explain is the thing that keeps it
              consistent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
