import PlateFoot from '@/components/plate/frame/PlateFoot';
import PlateRoot from '@/components/plate/frame/PlateRoot';
import PlateScrollFade from '@/components/plate/frame/PlateScrollFade';
import GtMark from '@/components/plate/icons/GtMark';

import type { FieldStackProps } from '@/components/plate/brand/FieldStack';

/** The website the mark links to; the dashboard read it from packages/ui. */
const HOMEPAGE_URL = 'https://generaltranslation.com';

export type PlateFrameProps = Pick<FieldStackProps, 'scene' | 'picture'> & {
  /** Accessible name of the mark's link to the website. */
  homeLabel: string;
  /** The signed-in account, named by the sign-out control in the foot. */
  accountEmail?: string | null;
  children: React.ReactNode;
};

// The plate column: centred under md with its own cap and padding; from md
// up brand-tokens.css (.plate-column) sets its width and left margin from
// the root's --plate-column and --plate-pad, so the mark, the heading, the
// controls, the counter's rule and the foot row share one x and one width.
const columnClassName =
  'plate-column mx-auto w-full max-w-[560px] px-5 sm:px-12';

/**
 * The frame every auth and onboarding surface shares: the field behind a
 * plate column with no fill, the mark at the column's head linking to the
 * website, the page's content, then the foot row. The column hangs from a
 * fixed offset below the top, so pages of different heights share one
 * heading position. Hook-free, so route tests can render it with
 * react-dom/server; the client root under it owns the field.
 */
export default function PlateFrame({
  scene,
  picture,
  homeLabel,
  accountEmail,
  children,
}: PlateFrameProps) {
  return (
    <PlateRoot scene={scene} picture={picture}>
      {/* The scroll area and its fade share one box: the wrapper takes the
          room above the foot and main fills it, so the fade's bottom is
          main's bottom, the foot row's top. */}
      <div className='relative flex min-h-0 flex-1 flex-col'>
        {/* No bottom padding on main: the column's own padding already
            holds the content off the foot, and a second 48px pushed the
            sign-in past a 900px viewport. From md up main is the frame's
            scroll area: the root is the viewport's height there, so a
            column taller than the room scrolls here, mark included, while
            the foot below stays in view; overscroll-contain keeps a scroll
            past the column's end from reaching the page. gt-scrollbar is
            the site's thin thumb (packages/ui shared.css). No
            scrollbar-gutter: the column hangs from main's left edge at a
            fixed width, so a scrollbar at the right moves nothing. */}
        <main className='gt-scrollbar relative flex flex-1 flex-col px-4 pt-[clamp(24px,9svh,88px)] sm:px-6 md:min-h-0 md:overflow-y-auto md:overscroll-contain md:px-0'>
          {/* The gap under the mark and the column's paddings are the
              root's height tokens from md up (brand-tokens.css
              .plate-root), which compress under 880px tall; under md the
              utilities carry the phone values. */}
          <div
            className={`${columnClassName} flex flex-col gap-10 py-8 sm:py-12 md:gap-(--plate-mark-gap) md:pt-(--plate-column-pt) md:pb-(--plate-column-pb)`}
          >
            {/* Under md the padding and the negative margin that cancels it
                give the 25 by 16 mark a 53 by 44 tap target with the mark
                where it was. */}
            <a
              href={HOMEPAGE_URL}
              className='text-foreground hover:text-foreground/70 w-fit transition-colors duration-150 max-md:-m-3.5 max-md:p-3.5'
              aria-label={homeLabel}
            >
              <GtMark className='h-4 w-[25px]' />
            </a>
            {children}
          </div>
        </main>
        {/* Over main's last 56px while it can scroll further down. */}
        <PlateScrollFade />
      </div>
      <PlateFoot accountEmail={accountEmail} className={columnClassName} />
    </PlateRoot>
  );
}
