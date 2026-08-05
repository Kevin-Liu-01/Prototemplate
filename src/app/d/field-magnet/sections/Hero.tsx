'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import LanguageWheel from '@/components/shared/LanguageWheel';
import PrismaticField from '@/components/shared/PrismaticField';

import DialEngraving from '../components/DialEngraving';
import StreamArtifacts from '../components/StreamArtifacts';
import { ARTIFACTS, LANGUAGES, STATS, TRUSTED } from '../data';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

/** World-space ray radius at the far edge of the fan. Held inside the viewport
 *  at 1440 so an artifact never reaches the frame edge and gets sliced — the
 *  fan has to read as a whole composition. The near radius is per-artifact
 *  (`Artifact.near`): every plate turns around outside the gate's shadow disc
 *  instead of passing behind the opaque core. */
const R_FAR = 556;
/** Z of a component sitting in the well vs. one arriving at the viewer.
 *  The deep end is held at -420 (not -620): with 1200px perspective that is a
 *  0.74 minimum render scale, which keeps every satellite's 12–13px labels on
 *  the legible side of the 11px floor even at the turn. */
const Z_DEEP = -420;
const Z_NEAR = 140;

type Flow = {
  el: HTMLElement;
  shell: HTMLElement;
  en: HTMLElement;
  tr: HTMLElement;
  angle: number;
  lane: number;
  fan: number;
  period: number;
  p: number;
  near: number;
  /** Far turn radius, capped per-plate so the widest card never clips the
   *  viewport edge (recomputed on resize). */
  far: number;
  /** Half of the plate's widest face, for the far-radius cap. */
  halfW: number;
  /** Base z of this plate's layer stack. */
  base: number;
  wEn: number;
  hEn: number;
  wTr: number;
  hTr: number;
  crossed: boolean;
  layer: number;
};

/** Perspective scale at the ray's outer end (z = Z_NEAR, 1200px perspective):
 *  the point where a plate is rendered largest and sits farthest from centre,
 *  so the far-radius cap is solved against this factor. */
const PERSP_NEAR = 1200 / (1200 - 140);

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const scene = sceneRef.current;
      if (!scene) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      /* ---------- flow items: measure both language boxes once ---------- */
      const flows: Flow[] = [];
      for (const item of ARTIFACTS) {
        const el = scene.querySelector<HTMLElement>(`[data-art="${item.id}"]`);
        const shell = el?.querySelector<HTMLElement>('[data-art-shell]');
        const en = el?.querySelector<HTMLElement>('[data-art-en]');
        const tr = el?.querySelector<HTMLElement>('[data-art-tr]');
        if (!el || !shell || !en || !tr) continue;
        const flow: Flow = {
          el,
          shell,
          en,
          tr,
          angle: item.angle,
          lane: item.lane,
          fan: item.fan,
          period: item.period,
          p: item.phase,
          near: item.near,
          far: R_FAR,
          halfW: Math.max(en.offsetWidth, tr.offsetWidth) / 2,
          base: item.front ? 41 : 0,
          wEn: en.offsetWidth,
          hEn: en.offsetHeight,
          wTr: tr.offsetWidth,
          hTr: tr.offsetHeight,
          crossed: item.phase >= 1,
          layer: -1,
        };
        gsap.set(shell, {
          width: flow.crossed ? flow.wTr : flow.wEn,
          height: flow.crossed ? flow.hTr : flow.hEn,
        });
        gsap.set(en, { autoAlpha: flow.crossed ? 0 : 1 });
        gsap.set(tr, { autoAlpha: flow.crossed ? 1 : 0 });
        flows.push(flow);
      }

      let cx = scene.offsetWidth / 2;
      let cy = scene.offsetHeight / 2;
      let laneScale = 1;
      const resize = () => {
        cx = scene.offsetWidth / 2;
        cy = scene.offsetHeight / 2;
        /* The lane table in data.ts is budgeted for the 1440×900 envelope
           (±190px usable between the sub-headline and the thread rule). The
           scene overhangs the band by 16vh on each side, so cy − 0.16·vh is
           the band's half-height — lanes compress with it on short bands. */
        laneScale = Math.min(1, Math.max(0.5, (cy - window.innerHeight * 0.16) / 190));
        /* The far turn is solved per plate: at the outer end the plate renders
           at PERSP_NEAR scale, so its projected right edge is
           (r·cos(angle) + halfW) · PERSP_NEAR from the viewport centre. Capping
           r keeps every plate whole inside the frame — the Pro card used to
           spawn kissing the right edge, which read as a clipped object. */
        const safe = window.innerWidth / 2 / PERSP_NEAR - 24;
        for (const f of flows) {
          const cos = Math.abs(Math.cos((f.angle * Math.PI) / 180));
          f.far = Math.max(f.near + 60, Math.min(R_FAR, (safe - f.halfW) / cos));
        }
      };
      window.addEventListener('resize', resize);
      resize();

      /** Crossing the well: chromatic split resolves into the localized face, and
       *  the shell re-measures so the component visibly re-fits its new text. */
      const cross = (f: Flow) => {
        f.crossed = true;
        gsap.to(f.shell, {
          width: f.wTr,
          height: f.hTr,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: true,
        });
        gsap.to(f.en, { autoAlpha: 0, duration: 0.18, overwrite: true });
        gsap.to(f.tr, { autoAlpha: 1, duration: 0.3, delay: 0.06, overwrite: true });
      };

      const resetItem = (f: Flow) => {
        f.crossed = false;
        gsap.set(f.shell, { width: f.wEn, height: f.hEn });
        gsap.set(f.en, { autoAlpha: 1 });
        gsap.set(f.tr, { autoAlpha: 0 });
      };

      const place = (f: Flow, dt: number) => {
        f.p += (dt / f.period) * 2;
        if (f.p >= 2) {
          f.p -= 2;
          resetItem(f);
        }
        const inbound = f.p < 1;
        if (!inbound && !f.crossed) cross(f);

        const u = inbound ? Math.pow(1 - f.p, 1.7) : Math.pow(f.p - 1, 1.7);
        // Rays bend toward the band as they fall in — light curving into the well.
        const a = ((f.angle * Math.PI) / 180) * (0.36 + 0.64 * u);
        const r = f.near + (f.far - f.near) * u;
        const dir = inbound ? -1 : 1;
        const z = Z_DEEP + (Z_NEAR - Z_DEEP) * u;
        /* Perspective scale of this plate at its current depth. */
        const persp = 1200 / (1200 - z);
        const x = cx + dir * Math.cos(a) * r;
        /* Altitude is the plate's own lane, not a ray projection: the radial
           fan converged every plate onto the centre line near the well, which
           made same-side collisions a mathematical certainty. Lanes are
           disjoint by construction (see ARTIFACTS) and pinned in SCREEN space
           — the world offset is pre-divided by the perspective factor so a
           deep plate and a far plate hold the same drawn altitude, and the
           disjoint-band table survives projection. */
        const y = cy + (f.lane * laneScale * (1 + f.fan * u)) / persp;

        // Tangential stretch peaks at the rim, where matter also slows.
        const k = 0.34 * Math.max(0, 1 - Math.abs(u - 0.07) / 0.3);
        /* Dispersion, not a neon rim: a sub-pixel fringe that only reads as
           an optical edge under the burst. Anything heavier paints magenta and
           cyan onto component chrome, which is a coloured glow — the one thing
           this page has no other instance of. */
        const chroma = Math.max(0, (0.26 - u) / 0.26) * 1.3;
        /* Every plate is a readable artifact at every point on its ray: no
           blur, brightness and alpha floored near full. Depth is carried by
           scale and stacking alone — an atmospheric haze that erases a card's
           label is a legibility bug, not a depth cue (the 20 $/Monat card and
           the Locadex chip were ghosting below the 11px floor). */
        const lift = f.base > 0;
        const blur = 0;
        const bright = lift ? 1 : 0.97 + 0.03 * Math.min(1, u * 1.5);
        /* No spawn/exit crossfade at all: with eight plates cycling, even a
           0.4s fade put SOME plate at half alpha in ~40% of stills, and that
           half-ghost card dissolving into the burst is exactly what the r2
           critic caught (§6, the still-frame law). A plate is either fully
           drawn or absent — the long periods make the pop-in rare live. */
        const edge = Math.min(f.p, 2 - f.p);
        const alpha = edge < 0.035 ? 0 : lift ? 1 : 0.96 + 0.04 * Math.min(1, u * 1.6);

        f.el.style.transform =
          `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) ` +
          `translate(-50%, -50%) ` +
          `scale(${(1 - k).toFixed(3)}, ${(1 + k * 0.85).toFixed(3)})`;
        f.el.style.opacity = alpha.toFixed(3);
        f.el.style.filter =
          `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(2)})` +
          (chroma > 0.25
            ? ` drop-shadow(${-chroma.toFixed(2)}px 0 rgba(255,120,140,.2)) drop-shadow(${chroma.toFixed(2)}px 0 rgba(130,195,255,.2))`
            : '');
        /* Depth order follows u, so a plate at its turn sits behind everything
           else in the stream — which is exactly where the one plate the
           storyboard names by hand kept getting buried. `front` lifts that
           plate's whole stack above the others. */
        const layer = f.base + Math.round(u * 40);
        if (layer !== f.layer) {
          f.layer = layer;
          f.el.style.zIndex = String(layer);
        }
      };

      /* ---------- static layout for reduced motion ---------- */
      if (reduced) {
        flows.forEach((f, i) => {
          f.p = i % 2 === 0 ? 0.42 : 1.58;
          place(f, 0);
        });
        window.removeEventListener('resize', resize);
        return;
      }

      /* ---------- the field driver ---------- */
      const tick = (_t: number, deltaTime: number) => {
        const dt = Math.min(deltaTime, 64) / 1000;
        for (const f of flows) place(f, dt);
      };
      gsap.ticker.add(tick);

      /* ---------- intro + ambient loops ---------- */
      const loops: gsap.core.Tween[] = [];
      loops.push(
        gsap.to('[data-flagtrack]', { xPercent: -50, ease: 'none', repeat: -1, duration: 38 })
      );

      gsap
        .timeline({ defaults: { ease: 'power4.out', duration: 1 } })
        .from('[data-cmdchip]', { y: 18, autoAlpha: 0, duration: 0.7 }, 0.1)
        .from('[data-h1]', { y: 34, autoAlpha: 0, duration: 1.1 }, 0.2)
        .from('[data-sub]', { y: 20, autoAlpha: 0 }, 0.45)
        .from('[data-cta] > *', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.6)
        .from('[data-lens]', { scale: 0.55, autoAlpha: 0, duration: 1, ease: 'back.out(1.4)' }, 0.5)
        .from('[data-langband]', { y: 20, autoAlpha: 0 }, 0.9)
        .from('[data-trusted]', { y: 16, autoAlpha: 0 }, 1.05)
        .from('[data-stats] > *', { y: 14, autoAlpha: 0, stagger: 0.06 }, 1.15);

      /* language rotator */
      const rot = root.current?.querySelector<HTMLElement>('[data-rot]');
      if (rot) {
        const words = ['Spanish', 'French', 'Japanese', 'German', 'Korean', 'Arabic', 'Hindi'];
        let wi = 0;
        const cycle = () => {
          wi = (wi + 1) % words.length;
          gsap.to(rot, {
            duration: 0.9,
            ease: 'none',
            scrambleText: { text: words[wi] ?? 'Spanish', chars: 'lowerCase', speed: 0.4 },
            onComplete: () => gsap.delayedCall(1.7, cycle),
          });
        };
        gsap.delayedCall(2.2, cycle);
      }

      /* pointer-tracked specular on the headline */
      let onMove: ((e: MouseEvent) => void) | null = null;
      const h1 = root.current?.querySelector<HTMLElement>('[data-h1]');
      if (fine && h1) {
        const proxy = { v: 32 };
        const to = gsap.quickTo(proxy, 'v', {
          duration: 0.6,
          ease: 'power2',
          onUpdate: () => h1.style.setProperty('--gx', `${proxy.v}%`),
        });
        onMove = (e: MouseEvent) => to(10 + (e.clientX / window.innerWidth) * 80);
        window.addEventListener('mousemove', onMove);
      }

      const pause = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
      });

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener('resize', resize);
        if (onMove) window.removeEventListener('mousemove', onMove);
        pause.kill();
      };
    },
    { scope: root }
  );

  const copy = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
    if (navigator.clipboard) navigator.clipboard.writeText('npx gt@latest').catch(() => undefined);
  };

  return (
    <section className='fm-hero' id='top' ref={root}>
      <div className='fm-wrap fm-hero-head'>
        <button className='fm-cmdchip' data-cmdchip type='button' onClick={copy}>
          <span className='fm-cmd-dollar'>$</span> npx gt@latest
          <span className='fm-cmd-state'>{copied ? '[copied]' : '[copy]'}</span>
        </button>
        <h1 className='fm-h1' data-h1>
          Launch in every language
        </h1>
        <p className='fm-hero-sub' data-sub>
          General Translation helps developers localize apps into{' '}
          <span className='fm-rot' data-rot>
            Spanish
          </span>
          <span className='fm-caret' />
        </p>
        <div className='fm-ctas' data-cta>
          <a className='fm-btn fm-btn-solid' href='#pricing' data-magnetic>
            Get Started <span className='fm-arr'>→</span>
          </a>
          <a className='fm-btn fm-btn-ghost' href='#story' data-magnetic>
            Docs
          </a>
        </div>
      </div>

      <div className='fm-hero-band'>
        <div className='fm-prism-holder' aria-hidden>
          {/* The shader normalises by canvas height, so an oversized canvas
              stretches every streak and the field turns into airbrushed
              patches. The holder is viewport-height (see .fm-prism-holder) so
              the filament frequency here matches the story's instance.
              Two overrides against preset 1's showpiece tuning: exposure is
              stopped well down (resend's hero is near-black washed with slow
              light, not a rainbow at full brightness — the r2 Pro card sat on
              the brightest patch), and fieldDetailScale drops from 4.6 toward
              the story preset's 2.3, which is what turns the blocky aliased
              high-frequency chunks into smooth slow bands at 1:1. */}
          <PrismaticField
            className='fm-prism'
            preset='1'
            speed={0.5}
            params={{ exposureScale: 6400, fieldDetailScale: 2.9 }}
          />
        </div>
        <div className='fm-hero-vig' aria-hidden />
        <div
          className='fm-scene'
          ref={sceneRef}
          aria-label='English components fall into the GT lens and re-emerge translated'
        >
          <div className='fm-scene-hair' aria-hidden />
          <StreamArtifacts />
          {/* Machined metal, machined at the micro level: the wheel's base
              skins (styles.css --gtw-*) give it a turned bezel — concentric
              grooves under a conic anisotropic sweep — and DialEngraving adds
              the milled detail: a recessed graduation channel, an engraved
              locale ring and legend (real shipped locales, the stat row's own
              values), environment reflections, dust. No progress arc — the
              dial is hardware, not a loading ring. */}
          <LanguageWheel className='fm-lens' orbit={false} priority />
          <DialEngraving />
        </div>
      </div>

      <div className='fm-wrap fm-langband' data-langband>
        <p className='fm-band-label'>
          100+ languages, production-ready — trusted by the world&apos;s best companies
        </p>
        <div className='fm-flagstrip'>
          <div className='fm-flagtrack' data-flagtrack>
            {[0, 1].map((copyIndex) =>
              LANGUAGES.map((l) => (
                <span className='fm-flag' key={`${copyIndex}-${l.name}`}>
                  <em className={`fi fi-${l.flag}`} aria-hidden='true' />
                  {l.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section G: one label for the whole foot. The wordmark row and the stat
          row are content under it, not two more labelled blocks. */}
      <div className='fm-wrap fm-trusted' data-trusted>
        <div className='fm-tlogos'>
          {TRUSTED.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>

      <div className='fm-wrap fm-stats' data-stats>
        {STATS.map((s) => (
          <span className='fm-stat' key={s.label}>
            <b>{s.value}</b>
            <i>{s.label}</i>
          </span>
        ))}
      </div>
    </section>
  );
}
