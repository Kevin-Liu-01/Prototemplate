'use client';

import { Handshake } from 'lucide-react';
import { useRef } from 'react';

import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';

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
 * Customers — the social-proof beat in the sheet's own grammar: a tc-head
 * header band (the lead lives IN the ruled band, not floating above it),
 * then ONE tc-row of six flat linked cells whose seams the row owns, rail
 * to rail. Marks stay at full ink (the spec is explicit: black/white, not
 * grey), each cell a real link out to the customer's site; the pixels come
 * from /public/logos via a background-image that swaps per theme, and the
 * link's aria-label carries the accessible name.
 */
export default function V0Customers() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec v0-cust' id='customers' ref={root}>
      <div className='tc-head'>
        <Handshake className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Trusted by the best companies.</h2>
      </div>

      <div className='tc-row v0-cust-row'>
        {CUSTOMERS.map((customer) => (
          <a
            className='v0-cust-cell'
            key={customer.id}
            href={customer.href}
            target='_blank'
            rel='noreferrer'
            aria-label={customer.name}
            data-reveal
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
