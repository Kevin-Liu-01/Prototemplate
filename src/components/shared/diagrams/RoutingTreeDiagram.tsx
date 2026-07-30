import DiagramFrame, { type DiagramProps } from './DiagramFrame';

/**
 * Middleware — a real request forking into real locale-prefixed paths, beside
 * the pathConfig lines that produced them. `/fr/a-propos` — the localized
 * pathname — is the one accent. The fork is the doubled thread.
 */
export default function RoutingTreeDiagram(props: DiagramProps) {
  return (
    <DiagramFrame {...props}>
      <text className='gtd-code gtd-w500' x='8' y='14'>
        GET example.com/about
      </text>
      <text className='gtd-mut' x='20' y='27'>
        Accept-Language: fr
      </text>

      {/* the doubled fork: one request in, every locale path out */}
      <path className='gtd-thread' d='M10 18 V63.9 H24 M10 27.9 H16 M10 39.9 H24 M10 51.9 H24' />
      <path className='gtd-thread' d='M13.2 18 V60.7 H24 M13.2 31.1 H16 M13.2 43.1 H24 M13.2 55.1 H24' />

      <text className='gtd-code' x='28' y='45'>
        /es/about
      </text>
      <text className='gtd-code' x='28' y='57'>
        /ja/about
      </text>
      <text className='gtd-code' x='28' y='69'>
        /fr/a-propos
      </text>
      {/* the money shot: the localized pathname, underlined once */}
      <path className='gtd-hot' d='M45 71.5 H96' />

      {/* the config that produced it */}
      <path className='gtd-rule' d='M100 36 V70' />
      <text className='gtd-mut' x='108' y='45'>
        pathConfig
      </text>
      <text className='gtd-code' x='108' y='57'>
        {"'/about':"}
      </text>
      <text className='gtd-code' x='108' y='69'>
        {"fr: '/a-propos'"}
      </text>
    </DiagramFrame>
  );
}
