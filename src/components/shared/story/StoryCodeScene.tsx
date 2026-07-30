/** The editor the window flips into once Locadex takes over. */
export default function StoryCodeScene() {
  return (
    <div className='gts-code' data-code>
      <div className='gts-code-bar'>
        <span className='gts-dots'>
          <i />
          <i />
          <i />
        </span>
        <span className='gts-fname'>app/page.tsx</span>
        <span className='gts-chip' data-commit>
          push a4f2c19 · feat: landing copy
        </span>
        <span className='gts-chip' data-pr>
          PR #482 opened
        </span>
      </div>

      <div className='gts-code-body' data-codebody>
        <div className='gts-scanline' data-scanline />

        <div className='gts-cl gts-add'>
          <span className='gts-ln'>+</span>
          <span className='gts-code-txt'>
            <span className='gts-tok-kw'>import</span> {'{ '}
            <span className='gts-tok-t'>T</span>, <span className='gts-tok-t'>DateTime</span>
            {' } '}
            <span className='gts-tok-kw'>from</span>{' '}
            <span className='gts-tok-str'>&apos;gt-next&apos;</span>;
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>1</span>
          <span className='gts-code-txt'>
            <span className='gts-tok-kw'>export default function</span>{' '}
            <span className='gts-tok-fn'>Page</span>() {'{'}
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>2</span>
          <span className='gts-code-txt'>
            {'  '}
            <span className='gts-tok-kw'>return</span> (
          </span>
        </div>
        <div className='gts-cl gts-add'>
          <span className='gts-ln'>+</span>
          <span className='gts-code-txt'>
            {'    '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-t'>T</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>3</span>
          <span className='gts-code-txt'>
            {'    '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-tag'>main</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>4</span>
          <span className='gts-code-txt'>
            {'      '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-tag'>h1</span>
            <span className='gts-tok-p'>&gt;</span>
            <span className='gts-tok-txt'>Hello, world!</span>
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-tag'>h1</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
          <span className='gts-lmk' data-note='1'>
            <span>!</span>
            <span className='gts-tip'>
              <b>Unwrapped copy.</b> The heading is a raw string — Locadex wraps the block in
              &lt;T&gt; so every locale renders inline.
            </span>
          </span>
        </div>
        <div className='gts-cl' data-delline>
          <span className='gts-ln'>5</span>
          <span className='gts-code-txt' data-deltxt>
            {'      '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-tag'>p</span>
            <span className='gts-tok-p'>&gt;</span>
            {'{'}
            <span className='gts-tok-fn'>date</span>.
            <span className='gts-tok-fn'>toLocaleDateString</span>(){'}'}
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-tag'>p</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
          <span className='gts-lmk' data-note='2'>
            <span>!</span>
            <span className='gts-tip'>
              <b>Unlocalized date.</b> toLocaleDateString ignores the app locale — replaced with
              &lt;DateTime&gt; for correct formats.
            </span>
          </span>
        </div>
        <div className='gts-cl gts-add'>
          <span className='gts-ln'>+</span>
          <span className='gts-code-txt'>
            {'      '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-tag'>p</span>
            <span className='gts-tok-p'>&gt;&lt;</span>
            <span className='gts-tok-t'>DateTime</span>
            <span className='gts-tok-p'>&gt;</span>
            {'{date}'}
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-t'>DateTime</span>
            <span className='gts-tok-p'>&gt;&lt;/</span>
            <span className='gts-tok-tag'>p</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>6</span>
          <span className='gts-code-txt'>
            {'      '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-tag'>p</span>
            <span className='gts-tok-p'>&gt;</span>
            <span className='gts-tok-txt'>General Translation builds full-stack</span>
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>7</span>
          <span className='gts-code-txt'>
            {'      '}
            <span className='gts-tok-txt'>infrastructure for localizing apps…</span>
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-tag'>p</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>8</span>
          <span className='gts-code-txt'>
            {'      '}
            <span className='gts-tok-p'>&lt;</span>
            <span className='gts-tok-tag'>button</span>
            <span className='gts-tok-p'>&gt;</span>
            <span className='gts-tok-txt'>Get started</span>
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-tag'>button</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
          <span className='gts-lmk' data-note='3'>
            <span>!</span>
            <span className='gts-tip'>
              <b>CTA copy.</b> The button label enters the context platform — the glossary pins
              “Get started” to approved verbs per locale.
            </span>
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>9</span>
          <span className='gts-code-txt'>
            {'    '}
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-tag'>main</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
        </div>
        <div className='gts-cl gts-add'>
          <span className='gts-ln'>+</span>
          <span className='gts-code-txt'>
            {'    '}
            <span className='gts-tok-p'>&lt;/</span>
            <span className='gts-tok-t'>T</span>
            <span className='gts-tok-p'>&gt;</span>
          </span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>10</span>
          <span className='gts-code-txt'>{'  );'}</span>
        </div>
        <div className='gts-cl'>
          <span className='gts-ln'>11</span>
          <span className='gts-code-txt'>{'}'}</span>
        </div>
      </div>

      <span className='gts-chip gts-chip-tbadge' data-tbadge>
        translations: es · fr · ja · de · zh
      </span>

      <div className='gts-diff' data-diff>
        <div className='gts-diff-head'>
          <div className='gts-branch'>locadex/i18n-sweep → main</div>
          <div className='gts-diffstats'>
            <span className='gts-plus'>+38</span> <span className='gts-minus'>−12</span> · 6 files ·
            es fr ja de zh
          </div>
        </div>
        <div className='gts-diff-lines'>
          <div className='gts-dl gts-h'>diff --git a/app/page.tsx b/app/page.tsx</div>
          <div className='gts-dl gts-h'>@@ -1,6 +1,9 @@</div>
          <div className='gts-dl gts-a'>+ import {'{ T, DateTime }'} from &apos;gt-next&apos;;</div>
          <div className='gts-dl'>{'  export default function Page() {'}</div>
          <div className='gts-dl'>{'    return ('}</div>
          <div className='gts-dl gts-a'>{'+     <T>'}</div>
          <div className='gts-dl'>{'        <main>'}</div>
          <div className='gts-dl'>{'          <h1>Hello, world!</h1>'}</div>
          <div className='gts-dl gts-d'>
            {'-         <p>{date.toLocaleDateString()}</p>'}
          </div>
          <div className='gts-dl gts-a'>
            {'+         <p><DateTime>{date}</DateTime></p>'}
          </div>
          <div className='gts-dl'>{'          <button>Get started</button>'}</div>
          <div className='gts-dl gts-a'>{'+     </T>'}</div>
          <div className='gts-dl gts-h'>@@ public/_gt/es.json @@</div>
          <div className='gts-dl gts-a'>+ &quot;Hello, world!&quot;: &quot;¡Hola, mundo!&quot;,</div>
          <div className='gts-dl gts-a'>+ &quot;Get started&quot;: &quot;Comenzar ahora&quot;,</div>
          <div className='gts-dl gts-h'>@@ public/_gt/ja.json @@</div>
          <div className='gts-dl gts-a' lang='ja'>
            + &quot;Hello, world!&quot;: &quot;こんにちは、世界！&quot;,
          </div>
          <div className='gts-dl gts-a' lang='ja'>
            + &quot;Get started&quot;: &quot;始める&quot;,
          </div>
          <div className='gts-dl gts-h'>@@ public/_gt/fr.json @@</div>
          <div className='gts-dl gts-a' lang='fr'>
            + &quot;Hello, world!&quot;: &quot;Bonjour, le monde !&quot;,
          </div>
          <div className='gts-dl gts-a' lang='fr'>
            + &quot;Get started&quot;: &quot;Commencer&quot;,
          </div>
        </div>
        <div className='gts-diff-foot'>
          <span className='gts-openpr' data-openpr>
            Open PR
          </span>
          <span className='gts-prtoast' data-prtoast>
            Pull request created for review
            <br />
            <span className='gts-merged'>merged</span>
          </span>
        </div>
      </div>

      <div className='gts-cursor gts-cursor-agent' data-agentcursor>
        <svg width='20' height='26' viewBox='0 0 17 22'>
          <path
            d='M1 1 L1 17 L5.5 13.4 L8.4 20 L11.4 18.7 L8.6 12.3 L14.4 12 Z'
            fill='#fff'
            stroke='#0b0d10'
            strokeWidth='1.2'
          />
        </svg>
        <span className='gts-cursor-label'>LOCADEX</span>
      </div>
    </div>
  );
}
