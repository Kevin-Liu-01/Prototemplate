'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

import { DIRECTIONS } from '@/lib/directions';

import Icon from '../icons';
import { getLenis } from '../lenis';
import RatingStars from './RatingStars';
import { setReview, useReviews } from './reviewStore';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The live prototype stage. The slides frame scales up into a full-screen
 * iframe of the current direction; a dock and a vertical carousel roll switch
 * between prototypes, with notes and a rating saved per direction.
 *
 * Cross-component jumps (scoreboard thumbnails) arrive as a `pr:goto`
 * CustomEvent carrying the target slug.
 */
export default function PrototypeViewer() {
  const root = useRef<HTMLElement>(null);
  const roll = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const activeTrigger = useRef<ScrollTrigger | null>(null);
  const [index, setIndex] = useState(0);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [rollOpen, setRollOpen] = useState(true);
  const reviews = useReviews();

  const current = DIRECTIONS[index]!;
  const review = reviews[current.slug];
  const isLoaded = loadedSlug === current.slug;

  const goTo = (target: number) => {
    setIndex((target + DIRECTIONS.length) % DIRECTIONS.length);
  };

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // Arrow keys page through prototypes only while the stage is on screen.
      activeTrigger.current = ScrollTrigger.create({
        trigger: root.current,
        start: 'top 60%',
        end: 'bottom 40%',
      });

      if (reduced) return;

      // The frame grows from a slide-sized card into the full viewport.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top 85%',
            end: 'top top',
            scrub: 0.35,
          },
        })
        .fromTo(
          '.pr-stage-frame',
          { scale: 0.55, borderRadius: 20 },
          { scale: 1, borderRadius: 0, ease: 'none' }
        )
        .to('.pr-stage-caption', { autoAlpha: 0 }, 0.55);

      // The slide dock hands off here: the viewer dock appears in the slide
      // dock's exact footprint and grows to its full width, the extra
      // controls revealed by the expanding clip — a resize, not a crossfade.
      // Visibility flips instantly in onToggle so nothing ever fades.
      // Both widths are measured up front (the dock is hidden, not
      // display:none, so it measures fine) and the park is a direct style
      // write: the very first visible frame is already the slide dock's
      // pill, and the morph stretches out of it.
      const dockEl = document.querySelector<HTMLElement>('.pr-dock');
      const navEl = document.querySelector<HTMLElement>('.pr-hud-nav');
      const navWidth = navEl?.offsetWidth ?? 140;
      const navHeight = navEl?.offsetHeight ?? 44;
      const dockWidth = (dockEl?.scrollWidth ?? 900) + 2;
      const dockHeight = (dockEl?.scrollHeight ?? 52) + 2;
      gsap.set('.pr-bottom', { visibility: 'hidden' });
      if (dockEl) {
        dockEl.style.maxWidth = `${navWidth}px`;
        dockEl.style.maxHeight = `${navHeight}px`;
      }
      gsap.set('.pr-side', { y: 0, yPercent: -50, xPercent: 118, visibility: 'hidden' });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top+=8',
            toggleActions: 'play none none reverse',
            onToggle: (self) =>
              gsap.set(['.pr-bottom', '.pr-side'], {
                visibility: self.isActive ? 'visible' : 'hidden',
              }),
          },
        })
        .to(
          '.pr-dock',
          {
            maxWidth: dockWidth,
            maxHeight: dockHeight,
            duration: 0.6,
            ease: 'power3.inOut',
          },
          0
        )
        .fromTo(
          '.pr-side',
          { xPercent: 118 },
          { xPercent: 0, duration: 0.55, ease: 'power2.out' },
          0.12
        );

      // While the stage is docked, presenter scroll drives the embedded
      // site's own scroll: the dwell maps onto the full page height, so the
      // deck's scroll becomes the website's scroll.
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () =>
          `+=${(root.current?.offsetHeight ?? 0) - window.innerHeight * 2}`,
        onUpdate: (self) => {
          const el = frame.current;
          const win = el?.contentWindow;
          const doc = el?.contentDocument;
          if (!win || !doc?.documentElement) return;
          const max = doc.documentElement.scrollHeight - win.innerHeight;
          if (max <= 0) return;
          const y = self.progress * max;
          const innerLenis = (win as unknown as { lenis?: { scrollTo: (v: number, o?: object) => void } }).lenis;
          if (innerLenis) innerLenis.scrollTo(y, { immediate: true });
          else win.scrollTo(0, y);
        },
      });
    },
    { scope: root }
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (!activeTrigger.current?.isActive) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')
      )
        return;
      if (event.key === 'ArrowRight')
        setIndex((i) => (i + 1) % DIRECTIONS.length);
      else if (event.key === 'ArrowLeft')
        setIndex((i) => (i - 1 + DIRECTIONS.length) % DIRECTIONS.length);
      else if (event.key === 'g' || event.key === 'G')
        setGridOpen((open) => !open);
      else if (event.key === 'Escape') {
        setGridOpen(false);
        setNotesOpen(false);
      } else return;
      event.preventDefault();
    };

    const onGoto = (event: Event) => {
      const slug = (event as CustomEvent<string>).detail;
      const found = DIRECTIONS.findIndex((d) => d.slug === slug);
      if (found < 0 || !root.current) return;
      setIndex(found);
      const y =
        root.current.getBoundingClientRect().top +
        window.scrollY +
        window.innerHeight * 1.05;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: 1.3 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('pr:goto', onGoto);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pr:goto', onGoto);
    };
  }, []);

  // The SSR-rendered iframe can finish loading before hydration attaches
  // React's onLoad, so the veil would never lift — watch the load natively and
  // treat an already-complete document as loaded.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const slug = current.slug;
    const markLoaded = () => setLoadedSlug(slug);
    const doc = el.contentDocument;
    if (doc?.readyState === 'complete' && doc.body?.childElementCount)
      markLoaded();
    el.addEventListener('load', markLoaded);
    return () => el.removeEventListener('load', markLoaded);
  }, [current.slug]);

  // Keep the roll scrolled so the current card sits mid-rail.
  useEffect(() => {
    const container = roll.current;
    const item = container?.querySelector<HTMLElement>('.is-current');
    if (!container || !item) return;
    container.scrollTo({
      top: item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2,
      behavior: 'smooth',
    });
  }, [index]);

  const scrollToScoreboard = () => {
    const target = document.getElementById('pr-scoreboard');
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={root} className='pr-slide pr-proto' data-slide='prototypes'>
      <div className='pr-stage'>
        <p className='pr-stage-caption'>
          Twenty-two directions. Scroll each one, rate it, leave notes.
        </p>

        <div className='pr-stage-frame'>
          <iframe
            ref={frame}
            key={current.slug}
            src={`/d/${current.slug}?chrome=0`}
            title={current.name}
            className={isLoaded ? 'is-loaded' : ''}
          />
          {!isLoaded && (
            <div className='pr-stage-veil'>
              <span>
                LOADING {current.label} · {current.name.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className={rollOpen ? 'pr-side' : 'pr-side is-closed'}>
          <button
            type='button'
            className='pr-side-toggle'
            onClick={() => setRollOpen((open) => !open)}
            aria-label={rollOpen ? 'Collapse prototype list' : 'Expand prototype list'}
          >
            <Icon name={rollOpen ? 'arrow-right' : 'arrow-left'} size={13} />
          </button>
          <aside ref={roll} className='pr-roll' data-lenis-prevent aria-label='All prototypes'>
            {DIRECTIONS.map((direction, i) => {
              const rating = reviews[direction.slug]?.rating ?? 0;
              return (
                <button
                  key={direction.slug}
                  type='button'
                  className={`pr-roll-card${i === index ? ' is-current' : ''}`}
                  onClick={() => goTo(i)}
                >
                  <span className='pr-roll-top'>
                    <span className='pr-roll-num'>{direction.label}</span>
                    <i
                      className={`pr-roll-dot pr-dot-${direction.tone}`}
                      title={`${direction.tone} direction`}
                    />
                  </span>
                  <strong>{direction.name}</strong>
                  <span className='pr-roll-sig'>{direction.signature}</span>
                  {rating > 0 && (
                    <span className='pr-roll-stars'>{'★'.repeat(rating)}</span>
                  )}
                </button>
              );
            })}
          </aside>
        </div>


        {gridOpen && (
          <div className='pr-grid' onClick={() => setGridOpen(false)}>
            {DIRECTIONS.map((direction, i) => {
              const rating = reviews[direction.slug]?.rating ?? 0;
              return (
                <button
                  key={direction.slug}
                  type='button'
                  className={i === index ? 'is-current' : ''}
                  onClick={() => {
                    goTo(i);
                    setGridOpen(false);
                  }}
                >
                  <span className='pr-roll-num'>{direction.label}</span>
                  <strong>{direction.name}</strong>
                  <p>{direction.concept}</p>
                  {rating > 0 && (
                    <span className='pr-roll-stars'>{'★'.repeat(rating)}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className='pr-bottom'>
          {notesOpen && (
            <div className='pr-notes' data-lenis-prevent>
              <header>
                NOTES · {current.label} {current.name.toUpperCase()}
                <button type='button' onClick={() => setNotesOpen(false)} aria-label='Close notes'>
                  ✕
                </button>
              </header>
              <textarea
                // eslint-disable-next-line jsx-a11y/no-autofocus -- opened by an explicit click; focus should land in the field
                autoFocus
                value={review?.note ?? ''}
                placeholder='What works, what doesn’t…'
                onChange={(event) =>
                  setReview(current.slug, { note: event.target.value })
                }
              />
            </div>
          )}

          <div className='pr-dock' data-lenis-prevent>
          <button type='button' onClick={() => goTo(index - 1)} aria-label='Previous prototype'>
            <Icon name='arrow-left' size={15} />
          </button>
          <button
            type='button'
            className='pr-dock-label'
            onClick={() => setGridOpen((open) => !open)}
          >
            <span>
              {current.label} · {String(index + 1).padStart(2, '0')}/
              {DIRECTIONS.length}
            </span>
            <strong>{current.name}</strong>
          </button>
          <button type='button' onClick={() => goTo(index + 1)} aria-label='Next prototype'>
            <Icon name='arrow-right' size={15} />
          </button>
          <button
            type='button'
            onClick={() => setGridOpen((open) => !open)}
            aria-label='All prototypes'
          >
            <Icon name='grid' size={14} />
          </button>
          <i className='pr-dock-sep' />
          <RatingStars
            value={review?.rating ?? 0}
            onChange={(rating) => setReview(current.slug, { rating })}
          />
          <button
            type='button'
            className={notesOpen || review?.note ? 'pr-dock-notes is-active' : 'pr-dock-notes'}
            onClick={() => setNotesOpen((open) => !open)}
          >
            <Icon name='pencil' size={13} />
            Notes{review?.note ? ' •' : ''}
          </button>
          <i className='pr-dock-sep' />
          <button type='button' className='pr-dock-summary' onClick={scrollToScoreboard}>
            Verdict
            <Icon name='arrow-down' size={13} />
          </button>
          </div>
        </div>
      </div>
    </section>
  );
}
