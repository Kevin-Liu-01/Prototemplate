import type { Bilingual, StreamSpec } from './content';

/**
 * Both language states are rendered; CSS shows one. Toggling the pair is what
 * makes the component physically re-measure when it leaves the lens translated.
 */
function Pair({ pair }: { pair: Bilingual }) {
  return (
    <>
      <span className='ft-en'>{pair.en}</span>
      <span className='ft-tr'>{pair.tr}</span>
    </>
  );
}

function Body({ spec }: { spec: StreamSpec }) {
  switch (spec.kind) {
    case 'button':
      return <Pair pair={spec.label} />;
    case 'toast':
      return <Pair pair={spec.label} />;
    case 'field':
      return (
        <>
          <span className='ft-si-label'>
            <Pair pair={spec.label} />
          </span>
          <span className='ft-si-box'>
            <Pair pair={spec.placeholder} />
          </span>
        </>
      );
    case 'price':
      return (
        <>
          <span className='ft-si-plan'>
            <Pair pair={spec.plan} />
          </span>
          <span className='ft-si-amount'>
            <Pair pair={spec.amount} />
          </span>
        </>
      );
    case 'nav':
      return <Pair pair={spec.label} />;
    case 'copy':
      return <Pair pair={spec.label} />;
    case 'theo':
      return (
        <>
          <span className='ft-theo-head'>
            <span className='ft-theo-avatar' aria-hidden>
              T
            </span>
            <span>
              <span className='ft-theo-name'>Theo</span>
              <span className='ft-theo-role'>
                <Pair pair={spec.role} />
              </span>
            </span>
          </span>
          <span className='ft-theo-quote'>
            “
            <Pair pair={spec.quote} />”
          </span>
        </>
      );
  }
}

export type StreamItemProps = {
  spec: StreamSpec;
  /** Renders the translated face directly — the phone gate's output side. */
  translated?: boolean;
  /** Drops the item out of the lane engine (the phone gate places it in flow). */
  still?: boolean;
  className?: string;
};

export default function StreamItem({ spec, translated, still, className }: StreamItemProps) {
  const classes = [
    'ft-si',
    `ft-si--${spec.kind}`,
    translated ? 'is-tr' : '',
    still ? 'is-still' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      data-item={spec.id}
      data-row={still ? undefined : spec.row}
      data-phase={still ? undefined : spec.phase}
      data-period={still ? undefined : spec.period}
      aria-hidden
    >
      <Body spec={spec} />
      <span className='ft-si-locale' aria-hidden>
        {spec.locale}
      </span>
    </div>
  );
}
