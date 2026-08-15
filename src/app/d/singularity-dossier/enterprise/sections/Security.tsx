'use client';

import { useRef } from 'react';


import DeliveryBoard from './DeliveryBoard';

const LOCALES = ['en', 'es', 'fr', 'ja', 'de', 'zh'] as const;

/** The wiki's own example, drawn literally: a Japanese translator whose
 *  permissions are scoped only to Japanese files. Cells are write access. */
const MEMBERS: readonly {
  who: string;
  role: string;
  grant: (locale: string) => boolean;
  scoped?: boolean;
}[] = [
  { who: 'Mira', role: ('Admin'), grant: () => true },
  { who: 'Sam', role: ('Developer'), grant: () => true },
  {
    who: 'Jun',
    role: ('Translator'),
    grant: (locale) => locale === 'ja',
    scoped: true,
  },
];

/** The sign-on path: three controlled inputs, one platform, one trail. */
const SIGNALS: readonly { k: string; v: string }[] = [
  { k: ('Single sign-on'), v: 'SAML · OIDC' },
  { k: ('API keys'), v: ('organization · project') },
  { k: ('Webhooks'), v: ('signed payloads') },
];

/** The version rail: platform versions on the left, the git metadata the CLI
 *  tags them with beside — newest first, one row restorable. */
const VERSIONS: readonly {
  v: string;
  note: string;
  when: string;
  state?: 'live' | 'restore';
}[] = [
  {
    v: 'v214',
    note: ('tag v2.1.0 · “Added checkout page translations”'),
    when: ('2 min ago'),
    state: 'live',
  },
  { v: 'v213', note: 'commit 0f3a92', when: ('yesterday'), state: 'restore' },
  { v: 'v212', note: 'tag v2.0.0', when: ('3 days ago') },
  { v: 'v211', note: 'commit 7c21e4', when: ('last week') },
  { v: 'v210', note: 'commit b3d9a0', when: ('last week') },
];

/**
 * Security & access: three instruments on the terminus field, each with
 * its own accent — the permission matrix in the house blue, the sign-on
 * path in violet, the version rail in green. All type rides the display
 * face; the marks are squares, never glyphs.
 */
export default function Security() {
  const root = useRef<HTMLElement>(null);

  return (
    <section className='tc-sec' id='security' ref={root}>
      <div className='tc-head'>
          <h2>Access is scoped by role and locale</h2>
          <p>
            Roles scope each person to specific projects and locales.
            Sign-on stays with your identity provider.
          </p>
      </div>

      {/* the terminus field runs behind the access instruments, the
          delivery stage's own ground */}
      <div className='tce-security-stage'>
        <DeliveryBoard />
        <div className='tc-row tce-triple'>
          <div className='tc-cell is-framed'>
            <div className='tc-card tce-bento is-b1'>
                <h3>Permissions scoped to one language</h3>
                <p>
                  RBAC with custom roles. A Japanese translator can edit
                  only Japanese files.
                </p>
              <div
                className='tce-mx'
                role='img'
                aria-label={'Permission matrix: three members against six locales, with Jun granted write access to Japanese only'}
              >
                <div className='tce-mx-row is-head' aria-hidden='true'>
                  <span className='tce-mx-who'>{'Member'}</span>
                  {LOCALES.map((locale) => (
                    <span className='tce-mx-loc' key={locale}>
                      {locale}
                    </span>
                  ))}
                </div>
                {MEMBERS.map((member) => (
                  <div
                    className='tce-mx-row'
                    key={member.who}
                    aria-hidden='true'
                  >
                    <span className='tce-mx-who'>
                      <b>{member.who}</b>
                      <i>{member.role}</i>
                    </span>
                    {LOCALES.map((locale) => {
                      const on = member.grant(locale);
                      return (
                        <span className='tce-mx-cell' key={locale}>
                          <span
                            className={`tce-mx-dot${on ? ' is-on' : ''}${on && member.scoped ? ' is-only' : ''}`}
                          />
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='tc-cell is-framed'>
            <div className='tc-card tce-bento is-b2'>
                <h3>SSO, API keys, and signed webhooks</h3>
                <p>
                  SSO over SAML and OIDC. API keys are split by organization
                  and project. Webhooks are signed.
                </p>
              {/* the signal path: three controlled inputs feed one
                  platform over doubled threads */}
              <div className='tce-sig' aria-hidden='true'>
                <div className='tce-sig-srcs'>
                  {SIGNALS.map((signal) => (
                    <div className='tce-sig-plate' key={signal.v}>
                      <b>{signal.k}</b>
                      <span>{signal.v}</span>
                    </div>
                  ))}
                </div>
                <div className='tce-sig-hub'>
                  <b>General Translation</b>
                    <span>one audit trail</span>
                </div>
              </div>
            </div>
          </div>

          <div className='tc-cell is-framed'>
            <div className='tc-card tce-bento is-b3'>
                <h3>Versioned per locale</h3>
                <p>
                  Tags come from the CLI, so translation history carries your
                  git metadata. Restore any prior state.
                </p>
              <div className='tce-vt' aria-hidden='true'>
                {VERSIONS.map((row) => (
                  <div
                    className={`tce-vt-row${row.state === 'live' ? ' is-live' : ''}`}
                    key={row.v}
                  >
                    <span className='tce-vt-node' />
                    <div className='tce-vt-main'>
                      <b>{row.v}</b>
                      <span>{row.note}</span>
                    </div>
                    <span
                      className={`tce-vt-state${row.state ? ` is-${row.state}` : ''}`}
                    >
                      {row.state === 'live'
                        ? 'live'
                        : row.state === 'restore'
                          ? 'restore'
                          : row.when}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
