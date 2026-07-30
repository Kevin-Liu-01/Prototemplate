import StorySection from '@/components/shared/StorySection';

import { STORY_CAPTIONS } from '../content';

/** Acts II + III — the shared nine-beat story, poured into concrete. */
export default function Story() {
  return (
    <StorySection
      className='cm-story'
      id='story'
      heading='How it works'
      subheading='One page, translated in place, then shipped by an agent. Scroll to run the machine.'
      sliderMode='slide'
      captions={STORY_CAPTIONS}
      navSelector='[data-cm-nav]'
      siteName='example.com'
      /* Solved against this page's own height rather than copied: with the
         section rhythm above and below it, this pin length is what puts each
         viewport-height step of the scroll on a composed beat — the <T> reveal,
         the context reveal, the editor act, the marks, the merged PR — instead
         of on the transitions between them. Re-solved after the tail sections
         were tightened, since every px removed below the pin moves the sampled
         depths through the timeline. */
      scrollLength={{ desktop: 4790, mobile: 3800 }}
    />
  );
}
