import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SignInFooter from '../sections/SignInFooter';
import SignInGlyphAside from '../sections/SignInGlyphAside';
import SignInMark from '../sections/SignInMark';
import SignInPanel from '../sections/SignInPanel';

import '../../toolchain/styles.css';
import '../sections/signin.css';

/* Title and description are the real page's own: gt('Sign In') and
   d('metadata.description'), which resolves to the dashboard dictionary's
   tagline (apps/dashboard/src/dictionary.ts). */
export const metadata = {
  title: 'Sign In — Shipped — GT Redesign',
  description: "Full-stack localization for the world's best companies",
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * SIGN IN — the shipped page, not a direction.
 *
 * The one route in this control that does not ship from the marketing app.
 * Sign-in lives in apps/dashboard (src/app/[locale]/signin/page.tsx, with
 * src/components/signin/sign-in-form.tsx, SignInGlyphAside.tsx and
 * SignInFooter.tsx), so it takes its chrome from there rather than from the
 * site frame: no navbar, no site footer — the mark alone at the top of the
 * form column, the halftone globe plate beside it from 768px up, and the
 * page's own slim footer carrying the copyright and the language selector.
 * That route has no layout.tsx, so nothing wraps it; V0Nav and V0Footer,
 * which the landing page and the marketing subpages mount, would both be
 * additions the real page does not have.
 *
 * The composition below mirrors it exactly: a min-h-svh flex column, a
 * two-column grid that collapses to one below md, the mark and the panel
 * sharing a single 400px measure so the logo sits over the form's left edge,
 * and the footer under the whole thing.
 *
 * What the real page does that this cannot: resolve a session and redirect,
 * sanitize a redirect_url, carry an invite token or a selected plan through,
 * read the signin_error_* cookies to seed an error and a default email, and
 * open straight into the SSO view when the error code is sso_required. Those
 * are all server-auth paths. The panel carries the default state instead —
 * the state a visitor arriving cold actually sees — and says plainly that
 * nothing submits.
 */
export default function ProductionSignInPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root prod-root' id='top'>
        <div className='psi-page'>
          <div className='psi-split'>
            {/* the left column carries the whole journey: mark and form */}
            <section className='psi-col'>
              <div className='psi-measure'>
                <SignInMark />
              </div>
              <div className='psi-body'>
                <div className='psi-measure'>
                  <SignInPanel />
                </div>
              </div>
            </section>
            <SignInGlyphAside />
          </div>
          <SignInFooter />
        </div>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
