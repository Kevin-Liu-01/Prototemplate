'use client';

/**
 * Five-star control used in the viewer dock and the scoreboard.
 * Clicking the current value clears the rating back to zero.
 */
export default function RatingStars({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className={`pr-stars pr-stars-${size}`} role='group' aria-label='Rating'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          className={star <= value ? 'is-on' : ''}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          aria-pressed={star <= value}
          onClick={() => onChange(star === value ? 0 : star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
