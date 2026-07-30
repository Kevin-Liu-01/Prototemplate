import StorySection from '@/components/shared/StorySection';

import KineticText from '../components/KineticText';
import { STORY_CAPTIONS } from '../lib/content';

/**
 * Acts II + III — the shared nine-beat scroll story, skinned to this
 * direction: soft machined radii, a display heading that flexes with scroll
 * velocity, and the paper sheet in the same off-white the hero cards use.
 */
export default function Story() {
  return (
    <StorySection
      className='kv-story-sec'
      id='how'
      heading={<KineticText className='kv-kin' text='How it works' intro='scroll' baseWeight={700} flex={0.8} />}
      subheading='One page, translated where it lives, then shipped by an agent that opens the pull request.'
      sliderMode='slide'
      captions={STORY_CAPTIONS}
      navSelector='.kinetic-verba-root .kv-nav'
      siteName='kettle.co'
      /* Paced against this page's own height so every beat owns a band of the
         scroll rather than sharing one: the sheet's rise, ingest, the cursor's
         pass, the <T> reveal, the context reveal, the counsel ping, the scan,
         the agent's edits and the return each land in their own stretch. */
      scrollLength={{ desktop: 18400, mobile: 5340 }}
    />
  );
}
