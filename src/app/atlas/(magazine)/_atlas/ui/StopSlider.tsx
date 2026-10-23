'use client';

import { createContext, useContext, useId, useRef, type CSSProperties, type ReactNode } from 'react';

import { useLayoutWork, useMountEffect } from '../hooks';

export type Stop = {
  value: string;
  label: ReactNode;
  lang?: string;
  dir?: 'ltr' | 'rtl';
};

/** How a story draws its sliders: the pill with its lens, Fumadocs' masked line, or a printed book's rule. */
export type SliderStyle = 'stops' | 'mask' | 'book';

export const SliderStyleContext = createContext<SliderStyle>('stops');

/** The masked line's height and the rise of each step along it. */
const MASK_H = 9;
const STEP = 4;

/** Fuma's line under the stops, after the Fumadocs table of contents: it steps between neighbours, and the thumb shows only where the line runs. */
function maskPath(options: HTMLElement[]): string {
  return options
    .map((o, i) => {
      const y = i % 2 ? 1 + STEP + 1.5 : 1.5;
      const x0 = o.offsetLeft + (i ? STEP : 0);
      const x1 = o.offsetLeft + o.offsetWidth - (i < options.length - 1 ? STEP : 0);
      return `${i ? 'L' : 'M'}${x0} ${y}L${x1} ${y}`;
    })
    .join('');
}

type Props = {
  stops: readonly Stop[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** 'ink' sits on the paper, 'stage' on the navy plates. */
  tone?: 'ink' | 'stage';
  className?: string;
};

/* The press's slider, after the onboarding globe's language pill: a row
   of radios with a thumb that slides to the checked stop, and the same
   labels repeated in the thumb's ink and clipped to it, so a label reads
   in reverse while the thumb crosses it. The radios own the choice, so the
   arrow keys step it; a drag across the row picks the stop under the
   pointer. A story can set it otherwise (SliderStyleContext): Fuma Nama's
   draws the Fumadocs masked line, Euclid's a rule under a word. */
export default function StopSlider({ stops, value, onChange, label, tone = 'ink', className }: Props) {
  const name = useId();
  const look = useContext(SliderStyleContext);
  const root = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const latest = useRef(onChange);
  latest.current = onChange;

  const place = () => {
    const el = root.current;
    if (!el) return;
    const on = el.querySelector<HTMLElement>('.gtp-stop[data-on="true"]');
    if (!on) return;
    el.style.setProperty('--x', `${on.offsetLeft}px`);
    el.style.setProperty('--w', `${on.offsetWidth}px`);
    if (look !== 'mask') return;
    const options = [...el.querySelectorAll<HTMLElement>('.gtp-stop[data-value]')];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${el.clientWidth} ${MASK_H}"><path d="${maskPath(options)}" stroke="black" stroke-width="1.5" fill="none"/></svg>`;
    el.style.setProperty('--mask', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  };

  useLayoutWork(place, { dependencies: [value, stops.length] });

  useMountEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver(place);
    observer.observe(el);
    // fonts change the labels' widths once they load
    void document.fonts?.ready.then(place);
    return () => observer.disconnect();
  });

  const pick = (clientX: number) => {
    const el = root.current;
    if (!el) return;
    for (const option of el.querySelectorAll<HTMLElement>('.gtp-stop[data-value]')) {
      const box = option.getBoundingClientRect();
      if (clientX >= box.left && clientX <= box.right) {
        const next = option.dataset.value;
        if (next && next !== value) latest.current(next);
        return;
      }
    }
  };

  return (
    <div
      ref={root}
      className={['gtp-stops', className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-style={look}
      role='radiogroup'
      aria-label={label}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (dragging.current) pick(e.clientX);
      }}
      onPointerUp={(e) => {
        if (dragging.current) pick(e.clientX);
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      style={{ '--n': stops.length } as CSSProperties}
    >
      <span className='gtp-stops-thumb' aria-hidden='true' />
      {stops.map((stop) => (
        <label key={stop.value} className='gtp-stop' data-value={stop.value} data-on={stop.value === value}>
          <input
            type='radio'
            name={name}
            value={stop.value}
            checked={stop.value === value}
            onChange={() => onChange(stop.value)}
          />
          <span lang={stop.lang} dir={stop.dir}>
            {stop.label}
          </span>
        </label>
      ))}
      {look === 'stops' ? (
        <span className='gtp-stops-lens' aria-hidden='true'>
          {stops.map((stop) => (
            <span key={stop.value} className='gtp-stop'>
              <span lang={stop.lang} dir={stop.dir}>
                {stop.label}
              </span>
            </span>
          ))}
        </span>
      ) : null}
      {look === 'mask' ? (
        <>
          <span className='gtp-mask-line' aria-hidden='true' />
          <span className='gtp-mask-track' aria-hidden='true'>
            <span className='gtp-mask-thumb' />
          </span>
        </>
      ) : null}
    </div>
  );
}
