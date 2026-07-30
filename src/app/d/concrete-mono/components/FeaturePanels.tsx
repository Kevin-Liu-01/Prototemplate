/**
 * The eight feature-grid artifacts, drawn at concrete weight.
 *
 * Every panel is the real thing at real volume (DESIGN_STANDARD §1): real
 * code, real glossary rows, real translations lifted from the hero wall's
 * vetted set, real paths, real latencies. No grey slabs, no squiggle text.
 * All in-panel type is mono at the 11px floor; structural rules are
 * hairlines, meaning-bearing marks are regular weight or white.
 */

/* ---------------------------------------------------------------- CODE */
export function CodePanel() {
  return (
    <div className='cmf'>
      <div className='cmf-head'>
        <span>app/page.tsx</span>
        <i>gt-next</i>
      </div>
      <pre className='cmf-code'>
        <span className='ln'> 1</span>
        <span className='dim'>import</span> {'{'} <b>T</b> {'}'} <span className='dim'>from</span>{' '}
        <span className='str'>'gt-next'</span>;{'\n'}
        <span className='ln'> 2</span>
        {'\n'}
        <span className='ln'> 3</span>
        <span className='dim'>export default function</span> <b>Page</b>() {'{'}
        {'\n'}
        <span className='ln'> 4</span>
        {'  '}
        <span className='dim'>return</span> ({'\n'}
        <span className='ln'> 5</span>
        {'    '}
        <b>{'<T>'}</b>
        {'\n'}
        <span className='ln'> 6</span>
        {'      '}
        <span className='dim'>{'<h1>'}</span>Hello, world!<span className='dim'>{'</h1>'}</span>
        {'\n'}
        <span className='ln'> 7</span>
        {'    '}
        <b>{'</T>'}</b>
        {'\n'}
        <span className='ln'> 8</span>
        {'  '});{'\n'}
        <span className='ln'> 9</span>
        {'}'}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------- CONTEXT */
const GLOSSARY: [string, string, string][] = [
  ['Locadex', 'Locadex', 'never translate'],
  ['Get started', 'Comenzar ahora', 'cta'],
  ['seat', 'puesto', 'billing'],
  ['deploy', 'desplegar', ''],
  ['dashboard', 'panel', ''],
  ['trial', 'prueba', ''],
];

export function ContextPanel() {
  return (
    <div className='cmf'>
      <div className='cmf-head'>
        <span>glossary · es-419</span>
        <i>6 terms</i>
      </div>
      <div className='cmf-rows'>
        {GLOSSARY.map(([en, es, note]) => (
          <div className='cmf-row' key={en}>
            <span className='cmf-en'>{en}</span>
            <span className='cmf-es' lang='es'>
              {es}
            </span>
            {note ? <i>{note}</i> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- TRANSLATION */
/** Locale rows reuse the hero wall's vetted "Payment received" set. */
const FAN: [string, string, string][] = [
  ['es', 'es', 'Pago recibido'],
  ['fr', 'fr', 'Paiement reçu'],
  ['ko', 'ko', '결제가 완료되었습니다'],
  ['it', 'it', 'Pagamento ricevuto'],
  ['sv', 'sv', 'Betalning mottagen'],
];

export function TranslationPanel() {
  return (
    <div className='cmf'>
      <div className='cmf-head'>
        <span>source · en</span>
        <i>5 locales</i>
      </div>
      <div className='cmf-src'>&ldquo;Payment received&rdquo;</div>
      <div className='cmf-fan'>
        {FAN.map(([code, lang, value]) => (
          <div className='cmf-fan-row' key={code}>
            <span className='cmf-loc'>{code}</span>
            <span className='cmf-val' lang={lang}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- ROUTING */
const ROUTES: [string, string][] = [
  ['/en/pricing', 'en-US'],
  ['/es/pricing', 'es-419'],
  ['/fr/pricing', 'fr'],
  ['/ja/pricing', 'ja'],
];

export function RoutingPanel() {
  return (
    <div className='cmf'>
      <div className='cmf-head'>
        <span>middleware</span>
        <i>locale routing</i>
      </div>
      <div className='cmf-req'>
        <span className='dim'>GET</span> /pricing
        {'\n'}
        <span className='dim'>accept-language:</span> es-MX;q=0.9
        {'\n'}
        <b>307 → /es/pricing</b>
      </div>
      <div className='cmf-rows'>
        {ROUTES.map(([path, loc]) => (
          <div className='cmf-row' key={path}>
            <span className='cmf-en'>{path}</span>
            <span className='cmf-loc'>{loc}</span>
            <i>200</i>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ DELIVERY */
const EDGE: [string, number][] = [
  ['sfo', 9],
  ['iad', 11],
  ['fra', 12],
  ['gru', 19],
  ['sin', 24],
  ['syd', 28],
];
const EDGE_MAX = 28;

export function DeliveryPanel() {
  return (
    <div className='cmf'>
      <div className='cmf-head'>
        <span>translation cdn</span>
        <i>p50 · ms</i>
      </div>
      <div className='cmf-bars'>
        {EDGE.map(([pop, ms]) => (
          <div className='cmf-bar-row' key={pop}>
            <span className='cmf-loc'>{pop}</span>
            <span className='cmf-track'>
              <i style={{ width: `${(ms / EDGE_MAX) * 100}%` }} />
            </span>
            <b>{ms}</b>
          </div>
        ))}
      </div>
      <div className='cmf-foot'>over-the-air · no redeploy</div>
    </div>
  );
}

/* ------------------------------------------------------------ PREVIEWS */
export function PreviewsPanel() {
  return (
    <div className='cmf'>
      <div className='cmf-head'>
        <span>preview</span>
        <i>en-US → es-419</i>
      </div>
      <div className='cmf-panes'>
        <div className='cmf-pane'>
          <span className='cmf-pane-loc'>en-US</span>
          <b>Translation that just works.</b>
          <span className='cmf-btn'>Get started</span>
        </div>
        <div className='cmf-pane'>
          <span className='cmf-pane-loc'>es-419 · draft</span>
          <b lang='es'>Traducciones que simplemente funcionan.</b>
          <span className='cmf-btn' lang='es'>
            Comenzar ahora
          </span>
        </div>
      </div>
      <div className='cmf-foot'>button +27% wider · layout holds</div>
    </div>
  );
}

/* ----------------------------------------------------------- RUNTIME */
const CHAT: [string, string, string, string, string][] = [
  ['es', '¿Dónde está mi pedido?', 'Where is my order?', 'es→en', '128ms'],
  ['ja', '返金はできますか？', 'Can I get a refund?', 'ja→en', '141ms'],
  ['de', 'Wo ist meine Bestellung?', 'Where is my order?', 'de→en', '117ms'],
];

export function RuntimePanel() {
  return (
    <div className='cmf'>
      <div className='cmf-head'>
        <span>POST /v1/translate</span>
        <i>runtime</i>
      </div>
      <div className='cmf-chat'>
        {CHAT.map(([lang, src, out, dir, ms]) => (
          <div className='cmf-msg' key={lang}>
            <span className='cmf-msg-src' lang={lang}>
              “{src}”
            </span>
            <span className='cmf-msg-meta'>
              {dir} {ms}
            </span>
            <b>“{out}”</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- CONFIG */
export function ConfigPanel() {
  return (
    <div className='cmf'>
      <div className='cmf-head'>
        <span>gt.config.json</span>
        <i>project</i>
      </div>
      <pre className='cmf-code'>
        {'{'}
        {'\n'}
        {'  '}
        <span className='key'>"defaultLocale"</span>: <span className='str'>"en-US"</span>,{'\n'}
        {'  '}
        <span className='key'>"locales"</span>:{'\n'}
        {'    '}[<span className='str'>"es-419"</span>, <span className='str'>"fr"</span>,{' '}
        <span className='str'>"ja"</span>, <span className='str'>"de"</span>],{'\n'}
        {'  '}
        <span className='key'>"framework"</span>: <span className='str'>"next-app"</span>,{'\n'}
        {'  '}
        <span className='key'>"files"</span>: {'{'}
        {'\n'}
        {'    '}
        <span className='key'>"gt"</span>: {'{'}
        {'\n'}
        {'      '}
        <span className='key'>"output"</span>:{'\n'}
        {'        '}
        <span className='str'>"public/_gt/[locale].json"</span>
        {'\n'}
        {'    '}
        {'}'}
        {'\n'}
        {'  '}
        {'}'}
        {'\n'}
        {'}'}
      </pre>
    </div>
  );
}
