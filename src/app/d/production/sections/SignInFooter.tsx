import SignInLanguageSelector from './SignInLanguageSelector';

/**
 * The sign-in page's own slim footer — one hairline rule, copyright, and the
 * language selector, nothing else. Terms and privacy live in the panel's
 * legal line, and the marketing frame's full footer stays retired from this
 * page. Reproduces apps/dashboard/src/components/signin/SignInFooter.tsx.
 */
export default function SignInFooter() {
  return (
    <footer className='psi-foot'>
      <p>
        &copy; {new Date().getFullYear()} General Translation, Inc. All rights
        reserved.
      </p>
      <SignInLanguageSelector />
    </footer>
  );
}
