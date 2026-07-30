import EditorWorkspace from '@/components/shared/EditorWorkspace';

/**
 * Act IV — the review workspace, machined into the foundry's plate language.
 *
 * Heading + subheader + the workspace, and nothing else: no bullet list
 * restating the subheader, and no instrument strip labelling the panel (the
 * empty `meta` collapses the shared bar — see `.bf-review .gte-bar`).
 */
export default function Review() {
  return (
    <EditorWorkspace
      className='bf-review'
      id='bf-workspace'
      heading='Agents write translations. You review, edit, and approve.'
      subheading='Source beside translation, row by row. Regenerated lines carry the previous wording struck through, and anything can be edited before or after it goes live.'
      meta=''
      sourceLabel='Source — en'
      targetLabel='Translation — es'
    />
  );
}
