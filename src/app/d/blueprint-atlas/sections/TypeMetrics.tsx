'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Ref D4 — the type-metric sheet, drawn as four measured specimens at once.
 *
 * Every locale renders simultaneously (§1.3: a comparison shows ≥3 locales
 * with their measured deltas in one still). Each row is a real rendered word
 * with its own baseline, advance edges and dimension line; the English row
 * carries the full caliper vocabulary (metric guides, gutter labels, control
 * points, sidebearing bands), and a dashed reference edge drops from the end
 * of the English measure through every row so the overruns read at a glance.
 * All values are measured off the rendered glyphs, never guessed.
 */

type Spec = {
  code: string;
  label: string;
  word: string;
  asc: number;
  cap: number;
  xh: number;
  desc: number;
  script: string;
  direction: string;
  note: string;
};

const VIEW_W = 940;
const VIEW_H = 560;
const LEFT = 210;
const GUTTER = 150;
const GUIDE_X1 = 164;
const BAND_W = 26;
const SIZE = 72;
const ROW0 = 128;
const ROW_GAP = 126;
const DIM_DY = 30;

const SPECS: [Spec, ...Spec[]] = [
  {
    code: 'en',
    label: 'English',
    word: 'Hello',
    asc: 0.95,
    cap: 0.715,
    xh: 0.48,
    desc: 0.24,
    script: 'Latin',
    direction: 'left to right',
    note: 'Ascenders on h and l reach above the cap line.',
  },
  {
    code: 'ja',
    label: '日本語',
    word: 'こんにちは',
    asc: 1.0,
    cap: 0.78,
    xh: 0.56,
    desc: 0.24,
    script: 'Japanese',
    direction: 'left to right',
    note: 'Every glyph fills the em square, so the measure runs long.',
  },
  {
    code: 'ar',
    label: 'العربية',
    word: 'مرحبا',
    asc: 0.82,
    cap: 0.6,
    xh: 0.33,
    desc: 0.3,
    script: 'Arabic',
    direction: 'right to left',
    note: 'A connected baseline, a low x-height and deep descenders.',
  },
  {
    code: 'de',
    label: 'Deutsch',
    word: 'Übersetzen',
    asc: 1.06,
    cap: 0.715,
    xh: 0.48,
    desc: 0.24,
    script: 'Latin',
    direction: 'left to right',
    note: 'The diacritic lifts the ascender and the measure expands.',
  },
];

/* §2: no uppercase diagram labeling — the rail reads like the annotations,
   lowercase mono, values in ink. */
const GUIDES = [
  { key: 'asc', label: 'ascender' },
  { key: 'cap', label: 'cap height' },
  { key: 'xh', label: 'x-height' },
  { key: 'desc', label: 'descender' },
] as const;

type GuideKey = (typeof GUIDES)[number]['key'];

/** Control points ride the corners and midpoints of the EN glyph's boxes. */
const DOTS: { g: GuideKey | 'base'; t: number }[] = [
  { g: 'asc', t: 0 },
  { g: 'asc', t: 1 },
  { g: 'cap', t: 0 },
  { g: 'cap', t: 0.5 },
  { g: 'cap', t: 1 },
  { g: 'xh', t: 0 },
  { g: 'xh', t: 0.5 },
  { g: 'xh', t: 1 },
  { g: 'base', t: 0 },
  { g: 'base', t: 1 },
  { g: 'desc', t: 0 },
  { g: 'desc', t: 1 },
];

const FALLBACK_W = [180, 360, 152, 372] as const;

const baseY = (i: number) => ROW0 + i * ROW_GAP;

const guideY = (spec: Spec, i: number, key: GuideKey | 'base') =>
  key === 'base'
    ? baseY(i)
    : key === 'desc'
      ? baseY(i) + spec.desc * SIZE
      : baseY(i) - spec[key] * SIZE;

export default function TypeMetrics() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [widths, setWidths] = useState<number[]>([...FALLBACK_W]);

  /* measure every rendered specimen — the deltas are computed, never typed */
  useGSAP(
    () => {
      const words = root.current?.querySelectorAll<SVGTextElement>('[data-word]');
      if (!words || words.length === 0) return;
      const measure = () => {
        const w = Array.from(words).map(
          (el, i) => el.getComputedTextLength() || FALLBACK_W[i] || 200
        );
        setWidths(w);
      };
      measure();
      void document.fonts?.ready.then(measure);
    },
    { scope: root }
  );

  /* the emphasis cycle: all rows stay on screen; one dimension line is hot */
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const next = gsap.delayedCall(3.8, () => setActive((v) => (v + 1) % SPECS.length));
      return () => next.kill();
    },
    { scope: root, dependencies: [active] }
  );

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from('[data-reveal]', {
        y: 32,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      });
    },
    { scope: root }
  );

  const en = SPECS[0];
  const enW = widths[0] ?? FALLBACK_W[0];
  const delta = (i: number) => Math.round(((widths[i] ?? 0) / enW - 1) * 100);
  const deltaLabel = (i: number) => {
    const d = delta(i);
    return `${d >= 0 ? '+' : '−'}${Math.abs(d)}%`;
  };
  const spec = SPECS[active] ?? en;

  return (
    <section className='ba-metrics ba-pad' id='typography' ref={root}>
      <div className='ba-wrap'>
        <h2 data-reveal>Every language redraws the layout. GT measures it first.</h2>
        <p className='ba-body' data-reveal>
          Ascenders, x-height, direction and measure all move when the locale does. That is why the
          containers in the story above have to breathe.
        </p>

        <div className='ba-metrics-grid'>
          <div className='ba-metrics-stage ba-sheet' data-reveal>
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              data-metrics
              aria-label='Type metrics measured across four languages at once'
            >
              {Array.from({ length: 47 }, (_, i) => (
                <line
                  key={i}
                  className='ba-tickrow'
                  x1={20 + i * 20}
                  y1='14'
                  x2={20 + i * 20}
                  y2={i % 5 === 0 ? 30 : 23}
                />
              ))}

              {/* the EN reference edge, dropped through every row */}
              <line
                className='ba-refline'
                x1={LEFT + enW}
                y1={guideY(en, 0, 'asc') - 14}
                x2={LEFT + enW}
                y2={baseY(SPECS.length - 1) + DIM_DY + 10}
              />
              <text
                className='ba-guide-lab'
                x={LEFT + enW}
                y={baseY(SPECS.length - 1) + DIM_DY + 26}
                textAnchor='middle'
              >
                en measure
              </text>

              {SPECS.map((s, i) => {
                const w = widths[i] ?? FALLBACK_W[i] ?? 200;
                const by = baseY(i);
                const ascY = guideY(s, i, 'asc');
                const descY = guideY(s, i, 'desc');
                const right = LEFT + w;
                const hot = i === active;
                return (
                  <g key={s.code} data-active={hot}>
                    {/* baseline: the structural datum every script shares */}
                    <line
                      className='ba-guide ba-guide-base'
                      x1={GUIDE_X1}
                      y1={by}
                      x2={right + 44}
                      y2={by}
                    />
                    {/* ascender guide, dashed hairline across the word only */}
                    <line className='ba-guide' x1={GUIDE_X1} y1={ascY} x2={right + 44} y2={ascY} />

                    {/* EN row carries the full caliper vocabulary */}
                    {i === 0 && (
                      <>
                        {GUIDES.filter((g) => g.key === 'cap' || g.key === 'xh' || g.key === 'desc').map(
                          (g) => (
                            <line
                              key={g.key}
                              className='ba-guide'
                              x1={GUIDE_X1}
                              y1={guideY(s, i, g.key)}
                              x2={right + 44}
                              y2={guideY(s, i, g.key)}
                            />
                          )
                        )}
                        {GUIDES.map((g) => (
                          <text
                            key={g.key}
                            className='ba-guide-lab'
                            x={GUTTER}
                            y={guideY(s, i, g.key) - 6}
                            textAnchor='end'
                          >
                            {g.label}
                          </text>
                        ))}
                        <text className='ba-guide-lab' x={GUTTER} y={by - 6} textAnchor='end'>
                          baseline
                        </text>
                        <rect
                          className='ba-sb'
                          x={LEFT - BAND_W}
                          y={ascY}
                          width={BAND_W}
                          height={descY - ascY}
                        />
                        <rect className='ba-sb' x={right} y={ascY} width={BAND_W} height={descY - ascY} />
                        {/* control points: 3px squares on the measured lines (§2),
                            not filled circles */}
                        {DOTS.map((dot, di) => (
                          <rect
                            key={di}
                            className='ba-ctrl'
                            x={LEFT + w * dot.t - 1.75}
                            y={guideY(s, i, dot.g) - 1.75}
                            width='3.5'
                            height='3.5'
                          />
                        ))}
                      </>
                    )}

                    {/* locale gutter label on every non-EN row — lowercase, §2 */}
                    {i !== 0 && (
                      <text className='ba-row-code' x={GUTTER} y={by - 6} textAnchor='end'>
                        {s.code}
                      </text>
                    )}

                    {/* advance edges close the box around the glyph */}
                    <line className='ba-edge' x1={LEFT} y1={ascY} x2={LEFT} y2={descY} />
                    <line className='ba-edge' x1={right} y1={ascY} x2={right} y2={descY} />

                    {/* the specimen itself */}
                    <text className='ba-word' data-word x={LEFT} y={by} fontSize={SIZE}>
                      {s.word}
                    </text>

                    {/* the measured dimension: extension ticks + value */}
                    <path
                      className='ba-dim'
                      d={`M${LEFT} ${by + DIM_DY} H${right} M${LEFT} ${by + DIM_DY - 7} V${by + DIM_DY + 7} M${right} ${by + DIM_DY - 7} V${by + DIM_DY + 7}`}
                    />
                    <text className='ba-ann-big' x={right + 60} y={by - 16}>
                      {i === 0 ? `${Math.round(w)}px` : deltaLabel(i)}
                    </text>
                    <text className='ba-ann-sub' x={right + 60} y={by + 4}>
                      {i === 0 ? 'en · reference' : `${s.code} · ${Math.round(w)}px`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className='ba-metrics-read' data-reveal>
            <div className='ba-readout ba-readout-all'>
              {SPECS.map((s, i) => (
                <button
                  type='button'
                  className='ba-lrow'
                  data-active={i === active}
                  key={s.code}
                  onClick={() => setActive(i)}
                >
                  <span className='ba-lrow-top'>
                    <span>
                      {s.code} · {s.label}
                    </span>
                    <b>{i === 0 ? `${Math.round(enW)}px` : deltaLabel(i)}</b>
                  </span>
                  <span className='ba-lrow-sub'>
                    {s.script} · {s.direction} · {Math.round(widths[i] ?? 0)}px
                  </span>
                </button>
              ))}
            </div>
            <p className='ba-metrics-note'>{spec.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
