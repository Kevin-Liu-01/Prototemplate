'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { langA11y, langClass, prefersReducedMotion, target, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * The same panel, twice, once per writing direction.
 *
 * The mirroring is not drawn — the markup is identical and only `dir`
 * differs, so the browser reverses the rows, moves the button to the far
 * side, and slides the switch knob across on its own. That is the honest
 * demonstration: correct RTL is a property of the layout, not a second
 * design. The back chevron and the underline are the two things a `dir`
 * flip cannot do for you, so those are handled explicitly.
 *
 * The pair is drawn side by side rather than cross-faded because a mirror
 * needs both halves to be a mirror; the loop only passes a slow reading
 * light between them.
 *
 * Accent: the underline, which grows from the leading edge of each panel —
 * left on the left panel, right on the right one.
 */

type Panel = {
  dir: 'ltr' | 'rtl';
  lang: string;
  title: string;
  label: string;
  button: string;
};

const PANELS: readonly Panel[] = [
  { dir: 'ltr', lang: 'en', title: 'Settings', label: 'Notifications', button: 'Save' },
  { dir: 'rtl', lang: 'ar', title: 'الإعدادات', label: 'الإشعارات', button: 'حفظ' },
];

const DWELL = 3.2;
/**
 * The underline never fully retracts: a stub always sits at each panel's
 * leading edge — left on the LTR panel, right on the RTL one — so the
 * direction of the layout is legible in any frame, moving or frozen.
 */
const REST = 0.3;

export default function RtlMirror({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const rules = gsap.utils.toArray<HTMLElement>('[data-rm-rule]', rootEl);
      const panels = gsap.utils.toArray<HTMLElement>('[data-rm-panel]', rootEl);
      if (rules.length !== PANELS.length) return;

      if (prefersReducedMotion()) {
        gsap.set(rules, { scaleX: 1 });
        gsap.set(panels, { autoAlpha: 1 });
        return;
      }

      gsap.set(rules, { scaleX: REST });
      gsap.set(panels, { autoAlpha: 0.66 });

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

      PANELS.forEach((_, i) => {
        const at = i * DWELL;
        tl.to(target(rules, i), { scaleX: 1, duration: 0.85 }, at)
          .to(target(panels, i), { autoAlpha: 1, duration: 0.7 }, at)
          .to(target(panels, i), { autoAlpha: 0.66, duration: 0.6 }, at + DWELL - 0.62)
          .to(target(rules, i), { scaleX: REST, duration: 0.45 }, at + DWELL - 0.5);
      });

      tl.duration(PANELS.length * DWELL);
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-rm', accent, className)} ref={root} {...langA11y(title)}>
      <div className='lang-rm-pair'>
        <i className='lang-rm-axis' />

        {PANELS.map((panel) => (
          <div className='lang-rm-col' key={panel.dir}>
            <p className='lang-rm-dir'>
              <span className='lang-tag'>{`dir="${panel.dir}"`}</span>
            </p>

            <div className='lang-rm-panel' data-rm-panel='' dir={panel.dir} lang={panel.lang}>
              <div className='lang-rm-bar'>
                <span className='lang-rm-back'>
                  <svg viewBox='0 0 12 12' width='11' height='11' aria-hidden='true'>
                    <path d='M7.4 2.2 3.6 6l3.8 3.8' fill='none' stroke='currentColor' strokeWidth='1.2' />
                  </svg>
                </span>
                <span className='lang-rm-title'>{panel.title}</span>
                <span className='lang-rm-dots'>
                  <i />
                  <i />
                  <i />
                </span>
              </div>

              <div className='lang-rm-rail'>
                <i className='lang-rm-rule' data-rm-rule='' />
              </div>

              <div className='lang-rm-row'>
                <span className='lang-rm-label'>{panel.label}</span>
                <span className='lang-rm-switch'>
                  <i />
                </span>
              </div>

              <div className='lang-rm-foot'>
                <span className='lang-rm-btn'>{panel.button}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
