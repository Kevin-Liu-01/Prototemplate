import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import SteleField from '../diagrams/deco/SteleField';
import WedgeRule from '../diagrams/deco/WedgeRule';
import { CLI_TERMINAL, DEPLOY_LEAD, LINKS, STACK_PLANES } from './content';
import Shelf, { Tablet } from './Shelf';

/**
 * Tablet VI, the stele: the page's one dark moment. Black stone among the
 * clay, and it stays black in both themes. The stack stands in seven
 * registers from source to screen, then the gt cli terminal beside the
 * closing acts, then the wedge dither in motion at the foot.
 */
export default function Stele() {
  return (
    <Shelf
      id='stack'
      label={{
        numeral: 'VI',
        name: 'The stele',
        note: 'Black stone. The stack in seven registers, source to screen. The field at the foot is the wedge dither in motion.',
      }}
    >
      <Tablet size='full' className='ct-stele'>
        <header className='ct-reg ct-head'>
          <h2>The stack, end to end</h2>
          <p>From source code to the translated string on a user’s screen. Each plane taps the same rail.</p>
        </header>

        <WedgeRule />

        <ol className='ct-planes'>
          {STACK_PLANES.map((plane) => (
            <li className='ct-plane' key={plane.numeral}>
              <span className='ct-plane-n'>{plane.numeral}</span>
              <h3>{plane.name}</h3>
              <p>{plane.fact}</p>
            </li>
          ))}
        </ol>

        <div className='ct-cols ct-stele-cols'>
          <div className='ct-col'>
            <div className='ct-term is-stone'>
              <div className='ct-term-line' data-tone='cmd'>
                {CLI_TERMINAL.prompt}
              </div>
              <div className='ct-term-line'>{CLI_TERMINAL.summary}</div>
              <div className='ct-term-chips'>
                {CLI_TERMINAL.locales.map((code) => (
                  <LocaleTag code={code} className='ct-lct' key={code} />
                ))}
              </div>
            </div>
          </div>
          <div className='ct-col ct-stele-acts'>
            <p className='ct-stele-lead'>{DEPLOY_LEAD}</p>
            <div className='ct-acts'>
              <a className='ct-btn ct-btn-solid' href={LINKS.signin}>
                Get Started
              </a>
              <a className='ct-btn ct-btn-line' href={LINKS.contact}>
                Talk to an Engineer
              </a>
            </div>
          </div>
        </div>

        <div className='ct-reg ct-stele-field'>
          <SteleField />
        </div>
      </Tablet>
    </Shelf>
  );
}
