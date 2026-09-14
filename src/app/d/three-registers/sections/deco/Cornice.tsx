/**
 * Deco home: the hero plate's edge (C1.4), the top of the slab.
 *
 * A stepped cornice in four setbacks, the pylon and ziggurat profile drawn
 * once. The fill is the slab color so the steps read as the stone's own
 * shoulders; the edge is one gold hairline along the profile, never along
 * the bottom, which is where the slab begins. Stretching the viewBox
 * horizontally keeps every edge vertical or horizontal, so the steps stay
 * steps at any width.
 */
const PROFILE = 'M0 64V44H90V26H200V12H330V0H670V12H800V26H910V44H1000V64';

export function Cornice() {
  return (
    <svg className='tr-cornice' viewBox='0 0 1000 64' preserveAspectRatio='none' aria-hidden='true' focusable='false'>
      <path className='tr-cornice-fill' d={`${PROFILE}Z`} />
      <path className='tr-cornice-edge' d={PROFILE} vectorEffect='non-scaling-stroke' />
    </svg>
  );
}
