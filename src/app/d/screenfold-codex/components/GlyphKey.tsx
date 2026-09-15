import { SIGNS } from '../data';
import GlyphBlock from './GlyphBlock';

/**
 * The sign key: the twelve glyph blocks of the codex with the concept
 * each one stands for and one plain sentence on why. A codex closes with
 * the key to its signs; here it sits on the back board above the link
 * columns, so the vocabulary used on every leaf is spelled out once.
 *
 * Ornament home: the back board's first register.
 */
const KEY_TIERS: readonly number[] = [4, 6, 8, 6, 4, 8, 6, 4, 8, 6, 4, 8];

export default function GlyphKey() {
  return (
    <dl className='sfc-signs'>
      {SIGNS.map((sign, i) => (
        <div className='sfc-sign' key={sign.motif}>
          <dt className='sfc-sign-head'>
            <GlyphBlock motif={sign.motif} tier={KEY_TIERS[i] ?? 6} size={34} label={`${sign.label} sign`} />
            <b className='sfc-sign-label'>{sign.label}</b>
          </dt>
          <dd className='sfc-sign-note'>{sign.note}</dd>
        </div>
      ))}
    </dl>
  );
}
