import Image from 'next/image';

import { FOOTER_COLUMNS } from '../components/content';

export default function TerminusFooter() {
  return (
    <footer className='ft-footer'>
      <div className='ft-wrap'>
        <div className='ft-foot-grid'>
          <div className='ft-foot-brand'>
            <span className='ft-nav-brand'>
              <span className='ft-mark'>
                <Image src='/brand/no-bg-gt-logo-dark.png' alt='' width={24} height={24} />
              </span>
              <span>General Translation</span>
            </span>
            <span className='ft-foot-compliance'>
              SOC 2 TYPE II · GDPR · ISO 27001
              <br />
              LANGUAGE INFRASTRUCTURE FOR THE INTERNET
            </span>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div className='ft-foot-col' key={column.title}>
              <h5>{column.title}</h5>
              <ul>
                {column.links.map((link) => (
                  <li key={link}>
                    <a href='#ft-top'>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className='ft-foot-bottom'>
          <span>General Translation, Inc.</span>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
