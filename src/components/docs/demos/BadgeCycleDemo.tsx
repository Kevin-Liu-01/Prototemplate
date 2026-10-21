'use client';

import { useState } from 'react';

import { BadgeCycle, badgeMark } from '@/components/viewer/BadgeCycle';
import { MARKS } from '@/lib/marks';

import { Choice, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

// the badge's rules (.pt-book-badge, .pt-cycle and its steps() strip) live in the book sheet
import '@/components/viewer/BookView.css';

type Size = 'title' | 'section';

/* the monograms of the register, the frames /brand's badge cuts through */
const MARK_FILES = MARKS.filter((mark) => mark.kind === 'monogram').map((mark) => mark.file);

/**
 * BadgeCycle, live: the badge /brand's head sets after its title's last
 * word. Every frame sits side by side in one strip, each exactly one box
 * wide, and a CSS animation steps the strip one box to the left every 1.4s
 * with steps(n), so each change is a hard cut. A hidden sizer stacks every
 * frame in one cell, so the box takes the widest frame and never changes
 * width. Still adds the rule reduced motion applies: the strip stops on
 * the first frame and the box takes that frame's width.
 */
export default function BadgeCycleDemo() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState('4');
  const [size, setSize] = useState<Size>('title');
  const [still, setStill] = useState(false);
  const n = Number(count);

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Count'
            options={['2', '3', '4'].map((value) => ({ value, label: value }))}
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
      label={`The Brand title with a badge cutting through ${n} marks`}
      moves
      phoneHeight={180}
      stageClassName={still ? 'dmo-badge is-still' : 'dmo-badge'}
      tag='<BadgeCycle frames={files.map(badgeMark)} />'
    >
      <p className={`dmo-badge-title is-${size}`}>
        <span className='pt-book-title-end'>
          Brand
          <span aria-hidden='true' className='pt-book-badge' key={n}>
            <BadgeCycle frames={MARK_FILES.slice(0, n).map((file) => badgeMark(file))} />
          </span>
        </span>
      </p>
    </Plate>
  );
}
