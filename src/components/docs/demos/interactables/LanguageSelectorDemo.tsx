'use client';

import LanguageSelector from '@/app/d/production/sections/LanguageSelector';

import Plate from '../Plate';

import './interactables.css';

/**
 * The live site's language selector as the production mirror rebuilds it:
 * the Languages glyph, the current language and a chevron, opening a
 * popover of the site's eight locales above the trigger. It sits at the
 * right end of a footer strip, where the live footer seats it, so the
 * popover has the stage above it to open into. The mirror is a stub:
 * choosing a language closes the popover and changes nothing.
 */
export default function LanguageSelectorDemo() {
  return (
    <Plate
      height={420}
      label='The language selector at the right end of a footer strip, opening upward'
      stageClassName='ixa-lang'
      tag='<LanguageSelector />'
    >
      <div className='toolchain-root prod-root ixa-lang-root'>
        <div className='ixa-lang-foot'>
          <LanguageSelector />
        </div>
      </div>
    </Plate>
  );
}
