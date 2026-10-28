import type { CSSProperties } from 'react';

type MarkProps = { src: string };

/**
 * A mark drawn by mask: the plate's ink through the mark file, contained in
 * the plate's padding, so every mark takes the same ink in both themes and
 * the same room on every plate.
 */
export default function Mark({ src }: MarkProps) {
  const style: CSSProperties = { '--vt-src': `url("${src.replace(/["\\\n]/g, '')}")` };
  return <span className='vt-mark' style={style} aria-hidden='true' />;
}
