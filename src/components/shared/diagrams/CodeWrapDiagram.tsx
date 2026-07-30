import DiagramFrame, { type DiagramProps } from './DiagramFrame';

/**
 * Libraries — the real hero source, wrapped. Five real lines of JSX with the
 * `<T>` pair picked out, and the doubled thread drawn as the wrap bracket:
 * two parallel lines at constant gauge binding everything the tag ships.
 */
export default function CodeWrapDiagram(props: DiagramProps) {
  return (
    <DiagramFrame {...props}>
      {/* the doubled bracket — the two threads enter at <T> and leave at </T> */}
      <path className='gtd-thread' d='M17 9.5 H9 V65 H17' />
      <path className='gtd-thread' d='M17 12.7 H12.2 V61.8 H17' />

      <text className='gtd-mut' x='126' y='13'>
        app/page.tsx
      </text>

      <text className='gtd-acc gtd-w500' x='21' y='14'>
        {'<T>'}
      </text>
      <text className='gtd-code' x='30' y='26.5'>
        {'<h1>Hello, world!</h1>'}
      </text>
      <text className='gtd-code' x='30' y='39'>
        {'<DateTime>{date}</DateTime>'}
      </text>
      <text className='gtd-code' x='30' y='51.5'>
        {'<button>Get started</button>'}
      </text>
      <text className='gtd-acc gtd-w500' x='21' y='64'>
        {'</T>'}
      </text>
    </DiagramFrame>
  );
}
