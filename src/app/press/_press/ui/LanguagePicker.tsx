import { LANGS, type LangCode } from '../stories';

type Props = { value: LangCode; onPick: (code: LangCode) => void };

/* The language the titles are set in, by its code (EN, ES, ZH and the
   rest) in one hairline box, the chosen one filled in and set in the
   press's blue; each code's name is its own language's name for itself,
   for a screen reader. A language is not a country, so the codes stand
   without flags; the flags stay in the locator (rack.css, .gtp-langpick). */
export default function LanguagePicker({ value, onPick }: Props) {
  return (
    <div className='gtp-langpick'>
      <div className='gtp-langpick-codes' role='radiogroup' aria-label='Language of the titles'>
        {LANGS.map((l) => (
          <button key={l.code} type='button' role='radio' aria-checked={l.code === value} aria-label={l.name} onClick={() => onPick(l.code)}>
            {l.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
