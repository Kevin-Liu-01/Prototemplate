import { ArrowRight, Check, FileCode2, GitPullRequest } from 'lucide-react';
import Image from 'next/image';

import 'flag-icons/css/flag-icons.min.css';

import { MINTLIFY_FLAG_REGION } from './mintlify-flags';

const OUTPUT_LOCALES = ['es', 'fr', 'ja'] as const;

/**
 * THE SHIPPED HERO DIAGRAM, reproduced.
 *
 * 1-1 with apps/landing/src/components/pages/mintlify/
 * MintlifyHeroDiagram.tsx: the repo bar on main, the three-column stage —
 * the docs tree, the GT core with its `translate` label and the outward
 * arrow, the pull-request panel with its three output locales and "+ 18
 * files" — and the status strip. Same file names, same counts, same order.
 *
 * The flags are flag-icons spans through this repo's recorded copy of the
 * shipped resolver's output (mintlify-flags.ts), standing in for the design
 * system's LocaleFlag component.
 */
export default function MintlifyHeroDiagram() {
  return (
    <div
      className='mintlify-hero-diagram'
      role='img'
      aria-label='Locadex reads Mintlify documentation and opens a pull request with localized files'
    >
      <div className='mintlify-diagram-bar' aria-hidden='true'>
        <span>
          <Image
            src='/logos/favicons/mintlify.ico'
            alt=''
            width={16}
            height={16}
          />
          docs
        </span>
        <code>main</code>
      </div>

      <div className='mintlify-diagram-stage' aria-hidden='true'>
        <div className='mintlify-repo-tree'>
          <code>docs/</code>
          <span>
            <FileCode2 /> index.mdx
          </span>
          <span>
            <FileCode2 /> api.mdx
          </span>
          <span>
            <FileCode2 /> guides.mdx
          </span>
          <small>mint.json</small>
        </div>

        <div className='mintlify-diagram-processor'>
          <div className='mintlify-processor-core'>GT</div>
          <span>translate</span>
          <ArrowRight />
        </div>

        <div className='mintlify-pr-output'>
          <div>
            <GitPullRequest />
            <span>Localized docs</span>
          </div>
          {OUTPUT_LOCALES.map((locale) => (
            <span key={locale}>
              <span
                aria-hidden='true'
                className={`fi fi-${MINTLIFY_FLAG_REGION[locale]} inline-block shrink-0`}
              />
              <code>{locale}/</code>
              <Check />
            </span>
          ))}
          <small>+ 18 files</small>
        </div>
      </div>

      <div className='mintlify-diagram-status' aria-hidden='true'>
        <span />
        formatting preserved
        <code>ready to merge</code>
      </div>
    </div>
  );
}
