'use client';

import { useState } from 'react';

import { BadgeCycle, BadgeWords, badgeMark } from '@/components/viewer/BadgeCycle';
import { MARKS } from '@/lib/marks';

import { Choice, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

// the badge's rules (.pt-book-badge, .pt-cycle and its steps() strip) live in the book sheet
import '@/components/viewer/BookView.css';

type Kind = 'marks' | 'words' | 'scripts';
type Size = 'title' | 'section';

/* the head badges the hub's pages run: mark files, item names, and a name in its own scripts */
const NAMES = ['gt-aesthetic', 'gt-brand', 'gt-components', 'gt-deck', 'gt-diagrams', 'gt-dither'];
const SCRIPTS = [
  { text: 'Language' },
  { text: 'Langue', lang: 'fr' },
  { text: '言語', lang: 'ja' },
  { text: 'لغة', lang: 'ar', dir: 'rtl' as const },
  { text: 'भाषा', lang: 'hi' },
  { text: 'Язык', lang: 'ru' },
];
const MARK_FILES = MARKS.filter((mark) => mark.kind === 'monogram').map((mark) => mark.file);

/**
 * BadgeCycle, live: the badge a book head sets after its title's last
 * word. Every frame sits side by side in one strip, each exactly one box
 * wide, and a CSS animation steps the strip one box to the left every 1.4s
 * with steps(n), so each change is a hard cut. A hidden sizer stacks every
 * frame in one cell, so the box takes the widest frame and never changes
 * width. Still adds the rule reduced motion applies: the strip stops on
 * the first frame and the box takes that frame's width.
 */
export default function BadgeCycleDemo() {
  const reduced = useReducedMotion();
  const [kind, setKind] = useState<Kind>('marks');
  const [count, setCount] = useState('4');
  const [size, setSize] = useState<Size>('title');
  const [still, setStill] = useState(false);
  const n = Number(count);

  const badge =
    kind === 'marks' ? (
      <BadgeCycle frames={MARK_FILES.slice(0, n).map((file) => badgeMark(file))} />
    ) : kind === 'words' ? (
      <BadgeWords words={NAMES.slice(0, n)} />
    ) : (
      <BadgeWords words={SCRIPTS.slice(0, n)} />
    );

  const title = kind === 'marks' ? 'Marks' : kind === 'words' ? 'Skills' : 'Language';

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Frames'
            options={[
              { value: 'marks', label: 'Mark files' },
              { value: 'words', label: 'Names' },
              { value: 'scripts', label: 'Scripts' },
            ]}
            value={kind}
            onChange={setKind}
          />
          <Choice
            label='Count'
            options={['2', '3', '4', '5', '6'].map((value) => ({ value, label: value }))}
            value={count}
            onChange={setCount}
          />
          <Choice
            label='Size'
            options={[
              { value: 'title', label: 'Page title' },
              { value: 'section', label: 'Section title' },
            ]}
            value={size}
            onChange={setSize}
          />
          <Toggle
            disabled={reduced}
            label='Still'
            pressed={still || reduced}
            title='Show the badge a reader with reduced motion sees'
            onChange={setStill}
          />
        </>
      }
      height={200}
      label={`A ${title} title with a badge cutting through ${n} frames`}
      moves
      phoneHeight={180}
      stageClassName={still ? 'dmo-badge is-still' : 'dmo-badge'}
      tag={kind === 'marks' ? '<BadgeCycle frames={files.map(badgeMark)} />' : '<BadgeWords words={…} />'}
    >
      <p className={`dmo-badge-title is-${size}`}>
        <span className='pt-book-title-end'>
          {title}
          <span aria-hidden='true' className='pt-book-badge' key={`${kind}-${n}`}>
            {badge}
          </span>
        </span>
      </p>
    </Plate>
  );
}
