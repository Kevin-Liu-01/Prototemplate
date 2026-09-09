/**
 * The shell's icon set: thirteen solid 16x16 glyphs, fill currentColor, no
 * strokes. Paths are copied verbatim from the deck viewer (parts/head.html
 * and parts/tail.html). No lucide, no Unicode glyphs, no icon fonts in the
 * shell; the two marks live in GtMark.tsx and PtMark.tsx.
 */
export type IconName =
  | 'sidebar'
  | 'prev'
  | 'next'
  | 'slide'
  | 'grid'
  | 'book'
  | 'index'
  | 'theme'
  | 'present'
  | 'fullscreen'
  | 'link'
  | 'close'
  | 'external';

type IconPath = { d: string; evenodd?: boolean };

const PATHS: Record<IconName, IconPath> = {
  sidebar: { d: 'M1 2h14v12H1V2Zm6 1.5v9h6.5v-9H7Z', evenodd: true },
  prev: { d: 'M10.5 2.5v11L4.5 8l6-5.5Z' },
  next: { d: 'M5.5 2.5v11L11.5 8l-6-5.5Z' },
  slide: { d: 'M1 3h14v10H1Z' },
  grid: { d: 'M1 1h6v6H1ZM9 1h6v6H9ZM1 9h6v6H1ZM9 9h6v6H9Z' },
  book: {
    d: 'M1.5 3.2c2.4-.5 4.4-.1 5.75 1v9.6c-1.35-1.1-3.35-1.5-5.75-1V3.2ZM14.5 3.2c-2.4-.5-4.4-.1-5.75 1v9.6c1.35-1.1 3.35-1.5 5.75-1V3.2Z',
  },
  index: {
    d: 'M1 2.75h2.5v2.5H1ZM5.5 2.75H15v2.5H5.5ZM1 6.75h2.5v2.5H1ZM5.5 6.75H15v2.5H5.5ZM1 10.75h2.5v2.5H1ZM5.5 10.75H15v2.5H5.5Z',
  },
  theme: {
    d: 'M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 1.3v10.4a5.2 5.2 0 0 0 0-10.4Z',
    evenodd: true,
  },
  present: { d: 'M1 2.5h14V11H1ZM5.5 12.5h5V14h-5Z' },
  fullscreen: {
    d: 'M1 1h5.5v2H3v3.5H1ZM9.5 1H15v5.5h-2V3H9.5ZM1 9.5h2V13h3.5v2H1ZM13 9.5h2V15H9.5v-2H13Z',
  },
  link: { d: 'M2 3h5v2H4v7h7V9h2v5H2ZM9 1h6v6h-2V4.4l-5.3 5.3-1.4-1.4L11.6 3H9Z' },
  close: {
    d: 'M3.1 1.7 8 6.6l4.9-4.9 1.4 1.4L9.4 8l4.9 4.9-1.4 1.4L8 9.4l-4.9 4.9-1.4-1.4L6.6 8 1.7 3.1Z',
  },
  external: { d: 'M5 3h8v8h-2V6.4l-6.3 6.3-1.4-1.4L9.6 5H5Z' },
};

export type IconProps = { name: IconName };

/** A 16x16 solid glyph. Size it from CSS on the parent (`.pt-ib svg`). */
export function Icon({ name }: IconProps) {
  const path = PATHS[name];
  return (
    <svg viewBox='0 0 16 16' width={16} height={16} fill='currentColor' aria-hidden='true'>
      <path d={path.d} fillRule={path.evenodd ? 'evenodd' : undefined} />
    </svg>
  );
}
