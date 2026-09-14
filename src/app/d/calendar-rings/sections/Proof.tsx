/**
 * calendar-rings: the third ring, the T component.
 *
 * A half disk. The source sits in the hub: a code window with the T
 * wrapper around the two strings of the shipped session. The next two
 * rings carry the session's outputs, one locale per cell, five cells over
 * the half turn; a flag chip sits at each cell's notch on the ring's outer
 * edge, breaking the rule where the ground shows through. Under 720px the
 * half disk unrolls into a list: the window, then the two rings as rows.
 */
import type { CSSProperties, ReactNode } from 'react';

import { PROOF_CODE, PROOF_ROWS } from '../data';
import { Chip } from './Chip';
import { SectionHead } from './SectionHead';

const U = 500;
/** Hub, ring boundary and rim as fractions of the half disk's radius. */
const HUB = 0.55;
const MID = 0.78;
const RIM = 1;
/** Text radii sit a little off the ring centers so a cell's text clears the chip of the ring inside it. */
const TEXT_R = [0.64, 0.905] as const;
const CHIP_R = [MID, RIM] as const;
const CELLS = 5;
/** The five cells span 160 of the half turn, leaving the ring uncut where it meets the base. */
const START = 170;
const SPAN = 160;
const STEP = SPAN / CELLS;

function polar(rf: number, deg: number): CSSProperties {
  const a = (deg * Math.PI) / 180;
  return {
    left: `${(50 + 50 * rf * Math.cos(a)).toFixed(2)}%`,
    top: `${(100 - 100 * rf * Math.sin(a)).toFixed(2)}%`,
  };
}

function svgPoint(rf: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  return `${(rf * U * Math.cos(a)).toFixed(2)} ${(-rf * U * Math.sin(a)).toFixed(2)}`;
}

function halfArc(rf: number): string {
  const r = rf * U;
  return `M${-r} 0A${r} ${r} 0 0 1 ${r} 0`;
}

/** The sample with its strings and its T brackets marked; strings carry the page's one syntax hue. */
function renderCode(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /'[^']*'|<\/?T>|>([^<\n]+)</g;
  let last = 0;
  let key = 0;
  for (const match of code.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) out.push(code.slice(last, index));
    const token = match[0];
    if (token.startsWith("'")) {
      out.push(
        <span key={key++} className='cr-tok-str'>
          {token}
        </span>
      );
    } else if (token === '<T>' || token === '</T>') {
      out.push(
        <span key={key++} className='cr-tok-t'>
          {token}
        </span>
      );
    } else {
      const inner = match[1] ?? '';
      out.push('>');
      out.push(
        <span key={key++} className='cr-tok-str'>
          {inner}
        </span>
      );
      out.push('<');
    }
    last = index + token.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function Proof() {
  const boundaries = Array.from({ length: CELLS + 1 }, (_, i) => START - STEP * i);
  const centers = Array.from({ length: CELLS }, (_, i) => START - STEP * (i + 0.5));

  return (
    <section className='cr-sec cr-proof' aria-labelledby='cr-proof-h'>
      <div className='cr-col'>
        <SectionHead
          n={3}
          id='cr-proof-h'
          title='The T component'
          lead='The source string stays in the code, inside T. The build writes one translation per configured locale and serves each one from the edge.'
        />
        <figure className='cr-proof-fig'>
          <svg className='cr-proof-svg' viewBox={`${-U} ${-U} ${U * 2} ${U}`} aria-hidden='true' focusable='false'>
            {/* the hub circle marks the source in the accent */}
            <path className='cr-proof-hub' d={halfArc(HUB)} />
            <path className='cr-proof-line' d={halfArc(MID)} />
            <path className='cr-proof-line' d={halfArc(RIM)} />
            <path className='cr-proof-line' d={`M${-U} 0H${U}`} />
            {boundaries.map((deg) => (
              <path key={deg} className='cr-proof-line' d={`M${svgPoint(HUB, deg)}L${svgPoint(RIM, deg)}`} />
            ))}
          </svg>

          <div className='cr-proof-source'>
            <div className='cr-win-bar'>
              <span className='cr-win-name'>app/page.tsx</span>
              <Chip code='en' source />
            </div>
            <pre className='cr-code'>
              <code>{renderCode(PROOF_CODE)}</code>
            </pre>
          </div>

          {PROOF_ROWS.map((row, ring) => (
            <ol key={row.source} className={`cr-proof-ring is-${ring + 1}`} aria-label={`Translations of ${row.source}`}>
              {/* the ring's source, shown only when the half disk unrolls into a list */}
              <li className='cr-proof-label'>
                <code lang='en'>{row.source}</code>
                <Chip code='en' source />
              </li>
              {row.outputs.map((output, i) => (
                <li key={output.loc} className='cr-proof-item'>
                  <p className='cr-proof-text' lang={output.loc} style={polar(TEXT_R[ring] ?? 0.7, centers[i] ?? 90)}>
                    {output.text}
                  </p>
                  <span className='cr-proof-chip' style={polar(CHIP_R[ring] ?? 1, centers[i] ?? 90)}>
                    <Chip code={output.loc} />
                  </span>
                </li>
              ))}
            </ol>
          ))}
          <figcaption className='cr-proof-cap'>
            Two strings in the source · five locales in the config · every output served from the edge
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
