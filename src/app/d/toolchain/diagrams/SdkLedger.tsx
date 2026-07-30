import { SiNodedotjs, SiNpm } from '@icons-pack/react-simple-icons';
import type { CSSProperties } from 'react';

import '../components/icons.css';
import '../sections/chip-consistency.css';
import './flow.css';

/**
 * The SDK cell, as the artifact itself: a dark panel listing the first-party
 * packages line for line — the package you install, the surface it targets,
 * and the import you actually write. The isometric plate stack this replaces
 * drew squiggle-slab stand-ins for text, which is the one thing this page is
 * never allowed to do: if the real thing exists, the real thing is shown.
 *
 * Each package carries its runtime's real mark at text size (founder pick):
 * the /public logo files rendered as currentColor masks — alpha is the
 * artwork, so every mark lands monochrome on the panel ink — and gt-node's
 * hexagon from simple-icons on the same currentColor. The corner tag is the
 * real npm mark beside the word.
 *
 * React Native included: the real saved badge (react-native-no-bg.svg, the
 * squircle with the atom knocked out), mask-rendered like its siblings. The
 * invented stroke-drawn "atom in a squircle" it replaces read identical to
 * gt-react's atom at this size; the knockout badge is distinct at a glance,
 * and runs one step larger (chip-consistency.css) so the cutout stays open.
 *
 * No accent. The API names carry weight instead — white at 500 on the panel,
 * the same treatment every other code surface on the page gives them.
 */

type Sdk = {
  pkg: string;
  runtime: string;
  /** The named exports the import line shows, comma-joined. */
  api: string;
  /** The runtime's mark in /public, mask-rendered. */
  markSrc?: string;
  /** Extra class on the mark, when one mark needs its own metric. */
  markClass?: string;
};

const SDKS: readonly Sdk[] = [
  {
    pkg: 'gt-next',
    runtime: 'Next.js — App & Pages Router',
    api: 'T, useGT',
    markSrc: '/logos/nextjs-no-bg.svg',
  },
  {
    pkg: 'gt-react',
    runtime: 'React 18+ — SPA or SSR',
    api: 'T, useGT',
    markSrc: '/logos/react-logo-light.svg',
  },
  {
    pkg: 'gt-react-native',
    runtime: 'iOS · Android',
    api: 'T, useLocale',
    markSrc: '/logos/react-native-no-bg.svg',
    markClass: 'is-rn',
  },
  { pkg: 'gt-node', runtime: 'Node — Express, Hono, workers', api: 'gt' },
];

export type SdkLedgerProps = {
  className?: string;
  title?: string;
};

export default function SdkLedger({ className, title }: SdkLedgerProps) {
  return (
    <div
      className={['sdkl', className].filter(Boolean).join(' ')}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <div className='sdkl-bar'>
        <span>@generaltranslation — first-party SDKs</span>
        <span className='sdkl-npmtag'>
          <SiNpm className='sdkl-simark' size={12} color='currentColor' aria-hidden />
          npm
        </span>
      </div>

      {SDKS.map((sdk) => (
        <div className='sdkl-row' key={sdk.pkg}>
          <div className='sdkl-top'>
            <b>
              {sdk.markSrc ? (
                <i
                  className={sdk.markClass ? `sdkl-mark ${sdk.markClass}` : 'sdkl-mark'}
                  style={{ '--mark': `url(${sdk.markSrc})` } as CSSProperties}
                  aria-hidden='true'
                />
              ) : (
                <SiNodedotjs className='sdkl-simark' size={13} color='currentColor' aria-hidden />
              )}
              {sdk.pkg}
            </b>
            <span>{sdk.runtime}</span>
          </div>
          <div className='sdkl-line'>
            <span className='sdkl-kw'>import</span> {'{ '}
            <b className='sdkl-api'>{sdk.api}</b>
            {' }'} <span className='sdkl-kw'>from</span>{' '}
            <span className='sdkl-str'>&apos;{sdk.pkg}&apos;</span>
          </div>
        </div>
      ))}
    </div>
  );
}
