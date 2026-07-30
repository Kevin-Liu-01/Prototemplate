import StorySection from '@/components/shared/StorySection';

import { DOCK_CAPTIONS } from '../data';

/**
 * Acts II + III — the shared nine-beat pinned story, skinned to the foundry's
 * machined plate (see the `--gts-*` block in styles.css).
 *
 * The pin length is re-timed for this round: tightening the section rhythm
 * shortened the page, and every scroll depth fell back into an earlier beat —
 * the counsel ping in particular landed on the drawn webhook curve a beat
 * before the card arrives.
 */
export default function Story() {
  return (
    <StorySection
      className='bf-story'
      id='bf-story'
      heading='One page, translated in place, then shipped by an agent.'
      subheading='Scroll: GT reads the context, rewrites every node in the layout, hands the edge cases to your reviewer, and lets Locadex open the pull request.'
      captions={DOCK_CAPTIONS}
      navSelector='.bento-foundry-root .bf-nav'
      siteName='example.com'
      scrollLength={{ desktop: 8800, mobile: 3800 }}
    />
  );
}
