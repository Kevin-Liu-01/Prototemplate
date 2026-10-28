import type { DecisionKind, DecisionStatus } from '@/lib/vote/types';

/** The words the admin pages show for a decision's status and kind. */
export const STATUS_LABEL: Readonly<Record<DecisionStatus, string>> = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
};

export const KIND_LABEL: Readonly<Record<DecisionKind, string>> = {
  mark: 'Mark',
  image: 'Image',
  text: 'Text',
};
