import type { CSSProperties } from 'react';

import './diagrams.css';

export type SignalPathDiagramProps = {
  className?: string;
  /** Weight of the wires and node outlines. Default 1.4. */
  strokeWidth?: number;
  /** Weight of the travelling pulse. Default 2.8. */
  pulseStrokeWidth?: number;
  /** Uniform scale of the drawing about the centre of its frame. Default 1. */
  scale?: number;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const VIEW_W = 920;
const VIEW_Y = 30;
const VIEW_H = 116;

/**
 * The Locadex signal path: push → scan → edit → translate → open pr.
 *
 * The wires self-draw (`[data-pwire]`), a bright pulse rides them
 * (`[data-ppulse]`), and each stage lights on cue via `[data-pn]`.
 */
export default function SignalPathDiagram({
  className,
  strokeWidth = 1.4,
  pulseStrokeWidth = 2.8,
  scale = 1,
}: SignalPathDiagramProps) {
  const style: StyleVars = {
    '--gtd-stroke': strokeWidth,
    '--gtd-pulse-stroke': pulseStrokeWidth,
  };

  const body = (
    <>
      {/* the wires are the two threads — a doubled pair at constant gauge */}
      <path
        className='gtd-pwire'
        data-pwire
        d='M74 80 H250 M314 80 H428 M492 80 H606 M670 80 H846'
      />
      <path
        className='gtd-pwire'
        data-pwire
        d='M74 84 H250 M314 84 H428 M492 84 H606 M670 84 H846'
      />
      <path
        className='gtd-ppulse'
        data-ppulse
        d='M74 82 H250 M314 82 H428 M492 82 H606 M670 82 H846'
      />

      <circle className='gtd-pnode' data-pn='0' cx='52' cy='82' r='22' />
      <rect className='gtd-pnode' data-pn='1' x='250' y='60' width='64' height='44' rx='7' />
      <rect className='gtd-pnode' data-pn='2' x='428' y='60' width='64' height='44' rx='7' />
      <rect className='gtd-pnode' data-pn='3' x='606' y='60' width='64' height='44' rx='7' />
      <circle className='gtd-pnode' data-pn='4' cx='868' cy='82' r='22' />

      <path className='gtd-pglyph' d='M52 91 V74 M52 74 l-5 6 M52 74 l5 6' />
      <path className='gtd-pglyph' d='M262 73 H302 M262 82 H294 M262 91 H302' />
      <text className='gtd-pg' x='460' y='86' textAnchor='middle'>
        + −
      </text>
      <text className='gtd-pg' x='638' y='86' textAnchor='middle'>
        文A
      </text>
      <text className='gtd-pg' x='868' y='86' textAnchor='middle'>
        ⎇
      </text>

      <text className='gtd-plab' data-pn='0' x='52' y='128' textAnchor='middle'>
        push
      </text>
      <text className='gtd-plab' data-pn='1' x='282' y='128' textAnchor='middle'>
        scan
      </text>
      <text className='gtd-plab' data-pn='2' x='460' y='128' textAnchor='middle'>
        edit
      </text>
      <text className='gtd-plab' data-pn='3' x='638' y='128' textAnchor='middle'>
        translate
      </text>
      <text className='gtd-plab' data-pn='4' x='868' y='128' textAnchor='middle'>
        open pr
      </text>
    </>
  );

  return (
    <svg
      className={className ? `gtd gtd-signal ${className}` : 'gtd gtd-signal'}
      viewBox={`0 ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
      style={style}
      aria-hidden
    >
      {scale === 1 ? (
        body
      ) : (
        <g
          transform={`translate(${VIEW_W / 2} ${VIEW_Y + VIEW_H / 2}) scale(${scale}) translate(${-VIEW_W / 2} ${-(VIEW_Y + VIEW_H / 2)})`}
        >
          {body}
        </g>
      )}
    </svg>
  );
}
