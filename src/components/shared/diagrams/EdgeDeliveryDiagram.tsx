import DiagramFrame, { type DiagramProps } from './DiagramFrame';

/**
 * Edge — the delivery rail: one generated file dropping onto the CDN edge,
 * five real POPs with real latencies riding it. The rail and the drop are the
 * doubled thread; the POP nearest the file's locale is the one accent.
 */
const POPS: { x: number; code: string; ms: string; hot?: boolean }[] = [
  { x: 22, code: 'fra', ms: '12 ms' },
  { x: 63, code: 'iad', ms: '21 ms' },
  { x: 104, code: 'gru', ms: '47 ms' },
  { x: 145, code: 'nrt', ms: '38 ms', hot: true },
  { x: 186, code: 'syd', ms: '51 ms' },
];

export default function EdgeDeliveryDiagram(props: DiagramProps) {
  return (
    <DiagramFrame {...props}>
      {/* the generated artifact */}
      <rect className='gtd-box' x='44' y='4' width='112' height='16' rx='3' />
      <text className='gtd-code' x='100' y='15' textAnchor='middle'>
        public/_gt/ja.json
      </text>

      {/* the drop and the rail — both drawn as the doubled thread */}
      <path className='gtd-thread' d='M98.4 20 V41' />
      <path className='gtd-thread' d='M101.6 20 V41' />
      <path className='gtd-thread' d='M6 41 H194' />
      <path className='gtd-thread' d='M6 44.2 H194' />

      {POPS.map((pop) => (
        <g key={pop.code}>
          <circle className={pop.hot ? 'gtd-dot-hot' : 'gtd-dot'} cx={pop.x} cy='42.6' r='2.4' />
          <text
            className={pop.hot ? 'gtd-acc' : 'gtd-code'}
            x={pop.x}
            y='59'
            textAnchor='middle'
          >
            {pop.code}
          </text>
          <text className='gtd-mut' x={pop.x} y='71' textAnchor='middle'>
            {pop.ms}
          </text>
        </g>
      ))}
    </DiagramFrame>
  );
}
