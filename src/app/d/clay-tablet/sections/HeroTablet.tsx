import { GtMark } from '@/components/viewer/GtMark';

import Seal from '../diagrams/deco/Seal';
import WedgeField from '../diagrams/deco/WedgeField';
import WedgeRule from '../diagrams/deco/WedgeRule';
import { rosetteFrieze } from '../fields';
import { CUSTOMERS, HERO_SUB, INSTALL_COMMAND, LINKS, TRUST_LEAD } from './content';
import CopyCommand from './CopyCommand';
import HeroClaim from './HeroClaim';
import Shelf, { Tablet } from './Shelf';

const FRIEZE_W = 1180;
const FRIEZE_H = 328;

/**
 * Tablet I, the largest in the case. Three registers: the claim with its
 * sub, its two acts, and the install command, with the lapis seal at the
 * corner; the rosette frieze in wedge dither; and the colophon, the six
 * customer marks ruled into six cells under one sentence (A5).
 */
export default function HeroTablet() {
  return (
    <Shelf
      id='claim'
      className='is-first'
      label={{
        numeral: 'I',
        name: 'The claim',
        note: 'Top register: the claim, re-impressed locale by locale. Middle register: a rosette frieze in wedge dither. The seal carries the mark.',
      }}
    >
      <Tablet size='hero' className='ct-hero'>
        <div className='ct-reg ct-hero-top'>
          <div className='ct-hero-copy'>
            <HeroClaim />
            <p className='ct-hero-sub'>
              <span className='ct-wordmark'>
                <GtMark width={30} height={19} />
                <span className='ct-vh'>General Translation</span>
              </span>{' '}
              {HERO_SUB}
            </p>
            <div className='ct-acts'>
              <a className='ct-btn ct-btn-solid' href={LINKS.signin}>
                Get Started
              </a>
              <a className='ct-btn ct-btn-line' href={LINKS.docs}>
                Docs
              </a>
            </div>
            <CopyCommand text={INSTALL_COMMAND} />
          </div>
          <Seal numeral='I' caption='General Translation' />
        </div>

        <WedgeRule />

        <div className='ct-reg ct-hero-frieze'>
          <WedgeField
            field={rosetteFrieze({ count: 5, aspect: FRIEZE_W / FRIEZE_H })}
            width={FRIEZE_W}
            height={FRIEZE_H}
            cell={12}
            slice
          />
        </div>

        <div className='ct-reg ct-colophon'>
          <p className='ct-colophon-lead'>{TRUST_LEAD}</p>
          <ul className='ct-marks'>
            {CUSTOMERS.map((customer) => (
              <li className='ct-marks-cell' key={customer.key}>
                <span className={`ct-wm is-${customer.key}`} role='img' aria-label={customer.name} />
              </li>
            ))}
          </ul>
        </div>
      </Tablet>
    </Shelf>
  );
}
