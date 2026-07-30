import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { surfaceA11y, surfaceClass, type SurfaceProps } from './surface';
import './surface.css';

/**
 * Live translation — one round trip. A string a user typed, the locale it was
 * asked for, the string that came back, and what it cost. Nothing here is a
 * cube: the whole feature is a request with a number on it.
 *
 * No accent: the four panels share one, and it is spent on the glossary pin.
 */
export default function LiveSurface({ className, title }: SurfaceProps) {
  return (
    <div className={surfaceClass('tcx-live', className)} {...surfaceA11y(title)}>
      <div className='tcx-flow'>
        <div className='tcx-req'>POST /translate</div>
        <p className='tcx-say' lang='en'>
          &ldquo;Great seats, worth every peso.&rdquo;
        </p>
        <div className='tcx-hop'>
          <LocaleTag code='pt-BR' />
        </div>
        <p className='tcx-out' lang='pt-BR'>
          &ldquo;Ótimos lugares, valeu cada peso.&rdquo;
        </p>
        <div className='tcx-ms'>
          <b>38 ms</b> · cached at the edge
        </div>
      </div>
    </div>
  );
}
