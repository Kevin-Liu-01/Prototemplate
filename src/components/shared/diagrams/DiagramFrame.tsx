import type { CSSProperties, ReactNode } from 'react';

import './diagrams.css';

/**
 * Shared contract for every line-art technical diagram.
 *
 * The drawings are the crown jewels of the set, so the geometry is fixed: each
 * diagram is authored inside the same 200×74 drafting frame. What a direction
 * may change is the ink (CSS custom properties), the stroke weights, and the
 * scale of the drawing inside its frame.
 */
export type DiagramProps = {
  className?: string;
  /** Weight of the base (quiet) strokes. Default 1.4. */
  strokeWidth?: number;
  /** Weight of the accent (bright) strokes. Default 1.6. */
  accentStrokeWidth?: number;
  /** Uniform scale of the drawing about the centre of its frame. Default 1. */
  scale?: number;
  /** Accessible name. Omitted diagrams are decorative and hidden. */
  title?: string;
};

/** CSS custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const VIEW_W = 200;
const VIEW_H = 74;

/**
 * The drafting frame every diagram is drawn inside. Owns the viewBox, the
 * stroke-weight variables and the scale transform so each drawing file is
 * nothing but its own geometry.
 */
export default function DiagramFrame({
  className,
  strokeWidth = 1.4,
  accentStrokeWidth = 1.6,
  scale = 1,
  title,
  children,
}: DiagramProps & { children: ReactNode }) {
  const style: StyleVars = {
    '--gtd-stroke': strokeWidth,
    '--gtd-accent-stroke': accentStrokeWidth,
  };

  const body =
    scale === 1 ? (
      children
    ) : (
      <g transform={`translate(${VIEW_W / 2} ${VIEW_H / 2}) scale(${scale}) translate(${-VIEW_W / 2} ${-VIEW_H / 2})`}>
        {children}
      </g>
    );

  return (
    <svg
      className={className ? `gtd ${className}` : 'gtd'}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {body}
    </svg>
  );
}
