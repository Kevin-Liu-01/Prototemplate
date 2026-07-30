import type { WallSpec, WallStrings } from '../content';

/**
 * One real UI component in the hero wall.
 *
 * Every string lives in a `[data-slot]` node so the hero can rewrite it in
 * another language and let the container re-measure around the new text.
 * Split kinds (tabs, nav, segment) expose `[data-part]` children and declare
 * their separator, so the rewrite can rebuild the parts without touching HTML.
 */
export type WallComponentProps = {
  spec: WallSpec;
  strings: WallStrings;
  /** Stamps the locale on the card — only the translated side gets one. */
  translated?: boolean;
};

function parts(value: string, sep: string, count: number) {
  const split = value.split(sep).map((p) => p.trim());
  return Array.from({ length: count }, (_, i) => split[i] ?? '');
}

export default function WallComponent({ spec, strings, translated }: WallComponentProps) {
  const s = strings;
  const lang = s.lang;
  const dir = s.rtl ? 'rtl' : undefined;

  const stamp = translated ? (
    <span className='cm-wc-loc' data-slot='loc'>
      {s.locale}
    </span>
  ) : null;

  const body = (() => {
    switch (spec.kind) {
      case 'search':
        return (
          <>
            <span className='cm-wc-input' lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
            <kbd>⌘K</kbd>
          </>
        );

      case 'button':
        return (
          <span className='cm-wc-btn' lang={lang} dir={dir} data-slot='a'>
            {s.a}
          </span>
        );

      case 'toast':
        return (
          <>
            <b lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </b>
            <i lang={lang} data-slot='b'>
              {s.b}
            </i>
          </>
        );

      case 'checkbox':
        return (
          <>
            <span className='cm-wc-box' aria-hidden>
              <svg viewBox='0 0 12 12'>
                <path d='M2 6.4 4.6 9 10 3' fill='none' stroke='currentColor' strokeWidth='2' />
              </svg>
            </span>
            <span lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
          </>
        );

      case 'card':
        return (
          <>
            <b lang={lang} data-slot='a'>
              {s.a}
            </b>
            <em lang={lang} data-slot='b'>
              {s.b}
            </em>
            <span lang={lang} dir={dir} data-slot='c'>
              {s.c}
            </span>
          </>
        );

      case 'progress':
        return (
          <>
            <span className='cm-wc-row'>
              <span lang={lang} dir={dir} data-slot='a'>
                {s.a}
              </span>
              <i lang={lang} data-slot='b'>
                {s.b}
              </i>
            </span>
            <span className='cm-wc-track' aria-hidden>
              <i />
            </span>
          </>
        );

      case 'select':
        return (
          <>
            <span className='cm-wc-lab' lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
            <span className='cm-wc-ctl'>
              <span lang={lang} dir={dir} data-slot='b'>
                {s.b}
              </span>
              <b aria-hidden>▾</b>
            </span>
          </>
        );

      case 'switch':
        return (
          <>
            <span lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
            <span className='cm-wc-sw' aria-hidden>
              <i />
            </span>
          </>
        );

      case 'tabs':
        return (
          <span className='cm-wc-tabs' lang={lang} data-slot='a' data-split='/'>
            {parts(s.a, '/', 3).map((part, i) => (
              <b data-part={i} key={i}>
                {part}
              </b>
            ))}
          </span>
        );

      case 'textarea':
        return (
          <>
            <span className='cm-wc-ta' lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
            <span className='cm-wc-rules' aria-hidden>
              <i />
              <i />
            </span>
          </>
        );

      case 'api':
        return (
          <>
            <code data-slot='b'>{s.b}</code>
            <span className='cm-wc-btn cm-wc-btn--ghost' lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
          </>
        );

      case 'field':
        return (
          <>
            <span className='cm-wc-lab' lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
            <span className='cm-wc-ctl' lang={lang} dir={dir} data-slot='b'>
              {s.b}
            </span>
          </>
        );

      case 'banner':
        return (
          <span lang={lang} dir={dir} data-slot='a'>
            {s.a}
          </span>
        );

      case 'stat':
        return (
          <>
            <b className='slab' lang={lang} data-slot='b'>
              {s.b}
            </b>
            <span lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
          </>
        );

      case 'nav':
        return (
          <span className='cm-wc-nav' lang={lang} data-slot='a' data-split='·'>
            {parts(s.a, '·', 3).map((part, i) => (
              <b data-part={i} key={i}>
                {part}
              </b>
            ))}
          </span>
        );

      case 'quote':
        return (
          <>
            <span className='cm-wc-q' lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
            <span className='cm-wc-by'>
              <span className='cm-wc-av' aria-hidden>
                T
              </span>
              <span>
                <b data-slot='b'>{s.b}</b>
                <i lang={lang} data-slot='c'>
                  {s.c}
                </i>
              </span>
            </span>
          </>
        );

      case 'segment':
        return (
          <span className='cm-wc-seg' lang={lang} data-slot='a' data-split='/'>
            {parts(s.a, '/', 2).map((part, i) => (
              <b data-part={i} key={i}>
                {part}
              </b>
            ))}
          </span>
        );

      case 'actions':
        return (
          <>
            <span className='cm-wc-btn cm-wc-btn--ghost' lang={lang} dir={dir} data-slot='a'>
              {s.a}
            </span>
            <span className='cm-wc-btn' lang={lang} dir={dir} data-slot='b'>
              {s.b}
            </span>
          </>
        );
    }
  })();

  return (
    <div
      className={`cm-wc cm-wc--${spec.kind}${translated ? ' is-tr' : ''}`}
      data-wall={spec.id}
      data-side={translated ? 'tr' : 'en'}
    >
      {body}
      {stamp}
    </div>
  );
}
