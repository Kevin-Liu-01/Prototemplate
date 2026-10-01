/**
 * What `npx gt login` prints before the browser opens, as the gallery's
 * stand-in for the terminal: the CLI's own lines from a real run, on the
 * deck's raised-ink panel.
 */
export default function CliTerminal() {
  const lines = [
    '$ npx gt login',
    '',
    '┌  Signing in to General Translation...',
    '│',
    '│  Opening your browser to sign in. If it does not open, visit:',
    '│  https://dash.generaltranslation.com/api/auth/oauth2/authorize?…',
    '│',
    '└  You are now signed in.',
    '',
    '$ npx gt whoami',
    '│  Kevin Liu',
  ];
  return (
    <div className='bg-background flex min-h-svh items-center justify-center px-6 py-16'>
      <pre className='w-full max-w-[720px] overflow-x-auto rounded-md bg-(--panel) px-8 py-7 font-mono text-[13.5px] leading-[1.7] text-(--paper) dark:text-(--ink)'>
        {lines.join('\n')}
      </pre>
    </div>
  );
}
