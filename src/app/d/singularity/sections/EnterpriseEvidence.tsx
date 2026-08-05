'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import Image from 'next/image';
import { useRef } from 'react';

import { useQuietReveal } from './reveal';

/* Every claim below is sourced: the compliance shields and enterprise plan
   list (feature-inventory §25/§35/§37, trust.inc/generaltranslation), the
   roles reference's own scoped-translator example, the review workspace,
   the Locadex run settings, and the CLI's version tagging. No invented
   numbers, customers, or quotes. */

const CERTS: readonly { file: string; name: string; line: string }[] = [
  { file: 'CTRL·01', name: 'SOC 2 Type II', line: 'Service organization controls, Type II audited.' },
  { file: 'CTRL·02', name: 'GDPR', line: 'EU data-protection compliance.' },
  { file: 'CTRL·03', name: 'ISO 27001', line: 'Certified information security management.' },
] as const;

/** The enterprise plan, as the pricing page lists it. */
const PLAN: readonly { k: string; v: string }[] = [
  { k: 'engineers', v: 'Forward-deployed, on your integration' },
  { k: 'workflows', v: 'Custom, for any format or framework' },
  { k: 'context', v: 'Shared across every project' },
  { k: 'sla', v: 'Custom, in contract' },
  { k: 'support', v: 'Slack + phone' },
  { k: 'security review', v: 'SOC 2 Type II · ISO 27001 · GDPR' },
] as const;

/** Every machine surface, and the control that governs it. */
const MACHINE: readonly { k: string; v: string }[] = [
  { k: 'sso', v: 'SAML & OIDC' },
  { k: 'roles', v: 'Admin · Developer · custom' },
  { k: 'api keys', v: 'organization · project' },
  { k: 'webhooks', v: 'translation events · signed' },
  { k: 'agent secrets', v: 'injected into the sandbox' },
  { k: 'machine docs', v: 'OpenAPI · llms.txt' },
] as const;

const LOCALES = ['en', 'es', 'fr', 'ja', 'de', 'zh'] as const;

/** The wiki's own example, drawn literally: a Japanese translator whose
 *  permissions cover only Japanese files. Cells are write access. */
const MEMBERS: readonly {
  who: string;
  role: string;
  grant: (locale: string) => boolean;
  scoped?: boolean;
}[] = [
  { who: '@mira', role: 'Admin', grant: () => true },
  { who: '@sam', role: 'Developer', grant: () => true },
  { who: '@jun', role: 'Translator', grant: (locale) => locale === 'ja', scoped: true },
];

const KEYS: readonly { k: string; v: string }[] = [
  { k: 'project:write', v: 'Admin · Developer' },
  { k: 'translations:content:write', v: '@jun — ja only' },
] as const;

/** Per-locale review state for one entry — the asymmetry IS the feature. */
const ENTRY_ROWS: readonly {
  code: string;
  lang: string;
  text: string;
  labs: readonly { name: string; ok?: boolean }[];
}[] = [
  { code: 'es', lang: 'es', text: 'Pago recibido', labs: [{ name: 'Approved', ok: true }] },
  { code: 'fr', lang: 'fr', text: 'Paiement reçu', labs: [{ name: 'Needs review' }, { name: 'Legal' }] },
  { code: 'ja', lang: 'ja', text: '支払いを受領しました', labs: [{ name: 'Approved', ok: true }] },
];

/** The version rail: tags carry the git metadata the CLI wrote them with. */
const VERSIONS: readonly { v: string; note: string; when: string; state?: 'live' | 'restore' }[] = [
  { v: 'v214', note: 'tag v2.1.0 — “Added checkout page translations”', when: '2 min ago', state: 'live' },
  { v: 'v213', note: 'commit 0f3a92', when: 'yesterday', state: 'restore' },
  { v: 'v212', note: 'tag v2.0.0', when: '3 days ago' },
  { v: 'v211', note: 'commit 7c21e4', when: 'last week' },
  { v: 'v210', note: 'commit b3d9a0', when: 'last week' },
];

/**
 * The evidence — what enterprises want to see, filed as artifact cells in
 * the ruled sheet: heading + one line + one artifact, nothing else. The
 * compliance wall and the plan ledger, the scoped-permission matrix and
 * the sign-on ledger, the review gate and the guarded Locadex PR, and the
 * version rail closing the file.
 */
export default function EnterpriseEvidence() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='evidence' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Everything your security review will ask.</h2>
        <p data-reveal>
          Full-stack localization across buildtime, runtime, and review — with the controls
          procurement checks already on file. Send this page to your security team first.
        </p>
      </div>

      <div className='tc-row is-even'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Enterprise grade, on file</h3>
            <p>Built for teams with real launch, security, and operational requirements.</p>
            <div className='sge-certs'>
              {CERTS.map((cert) => (
                <article className='sge-cert' key={cert.file}>
                  <span className='sge-cert-file'>{cert.file}</span>
                  <h4>{cert.name}</h4>
                  <p>{cert.line}</p>
                </article>
              ))}
            </div>
            <div className='sge-certs-foot'>
              <span>the complete record</span>
              <a href='https://trust.inc/generaltranslation' target='_blank' rel='noopener noreferrer'>
                trust.inc/generaltranslation
              </a>
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>The enterprise plan, in writing</h3>
            <p>What the contract adds — engineers, workflows, and terms with names on them.</p>
            <div className='sge-ledger'>
              <div className='sge-ledger-head'>
                <span>provision</span>
                <span>enterprise</span>
              </div>
              {PLAN.map((row) => (
                <div className='sge-lrow' key={row.k}>
                  <span>{row.k}</span>
                  <b>{row.v}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='tc-row is-even'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Access is scoped, not granted</h3>
            <p>
              RBAC with custom roles — a Japanese translator whose permissions cover only Japanese
              files.
            </p>
            <div
              className='sge-perm'
              role='img'
              aria-label='Permission matrix: three members against six locales, with @jun granted write access to Japanese only'
            >
              <div className='sge-perm-row is-head' aria-hidden='true'>
                <span className='sge-perm-who'>member · role</span>
                {LOCALES.map((locale) => (
                  <span key={locale}>{locale}</span>
                ))}
              </div>
              {MEMBERS.map((member) => (
                <div className='sge-perm-row' key={member.who} aria-hidden='true'>
                  <span className='sge-perm-who'>
                    <b>{member.who}</b>
                    <i>{member.role}</i>
                  </span>
                  {LOCALES.map((locale) => {
                    const on = member.grant(locale);
                    return (
                      <span className='sge-perm-cell' key={locale}>
                        <span
                          className={`sge-perm-dot${on ? ' is-on' : ''}${on && member.scoped === true ? ' is-only' : ''}`}
                        />
                      </span>
                    );
                  })}
                </div>
              ))}
              <div className='sge-perm-keys'>
                {KEYS.map((key) => (
                  <div className='sge-perm-key' key={key.k}>
                    <code>{key.k}</code>
                    <span>{key.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Your IdP signs people in. Your keys sign the rest.</h3>
            <p>
              SSO over SAML and OIDC, keys split by organization and project, webhooks you can
              verify.
            </p>
            <div className='sge-ledger'>
              <div className='sge-ledger-head'>
                <span>surface</span>
                <span>control</span>
              </div>
              {MACHINE.map((row) => (
                <div className='sge-lrow' key={row.k}>
                  <span>{row.k}</span>
                  <b>{row.v}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      <div className='tc-row is-even'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Nothing ships until someone says so</h3>
            <p>
              Hold a string from the call site, approve it per entry and per locale — Spanish can
              ship while French is still held.
            </p>
            <div className='sge-entry'>
              <div className='sge-entry-bar'>
                <b>checkout.receipt</b>
                <span>Components · ⌘K</span>
              </div>
              <div className='sge-erow is-src'>
                <span className='sge-erow-loc'>source</span>
                <i>Payment received</i>
              </div>
              {ENTRY_ROWS.map((row) => (
                <div className='sge-erow' key={row.code}>
                  <span className='sge-erow-loc'>{row.code}</span>
                  <i lang={row.lang}>{row.text}</i>
                  <span className='sge-labs'>
                    {row.labs.map((lab) => (
                      <span className={`sge-lab${lab.ok === true ? ' is-ok' : ''}`} key={lab.name}>
                        {lab.name}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
              <div className='sge-enote'>
                <span>note · fr</span>legal sign-off required for payment copy
              </div>
              <div className='sge-entry-foot'>
                <span>the gate starts as a prop</span>
                <code>&lt;T $requiresReview&gt;</code>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Locadex works on rails</h3>
            <p>
              The agent&rsquo;s work arrives as a pull request on a prefixed branch — auto-merge
              off by default, merged only after your review.
            </p>
            <div className='sge-pr'>
              <div className='sge-pr-bar'>
                <SiGithub size={12} color='currentColor' aria-hidden />
                <b>locadex/generate-code → main</b>
                <span>PR #218</span>
              </div>
              <div className='sge-pr-diff'>
                <div className='is-hunk'>
                  <i> </i>
                  <code>@@ −12,3 +12,5 @@ app/checkout/page.tsx</code>
                </div>
                <div>
                  <i> </i>
                  <code>{'  <main>'}</code>
                </div>
                <div className='is-del'>
                  <i>−</i>
                  <code>{'    <p>Payment received</p>'}</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>{'    <T>'}</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>{'      <p>Payment received</p>'}</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>{'    </T>'}</code>
                </div>
                <div>
                  <i> </i>
                  <code>{'  </main>'}</code>
                </div>
              </div>
              <div className='sge-pr-meta'>
                <div>
                  <span>
                    <Image
                      className='sge-pr-agent'
                      src='/brand/locadex-light-no-bg.svg'
                      alt=''
                      width={13}
                      height={13}
                    />
                    opened by Locadex
                  </span>
                  <b>branch prefix locadex/</b>
                </div>
                <div>
                  <span>auto-merge</span>
                  <b>off — review required</b>
                </div>
                <div>
                  <span>merged by @sam</span>
                  <b>local edits preserved</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='tc-row is-one'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Rollouts you can take back</h3>
            <p>
              Translations publish to the edge as versions, per locale — tags carry your git
              metadata, and restoring a prior state is one step.
            </p>
            <div className='sge-vers'>
              {VERSIONS.map((row) => (
                <div
                  className={`sge-vrow${row.state === 'live' ? ' is-live' : ''}${row.state === 'restore' ? ' is-restore' : ''}`}
                  key={row.v}
                >
                  <b>{row.v}</b>
                  <span className='sge-vnote'>{row.note}</span>
                  <span className='sge-vstate'>
                    {row.state === 'live' ? 'live' : row.state === 'restore' ? 'restore ↩' : row.when}
                  </span>
                </div>
              ))}
              <div className='sge-cmd'>
                <span>$</span>npx gt translate --tag v2.1.0 -m &quot;Added checkout page
                translations&quot;
              </div>
              <p className='sge-vers-foot'>
                A history entry is a source version — inline edits never create one.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
