import EditorWorkspace from '@/components/shared/EditorWorkspace';

/** Act IV — the review workspace. */
export default function Review() {
  return (
    <EditorWorkspace
      className='tb-review'
      id='tb-review'
      layout='stacked'
      heading='Agents write. You approve.'
      subheading='Source beside translation, a real diff whenever a translation is regenerated, and edits that land before or after it goes live.'
      meta='acme.com · es-419'
      sourceLabel='Source — en'
      targetLabel='Translation — es'
    />
  );
}
