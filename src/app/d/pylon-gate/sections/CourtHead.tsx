import BarDot from './deco/BarDot';
import Cornice from './deco/Cornice';

/**
 * The head of a court: the bar-and-dot numeral, the h2 in the display face,
 * the stepped cornice, and one line of copy. Centered on the axis.
 */
type CourtHeadProps = { n: number; title: string; sub: string; id?: string };

export default function CourtHead({ n, title, sub, id }: CourtHeadProps) {
  return (
    <header className='pg-head'>
      <BarDot className='pg-numeral' n={n} />
      <h2 id={id}>{title}</h2>
      <Cornice className='pg-cornice' />
      <p>{sub}</p>
    </header>
  );
}
