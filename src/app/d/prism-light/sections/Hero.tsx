'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRef } from 'react';

import { useCopied } from '@/app/d/toolchain/components/use-copied';
import { startEveryMorph } from '@/app/d/toolchain/sections/every-morph';
import PrismaticField from '@/components/shared/PrismaticField';
import { prefersReducedMotion } from '@/lib/reduced-motion';

import './chip-consistency.css';
import './hero-every.css';
import './hero-terminal.css';

gsap.registerPlugin(useGSAP);

/* three.js (about 140 KB compressed) loads after the page renders: the server
   renders the scene's empty holder, and the glass mounts into the same box
   once the chunk arrives. */
const PrismScene = dynamic(() => import('./PrismScene'), {
  ssr: false,
  loading: () => <div className='plh-p-scene' aria-hidden />,
});

/**
 * THE PRISM DELIVERY PANEL — this fork's hero, recomposed side by side.
 *
 * The prismatic burst never touches the paper. Every canvas here runs behind
 * a `mix-blend-mode: lighten` group over pure ink geometry, so anything white
 * stays white and the dispersed light exists only *inside* the black shapes:
 * the two-line display headline on the left, and the delivery panel's ink
 * plate on the right. At arm's length the page is ink on paper; up close the
 * ink is full of light.
 *
 * The stack: one white card split in two columns — copy left ('Launch in /
 * every language.', sub, acts, npx chip), the delivery-as-optics panel right
 * — then the trust card closes the hero at a 1px seam. The headline keeps
 * the morph hinge on the accent word: guides, multilingual dust, measured
 * bounds. The hinge lives INSIDE the prism material, so incoming scripts
 * fill with the same dispersed light as the letters they replace.
 *
 * R4 exposure law (kept verbatim): the ink comes from the FIELD, not the
 * veil. Each headline line gets its own mirrored pair of windows aimed at
 * the burst's wing band — where the streaks carry their own dark lanes —
 * and the drawn floor is a thin safeguard (0.14 mid-block, diving deep at
 * the ends), so the interior visibly STREAMS with spectrum while reading as
 * ink. No streak approaches paper luminance and the letter edge never
 * softens. Dark mode inverts the law, not the layout: white letterforms
 * under a `darken` group with the floors flipped to paper (styles.css).
 *
 * The panel fuses the old horizon diagram with the old specimen's optics —
 * one optical event that is also the delivery story: a French reader's
 * request enters as the one white beam on the plate (`GET
 * example.com/fr/a-propos`, `accept-language: fr-FR` riding it), dives into
 * a drawn glass prism, and the far face disperses it into a full-height
 * spectral fan. The fan's light carries the outputs: the response callout
 * (`200 · served from fra · 12 ms · no origin hit`) and the five edge nodes
 * with their measured p50s standing at the fan's mouth, `fra` lit as the
 * serving node on the fan's bright axis. The plate's floor keeps the band's
 * caption grammar — translation edge · anycast · versioned per locale.
 * One request in — every locale served from the edge, as optics.
 */

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/** The dispersal, written out: one English string enters the glass and the
    fan that leaves IS the translations — each ray a language, rotated to its
    own dispersion angle, farther-flung the farther it sits from the axis.
    `d` is the flight distance along the ray as a % of the plate's width. */
const RAYS: readonly {
  text: string;
  lang: string;
  ang: number;
  d: number;
  rtl?: boolean;
}[] = [
  { text: 'Hallo, Welt!', lang: 'de', ang: -24, d: 30 },
  { text: '¡Hola, mundo!', lang: 'es', ang: -17, d: 44 },
  { text: 'Bonjour, le monde !', lang: 'fr', ang: -10.5, d: 36 },
  { text: 'Привет, мир!', lang: 'ru', ang: -4, d: 50 },
  { text: 'こんにちは、世界！', lang: 'ja', ang: 3, d: 40 },
  { text: '你好，世界！', lang: 'zh', ang: 10, d: 52 },
  { text: '안녕하세요, 세계!', lang: 'ko', ang: 17, d: 38 },
  { text: 'नमस्ते, दुनिया!', lang: 'hi', ang: 24, d: 31 },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const { copied, copy } = useCopied('npx gt@latest');

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      /* clearProps: a leftover inline transform on any ancestor of the light
         wrappers would create a stacking context and break their blend group,
         so every entrance tween cleans up after itself. The headline block and
         the prism specimen are never animated for the same reason. */
      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
      });

      /* The fan blooms in once; the 3D scene above it (beam-of-words, glass,
         translation flights) runs its own loop. Only opacity ever animates
         on the lighten wrapper — a transform would isolate the blend group
         and flood the plate. */
      gsap.from('.plh-p-light', { autoAlpha: 0, duration: 1.3, ease: 'power1.inOut', delay: 0.6 });
      gsap.from('.plh-p-scene', { autoAlpha: 0, duration: 1.0, ease: 'power1.inOut', delay: 0.3 });

      /* The headline hinge (every-morph.ts): the word after "every" cycles
         through eight scripts while the hero is on screen. */
      const em = root.current?.querySelector<HTMLElement>('[data-every]');
      const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
      return em && word ? startEveryMorph(em, word, { dust: 'あ字كहξжか한グमัถイ고ρ' }) : undefined;
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's stack, surface one: a genuine white card — radius 12,
          notched corners on the shell ground. Copy left, specimen right. */}
      <div className='tc-hero tch-card plh-card'>
        <div className='plh-card-in'>
          <div>
            <Image
              className='tc-hero-mark'
              data-hero-in
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={34}
              height={34}
            />

            {/* One material for the whole headline: both lines sit inside a
                single blend group, so 'Launch in' and 'every language.' carry
                the same prism-filled ink instead of splitting into two
                weights. Not animated: an entrance transform would isolate
                the blend group and flood the card. */}
            <h1 className='plh-h1'>
              <span className='plh-block'>
                <span className='plh-block-light' aria-hidden>
                  {/* The reference anatomy, made deterministic: two lobes of
                      streaked light converging on a dark eye. EACH LINE gets
                      its own mirrored pair of short, wide windows onto the
                      field — the burst's bright horizontal axis rides through
                      the middle of each line of type at the same wide aspect
                      that makes the horizon band's filaments stream, instead
                      of one tall window that spends the axis in the line gap
                      and compresses the streaks to froth. All four windows
                      share the engine, the params and the single shade layer
                      above them — floor first, then the eye — so the block
                      still reads as ONE material. */}
                  <span className='plh-block-row is-1'>
                    <span className='plh-block-half is-l'>
                      <PrismaticField
                        className='plh-field-word'
                        preset='1'
                        speed={0.5}
                        params={{ exposureScale: 2250 }}
                      />
                    </span>
                    <span className='plh-block-half is-r'>
                      <PrismaticField
                        className='plh-field-word'
                        preset='1'
                        speed={0.5}
                        params={{ exposureScale: 2250 }}
                      />
                    </span>
                  </span>
                  <span className='plh-block-row is-2'>
                    <span className='plh-block-half is-l'>
                      <PrismaticField
                        className='plh-field-word'
                        preset='1'
                        speed={0.5}
                        params={{ exposureScale: 2250 }}
                      />
                    </span>
                    <span className='plh-block-half is-r'>
                      <PrismaticField
                        className='plh-field-word'
                        preset='1'
                        speed={0.5}
                        params={{ exposureScale: 2250 }}
                      />
                    </span>
                  </span>
                  <span className='plh-block-shade' />
                </span>
                <span className='plh-line'>Launch in</span>
                <span className='plh-line'>
                  every{' '}
                  <em data-every>
                    <span data-every-word lang='en' dir='ltr'>
                      language
                    </span>
                  </em>
                  .
                </span>
              </span>
            </h1>

            <p className='tc-hero-sub' data-hero-in>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites — translated at build, served from the edge.
            </p>

            <div className='tc-hero-acts' data-hero-in>
              <a className='tc-btn tc-btn-solid' href='#pricing'>
                Get started
              </a>
              <a className='tc-btn tc-btn-line' href='#frameworks'>
                Docs
              </a>
              <button className='tc-copy' type='button' onClick={copy}>
                <span>$ npx gt@latest</span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* The optics band, full-bleed under the hero copy: one English string
          rides the incidence ray into the glass, and the fan that leaves is
          the translations — every ray a language, printed on the light
          itself. Paint order matters — beam and glass sit UNDER the lighten
          wrapper so the fan blooms over the exit face, and every label rides
          above the light. The plate is never transform-animated: it is the
          blend group's containing block. */}
      <figure
        className='plh-band'
        role='img'
        aria-label='A drawn glass prism on a wide dark plate turns one string into every language: a white beam carrying "Hello, world!" enters the glass and disperses into a spectral fan whose rays read Hallo Welt, Hola mundo, Bonjour le monde, Privet mir, Konnichiwa sekai, Ni hao shijie, Annyeonghaseyo segye, Namaste duniya. Captions read translation edge, one string in, every language out'
      >
        <div className='plh-panel-box is-band' aria-hidden>
          {/* The dispersal light, its dark convergence eye parked at the
              prism's heart so it gathers in the glass and blooms rightward. */}
          <div className='plh-p-light'>
            <PrismaticField
              className='plh-p-field'
              preset='1'
              speed={0.55}
              params={{ exposureScale: 1250 }}
            />
            <span className='plh-p-shade' />
          </div>

          {/* The 3D optics: the beam is a stream of source words, the glass
              is a physical prism, and the translations fly the dispersion
              rays with real perspective. */}
          <PrismScene
            className='plh-p-scene'
            source='“Hello, world!”'
            rays={RAYS}
          />

          {/* The source string, named at the beam's origin. */}
          <div className='plh-p-req' data-hero-in>
            <b>&ldquo;Hello, world!&rdquo;</b>
            <span>en · one source string</span>
          </div>

          {/* The caption grammar, kept as the plate's floor. */}
          <div className='plh-p-foot'>
            <span>translation edge</span>
            <span>one string in · every language out</span>
          </div>
        </div>
      </figure>

      {/* Surface three: the trust card completes the stack. */}
      <div className='tc-trust tch-trustcard'>
        <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
