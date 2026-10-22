'use client';

import { useRef, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';

import { Action, Choice } from '../controls';
import type { PictureSource } from './hooks';
import { PICTURE_ORDER, SOURCE_LABELS, type SourceId } from './sources';

type PickerProps = {
  source: PictureSource;
  /** the procedural sources this plate offers after the pictures */
  extras?: readonly SourceId[];
  label?: string;
};

/**
 * The source row: the five pictures, the plate's procedural sources, the
 * reader's own file once one is open, and a button that opens a file. The
 * file never leaves the browser.
 */
export function SourcePicker({ source, extras = ['ramp', 'noise'], label = 'Source' }: PickerProps) {
  const input = useRef<HTMLInputElement>(null);
  const ids: SourceId[] = [...PICTURE_ORDER, ...extras];
  if (source.fileName) ids.push('file');
  return (
    <>
      <Choice
        label={label}
        options={ids.map((id) => ({ value: id, label: SOURCE_LABELS[id] }))}
        value={source.id}
        onChange={source.choose}
      />
      <div className='dmo-field'>
        <span className='dmo-field-label'>Your picture</span>
        <Action onClick={() => input.current?.click()} title='Read a picture from this device; it is never uploaded'>
          Open Picture
        </Action>
        <input
          accept='image/*'
          aria-label='Open a picture to screen'
          className='dl-file'
          ref={input}
          tabIndex={-1}
          type='file'
          onChange={(event) => {
            const picked = event.currentTarget.files?.[0];
            if (picked) source.open(picked);
            event.currentTarget.value = '';
          }}
        />
      </div>
    </>
  );
}

type DropProps = {
  onFile: (file: File) => void;
  className?: string;
  children: ReactNode;
};

/** A box that takes a dropped image file and shows a hint while one is dragged over it. */
export function DropZone({ onFile, className, children }: DropProps) {
  const [over, setOver] = useState(false);
  const hasFile = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files');
  return (
    <div
      className={[className ?? '', over ? 'is-drop' : ''].filter(Boolean).join(' ')}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setOver(false);
      }}
      onDragOver={(event) => {
        if (!hasFile(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setOver(true);
      }}
      onDrop={(event) => {
        if (!hasFile(event)) return;
        event.preventDefault();
        setOver(false);
        const picked = Array.from(event.dataTransfer.files).find((file) => file.type.startsWith('image/'));
        if (picked) onFile(picked);
      }}
    >
      {children}
      {over ? (
        <p aria-hidden='true' className='dl-drop'>
          Drop the picture to screen it here
        </p>
      ) : null}
    </div>
  );
}

/** The status line under a plate: the source's credit, or the last file error. */
export function SourceStatus({ text, error }: { text: string; error?: string | null }) {
  return (
    <p className={error ? 'dmo-bar-status dl-status is-error' : 'dmo-bar-status dl-status'} role='status'>
      {error ?? text}
    </p>
  );
}
