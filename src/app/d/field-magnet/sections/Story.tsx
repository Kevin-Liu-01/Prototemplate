import StorySection from '@/components/shared/StorySection';

import { DOCK_CAPTIONS } from '../data';

/**
 * The shared nine-beat story. This is the direction where the code reveals are
 * popups — overlay panels anchored beside the zoomed component.
 */
export default function Story() {
  return (
    <StorySection
      className='fm-story'
      id='story'
      heading='How it works'
      subheading='One page, translated in place, then shipped by an agent that opens the pull request.'
      sliderMode='popup'
      captions={DOCK_CAPTIONS.slice(0, 11)}
      navSelector='.field-magnet-root .fm-nav'
      /* Pacing, not an arbitrary number.
         A pinned scrub maps depth linearly, so where each tenth of the page
         lands in the nine beats is fixed by three numbers: the scroll above the
         pin, the pin length, and the scroll below it. Solved against the other
         two, this length puts one hold in every beat — including the scanline
         sweep and the numbered code marks, which the previous length skipped
         straight over, and the returned translated site, which it overshot into
         the un-pin. Mobile only gets one hold inside the story, so its length
         is solved to land that hold on the counsel beat, which is the one that
         composes at 390px. */
      scrollLength={{ desktop: 8334, mobile: 3920 }}
    />
  );
}
