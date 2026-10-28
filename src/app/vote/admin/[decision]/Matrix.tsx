import type { AdminData } from '@/lib/vote/types';

import Face, { plateClass } from '../../Face';

/**
 * Wins of each row's option over each column's option, among the active
 * options. A mark or image heads its column with its plate; a text option
 * by its row number, since its words do not fit a column.
 */
export default function Matrix({ data }: { data: AdminData }) {
  const { kind } = data.decision;
  const byKey = new Map(data.options.map((option) => [option.key, option]));
  const { keys, wins } = data.matrix;
  const nameOf = (key: string) => byKey.get(key)?.name ?? key;

  function head(key: string, index: number) {
    const option = byKey.get(key);
    if (kind === 'text' || !option) return <span className='vt-matrix-n'>{index + 1}</span>;
    return (
      <span className={plateClass(kind, 'is-static', 'is-xs')}>
        <Face kind={kind} option={option} />
      </span>
    );
  }

  if (keys.length < 2) return null;

  return (
    <section className='vt-sec' aria-labelledby='vt-matrix-h'>
      <h2 id='vt-matrix-h' className='vt-h2'>
        Head to head
      </h2>
      <div className='vt-scroll pt-scroll-x'>
        <table className='vt-matrix' data-testid='admin-matrix'>
          <caption className='vt-sr'>Wins of each row&apos;s option over each column&apos;s option</caption>
          <thead>
            <tr>
              <td />
              {keys.map((key, index) => (
                <th key={key} scope='col' title={nameOf(key)}>
                  {head(key, index)}
                  <span className='vt-sr'>{nameOf(key)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((row, i) => (
              <tr key={row}>
                <th scope='row'>
                  <span className='vt-named'>
                    {head(row, i)}
                    <span className='vt-name'>{nameOf(row)}</span>
                  </span>
                </th>
                {keys.map((col, j) => {
                  const n = wins[i]?.[j] ?? 0;
                  if (i === j) return <td key={col} className='is-self' />;
                  return (
                    <td key={col} className={n === 0 ? 'is-zero' : undefined} title={`${nameOf(row)} over ${nameOf(col)}: ${n}`}>
                      {n}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
