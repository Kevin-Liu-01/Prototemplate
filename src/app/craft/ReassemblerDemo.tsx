'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import EverySentence, {
  type EverySentenceHandle,
  type EveryWord,
} from '@/components/shared/EverySentence';

gsap.registerPlugin(useGSAP);

/**
 * The reassembler demo plate — the real EverySentence engine on a simple
 * interval clock (the dossier hero drives the same handle from its locale
 * belt instead; the component never runs a timer of its own). The cadence
 * sits above the ~3.2s form phase so every morph completes; the engine's
 * debounce and interrupt semantics make the exact number safe. The loop
 * pauses off-view, and under reduced motion it never starts — the plate
 * shows the sanctioned still. The hop ladder (founder: "up to 5, for our
 * library that we can play with") rides the plate in the bayer strip's
 * chip grammar; a pick latches at the engine's next form boundary.
 */
const HOP_CHOICES = [1, 2, 3, 4, 5] as const;

const WORDS: Record<string, EveryWord> = {
  en: { text: 'Launch in every language', lang: 'en' },
  ja: { text: 'あらゆる言語でローンチ', lang: 'ja' },
  de: { text: 'In jeder Sprache launchen', lang: 'de' },
  ko: { text: '모든 언어로 출시하세요', lang: 'ko' },
};

const ORDER: readonly string[] = ['ja', 'de', 'ko', 'en'];

export default function ReassemblerDemo() {
  const every = useRef<EverySentenceHandle>(null);
  const box = useRef<HTMLDivElement>(null);
  const [hops, setHops] = useState(2);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let i = 0;
      const step = () => {
        const loc = ORDER[i % ORDER.length];
        i += 1;
        if (loc) every.current?.setLocale(loc);
      };
      /* the demo's clock: one repeating beat, paused while the plate is
         off-view so the morph only spends frames it can be seen spending */
      const loop = gsap
        .timeline({ repeat: -1, delay: 1.2, paused: true })
        .call(step)
        .to({}, { duration: 3.8 });
      const el = box.current;
      if (!el || typeof IntersectionObserver === 'undefined') {
        loop.play();
        return () => {
          loop.kill();
        };
      }
      const io = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loop.play();
        else loop.pause();
      });
      io.observe(el);
      return () => {
        io.disconnect();
        loop.kill();
      };
    },
    { scope: box }
  );

  return (
    <>
      <div className='ptc-every' ref={box}>
        <EverySentence armDelay={0.4} hops={hops} initial='en' ref={every} words={WORDS} />
      </div>
      {/* the playable hop count, on the plate the way the bayer ladder
          is: mono indices, the active row the only color */}
      <div aria-label='Hops per morph' className='ptc-bayer-strip' role='group'>
        {HOP_CHOICES.map((n) => (
          <button
            className='ptc-bayer-chip'
            data-on={n === hops}
            key={n}
            type='button'
            onClick={() => setHops(n)}
          >
            <i>{n}</i>
            {n === hops ? <span>{n === 1 ? 'hop' : 'hops'}</span> : null}
          </button>
        ))}
      </div>
    </>
  );
}
