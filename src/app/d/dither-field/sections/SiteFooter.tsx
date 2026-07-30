import Image from 'next/image';

const COLUMNS = [
  {
    title: 'Guides',
    links: ['Locadex Agent', 'Next.js', 'React', 'React Native'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Blog', 'Pricing', 'Supported Locales'],
  },
  {
    title: 'Company',
    links: ['Careers', 'Contact', 'GitHub', 'Discord'],
  },
  {
    title: 'Legal',
    links: ['Terms of Service', 'Privacy', 'Acceptable Use', 'Manage Cookies'],
  },
];

/** Quiet close: the same rules, one more time, then nothing. */
export default function SiteFooter() {
  return (
    <footer className='tc-sec'>
      <div className='tc-foot'>
        <div className='tc-foot-brand'>
          <Image src='/brand/no-bg-gt-logo-light.png' alt='General Translation' width={30} height={30} />
          <p>End-to-end localization for the world&rsquo;s best companies.</p>
        </div>

        <div className='tc-foot-cols'>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link}>
                    <a href='#top'>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className='tc-foot-bar'>
        <span>© 2026 General Translation, Inc. All rights reserved.</span>
        <span>SOC 2 Type II · GDPR · ISO 27001</span>
      </div>
    </footer>
  );
}
