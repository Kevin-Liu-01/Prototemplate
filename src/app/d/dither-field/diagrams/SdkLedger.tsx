import './flow.css';

/**
 * The SDK cell, as the artifact itself: a dark panel listing the first-party
 * packages line for line — the package you install, the surface it targets,
 * and the import you actually write. The isometric plate stack this replaces
 * drew squiggle-slab stand-ins for text, which is the one thing this page is
 * never allowed to do: if the real thing exists, the real thing is shown.
 *
 * No accent. The API names carry weight instead — white at 500 on the panel,
 * the same treatment every other code surface on the page gives them.
 */

type Sdk = {
  pkg: string;
  runtime: string;
  /** The named exports the import line shows, comma-joined. */
  api: string;
};

const SDKS: readonly Sdk[] = [
  { pkg: 'gt-next', runtime: 'Next.js — App & Pages Router', api: 'T, useGT' },
  { pkg: 'gt-react', runtime: 'React 18+ — SPA or SSR', api: 'T, useGT' },
  { pkg: 'gt-react-native', runtime: 'iOS · Android', api: 'T, useLocale' },
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
        <span>npm</span>
      </div>

      {SDKS.map((sdk) => (
        <div className='sdkl-row' key={sdk.pkg}>
          <div className='sdkl-top'>
            <b>{sdk.pkg}</b>
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
