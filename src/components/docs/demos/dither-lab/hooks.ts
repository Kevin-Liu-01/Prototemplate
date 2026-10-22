'use client';

import { useRef, useState } from 'react';

import type { PictureTone } from '@/components/plate/lib/picture-field';
import { useLayoutWork } from '@/lib/use-layout-work';

import { useReducedMotion } from '../hooks';
import { loadSource, readPictureFile, type LoadedSource, type SourceId } from './sources';

/**
 * The lab's own hooks: the size of a plate's box, a frame loop that only
 * runs while its plate is visible, and the picture source each plate
 * picks, including a file the reader opens.
 */

export type Box = {
  /** the callback ref to put on the measured element */
  ref: (el: HTMLElement | null) => void;
  el: HTMLElement | null;
  w: number;
  h: number;
};

/**
 * The CSS content size, in whole pixels, of the element the returned `ref`
 * is attached to, kept current by a ResizeObserver. The ref is a callback,
 * so an element that mounts after the hook (a lazy plate's stage) is still
 * observed.
 */
export function useBox(): Box {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutWork(
    () => {
      if (!el) return;
      const read = () => {
        const w = Math.floor(el.clientWidth);
        const h = Math.floor(el.clientHeight);
        setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
      };
      read();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(read);
      observer.observe(el);
      return () => observer.disconnect();
    },
    { dependencies: [el], revertOnUpdate: true }
  );
  return { ref: setEl, el, w: size.w, h: size.h };
}

/**
 * Calls `frame(now)` on animation frames at up to `fps` while `active` is
 * true, `el` is within 120px of the viewport and the tab is shown. It never
 * runs under reduced motion. The loop is created paused.
 */
export function useFrameLoop(el: HTMLElement | null, frame: (now: number) => void, active: boolean, fps = 30): void {
  const reduced = useReducedMotion();
  const latest = useRef(frame);
  latest.current = frame;
  const want = useRef(false);
  const sync = useRef<() => void>(() => {});

  useLayoutWork(
    () => {
      if (!el) return;
      let visible = false;
      let raf = 0;
      let last = -Infinity;
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (now - last < 1000 / fps - 1) return;
        last = now;
        latest.current(now);
      };
      const run = () => {
        const on = want.current && visible && !document.hidden;
        if (on && !raf) {
          last = -Infinity;
          raf = requestAnimationFrame(tick);
        } else if (!on && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };
      sync.current = run;
      let observer: IntersectionObserver | undefined;
      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          (entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            run();
          },
          { rootMargin: '120px' }
        );
        observer.observe(el);
      } else {
        visible = true;
      }
      document.addEventListener('visibilitychange', run);
      run();
      return () => {
        observer?.disconnect();
        document.removeEventListener('visibilitychange', run);
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        sync.current = () => {};
      };
    },
    { dependencies: [el, fps], revertOnUpdate: true }
  );

  useLayoutWork(
    () => {
      want.current = active && !reduced;
      sync.current();
    },
    { dependencies: [active, reduced] }
  );
}

export type PictureSource = {
  id: SourceId;
  choose: (id: SourceId) => void;
  /** reads a dropped or chosen file and switches to it */
  open: (file: File) => void;
  /** the decoded source, null while it loads */
  loaded: LoadedSource | null;
  fileName: string | null;
  /** the last file error, for the plate's status line */
  error: string | null;
};

/**
 * The source a plate screens. A picture decodes once per URL and is shared
 * between plates; a file is read in the browser and kept only in this
 * plate's state.
 */
export function usePictureSource(initial: SourceId): PictureSource {
  const [id, setId] = useState<SourceId>(initial);
  const [file, setFile] = useState<{ name: string; tone: PictureTone } | null>(null);
  const [loaded, setLoaded] = useState<LoadedSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const live = useRef(0);

  useLayoutWork(
    () => {
      const ticket = ++live.current;
      loadSource(id, file?.tone ?? null)
        .then((next) => {
          if (ticket === live.current) setLoaded(next);
        })
        .catch(() => {
          if (ticket === live.current) setError('The picture could not be loaded.');
        });
    },
    { dependencies: [id, file] }
  );

  const open = (picked: File) => {
    readPictureFile(picked)
      .then((tone) => {
        setError(null);
        setFile({ name: picked.name, tone });
        setId('file');
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'The file could not be read.');
      });
  };

  return {
    id,
    choose: (next) => {
      setError(null);
      setId(next);
    },
    open,
    loaded: loaded && loaded.id === id ? loaded : null,
    fileName: file?.name ?? null,
    error,
  };
}
