import { surfaceA11y, surfaceClass, type SurfaceProps } from './surface';
import './surface.css';

/**
 * Customization — the hook itself. Detection is a function you write, so the
 * panel shows the function: a cookie if the reader set one, the header if they
 * did not, English if neither.
 *
 * No accent: the four panels share one, and it is spent on the glossary pin.
 */
export default function CustomSurface({ className, title }: SurfaceProps) {
  return (
    <div className={surfaceClass('tcx-custom', className)} {...surfaceA11y(title)}>
      <div className='tcx-file'>gt.config.ts</div>
      <div className='tcx-slab'>
        <div>
          <b>getLocale</b>: (req) =&gt; {'{'}
        </div>
        <div>
          {'  '}
          <span className='tc-t-kw'>return</span> req.cookies.gt
        </div>
        <div>
          {'    '}?? req.headers.lang
        </div>
        <div>
          {'    '}?? <span className='tc-t-str'>&apos;en&apos;</span>;
        </div>
        <div>{'}'}</div>
      </div>
    </div>
  );
}
