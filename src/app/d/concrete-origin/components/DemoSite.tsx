import type { ReactNode } from 'react';

type BiProps = { en: ReactNode; es: ReactNode; className?: string };

/** Source and translation stacked in one box so containers can be measured in both. */
function Bi({ en, es, className }: BiProps) {
  return (
    <span className={className ? `cm-bi ${className}` : 'cm-bi'}>
      <span className='en'>{en}</span>
      <span className='es'>{es}</span>
    </span>
  );
}

type MarkProps = { n: number; tag?: string; warn?: boolean; style: React.CSSProperties };

function Mark({ n, tag, warn, style }: MarkProps) {
  return (
    <span className='cm-mk' style={style} data-mk={n}>
      <span className='pin'>{n}</span>
      {tag ? <span className={warn ? 'tag warn' : 'tag'}>{tag}</span> : null}
    </span>
  );
}

/**
 * The demo marketing page the story zooms into. Every translatable node is a
 * <Bi> so the Locadex pass can swap language AND re-measure its container —
 * the layout has to be seen breathing, not just re-lettered.
 */
export default function DemoSite() {
  return (
    <div className='cm-demo' data-demo>
      <div className='cm-ds-nav cm-blk' data-blk='nav'>
        <span className='cm-ds-logo'>EXAMPLE APP</span>
        <span className='cm-ds-links' data-grp='nav'>
          <Bi en='Products' es='Productos' />
          <Bi en='Pricing' es='Precios' />
          <Bi en='Contact' es='Contacto' />
        </span>
        <span className='cm-ds-cta' data-node='cta'>
          <Bi en='Sign up' es='Regístrate' />
        </span>
      </div>

      <div className='cm-ds-body'>
        <div className='cm-blk' data-blk='title' style={{ display: 'inline-block' }}>
          <div className='cm-ds-h1'>
            <span data-node='title'>Hello, world!</span>
            <Mark n={1} style={{ top: '-6px', right: '-26px' }} />
          </div>
          <div className='cm-ds-date'>MON, JUL 27 2026 · SF</div>
        </div>

        <p className='cm-ds-p cm-blk' data-blk='para' data-node='para'>
          <Bi
            en='General Translation builds full-stack infrastructure for localizing apps, docs, and websites.'
            es='General Translation crea infraestructura integral para localizar aplicaciones, documentación y sitios web.'
          />
          <Mark n={2} tag='context' style={{ top: '-10px', left: '-12px' }} />
          <span className='cm-scn lite' data-chip='ctx' style={{ top: '-34px', right: 0 }}>
            ctx: 12 items ingested
          </span>
        </p>

        <div className='cm-ds-row'>
          <div className='cm-blk' data-blk='action'>
            <button className='cm-ds-btn' type='button' data-node='btn'>
              <Bi en='Get started' es='Empezar ahora' />
              <Mark n={3} style={{ top: '-10px', right: '-10px' }} />
            </button>
            <div className='cm-ds-stat'>
              <span className='num'>118</span>
              <span className='lbl' data-node='stat'>
                <Bi en='languages ready' es='idiomas listos' />
              </span>
              <Mark n={6} style={{ top: '2px', right: '-24px' }} />
            </div>
          </div>

          <p className='cm-ds-copy cm-blk' data-blk='copy' data-node='copy'>
            <Bi
              en={
                <>
                  <b>Ship it everywhere.</b> Your app, in every language your users speak.
                </>
              }
              es={
                <>
                  <b>Publícalo en todas partes.</b> Tu aplicación, en cada idioma que hablan tus
                  usuarios.
                </>
              }
            />
            <Mark n={4} tag='context' style={{ top: '-12px', left: '-12px' }} />
            <span className='cm-scn lite' data-chip='tone' style={{ bottom: '-30px', right: 0 }}>
              tone: upbeat ✓
            </span>
          </p>
        </div>

        <p className='cm-ds-legal cm-blk' data-blk='legal' data-node='legal'>
          <Bi
            en='By continuing you agree to the Terms of Service and Privacy Policy.'
            es='Al continuar, aceptas los Términos del Servicio y la Política de Privacidad.'
          />
          <Mark n={5} tag='requires review' warn style={{ top: '-12px', left: '42%' }} />
        </p>
      </div>

      <span className='cm-scn' data-chip='translate' style={{ top: '10px', left: '10px' }}>
        ⟐ translate
      </span>
      <span className='cm-scn' data-chip='live' style={{ bottom: '10px', right: '10px' }}>
        LIVE — 5 LOCALES ✓
      </span>
    </div>
  );
}
