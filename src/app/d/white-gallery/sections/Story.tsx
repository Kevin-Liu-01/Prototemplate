'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import StorySection from '@/components/shared/StorySection';

/**
 * Scrub distance. It is not a comfort setting — it decides which beat a given
 * scroll depth lands on. These two numbers put the sampled depths on the pellet
 * ingest, the in-place swap, both <T> reveals, the counsel ping, the scan, the
 * numbered code marks, and the agent clicking Open PR.
 */
const SCROLL_LENGTH = { desktop: 10668, mobile: 5041 };

/**
 * Acts II + III — the shared nine-beat story, hung as the gallery's long wall:
 * the sheet is lit paper, the editor act is the room going dark around it.
 *
 * The one behaviour this direction adds is a hard cut on the language swap. The
 * shared timeline crossfades the source and target faces of every node; halfway
 * through, both sit at 50% and the line is an illegible double exposure. Here a
 * ticker forces exactly one face to be visible at any scrub position, so the
 * swap reads as a cut while the container still FLIPs to its new width.
 */
export default function Story() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const scope = root.current;
      if (!scope) return;

      type Pair = { en: HTMLElement; es: HTMLElement; shown: '' | 'en' | 'es' };
      const pairs: Pair[] = [];
      for (const sw of gsap.utils.toArray<HTMLElement>('.gts-sw', scope)) {
        const en = sw.querySelector<HTMLElement>('.gts-en');
        const es = sw.querySelector<HTMLElement>('.gts-es');
        if (en && es) pairs.push({ en, es, shown: '' });
      }
      if (!pairs.length) return;

      const cut = () => {
        for (const pair of pairs) {
          /* the tween writes opacity inline; before it starts there is none */
          const target: 'en' | 'es' = Number(pair.es.style.opacity || 0) > 0.5 ? 'es' : 'en';
          if (target === pair.shown) continue;
          pair.shown = target;
          /* visibility, not display: the source face keeps holding its box open
             so the FLIP measurement the shared timeline runs stays honest */
          pair.en.style.visibility = target === 'en' ? 'visible' : 'hidden';
          pair.es.style.visibility = target === 'es' ? 'visible' : 'hidden';
        }
      };

      cut();
      gsap.ticker.add(cut);
      return () => gsap.ticker.remove(cut);
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <StorySection
        className='wg-story'
        id='story'
        heading='How it works'
        subheading='One page, translated where it stands, then shipped by an agent. Scroll to walk it.'
        sliderMode='slide'
        navSelector='[data-gallery-nav]'
        scrollLength={SCROLL_LENGTH}
      />
    </div>
  );
}
