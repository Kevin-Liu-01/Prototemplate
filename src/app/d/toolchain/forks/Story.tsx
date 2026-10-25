'use client';

import { Quote } from 'lucide-react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import { useQuietReveal } from '../sections/reveal';

import StoryStage from './story/StoryStage';
import { BEATS } from './story/beats';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The forks' story section, acts II and III, as a read rather than a pinned
 * ride: the nine beats are a list, the stage beside them is a pure function of
 * the current beat, and the pipeline is a band under the stage. Scrolling only
 * decides which beat is current; nothing pins or takes over the scroll. Each
 * fork imports its own rescoped `story/story.css`.
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
