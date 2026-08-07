const CONTROLS = [
  { title: 'SOC 2 Type II', note: 'Audited annually. Report on request.', file: 'CTRL·01' },
  { title: 'GDPR', note: 'EU data residency. DPA signed same-day.', file: 'CTRL·02' },
  { title: 'ISO 27001', note: 'Certified ISMS across every environment.', file: 'CTRL·03' },
  { title: 'SSO / SAML', note: 'Okta, Entra, anything SAML 2.0 speaks.', file: 'CTRL·04' },
  { title: 'RBAC', note: 'Roles down to the locale and the glossary.', file: 'CTRL·05' },
  { title: 'Custom SLA', note: '99.99% delivery, penalties in writing.', file: 'CTRL·06' },
] as const;

/**
 * Procurement, handled — the controls wall. A dark full-bleed band where
 * each control is a filed certificate: dashed frame, mono file number, the
 * control name in display type. The band exists so security review is a
 * section, not a footnote.
 */
export default function Procurement() {
  return (
    <section className='tc-band sgd-proc' aria-label='Security and compliance controls'>
      <div className='sgd-proc-in'>
        <header className='sgd-proc-head'>
          <h2>Procurement, handled</h2>
          <p>
            Security review is where localization vendors go to die. Send ours to your team
            first — the file is already complete.
          </p>
        </header>
        <div className='sgd-certs'>
          {CONTROLS.map((c) => (
            <article className='sgd-cert' key={c.file}>
              <span className='sgd-cert-file'>{c.file}</span>
              <h3>{c.title}</h3>
              <p>{c.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
