'use client';

import { useId, useMemo, useRef, useState, type CSSProperties } from 'react';

import { dmsPair } from '../coords';
import type { Inline as InlineNode } from '../parse';
import { LANGS, type LangCode, type Localized } from '../stories';
import Globe from '../ui/Globe';
import Inline from '../ui/Inline';
import StopSlider from '../ui/StopSlider';

/* The live stops that open a figure: each rebuilds in the page what the
   figure's recording shows, so the reader can work the thing the paragraph
   describes. */

/* ---------- the table of contents thumb ---------- */

const ROW = 30;
const NEST = 12;

type TocRow = { text: string; level: 0 | 1 };

/** The essay's own headings, nested as the docs nest theirs. */
const TOC_ROWS: TocRow[] = [
  { text: 'Why design docs?', level: 0 },
  { text: 'Intuitive flow and direction', level: 0 },
  { text: 'Cleaning up mental clutter', level: 0 },
  { text: 'Drawing the eye', level: 0 },
  { text: 'Icons', level: 1 },
  { text: 'Separators', level: 1 },
  { text: 'Type', level: 1 },
  { text: 'A unique GT flair', level: 0 },
  { text: 'The table of contents', level: 1 },
  { text: 'The sidebar', level: 1 },
  { text: 'The hit list', level: 0 },
];

/** Fuma Nama's headings, with Fumadocs' four layers nested under the one that names them. */
export const FUMA_ROWS: TocRow[] = [
  { text: 'Fumadocs', level: 0 },
  { text: 'The vibrant world of the computer', level: 0 },
  { text: 'The open-source ecosystem', level: 0 },
  { text: 'Less abstraction, less opinionated software', level: 0 },
  { text: 'A black box and a compiler', level: 0 },
  { text: 'Content', level: 1 },
  { text: 'Core', level: 1 },
  { text: 'UI', level: 1 },
  { text: 'CLI', level: 1 },
  { text: 'The Fumadocs design credo', level: 0 },
  { text: 'Perfect software', level: 0 },
];

function railPath(rows: TocRow[]): string {
  let d = '';
  rows.forEach((row, i) => {
    const x = 1 + row.level * NEST;
    const top = i * ROW;
    const prev = rows[i - 1];
    if (!prev) d += `M${x} ${top}`;
    else if (prev.level !== row.level) d += `L${1 + prev.level * NEST} ${top - 6}L${x} ${top + 6}`;
    d += `L${x} ${top + ROW}`;
  });
  return d;
}

export function TocDemo({ rows = TOC_ROWS, start = 4 }: { rows?: TocRow[]; start?: number }) {
  const [active, setActive] = useState(start);
  const [hover, setHover] = useState<number | null>(null);
  const mask = useId();
  const path = useMemo(() => railPath(rows), [rows]);
  const at = hover ?? active;
  const height = rows.length * ROW;
  return (
    <div className='gtp-toc' onPointerLeave={() => setHover(null)}>
      <svg className='gtp-toc-rail' viewBox={`0 0 ${NEST + 2} ${height}`} width={NEST + 2} height={height} aria-hidden='true'>
        <defs>
          <mask id={mask} maskUnits='userSpaceOnUse'>
            <rect className='gtp-toc-window' x='-4' y='0' width={NEST + 10} height={ROW} fill='#fff' style={{ transform: `translateY(${at * ROW}px)` }} />
          </mask>
        </defs>
        <path d={path} className='gtp-toc-line' />
        <path d={path} className='gtp-toc-thumb' mask={`url(#${mask})`} />
      </svg>
      <ol className='gtp-toc-list'>
        {rows.map((row, i) => (
          <li key={row.text} style={{ '--lvl': row.level } as CSSProperties}>
            <button
              type='button'
              data-on={i === active}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => setActive(i)}
            >
              {row.text}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- corners ---------- */

const RADII = [
  { value: '999', label: 'Pill' },
  { value: '12', label: '12 px' },
  { value: '6', label: '6 px' },
  { value: '4', label: '4 px' },
  { value: '0', label: '0 px' },
];

export function CornersDemo() {
  const [radius, setRadius] = useState('6');
  const pill = radius === '999';
  return (
    <div className='gtp-corners' data-pill={pill} style={{ '--r': `${radius}px` } as CSSProperties}>
      <div className='gtp-corners-specimen'>
        <span className='gtp-corners-search'>
          <svg viewBox='0 0 16 16' aria-hidden='true'>
            <circle cx='7' cy='7' r='4.5' fill='none' stroke='currentColor' strokeWidth='1.25' />
            <path d='M10.5 10.5L14 14' stroke='currentColor' strokeWidth='1.25' />
          </svg>
          Search docs
          <kbd>⌘K</kbd>
        </span>
        <span className='gtp-corners-row'>
          <span className='gtp-corners-button'>Get a demo</span>
          <span className='gtp-corners-ghost'>Copy page</span>
        </span>
        <span className='gtp-corners-card'>
          <strong>Quickstart</strong>
          <span>Set up General Translation in a Next.js app.</span>
        </span>
        {pill ? <span className='gtp-corners-strike' aria-hidden='true' /> : null}
      </div>
      <p className='gtp-live-note'>{pill ? 'The pill is the shape the redesign removed.' : `Every box at ${radius} px.`}</p>
      <StopSlider stops={RADII} value={radius} onChange={setRadius} label='Corner radius' tone='stage' />
    </div>
  );
}

/* ---------- the hit list ---------- */

const GROUPS: [label: string, count: number][] = [
  ['Clutter', 5],
  ['Language', 1],
  ['Navigation', 4],
];

export function HitListDemo({ items }: { items: InlineNode[][] }) {
  const [struck, setStruck] = useState<Set<number>>(() => new Set());
  const toggle = (i: number) =>
    setStruck((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  let start = 0;
  return (
    <div className='gtp-hits'>
      <div className='gtp-hits-head'>
        <span className='gtp-hits-count'>
          {struck.size} of {items.length} struck
        </span>
        <button
          type='button'
          className='gtp-text-button'
          onClick={() => setStruck(struck.size === items.length ? new Set() : new Set(items.map((_, i) => i)))}
        >
          {struck.size === items.length ? 'Reset' : 'Strike all'}
        </button>
      </div>
      {GROUPS.map(([label, count]) => {
        const from = start;
        start += count;
        return (
          <section key={label} className='gtp-hits-group'>
            <h4>{label}</h4>
            <ul>
              {items.slice(from, from + count).map((item, k) => {
                const i = from + k;
                return (
                  <li key={i}>
                    <button type='button' aria-pressed={struck.has(i)} onClick={() => toggle(i)}>
                      <span className='gtp-hits-mark' aria-hidden='true' />
                      <span className='gtp-hits-text'>
                        <Inline nodes={item} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- the globe ---------- */

export function GlobeDemo({ titles }: { titles: Localized }) {
  const [code, setCode] = useState<LangCode>('en');
  const lang = LANGS.find((l) => l.code === code) ?? LANGS[0]!;
  return (
    <div className='gtp-globe-demo'>
      <Globe place={lang} className='gtp-globe-demo-globe' />
      <div className='gtp-globe-demo-text'>
        <p className='gtp-globe-demo-title' lang={lang.code} dir={lang.dir}>
          {titles[code]}
        </p>
        <p className='gtp-globe-demo-meta'>
          {lang.city} · {dmsPair(lang)}
        </p>
      </div>
      <StopSlider
        stops={LANGS.map((l) => ({ value: l.code, label: l.name, lang: l.code, dir: l.dir }))}
        value={code}
        onChange={(v) => setCode(v as LangCode)}
        label='Language'
        tone='stage'
      />
    </div>
  );
}

/* ---------- dark and light ---------- */

export function ThemeWipe({ dark, light, alt }: { dark: string; light: string; alt: string }) {
  const [at, setAt] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const move = (clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAt(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className='gtp-wipe'
      style={{ '--at': `${at}%` } as CSSProperties}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the blog's own files */}
      <img src={dark} alt={alt} draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element -- the blog's own files */}
      <img className='gtp-wipe-light' src={light} alt='' aria-hidden='true' draggable={false} />
      <span className='gtp-wipe-handle' aria-hidden='true' />
      <span className='gtp-wipe-tag' data-side='dark'>
        Dark
      </span>
      <span className='gtp-wipe-tag' data-side='light'>
        Light
      </span>
      <input
        className='gtp-wipe-input'
        type='range'
        min={0}
        max={100}
        value={Math.round(at)}
        aria-label='Wipe between the dark and light pictures'
        onChange={(e) => setAt(Number(e.currentTarget.value))}
      />
    </div>
  );
}

/* ---------- Euclid's first definition, city by city ---------- */

type EuclidStop = { code: string; name: string; dir: 'ltr' | 'rtl'; city: string; year: string; lat: number; lon: number; passage: string };

/** The first definition of Elements in the five languages that carried it, at the city and year of each version (after the blog's globe figure). */
const EUCLID: readonly EuclidStop[] = [
  { code: 'grc', name: 'Ἑλληνική', dir: 'ltr', city: 'Alexandria', year: '300 BCE', lat: 31.2, lon: 29.919, passage: 'Σημεῖόν ἐστιν, οὗ μέρος οὐθέν.' },
  { code: 'ar', name: 'العربية', dir: 'rtl', city: 'Baghdad', year: '800 CE', lat: 33.345, lon: 44.345, passage: 'النقطة هي ما لا جزء له.' },
  { code: 'la', name: 'Latina', dir: 'ltr', city: 'Antioch', year: '1130', lat: 36.2, lon: 36.16, passage: 'Punctum est, cuius pars nulla est.' },
  { code: 'en', name: 'English', dir: 'ltr', city: 'London', year: '1570', lat: 51.517, lon: -0.097, passage: 'A point is that which has no part.' },
  { code: 'zh-Hant', name: '文言', dir: 'ltr', city: 'Beijing', year: '1607', lat: 39.9, lon: 116.37, passage: '點者，無分。' },
];

/** `globe` off sets it as a printed page does: the passage, its place, and the versions. */
export function StopsDemo({ globe = true }: { globe?: boolean }) {
  const [code, setCode] = useState(EUCLID[0]!.code);
  const stop = EUCLID.find((s) => s.code === code) ?? EUCLID[0]!;
  return (
    <div className='gtp-globe-demo' data-globe={globe}>
      {globe ? <Globe place={stop} className='gtp-globe-demo-globe' /> : null}
      <div className='gtp-globe-demo-text'>
        <p className='gtp-globe-demo-title' lang={stop.code} dir={stop.dir}>
          {stop.passage}
        </p>
        <p className='gtp-globe-demo-meta'>{globe ? `${stop.city} · ${stop.year} · ${dmsPair(stop)}` : `${stop.city}, ${stop.year}`}</p>
      </div>
      <StopSlider
        stops={EUCLID.map((s) => ({ value: s.code, label: s.name, lang: s.code, dir: s.dir }))}
        value={code}
        onChange={setCode}
        label='Version'
        tone='stage'
      />
    </div>
  );
}
