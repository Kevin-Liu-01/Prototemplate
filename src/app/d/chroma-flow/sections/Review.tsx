import EditorWorkspace from '@/components/shared/EditorWorkspace';

/** The Review station: source beside translation, state per entry AND per locale. */
export default function Review() {
  return (
    <EditorWorkspace
      className='tc-review tc-sec'
      id='review'
      heading='Agents write. You approve.'
      subheading='Source and every target locale, side by side, with review state per entry and per locale.'
      notes={[
        'Search by file, component, key, source or translated text (⌘K)',
        'Labels, notes and threaded comments, scoped per locale',
        'See the diff when a translation is regenerated',
      ]}
    />
  );
}
