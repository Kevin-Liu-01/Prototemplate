const TERMS = [
  {
    title: 'Forward-deployed engineers',
    note: 'Ours sit with yours until the integration ships. Not a support queue, a team.',
  },
  {
    title: 'Security review, pre-cleared',
    note: 'SOC 2 Type II, GDPR, ISO 27001, SSO/SAML, RBAC. The file is ready for procurement.',
  },
  {
    title: 'An SLA with teeth',
    note: '99.99% delivery at the edge, penalties in writing, a named human on call.',
  },
] as const;

/**
 * The assurance strip: three ruled columns for the people who sign the
 * contract rather than write the code. No cards, no ornament — terms.
 */
export default function Assurance() {
  return (
    <section className='sgs-assurance' aria-label='Enterprise terms'>
      {TERMS.map((t) => (
        <article className='sgs-term' key={t.title}>
          <h3>{t.title}</h3>
          <p>{t.note}</p>
        </article>
      ))}
    </section>
  );
}
