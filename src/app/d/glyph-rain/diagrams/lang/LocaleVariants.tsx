'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { langA11y, langClass, prefersReducedMotion, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The expanding row, not the marquee. Four base languages open into their
 * real regional variants — every tag verbatim from
 * packages/supported-locales/src/supportedLocales.ts — because "100+
 * languages" is a marketing number until zh splits into Hans and Hant.
 * The catalogue lists the bare tag first in every family, so the row does
 * too: the base tag is the inked chip its variants hang off. The four
 * families shown are the four deepest in the catalogue — es alone opens
 * into ten tags — so every row runs the full width of its cell.
 *
 * One-shot on entry: each row's chips stagger in left to right, rows 180ms
 * apart, and then the diagram is done moving. The canonical still is all
 * four rows open with zh-Hans and zh-Hant adjacent.
 *
 * Accent: the zh-Hant chip — the variant the subhead argues about.
 */

type Row = {
  tag: string;
  /** The language in its own language. */
  name: string;
  lang: string;
  variants: readonly string[];
};

const ROWS: readonly Row[] = [
  { tag: 'ar', name: 'العربية', lang: 'ar', variants: ['ar', 'ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: '中文', lang: 'zh', variants: ['zh', 'zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'es', name: 'Español', lang: 'es', variants: ['es', 'es-ES', 'es-419', 'es-AR', 'es-CL', 'es-CO', 'es-MX', 'es-PE', 'es-US', 'es-VE'] },
  { tag: 'fr', name: 'Français', lang: 'fr', variants: ['fr', 'fr-FR', 'fr-BE', 'fr-CM', 'fr-CA', 'fr-CH', 'fr-SN'] },
];

const LIT = 'zh-Hant';

export default function LocaleVariants({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;
      if (prefersReducedMotion()) return;

      const rows = gsap.utils.toArray<HTMLElement>('[data-lv-row]', rootEl);

      ScrollTrigger.create({
        trigger: rootEl,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          rows.forEach((row, i) => {
            const chips = gsap.utils.toArray<HTMLElement>('[data-lv-chip]', row);
            gsap.fromTo(
              chips,
              { autoAlpha: 0, x: -6 },
              { autoAlpha: 1, x: 0, duration: 0.42, stagger: 0.06, delay: i * 0.18, ease: 'power2.out' },
            );
          });
        },
      });
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-lv', accent, className)} ref={root} {...langA11y(title)}>
      <div className='lang-lv-rows'>
        {ROWS.map((row) => (
          <div className='lang-lv-row' data-lv-row='' key={row.tag}>
            <span className='lang-lv-base'>
              <span className='lang-tag'>{row.tag}</span>
              <span className='lang-lv-name' lang={row.lang}>
                {row.name}
              </span>
            </span>
            <span className='lang-lv-chips'>
              {row.variants.map((variant) => (
                <code
                  className={
                    variant === LIT
                      ? 'lang-lv-chip is-lit'
                      : variant === row.tag
                        ? 'lang-lv-chip is-base'
                        : 'lang-lv-chip'
                  }
                  data-lv-chip=''
                  key={variant}
                >
                  {variant}
                </code>
              ))}
            </span>
          </div>
        ))}
      </div>

      <div className='lang-lv-tail'>
        <span>
          + the long tail — <code>cnr</code> Montenegrin · <code>cy</code> Welsh
        </span>
        <span className='lang-lv-count'>78 base languages · 129 distinct locale tags</span>
      </div>
    </div>
  );
}
