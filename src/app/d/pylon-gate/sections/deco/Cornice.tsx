/**
 * The stepped cavetto: three bars, widest at the top, the Egyptian cornice
 * reduced to its steps. Home: section heads (under the h2) and the stele
 * cap. Gold fills, one owner.
 */
type CorniceProps = { className?: string };

export default function Cornice({ className }: CorniceProps) {
  return (
    <svg className={className} width='120' height='14' viewBox='0 0 120 14' aria-hidden='true'>
      <rect x='0' y='0' width='120' height='2' fill='currentColor' />
      <rect x='20' y='6' width='80' height='2' fill='currentColor' />
      <rect x='40' y='12' width='40' height='2' fill='currentColor' />
    </svg>
  );
}
