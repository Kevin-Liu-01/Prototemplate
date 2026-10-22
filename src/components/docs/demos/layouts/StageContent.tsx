'use client';

import type { CSSProperties } from 'react';

import { PAGE_NAMES } from '@/lib/page-names';
import type { ShellItem } from '@/lib/shell-data';

/* the deck's slide: inset 57px, padded 72px by 80px, an h2 at 44px and a paragraph at 22px (deck/parts/head.html) */
const SLIDE_VARS = { '--sl-h2': '44px', '--sl-h2-lh': 1.1, '--sl-p': '22px', '--sl-p-lh': 1.5 } as CSSProperties;

/** A slide's body in the 1600 by 900 stage: the section's title and its one-line description. */
export function SlideBody({ item }: { item: ShellItem | undefined }) {
  return (
    <div className='dmo-lay-slide' style={SLIDE_VARS}>
      <p className='dmo-lay-slide-h2'>{item?.title ?? ''}</p>
      <p className='dmo-lay-slide-p'>{item?.desc ?? ''}</p>
    </div>
  );
}

function Bars({ n, size, lh, widths }: { n: number; size: string; lh: number; widths: readonly string[] }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span className='dmo-lay-ln' key={i} style={{ '--ln-size': size, '--ln-lh': lh, '--ln-w': widths[i % widths.length] } as CSSProperties}>
          <i />
        </span>
      ))}
    </>
  );
}

/**
 * A book page in the reading column, as a skeleton: the title at d1, the
 * lead and the panel on one row, the mast's rule, the hatch band and the
 * first divider, at the book tokens' values. The column is the flow
 * sheet's own (.pt-flow-col); the rules run across the stage. On a model
 * of a phone the tokens take their 900px-and-under values on the model's
 * root, since the media queries follow the real viewport.
 */
export function BookModel({ narrow }: { narrow: boolean }) {
  return (
    <div className={narrow ? 'dmo-lay-book is-narrow' : 'dmo-lay-book'}>
      <div className='dmo-lay-book-mast'>
        <p className='dmo-lay-book-title'>{PAGE_NAMES.brand.name}</p>
        <div className='dmo-lay-book-lead'>
          <Bars lh={1.55} n={3} size='var(--pt-t-lead)' widths={['100%', '100%', '62%']} />
        </div>
        <dl className='dmo-lay-book-panel'>
          {['Updated', 'Sections', 'Canon', 'Reading'].map((key) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>
                <i />
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className='dmo-lay-book-band' />
      <div className='dmo-lay-book-sec'>
        <span className='dmo-lay-book-note'>Section 1</span>
        <Bars lh={1.05} n={1} size='var(--pt-d2)' widths={['7em']} />
      </div>
    </div>
  );
}
