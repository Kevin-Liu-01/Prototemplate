import Numeral from './deco/Numeral';

/**
 * The opening of a column: the bar-and-dot numeral in the margin, the
 * rubric in red beside it, one plain sentence under the rubric. Every
 * column after the first opens this way; the first opens with the claim.
 */
export type ColumnHeadProps = {
  n: number;
  title: string;
  sub: string;
  id?: string;
  tone?: 'paper' | 'stone';
};

export default function ColumnHead({ n, title, sub, id, tone = 'paper' }: ColumnHeadProps) {
  return (
    <header className={tone === 'stone' ? 'pr-head is-stone' : 'pr-head'}>
      <div className='pr-head-margin'>
        <Numeral n={n} />
      </div>
      <div className='pr-head-text'>
        <h2 className='pr-rubric' id={id}>
          {title}
        </h2>
        <p className='pr-head-sub'>{sub}</p>
      </div>
    </header>
  );
}
