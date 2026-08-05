'use client';

import { AppWindow } from 'lucide-react';
import { useRef } from 'react';


import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';
import RayField from '@/components/shared/RayField';

import TranslateWindow from '../TranslateWindow';

import './devwin.css';

/**
 * V0 Dev Window — "Built for the world's developers." — the dossier hero's
 * windowed demo seated as a section of its own, in the house grammar: a
 * light tc-head (icon, heading, one line) over a full-bleed night row that
 * borrows the dossier band's exact material — the dark plate, the ray field
 * bending light in from the flanks — with the shared TranslateWindow on it.
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
        {/* the ray field in lieu of the prismatic wash: 'converge' — data
            bending in from the flanks into the window that sits at center;
            the shared .tch-field mask keeps the column under the window dark */}
        <RayField className='tc-hero-field tch-field' preset='converge' speed={0.8} />
        <TranslateWindow />
      </div>
    </section>
  );
}
