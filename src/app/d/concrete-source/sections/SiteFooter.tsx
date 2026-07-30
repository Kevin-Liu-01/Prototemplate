import { FOOTER_COLUMNS } from '../content';

/** Footer mark is the same authored "GT" lockup as the nav, at 28px. */
export default function SiteFooter() {
  return (
    <footer aria-label='Footer'>
      <div className='foot-grid'>
        <div className='foot-brand'>
          <span className='gtsq'>GT</span>
          <p>
            GENERAL TRANSLATION, INC.
            <br />
            LANGUAGE INFRASTRUCTURE
            <br />
            FOR THE INTERNET.
            <br />
            <br />
            SOC 2 TYPE II · GDPR · ISO 27001
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div className='foot-col' key={col.title}>
            <span className='k'>{col.title}</span>
            {col.links.map(([href, label], i) => (
              <a href={href} key={`${col.title}-${i}`}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className='foot-bottom'>
        <span>© 2026 GENERAL TRANSLATION, INC. ALL RIGHTS RESERVED.</span>
        <span>BUILT LIKE HEAVY MACHINERY · 118 LOCALES · $0 TO START</span>
      </div>
    </footer>
  );
}
