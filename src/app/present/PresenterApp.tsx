'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRef, useState } from 'react';

import SmoothScroll from '@/components/shared/SmoothScroll';

import Icon from './icons';
import { getLenis } from './lenis';
import CraftSlide from './slides/CraftSlide';
import IntroSlide from './slides/IntroSlide';
import PrinciplesSlide from './slides/PrinciplesSlide';
import TypeDetailSlide from './slides/TypeDetailSlide';
import WhySlide from './slides/WhySlide';
import PrototypeViewer from './viewer/PrototypeViewer';
import Scoreboard from './viewer/Scoreboard';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * `jump` is the extra viewport-heights to land past a slide's top when
 * navigating. Pinned slides scrub their content in from scroll progress 0, so
 * landing exactly on the top shows an empty stage — the offset drops you on
 * the slide's first fully-revealed beat instead. `subs` are the beats inside
 * a pinned slide, each positioned as a FRACTION of the slide's pin length
 * (matching where that beat sits in the scrubbed timeline), so highlighting
 * and jumps stay accurate at any viewport size.
 */
type SlideSub = { label: string; f: number };

const SLIDES: { id: string; label: string; jump: number; subs?: SlideSub[] }[] = [
  { id: 'intro', label: 'Intro', jump: 0 },
  {
    id: 'why',
    label: 'Why',
    jump: 0.6,
    subs: [
      { label: 'Why?', f: 0.06 },
      { label: 'Three reasons', f: 0.35 },
    ],
  },
  {
    id: 'need',
    label: 'What we need',
    jump: 0.35,
    subs: [
      { label: 'First principles', f: 0.02 },
      { label: 'A barbell audience', f: 0.13 },
      { label: 'Show, don’t define', f: 0.38 },
      { label: 'End to end', f: 0.62 },
      { label: 'Context Groups', f: 0.86 },
    ],
  },
  {
    id: 'craft',
    label: 'How',
    jump: 0.3,
    subs: [
      { label: 'Guidelines', f: 0.02 },
      { label: 'Sketches', f: 0.17 },
      { label: 'Color', f: 0.42 },
      { label: 'Type', f: 0.66 },
      { label: 'Motion', f: 0.9 },
    ],
  },
  {
    id: 'detail',
    label: 'Details',
    jump: 0,
    subs: [
      { label: 'Two Inters', f: 0.02 },
      { label: 'The overlay', f: 0.5 },
      { label: 'General Translation', f: 0.67 },
      { label: 'So I built 12', f: 0.87 },
    ],
  },
  { id: 'prototypes', label: 'Prototypes', jump: 0.05 },
  { id: 'scoreboard', label: 'Verdict', jump: 0 },
];

/**
 * The presenter frame: one Lenis scrollport, a HUD rail for orientation, and
 * keyboard paging. Up/Down/Space page between slides; Left/Right are owned by
 * the prototype viewer for switching directions.
 */
export default function PresenterApp() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [activeSub, setActiveSub] = useState(-1);
  const [railHidden, setRailHidden] = useState(false);
  const dock = useRef<HTMLDivElement>(null);
  const goToRef = useRef<(slide: number, atOverride?: number) => void>(
    () => {}
  );

  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>('[data-slide]');

      // One dock, two faces. The viewer announces mode via pr:chrome; the
      // pill FLIPs between its measured sizes — content swaps instantly,
      // the box eases, the clip reveals or swallows the extra controls.
      const onChrome = (event: Event) => {
        const on = !!(event as CustomEvent<boolean>).detail;
        const el = dock.current;
        if (!el || (el.dataset.mode === 'viewer') === on) return;
        const before = { width: el.offsetWidth, height: el.offsetHeight };
        el.dataset.mode = on ? 'viewer' : 'slides';
        const after = { width: el.offsetWidth, height: el.offsetHeight };
        gsap.fromTo(el, before, {
          ...after,
          duration: 0.55,
          ease: 'power3.inOut',
          overwrite: 'auto',
          clearProps: 'width,height',
        });
      };
      window.addEventListener('pr:chrome', onChrome);

      // The rail hides for the whole prototypes run and returns at the
      // verdict; its fade is a CSS transition, so a plain trigger is fine.
      ScrollTrigger.create({
        trigger: '[data-slide="prototypes"]',
        start: 'top top+=8',
        end: 'bottom bottom',
        onToggle: (self) => setRailHidden(self.isActive),
      });

      // Dedicated triggers whose `start` is the exact scroll position of each
      // slide's top — pin spacers make static offset math unreliable.
      const navTriggers = sections.map((section) =>
        ScrollTrigger.create({ trigger: section, start: 'top top' })
      );

      // One source of truth for both highlights: section and beat are derived
      // together from the scroll position against the slides' real geometry,
      // so the two can never disagree. A slide is active once its top passes
      // mid-viewport; the beat is its position within the slide's pin length,
      // matched against the subs' timeline fractions.
      /* Sentinels, not 0/-1: a remounted effect (strict mode, fast refresh)
         gets fresh refs while the React state may still hold the previous
         instance's value — computed from the OLD page's scroll position on
         a client-side navigation. Starting outside the valid range forces
         the first sync to push state, so ref and rail can never diverge. */
      const activeRef = { current: -1 };
      const subRef = { current: -2 };
      const pinLength = (i: number) =>
        Math.max(1, (sections[i]?.offsetHeight ?? 0) - window.innerHeight);
      const syncPosition = () => {
        const pos = window.scrollY;
        const bias = window.innerHeight * 0.45;
        let slide = 0;
        for (let i = 0; i < sections.length; i++) {
          if (pos >= (navTriggers[i]?.start ?? 0) - bias) slide = i;
        }
        const subs = SLIDES[slide]?.subs;
        let sub = -1;
        if (subs) {
          const fraction =
            (pos - (navTriggers[slide]?.start ?? 0)) / pinLength(slide);
          for (let j = 0; j < subs.length; j++) {
            if (fraction >= subs[j]!.f - 0.015) sub = j;
          }
          if (sub === -1) sub = 0;
        }
        if (slide !== activeRef.current) {
          activeRef.current = slide;
          setActive(slide);
        }
        if (sub !== subRef.current) {
          subRef.current = sub;
          setActiveSub(sub);
        }
      };
      ScrollTrigger.create({
        trigger: root.current,
        start: 0,
        end: 'max',
        onUpdate: syncPosition,
        onRefresh: syncPosition,
      });
      syncPosition();

      /* A client-side navigation can run that first sync against the
         PREVIOUS page's scroll position (Next resets scroll a beat later)
         and against pre-pin geometry — which sticks the rail on a phantom
         slide while the viewer is actually at the top. Re-derive once the
         reset scroll and the settled pin spacers are real. */
      const raf = requestAnimationFrame(syncPosition);
      const settle = window.setTimeout(() => {
        ScrollTrigger.refresh();
        syncPosition();
      }, 150);

      const goTo = (slide: number, subFraction?: number) => {
        const clamped = Math.max(0, Math.min(sections.length - 1, slide));
        const y =
          navTriggers[clamped]!.start +
          (subFraction !== undefined
            ? subFraction * pinLength(clamped)
            : (SLIDES[clamped]?.jump ?? 0) * window.innerHeight);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 1.2 });
        else window.scrollTo({ top: y, behavior: 'smooth' });
      };
      goToRef.current = goTo;

      const onKey = (event: KeyboardEvent) => {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        const target = event.target;
        if (
          target instanceof HTMLElement &&
          (target.tagName === 'TEXTAREA' ||
            target.tagName === 'INPUT' ||
            target.isContentEditable)
        )
          return;

        const { key } = event;
        if (key === ' ' || key === 'ArrowDown' || key === 'PageDown' || key === 'j')
          goTo(activeRef.current + 1);
        else if (key === 'ArrowUp' || key === 'PageUp' || key === 'k')
          goTo(activeRef.current - 1);
        else if (key === 'Home') goTo(0);
        else if (key === 'End') goTo(sections.length - 1);
        else if (/^[1-9]$/.test(key)) goTo(Number(key) - 1);
        else return;
        event.preventDefault();
      };

      window.addEventListener('keydown', onKey);
      return () => {
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('pr:chrome', onChrome);
        cancelAnimationFrame(raf);
        window.clearTimeout(settle);
      };
    },
    { scope: root }
  );

  return (
    <SmoothScroll>
      <div ref={root} className='pr-root'>
        <IntroSlide />
        <WhySlide />
        <PrinciplesSlide />
        <CraftSlide />
        <TypeDetailSlide />
        <PrototypeViewer />
        <Scoreboard />

        <div className='pr-hud'>
          <Link href='/' className='pr-hud-brand' aria-label='Back to the index'>
            <img src='/brand/no-bg-gt-logo-dark.png' alt='General Translation' />
            <span>Redesign</span>
          </Link>
          <div className='pr-hud-author'>Kevin Liu</div>
          <nav
            className={`pr-hud-rail${active === 0 ? ' no-scrim' : ''}${railHidden ? ' is-hidden' : ''}`}
            aria-label='Slides'
          >
            {SLIDES.map((slide, i) => (
              <div
                key={slide.id}
                className={i === active ? 'pr-hud-item is-active' : 'pr-hud-item'}
              >
                <button type='button' onClick={() => goToRef.current(i)}>
                  <i />
                  <em>{slide.label}</em>
                </button>
                {slide.subs && (
                  <div className='pr-hud-subs'>
                    <div className='pr-hud-subs-inner'>
                      {slide.subs.map((sub, j) => (
                        <button
                          key={sub.label}
                          type='button'
                          className={
                            i === active && j === activeSub ? 'is-here' : ''
                          }
                          style={{ '--i': j } as React.CSSProperties}
                          onClick={() => goToRef.current(i, sub.f)}
                        >
                          <i />
                          <em>{sub.label}</em>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
          {/* The one dock. Slide paging normally; the prototype viewer
              portals its controls into the viewer slot and flips data-mode
              via pr:chrome, so the same pill expands into the viewer dock
              and contracts back. Notes render through the slot above so
              they always share this pill's width. */}
          <div className='pr-bottom'>
            <div id='pr-notes-slot' className='pr-notes-slot' />
            <div ref={dock} className='pr-dock' data-mode='slides'>
              <div className='pr-dock-set pr-dock-set-slides'>
                <button
                  type='button'
                  onClick={() => goToRef.current(active - 1)}
                  aria-label='Previous slide'
                >
                  <Icon name='arrow-up' size={15} />
                </button>
                <button
                  type='button'
                  onClick={() => goToRef.current(active + 1)}
                  aria-label='Next slide'
                >
                  <Icon name='arrow-down' size={15} />
                </button>
                <span className='pr-hud-count'>
                  {String(active + 1).padStart(2, '0')} /{' '}
                  {String(SLIDES.length).padStart(2, '0')}
                </span>
              </div>
              <div id='pr-dock-viewer-slot' className='pr-dock-set pr-dock-set-viewer' />
            </div>
          </div>
        </div>
      </div>
    </SmoothScroll>
  );
}
