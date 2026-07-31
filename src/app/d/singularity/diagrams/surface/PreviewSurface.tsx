import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { surfaceA11y, surfaceClass, type SurfaceProps } from './surface';
import './surface.css';

/**
 * Previews — the dev server, showing the Spanish build of a page that has not
 * shipped yet, beside the English page it came from.
 *
 * CURATION (dark grid, diagram 6 — the source/preview pane pair): the dark
 * PreviewPanesDiagram set `en · source` and `es · preview` side by side,
 * which is the feature's actual argument — a preview is only legible against
 * its source — and the one thing this window did not say. Adapted rather
 * than pasted: the pairing moves *inside* the real dev-window artifact this
 * cell already had (a browser frame beats two abstract boxes), stacked
 * because a quarter-column is too narrow for two panes of real strings.
 * Same heading, same button, twice — which quietly re-argues the lead
 * diagram: the Spanish button is a different length.
 *
 * No accent: the four panels share one, and it is spent on the glossary pin.
 * The live pane is marked by type weight on its tag, nothing else.
 */
const PANES = [
  { loc: 'en', role: 'main', heading: 'Launch your product', button: 'Get started', live: false },
  { loc: 'es', role: 'preview', heading: 'Lanza tu producto', button: 'Comenzar ahora', live: true },
] as const;

export default function PreviewSurface({ className, title }: SurfaceProps) {
  return (
    <div className={surfaceClass('tcx-preview', className)} {...surfaceA11y(title)}>
      <div className='tcx-win'>
        <div className='tcx-bar'>
          <span>localhost:3000</span>
          <span>
            <LocaleTag code='es' /> · dev
          </span>
        </div>

        {PANES.map((pane) => (
          <div className='tcx-pane' key={pane.loc}>
            <span className={pane.live ? 'tcx-pane-tag is-on' : 'tcx-pane-tag'}>
              <LocaleTag code={pane.loc} /> · {pane.role}
            </span>
            <div className='tcx-h' lang={pane.live ? 'es' : 'en'}>
              {pane.heading}
            </div>
            <div className='tcx-btn'>{pane.button}</div>
          </div>
        ))}

        <div className='tcx-foot'>
          <em>preview</em>
          <span>not in main</span>
        </div>
      </div>
    </div>
  );
}
