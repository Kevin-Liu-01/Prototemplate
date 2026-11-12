import { LOGO } from '@/lib/logo';

/* The shipped landing app's small mark (packages/ui icons/GtMark.tsx, as
   apps/landing/src/components/blog/UpdatesBoard.tsx draws it): the General
   Translation logo, LOGO in src/lib/logo.ts, `size` pixels square in
   currentColor. */
export default function GtMark({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden='true' viewBox={LOGO.viewBox} width={size} height={size} fill='currentColor'>
      <path fillRule={LOGO.fillRule} d={LOGO.d} />
    </svg>
  );
}
