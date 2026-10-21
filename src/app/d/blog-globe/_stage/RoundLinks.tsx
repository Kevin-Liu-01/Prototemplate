import { T, Var } from '@/app/d/blog-globe/_shared/i18n';

import {
  GLOBE_ROUNDS,
  type GlobeRoundKey,
} from '@/app/d/blog-globe/_stage/rounds';

/* Plain links between the globe's dev routes: one per round, then the
   page that shows every round side by side. The current page is text. */
export default function RoundLinks({
  base,
  current,
}: {
  base: string;
  current: GlobeRoundKey | 'all';
}) {
  const links = [
    ...GLOBE_ROUNDS.map((round) => ({
      key: round.key,
      href: `${base}${round.path}`,
      label: round.commit ? (
        <T>
          Round <Var>{round.number}</Var>
        </T>
      ) : (
        <T>
          Round <Var>{round.number}</Var> (live)
        </T>
      ),
    })),
    { key: 'all', href: `${base}/all`, label: <T>All rounds</T> },
  ];
  return (
    <nav
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 24px',
        marginBottom: 48,
      }}
    >
      {links.map(({ key, href, label }) =>
        key === current ? (
          <span key={key} aria-current='page'>
            {label}
          </span>
        ) : (
          <a key={key} href={href}>
            {label}
          </a>
        )
      )}
    </nav>
  );
}
