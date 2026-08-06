import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Fraunces, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import Markdown from './markdown';
import { DOCS } from './registry';
import ThemeToggle from '@/components/shared/ThemeToggle';

import '../prototemplate.css';
import './docs.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], variable: '--font-fraunces', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });

/**
 * The docs shell — the repo documents served as pages, in the pt grammar:
 * the ruled column, the nav, a mono switcher naming the set, and the
 * document itself as an article. Files are read from the app root at build
 * time; the ship loop rsyncs them to the mirror alongside src/.
 */
export function readDoc(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8');
}

export default function DocsShell({
  active,
  source,
}: {
  /** the active doc slug, or null for the index (README) */
  active: string | null;
  source: string;
}) {
  return (
    <main className={`pt-root ${fraunces.variable} ${grotesk.variable}`}>
      <div className='pt-rail'>
        <header className='pt-nav'>
          <Link className='pt-nav-brand' href='/'>
            <span className='pt-mark' aria-hidden>
              <i className='pt-mark-line is-h is-top' />
              <i className='pt-mark-line is-h is-bot' />
              <i className='pt-mark-line is-v is-l' />
              <i className='pt-mark-line is-v is-r' />
              <i className='pt-mark-fill' />
            </span>
            <span className='pt-brand-word'>
              <b className='pt-face-serif'>proto</b>
              <b className='pt-face-grot'>template</b>
            </span>
          </Link>
          <div className='pt-nav-right'>
            <ThemeToggle className='pt-nav-theme' />
            <Link href='/'>Index</Link>
            <Link href='/brand'>Brand</Link>
            <Link href='/craft'>Craft</Link>
            <Link className='pt-nav-present' href='/present'>
              Present <span aria-hidden>▶</span>
            </Link>
          </div>
        </header>

        {/* the set, named once: mono chips under the nav — the active doc
            is the only ink */}
        <nav aria-label='Documents' className='pt-sec ptd-tabs'>
          <Link data-on={active === null} href='/docs'>
            readme
          </Link>
          {DOCS.map((doc) => (
            <Link data-on={active === doc.slug} href={`/docs/${doc.slug}`} key={doc.slug}>
              {doc.slug}
            </Link>
          ))}
        </nav>

        <article className='pt-post ptd-doc'>
          <section className='pt-sec pt-post-sec'>
            <Markdown source={source} />
          </section>
        </article>

        <div className='pt-hatch' aria-hidden='true' />

        <section className='pt-sec pt-post-sec'>
          <p className='pt-site-links'>
            <Link href='/'>back to the index</Link>
            <span aria-hidden> · </span>
            <Link href='/craft'>read the build log</Link>
            <span aria-hidden> · </span>
            <Link href='/present'>walk the deck</Link>
          </p>
        </section>

        <footer className='pt-foot'>
          <span className='pt-foot-brand'>
            <span className='pt-mark' aria-hidden>
              <i className='pt-mark-line is-h is-top' />
              <i className='pt-mark-line is-h is-bot' />
              <i className='pt-mark-line is-v is-l' />
              <i className='pt-mark-line is-v is-r' />
              <i className='pt-mark-fill' />
            </span>
            Prototemplate
          </span>
          <span className='pt-foot-right'>prototype × template</span>
        </footer>
      </div>
    </main>
  );
}
