import './customers.css';

type Customer = {
  id: string;
  name: string;
  href: string;
};

/** Spec order: Cursor, Ramp, Partiful, Profound, Sierra, ClickHouse. */
const CUSTOMERS: readonly Customer[] = [
  { id: 'cursor', name: 'Cursor', href: 'https://cursor.com' },
  { id: 'ramp', name: 'Ramp', href: 'https://ramp.com' },
  { id: 'partiful', name: 'Partiful', href: 'https://partiful.com' },
  { id: 'profound', name: 'Profound', href: 'https://tryprofound.com' },
  { id: 'sierra', name: 'Sierra', href: 'https://sierra.ai' },
  { id: 'clickhouse', name: 'ClickHouse', href: 'https://clickhouse.com' },
];

/**
 * Customers — the social-proof beat. One lead line, then the logo wall:
 * six ruled cells, marks at full ink (the spec is explicit: black/white,
 * not grey), each linking out to the customer's site. The pixels come
 * from /public/logos via a background-image that swaps per theme; the
 * link's aria-label carries the accessible name.
 */
export default function V0Customers() {
  return (
    <section className='v0-cust' id='customers' aria-labelledby='v0-cust-lead'>
      <h2 className='v0-cust-lead' id='v0-cust-lead'>
        Trusted by the best companies
      </h2>

      <div className='v0-cust-wall'>
        {CUSTOMERS.map((customer) => (
          <a
            className='v0-cust-cell'
            key={customer.id}
            href={customer.href}
            target='_blank'
            rel='noreferrer'
            aria-label={customer.name}
          >
            {customer.id === 'sierra' ? (
              /* TODO: swap in the real Sierra SVG wordmark once the asset
                 lands in /public/logos (sierra.{light,dark}.svg) — until
                 then this is a typographic stand-in at matched cap height. */
              <span className='v0-cust-word' aria-hidden='true'>
                Sierra
              </span>
            ) : (
              <span className={`v0-cust-mark is-${customer.id}`} aria-hidden='true' />
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
