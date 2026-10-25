'use client';

import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { Icon } from '@/components/viewer/icons';
import { pad2 } from '@/lib/shell-data';

import { Action, Choice, Range, Toggle } from '../controls';
import Plate from '../Plate';
import { landingMetrics, px } from './landing';
import type { LandingMetrics, RailId } from './landing';
import ScaledModel from './ScaledModel';
import type { ModelFit } from './ScaledModel';
import { BAND_FIG, CELL_FIG, HERO_GAP, PART_NAMES, headLines, layoutParts, seamNote } from './skeleton';
import type { Owners, Part, PartBox, PartKind } from './skeleton';

import './rails.css';

const START: readonly PartKind[] = ['hero', 'hatch', 'section', 'band', 'hatch', 'section'];
const MAX_PARTS = 10;
const ADDS: readonly PartKind[] = ['section', 'hatch', 'band', 'hero'];

/** One line of skeleton type: a box one line tall with a bar at the glyphs' height. */
function Line({ size, lh, width, strong = false }: { size: number; lh: number; width: string; strong?: boolean }) {
  const style: CSSProperties = { '--ln-size': `${size}px`, '--ln-lh': lh, '--ln-w': width };
  return (
    <span className={strong ? 'dmo-lay-ln is-strong' : 'dmo-lay-ln'} style={style}>
      <i />
    </span>
  );
}

function Head({ m, center = false }: { m: LandingMetrics; center?: boolean }) {
  const lines = headLines(m);
  return (
    <div className={center ? 'dmo-lay-copy is-center' : 'dmo-lay-copy'}>
      <Line lh={m.h2Lh} size={m.h2} strong width={lines.h2 === 1 ? 'min(100%, 14em)' : 'min(100%, 9em)'} />
      {lines.h2 === 2 ? <Line lh={m.h2Lh} size={m.h2} strong width='min(100%, 7em)' /> : null}
      <span className='dmo-lay-gap' style={{ height: m.leadGap }} />
      <Line lh={m.leadLh} size={m.lead} width={lines.lead === 1 ? 'min(100%, 30em)' : 'min(100%, 19em)'} />
      {lines.lead === 2 ? <Line lh={m.leadLh} size={m.lead} width='min(100%, 13em)' /> : null}
    </div>
  );
}

function Cell({ m }: { m: LandingMetrics }) {
  return (
    <div className='dmo-lay-cell'>
      <div className='dmo-lay-pad' style={{ padding: `${m.cellTop}px ${m.gut}px ${m.cellBottom}px` }}>
        <div className='dmo-lay-copy'>
          <Line lh={1.06} size={17.6} strong width='min(100%, 9em)' />
          <span className='dmo-lay-gap' style={{ height: 11 }} />
          <Line lh={1.62} size={14} width='min(100%, 26em)' />
          <Line lh={1.62} size={14} width='min(100%, 18em)' />
          <span className='dmo-lay-gap' style={{ height: 24 }} />
          <span className='dmo-lay-fig' style={{ height: CELL_FIG }} />
        </div>
      </div>
    </div>
  );
}

/** One part of the page at its computed height, with the rules its owners give it. */
function PartView({ box, m, measures }: { box: PartBox; m: LandingMetrics; measures: boolean }) {
  const cls = ['dmo-lay-part', `is-${box.kind}`, box.top ? 'has-top' : '', box.bottom ? 'has-bottom' : '', measures ? 'is-measured' : '']
    .filter(Boolean)
    .join(' ');
  const style: CSSProperties = { height: box.height };
  if (box.kind === 'hatch') return <div className={cls} style={style} />;
  if (box.kind === 'hero') {
    return (
      <div className={cls} style={style}>
        <div className='dmo-lay-pad' style={{ padding: `${m.heroTop}px ${m.gut}px ${m.heroBottom}px` }}>
          <div className='dmo-lay-copy is-center'>
            <Line lh={m.heroLh} size={m.heroH1} strong width='min(100%, 8em)' />
            <Line lh={m.heroLh} size={m.heroH1} strong width='min(100%, 10em)' />
            <span className='dmo-lay-gap' style={{ height: HERO_GAP }} />
            <Line lh={1.55} size={17} width='min(100%, 24em)' />
            <span className='dmo-lay-gap' style={{ height: m.ctaGap }} />
            <span className={m.btnFill ? 'dmo-lay-ctas is-fill' : 'dmo-lay-ctas'} style={{ height: m.btn }}>
              <span className='dmo-lay-btn is-solid' />
              <span className='dmo-lay-btn' />
            </span>
          </div>
        </div>
      </div>
    );
  }
  if (box.kind === 'band') {
    return (
      <div className={cls} style={style}>
        <div className={m.lines ? 'dmo-lay-band-in has-lines' : 'dmo-lay-band-in'}>
          <div className='dmo-lay-pad' style={{ padding: `${m.bandTop}px ${m.gut}px ${m.bandBottom}px` }}>
            <Head m={m} />
            <span className='dmo-lay-gap' style={{ height: 28 }} />
            <span className='dmo-lay-fig' style={{ height: BAND_FIG }} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={cls} style={style}>
      <div className='dmo-lay-pad' style={{ padding: `${m.headTop}px ${m.gut}px ${m.headBottom}px` }}>
        <Head m={m} />
      </div>
      <div className={m.stacked ? 'dmo-lay-row is-stacked' : 'dmo-lay-row'}>
        <Cell m={m} />
        <Cell m={m} />
      </div>
    </div>
  );
}

/** Groups the parts as the page nests them: runs inside the rail, and each band on its own outside it. */
function groups(boxes: readonly PartBox[]): PartBox[][] {
  const out: PartBox[][] = [];
  for (const box of boxes) {
    const last = out[out.length - 1];
    if (box.kind !== 'band' && last && last[0]?.kind !== 'band') last.push(box);
    else out.push([box]);
  }
  return out;
}

/**
 * The landing grammar as a page skeleton the reader composes. Each part
 * stands at the height the engine's numbers give it at the chosen width,
 * the rail and the band columns draw the page's one pair of lines, and
 * every seam is checked for its owner as the parts move. Text is drawn as
 * bars, so the skeleton reads at any scale.
 */
export default function PageSkeletonDemo() {
  const [width, setWidth] = useState(1440);
  const [rail, setRail] = useState<RailId>('1104');
  const [owners, setOwners] = useState<Owners>('one');
  const [measures, setMeasures] = useState(false);
  const nextId = useRef(START.length);
  const [parts, setParts] = useState<Part[]>(() => START.map((kind, id) => ({ id, kind })));

  const m = landingMetrics(width, rail);
  const boxes = layoutParts(parts, m, owners);
  const height = Math.max(1, boxes.reduce((sum, box) => sum + box.height, 0));
  const doubled = boxes.filter((box) => box.above === 'doubled').length;
  const missing = boxes.filter((box) => box.above === 'missing').length;
  const seams = boxes.filter((box) => box.above !== null).length;
  const crosses = rail === '1104' && m.lines;

  const move = (index: number, delta: number) =>
    setParts((cur) => {
      const next = [...cur];
      const [item] = next.splice(index, 1);
      if (!item) return cur;
      next.splice(Math.max(0, Math.min(next.length, index + delta)), 0, item);
      return next;
    });
  const remove = (index: number) => setParts((cur) => cur.filter((_, i) => i !== index));
  const add = (kind: PartKind) =>
    setParts((cur) => (cur.length >= MAX_PARTS ? cur : [...cur, { id: nextId.current++, kind }]));

  const status =
    doubled || missing
      ? `${doubled ? `${doubled} doubled ${doubled === 1 ? 'rule' : 'rules'}` : ''}${doubled && missing ? ' and ' : ''}${
          missing ? `${missing} missing ${missing === 1 ? 'rule' : 'rules'}` : ''
        } out of ${seams} seams.`
      : `${seams} ${seams === 1 ? 'seam' : 'seams'}, each drawn once.`;

  const overlay = ({ scale, left }: ModelFit) => {
    const colLeft = left + ((width - m.column) / 2) * scale;
    const colW = m.column * scale;
    return boxes
      .filter((box) => box.above === 'doubled' || box.above === 'missing')
      .map((box) => (
        <span
          className='dmo-lay-fault'
          key={box.id}
          style={{ left: colLeft, top: box.y * scale - 1, width: colW }}
        >
          <span className='dmo-lay-fault-chip'>{box.above === 'doubled' ? 'Doubled' : 'No rule'}</span>
        </span>
      ));
  };

  const vars: CSSProperties = {
    '--lay-col': `${m.column}px`,
    '--lay-gut': `${m.gut}px`,
  };

  return (
    <Plate
      controls={
        <>
          <Range format={(v) => `${v}px`} label='Width' max={1440} min={390} step={2} value={width} onChange={setWidth} />
          <Choice
            label='Rail'
            options={[
              { value: '1104', label: '1104' },
              { value: '1170', label: '1170' },
            ]}
            value={rail}
            onChange={setRail}
          />
          <Choice
            label='Rules'
            options={[
              { value: 'one', label: 'One Owner' },
              { value: 'each', label: 'Each Part' },
            ]}
            value={owners}
            onChange={setOwners}
          />
          <Toggle label='Measures' pressed={measures} onChange={setMeasures} />
          <ol className='dmo-lay-parts'>
            {boxes.map((box, i) => (
              <li className={box.above === 'doubled' || box.above === 'missing' ? 'is-fault' : undefined} key={box.id}>
                <span className='dmo-lay-parts-n'>{pad2(i + 1)}</span>
                <span className='dmo-lay-parts-name'>{PART_NAMES[box.kind]}</span>
                <span className='dmo-lay-parts-note'>{seamNote(box, boxes[i - 1])}</span>
                <span className='dmo-lay-parts-acts'>
                  <button
                    aria-label={`Move part ${i + 1} up`}
                    className='dmo-lay-ib is-up'
                    disabled={i === 0}
                    type='button'
                    onClick={() => move(i, -1)}
                  >
                    <Icon name='chevron-down' />
                  </button>
                  <button
                    aria-label={`Move part ${i + 1} down`}
                    className='dmo-lay-ib'
                    disabled={i === boxes.length - 1}
                    type='button'
                    onClick={() => move(i, 1)}
                  >
                    <Icon name='chevron-down' />
                  </button>
                  <button
                    aria-label={`Remove part ${i + 1}`}
                    className='dmo-lay-ib'
                    disabled={boxes.length <= 1}
                    type='button'
                    onClick={() => remove(i)}
                  >
                    <Icon name='close' />
                  </button>
                </span>
              </li>
            ))}
          </ol>
          <div className='dmo-lay-adds'>
            {ADDS.map((kind) => (
              <Action disabled={parts.length >= MAX_PARTS} key={kind} onClick={() => add(kind)}>
                {kind === 'hatch' ? 'Add Hatch' : kind === 'band' ? 'Add Band' : kind === 'hero' ? 'Add Hero' : 'Add Section'}
              </Action>
            ))}
          </div>
          <p aria-live='polite' className='dmo-bar-status'>
            {status}
          </p>
        </>
      }
      fit
      label={`A landing page skeleton at ${width}px on the ${rail}px rail: ${status}`}
      stageClassName='dmo-lay-stage'
      tag={`--tc-rail: ${rail}px`}
    >
      <div className='dmo-lay-scroll pt-scroll'>
        <ScaledModel className='dmo-lay-page' height={height} overlay={overlay} style={vars} width={width}>
          {groups(boxes).map((group) => {
            const first = group[0];
            if (!first) return null;
            if (first.kind === 'band') return <PartView box={first} key={first.id} m={m} measures={measures} />;
            return (
              <div className={m.lines ? 'dmo-lay-rail has-lines' : 'dmo-lay-rail'} key={first.id}>
                {group.map((box) => (
                  <PartView box={box} key={box.id} m={m} measures={measures} />
                ))}
              </div>
            );
          })}
          {crosses
            ? boxes
                .filter((box) => box.above !== null && box.above !== 'missing')
                .map((box) => (
                  <span className='dmo-lay-cross-row' key={box.id} style={{ top: box.y - 5 }}>
                    <i />
                    <i />
                  </span>
                ))
            : null}
        </ScaledModel>
      </div>
      <Readout m={m} rail={rail} />
    </Plate>
  );
}

/** The numbers the engine gives every band at this width, unscaled under the model. */
function Readout({ m, rail }: { m: LandingMetrics; rail: RailId }) {
  const lines = headLines(m);
  const rows: [string, string][] = [
    ['Column', `${m.column}px${m.lines ? ', both lines' : ', no lines'}`],
    ['Gutter', px(m.gut)],
    ['Head', `${px(m.headTop)} over, ${px(m.headBottom)} under`],
    ['Heading', `${px(m.h2)} on ${lines.h2} ${lines.h2 === 1 ? 'line' : 'lines'}`],
    ['Lead', `${m.lead}px, ${m.leadGap}px under the heading`],
    ['Hatch', px(m.hatch)],
    ['Buttons', `${m.btn}px${m.btnFill ? ', filling the column' : ''}`],
    ['Bento row', m.stacked ? 'one column' : 'two columns'],
    ['Cell', `${px(m.cellTop)} over, ${px(m.cellBottom)} under`],
    ['Band', `${px(m.bandTop)} over, ${px(m.bandBottom)} under`],
  ];
  return (
    <dl className='dmo-lay-readout' aria-label={`The ${rail}px family's numbers at this width`}>
      {rows.map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
