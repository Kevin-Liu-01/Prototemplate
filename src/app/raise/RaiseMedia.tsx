'use client';

import { useState } from 'react';

import { Seg } from '@/components/viewer/Seg';
import { cn } from '@/lib/cn';

import type { RaiseViewCut } from './model';

import '../brand/BrandFilm.css';

/**
 * A film before its first play: its poster, lazy, under the play badge
 * BrandFilm draws on /motion, so a page of films fetches no video and no
 * poster until the frame nears the view. The press swaps in the video with
 * its native controls and starts it. A film without a poster shows its
 * first frame from its metadata instead.
 */
function Film({ cut, name }: { cut: RaiseViewCut; name: string }) {
  const [started, setStarted] = useState(false);
  if (!cut.image || started) {
    return (
      <video
        aria-label={name}
        autoPlay={started}
        controls
        height={cut.h}
        playsInline
        poster={cut.image}
        preload={started ? 'auto' : 'metadata'}
        src={cut.src}
        width={cut.w}
      />
    );
  }
  return (
    <div className='ptb-film ra-film'>
      <button type='button' aria-label={`play ${name}`} className='ptb-film-play' onClick={() => setStarted(true)}>
        <img alt='' className='ptb-film-poster' decoding='async' loading='lazy' src={cut.image} />
        <span aria-hidden className='ptb-film-badge'>
          <svg viewBox='0 0 16 16'>
            <path d='M5.5 3v10l8-5z' />
          </svg>
        </span>
      </button>
    </div>
  );
}

/**
 * One cut in its frame: a still opens its full file in a new tab, a film
 * plays in place, and a score shows its waveform over its player. The
 * frame holds the 16:9 stage every cut shares (a score's is 4:1), so a
 * poster, a card and a film sit centred on the same plate and a switch
 * between them moves nothing.
 */
export function CutFrame({ cut, name }: { cut: RaiseViewCut; name: string }) {
  if (cut.kind === 'audio') {
    return (
      <div className='ra-score'>
        <div className='gx-frame ra-frame is-score'>{cut.image ? <img alt='' decoding='async' loading='lazy' src={cut.image} /> : null}</div>
        <audio aria-label={name} controls preload='none' src={cut.src} />
      </div>
    );
  }
  if (cut.kind === 'film') {
    return (
      <div className='gx-frame ra-frame'>
        <Film cut={cut} name={name} />
      </div>
    );
  }
  return (
    <a className='gx-frame ra-frame' href={cut.full} target='_blank' rel='noreferrer' aria-label={`Open ${name} in a new tab`}>
      <img alt='' decoding='async' loading='lazy' src={cut.image} />
    </a>
  );
}

/** The chip on a cut: its state in the run of show, or its status in a round. */
export function Chip({ cut }: { cut: RaiseViewCut }) {
  if (!cut.chip) return null;
  return (
    <span className='ra-chip' data-tone={cut.tone}>
      {cut.chip}
    </span>
  );
}

/** A cut's line under its frame: the label, its format and length, and its chip. */
function CutLine({ cut }: { cut: RaiseViewCut }) {
  return (
    <p className='gx-line ra-line'>
      <span className='ra-label'>{cut.label}</span>
      {cut.about ? ` · ${cut.about}` : null}
      <Chip cut={cut} />
    </p>
  );
}

/**
 * The cuts a deliverable is posted as: the chosen one in the frame, and the
 * shell's segmented control under it when there are several. The control
 * scrolls sideways inside its row when its options run wider than the
 * column, so the page never does.
 */
export function CutFigure({ title, cuts }: { title: string; cuts: readonly RaiseViewCut[] }) {
  const first = cuts[0];
  const [key, setKey] = useState(first?.key ?? '');
  const cut = cuts.find((c) => c.key === key) ?? first;
  if (!cut) return null;
  return (
    <figure className='gx-fig ra-fig'>
      <CutFrame key={cut.key} cut={cut} name={`${title}, ${cut.label}`} />
      {cuts.length > 1 ? (
        <div className='ra-seg pt-scroll'>
          <Seg
            className='gx-seg'
            label={`Cuts of ${title}`}
            options={cuts.map((c) => ({ value: c.key, label: c.label, title: `${c.label}${c.about ? `, ${c.about}` : ''}` }))}
            value={cut.key}
            onChange={setKey}
          />
        </div>
      ) : null}
      <figcaption>
        <CutLine cut={cut} />
      </figcaption>
    </figure>
  );
}

/** Cuts as a grid of small frames, each with its label, format and chip: the folded cuts of a deliverable, or a round's files. */
export function CutGrid({ title, cuts, className }: { title: string; cuts: readonly RaiseViewCut[]; className?: string }) {
  return (
    <div className={cn('ra-grid', className)}>
      {cuts.map((cut) => (
        <figure key={cut.key} className='ra-tile'>
          <CutFrame cut={cut} name={`${title}, ${cut.label}`} />
          <figcaption>
            <span className='ra-label'>{cut.label}</span>
            <Chip cut={cut} />
            {cut.about ? <span className='ra-about'>{cut.about}</span> : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** The folded cuts under a deliverable's frame. */
export function OtherCuts({ title, cuts }: { title: string; cuts: readonly RaiseViewCut[] }) {
  if (!cuts.length) return null;
  return (
    <details className='ra-more'>
      <summary>
        {cuts.length} other {cuts.length === 1 ? 'cut' : 'cuts'}
      </summary>
      <CutGrid title={title} cuts={cuts} />
    </details>
  );
}
