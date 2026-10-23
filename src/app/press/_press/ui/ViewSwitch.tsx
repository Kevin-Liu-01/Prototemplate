type View = 'row' | 'stack';

type Props = { value: View; onChange: (view: View) => void };

/* How the rack lays its magazines out, as a two-part switch: three covers
   standing side by side, or three sheets piled one on another, the chosen
   part filled in. Every edge falls on a whole pixel at 20px (rack.css,
   .gtp-viewswitch). */
export default function ViewSwitch({ value, onChange }: Props) {
  return (
    <div className='gtp-viewswitch' role='radiogroup' aria-label='Lay the magazines out in a row or a stack'>
      <button type='button' role='radio' aria-checked={value === 'row'} aria-label='Row' onClick={() => onChange('row')}>
        <svg viewBox='0 0 20 20' aria-hidden='true'>
          <rect x='1' y='5' width='4' height='10' />
          <rect x='8' y='5' width='4' height='10' />
          <rect x='15' y='5' width='4' height='10' />
        </svg>
      </button>
      <button type='button' role='radio' aria-checked={value === 'stack'} aria-label='Stack' onClick={() => onChange('stack')}>
        <svg viewBox='0 0 20 20' aria-hidden='true'>
          <path className='gtp-viewswitch-edge' d='M9.5 5V2.5h7v9H14 M6.5 8V5.5h7v9H11' />
          <rect x='3' y='8' width='8' height='10' />
        </svg>
      </button>
    </div>
  );
}
