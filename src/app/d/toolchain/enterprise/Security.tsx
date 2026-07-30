'use client';

import { ShieldCheck } from 'lucide-react';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

const LOCALES = ['en', 'es', 'fr', 'ja', 'de', 'zh'] as const;

/** The wiki's own example, drawn literally: a Japanese translator whose
 *  permissions are scoped only to Japanese files. Cells are write access. */
const MEMBERS: readonly { who: string; role: string; grant: (locale: string) => boolean; scoped?: boolean }[] = [
  { who: '@mira', role: 'Admin', grant: () => true },
  { who: '@sam', role: 'Developer', grant: () => true },
  { who: '@jun', role: 'Translator', grant: (locale) => locale === 'ja', scoped: true },
];

/** Real permission keys from the roles reference — the matrix, spelled out. */
const KEYS: readonly { k: string; v: string }[] = [
  { k: 'project:write', v: 'Admin · Developer' },
  { k: 'translations:content:write', v: '@jun — ja only' },
  { k: 'Manage Locadex secrets', v: 'Admin' },
];

/** Every machine surface, and the control that governs it. */
const MACHINE: readonly { k: string; v: string }[] = [
  { k: 'sso', v: 'SAML & OIDC' },
  { k: 'roles', v: 'Admin · Developer · custom' },
  { k: 'api keys', v: 'organization · project' },
  { k: 'webhooks', v: 'translation events · signed' },
  { k: 'agent secrets', v: 'injected into the sandbox' },
  { k: 'machine docs', v: 'OpenAPI · llms.txt' },
];

/**
 * Security & access: the permission matrix beside the sign-on ledger. The
 * matrix is the one diagram on the page that spends the accent — on the
 * single cell that is the argument, @jun's ja.
 */
export default function Security() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='security' ref={root}>
      <div className='tc-head'>
        <ShieldCheck className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Access is scoped, not granted.</h2>
        <p data-reveal>
          Roles scope people to projects and to locales, sign-on belongs to your identity provider,
          and every machine surface is keyed and signed.
        </p>
      </div>

      <div className='tc-row is-even'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>One language, and nothing else</h3>
            <p>
              RBAC with custom roles — a Japanese translator whose permissions cover only Japanese
              files.
            </p>
            <div className='tce-perm' role='img' aria-label='Permission matrix: three members against six locales, with @jun granted write access to Japanese only'>
              <div className='tce-perm-row is-head' aria-hidden='true'>
                <span className='tce-perm-who'>member · role</span>
                {LOCALES.map((locale) => (
                  <span className='tce-perm-loc' key={locale}>
                    {locale}
                  </span>
                ))}
              </div>
              {MEMBERS.map((member) => (
                <div className='tce-perm-row' key={member.who} aria-hidden='true'>
                  <span className='tce-perm-who'>
                    <b>{member.who}</b>
                    <i>{member.role}</i>
                  </span>
                  {LOCALES.map((locale) => {
                    const on = member.grant(locale);
                    return (
                      <span className='tce-perm-cell' key={locale}>
                        <span
                          className={`tce-perm-dot${on ? ' is-on' : ''}${on && member.scoped ? ' is-only' : ''}`}
                        />
                      </span>
                    );
                  })}
                </div>
              ))}
              <div className='tce-perm-keys'>
                {KEYS.map((key) => (
                  <div className='tce-perm-key' key={key.k}>
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
            <div className='tce-ledger'>
              <div className='tce-ledger-head'>
                <span>controls</span>
                <span>enterprise</span>
              </div>
              {MACHINE.map((row) => (
                <div className='tce-lrow' key={row.k}>
                  <span>{row.k}</span>
                  <b>{row.v}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
