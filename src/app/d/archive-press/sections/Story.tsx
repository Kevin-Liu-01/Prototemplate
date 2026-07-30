'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import StorySection from '@/components/shared/StorySection';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Acts II + III — the shared nine-beat story, skinned as a squared film frame. */
export default function Story() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current?.querySelector<HTMLElement>('.ap-story');
      const stage = section?.querySelector<HTMLElement>('.gts-stage');
      if (!section || !stage) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* The stage is sticky, so the last screen of the section scrapes it up
         past the fold — a squashed horizontal sliver of the demo site with the
         caption dock still riding on it. The story is finished by then (the pin
         releases exactly when the section's bottom meets the fold), so cut the
         light on the frame rather than letting it be shaved away.

         Act IV is pulled up under this travel (styles.css, `.ap-story`
         margin-bottom), so this is a real cross-dissolve into the workspace,
         not a fade to black — which is why it is kept short. */
      gsap.to(stage, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'bottom bottom',
          end: 'bottom 86%',
          scrub: true,
        },
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <StorySection
        className='ap-story'
        id='story'
        heading='The whole pipeline'
        subheading='One page, translated in place, then shipped by an agent. Scroll to run it.'
        sliderMode='slide'
        /* nine beats in 5000px at 390 wide: the shared default overshoots the
           narrow layout and parks beat 5 between its own fade-in and fade-out */
        scrollLength={{ desktop: 8200, mobile: 5000 }}
        navSelector='[data-ap-nav]'
      />
    </div>
  );
}
