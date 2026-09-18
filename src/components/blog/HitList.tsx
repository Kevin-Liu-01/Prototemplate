import { X } from 'lucide-react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { Children, isValidElement } from 'react';

/** Marker for MDX authors. HitList reads its text; it never renders. */
export function HitItem(_props: { children?: ReactNode }) {
  return null;
}

type HitListProps = {
  label?: string;
  children?: ReactNode;
};

/**
 * The post's anti-pattern list: two columns filled column by column, each
 * row struck with a solid red mark. Items arrive as <HitItem> children.
 */
export default function HitList({ label, children }: HitListProps) {
  const items = Children.toArray(children).filter(
    (child): child is ReactElement<{ children?: ReactNode }> => isValidElement(child) && child.type === HitItem
  );
  if (items.length === 0) return null;
  const rows = Math.ceil(items.length / 2);
  return (
    <ul aria-label={label} className='blog-hit-list' style={{ '--rows': rows } as CSSProperties} data-testid='hit-list'>
      {items.map((item, i) => (
        <li key={i}>
          <span aria-hidden='true' className='blog-hit-mark'>
            <X size={12} strokeWidth={3} />
          </span>
          <span>{item.props.children}</span>
        </li>
      ))}
    </ul>
  );
}
