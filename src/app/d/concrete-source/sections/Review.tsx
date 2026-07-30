/** ACT IV — the review workspace. */
export default function Review() {
  return (
    <section className='section' id='review' aria-label='Translation Editor'>
      <div className='sec-head'>
        <span className='sec-idx'>[04] TRANSLATION EDITOR //</span>
        <h2 className='sec-title slab' data-stamp>
          THOUGHTS?
        </h2>
        <p className='sec-sub' data-stamp>
          Agents write translations. You review, edit, and approve in a focused workspace.
        </p>
      </div>
      <div className='workspace' data-stamp>
        <div className='ws-bar'>
          <span>PROJECT: EXAMPLE-APP</span>
          <span>BRANCH: locadex/i18n</span>
          <span>LOCALE: ES</span>
          <span className='live-pill'>LIVE</span>
        </div>
        <div className='ws-grid'>
          <div className='ws-pane'>
            <span className='k'>SOURCE — EN</span>
            <span className='ws-line'>Hello, world!</span>
            <span className='ws-line sel'>
              Ship it everywhere. Your app, in every language your users speak.
            </span>
            <span className='ws-line'>Get started</span>
            <span className='ws-line'>By continuing you agree to the Terms of Service.</span>
          </div>
          <div className='ws-pane'>
            <span className='k'>TRANSLATION — ES · SIDE-BY-SIDE</span>
            <span className='ws-line'>¡Hola, mundo!</span>
            <span className='ws-line diff-del'>Envíalo por todos lados. Tu app, en cada idioma.</span>
            <span className='ws-line diff-add'>
              Envíalo a todas partes. Tu app, en cada idioma que hablan tus usuarios.
              <span className='edit-caret' />
            </span>
            <span className='ws-line'>Al continuar, aceptas los Términos del Servicio.</span>
          </div>
        </div>
        <div className='ws-foot'>
          <span>DIFF — REGENERATED 2m AGO</span>
          <span>EDIT BEFORE OR AFTER LIVE</span>
          <span className='approve'>APPROVE ✓</span>
        </div>
      </div>
    </section>
  );
}
