'use client';

import { useId, useState } from 'react';

import LocaleTag, { localeFlag } from '@/app/d/toolchain/components/LocaleTag';
import LocaleFlag, { getLocaleFlagCountryCode } from '@/components/shared/LocaleFlag';

import { Choice } from './controls';
import Plate from './Plate';

const PICKS = ['ar', 'en-GB', 'zh-Hant', 'pt', 'hi', 'sr-Latn', 'tlh'] as const;

const SET = ['en-GB', 'es', 'ja', 'ar-EG', 'ko', 'zh-Hant', 'hi', 'pt', 'de', 'fr', 'he', 'th'] as const;

type Chip = 'pill' | 'row';

/** The country a resolver answered, as its upper-case code, or a dash-free word when it has none. */
function answer(code: string | undefined): string {
  return code ? code.toUpperCase() : 'none';
}

/**
 * The two flag resolvers side by side. LocaleTag (the Toolchain chip)
 * reads its own 20-language map, and an explicit region wins. LocaleFlag
 * (the port of gt-cloud's shared component) asks Intl.Locale for the
 * likely region. They agree on most codes and differ on a few, such as
 * ar, which LocaleTag flies as Saudi Arabia and LocaleFlag as Egypt.
 */
export default function LocaleTagDemo() {
  const inputId = useId();
  const [code, setCode] = useState('ar');
  const [chip, setChip] = useState<Chip>('pill');
  const trimmed = code.trim();
  const tag = trimmed ? localeFlag(trimmed) : undefined;
  const flag = trimmed ? getLocaleFlagCountryCode(trimmed) : undefined;
  const agree = tag === flag;

  return (
    <Plate
      controls={
        <>
          <div className='dmo-field'>
            <label className='dmo-field-label' htmlFor={inputId}>
              Locale code
            </label>
            <input
              autoCapitalize='off'
              autoComplete='off'
              className='dmo-input'
              id={inputId}
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.currentTarget.value.slice(0, 24))}
            />
          </div>
          <Choice
            label='Try'
            options={PICKS.map((value) => ({ value, label: value }))}
            value={(PICKS as readonly string[]).includes(trimmed) ? trimmed : ''}
            onChange={setCode}
          />
          <Choice
            label='Host chip'
            options={[
              { value: 'pill', label: 'Pill' },
              { value: 'row', label: 'Bare' },
            ]}
            value={chip}
            onChange={setChip}
          />
        </>
      }
      fit
      label={`Locale code ${trimmed || 'empty'}: LocaleTag answers ${answer(tag)}, LocaleFlag answers ${answer(flag)}`}
      stageClassName='dmo-locale'
      tag={`<LocaleTag code='${trimmed}' />`}
    >
      <div className='dmo-locale-compare'>
        <div className='dmo-locale-cell'>
          <p className='dmo-locale-name'>LocaleTag</p>
          <span className={chip === 'pill' ? 'dmo-pill-tag' : 'dmo-bare-tag'}>
            <LocaleTag code={trimmed || '?'} />
          </span>
          <p className='dmo-locale-why'>
            Country <span className='dmo-locale-code'>{answer(tag)}</span> from its own map
          </p>
        </div>
        <div className='dmo-locale-cell'>
          <p className='dmo-locale-name'>LocaleFlag</p>
          <span className={chip === 'pill' ? 'dmo-pill-tag' : 'dmo-bare-tag'}>
            <span className='dmo-flag-row'>
              <LocaleFlag className='dmo-flag' locale={trimmed || 'und'} />
              <span className='dmo-locale-code'>{trimmed || '?'}</span>
            </span>
          </span>
          <p className='dmo-locale-why'>
            Country <span className='dmo-locale-code'>{answer(flag)}</span> from Intl.Locale
          </p>
        </div>
        <p className={agree ? 'dmo-locale-verdict' : 'dmo-locale-verdict is-split'} role='status'>
          {agree ? 'The two resolvers agree.' : 'The two resolvers fly different flags for this code.'}
        </p>
      </div>
      <div className='dmo-locale-set' aria-label='A set of locale chips'>
        {SET.map((loc) => (
          <span className={chip === 'pill' ? 'dmo-pill-tag' : 'dmo-bare-tag'} key={loc}>
            <LocaleTag code={loc} />
          </span>
        ))}
      </div>
    </Plate>
  );
}
