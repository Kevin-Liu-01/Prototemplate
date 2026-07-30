'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import StorySection from '@/components/shared/StorySection';

import { DOCK_CAPTIONS } from '../data';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Timeline seconds bracketing the counsel card's resolve. The shared timeline
 * cross-fades its approved plate in over 62.8–63.6; the card's own contents are
 * pulled out just ahead of it so no frame ever shows both states at once.
 */
const APPROVE_IN = 62.5;
const APPROVE_OUT = 63.15;

/**
 * Acts II and III — the shared nine-beat story, run as a broadcast segment.
 *
 * The lower third holds one bar and one bar only: the caption slate. The
 * language crawl that used to run under it is gone — the broadcast identity is
 * carried by the display type and the marquee slabs, not by furniture. Two
 * runtime values are published to CSS for the skin to consume:
 *
 * - `--tb-fieldgate` follows the editor plate's own opacity, so the prismatic
 *   field can only ever screen onto black. It can never smear the paper act.
 * - `--tb-approve` empties the counsel card just before its approved plate
 *   lands, which resolves the cross-fade the two states used to share.
 */
export default function Story() {
  useGSAP(() => {
    const section = document.querySelector<HTMLElement>('.tb-root .tb-story');
    const stage = section?.querySelector<HTMLElement>('[data-stage]');
    const code = section?.querySelector<HTMLElement>('.gts-code');
    if (!section || !stage || !code) return;

    const pinned = ScrollTrigger.getAll().find((t) => t.pin === stage);
    const timeline = pinned?.animation;

    let lastGate = '';
    let lastApprove = '';
    const frame = () => {
      const gate = (Number(code.style.opacity) || 0).toFixed(3);
      if (gate !== lastGate) {
        stage.style.setProperty('--tb-fieldgate', gate);
        lastGate = gate;
      }

      const t = timeline ? timeline.time() : 0;
      const approve = gsap.utils.clamp(0, 1, (t - APPROVE_IN) / (APPROVE_OUT - APPROVE_IN)).toFixed(3);
      if (approve !== lastApprove) {
        section.style.setProperty('--tb-approve', approve);
        lastApprove = approve;
      }
    };
    frame();
    gsap.ticker.add(frame);

    return () => {
      gsap.ticker.remove(frame);
    };
  });

  return (
    <StorySection
      className='tb-story'
      id='tb-story'
      heading={
        <>
          Every string,
          <br />
          <span className='tb-out'>translated in place</span>
        </>
      }
      subheading='One site, from source to shipped: GT reads the context, the agent edits the code, and the pull request opens itself.'
      sliderMode='slide'
      captions={DOCK_CAPTIONS}
      navSelector='.tb-root .tb-nav'
      scrollLength={{ desktop: 6950, mobile: 5000 }}
      siteName='acme.com'
    />
  );
}
