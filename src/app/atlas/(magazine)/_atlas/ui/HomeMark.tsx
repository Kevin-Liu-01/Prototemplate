'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useState } from 'react';

import { GT_HOME } from '../edition';
import PressMark from './PressMark';

/** How long the cover takes to swing open before the page leaves (rack.css, gtp-cover-open). */
const OPEN_MS = 620;

/* The nameplate's imprint, whose GT is a link to the General Translation
   home: a click swings the imprint's cover open on its spine, over to the
   left as a book's front board opens, showing the first page's lines under
   it, and then the page goes home. A click that opens a new tab, and a
   reader who asks for reduced motion, go straight there. */
export default function HomeMark({ className }: { className?: string }) {
  const router = useRouter();
  const [going, setGoing] = useState(false);
  const leave = () => (GT_HOME.startsWith('/') ? router.push(GT_HOME) : location.assign(GT_HOME));
  // the home page is fetched as the pointer reaches the GT, so it is ready when the cover has opened
  const warm = () => {
    if (GT_HOME.startsWith('/')) router.prefetch(GT_HOME);
  };
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (going) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      leave();
      return;
    }
    setGoing(true);
    setTimeout(leave, OPEN_MS);
  };
  return (
    <span className={['gtp-homemark', className].filter(Boolean).join(' ')} data-going={going || undefined}>
      <PressMark />
      <a className='gtp-homemark-gt' href={GT_HOME} aria-label='General Translation' onClick={onClick} onPointerEnter={warm} onFocus={warm} />
    </span>
  );
}
