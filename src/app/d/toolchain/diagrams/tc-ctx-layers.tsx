/**
 * The context-layers model, drawn as the three-level inheritance it is:
 * Organization → Project → Component, stacked the way the model actually
 * flows — downward — and joined by the brand's doubled thread with a real
 * arrowhead, because the inheritance IS the diagram.
 *
 * Layer 1 defines Context Groups — a glossary for terminology and directives
 * for style, both with their real rules. Layer 2 applies groups to a project
 * and settles overlaps by priority (the org's own "formal 'Sie'" directive is
 * shown winning that overlap — inheritance demonstrated, not asserted).
 * Layer 3 is the `<T>` component itself, where one attribute keeps "toast" a
 * notification instead of bread — with the Spanish toast actually rendered.
 */

/** The inheritance joint: the doubled thread, pointing down, labelled. */
function InheritedBy() {
  return (
    <div className='tcctx-link' data-reveal>
      <svg viewBox='0 0 24 58' width={24} height={58} aria-hidden='true'>
        <path className='tcctx-arrow' d='M10.5 0v45' />
        <path className='tcctx-arrow' d='M13.5 0v45' />
        <path className='tcctx-head' d='M5 46L12 57L19 46Z' />
      </svg>
      <span>inherited by</span>
    </div>
  );
}

export default function TcCtxLayers() {
  return (
    <div className='tcctx'>
      <div className='tcctx-panel' data-reveal>
        <div className='tcctx-title'>
          <h4>Organization</h4>
          <p className='tcctx-cap'>Define company-wide terminology and translation defaults.</p>
        </div>

        <div className='tcctx-two'>
          <div>
            <div className='tcctx-k'>
              Glossary <span>terminology</span>
            </div>
            <p className='tcctx-note'>Product and brand names, features, technical terms.</p>
            <div className='tcctx-rule'>“Locadex is the GT agent — do not translate.”</div>
          </div>
          <div>
            <div className='tcctx-k'>
              Directives <span>style</span>
            </div>
            <p className='tcctx-note'>Tone, audience, formality, conventions, formatting.</p>
            <div className='tcctx-rule'>“Use active voice, avoid jargon, use formal ‘Sie’.”</div>
          </div>
        </div>
      </div>

      <InheritedBy />

      <div className='tcctx-panel' data-reveal>
        <div className='tcctx-title'>
          <h4>Project</h4>
          <p className='tcctx-cap'>Apply custom rules to a product, project, or feature.</p>
        </div>

        <div className='tcctx-two'>
          <div>
            <div className='tcctx-k'>
              Groups <span>applied</span>
            </div>
            <div className='tcctx-groups'>
              <div className='tcctx-grow'>
                <span className='tcctx-pri'>1</span>
                <b>brand-core</b>
                <span className='tcctx-tag'>org</span>
              </div>
              <div className='tcctx-grow'>
                <span className='tcctx-pri'>2</span>
                <b>docs-style</b>
                <span className='tcctx-tag'>org</span>
              </div>
              <div className='tcctx-grow'>
                <span className='tcctx-pri'>3</span>
                <b>checkout-copy</b>
                <span className='tcctx-tag'>project</span>
              </div>
            </div>
          </div>
          <div>
            <div className='tcctx-k'>
              Priority <span>on overlap: formality</span>
            </div>
            <div className='tcctx-clash'>
              <div className='is-win'>
                <span className='tcctx-pri'>1</span>
                <b>brand-core</b> — “use formal ‘Sie’.”
              </div>
              <div className='is-lose'>
                <span className='tcctx-pri'>2</span>
                <s>docs-style — “keep the tone casual.”</s>
              </div>
            </div>
            <p className='tcctx-note is-foot'>Where groups overlap, the highest priority wins.</p>
          </div>
        </div>
      </div>

      <InheritedBy />

      <div className='tcctx-panel' data-reveal>
        <div className='tcctx-title'>
          <h4>Component</h4>
          <p className='tcctx-cap'>Guide translation of a specific instance, inline in the code.</p>
        </div>

        <div className='tcctx-two'>
          <pre className='tcctx-code'>
            <div>
              <span className='tcm-dim'>{'<'}</span>
              <span className='tcm-gt'>T</span>{' '}
              <span className='tcm-kw'>context</span>
              <span className='tcm-dim'>=</span>
              <span className='tcm-str'>&quot;notification popup, not bread&quot;</span>
              <span className='tcm-dim'>{'>'}</span>
            </div>
            <div>{'  Click the toast to dismiss'}</div>
            <div>
              <span className='tcm-dim'>{'</'}</span>
              <span className='tcm-gt'>T</span>
              <span className='tcm-dim'>{'>'}</span>
            </div>
          </pre>
          <div>
            <div className='tcctx-k'>
              Rendered <span>es</span>
            </div>
            <div className='tcctx-toast' lang='es'>
              <span>Haz clic en la notificación para descartarla</span>
              <i aria-hidden='true'>×</i>
            </div>
            <div className='tcctx-res'>
              <span>toast →</span>
              <b className='tcctx-yes' lang='es'>
                la notificación
              </b>
              <s className='tcctx-no' lang='es'>
                la tostada
              </s>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
