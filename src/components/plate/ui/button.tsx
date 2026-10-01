import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { Slot } from 'radix-ui';

import { cn } from '@/components/plate/lib/utils';

const buttonVariants = cva(
  "group/button focus-visible:border-ring aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground hover:!bg-primary/80 hover:!border-primary/80',
        rainbow: 'border-primary bg-primary text-primary-foreground relative',
        outline:
          'border-border bg-background hover:!bg-accent hover:!text-accent-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:!bg-accent dark:hover:!text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground border-transparent',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 border-transparent',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 dark:bg-destructive/20 dark:hover:bg-destructive/30 border-transparent',
        link: 'text-primary border-transparent underline-offset-4 hover:underline',
        bare: 'h-auto shrink justify-start rounded-none border-0 bg-transparent p-0 text-[length:inherit] leading-[inherit] font-normal focus-visible:border-0 active:translate-y-0',
      },
      size: {
        default:
          'h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-md px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1 rounded-md px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
        lg: 'h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        icon: 'size-9',
        'icon-xs':
          "size-6 rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-md in-data-[slot=button-group]:rounded-md',
        'icon-lg': 'size-10',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

/**
 * Button component with multiple style variants.
 *
 * @param variant - Visual style of the button:
 *   - `default`, Primary filled button.
 *   - `rainbow`, Primary filled button wrapped in a blurred rainbow gradient glow. Glow hides when disabled and intensifies on hover.
 *   - `outline`, Bordered button with transparent background.
 *   - `secondary`, Muted filled button.
 *   - `ghost`, No border or background until hovered.
 *   - `destructive`, Red-tinted for dangerous actions.
 *   - `link`, Renders as an underlined text link.
 * @param size - Button size (`xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`).
 * @param asChild - When true, renders as a `Slot` so the child element receives button styles.
 * @param loading - When true, disables the button and replaces its content with a centered spinner while preserving the button's natural width.
 */
function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  disabled,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  // `loading` is ignored when `asChild` is true: Slot expects a single child
  // and the wrapping required to swap content for a spinner would break it.
  // In practice, action buttons with `loading` don't use `asChild` (which is
  // reserved for link-styled buttons).
  const showLoading = loading && !asChild;

  // `contents` removes the span's own box so children lay out as direct flex
  // items of the button (inheriting the button's gap per size variant).
  // `invisible` inherits `visibility: hidden` down to all descendants,
  // including text nodes, while preserving their layout space, so the
  // button keeps its natural width when the spinner replaces the content.
  const content = showLoading ? (
    <>
      <span className='invisible contents'>{children}</span>
      <Loader2
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin'
        aria-hidden='true'
      />
    </>
  ) : (
    children
  );

  const button = (
    <Comp
      data-slot='button'
      data-variant={variant}
      data-size={size}
      data-loading={showLoading ? '' : undefined}
      className={cn(
        buttonVariants({ variant, size, className }),
        showLoading && 'relative'
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </Comp>
  );

  if (variant === 'rainbow') {
    return (
      <div
        className={cn(
          'group relative inline-flex',
          className?.includes('w-full') && 'w-full'
        )}
      >
        {/* Rainbow glow effect, intentionally uses raw color classes for the
            multi-color gradient. Exempted from the color lint rule via eslint config. */}
        {!disabled && !loading && (
          <div className='absolute -inset-0.5 rounded-md bg-gradient-to-r from-pink-600 via-blue-600 via-purple-600 to-green-600 opacity-60 blur-sm transition-opacity duration-300 group-hover:opacity-90' />
        )}
        {button}
      </div>
    );
  }

  return button;
}

export { Button, buttonVariants };
export type { ButtonProps };
