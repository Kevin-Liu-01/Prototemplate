import EditorWorkspace, { type EditorWorkspaceRow } from '@/components/shared/EditorWorkspace';

/**
 * The lines under review. Same shape as the shared default set, three entries
 * longer, so the workspace fills its own frame instead of trailing off into
 * empty plate under the last row. (The default array cannot be spread here —
 * it lives in a client module, so a server component only receives a reference
 * to it, not the values.)
 */
const ROWS: EditorWorkspaceRow[] = [
  { key: 'hello', source: 'Hello, world!', translation: '¡Hola, mundo!', lang: 'es' },
  {
    key: 'tagline',
    source: 'Translation that just works.',
    translation: 'Traducciones que simplemente funcionan.',
    previous: 'Traducción que funciona.',
    state: 'revised',
    lang: 'es',
  },
  { key: 'payment', source: 'Payment received', translation: 'Pago recibido', lang: 'es' },
  {
    key: 'terms',
    source: 'By continuing you agree to our Terms of Service.',
    translation: 'Al continuar, aceptas nuestros Términos de Servicio.',
    state: 'approved',
    lang: 'es',
  },
  { key: 'cta', source: 'Get started', translation: 'Comenzar ahora', lang: 'es' },
  { key: 'email', source: 'Email address', translation: 'Correo electrónico', lang: 'es' },
  {
    key: 'nav',
    source: 'Docs · Pricing · Contact',
    translation: 'Documentación · Precios · Contacto',
    previous: 'Documentos · Precios · Contacto',
    state: 'revised',
    lang: 'es',
  },
  {
    key: 'uptime',
    source: '99.99% uptime across 118 locales',
    translation: '99,99 % de disponibilidad en 118 idiomas',
    state: 'approved',
    lang: 'es',
  },
];

/** Act IV — the review workspace. */
export default function Review() {
  return (
    <EditorWorkspace
      className='fm-review-sec'
      id='review'
      heading='Agents write translations. You review, edit, and approve in a focused workspace.'
      subheading='Side-by-side source and translation. Diffs when translations are regenerated. Edit before or after they go live.'
      rows={ROWS}
      meta='editor · example-app · es-ES'
      sourceLabel='Source — en'
      targetLabel='Translation — es'
    />
  );
}
