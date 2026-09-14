'use client';

import { useRef } from 'react';

import Chip from './Chip';
import CourtHead from './CourtHead';
import Cornice from './deco/Cornice';
import { REVIEW_ROWS, TILES, VARIANTS } from './data';
import { useCourtReveal } from './reveal';

/**
 * The inner court: languages as material. A register band across the
 * passage, one tile per locale with its endonym in its own script and
 * direction and its flag chip, the tiles separated by register lines; then
 * the variants that matter; then the review stele, source beside
 * translation, with the state carried by a stamp.
 */
export default function InnerCourt() {
  const root = useRef<HTMLElement>(null);
  useCourtReveal(root);

  return (
    <section className='pg-court pg-inner' id='languages' ref={root}>
      <div className='pg-passage'>
        <CourtHead
          n={3}
          title='Languages as material'
          sub='100+ languages, and the variants that matter. Each tile below is a locale named in its own script, with its direction set.'
        />

        <ul className='pg-reg'>
          {TILES.map((tile) => (
            <li className='pg-reg-tile' key={tile.code} data-reveal>
              <span className='pg-reg-word' lang={tile.code} dir={tile.rtl ? 'rtl' : 'ltr'}>
                {tile.native}
              </span>
              <span className='pg-reg-meta'>
                <span>{tile.name}</span>
                <Chip code={tile.code} />
              </span>
            </li>
          ))}
        </ul>

        <div className='pg-var'>
          {VARIANTS.map((row) => (
            <div className='pg-var-row' key={row.tag}>
              <code className='pg-var-tag'>{row.tag}</code>
              <b className='pg-var-name'>{row.name}</b>
              <span className='pg-var-chips'>
                {row.variants.map((variant) => (
                  <Chip code={variant} key={variant} tell={variant === 'zh-Hans' || variant === 'zh-Hant'} />
                ))}
              </span>
            </div>
          ))}
          <p className='pg-var-note'>
            <span>zh-Hant is not zh-Hans. Both ship.</span>
            <span>78 base languages, 129 distinct locale tags.</span>
          </p>
        </div>

        <div className='pg-stele-wrap'>
          <h3 className='pg-h3'>Review</h3>
          <p className='pg-lead'>Source beside translation in one workspace. Revision state is carried by the stamp.</p>

          <div className='pg-stele' data-reveal>
            <Cornice className='pg-stele-cap' />
            <div className='pg-stele-box'>
              <div className='pg-stele-bar'>
                <span>workspace · es-419</span>
                <span>4 strings</span>
              </div>
              <div className='pg-stele-cols'>
                <span>source · en</span>
                <span>translation · es</span>
              </div>
              {REVIEW_ROWS.map((row) => (
                <div className='pg-stele-row' key={row.key}>
                  <div className='pg-stele-cell' lang='en'>
                    {row.source}
                  </div>
                  <div className='pg-stele-cell' lang='es'>
                    {row.previous ? <s className='pg-stele-prev'>{row.previous}</s> : null}
                    <span>{row.translation}</span>
                    <span className='pg-stamp' data-kind={row.state}>
                      {row.state === 'approved' ? 'approved' : 'edited'}
                    </span>
                  </div>
                </div>
              ))}
              <div className='pg-stele-foot'>
                <span>⌘K search · history · download</span>
                <span>agent · locadex</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
