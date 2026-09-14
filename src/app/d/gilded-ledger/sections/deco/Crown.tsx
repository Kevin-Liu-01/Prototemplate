import { GtMark } from '@/components/viewer/GtMark';

/**
 * Crown. Deco home: C1.4, the hero crown. A gold cartouche holding the GT
 * monogram between two doubled gold rules, seated above the h1 the way a
 * title page carries its device above the title. The cartouche ring has one
 * owner; the rules are the --thread-gauge / --thread-gap pair. The mark is
 * decorative here (the sub carries the accessible wordmark), so the whole
 * crown is hidden from assistive technology. It has no motion of its own
 * and enters with the hero's quiet reveal.
 */
export default function Crown() {
  return (
    <div className='gl-crown' data-hero-in aria-hidden='true'>
      <i className='gl-crown-rule' />
      <span className='gl-cartouche'>
        <GtMark width={26} height={17} />
      </span>
      <i className='gl-crown-rule' />
    </div>
  );
}
