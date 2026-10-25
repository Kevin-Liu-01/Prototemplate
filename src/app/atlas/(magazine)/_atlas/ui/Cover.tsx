'use client';

import { useRef, useState } from 'react';

import { ditherCover } from '../dither';
import { drawCoverText } from '../gpu/coverText';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import type { ArtBox } from '../gpu/emblems';
import { mountFluid, type FluidHandle } from '../gpu/fluid';
import { useLayoutWork, useMountEffect } from '../hooks';
import { bookTitle } from '../titles';
import { prefersReducedMotion } from '../motion';

type Props = {
  slug: string;
  title: string;
  lang: string;
  dir: 'ltr' | 'rtl';
  /** The story's picture, printed in the press material where WebGPU is missing. */
  picture: string;
  /** Runs the fluid; a still otherwise. It also stops off screen and under reduced motion. */
  playing: boolean;
  /** Where the design draws on this cover, as fractions; a book's place when not given. */
  artAt?: ArtBox;
  /** A capture of this cover as WebGPU draws it at rest, shown from the first paint until the canvas has drawn its art, and kept in place of the fallback. */
  poster?: string;
};

/* A story's cover: the Fluid Energy marbling on WebGPU with the title
   printed through it, and a pointer stirs it while it plays. Without
   WebGPU it falls back to the story's picture in the dithered material
   with the same type over it, or to its poster when it has one. */
export default function Cover({
  slug,
  title,
  lang,
  dir,
  picture,
  playing,
  artAt,
  poster,
}: Props) {
  const gpuCanvas = useRef<HTMLCanvasElement>(null);
  const cpuCanvas = useRef<HTMLCanvasElement>(null);
  const handle = useRef<FluidHandle | null>(null);
  const visible = useRef(true);
  const want = useRef(playing);
  want.current = playing;
  const [mode, setMode] = useState<'pending' | 'gpu' | 'cpu'>('pending');
  // the canvas has printed its art; until then parts.css hides it over a poster, so the poster shows
  const [drawn, setDrawn] = useState(false);
  const spec = COVERS[slug] ?? FALLBACK_COVER;
  const reduce = useRef(false);

  const sync = () => {
    const h = handle.current;
    if (!h) return;
    if (want.current && visible.current && !reduce.current) h.play();
    else h.pause();
  };

  const typeset = async () => {
    const canvas = mode === 'cpu' ? cpuCanvas.current : gpuCanvas.current;
    if (!canvas) return;
    const width = mode === 'cpu' ? canvas.width : canvas.width || 640;
    const height = mode === 'cpu' ? canvas.height : canvas.height || 360;
    const { mask, plain } = await drawCoverText(width, height, {
      slug,
      title: bookTitle(title, lang),
      lang,
      dir,
      paper: spec.paper,
      art: spec.art,
      accent: spec.accent,
      face: spec.face,
      artAt,
    });
    if (mode === 'gpu' && handle.current) {
      handle.current.setText(mask);
      setDrawn(true);
    }
    if (mode === 'cpu' && cpuCanvas.current) {
      const ctx = cpuCanvas.current.getContext('2d');
      ctx?.drawImage(plain, 0, 0);
    }
  };

  useMountEffect(() => {
    reduce.current = prefersReducedMotion();
    let dead = false;
    const canvas = gpuCanvas.current;
    if (!canvas) return;
    // without WebGPU, or once it fails or its device is lost, the cover falls back to its poster or the dithered picture
    const fallBack = () => {
      if (dead) return;
      handle.current = null;
      setDrawn(false);
      setMode('cpu');
    };
    mountFluid(canvas, spec, fallBack)
      .then((h) => {
        if (dead) {
          h?.destroy();
          return;
        }
        if (!h) {
          fallBack();
          return;
        }
        handle.current = h;
        setMode('gpu');
        sync();
      })
      .catch(fallBack);
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry?.isIntersecting ?? true;
      sync();
    });
    observer.observe(canvas);
    return () => {
      dead = true;
      observer.disconnect();
      handle.current?.destroy();
      handle.current = null;
    };
  });

  useLayoutWork(sync, { dependencies: [playing] });

  // the type follows the title and language; the fallback redraws its picture first
  useLayoutWork(
    () => {
      if (mode === 'gpu') void typeset();
      if (mode === 'cpu' && cpuCanvas.current) {
        const canvas = cpuCanvas.current;
        // one dither cell per CSS pixel; client sizes ignore the 3D transforms around it
        canvas.width = Math.max(64, canvas.clientWidth);
        canvas.height = Math.max(36, canvas.clientHeight);
        return ditherCover(canvas, picture, () => void typeset());
      }
    },
    // a cover with no title prints no type, so a change of language leaves it as it is
    { dependencies: [mode, title, title ? lang : ''], revertOnUpdate: true }
  );

  return (
    <span className='gtp-cover' data-mode={mode} data-drawn={drawn}>
      {poster ? (
        <img
          className='gtp-cover-poster'
          src={poster}
          alt=''
          aria-hidden='true'
          decoding='sync'
          fetchPriority='high'
        />
      ) : null}
      <canvas ref={gpuCanvas} className='gtp-cover-gpu' aria-hidden='true' />
      {mode === 'cpu' && !poster ? (
        <canvas ref={cpuCanvas} className='gtp-cover-cpu' aria-hidden='true' />
      ) : null}
    </span>
  );
}
