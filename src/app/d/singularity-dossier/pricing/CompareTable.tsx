import { Check, X } from 'lucide-react';
import Link from 'next/link';

import CompareDitherMotif from './CompareDitherMotif';

/**
 * Compare plans as one framed ruled table on the section's own gut,
 * its top and bottom rules running edge to edge — the ¥€$ motif
 * standing at the heading's right. Static data, the live page's rows.
 */

type Cell = string | true | false;
type Row = readonly [string, Cell, Cell];
type Group = { head: string; rows: readonly Row[] };

const GROUPS: readonly Group[] = [
  {
    head: 'Pricing',
    rows: [
      ['Platform Fee', '$0', 'Custom'],
      ['Usage Rates', 'View rates', 'Custom'],
    ],
  },
  {
    head: 'Core Products',
    rows: [
      ['Locadex AI Agent', true, 'Custom Workflows'],
      ['Open-Source SDKs', true, true],
      ['Translation CLI', true, true],
      ['Context Platform', true, true],
      ['Translation CDN', true, true],
      ['Version Branching', true, true],
    ],
  },
  {
    head: 'Platform',
    rows: [
      ['Languages', 'Unlimited', 'Unlimited'],
      ['Projects', 'Unlimited', 'Unlimited'],
      ['Users', 'Unlimited', 'Unlimited'],
      ['Context Groups', true, true],
      ['Keyword Glossary', true, true],
      ['Custom Prompts', true, true],
      ['Translation Editor', true, true],
      ['Custom Roles', false, true],
      ['Webhooks', false, true],
      ['SOC 2 Type II Certification', false, true],
      ['ISO 27001 Certification', false, true],
      ['SSO (SAML & OIDC)', false, true],
    ],
  },
  {
    head: 'Support',
    rows: [
      ['Support on GitHub', true, true],
      ['Email Support', true, true],
      ['Discord Support', true, true],
      ['Slack Support', false, true],
      ['Phone Support', false, true],
    ],
  },
];

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check className='is-yes' aria-label='Included' />;
  if (value === false) return <X className='is-no' aria-label='Not included' />;
  return <span>{value}</span>;
}

export default function CompareTable() {
  return (
    <section id='features' className='tc-sec pricing-compare'>
      <div className='pricing-compare-head'>
        <h2>Compare plans</h2>
        <CompareDitherMotif />
      </div>
      <div className='pricing-compare-grid'>
        <table>
          <thead>
            <tr>
              <th aria-hidden='true' />
              <th className='is-starter' scope='col'>
                <b>Starter</b>
                <span>From $0</span>
                <Link
                  className='pricing-plan-cta is-solid'
                  href='/d/singularity-dossier'
                >
                  Get Started
                </Link>
              </th>
              <th scope='col'>
                <b>Enterprise</b>
                <span>Contact Us</span>
                <Link
                  className='pricing-plan-cta'
                  href='/d/singularity-dossier/contact'
                >
                  Contact Us
                </Link>
              </th>
            </tr>
          </thead>
          {GROUPS.map((group) => (
            <tbody key={group.head}>
              <tr className='pricing-compare-group'>
                <th colSpan={3} scope='colgroup'>
                  {group.head}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row[0]}>
                  <th scope='row'>{row[0]}</th>
                  <td className='is-starter'>
                    <CellValue value={row[1]} />
                  </td>
                  <td>
                    <CellValue value={row[2]} />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
