'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
 * a pinned slide, as viewport-height offsets past the slide top, so the rail
 * can represent every moment of the deck.
 */
type SlideSub = { label: string; at: number };

const SLIDES: { id: string; label: string; jump: number; subs?: SlideSub[] }[] = [
  { id: 'intro', label: 'Intro', jump: 0 },
  {
    id: 'why',
    label: 'Why',
    jump: 0.6,
    subs: [
      { label: 'Why?', at: 0.6 },
      { label: 'Three reasons', at: 2.4 },
    ],
  },
  {
    id: 'need',
    label: 'What we need',
    jump: 0.35,
    subs: [
      { label: 'First principles', at: 0.35 },
      { label: 'A barbell audience', at: 1.6 },
      { label: 'Show, don’t define', at: 3.6 },
      { label: 'End to end', at: 5.4 },
      { label: 'Context Groups', at: 6.3 },
    ],
  },
  {
    id: 'craft',
    label: 'How',
    jump: 0.3,
    subs: [
      { label: 'Guidelines', at: 0.5 },
      { label: 'Sketches', at: 1.8 },
      { label: 'Color', at: 3.1 },
      { label: 'Type', at: 4.3 },
      { label: 'Motion', at: 4.6 },
    ],
  },
  {
    id: 'detail',
    label: 'Details',
    jump: 0,
    subs: [
      { label: 'Two Inters', at: 0.3 },
      { label: 'The overlay', at: 3.7 },
      { label: 'So I built 20', at: 4.9 },
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
  const [navHidden, setNavHidden] = useState(false);
  const goToRef = useRef<(slide: number, atOverride?: number) => void>(
    () => {}
  );

  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>('[data-slide]');

      const activeRef = { current: 0 };
      sections.forEach((section, i) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (!self.isActive) return;
            activeRef.current = i;
            setActive(i);
          },
        });
      });

      // The slide dock hides exactly when the viewer dock expands in its
      // place, so the two read as one dock morphing.
      ScrollTrigger.create({
        trigger: '[data-slide="prototypes"]',
        start: 'top top+=8',
        end: 'bottom bottom',
        onToggle: (self) => setNavHidden(self.isActive),
      });

      // Dedicated triggers whose `start` is the exact scroll position of each
      // slide's top — pin spacers make static offset math unreliable.
      const navTriggers = sections.map((section) =>
        ScrollTrigger.create({ trigger: section, start: 'top top' })
      );

      const goTo = (slide: number, atOverride?: number) => {
        const clamped = Math.max(0, Math.min(sections.length - 1, slide));
        const y =
          navTriggers[clamped]!.start +
          (atOverride ?? SLIDES[clamped]?.jump ?? 0) * window.innerHeight;
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
      return () => window.removeEventListener('keydown', onKey);
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
          <div className='pr-hud-brand'>
            <img src='/brand/no-bg-gt-logo-dark.png' alt='General Translation' />
            <span>Redesign</span>
          </div>
          <div className='pr-hud-author'>Kevin Liu</div>
          <nav className='pr-hud-rail' aria-label='Slides'>
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
                    {slide.subs.map((sub) => (
                      <button
                        key={sub.label}
                        type='button'
                        onClick={() => goToRef.current(i, sub.at)}
                      >
                        <i />
                        <em>{sub.label}</em>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className={navHidden ? 'pr-hud-nav is-hidden' : 'pr-hud-nav'}>
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
        </div>
      </div>
    </SmoothScroll>
  );
}
