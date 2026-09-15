/**
 * A bay of columns: the T component proved in plan. A 4 by 4 column field,
 * nine bays. The source sits in the central bay as a code window with the
 * `en` chip in its bar; the eight bays around it carry the same string as
 * eight locale builds, each set in its own script with its lang and dir,
 * its flag chip seated beside the bay's column base like a nameplate.
 */
import { SOURCE_STRING, TRANSLATIONS, localeDir, localeName } from '../data';
import { CodeWindow } from './CodeWindow';
import { Rosette } from './deco/Rosette';
import { Bay, Hall, Row } from './deco/Hall';
import { LocaleChip } from './LocaleChip';

const SOURCE_CODE = `<T>\n  <h1>${SOURCE_STRING}</h1>\n</T>`;

function WordBay({ code, text }: { code: string; text: string }) {
  return (
    <Bay className='is-word' lang={code} dir={localeDir(code)}>
      <LocaleChip code={code} className='is-nameplate' />
      <p className='apg-word-text'>{text}</p>
      <span className='apg-word-name' lang='en' dir='ltr'>
        {localeName(code)}
      </span>
    </Bay>
  );
}

export function Proof() {
  const top = TRANSLATIONS.slice(0, 3);
  const west = TRANSLATIONS[3];
  const east = TRANSLATIONS[4];
  const bottom = TRANSLATIONS.slice(5, 8);
  return (
    <section className='apg-hall is-proof' id='proof' aria-labelledby='apg-proof-h'>
      <div className='apg-thresh'>
        <Rosette />
        <h2 id='apg-proof-h'>The T component</h2>
        <p>
          One source string, wrapped in <code>&lt;T&gt;</code>. Every bay around it is one locale
          build, served from the edge.
        </p>
      </div>

      <Hall cols={3} base={76} className='is-proof'>
        <Row>
          {top.map((item) => (
            <WordBay key={item.code} code={item.code} text={item.text} />
          ))}
        </Row>
        <Row>
          {west ? <WordBay code={west.code} text={west.text} /> : null}
          <Bay className='is-source'>
            <CodeWindow
              file='app/page.tsx'
              code={SOURCE_CODE}
              numbers={false}
              mark={SOURCE_STRING}
              className='is-source-win'
              aside={<LocaleChip code='en' source />}
            />
            <span className='apg-source-cap'>source · en</span>
          </Bay>
          {east ? <WordBay code={east.code} text={east.text} /> : null}
        </Row>
        <Row>
          {bottom.map((item) => (
            <WordBay key={item.code} code={item.code} text={item.text} />
          ))}
        </Row>
      </Hall>

      <div className='apg-thresh is-after'>
        <p className='apg-cap'>
          Every bay is a served file: <code>public/_gt/es.json</code>, <code>public/_gt/ja.json</code>,
          one for each locale in the build.
        </p>
      </div>
    </section>
  );
}
