import EditorWorkspace from '@/components/shared/EditorWorkspace';

import FlapPhrase from '../components/FlapPhrase';

/** Act IV — the translation editor. */
export default function Review() {
  return (
    <EditorWorkspace
      className='ft-review'
      id='ft-review'
      heading={
        <>
          Agents write translations. <FlapPhrase text='YOU APPROVE' />
        </>
      }
      subheading='A focused workspace where every string is reviewed, edited, and cleared before it boards.'
      meta='workspace · example-app · es-419'
      sourceLabel='Source — EN'
      targetLabel='Translation — ES'
    />
  );
}
