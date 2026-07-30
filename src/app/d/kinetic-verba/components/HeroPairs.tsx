import { PAIR_ITEMS } from '../lib/hero-stream';

import { PairCardBody } from './PairStream';

/**
 * The hero mechanic on a phone.
 *
 * A 390px column cannot hold a perspective fan without throwing every card off
 * the canvas, so the same six pairs are laid down as rows instead: the English
 * source, the mark's hairline, and the translation — still at matching offsets
 * either side of the axis, still readable, no clipping.
 */
export default function HeroPairs() {
  return (
    <div
      className='kv-pairs'
      aria-label='English components and their translations, either side of the GT mark'
    >
      {PAIR_ITEMS.map((item) => (
        <div className='kv-pairrow' key={item.id}>
          <div className={`kv-card kv-card-${item.kind}`}>
            <div className='kv-card-layer'>
              <PairCardBody kind={item.kind} copy={item.en} />
            </div>
          </div>
          <span className='kv-pairarrow' aria-hidden>
            →
          </span>
          <div className={`kv-card kv-card-${item.kind}`} lang={item.lang} dir={item.rtl ? 'rtl' : undefined}>
            <div className='kv-card-layer'>
              <PairCardBody kind={item.kind} copy={item.translated} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
