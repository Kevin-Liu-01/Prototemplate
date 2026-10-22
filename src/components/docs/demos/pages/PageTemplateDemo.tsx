'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Toggle } from '../controls';
import { useTheme } from '../hooks';
import Plate from '../Plate';
import { TEMPLATES } from './page-templates';
import type { Side, TemplateId, TemplatePart } from './page-templates';
import PageFrame, { FRAME_SIZE, WIDTH_OPTIONS } from './PageFrame';
import type { FrameTheme, FrameView, FrameWidth } from './PageFrame';

import './pages.css';

type Rect = { x: number; y: number; w: number; h: number };

/** One part as measured in the framed document, in its CSS pixels. */
type Measured = {
  /** the part's row in the template's parts table, from 1 */
  n: number;
  name: string;
  token: string;
  /** the value read at the frame's width, as printed */
  value: string;
  box: Rect;
  /** the spacing drawn as a band, when it resolves to pixels and the part names a side */
  gap: Rect | null;
  round: boolean;
};

const PX = /^-?\d+(?:\.\d+)?px$/;

/** 44.0 prints as 44px, 310.15625 as 310.2px. */
function px(value: number): string {
  return `${Math.round(value * 10) / 10}px`;
}

function band(box: Rect, side: Side, inside: boolean, size: number): Rect {
  switch (side) {
    case 'top':
      return { x: box.x, y: inside ? box.y : box.y - size, w: box.w, h: size };
    case 'bottom':
      return { x: box.x, y: inside ? box.y + box.h - size : box.y + box.h, w: box.w, h: size };
    case 'left':
      return { x: inside ? box.x : box.x - size, y: box.y, w: size, h: box.h };
    case 'right':
      return { x: inside ? box.x + box.w - size : box.x + box.w, y: box.y, w: size, h: box.h };
  }
}

/** Every part the framed document holds at this width, measured where it is drawn now. */
function measure(doc: Document, win: Window, parts: readonly TemplatePart[], width: FrameWidth): Measured[] {
  const found: Measured[] = [];
  for (const [index, part] of parts.entries()) {
    if (part.only && part.only !== width) continue;
    const el = doc.querySelector<HTMLElement>(part.selector);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const source = (part.of === 'parent' ? el.parentElement : part.of ? el.querySelector(part.of) : el) ?? el;
    const raw =
      part.read === 'width' ? `${r.width}px` : part.read === 'height' ? `${r.height}px` : win.getComputedStyle(source).getPropertyValue(part.read).trim();
    const size = PX.test(raw) ? Number.parseFloat(raw) : null;
    let box: Rect = { x: r.left, y: r.top, w: r.width, h: r.height };
    let round = false;
    if (part.circle) {
      const style = win.getComputedStyle(el);
      const cx = Number.parseFloat(style.getPropertyValue(part.circle.x));
      const cy = Number.parseFloat(style.getPropertyValue(part.circle.y));
      const radius = Number.parseFloat(style.getPropertyValue(part.circle.r));
      if ([cx, cy, radius].every(Number.isFinite)) {
        box = { x: r.left + cx - radius, y: r.top + cy - radius, w: radius * 2, h: radius * 2 };
        round = true;
      }
    }
    found.push({
      n: index + 1,
      name: part.name,
      token: part.token,
      value: size === null ? raw : px(size),
      box,
      gap: size !== null && size > 0 && part.band ? band(box, part.band, Boolean(part.inside), size) : null,
      round,
    });
  }
  return found;
}

/* a label's height on the overlay, and the step a label moves down by when it would cover another */
const LABEL_H = 20;

/* under this overlay width a label is its number alone, and the legend under the frame names the parts */
const COMPACT_W = 560;

/** Where each label sits on the overlay: at its part's corner, moved down past any label placed before it. */
function placeLabels(parts: readonly Measured[], scale: number, area: { w: number; h: number }, compact: boolean) {
  const placed: Rect[] = [];
  return parts.map((part) => {
    /* Inter's text at the group step averages 6.5px a character, the mono token 7.5px */
    const text = 22 + (part.name.length + part.value.length) * 6.5 + part.token.length * 7.5;
    const w = Math.min(area.w - 4, compact ? 20 : text);
    const x = Math.max(2, Math.min(part.box.x * scale + 3, area.w - w - 2));
    let y = Math.max(2, Math.min(part.box.y * scale + 3, area.h - LABEL_H - 2));
    for (let tries = 0; tries < 12; tries++) {
      const hit = placed.find((p) => x < p.x + p.w && p.x < x + w && y < p.y + p.h && p.y < y + LABEL_H);
      if (!hit) break;
      y = hit.y + LABEL_H + 2;
    }
    const spot = { x, y, w, h: LABEL_H };
    placed.push(spot);
    return spot;
  });
}

type AnatomyProps = { view: FrameView; parts: readonly TemplatePart[] };

/**
 * The anatomy overlay: an outline on each part of the framed page, its
 * spacing as a band where it resolves to pixels, and a label with the
 * part's name, the token or property its spacing is written with, and the
 * value the page computes at this width. On an overlay narrower than
 * COMPACT_W a label holds the part's number in the table, and a legend
 * under the frame gives the rest. The page is measured on load,
 * on every scroll inside it (any scroller, so the shell's stage counts),
 * on a resize of its document or of a part, and twice more as it settles
 * after hydration. The overlay never takes a pointer, so the page under it
 * stays live.
 */
function Anatomy({ view, parts }: AnatomyProps) {
  const { frame, scale, width, loads } = view;
  const [found, setFound] = useState<Measured[]>([]);

  useLayoutWork(
    () => {
      const doc = frame.contentDocument;
      const win = frame.contentWindow;
      if (!doc || !win) return;
      let raf = 0;
      const read = () => {
        raf = 0;
        setFound(measure(doc, win, parts, width));
      };
      const queue = () => {
        if (!raf) raf = window.requestAnimationFrame(read);
      };
      read();
      doc.addEventListener('scroll', queue, { capture: true, passive: true });
      win.addEventListener('resize', queue);
      const Observer = (win as Window & typeof globalThis).ResizeObserver;
      const observer = Observer ? new Observer(queue) : null;
      if (observer) {
        observer.observe(doc.documentElement);
        for (const part of parts) {
          const el = doc.querySelector(part.selector);
          if (el) observer.observe(el);
        }
      }
      const settle = [400, 1600].map((ms) => window.setTimeout(queue, ms));
      return () => {
        if (raf) window.cancelAnimationFrame(raf);
        for (const timer of settle) window.clearTimeout(timer);
        observer?.disconnect();
        doc.removeEventListener('scroll', queue, { capture: true });
        win.removeEventListener('resize', queue);
      };
    },
    { dependencies: [frame, loads, parts, width], revertOnUpdate: true }
  );

  const size = FRAME_SIZE[width];
  const area = { w: size.w * scale, h: size.h * scale };
  const compact = area.w < COMPACT_W;
  /* the parts inside the page's viewport; one scrolled out of it draws nothing */
  const shown = found.filter((part) => part.box.y < size.h && part.box.y + part.box.h > 0);
  const labels = placeLabels(shown, scale, area, compact);
  const at = (r: Rect): CSSProperties => ({ left: r.x * scale, top: r.y * scale, width: r.w * scale, height: r.h * scale });

  return (
    <>
      <div aria-hidden='true' className='pgx-anatomy'>
        {shown.map((part) => (
          <div key={`box-${part.name}`}>
            {part.gap ? <span className='pgx-gap' style={at(part.gap)} /> : null}
            <span className={part.round ? 'pgx-part is-round' : 'pgx-part'} style={at(part.box)} />
          </div>
        ))}
        {shown.map((part, i) => {
          const spot = labels[i];
          if (!spot) return null;
          return (
            <span className={compact ? 'pgx-label is-n' : 'pgx-label'} key={`label-${part.name}`} style={{ left: spot.x, top: spot.y }}>
              {compact ? (
                part.n
              ) : (
                <>
                  <span>{part.name}</span>
                  <span className='pgx-label-token'>{part.token}</span>
                  <span className='pgx-label-value'>{part.value}</span>
                </>
              )}
            </span>
          );
        })}
      </div>
      {compact ? (
        <ol aria-label='Parts on screen' className='pgx-legend'>
          {shown.map((part) => (
            <li key={`legend-${part.name}`}>
              <span aria-hidden='true' className='pgx-legend-n'>
                {part.n}
              </span>
              <span>{part.name}</span>
              <span className='pgx-legend-token'>{part.token}</span>
              <span className='pgx-legend-value'>{part.value}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </>
  );
}

/**
 * A page type the hub builds from, live in a frame, with the anatomy
 * overlay the reader toggles: each part outlined and labelled with its
 * spacing token and the value it computes at the frame's width. Page picks
 * one of the routes built on the template, Width lays it out at 1440 or
 * 390 pixels, and the frame follows the docs theme.
 */
export default function PageTemplateDemo({ template }: { template: TemplateId }) {
  const spec = TEMPLATES[template];
  const first = spec.pages[0]!;
  const [path, setPath] = useState(first.path);
  const [width, setWidth] = useState<FrameWidth>('1440');
  const [anatomy, setAnatomy] = useState(true);
  const theme: FrameTheme = useTheme() === 'light' ? 'light' : 'dark';
  const page = spec.pages.find((p) => p.path === path) ?? first;
  const still = page.still ? `/shots/thumb/${page.still}${theme === 'dark' ? '-dark' : ''}.webp` : null;
  const open = page.path.replace(/[?&]chrome=0$/, '');

  return (
    <Plate
      bare
      controls={
        <>
          {spec.pages.length > 1 ? (
            <Choice label='Page' options={spec.pages.map((p) => ({ value: p.path, label: p.label }))} value={page.path} onChange={setPath} />
          ) : null}
          <Choice label='Width' options={WIDTH_OPTIONS} value={width} onChange={setWidth} />
          <Toggle label='Anatomy' pressed={anatomy} onChange={setAnatomy} />
          <a className='dmo-btn dmo-link' href={open}>
            Open Page
          </a>
        </>
      }
      fit
      label={`The ${page.label} page built on ${spec.name}, live at ${width}px${anatomy ? ', with its parts labelled' : ''}`}
      stageClassName='dmo-frame'
      tag={spec.name}
    >
      <PageFrame
        overlay={anatomy ? (view) => <Anatomy parts={spec.parts} view={view} /> : undefined}
        src={page.path}
        still={still}
        theme={theme}
        title={`The ${page.label} page at ${width} pixels wide`}
        width={width}
      />
    </Plate>
  );
}
