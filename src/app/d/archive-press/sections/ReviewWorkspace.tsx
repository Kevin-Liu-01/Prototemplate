import EditorWorkspace from '@/components/shared/EditorWorkspace';

/**
 * Act IV — the review workspace, run full width under its heading.
 *
 * Heading and one supporting line, then the thing itself. The shared `notes`
 * slot is deliberately unused: three dashed lines restating "side by side",
 * "diffs" and "edit" would be a third stacked text block describing the
 * workspace that is already open directly beneath it.
 */
export default function ReviewWorkspace() {
  return (
    <EditorWorkspace
      className='ap-editor'
      id='review'
      layout='stacked'
      heading='Review before it ships'
      subheading='Agents write translations. You review, edit, and approve in a focused workspace.'
    />
  );
}
