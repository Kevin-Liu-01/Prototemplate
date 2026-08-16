import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type CtaVariant = 'solid' | 'outline' | 'on-ink-solid' | 'on-ink-outline';

const VARIANT_CLASS: Record<CtaVariant, string> = {
  solid: 'tc-btn-solid',
  outline: 'tc-btn-line',
  'on-ink-solid': 'tc-btn-onink',
  'on-ink-outline': 'tc-btn-onink-line',
};

type CtaProps = {
  variant: CtaVariant;
  ring?: boolean;
  size?: 'md' | 'lg';
  href?: string;
  external?: boolean;
  /** Analytics slug in gt-cloud; inert in the prototype. */
  tracked?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  onClick?: ComponentPropsWithoutRef<'button'>['onClick'];
  children: ReactNode;
};

/**
 * THE landing CTA, carried from gt-cloud: the engine's tc-btn face with
 * a variant skin and the optional rainbow ring. Links flatten to plain
 * anchors for the prototype; buttons stay real buttons.
 */
export default function Cta({
  variant,
  ring = false,
  size = 'md',
  href,
  external = false,
  type = 'button',
  disabled = false,
  className,
  onClick,
  children,
}: CtaProps) {
  const face = [
    'tc-btn',
    VARIANT_CLASS[variant],
    size === 'lg' ? 'tc-btn-lg' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const control =
    href === undefined ? (
      <button
        className={face}
        type={type}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    ) : (
      <a
        className={face}
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {children}
      </a>
    );

  return ring ? <span className='tc-cta-ring'>{control}</span> : control;
}
