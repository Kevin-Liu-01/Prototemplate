'use client';

import { useRef, useState } from 'react';

import { blankLine, flipUp } from '@/app/d/production/sections/flap';
import { FlapChars } from '@/app/d/production/sections/FlapText';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { Action, Choice, Range, Toggle } from '../controls';
import { useReducedMotion } from '../hooks';
import Plate from '../Plate';

import './interactables.css';

type Timeline = ReturnType<typeof flipUp>;

/* the blog masthead's phrase, the tagline and the changelog's board word */
const PHRASES = ['General Translation Blog', 'Every product in every language', 'Changelog'] as const;

type Phrase = (typeof PHRASES)[number];

/* FlapPhrase's own settings: 13ms between tiles, two cycles before the glyph lands */
const PER_MS = 13;
const CYCLES = 2;

/** Puts every face back on its settled glyph and drops what a killed timeline left inline. */
function settle(line: HTMLElement): void {
  line.querySelectorAll<HTMLElement>('[data-tb-face]').forEach((face) => {
    face.textContent = face.dataset.char ?? '';
    face.style.transform = '';
    face.style.color = '';
  });
}

/** The tiles a phrase flips: every character but the spaces between words. */
function tilesOf(text: string): number {
  return Array.from(text.replace(/ /g, '')).length;
}

/**
 * Split-flap text, live: the cells FlapChars renders (an in-flow ghost
 * holds each glyph's measure and the face rides over it) driven by the
 * engine FlapPhrase runs, flipUp from flap.ts. Each face folds shut,
 * swaps its glyph through the cycle of world scripts at the squeeze and
 * unfolds; the landing glyph settles with a short overshoot and, with
 * Flash, holds the accent and cools. The line flips once when it comes
 * into view, and again on Replay or any change. Still shows the settled
 * line a reader with reduced motion sees.
 */
export default function FlapDemo() {
  const reduced = useReducedMotion();
  const [phrase, setPhrase] = useState<Phrase>(PHRASES[0]);
  const [per, setPer] = useState(PER_MS);
  const [cycles, setCycles] = useState(CYCLES);
  const [flash, setFlash] = useState(true);
  const [tiles, setTiles] = useState(true);
  const [still, setStill] = useState(false);
  const [replay, setReplay] = useState(0);
  const [seen, setSeen] = useState(false);
  const [runs, setRuns] = useState<number | null>(null);
  const box = useRef<HTMLParagraphElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const timeline = useRef<Timeline | null>(null);

  /* the first flip waits for the line to come into view, as FlapPhrase's ScrollTrigger does */
  useMountEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timeline.current?.kill();
    };
  });

  useLayoutWork(
    () => {
      const el = line.current;
      if (!el) return;
      timeline.current?.kill();
      timeline.current = null;
      settle(el);
      if (!seen || still || reduced) {
        setRuns(null);
        return;
      }
      blankLine(el);
      timeline.current = flipUp(el, { per: per / 1000, cycles, flash });
      setRuns(timeline.current.duration());
    },
    { dependencies: [phrase, per, cycles, flash, still, reduced, replay, seen] }
  );

  const shown = still || reduced;

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Phrase'
            options={PHRASES.map((value) => ({ value, label: value }))}
            value={phrase}
            onChange={setPhrase}
          />
          <Range
            format={(value) => `${value}ms`}
            label='Stagger'
            max={50}
            min={0}
            step={1}
            value={per}
            onChange={setPer}
          />
          <Range label='Cycles' max={5} min={1} step={1} value={cycles} onChange={setCycles} />
          <Toggle label='Flash' pressed={flash} title='Hold the landed glyph in the accent and cool it' onChange={setFlash} />
          <Toggle label='Tiles' pressed={tiles} title='Draw the ghost tile under every character' onChange={setTiles} />
          <Toggle
            disabled={reduced}
            label='Still'
            pressed={shown}
            title='Show the settled line a reader with reduced motion sees'
            onChange={setStill}
          />
          <Action disabled={shown} onClick={() => setReplay((n) => n + 1)}>
            Replay
          </Action>
          <p className='dmo-bar-status' role='status'>
            <span className='dmo-num'>{tilesOf(phrase)}</span> tiles
            {runs === null ? (
              ', settled'
            ) : (
              <>
                {' '}
                in <span className='dmo-num'>{runs.toFixed(2)} s</span>
              </>
            )}
          </p>
        </>
      }
      fit
      label={`Split-flap text spelling ${phrase}`}
      moves
      stageClassName={tiles ? 'ixa-flap is-tiles' : 'ixa-flap'}
      tag='flipUp(line, { per, cycles, flash })'
    >
      <p className='ixa-flap-line' ref={box}>
        <span aria-hidden='true' data-tb-line key={phrase} ref={line}>
          <FlapChars text={phrase} />
        </span>
        <span className='tb-sr'>{phrase}</span>
      </p>
    </Plate>
  );
}
