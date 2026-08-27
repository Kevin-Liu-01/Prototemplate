'use client';

import { useRef } from 'react';

import { localeFlag } from '@/app/d/toolchain/components/LocaleTag';

import { MINTLIFY_LANGUAGES, MINTLIFY_SUPPORTED_LANGUAGES } from './mintlify-languages';
import { useQuietReveal } from '../sections/reveal';

import 'flag-icons/css/flag-icons.min.css';

/**
 * The live page runs this band as a two-track marquee. This direction files
 * it instead: the same chips — flag, endonym, Mintlify language code — laid
 * out as one ruled sheet, the way the pricing FAQ replaces the live
 * accordion with a still ledger. Nothing is dropped; every language the
 * marquee cycles is on the page at once, and the rule-label carries the
 * arithmetic behind the list.
 */
export default function MintlifyLanguages() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const total = MINTLIFY_SUPPORTED_LANGUAGES.length;
  const shown = MINTLIFY_LANGUAGES.length;

  return (
    <section
      aria-label='Mintlify supported languages'
      className='tc-sec cpm-langs'
      ref={root}
    >
      <div className='cpm-lang-rule' data-reveal>
        <span>Mintlify supported languages</span>
        <i>
          {shown} languages &middot; {total} accepted codes
        </i>
      </div>

      <ul className='cpm-lang-grid' data-reveal>
        {MINTLIFY_LANGUAGES.map((language) => {
          const flag = localeFlag(language.code);
          return (
            <li className='cpm-chip' key={language.code}>
              {flag ? (
                <span aria-hidden='true' className={`cpm-chip-flag fi fi-${flag}`} />
              ) : null}
              <span dir={language.dir}>{language.nativeName}</span>
              <code>{language.code}</code>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
