import type { ScatterCard } from '../content';

/**
 * One product surface adrift in the field. Every variant is built from
 * hairlines and squared corners only — at this opacity a filled panel would
 * read as a smudge rather than as a piece of a real interface.
 */
export default function ScatterCardView({ card, rtl }: { card: ScatterCard; rtl?: boolean }) {
  switch (card.kind) {
    case 'nav':
      return (
        <div className='ap-c ap-c-nav' dir={rtl ? 'rtl' : undefined}>
          {card.items.map((item, i) => (
            <span key={item}>
              {i > 0 && <i className='ap-c-sep'>/</i>}
              {item}
            </span>
          ))}
        </div>
      );

    case 'line':
      return (
        <div className='ap-c ap-c-line' dir={rtl ? 'rtl' : undefined}>
          {card.text}
        </div>
      );

    case 'field':
      return (
        <div className='ap-c ap-c-field'>
          <span className='ap-c-lab'>{card.label}</span>
          <span className='ap-c-input'>{card.value}</span>
        </div>
      );

    case 'button':
      return (
        <div className='ap-c ap-c-btn'>
          {card.label}
          <i className='ap-c-arrow'>→</i>
        </div>
      );

    case 'toast':
      return (
        <div className='ap-c ap-c-toast'>
          <i className='ap-c-tick' />
          {card.label}
        </div>
      );

    case 'plan':
      return (
        <div className='ap-c ap-c-plan'>
          <span className='ap-c-plan-n'>{card.name}</span>
          <span className='ap-c-plan-p'>{card.price}</span>
        </div>
      );

    case 'quote':
      return (
        <div className='ap-c ap-c-quote'>
          <div className='ap-c-q-head'>
            <span className='ap-c-ava'>T</span>
            <span>
              <b>{card.name}</b>
              <span className='ap-c-role'>{card.role}</span>
            </span>
          </div>
          <p>{card.quote}</p>
        </div>
      );
  }
}
