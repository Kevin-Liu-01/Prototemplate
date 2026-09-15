import { HELLO, OUTPUTS, T_SOURCE } from '../data';
import { Code } from './Code';
import { Chip } from './deco/Chip';
import { Tablero, Talud, Terrace } from './deco/Terrace';

/**
 * The proof of the T component. One tablero split in two: the source file
 * on the left, and on the right the translations the build returns, each
 * laid as an inset stone panel with its locale chip. Under the split, a
 * ledger of the formatted values the same markup produces. The talud
 * beneath carries every locale of the proof as a jade inset chip.
 */
export default function Proof() {
  return (
    <Terrace tier={4} className='tt-proof' id='proof'>
      <Tablero depth={2}>
        <header className='tt-head'>
          <h2 className='tt-h2'>The T component</h2>
          <p>Wrap the markup once. The build ships every locale from the same source file.</p>
        </header>
        <div className='tt-proof-split'>
          <div className='tt-proof-source'>
            <Code file={T_SOURCE.file} code={T_SOURCE.code} />
          </div>
          <ul className='tt-stones' aria-label='The heading, as the build returns it in six locales'>
            {HELLO.map((row) => (
              <li key={row.code} className='tt-stone'>
                <p className='tt-stone-text' lang={row.lang} dir={row.rtl ? 'rtl' : 'ltr'}>
                  {row.text}
                </p>
                <Chip code={row.code} />
              </li>
            ))}
          </ul>
        </div>
        <ul className='tt-outputs' aria-label='Formatted values from the same markup'>
          {OUTPUTS.map((out) => (
            <li key={out.capability} className='tt-output'>
              <span className='tt-output-cap'>{out.capability}</span>
              <code className='tt-output-val'>{out.value}</code>
              <Chip code={out.code} />
            </li>
          ))}
        </ul>
      </Tablero>
      <Talud relief='stone' className='is-chips'>
        <ul className='tt-inset-chips' aria-label='Locales in this proof'>
          <li>
            <Chip code='en' jade />
          </li>
          {HELLO.map((row) => (
            <li key={row.code}>
              <Chip code={row.code} jade />
            </li>
          ))}
        </ul>
      </Talud>
    </Terrace>
  );
}
