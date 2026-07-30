import { surfaceA11y, surfaceClass, type SurfaceProps } from './surface';
import './surface.css';

/**
 * Glossaries — one entry, and what it does to three locales. A pinned term is
 * only legible against the translation it overrules, so the Spanish row keeps
 * the rejected word struck through beside the one that ships.
 *
 * CURATION (dark grid, diagram 2 — glossary and directives): the dark
 * GlossaryDiagram's first half (term → rule) loses to this table — the
 * strikethrough shows the do-not-translate rule *against its subject* rather
 * than as a sentence. Its second half was missing here: the per-locale
 * directives (the formal-Sie register, the voice rule) that the groundwork
 * list mentions and nothing drew. Adopted below the entries, behind the
 * page's own group divider — the stronger hairline, matching the rule the
 * dark table drew between its two halves. Six real rows, one artifact.
 *
 * Accent: the pin.
 */

type Entry = { tag: string; ships: string; instead?: string };

const ENTRIES: readonly Entry[] = [
  { tag: 'de', ships: 'Vault' },
  { tag: 'es', ships: 'Vault', instead: 'Bóveda' },
  { tag: 'ja', ships: 'Vault', instead: '金庫' },
];

/** Per-locale style rules, riding the same two-column table as the entries. */
const DIRECTIVES: readonly { tag: string; rule: string }[] = [
  { tag: 'de', rule: 'Use formal “Sie”' },
  { tag: 'all', rule: 'Active voice, avoid jargon' },
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

      <ul className='tcx-rows tcx-dirs'>
        {DIRECTIVES.map((directive) => (
          <li key={directive.tag}>
            <i>{directive.tag}</i>
            <span>{directive.rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
