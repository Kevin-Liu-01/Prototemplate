'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { REVIEW_ROWS } from '../data';
import { reducedMotion, useRise } from '../reveal';
import Register from './deco/Register';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Seconds per character: the translation trails the source by a beat. */
const SRC_PACE = 0.038;
const TR_PACE = 0.046;

/**
 * The review workspace as a three-register stele: the bar above, source
 * beside translation in the field, the tool line below. Revision state is
 * carried by type and stamps, never by color: the star row shows its
 * previous translation struck through above the new one. One row writes
 * itself at a time on a single paused timeline played once when the stele
 * reaches 80 percent of the viewport; every other row sits complete, so the
 * still at any frame reads as a finished editor. Under reduced motion the
 * resting DOM is that still.
 */
export default function Review() {
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  useRise(root);

  useGSAP(
    () => {
      const el = field.current;
      if (!el || reducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>('[data-row]', el);
      const tl = gsap.timeline({ paused: true });

      rows.forEach((row) => {
        const src = row.querySelector<HTMLElement>('[data-src]');
        const tr = row.querySelector<HTMLElement>('[data-tr]');
        const stamp = row.querySelector<HTMLElement>('[data-stamp]');
        if (!src || !tr) return;
        const srcText = src.textContent ?? '';
        const trText = tr.textContent ?? '';
        const state = { s: 0, t: 0 };
        // the row clears only when its own turn comes; every other row sits complete
        tl.call(() => {
          src.textContent = '';
          tr.textContent = '';
          if (stamp) stamp.textContent = 'translating';
        });
        tl.to(state, {
          s: srcText.length,
          duration: srcText.length * SRC_PACE,
          ease: 'none',
          snap: 's',
          onUpdate: () => {
            src.textContent = srcText.slice(0, state.s);
          },
        });
        tl.to(
          state,
          {
            t: trText.length,
            duration: trText.length * TR_PACE,
            ease: 'none',
            snap: 't',
            onUpdate: () => {
              tr.textContent = trText.slice(0, state.t);
            },
          },
          '<0.4'
        );
        if (stamp) {
          const finalText = stamp.dataset.final ?? 'approved';
          tl.call(() => {
            stamp.textContent = finalText;
          });
        }
        tl.to({}, { duration: 0.35 });
      });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => tl.play(),
      });
    },
    { scope: root }
  );

  return (
    <Register k={2} id='review' className='sf-review'>
      <div ref={root} className='sf-review-in'>
        <header className='sf-head'>
          <h2 className='sf-h2' data-rise>
            Review, source beside translation
          </h2>
          <p className='sf-lead' data-rise>
            The editor holds the source and its translation in one place. Locadex proposes, a reviewer approves,
            and every edit keeps its history.
          </p>
        </header>

        <div className='sf-stele' data-rise>
          <div className='sf-stele-bar'>
            <span>workspace · es-419</span>
            <span>4 strings</span>
          </div>

          <div className='sf-stele-field' ref={field}>
            <div className='sf-stele-heads' aria-hidden='true'>
              <span>source · en</span>
              <span>translation · es</span>
              <span>state</span>
            </div>
            {REVIEW_ROWS.map((row) => (
              <div className='sf-stele-row' key={row.key} data-row>
                <span className='sf-stele-src' lang='en' data-src>
                  {row.source}
                </span>
                <span className='sf-stele-tr' lang='es'>
                  {row.previous ? (
                    <s className='sf-stele-prev' data-prev>
                      {row.previous}
                    </s>
                  ) : null}
                  <span data-tr>{row.translation}</span>
                </span>
                <span className='sf-stamp' data-stamp data-final={row.final === 'edit' ? 'edited' : 'approved'}>
                  {row.final === 'edit' ? 'edited' : 'approved'}
                </span>
              </div>
            ))}
          </div>

          <div className='sf-stele-foot'>
            <span>⌘K search</span>
            <span>history</span>
            <span>download</span>
            <span className='is-right'>agent · locadex</span>
          </div>
        </div>
      </div>
    </Register>
  );
}
