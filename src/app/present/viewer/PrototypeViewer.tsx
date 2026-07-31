'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { DIRECTIONS } from '@/lib/directions';
import { useMountEffect } from '@/lib/use-mount-effect';

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
  const [dockSlot, setDockSlot] = useState<HTMLElement | null>(null);
  const [notesSlot, setNotesSlot] = useState<HTMLElement | null>(null);
  const reviews = useReviews();

  // The dock is one shared pill in the presenter HUD; this viewer portals
  // its controls (and the notes panel) into the pill's slots.
  useMountEffect(() => {
    setDockSlot(document.getElementById('pr-dock-viewer-slot'));
    setNotesSlot(document.getElementById('pr-notes-slot'));
  });

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

      // Deep link (/present?d=slug — the index rows link this way): land
      // docked on the requested prototype, and KEEP landing it. On a
      // client-side navigation the document grows while slides lay out (and
      // in dev, compile), early jumps clamp, Next's late scroll-to-top can
      // undo one that took, and every ScrollTrigger refresh can move the
      // target — so re-snap on a timer ladder AND after every refresh.
      // Only real user input stops the re-snaps.
      const cleanupDeepLink = (() => {
        const slug = new URLSearchParams(window.location.search).get('d');
        const found = DIRECTIONS.findIndex(
          (direction) => direction.slug === slug
        );
        if (found < 0) return () => {};
        setIndex(found);
        let userMoved = false;
        const markUser = () => {
          userMoved = true;
        };
        const snap = () => {
          if (userMoved || !root.current) return;
          window.scrollTo(
            0,
            Math.round(
              root.current.getBoundingClientRect().top +
                window.scrollY +
                window.innerHeight * 0.3
            )
          );
        };
        const timers = [150, 500, 1000, 1800, 3000, 4500].map((ms) =>
          window.setTimeout(snap, ms)
        );
        const stop = window.setTimeout(() => markUser(), 5200);
        ScrollTrigger.addEventListener('refresh', snap);
        window.addEventListener('wheel', markUser, { passive: true });
        window.addEventListener('touchstart', markUser, { passive: true });
        window.addEventListener('keydown', markUser);
        return () => {
          timers.forEach((timer) => window.clearTimeout(timer));
          window.clearTimeout(stop);
          ScrollTrigger.removeEventListener('refresh', snap);
          window.removeEventListener('wheel', markUser);
          window.removeEventListener('touchstart', markUser);
          window.removeEventListener('keydown', markUser);
        };
      })();

      if (reduced) return cleanupDeepLink;

      // The frame grows from a slide-sized card into the full viewport.
      // scrub:true (no lag) so the frame is visually docked at the exact
      // scroll position where the inner-scroll handoff becomes possible.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top 85%',
            end: 'top top',
            scrub: true,
          },
        })
        .fromTo(
          '.pr-stage-frame',
          { scale: 0.55, borderRadius: 20 },
          { scale: 1, borderRadius: 0, ease: 'none' }
        );

      // The dock is the presenter's shared pill: this viewer only announces
      // mode over pr:chrome and the pill morphs itself. Entering docked, the
      // pill expands while the roll slides in; leaving back up, the pill
      // contracts while the roll slides away; leaving down into the verdict
      // the chrome just cuts as the stage scrolls off.
      const setChrome = (on: boolean) => {
        if (!on) setNotesOpen(false);
        window.dispatchEvent(new CustomEvent('pr:chrome', { detail: on }));
      };
      gsap.set('.pr-side', { y: 0, yPercent: -50, xPercent: 118, visibility: 'hidden' });

      gsap
        .timeline({
          onReverseComplete: () =>
            gsap.set('.pr-side', { visibility: 'hidden' }),
          scrollTrigger: {
            trigger: root.current,
            start: 'top top+=8',
            end: 'bottom bottom',
            toggleActions: 'play none none reverse',
            onToggle: (self) => {
              if (self.isActive) {
                gsap.set('.pr-side', { visibility: 'visible' });
                setChrome(true);
              } else {
                setChrome(false);
                if (self.direction === 1)
                  gsap.set('.pr-side', { visibility: 'hidden' });
              }
            },
          },
        })
        .fromTo(
          '.pr-side',
          { xPercent: 118 },
          { xPercent: 0, duration: 0.55, ease: 'power2.out' },
          0.12
        );

      // While the stage is docked, presenter scroll drives the embedded
      // site's own scroll: the dwell maps onto the full page height, so the
      // deck's scroll becomes the website's scroll. The first stretch of the
      // dwell is a deadzone — you scroll to get INTO the preview, it settles
      // fully docked, and only then does further scroll move the page inside.
      const DEADZONE = 0.08;
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
          const progress = Math.max(
            0,
            (self.progress - DEADZONE) / (1 - DEADZONE)
          );
          win.scrollTo(0, progress * max);
        },
      });

      return cleanupDeepLink;
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

  // The frame takes the pointer once loaded (hover states inside the
  // prototype must work in presenter mode), but the deck keeps the wheel:
  // wheel events inside the same-origin frame are cancelled there and
  // replayed on the deck's Lenis, so scroll-driving never strands.
  useEffect(() => {
    if (!isLoaded) return;
    const win = frame.current?.contentWindow;
    if (!win) return;
    const forward = (e: WheelEvent) => {
      e.preventDefault();
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(lenis.scroll + e.deltaY, { immediate: true });
      else window.scrollBy(0, e.deltaY);
    };
    win.addEventListener('wheel', forward, { passive: false, capture: true });
    return () =>
      win.removeEventListener('wheel', forward, { capture: true });
  }, [isLoaded]);

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

      </div>

      {/* The viewer's controls live in the presenter's shared dock pill. */}
      {dockSlot &&
        createPortal(
          <>
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
          </>,
          dockSlot
        )}

      {notesSlot &&
        notesOpen &&
        createPortal(
          <div className='pr-notes'>
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
          </div>,
          notesSlot
        )}
    </section>
  );
}
