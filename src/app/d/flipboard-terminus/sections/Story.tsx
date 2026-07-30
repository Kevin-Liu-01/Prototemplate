'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import StorySection from '@/components/shared/StorySection';

import { DOCK_CAPTIONS } from '../components/content';
import FlapPhrase from '../components/FlapPhrase';

gsap.registerPlugin(useGSAP);

/** Past this the incoming face has won and the outgoing one is cut dead. */
const CUT = 0.5;

function inlineOpacity(el: HTMLElement, fallback: number): number {
  const raw = el.style.opacity;
  if (raw === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function flag(el: HTMLElement, on: boolean): void {
  const next = on ? '1' : '0';
  if (el.dataset.cut !== next) el.dataset.cut = next;
}

/**
 * Act II–III. The shared nine-beat story, skinned to the concourse: warm
 * board-paper sheet, graphite shell, and the dock reading like a gate caption.
 *
 * The shared section cross-fades its dual-language spans and its dock
 * captions, which is right in motion but illegible in a scrubbed still: both
 * strings share one absolute box, so a frame caught mid-fade paints them on
 * top of each other. This wrapper reads the opacities the timeline writes and
 * turns each cross-fade into a hard cut via `data-cut`, which the stylesheet
 * resolves with `!important` so exactly one face is ever visible.
 */
export default function Story() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;

      const caps = Array.from(host.querySelectorAll<HTMLElement>('.gts-dock-cap [data-cap]'));
      const swaps = Array.from(host.querySelectorAll<HTMLElement>('.gts-sw'));
      const card = host.querySelector<HTMLElement>('[data-reviewcard]');

      const tick = () => {
        // one caption only: whichever the timeline currently favours
        let lead = 0;
        let best = -1;
        caps.forEach((cap, i) => {
          const value = inlineOpacity(cap, i === 0 ? 1 : 0);
          if (value >= best) {
            best = value;
            lead = i;
          }
        });
        caps.forEach((cap, i) => flag(cap, i === lead && best > 0.02));

        // one language only per dual-language span
        for (const sw of swaps) {
          const es = sw.querySelector<HTMLElement>('.gts-es');
          if (es) flag(sw, inlineOpacity(es, 0) >= CUT);
        }

        // the counsel card is opaque or absent, never a ghost over the page
        if (card) flag(card, inlineOpacity(card, 0) >= 0.25);
      };

      tick();
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <StorySection
        className='ft-story'
        id='ft-how'
        heading={
          <>
            How a page departs for <FlapPhrase text='EVERY LANGUAGE' />
          </>
        }
        subheading='GT reads your context and translates in place. Then Locadex edits the code, opens the pull request, and the site ships.'
        captions={DOCK_CAPTIONS}
        navSelector='.ft-root .ft-nav'
        // Solved against the real page height so all eight sampled story
        // depths land inside a live beat: both code reveals mid-wipe, the
        // counsel card after it lands, and the diff + merged toast before the
        // sheet flips back to Spanish.
        scrollLength={{ desktop: 11150, mobile: 6600 }}
        // The prismatic burst is the hero's one colour moment. Behind the board
        // sheet it screens through the paper and stains it, so the story act runs
        // on the concourse's own lighting instead.
        field={false}
        siteName='example.com'
      />
    </div>
  );
}
