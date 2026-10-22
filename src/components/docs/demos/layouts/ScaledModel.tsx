'use client';

import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import './layouts.css';

/** Where the scaled model sits in its box: the scale, and the left inset when the height limits it. */
export type ModelFit = { scale: number; left: number };

type ScaledModelProps = {
  /** the model's layout box in CSS pixels, as the page it models lays it out */
  width: number;
  /** the model's height; with fitContent, the estimate the server renders before the content is measured */
  height: number;
  /** take the height of the content, measured, in place of `height` */
  fitContent?: boolean;
  /** the tallest the scaled model stands in the plate; past it the model narrows and centers */
  maxHeight?: number;
  /** a class on the model, for the plate's own stylesheet */
  className?: string;
  /** custom properties the model's stylesheet reads */
  style?: CSSProperties;
  /** marks drawn over the model in plate pixels, so a label keeps its size at any scale */
  overlay?: (fit: ModelFit) => ReactNode;
  children: ReactNode;
};

/**
 * A page part laid out at its own width and scaled into the plate. The
 * box takes its height from CSS (the model's aspect ratio, capped by
 * maxHeight), so nothing shifts when the scale is measured; the scale is
 * read before paint and again on every resize. Media queries still follow
 * the real viewport, so a model reads its breakpoint values from props.
 */
export default function ScaledModel({
  width,
  height,
  fitContent = false,
  maxHeight,
  className,
  style,
  overlay,
  children,
}: ScaledModelProps) {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [measured, setMeasured] = useState(0);

  useLayoutWork(() => {
    const el = box.current;
    if (!el) return;
    const read = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((cur) => (cur.w === w && cur.h === h ? cur : { w, h }));
      if (fitContent && content.current) setMeasured(Math.ceil(content.current.offsetHeight));
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  });

  const h = fitContent && measured ? measured : height;
  const scale = size.w && size.h ? Math.min(size.w / width, size.h / h) : 0;
  const fit: ModelFit = { scale, left: (size.w - width * scale) / 2 };
  const boxStyle = {
    '--lay-w': `${width}px`,
    '--lay-ratio': `${width} / ${h}`,
    '--lay-max-h': maxHeight ? `${maxHeight}px` : 'none',
  } as CSSProperties;
  const modelStyle = {
    ...style,
    width,
    height: h,
    transform: `translateX(-50%) scale(${scale})`,
    visibility: scale ? undefined : 'hidden',
  } as CSSProperties;

  return (
    <div className='dmo-lay-fit' ref={box} style={boxStyle}>
      <div aria-hidden='true' className={className ? `dmo-lay-model ${className}` : 'dmo-lay-model'} style={modelStyle}>
        {fitContent ? (
          <div className='dmo-lay-model-in' ref={content}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
      {overlay && scale ? <div className='dmo-lay-over'>{overlay(fit)}</div> : null}
    </div>
  );
}
