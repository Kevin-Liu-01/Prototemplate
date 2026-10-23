'use client';

import { useId, useMemo, useRef, useState, type CSSProperties } from 'react';

import { useMountEffect } from '../hooks';

import { dms, dmsPair } from '../coords';
import { easeInOut } from '../globe';
import type { Inline as InlineNode } from '../parse';
import { LANGS, type LangCode, type Localized } from '../stories';
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

/* ---------- Euclid's first definitions, city by city ---------- */

/** One definition as an edition prints it: its numbering (α΄., IIII., 第四界：, 4.) and its words. */
type Line = { n: string; text: string };
type Version = { lang: string; language: string; dir: 'ltr' | 'rtl'; city: string; year: string; lat: number; lon: number; lines: readonly Line[] };

const lines = (...rows: [string, string][]): Line[] => rows.map(([n, text]) => ({ n, text }));

/**
 * The first eight definitions of Elements in five versions, each with its
 * language, its maker, and the city and year it was made, in each edition's
 * own numbering. The Arabic carries none. English comes first, the one the
 * reader reads; the rest follow in the order they were made.
 */
const EDITIONS: readonly Version[] = [
  {
    lang: 'en', language: 'English, Heath', dir: 'ltr', city: 'Cambridge', year: '1908', lat: 52.2053, lon: 0.1218,
    lines: lines(
      ['1.', 'A point is that which has no part.'],
      ['2.', 'A line is breadthless length.'],
      ['3.', 'The extremities of a line are points.'],
      ['4.', 'A straight line is a line which lies evenly with the points on itself.'],
      ['5.', 'A surface is that which has length and breadth only.'],
      ['6.', 'The extremities of a surface are lines.'],
      ['7.', 'A plane surface is a surface which lies evenly with the straight lines on itself.'],
      ['8.', 'A plane angle is the inclination to one another of two lines in a plane which meet one another and do not lie in a straight line.'],
    ),
  },
  {
    lang: 'grc', language: 'Greek, Euclid', dir: 'ltr', city: 'Alexandria', year: 'c. 300 BCE', lat: 31.2001, lon: 29.9187,
    lines: lines(
      ['α΄.', 'Σημεῖόν ἐστιν, οὗ μέρος οὐθέν.'],
      ['β΄.', 'Γραμμὴ δὲ μῆκος ἀπλατές.'],
      ['γ΄.', 'Γραμμῆς δὲ πέρατα σημεῖα.'],
      ['δ΄.', "Εὐθεῖα γραμμή ἐστιν, ἥτις ἐξ ἴσου τοῖς ἐφ' ἑαυτῆς σημείοις κεῖται."],
      ['ε΄.', 'Ἐπιφάνεια δέ ἐστιν, ὃ μῆκος καὶ πλάτος μόνον ἔχει.'],
      ['ϛ΄.', 'Ἐπιφανείας δὲ πέρατα γραμμαί.'],
      ['ζ΄.', "Ἐπίπεδος ἐπιφάνειά ἐστιν, ἥτις ἐξ ἴσου ταῖς ἐφ' ἑαυτῆς εὐθείαις κεῖται."],
      ['η΄.', "Ἐπίπεδος δὲ γωνία ἐστὶν ἡ ἐν ἐπιπέδῳ δύο γραμμῶν ἁπτομένων ἀλλήλων καὶ μὴ ἐπ' εὐθείας κειμένων πρὸς ἀλλήλας τῶν γραμμῶν κλίσις."],
    ),
  },
  {
    lang: 'ar', language: 'Arabic, al-Ḥajjāj', dir: 'rtl', city: 'Baghdad', year: 'c. 800', lat: 33.3152, lon: 44.3661,
    lines: lines(
      ['', 'النقطة هي ما لا جزء له.'],
      ['', 'والخط طول بلا عرض.'],
      ['', 'ونهايتا الخط نقطتان.'],
      ['', 'والخط المستقيم هو الذي يقع على استقامة ما عليه من النقط.'],
      ['', 'والسطح ما له طول وعرض فقط.'],
      ['', 'ونهايات السطح خطوط.'],
      ['', 'والسطح المستوي هو الذي يقع على استقامة ما عليه من الخطوط المستقيمة.'],
      ['', 'والزاوية المسطحة هي ميل أحد خطين يلتقيان في سطح واحد على الآخر، وليسا على استقامة واحدة.'],
    ),
  },
  {
    lang: 'la', language: 'Latin, Clavius', dir: 'ltr', city: 'Rome', year: '1574', lat: 41.9028, lon: 12.4964,
    lines: lines(
      ['I.', 'Punctum est, cuius pars nulla est.'],
      ['II.', 'Linea vero, longitudo latitudinis expers.'],
      ['III.', 'Lineae autem termini, sunt puncta.'],
      ['IIII.', 'Recta linea est, quae ex aequo sua interiacet puncta.'],
      ['V.', 'Superficies est, quae longitudinem, & latitudinem tantum habet.'],
      ['VI.', 'Superficiei autem extrema, sunt lineae.'],
      ['VII.', 'Plana superficies est, quae ex aequo suas interiacet lineas.'],
      ['VIII.', 'Planus angulus est, duarum linearum in plano se mutuo tangentium, & non in directum iacentium, alterius ad alteram inclinatio.'],
    ),
  },
  {
    lang: 'zh-Hant', language: 'Chinese, Ricci and Xu', dir: 'ltr', city: 'Beijing', year: '1607', lat: 39.9042, lon: 116.4074,
    lines: lines(
      ['第一界：', '點者，無分。'],
      ['第二界：', '線，有長無廣。'],
      ['第三界：', '線之界是點。'],
      ['第四界：', '直線止有兩端，兩端之間上下更無一點。'],
      ['第五界：', '面者，止有長有廣。'],
      ['第六界：', '面之界是線。'],
      ['第七界：', '平面，一面平在界之內。'],
      ['第八界：', '平角者，兩直線於平面縱橫相遇交接處。'],
    ),
  },
];

/** Each version's name for its own language, as the switch writes it. */
const NATIVE: Record<string, string> = { grc: 'Ἑλληνική', ar: 'العربية', la: 'Latin', 'zh-Hant': '中文', en: 'English' };

/** The order the switch offers them: by the year each was made. */
const VERSIONS: readonly (Version & { key: string })[] = EDITIONS.map((v) => ({ ...v, key: v.lang }));

/** A version as the figure names it: its language, a period, then its maker, city and year. 'Chinese. Ricci and Xu, Beijing, 1607' */
function titleOf(v: Version): string {
  const [language = v.language, maker] = v.language.split(/,\s*/);
  return `${language}. ${maker ? `${maker}, ` : ''}${v.city}, ${v.year}`;
}

/** A version's definitions, each numbered as its edition numbers them; as a sizer, unseen and unheard, holding the box's height. */
function VersionLines({ version, className }: { version: Version; className?: string }) {
  return (
    <ol className={['gtp-version-lines', className].filter(Boolean).join(' ')} lang={version.lang} dir={version.dir} aria-hidden={className ? true : undefined}>
      {version.lines.map((line) => (
        <li key={line.n + line.text} className='gtp-version-line'>
          {line.n ? <span className='gtp-version-n'>{line.n}</span> : null}
          <span className='gtp-version-text'>{line.text}</span>
        </li>
      ))}
    </ol>
  );
}

/** How long each version stands before the next, while the reader leaves the switch alone; the turn below is part of it. */
const DWELL = 6000;

/** The globe's turn from one city to the next: slow, setting off and landing gently. */
const TURN = { ms: 3500, curve: easeInOut };

/** The coordinates tick over at half the board's usual speed, in step with the slow turn. */
const TICK_PACE = 2;

/* One version at a time: the globe turns to the city it was made in, the
   version's name and its coordinates tick over under it, and its eight
   definitions replace the last version's with a slow fade, each numbered
   as its edition numbers them. Every version is laid out, unseen, in the
   same place, so the box is always as tall as the longest and the switch
   never moves under the pointer from one script to the next. The first
   time it is shown it comes in part by part (press.css). It steps through
   the versions on its own while it is shown, until the reader picks one
   from the switch or a dot. */
export function VersionsDemo() {
  const [chosen, setChosen] = useState(0);
  const [held, setHeld] = useState(false);
  // the definitions fade only once a change has happened, so the figure is whole before anything moves
  const [moved, setMoved] = useState(false);
  // null until mounted, so the figure is whole without script; false until it is first shown, then true
  const [shown, setShown] = useState<boolean | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const version = VERSIONS[chosen] ?? VERSIONS[0]!;

  const show = (i: number) => {
    setMoved(true);
    setChosen(i);
  };
  // the reader's own choice, from the switch or a dot, stops the clock
  const pick = (i: number) => {
    setHeld(true);
    show(i);
  };

  // shown: on the book's stage when the stage turns to it, in a page when it scrolls well into view
  useMountEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setShown(false);
    const item = el.closest<HTMLElement>('.gtp-print-stage-item');
    if (item) {
      const check = () => {
        if (item.dataset.shown === 'true') setShown(true);
      };
      const watch = new MutationObserver(check);
      watch.observe(item, { attributes: true, attributeFilter: ['data-shown'] });
      check();
      return () => watch.disconnect();
    }
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShown(true);
      },
      { rootMargin: '0px 0px -25% 0px' }
    );
    seen.observe(el);
    return () => seen.disconnect();
  });

  // the clock: each version stands a few seconds once shown, then the next, until the reader picks one
  useMountEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const item = el.closest<HTMLElement>('.gtp-print-stage-item');
    let visible = false;
    let since = 0;
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });
    observer.observe(el);
    const timer = window.setInterval(() => {
      const onScreen = visible && el.dataset.shown === 'true' && (!item || item.dataset.shown === 'true');
      if (!onScreen || el.dataset.held === 'true') {
        since = 0;
        return;
      }
      const now = performance.now();
      if (!since) since = now;
      else if (now - since >= DWELL) {
        since = now;
        show((Number(el.dataset.chosen ?? 0) + 1) % VERSIONS.length);
      }
    }, 250);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  });

  return (
    <div ref={root} className='gtp-versions' data-chosen={chosen} data-held={held} data-moved={moved} data-shown={shown ?? undefined}>
      <div className='gtp-versions-map'>
        <Globe place={version} cell={1} tilt={0} graticule label={false} turn={TURN} className='gtp-versions-globe'>
          {/* each city's dot chooses the version made there */}
          {VERSIONS.map((v, i) => (
            <button
              key={v.key}
              type='button'
              className='gtp-globe-mark'
              data-lat={v.lat}
              data-lon={v.lon}
              data-on={i === chosen}
              aria-pressed={i === chosen}
              aria-label={titleOf(v)}
              onClick={() => pick(i)}
            />
          ))}
        </Globe>
        <p className='gtp-version-meta'>{titleOf(version)}</p>
        <p className='gtp-versions-coords' aria-label={`${version.city}: ${dms(version.lat, 'lat')}, ${dms(version.lon, 'lon')}`}>
          <FlipText value={dms(version.lat, 'lat')} pace={TICK_PACE} />
          <FlipText value={dms(version.lon, 'lon')} pace={TICK_PACE} />
        </p>
      </div>
      <div className='gtp-versions-reader'>
        <StopSlider
          stops={VERSIONS.map((v) => ({ value: v.key, label: NATIVE[v.key] ?? v.language, lang: v.lang, dir: v.dir }))}
          value={version.key}
          onChange={(key) => pick(Math.max(0, VERSIONS.findIndex((v) => v.key === key)))}
          label='Version'
        />
        <div className='gtp-version-stack'>
          {VERSIONS.map((v) => (
            <VersionLines key={v.key} version={v} className='gtp-version-sizer' />
          ))}
          <VersionLines key={version.key} version={version} />
        </div>
      </div>
    </div>
  );
}
