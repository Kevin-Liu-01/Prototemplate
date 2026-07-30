import { surfaceA11y, surfaceClass, type SurfaceProps } from './surface';
import './surface.css';

/**
 * Glossaries — one entry, and what it does to three locales. A pinned term is
 * only legible against the translation it overrules, so the Spanish row keeps
 * the rejected word struck through beside the one that ships.
 *
 * Accent: the pin.
 */

type Entry = { tag: string; ships: string; instead?: string };

const ENTRIES: readonly Entry[] = [
  { tag: 'de', ships: 'Vault' },
  { tag: 'es', ships: 'Vault', instead: 'Bóveda' },
  { tag: 'ja', ships: 'Vault', instead: '金庫' },
];

export default function GlossarySurface({ className, title }: SurfaceProps) {
  return (
    <div className={surfaceClass('tcx-glossary', className)} {...surfaceA11y(title)}>
      <div className='tcx-term'>
        <b>Vault</b>
        <span>pinned</span>
      </div>

      <ul className='tcx-rows'>
        {ENTRIES.map((entry) => (
          <li key={entry.tag}>
            <i>{entry.tag}</i>
            <span>
              {entry.instead ? <s>{entry.instead}</s> : null}
              {entry.ships}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
