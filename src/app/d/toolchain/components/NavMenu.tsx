'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, type ComponentType } from 'react';

type IconProps = { className?: string; color?: string; size?: number; strokeWidth?: number; 'aria-hidden'?: boolean };

export type MenuItem = {
  label: string;
  desc: string;
  href: string;
  icon?: ComponentType<IconProps>;
  /** Image-file marks (brand glyphs that aren't currentColor components). */
  img?: string;
  /** Dark mode inverts drawn-dark glyph files, same trick as the footer. */
  invertsInDark?: boolean;
  external?: boolean;
};

export type MenuColumn = { title: string; items: readonly MenuItem[] };

function MenuMark({ item }: { item: MenuItem }) {
  if (item.img) {
    return (
      <Image
        alt=''
        aria-hidden
        className={item.invertsInDark ? 'tc-menu-glyph is-inverting' : 'tc-menu-glyph'}
        height={15}
        loading='eager'
        src={item.img}
        unoptimized
        width={15}
      />
    );
  }
  const Icon = item.icon;
  return Icon ? <Icon aria-hidden className='tc-menu-glyph' color='currentColor' size={15} strokeWidth={1.75} /> : null;
}

/** A disclosure: the trigger opens a panel of plain links on hover or on
    press, reports its state through `aria-expanded`, and closes on Escape
    (returning focus to the trigger) or when focus leaves the panel. */
export default function NavMenu({ label, columns, wide }: { label: string; columns: readonly MenuColumn[]; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div
      className='tc-nav-drop'
      data-open={open ? '' : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node && event.currentTarget.contains(next))) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return;
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }}
    >
      <button
        aria-expanded={open}
        className='tc-nav-drop-trigger'
        ref={trigger}
        type='button'
        onClick={() => setOpen((was) => !was)}
      >
        {label}
        <ChevronDown aria-hidden size={13} strokeWidth={2} />
      </button>
      <div className={wide ? 'tc-nav-panel is-wide' : 'tc-nav-panel'}>
        {columns.map((column) => (
          <div className='tc-nav-col' key={column.title}>
            <h5>{column.title}</h5>
            {column.items.map((item) => (
              <a
                href={item.href}
                key={item.label}
                rel={item.external ? 'noreferrer' : undefined}
                target={item.external ? '_blank' : undefined}
              >
                <span className='tc-menu-plate'>
                  <MenuMark item={item} />
                </span>
                <span className='tc-menu-text'>
                  <b>{item.label}</b>
                  <small>{item.desc}</small>
                </span>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
