import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';

import BarDot from '../components/BarDot';
import GlyphKey from '../components/GlyphKey';
import { FOOTER_COLUMNS, type FooterLink } from '../data';

/**
 * The back board of the codex. Both drawn GT marks (the theme shows one)
 * and one sentence; the sign key, the twelve glyphs of the vocabulary
 * named; four link columns separated by rhythm; and the closing bar with
 * the copyright year in bar and dot and the compliance line. Only the
 * sign key's rule and the closing bar draw a hairline.
 */
function Mark({ mark }: { mark: FooterLink['mark'] }) {
  switch (mark) {
    case 'next':
      return <SiNextdotjs className='sfc-foot-ico' color='currentColor' aria-hidden />;
    case 'react':
      return <SiReact className='sfc-foot-ico' color='currentColor' aria-hidden />;
    case 'github':
      return <SiGithub className='sfc-foot-ico' color='currentColor' aria-hidden />;
    case 'discord':
      return <SiDiscord className='sfc-foot-ico' color='currentColor' aria-hidden />;
    case 'locadex':
      return (
        <img className='sfc-foot-ico is-locadex' src='/brand/no-bg-locadex-logo-light.png' alt='' width={14} height={14} />
      );
    default:
      return null;
  }
}

export default function Colophon() {
  return (
    <footer className='sfc-foot'>
      <div className='sfc-foot-brand'>
        <span className='sfc-foot-mark'>
          <img className='is-light' src='/brand/no-bg-gt-logo-light.png' alt='General Translation' width={44} height={44} />
          <img className='is-dark' src='/brand/no-bg-gt-logo-dark.png' alt='General Translation' width={44} height={44} />
        </span>
        <p className='sfc-p'>General Translation builds full-stack infrastructure for localizing apps, docs, and websites.</p>
      </div>

      <section className='sfc-foot-signs' aria-labelledby='sfc-signs-title'>
        <h4 id='sfc-signs-title'>Signs used in this codex</h4>
        <GlyphKey />
      </section>

      <div className='sfc-foot-cols'>
        {FOOTER_COLUMNS.map((column) => (
          <nav className='sfc-foot-col' aria-label={column.title} key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} rel={link.href.startsWith('http') ? 'noreferrer' : undefined}>
                    <Mark mark={link.mark} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className='sfc-foot-bar'>
        <span className='sfc-foot-year'>
          <BarDot n={2026} layout='row' scale={0.8} />
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
        </span>
        <span>SOC 2 Type II · GDPR · ISO 27001</span>
      </div>
    </footer>
  );
}
