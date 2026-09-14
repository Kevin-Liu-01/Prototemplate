/**
 * The papyrus umbel abstracted to a fan: eleven radial hairlines inside one
 * semicircle. Home: the pylon capitals in the hero and the pillar heads in
 * the hypostyle. Gold at hairline weight; one owner draws one figure.
 */
type FanCapitalProps = { className?: string };

const RAYS = 11;
const CX = 40;
const CY = 44;
const R = 36;

function rays(): string {
  const parts: string[] = [];
  for (let i = 1; i <= RAYS; i++) {
    const angle = (Math.PI * i) / (RAYS + 1);
    const x = CX + R * Math.cos(Math.PI - angle);
    const y = CY - R * Math.sin(angle);
    parts.push(`M${CX} ${CY}L${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return parts.join('');
}

const RAY_PATH = rays();

export default function FanCapital({ className }: FanCapitalProps) {
  return (
    <svg className={className} viewBox='0 0 80 48' aria-hidden='true'>
      <path
        d={`M${CX - R} ${CY}A${R} ${R} 0 0 1 ${CX + R} ${CY}`}
        fill='none'
        stroke='currentColor'
        vectorEffect='non-scaling-stroke'
      />
      <path d={RAY_PATH} fill='none' stroke='currentColor' vectorEffect='non-scaling-stroke' />
      <path d={`M${CX - 14} ${CY + 3}H${CX + 14}`} fill='none' stroke='currentColor' strokeWidth='2' vectorEffect='non-scaling-stroke' />
    </svg>
  );
}
