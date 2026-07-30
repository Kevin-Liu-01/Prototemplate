/**
 * The example app that lives inside the paper window. Every `.bi` pair is an
 * English node with its Spanish twin layered on top; the story timeline
 * cross-fades them and tweens the measured container size so the DOM visibly
 * resizes as translations land.
 *
 * Whitespace between the `.bi` spans and the absolutely-positioned markers is
 * reproduced with explicit `{' '}` because JSX drops the newlines the source
 * relied on, and those collapsed spaces are part of the measured widths.
 */
export default function DemoSite() {
  return (
    <div className='demo-site' id='demo-site'>
      <div className='ds-nav'>
        <span className='ds-logo'>EXAMPLE&nbsp;APP</span>
        <span className='ds-links'>
          <span className='bi'>
            <span className='en'>Products</span>
            <span className='es'>Productos</span>
          </span>
          <span className='bi'>
            <span className='en'>Pricing</span>
            <span className='es'>Precios</span>
          </span>
          <span className='bi'>
            <span className='en'>Contact</span>
            <span className='es'>Contacto</span>
          </span>
        </span>
        <span className='ds-cta bi'>
          <span className='en'>Sign up</span>
          <span className='es'>Regístrate</span>
        </span>
      </div>
      <div className='ds-body'>
        <div className='ds-h1' id='ds-title-wrap'>
          <span id='ds-title'>Hello, world!</span>{' '}
          <span className='mk' style={{ top: '-6px', right: '-24px' }}>
            <span className='pin'>1</span>
          </span>
        </div>
        <div className='ds-date'>MON, JUL 27 2026 · SF</div>
        <p className='ds-p'>
          <span className='bi'>
            <span className='en'>
              General Translation builds full-stack infrastructure for localizing apps, docs, and
              websites.
            </span>
            <span className='es'>
              General Translation construye infraestructura integral para localizar aplicaciones,
              documentos y sitios web.
            </span>
          </span>{' '}
          <span className='mk' style={{ top: '-8px', left: '-10px' }}>
            <span className='pin'>2</span>
            <span className='tag'>context</span>
          </span>{' '}
          <span className='scn-chip lite' id='chip-ctx' style={{ top: '-30px', right: 0 }}>
            ctx: 12 items ingested
          </span>
        </p>
        <div className='ds-row'>
          <div>
            <button className='ds-btn' id='ds-btn' type='button'>
              <span className='bi'>
                <span className='en'>Get started</span>
                <span className='es'>Empezar</span>
              </span>{' '}
              <span className='mk' style={{ top: '-10px', right: '-8px' }}>
                <span className='pin'>3</span>
              </span>
            </button>
            <div className='ds-stat'>
              <span className='num'>118</span>{' '}
              <span className='lbl bi'>
                <span className='en'>languages ready</span>
                <span className='es'>idiomas listos</span>
              </span>{' '}
              <span className='mk' style={{ top: '-4px', right: '-20px' }}>
                <span className='pin'>6</span>
              </span>
            </div>
          </div>
          <p className='ds-copy' id='ds-copy'>
            <span className='bi'>
              <span className='en'>
                <b>Ship it everywhere.</b> Your app, in every language your users speak.
              </span>
              <span className='es'>
                <b>Envíalo a todas partes.</b> Tu app, en cada idioma que hablan tus usuarios.
              </span>
            </span>{' '}
            <span className='mk' style={{ top: '-10px', left: '-10px' }}>
              <span className='pin'>4</span>
              <span className='tag'>context</span>
            </span>{' '}
            <span className='scn-chip lite' id='chip-tone'>
              tone: upbeat ✓
            </span>
          </p>
        </div>
        <p className='ds-legal' id='ds-legal'>
          <span className='bi'>
            <span className='en'>
              By continuing you agree to the Terms of Service and Privacy Policy.
            </span>
            <span className='es'>
              Al continuar, aceptas los Términos del Servicio y la Política de Privacidad.
            </span>
          </span>{' '}
          <span className='mk' id='mk-review' style={{ top: '-12px', left: '40%' }}>
            <span className='pin'>5</span>
            <span className='tag warn'>requires review</span>
          </span>
        </p>
      </div>

      {/* beat 2/3/4 overlays */}
      <span className='scn-chip' id='chip-translate' style={{ top: '8px', left: '8px' }}>
        ⟐ translate
      </span>
      <span className='scn-chip' id='chip-live' style={{ bottom: '8px', right: '8px' }}>
        LIVE — 5 LOCALES ✓
      </span>

      <div className='code-slider' id='slider-t' style={{ left: '4%', top: '40%', width: '32%' }}>
        {/* the source opens the pre block on its own line; that newline is a rendered blank row */}
        {'\n'}
        <span className='cs-head'>BUTTON.TSX — THE CODE BEHIND IT</span>
        <span className='tok-tag'>&lt;</span>
        <span className='tok-cmp'>T</span>
        <span className='tok-tag'>&gt;</span>
        {'\n  '}
        <span className='tok-tag'>&lt;</span>
        <span className='tok-kw'>button</span>
        <span className='tok-tag'>&gt;</span>
        <span className='tok-txt'>Get started</span>
        <span className='tok-tag'>&lt;/</span>
        <span className='tok-kw'>button</span>
        <span className='tok-tag'>&gt;</span>
        {'\n'}
        <span className='tok-tag'>&lt;/</span>
        <span className='tok-cmp'>T</span>
        <span className='tok-tag'>&gt;</span>
      </div>

      <div className='code-slider' id='slider-ctx' style={{ left: '12%', top: '30%', width: '56%' }}>
        {'\n'}
        <span className='cs-head'>TAGLINE.TSX — YOUR OWN CONTEXT</span>
        <span className='tok-tag'>&lt;</span>
        <span className='tok-cmp'>T</span>{' '}
        <span className='tok-attr'>context</span>
        <span className='tok-tag'>=</span>
        <span className='tok-str'>&quot;Playful, upbeat marketing tone&quot;</span>
        <span className='tok-tag'>&gt;</span>
        {'\n  '}
        <span className='tok-tag'>&lt;</span>
        <span className='tok-kw'>p</span>
        <span className='tok-tag'>&gt;</span>
        <span className='tok-txt'>Ship it everywhere. …</span>
        <span className='tok-tag'>&lt;/</span>
        <span className='tok-kw'>p</span>
        <span className='tok-tag'>&gt;</span>
        {'\n'}
        <span className='tok-tag'>&lt;/</span>
        <span className='tok-cmp'>T</span>
        <span className='tok-tag'>&gt;</span>
      </div>
    </div>
  );
}
