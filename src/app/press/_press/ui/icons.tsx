/* The press's own icons: solid, square-cornered, on a 16px grid, in
   currentColor. Each is one even-odd path, so cut-outs read as the ground. */

type IconProps = { size?: number; className?: string };

function icon(d: string) {
  return function Icon({ size = 16, className }: IconProps) {
    return (
      <svg className={['gtp-icon', className].filter(Boolean).join(' ')} viewBox='0 0 16 16' width={size} height={size} aria-hidden='true'>
        <path d={d} fill='currentColor' fillRule='evenodd' />
      </svg>
    );
  };
}

/** A closed book over its page block. */
export const BookIcon = icon('M3 1h10v10.5H3z M4.5 2.5h1v7.5h-1z M3 12.5h10V15H4.2A1.2 1.2 0 0 1 3 13.8z');
/** A still picture: a frame, a ridge and a sun. */
export const StillIcon = icon('M1 2h14v12H1z M2.5 3.5h11v9h-11z M2.5 12.5l3.7-4.6 2.8 3.3 1.6-1.6 2.9 2.9z M10.4 5h2.1v2.1h-2.1z');
/** A recording: a frame with a play mark cut out. */
export const LoopIcon = icon('M1 2h14v12H1z M6 4.8v6.4L11.2 8z');
/** A demo that runs in the page: a pointer. */
export const LiveIcon = icon('M3 1l10.2 6.6-4.3 1.2 2.8 4.8-1.8 1.1-2.8-4.9L4 13z');
export const ClockIcon = icon('M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z M7.2 3.8h1.6v3.9l2.6 1.7-.9 1.3-3.3-2.2z');
export const PenIcon = icon('M10.8 1.2l4 4-8.7 8.7L1.2 15.2l1.3-4.9z M3.6 11.5l-.6 2 2-.6z');
export const CalendarIcon = icon('M1.5 3h13v12h-13z M3 6.5h10v7H3z M4 1h1.6v2.4H4z M10.4 1H12v2.4h-1.6z M4.5 8h2v2h-2z');
export const PinIcon = icon('M8 1a5.2 5.2 0 0 1 5.2 5.2C13.2 9.9 8 15 8 15S2.8 9.9 2.8 6.2A5.2 5.2 0 0 1 8 1z M8 4.1a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2z');
/** The globe the press is filed from: a disc with an equator and a meridian cut out. */
export const GlobeIcon = icon('M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z M1.4 7.35h13.2v1.3H1.4z M7.35 1.4h1.3v13.2h-1.3z M4.6 3.2a8 8 0 0 0 0 9.6l1-.4a7 7 0 0 1 0-8.8z M11.4 3.2a8 8 0 0 1 0 9.6l-1-.4a7 7 0 0 0 0-8.8z');
export const ArrowIcon = icon('M1.5 7.2h9.8L7.6 3.5l1.1-1.1L14.3 8l-5.6 5.6-1.1-1.1 3.7-3.7H1.5z');
export const IndexIcon = icon('M1 2h3v3H1z M6 2.8h9v1.4H6z M1 6.5h3v3H1z M6 7.3h9v1.4H6z M1 11h3v3H1z M6 11.8h9v1.4H6z');
/** Several views of one figure: two stacked frames. */
export const ViewsIcon = icon('M4 1h11v9H4z M5.5 2.5h8v6h-8z M1 4h1.5v8.5H12V14H1z');
export const UpIcon = icon('M8 3.5l6 6-1.2 1.2L8 5.9l-4.8 4.8L2 9.5z');
export const DownIcon = icon('M8 12.5l-6-6 1.2-1.2L8 10.1l4.8-4.8L14 6.5z');
/** Books in a row, covers out. */
export const RowIcon = icon('M1 3h4v10H1z M6 3h4v10H6z M11 3h4v10h-4z');
/** Books in a stack, spines out. */
export const StackIcon = icon('M2 2.5h12v3H2z M1 6.5h13v3H1z M2.5 10.5h12v3h-12z');
