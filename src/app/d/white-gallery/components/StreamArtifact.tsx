import type { ReactNode } from 'react';

export type ArtifactKind = 'button' | 'field' | 'theo';

/**
 * One mirrored pair in the band.
 *
 * A pair is a single object seen twice: the English face sits at `-r` from the
 * gate, its translation at `+r`, on the same lane, at the same instant. Radius
 * is never authored in px — it is solved at runtime from the dial's radius and
 * the plate's half-width, so a pair can neither collide with the gate nor cross
 * an edge. A lane that cannot fit its pair is not drawn at all.
 */
export type StreamSpec = {
  kind: ArtifactKind;
  /** Which side of the band's horizontal axis the lane sits on. */
  above: boolean;
  /** 0 is the lane nearest the axis; lanes stack outward from there. Offsets
      are never authored in px — they are measured, so two cards of different
      heights can never land on top of each other. */
  stack: number;
  /** Seconds for one traverse from the gate to the rim. */
  dur: number;
  /** Phase offset so the three lanes never pulse in unison. */
  phase: number;
  opacity: number;
};

export const STREAM_SPECS: StreamSpec[] = [
  { kind: 'theo', above: true, stack: 1, dur: 15, phase: 0, opacity: 1 },
  { kind: 'field', above: true, stack: 0, dur: 15, phase: 5, opacity: 1 },
  { kind: 'button', above: false, stack: 0, dur: 15, phase: 10, opacity: 1 },
];

/* Trimmed to the line that lands. A pair has to clear the dial AND the frame,
   and a five-line card cannot do both above a 600pt plate. */
const THEO_EN =
  '“Internationalization went from "$%!# this" to "trivial".”';

const THEO_JA = '「国際化は「$%!# this」から「trivial」に変わった。」';

function Body({ kind, out }: { kind: ArtifactKind; out: boolean }): ReactNode {
  switch (kind) {
    case 'button':
      return <span className='wg-card-btn wg-refract'>{out ? '始める' : 'Get started'}</span>;
    case 'field':
      return (
        <span className='wg-card wg-field'>
          <label className='wg-refract'>{out ? 'Correo electrónico' : 'Email address'}</label>
          <span>{out ? 'tu@empresa.com' : 'you@company.com'}</span>
        </span>
      );
    case 'theo':
      return (
        <span className='wg-card wg-theo'>
          <span className='wg-theo-head'>
            <span className='wg-theo-av'>
              <i>T</i>
            </span>
            <span className='wg-theo-name'>
              Theo <span>CEO, T3Chat</span>
            </span>
          </span>
          <span className='wg-theo-q wg-refract'>{out ? THEO_JA : THEO_EN}</span>
        </span>
      );
  }
}

/**
 * One face of a mirrored pair. Placement is entirely GSAP's job — this owns the
 * markup only. The object carries no caption: the language it came out in is
 * the only thing worth reading, and the text says it.
 */
export default function StreamArtifact({
  kind,
  out,
  index,
}: {
  kind: ArtifactKind;
  out: boolean;
  index: number;
}) {
  return (
    <div className='wg-piece' data-piece={out ? 'tgt' : 'src'} data-index={index}>
      <div className='wg-piece-body'>
        <Body kind={kind} out={out} />
      </div>
    </div>
  );
}
