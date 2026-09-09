'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import { DIRECTIONS } from '@/lib/directions';
import { useMountEffect } from '@/lib/use-mount-effect';

import { setDirectionIndex, useDirectionIndex } from '../presenterStore';
import { glideTo, scrollerOf } from '../scroller';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Where a jump into the viewer lands, in stage heights past the section's
 * top: the frame has finished growing there and the dwell is still in its
 * deadzone, so the embedded page shows its own top.
 */
const DOCK_HEIGHTS = 0.3;

/** The first stretch of the dwell scrolls nothing inside the page. */
const DEADZONE = 0.08;

type StageFrameProps = {
  slug: string;
  label?: string;
  name: string;
};

/**
 * The live page. Keyed by slug from the parent, so each direction gets a
 * fresh frame and a fresh mount effect: the SSR-rendered iframe can finish
 * loading before hydration attaches React's onLoad, so the load is watched
 * natively and an already complete document counts as loaded. Once loaded
 * the frame takes the pointer (hover states inside the prototype work), but
 * the deck keeps the wheel: wheel events inside the same-origin frame are
 * cancelled there and replayed on the stage's scroll box, so scroll-driving
 * never strands.
 */
function StageFrame({ slug, label, name }: StageFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useMountEffect(() => {
    const el = frame.current;
    if (!el) return;
    const wheel: { detach: (() => void) | null } = { detach: null };
    const markLoaded = () => {
      setLoaded(true);
      const win = el.contentWindow;
      if (!win || wheel.detach) return;
      const forward = (event: WheelEvent) => {
        event.preventDefault();
        scrollerOf(el)?.scrollBy({ top: event.deltaY, left: 0 });
      };
      win.addEventListener('wheel', forward, { passive: false, capture: true });
      wheel.detach = () => win.removeEventListener('wheel', forward, { capture: true });
    };
    const doc = el.contentDocument;
    if (doc?.readyState === 'complete' && doc.body?.childElementCount) markLoaded();
    el.addEventListener('load', markLoaded);
    return () => {
      el.removeEventListener('load', markLoaded);
      wheel.detach?.();
    };
  });

  return (
    <>
      <iframe
        ref={frame}
        src={`/d/${slug}?chrome=0`}
        title={name}
        className={loaded ? 'is-loaded' : ''}
      />
      {!loaded ? (
        <div className='pr-stage-veil'>
          <span>
            Loading {label ? `${label} ` : ''}
            {name}
          </span>
        </div>
      ) : null}
    </>
  );
}

/**
 * The live prototype stage. The slide-sized frame grows into the whole stage
 * as the section docks, and while it is docked the presenter's scroll drives
 * the embedded page's own scroll. Which direction is loaded lives in
 * presenterStore: the sidebar rows under the Prototypes slide switch it, the
 * toolbar's Rate and Notes act on it, and cross-component jumps (the verdict
 * cards, the detail tiles, the sidebar rows) arrive as a `pr:goto` event
 * carrying the slug, which this component answers by loading the direction
 * while PresenterStage glides the stage to the docked position.
 */
export default function PrototypeViewer() {
  const root = useRef<HTMLElement>(null);
  const index = useDirectionIndex();
  const current = DIRECTIONS[index];

  /** The docked landing for this section, as a scroll position of the stage box. */
  const dockTop = (scroller: HTMLElement) => {
    const el = root.current;
    if (!el) return 0;
    const top =
      el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    return Math.round(top + scroller.clientHeight * DOCK_HEIGHTS);
  };

  useGSAP(
    () => {
      const scroller = scrollerOf(root.current);
      if (!scroller) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Deep link (/present?d=slug, how the gallery links a direction): land
      // docked on the requested prototype, and KEEP landing it. On a
      // client-side navigation the deck grows while slides lay out (and in
      // dev, compile), early jumps clamp, and every ScrollTrigger refresh can
      // move the target, so re-snap on a timer ladder AND after every
      // refresh. Only real user input stops the re-snaps.
      const cleanupDeepLink = (() => {
        const slug = new URLSearchParams(window.location.search).get('d');
        const found = DIRECTIONS.findIndex((direction) => direction.slug === slug);
        if (found < 0) return () => {};
        setDirectionIndex(found);
        let userMoved = false;
        const markUser = () => {
          userMoved = true;
        };
        const snap = () => {
          if (userMoved || !root.current) return;
          glideTo(scroller, dockTop(scroller), true);
        };
        const timers = [150, 500, 1000, 1800, 3000, 4500].map((ms) => window.setTimeout(snap, ms));
        const stop = window.setTimeout(markUser, 5200);
        ScrollTrigger.addEventListener('refresh', snap);
        scroller.addEventListener('wheel', markUser, { passive: true });
        scroller.addEventListener('touchstart', markUser, { passive: true });
        window.addEventListener('keydown', markUser);
        return () => {
          timers.forEach((timer) => window.clearTimeout(timer));
          window.clearTimeout(stop);
          ScrollTrigger.removeEventListener('refresh', snap);
          scroller.removeEventListener('wheel', markUser);
          scroller.removeEventListener('touchstart', markUser);
          window.removeEventListener('keydown', markUser);
        };
      })();

      if (reduced) return cleanupDeepLink;

      /* a refresh scrolls the box to 0 to measure and puts it back after;
         the dwell must not hand that excursion to the embedded page */
      let refreshing = false;
      const onRefreshInit = () => {
        refreshing = true;
      };
      const onRefreshed = () => {
        refreshing = false;
      };
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.addEventListener('refresh', onRefreshed);

      // The frame grows from a slide-sized card into the full stage.
      // scrub:true (no lag) so the frame is visually docked at the exact
      // scroll position where the inner-scroll handoff becomes possible.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            scroller,
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

      // While the stage is docked, presenter scroll drives the embedded
      // site's own scroll: the dwell maps onto the full page height, so the
      // deck's scroll becomes the website's scroll. The first stretch of the
      // dwell is a deadzone: you scroll to get INTO the preview, it settles
      // fully docked, and only then does further scroll move the page inside.
      ScrollTrigger.create({
        trigger: root.current,
        scroller,
        start: 'top top',
        end: () => `+=${(root.current?.offsetHeight ?? 0) - scroller.clientHeight * 2}`,
        onUpdate: (self) => {
          if (refreshing) return;
          const el = root.current?.querySelector('iframe');
          const win = el?.contentWindow;
          const doc = el?.contentDocument;
          if (!win || !doc?.documentElement) return;
          const max = doc.documentElement.scrollHeight - win.innerHeight;
          if (max <= 0) return;
          const progress = Math.max(0, (self.progress - DEADZONE) / (1 - DEADZONE));
          win.scrollTo(0, progress * max);
        },
      });

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        ScrollTrigger.removeEventListener('refresh', onRefreshed);
        cleanupDeepLink();
      };
    },
    { scope: root }
  );

  useMountEffect(() => {
    const onGoto = (event: Event) => {
      const slug = (event as CustomEvent<string>).detail;
      const found = DIRECTIONS.findIndex((direction) => direction.slug === slug);
      if (found >= 0) setDirectionIndex(found);
    };
    window.addEventListener('pr:goto', onGoto);
    return () => window.removeEventListener('pr:goto', onGoto);
  });

  return (
    <section ref={root} className='pr-slide pr-proto' data-slide='prototypes'>
      <div className='pr-stage'>
        <div className='pr-stage-frame'>
          <StageFrame
            key={current.slug}
            slug={current.slug}
            label={current.label}
            name={current.name}
          />
        </div>
      </div>
    </section>
  );
}
