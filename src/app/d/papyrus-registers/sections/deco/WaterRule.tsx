import { useId } from 'react';

/**
 * papyrus-registers · deco · the water rule.
 * Ornament home: dividers. The Egyptian water sign is a zigzag; here it is
 * the spacer between two registers, one hairline polyline repeating on a
 * fixed pitch inside a band that owns both of its boundaries. The register
 * that follows drops its top rule, so the seam is drawn once.
 */
const PITCH = 22;
const AMP = 5;
const HEIGHT = 26;

export default function WaterRule() {
  const id = `${useId().replace(/:/g, '')}-water`;
  const mid = HEIGHT / 2;

  return (
    <div className='pr-water' aria-hidden='true'>
      <svg className='pr-water-svg' width='100%' height={HEIGHT} preserveAspectRatio='none'>
        <defs>
          <pattern id={id} width={PITCH} height={HEIGHT} patternUnits='userSpaceOnUse'>
            <path
              d={`M0 ${mid + AMP}L${PITCH / 2} ${mid - AMP}L${PITCH} ${mid + AMP}`}
              fill='none'
              stroke='currentColor'
              strokeWidth={1}
              vectorEffect='non-scaling-stroke'
            />
          </pattern>
        </defs>
        <rect width='100%' height={HEIGHT} fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
