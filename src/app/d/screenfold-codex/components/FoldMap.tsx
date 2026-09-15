import { LEAVES } from '../data';
import BarDot from './BarDot';
import GlyphBlock from './GlyphBlock';

/**
 * The strip in miniature: ten small leaves in one row, each leaning the
 * way its full leaf leans, carrying that leaf's sign, its folio in bar and
 * dot, and its name. It is the page's table of contents and the thesis
 * made visible at hero size: the whole codex, folded, before the reader
 * opens it. Every item is a link to the leaf's anchor.
 *
 * Ornament home: the hero's third register.
 */
export default function FoldMap() {
  return (
    <nav className='sfc-map-wrap' aria-label='Leaves of the codex'>
      <ol className='sfc-map'>
        {LEAVES.map((l) => (
          <li className={`sfc-map-item is-fold-${l.fold}`} key={l.id}>
            <a className='sfc-map-link' href={`#${l.id}`}>
              <span className='sfc-map-leaf'>
                <span className='sfc-map-face'>
                  <GlyphBlock motif={l.sign} tier={l.n % 2 === 0 ? 8 : 6} size={26} />
                  <BarDot n={l.n} layout='row' scale={0.7} />
                </span>
              </span>
              <span className='sfc-map-label'>
                <span className='sfc-vh'>Leaf {l.n}, </span>
                {l.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
