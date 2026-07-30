import type { ReactNode } from 'react';

import { ARTIFACTS, type Artifact } from '../data';

/**
 * The English artifacts that fall into the lens and the localized artifacts
 * that come back out. Both faces render together; the hero driver crossfades
 * them (and re-measures the shell) at the moment the item crosses the well.
 */

function faces(kind: Artifact['kind']): { en: ReactNode; tr: ReactNode } {
  switch (kind) {
    case 'button':
      return {
        en: <span className='fm-a-btn'>Get started</span>,
        tr: <span className='fm-a-btn'>始める</span>,
      };
    case 'toast':
      return {
        en: (
          <span className='fm-a-toast'>
            <i className='fm-a-dot' />
            Payment received
          </span>
        ),
        tr: (
          <span className='fm-a-toast'>
            <i className='fm-a-dot' />
            Paiement reçu
          </span>
        ),
      };
    case 'field':
      return {
        en: (
          <span className='fm-a-field'>
            <b>Email address</b>
            <i className='fm-a-input' />
          </span>
        ),
        tr: (
          <span className='fm-a-field'>
            <b>Correo electrónico</b>
            <i className='fm-a-input' />
          </span>
        ),
      };
    case 'price':
      /* one feature line, not two: the card's height budget is set by its
         altitude lane — see the disjoint-lane table in ../data.ts */
      return {
        en: (
          <span className='fm-a-price'>
            <b>Pro — $20/mo</b>
            <i>✓ Unlimited projects</i>
          </span>
        ),
        tr: (
          <span className='fm-a-price'>
            <b>Pro — 20 $/Monat</b>
            <i>✓ Unbegrenzte Projekte</i>
          </span>
        ),
      };
    case 'nav':
      /* the RTL lane: the nav re-emerges right-to-left in Arabic */
      return {
        en: (
          <span className='fm-a-nav'>
            <i>Docs</i>
            <i>Pricing</i>
            <i>Blog</i>
          </span>
        ),
        tr: (
          <span className='fm-a-nav'>
            <i>المستندات</i>
            <i>الأسعار</i>
            <i>المدونة</i>
          </span>
        ),
      };
    case 'copy':
      return {
        en: <span className='fm-a-copy'>Hello, world!</span>,
        tr: <span className='fm-a-copy'>مرحبا بالعالم</span>,
      };
    case 'chip':
      return {
        en: <span className='fm-a-chip'>New — Locadex agent</span>,
        tr: <span className='fm-a-chip'>Nouveau — l’agent Locadex</span>,
      };
    case 'theo':
      return {
        en: (
          <span className='fm-a-theo'>
            <span className='fm-a-who'>
              <i className='fm-a-av'>T</i>
              <span>
                <b>Theo</b>
                <em>CEO, T3Chat</em>
              </span>
            </span>
            {/* the quote's own closing sentence — the card's height budget is
                set by its altitude lane (see the lane table in ../data.ts) */}
            <span className='fm-a-quote'>
              “Internationalization went from &quot;$%!# this&quot; to &quot;trivial&quot;.”
            </span>
          </span>
        ),
        tr: (
          <span className='fm-a-theo'>
            <span className='fm-a-who'>
              <i className='fm-a-av'>T</i>
              <span>
                <b>Theo</b>
                <em>CEO, T3Chat</em>
              </span>
            </span>
            <span className='fm-a-quote'>
              «La internacionalización pasó de “$%!# esto” a “trivial”.»
            </span>
          </span>
        ),
      };
  }
}

export default function StreamArtifacts() {
  return (
    <>
      {ARTIFACTS.map((item) => {
        const content = faces(item.kind);
        return (
          <div className='fm-art' data-art={item.id} key={item.id}>
            <div className='fm-art-shell' data-art-shell>
              <div className='fm-art-face fm-art-en' data-art-en>
                {content.en}
              </div>
              {/* No floating locale tag on the emerged face: a deep plate's dark
                  body vanishes into the trough and the white tag was left
                  orbiting the gate as a stray label — resend's hero carries
                  zero of those. The translated string itself names the locale. */}
              <div
                className='fm-art-face fm-art-tr'
                data-art-tr
                lang={item.lang}
                dir={item.rtl ? 'rtl' : undefined}
              >
                {content.tr}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
