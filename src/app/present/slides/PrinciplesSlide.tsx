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
const BARBELL_D = [
  // left plates: small, big, small
  'M 105 88 H 111 a 9 9 0 0 1 9 9 V 183 a 9 9 0 0 1 -9 9 H 105 a 9 9 0 0 1 -9 -9 V 97 a 9 9 0 0 1 9 -9 Z',
  'M 138 58 H 150 a 12 12 0 0 1 12 12 V 210 a 12 12 0 0 1 -12 12 H 138 a 12 12 0 0 1 -12 -12 V 70 a 12 12 0 0 1 12 -12 Z',
  'M 177 88 H 183 a 9 9 0 0 1 9 9 V 183 a 9 9 0 0 1 -9 9 H 177 a 9 9 0 0 1 -9 -9 V 97 a 9 9 0 0 1 9 -9 Z',
  // right plates: small, big, small
  'M 497 88 H 503 a 9 9 0 0 1 9 9 V 183 a 9 9 0 0 1 -9 9 H 497 a 9 9 0 0 1 -9 -9 V 97 a 9 9 0 0 1 9 -9 Z',
  'M 530 58 H 542 a 12 12 0 0 1 12 12 V 210 a 12 12 0 0 1 -12 12 H 530 a 12 12 0 0 1 -12 -12 V 70 a 12 12 0 0 1 12 -12 Z',
  'M 569 88 H 575 a 9 9 0 0 1 9 9 V 183 a 9 9 0 0 1 -9 9 H 569 a 9 9 0 0 1 -9 -9 V 97 a 9 9 0 0 1 9 -9 Z',
  // bar: sleeve, center span, sleeve
  'M 40 140 H 96 M 192 140 H 488 M 584 140 H 640',
].join(' ');

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
      { t: '« Commencez à livrer dans le monde entier. »', f: '🇫🇷' },
      { t: '„Weltweit liefern, ab heute.“', f: '🇩🇪' },
      { t: '「今日から世界へ届けよう」', f: '🇯🇵' },
      { t: '«Empieza a lanzar globalmente.»', f: '🇪🇸' },
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
      { t: '45 € / mois', f: '🇫🇷' },
      { t: '£39 / month', f: '🇬🇧' },
      { t: '¥6,800 / 月', f: '🇯🇵' },
      { t: 'R$ 249 / mês', f: '🇧🇷' },
      { t: '49 zł / mies.', f: '🇵🇱' },
    ],
  },
  {
    k: 'format',
    icon: 'calendar',
    title: 'Reformat everything',
    before: '07/30/2026 · 1,000.5 mi',
    cycle: [
      { t: '30.07.2026 · 1 610,2 km', f: '🇩🇪' },
      { t: '2026/07/30 · 1,610.2 km', f: '🇯🇵' },
      { t: '30/07/2026 · 1.610,2 km', f: '🇧🇷' },
      { t: '2026-07-30 · 1 610,2 km', f: '🇸🇪' },
      { t: '٣٠/٠٧/٢٠٢٦ · ١٦١٠٫٢ كم', f: '🇸🇦' },
    ],
  },
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
        .from('.pr-tail-left', { autoAlpha: 0, x: -34, duration: 0.55 }, '>-0.5')
        .from('.pr-tail-right', { autoAlpha: 0, x: 34, duration: 0.55 }, '<0.2')
        .from('.pr-tail-mid', { autoAlpha: 0, y: 14, duration: 0.45 }, '<0.25')
        .from('.pr-infra', { autoAlpha: 0, y: 40, duration: 0.6 }, '+=0.3')
        .from(
          '.pr-infra-chip',
          { autoAlpha: 0, y: 18, stagger: 0.14, duration: 0.4 },
          '<0.15'
        )
        // The audience curve resolves into the thing it was named after.
        .to(
          '.pr-barbell-path',
          {
            morphSVG: { shape: BARBELL_D },
            duration: 1.1,
            ease: 'power2.inOut',
          },
          '+=0.5'
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
        .to({}, { duration: 0.7 });
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
                <Icon name='server' size={15} />
                INFRASTRUCTURE-GRADE
              </span>
              <span className='pr-infra-chip'>
                <Icon name='zap' size={15} />
                FAST
              </span>
              <span className='pr-infra-chip'>
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
      </div>
    </section>
  );
}
