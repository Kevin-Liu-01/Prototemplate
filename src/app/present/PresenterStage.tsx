'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { usePtShell } from '@/components/viewer/shell-context';
import { useMountEffect } from '@/lib/use-mount-effect';

import { setPresenterPosition } from './presenterStore';
import { glideTo, SCROLLER_CLASS, stopGlide } from './scroller';
import CraftSlide from './slides/CraftSlide';
import IntroSlide from './slides/IntroSlide';
import PrinciplesSlide from './slides/PrinciplesSlide';
import TypeDetailSlide from './slides/TypeDetailSlide';
import WhySlide from './slides/WhySlide';
import { PROTOTYPES_INDEX, SLIDES, slideIndex } from './slides';
import PrototypeViewer from './viewer/PrototypeViewer';
import Scoreboard from './viewer/Scoreboard';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Scrolls the stage to a slide: to its landing beat, or to a beat given as
 * a fraction of the slide's pin length. `instant` skips the glide.
 */
export type GoTo = (slide: number, subFraction?: number, instant?: boolean) => void;

/** A selection this soon after mount is a deep link: land on it without the glide. */
const INSTANT_MS = 600;

/** Slack after a glide's own length before the scroll is trusted again. */
const TRAVEL_SLACK_MS = 200;

export type PresenterStageProps = {
  /** filled by the stage so the sidebar rows can jump to a beat */
  goToRef: RefObject<GoTo>;
};

/**
 * The presenter deck as the stage content: a full-bleed scroll box holding
 * the seven GSAP slides, with no sheet ring because the deck is dark by its
 * own content. The document is fixed while a shell is mounted, so this box
 * is the scroller every slide pins against (scrollerOf finds it from a slide),
 * and its size is what the slides call the viewport (presenter.css sizes
 * them in container units).
 *
 * The shell and the scroll are kept in step both ways. Scrolling derives the
 * slide and the beat from the slides' real geometry and selects the slide in
 * the shell, so the sidebar, the count, the progress line and the hash
 * follow the scroll. A selection made anywhere else (a thumb, the arrows, a
 * typed number, the hash on load) glides the stage to that slide's landing
 * beat; the glide is a GSAP tween (glideTo), so a stage resize or a
 * ScrollTrigger refresh mid-flight cannot cancel it. While a glide is in
 * flight the slides it passes are not selected, so the list does not flicker
 * through them.
 */
export default function PresenterStage({ goToRef }: PresenterStageProps) {
  const shell = usePtShell();
  const shellRef = useRef(shell);
  shellRef.current = shell;

  const scrollRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  /* the slide the scroll position names; -1 until the first sync */
  const scrolledRef = useRef(-1);
  /* a glide in flight: where it lands, which slide that is, and when to stop trusting it */
  const travelRef = useRef<{ top: number; slide: number; until: number } | null>(null);
  /* the id last sent to the shell, until the shell renders it: a selection is
     pending for a task, and the scroll must not judge against the stale one */
  const pendingRef = useRef<string | null>(null);
  const mountedAt = useRef(0);

  useGSAP(
    () => {
      const scroller = scrollRef.current;
      if (!scroller) return;
      mountedAt.current = performance.now();
      const sections = gsap.utils.toArray<HTMLElement>('[data-slide]', root.current ?? undefined);

      // Dedicated triggers whose `start` is the exact scroll position of each
      // slide's top; pin spacers make static offset math unreliable.
      const navTriggers = sections.map((section) =>
        ScrollTrigger.create({ trigger: section, scroller, start: 'top top' })
      );

      const pinLength = (i: number) =>
        Math.max(1, (sections[i]?.offsetHeight ?? 0) - scroller.clientHeight);

      /* true while a glide is still on its way; false once it lands, times
         out, or the user takes the wheel */
      const inFlight = () => {
        const travel = travelRef.current;
        if (!travel) return false;
        if (performance.now() > travel.until || Math.abs(scroller.scrollTop - travel.top) < 2) {
          travelRef.current = null;
          return false;
        }
        return true;
      };
      const userScrolled = () => {
        travelRef.current = null;
        stopGlide(scroller);
      };

      /* a refresh scrolls the box to 0 to measure and puts it back after;
         the position it exposes meanwhile is not the deck's, so nothing is
         derived until the refresh event says the measuring is over */
      let refreshing = false;
      const onRefreshInit = () => {
        refreshing = true;
      };

      // One source of truth for the slide and the beat: both are derived
      // together from the scroll position against the slides' real geometry.
      // A slide is active once its top passes mid-stage; the beat is its
      // position within the slide's pin length, matched against the subs'
      // timeline fractions. A glide in flight publishes nothing: the slides
      // it passes are neither selected nor marked.
      const syncPosition = () => {
        if (refreshing || inFlight()) return;
        const pos = scroller.scrollTop;
        const bias = scroller.clientHeight * 0.45;
        let slide = 0;
        for (let i = 0; i < sections.length; i++) {
          if (pos >= (navTriggers[i]?.start ?? 0) - bias) slide = i;
        }
        const subs = SLIDES[slide]?.subs;
        let sub = -1;
        if (subs) {
          const fraction = (pos - (navTriggers[slide]?.start ?? 0)) / pinLength(slide);
          for (let j = 0; j < subs.length; j++) {
            if (fraction >= (subs[j]?.f ?? 0) - 0.015) sub = j;
          }
          if (sub === -1) sub = 0;
        }
        if (slide !== scrolledRef.current) {
          scrolledRef.current = slide;
          const id = SLIDES[slide]?.id;
          const known = pendingRef.current ?? shellRef.current.active;
          if (id && id !== known) {
            pendingRef.current = id;
            shellRef.current.select(id);
          }
        }
        setPresenterPosition({ slide, sub });
      };
      const onRefreshed = () => {
        refreshing = false;
        syncPosition();
      };

      ScrollTrigger.create({
        trigger: root.current,
        scroller,
        start: 0,
        end: 'max',
        onUpdate: syncPosition,
      });
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.addEventListener('refresh', onRefreshed);
      syncPosition();

      /* a client-side navigation can run that first sync against pre-pin
         geometry; re-derive once the settled pin spacers are real */
      const raf = requestAnimationFrame(syncPosition);
      const settle = window.setTimeout(() => {
        ScrollTrigger.refresh();
        syncPosition();
      }, 150);

      /* a glide that is clamped short of its target never lands; re-derive
         once its time is up so the position is trusted again */
      let travelTimer = 0;

      const goTo: GoTo = (slide, subFraction, instant = false) => {
        const clamped = Math.max(0, Math.min(sections.length - 1, slide));
        const start = navTriggers[clamped]?.start ?? 0;
        const top = Math.round(
          start +
            (subFraction !== undefined
              ? subFraction * pinLength(clamped)
              : (SLIDES[clamped]?.jump ?? 0) * scroller.clientHeight)
        );
        const glide = glideTo(scroller, top, instant);
        const until = performance.now() + glide.duration + TRAVEL_SLACK_MS;
        travelRef.current = { top: glide.top, slide: clamped, until };
        window.clearTimeout(travelTimer);
        travelTimer = window.setTimeout(syncPosition, glide.duration + TRAVEL_SLACK_MS + 60);
      };
      goToRef.current = goTo;

      /* a direction jump (the sidebar rows, the verdict cards, the detail
         tiles) lands docked on the prototypes slide; PrototypeViewer loads
         the direction from the same event */
      const onGoto = () => goTo(PROTOTYPES_INDEX);
      window.addEventListener('pr:goto', onGoto);

      scroller.addEventListener('wheel', userScrolled, { passive: true });
      scroller.addEventListener('touchstart', userScrolled, { passive: true });

      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(settle);
        window.clearTimeout(travelTimer);
        stopGlide(scroller);
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        ScrollTrigger.removeEventListener('refresh', onRefreshed);
        window.removeEventListener('pr:goto', onGoto);
        scroller.removeEventListener('wheel', userScrolled);
        scroller.removeEventListener('touchstart', userScrolled);
      };
    },
    { scope: root }
  );

  /* the shell selected a slide the scroll is not on, or not heading to: go there */
  useGSAP(
    () => {
      if (pendingRef.current === shell.active) pendingRef.current = null;
      const index = slideIndex(shell.active);
      const at = travelRef.current?.slide ?? scrolledRef.current;
      if (index < 0 || index === at) return;
      const instant = performance.now() - mountedAt.current < INSTANT_MS;
      goToRef.current(index, undefined, instant);
    },
    { dependencies: [shell.active] }
  );

  /* the stage box changed (the list toggled, the panel, present mode): the
     pins and the slide heights are measured against it, and no window
     resize fires for it */
  useGSAP(
    () => {
      ScrollTrigger.refresh();
    },
    { dependencies: [shell.stageSize.width, shell.stageSize.height] }
  );

  /* the embedded direction pages boot from the saved theme; a switch here
     restamps every mounted frame so the previews follow the site */
  useMountEffect(() => {
    const stamp = () => {
      const theme = document.documentElement.dataset.theme;
      if (!theme) return;
      root.current?.querySelectorAll('iframe').forEach((frame) => {
        try {
          const doc = frame.contentDocument;
          if (doc?.documentElement) doc.documentElement.dataset.theme = theme;
        } catch {
          // a frame that navigated off origin: it keeps its own theme
        }
      });
    };
    const observer = new MutationObserver(stamp);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  });

  return (
    <div ref={scrollRef} className={`${SCROLLER_CLASS} pt-scroll`}>
      <div ref={root} className='pr-root'>
        <IntroSlide />
        <WhySlide />
        <PrinciplesSlide />
        <CraftSlide />
        <TypeDetailSlide />
        <PrototypeViewer />
        <Scoreboard />
      </div>
    </div>
  );
}
