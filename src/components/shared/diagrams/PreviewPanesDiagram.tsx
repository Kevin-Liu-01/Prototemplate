import DiagramFrame, { type DiagramProps } from './DiagramFrame';

/**
 * Dashboard — the dev preview: real source strings beside their real Spanish
 * translations, pane for pane. The preview pane's ring is the one accent.
 * Strings are the canonical workspace rows, not placeholder bars.
 */
const ROWS: { y: number; en: string; es: string }[] = [
  { y: 33, en: 'Hello, world!', es: '¡Hola, mundo!' },
  { y: 46, en: 'Get started', es: 'Comenzar ahora' },
  { y: 59, en: 'Dark mode', es: 'Modo oscuro' },
];

export default function PreviewPanesDiagram(props: DiagramProps) {
  return (
    <DiagramFrame {...props}>
      <rect className='gtd-box' x='4' y='5' width='93' height='64' rx='3' />
      <text className='gtd-mut' x='10' y='16'>
        en · source
      </text>
      <path className='gtd-rule' d='M4 21.5 H97' />

      <rect className='gtd-box-hot' x='103' y='5' width='93' height='64' rx='3' />
      <text className='gtd-mut' x='109' y='16'>
        es · preview
      </text>
      <path className='gtd-rule' d='M103 21.5 H196' />

      {ROWS.map((row) => (
        <g key={row.en}>
          <text className='gtd-code' x='10' y={row.y}>
            {row.en}
          </text>
          <text className='gtd-code' x='109' y={row.y}>
            {row.es}
          </text>
        </g>
      ))}
    </DiagramFrame>
  );
}
