import { surfaceA11y, surfaceClass, type SurfaceProps } from './surface';
import './surface.css';

/**
 * Previews — the dev server, showing the Spanish build of a page that has not
 * shipped yet. The point is the pairing: a real translated heading and button
 * on the left of the bar, `es · dev` on the right, and a footer that says this
 * frame exists nowhere else.
 *
 * No accent: the four panels share one, and it is spent on the glossary pin.
 */
export default function PreviewSurface({ className, title }: SurfaceProps) {
  return (
    <div className={surfaceClass('tcx-preview', className)} {...surfaceA11y(title)}>
      <div className='tcx-win'>
        <div className='tcx-bar'>
          <span>localhost:3000</span>
          <span>es · dev</span>
        </div>

        <div className='tcx-win-body'>
          <div className='tcx-h'>Lanza tu producto</div>
          <div className='tcx-btn'>Comenzar ahora</div>
        </div>

        <div className='tcx-foot'>
          <em>preview</em>
          <span>not in main</span>
        </div>
      </div>
    </div>
  );
}
