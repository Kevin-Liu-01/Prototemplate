import DiagramFrame, { type DiagramProps } from './DiagramFrame';

/**
 * AI translation — one real source string fanning into four real
 * translations, each with its measured width delta (the layout argument,
 * annotated). The fork is the doubled thread at constant gauge.
 */
const ROWS: { y: number; code: string; text: string; delta?: string }[] = [
  { y: 11, code: 'en', text: 'Hello, world!' },
  { y: 26, code: 'es', text: '¡Hola, mundo!', delta: '±0%' },
  { y: 41, code: 'ja', text: 'こんにちは、世界！', delta: '+16%' },
  { y: 56, code: 'de', text: 'Hallo, Welt!', delta: '−8%' },
  { y: 71, code: 'zh', text: '你好，世界！', delta: '−23%' },
];

export default function TranslationFlowDiagram(props: DiagramProps) {
  return (
    <DiagramFrame {...props}>
      {/* the two threads: the source enters at en, the translations exit below */}
      <path className='gtd-thread' d='M22 7.9 H10 V67.9 H22 M10 22.9 H22 M10 37.9 H22 M10 52.9 H22' />
      <path className='gtd-thread' d='M22 11.1 H13.2 V64.7 H22 M13.2 26.1 H22 M13.2 41.1 H22 M13.2 56.1 H22' />

      {ROWS.map((row) => (
        <g key={row.code}>
          <text className='gtd-mut' x='28' y={row.y + 3}>
            {row.code}
          </text>
          <text
            className={row.code === 'en' ? 'gtd-code gtd-w500' : 'gtd-code'}
            x='46'
            y={row.y + 3}
          >
            {row.text}
          </text>
          {row.delta && (
            <text className='gtd-mut' x='194' y={row.y + 3} textAnchor='end'>
              {row.delta}
            </text>
          )}
        </g>
      ))}
    </DiagramFrame>
  );
}
