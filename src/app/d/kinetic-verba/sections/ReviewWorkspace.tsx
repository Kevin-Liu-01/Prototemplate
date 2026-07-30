import EditorWorkspace from '@/components/shared/EditorWorkspace';

import KineticText from '../components/KineticText';

/**
 * Act IV — the review workspace, stacked so the heading runs the full measure
 * above a full-width editor.
 */
export default function ReviewWorkspace() {
  return (
    <EditorWorkspace
      className='kv-review-sec'
      id='review'
      heading={<KineticText className='kv-kin' text='thoughts?' intro='scroll' baseWeight={700} flex={0.8} />}
      subheading='Agents write the translations. You review, edit, and approve them side by side — with diffs when a translation is regenerated, before or after it goes live.'
      layout='stacked'
      meta='kettle.co · de-DE'
      sourceLabel='Source — en'
      targetLabel='Translation — de'
      rows={[
        {
          key: 'hero-h1',
          source: 'Fresh roasts, delivered weekly',
          translation: 'Frisch geröstet, wöchentlich geliefert',
          previous: 'Frische Röstungen, wöchentliche Lieferung',
          state: 'revised',
          lang: 'de',
        },
        { key: 'hero-cta', source: 'Get started', translation: 'Jetzt loslegen', lang: 'de' },
        {
          key: 'shipping',
          source: 'Free shipping over $30',
          translation: 'Kostenloser Versand ab 30 $',
          lang: 'de',
        },
        {
          key: 'legal',
          source: 'Subscriptions renew automatically. Cancel anytime.',
          translation: 'Abonnements verlängern sich automatisch. Jederzeit kündbar.',
          state: 'approved',
          lang: 'de',
        },
        {
          key: 'feature',
          source: 'Meet your next favorite cup',
          translation: 'Entdecken Sie Ihre neue Lieblingstasse',
          lang: 'de',
        },
      ]}
    />
  );
}
