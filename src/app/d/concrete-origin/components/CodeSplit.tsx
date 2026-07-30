'use client';

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

export type CodeSplitProps = {
  id: string;
  file: string;
  note: string;
  /** Rendered component shown to the right of the divider. */
  preview: ReactNode;
  /** Syntax-highlighted source revealed to the left of it. */
  code: ReactNode;
  foot: [string, string];
  style?: CSSProperties;
};

/**
 * M3 — the code-reveal splitter.
 *
 * The divider is scrubbed by the story timeline (`--split`), but it is also a
 * real control: drag the machined handle and the panel follows, then eases back
 * to the scroll position on release. The split carries a white edge-light with
 * a cyan/magenta fringe so it reads as a physical wipe, not a CSS mask.
 */
export default function CodeSplit({
  id,
  file,
  note,
  preview,
  code,
  foot,
  style,
}: CodeSplitProps) {
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  const setSplit = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    root.current?.style.setProperty('--split', `${clamped}%`);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const el = root.current;
    const track = body.current;
    if (!el || !track) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    // where scroll had left the divider — the drag eases back to it on release
    const base = parseFloat(getComputedStyle(el).getPropertyValue('--split')) || 0;

    const move = (e: globalThis.PointerEvent) => {
      const rect = track.getBoundingClientRect();
      setSplit(((e.clientX - rect.left) / rect.width) * 100);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const from = parseFloat(getComputedStyle(el).getPropertyValue('--split')) || 0;
      const start = performance.now();
      const settle = (now: number) => {
        const t = Math.min(1, (now - start) / 420);
        setSplit(from + (base - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(settle);
      };
      requestAnimationFrame(settle);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className='cm-split' data-split={id} ref={root} style={style}>
      <div className='cm-split-head'>
        <b>{file}</b>
        <span>{note}</span>
        <span className='right'>DRAG THE HANDLE ↔</span>
      </div>
      <div className='cm-split-body' ref={body}>
        <div className='cm-split-render'>{preview}</div>
        <div className='cm-split-code'>{code}</div>
        <div className='cm-split-line'>
          <span className='cm-split-edge' />
          <div className='cm-split-handle' onPointerDown={onPointerDown}>
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className='cm-split-foot'>
        <span className='hot'>{foot[0]}</span>
        <span>{foot[1]}</span>
      </div>
    </div>
  );
}
