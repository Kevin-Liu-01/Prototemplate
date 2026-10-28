type UnavailableProps = { title: string; kind: 'off' | 'error' };

/** The page when the vote cannot run here: no store or secret on this deployment, or a read that failed. */
export default function Unavailable({ title, kind }: UnavailableProps) {
  return (
    <main className='vt-col is-narrow' data-testid='vote-unavailable'>
      <header className='vt-head'>
        <h1 className='vt-title'>{title}</h1>
        <p className='vt-lead'>
          {kind === 'off' ? 'Voting is not set up on this deployment.' : 'The vote could not load. Reload the page.'}
        </p>
      </header>
    </main>
  );
}
