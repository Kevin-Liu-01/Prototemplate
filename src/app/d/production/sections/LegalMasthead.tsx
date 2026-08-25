import { LEGAL_DOCS } from './legal-docs';

/**
 * The legal index's head — the whole copy deck of the live page
 * (apps/landing/src/app/[locale]/(home)/legal/page.tsx): the title, the one
 * line under it, and the count of published documents set on the same
 * baseline at the right of the block.
 *
 * There is deliberately NO kicker and NO section head here. The live page
 * prints exactly these three strings before the ledger begins; a label above
 * the rows would be this control inventing structure the page does not have.
 *
 * The count is derived from the vendored library rather than written down, so
 * it stays the real number (seven) the way the live page derives it from
 * getAllLegalDocuments().
 */
export default function LegalMasthead() {
  return (
    <section className='tc-sec legal-index-hero'>
      <div className='legal-index-hero-copy'>
        <h1>Legal Resources</h1>
        <p>
          Policies, terms, and data processing information for General
          Translation.
        </p>
      </div>
      <span>{LEGAL_DOCS.length} published documents</span>
    </section>
  );
}
