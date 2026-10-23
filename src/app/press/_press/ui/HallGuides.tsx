'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '../hooks';

/** A guide: where it runs, and the magazine it measures when it is one of a magazine's edges. */
type Line = { at: number; item?: number };

type Sheet = {
  w: number;
  h: number;
  xs: Line[];
  ys: Line[];
  /** Euclid's first construction: two circles through each other's centres, on the middle magazines. */
  euclid: { ax: number; bx: number; cy: number; r: number } | null;
};

/** Guides nearer than this fold into one. */
const NEAR = 3;
/** The leaves stepping out under each magazine's front, at its side and foot (rack.css, .gtp-mag-page). */
const STEP = 4;

function fold(lines: Line[], size: number): Line[] {
  const sorted = [...lines].filter((line) => line.at > 0.5 && line.at < size - 0.5).sort((a, b) => a.at - b.at);
  return sorted.filter((line, i) => i === 0 || line.at - sorted[i - 1]!.at > NEAR || line.item !== undefined);
}

/** The baseline and cap height of a line of text: its own box where the browser trims it to them (rack.css, text-box), else measured from its font. */
function typeLines(el: HTMLElement): { baseline: number; capTop: number } {
  if (CSS.supports('text-box', 'trim-both cap alphabetic')) {
    const r = el.getBoundingClientRect();
    return { baseline: r.bottom, capTop: r.top };
  }
  const mark = document.createElement('span');
  mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  el.append(mark);
  const baseline = mark.getBoundingClientRect().top;
  mark.remove();
  const style = getComputedStyle(el);
  const ctx = document.createElement('canvas').getContext('2d');
  let cap = parseFloat(style.fontSize) * 0.7;
  if (ctx) {
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    cap = ctx.measureText('H').actualBoundingBoxAscent || cap;
  }
  return { baseline, capTop: baseline - cap };
}

function read(hall: HTMLElement): Sheet {
  const box = hall.getBoundingClientRect();
  const x = (v: number) => v - box.left;
  const y = (v: number) => v - box.top;
  const xs: Line[] = [];
  const ys: Line[] = [];

  // the magazines: an edge each side, their tops, and the horizon the leaves under them stand on
  const slots = [...hall.querySelectorAll<HTMLElement>('.gtp-shelf-item')].map((el) => el.getBoundingClientRect());
  slots.forEach((r, item) => {
    xs.push({ at: x(r.left), item }, { at: x(r.right), item });
  });
  if (slots[0]) ys.push({ at: y(slots[0].top) }, { at: y(slots[0].bottom) + STEP });

  // the nameplate: the last edge of its word, its cap height and its baseline (its first edge is the first magazine's)
  const word = hall.querySelector<HTMLElement>('.gtp-nameplate-word');
  if (word) {
    xs.push({ at: x(word.getBoundingClientRect().right) });
    const type = typeLines(word);
    ys.push({ at: y(type.capTop) }, { at: y(type.baseline) });
  }

  // the globe's upright centre line (a level one would strike through the languages and the coordinates beside it)
  const dial = hall.querySelector<HTMLElement>('.gtp-globe-button');
  if (dial) {
    const r = dial.getBoundingClientRect();
    xs.push({ at: x(r.left + r.width / 2) });
  }

  const a = slots[1];
  const b = slots[2];
  const euclid =
    a && b && slots.length >= 4 && box.width >= 1000
      ? { ax: x(a.left + a.width / 2), bx: x(b.left + b.width / 2), cy: y(a.top + a.height / 2), r: b.left - a.left }
      : null;
  return { w: box.width, h: box.height, xs: fold(xs, box.width), ys: fold(ys, box.height), euclid };
}

/* The magazine's front page over a layout sheet, its guides measured from
   the page itself: each runs the sheet's full width or height, edge to
   edge and behind everything on the page, along an edge the page really
   has (each magazine's sides, their tops and the horizon their leaves
   stand on, the nameplate's last edge, its cap height and baseline, the
   globe's upright centre line), all in one ink; Euclid's first construction circles the
   middle two magazines, each circle through the other's centre. The
   nameplate, the dateline and the controls sit on these lines.
   Decoration only: it takes no pointer and no reader hears it (rack.css,
   .gtp-guides). */
export default function HallGuides() {
  const root = useRef<HTMLDivElement>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);

  useMountEffect(() => {
    const hall = root.current?.parentElement;
    if (!hall) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setSheet(read(hall)));
    };
    measure();
    // the hall, and what changes size with the language: the dateline and the language's name
    const resize = new ResizeObserver(measure);
    resize.observe(hall);
    hall.querySelectorAll('.gtp-hall-coords, .gtp-dateline, .gtp-langpick').forEach((el) => resize.observe(el));
    // on a phone the row scrolls sideways, and its magazines' guides go with it
    const shelf = hall.querySelector('.gtp-shelf');
    shelf?.addEventListener('scroll', measure, { passive: true });
    void document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      shelf?.removeEventListener('scroll', measure);
    };
  });

  return (
    <div ref={root} className='gtp-guides' aria-hidden='true'>
      {sheet ? (
        <svg width={sheet.w} height={sheet.h} viewBox={`0 0 ${sheet.w} ${sheet.h}`}>
          {sheet.euclid ? (
            <g className='gtp-guides-euclid'>
              <circle cx={sheet.euclid.ax} cy={sheet.euclid.cy} r={sheet.euclid.r} />
              <circle cx={sheet.euclid.bx} cy={sheet.euclid.cy} r={sheet.euclid.r} />
            </g>
          ) : null}
          {sheet.xs.map((line, i) => (
            <line key={`x${i}`} x1={Math.round(line.at) + 0.5} x2={Math.round(line.at) + 0.5} y1={0} y2={sheet.h} data-item={line.item} />
          ))}
          {sheet.ys.map((line, i) => (
            <line key={`y${i}`} x1={0} x2={sheet.w} y1={Math.round(line.at) + 0.5} y2={Math.round(line.at) + 0.5} />
          ))}
        </svg>
      ) : null}
    </div>
  );
}
