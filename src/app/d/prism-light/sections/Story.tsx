'use client';

import { Quote } from 'lucide-react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import { useQuietReveal } from './reveal';
import StoryStage from './story/StoryStage';
import { BEATS } from './story/beats';
import './story/story.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Acts II and III, authored for this direction instead of borrowed from the
 * shared storyboard.
 *
 * The shared section is a pinned camera over a fixed-size mock: it works at
 * 1440 and shreds at 390, it draws its pipeline on top of the code, and its
 * callouts are positioned outside the window it belongs to. None of that suits
 * a page whose whole argument is a ruled column that nothing crosses.
 *
 * So the story here is a read, not a ride. The nine beats are a list; the stage
 * beside them is a pure function of which beat you are on; and the pipeline is
 * a band under the stage. There is no camera, no pin, and no scroll hijack —
 * scrolling only decides which beat is current, which is exactly the amount of
 * motion this direction has anywhere else on the page.
 */
export default function Story() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useQuietReveal(root);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-beat]', root.current);

      /* One trigger per beat. `toggleClass` would be cheaper, but the stage is
         React state — the scene has to be re-rendered, not re-styled.
         Enter callbacks rather than `isActive`: past the last beat there is no
         active trigger, and a reader who has scrolled off the end should still
         be looking at beat nine rather than whatever was last live. It also
         survives a jump that crosses several beats in one frame, which is
         exactly what a screenshot pass does. */
      for (const [i, el] of items.entries()) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 62%',
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      }
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tc-story' id='story' ref={root}>
      <div className='tc-head'>
        <Quote className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>How a string becomes a shipped translation.</h2>
        <p data-reveal>
          Nine beats, from the JSX you already wrote to the pull request that ships it in six
          languages. Scroll to follow it.
        </p>
      </div>

      <div className='tc-story-grid'>
        <div className='tc-story-side'>
          <div className='tc-story-sticky'>
            <StoryStage beat={active} />
          </div>
        </div>

        <ol className='tc-story-beats'>
          {/* No index marks: the active beat is said with ink weight alone. */}
          {BEATS.map((beat, i) => (
            <li className='tcs-beat' data-beat data-on={i === active} key={beat.n}>
              <div className='tcs-beat-text' data-reveal>
                <h3>{beat.title}</h3>
                <p>{beat.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
