'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fragment, useRef } from 'react';

import LanguageWheel from '@/components/shared/LanguageWheel';

import { FAN_DEG, frameAt, maxRadius, rayScreenAngle, smooth } from './heroGeometry';
import { HERO_NODES } from './heroNodes';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The hero stage: drafted rays and the component pairs riding them outward in
 * perspective, emerging from the canonical LanguageWheel at the vanishing point.
 *
 * Pairs are mirrored by construction — index 2i is the English face on the left
 * arm of a ray, index 2i+1 is its translation on the right arm at exactly the
 * same offset — so the left/right reading of the composition is legible at any
 * frame rather than depending on where two independent loops happen to be.
 *
 * The dial itself is the shared component, skinned through `--gtw-*` in
 * styles.css — this direction owns the ray-fan, not a second wheel.
 */
export default function HeroFlow() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const nodes = gsap.utils.toArray<HTMLElement>('[data-node]');
      const wheel = stage.querySelector<HTMLElement>('.ba-wheel');

      /* Each translated card is measured against its English twin once, so the
         run can animate real container geometry — the box visibly grows to fit
         the translation instead of the text swapping inside a fixed frame. */
      const widths = new Map<HTMLElement, { from: number; to: number }>();
      const measure = () => {
        widths.clear();
        for (let i = 0; i < nodes.length; i += 2) {
          const en = nodes[i]?.querySelector<HTMLElement>('[data-card]');
          const out = nodes[i + 1]?.querySelector<HTMLElement>('[data-card]');
          if (!en || !out) continue;
          en.style.width = '';
          out.style.width = '';
          widths.set(out, { from: en.offsetWidth, to: out.offsetWidth });
        }
      };

      measure();
      void document.fonts?.ready.then(() => {
        measure();
        ScrollTrigger.refresh();
      });

      const progress = HERO_NODES.map((n) => n.phase);
      let radius = maxRadius(stage.clientWidth);
      let halfStage = stage.clientWidth / 2;
      let dialR = (wheel?.offsetWidth ?? 236) / 2;

      const paint = () => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const pair = HERO_NODES[i >> 1];
          const u = progress[i >> 1];
          const deg = pair ? FAN_DEG[pair.ray] : undefined;
          if (!node || u === undefined || deg === undefined) continue;
          const card = node.querySelector<HTMLElement>('[data-card]');
          if (!card) continue;

          const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
          const f = frameAt(u, deg, side, radius);

          node.style.transform =
            `translate(-50%, -50%) translate3d(${f.x.toFixed(1)}px, ${f.y.toFixed(1)}px, ${f.z.toFixed(1)}px) ` +
            `rotate(${f.tangent.toFixed(2)}deg) scale(${(1 + f.stretch).toFixed(3)}, ${(1 - f.stretch * 0.34).toFixed(3)}) ` +
            `rotate(${(-f.tangent).toFixed(2)}deg)`;

          /* Visibility is decided in projected screen pixels, from this card's
             own apparent box — never from a fixed radius. A component is
             invisible until its box is clear of the dial's bezel (in x or in
             y, since the steep rays clear it over the top), and it is gone
             before its outer edge can reach the frame. Both ramps scale with
             the frame, so a 390px phone gets the same guarantees as a desktop:
             nothing smudges the mark, nothing is ever sliced by the bezel. */
          const sx = Math.abs(f.x * f.project);
          const sy = Math.abs(f.y * f.project);
          const halfW = (card.offsetWidth / 2) * f.project;
          const halfH = (card.offsetHeight / 2) * f.project;

          const gap = Math.max(sx - (dialR + halfW), sy - (dialR + halfH));
          const room = halfStage - 6 - (sx + halfW);
          const ramp = Math.min(76, halfStage * 0.22);

          const appear = smooth(0, ramp, gap);
          const opacity = appear * smooth(0, ramp, room);
          const blur = (1 - appear) * 3.4;

          card.style.opacity = opacity.toFixed(3);
          card.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';

          const w = widths.get(card);
          if (w) card.style.width = `${(w.from + (w.to - w.from) * f.resize).toFixed(1)}px`;
        }
      };

      paint();
      if (reduced) return;

      let ticking = false;
      const tick = (_t: number, dt: number) => {
        const seconds = Math.min(dt, 64) / 1000;
        for (let i = 0; i < progress.length; i++) {
          const spec = HERO_NODES[i];
          const u = progress[i];
          if (!spec || u === undefined) continue;
          progress[i] = (u + seconds / spec.duration) % 1;
        }
        paint();
      };
      const startTicker = () => {
        if (ticking) return;
        ticking = true;
        gsap.ticker.add(tick);
      };
      const stopTicker = () => {
        if (!ticking) return;
        ticking = false;
        gsap.ticker.remove(tick);
      };

      startTicker();

      const onResize = () => {
        radius = maxRadius(stage.clientWidth);
        halfStage = stage.clientWidth / 2;
        dialR = (wheel?.offsetWidth ?? 236) / 2;
        measure();
        paint();
      };
      window.addEventListener('resize', onResize);

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? startTicker() : stopTicker()),
      });

      return () => {
        stopTicker();
        window.removeEventListener('resize', onResize);
        trigger.kill();
      };
    },
    { scope: stageRef }
  );

  return (
    <div className='ba-stage' ref={stageRef}>
      {/* drafted ray guides — the components ride exactly these lines */}
      <div className='ba-rays' aria-hidden>
        {([-1, 1] as const).map((side) =>
          FAN_DEG.map((deg) => (
            <div
              key={`${side}-${deg}`}
              className='ba-ray'
              style={{ width: '52vw', transform: `rotate(${rayScreenAngle(deg, side)}deg)` }}
            />
          ))
        )}
      </div>

      <div className='ba-flow'>
        {HERO_NODES.map((node) => (
          <Fragment key={node.id}>
            <div className='ba-node' data-node>
              <div className='ba-card' data-card>
                {node.en}
              </div>
            </div>
            <div className='ba-node' data-node>
              <div
                className='ba-card ba-card-out'
                data-card
                dir={node.rtl ? 'rtl' : undefined}
              >
                {node.out}
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      <LanguageWheel className='ba-wheel' arcDuration={4.4} arcSweep={13} priority />
    </div>
  );
}
