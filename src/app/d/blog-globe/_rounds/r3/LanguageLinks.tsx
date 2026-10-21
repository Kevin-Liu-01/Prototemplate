'use client';

import { useId } from 'react';
import { useGT, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';

import './language-links.css';

type LanguageLinksProps = {
  /** The radios' name; by default one of the group's own. */
  name?: string;
  /** Each stop's year after its name, in small text. */
  years?: boolean;
  className?: string;
};

/* The five languages as words in a line of text, each underlined like a
   link in the article: solid under the current one, dotted under the rest.
   Native radios sit under the words, so the choice works without
   JavaScript and with the arrow keys; a figure's engine listens for their
   change events. */
export default function LanguageLinks({
  name,
  years = false,
  className,
}: LanguageLinksProps) {
  const gt = useGT();
  const m = useMessages();
  const own = useId();
  return (
    <div
      role='radiogroup'
      aria-label={gt('Language')}
      className={className ? `gl ${className}` : 'gl'}
      data-testid='blog-globe-languages'
    >
      {STOPS.map((stop, i) => (
        <label key={stop.lang} className='gl-opt'>
          <input
            type='radio'
            className='gl-input'
            name={name ?? own}
            value={stop.lang}
            defaultChecked={i === 0}
          />
          <span className='gl-name' lang={stop.lang} dir={stop.dir}>
            {stop.label}
          </span>
          {years ? <span className='gl-year'>{m(stop.yearLabel)}</span> : null}
        </label>
      ))}
    </div>
  );
}
