'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { CSSProperties } from 'react';
import { Fragment, useRef } from 'react';

import { subscribeVelocity, velocity } from '../lib/velocity';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The resting wave. One slow sine runs down the line and drives three axes at
 * once, so a still frame already shows the type at work: this letter heavy,
 * wide and sitting low, the next light, narrow and riding high. Scroll
 * velocity then swings the whole wave either side of rest.
 */
const WAVE_PERIOD = 5.5;
const WEIGHT_AMP = 190;
const WIDTH_AMP = 0.078;
const RISE_AMP = 0.036;

/** Per-character phase for the velocity swing, so the flex travels as a wave. */
const WEIGHT_PHASE = [1, 0.45, 0.78, 0.28, 0.62];
const WIDTH_PHASE = [0.5, 1, 0.34, 0.72, 0.9];

type CharStyle = CSSProperties & Record<'--kv-ci', number>;

export type KineticTextProps = {
  text: string;
  className?: string;
  /** Centre of the weight wave; the resting sine rides either side of it. */
  baseWeight?: number;
  /** Overall responsiveness of the three axes to scroll velocity. */
  flex?: number;
  /** Stagger the characters in from below the first time they are seen. */
  intro?: 'mount' | 'scroll' | 'none';
  lang?: string;
};

/**
 * The direction's signature: every character carries its own weight, width and
 * baseline, and catches the specular band of the metal at its own point along
 * the line.
 *
 * Switzer ships as six static masters, so weight steps through them while
 * width (a horizontal scale) and rise (a vertical offset) run continuously —
 * the coarse axis is carried by the font, the fine axes by the transform, and
 * the three read as one flex. The specular phase rides `--kv-ci`, a
 * per-character index the stylesheet turns into a background-position offset;
 * because that gradient is clipped to the glyph, the highlight can never paint
 * a rectangle behind the line.
 */
export default function KineticText({
  text,
  className,
  baseWeight = 620,
  flex = 1,
  intro = 'none',
  lang,
}: KineticTextProps) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const chars = gsap.utils.toArray<HTMLElement>('[data-kchar]', host);
      if (!chars.length) return;

      /* The resting wave is applied first and unconditionally: it is what the
         page looks like when nothing is moving — including under reduced
         motion, and in a screenshot. */
      const restWeight: number[] = [];
      const restWidth: number[] = [];
      const restRise: number[] = [];
      for (let i = 0; i < chars.length; i++) {
        const phase = (i / WAVE_PERIOD) * Math.PI * 2;
        restWeight[i] = baseWeight + Math.sin(phase) * WEIGHT_AMP;
        restWidth[i] = 1 + Math.cos(phase + 0.9) * WIDTH_AMP;
        restRise[i] = Math.sin(phase + 1.7) * RISE_AMP;
        const char = chars[i];
        if (!char) continue;
        char.style.fontWeight = String(
          Math.round(gsap.utils.clamp(300, 800, restWeight[i] ?? baseWeight) / 100) * 100
        );
        char.style.setProperty('--kv-cw', (restWidth[i] ?? 1).toFixed(3));
        char.style.setProperty('--kv-cy', `${(restRise[i] ?? 0).toFixed(4)}em`);
      }

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      /* The specular band rakes across the line as it crosses the viewport.
         Each character offsets it by --kv-ci, and the gradient is clipped to
         the glyph, so the highlight is on the letters and nowhere else. */
      gsap.fromTo(
        host,
        { '--kv-gsweep': '84%' },
        {
          '--kv-gsweep': '-46%',
          ease: 'none',
          scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );

      if (intro === 'mount') {
        gsap.from(chars, {
          yPercent: 74,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power4.out',
          stagger: { each: 0.02, from: 'center' },
          delay: 0.12,
        });
      } else if (intro === 'scroll') {
        gsap.from(chars, {
          yPercent: 62,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'power4.out',
          stagger: { each: 0.014, from: 'start' },
          scrollTrigger: { trigger: host, start: 'top 92%', once: true },
        });
      }

      const release = subscribeVelocity();
      let visible = true;
      const observer = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      });
      observer.observe(host);

      let applied = -999;
      const tick = () => {
        if (!visible) return;
        const v = gsap.utils.clamp(-3600, 3600, velocity.smooth) * flex;
        if (Math.abs(v - applied) < 4) return;
        applied = v;
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          if (!char) continue;
          const weightPhase = WEIGHT_PHASE[i % WEIGHT_PHASE.length] ?? 1;
          const widthPhase = WIDTH_PHASE[i % WIDTH_PHASE.length] ?? 1;
          const weight = gsap.utils.clamp(
            300,
            800,
            (restWeight[i] ?? baseWeight) + v * 0.056 * weightPhase
          );
          const width = gsap.utils.clamp(
            0.84,
            1.18,
            (restWidth[i] ?? 1) + v * 0.00006 * widthPhase
          );
          const rise = gsap.utils.clamp(
            -0.075,
            0.075,
            (restRise[i] ?? 0) + v * 0.000022 * weightPhase
          );
          char.style.fontWeight = String(Math.round(weight / 100) * 100);
          char.style.setProperty('--kv-cw', width.toFixed(3));
          char.style.setProperty('--kv-cy', `${rise.toFixed(4)}em`);
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect();
        release();
      };
    },
    { scope: root, dependencies: [text, baseWeight] }
  );

  const words = text.split(' ');
  let index = 0;

  return (
    <span ref={root} className={className} lang={lang}>
      {words.map((word, wordIndex) => (
        <Fragment key={`${word}-${wordIndex}`}>
          <span className='kv-kword'>
            {Array.from(word).map((char, charIndex) => {
              const style: CharStyle = { '--kv-ci': index++ };
              return (
                <span className='kv-kchar' data-kchar style={style} key={`${char}-${charIndex}`}>
                  {char}
                </span>
              );
            })}
          </span>
          {/* A real text node between the inline-blocks, so the line can still wrap. */}
          {wordIndex < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
