import EditorWorkspace from '@/components/shared/EditorWorkspace';

import FlapPhrase from './FlapPhrase';

/** Act IV — source beside translation, revision state carried by type alone. */
export default function Review() {
  return (
    <EditorWorkspace
      className='tc-review tc-sec'
      id='review'
      heading={
        <>
          Edit <FlapPhrase text='in context.' />
        </>
      }
      subheading='Agents write translations. You review, edit, and approve in a focused workspace.'
      notes={[
        'Side-by-side source and translation view',
        'See diffs when translations are regenerated',
        'Edit translations before or after they go live',
      ]}
    />
  );
}
