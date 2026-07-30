/**
 * Real-artifact drawings for the Field Magnet bento.
 *
 * Artefact law: every string, locale code, filename, JSON key, timing and diff
 * line here exists in the product (sources: MODULES_PLAN M02/M04/M06/M08/M09/
 * M11/M13/M14 and the next-ssg `_gt` files). No grey slabs, no squiggle text.
 * Each drawing is an opaque machined plate that spans its cell; all in-diagram
 * type is mono with an 11px floor.
 */

/* ---------------------------------------------------------------- Code */

export function CodeWrapArtifact() {
  return (
    <div className='fmba fmba-code'>
      <div className='fmba-head'>
        <span className='fmba-file'>app/page.tsx</span>
        <span>gt-next</span>
      </div>
      <pre>
        <div className='fmba-l'>
          <span className='fmba-n'>1</span>
          <code>
            <i>import</i> {'{'} <b>T</b>, <b>DateTime</b> {'}'} <i>from</i>{' '}
            <em>&apos;gt-next&apos;</em>;
          </code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>2</span>
          <code />
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>3</span>
          <code>
            <i>export default function</i> <b>Home</b>() {'{'}
          </code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>4</span>
          <code>
            {'  '}
            <i>return</i> (
          </code>
        </div>
        <div className='fmba-wrapzone'>
          <div className='fmba-l'>
            <span className='fmba-n'>5</span>
            <code>
              {'    '}
              <i>&lt;</i>
              <b>T</b>
              <i>&gt;</i>
            </code>
          </div>
          <div className='fmba-l'>
            <span className='fmba-n'>6</span>
            <code>
              {'      '}
              <i>&lt;main&gt;</i>
            </code>
          </div>
          <div className='fmba-l'>
            <span className='fmba-n'>7</span>
            <code>
              {'        '}
              <i>&lt;h1&gt;</i>
              <u>Hello, world!</u>
              <i>&lt;/h1&gt;</i>
            </code>
          </div>
          <div className='fmba-l'>
            <span className='fmba-n'>8</span>
            <code>
              {'        '}
              <i>&lt;p&gt;&lt;</i>
              <b>DateTime</b>
              <i>&gt;</i>
              {'{'}
              <i>new</i> <b>Date</b>(){'}'}
              <i>&lt;/</i>
              <b>DateTime</b>
              <i>&gt;&lt;/p&gt;</i>
            </code>
          </div>
          <div className='fmba-l'>
            <span className='fmba-n'>9</span>
            <code>
              {'        '}
              <i>&lt;p&gt;</i>
              <u>General Translation builds full-stack</u>
            </code>
          </div>
          <div className='fmba-l'>
            <span className='fmba-n'>10</span>
            <code>
              {'        '}
              <u>infrastructure for localizing apps.</u>
              <i>&lt;/p&gt;</i>
            </code>
          </div>
          <div className='fmba-l'>
            <span className='fmba-n'>11</span>
            <code>
              {'      '}
              <i>&lt;/main&gt;</i>
            </code>
          </div>
          <div className='fmba-l'>
            <span className='fmba-n'>12</span>
            <code>
              {'    '}
              <i>&lt;/</i>
              <b>T</b>
              <i>&gt;</i>
            </code>
          </div>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>13</span>
          <code>{'  '});</code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>14</span>
          <code>{'}'}</code>
        </div>
      </pre>
      <div className='fmba-foot'>
        <span>
          nested markup survives translation · <b>no extraction step</b>
        </span>
        <span>es · fr · ja · de · zh</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Translation */

const DIFF: { t: 'hunk' | 'ctx' | 'add' | 'del'; s: string }[] = [
  { t: 'hunk', s: '@@ -1,14 +1,17 @@' },
  { t: 'del', s: "import { Num, DateTime } from 'next/intl-shim';" },
  { t: 'add', s: "import { T, Num, DateTime } from 'gt-next';" },
  { t: 'ctx', s: 'export default function Home() {' },
  { t: 'ctx', s: '  return (' },
  { t: 'add', s: '    <T>' },
  { t: 'ctx', s: '      <main>' },
  { t: 'ctx', s: '        <h1>Hello, world!</h1>' },
  { t: 'ctx', s: '        <p><DateTime>{new Date()}</DateTime></p>' },
  { t: 'ctx', s: '      </main>' },
  { t: 'add', s: '    </T>' },
  { t: 'ctx', s: '  );' },
];

export function AgentDiffArtifact() {
  return (
    <div className='fmba fmba-diff'>
      <div className='fmba-head'>
        <span className='fmba-branch'>
          <b>locadex/generate-code</b>
          <span className='fmba-into'>→ main</span>
        </span>
        <span>
          47 files changed · <b>+612</b> <s>−318</s>
        </span>
      </div>
      <div className='fmba-diffbody'>
        {DIFF.map((line, i) => (
          <div className={`fmba-d fmba-${line.t}`} key={i}>
            <span className='fmba-gut'>
              {line.t === 'add' ? '+' : line.t === 'del' ? '−' : ''}
            </span>
            <code>{line.s}</code>
          </div>
        ))}
      </div>
      <div className='fmba-foot'>
        <span>
          build <b>✓</b>&ensp;typecheck <b>✓</b>&ensp;gt validate <b>✓</b>
        </span>
        <span>auto-merge is off for this repository</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Context */

export function GlossaryArtifact() {
  return (
    <div className='fmba fmba-gloss'>
      <div className='fmba-head'>
        <span className='fmba-file'>org/acme · context group</span>
        <span>applies to every project</span>
      </div>
      <div className='fmba-gh'>glossary</div>
      <div className='fmba-g'>
        <b>Locadex</b>
        <span>do not translate</span>
        <em>all</em>
      </div>
      <div className='fmba-g'>
        <b>Context Group</b>
        <span>do not translate</span>
        <em>all</em>
      </div>
      <div className='fmba-g'>
        <b>Workflow</b>
        <span lang='ja'>ワークフロー</span>
        <em>ja</em>
      </div>
      <div className='fmba-gh'>directives</div>
      <div className='fmba-g'>
        <b>Register</b>
        <span>use formal “Sie”</span>
        <em>de</em>
      </div>
      <div className='fmba-g'>
        <b>Voice</b>
        <span>active, no jargon</span>
        <em>all</em>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Routing */

export function RoutingArtifact() {
  return (
    <div className='fmba fmba-routes'>
      <div className='fmba-url'>
        <span className='fmba-lock' aria-hidden />
        <code>
          example.com<u>/about</u>
        </code>
        <em>en</em>
      </div>
      <div className='fmba-url'>
        <span className='fmba-lock' aria-hidden />
        <code>
          example.com<b>/es</b>
          <u>/about</u>
        </code>
        <em>es</em>
      </div>
      <div className='fmba-url'>
        <span className='fmba-lock' aria-hidden />
        <code>
          example.com<b>/fr</b>
          <b className='fmba-loc'>/a-propos</b>
        </code>
        <em>fr</em>
      </div>
      <div className='fmba-foot'>
        <span>
          <b>url</b> → cookie → accept-language → default
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Delivery */

const POPS: { code: string; city: string; ms: number }[] = [
  { code: 'iad', city: 'Ashburn', ms: 9 },
  { code: 'fra', city: 'Frankfurt', ms: 12 },
  { code: 'nrt', city: 'Tokyo', ms: 21 },
  { code: 'gru', city: 'São Paulo', ms: 26 },
  { code: 'syd', city: 'Sydney', ms: 31 },
];

export function EdgeArtifact() {
  const max = Math.max(...POPS.map((p) => p.ms));
  return (
    <div className='fmba fmba-edge'>
      <div className='fmba-head'>
        <span className='fmba-file'>public/_gt/[locale].json</span>
        <span>served from the edge</span>
      </div>
      {POPS.map((p, i) => (
        <div className='fmba-e' key={p.code}>
          <b>{p.code}</b>
          <span>{p.city}</span>
          <span className='fmba-track'>
            <span
              className={i === 0 ? 'fmba-fill fmba-best' : 'fmba-fill'}
              style={{ width: `${(p.ms / max) * 100}%` }}
            />
          </span>
          <em>{p.ms} ms</em>
        </div>
      ))}
      <div className='fmba-foot'>
        <span>
          edit a string · CDN serves it · <b>no deploy</b>
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Previews */

export function PreviewArtifact() {
  return (
    <div className='fmba fmba-preview'>
      <div className='fmba-btop'>
        <span className='fmba-dots' aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <code className='fmba-urlpill'>localhost:3000/ja</code>
        <em>dev</em>
      </div>
      <div className='fmba-page' lang='ja'>
        <div className='fmba-page-h'>こんにちは、世界！</div>
        <p>開始するには、page.tsxファイルを編集してください。</p>
        <span className='fmba-page-btn'>始める</span>
      </div>
      <div className='fmba-foot'>
        <span>
          gtx-dev- · retranslates as you type · <b>no reload</b>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- Live Translation */

export function RuntimeChatArtifact() {
  return (
    <div className='fmba fmba-chat'>
      <div className='fmba-m' lang='es'>
        ¿Dónde está mi pedido?
        <span className='fmba-meta'>customer · es</span>
      </div>
      <div className='fmba-m fmba-m-tr'>
        Where is my order?
        <span className='fmba-meta'>
          <b>translated · 84 ms</b> · full thread context
        </span>
      </div>
      <div className='fmba-m fmba-m-out'>
        It ships tomorrow.
        <span className='fmba-meta'>support · en → es</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Config */

export function ConfigArtifact() {
  return (
    <div className='fmba fmba-config'>
      <div className='fmba-head'>
        <span className='fmba-file'>gt.config.json</span>
        <span>identical across all six SDKs</span>
      </div>
      <pre>
        <div className='fmba-l'>
          <span className='fmba-n'>1</span>
          <code>{'{'}</code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>2</span>
          <code>
            {'  '}
            <i>&quot;defaultLocale&quot;</i>: <em>&quot;en&quot;</em>,
          </code>
        </div>
        <div className='fmba-wrapzone'>
          <div className='fmba-l'>
            <span className='fmba-n'>3</span>
            <code>
              {'  '}
              <i>&quot;locales&quot;</i>: [<em>&quot;es&quot;</em>,<em>&quot;fr&quot;</em>,
              <em>&quot;ja&quot;</em>,<em>&quot;de&quot;</em>,<em>&quot;zh&quot;</em>],
            </code>
          </div>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>4</span>
          <code>
            {'  '}
            <i>&quot;files&quot;</i>: {'{'}
          </code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>5</span>
          <code>
            {'    '}
            <i>&quot;gt&quot;</i>: {'{'}
          </code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>6</span>
          <code>
            {'      '}
            <i>&quot;output&quot;</i>: <em>&quot;public/_gt/[locale].json&quot;</em>
          </code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>7</span>
          <code>
            {'    '}
            {'}'}
          </code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>8</span>
          <code>
            {'  '}
            {'}'}
          </code>
        </div>
        <div className='fmba-l'>
          <span className='fmba-n'>9</span>
          <code>{'}'}</code>
        </div>
      </pre>
      <div className='fmba-foot'>
        <span>
          own detection functions · locale components · <b>Intl formatting</b>
        </span>
      </div>
    </div>
  );
}
