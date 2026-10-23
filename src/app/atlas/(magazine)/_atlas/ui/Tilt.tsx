'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';

/* A stage for a standing book: the pointer turns the book a few degrees
   toward itself through --ry and --rx, and leaving lets it settle back. */
export default function Tilt({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={box}
      className={['gtp-tilt', className].filter(Boolean).join(' ')}
      style={style}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.setProperty('--ry', `${(24 - x * 28).toFixed(2)}deg`);
        e.currentTarget.style.setProperty('--rx', `${(-6 - y * 10).toFixed(2)}deg`);
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.removeProperty('--ry');
        e.currentTarget.style.removeProperty('--rx');
      }}
    >
      {children}
    </div>
  );
}
