'use client';

import { AppWindow } from 'lucide-react';
import { useRef } from 'react';


import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';

import TranslateWindow from '../TranslateWindow';

import './devwin.css';

/**
 * V0 Dev Window — "Built for the world's developers." — the dossier hero's
 * windowed demo seated as a section of its own, in the house grammar: a
 * light tc-head (icon, heading, one line) over a full-bleed night row that
 * borrows the dossier band's exact material — the dark plate, the prismatic
 * wash lit at the flanks — with the shared TranslateWindow standing on it.
 * Seams stay single-stroke: the section draws its own top rule (Customers
 * above yields its bottom), the night row draws the head/plate rule, and
 * the section's border-bottom is yielded to the full-stack band below.
 */
export default function V0DevWindow() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec v0-devwin' id='developers-window' ref={root}>
      <div className='tc-head'>
        <AppWindow className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Built for the world&rsquo;s developers.</h2>
        <p data-reveal>
          General Translation is deployed in production apps that reach millions of global users.
        </p>
      </div>

      <div className='v0-devwin-band' data-reveal>
        <TranslateWindow />
      </div>
    </section>
  );
}
