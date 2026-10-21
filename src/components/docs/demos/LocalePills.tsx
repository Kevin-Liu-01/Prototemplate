'use client';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import '@/app/craft/craft.css';

export type LocalePillsProps = {
  /** the locale codes in order, the source locale first */
  codes: readonly string[];
  /** the mono corner tag: the file the roster comes from */
  tag: string;
  /** what the plate shows, for assistive technology */
  label: string;
};

/**
 * A row of LocaleTag pills on a build log plate: a locale roster set as
 * the chips the site draws. LocaleTag brings the flag stylesheet, so the
 * plate loads through lazy.tsx and only on a page that shows it.
 */
export default function LocalePills({ codes, tag, label }: LocalePillsProps) {
  return (
    <div className='ptc-plate is-pills' role='img' aria-label={label}>
      <div className='ptc-pills'>
        {codes.map((code) => (
          <span key={code} className='ptc-pill'>
            <LocaleTag code={code} />
          </span>
        ))}
      </div>
      <span className='ptc-plate-tag' aria-hidden='true'>
        {tag}
      </span>
    </div>
  );
}
