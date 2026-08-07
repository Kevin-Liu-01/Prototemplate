'use client';

import Link from 'next/link';
import { useState } from 'react';

import CommandSearch from './CommandSearch';
import ThemeToggle from './ThemeToggle';
import { DIRECTIONS } from '@/lib/directions';

/**
 * The prototemplate nav — one component for every pt page (index, brand,
 * docs). Desktop: brand, then theme · search · Brand · Docs · Sites (the
 * three completed-site previews; the toolchain SSOT stays out of the
 * menu) · Present · GitHub. On a phone the link row stands down behind a
 * burger — two stacked hairlines, the brand's doubled line — that opens a
 * ruled sheet under the bar: one row per destination, the nav's own
 * border-bottom still the single close.
 */
const SITES = DIRECTIONS.filter((d) => d.site);

const GITHUB_URL = 'https://github.com/Kevin-Liu-01/Prototemplate';

export default function PtNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className='pt-nav'>
      <Link className='pt-nav-brand' href='/' onClick={close}>
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
        <CommandSearch />
        <Link className='pt-nav-link' href='/brand'>
          Brand
        </Link>
        <Link className='pt-nav-link' href='/docs'>
          Docs
        </Link>
        {/* the three completed sites as a previewing dropdown */}
        <div className='pt-menu'>
          <button className='pt-menu-trigger' type='button'>
            Sites <span aria-hidden>▾</span>
          </button>
          <div className='pt-menu-panel'>
            <div className='pt-menu-card'>
              {SITES.map((d) => (
                <Link className='pt-menu-item' href={`/d/${d.slug}`} key={d.slug}>
                  <span aria-hidden className='pt-menu-shot'>
                    <img alt='' className='is-light' loading='lazy' src={`/shots/light/${d.slug}.jpg`} />
                    <img alt='' className='is-dark' loading='lazy' src={`/shots/dark/${d.slug}.jpg`} />
                  </span>
                  <span>{d.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Link className='pt-nav-present' href='/present'>
          Present <span aria-hidden>▶</span>
        </Link>
        <a
          aria-label='View the source on GitHub'
          className='pt-nav-github'
          href={GITHUB_URL}
          rel='noreferrer'
          target='_blank'
        >
          <svg aria-hidden fill='currentColor' height='20' viewBox='0 0 16 16' width='20'>
            <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z' />
          </svg>
        </a>
        <button
          aria-controls='pt-nav-sheet'
          aria-expanded={open}
          className='pt-nav-burger'
          type='button'
          onClick={() => setOpen((v) => !v)}
        >
          <i aria-hidden />
          <i aria-hidden />
          <span className='pt-sr-only'>Menu</span>
        </button>
      </div>
      {/* the phone sheet: a ruled list under the bar; the nav's own close
          still draws the bottom line once */}
      <nav className='pt-nav-sheet' hidden={!open} id='pt-nav-sheet' aria-label='Site'>
        <Link href='/' onClick={close}>
          Index
        </Link>
        <Link href='/brand' onClick={close}>
          Brand
        </Link>
        <Link href='/docs' onClick={close}>
          Docs
        </Link>
        {SITES.map((d) => (
          <Link href={`/d/${d.slug}`} key={d.slug} onClick={close}>
            {d.name}
            <span className='pt-nav-sheet-tag'>site</span>
          </Link>
        ))}
        <Link href='/present' onClick={close}>
          Present
        </Link>
        <a href={GITHUB_URL} rel='noreferrer' target='_blank' onClick={close}>
          GitHub
        </a>
      </nav>
    </header>
  );
}
