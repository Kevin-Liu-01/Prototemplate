/* PLACEHOLDER QUOTES — invented scaffolding for the layout. Swap for real
   customer words (and confirm names and titles) before this ships. */

const INTERCEPTS = [
  {
    channel: 'Cursor · verified',
    quote:
      'Our docs go out in fourteen languages the moment they merge. Nobody on the team thinks about it anymore — that is the whole point.',
    name: 'Michael Truell',
    role: 'CEO, Cursor',
    stamp: 'SIG·044',
  },
  {
    channel: 'Partiful · verified',
    quote:
      'We localized the entire product for sixteen markets with two engineers. The review tooling is what made it stick.',
    name: 'Founding Engineer',
    role: 'Partiful',
    stamp: 'SIG·051',
  },
] as const;

/**
 * The intercepts: two verified transmissions from inside customer teams,
 * framed as filed signals — channel row up top, the message set large,
 * the stamp in the corner. Numbers are the only mono.
 */
export default function Intercepts() {
  return (
    <section className='sgs-intercepts' aria-label='Customer transmissions'>
      <header className='sgs-head'>
        <span className='sgs-kicker'>Intercepted</span>
        <h2>Signals from inside.</h2>
      </header>
      <div className='sgs-cards'>
        {INTERCEPTS.map((t) => (
          <figure className='sgs-card' key={t.stamp}>
            <div className='sgs-card-rule'>
              <span>{t.channel}</span>
              <span className='sgs-card-stamp'>{t.stamp}</span>
            </div>
            <blockquote>
              <p>{t.quote}</p>
            </blockquote>
            <figcaption>
              <b>{t.name}</b>
              <span>{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
