import './delivery.css';

/**
 * The URL bar and the ladder. The same address drawn three times: bare, then
 * locale-prefixed, then with the localized *pathname* — the part most readers
 * have never seen an i18n library do, so `a-propos` takes the page's accent.
 * Beside the bars, the four-rung detection ladder with the winning rung lit
 * and each rung carrying the real value it would have read.
 */

const URLS: readonly { seg?: string; path: string; em?: boolean; loc: string }[] = [
  { path: '/about', loc: 'en' },
  { seg: '/es', path: '/about', loc: 'es' },
  { seg: '/fr', path: '/a-propos', em: true, loc: 'fr' },
];

const RUNGS: readonly { name: string; value: string; won?: boolean }[] = [
  { name: 'URL locale', value: '/fr', won: true },
  { name: 'cookie', value: 'gt-locale' },
  { name: 'accept-language', value: 'fr-FR;q=0.9' },
  { name: 'default locale', value: 'en' },
];

export type RoutingLadderProps = {
  className?: string;
  title?: string;
};

export default function RoutingLadder({ className, title }: RoutingLadderProps) {
  return (
    <div
      className={['dlv-route', className].filter(Boolean).join(' ')}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <div className='dlv-urls'>
        {URLS.map((url) => (
          <div className='dlv-url' key={url.loc}>
            example.com
            {url.seg ? <b>{url.seg}</b> : null}
            {url.em ? <em>{url.path}</em> : url.path}
            <span>{url.loc}</span>
          </div>
        ))}
      </div>

      <div className='dlv-route-rule' aria-hidden='true' />

      <div>
        <div className='dlv-ladder-cap'>detection order</div>
        <div className='dlv-ladder'>
          {RUNGS.map((rung) => (
            <div className='dlv-rung' data-won={rung.won || undefined} key={rung.name}>
              {rung.won ? <b>{rung.name}</b> : <span>{rung.name}</span>}
              <span>{rung.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='dlv-route-foot'>
        <span>each path also emits</span>
        <span>hreflang alternates · canonical URL · sitemap entry per locale</span>
      </div>
    </div>
  );
}
