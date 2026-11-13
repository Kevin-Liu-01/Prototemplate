'use client';

import { useState } from 'react';

import { BadgeCycle, badgeMark } from '@/components/viewer/BadgeCycle';
import { LOGO } from '@/lib/logo';
import { badgeMarks, boxMask } from '@/lib/marks';

import { Choice, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

// the badge's rules (.pt-book-badge, .pt-cycle and its steps() strip) live in the book sheet
import '@/components/viewer/BookView.css';

type Size = 'title' | 'section';

/* the logo's width over its height, from its drawn box */
const [, , logoWidth, logoHeight] = LOGO.viewBox.split(' ').map(Number);

/* the shortlisted marks no wider than the logo, each cut to its drawn box */
const BADGE_MARKS = badgeMarks(logoWidth / logoHeight).map((mark) => badgeMark(mark.file, mark.box ? boxMask(mark.box) : undefined));

/* every count from two to all of the badge's marks */
const COUNTS = Array.from({ length: Math.max(BADGE_MARKS.length - 1, 1) }, (_, i) => String(i + 2));

/**
 * BadgeCycle, live, cutting through marks from /marks: a badge set after a
 * title's last word as BookHead sets /brand's, which holds one frame, the
 * logo with its hover. Every frame sits side by side in one strip, each exactly one box
 * wide, and a CSS animation steps the strip one box to the left every 1.4s
 * with steps(n), so each change is a hard cut. A hidden sizer stacks every
 * frame in one cell, so the box takes the widest frame and never changes
 * width. Still adds the rule reduced motion applies: the strip stops on
 * the first frame and the box takes that frame's width.
 */
export default function BadgeCycleDemo() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(String(BADGE_MARKS.length));
  const [size, setSize] = useState<Size>('title');
  const [still, setStill] = useState(false);
  const n = Number(count);

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Count'
            options={COUNTS.map((value) => ({ value, label: value }))}
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
      label={`A title with a badge cutting through ${n} shortlisted marks`}
      moves
      phoneHeight={180}
      stageClassName={still ? 'dmo-badge is-still' : 'dmo-badge'}
      tag='<BadgeCycle frames={badgeMarks(logoWidth / logoHeight).map((mark) => badgeMark(mark.file, boxMask(mark.box)))} />'
    >
      <p className={`dmo-badge-title is-${size}`}>
        <span className='pt-book-title-end'>
          Marks
          <span aria-hidden='true' className='pt-book-badge' key={n}>
            <BadgeCycle frames={BADGE_MARKS.slice(0, n)} />
          </span>
        </span>
      </p>
    </Plate>
  );
}
