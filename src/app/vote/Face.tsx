import type { DecisionKind } from '@/lib/vote/types';

import Mark from './Mark';

/** What an option shows: a file for the mark and image kinds, its words for the text kind. */
export type FaceOption = { src?: string; name?: string; text?: string };

/** The plate's classes for a decision's kind, then any extra ones. */
export function plateClass(kind: DecisionKind, ...extra: (string | false | null | undefined)[]): string {
  return ['vt-plate', `is-${kind}`, ...extra].filter(Boolean).join(' ');
}

/**
 * The inside of a plate. A mark is ink through its file (Mark); an image is
 * the picture as it is, contained; a text option is its name and its text,
 * set as type, because the words are the option.
 */
export default function Face({ kind, option }: { kind: DecisionKind; option: FaceOption }) {
  if (kind === 'text') {
    return (
      <span className='vt-words'>
        <span className='vt-words-name'>{option.name}</span>
        {option.text ? <span className='vt-words-text'>{option.text}</span> : null}
      </span>
    );
  }
  if (!option.src) return null;
  if (kind === 'image') return <img className='vt-img' src={option.src} alt='' decoding='async' draggable={false} />;
  return <Mark src={option.src} />;
}
