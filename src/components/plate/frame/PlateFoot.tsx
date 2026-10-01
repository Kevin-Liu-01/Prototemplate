import { T, Var } from '@/components/plate/shims/gt-next';

import PlateSignOut from '@/components/plate/frame/PlateSignOut';
import PlateThemeToggle from '@/components/plate/frame/PlateThemeToggle';
import LanguageSelector from '@/components/plate/ui/LanguageSelector';
import { cn } from '@/components/plate/lib/utils';

type PlateFootProps = {
  /** The signed-in account; when set, sign out replaces the copyright. */
  accountEmail?: string | null;
  /** The plate column's classes, so the row lines up with the content. */
  className?: string;
};

/**
 * The frame's foot: one row in the plate column with the landing's language
 * dropdown at the left, and at the right the copyright (signed out) or sign
 * out (signed in) beside the theme flip. No rule and no fill above or behind
 * it. The language is anchored left and the theme flip right, with the
 * account's item between them, so the row keeps one geometry across sign-in
 * and onboarding and a locale whose name is wider or narrower moves nothing
 * else. The copyright is the short form: with the rights sentence the row
 * overran the 464px column and wrapped. From md up the bottom padding is
 * the root's --plate-foot-pb (brand-tokens.css), which compresses under
 * 880px tall; the foot sits outside main's scroll area, so it is in view
 * at every height.
 *
 * Under md the three controls are 44px tall, the phone's tap target: the
 * language and sign out through their wrappers, since the shared selector
 * takes no class and the sign out keeps its 13px text; the theme flip
 * grows to 44 square and its right margin takes the 6px the growth adds,
 * so the glyph stays on the column's right edge.
 */
export default function PlateFoot({ accountEmail, className }: PlateFootProps) {
  return (
    <footer className='relative px-4 pb-6 sm:px-6 md:px-0 md:pb-(--plate-foot-pb)'>
      {/* One row from sm up: the language left, the theme flip right, the
          copyright or sign out between them against the flip. Under sm the
          358px row cannot hold the copyright beside the language, so it
          wrapped under the language at the right; now the language and the
          flip share the first row and the copyright or sign out takes a
          row of its own below, at the language's x. The order utilities
          move the middle item last on phones and back between the two
          from sm up. */}
      <div
        className={cn(className, 'flex flex-wrap items-center gap-x-4 gap-y-2')}
      >
        <div
          className='flex items-center max-md:[&>button]:min-h-11'
          data-testid='plate-foot-language'
        >
          <LanguageSelector dropdownPosition='above' />
        </div>
        <div
          className='order-3 flex basis-full items-center sm:order-2 sm:ml-auto sm:basis-auto max-md:[&_button]:min-h-11'
          data-testid='plate-foot-account'
        >
          {accountEmail ? (
            <PlateSignOut accountEmail={accountEmail} />
          ) : (
            <T>
              <p className='text-muted-foreground text-xs'>
                © <Var>{new Date().getFullYear()}</Var> General Translation,
                Inc.
              </p>
            </T>
          )}
        </div>
        <div className='order-2 ml-auto flex items-center sm:order-3 sm:ml-0'>
          <PlateThemeToggle className='max-md:-mr-1.5 max-md:size-11' />
        </div>
      </div>
    </footer>
  );
}
