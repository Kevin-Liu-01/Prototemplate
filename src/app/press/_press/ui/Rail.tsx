'use client';

import Link from 'next/link';
import { useRef, type CSSProperties, type Ref } from 'react';

import PressMark from './PressMark';

export type RailMark = { key: string; label: string; at: number };

type Props = {
  marks: readonly RailMark[];
  current: number;
  /** Moves the reader to a fraction of the whole, 0 to 1. */
  onSeek: (fraction: number) => void;
  onJump: (index: number) => void;
  /** Receives the rail, whose --p (0 to 1) the owner sets as the reader moves. */
  railRef?: Ref<HTMLElement>;
  label: string;
  /** The number the first mark prints: 0 for an essay's opening, 1 for the first story. */
  start?: number;
  /** Set along the foot of the rail: the section or story the reader is in. */
  caption?: string;
};

/* The press's one navigation surface, down the left edge: the monogram
   home at the top, then a column of short progress lines, lit above the
   reader's place and faint below it, with a longer numbered line at each
   section or story and the orange line at the place itself. Press anywhere
   on the lines and drag to scrub; the numbered lines are buttons. The
   caption at the foot names where the reader is. */
export default function Rail({ marks, current, onSeek, onJump, railRef, label, start = 0, caption }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const seek = (clientY: number) => {
    const el = track.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(1, (clientY - box.top) / box.height)));
  };

  return (
    <nav ref={railRef} className='gtp-rail' aria-label={label}>
      <Link href='/press' className='gtp-rail-home' aria-label='GT Atlas, all stories'>
        <PressMark size={30} />
      </Link>
      <div
        ref={track}
        className='gtp-rail-track'
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          seek(e.clientY);
        }}
        onPointerMove={(e) => dragging.current && seek(e.clientY)}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <span className='gtp-rail-lines' aria-hidden='true' />
        <span className='gtp-rail-lines gtp-rail-lit' aria-hidden='true' />
        {marks.map((mark, i) => (
          <span key={mark.key} className='gtp-rail-major' data-on={i === current} data-past={i < current} style={{ top: `${mark.at * 100}%` } as CSSProperties}>
            <button type='button' onClick={() => onJump(i)} aria-current={i === current ? 'true' : undefined} aria-label={mark.label}>
              {String(i + start).padStart(2, '0')}
              <span className='gtp-rail-tip'>{mark.label}</span>
            </button>
          </span>
        ))}
        <span className='gtp-rail-now' aria-hidden='true' />
      </div>
      {caption ? (
        <span className='gtp-rail-caption' aria-hidden='true'>
          {caption}
        </span>
      ) : null}
    </nav>
  );
}
