import type { ReactNode } from 'react';

/**
 * Minimal 24×24 stroke icon set for the presenter. Inlined so slides stay
 * self-contained; stroke inherits currentColor.
 */
export type IconName =
  | 'rocket'
  | 'palette'
  | 'sparkles'
  | 'users'
  | 'building'
  | 'zap'
  | 'shield'
  | 'server'
  | 'globe'
  | 'code'
  | 'coins'
  | 'calendar'
  | 'ruler'
  | 'pencil'
  | 'type'
  | 'activity'
  | 'layers'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'grid';

const PATHS: Record<IconName, ReactNode> = {
  rocket: (
    <>
      <path d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z' />
      <path d='m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' />
      <path d='M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0' />
      <path d='M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' />
    </>
  ),
  palette: (
    <>
      <path d='M12 22a10 10 0 1 1 10-10c0 1.66-1.34 3-3 3h-2.5a2.5 2.5 0 0 0-1.9 4.13c.38.44.4 1.12-.05 1.5-.7.58-1.62.37-2.55.37z' />
      <circle cx='8' cy='10' r='0.5' fill='currentColor' />
      <circle cx='12' cy='7' r='0.5' fill='currentColor' />
      <circle cx='16' cy='10' r='0.5' fill='currentColor' />
    </>
  ),
  sparkles: (
    <>
      <path d='M12 4 13.8 9.2 19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4z' />
      <path d='M19 3v4' />
      <path d='M17 5h4' />
      <path d='M5 17v4' />
      <path d='M3 19h4' />
    </>
  ),
  users: (
    <>
      <circle cx='9' cy='8' r='3.5' />
      <path d='M2.5 20a6.5 6.5 0 0 1 13 0' />
      <path d='M16 4.5a3.5 3.5 0 0 1 0 7' />
      <path d='M18.5 20a6.5 6.5 0 0 0-3.5-5.7' />
    </>
  ),
  building: (
    <>
      <rect x='5' y='3' width='14' height='18' rx='1' />
      <path d='M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2' />
      <path d='M10 21v-3h4v3' />
    </>
  ),
  zap: <path d='M13 2 4 14h6l-1 8 9-12h-6l1-8z' />,
  shield: <path d='m12 3 7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z' />,
  server: (
    <>
      <rect x='3' y='4' width='18' height='7' rx='1.5' />
      <rect x='3' y='13' width='18' height='7' rx='1.5' />
      <path d='M7 7.5h.01M7 16.5h.01' />
    </>
  ),
  globe: (
    <>
      <circle cx='12' cy='12' r='9' />
      <path d='M3 12h18' />
      <path d='M12 3a13.5 13.5 0 0 1 0 18a13.5 13.5 0 0 1 0-18z' />
    </>
  ),
  code: (
    <>
      <path d='m8 7-5 5 5 5' />
      <path d='m16 7 5 5-5 5' />
    </>
  ),
  coins: (
    <>
      <circle cx='8.5' cy='8.5' r='5.5' />
      <path d='M17.7 10.8a5.5 5.5 0 1 1-6.9 6.9' />
      <path d='M7 6.5h1.5v4' />
    </>
  ),
  calendar: (
    <>
      <rect x='4' y='5' width='16' height='16' rx='2' />
      <path d='M4 10h16' />
      <path d='M8 3v4M16 3v4' />
    </>
  ),
  ruler: (
    <>
      <path d='M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4z' />
      <path d='m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2' />
    </>
  ),
  pencil: (
    <>
      <path d='M17 3l4 4L8 20l-5 1 1-5L17 3z' />
      <path d='m15 5 4 4' />
    </>
  ),
  type: (
    <>
      <path d='M4 7V4h16v3' />
      <path d='M9 20h6' />
      <path d='M12 4v16' />
    </>
  ),
  activity: <path d='M22 12h-4l-3 8-6-16-3 8H2' />,
  layers: (
    <>
      <path d='M12 2 2 7l10 5 10-5-10-5z' />
      <path d='m2 12 10 5 10-5' />
      <path d='m2 17 10 5 10-5' />
    </>
  ),
  'arrow-up': (
    <>
      <path d='M12 19V5' />
      <path d='m5 12 7-7 7 7' />
    </>
  ),
  'arrow-down': (
    <>
      <path d='M12 5v14' />
      <path d='m19 12-7 7-7-7' />
    </>
  ),
  'arrow-left': (
    <>
      <path d='M19 12H5' />
      <path d='m12 19-7-7 7-7' />
    </>
  ),
  'arrow-right': (
    <>
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </>
  ),
  grid: (
    <>
      <rect x='3' y='3' width='7' height='7' rx='1' />
      <rect x='14' y='3' width='7' height='7' rx='1' />
      <rect x='3' y='14' width='7' height='7' rx='1' />
      <rect x='14' y='14' width='7' height='7' rx='1' />
    </>
  ),
};

export default function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox='0 0 24 24'
      width={size}
      height={size}
      fill='none'
      stroke='currentColor'
      strokeWidth={1.6}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
