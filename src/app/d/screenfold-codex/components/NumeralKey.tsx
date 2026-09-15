import BarDot from './BarDot';

/**
 * The key to the numerals: one dot, one bar, the shell, and a stacked
 * twenty, each named. Printed once in the hero so every figure after it
 * can be read without a second explanation.
 *
 * Ornament home: the hero's foot register.
 */
const KEY: readonly { n: number; label: string; layout: 'row' | 'column' }[] = [
  { n: 1, label: 'one', layout: 'row' },
  { n: 5, label: 'five', layout: 'row' },
  { n: 0, label: 'zero', layout: 'row' },
  { n: 20, label: 'twenty', layout: 'column' },
];

export default function NumeralKey() {
  return (
    <div className='sfc-key'>
      <dl className='sfc-key-list'>
        {KEY.map((item) => (
          <div className='sfc-key-item' key={item.label}>
            <dt className='sfc-key-num'>
              <BarDot n={item.n} layout={item.layout} scale={1} label={`${item.label} in bar and dot`} />
            </dt>
            <dd className='sfc-key-label'>
              {item.n} <span className='sfc-key-word'>{item.label}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className='sfc-key-cap'>
        A dot is one, a bar is five, the shell is zero. Figures stack in twenties, the highest place on
        the left.
      </p>
    </div>
  );
}
