'use client';

import { useId, useMemo, useRef, useState, type CSSProperties } from 'react';

import { useMountEffect } from '../hooks';

import { dms, dmsPair } from '../coords';
import type { Inline as InlineNode } from '../parse';
import { LANGS, type LangCode, type Localized } from '../stories';
import { project } from '../geo/ortho';
import { cameraFor } from '../globe';
import Globe from '../ui/Globe';
import FlipText from '../ui/FlipText';
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

type Version = { lang: string; language: string; dir: 'ltr' | 'rtl'; city: string; year: string; lat: number; lon: number; passage: string };

/**
 * The first definition of Elements in eight versions, each with its
 * language, the city and the year it was made. Draft wording, to check
 * against the editions.
 */
const EDITIONS: readonly Version[] = [
  { lang: 'en', language: 'English, Billingsley', dir: 'ltr', city: 'London', year: '1570', lat: 51.5138, lon: -0.0984, passage: 'A signe or point is that, which hath no part.' },
  { lang: 'en', language: 'English, Byrne', dir: 'ltr', city: 'London', year: '1847', lat: 51.5138, lon: -0.0984, passage: 'A point is that which has no parts.' },
  { lang: 'la', language: 'Latin, Campanus', dir: 'ltr', city: 'Venice', year: '1482', lat: 45.4408, lon: 12.3155, passage: 'Punctus est cuius pars non est.' },
  { lang: 'la', language: 'Latin, Clavius', dir: 'ltr', city: 'Rome', year: '1574', lat: 41.9028, lon: 12.4964, passage: 'Punctum est, cuius pars nulla est.' },
  { lang: 'zh-Hant', language: 'Chinese, Ricci and Xu', dir: 'ltr', city: 'Beijing', year: '1607', lat: 39.9042, lon: 116.4074, passage: '點者，無分。' },
  { lang: 'la', language: 'Latin, Adelard', dir: 'ltr', city: 'Antioch', year: 'c. 1120', lat: 36.2021, lon: 36.1604, passage: 'Punctus est cui pars non est.' },
  { lang: 'ar', language: 'Arabic, al-Ḥajjāj', dir: 'rtl', city: 'Baghdad', year: 'c. 800', lat: 33.3152, lon: 44.3661, passage: 'النقطة هي ما لا جزء له.' },
  { lang: 'grc', language: 'Greek, Euclid', dir: 'ltr', city: 'Alexandria', year: 'c. 300 BCE', lat: 31.2001, lon: 29.9187, passage: 'Σημεῖόν ἐστιν, οὗ μέρος οὐθέν.' },
];

/** Where the globe looks: between London and Beijing, so every city is on the near side. */
const MIDDLE = { lat: 38, lon: 52, city: '' };

/* The versions in the order their pins sit on the globe, top to bottom: the
   list follows that order, so every leader can leave its pin sideways to the
   gutter and turn down or up to its line without crossing another. */
const VERSIONS: readonly Version[] = [...EDITIONS].sort((a, b) => {
  const camera = cameraFor(MIDDLE, 0);
  const at = (v: Version) => project({ ...camera, radius: 50, cx: 50, cy: 50 }, v).y;
  return at(a) - at(b);
});

/* All eight at once: a pin at each city on the globe, a hairline from each
   pin to its line of the definition, and the chosen version's pin and
   leader in the ink with its coordinates under the globe. The leaders are
   drawn in an SVG over the figure, from where the globe placed each pin to
   where its line sits, and drawn again whenever either moves. */
export function VersionsDemo() {
  const [chosen, setChosen] = useState(() => Math.max(0, VERSIONS.findIndex((v) => v.city === 'Beijing')));
  const root = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const version = VERSIONS[chosen] ?? VERSIONS[0]!;

  const draw = () => {
    const el = root.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const globe = el.querySelector('.gtp-versions-globe')?.getBoundingClientRect();
    const marks = el.querySelectorAll<HTMLElement>('.gtp-globe-mark');
    const rows = el.querySelectorAll<HTMLElement>('.gtp-version');
    if (!globe) return;
    const ends = VERSIONS.map((_, i) => {
      const m = marks[i]?.getBoundingClientRect();
      const r = rows[i]?.getBoundingClientRect();
      if (!m || !r) return null;
      return {
        mx: m.left + m.width / 2 - box.left,
        my: m.top + m.height / 2 - box.top,
        rx: r.left - box.left - 8,
        ry: r.top + Math.min(r.height / 2, 14) - box.top,
      };
    });
    // each leader turns in a lane of its own in the gutter: the ones climbing to their row take lanes outward down the
    // list, the ones dropping take them outward up the list, so no lane crosses another leader's run
    const lane = new Array<number>(VERSIONS.length).fill(0);
    const up = ends.flatMap((e, i) => (e && e.ry < e.my ? [i] : []));
    const down = ends.flatMap((e, i) => (e && e.ry >= e.my ? [i] : [])).reverse();
    up.forEach((i, k) => (lane[i] = k));
    down.forEach((i, k) => (lane[i] = k));
    const gutter = globe.right - box.left + 16;
    const next = ends.map((e, i) => {
      if (!e) return '';
      const x = gutter + (lane[i] ?? 0) * 9;
      return `M${e.mx.toFixed(1)} ${e.my.toFixed(1)}H${x.toFixed(1)}V${e.ry.toFixed(1)}H${e.rx.toFixed(1)}`;
    });
    setPaths(next);
  };

  useMountEffect(() => {
    const el = root.current;
    if (!el) return;
    const globe = el.querySelector('.gtp-globe');
    globe?.addEventListener('gtp-globe-placed', draw);
    const observer = new ResizeObserver(draw);
    observer.observe(el);
    void document.fonts?.ready.then(draw);
    draw();
    return () => {
      globe?.removeEventListener('gtp-globe-placed', draw);
      observer.disconnect();
    };
  });

  return (
    <div ref={root} className='gtp-versions'>
      <div className='gtp-versions-map'>
        <Globe place={MIDDLE} cell={2} tilt={0} graticule label={false} className='gtp-versions-globe'>
          {VERSIONS.map((v, i) => (
            <span key={`${v.city}-${v.year}`} className='gtp-globe-mark' data-lat={v.lat} data-lon={v.lon} data-on={i === chosen} aria-hidden='true' />
          ))}
        </Globe>
        <p className='gtp-versions-coords' aria-label={`${version.city}: ${dms(version.lat, 'lat')}, ${dms(version.lon, 'lon')}`}>
          <FlipText value={dms(version.lat, 'lat')} />
          <FlipText value={dms(version.lon, 'lon')} />
        </p>
      </div>
      <ol className='gtp-versions-list'>
        {VERSIONS.map((v, i) => (
          <li key={`${v.city}-${v.year}`}>
            <button type='button' className='gtp-version' aria-pressed={i === chosen} onClick={() => setChosen(i)}>
              <span className='gtp-version-text' lang={v.lang} dir={v.dir}>
                {v.passage}
              </span>
              <span className='gtp-version-meta'>
                {v.language}, {v.city}, {v.year}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <svg className='gtp-versions-leaders' aria-hidden='true'>
        {paths.map((d, i) => (d ? <path key={i} d={d} data-on={i === chosen} /> : null))}
      </svg>
    </div>
  );
}
