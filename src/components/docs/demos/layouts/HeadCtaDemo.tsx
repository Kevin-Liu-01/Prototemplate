'use client';

import { BookOpenIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import { ArrowRight, Copy as CopyGlyph } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range, Toggle } from '../controls';
import Plate from '../Plate';
import { landingMetrics, px } from './landing';
import ScaledModel from './ScaledModel';

import './rails.css';

type Part = 'head' | 'cta';
type HeadCopy = 'global' | 'context' | 'locadex';

/* the production heads, word for word, with their authored breaks; @ is the inline GT mark (GtLogoText) */
const HEADS: Record<HeadCopy, { first: string; second?: string; lead: string; mark: 'globe' | 'book' | 'locadex' }> = {
  global: {
    first: 'Reach users in every market',
    lead: 'Grow your product around the world and reach your next billion users',
    mark: 'globe',
  },
  context: {
    first: 'One source of context,',
    second: 'shared everywhere',
    lead: '@ understands your codebase and your product, so every translation carries context',
    mark: 'book',
  },
  locadex: {
    first: 'The easiest way to localize',
    second: 'your full product suite',
    lead: 'Connect agents and integrate any content source or tool with @',
    mark: 'locadex',
  },
};

type Reading = { h2: number; lead: number; overflow: boolean; buttons: number[] };

/**
 * The section head and the hero's Cta row of the production landing, set
 * in real type at the width the slider gives. The head is a heading and
 * one lead in a ruled box; the row is the shared button's two faces. The
 * plate reads the heading's lines and the buttons' widths off the model,
 * so the two-line limit and the row's equal columns are checked live.
 */
export default function HeadCtaDemo() {
  const [part, setPart] = useState<Part>('head');
  const [width, setWidth] = useState(1440);
  const [copy, setCopy] = useState<HeadCopy>('locadex');
  const [lead, setLead] = useState(true);
  const [mark, setMark] = useState(true);
  const [ring, setRing] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState<Reading>({ h2: 0, lead: 0, overflow: false, buttons: [] });

  const m = landingMetrics(width, '1104');
  const head = HEADS[copy];
  const btnType = m.phone ? 15 : 13.5;

  useLayoutWork(
    () => {
      const el = root.current;
      if (!el) return;
      const read = () => {
        const h2 = el.querySelector<HTMLElement>('.dmo-lay-h2');
        const p = el.querySelector<HTMLElement>('.dmo-lay-lead');
        const buttons = [...el.querySelectorAll<HTMLElement>('.dmo-lay-face')].map((b) => Math.round(b.offsetWidth));
        setReading({
          h2: h2 ? Math.round(h2.offsetHeight / (m.h2 * m.h2Lh)) : 0,
          lead: p ? Math.round(p.offsetHeight / (m.lead * m.leadLh)) : 0,
          overflow: h2 ? h2.scrollWidth > h2.clientWidth + 1 : false,
          buttons,
        });
      };
      read();
      void document.fonts?.ready.then(read);
    },
    { dependencies: [part, width, copy, lead, mark, ring], revertOnUpdate: true }
  );

  const vars = {
    '--lay-col': `${m.column}px`,
    '--m-gut': `${m.gut}px`,
    '--m-head-top': `${m.headTop}px`,
    '--m-head-bottom': `${m.headBottom}px`,
    '--m-h2': `${m.h2}px`,
    '--m-h2-lh': m.h2Lh,
    '--m-h2-track': '-0.028em',
    '--m-lead': `${m.lead}px`,
    '--m-lead-lh': m.leadLh,
    '--m-lead-gap': `${m.leadGap}px`,
    '--m-btn': `${m.btn}px`,
    '--m-btn-type': `${btnType}px`,
    '--m-btn-track': '-0.005em',
  } as CSSProperties;

  const lines = reading.h2;
  const status =
    part === 'head'
      ? `Heading on ${lines} ${lines === 1 ? 'line' : 'lines'} at ${px(m.h2)}${
          lead ? `, lead on ${reading.lead} ${reading.lead === 1 ? 'line' : 'lines'} at ${m.lead}px` : ''
        }. ${reading.overflow ? 'The heading runs past the column.' : lines > 2 ? 'Over the two-line limit.' : 'Within the two-line limit.'}`
      : `Buttons ${m.btn}px tall, ${reading.buttons.map((w) => `${w}px`).join(' and ')} wide${
          m.btnFill ? ', filling the column up to 440px' : ', in two equal columns'
        }.`;

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Part'
            options={[
              { value: 'head', label: 'Head' },
              { value: 'cta', label: 'Cta Row' },
            ]}
            value={part}
            onChange={setPart}
          />
          <Range format={(v) => `${v}px`} label='Width' max={1440} min={390} step={2} value={width} onChange={setWidth} />
          {part === 'head' ? (
            <>
              <Choice
                label='Copy'
                options={[
                  { value: 'global', label: 'Global' },
                  { value: 'context', label: 'Context' },
                  { value: 'locadex', label: 'Locadex' },
                ]}
                value={copy}
                onChange={setCopy}
              />
              <Toggle label='Lead' pressed={lead} onChange={setLead} />
              <Toggle label='Mark' pressed={mark} onChange={setMark} />
            </>
          ) : (
            <Toggle label='Ring' pressed={ring} onChange={setRing} />
          )}
          <p aria-live='polite' className='dmo-bar-status'>
            {status}
          </p>
        </>
      }
      fit
      label={`The production ${part === 'head' ? 'section head' : 'hero Cta row'} at ${width}px. ${status}`}
      stageClassName='dmo-lay-stage'
      tag={part === 'head' ? '.tc-head' : '<Cta ring />'}
    >
      <ScaledModel className='dmo-lay-page dmo-lay-hc' fitContent height={part === 'head' ? 220 : 120} maxHeight={420} style={vars} width={width}>
        <div className={m.lines ? 'dmo-lay-rail has-lines' : 'dmo-lay-rail'} ref={root}>
          {part === 'head' ? (
            <div className='dmo-lay-head'>
              {mark && !m.phone ? (
                head.mark === 'globe' ? (
                  <GlobeAltIcon className='dmo-lay-head-mark' />
                ) : head.mark === 'book' ? (
                  <BookOpenIcon className='dmo-lay-head-mark' />
                ) : (
                  <i className='dmo-lay-head-mark is-locadex' />
                )
              ) : null}
              <p className={m.h2Nowrap ? 'dmo-lay-h2 is-nowrap' : 'dmo-lay-h2'}>
                {head.first}
                {head.second ? (
                  <>
                    {' '}
                    {m.phone ? null : <br />}
                    {head.second}
                  </>
                ) : null}
              </p>
              {lead ? (
                <p className='dmo-lay-lead'>
                  {head.lead.split('@').map((run, i) => (
                    <Fragment key={i}>
                      {i > 0 ? <i className='dmo-lay-gtword' /> : null}
                      {run}
                    </Fragment>
                  ))}
                </p>
              ) : null}
            </div>
          ) : (
            <div className='dmo-lay-hero'>
              <div className={m.btnFill ? 'dmo-lay-acts is-fill' : 'dmo-lay-acts'}>
                <span className={ring ? 'dmo-lay-ring is-on' : 'dmo-lay-ring'}>
                  <span className='dmo-lay-face is-solid'>
                    Get Started
                    <ArrowRight aria-hidden size={15} strokeWidth={2} />
                  </span>
                </span>
                <span className='dmo-lay-face is-copy'>
                  Setup for Agents
                  <CopyGlyph aria-hidden size={15} strokeWidth={1.75} />
                </span>
              </div>
            </div>
          )}
        </div>
      </ScaledModel>
    </Plate>
  );
}
