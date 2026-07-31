'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/** A cell is a check, an em-dash, or a real value — never a badge or a pill.
 *  State is type, per the founder's ban on status ornaments. */
type Cell = { kind: 'yes' } | { kind: 'no' } | { kind: 'text'; value: string };

type Row = {
  name: string;
  /** The mono qualifier after the name — real nouns from the docs. */
  note?: string;
  starter: Cell;
  enterprise: Cell;
};

type Group = { label: string; rows: readonly Row[] };

const YES: Cell = { kind: 'yes' };
const NO: Cell = { kind: 'no' };
const text = (value: string): Cell => ({ kind: 'text', value });

/** Every row is answerable from the published docs and rate card. The two
 *  columns are the only two plans that exist — Starter ($0) and Enterprise. */
const GROUPS: readonly Group[] = [
  {
    label: 'sdks & cli',
    rows: [
      { name: 'Users, projects, languages', starter: text('unlimited'), enterprise: text('unlimited') },
      {
        name: 'SDKs',
        note: 'gt-next · gt-react · gt-react-native · gt-node · gt-python',
        starter: text('open source'),
        enterprise: text('open source'),
      },
      { name: 'Translation CLI', note: 'npx gt@latest', starter: YES, enterprise: YES },
      {
        name: 'File formats',
        note: 'Markdown · MDX · JSON · YAML · HTML · TS/JS · gettext · TXT',
        starter: YES,
        enterprise: YES,
      },
      {
        name: 'Existing i18n files, in place',
        note: 'i18next · next-intl · react-i18next',
        starter: YES,
        enterprise: YES,
      },
      {
        name: 'Development previews',
        note: 'gtx-dev- keys · hot reload',
        starter: YES,
        enterprise: YES,
      },
      {
        name: 'Version branching',
        note: 'per-branch translations · Cloud feature, paid plans',
        starter: NO,
        enterprise: YES,
      },
    ],
  },
  {
    label: 'dashboard & editor',
    rows: [
      {
        name: 'Translation Editor',
        note: 'source and target side by side',
        starter: YES,
        enterprise: YES,
      },
      { name: 'History, diffs, and restore', note: 'versions tagged from the CLI', starter: YES, enterprise: YES },
      {
        name: 'Context Groups',
        note: 'glossary + directives',
        starter: text('organization-level'),
        enterprise: text('shared across projects'),
      },
      {
        name: 'Annotations',
        note: 'labels · notes · comment threads',
        starter: NO,
        enterprise: YES,
      },
      {
        name: 'Roles',
        starter: text('Admin · Developer'),
        enterprise: text('RBAC · custom roles'),
      },
      { name: 'GitHub integration', starter: YES, enterprise: YES },
    ],
  },
  {
    label: 'locadex',
    rows: [
      {
        name: 'Agent runs',
        note: 'internationalizes your code, opens PRs',
        starter: text('$5 / LCU'),
        enterprise: text('$5 / LCU'),
      },
      { name: 'Guarded PRs with visual QA', starter: YES, enterprise: YES },
      {
        name: 'Usage Limit',
        note: 'hard cap — blocks billing, even with auto-reload on',
        starter: YES,
        enterprise: YES,
      },
      {
        name: 'Custom workflows',
        note: 'any format or framework',
        starter: NO,
        enterprise: YES,
      },
    ],
  },
  {
    label: 'delivery',
    rows: [
      {
        name: 'Translation CDN',
        note: 'over-the-air updates, no redeploy',
        starter: YES,
        enterprise: YES,
      },
      { name: 'Locale routing middleware', note: 'localized pathnames · hreflang', starter: YES, enterprise: YES },
      {
        name: 'Runtime translation',
        note: 'content unknown at build time',
        starter: text('$1 / 10k tok'),
        enterprise: text('$1 / 10k tok'),
      },
      {
        name: 'Bundled JSON',
        note: 'serve without the CDN — no request made',
        starter: YES,
        enterprise: YES,
      },
    ],
  },
  {
    label: 'security & support',
    rows: [
      { name: 'SSO', note: 'SAML & OIDC', starter: NO, enterprise: YES },
      { name: 'Webhooks', note: 'signed translation events', starter: NO, enterprise: YES },
      {
        name: 'Compliance reports',
        note: 'SOC 2 Type II · ISO 27001',
        starter: NO,
        enterprise: YES,
      },
      {
        name: 'Support',
        starter: text('Discord community'),
        enterprise: text('Slack + phone'),
      },
      { name: 'Custom SLA', starter: NO, enterprise: YES },
    ],
  },
];

function CellValue({ cell }: { cell: Cell }) {
  if (cell.kind === 'yes') {
    return <span className='tcp-yes' role='img' aria-label='Included' />;
  }
  if (cell.kind === 'no') {
    return (
      <span className='tcp-no' role='img' aria-label='Not included'>
        —
      </span>
    );
  }
  return <span className='tcp-val'>{cell.value}</span>;
}

/**
 * The full comparison as one ruled table: plans as columns, capability rows
 * grouped by area, every rule running edge to edge. The plan header stays
 * pinned under the nav so the columns keep their names all the way down.
 */
export default function PlanLedger() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='compare' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Compare plans.</h2>
        <p data-reveal>
          Both plans run the same toolchain at the same published rates. Enterprise adds
          governance, custom workflows, and the engineers who build the product.
        </p>
      </div>

      <div className='tcp-tbl' role='table' aria-label='Plan comparison: Starter and Enterprise'>
        <div className='tcp-trow tcp-tbl-head' role='row'>
          <span className='tcp-tcap' role='columnheader'>
            capability
          </span>
          <span className='tcp-tplan' role='columnheader'>
            <b>Starter</b>
            <i>$0 / month</i>
          </span>
          <span className='tcp-tplan' role='columnheader'>
            <b>Enterprise</b>
            <i>custom · annual</i>
          </span>
        </div>

        {GROUPS.map((group) => (
          <div className='tcp-tgroup' key={group.label} data-reveal>
            <div className='tcp-trow is-group' role='row'>
              <span className='tcp-tlabel' role='rowheader'>
                {group.label}
              </span>
              <span aria-hidden='true' />
              <span aria-hidden='true' />
            </div>
            {group.rows.map((row) => (
              <div className='tcp-trow' key={row.name} role='row'>
                <span className='tcp-tname' role='cell'>
                  <b>{row.name}</b>
                  {row.note ? <i>{row.note}</i> : null}
                </span>
                <span className='tcp-tcell' role='cell'>
                  <CellValue cell={row.starter} />
                </span>
                <span className='tcp-tcell' role='cell'>
                  <CellValue cell={row.enterprise} />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
