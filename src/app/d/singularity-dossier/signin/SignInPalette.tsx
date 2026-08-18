'use client';

import { useRef, useState } from 'react';

type SignInPaletteProps = {
  onPaletteChange: (darkInk: string, lightInk: string) => void;
};

const customDarkInk = ['#', '003399'].join('');
const customLightInk = ['#', '8ea9de'].join('');
const validHex = /^#[0-9a-f]{6}$/i;

function FlaskMark() {
  return (
    <svg aria-hidden='true' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.7' viewBox='0 0 24 24'>
      <path d='M9 3h6M10 3v6.2L5.7 17a2.6 2.6 0 0 0 2.3 4h8a2.6 2.6 0 0 0 2.3-4L14 9.2V3' />
      <path d='M8.1 15h7.8' />
    </svg>
  );
}

export default function SignInPalette({ onPaletteChange }: SignInPaletteProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [darkInk, setDarkInk] = useState(customDarkInk);
  const [lightInk, setLightInk] = useState(customLightInk);

  const applyCustom = (nextDark: string, nextLight: string) => {
    if (!validHex.test(nextDark) || !validHex.test(nextLight)) return;
    onPaletteChange(nextDark, nextLight);
  };

  return (
    <div
      className='sgs-palette-shell'
      ref={shellRef}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        setOpen(false);
        shellRef.current?.querySelector<HTMLButtonElement>('.sgs-palette-toggle')?.focus();
      }}
    >
      <button
        aria-controls='signin-palette-panel'
        aria-expanded={open}
        aria-label={open ? 'Close color palette' : 'Open color palette'}
        className='sgs-palette-toggle'
        type='button'
        onClick={() => setOpen((current) => !current)}
      >
        <FlaskMark />
      </button>

      {open ? (
        <div className='sgs-palette-panel' id='signin-palette-panel'>
          <div className='sgs-palette-head'>
            <span>palette</span>
            <span>custom</span>
          </div>

          <div aria-label='Color pair presets' className='sgs-palette-grid' role='group'>
            {Array.from({ length: 32 }, (_, index) => (
              <button
                aria-label={`Use palette ${index + 1}`}
                className='sgs-palette-swatch'
                data-palette={String(index + 1).padStart(2, '0')}
                key={index}
                type='button'
                onClick={(event) => {
                  const style = getComputedStyle(event.currentTarget);
                  const nextDark = style.getPropertyValue('--palette-dark').trim();
                  const nextLight = style.getPropertyValue('--palette-light').trim();
                  if (!nextDark || !nextLight) return;
                  setDarkInk(nextDark);
                  setLightInk(nextLight);
                  onPaletteChange(nextDark, nextLight);
                }}
              />
            ))}
          </div>

          <div className='sgs-palette-custom'>
            <span className='sgs-palette-hex-label'>hex</span>
            <span aria-hidden='true' className='sgs-palette-chip' style={{ backgroundColor: darkInk }} />
            <input
              aria-label='Dark palette hex color'
              maxLength={7}
              onBlur={() => applyCustom(darkInk, lightInk)}
              onChange={(event) => setDarkInk(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyCustom(darkInk, lightInk);
              }}
              pattern='#[0-9a-fA-F]{6}'
              spellCheck={false}
              value={darkInk}
            />
            <span aria-hidden='true' className='sgs-palette-chip' style={{ backgroundColor: lightInk }} />
            <input
              aria-label='Light palette hex color'
              maxLength={7}
              onBlur={() => applyCustom(darkInk, lightInk)}
              onChange={(event) => setLightInk(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyCustom(darkInk, lightInk);
              }}
              pattern='#[0-9a-fA-F]{6}'
              spellCheck={false}
              value={lightInk}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
