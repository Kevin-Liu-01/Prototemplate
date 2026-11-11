'use client';

import { useState } from 'react';

import { Seg, type SegOption } from '@/components/viewer/Seg';

import { KitCopy } from './KitCopy';

type LogoColor = 'ink' | 'white' | 'accent' | 'accent-lift' | 'currentcolor';
type Files = Partial<Record<LogoColor, { file: string }>>;

const COLORS: readonly SegOption<LogoColor>[] = [
  { value: 'ink', label: 'Ink', title: 'Ink, for a light ground' },
  { value: 'white', label: 'White', title: 'White, for a dark ground' },
  { value: 'accent', label: 'Accent', title: 'The accent, for a light ground' },
  { value: 'accent-lift', label: 'Accent lift', title: 'The accent lift, for a dark ground' },
  { value: 'currentcolor', label: 'currentColor', title: 'currentColor, the colour of the text around it' },
];

/**
 * A logo card's actions: pick a colour, then copy or download the logo in
 * it. Copy SVG puts the SVG code on the clipboard, which design tools paste
 * as vectors; Copy PNG puts the 1024 px transparent PNG there as an image.
 * The kit's PNGs on this page come in ink and white only, so the PNG
 * actions show for those two.
 */
export function KitLogoActions({ name, base, svg, png }: { name: string; base: string; svg: Files; png: Files }) {
  const [color, setColor] = useState<LogoColor>('ink');
  const label = color === 'currentcolor' ? 'currentColor' : (COLORS.find((c) => c.value === color)?.label.toLowerCase() ?? color);
  const svgFile = svg[color];
  const pngFile = png[color];
  return (
    <div className='ptb-kit-acts'>
      <Seg className='ptb-kit-seg' label={`The ${name} colour`} onChange={setColor} options={COLORS} value={color} />
      <div className='ptb-kit-links'>
        {svgFile ? (
          <>
            <KitCopy className='ptb-kit-copy' url={`${base}/${svgFile.file}`} what={`The ${name} in ${label} as SVG`}>
              Copy SVG
            </KitCopy>
            <a download href={`${base}/${svgFile.file}`}>
              Download SVG
            </a>
          </>
        ) : null}
        {pngFile ? (
          <>
            <KitCopy as='image' className='ptb-kit-copy' url={`${base}/${pngFile.file}`} what={`The ${name} in ${label} as PNG`}>
              Copy PNG
            </KitCopy>
            <a download href={`${base}/${pngFile.file}`}>
              Download PNG
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}
