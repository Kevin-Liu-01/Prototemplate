import type { RayCard } from '../content';

export type RayCardViewProps = {
  card: RayCard;
  /** Stamped on emitted cards so the language that came out is named. */
  locale?: string;
  rtl?: boolean;
};

/**
 * One flowing UI artifact. Deliberately solid — opaque face, hard border,
 * 13px labels — because the hero's job is for a viewer to recognise a real
 * button, toast, field, or testimonial at a glance.
 */
export default function RayCardView({ card, locale, rtl }: RayCardViewProps) {
  const badge = locale ? <span className='cm-locale'>{locale}</span> : null;

  if (card.kind === 'button') {
    return (
      <div className='cm-card cm-card--button' dir={rtl ? 'rtl' : undefined}>
        {card.label}
        {badge}
      </div>
    );
  }

  if (card.kind === 'toast') {
    return (
      <div className='cm-card cm-card--toast' dir={rtl ? 'rtl' : undefined}>
        {card.label}
        {badge}
      </div>
    );
  }

  if (card.kind === 'field') {
    return (
      <div className='cm-card cm-card--field' dir={rtl ? 'rtl' : undefined}>
        <span className='cm-fl'>{card.label}</span>
        <span className='cm-fv'>{card.value}</span>
        {badge}
      </div>
    );
  }

  if (card.kind === 'chip') {
    return (
      <div className='cm-card' dir={rtl ? 'rtl' : undefined}>
        {card.lead ? <span className='cm-lead'>{card.lead}</span> : null}
        <span>{card.label}</span>
        {badge}
      </div>
    );
  }

  return (
    <div className='cm-card cm-card--theo'>
      <div className='cm-theo-head'>
        <span className='cm-theo-av'>T</span>
        <span>
          <span className='cm-theo-name'>{card.name}</span>
          <span className='cm-theo-role'>{card.role}</span>
        </span>
      </div>
      {card.quote}
      {badge}
    </div>
  );
}
