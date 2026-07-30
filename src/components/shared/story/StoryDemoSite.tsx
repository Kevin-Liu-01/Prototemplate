import type { CSSProperties, ReactNode } from 'react';

/**
 * A dual-language text node. The source face sits in the flow; the target face
 * is stacked on top of it so the container can be measured in both languages
 * and animated between them — the DOM really does resize.
 */
function Sw({ en, es, resize }: { en: ReactNode; es: ReactNode; resize?: 'w' | 'h' | 'wh' }) {
  return (
    <span className='gts-sw' data-resize={resize}>
      <span className='gts-en'>{en}</span>
      <span className='gts-es'>{es}</span>
    </span>
  );
}

/**
 * A translation pin: the mark on a text node is the product's own tag —
 * `<T>` — never a numbered count chip (§5 bans index marks). The pellet
 * animation streams context out of these pins.
 */
function Marker({ badge, style, tick }: { badge?: string; style: CSSProperties; tick?: boolean }) {
  return (
    <span className={`gts-mk${tick ? ' gts-mk-tick' : ''}`} style={style} data-mk>
      <span className='gts-mk-n'>{'<T>'}</span>
      {badge && <span className='gts-mk-b'>{badge}</span>}
    </span>
  );
}

/** The plausible little marketing page the story plays out inside. */
export default function StoryDemoSite() {
  return (
    <div className='gts-site' data-site>
      <div className='gts-site-left'>
        <h2 className='gts-site-h1' data-block data-h1>
          <Sw en='Hello, world!' es='¡Hola, mundo!' resize='w' />
          <Marker style={{ top: 12, right: -44 }} tick />
        </h2>

        <p className='gts-site-date' data-block data-date>
          {/* locale codes stay lowercase everywhere (DESIGN_STANDARD §2) */}
          <Sw en='July 28, 2026 · en-us' es='28 de julio de 2026 · es-419' resize='w' />
        </p>

        <p className='gts-site-p' data-block data-para>
          <Sw
            en='General Translation builds full-stack infrastructure for localizing apps, docs, and websites.'
            es='General Translation construye infraestructura integral para localizar aplicaciones, documentación y sitios web.'
            resize='h'
          />
          <Marker style={{ top: 2, left: -56 }} />
          <span className='gts-chip-flag' data-flagchip style={{ top: -34, right: -8 }}>
            translating · es-419
          </span>
        </p>

        <div className='gts-site-nav' data-block data-nav>
          <span>
            <Sw en='Home' es='Inicio' resize='w' />
          </span>
          <span>
            <Sw en='Pricing' es='Precios' resize='w' />
          </span>
          <span>
            <Sw en='Docs' es='Documentación' resize='w' />
          </span>
          <span>
            <Sw en='Contact' es='Contacto' resize='w' />
          </span>
        </div>

        <span className='gts-site-btn' data-block data-btn>
          <Sw en='Get started' es='Comenzar ahora' resize='w' />
          <Marker style={{ top: 'calc(50% - 10px)', right: -44 }} tick />
        </span>

        <p className='gts-site-legal' data-block data-legal>
          <Sw
            en='By continuing you agree to our Terms of Service.'
            es='Al continuar, aceptas nuestros Términos de Servicio.'
            resize='h'
          />
          <Marker badge='requires review' style={{ top: -30, left: 0 }} />
        </p>

        <div className='gts-site-stats' data-block aria-hidden>
          <span>
            <b>118</b>
            <small>locales</small>
          </span>
          <span>
            <b>&lt;1s</b>
            <small>ota updates</small>
          </span>
          <span>
            <b>99.99%</b>
            <small>
              <Sw en='uptime' es='disponibilidad' resize='w' />
            </small>
          </span>
        </div>
      </div>

      <div className='gts-site-right'>
        <div className='gts-site-card' data-block data-tag>
          <p className='gts-tagline'>
            <Sw
              en='Translation that just works.'
              es='Traducciones que simplemente funcionan.'
              resize='h'
            />
          </p>
          <Marker style={{ top: -12, left: -10 }} />
          {/* anchored well inboard of the card's right corner: beat 4 zooms the
              card past the viewport edge, and a corner-anchored chip gets
              guillotined to a floating white sliver at the frame's edge */}
          <span className='gts-chip-tone' data-tonechip style={{ bottom: -14, right: 190 }}>
            tone: upbeat
          </span>
        </div>

        <div className='gts-site-card gts-site-toast' data-block data-toast>
          <span className='gts-tick'>✓</span>
          <Sw en='Payment received' es='Pago recibido' resize='w' />
          <Marker style={{ top: -12, right: -10 }} />
        </div>

        <div className='gts-site-card gts-site-form' data-block data-form>
          <label>
            <Sw en='Email address' es='Correo electrónico' resize='w' />
          </label>
          <div className='gts-fbox'>you@work.com</div>
          <Marker style={{ top: -12, right: -10 }} />
        </div>
      </div>

      <div className='gts-site-foot'>
        <span>
          © example.com — <Sw en='All rights reserved' es='Todos los derechos reservados' />
        </span>
        <span>
          <Sw en='Privacy' es='Privacidad' /> · <Sw en='Terms' es='Términos' /> ·{' '}
          <Sw en='Contact' es='Contacto' />
        </span>
        <span>
          <Sw en='en-us' es='es-419' />
        </span>
      </div>
    </div>
  );
}
