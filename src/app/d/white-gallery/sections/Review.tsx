import EditorWorkspace, {
  type EditorWorkspaceRow,
} from '@/components/shared/EditorWorkspace';

/** German is this direction's working locale — the widest expansion of the set. */
const ROWS: EditorWorkspaceRow[] = [
  { key: 'hello', source: 'Hello, world!', translation: 'Hallo, Welt!', lang: 'de' },
  {
    key: 'infra',
    source:
      'General Translation builds full-stack infrastructure for localizing apps, docs, and websites.',
    translation:
      'General Translation entwickelt eine vollständige Infrastruktur für die Lokalisierung von Anwendungen, Dokumentationen und Websites.',
    previous: 'GT baut Infrastruktur für die Lokalisierung.',
    state: 'revised',
    lang: 'de',
  },
  {
    key: 'ship',
    source: 'Ship faster. Speak everyone’s language.',
    translation: 'Schneller ausliefern. Die Sprache aller sprechen.',
    lang: 'de',
  },
  {
    key: 'terms',
    source: 'By signing up you agree to our Terms of Service.',
    translation: 'Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen zu.',
    state: 'approved',
    lang: 'de',
  },
  { key: 'cta', source: 'Get started', translation: 'Jetzt loslegen', lang: 'de' },
];

/** Act IV — the human room: agents draft, a person signs the work. */
export default function Review() {
  return (
    <EditorWorkspace
      className='wg-review'
      id='review'
      heading={
        <>
          Agents write translations. <em>You review, edit, and approve.</em>
        </>
      }
      subheading='Source beside translation, a struck-through line wherever a string was regenerated, and edits that land before or after it goes live.'
      layout='stacked'
      rows={ROWS}
      sourceLabel='Source — EN'
      targetLabel='Translation — DE'
      meta='translation editor · example.com / de'
    />
  );
}
