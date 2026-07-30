import DiagramFrame, { type DiagramProps } from './DiagramFrame';

/**
 * Runtime — user-generated content translated on demand: a real Spanish
 * message in, its real English rendering out, with the measured latency on
 * the wire. The wire between the two bubbles is the doubled thread.
 */
export default function RuntimeSwapDiagram(props: DiagramProps) {
  return (
    <DiagramFrame {...props}>
      <rect className='gtd-box' x='6' y='5' width='141' height='19' rx='4' />
      <text className='gtd-code' x='14' y='18'>
        ¿Dónde está mi pedido?
      </text>

      {/* the two threads carry the message across the language boundary */}
      <path className='gtd-thread' d='M74 24 C74 38 120 38 120 50' />
      <path className='gtd-thread' d='M77.2 24 C77.2 38 123.2 38 123.2 50' />

      <text className='gtd-mut' x='8' y='47'>
        runtime
      </text>
      <text className='gtd-mut' x='8' y='59'>
        142 ms
      </text>

      <rect className='gtd-box-hot' x='75' y='50' width='119' height='19' rx='4' />
      <text className='gtd-code' x='83' y='63'>
        Where is my order?
      </text>
    </DiagramFrame>
  );
}
