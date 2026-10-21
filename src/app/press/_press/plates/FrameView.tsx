'use client';

import { useRef, useState } from 'react';

import type { Frame } from '../parse';
import { useLayoutWork } from '../hooks';

/* One recorded frame on a plate. A picture takes a loupe: hover it and a
   square lens shows the spot at up to three times. A loop plays muted with a ruler to scrub it; it plays only
   while its plate is the one shown. */
export default function FrameView({ frame, active, eager }: { frame: Frame; active: boolean; eager?: boolean }) {
  return frame.video ? (
    <Loop src={frame.video} label={frame.alt} active={active} />
  ) : (
    <Picture frame={frame} eager={eager} />
  );
}

function Picture({ frame, eager }: { frame: Frame; eager?: boolean }) {
  const img = useRef<HTMLImageElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const [loupe, setLoupe] = useState(false);

  const move = (clientX: number, clientY: number) => {
    const el = img.current;
    const l = lens.current;
    if (!el || !l || !el.naturalWidth) return;
    const box = el.getBoundingClientRect();
    const u = (clientX - box.left) / box.width;
    const v = (clientY - box.top) / box.height;
    if (u < 0 || u > 1 || v < 0 || v > 1) {
      setLoupe(false);
      return;
    }
    const zoom = Math.max(1.5, Math.min(3, el.naturalWidth / box.width));
    const size = l.offsetWidth;
    l.style.left = `${u * 100}%`;
    l.style.top = `${v * 100}%`;
    l.style.backgroundSize = `${box.width * zoom}px ${box.height * zoom}px`;
    l.style.backgroundPosition = `${size / 2 - u * box.width * zoom}px ${size / 2 - v * box.height * zoom}px`;
    setLoupe(true);
  };

  return (
    <span
      className='gtp-picture'
      data-loupe={loupe ? 'on' : 'off'}
      onPointerMove={(e) => {
        if (e.pointerType === 'mouse') move(e.clientX, e.clientY);
      }}
      onPointerLeave={() => setLoupe(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the blog's own files, sized by the plate */}
      <img ref={img} src={frame.src} alt={frame.alt} loading={eager ? 'eager' : 'lazy'} decoding='async' draggable={false} />
      <span ref={lens} className='gtp-lens' aria-hidden='true' style={{ backgroundImage: `url("${frame.src}")` }} />
    </span>
  );
}

function Loop({ src, label, active }: { src: string; label: string; active: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);

  useLayoutWork(
    () => {
      const el = video.current;
      if (!el) return;
      if (active && !paused) void el.play().catch(() => setPaused(true));
      else el.pause();
    },
    { dependencies: [active, paused] }
  );

  return (
    <span className='gtp-loop'>
      <video
        ref={video}
        src={src}
        muted
        loop
        playsInline
        preload='metadata'
        aria-label={label}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
      />
      <span className='gtp-loop-bar'>
        <button
          type='button'
          className='gtp-loop-play'
          aria-label={paused ? 'Play' : 'Pause'}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? (
            <svg viewBox='0 0 12 12' aria-hidden='true'>
              <path d='M3 1.5v9l7.5-4.5z' fill='currentColor' />
            </svg>
          ) : (
            <svg viewBox='0 0 12 12' aria-hidden='true'>
              <path d='M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z' fill='currentColor' />
            </svg>
          )}
        </button>
        <input
          className='gtp-ruler-input'
          type='range'
          min={0}
          max={duration || 1}
          step={0.01}
          value={time}
          aria-label='Position in the recording'
          onChange={(e) => {
            const el = video.current;
            if (!el) return;
            el.currentTime = Number(e.currentTarget.value);
            setTime(el.currentTime);
          }}
        />
        <span className='gtp-loop-time'>
          {time.toFixed(1).padStart(4, '0')} s / {duration.toFixed(1)} s
        </span>
      </span>
    </span>
  );
}
