/**
 * C1.4 · the hero crown. A stepped setback in ink linework with a brass
 * sunburst rising behind it: five tiers narrowing to a mast, a keystone at
 * the top, and the GT mark seated by the parent in the base tier. Static by
 * design: the crown is a drawing on the copy card, not an engine, so there
 * is nothing to gate behind reduced motion. Color comes from the sheet
 * (currentColor for the linework, --deco-ornament for the rays and the
 * keystone); the tiers are filled with the card ground so the rays read as
 * rising from behind the tower rather than through it.
 */

const CX = 150;
const CY = 118;

/* Twenty-one rays across the upper arc, alternating long and short the way
   a 1930 sunburst grille does; the shallow ends hide behind the base tier. */
const RAYS = Array.from({ length: 21 }, (_, i) => {
  const angle = Math.PI * (0.14 + (0.72 * i) / 20);
  const inner = 30;
  const outer = i % 2 === 0 ? 112 : 94;
  return {
    key: i,
    x1: (CX - Math.cos(angle) * inner).toFixed(1),
    y1: (CY - Math.sin(angle) * inner).toFixed(1),
    x2: (CX - Math.cos(angle) * outer).toFixed(1),
    y2: (CY - Math.sin(angle) * outer).toFixed(1),
  };
});

export default function SpireCrown() {
  return (
    <svg viewBox='0 0 300 120' aria-hidden='true' focusable='false'>
      <g className='ss-crown-ray'>
        {RAYS.map((ray) => (
          <line key={ray.key} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
        ))}
      </g>

      {/* the setbacks, base tier to mast, each one step narrower */}
      <g className='ss-crown-line'>
        <rect x='40' y='82' width='220' height='38' />
        <rect x='72' y='66' width='156' height='16' />
        <rect x='102' y='52' width='96' height='14' />
        <rect x='126' y='41' width='48' height='11' />
        <rect x='141' y='32' width='18' height='9' />
        <line x1='150' y1='32' x2='150' y2='13' />
      </g>

      <rect className='ss-crown-key' x='146' y='6' width='8' height='8' transform='rotate(45 150 10)' />
    </svg>
  );
}
