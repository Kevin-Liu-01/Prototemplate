'use client';

import { HelpCircle } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';

/**
 * Local copy of the SSOT PricingHelpTooltip pattern: a circled-question-mark
 * trigger (or any custom trigger) that raises a small centered bubble above
 * itself. The bubble is fixed-positioned from the trigger's rect so it never
 * clips inside the rates table's overflow-x scroll wrapper — the job Radix's
 * portal does on the production page. Hover, focus, and tap all open it.
 */
export default function HelpTip({
  tip,
  label = 'More information',
  trigger,
}: {
  tip: ReactNode;
  label?: string;
  trigger?: ReactNode;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const open = () => {
    const el = wrap.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ left: rect.left + rect.width / 2, top: rect.top });
  };
  const close = () => setPos(null);

  return (
    <span
      className='sgu-tip'
      ref={wrap}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close();
      }}
    >
      {trigger ?? (
        <button type='button' className='sgu-tip-btn' aria-label={label}>
          <HelpCircle aria-hidden strokeWidth={1.8} />
        </button>
      )}
      {pos ? (
        <span
          className='sgu-tip-bubble'
          role='tooltip'
          style={{ left: pos.left, top: pos.top }}
        >
          {tip}
        </span>
      ) : null}
    </span>
  );
}
