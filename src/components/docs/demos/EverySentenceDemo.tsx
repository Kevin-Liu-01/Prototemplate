'use client';

import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import EverySentence, { type EverySentenceHandle, type EveryWord } from '@/components/shared/EverySentence';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

/* the dossier hero's own headline set (src/app/d/singularity-dossier/sections/HomeHero.tsx) */
const WORDS: Record<string, EveryWord> = {
  en: { text: 'Launch in every language', lang: 'en' },
  ja: { text: 'あらゆる言語でローンチ', lang: 'ja' },
  de: { text: 'In jeder Sprache launchen', lang: 'de' },
  ko: { text: '모든 언어로 출시하세요', lang: 'ko' },
  zh: { text: '用每一种语言发布', lang: 'zh' },
  hi: { text: 'हर भाषा में लॉन्च करें', lang: 'hi' },
  ru: { text: 'Запускайтесь на всех языках', lang: 'ru' },
};

const ORDER = ['en', 'ja', 'de', 'ko', 'zh', 'hi', 'ru'] as const;
type Loc = (typeof ORDER)[number];

/* one beat per morph: longer than the engine's form phase, so every morph completes */
const BEAT_MS = 3800;

type StageProps = {
  every: RefObject<EverySentenceHandle | null>;
  hops: number;
  /** the host clock runs: Auto is on and motion is allowed */
  clock: boolean;
  /** the clock's tick: the host moves to the next locale */
  onBeat: () => void;
};

/**
 * The sentence and the host's clock, mounted with the plate's children, so
 * the clock's observer has the line to watch. One beat every BEAT_MS while
 * the line is on screen and the tab is visible.
 */
function SentenceStage({ every, hops, clock, onBeat }: StageProps) {
  const line = useRef<HTMLDivElement>(null);
  const beat = useRef(onBeat);
  beat.current = onBeat;

  useLayoutWork(
    () => {
      const el = line.current;
      if (!clock || !el) return;
      let visible = true;
      const timer = window.setInterval(() => {
        if (visible && !document.hidden) beat.current();
      }, BEAT_MS);
      const io = new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
      });
      io.observe(el);
      return () => {
        window.clearInterval(timer);
        io.disconnect();
      };
    },
    { dependencies: [clock], revertOnUpdate: true }
  );

  return (
    <div className='dmo-every-line' ref={line}>
      <EverySentence armDelay={0.4} hops={hops} initial='en' ref={every} words={WORDS} />
    </div>
  );
}

/**
 * EverySentence, live: one shaped sentence that dissolves into glyph dust
 * and reassembles in the next language. The component runs no timer of its
 * own; the host owns the clock and calls setLocale on the ref. Here the
 * host is either the locale row (one call per pick) or the Auto clock (one
 * call per beat, paused while the plate is off screen). Hops sets how many
 * arrangements the dust takes between sentences, and a change lands at the
 * engine's next form boundary.
 */
export default function EverySentenceDemo() {
  const reduced = useReducedMotion();
  const every = useRef<EverySentenceHandle>(null);
  const [loc, setLoc] = useState<Loc>('en');
  const [hops, setHops] = useState('2');
  const [auto, setAuto] = useState(true);
  const current = useRef<Loc>('en');

  const go = (next: Loc) => {
    current.current = next;
    setLoc(next);
    every.current?.setLocale(next);
  };

  const advance = () => {
    const i = ORDER.indexOf(current.current);
    go(ORDER[(i + 1) % ORDER.length] ?? 'en');
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Locale'
            options={ORDER.map((value) => ({ value, label: value }))}
            value={loc}
            onChange={(next) => {
              setAuto(false);
              go(next);
            }}
          />
          <Choice
            label='Hops'
            options={['1', '2', '3', '4', '5'].map((value) => ({ value, label: value }))}
            value={hops}
            onChange={setHops}
          />
          <Toggle
            disabled={reduced}
            label='Auto'
            pressed={auto && !reduced}
            title='Advance one locale every 3.8 seconds'
            onChange={setAuto}
          />
        </>
      }
      height={220}
      label='A headline that dissolves into glyphs and reassembles in the next language'
      lazy
      moves
      phoneHeight={220}
      stageClassName='dmo-every'
      tag={`<EverySentence hops={${hops}} />`}
    >
      <SentenceStage clock={auto && !reduced} every={every} hops={Number(hops)} onBeat={advance} />
    </Plate>
  );
}
