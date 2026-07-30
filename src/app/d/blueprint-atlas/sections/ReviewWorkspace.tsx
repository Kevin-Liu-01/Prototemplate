import EditorWorkspace, { type EditorWorkspaceRow } from '@/components/shared/EditorWorkspace';

/**
 * Act IV — the review workspace.
 *
 * Heading, one supporting line, then the workspace. The panel is the artifact
 * and it is filled like one: every string the story just translated appears
 * here as a real row — the same ten strings, same es-419 build — with one
 * revision, two approvals and a status strip, so the plate reads as a working
 * tool rather than a specimen.
 */

const ROWS: EditorWorkspaceRow[] = [
  { key: 'hello', source: 'Hello, world!', translation: '¡Hola, mundo!', lang: 'es' },
  {
    key: 'date',
    source: 'July 28, 2026 · en-us',
    translation: '28 de julio de 2026 · es-419',
    lang: 'es',
  },
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
  { key: 'home', source: 'Home', translation: 'Inicio', lang: 'es' },
  { key: 'pricing', source: 'Pricing', translation: 'Precios', lang: 'es' },
  { key: 'docs', source: 'Docs', translation: 'Documentación', lang: 'es' },
  {
    key: 'email',
    source: 'Email address',
    translation: 'Correo electrónico',
    state: 'approved',
    lang: 'es',
  },
];

export default function ReviewWorkspace() {
  return (
    <EditorWorkspace
      className='ba-editor'
      id='context-platform'
      heading='Agents write translations. You review, edit, and approve in a focused workspace.'
      subheading='Edit in context — before or after anything goes live.'
      /* §2: locale codes lowercase, no uppercase stamps — the skin also drops
         the shared component's uppercase transform (styles.css) */
      sourceLabel='source — en'
      targetLabel='translation — es'
      meta='workspace · es-419'
      rows={ROWS}
      footer={['10 strings', '1 revised', '2 approved', 'webhook · legal counsel', 'es-419']}
    />
  );
}
