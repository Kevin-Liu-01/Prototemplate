import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { tokenize } from '../../sections/code';

import './delivery.css';

/**
 * The hot-reload split — editor left, browser right, the browser locked to
 * `ja`. The English sentence in the editor is mid-keystroke; the Japanese
 * equivalent is already on the page, because a `gtx-dev-` key translates on
 * demand as you type. The fork beneath the split pre-empts the biggest
 * misread on the page: production is NOT on-demand — `gtx-api-` output is
 * pre-generated.
 *
 * Every string is one of the page's real translation pairs; nothing here is
 * glyph soup.
 */

const CODE_TOP = [
  "import { T } from 'gt-next';",
  '',
  'export default function Receipt() {',
  '  return (',
  '    <T>',
];

const CARET_PRE = '      <p>Payment received';
const CARET_POST = '</p>';

const CODE_BOTTOM = ['    </T>', '  );', '}'];

function Line({ text }: { text: string }) {
  return (
    <div>
      {tokenize(text).map((token, i) =>
        token.k === 'plain' ? token.v : <span className={`tc-t-${token.k}`} key={i}>{token.v}</span>
      )}
      {text.length === 0 ? ' ' : null}
    </div>
  );
}

export type HotReloadSplitProps = {
  className?: string;
  title?: string;
};

export default function HotReloadSplit({ className, title }: HotReloadSplitProps) {
  return (
    <div
      className={['dlv-hot', className].filter(Boolean).join(' ')}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <div className='dlv-hot-split'>
        <div className='dlv-panel'>
          <div className='dlv-panel-bar'>
            <span>page.tsx</span>
            <span>gtx-dev- · hot reload</span>
          </div>
          <div className='dlv-hot-code'>
            {CODE_TOP.map((line, i) => (
              <Line text={line} key={`t${i}`} />
            ))}
            <div>
              {tokenize(CARET_PRE).map((token, i) =>
                token.k === 'plain' ? token.v : <span className={`tc-t-${token.k}`} key={i}>{token.v}</span>
              )}
              <span className='dlv-caret' />
              {tokenize(CARET_POST).map((token, i) =>
                token.k === 'plain' ? token.v : <span className={`tc-t-${token.k}`} key={`p${i}`}>{token.v}</span>
              )}
            </div>
            {CODE_BOTTOM.map((line, i) => (
              <Line text={line} key={`b${i}`} />
            ))}
          </div>
        </div>

        <div className='dlv-hot-link' aria-hidden='true' />

        <div className='dlv-page'>
          <div className='dlv-page-bar'>
            <b>localhost:3000/ja</b>
            <span className='dlv-loc'>
              <LocaleTag code='ja' />
            </span>
            <span style={{ marginLeft: 'auto' }}>dev</span>
          </div>
          <div className='dlv-hot-body'>
            <div className='dlv-hot-h'>支払いを受領しました</div>
            <div className='dlv-hot-p'>こんにちは世界！</div>
            <div className='dlv-hot-btn'>始める</div>
            <div className='dlv-hot-foot'>
              <span>no reload · updated in place</span>
              <span>600 ms</span>
            </div>
          </div>
        </div>
      </div>

      <div className='dlv-fork'>
        <div className='dlv-fork-row' data-on=''>
          <i aria-hidden='true' />
          <span>
            <b>gtx-dev-</b> · translated on demand · preview only
          </span>
        </div>
        <div className='dlv-fork-row'>
          <i aria-hidden='true' />
          <span>
            <b>gtx-api-</b> · pre-generated · production
          </span>
        </div>
      </div>
    </div>
  );
}
