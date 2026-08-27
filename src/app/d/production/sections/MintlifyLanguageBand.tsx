import type { ReactNode } from 'react';

import 'flag-icons/css/flag-icons.min.css';

import { MINTLIFY_LANGUAGES } from '../../singularity/company-sections/mintlify-languages';

import { MINTLIFY_FLAG_REGION } from './mintlify-flags';

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className='mintlify-marquee'>
      <div className='mintlify-marquee-track'>{children}</div>
      <div className='mintlify-marquee-track' aria-hidden='true'>
        {children}
      </div>
    </div>
  );
}

function LanguageChip({ code, name }: { code: string; name: string }) {
  const region = MINTLIFY_FLAG_REGION[code];
  return (
    <span className='mintlify-language-chip'>
      {region ? (
        <span
          aria-hidden='true'
          className={`fi fi-${region} inline-block shrink-0`}
        />
      ) : null}
      <span>{name}</span>
      <code>{code}</code>
    </span>
  );
}

/**
 * THE SHIPPED LANGUAGE BAND, reproduced.
 *
 * 1-1 with the `mintlify-language-band` section of MintlifyPage.tsx: one
 * two-track marquee of chips — flag, endonym, Mintlify language code — in
 * the shipped order.
 *
 * THE DATA PATH IS VENDORED. The real band reads
 * MINTLIFY_SUPPORTED_LANGUAGES from
 * @generaltranslation/locales/frameworks/mintlify.js (31 accepted codes) and
 * narrows it in place: the two legacy aliases (cn, jp) drop out, and so does
 * any code whose superset is also in the list (zh-Hans, zh-Hant, fr-CA,
 * pt-BR) — leaving 25 chips. This repo already carries that whole path,
 * spelled out in the open, at ../../singularity/company-sections/
 * mintlify-languages.ts: the raw union copied from
 * packages/locales/src/frameworks/mintlify.ts, both filter rules applied
 * where they can be checked, and the endonyms taken from the generated
 * getLocaleProperties() ledger rather than typed by hand. It is imported
 * here unchanged.
 *
 * ONE WIRE DROPPED. The shipped Marquee reverses its track for an RTL page
 * locale (useLocaleDirection). This control renders English only, so the
 * reverse flag is never set and the prop is not carried.
 */
export default function MintlifyLanguageBand() {
  return (
    <section
      className='tc-sec mintlify-language-band'
      aria-label='Mintlify supported languages'
    >
      <Marquee>
        {MINTLIFY_LANGUAGES.map((language) => (
          <LanguageChip
            key={language.code}
            code={language.code}
            name={language.nativeName}
          />
        ))}
      </Marquee>
    </section>
  );
}
