'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/** The audit shortlist, verbatim from the footer shields and the enterprise
 *  plan: SOC 2 Type II · GDPR · ISO 27001 (all verified at
 *  trust.inc/generaltranslation), then the controls a security review asks
 *  for next. No invented certifications — this list IS the claim. */
const COMPLIANCE: readonly { k: string; v: string }[] = [
  { k: 'soc 2', v: 'Type II' },
  { k: 'iso 27001', v: 'certified' },
  { k: 'gdpr', v: 'compliant' },
  { k: 'sso', v: 'SAML & OIDC' },
  { k: 'access', v: 'RBAC · custom roles' },
  { k: 'sla', v: 'custom, in contract' },
  { k: 'support', v: 'Slack + phone' },
];

/** Wordmarks lettered in the page's own faces — the six verified customers. */
const BRANDS: readonly { name: string; cls: string }[] = [
  { name: 'Cursor', cls: 'is-cursor' },
  { name: 'ramp', cls: 'is-ramp' },
  { name: 'Mintlify', cls: 'is-mintlify' },
  { name: 'PROFOUND', cls: 'is-profound' },
  { name: 'Partiful', cls: 'is-partiful' },
  { name: 'ClickHouse', cls: 'is-clickhouse' },
];

/**
 * The enterprise opening: flat copy on the left, the compliance ledger
 * mounted on the right — the page leads with the artifact a buyer's security
 * team asks for first, not with a slogan. The trust band closes the section
 * in the shell's own ruled grammar.
 */
export default function EnterpriseHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='tc-row is-lead'>
        <div className='tc-cell tce-hero' data-reveal>
          <h1>
            <span>Launch in every language.</span>
            <span>
              Keep <em>every control</em>.
            </span>
          </h1>
          <p className='tce-hero-sub'>
            The same developer-first toolchain, run at organization scale — SOC 2 Type II, SSO and
            RBAC, review gates before a translation ships, and versioned rollbacks for the one that
            already did.
          </p>
          <div className='tce-hero-acts'>
            <a className='tc-btn tc-btn-solid' href='#demo'>
              Get a demo
            </a>
            <a className='tc-btn tc-btn-line' href='#demo'>
              Talk to an engineer
            </a>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>The security review, answered</h3>
            <p>The certifications and controls your audit asks for first, in one ledger.</p>
            <div className='tce-ledger'>
              <div className='tce-ledger-head'>
                <span>security &amp; compliance</span>
                <a href='https://trust.inc/generaltranslation' target='_blank' rel='noreferrer'>
                  trust.inc/generaltranslation
                </a>
              </div>
              {COMPLIANCE.map((row) => (
                <div className='tce-lrow' key={row.k}>
                  <span>{row.k}</span>
                  <b>{row.v}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='tc-trust' data-reveal>
        <p className='tc-trust-lead tce-trust-lead'>
          Trusted by the world&rsquo;s best companies — Cursor, Ramp, and Profound ship in over
          thirty languages.
        </p>
        <div className='tc-trust-row'>
          {BRANDS.map((brand) => (
            <div className='tc-trust-cell' key={brand.name}>
              <span className={`tc-wm ${brand.cls}`}>{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
