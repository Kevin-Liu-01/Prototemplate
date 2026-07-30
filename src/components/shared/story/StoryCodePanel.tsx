import type { ReactNode } from 'react';

export type StorySliderMode = 'slide' | 'popup';

export type StoryCodePanelProps = {
  /** Matches the `[data-xray]` hook the story timeline drives. */
  id: string;
  file: string;
  note: ReactNode;
  mode: StorySliderMode;
  /**
   * A generated artifact shown under the code — the output the snippet
   * produces (locale JSON rows, measured widths). Keeps the reveal at the
   * §1 information floor: the panel shows the code AND what it made.
   */
  artifact?: ReactNode;
  children: ReactNode;
};

/**
 * The code reveal behind a zoomed component, in one of two structures.
 *
 * `slide` is the full-bleed wipe: the code surface is clipped to the left of a
 * machined divider and the live component stays visible to its right, with
 * `--gts-split` driving the clip, the edge light and the handle as one object.
 *
 * `popup` is an overlay panel anchored beside the zoomed component: a floating
 * card with a metallic edge and a drop shadow, the component still visible
 * behind it.
 */
export default function StoryCodePanel({
  id,
  file,
  note,
  mode,
  artifact,
  children,
}: StoryCodePanelProps) {
  if (mode === 'popup') {
    return (
      <div className='gts-pop-wrap' data-xray={id}>
        <div className='gts-pop'>
          <div className='gts-pop-file'>{file}</div>
          <pre>{children}</pre>
          {artifact && <div className='gts-xray-gen'>{artifact}</div>}
          <p className='gts-pop-note'>{note}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='gts-xray-wrap' data-xray={id}>
      <div className='gts-xray'>
        <div className='gts-xray-surface' />
        <div className='gts-xray-inner'>
          <div className='gts-xray-file'>{file}</div>
          <pre>{children}</pre>
          {artifact && <div className='gts-xray-gen'>{artifact}</div>}
          <p className='gts-xray-note'>{note}</p>
        </div>
      </div>
      <div className='gts-split'>
        <span className='gts-split-ca gts-ca-l' />
        <span className='gts-split-ca gts-ca-r' />
        <span className='gts-split-line' />
        <span className='gts-handle'>
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
