import type { ReactNode } from 'react';

/** The gt-cloud analytics link, reduced to its anchor for the prototype. */
export default function TrackedLink({
  href,
  className,
  children,
}: {
  href: string;
  location?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
