import DiagramFrame, { type DiagramProps } from './DiagramFrame';

/**
 * Context — the real glossary and directives of a context group, as the table
 * the dashboard shows (rows verbatim from the modules plan). The doubled
 * thread runs the left gutter: the group binding every row it governs.
 */
export default function GlossaryDiagram(props: DiagramProps) {
  return (
    <DiagramFrame {...props}>
      {/* the two threads bind the group */}
      <path className='gtd-thread' d='M2.6 6 V70' />
      <path className='gtd-thread' d='M5.8 6 V70' />

      {/* glossary rows: term → rule */}
      <text className='gtd-code gtd-w500' x='12' y='14'>
        Locadex
      </text>
      <text className='gtd-code' x='94' y='14'>
        do not translate
      </text>
      <text className='gtd-code gtd-w500' x='12' y='26.5'>
        Context Group
      </text>
      <text className='gtd-code' x='94' y='26.5'>
        do not translate
      </text>
      <text className='gtd-code gtd-w500' x='12' y='39'>
        Workflow
      </text>
      <text className='gtd-code' x='94' y='39'>
        ワークフロー (ja)
      </text>

      {/* group divider — structure, hairline */}
      <path className='gtd-rule' d='M12 46 H194' />

      {/* directives */}
      <text className='gtd-mut' x='12' y='57.5'>
        de
      </text>
      <text className='gtd-code' x='94' y='57.5'>
        Use formal “Sie”
      </text>
      <text className='gtd-code' x='12' y='70'>
        Active voice, avoid jargon
      </text>
    </DiagramFrame>
  );
}
