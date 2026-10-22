'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { BentoCell, BentoRow } from '@/components/shell/Bento';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range } from '../controls';
import Plate from '../Plate';
import { auditGrid } from './audit';
import type { Audit, Mark } from './audit';

import './grids.css';

type Method = 'ground' | 'rules' | 'borders' | 'frames';
type Click = 'wide' | 'tall';
type Span = { c: number; r: number };

/* each method in the shape it was written for: a bento with a wide and a tall cell on BentoRow's 1px gap,
   the toolchain row as one line of cells, FeatureBento's eight cells at four columns, and cards apart */
const START_SPANS: Record<number, Span> = { 0: { c: 2, r: 1 }, 4: { c: 1, r: 2 } };
const PRESET: Record<Method, { cols: number; count: number; gap: number; spans: Record<number, Span> }> = {
  ground: { cols: 3, count: 7, gap: 1, spans: START_SPANS },
  rules: { cols: 3, count: 3, gap: 0, spans: {} },
  borders: { cols: 4, count: 8, gap: 0, spans: {} },
  frames: { cols: 3, count: 6, gap: 16, spans: {} },
};

const TAG: Record<Method, (cols: number) => string> = {
  ground: (cols) => `<BentoRow cols='repeat(${cols}, minmax(0, 1fr))' />`,
  rules: () => `.tc-row > * + * { border-left }`,
  borders: (cols) => `.gtb-grid[data-columns='${cols}']`,
  frames: () => `.cell { border: 1px }`,
};

/* BentoRow and shell.css stack the row below the lg breakpoint, on the viewport */
const STACK_QUERY = '(max-width: 1023px)';

function subscribeStack(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia(STACK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readStack(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(STACK_QUERY).matches);
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function describe(audit: Audit, method: Method, gap: number): string {
  const count = (kind: Mark['kind']) => audit.marks.filter((m) => m.kind === kind).length;
  const parts = [
    count('doubled') ? plural(count('doubled'), 'doubled line', 'doubled lines') : '',
    count('coincident') ? plural(count('coincident'), 'coincident pair', 'coincident pairs') : '',
    count('missing') ? plural(count('missing'), 'missing seam', 'missing seams') : '',
    count('bar') ? plural(count('bar'), 'seam wider than 1px', 'seams wider than 1px') : '',
    count('void') ? 'ground showing as a block' : '',
  ].filter(Boolean);
  if (parts.length) return `${parts.join(', ')}.`;
  if (method === 'frames' && gap > 4) return `${plural(audit.seams, 'neighbor', 'neighbors')}, each a separate card ${gap}px from the next.`;
  return `${plural(audit.seams, 'seam', 'seams')}, each drawn once.`;
}

/**
 * Four ways a grid draws its hairlines, on the same cells. Row ground is
 * the shell's BentoRow, mounted live: a 1px gap over the hairline ground,
 * so the row owns every seam. Row rules is the toolchain's .tc-row, Cell
 * borders is FeatureBento's rule set, and Cell frames gives every cell its
 * own box. The plate audits itself as the line auditor audits a page, and
 * marks each fault in the accent.
 */
export default function GridSeamsDemo() {
  const stacked = useSyncExternalStore(subscribeStack, readStack, () => false);
  const root = useRef<HTMLDivElement>(null);
  const [method, setMethod] = useState<Method>('ground');
  const [cols, setCols] = useState(PRESET.ground.cols);
  const [count, setCount] = useState(PRESET.ground.count);
  const [gap, setGap] = useState(PRESET.ground.gap);
  const [click, setClick] = useState<Click>('wide');
  const [spans, setSpans] = useState<Record<number, Span>>(PRESET.ground.spans);
  const [audit, setAudit] = useState<Audit>({ seams: 0, marks: [] });
  const [size, setSize] = useState({ w: 0, h: 0 });

  /* BentoRow keeps one column below 1024px of viewport, so its spans fold with it */
  const effective = method === 'ground' && stacked ? 1 : cols;
  const spanKey = JSON.stringify(spans);

  useLayoutWork(
    () => {
      const el = root.current;
      const grid = el?.querySelector<HTMLElement>('.dmo-lay-gs-grid');
      if (!el || !grid) return;
      const run = () => {
        const cells = [...grid.children];
        const owners = [
          { el, owner: 'frame' },
          ...(method === 'borders' ? [{ el: grid, owner: 'grid' }] : []),
          ...cells.map((cell, i) => ({ el: cell, owner: `cell-${i}` })),
        ];
        setAudit(auditGrid(el, owners, cells, grid, method === 'ground'));
        setSize({ w: el.offsetWidth, h: el.offsetHeight });
      };
      run();
      const observer = new ResizeObserver(run);
      observer.observe(el);
      return () => observer.disconnect();
    },
    { dependencies: [method, cols, count, gap, spanKey, effective], revertOnUpdate: true }
  );

  /* a method opens in its own shape, so the reader sees it hold before changing it */
  const pick = (next: Method) => {
    const preset = PRESET[next];
    setMethod(next);
    setCols(preset.cols);
    setCount(preset.count);
    setGap(preset.gap);
    setSpans(preset.spans);
  };

  const bump = (i: number) =>
    setSpans((cur) => {
      const span = cur[i] ?? { c: 1, r: 1 };
      const next =
        click === 'wide' ? { ...span, c: span.c >= effective ? 1 : span.c + 1 } : { ...span, r: span.r >= 3 ? 1 : span.r + 1 };
      return { ...cur, [i]: next };
    });

  const cellStyle = (i: number): CSSProperties => {
    const span = spans[i] ?? { c: 1, r: 1 };
    return { gridColumn: `span ${Math.min(span.c, effective)}`, gridRow: `span ${span.r}` };
  };

  const content = (i: number): ReactNode => {
    const span = spans[i] ?? { c: 1, r: 1 };
    const c = Math.min(span.c, effective);
    return (
      <button
        aria-label={`Cell ${i + 1}, ${c} by ${span.r}. ${click === 'wide' ? 'Widen it' : 'Make it taller'}`}
        className='dmo-lay-gs-hit'
        type='button'
        onClick={() => bump(i)}
      >
        <span className='dmo-lay-gs-n'>{String(i + 1).padStart(2, '0')}</span>
        <span className='dmo-lay-gs-span'>{`${c} × ${span.r}`}</span>
      </button>
    );
  };

  const template = `repeat(${effective}, minmax(0, 1fr))`;
  const indices = Array.from({ length: count }, (_, i) => i);
  const vars = { '--gs-gap': `${gap}px` } as CSSProperties;
  const status = `${describe(audit, method, gap)}${method === 'ground' && stacked ? ' BentoRow stacks its cells below 1024px of viewport.' : ''}`;

  let grid: ReactNode;
  if (method === 'ground') {
    grid = (
      <BentoRow className='dmo-lay-gs-grid is-ground' cols={template} eqHeads={false}>
        {indices.map((i) => (
          <BentoCell cell='dmo-lay-gs-cell' framed={false} key={i} style={cellStyle(i)}>
            {content(i)}
          </BentoCell>
        ))}
      </BentoRow>
    );
  } else {
    grid = (
      <div
        className={`dmo-lay-gs-grid is-${method}`}
        data-columns={method === 'borders' ? cols : undefined}
        style={{ gridTemplateColumns: template }}
      >
        {indices.map((i) => (
          <div className='dmo-lay-gs-cell' key={i} style={cellStyle(i)}>
            {content(i)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Seams'
            options={[
              { value: 'ground', label: 'Row Ground' },
              { value: 'rules', label: 'Row Rules' },
              { value: 'borders', label: 'Cell Borders' },
              { value: 'frames', label: 'Cell Frames' },
            ]}
            value={method}
            onChange={pick}
          />
          <Range label='Columns' max={6} min={1} step={1} value={cols} onChange={setCols} />
          <Range label='Cells' max={12} min={2} step={1} value={count} onChange={setCount} />
          <Range format={(v) => `${v}px`} label='Gap' max={24} min={0} step={1} value={gap} onChange={setGap} />
          <Choice
            label='A click makes a cell'
            options={[
              { value: 'wide', label: 'Wider' },
              { value: 'tall', label: 'Taller' },
            ]}
            value={click}
            onChange={setClick}
          />
          <p aria-live='polite' className='dmo-bar-status'>
            {status}
          </p>
        </>
      }
      fit
      label={`A grid of ${count} cells in ${effective} columns, its seams drawn by ${method}. ${status}`}
      stageClassName='dmo-lay-stage'
      tag={TAG[method](cols)}
    >
      <div className={`dmo-lay-gs-frame is-${method}`} ref={root} style={vars}>
        {grid}
        <svg aria-hidden='true' className='dmo-lay-gs-marks' height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} width={size.w}>
          {audit.marks.map((mark, k) => {
            if (mark.kind === 'void') {
              return <rect className='dmo-lay-gs-void' height={mark.h} key={k} width={mark.w} x={mark.x} y={mark.y} />;
            }
            const t = mark.kind === 'bar' ? mark.width + 4 : 3;
            const box =
              mark.orient === 'h'
                ? { x: mark.from, y: mark.pos - t / 2, width: mark.to - mark.from, height: t }
                : { x: mark.pos - t / 2, y: mark.from, width: t, height: mark.to - mark.from };
            return <rect className={`dmo-lay-gs-mark is-${mark.kind}`} key={k} {...box} />;
          })}
        </svg>
      </div>
    </Plate>
  );
}
