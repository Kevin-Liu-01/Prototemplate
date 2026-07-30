import DiagramFrame, { type DiagramProps } from './DiagramFrame';

/**
 * Config — the real gt.config.json, line for line: the one file that stays
 * byte-identical across every runtime. The doubled thread runs the gutter,
 * binding the block the way the invariant binds the six SDKs.
 */
export default function ConfigSlidersDiagram(props: DiagramProps) {
  return (
    <DiagramFrame {...props}>
      {/* the two threads hold the invariant */}
      <path className='gtd-thread' d='M2.6 7 V71' />
      <path className='gtd-thread' d='M5.8 7 V71' />

      <text className='gtd-mut' x='12' y='12'>
        gt.config.json
      </text>
      <text className='gtd-code' x='12' y='24.5'>
        {'{'}
      </text>
      <text className='gtd-code' x='24' y='36.5'>
        {'"defaultLocale": "en",'}
      </text>
      <text className='gtd-code' x='24' y='48.5'>
        {'"locales": ["es", "fr", "ja",'}
      </text>
      <text className='gtd-code' x='92' y='60.5'>
        {'"de", "zh"],'}
      </text>
      <text className='gtd-code' x='12' y='71.5'>
        {'}'}
      </text>
    </DiagramFrame>
  );
}
